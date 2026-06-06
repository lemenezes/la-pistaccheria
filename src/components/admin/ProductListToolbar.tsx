import { useEffect, useRef, useState } from "react";

export type ProductFilter = "all" | "active" | "inactive" | "featured" | "hidden";
export type SortOption =
  | "default"
  | "newest"
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "display_order";

interface CategoryOption {
  id: string;
  name: string;
  active: boolean;
}

interface ProductListToolbarProps {
  query: string;
  filter: ProductFilter;
  sortBy: SortOption;
  categories: CategoryOption[];
  categoryFilters: string[];
  onQueryChange: (value: string) => void;
  onFilterChange: (value: ProductFilter) => void;
  onSortChange: (value: SortOption) => void;
  onCategoryChange: (value: string[]) => void;
  onNewProduct: () => void;
  onToggleSidebar: () => void;
}

const filterOptions: Array<{ label: string; value: ProductFilter }> = [
  { label: "Todos", value: "all" },
  { label: "Ativos", value: "active" },
  { label: "Inativos", value: "inactive" },
  { label: "Destaques", value: "featured" },
  { label: "Ocultos no site", value: "hidden" },
];

const sortOptions: Array<{ label: string; value: SortOption }> = [
  { label: "Mais recentes", value: "newest" },
  { label: "Nome A → Z", value: "name_asc" },
  { label: "Nome Z → A", value: "name_desc" },
  { label: "Menor preço", value: "price_asc" },
  { label: "Maior preço", value: "price_desc" },
  { label: "Ordem de exibição", value: "display_order" },
];

