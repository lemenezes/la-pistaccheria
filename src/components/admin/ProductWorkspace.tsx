import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import {
  createProduct,
  getCategories,
  getProducts,
  updateProduct,
} from "../../lib/supabase";
import type { DatabaseCategory, DatabaseProduct } from "../../types/database";
import type { ProductFormValues } from "../../pages/admin/ProductForm";
import AdminShell from "./AdminShell";
import AdminSidebar from "./AdminSidebar";
import ProductList from "./ProductList";
import ProductListToolbar, { type ProductFilter, type SortOption } from "./ProductListToolbar";
import ProductPreviewPanel from "./ProductPreviewPanel";
import ProductEditModal from "./ProductEditModal";

export default function ProductWorkspace() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      // Load all categories (including inactive) so the product list
      // can flag products linked to inactive categories.
      const { data, error: queryError } = await getCategories();

      if (ignore) return;

      if (queryError) {
        setError(queryError.message || "Falha ao carregar categorias ativas.");
        setCategories([]);
      } else {
        setCategories((data || []) as DatabaseCategory[]);
      }
    }

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && product.active) ||
        (filter === "inactive" && !product.active) ||
        (filter === "featured" && product.featured);

      if (!matchesFilter) return false;
      if (categoryFilter && product.category !== categoryFilter) return false;
      if (!normalizedQuery) return true;

      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.slug.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery)
      );
    });

    return filtered.slice().sort((a, b) => {
      switch (sortBy) {
        case "default":
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "name_asc":
          return a.name.localeCompare(b.name, "pt-BR");
        case "name_desc":
          return b.name.localeCompare(a.name, "pt-BR");
        case "price_desc":
          return b.price - a.price;
        case "price_asc":
          return a.price - b.price;
        case "display_order":
          return a.display_order - b.display_order;
        default:
          return 0;
      }
    });
  }, [products, query, filter, categoryFilter, sortBy]);

  const categoryOptions = useMemo(() => {
    const unique = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(unique).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [products]);

  const totalCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * perPage;
  const paginatedProducts = filteredProducts.slice(pageStart, pageStart + perPage);

  // Reset para página 1 quando qualquer filtro muda
  useEffect(() => {
    setPage(1);
  }, [query, filter, categoryFilter, sortBy, perPage]);

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
      category_id: values.category_id || null,
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
          toast.error(apiError?.message || "Erro ao criar produto.");
          return;
        }

        const created = data as DatabaseProduct;
        setProducts((prev) => [created, ...prev]);
        setSelectedProductId(created.id);
        setModalMode(null);
        toast.success("Produto criado com sucesso.");
        return;
      }

      if (!selectedProductId) {
        toast.error("Selecione um produto para editar.");
        return;
      }

      const { data, error: apiError } = await updateProduct(selectedProductId, payload);

      if (apiError || !data) {
        toast.error(apiError?.message || "Erro ao atualizar produto.");
        return;
      }

      const updated = data as DatabaseProduct;
      setProducts((prev) =>
        prev.map((product) => (product.id === updated.id ? updated : product))
      );
      setSelectedProductId(updated.id);
      setModalMode(null);
      toast.success("Produto atualizado com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenCreate() {
    setSelectedProductId(null);
    setModalMode("create");
  }

  function handleSelectProduct(id: string) {
    setSelectedProductId(id);
    setMobileProductOpen(true);
  }

  function handleOpenEdit() {
    setModalMode("edit");
  }

  function handleCloseModal() {
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
      toast.error(err instanceof Error ? err.message : "Erro ao sair.");
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
          <div className="min-h-full flex flex-col bg-[#F4F2EE]">
            <div className="px-4 md:px-6 pt-4 md:pt-0 pb-6 flex-1 flex flex-col gap-4 md:gap-0">
              {/* Header + filtros */}
              <div className="overflow-hidden rounded-[16px] md:rounded-none border border-[#E6DFD6] md:border-0 bg-white shadow-[0_2px_12px_rgba(95,87,81,0.06)] md:shadow-none">
                <ProductListToolbar
                      query={query}
                      filter={filter}
                      sortBy={sortBy}
                      categories={categoryOptions}
                      categoryFilter={categoryFilter}
                      onQueryChange={setQuery}
                      onFilterChange={setFilter}
                      onSortChange={setSortBy}
                      onCategoryChange={setCategoryFilter}
                      onNewProduct={handleOpenCreate}
                      onToggleSidebar={() => setMobileSidebarOpen((v) => !v)}
                    />
              </div>
              {/* Card da lista */}
              <div className="bg-white overflow-hidden flex-1 rounded-[16px] md:rounded-none md:rounded-b-[8px] border border-[#E6DFD6] md:border-[#E5E0D8] md:border-t-0">
                <ProductList
                  products={paginatedProducts}
                  categories={categories}
                  selectedProductId={selectedProductId}
                  isLoading={isLoading}
                  error={error}
                  onSelectProduct={handleSelectProduct}
                />
                {/* Rodapé de paginação */}
                {!isLoading && totalCount > 0 && (
                  <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[#F0EDE8] bg-white">
                    {totalCount <= perPage ? (
                      <span className="text-[11.5px] text-[#9A9189]">
                        {totalCount} produto{totalCount !== 1 ? "s" : ""} cadastrado{totalCount !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-[11.5px] text-[#9A9189]">
                          <span>
                            {totalCount} produto{totalCount !== 1 ? "s" : ""} cadastrado{totalCount !== 1 ? "s" : ""}
                          </span>
                          <select
                            value={perPage}
                            onChange={(e) => setPerPage(Number(e.target.value))}
                            className="h-7 px-1.5 text-[11.5px] border border-[#E5E0D8] rounded-md bg-white text-[#5F5751] outline-none focus:border-[#9A9189] cursor-pointer"
                          >
                            <option value={10}>10 / pág.</option>
                            <option value={25}>25 / pág.</option>
                            <option value={50}>50 / pág.</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={safePage <= 1}
                            className="h-7 px-2.5 text-[12px] border border-[#E5E0D8] rounded-md text-[#5F5751] bg-white hover:bg-[#F4F2EE] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                          >
                            ←
                          </button>
                          <span className="h-7 px-3 flex items-center text-[12px] font-medium text-[#1C1C1A] border border-[#D8D3CC] rounded-md bg-white">
                            {safePage} / {totalPages}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safePage >= totalPages}
                            className="h-7 px-2.5 text-[12px] border border-[#E5E0D8] rounded-md text-[#5F5751] bg-white hover:bg-[#F4F2EE] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                          >
                            →
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
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
          submitError={null}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          categories={categories}
        />
      )}
    </>
  );
}
