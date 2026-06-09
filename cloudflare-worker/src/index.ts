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
  "image/gif"
]);

const ALLOWED_CORS_ORIGINS = new Set([
  "http://localhost:5173",
  "https://lapistaccheria.leandrom.com.br"
]);

const CORS_ALLOW_METHODS = "OPTIONS, POST, DELETE";
const CORS_ALLOW_HEADERS = "Authorization, Content-Type";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8"
};

function jsonResponse(body: Record<string, unknown>, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init?.headers ?? {})
    }
  });
}

function getCorsOriginHeader(origin: string | null) {
  if (!origin || !ALLOWED_CORS_ORIGINS.has(origin)) {
    return null;
  }

  return origin;
}

function withCorsHeaders(request: Request, response: Response) {
  const origin = request.headers.get("Origin");
  const allowedOrigin = getCorsOriginHeader(origin);
  const headers = new Headers(response.headers);

  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Methods", CORS_ALLOW_METHODS);
  headers.set("Access-Control-Allow-Headers", CORS_ALLOW_HEADERS);

  if (allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", allowedOrigin);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function preflightResponse(request: Request) {
  const origin = request.headers.get("Origin");
  const allowedOrigin = getCorsOriginHeader(origin);

  if (!allowedOrigin) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": CORS_ALLOW_METHODS,
      "Access-Control-Allow-Headers": CORS_ALLOW_HEADERS,
      Vary: "Origin"
    }
  });
}

function notFound() {
  return jsonResponse(
    {
      code: "NOT_FOUND",
      message: "Route not found."
    },
    { status: 404 }
  );
}

function methodNotAllowed() {
  return jsonResponse(
    {
      code: "METHOD_NOT_ALLOWED",
      message: "Only POST /upload is available in this stage."
    },
    { status: 405 }
  );
}

function methodNotAllowedForAssetDelete() {
  return jsonResponse(
    {
      code: "METHOD_NOT_ALLOWED",
      message: "Only DELETE /asset is available in this stage."
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
          message: "Field 'file' is required."
        },
        { status: 400 }
      )
    } as const;
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: "Only jpeg, png, webp and gif files are allowed."
        },
        { status: 400 }
      )
    } as const;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "PAYLOAD_TOO_LARGE",
          message: "File size must be at most 10 MB."
        },
        { status: 413 }
      )
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
    bucket_area: bucketArea
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
          message: "Authorization Bearer token is required."
        },
        { status: 401 }
      )
    } as const;
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "CONFIG_ERROR",
          message: "Supabase environment variables are not configured."
        },
        { status: 500 }
      )
    } as const;
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "UNAUTHORIZED",
          message: "Authorization Bearer token is required."
        },
        { status: 401 }
      )
    } as const;
  }

  const supabaseResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: env.SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    }
  });

  if (!supabaseResponse.ok) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "UNAUTHORIZED",
          message: "Invalid or expired Supabase token."
        },
        { status: 401 }
      )
    } as const;
  }

  return {
    ok: true,
    user: (await supabaseResponse.json()) as { id?: string; email?: string }
  } as const;
}

function createdRecordResponse(record: Record<string, unknown>) {
  return jsonResponse(record, { status: 201 });
}

