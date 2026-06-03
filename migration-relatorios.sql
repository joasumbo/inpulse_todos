-- Fase 8: função de relatórios analíticos
-- Corre no Supabase SQL Editor

CREATE OR REPLACE FUNCTION maint_fn_relatorios(p_dias INT DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_desde TIMESTAMPTZ := NOW() - (p_dias || ' days')::INTERVAL;
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(

    'sumario', (
      SELECT jsonb_build_object(
        'total_servicos', COUNT(*),
        'custo_total',    COALESCE(SUM(custo_total), 0),
        'horas_total',    COALESCE(SUM(horas_trabalhadas), 0),
        'media_horas',    COALESCE(AVG(horas_trabalhadas) FILTER (WHERE horas_trabalhadas > 0), 0)
      )
      FROM maint_servicos
      WHERE created_at >= v_desde
    ),

    'por_estado', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object('estado', estado, 'total', total)
          ORDER BY total DESC
        ),
        '[]'::jsonb
      )
      FROM (
        SELECT estado, COUNT(*) AS total
        FROM maint_servicos
        WHERE created_at >= v_desde
        GROUP BY estado
      ) t
    ),

    'por_equipa', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object('nome', nome, 'total', total)
          ORDER BY total DESC
        ),
        '[]'::jsonb
      )
      FROM (
        SELECT COALESCE(e.nome, 'Sem equipa') AS nome, COUNT(*) AS total
        FROM maint_servicos s
        LEFT JOIN maint_equipas e ON s.equipa_id = e.id
        WHERE s.created_at >= v_desde
        GROUP BY e.nome
        ORDER BY total DESC
        LIMIT 8
      ) t
    ),

    'por_loja', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object('nome', nome, 'total', total)
          ORDER BY total DESC
        ),
        '[]'::jsonb
      )
      FROM (
        SELECT l.nome, COUNT(*) AS total
        FROM maint_servicos s
        JOIN maint_lojas l ON s.loja_id = l.id
        WHERE s.created_at >= v_desde
        GROUP BY l.nome
        ORDER BY total DESC
        LIMIT 8
      ) t
    ),

    'materiais', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'nome',        nome,
            'referencia',  referencia,
            'unidade',     unidade,
            'qtd_total',   qtd_total,
            'custo_total', custo_total
          )
          ORDER BY custo_total DESC
        ),
        '[]'::jsonb
      )
      FROM (
        SELECT
          m.nome,
          m.referencia,
          m.unidade,
          SUM(sm.quantidade)                 AS qtd_total,
          SUM(sm.quantidade * sm.preco_unit) AS custo_total
        FROM maint_servico_materiais sm
        JOIN maint_materiais m ON sm.material_id = m.id
        JOIN maint_servicos  s ON sm.servico_id  = s.id
        WHERE s.created_at >= v_desde
        GROUP BY m.id, m.nome, m.referencia, m.unidade
        ORDER BY custo_total DESC
        LIMIT 10
      ) t
    ),

    'por_mes', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'mes',             mes,
            'servicos',        servicos,
            'custo_materiais', custo_materiais,
            'custo_mao_obra',  custo_mao_obra,
            'horas',           horas
          )
          ORDER BY mes
        ),
        '[]'::jsonb
      )
      FROM (
        SELECT
          TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM') AS mes,
          COUNT(*)                                           AS servicos,
          COALESCE(SUM(custo_materiais),   0)               AS custo_materiais,
          COALESCE(SUM(custo_mao_obra),    0)               AS custo_mao_obra,
          COALESCE(SUM(horas_trabalhadas), 0)               AS horas
        FROM maint_servicos
        WHERE created_at >= v_desde
        GROUP BY mes
        ORDER BY mes
      ) t
    )

  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION maint_fn_relatorios(INT) TO authenticated;
