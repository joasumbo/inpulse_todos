-- Jornada de Trabalho
-- Corre no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS maint_jornadas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID NOT NULL REFERENCES maint_utilizadores(id) ON DELETE CASCADE,
  dia           DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(funcionario_id, dia)
);

CREATE TABLE IF NOT EXISTS maint_acoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jornada_id  UUID NOT NULL REFERENCES maint_jornadas(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL CHECK (tipo IN ('viagem','trabalho','alimentacao','despesa')),
  descricao   TEXT,
  imagem_url  TEXT,
  inicio      TIMESTAMPTZ NOT NULL DEFAULT now(),
  fim         TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE maint_jornadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE maint_acoes    ENABLE ROW LEVEL SECURITY;

-- Cada utilizador vê apenas as suas jornadas; admins veem todas
CREATE POLICY "jornadas_select" ON maint_jornadas FOR SELECT
  USING (
    funcionario_id = (
      SELECT id FROM maint_utilizadores WHERE user_id = auth.uid() AND ativo = true LIMIT 1
    )
    OR EXISTS (
      SELECT 1 FROM maint_utilizadores WHERE user_id = auth.uid() AND cargo = 'admin' AND ativo = true
    )
  );

CREATE POLICY "jornadas_insert" ON maint_jornadas FOR INSERT
  WITH CHECK (
    funcionario_id = (
      SELECT id FROM maint_utilizadores WHERE user_id = auth.uid() AND ativo = true LIMIT 1
    )
  );

CREATE POLICY "jornadas_update" ON maint_jornadas FOR UPDATE
  USING (
    funcionario_id = (
      SELECT id FROM maint_utilizadores WHERE user_id = auth.uid() AND ativo = true LIMIT 1
    )
    OR EXISTS (
      SELECT 1 FROM maint_utilizadores WHERE user_id = auth.uid() AND cargo = 'admin' AND ativo = true
    )
  );

-- Ações: acesso via jornada
CREATE POLICY "acoes_select" ON maint_acoes FOR SELECT
  USING (
    jornada_id IN (
      SELECT id FROM maint_jornadas
    )
  );

CREATE POLICY "acoes_insert" ON maint_acoes FOR INSERT
  WITH CHECK (
    jornada_id IN (
      SELECT id FROM maint_jornadas
        WHERE funcionario_id = (
          SELECT id FROM maint_utilizadores WHERE user_id = auth.uid() AND ativo = true LIMIT 1
        )
    )
  );

CREATE POLICY "acoes_update" ON maint_acoes FOR UPDATE
  USING (
    jornada_id IN (
      SELECT id FROM maint_jornadas
        WHERE funcionario_id = (
          SELECT id FROM maint_utilizadores WHERE user_id = auth.uid() AND ativo = true LIMIT 1
        )
    )
  );

CREATE POLICY "acoes_delete" ON maint_acoes FOR DELETE
  USING (
    jornada_id IN (
      SELECT id FROM maint_jornadas
        WHERE funcionario_id = (
          SELECT id FROM maint_utilizadores WHERE user_id = auth.uid() AND ativo = true LIMIT 1
        )
    )
  );

NOTIFY pgrst, 'reload schema';
