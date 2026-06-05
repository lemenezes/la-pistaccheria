import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createProduct, getProducts, updateProduct } from "../../lib/supabase";
import type { DatabaseProduct } from "../../types/database";
import type { ProductFormValues } from "../../pages/admin/ProductForm";
import AdminShell from "./AdminShell";
import AdminSidebar from "./AdminSidebar";
import ProductList from "./ProductList";
import ProductListToolbar, { type ProductFilter } from "./ProductListToolbar";
import ProductPreviewPanel from "./ProductPreviewPanel";
import ProductEditModal from "./ProductEditModal";

export default function ProductWorkspace() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("all");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      setIsLoading(true);
      setError(null);

      const { data, error: queryError } = await getProducts();

      if (ignore) return;

      if (queryError) {
        setError(queryError.message || "Falha ao carregar produtos.");
        setProducts([]);
      } else {
        setProducts((data || []) as DatabaseProduct[]);
      }

      setIsLoading(false);
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && product.active) ||
        (filter === "inactive" && !product.active) ||
        (filter === "featured" && product.featured);

      if (!matchesFilter) return false;

      if (!normalizedQuery) return true;

      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.slug.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [products, query, filter]);

  const selectedProduct = useMemo(
    () =>
      filteredProducts.find((product) => product.id === selectedProductId) ||
      products.find((product) => product.id === selectedProductId) ||
      null,
    [filteredProducts, products, selectedProductId]
  );

  function mapFormValues(values: ProductFormValues) {
    const galleryUrls = values.gallery_urls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    return {
      name: values.name,
      slug: values.slug,
      category: values.category,
      short_description: values.short_description,
      description: values.description,
      price: parseFloat(values.price) || 0,
      image_url: values.image_url || null,
      active: values.active,
      featured: values.featured,
      display_order: parseInt(values.display_order, 10) || 0,
      meta_title: values.meta_title || null,
      meta_description: values.meta_description || null,
      gallery_urls: galleryUrls,
    };
  }

  async function handleSubmit(values: ProductFormValues) {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const payload = mapFormValues(values);

      if (modalMode === "create") {
        const { data, error: apiError } = await createProduct({
          ...payload,
          weight: null,
          badge: null,
        });

        if (apiError || !data) {
          setSubmitError(apiError?.message || "Erro ao criar produto.");
          return;
        }

        const created = data as DatabaseProduct;
        setProducts((prev) => [created, ...prev]);
        setSelectedProductId(created.id);
        setModalMode(null);
        return;
      }

      if (!selectedProductId) {
        setSubmitError("Selecione um produto para editar.");
        return;
      }

      const { data, error: apiError } = await updateProduct(selectedProductId, payload);

      if (apiError || !data) {
        setSubmitError(apiError?.message || "Erro ao atualizar produto.");
        return;
      }

      const updated = data as DatabaseProduct;
      setProducts((prev) =>
        prev.map((product) => (product.id === updated.id ? updated : product))
      );
      setSelectedProductId(updated.id);
      setModalMode(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenCreate() {
    setSubmitError(null);
    setSelectedProductId(null);
    setModalMode("create");
  }

  function handleSelectProduct(id: string) {
    setSubmitError(null);
    setSelectedProductId(id);
    setMobileProductOpen(true);
  }

  function handleOpenEdit() {
    setSubmitError(null);
    setModalMode("edit");
  }

  function handleCloseModal() {
    setSubmitError(null);
    setModalMode(null);
  }

  function handleCloseMobileProduct() {
    setMobileProductOpen(false);
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao sair.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <AdminShell
        isSidebarOpen={mobileSidebarOpen}
        onCloseSidebar={() => setMobileSidebarOpen(false)}
        sidebar={
          <AdminSidebar
            userEmail={user?.email}
            isLoggingOut={isLoggingOut}
            onLogout={handleLogout}
            onClose={() => setMobileSidebarOpen(false)}
          />
        }
        main={
          <div className="h-full flex flex-col">
            <ProductListToolbar
              query={query}
              filter={filter}
              onQueryChange={setQuery}
              onFilterChange={setFilter}
              onNewProduct={handleOpenCreate}
              onToggleSidebar={() => setMobileSidebarOpen((v) => !v)}
            />
            <ProductList
              products={filteredProducts}
              selectedProductId={selectedProductId}
              isLoading={isLoading}
              error={error}
              onSelectProduct={handleSelectProduct}
            />
          </div>
        }
        panel={
          <ProductPreviewPanel
            product={selectedProduct}
            onEdit={handleOpenEdit}
          />
        }
      />

      {/* Overlay de produto no mobile (substitui o painel lateral) */}
      {mobileProductOpen && selectedProduct && (
        <div className="fixed inset-0 z-30 flex flex-col bg-[#FAF7F2] md:hidden">
          {/* Header do overlay */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E0D8] bg-white shrink-0">
            <button
              type="button"
              onClick={handleCloseMobileProduct}
              className="flex items-center gap-1.5 text-[13px] text-[#5F5751] hover:text-[#1C1C1A] transition-colors"
            >
              <span className="text-[16px]">←</span>
              Voltar
            </button>
            <span className="flex-1 text-[13px] font-medium text-[#1C1C1A] truncate text-center">
              {selectedProduct.name}
            </span>
            <span className="w-[52px]" />{/* spacer para centralizar o título */}
          </div>
          {/* Conteúdo */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ProductPreviewPanel
              product={selectedProduct}
              onEdit={() => {
                handleOpenEdit();
              }}
            />
          </div>
        </div>
      )}
      {modalMode !== null && (
        <ProductEditModal
          mode={modalMode}
          product={selectedProduct}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