export default function ProductListToolbar({
  query,
  filter,
  sortBy,
  categories,
  categoryFilters,
  onQueryChange,
  onFilterChange,
  onSortChange,
  onCategoryChange,
  onNewProduct,
  onToggleSidebar,
}: ProductListToolbarProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);

  const selectClass =
    "h-8 px-2.5 text-[12.5px] text-[#5F5751] border border-[#E5E0D8] bg-white rounded-md hover:border-[#9A9189] transition-colors outline-none focus:border-[#9A9189] cursor-pointer";
  const drawerSelectClass =
    "h-9 w-full px-3 text-[13px] text-[#5F5751] border border-[#E5E0D8] bg-white rounded-md hover:border-[#9A9189] transition-colors outline-none focus:border-[#9A9189] cursor-pointer";

  useEffect(() => {
    function handleDocumentMouseDown(event: MouseEvent) {
      if (!isCategoryMenuOpen) return;
      if (categoryMenuRef.current?.contains(event.target as Node)) return;

      setIsCategoryMenuOpen(false);
    }

    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCategoryMenuOpen(false);
        setIsMobileFiltersOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isCategoryMenuOpen]);

  function isCategorySelected(categoryName: string) {
    return categoryFilters.includes(categoryName);
  }

  function toggleCategory(categoryName: string) {
    if (categoryFilters.includes(categoryName)) {
      onCategoryChange(categoryFilters.filter((selected) => selected !== categoryName));
      return;
    }

    onCategoryChange([...categoryFilters, categoryName]);
  }

  function clearCategoryFilters() {
    onCategoryChange([]);
  }

  const activeChips = [
    ...categoryFilters.map((categoryName) => {
      const category = categories.find((item) => item.name === categoryName);

      return {
        key: `category-${categoryName}`,
        label: `${category?.name ?? categoryName}${category && !category.active ? " (inativa)" : ""}`,
        onRemove: () => onCategoryChange(categoryFilters.filter((selected) => selected !== categoryName)),
      };
    }),
  ].filter(Boolean) as Array<{ key: string; label: string; onRemove: () => void }>;

  const filterCount = activeChips.length;
  const selectedCategoryCount = categoryFilters.length;

  return (
    <div>
      {/* Faixa 1 — título + busca + novo */}
      <div className="flex items-center gap-4 px-4 md:px-6 pt-5 pb-4 border-b border-[#E5E0D8]">
        {/* Hamburguer (mobile/tablet apenas) */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden flex flex-col gap-[5px] p-1.5 text-[#5F5751] hover:text-[#1C1C1A] shrink-0"
          aria-label="Abrir menu"
        >
          <span className="block w-5 h-[2px] bg-current rounded" />
          <span className="block w-5 h-[2px] bg-current rounded" />
          <span className="block w-5 h-[2px] bg-current rounded" />
        </button>

        {/* Título */}
        <div className="flex-1 min-w-0">
          <h2 className="text-[1.35rem] md:text-[1.6rem] font-semibold text-[#1C1C1A] leading-[1.1]">
            Produtos
          </h2>
          <p className="text-[11.5px] text-[#9A9189] mt-0.5">
            Gerencie seus produtos, preços, descrições e imagens.
          </p>
        </div>

        {/* Busca + Novo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative hidden sm:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9189]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Buscar produtos..."
              className="h-9 w-[220px] lg:w-[260px] pl-9 pr-3 border border-[#E5E0D8] bg-white text-[13px] text-[#1C1C1A] placeholder:text-[#B0A99F] outline-none focus:border-[#9A9189] rounded-md transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={onNewProduct}
            className="flex items-center gap-1.5 px-3 md:px-4 h-9 text-[13px] font-medium text-white transition-opacity hover:opacity-90 rounded-md shrink-0"
            style={{ background: "#2A3D20" }}
          >
            <span className="text-[18px] leading-none font-light">+</span>
            <span className="hidden sm:inline">Novo produto</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* Busca mobile + filtros avançados */}
      <div className="sm:hidden px-4 pt-3 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9189]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full h-9 pl-9 pr-3 border border-[#E5E0D8] bg-white text-[13px] placeholder:text-[#B0A99F] outline-none focus:border-[#9A9189] rounded-md transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen((value) => !value)}
            className="h-9 shrink-0 inline-flex items-center gap-1.5 rounded-md border border-[#E5E0D8] bg-white px-3 text-[12px] font-medium text-[#5F5751] transition-colors hover:border-[#9A9189] hover:text-[#1C1C1A]"
            aria-expanded={isMobileFiltersOpen}
            aria-controls="mobile-product-filters"
          >
            <span className="text-[14px] leading-none">⚙</span>
            <span>Filtros</span>
            {filterCount > 0 && (
              <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-[#2A3D20] px-1 text-[10px] font-semibold text-white">
                {filterCount}
              </span>
            )}
          </button>
        </div>

        {isMobileFiltersOpen && (
          <div
            id="mobile-product-filters"
            className="mt-3 rounded-[14px] border border-[#E5E0D8] bg-[#FAF8F4] p-3 shadow-[0_10px_30px_rgba(95,87,81,0.06)]"
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#5F5751]">Categorias</p>
                <div className="max-h-56 overflow-auto rounded-[12px] border border-[#E8E2D7] bg-white p-2">
                  <div className="space-y-1.5">
                    {categories.map((category) => {
                      const selected = isCategorySelected(category.name);

                      return (
                        <label
                          key={category.id}
                          className={`flex items-center justify-between gap-3 rounded-[10px] px-3 py-2 text-[13px] transition-colors ${
                            selected ? "bg-[#F4F7F1] text-[#1C1C1A]" : "hover:bg-[#FAF8F4] text-[#1C1C1A]"
                          }`}
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {category.name}
                            {!category.active && (
                              <span className="ml-1 text-[11px] font-medium text-[#9A5A20]">(inativa)</span>
                            )}
                          </span>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleCategory(category.name)}
                            className="h-4 w-4 shrink-0 rounded border-[#CFC8BF] text-[#2A3D20] focus:ring-[#2A3D20]"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#5F5751]">
                  Ordenação
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value as SortOption)}
                  className={drawerSelectClass}
                >
                  <option value="default">Ordenar por</option>
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Faixa 2 — filtros principais + controles compactos */}
      <div className="flex items-center justify-between gap-2 px-4 md:px-6 py-2 border-t border-[#E5E0D8] bg-[#F9F7F4]">
        {/* Filtros de status */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none" style={{ WebkitOverflowScrolling: "touch" }}>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`h-8 px-3.5 text-[12.5px] transition-colors rounded-md whitespace-nowrap ${
                filter === option.value
                  ? "bg-white text-[#2A3D20] font-semibold shadow-sm border border-[#D8D3CC]"
                  : "text-[#7A716A] hover:bg-white hover:text-[#1C1C1A]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Categorias + Ordenação */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="relative overflow-visible" ref={categoryMenuRef}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsCategoryMenuOpen((value) => !value);
              }}
              className={`h-8 inline-flex items-center gap-2 rounded-md border px-3 text-[12.5px] font-medium transition-colors ${
                selectedCategoryCount > 0
                  ? "border-[#1C1C1A] bg-[#1C1C1A] text-white"
                  : "border-[#E5E0D8] bg-white text-[#5F5751] hover:border-[#9A9189] hover:text-[#1C1C1A]"
              }`}
              aria-expanded={isCategoryMenuOpen}
              aria-controls="desktop-category-menu"
            >
              <span>Categorias</span>
              {selectedCategoryCount > 0 && (
                <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-white/15 px-1 text-[10px] font-semibold text-current">
                  {selectedCategoryCount}
                </span>
              )}
              <span className="text-[11px] leading-none opacity-80">⌄</span>
            </button>

            {isCategoryMenuOpen && (
              <div
                id="desktop-category-menu"
                className="absolute left-0 top-full z-[9999] mt-2 w-[288px] overflow-hidden rounded-[16px] border border-[#E5E0D8] bg-white shadow-[0_18px_40px_rgba(95,87,81,0.10)]"
              >
                <div className="border-b border-[#EFE7DC] px-4 py-3">
                  <p className="text-[12px] font-semibold text-[#1C1C1A]">Categorias</p>
                  <p className="mt-0.5 text-[11px] text-[#9A9189]">Seleção múltipla com aplicação imediata.</p>
                </div>
                <div className="max-h-64 overflow-auto p-2">
                  <div className="space-y-1.5">
                    {categories.map((category) => {
                      const selected = isCategorySelected(category.name);

                      return (
                        <label
                          key={category.id}
                          className={`flex items-center justify-between gap-3 rounded-[12px] px-3 py-2 text-[13px] transition-colors ${
                            selected ? "bg-[#F4F7F1] text-[#1C1C1A]" : "hover:bg-[#FAF8F4] text-[#1C1C1A]"
                          }`}
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {category.name}
                            {!category.active && (
                              <span className="ml-1 text-[11px] font-medium text-[#9A5A20]">(inativa)</span>
                            )}
                          </span>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleCategory(category.name)}
                            className="h-4 w-4 shrink-0 rounded border-[#CFC8BF] text-[#2A3D20] focus:ring-[#2A3D20]"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className={selectClass}
          >
            <option value="default">Ordenar por</option>
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="px-4 md:px-6 pt-2.5 pb-1.5 bg-[#F9F7F4] border-t border-[#EFE7DC]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A29A90]">Filtrando por:</span>
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1 rounded-full border border-[#D8D3CC] bg-white px-2.5 py-0.5 text-[11.5px] font-medium text-[#5F5751] transition-colors hover:border-[#9A9189] hover:text-[#1C1C1A]"
                >
                  <span>{chip.label}</span>
                  <span aria-hidden="true" className="text-[13px] leading-none">×</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={clearCategoryFilters}
              className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border border-[#E8B8B8] bg-[#FDECEC] px-3 py-1 text-[11.5px] font-semibold text-[#A33A3A] transition-colors hover:border-[#D99292] hover:bg-[#FBE3E3] hover:text-[#8E2F2F]"
            >
              Limpar filtros
              <span aria-hidden="true" className="text-[13px] leading-none">×</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
