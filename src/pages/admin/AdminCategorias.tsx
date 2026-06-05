import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminShell from "../../components/admin/AdminShell";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import {
  activateCategory,
  createCategory,
  deactivateCategory,
  getCategories,
  updateCategory,
} from "../../lib/supabase";
import type { DatabaseCategory } from "../../types/database";

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: string;
};

const inputClass =
  "w-full h-10 px-3 border border-[#DDD8D0] bg-white text-[13px] text-[#1C1C1A] placeholder:text-[#A09890] outline-none focus:border-[#4E6638] focus:ring-1 focus:ring-[#4E6638]/20 transition-colors rounded-[5px]";

const textareaClass =
  "w-full px-3 py-2.5 border border-[#DDD8D0] bg-white text-[13px] text-[#1C1C1A] placeholder:text-[#A09890] outline-none focus:border-[#4E6638] focus:ring-1 focus:ring-[#4E6638]/20 transition-colors resize-none rounded-[5px]";

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

export default function AdminCategorias() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [createForm, setCreateForm] = useState<CategoryForm>(toForm());
  const [createSlugTouched, setCreateSlugTouched] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryForm>(toForm());
  const [editSlugTouched, setEditSlugTouched] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: queryError } = await getCategories();

    if (queryError) {
      setError(queryError.message || "Falha ao carregar categorias.");
      setCategories([]);
    } else {
      setCategories((data || []) as DatabaseCategory[]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const activeCount = useMemo(
    () => categories.filter((category) => category.active).length,
    [categories]
  );

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

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      name: createForm.name.trim(),
      slug: createForm.slug.trim(),
      description: createForm.description.trim() || null,
      image_url: createForm.image_url.trim() || null,
      active: true,
      display_order: parseInt(createForm.display_order, 10) || 0,
    };

    const { error: apiError } = await createCategory(payload);

    if (apiError) {
      setError(apiError.message || "Erro ao criar categoria.");
      setIsSubmitting(false);
      return;
    }

    setCreateForm(toForm());
    setCreateSlugTouched(false);
    await loadCategories();
    setIsSubmitting(false);
  }

  function handleStartEdit(category: DatabaseCategory) {
    setEditingId(category.id);
    setEditForm(toForm(category));
    setEditSlugTouched(true);
  }

  async function handleSaveEdit(id: string) {
    setError(null);
    setIsSubmitting(true);

    const { error: apiError } = await updateCategory(id, {
      name: editForm.name.trim(),
      slug: editForm.slug.trim(),
      description: editForm.description.trim() || null,
      image_url: editForm.image_url.trim() || null,
      display_order: parseInt(editForm.display_order, 10) || 0,
    });

    if (apiError) {
      setError(apiError.message || "Erro ao atualizar categoria.");
      setIsSubmitting(false);
      return;
    }

    setEditingId(null);
    await loadCategories();
    setIsSubmitting(false);
  }

  async function handleToggleActive(category: DatabaseCategory) {
    setError(null);
    setIsSubmitting(true);

    const result = category.active
      ? await deactivateCategory(category.id)
      : await activateCategory(category.id);

    if (result.error) {
      setError(result.error.message || "Erro ao atualizar status da categoria.");
      setIsSubmitting(false);
      return;
    }

    await loadCategories();
    setIsSubmitting(false);
  }

  return (
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
          <div className="px-4 md:px-6 py-6 flex-1 flex flex-col gap-5">
            <div className="bg-white border border-[#E5E0D8] rounded-[8px] px-5 py-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-[9px] tracking-[0.2em] uppercase text-[#9A9189] mb-1">
                    CMS
                  </p>
                  <h1
                    className="text-[2rem] font-light text-[#1C1C1A] leading-[1.05]"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    Categorias
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen((value) => !value)}
                  className="lg:hidden h-10 px-4 border border-[#D5CFC8] text-[11px] tracking-[0.12em] uppercase text-[#5F5751]"
                >
                  Menu
                </button>
              </div>

              {error && (
                <div className="mb-4 border border-[#E0C8C8] bg-[#FBF2F2] text-[#8A3A3A] px-4 py-3 text-[13px] rounded-[5px]">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleCreateSubmit}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3"
              >
                <input
                  type="text"
                  placeholder="Nome"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: createSlugTouched ? prev.slug : slugify(e.target.value),
                    }))
                  }
                  required
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Slug"
                  value={createForm.slug}
                  onChange={(e) => {
                    setCreateSlugTouched(true);
                    setCreateForm((prev) => ({ ...prev, slug: e.target.value }));
                  }}
                  required
                  className={inputClass}
                />
                <input
                  type="number"
                  placeholder="Ordem"
                  value={createForm.display_order}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, display_order: e.target.value }))
                  }
                  className={inputClass}
                />
                <input
                  type="url"
                  placeholder="Imagem (URL opcional)"
                  value={createForm.image_url}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, image_url: e.target.value }))
                  }
                  className={inputClass}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-4 bg-[#2A3D20] text-white text-[11px] tracking-[0.13em] uppercase rounded-[5px] hover:bg-[#223218] disabled:opacity-60"
                >
                  {isSubmitting ? "Salvando..." : "Criar categoria"}
                </button>
                <textarea
                  placeholder="Descricao (opcional)"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={2}
                  className={`${textareaClass} md:col-span-2 xl:col-span-5`}
                />
              </form>
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded-[8px] overflow-hidden">
              <div className="hidden md:grid md:grid-cols-[1.1fr_1fr_0.6fr_0.5fr_0.9fr] gap-3 px-5 py-3 border-b border-[#F0EDE8] text-[10px] tracking-[0.14em] uppercase text-[#8D847C]">
                <span>Categoria</span>
                <span>Slug</span>
                <span>Ordem</span>
                <span>Status</span>
                <span>Acoes</span>
              </div>

              {isLoading ? (
                <div className="px-5 py-6 text-[13px] text-[#7A716A]">
                  Carregando categorias...
                </div>
              ) : categories.length === 0 ? (
                <div className="px-5 py-6 text-[13px] text-[#7A716A]">
                  Nenhuma categoria cadastrada.
                </div>
              ) : (
                <ul>
                  {categories.map((category) => {
                    const isEditing = editingId === category.id;

                    return (
                      <li
                        key={category.id}
                        className="px-5 py-4 border-b border-[#F0EDE8] last:border-b-0"
                      >
                        {isEditing ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                  slug: editSlugTouched
                                    ? prev.slug
                                    : slugify(e.target.value),
                                }))
                              }
                              className={inputClass}
                            />
                            <input
                              type="text"
                              value={editForm.slug}
                              onChange={(e) => {
                                setEditSlugTouched(true);
                                setEditForm((prev) => ({ ...prev, slug: e.target.value }));
                              }}
                              className={inputClass}
                            />
                            <input
                              type="number"
                              value={editForm.display_order}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  display_order: e.target.value,
                                }))
                              }
                              className={inputClass}
                            />
                            <input
                              type="url"
                              value={editForm.image_url}
                              onChange={(e) =>
                                setEditForm((prev) => ({ ...prev, image_url: e.target.value }))
                              }
                              placeholder="Imagem (URL)"
                              className={inputClass}
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleSaveEdit(category.id)}
                                className="h-10 px-3 bg-[#2A3D20] text-white text-[10px] tracking-[0.12em] uppercase rounded-[5px] disabled:opacity-60"
                              >
                                Salvar
                              </button>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => setEditingId(null)}
                                className="h-10 px-3 border border-[#D5CFC8] text-[10px] tracking-[0.12em] uppercase text-[#5F5751] rounded-[5px]"
                              >
                                Cancelar
                              </button>
                            </div>
                            <textarea
                              value={editForm.description}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              rows={2}
                              placeholder="Descricao"
                              className={`${textareaClass} md:col-span-2 xl:col-span-5`}
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr_0.6fr_0.5fr_0.9fr] gap-2 md:gap-3 items-center">
                            <div>
                              <p className="text-[15px] text-[#1C1C1A] leading-tight">
                                {category.name}
                              </p>
                              {category.description && (
                                <p className="text-[12px] text-[#7A716A] mt-1 line-clamp-2">
                                  {category.description}
                                </p>
                              )}
                            </div>
                            <p className="text-[12px] text-[#5F5751]">{category.slug}</p>
                            <p className="text-[12px] text-[#5F5751]">{category.display_order}</p>
                            <div>
                              {category.active ? (
                                <span className="inline-block px-2 py-1 bg-[#DDE8D2] text-[#3E5B2A] text-[10px] tracking-[0.1em] uppercase font-medium rounded">
                                  Ativa
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-1 bg-[#ECE8E2] text-[#7A716A] text-[10px] tracking-[0.1em] uppercase font-medium rounded">
                                  Inativa
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(category)}
                                className="h-8 px-3 border border-[#D5CFC8] text-[10px] tracking-[0.12em] uppercase text-[#5F5751] hover:text-[#1C1C1A] rounded-[5px]"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleToggleActive(category)}
                                className="h-8 px-3 border border-[#D5CFC8] text-[10px] tracking-[0.12em] uppercase text-[#5F5751] hover:text-[#1C1C1A] rounded-[5px] disabled:opacity-60"
                              >
                                {category.active ? "Desativar" : "Ativar"}
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      }
      panel={
        <div className="h-full p-6 bg-[#FAF7F2] text-[#5F5751]">
          <p className="text-[9px] tracking-[0.18em] uppercase text-[#9A9189] mb-3">
            Resumo
          </p>
          <h2
            className="text-[1.5rem] text-[#1C1C1A] leading-tight mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Categorias no CMS
          </h2>
          <p className="text-[13px] leading-relaxed mb-3">
            Total: {categories.length}
          </p>
          <p className="text-[13px] leading-relaxed mb-3">Ativas: {activeCount}</p>
          <p className="text-[12px] leading-relaxed text-[#7A716A]">
            Produtos passam a operar por category_id no admin, mantendo compatibilidade com o campo category enquanto a migracao estiver ativa.
          </p>
        </div>
      }
    />
  );
}
