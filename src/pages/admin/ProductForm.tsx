import { useState } from "react";
import type { DatabaseProduct } from "../../types/database";

export type ProductFormValues = {
  name: string;
  slug: string;
  category: string;
  short_description: string;
  description: string;
  price: string;
  image_url: string;
  active: boolean;
  featured: boolean;
};

interface ProductFormProps {
  initialData?: Partial<DatabaseProduct>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
  error?: string | null;
}

const inputClass =
  "w-full h-11 px-3 border border-cream-deep bg-cream text-[13px] text-charcoal placeholder:text-warm-gray/40 outline-none focus:border-charcoal/40 transition-colors";

const labelClass =
  "block text-[10px] tracking-[0.16em] uppercase text-warm-gray mb-2";

const textareaClass =
  "w-full px-3 py-2.5 border border-cream-deep bg-cream text-[13px] text-charcoal placeholder:text-warm-gray/40 outline-none focus:border-charcoal/40 transition-colors resize-none leading-relaxed";

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function ProductForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
  onCancel,
  error,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormValues>({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    category: initialData?.category ?? "",
    short_description: initialData?.short_description ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price != null ? String(initialData.price) : "",
    image_url: initialData?.image_url ?? "",
    active: initialData?.active ?? true,
    featured: initialData?.featured ?? false,
  });

  const [slugTouched, setSlugTouched] = useState(!!initialData?.slug);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : generateSlug(name),
    }));
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="mb-6 border border-[#E0C8C8] bg-[#FBF2F2] text-[#8A3A3A] px-4 py-3 text-[13px]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        {/* Nome */}
        <div className="md:col-span-2">
          <label htmlFor="pf-name" className={labelClass}>
            Nome <span className="text-[#8A3A3A]">*</span>
          </label>
          <input
            id="pf-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleNameChange}
            required
            autoComplete="off"
            className={inputClass}
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="pf-slug" className={labelClass}>
            Slug <span className="text-[#8A3A3A]">*</span>
          </label>
          <input
            id="pf-slug"
            name="slug"
            type="text"
            value={form.slug}
            onChange={handleSlugChange}
            required
            autoComplete="off"
            className={inputClass}
          />
        </div>

        {/* Categoria */}
        <div>
          <label htmlFor="pf-category" className={labelClass}>
            Categoria <span className="text-[#8A3A3A]">*</span>
          </label>
          <input
            id="pf-category"
            name="category"
            type="text"
            value={form.category}
            onChange={handleChange}
            required
            autoComplete="off"
            className={inputClass}
          />
        </div>

        {/* Preço */}
        <div>
          <label htmlFor="pf-price" className={labelClass}>
            Preço (R$) <span className="text-[#8A3A3A]">*</span>
          </label>
          <input
            id="pf-price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        {/* URL da imagem */}
        <div>
          <label htmlFor="pf-image_url" className={labelClass}>
            URL da Imagem
          </label>
          <input
            id="pf-image_url"
            name="image_url"
            type="url"
            value={form.image_url}
            onChange={handleChange}
            autoComplete="off"
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        {/* Descrição curta */}
        <div className="md:col-span-2">
          <label htmlFor="pf-short_description" className={labelClass}>
            Descrição Curta <span className="text-[#8A3A3A]">*</span>
          </label>
          <textarea
            id="pf-short_description"
            name="short_description"
            value={form.short_description}
            onChange={handleChange}
            required
            rows={2}
            className={textareaClass}
          />
        </div>

        {/* Descrição completa */}
        <div className="md:col-span-2">
          <label htmlFor="pf-description" className={labelClass}>
            Descrição Completa <span className="text-[#8A3A3A]">*</span>
          </label>
          <textarea
            id="pf-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={5}
            className={textareaClass}
          />
        </div>

        {/* Checkboxes */}
        <div className="md:col-span-2 flex gap-8 pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="w-4 h-4 border border-cream-deep accent-pistachio"
            />
            <span className="text-[11px] tracking-[0.12em] uppercase text-warm-gray">
              Ativo
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
              className="w-4 h-4 border border-cream-deep accent-pistachio"
            />
            <span className="text-[11px] tracking-[0.12em] uppercase text-warm-gray">
              Destaque
            </span>
          </label>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-cream-deep">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-7 h-11 bg-charcoal text-cream text-[10px] tracking-[0.2em] uppercase hover:bg-charcoal/85 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Salvando…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 h-11 border border-cream-deep text-[10px] tracking-[0.2em] uppercase text-warm-gray hover:text-charcoal hover:border-charcoal/35 disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
