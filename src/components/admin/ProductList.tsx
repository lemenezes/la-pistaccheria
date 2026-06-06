import type { DatabaseCategory, DatabaseProduct } from "../../types/database";
import ProductListItem from "./ProductListItem";

interface ProductListProps {
  products: DatabaseProduct[];
  categories: DatabaseCategory[];
  selectedProductId: string | null;
  isLoading: boolean;
  error: string | null;
  onSelectProduct: (id: string) => void;
}

export default function ProductList({
  products,
  categories,
  selectedProductId,
  isLoading,
  error,
  onSelectProduct,
}: ProductListProps) {
  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-20 bg-cream-deep animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-6 md:m-8 border border-[#E0C8C8] bg-[#FBF2F2] text-[#8A3A3A] px-4 py-3 text-[13px]">
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-8 text-[13px] text-warm-gray">
        Nenhum produto encontrado para os filtros aplicados.
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] gap-0 px-6 py-3.5 border-b border-[#E5E0D8] text-[10.5px] tracking-[0.12em] uppercase text-[#B0A9A0] font-semibold">
        <span>Produto</span>
        <span>Categoria</span>
        <span>Preço</span>
        <span>Status</span>
      </div>
      {products.map((product) => (
        <ProductListItem
          key={product.id}
          product={product}
          categories={categories}
          isSelected={selectedProductId === product.id}
          onSelect={() => onSelectProduct(product.id)}
        />
      ))}
    </div>
  );
}
