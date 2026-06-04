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

export async function fetchPublicProducts(): Promise<Product[]> {
  const { data, error } = await getPublicProducts();

  if (error || !data || data.length === 0) {
    return fallbackProducts;
  }

  return (data as DatabaseProduct[]).map(mapDatabaseProductToProduct);
}

export async function fetchPublicProductBySlug(
  slug: string
): Promise<Product | null> {
  const { data, error } = await getPublicProductBySlug(slug);

  if (error || !data) {
    return fallbackProducts.find((product) => product.slug === slug) ?? null;
  }

  return mapDatabaseProductToProduct(data as DatabaseProduct);
}
