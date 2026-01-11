import os from 'os';
import osUtils from 'os-utils';
import { promisify } from 'util';
import axios from 'axios';
import { testDatabaseConnection } from './database.js';

const getCpuUsage = promisify(osUtils.cpuUsage);

/**
 * Coleta métricas de CPU
 */
export async function collectCpuMetrics() {
  try {
    const usage = await getCpuUsage();
    return Math.round(usage * 100);
  } catch (error) {
    console.error('Erro ao coletar CPU:', error);
    return 0;
  }
}

/**
 * Coleta métricas de memória
 */
export function collectMemoryMetrics() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const usage = (usedMem / totalMem) * 100;
  
  return {
    total: totalMem,
    free: freeMem,
    used: usedMem,
    percentage: Math.round(usage)
  };
}

/**
 * Coleta métricas de disco
 */
export async function collectDiskMetrics() {
  // Implementação simplificada - em produção usar biblioteca como 'diskusage'
  return {
    percentage: 50 // Placeholder
  };
}

/**
 * Testa status do banco de dados
 */
export async function checkDatabaseHealth() {
  const startTime = Date.now();
  
  try {
    const isHealthy = await testDatabaseConnection();
    const responseTime = Date.now() - startTime;
    
    return {
      status: isHealthy ? 'healthy' : 'down',
      responseTime,
      isHealthy
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      isHealthy: false,
      error: error.message
    };
  }
}

/**
 * Verifica status de endpoints da API
 */
export async function checkApiEndpoints() {
  const endpoints = [
    'http://localhost:5173', // Site público
    'http://localhost:5174', // Admin panel
  ];
  
  let healthyCount = 0;
  let failedCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint, { timeout: 3000 });
      if (response.status === 200) {
        healthyCount++;
      } else {
        failedCount++;
      }
    } catch (error) {
      failedCount++;
    }
  }
  
  return {
    checked: endpoints.length,
    healthy: healthyCount,
    failed: failedCount
  };
}

/**
 * Simula coleta de estatísticas de tráfego
 * Em produção, isso viria de analytics ou logs do servidor
 */
export function collectTrafficMetrics() {
  return {
    activeUsers: Math.floor(Math.random() * 100), // Placeholder
    requestsPerMinute: Math.floor(Math.random() * 1000), // Placeholder
    averageResponseTime: Math.floor(Math.random() * 200) + 50 // 50-250ms
  };
}

/**
 * Coleta todas as métricas do sistema
 */
export async function collectAllMetrics() {
  const startTime = Date.now();
  
  try {
    const [cpu, memory, disk, database, api, traffic] = await Promise.all([
      collectCpuMetrics(),
      Promise.resolve(collectMemoryMetrics()),
      collectDiskMetrics(),
      checkDatabaseHealth(),
      checkApiEndpoints(),
      Promise.resolve(collectTrafficMetrics())
    ]);
    
    const collectTime = Date.now() - startTime;
    
    return {
      timestamp: new Date().toISOString(),
      collectTime,
      cpu_usage: cpu,
      memory_usage: memory.percentage,
      disk_usage: disk.percentage,
      database_status: database.status,
      database_response_time: database.responseTime,
      api_endpoints_checked: api.checked,
      api_endpoints_healthy: api.healthy,
      api_endpoints_failed: api.failed,
      active_users: traffic.activeUsers,
      requests_per_minute: traffic.requestsPerMinute,
      average_response_time: traffic.averageResponseTime
    };
  } catch (error) {
    console.error('Erro ao coletar métricas:', error);
    return null;
  }
}
