import { supabase } from "../lib/supabase";

export interface MediaAsset {
  id: string;
  file_name: string;
  public_url: string;
  created_at: string;
}

export const getMediaAssets = async () => {
  return supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });
};

export const deleteMediaAsset = async (id: string) => {
  return supabase.from("media_assets").delete().eq("id", id);
};