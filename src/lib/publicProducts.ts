import { products as fallbackProducts, type Product } from "../data/products";
import type { DatabaseProduct } from "../types/database";
import { getPublicProductBySlug, getPublicProducts } from "./supabase";

function mapDatabaseProductToProduct(product: DatabaseProduct): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    shortDescription: product.short_description,
    description: product.description,
    price: product.price,
    weight: product.weight ?? undefined,
    badge: product.badge ?? undefined,
    featured: product.featured,
    image: product.image_url ?? undefined,
  };
}

function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as Record<string, unknown>;
  const message = typeof err.message === "string" ? err.message.toLowerCase() : "";
  return (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("failed to fetch") ||
    message.includes("offline") ||
    err.code === "NETWORK_ERROR" ||
    err.code === "ERR_NETWORK"
  );
}

export async function fetchPublicProducts(): Promise<Product[]> {
  const { data, error } = await getPublicProducts();

  if (error) {
    // Se for erro de conexão, usa fallback
    if (isConnectionError(error)) {
      return fallbackProducts;
    }
    // Outro tipo de erro, retorna vazio
    return [];
  }

  if (!data || data.length === 0) {
    return fallbackProducts;
  }

  return (data as DatabaseProduct[]).map(mapDatabaseProductToProduct);
}

export async function fetchPublicProductBySlug(
  slug: string
): Promise<Product | null> {
  const { data, error } = await getPublicProductBySlug(slug);

  // Para produto individual, não usamos fallback
  // Se houver qualquer erro (conexão, não encontrado, inativo),
  // retornamos null. O cliente precisa saber que o produto não está disponível.
  if (error || !data) {
    return null;
  }

  return mapDatabaseProductToProduct(data as DatabaseProduct);
}
