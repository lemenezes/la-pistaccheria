export interface Env {
  MEDIA_ASSETS_BUCKET: R2Bucket;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  MEDIA_CDN_BASE_URL: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
};

function jsonResponse(body: Record<string, unknown>, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init?.headers ?? {}),
    },
  });
}

function notFound() {
  return jsonResponse(
    {
      code: "NOT_FOUND",
      message: "Route not found.",
    },
    { status: 404 }
  );
}

function methodNotAllowed() {
  return jsonResponse(
    {
      code: "METHOD_NOT_ALLOWED",
      message: "Only POST /upload is available in this stage.",
    },
    { status: 405 }
  );
}

function sanitizeFileName(fileName: string) {
  const normalizedName = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalizedName || "upload";
}

function getMimeExtension(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

function getObjectKey(fileName: string, mimeType: string) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const timestamp = `${now.getTime()}`;
  const sanitizedName = sanitizeFileName(fileName).replace(/\.[a-z0-9]+$/i, "");
  const extension = getMimeExtension(mimeType);

  return `products/${year}/${month}/${timestamp}-${sanitizedName}.${extension}`;
}

async function parseAndValidateUpload(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const bucketAreaValue = formData.get("bucket_area");

  if (!(file instanceof File)) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "BAD_REQUEST",
          message: "Field 'file' is required.",
        },
        { status: 400 }
      ),
    } as const;
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: "Only jpeg, png, webp and gif files are allowed.",
        },
        { status: 400 }
      ),
    } as const;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "PAYLOAD_TOO_LARGE",
          message: "File size must be at most 10 MB.",
        },
        { status: 413 }
      ),
    } as const;
  }

  const fileName = sanitizeFileName(file.name || "upload");
  const objectKey = getObjectKey(file.name || fileName, file.type);
  const bucketArea =
    typeof bucketAreaValue === "string" && bucketAreaValue.trim().length > 0
      ? sanitizeFileName(bucketAreaValue.trim())
      : "products";

  return {
    ok: true,
    file,
    file_name: fileName,
    mime_type: file.type,
    size_bytes: file.size,
    object_key: objectKey,
    bucket_area: bucketArea,
  } as const;
}

async function validateSupabaseToken(request: Request, env: Env) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "UNAUTHORIZED",
          message: "Authorization Bearer token is required.",
        },
        { status: 401 }
      ),
    } as const;
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "CONFIG_ERROR",
          message: "Supabase environment variables are not configured.",
        },
        { status: 500 }
      ),
    } as const;
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "UNAUTHORIZED",
          message: "Authorization Bearer token is required.",
        },
        { status: 401 }
      ),
    } as const;
  }

  const supabaseResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: env.SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
  });

  if (!supabaseResponse.ok) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "UNAUTHORIZED",
          message: "Invalid or expired Supabase token.",
        },
        { status: 401 }
      ),
    } as const;
  }

  return {
    ok: true,
    user: (await supabaseResponse.json()) as { id?: string; email?: string },
  } as const;
}

function createdRecordResponse(record: Record<string, unknown>) {
  return jsonResponse(record, { status: 201 });
}

async function insertMediaAsset(env: Env, payload: {
  file_name: string;
  object_key: string;
  public_url: string;
  mime_type: string;
  size_bytes: number;
  bucket_area: string;
  created_by: string;
}) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "CONFIG_ERROR",
          message: "Supabase service role configuration is missing.",
        },
        { status: 500 }
      ),
    } as const;
  }

  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/media_assets?select=*`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "DATABASE_INSERT_FAILED",
          message: "Failed to create media_assets record.",
          details: errorText,
        },
        { status: 500 }
      ),
    } as const;
  }

  const data = (await response.json()) as Array<Record<string, unknown>>;

  return {
    ok: true,
    record: data[0] ?? null,
  } as const;
}

function buildPublicUrl(baseUrl: string, objectKey: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedObjectKey = objectKey.replace(/^\/+/, "");
  return `${normalizedBaseUrl}/${normalizedObjectKey}`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/upload") {
      if (request.method !== "POST") {
        return methodNotAllowed();
      }

      const validation = await validateSupabaseToken(request, env);

      if (!validation.ok) {
        return validation.response;
      }

      const fileValidation = await parseAndValidateUpload(request);

      if (!fileValidation.ok) {
        return fileValidation.response;
      }

      if (!env.MEDIA_ASSETS_BUCKET) {
        return jsonResponse(
          {
            code: "CONFIG_ERROR",
            message: "R2 binding MEDIA_ASSETS_BUCKET is not configured.",
          },
          { status: 500 }
        );
      }

      const uploadResult = await env.MEDIA_ASSETS_BUCKET.put(
        fileValidation.object_key,
        fileValidation.file,
        {
          httpMetadata: {
            contentType: fileValidation.mime_type,
          },
        }
      );

      if (uploadResult === null) {
        return jsonResponse(
          {
            code: "R2_UPLOAD_FAILED",
            message: "Failed to store file in R2.",
          },
          { status: 500 }
        );
      }

      const publicUrl = buildPublicUrl(env.MEDIA_CDN_BASE_URL, fileValidation.object_key);

      if (!validation.user.id) {
        return jsonResponse(
          {
            code: "UNAUTHORIZED",
            message: "Authenticated user id is missing.",
          },
          { status: 401 }
        );
      }

      const insertResult = await insertMediaAsset(env, {
        file_name: fileValidation.file_name,
        object_key: fileValidation.object_key,
        public_url: publicUrl,
        mime_type: fileValidation.mime_type,
        size_bytes: fileValidation.size_bytes,
        bucket_area: fileValidation.bucket_area,
        created_by: validation.user.id,
      });

      if (!insertResult.ok || !insertResult.record) {
        return insertResult.ok
          ? jsonResponse(
              {
                code: "DATABASE_INSERT_FAILED",
                message: "Failed to create media_assets record.",
              },
              { status: 500 }
            )
          : insertResult.response;
      }

      return createdRecordResponse(insertResult.record);
    }

    return notFound();
  },
};
