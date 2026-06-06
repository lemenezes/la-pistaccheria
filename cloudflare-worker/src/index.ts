export interface Env {
  MEDIA_ASSETS_BUCKET: R2Bucket;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  MEDIA_CDN_BASE_URL: string;
}

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

function uploadStub(userId: string | undefined) {
  return jsonResponse(
    {
      code: "NOT_IMPLEMENTED",
      message: "Token validated. Upload flow will be implemented in the next stage.",
      authenticated: true,
      user_id: userId ?? null,
      contract: {
        method: "POST",
        path: "/upload",
        request: {
          contentType: "multipart/form-data",
          headers: ["Authorization: Bearer <supabase_access_token>"],
          fields: ["file", "bucket_area?"],
        },
        response: {
          successStatus: 201,
          errorStatus: [400, 401, 403, 413, 500],
        },
      },
    },
    { status: 501 }
  );
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

      return uploadStub(validation.user.id);
    }

    return notFound();
  },
};