async function insertMediaAsset(
  env: Env,
  payload: {
    file_name: string;
    object_key: string;
    public_url: string;
    mime_type: string;
    size_bytes: number;
    bucket_area: string;
    created_by: string;
  }
) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "CONFIG_ERROR",
          message: "Supabase service role configuration is missing."
        },
        { status: 500 }
      )
    } as const;
  }

  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/media_assets?select=*`,
    {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "DATABASE_INSERT_FAILED",
          message: "Failed to create media_assets record.",
          details: errorText
        },
        { status: 500 }
      )
    } as const;
  }

  const data = (await response.json()) as Array<Record<string, unknown>>;

  return {
    ok: true,
    record: data[0] ?? null
  } as const;
}

function buildPublicUrl(baseUrl: string, objectKey: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedObjectKey = objectKey.replace(/^\/+/, "");
  return `${normalizedBaseUrl}/${normalizedObjectKey}`;
}

function deriveObjectKeyFromPublicUrl(baseUrl: string, publicUrl: string) {
  try {
    const parsedPublicUrl = new URL(publicUrl);
    const parsedBaseUrl = new URL(baseUrl);
    const basePath = parsedBaseUrl.pathname.replace(/^\/+|\/+$/g, "");
    const publicPath = parsedPublicUrl.pathname.replace(/^\/+/, "");

    if (parsedPublicUrl.origin !== parsedBaseUrl.origin) {
      return null;
    }

    if (!basePath) {
      return publicPath || null;
    }

    if (publicPath === basePath) {
      return null;
    }

    if (!publicPath.startsWith(`${basePath}/`)) {
      return null;
    }

    return publicPath.slice(basePath.length + 1) || null;
  } catch {
    return null;
  }
}

type DeleteAssetInput = {
  object_key: string;
  public_url: string;
  exclude_product_id: string | null;
};

async function parseDeleteAssetInput(request: Request, url: URL) {
  const contentType = request.headers.get("Content-Type") ?? "";
  let body: Record<string, unknown> | null = null;

  if (contentType.includes("application/json")) {
    body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
  }

  const objectKeyFromQuery = url.searchParams.get("object_key")?.trim() ?? "";
  const publicUrlFromQuery = url.searchParams.get("public_url")?.trim() ?? "";
  const excludeProductIdFromQuery =
    url.searchParams.get("exclude_product_id")?.trim() ?? "";

  const objectKeyFromBody =
    typeof body?.object_key === "string" ? body.object_key.trim() : "";
  const publicUrlFromBody =
    typeof body?.public_url === "string" ? body.public_url.trim() : "";
  const excludeProductIdFromBody =
    typeof body?.exclude_product_id === "string"
      ? body.exclude_product_id.trim()
      : "";

  const object_key = objectKeyFromQuery || objectKeyFromBody;
  const public_url = publicUrlFromQuery || publicUrlFromBody;
  const exclude_product_id =
    excludeProductIdFromQuery || excludeProductIdFromBody || null;

  if (!object_key && !public_url) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "BAD_REQUEST",
          message: "Provide object_key or public_url to delete an asset."
        },
        { status: 400 }
      )
    } as const;
  }

  return {
    ok: true,
    object_key,
    public_url,
    exclude_product_id
  } as const;
}

function resolveDeleteAssetInput(
  env: Env,
  input: {
    object_key: string;
    public_url: string;
    exclude_product_id: string | null;
  }
) {
  const normalizedObjectKey = input.object_key.replace(/^\/+/, "").trim();
  const normalizedPublicUrl = input.public_url.trim();

  if (normalizedObjectKey) {
    return {
      ok: true,
      payload: {
        object_key: normalizedObjectKey,
        public_url:
          normalizedPublicUrl ||
          buildPublicUrl(env.MEDIA_CDN_BASE_URL, normalizedObjectKey),
        exclude_product_id: input.exclude_product_id
      }
    } as const;
  }

  const derivedObjectKey = deriveObjectKeyFromPublicUrl(
    env.MEDIA_CDN_BASE_URL,
    normalizedPublicUrl
  );

  if (!derivedObjectKey) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "BAD_REQUEST",
          message:
            "Could not derive object_key from public_url. Ensure it belongs to the configured MEDIA_CDN_BASE_URL."
        },
        { status: 400 }
      )
    } as const;
  }

  return {
    ok: true,
    payload: {
      object_key: derivedObjectKey,
      public_url: normalizedPublicUrl,
      exclude_product_id: input.exclude_product_id
    }
  } as const;
}

async function getProductsUsingAsset(env: Env, payload: DeleteAssetInput) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "CONFIG_ERROR",
          message: "Supabase service role configuration is missing."
        },
        { status: 500 }
      )
    } as const;
  }

  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/products?select=id,image_url,gallery_urls`,
    {
      method: "GET",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "PRODUCT_USAGE_CHECK_FAILED",
          message: "Failed to verify if asset is used by products.",
          details: errorText
        },
        { status: 500 }
      )
    } as const;
  }

  const rows = (await response.json()) as Array<{
    id?: string;
    image_url?: string | null;
    gallery_urls?: unknown;
  }>;

  const usedByProductIds = rows
    .filter(row => {
      if (!row.id) {
        return false;
      }

      if (payload.exclude_product_id && row.id === payload.exclude_product_id) {
        return false;
      }

      const matchesImageUrl = row.image_url === payload.public_url;
      const matchesGallery =
        Array.isArray(row.gallery_urls) &&
        row.gallery_urls.some(
          value => typeof value === "string" && value === payload.public_url
        );

      return matchesImageUrl || matchesGallery;
    })
    .map(row => row.id as string);

  return {
    ok: true,
    used_by_product_ids: usedByProductIds
  } as const;
}

