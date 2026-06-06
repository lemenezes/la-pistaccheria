import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminShell from "../../components/admin/AdminShell";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import {
  activateCategory,
  createCategory,
  deactivateCategory,
  getCategories,
  getProducts,
  updateCategory,
} from "../../lib/supabase";
import type { DatabaseCategory, DatabaseProduct } from "../../types/database";

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: string;
};

type StatusFilter = "all" | "active" | "inactive";
type ModalMode = "create" | "edit";

type UiState = {
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  formError: string | null;
  successMessage: string | null;
};

type UiAction =
  | { type: "loadingStart" }
  | { type: "loadingDone" }
  | { type: "submittingStart" }
  | { type: "submittingDone" }
  | { type: "setError"; payload: string | null }
  | { type: "setFormError"; payload: string | null }
  | { type: "setSuccess"; payload: string | null };

const initialUiState: UiState = {
  isLoading: true,
  isSubmitting: false,
  error: null,
  formError: null,
  successMessage: null,
};

function uiReducer(state: UiState, action: UiAction): UiState {
  switch (action.type) {
    case "loadingStart":
      return { ...state, isLoading: true, error: null };
    case "loadingDone":
      return { ...state, isLoading: false };
    case "submittingStart":
      return { ...state, isSubmitting: true, formError: null, error: null };
    case "submittingDone":
      return { ...state, isSubmitting: false };
    case "setError":
      return { ...state, error: action.payload };
    case "setFormError":
      return { ...state, formError: action.payload };
    case "setSuccess":
      return { ...state, successMessage: action.payload };
    default:
      return state;
  }
}

const inputClass =
  "w-full h-11 px-4 border border-[#DDD8D0] bg-white text-[13px] text-[#1C1C1A] placeholder:text-[#A09890] outline-none focus:border-[#4E6638] focus:ring-1 focus:ring-[#4E6638]/20 transition-colors rounded-[10px]";

const textareaClass =
  "w-full px-4 py-3 border border-[#DDD8D0] bg-white text-[13px] text-[#1C1C1A] placeholder:text-[#A09890] outline-none focus:border-[#4E6638] focus:ring-1 focus:ring-[#4E6638]/20 transition-colors resize-none rounded-[10px]";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function toForm(category?: DatabaseCategory): CategoryForm {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    image_url: category?.image_url ?? "",
    display_order:
      category?.display_order != null ? String(category.display_order) : "0",
  };
}

function matchesCategory(product: DatabaseProduct, category: DatabaseCategory) {
  if (product.category_id) {
    return product.category_id === category.id;
  }

  return (
    product.category.trim().toLowerCase() === category.name.trim().toLowerCase()
  );
}

function DashboardIcon({
  type,
}: {
  type: "search" | "plus";
}) {
  const cls = "h-5 w-5";

  switch (type) {
    case "search":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={cls}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "plus":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={cls}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    default:
      return null;
  }
}

