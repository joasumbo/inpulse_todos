import { createClient } from '@supabase/supabase-js';
import config from './config.js';

const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Insere um novo log de erro no banco de dados
 */
export async function insertSystemLog(logData) {
  const { data, error } = await supabase
    .from('system_logs')
    .insert([logData])
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir log:', error);
    return null;
  }

  return data;
}

/**
 * Atualiza a contagem de ocorrências de um erro existente
 */
export async function updateErrorOccurrence(errorCode) {
  const { data, error } = await supabase
    .from('system_logs')
    .update({
      occurrence_count: supabase.raw('occurrence_count + 1'),
      last_occurrence: new Date().toISOString()
    })
    .eq('error_code', errorCode)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar ocorrência:', error);
    return null;
  }

  return data;
}

/**
 * Busca erro existente pelo código
 */
export async function findErrorByCode(errorCode) {
  const { data, error } = await supabase
    .from('system_logs')
    .select('*')
    .eq('error_code', errorCode)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Erro ao buscar log:', error);
  }

  return data;
}

/**
 * Insere métrica de saúde do sistema
 */
export async function insertSystemHealth(healthData) {
  const { data, error } = await supabase
    .from('system_health')
    .insert([healthData])
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir métrica de saúde:', error);
    return null;
  }

  return data;
}

/**
 * Atualiza status do monitor
 */
export async function updateMonitorStatus(statusData) {
  // Busca o último registro
  const { data: lastStatus } = await supabase
    .from('monitor_status')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (lastStatus) {
    // Atualiza o registro existente
    const { data, error } = await supabase
      .from('monitor_status')
      .update(statusData)
      .eq('id', lastStatus.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status:', error);
      return null;
    }

    return data;
  } else {
    // Cria novo registro
    const { data, error } = await supabase
      .from('monitor_status')
      .insert([statusData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir status:', error);
      return null;
    }

    return data;
  }
}

/**
 * Busca ou cria padrão de erro
 */
export async function upsertErrorPattern(patternData) {
  const { data, error } = await supabase
    .from('error_patterns')
    .upsert([patternData], { onConflict: 'pattern_name' })
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir padrão:', error);
    return null;
  }

  return data;
}

/**
 * Insere sugestão de melhoria da IA
 */
export async function insertAiSuggestion(suggestionData) {
  const { data, error } = await supabase
    .from('ai_improvement_suggestions')
    .insert([suggestionData])
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir sugestão:', error);
    return null;
  }

  return data;
}

/**
 * Busca últimos erros não resolvidos
 */
export async function getUnresolvedErrors(limit = 50) {
  const { data, error } = await supabase
    .from('system_logs')
    .select('*')
    .eq('is_resolved', false)
    .order('discovered_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar erros não resolvidos:', error);
    return [];
  }

  return data;
}

/**
 * Testa conexão com o banco de dados
 */
export async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('monitor_status')
      .select('count')
      .limit(1);

    return !error;
  } catch (err) {
    console.error('Erro ao testar conexão:', err);
    return false;
  }
}

export default supabase;
