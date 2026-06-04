import { useState } from "react";
import ProductForm, { type ProductFormValues } from "../../pages/admin/ProductForm";
import type { DatabaseProduct } from "../../types/database";

interface ProductPreviewPanelProps {
  mode: "preview" | "create" | "edit";
  product: DatabaseProduct | null;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
}

type EditorTab = "geral" | "imagens" | "estoques" | "seo";

const TABS: Array<{ id: EditorTab; label: string; fieldId: string }> = [
  { id: "geral", label: "Geral", fieldId: "pf-name" },
  { id: "imagens", label: "Imagens", fieldId: "pf-image_url" },
  { id: "estoques", label: "Estoques", fieldId: "pf-display_order" },
  { id: "seo", label: "SEO", fieldId: "pf-meta_title" },
];

const FORM_ID = "inline-product-form";

export default function ProductPreviewPanel({
  mode,
  product,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}: ProductPreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>("geral");

  function handleTabChange(tab: EditorTab) {
    setActiveTab(tab);
    const fieldId = TABS.find((t) => t.id === tab)?.fieldId;
    if (!fieldId) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(fieldId);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (mode === "preview") {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 text-center">
        <div
          className="w-16 h-16 rounded-full mb-5 flex items-center justify-center text-[24px]"
          style={{ background: "#EDF1E8", color: "#3A4D2C" }}
        >
          ✦
        </div>
        <h3 className="text-[1.05rem] font-semibold text-[#1C1C1A] mb-2">
          Selecione um produto
        </h3>
        <p className="text-[13px] text-[#7A716A] leading-relaxed">
          Clique em qualquer produto da lista para editar, ou crie um novo.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header fixo */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-[#E5E0D8] shrink-0">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.12em] uppercase text-[#9A9189] mb-1">
            {mode === "create" ? "Criar produto" : "Editar produto"}
          </p>
          <h3 className="text-[1.05rem] font-semibold text-[#1C1C1A] leading-tight truncate">
            {mode === "create" ? "Novo produto" : product?.name || "Editar produto"}
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="w-7 h-7 flex items-center justify-center text-[#9A9189] hover:text-[#1C1C1A] hover:bg-[#F0EDE8] rounded-full transition-colors shrink-0 text-[20px] leading-none"
          aria-label="Fechar editor"
        >
          ×
        </button>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-0 px-5 border-b border-[#E5E0D8] shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`h-10 px-3 text-[12px] border-b-[2px] -mb-px transition-colors ${
              activeTab === tab.id
                ? "border-[#3A4D2C] text-[#3A4D2C] font-medium"
                : "border-transparent text-[#7A716A] hover:text-[#1C1C1A]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Corpo rolável */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5">
        {submitError && (
          <div className="mb-4 border border-[#E0C8C8] bg-[#FBF2F2] text-[#8A3A3A] px-3 py-2.5 text-[12px] rounded-[3px]">
            {submitError}
          </div>
        )}
        <ProductForm
          id={FORM_ID}
          key={mode === "create" ? "create" : product?.id || "edit"}
          initialData={product || undefined}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitLabel={mode === "create" ? "Criar Produto" : "Salvar Alterações"}
          onCancel={onCancel}
          error={null}
          hideActions
        />
      </div>

      {/* Footer fixo */}
      <div className="flex items-center gap-3 px-5 py-4 border-t border-[#E5E0D8] bg-[#FAF7F2] shrink-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 h-9 border border-[#D5CFC8] text-[12px] text-[#5F5751] hover:text-[#1C1C1A] hover:border-[#9A9189] disabled:opacity-50 transition-colors rounded-[4px]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form={FORM_ID}
          disabled={isSubmitting}
          className="flex-1 h-9 text-[12px] font-medium text-white disabled:opacity-60 transition-opacity rounded-[4px]"
          style={{ background: "#2A3D20" }}
        >
          {isSubmitting ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}
