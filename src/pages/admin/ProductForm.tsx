import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { DatabaseCategory, DatabaseProduct } from "../../types/database";
import {
  getMediaAssets,
  uploadMediaAsset,
  type MediaAsset
} from "../../services/mediaService";

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

type ProductFormErrors = {
  name: string;
  slug: string;
  category: string;
  price: string;
  short_description: string;
  description: string;
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
  categories
}: ProductFormProps) {
  const initialCategory = initialData?.category ?? "";
  const resolvedCategoryByName = categories.find(
    category => category.name.toLowerCase() === initialCategory.toLowerCase()
  );
  const initialCategoryId =
    initialData?.category_id ?? resolvedCategoryByName?.id ?? "";
  const hasCategoryMatch = categories.some(
    category =>
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
    display_order:
      initialData?.display_order != null
        ? String(initialData.display_order)
        : "0",
    meta_title: initialData?.meta_title ?? "",
    meta_description: initialData?.meta_description ?? "",
    gallery_urls: Array.isArray(initialData?.gallery_urls)
      ? initialData.gallery_urls.join("\n")
      : ""
  });

  const [slugTouched, setSlugTouched] = useState(!!initialData?.slug);
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({
    name: "",
    slug: "",
    category: "",
    price: "",
    short_description: "",
    description: ""
  });
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nameFieldRef = useRef<HTMLInputElement | null>(null);
  const slugFieldRef = useRef<HTMLInputElement | null>(null);
  const categoryFieldRef = useRef<HTMLSelectElement | null>(null);
  const priceFieldRef = useRef<HTMLInputElement | null>(null);
  const shortDescriptionFieldRef = useRef<HTMLTextAreaElement | null>(null);
  const descriptionFieldRef = useRef<HTMLTextAreaElement | null>(null);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    const trimmedName = name.trim();

    if (trimmedName.length > 0) {
      setFormErrors(prev => ({ ...prev, name: "", slug: prev.slug }));
    }

    setForm(prev => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : generateSlug(name)
    }));
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugTouched(true);
    const slug = e.target.value;

    if (slug.trim().length > 0) {
      setFormErrors(prev => ({ ...prev, slug: "" }));
    }

    setForm(prev => ({ ...prev, slug: e.target.value }));
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      if (name === "short_description" && value.trim().length > 0) {
        setFormErrors(prev => ({ ...prev, short_description: "" }));
      }

      if (name === "description" && value.trim().length > 0) {
        setFormErrors(prev => ({ ...prev, description: "" }));
      }

      setForm(prev => ({ ...prev, [name]: value }));
    }
  }

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedValue = e.target.value;

    if (selectedValue.startsWith("legacy:")) {
      const legacyValue = selectedValue.replace("legacy:", "");

      setFormErrors(prev => ({ ...prev, category: "" }));
      setForm(prev => ({
        ...prev,
        category_id: "",
        category: legacyValue
      }));
      return;
    }

    const selectedCategory = categories.find(
      category => category.id === selectedValue
    );

    if (selectedValue.length > 0) {
      setFormErrors(prev => ({ ...prev, category: "" }));
    }

    setForm(prev => ({
      ...prev,
      category_id: selectedValue,
      category: selectedCategory?.name ?? prev.category
    }));
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    if (value.trim().length > 0 && Number(value) > 0) {
      setFormErrors(prev => ({ ...prev, price: "" }));
    }

    setForm(prev => ({ ...prev, price: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedCategoryId = form.category_id.trim();
    const trimmedCategory = form.category.trim();
    const trimmedPrice = form.price.trim();
    const trimmedShortDescription = form.short_description.trim();
    const trimmedDescription = form.description.trim();
    const parsedPrice = Number(trimmedPrice);

    const nextErrors: ProductFormErrors = {
      name: trimmedName.length > 0 ? "" : "Informe o nome do produto.",
      slug: form.slug.trim().length > 0 ? "" : "Informe o slug do produto.",
      category:
        trimmedCategoryId.length > 0 || trimmedCategory.length > 0
          ? ""
          : "Selecione uma categoria.",
      price:
        trimmedPrice.length > 0 && Number.isFinite(parsedPrice) && parsedPrice > 0
          ? ""
          : "Informe um preço maior que zero."
      ,
      short_description:
        trimmedShortDescription.length > 0
          ? ""
          : "Informe a descrição curta do produto.",
      description:
        trimmedDescription.length > 0
          ? ""
          : "Informe a descrição completa do produto."
    };

    setFormErrors(nextErrors);

    const firstInvalidField =
      (nextErrors.name && "name") ||
      (nextErrors.slug && "slug") ||
      (nextErrors.category && "category") ||
      (nextErrors.price && "price") ||
      (nextErrors.short_description && "short_description") ||
      (nextErrors.description && "description") ||
      null;

    if (firstInvalidField) {
      window.requestAnimationFrame(() => {
        const fieldMap = {
          name: nameFieldRef,
          slug: slugFieldRef,
          category: categoryFieldRef,
          price: priceFieldRef,
          short_description: shortDescriptionFieldRef,
          description: descriptionFieldRef
        } as const;

        const field = fieldMap[firstInvalidField].current;

        field?.scrollIntoView({ behavior: "smooth", block: "center" });
        field?.focus({ preventScroll: true });
      });

      return;
    }

    await onSubmit({
      ...form,
      name: trimmedName,
      price: trimmedPrice,
    });
  }

  const handleOpenMediaModal = useCallback(async () => {
    setIsMediaModalOpen(true);
    setIsLoadingMedia(true);
    setMediaError(null);

    const { data, error: queryError } = await getMediaAssets();

    if (queryError) {
      setMediaAssets([]);
      setMediaError(
        queryError.message || "Erro ao carregar a biblioteca de mídia."
      );
      setIsLoadingMedia(false);
      return;
    }

    setMediaAssets((data ?? []) as MediaAsset[]);
    setIsLoadingMedia(false);
  }, []);

  const handleSelectMediaAsset = useCallback((asset: MediaAsset) => {
    setForm(prev => ({
      ...prev,
      image_url: asset.public_url
    }));
    setIsMediaModalOpen(false);
  }, []);

  const handleClearSelectedImage = useCallback(() => {
    setForm(prev => ({
      ...prev,
      image_url: ""
    }));
  }, []);

  const handleUploadImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleUploadImageChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (!file) {
        return;
      }

      try {
        setIsUploadingImage(true);
        const uploadedAsset = await uploadMediaAsset(file, "products");
        setForm(prev => ({
          ...prev,
          image_url: uploadedAsset.public_url
        }));
        toast.success("Imagem enviada com sucesso.");
      } catch (uploadError) {
        toast.error(
          uploadError instanceof Error
            ? uploadError.message
            : "Erro ao enviar imagem."
        );
      } finally {
        setIsUploadingImage(false);
      }
    },
    []
  );

  return (
    <form id={id} onSubmit={handleSubmit} noValidate>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={event => void handleUploadImageChange(event)}
      />

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
            ref={nameFieldRef}
            id="pf-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleNameChange}
            required
            autoComplete="off"
            aria-invalid={!!formErrors.name}
            className={`${inputClass} ${formErrors.name ? "border-[#C98B8B] focus:border-[#A45858] focus:ring-[#A45858]/20" : ""}`}
          />
          {formErrors.name && (
            <p className="mt-1.5 text-[11px] font-semibold text-[#A63A3A]">
              {formErrors.name}
            </p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="pf-slug" className={labelClass}>
            Slug <span className="text-[#8A3A3A]">*</span>
          </label>
          <input
            ref={slugFieldRef}
            id="pf-slug"
            name="slug"
            type="text"
            value={form.slug}
            onChange={handleSlugChange}
            required
            autoComplete="off"
            aria-invalid={!!formErrors.slug}
            className={`${inputClass} ${formErrors.slug ? "border-[#C98B8B] focus:border-[#A45858] focus:ring-[#A45858]/20" : ""}`}
          />
          {formErrors.slug && (
            <p className="mt-1.5 text-[11px] font-semibold text-[#A63A3A]">
              {formErrors.slug}
            </p>
          )}
        </div>

        {/* Categoria */}
        <div>
          <label htmlFor="pf-category" className={labelClass}>
            Categoria <span className="text-[#8A3A3A]">*</span>
          </label>
          <select
            ref={categoryFieldRef}
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
            aria-invalid={!!formErrors.category}
            className={`${inputClass} ${formErrors.category ? "border-[#C98B8B] focus:border-[#A45858] focus:ring-[#A45858]/20" : ""}`}>
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
                {!category.active ? " (inativa)" : ""}
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
              Categoria legada sem correspondencia ativa. Salve para manter
              compatibilidade temporaria.
            </p>
          )}
          {formErrors.category && (
            <p className="mt-1.5 text-[11px] font-semibold text-[#A63A3A]">
              {formErrors.category}
            </p>
          )}
          {form.category_id &&
            categories.find(c => c.id === form.category_id)?.active ===
              false && (
              <p className="text-[10px] text-[#9A5A20] mt-1">
                Esta categoria está inativa. Este produto não aparece no site
                público.
              </p>
            )}
        </div>

        {/* Preço */}
        <div>
          <label htmlFor="pf-price" className={labelClass}>
            Preço (R$) <span className="text-[#8A3A3A]">*</span>
          </label>
          <input
            ref={priceFieldRef}
            id="pf-price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handlePriceChange}
            required
            aria-invalid={!!formErrors.price}
            className={`${inputClass} ${formErrors.price ? "border-[#C98B8B] focus:border-[#A45858] focus:ring-[#A45858]/20" : ""}`}
          />
          {formErrors.price && (
            <p className="mt-1.5 text-[11px] font-semibold text-[#A63A3A]">
              {formErrors.price}
            </p>
          )}
        </div>

        {/* Imagem principal */}
        <div>
          <label className={labelClass}>Imagem principal</label>
          <input type="hidden" name="image_url" value={form.image_url} />
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleUploadImageClick}
              disabled={isUploadingImage}
              className="inline-flex h-12 items-center justify-center rounded-[5px] border border-[#DDD8D0] bg-white px-4 text-[12px] font-medium text-[#2A3D20] transition-colors hover:bg-[#F5F1EA]">
              {isUploadingImage ? "Enviando imagem..." : "Enviar imagem"}
            </button>
            <button
              type="button"
              onClick={() => void handleOpenMediaModal()}
              className="inline-flex h-12 items-center justify-center rounded-[5px] border border-[#DDD8D0] bg-white px-4 text-[12px] font-medium text-[#5F5751] transition-colors hover:bg-[#F5F1EA]">
              Selecionar da Biblioteca
            </button>
            {form.image_url ? (
              <button
                type="button"
                onClick={handleClearSelectedImage}
                className="inline-flex h-12 items-center justify-center rounded-[5px] border border-[#E0C8C8] bg-[#FBF2F2] px-4 text-[12px] font-medium text-[#8A3A3A] transition-colors hover:bg-[#F8E7E7]">
                Remover
              </button>
            ) : null}
          </div>
          {form.image_url ? (
            <p className="mt-2 break-all text-[11px] text-[#7A716A]">
              {form.image_url}
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-[#9A9189]">
              Nenhuma imagem selecionada.
            </p>
          )}
          {form.image_url && (
            <div
              className="mt-3 border border-[#E5E0D8] bg-[#F7F5F2] p-2 rounded-[5px] overflow-hidden"
              style={{ maxWidth: 160 }}>
              <img
                src={form.image_url}
                alt="Preview"
                className="w-full h-auto object-cover rounded-[3px]"
                onError={e => {
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
            ref={shortDescriptionFieldRef}
            id="pf-short_description"
            name="short_description"
            value={form.short_description}
            onChange={handleChange}
            required
            rows={2}
            aria-invalid={!!formErrors.short_description}
            className={`${textareaClass} ${formErrors.short_description ? "border-[#C98B8B] focus:border-[#A45858] focus:ring-[#A45858]/20" : ""}`}
          />
          {formErrors.short_description && (
            <p className="mt-1.5 text-[11px] font-semibold text-[#A63A3A]">
              {formErrors.short_description}
            </p>
          )}
        </div>

        {/* Descrição completa */}
        <div className="md:col-span-2">
          <label htmlFor="pf-description" className={labelClass}>
            Descrição Completa <span className="text-[#8A3A3A]">*</span>
          </label>
          <textarea
            ref={descriptionFieldRef}
            id="pf-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={5}
            aria-invalid={!!formErrors.description}
            className={`${textareaClass} ${formErrors.description ? "border-[#C98B8B] focus:border-[#A45858] focus:ring-[#A45858]/20" : ""}`}
          />
          {formErrors.description && (
            <p className="mt-1.5 text-[11px] font-semibold text-[#A63A3A]">
              {formErrors.description}
            </p>
          )}
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
            className="px-7 h-11 bg-charcoal text-cream text-[10px] tracking-[0.2em] uppercase hover:bg-charcoal/85 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isSubmitting ? "Salvando…" : submitLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 h-11 border border-cream-deep text-[10px] tracking-[0.2em] uppercase text-warm-gray hover:text-charcoal hover:border-charcoal/35 disabled:opacity-50 transition-colors">
            Cancelar
          </button>
        </div>
      )}

      {isMediaModalOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-[900px] rounded-[14px] border border-[#E2DBD2] bg-white shadow-[0_30px_80px_rgba(31,30,28,0.22)]">
            <div className="flex items-center justify-between border-b border-[#EEE8DF] px-5 py-4">
              <div>
                <h3 className="text-[1.1rem] font-semibold text-[#1C1C1A]">
                  Biblioteca de Mídia
                </h3>
                <p className="mt-1 text-[12px] text-[#7A716A]">
                  Selecione uma imagem para preencher a imagem principal do
                  produto.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-full border border-[#D7D0C4] bg-white px-4 text-[11px] font-medium uppercase tracking-[0.08em] text-[#5F5751] transition-colors hover:bg-[#F5F1EA]">
                Fechar
              </button>
            </div>

            <div className="max-h-[68vh] overflow-auto px-5 py-4">
              {isLoadingMedia ? (
                <div className="py-10 text-center text-[13px] text-[#7A716A]">
                  Carregando biblioteca...
                </div>
              ) : mediaError ? (
                <div className="rounded-[10px] border border-[#E0C8C8] bg-[#FBF2F2] px-4 py-3 text-[13px] text-[#8A3A3A]">
                  {mediaError}
                </div>
              ) : mediaAssets.length === 0 ? (
                <div className="py-10 text-center text-[13px] text-[#7A716A]">
                  Nenhuma imagem disponível.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {mediaAssets.map(asset => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handleSelectMediaAsset(asset)}
                      className="rounded-[10px] border border-[#E7E1D8] bg-[#FCFBF9] p-2 text-left transition-colors hover:border-[#CFC4B5]">
                      <div className="h-36 w-full overflow-hidden rounded-[8px] border border-[#E9E3DB] bg-[#F2EEE8]">
                        <img
                          src={asset.public_url}
                          alt={asset.file_name || "Imagem"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <p className="mt-2 truncate text-[12px] font-medium text-[#1C1C1A]">
                        {asset.file_name || "Arquivo sem nome"}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-[#7A716A]">
                        {asset.public_url}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
