-- Phase 7: Materiais e Stock
-- Run this in the Supabase SQL editor at: mqkqfpbaxnjtadinctek.supabase.co

-- ─── Catálogo de materiais ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS maint_materiais (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  referencia   TEXT          UNIQUE,
  nome         TEXT          NOT NULL,
  descricao    TEXT,
  unidade      TEXT          NOT NULL DEFAULT 'un',
  preco_unit   NUMERIC(10,2) DEFAULT 0,
  stock_atual  NUMERIC(10,3) DEFAULT 0,
  stock_minimo NUMERIC(10,3) DEFAULT 0,
  ativo        BOOLEAN       DEFAULT true,
  created_at   TIMESTAMPTZ   DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   DEFAULT NOW()
);

-- Auto-referência MAT-XXXX
CREATE SEQUENCE IF NOT EXISTS maint_materiais_seq START 1;

CREATE OR REPLACE FUNCTION maint_set_ref_material()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referencia IS NULL THEN
    NEW.referencia := 'MAT-' || LPAD(nextval('maint_materiais_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maint_materiais_ref_trigger
  BEFORE INSERT ON maint_materiais
  FOR EACH ROW EXECUTE FUNCTION maint_set_ref_material();

CREATE OR REPLACE FUNCTION maint_materiais_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maint_materiais_updated_at_trigger
  BEFORE UPDATE ON maint_materiais
  FOR EACH ROW EXECUTE FUNCTION maint_materiais_updated_at();

-- ─── Materiais por serviço ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS maint_servico_materiais (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  servico_id  UUID          NOT NULL REFERENCES maint_servicos(id) ON DELETE CASCADE,
  material_id UUID          NOT NULL REFERENCES maint_materiais(id) ON DELETE RESTRICT,
  quantidade  NUMERIC(10,3) NOT NULL CHECK (quantidade > 0),
  preco_unit  NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE(servico_id, material_id)
);

-- Trigger: ajusta stock automaticamente ao associar/remover material de um serviço
CREATE OR REPLACE FUNCTION maint_servico_materiais_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE maint_materiais SET stock_atual = stock_atual - NEW.quantidade WHERE id = NEW.material_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE maint_materiais SET stock_atual = stock_atual + OLD.quantidade WHERE id = OLD.material_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE maint_materiais
    SET stock_atual = stock_atual + OLD.quantidade - NEW.quantidade
    WHERE id = NEW.material_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maint_servico_materiais_stock_trigger
  AFTER INSERT OR UPDATE OR DELETE ON maint_servico_materiais
  FOR EACH ROW EXECUTE FUNCTION maint_servico_materiais_stock();

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_maint_materiais_ativo    ON maint_materiais(ativo);
CREATE INDEX IF NOT EXISTS idx_maint_serv_mat_servico   ON maint_servico_materiais(servico_id);
CREATE INDEX IF NOT EXISTS idx_maint_serv_mat_material  ON maint_servico_materiais(material_id);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE maint_materiais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maint_materiais_auth"
  ON maint_materiais FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE maint_servico_materiais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maint_servico_materiais_auth"
  ON maint_servico_materiais FOR ALL TO authenticated USING (true) WITH CHECK (true);
