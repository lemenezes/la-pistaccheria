/**
 * Database Types - Supabase
 * 
 * Define os tipos que correspondem às tabelas do Supabase.
 * Estes tipos são derivados do schema do banco de dados.
 */

export type Badge = "Novo" | "Destaque" | "Edição Limitada" | null;

export interface DatabaseProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  short_description: string;
  description: string;
  price: number;
  weight: string | null;
  badge: Badge;
  featured: boolean;
  active: boolean;
  image_url: string | null;
  image_storage_path: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateProductInput {
  slug: string;
  name: string;
  category: string;
  short_description: string;
  description: string;
  price: number;
  weight?: string;
  badge?: Badge;
  featured?: boolean;
  active?: boolean;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export interface DatabaseUser {
  id: string;
  full_name: string | null;
  role: "admin" | "editor";
  created_at: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}
