import { formatPrice } from "../../lib/formatPrice";
import type { DatabaseProduct } from "../../types/database";

interface ProductPreviewPanelProps {
  product: DatabaseProduct | null;
  onEdit: () => void;
}

export default function ProductPreviewPanel({ product, onEdit }: ProductPreviewPanelProps) {
  if (!product) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 text-center">
        <div
          className="w-14 h-14 rounded-full mb-5 flex items-center justify-center text-[22px]"
          style={{ background: "#EDF1E8", color: "#3A4D2C" }}
        >
          ✦
        </div>
        <h3 className="text-[1rem] font-semibold text-[#1C1C1A] mb-2">
          Selecione um produto
        </h3>
        <p className="text-[13px] text-[#7A716A] leading-relaxed">
          Clique em qualquer produto da lista para visualizar os detalhes.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Imagem */}
      <div className="px-5 pt-5 pb-3 shrink-0">
        <div
          className="w-full rounded-md overflow-hidden border border-[#E5E0D8] bg-[#F4F2EE]"
          style={{ aspectRatio: "4/3" }}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#C5BFB8] text-[11px] tracking-[0.12em] uppercase">
              Sem imagem
            </div>
          )}
        </div>
      </div>

      {/* Informações */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-24">
        {/* Status badges */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full ${
              product.active
                ? "bg-[#E8F0E3] text-[#3A4D2C]"
                : "bg-[#F0ECEC] text-[#8A3A3A]"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                product.active ? "bg-[#3A4D2C]" : "bg-[#8A3A3A]"
              }`}
            />
            {product.active ? "Ativo" : "Inativo"}
          </span>
          {product.featured && (
            <span className="inline-block px-2.5 py-1 text-[11px] rounded-full bg-[#F5F0E0] text-[#8A6820]">
              Destaque
            </span>
          )}
        </div>

        {/* Nome */}
        <h2 className="text-[1.15rem] font-semibold text-[#1C1C1A] leading-tight mb-1">
          {product.name}
        </h2>

        {/* Categoria */}
        <p className="text-[12px] text-[#9A9189] mb-3">{product.category}</p>

        {/* Preço */}
        <p className="text-[1.5rem] font-bold text-[#2A3D20] mb-4">
          {formatPrice(product.price)}
        </p>

        {/* Descrição curta */}
        {product.short_description && (
          <p className="text-[13px] text-[#5F5751] leading-relaxed border-t border-[#ECEAE5] pt-4 mb-4">
            {product.short_description}
          </p>
        )}

        {/* SEO */}
        {(product.meta_title || product.meta_description) && (
          <div className="border-t border-[#ECEAE5] pt-4 mb-4">
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#9A9189] mb-2">SEO</p>
            {product.meta_title && (
              <p className="text-[12px] text-[#1C1C1A] font-medium mb-1">{product.meta_title}</p>
            )}
            {product.meta_description && (
              <p className="text-[12px] text-[#7A716A] leading-relaxed">{product.meta_description}</p>
            )}
          </div>
        )}

        {/* Slug */}
        <p className="text-[11px] text-[#B0A9A0] mb-6">/{product.slug}</p>
      </div>

      {/* Botão fixo no fundo */}
      <div className="absolute bottom-0 inset-x-0 px-5 py-4 border-t border-[#E5E0D8] bg-[#FAF7F2]">
        <button
          type="button"
          onClick={onEdit}
          className="w-full h-10 text-[13px] font-medium text-white rounded-[5px] transition-opacity hover:opacity-90"
          style={{ background: "#2A3D20" }}
        >
          Editar produto
        </button>
      </div>
    </div>
  );
}

