import { supabase } from "../lib/supabase";

export interface MediaAsset {
  id: string;
  file_name: string;
  public_url: string;
  bucket_area?: string | null;
  created_at: string;
}

const mediaUploadWorkerUrl = import.meta.env.VITE_MEDIA_UPLOAD_WORKER_URL;

export const getMediaAssets = async () => {
  return supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });
};

export const deleteMediaAsset = async (id: string) => {
  return supabase.from("media_assets").delete().eq("id", id);
};

export const uploadMediaAsset = async (file: File, bucketArea = "products") => {
  if (!mediaUploadWorkerUrl) {
    throw new Error(
      "Missing media upload worker URL. Please set VITE_MEDIA_UPLOAD_WORKER_URL in .env.local"
    );
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message || "Falha ao obter a sessão atual.");
  }

  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error("Usuário não autenticado.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket_area", bucketArea);

  const response = await fetch(`${mediaUploadWorkerUrl.replace(/\/+$/, "")}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as MediaAsset | {
    code?: string;
    message?: string;
  } | null;

  if (!response.ok) {
    const message =
      payload && "message" in payload && payload.message
        ? payload.message
        : "Erro ao enviar imagem.";
    throw new Error(message);
  }

  return payload as MediaAsset;
};