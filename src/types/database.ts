/**
 * Database Types - Supabase
 * 
 * Define os tipos que correspondem às tabelas do Supabase.
 * Estes tipos são derivados do schema do banco de dados.
 */

export type Badge = "Novo" | "Destaque" | "Edição Limitada" | null;

export interface DatabaseCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  category_id: string | null;
  short_description: string;
  description: string;
  price: number;
  weight: string | null;
  badge: Badge;
  featured: boolean;
  active: boolean;
  display_order: number;
  meta_title: string | null;
  meta_description: string | null;
  image_url: string | null;
  gallery_urls: string[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateProductInput {
  slug: string;
  name: string;
  category: string;
  category_id?: string | null;
  short_description: string;
  description: string;
  price: number;
  weight?: string;
  badge?: Badge;
  featured?: boolean;
  active?: boolean;
  display_order?: number;
  meta_title?: string;
  meta_description?: string;
  image_url?: string;
  gallery_urls?: string[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}
