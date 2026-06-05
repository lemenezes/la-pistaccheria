import { useEffect, useState } from "react";
import ProductForm, { type ProductFormValues } from "../../pages/admin/ProductForm";
import type { DatabaseProduct } from "../../types/database";

interface ProductEditModalProps {
  mode: "create" | "edit";
  product: DatabaseProduct | null;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onClose: () => void;
}

type ModalTab = "geral" | "seo";

const TABS: Array<{ id: ModalTab; label: string; fieldId: string }> = [
  { id: "geral", label: "Geral", fieldId: "pf-name" },
  { id: "seo", label: "SEO", fieldId: "pf-meta_title" },
];

const FORM_ID = "modal-product-form";

export default function ProductEditModal({
  mode,
  product,
  isSubmitting,
  submitError,
  onSubmit,
  onClose,
}: ProductEditModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("geral");

  // Fechar com Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSubmitting, onClose]);

  // Bloquear scroll do body enquanto modal está aberto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleTabChange(tab: ModalTab) {
    setActiveTab(tab);
    const fieldId = TABS.find((t) => t.id === tab)?.fieldId;
    if (!fieldId) return;
    requestAnimationFrame(() => {
      document.getElementById(fieldId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ background: "rgba(28,28,26,0.55)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}
    >
      {/* Modal */}
      <div
        className="relative w-full flex flex-col bg-white rounded-[8px] shadow-2xl"
        style={{ maxWidth: 720, maxHeight: "calc(100vh - 64px)" }}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "create" ? "Novo produto" : "Editar produto"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-[#ECEAE5] shrink-0">
          <div>
            <p className="text-[10px] tracking-[0.14em] uppercase text-[#9A9189] mb-1">
              {mode === "create" ? "Criar produto" : "Editar produto"}
            </p>
            <h2 className="text-[1.2rem] font-semibold text-[#1C1C1A] leading-tight">
              {mode === "create" ? "Novo produto" : product?.name || "Editar produto"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 flex items-center justify-center text-[#9A9189] hover:text-[#1C1C1A] hover:bg-[#F4F2EE] rounded-full transition-colors disabled:opacity-40 text-[22px] leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-0 px-7 border-b border-[#ECEAE5] shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`h-11 px-4 text-[13px] border-b-[2px] -mb-px transition-colors ${
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
        <div className="flex-1 min-h-0 overflow-y-auto px-7 py-6">
          {submitError && (
            <div className="mb-5 border border-[#E0C8C8] bg-[#FBF2F2] text-[#8A3A3A] px-4 py-3 text-[13px] rounded-[5px]">
              {submitError}
            </div>
          )}
          <ProductForm
            id={FORM_ID}
            key={mode === "create" ? "create" : product?.id || "edit"}
            initialData={product || undefined}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitLabel={mode === "create" ? "Criar produto" : "Salvar alterações"}
            onCancel={onClose}
            error={null}
            hideActions
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-7 py-4 border-t border-[#ECEAE5] bg-[#FAFAF8] rounded-b-[8px] shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 px-5 border border-[#D5CFC8] text-[13px] text-[#5F5751] hover:text-[#1C1C1A] hover:border-[#9A9189] disabled:opacity-50 transition-colors rounded-[5px]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            className="h-10 px-6 text-[13px] font-medium text-white disabled:opacity-60 transition-opacity rounded-[5px]"
            style={{ background: "#2A3D20" }}
          >
            {isSubmitting ? "Salvando…" : mode === "create" ? "Criar produto" : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
