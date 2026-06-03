-- Tabela principal de serviços/intervenções
CREATE TABLE IF NOT EXISTS maint_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  loja_id UUID NOT NULL REFERENCES maint_lojas(id) ON DELETE RESTRICT,
  equipa_id UUID REFERENCES maint_equipas(id) ON DELETE SET NULL,
  tecnico_responsavel_id UUID REFERENCES maint_utilizadores(id) ON DELETE SET NULL,
  estado TEXT NOT NULL DEFAULT 'pendente'
    CHECK (estado IN ('pendente', 'em_curso', 'resolvido', 'fechado', 'faturado')),
  prioridade TEXT NOT NULL DEFAULT 'normal'
    CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  tipo TEXT
    CHECK (tipo IN ('preventiva', 'corretiva', 'emergencia', 'inspecao')),
  data_prevista DATE,
  data_inicio DATE,
  data_fim DATE,
  horas_trabalhadas NUMERIC(10,2) DEFAULT 0,
  custo_materiais NUMERIC(10,2) DEFAULT 0,
  custo_mao_obra NUMERIC(10,2) DEFAULT 0,
  custo_total NUMERIC(10,2) DEFAULT 0,
  observacoes TEXT,
  criado_por UUID REFERENCES maint_utilizadores(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-numeração SRV-XXXX
CREATE SEQUENCE IF NOT EXISTS maint_servicos_seq START 1;

CREATE OR REPLACE FUNCTION maint_set_servico_numero()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero IS NULL THEN
    NEW.numero := 'SRV-' || LPAD(nextval('maint_servicos_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS maint_servicos_numero_trigger ON maint_servicos;
CREATE TRIGGER maint_servicos_numero_trigger
  BEFORE INSERT ON maint_servicos
  FOR EACH ROW EXECUTE FUNCTION maint_set_servico_numero();

-- Custo total automático
CREATE OR REPLACE FUNCTION maint_calc_custo_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.custo_total := COALESCE(NEW.custo_materiais, 0) + COALESCE(NEW.custo_mao_obra, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS maint_servicos_custo_trigger ON maint_servicos;
CREATE TRIGGER maint_servicos_custo_trigger
  BEFORE INSERT OR UPDATE ON maint_servicos
  FOR EACH ROW EXECUTE FUNCTION maint_calc_custo_total();

-- updated_at automático
CREATE OR REPLACE FUNCTION maint_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS maint_servicos_updated_at ON maint_servicos;
CREATE TRIGGER maint_servicos_updated_at
  BEFORE UPDATE ON maint_servicos
  FOR EACH ROW EXECUTE FUNCTION maint_touch_updated_at();

-- Índices
CREATE INDEX IF NOT EXISTS maint_servicos_estado_idx     ON maint_servicos(estado);
CREATE INDEX IF NOT EXISTS maint_servicos_equipa_idx     ON maint_servicos(equipa_id);
CREATE INDEX IF NOT EXISTS maint_servicos_loja_idx       ON maint_servicos(loja_id);
CREATE INDEX IF NOT EXISTS maint_servicos_prioridade_idx ON maint_servicos(prioridade);
CREATE INDEX IF NOT EXISTS maint_servicos_created_idx    ON maint_servicos(created_at DESC);

-- RLS
ALTER TABLE maint_servicos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "maint_servicos_auth" ON maint_servicos;
CREATE POLICY "maint_servicos_auth" ON maint_servicos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
