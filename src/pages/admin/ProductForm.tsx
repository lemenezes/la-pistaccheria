import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { DatabaseCategory, DatabaseProduct } from "../../types/database";
import {
  deleteUploadedMediaAsset,
  isDeleteUploadedMediaAssetSuccessful,
  uploadMediaAsset
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
  category: string;
  price: string;
  short_description: string;
  description: string;
};

interface ProductFormProps {
  id?: string;
  initialData?: Partial<DatabaseProduct>;
  onSubmit: (values: ProductFormValues) => Promise<boolean>;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
  error?: string | null;
  hideActions?: boolean;
  categories: DatabaseCategory[];
  onDirtyChange?: (isDirty: boolean) => void;
}

const inputClass =
  "w-full h-12 px-4 border border-[#DDD8D0] bg-white text-[13.5px] text-[#1C1C1A] placeholder:text-[#A09890] outline-none focus:border-[#4E6638] focus:ring-1 focus:ring-[#4E6638]/20 transition-colors rounded-[5px]";

const labelClass =
  "block text-[11px] font-medium tracking-[0.08em] uppercase text-[#5F5751] mb-1.5";

const textareaClass =
  "w-full px-4 py-3 border border-[#DDD8D0] bg-white text-[13.5px] text-[#1C1C1A] placeholder:text-[#A09890] outline-none focus:border-[#4E6638] focus:ring-1 focus:ring-[#4E6638]/20 transition-colors resize-none leading-relaxed rounded-[5px]";

const MAX_PRODUCT_IMAGES = 5;

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function generateMetaTitle(value: string) {
  const cleanedValue = value.trim();
  return cleanedValue ? `${cleanedValue} | La Pistaccheria` : "";
}

function generateMetaDescription(
  name: string,
  shortDescription: string,
  description: string
) {
  const source = shortDescription.trim() || description.trim() || name.trim();
  return source.slice(0, 160);
}

function parseGalleryUrls(rawValue: string) {
  return rawValue
    .split("\n")
    .map(value => value.trim())
    .filter(Boolean);
}

function parseProductImages(imageUrl: string, galleryUrls: string) {
  const images = [imageUrl.trim(), ...parseGalleryUrls(galleryUrls)].filter(
    Boolean
  );
  return Array.from(new Set(images));
}

function normalizePriceInput(rawValue: string) {
  const trimmedValue = rawValue.trim();

  if (!trimmedValue) {
    return "";
  }

  if (trimmedValue.includes(",")) {
    return trimmedValue.replace(/\./g, "").replace(",", ".");
  }

  return trimmedValue;
}

function parseNormalizedPrice(rawValue: string) {
  const normalizedValue = normalizePriceInput(rawValue);

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return parsedValue;
}

