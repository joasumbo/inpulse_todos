-- Phase 6: Fotos e Anexos
-- Run this in the Supabase SQL editor at: mqkqfpbaxnjtadinctek.supabase.co

-- ─── Table ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS maint_anexos (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  servico_id   UUID        NOT NULL REFERENCES maint_servicos(id) ON DELETE CASCADE,
  nome         TEXT        NOT NULL,
  storage_path TEXT        NOT NULL,
  mime_type    TEXT,
  tamanho      INTEGER,
  uploaded_by  UUID        REFERENCES maint_utilizadores(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maint_anexos_servico ON maint_anexos(servico_id);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE maint_anexos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maint_anexos_auth"
  ON maint_anexos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ─── Storage bucket ───────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('maint-anexos', 'maint-anexos', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to read objects in this bucket
CREATE POLICY "maint_anexos_storage_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'maint-anexos');

-- Allow authenticated users to upload
CREATE POLICY "maint_anexos_storage_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'maint-anexos');

-- Allow authenticated users to delete (fine-grained check is done in the API)
CREATE POLICY "maint_anexos_storage_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'maint-anexos');
