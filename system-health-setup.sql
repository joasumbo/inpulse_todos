-- ============================================
-- Sistema de Gerenciamento de Erros e Saúde
-- Tabelas para monitoramento com IA (Gemini)
-- ============================================

-- Tabela principal de logs de erros do sistema
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_code VARCHAR(50) UNIQUE NOT NULL, -- Formato: DDMMYYYY-TIP-ABV (ex: 24122025-ser-errdb)
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Informações do erro
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('warning', 'danger', 'urgent')),
  error_type VARCHAR(100) NOT NULL, -- Ex: database, api, syntax, security, performance
  error_category VARCHAR(100), -- Categoria específica gerada pela IA
  
  -- Localização do erro
  file_path TEXT,
  line_number INTEGER,
  code_snippet TEXT, -- Trecho do código onde ocorreu o erro
  
  -- Detalhes técnicos
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  request_url TEXT,
  request_method VARCHAR(10),
  user_id UUID REFERENCES auth.users(id),
  tenant_id UUID,
  
  -- Análise da IA (Gemini)
  ai_description TEXT, -- Descrição detalhada gerada pela IA
  ai_documentation TEXT, -- Mini documentação do erro
  ai_solution_suggestions TEXT[], -- Array de sugestões de solução
  ai_risk_assessment TEXT, -- Avaliação de risco pela IA
  ai_predicted_impact TEXT, -- Impacto previsto no sistema
  
  -- Metadados
  environment VARCHAR(50) DEFAULT 'production', -- production, staging, development
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  
  -- Análise comportamental
  occurrence_count INTEGER DEFAULT 1,
  first_occurrence TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_occurrence TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de métricas de saúde do sistema
CREATE TABLE IF NOT EXISTS system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Métricas de performance
  cpu_usage DECIMAL(5,2), -- Percentual de uso da CPU
  memory_usage DECIMAL(5,2), -- Percentual de uso da memória
  disk_usage DECIMAL(5,2), -- Percentual de uso do disco
  
  -- Métricas de conexões
  database_status VARCHAR(20) DEFAULT 'healthy', -- healthy, degraded, down
  database_response_time INTEGER, -- Tempo de resposta em ms
  api_endpoints_checked INTEGER,
  api_endpoints_healthy INTEGER,
  api_endpoints_failed INTEGER,
  
  -- Métricas de tráfego
  active_users INTEGER DEFAULT 0,
  requests_per_minute INTEGER DEFAULT 0,
  average_response_time INTEGER, -- Em ms
  
  -- Métricas de erros
  errors_last_minute INTEGER DEFAULT 0,
  warnings_last_minute INTEGER DEFAULT 0,
  critical_errors INTEGER DEFAULT 0,
  
  -- Status geral
  overall_health_score INTEGER CHECK (overall_health_score >= 0 AND overall_health_score <= 100),
  health_status VARCHAR(20) DEFAULT 'healthy', -- healthy, degraded, critical
  
  -- Análise da IA
  ai_health_assessment TEXT,
  ai_recommendations TEXT[],
  ai_predicted_issues TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de padrões de erros identificados pela IA
CREATE TABLE IF NOT EXISTS error_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name VARCHAR(200) NOT NULL,
  pattern_description TEXT,
  
  -- Padrão identificado
  error_types TEXT[], -- Tipos de erros que fazem parte do padrão
  frequency INTEGER DEFAULT 0, -- Quantas vezes o padrão foi detectado
  severity VARCHAR(20) NOT NULL,
  
  -- Análise da IA
  ai_analysis TEXT, -- Análise completa do padrão
  ai_root_cause TEXT, -- Causa raiz identificada pela IA
  ai_prevention_steps TEXT[], -- Passos para prevenir
  ai_mitigation_steps TEXT[], -- Passos para mitigar
  
  -- Metadados
  first_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de status do assistente de monitoramento
CREATE TABLE IF NOT EXISTS monitor_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_running BOOLEAN DEFAULT TRUE,
  last_check_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  check_duration_ms INTEGER, -- Tempo que levou para fazer a verificação completa
  
  -- Status dos componentes
  monitor_healthy BOOLEAN DEFAULT TRUE,
  ai_service_healthy BOOLEAN DEFAULT TRUE,
  database_healthy BOOLEAN DEFAULT TRUE,
  
  -- Mensagens de status
  status_message TEXT,
  error_message TEXT,
  
  -- Estatísticas da última execução
  files_checked INTEGER DEFAULT 0,
  errors_found INTEGER DEFAULT 0,
  warnings_found INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de auditoria de melhorias sugeridas pela IA
CREATE TABLE IF NOT EXISTS ai_improvement_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL, -- performance, security, code_quality, scalability
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Sugestão
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  technical_details TEXT,
  estimated_impact TEXT,
  implementation_complexity VARCHAR(20), -- low, medium, high
  
  -- Arquivos afetados
  affected_files TEXT[],
  affected_components TEXT[],
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, implemented, rejected
  implemented_at TIMESTAMP WITH TIME ZONE,
  implemented_by UUID REFERENCES auth.users(id),
  implementation_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para melhorar performance
-- ============================================

CREATE INDEX idx_system_logs_severity ON system_logs(severity);
CREATE INDEX idx_system_logs_error_type ON system_logs(error_type);
CREATE INDEX idx_system_logs_discovered_at ON system_logs(discovered_at DESC);
CREATE INDEX idx_system_logs_is_resolved ON system_logs(is_resolved);
CREATE INDEX idx_system_logs_tenant_id ON system_logs(tenant_id);
CREATE INDEX idx_system_logs_error_code ON system_logs(error_code);

