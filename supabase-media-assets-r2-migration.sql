/*
 * LA PISTACCHERIA - Media assets migration for Cloudflare R2
 *
 * Safe, idempotent migration for an existing media_assets table.
 *
 * Goals:
 * - preserve compatibility with the current admin media library
 * - keep existing RLS policies untouched
 * - add storage metadata required by the R2 upload flow
 */

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'media_assets'
      AND column_name = 'file_path'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'media_assets'
      AND column_name = 'object_key'
  ) THEN
    EXECUTE 'ALTER TABLE public.media_assets RENAME COLUMN file_path TO object_key';
  END IF;
END
$$;

ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS object_key TEXT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS created_by UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'media_assets'
      AND constraint_name = 'media_assets_created_by_fkey'
  ) THEN
    ALTER TABLE public.media_assets
      ADD CONSTRAINT media_assets_created_by_fkey
      FOREIGN KEY (created_by)
      REFERENCES auth.users(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_media_assets_object_key
  ON public.media_assets (object_key)
  WHERE object_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_media_assets_created_at
  ON public.media_assets (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_assets_created_by
  ON public.media_assets (created_by);