async function deleteMediaAssetRecord(env: Env, payload: DeleteAssetInput) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "CONFIG_ERROR",
          message: "Supabase service role configuration is missing."
        },
        { status: 500 }
      )
    } as const;
  }

  const objectKeyFilter = encodeURIComponent(payload.object_key);
  const byObjectKey = await fetch(
    `${env.SUPABASE_URL}/rest/v1/media_assets?object_key=eq.${objectKeyFilter}&select=id`,
    {
      method: "DELETE",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      }
    }
  );

  if (!byObjectKey.ok) {
    const errorText = await byObjectKey.text();
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "MEDIA_ASSET_DELETE_FAILED",
          message: "Failed to delete media_assets record.",
          details: errorText
        },
        { status: 500 }
      )
    } as const;
  }

  const deletedByObjectKey = (await byObjectKey.json()) as Array<{
    id?: string;
  }>;
  if (deletedByObjectKey.length > 0) {
    return {
      ok: true,
      deleted_count: deletedByObjectKey.length
    } as const;
  }

  const publicUrlFilter = encodeURIComponent(payload.public_url);
  const byPublicUrl = await fetch(
    `${env.SUPABASE_URL}/rest/v1/media_assets?public_url=eq.${publicUrlFilter}&select=id`,
    {
      method: "DELETE",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      }
    }
  );

  if (!byPublicUrl.ok) {
    const errorText = await byPublicUrl.text();
    return {
      ok: false,
      response: jsonResponse(
        {
          code: "MEDIA_ASSET_DELETE_FAILED",
          message: "Failed to delete media_assets record.",
          details: errorText
        },
        { status: 500 }
      )
    } as const;
  }

  const deletedByPublicUrl = (await byPublicUrl.json()) as Array<{
    id?: string;
  }>;

  return {
    ok: true,
    deleted_count: deletedByPublicUrl.length
  } as const;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/upload") {
      if (request.method === "OPTIONS") {
        return preflightResponse(request);
      }

      if (request.method !== "POST") {
        return withCorsHeaders(request, methodNotAllowed());
      }

      const validation = await validateSupabaseToken(request, env);

      if (!validation.ok) {
        return withCorsHeaders(request, validation.response);
      }

      const fileValidation = await parseAndValidateUpload(request);

      if (!fileValidation.ok) {
        return withCorsHeaders(request, fileValidation.response);
      }

      if (!env.MEDIA_ASSETS_BUCKET) {
        return withCorsHeaders(
          request,
          jsonResponse(
            {
              code: "CONFIG_ERROR",
              message: "R2 binding MEDIA_ASSETS_BUCKET is not configured."
            },
            { status: 500 }
          )
        );
      }

      const uploadResult = await env.MEDIA_ASSETS_BUCKET.put(
        fileValidation.object_key,
        fileValidation.file,
        {
          httpMetadata: {
            contentType: fileValidation.mime_type
          }
        }
      );

      if (uploadResult === null) {
        return withCorsHeaders(
          request,
          jsonResponse(
            {
              code: "R2_UPLOAD_FAILED",
              message: "Failed to store file in R2."
            },
            { status: 500 }
          )
        );
      }

      const publicUrl = buildPublicUrl(
        env.MEDIA_CDN_BASE_URL,
        fileValidation.object_key
      );

      if (!validation.user.id) {
        return withCorsHeaders(
          request,
          jsonResponse(
            {
              code: "UNAUTHORIZED",
              message: "Authenticated user id is missing."
            },
            { status: 401 }
          )
        );
      }

      const insertResult = await insertMediaAsset(env, {
        file_name: fileValidation.file_name,
        object_key: fileValidation.object_key,
        public_url: publicUrl,
        mime_type: fileValidation.mime_type,
        size_bytes: fileValidation.size_bytes,
        bucket_area: fileValidation.bucket_area,
        created_by: validation.user.id
      });

      if (!insertResult.ok || !insertResult.record) {
        return withCorsHeaders(
          request,
          insertResult.ok
            ? jsonResponse(
                {
                  code: "DATABASE_INSERT_FAILED",
                  message: "Failed to create media_assets record."
                },
                { status: 500 }
              )
            : insertResult.response
        );
      }

      return withCorsHeaders(
        request,
        createdRecordResponse(insertResult.record)
      );
    }

    if (url.pathname === "/asset") {
      if (request.method === "OPTIONS") {
        return preflightResponse(request);
      }

      if (request.method !== "DELETE") {
        return withCorsHeaders(request, methodNotAllowedForAssetDelete());
      }

      const validation = await validateSupabaseToken(request, env);

      if (!validation.ok) {
        return withCorsHeaders(request, validation.response);
      }

      if (!env.MEDIA_ASSETS_BUCKET) {
        return withCorsHeaders(
          request,
          jsonResponse(
            {
              code: "CONFIG_ERROR",
              message: "R2 binding MEDIA_ASSETS_BUCKET is not configured."
            },
            { status: 500 }
          )
        );
      }

      const parsedInput = await parseDeleteAssetInput(request, url);

      if (!parsedInput.ok) {
        return withCorsHeaders(request, parsedInput.response);
      }

      const resolvedInput = resolveDeleteAssetInput(env, parsedInput);

      if (!resolvedInput.ok) {
        return withCorsHeaders(request, resolvedInput.response);
      }

      const usageCheck = await getProductsUsingAsset(
        env,
        resolvedInput.payload
      );

      if (!usageCheck.ok) {
        return withCorsHeaders(request, usageCheck.response);
      }

      if (usageCheck.used_by_product_ids.length > 0) {
        return withCorsHeaders(
          request,
          jsonResponse(
            {
              code: "ASSET_IN_USE",
              message:
                "Asset is still used by other products and cannot be deleted.",
              used_by_product_ids: usageCheck.used_by_product_ids
            },
            { status: 409 }
          )
        );
      }

      try {
        await env.MEDIA_ASSETS_BUCKET.delete(resolvedInput.payload.object_key);
      } catch (error) {
        return withCorsHeaders(
          request,
          jsonResponse(
            {
              code: "R2_DELETE_FAILED",
              message: "Failed to delete file from R2.",
              details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
          )
        );
      }

      const deleteResult = await deleteMediaAssetRecord(
        env,
        resolvedInput.payload
      );

      if (!deleteResult.ok) {
        return withCorsHeaders(request, deleteResult.response);
      }

      return withCorsHeaders(
        request,
        jsonResponse({
          code: "ASSET_DELETED",
          message: "Asset deleted successfully.",
          object_key: resolvedInput.payload.object_key,
          public_url: resolvedInput.payload.public_url,
          media_asset_deleted: deleteResult.deleted_count > 0,
          r2_deleted: true
        })
      );
    }

    return withCorsHeaders(request, notFound());
  }
};
