export type ProductFilter = "all" | "active" | "inactive" | "featured";
export type SortOption =
  | "default"
  | "newest"
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "display_order";

interface ProductListToolbarProps {
  query: string;
  filter: ProductFilter;
  sortBy: SortOption;
  categories: string[];
  categoryFilter: string;
  onQueryChange: (value: string) => void;
  onFilterChange: (value: ProductFilter) => void;
  onSortChange: (value: SortOption) => void;
  onCategoryChange: (value: string) => void;
  onNewProduct: () => void;
  onToggleSidebar: () => void;
}

const filterOptions: Array<{ label: string; value: ProductFilter }> = [
  { label: "Todos", value: "all" },
  { label: "Ativos", value: "active" },
  { label: "Inativos", value: "inactive" },
  { label: "Destaques", value: "featured" },
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
  categoryFilter,
  onQueryChange,
  onFilterChange,
  onSortChange,
  onCategoryChange,
  onNewProduct,
  onToggleSidebar,
}: ProductListToolbarProps) {
  const selectClass =
    "h-8 px-2.5 text-[12.5px] text-[#5F5751] border border-[#E5E0D8] bg-white rounded-md hover:border-[#9A9189] transition-colors outline-none focus:border-[#9A9189] cursor-pointer";

  return (
    <div>
      {/* Faixa 1 — título + busca + novo */}
      <div className="flex items-center gap-4 px-4 md:px-6 pt-5 pb-4">
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
          <p className="text-[11.5px] text-[#9A9189] mt-0.5 hidden sm:block">
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

      {/* Busca mobile (abaixo do header no mobile) */}
      <div className="sm:hidden px-4 pb-3">
        <div className="relative">
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
      </div>

      {/* Faixa 2 — filtros + categorias + ordenação */}
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

        {/* Categoria + Ordenação */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

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
    </div>
  );
}
