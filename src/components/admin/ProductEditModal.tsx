import { useEffect, useState } from "react";
import ProductForm, {
  type ProductFormValues
} from "../../pages/admin/ProductForm";
import type { DatabaseCategory, DatabaseProduct } from "../../types/database";

interface ProductEditModalProps {
  mode: "create" | "edit";
  product: DatabaseProduct | null;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (values: ProductFormValues) => Promise<boolean>;
  onDelete: () => Promise<void>;
  onClose: () => void;
  categories: DatabaseCategory[];
}

const FORM_ID = "modal-product-form";

export default function ProductEditModal({
  mode,
  product,
  isSubmitting,
  submitError,
  onSubmit,
  onDelete,
  onClose,
  categories
}: ProductEditModalProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  useEffect(() => {
    setIsFormDirty(false);
    setIsDiscardConfirmOpen(false);
  }, [mode, product?.id]);

  // Escape fecha apenas a confirmação de exclusão, nunca o modal principal.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape" || isSubmitting) return;

      e.preventDefault();
      e.stopPropagation();

      if (isDeleteConfirmOpen) {
        setIsDeleteConfirmOpen(false);
        return;
      }

      if (isDiscardConfirmOpen) {
        setIsDiscardConfirmOpen(false);
        return;
      }

      if (isFormDirty) {
        setIsDiscardConfirmOpen(true);
        return;
      }

      onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [
    isDeleteConfirmOpen,
    isDiscardConfirmOpen,
    isFormDirty,
    isSubmitting,
    onClose
  ]);

  // Bloquear scroll do body enquanto modal está aberto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{
        background: "rgba(28,28,26,0.55)",
        backdropFilter: "blur(2px)"
      }}>
      {/* Modal */}
      <div
        className="relative w-full flex flex-col bg-white rounded-[8px] shadow-2xl"
        style={{ maxWidth: 720, maxHeight: "calc(100vh - 64px)" }}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "create" ? "Novo produto" : "Editar produto"}>
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-[#ECEAE5] shrink-0">
          <div>
            <p className="text-[10px] tracking-[0.14em] uppercase text-[#9A9189] mb-1">
              {mode === "create" ? "Criar produto" : "Editar produto"}
            </p>
            <h2 className="text-[1.2rem] font-semibold text-[#1C1C1A] leading-tight">
              {mode === "create"
                ? "Novo produto"
                : product?.name || "Editar produto"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 flex items-center justify-center text-[#9A9189] hover:text-[#1C1C1A] hover:bg-[#F4F2EE] rounded-full transition-colors disabled:opacity-40 text-[22px] leading-none"
            aria-label="Fechar">
            ×
          </button>
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
            submitLabel={
              mode === "create" ? "Criar produto" : "Salvar alterações"
            }
            onCancel={onClose}
            error={null}
            hideActions
            categories={categories}
            onDirtyChange={setIsFormDirty}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-7 py-4 border-t border-[#ECEAE5] bg-[#FAFAF8] rounded-b-[8px] shrink-0">
          {mode === "edit" && product ? (
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(true)}
              disabled={isSubmitting}
              className="h-10 px-5 border border-[#E0C8C8] text-[13px] text-[#8A3A3A] hover:bg-[#FBF2F2] disabled:opacity-50 transition-colors rounded-[5px]">
              Excluir produto
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 px-5 border border-[#D5CFC8] text-[13px] text-[#5F5751] hover:text-[#1C1C1A] hover:border-[#9A9189] disabled:opacity-50 transition-colors rounded-[5px]">
            Cancelar
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            className="h-10 px-6 text-[13px] font-medium text-white disabled:opacity-60 transition-opacity rounded-[5px]"
            style={{ background: "#2A3D20" }}>
            {isSubmitting
              ? "Salvando…"
              : mode === "create"
                ? "Criar produto"
                : "Salvar alterações"}
          </button>
        </div>

        {isDeleteConfirmOpen ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[rgba(28,28,26,0.55)] px-6">
            <div className="w-full max-w-[420px] rounded-[10px] border border-[#E5DED4] bg-white p-6 shadow-[0_20px_60px_rgba(31,30,28,0.20)]">
              <h3 className="text-[1.1rem] font-semibold text-[#1C1C1A]">
                Tem certeza que deseja excluir este produto?
              </h3>
              <p className="mt-2 text-[13px] text-[#5F5751] leading-relaxed">
                Esta ação não poderá ser desfeita.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  disabled={isSubmitting}
                  className="h-10 px-4 border border-[#D5CFC8] text-[12px] text-[#5F5751] hover:text-[#1C1C1A] hover:border-[#9A9189] disabled:opacity-50 transition-colors rounded-[5px]">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void onDelete()}
                  disabled={isSubmitting}
                  className="h-10 px-4 border border-[#C98B8B] bg-[#FBF2F2] text-[12px] font-medium text-[#8A3A3A] hover:bg-[#F8E7E7] disabled:opacity-50 transition-colors rounded-[5px]">
                  Confirmar exclusão
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isDiscardConfirmOpen ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[rgba(28,28,26,0.55)] px-6">
            <div className="w-full max-w-[420px] rounded-[10px] border border-[#E5DED4] bg-white p-6 shadow-[0_20px_60px_rgba(31,30,28,0.20)]">
              <h3 className="text-[1.1rem] font-semibold text-[#1C1C1A]">
                Descartar alterações?
              </h3>
              <p className="mt-2 text-[13px] text-[#5F5751] leading-relaxed">
                Você possui alterações não salvas.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDiscardConfirmOpen(false)}
                  disabled={isSubmitting}
                  className="h-10 px-4 border border-[#D5CFC8] text-[12px] text-[#5F5751] hover:text-[#1C1C1A] hover:border-[#9A9189] disabled:opacity-50 transition-colors rounded-[5px]">
                  Continuar editando
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="h-10 px-4 border border-[#C98B8B] bg-[#FBF2F2] text-[12px] font-medium text-[#8A3A3A] hover:bg-[#F8E7E7] disabled:opacity-50 transition-colors rounded-[5px]">
                  Descartar alterações
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