CREATE INDEX idx_system_health_recorded_at ON system_health(recorded_at DESC);
CREATE INDEX idx_system_health_health_status ON system_health(health_status);

CREATE INDEX idx_error_patterns_is_active ON error_patterns(is_active);
CREATE INDEX idx_error_patterns_severity ON error_patterns(severity);

CREATE INDEX idx_monitor_status_created_at ON monitor_status(created_at DESC);

CREATE INDEX idx_ai_suggestions_status ON ai_improvement_suggestions(status);
CREATE INDEX idx_ai_suggestions_priority ON ai_improvement_suggestions(priority);

-- ============================================
-- TRIGGERS para atualizar timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_logs_updated_at 
  BEFORE UPDATE ON system_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_error_patterns_updated_at 
  BEFORE UPDATE ON error_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_suggestions_updated_at 
  BEFORE UPDATE ON ai_improvement_suggestions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_improvement_suggestions ENABLE ROW LEVEL SECURITY;

-- Políticas: Permitir acesso autenticado (ajustar depois com role)
CREATE POLICY "Usuários autenticados podem ver logs"
  ON system_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sistema pode inserir logs"
  ON system_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar logs"
  ON system_logs FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para system_health
CREATE POLICY "Usuários autenticados podem ver métricas"
  ON system_health FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sistema pode inserir métricas de saúde"
  ON system_health FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas para error_patterns
CREATE POLICY "Usuários autenticados podem gerenciar padrões"
  ON error_patterns FOR ALL
  TO authenticated
  USING (true);

-- Políticas para monitor_status
CREATE POLICY "Usuários autenticados podem ver status"
  ON monitor_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sistema pode atualizar status do monitor"
  ON monitor_status FOR ALL
  TO authenticated
  USING (true);

-- Políticas para ai_improvement_suggestions
CREATE POLICY "Usuários autenticados podem gerenciar sugestões"
  ON ai_improvement_suggestions FOR ALL
  TO authenticated
  USING (true);

-- ============================================
-- FUNÇÕES UTILITÁRIAS
-- ============================================

-- Função para gerar código de erro
CREATE OR REPLACE FUNCTION generate_error_code(
  p_error_type VARCHAR,
  p_category VARCHAR
) RETURNS VARCHAR AS $$
DECLARE
  v_date VARCHAR;
  v_type_abbr VARCHAR;
  v_cat_abbr VARCHAR;
BEGIN
  -- Formato da data: DDMMYYYY
  v_date := TO_CHAR(NOW(), 'DDMMYYYY');
  
  -- Abreviação do tipo (primeiras 3 letras)
  v_type_abbr := LOWER(SUBSTRING(p_error_type, 1, 3));
  
  -- Abreviação da categoria (primeiras 3 letras)
  v_cat_abbr := LOWER(SUBSTRING(p_category, 1, 3));
  
  -- Retorna: data-tipo-categoria
  RETURN v_date || '-' || v_type_abbr || '-' || v_cat_abbr;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular score de saúde
CREATE OR REPLACE FUNCTION calculate_health_score(
  p_cpu DECIMAL,
  p_memory DECIMAL,
  p_errors INTEGER,
  p_warnings INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 100;
BEGIN
  -- Deduz pontos baseado em métricas
  IF p_cpu > 80 THEN v_score := v_score - 20; END IF;
  IF p_cpu > 90 THEN v_score := v_score - 10; END IF;
  
  IF p_memory > 80 THEN v_score := v_score - 20; END IF;
  IF p_memory > 90 THEN v_score := v_score - 10; END IF;
  
  -- Deduz por erros
  v_score := v_score - (p_errors * 5);
  v_score := v_score - (p_warnings * 2);
  
  -- Garante que o score não seja negativo
  IF v_score < 0 THEN v_score := 0; END IF;
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS para facilitar consultas
-- ============================================

-- View de erros recentes com informações resumidas
CREATE OR REPLACE VIEW recent_errors AS
SELECT 
  id,
  error_code,
  severity,
  error_type,
  error_message,
  file_path,
  line_number,
  discovered_at,
  is_resolved,
  occurrence_count,
  ai_description
FROM system_logs
WHERE discovered_at >= NOW() - INTERVAL '24 hours'
ORDER BY discovered_at DESC;

-- View de estatísticas de saúde atual
CREATE OR REPLACE VIEW current_health_stats AS
SELECT 
  health_status,
  overall_health_score,
  cpu_usage,
  memory_usage,
  database_status,
  active_users,
  errors_last_minute,
  warnings_last_minute,
  recorded_at
FROM system_health
ORDER BY recorded_at DESC
LIMIT 1;

-- View de resumo de erros por severidade
CREATE OR REPLACE VIEW errors_by_severity AS
SELECT 
  severity,
  COUNT(*) as total_errors,
  COUNT(CASE WHEN is_resolved = FALSE THEN 1 END) as unresolved_errors,
  COUNT(CASE WHEN discovered_at >= NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour_errors
FROM system_logs
GROUP BY severity;

-- Inserir registro inicial de status do monitor
INSERT INTO monitor_status (is_running, status_message)
VALUES (FALSE, 'Monitor não iniciado')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE system_logs IS 'Registro completo de todos os erros do sistema com análise de IA';
COMMENT ON TABLE system_health IS 'Métricas de saúde e performance do sistema em tempo real';
COMMENT ON TABLE error_patterns IS 'Padrões de erros identificados pela IA para prevenção';
COMMENT ON TABLE monitor_status IS 'Status atual do assistente de monitoramento';
COMMENT ON TABLE ai_improvement_suggestions IS 'Sugestões de melhorias geradas pela IA (auditor)';
