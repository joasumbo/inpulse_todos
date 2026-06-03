-- Adicionar coluna username à tabela maint_utilizadores
-- Corre no Supabase SQL Editor

ALTER TABLE maint_utilizadores
  ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_maint_utilizadores_username
  ON maint_utilizadores(username)
  WHERE username IS NOT NULL;

NOTIFY pgrst, 'reload schema';
