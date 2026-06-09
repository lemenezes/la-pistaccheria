import { supabase } from "../lib/supabase";

export interface MediaAsset {
  id: string;
  file_name: string;
  public_url: string;
  bucket_area?: string | null;
  created_at: string;
}

const mediaUploadWorkerUrl = import.meta.env.VITE_MEDIA_UPLOAD_WORKER_URL;

export type DeleteUploadedMediaAssetInput = {
  publicUrl?: string;
  objectKey?: string;
  excludeProductId?: string;
};

export type DeleteUploadedMediaAssetResult = {
  code?: string;
  message?: string;
  object_key?: string;
  public_url?: string;
  used_by_product_ids?: string[];
  media_asset_deleted?: boolean;
  r2_deleted?: boolean;
};

export const isDeleteUploadedMediaAssetSuccessful = (
  result: DeleteUploadedMediaAssetResult | null | undefined
) => {
  // If DELETE returned 2xx and no JSON body, treat as success.
  if (!result) {
    return true;
  }

  if (result.code === "ASSET_IN_USE") {
    return true;
  }

  if (result.code === "ASSET_DELETED") {
    return true;
  }

  if (result.r2_deleted || result.media_asset_deleted) {
    return true;
  }

  return false;
};

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

export const deleteUploadedMediaAsset = async ({
  publicUrl,
  objectKey,
  excludeProductId,
}: DeleteUploadedMediaAssetInput) => {
  if (!mediaUploadWorkerUrl) {
    throw new Error(
      "Missing media upload worker URL. Please set VITE_MEDIA_UPLOAD_WORKER_URL in .env.local"
    );
  }

  const normalizedPublicUrl = publicUrl?.trim() || "";
  const normalizedObjectKey = objectKey?.trim() || "";
  const normalizedExcludeProductId = excludeProductId?.trim() || "";

  if (!normalizedPublicUrl && !normalizedObjectKey) {
    throw new Error("Informe publicUrl ou objectKey para remover o asset.");
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message || "Falha ao obter a sessão atual.");
  }

  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error("Usuário não autenticado.");
  }

  const response = await fetch(`${mediaUploadWorkerUrl.replace(/\/+$/, "")}/asset`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      public_url: normalizedPublicUrl || undefined,
      object_key: normalizedObjectKey || undefined,
      exclude_product_id: normalizedExcludeProductId || undefined,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | DeleteUploadedMediaAssetResult
    | null;

  if (response.status === 409 && payload?.code === "ASSET_IN_USE") {
    return payload;
  }

  if (!response.ok) {
    const message = payload?.message || "Erro ao remover imagem enviada.";
    throw new Error(message);
  }

  return payload || { code: "ASSET_DELETED" };
};