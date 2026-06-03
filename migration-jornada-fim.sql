-- Hora de fim da jornada de trabalho (início = created_at)
-- Corre no Supabase SQL Editor
ALTER TABLE maint_jornadas
  ADD COLUMN IF NOT EXISTS fim TIMESTAMPTZ;

NOTIFY pgrst, 'reload schema';