function CategoryModal({
  mode,
  form,
  setForm,
  slugTouched,
  setSlugTouched,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: {
  mode: ModalMode;
  form: CategoryForm;
  setForm: React.Dispatch<React.SetStateAction<CategoryForm>>;
  slugTouched: boolean;
  setSlugTouched: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => Promise<void>;
}) {
  useEffect(() => {
    function onEsc(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [isSubmitting, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ background: "rgba(28,28,26,0.55)", backdropFilter: "blur(2px)" }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full flex flex-col bg-white rounded-[12px] shadow-2xl"
        style={{ maxWidth: 680, maxHeight: "calc(100vh - 64px)" }}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "create" ? "Nova categoria" : "Editar categoria"}
      >
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-[#ECEAE5] shrink-0">
          <div>
            <p className="text-[10px] tracking-[0.14em] uppercase text-[#9A9189] mb-1">
              {mode === "create" ? "Criar categoria" : "Editar categoria"}
            </p>
            <h2
              className="text-[1.6rem] leading-none text-[#1C1C1A]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {mode === "create" ? "Nova categoria" : "Atualizar categoria"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 flex items-center justify-center text-[#9A9189] hover:text-[#1C1C1A] hover:bg-[#F4F2EE] rounded-full transition-colors disabled:opacity-40 text-[22px] leading-none"
            aria-label="Fechar"
          >
            x
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 min-h-0 overflow-y-auto px-7 py-6">
          {error ? (
            <div className="mb-5 rounded-[10px] border border-[#E0C8C8] bg-[#FBF2F2] px-4 py-3 text-[13px] text-[#8A3A3A]">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] tracking-[0.1em] uppercase text-[#6A6159]">
                Nome
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                    slug: slugTouched ? prev.slug : slugify(event.target.value),
                  }))
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] tracking-[0.1em] uppercase text-[#6A6159]">
                Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setForm((prev) => ({ ...prev, slug: event.target.value }));
                }}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] tracking-[0.1em] uppercase text-[#6A6159]">
                Ordem de exibicao
              </label>
              <input
                type="number"
                value={form.display_order}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, display_order: event.target.value }))
                }
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] tracking-[0.1em] uppercase text-[#6A6159]">
                image_url (manual)
              </label>
              <input
                type="url"
                value={form.image_url}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, image_url: event.target.value }))
                }
                placeholder="https://..."
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11px] tracking-[0.1em] uppercase text-[#6A6159]">
                Descricao
              </label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                rows={4}
                className={textareaClass}
                placeholder="Resumo editorial da categoria (opcional)"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#ECEAE5] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-5 border border-[#D5CFC8] text-[13px] text-[#5F5751] rounded-[8px] hover:text-[#1C1C1A] hover:border-[#9A9189] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 text-[13px] font-medium text-white rounded-[8px] bg-[#2A3D20] disabled:opacity-60"
            >
              {isSubmitting ? "Salvando..." : mode === "create" ? "Criar categoria" : "Salvar alteracoes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCategorias() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [ui, dispatch] = useReducer(uiReducer, initialUiState);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalForm, setModalForm] = useState<CategoryForm>(toForm());
  const [slugTouched, setSlugTouched] = useState(false);

  const fetchData = useCallback(async () => {
    const [{ data: categoriesData, error: categoriesError }, { data: productsData, error: productsError }] =
      await Promise.all([getCategories(), getProducts()]);

    return {
      categoriesData,
      productsData,
      error:
        categoriesError?.message ||
        productsError?.message ||
        null,
    };
  }, []);

  const loadData = useCallback(async () => {
    dispatch({ type: "loadingStart" });
    const { categoriesData, productsData, error } = await fetchData();

    if (error) {
      dispatch({ type: "setError", payload: error });
      setCategories([]);
      setProducts([]);
    } else {
      setCategories((categoriesData || []) as DatabaseCategory[]);
      setProducts((productsData || []) as DatabaseProduct[]);
      dispatch({ type: "setError", payload: null });
    }

    dispatch({ type: "loadingDone" });
  }, [fetchData]);

  useEffect(() => {
    let ignore = false;

    async function initializeData() {
      const { categoriesData, productsData, error } = await fetchData();

      if (ignore) return;

      if (error) {
        dispatch({ type: "setError", payload: error });
        setCategories([]);
        setProducts([]);
      } else {
        setCategories((categoriesData || []) as DatabaseCategory[]);
        setProducts((productsData || []) as DatabaseProduct[]);
        dispatch({ type: "setError", payload: null });
      }

      dispatch({ type: "loadingDone" });
    }

    initializeData();

    return () => {
      ignore = true;
    };
  }, [fetchData]);

  useEffect(() => {
    if (!ui.successMessage) return;

    const timeout = window.setTimeout(() => {
      dispatch({ type: "setSuccess", payload: null });
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [ui.successMessage]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } catch (err) {
      dispatch({
        type: "setError",
        payload: err instanceof Error ? err.message : "Erro ao sair.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  }

  function openCreateModal() {
    setModalMode("create");
    setEditingId(null);
    setModalForm(toForm());
    setSlugTouched(false);
    dispatch({ type: "setFormError", payload: null });
    setIsModalOpen(true);
  }

  function openEditModal(category: DatabaseCategory) {
    setModalMode("edit");
    setEditingId(category.id);
    setModalForm(toForm(category));
    setSlugTouched(true);
    dispatch({ type: "setFormError", payload: null });
    setIsModalOpen(true);
  }

  function closeModal() {
    if (ui.isSubmitting) return;
    setIsModalOpen(false);
    dispatch({ type: "setFormError", payload: null });
  }

  async function handleModalSubmit(event: React.FormEvent) {
    event.preventDefault();
    dispatch({ type: "submittingStart" });

    const payload = {
      name: modalForm.name.trim(),
      slug: modalForm.slug.trim(),
      description: modalForm.description.trim() || null,
      image_url: modalForm.image_url.trim() || null,
      display_order: parseInt(modalForm.display_order, 10) || 0,
    };

    if (!payload.name || !payload.slug) {
      dispatch({ type: "setFormError", payload: "Nome e slug sao obrigatorios." });
      dispatch({ type: "submittingDone" });
      return;
    }

    if (modalMode === "create") {
      const { error: apiError } = await createCategory({
        ...payload,
        active: true,
      });

      if (apiError) {
        dispatch({
          type: "setFormError",
          payload: apiError.message || "Erro ao criar categoria.",
        });
        dispatch({ type: "submittingDone" });
        return;
      }

      dispatch({ type: "setSuccess", payload: "Categoria criada com sucesso." });
      setIsModalOpen(false);
      await loadData();
      dispatch({ type: "submittingDone" });
      return;
    }

    if (!editingId) {
      dispatch({
        type: "setFormError",
        payload: "Categoria invalida para edicao.",
      });
      dispatch({ type: "submittingDone" });
      return;
    }

    const { error: apiError } = await updateCategory(editingId, payload);

    if (apiError) {
      dispatch({
        type: "setFormError",
        payload: apiError.message || "Erro ao atualizar categoria.",
      });
      dispatch({ type: "submittingDone" });
      return;
    }

    dispatch({ type: "setSuccess", payload: "Categoria atualizada com sucesso." });
    setIsModalOpen(false);
    await loadData();
    dispatch({ type: "submittingDone" });
  }

  async function handleToggleActive(category: DatabaseCategory) {
    dispatch({ type: "submittingStart" });

    const result = category.active
      ? await deactivateCategory(category.id)
      : await activateCategory(category.id);

    if (result.error) {
      dispatch({
        type: "setError",
        payload: result.error.message || "Erro ao atualizar status da categoria.",
      });
      dispatch({ type: "submittingDone" });
      return;
    }

    dispatch({
      type: "setSuccess",
      payload:
      category.active
        ? "Categoria desativada com sucesso."
        : "Categoria ativada com sucesso.",
    });
    await loadData();
    dispatch({ type: "submittingDone" });
  }

  const productCountByCategory = useMemo(() => {
    const map = new Map<string, number>();

    categories.forEach((category) => {
      map.set(category.id, 0);
    });

    products.forEach((product) => {
      const matched = categories.find((category) => matchesCategory(product, category));
      if (!matched) return;
      map.set(matched.id, (map.get(matched.id) || 0) + 1);
    });

    return map;
  }, [categories, products]);

  const totalCategories = categories.length;
  const activeCount = useMemo(
    () => categories.filter((category) => category.active).length,
    [categories]
  );
  const inactiveCount = totalCategories - activeCount;
  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return categories
      .filter((category) => {
        if (statusFilter === "active" && !category.active) return false;
        if (statusFilter === "inactive" && category.active) return false;

        if (!normalizedQuery) return true;

        return (
          category.name.toLowerCase().includes(normalizedQuery) ||
          category.slug.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => {
        if (a.display_order !== b.display_order) {
          return a.display_order - b.display_order;
        }
        return a.name.localeCompare(b.name, "pt-BR");
      });
  }, [categories, query, statusFilter]);

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
          <div className="min-h-full bg-[#F4F2EE]">
            <div className="min-h-full bg-[radial-gradient(circle_at_top_right,rgba(205,189,160,0.22),transparent_28%),radial-gradient(circle_at_22%_0%,rgba(78,102,56,0.08),transparent_22%),linear-gradient(180deg,#F7F3ED_0%,#F2EEE8_100%)] px-4 py-5 md:px-6 md:py-6">
              <div className="mx-auto flex w-full max-w-[1260px] flex-col gap-6">
                {/* Mobile header */}
                <div className="lg:hidden overflow-hidden rounded-[16px] border border-[#E6DFD6] bg-white shadow-[0_2px_12px_rgba(95,87,81,0.06)]">
                  <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-[#EEE8DF]">
                    <button
                      type="button"
                      onClick={() => setMobileSidebarOpen((value) => !value)}
                      className="flex flex-col gap-[5px] p-1.5 text-[#5F5751] hover:text-[#1C1C1A] shrink-0"
                      aria-label="Abrir menu"
                    >
                      <span className="block w-5 h-[2px] bg-current rounded" />
                      <span className="block w-5 h-[2px] bg-current rounded" />
                      <span className="block w-5 h-[2px] bg-current rounded" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-[1.3rem] font-semibold text-[#1C1C1A] leading-tight">Categorias</h1>
                      <p className="text-[12px] text-[#9A9189] mt-0.5">
                        {ui.isLoading
                          ? "Carregando..."
                          : `${totalCategories} categoria${totalCategories !== 1 ? "s" : ""} · ${activeCount} ativa${activeCount !== 1 ? "s" : ""} · ${inactiveCount} inativa${inactiveCount !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-white rounded-[8px] shrink-0 bg-[#2A3D20]"
                    >
                      <span className="text-[18px] leading-none font-light">+</span>
                      Nova
                    </button>
                  </div>
                  {ui.error ? (
                    <div className="px-4 py-2.5 bg-[#FBF2F2] border-b border-[#E0C8C8] text-[12px] text-[#8A3A3A]">
                      {ui.error}
                    </div>
                  ) : null}
                  {ui.successMessage ? (
                    <div className="px-4 py-2.5 bg-[#EEF5E9] border-b border-[#CFE0C6] text-[12px] text-[#385329]">
                      {ui.successMessage}
                    </div>
                  ) : null}
                </div>

                {/* Desktop header */}
                <section className="hidden lg:block rounded-[28px] border border-[#E5DED4] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,243,235,0.94))] px-5 py-6 shadow-[0_30px_90px_rgba(42,61,32,0.08)] md:px-7">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-[#9A9189]">CMS</p>
                      <h1
                        className="text-[2.4rem] leading-[0.94] text-[#1C1C1A] md:text-[3rem]"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                      >
                        Categorias
                      </h1>
                      <p className="mt-3 max-w-[600px] text-[14px] leading-relaxed text-[#6F665E] md:text-[15px]">
                        Organize as linhas do catalogo da La Pistaccheria.
                      </p>
                      <p className="mt-3 text-[13px] text-[#9A9189]">
                        {ui.isLoading
                          ? "Carregando..."
                          : `${totalCategories} categoria${totalCategories !== 1 ? "s" : ""} · ${activeCount} ativa${activeCount !== 1 ? "s" : ""} · ${inactiveCount} inativa${inactiveCount !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#2A3D20] px-5 text-[11px] font-medium uppercase tracking-[0.16em] text-white shadow-[0_16px_32px_rgba(42,61,32,0.24)] transition-all hover:bg-[#223218] hover:shadow-[0_20px_38px_rgba(42,61,32,0.3)]"
                      >
                        <DashboardIcon type="plus" />
                        Nova categoria
                      </button>
                    </div>
                  </div>
                  {ui.error ? (
                    <div className="mt-5 rounded-[12px] border border-[#E0C8C8] bg-[#FBF2F2] px-4 py-3 text-[13px] text-[#8A3A3A]">
                      {ui.error}
                    </div>
                  ) : null}
                  {ui.successMessage ? (
                    <div className="mt-5 rounded-[12px] border border-[#CFE0C6] bg-[#EEF5E9] px-4 py-3 text-[13px] text-[#385329]">
                      {ui.successMessage}
                    </div>
                  ) : null}
                </section>

                <section className="overflow-hidden rounded-[26px] border border-[#E6DFD6] bg-white/90 shadow-[0_24px_70px_rgba(95,87,81,0.07)] backdrop-blur-sm">
                  <div className="border-b border-[#EEE8DF] px-5 py-3 md:px-6 md:py-5">
                    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                      {/* Título — desktop apenas */}
                      <div className="hidden lg:block">
                        <h2
                          className="text-[1.7rem] leading-none text-[#1C1C1A]"
                          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        >
                          Catalogo de categorias
                        </h2>
                        <p className="mt-2 text-[13px] text-[#7A716A]">
                          {filteredCategories.length} resultado{filteredCategories.length !== 1 ? "s" : ""} exibido{filteredCategories.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {/* Contagem — mobile apenas */}
                      <p className="lg:hidden text-[12px] text-[#9A9189]">
                        {filteredCategories.length} categoria{filteredCategories.length !== 1 ? "s" : ""} encontrada{filteredCategories.length !== 1 ? "s" : ""}
                      </p>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <label className="flex h-9 lg:h-11 items-center gap-2 rounded-[10px] lg:rounded-[12px] border border-[#E1D9CE] bg-white px-3 text-[#5F5751] lg:min-w-[250px]">
                          <DashboardIcon type="search" />
                          <input
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Buscar por nome ou slug"
                            className="h-full w-full bg-transparent text-[13px] outline-none placeholder:text-[#A09890]"
                          />
                        </label>

                        <div className="inline-flex h-9 lg:h-11 rounded-[10px] lg:rounded-[12px] border border-[#DED5CA] bg-[#F9F6F1] p-1">
                          {([
                            { id: "all", label: "Todos" },
                            { id: "active", label: "Ativas" },
                            { id: "inactive", label: "Inativas" },
                          ] as Array<{ id: StatusFilter; label: string }>).map((filter) => (
                            <button
                              key={filter.id}
                              type="button"
                              onClick={() => setStatusFilter(filter.id)}
                              className={`px-3 text-[11px] font-medium uppercase tracking-[0.08em] rounded-[9px] transition-colors ${
                                statusFilter === filter.id
                                  ? "bg-white text-[#2A3D20] shadow-sm"
                                  : "text-[#7A716A] hover:text-[#1C1C1A]"
                              }`}
                            >
                              {filter.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 md:px-6">
                    {ui.isLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="h-[84px] animate-pulse rounded-[18px] bg-[#F3EEE7]" />
                        ))}
                      </div>
                    ) : filteredCategories.length === 0 ? (
                      <div className="rounded-[18px] border border-dashed border-[#DDD3C7] bg-[#FCFAF7] px-5 py-10 text-center text-[13px] text-[#7A716A]">
                        Nenhuma categoria encontrada para os filtros aplicados.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {filteredCategories.map((category) => {
                          const linkedProducts = productCountByCategory.get(category.id) || 0;

                          return (
                            <article
                              key={category.id}
                              className="rounded-[18px] border border-[#EFE7DB] bg-[#FFFDFA] px-4 py-3.5 lg:py-4"
                            >
                              {/* Mobile card */}
                              <div className="lg:hidden space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="line-clamp-2 text-[14px] font-semibold text-[#1F1C18] leading-snug">
                                    {category.name}
                                  </p>
                                  <span className={`shrink-0 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${category.active ? "bg-[#ECF2E7] text-[#355029]" : "bg-[#EFE9E0] text-[#8B7760]"}`}>
                                    {category.active ? "Ativa" : "Inativa"}
                                  </span>
                                </div>
                                <p className="truncate text-[11px] text-[#8A8179]">{category.slug}</p>
                                <p className="text-[11px] text-[#5F5751]">
                                  {linkedProducts} produto{linkedProducts !== 1 ? "s" : ""} vinculado{linkedProducts !== 1 ? "s" : ""}
                                </p>
                                <div className="flex gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(category)}
                                    className="h-7 px-3 border border-[#D5CFC8] text-[10px] tracking-[0.1em] uppercase text-[#5F5751] rounded-[6px] hover:text-[#1C1C1A]"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    disabled={ui.isSubmitting}
                                    onClick={() => handleToggleActive(category)}
                                    className="h-7 px-3 border border-[#D5CFC8] text-[10px] tracking-[0.1em] uppercase text-[#5F5751] rounded-[6px] hover:text-[#1C1C1A] disabled:opacity-60"
                                  >
                                    {category.active ? "Desativar" : "Ativar"}
                                  </button>
                                </div>
                              </div>

                              {/* Desktop layout */}
                              <div className="hidden lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.95fr)_minmax(120px,0.6fr)_minmax(120px,0.6fr)_minmax(80px,0.45fr)_minmax(0,1fr)] lg:items-center">
                                <div className="min-w-0">
                                  <p className="truncate text-[15px] font-semibold text-[#1F1C18]">
                                    {category.name}
                                  </p>
                                  {category.description ? (
                                    <p className="mt-1 truncate text-[12px] text-[#8A8179]">{category.description}</p>
                                  ) : null}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-[12px] text-[#5F5751]">{category.slug}</p>
                                </div>

                                <div>
                                  <p className="text-[12px] text-[#5F5751]">{linkedProducts}</p>
                                </div>

                                <div>
                                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${category.active ? "bg-[#ECF2E7] text-[#355029]" : "bg-[#EFE9E0] text-[#8B7760]"}`}>
                                    {category.active ? "Ativa" : "Inativa"}
                                  </span>
                                </div>

                                <div>
                                  <p className="text-[12px] text-[#5F5751]">{category.display_order}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(category)}
                                    className="h-9 px-3 border border-[#D5CFC8] text-[10px] tracking-[0.12em] uppercase text-[#5F5751] rounded-[8px] hover:text-[#1C1C1A]"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    disabled={ui.isSubmitting}
                                    onClick={() => handleToggleActive(category)}
                                    className="h-9 px-3 border border-[#D5CFC8] text-[10px] tracking-[0.12em] uppercase text-[#5F5751] rounded-[8px] hover:text-[#1C1C1A] disabled:opacity-60"
                                  >
                                    {category.active ? "Desativar" : "Ativar"}
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        }
      />

      {isModalOpen ? (
        <CategoryModal
          mode={modalMode}
          form={modalForm}
          setForm={setModalForm}
          slugTouched={slugTouched}
          setSlugTouched={setSlugTouched}
          isSubmitting={ui.isSubmitting}
          error={ui.formError}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
        />
      ) : null}
    </>
  );
}
