import { formatPrice } from "../../lib/formatPrice";
import type { DatabaseProduct } from "../../types/database";

interface ProductListItemProps {
  product: DatabaseProduct;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ProductListItem({
  product,
  isSelected,
  onSelect,
}: ProductListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={isSelected ? { borderLeft: "4px solid #4f6436" } : { borderLeft: "4px solid transparent" }}
      className={`w-full text-left grid grid-cols-[2fr_1fr_1fr_1fr] gap-0 items-center px-6 py-4 border-b border-[#F0EDE8] transition-all ${
        isSelected ? "bg-[#e6ede0]" : "hover:bg-[#F7F5F2]"
      }`}
    >
      {/* Produto */}
      <div className="flex items-center gap-3 min-w-0 pr-4">
        <div className="w-14 h-14 border border-[#E5E0D8] bg-[#F0EDE8] shrink-0 overflow-hidden rounded-md">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-[#1C1C1A] leading-tight truncate">
            {product.name}
          </p>
          {product.weight && (
            <p className="text-[11px] text-[#9A9189] mt-0.5 truncate">{product.weight}</p>
          )}
        </div>
      </div>

      {/* Categoria */}
      <p className="text-[12px] text-[#7A716A] truncate pr-4">{product.category}</p>

      {/* Preço */}
      <p className="text-[13px] text-[#1C1C1A] pr-4">{formatPrice(product.price)}</p>

      {/* Status */}
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-full ${
            product.active
              ? "bg-[#E8F0E3] text-[#3A4D2C]"
              : "bg-[#F0ECEC] text-[#8A3A3A]"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${
            product.active ? "bg-[#3A4D2C]" : "bg-[#8A3A3A]"
          }`} />
          {product.active ? "Ativo" : "Inativo"}
        </span>
        {!product.active && product.featured ? null : product.featured ? (
          <span className="inline-block px-2 py-1 text-[11px] rounded-full bg-[#F5F0E0] text-[#8A6820]">
            Rascunho
          </span>
        ) : null}
      </div>
    </button>
  );
}
