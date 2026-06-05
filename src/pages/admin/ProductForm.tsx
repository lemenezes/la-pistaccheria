import { useState } from "react";
import type { DatabaseCategory, DatabaseProduct } from "../../types/database";

export type ProductFormValues = {
  name: string;
  slug: string;
  category_id: string;
  category: string;
  short_description: string;
  description: string;
  price: string;
  image_url: string;
  active: boolean;
  featured: boolean;
  display_order: string;
  meta_title: string;
  meta_description: string;
  gallery_urls: string;
};

interface ProductFormProps {
  id?: string;
  initialData?: Partial<DatabaseProduct>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
  error?: string | null;
  hideActions?: boolean;
  categories: DatabaseCategory[];
}

const inputClass =
  "w-full h-12 px-4 border border-[#DDD8D0] bg-white text-[13.5px] text-[#1C1C1A] placeholder:text-[#A09890] outline-none focus:border-[#4E6638] focus:ring-1 focus:ring-[#4E6638]/20 transition-colors rounded-[5px]";

const labelClass =
  "block text-[11px] font-medium tracking-[0.08em] uppercase text-[#5F5751] mb-1.5";

const textareaClass =
  "w-full px-4 py-3 border border-[#DDD8D0] bg-white text-[13.5px] text-[#1C1C1A] placeholder:text-[#A09890] outline-none focus:border-[#4E6638] focus:ring-1 focus:ring-[#4E6638]/20 transition-colors resize-none leading-relaxed rounded-[5px]";

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
  id,
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
  onCancel,
  error,
  hideActions,
  categories,
}: ProductFormProps) {
  const initialCategory = initialData?.category ?? "";
  const resolvedCategoryByName = categories.find(
    (category) => category.name.toLowerCase() === initialCategory.toLowerCase()
  );
  const initialCategoryId = initialData?.category_id ?? resolvedCategoryByName?.id ?? "";
  const hasCategoryMatch = categories.some(
    (category) =>
      category.id === initialCategoryId ||
      category.name.toLowerCase() === initialCategory.toLowerCase()
  );
  const legacyCategoryOption =
    initialCategory && !hasCategoryMatch ? initialCategory : "";

  const [form, setForm] = useState<ProductFormValues>({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    category_id: initialCategoryId,
    category: initialData?.category ?? "",
    short_description: initialData?.short_description ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price != null ? String(initialData.price) : "",
    image_url: initialData?.image_url ?? "",
    active: initialData?.active ?? true,
    featured: initialData?.featured ?? false,
    display_order: initialData?.display_order != null ? String(initialData.display_order) : "0",
    meta_title: initialData?.meta_title ?? "",
    meta_description: initialData?.meta_description ?? "",
    gallery_urls: Array.isArray(initialData?.gallery_urls) ? initialData.gallery_urls.join("\n") : "",
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedValue = e.target.value;

    if (selectedValue.startsWith("legacy:")) {
      const legacyValue = selectedValue.replace("legacy:", "");
      setForm((prev) => ({
        ...prev,
        category_id: "",
        category: legacyValue,
      }));
      return;
    }

    const selectedCategory = categories.find(
      (category) => category.id === selectedValue
    );

    setForm((prev) => ({
      ...prev,
      category_id: selectedValue,
      category: selectedCategory?.name ?? prev.category,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form id={id} onSubmit={handleSubmit} noValidate>
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
          <select
            id="pf-category"
            name="category_id"
            value={
              form.category_id
                ? form.category_id
                : legacyCategoryOption
                  ? `legacy:${legacyCategoryOption}`
                  : ""
            }
            onChange={handleCategoryChange}
            required
            className={inputClass}
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
            {legacyCategoryOption && (
              <option value={`legacy:${legacyCategoryOption}`}>
                Legado: {legacyCategoryOption}
              </option>
            )}
          </select>
          {legacyCategoryOption && !form.category_id && (
            <p className="text-[10px] text-[#8A3A3A] mt-1">
              Categoria legada sem correspondencia ativa. Salve para manter compatibilidade temporaria.
            </p>
          )}
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
            Imagem principal
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
          {form.image_url && (
            <div className="mt-3 border border-[#E5E0D8] bg-[#F7F5F2] p-2 rounded-[5px] overflow-hidden" style={{ maxWidth: 160 }}>
              <img
                src={form.image_url}
                alt="Preview"
                className="w-full h-auto object-cover rounded-[3px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
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

        {/* Meta Title */}
        <div className="md:col-span-2">
          <label htmlFor="pf-meta_title" className={labelClass}>
            Meta Title (SEO)
          </label>
          <input
            id="pf-meta_title"
            name="meta_title"
            type="text"
            value={form.meta_title}
            onChange={handleChange}
            autoComplete="off"
            placeholder="Título para mecanismos de busca (opcional)"
            className={inputClass}
          />
          <p className="text-[10px] text-warm-gray/60 mt-1">
            Máximo 60 caracteres
          </p>
        </div>

        {/* Meta Description */}
        <div className="md:col-span-2">
          <label htmlFor="pf-meta_description" className={labelClass}>
            Meta Description (SEO)
          </label>
          <textarea
            id="pf-meta_description"
            name="meta_description"
            value={form.meta_description}
            onChange={handleChange}
            rows={2}
            placeholder="Descrição para mecanismos de busca (opcional)"
            className={textareaClass}
          />
          <p className="text-[10px] text-warm-gray/60 mt-1">
            Máximo 160 caracteres
          </p>
        </div>

        {/* Display Order */}
        <div>
          <label htmlFor="pf-display_order" className={labelClass}>
            Ordem de Exibição
          </label>
          <input
            id="pf-display_order"
            name="display_order"
            type="number"
            value={form.display_order}
            onChange={handleChange}
            min="0"
            step="1"
            className={inputClass}
          />
          <p className="text-[10px] text-warm-gray/60 mt-1">
            Menor = primeiro na loja
          </p>
        </div>

        {/* Gallery URLs */}
        <div className="md:col-span-2">
          <label htmlFor="pf-gallery_urls" className={labelClass}>
            URLs da Galeria
          </label>
          <textarea
            id="pf-gallery_urls"
            name="gallery_urls"
            value={form.gallery_urls}
            onChange={handleChange}
            rows={3}
            placeholder="Uma URL por linha (opcional)"
            className={textareaClass}
          />
          <p className="text-[10px] text-warm-gray/60 mt-1">
            URLs públicas separadas por quebra de linha
          </p>
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
      {!hideActions && (
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
      )}
    </form>
  );
}
