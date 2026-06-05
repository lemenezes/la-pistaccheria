export type ProductFilter = "all" | "active" | "inactive" | "featured";

interface ProductListToolbarProps {
  query: string;
  filter: ProductFilter;
  onQueryChange: (value: string) => void;
  onFilterChange: (value: ProductFilter) => void;
  onNewProduct: () => void;
  onToggleSidebar: () => void;
}

const filterOptions: Array<{ label: string; value: ProductFilter }> = [
  { label: "Todos", value: "all" },
  { label: "Ativos", value: "active" },
  { label: "Inativos", value: "inactive" },
  { label: "Destaques", value: "featured" },
];

export default function ProductListToolbar({
  query,
  filter,
  onQueryChange,
  onFilterChange,
  onNewProduct,
  onToggleSidebar,
}: ProductListToolbarProps) {
  return (
    <div className="bg-white border-b border-[#E5E0D8] px-4 md:px-6 py-4 md:py-5">
      <div className="flex items-center justify-between gap-3 mb-4 md:mb-5">
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

        <div className="flex-1 min-w-0">
          <h2 className="text-[1.2rem] md:text-[1.5rem] font-semibold text-[#1C1C1A] leading-[1.1]">
            Produtos
          </h2>
          <p className="text-[11px] md:text-[12px] text-[#7A716A] mt-0.5 hidden sm:block">
            Gerencie seus produtos, preços, descrições e imagens.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewProduct}
          className="flex items-center gap-1.5 px-3 md:px-4 h-9 text-[12px] font-medium text-white transition-colors rounded-[4px] shrink-0"
          style={{ background: "#2A3D20" }}
        >
          <span className="text-[16px] leading-none">+</span>
          <span className="hidden sm:inline">Novo produto</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      {/* Busca e filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1 sm:max-w-[360px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A716A] text-[13px]">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full h-9 pl-8 pr-3 border border-[#E5E0D8] bg-[#F9F7F4] text-[13px] text-charcoal placeholder:text-[#B0A99F] outline-none focus:border-[#9A9189] rounded-[4px] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none" style={{ WebkitOverflowScrolling: "touch" }}>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`h-9 px-3 md:px-3.5 text-[12px] transition-colors rounded-[4px] whitespace-nowrap ${
                filter === option.value
                  ? "bg-[#EAF0E6] text-[#3A4D2C] font-medium"
                  : "text-[#7A716A] hover:bg-[#F0EDE8]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
