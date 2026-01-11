import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, AlertTriangle, CheckCircle, XCircle, TrendingUp, Database, Cpu, Server, AlertCircle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonitorStatus {
  is_running: boolean;
  last_check_at: string;
  check_duration_ms: number;
  monitor_healthy: boolean;
  ai_service_healthy: boolean;
  database_healthy: boolean;
  status_message: string;
  errors_found: number;
  warnings_found: number;
}

interface SystemLog {
  id: string;
  error_code: string;
  severity: 'warning' | 'danger' | 'urgent';
  error_type: string;
  error_message: string;
  discovered_at: string;
  is_resolved: boolean;
  file_path: string | null;
  line_number: number | null;
  occurrence_count: number;
}

interface HealthMetric {
  recorded_at: string;
  cpu_usage: number;
  memory_usage: number;
  overall_health_score: number;
  errors_last_minute: number;
  active_users: number;
}

export function SystemHealthPage() {
  const [monitorStatus, setMonitorStatus] = useState<MonitorStatus | null>(null);
  const [recentErrors, setRecentErrors] = useState<SystemLog[]>([]);
  const [healthHistory, setHealthHistory] = useState<HealthMetric[]>([]);
  const [errorStats, setErrorStats] = useState({ warning: 0, danger: 0, urgent: 0 });
  const [loading, setLoading] = useState(true);

  // Carrega dados iniciais
  useEffect(() => {
    loadAllData();
    
    // Atualiza a cada 5 segundos
    const interval = setInterval(loadAllData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  async function loadAllData() {
    try {
      await Promise.all([
        loadMonitorStatus(),
        loadRecentErrors(),
        loadHealthHistory(),
        loadErrorStats()
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  }

  async function loadMonitorStatus() {
    const { data } = await supabase
      .from('monitor_status')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (data) setMonitorStatus(data);
  }

  async function loadRecentErrors() {
    const { data } = await supabase
      .from('system_logs')
      .select('*')
      .order('discovered_at', { ascending: false })
      .limit(20);
    
    if (data) setRecentErrors(data);
  }

  async function loadHealthHistory() {
    const { data } = await supabase
      .from('system_health')
      .select('recorded_at, cpu_usage, memory_usage, overall_health_score, errors_last_minute, active_users')
      .order('recorded_at', { ascending: false })
      .limit(20);
    
    if (data) setHealthHistory(data.reverse());
  }

  async function loadErrorStats() {
    const { data } = await supabase
      .from('system_logs')
      .select('severity')
      .eq('is_resolved', false);
    
    if (data) {
      const stats = {
        warning: data.filter(e => e.severity === 'warning').length,
        danger: data.filter(e => e.severity === 'danger').length,
        urgent: data.filter(e => e.severity === 'urgent').length
      };
      setErrorStats(stats);
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'danger': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'danger': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const latestHealth = healthHistory[healthHistory.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Saúde do Sistema</h1>
        <p className="text-gray-600 mt-2">Monitoramento em tempo real com análise de IA</p>
      </div>

      {/* Status do Assistente */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Assistente de Logs</h2>
            <div className="flex items-center gap-3">
              {monitorStatus?.is_running ? (
                <>
                  <CheckCircle className="text-green-300" size={24} />
                  <span className="text-lg font-medium">Trabalhando</span>
                  <span className="text-blue-100">
                    {monitorStatus.check_duration_ms 
                      ? `${(monitorStatus.check_duration_ms / 1000).toFixed(1)}s`
                      : '0s'
                    }
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="text-red-300" size={24} />
                  <span className="text-lg font-medium">Não trabalhando</span>
                  <button className="ml-4 text-sm underline hover:text-blue-100">
                    Ver porquê
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">{monitorStatus?.errors_found || 0}</div>
              <div className="text-sm text-blue-100">Erros</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{monitorStatus?.warnings_found || 0}</div>
              <div className="text-sm text-blue-100">Avisos</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {latestHealth?.overall_health_score || 0}
              </div>
              <div className="text-sm text-blue-100">Score</div>
            </div>
          </div>
        </div>

        {/* Status dos serviços */}
        <div className="mt-4 pt-4 border-t border-blue-400 grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Database size={16} />
            <span>Banco de dados:</span>
            <span className={monitorStatus?.database_healthy ? 'text-green-300' : 'text-red-300'}>
              {monitorStatus?.database_healthy ? 'OK' : 'Falhou'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={16} />
            <span>Gemini AI:</span>
            <span className={monitorStatus?.ai_service_healthy ? 'text-green-300' : 'text-red-300'}>
              {monitorStatus?.ai_service_healthy ? 'OK' : 'Falhou'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Server size={16} />
            <span>Monitor:</span>
            <span className={monitorStatus?.monitor_healthy ? 'text-green-300' : 'text-red-300'}>
              {monitorStatus?.monitor_healthy ? 'OK' : 'Falhou'}
            </span>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-lg border-2 ${getSeverityColor('warning')}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Avisos</p>
              <p className="text-3xl font-bold mt-1">{errorStats.warning}</p>
            </div>
            <AlertCircle size={40} className="opacity-50" />
          </div>
        </div>

        <div className={`p-6 rounded-lg border-2 ${getSeverityColor('danger')}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Perigos</p>
              <p className="text-3xl font-bold mt-1">{errorStats.danger}</p>
            </div>
            <AlertTriangle size={40} className="opacity-50" />
          </div>
        </div>

        <div className={`p-6 rounded-lg border-2 ${getSeverityColor('urgent')}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Urgentes</p>
              <p className="text-3xl font-bold mt-1">{errorStats.urgent}</p>
            </div>
            <XCircle size={40} className="opacity-50" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Saúde */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Score de Saúde
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={healthHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="recorded_at" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="overall_health_score" stroke="#3b82f6" fill="#93c5fd" name="Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de CPU e Memória */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Cpu size={20} />
            Uso de Recursos
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={healthHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="recorded_at" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cpu_usage" stroke="#ef4444" name="CPU %" />
              <Line type="monotone" dataKey="memory_usage" stroke="#f59e0b" name="Memória %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lista de Erros Recentes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity size={20} />
            Logs de Erros Recentes
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensagem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arquivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ocorrências</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentErrors.map((error) => (
                <tr key={error.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 text-sm font-mono text-blue-600">
                    {error.error_code}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityBadgeColor(error.severity)}`}>
                      {error.severity === 'warning' ? 'Aviso' : error.severity === 'danger' ? 'Perigo' : 'Urgente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{error.error_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                    {error.error_message}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono truncate max-w-xs">
                    {error.file_path ? (
                      <span title={error.file_path}>
                        {error.file_path.split('/').pop()}
                        {error.line_number && `:${error.line_number}`}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {error.occurrence_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(error.discovered_at).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