function formatPriceForPtBrInput(rawValue: string) {
  const parsedValue = parseNormalizedPrice(rawValue);

  if (parsedValue == null || parsedValue <= 0) {
    return rawValue.trim();
  }

  return parsedValue.toFixed(2).replace(".", ",");
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
  onDirtyChange
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
  const initialGalleryUrlsText = Array.isArray(initialData?.gallery_urls)
    ? initialData.gallery_urls.join("\n")
    : "";
  const initialProductImages = parseProductImages(
    initialData?.image_url ?? "",
    initialGalleryUrlsText
  );

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
    gallery_urls: initialGalleryUrlsText
  });

  const [formErrors, setFormErrors] = useState<ProductFormErrors>({
    name: "",
    category: "",
    price: "",
    short_description: "",
    description: ""
  });
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [productImages, setProductImages] =
    useState<string[]>(initialProductImages);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string>(() => {
    const initialImages = initialProductImages;

    if (
      initialData?.image_url &&
      initialImages.includes(initialData.image_url)
    ) {
      return initialData.image_url;
    }

    return initialImages[0] ?? "";
  });
  const originalProductImagesRef = useRef<string[]>(initialProductImages);
  const initialFormSnapshotRef = useRef<string>("");
  const lastDirtyStateRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nameFieldRef = useRef<HTMLInputElement | null>(null);
  const categoryFieldRef = useRef<HTMLSelectElement | null>(null);
  const priceFieldRef = useRef<HTMLInputElement | null>(null);
  const shortDescriptionFieldRef = useRef<HTMLTextAreaElement | null>(null);
  const descriptionFieldRef = useRef<HTMLTextAreaElement | null>(null);
  const isEditMode = Boolean(initialData?.id);
  const currentSlug = generateSlug(form.name.trim()) || form.slug.trim();
  const publicProductLink = currentSlug
    ? `https://lapistaccheria.leandrom.com.br/produtos/${currentSlug}`
    : "";
  const safeCoverImageUrl =
    coverImageUrl && productImages.includes(coverImageUrl)
      ? coverImageUrl
      : (productImages[0] ?? "");
  const hasMultipleImages = productImages.length > 1;
  const effectiveLightboxIndex = lightboxIndex ?? 0;
  const clampedLightboxIndex = Math.min(
    Math.max(effectiveLightboxIndex, 0),
    Math.max(productImages.length - 1, 0)
  );
  const currentLightboxImage = productImages[clampedLightboxIndex] ?? "";

  const buildFormSnapshot = useCallback(
    (values: ProductFormValues, images: string[], currentCover: string) => {
      const safeCurrentCover =
        currentCover && images.includes(currentCover)
          ? currentCover
          : (images[0] ?? "");

      return JSON.stringify({
        name: values.name,
        slug: values.slug,
        category_id: values.category_id,
        category: values.category,
        short_description: values.short_description,
        description: values.description,
        price: values.price,
        image_url: safeCurrentCover,
        active: values.active,
        featured: values.featured,
        display_order: values.display_order,
        meta_title: values.meta_title,
        meta_description: values.meta_description,
        gallery_urls: images.filter(url => url !== safeCurrentCover)
      });
    },
    []
  );

  useEffect(() => {
    if (initialFormSnapshotRef.current) {
      return;
    }

    initialFormSnapshotRef.current = buildFormSnapshot(
      form,
      initialProductImages,
      coverImageUrl
    );
  }, [buildFormSnapshot, coverImageUrl, form, initialProductImages]);

  useEffect(() => {
    if (!onDirtyChange || !initialFormSnapshotRef.current) {
      return;
    }

    const currentSnapshot = buildFormSnapshot(
      form,
      productImages,
      coverImageUrl
    );
    const isDirty = currentSnapshot !== initialFormSnapshotRef.current;

    if (lastDirtyStateRef.current === isDirty) {
      return;
    }

    lastDirtyStateRef.current = isDirty;
    onDirtyChange(isDirty);
  }, [buildFormSnapshot, coverImageUrl, form, onDirtyChange, productImages]);

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        setLightboxIndex(null);
        setIsLightboxOpen(false);
        return;
      }

      if (!hasMultipleImages) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        setLightboxIndex(current =>
          (current ?? 0) <= 0 ? productImages.length - 1 : (current ?? 0) - 1
        );
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        setLightboxIndex(current =>
          (current ?? 0) >= productImages.length - 1 ? 0 : (current ?? 0) + 1
        );
      }
    }

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [hasMultipleImages, isLightboxOpen, productImages.length]);

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    if (productImages.length === 0) {
      setLightboxIndex(null);
      setIsLightboxOpen(false);
      return;
    }

    if (lightboxIndex == null) {
      setLightboxIndex(0);
      return;
    }

    if (lightboxIndex > productImages.length - 1) {
      setLightboxIndex(productImages.length - 1);
    }
  }, [isLightboxOpen, lightboxIndex, productImages]);

  const cleanupRemovedImages = useCallback(
    async (removedImageUrls: string[], excludeProductId?: string) => {
      const results = await Promise.allSettled(
        removedImageUrls.map(publicUrl =>
          deleteUploadedMediaAsset({
            publicUrl,
            excludeProductId
          })
        )
      );

      const hasUnexpectedError = results.some(result => {
        if (result.status === "rejected") {
          return true;
        }

        return !isDeleteUploadedMediaAssetSuccessful(result.value);
      });

      if (hasUnexpectedError) {
        toast.warning(
          "Produto salvo, mas não foi possível remover uma imagem antiga do armazenamento."
        );
      }
    },
    []
  );

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    const trimmedName = name.trim();

    if (trimmedName.length > 0) {
      setFormErrors(prev => ({ ...prev, name: "" }));
    }

    setForm(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
      meta_title: generateMetaTitle(name),
      meta_description: generateMetaDescription(
        name,
        prev.short_description,
        prev.description
      )
    }));
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

      setForm(prev => ({
        ...prev,
        [name]: value,
        meta_description:
          name === "short_description"
            ? generateMetaDescription(prev.name, value, prev.description)
            : name === "description"
              ? generateMetaDescription(
                  prev.name,
                  prev.short_description,
                  value
                )
              : prev.meta_description
      }));
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
    const parsedValue = parseNormalizedPrice(value);

    if (parsedValue != null && parsedValue > 0) {
      setFormErrors(prev => ({ ...prev, price: "" }));
    }

    setForm(prev => ({ ...prev, price: value }));
  }

  function handlePriceBlur() {
    setForm(prev => ({
      ...prev,
      price: formatPriceForPtBrInput(prev.price)
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedCategoryId = form.category_id.trim();
    const trimmedCategory = form.category.trim();
    const trimmedPrice = form.price.trim();
    const normalizedPrice = normalizePriceInput(trimmedPrice);
    const trimmedShortDescription = form.short_description.trim();
    const trimmedDescription = form.description.trim();
    const parsedPrice = parseNormalizedPrice(normalizedPrice);

    const nextErrors: ProductFormErrors = {
      name: trimmedName.length > 0 ? "" : "Informe o nome do produto.",
      category:
        trimmedCategoryId.length > 0 || trimmedCategory.length > 0
          ? ""
          : "Selecione uma categoria.",
      price:
        normalizedPrice.length > 0 && parsedPrice != null && parsedPrice > 0
          ? ""
          : "Informe um preço maior que zero.",
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
      (nextErrors.category && "category") ||
      (nextErrors.price && "price") ||
      (nextErrors.short_description && "short_description") ||
      (nextErrors.description && "description") ||
      null;

    if (firstInvalidField) {
      window.requestAnimationFrame(() => {
        const fieldMap = {
          name: nameFieldRef,
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

    const nextSlug = generateSlug(trimmedName);
    const nextMetaTitle = generateMetaTitle(trimmedName);
    const nextMetaDescription = generateMetaDescription(
      trimmedName,
      trimmedShortDescription,
      trimmedDescription
    );

    const finalProductImages = [
      safeCoverImageUrl,
      ...productImages.filter(url => url !== safeCoverImageUrl)
    ].filter(Boolean);

    const saveSucceeded = await onSubmit({
      ...form,
      name: trimmedName,
      slug: nextSlug,
      price: (parsedPrice ?? 0).toFixed(2),
      image_url: safeCoverImageUrl,
      gallery_urls: finalProductImages.slice(1).join("\n"),
      meta_title: nextMetaTitle,
      meta_description: nextMetaDescription
    });

    if (!saveSucceeded) {
      return;
    }

    const removedImages = originalProductImagesRef.current.filter(
      originalUrl => !finalProductImages.includes(originalUrl)
    );

    originalProductImagesRef.current = finalProductImages;

    if (removedImages.length > 0) {
      void cleanupRemovedImages(
        removedImages,
        typeof initialData?.id === "string" ? initialData.id : undefined
      );
    }
  }

  const handleRemoveImageAt = useCallback((indexToRemove: number) => {
    setProductImages(prev => {
      const nextImages = prev.filter((_, index) => index !== indexToRemove);

      setCoverImageUrl(currentCover => {
        if (currentCover && nextImages.includes(currentCover)) {
          return currentCover;
        }

        return nextImages[0] ?? "";
      });

      return nextImages;
    });
  }, []);

  const handleSetPrimaryImage = useCallback(
    (indexToPromote: number) => {
      if (indexToPromote <= 0) {
        return;
      }

      const selectedImage = productImages[indexToPromote];

      if (!selectedImage) {
        return;
      }

      setCoverImageUrl(selectedImage);
    },
    [productImages]
  );

  const handleUploadImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleOpenImageLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const handleCloseImageLightbox = useCallback(() => {
    setLightboxIndex(null);
    setIsLightboxOpen(false);
  }, []);

  const handleShowPreviousImage = useCallback(() => {
    if (productImages.length === 0) {
      return;
    }

    setLightboxIndex(current => {
      const safeCurrent = current ?? 0;
      return safeCurrent <= 0 ? productImages.length - 1 : safeCurrent - 1;
    });
  }, [productImages.length]);

  const handleShowNextImage = useCallback(() => {
    if (productImages.length === 0) {
      return;
    }

    setLightboxIndex(current => {
      const safeCurrent = current ?? 0;
      return safeCurrent >= productImages.length - 1 ? 0 : safeCurrent + 1;
    });
  }, [productImages.length]);

  const handleUploadImagesChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = "";

      if (files.length === 0) {
        return;
      }

      const currentImages = productImages;

      if (currentImages.length >= MAX_PRODUCT_IMAGES) {
        toast.error(
          "Você já anexou 5 imagens. Remova uma para adicionar outra."
        );
        return;
      }

      const availableSlots = MAX_PRODUCT_IMAGES - currentImages.length;
      const filesToUpload = files.slice(0, availableSlots);

      if (files.length > availableSlots) {
        toast.info(
          "Só foi possível enviar parte dos arquivos. Limite de 5 imagens por produto."
        );
      }

      try {
        setIsUploadingImages(true);
        const uploadedAssets = await Promise.all(
          filesToUpload.map(file => uploadMediaAsset(file, "products"))
        );

        const uploadedUrls = uploadedAssets.map(asset => asset.public_url);

        setProductImages(prev => {
          const nextImages = Array.from(
            new Set([...prev, ...uploadedUrls])
          ).slice(0, MAX_PRODUCT_IMAGES);

          setCoverImageUrl(currentCover => currentCover || nextImages[0] || "");

          return nextImages;
        });
        toast.success("Imagem(ns) enviada(s) com sucesso.");
      } catch (uploadError) {
        toast.error(
          uploadError instanceof Error
            ? uploadError.message
            : "Erro ao enviar imagens."
        );
      } finally {
        setIsUploadingImages(false);
      }
    },
    [productImages]
  );

  const handleCopyPublicLink = useCallback(async () => {
    if (!publicProductLink) {
      toast.error("Preencha o nome para gerar o link do produto.");
      return;
    }

    try {
      await navigator.clipboard.writeText(publicProductLink);
      toast.success("Link do produto copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }, [publicProductLink]);

  return (
    <form id={id} onSubmit={handleSubmit} noValidate>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={event => void handleUploadImagesChange(event)}
      />

      {error && (
        <div className="mb-6 border border-[#E0C8C8] bg-[#FBF2F2] px-4 py-3 text-[13px] font-semibold text-[#A63A3A]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
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
            <p className="mt-1 text-[10px] text-[#8A3A3A]">
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
              <p className="mt-1 text-[10px] text-[#9A5A20]">
                Esta categoria está inativa. Este produto não aparece no site
                público.
              </p>
            )}
        </div>

        <div>
          <label htmlFor="pf-price" className={labelClass}>
            Preço (R$) <span className="text-[#8A3A3A]">*</span>
          </label>
          <input
            ref={priceFieldRef}
            id="pf-price"
            name="price"
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={handlePriceChange}
            onBlur={handlePriceBlur}
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

        <div className="md:col-span-2">
          <label className={labelClass}>Imagens do produto</label>
          <input type="hidden" name="image_url" value={safeCoverImageUrl} />
          <input
            type="hidden"
            name="gallery_urls"
            value={productImages
              .filter(url => url !== safeCoverImageUrl)
              .join("\n")}
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleUploadImageClick}
              disabled={
                isUploadingImages || productImages.length >= MAX_PRODUCT_IMAGES
              }
              className="inline-flex h-12 items-center justify-center rounded-[5px] border border-[#2A3D20] bg-[#2A3D20] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#223219] disabled:cursor-not-allowed disabled:opacity-60">
              {isUploadingImages ? "Enviando imagens..." : "Enviar imagens"}
            </button>
            <span className="text-[11px] text-[#7A716A]">
              {productImages.length}/{MAX_PRODUCT_IMAGES} imagens anexadas
            </span>
          </div>

          {productImages.length >= MAX_PRODUCT_IMAGES && (
            <p className="mt-2 text-[11px] font-medium text-[#8A3A3A]">
              Limite de 5 imagens atingido. Remova uma imagem para adicionar
              outra.
            </p>
          )}

          {productImages.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productImages.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="flex min-h-[160px] flex-col overflow-hidden rounded-[8px] border border-[#E5E0D8] bg-[#F7F5F2] p-2">
                  <button
                    type="button"
                    onClick={() => handleOpenImageLightbox(index)}
                    className="h-[120px] overflow-hidden rounded-[6px] bg-white sm:h-[130px]">
                    <img
                      src={url}
                      alt={
                        index === 0 ? "Imagem principal" : "Imagem do produto"
                      }
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                  <p className="mt-2 whitespace-nowrap text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5F5751]">
                    {url === safeCoverImageUrl
                      ? "Capa do produto"
                      : "Foto do produto"}
                  </p>
                  {url !== safeCoverImageUrl ? (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(index)}
                      className="mt-2 w-full rounded-[5px] border border-[#D6DCCF] bg-white px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#2A3D20] transition-colors hover:bg-[#F1F4EC]">
                      Usar como capa
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleRemoveImageAt(index)}
                    className="mt-2 w-full rounded-[5px] border border-[#E0C8C8] bg-[#FBF2F2] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#8A3A3A] transition-colors hover:bg-[#F8E7E7]">
                    Remover
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-[#9A9189]">
              Nenhuma imagem anexada.
            </p>
          )}
        </div>

        {isEditMode ? (
          <div className="md:col-span-2 rounded-[10px] border border-[#E5E0D8] bg-[#FAF8F5] p-4">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#5F5751]">
                Link do produto
              </span>
              <input
                type="text"
                readOnly
                value={publicProductLink}
                placeholder="Preencha o nome para gerar o link público."
                className={inputClass}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleCopyPublicLink()}
                disabled={!publicProductLink}
                className="inline-flex h-11 items-center justify-center rounded-[5px] border border-[#DDD8D0] bg-white px-4 text-[12px] font-medium text-[#2A3D20] transition-colors hover:bg-[#F5F1EA] disabled:cursor-not-allowed disabled:opacity-50">
                Copiar link
              </button>
            </div>
          </div>
        ) : null}

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

        <div className="md:col-span-2 flex gap-8 pt-1">
          <label className="flex cursor-pointer select-none items-center gap-2.5">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="h-4 w-4 border border-cream-deep accent-pistachio"
            />
            <span className="text-[11px] tracking-[0.12em] uppercase text-warm-gray">
              Ativo
            </span>
          </label>

          <label className="flex cursor-pointer select-none items-center gap-2.5">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
              className="h-4 w-4 border border-cream-deep accent-pistachio"
            />
            <span className="text-[11px] tracking-[0.12em] uppercase text-warm-gray">
              Destaque
            </span>
          </label>
        </div>
      </div>

      {hideActions ? null : (
        <div className="mt-8 flex gap-3 border-t border-cream-deep pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 bg-charcoal px-7 text-[10px] uppercase tracking-[0.2em] text-cream transition-colors hover:bg-charcoal/85 disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? "Salvando…" : submitLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-11 border border-cream-deep px-6 text-[10px] uppercase tracking-[0.2em] text-warm-gray transition-colors hover:border-charcoal/35 hover:text-charcoal disabled:opacity-50">
            Cancelar
          </button>
        </div>
      )}

      {isLightboxOpen && currentLightboxImage ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(20,20,19,0.75)] p-4"
          onClick={handleCloseImageLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Visualização de imagem do produto">
          <div
            className="relative w-full max-w-[980px]"
            onClick={event => event.stopPropagation()}>
            <button
              type="button"
              onClick={handleCloseImageLightbox}
              className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/35 text-xl text-white transition-colors hover:bg-black/50"
              aria-label="Fechar visualização">
              ×
            </button>

            <div className="overflow-hidden rounded-[10px] border border-white/20 bg-[#121211]">
              <img
                src={currentLightboxImage}
                alt="Imagem ampliada do produto"
                className="max-h-[78vh] w-full object-contain"
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-[5px] bg-black/45 px-3 py-1 text-[12px] font-medium text-white">
                {clampedLightboxIndex + 1}/{productImages.length}
              </span>

              {hasMultipleImages ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      handleShowPreviousImage();
                    }}
                    className="rounded-[5px] border border-white/40 bg-black/35 px-3 py-1 text-[12px] font-medium text-white transition-colors hover:bg-black/50">
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      handleShowNextImage();
                    }}
                    className="rounded-[5px] border border-white/40 bg-black/35 px-3 py-1 text-[12px] font-medium text-white transition-colors hover:bg-black/50">
                    Próxima
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
