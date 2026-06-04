type ProductFilter = "all" | "active" | "inactive" | "featured";

interface ProductListToolbarProps {
  query: string;
  filter: ProductFilter;
  onQueryChange: (value: string) => void;
  onFilterChange: (value: ProductFilter) => void;
  onNewProduct: () => void;
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
}: ProductListToolbarProps) {
  return (
    <div className="bg-white border-b border-[#E5E0D8] px-6 py-5">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2
            className="text-[1.5rem] font-semibold text-[#1C1C1A] leading-[1.1]"
          >
            Produtos
          </h2>
          <p className="text-[12px] text-[#7A716A] mt-0.5">
            Gerencie seus produtos, preços, descrições e imagens.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewProduct}
          className="flex items-center gap-1.5 px-4 h-9 text-[12px] font-medium text-white transition-colors rounded-[4px]"
          style={{ background: "#2A3D20" }}
        >
          <span className="text-[16px] leading-none">+</span>
          Novo produto
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-[360px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A716A] text-[13px]">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full h-9 pl-8 pr-3 border border-[#E5E0D8] bg-[#F9F7F4] text-[13px] text-charcoal placeholder:text-[#B0A99F] outline-none focus:border-[#9A9189] rounded-[4px] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`h-9 px-3.5 text-[12px] transition-colors rounded-[4px] ${
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

export type { ProductFilter };
