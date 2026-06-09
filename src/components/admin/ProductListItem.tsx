import { formatPrice } from "../../lib/formatPrice";
import type { DatabaseCategory, DatabaseProduct } from "../../types/database";

interface ProductListItemProps {
  product: DatabaseProduct;
  categories: DatabaseCategory[];
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProductListItem({
  product,
  categories,
  isSelected,
  onSelect,
  onEdit,
  onDelete
}: ProductListItemProps) {
  const linkedCategory = product.category_id
    ? categories.find(c => c.id === product.category_id)
    : null;
  const isLinkedCategoryInactive =
    product.active && linkedCategory?.active === false;

  return (
    <>
      <button
        type="button"
        onClick={onSelect}
        style={
          isSelected
            ? { borderLeft: "4px solid #4f6436" }
            : { borderLeft: "4px solid transparent" }
        }
        className={`w-full text-left grid grid-cols-[48px_1fr_auto] gap-3 items-start px-4 py-3 border-b border-[#F0EDE8] transition-all md:hidden ${
          isSelected ? "bg-[#e6ede0]" : "hover:bg-[#F7F5F2]"
        }`}>
        <div className="w-12 h-12 border border-[#E5E0D8] bg-[#F0EDE8] shrink-0 overflow-hidden rounded-md">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        <div className="min-w-0">
          <p className="line-clamp-2 text-[14px] font-semibold text-[#1C1C1A] leading-snug">
            {product.name}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-[#7A716A]">
            {product.category}
            {isLinkedCategoryInactive && (
              <span className="ml-1 text-[#9A5A20] font-medium">· Inativa</span>
            )}
          </p>
          <p className="mt-0.5 text-[12px] font-medium text-[#1C1C1A]">
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-full ${
              product.active
                ? "bg-[#E8F0E3] text-[#3A4D2C]"
                : "bg-[#F0ECEC] text-[#8A3A3A]"
            }`}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${product.active ? "bg-[#3A4D2C]" : "bg-[#8A3A3A]"}`}
            />
            {product.active ? "Ativo" : "Inativo"}
          </span>
          {!product.active && product.featured ? null : product.featured ? (
            <span className="inline-block px-2 py-1 text-[11px] rounded-full bg-[#F5F0E0] text-[#8A6820]">
              Destaque
            </span>
          ) : null}
        </div>
      </button>

      <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_96px] gap-0 items-center px-6 py-4 border-b border-[#F0EDE8] hover:bg-[#F7F5F2] transition-colors">
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
              <p className="text-[11px] text-[#9A9189] mt-0.5 truncate">
                {product.weight}
              </p>
            )}
          </div>
        </div>

        <div className="min-w-0 pr-4">
          <p className="text-[12px] text-[#7A716A] truncate">
            {product.category}
          </p>
          {isLinkedCategoryInactive && (
            <p className="text-[10px] text-[#9A5A20] font-medium mt-0.5">
              Categoria inativa
            </p>
          )}
        </div>

        <p className="text-[13px] text-[#1C1C1A] pr-4">
          {formatPrice(product.price)}
        </p>

        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-full ${
              product.active
                ? "bg-[#E8F0E3] text-[#3A4D2C]"
                : "bg-[#F0ECEC] text-[#8A3A3A]"
            }`}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${product.active ? "bg-[#3A4D2C]" : "bg-[#8A3A3A]"}`}
            />
            {product.active ? "Ativo" : "Inativo"}
          </span>
          {!product.active && product.featured ? null : product.featured ? (
            <span className="inline-block px-2 py-1 text-[11px] rounded-full bg-[#F5F0E0] text-[#8A6820]">
              Destaque
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="h-8 w-8 inline-flex items-center justify-center rounded-[5px] border border-[#E5E0D8] text-[#7A716A] hover:text-[#1C1C1A] hover:border-[#CFC9C1] hover:bg-white transition-colors"
            aria-label={`Editar ${product.name}`}>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="h-8 w-8 inline-flex items-center justify-center rounded-[5px] border border-[#E9D5D5] text-[#9A5B5B] hover:text-[#8A3A3A] hover:border-[#DDB4B4] hover:bg-[#FBF2F2] transition-colors"
            aria-label={`Excluir ${product.name}`}>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
