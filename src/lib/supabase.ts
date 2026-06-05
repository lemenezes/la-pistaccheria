/**
 * Supabase Client
 * 
 * Singleton instance do cliente Supabase para toda a aplicação.
 * As credenciais devem estar em .env.local (não commitar!)
 */

import { createClient } from "@supabase/supabase-js";
import type {
  DatabaseCategory,
  DatabaseProduct,
  AuthUser,
} from "../types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Auth - Supabase Authentication
 */
export const signUp = async (email: string, password: string) => {
  return supabase.auth.signUp({
    email,
    password,
  });
};

export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user as AuthUser | null;
};

export const onAuthStateChange = (
  callback: (user: AuthUser | null) => void
) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback((session?.user as AuthUser) || null);
  });
};

/**
 * Products - Database Queries
 */
export const getProducts = async (options?: {
  activeOnly?: boolean;
  featuredOnly?: boolean;
}) => {
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.activeOnly) {
    query = query.eq("active", true);
  }

  if (options?.featuredOnly) {
    query = query.eq("featured", true);
  }

  return query;
};

export const getProductBySlug = async (slug: string) => {
  return supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();
};

export const getPublicProducts = async () => {
  return supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
};

export const getPublicProductBySlug = async (slug: string) => {
  return supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .eq("slug", slug)
    .single();
};

export const getProductById = async (id: string) => {
  return supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
};

export const createProduct = async (
  product: Omit<DatabaseProduct, "id" | "created_at" | "updated_at" | "created_by">
) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  return supabase
    .from("products")
    .insert({
      ...product,
      created_by: user.id,
    })
    .select()
    .single();
};

export const updateProduct = async (
  id: string,
  updates: Partial<Omit<DatabaseProduct, "id" | "created_at" | "created_by">>
) => {
  return supabase
    .from("products")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
};

export const deleteProduct = async (id: string) => {
  return supabase.from("products").delete().eq("id", id);
};

/**
 * Categories - Database Queries
 */
export const getCategories = async (options?: {
  activeOnly?: boolean;
  includeInactive?: boolean;
}) => {
  let query = supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (options?.activeOnly) {
    query = query.eq("active", true);
  }

  if (options?.includeInactive === false) {
    query = query.eq("active", true);
  }

  return query;
};

export const createCategory = async (
  input: Omit<
    DatabaseCategory,
    "id" | "created_at" | "updated_at"
  >
) => {
  return supabase.from("categories").insert(input).select().single();
};

export const updateCategory = async (
  id: string,
  updates: Partial<
    Omit<DatabaseCategory, "id" | "created_at" | "updated_at">
  >
) => {
  return supabase
    .from("categories")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
};

export const deactivateCategory = async (id: string) => {
  return updateCategory(id, { active: false });
};

export const activateCategory = async (id: string) => {
  return updateCategory(id, { active: true });
};
