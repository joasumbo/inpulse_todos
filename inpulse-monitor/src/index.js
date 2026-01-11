import chalk from 'chalk';
import cron from 'node-cron';
import config from './config.js';
import {
  insertSystemLog,
  insertSystemHealth,
  updateMonitorStatus,
  findErrorByCode,
  updateErrorOccurrence,
  testDatabaseConnection
} from './database.js';
import {
  analyzeErrorWithAI,
  generateErrorCode,
  assessSystemHealth,
  testAiConnection
} from './ai-service.js';
import { collectAllMetrics } from './metrics-collector.js';
import { scanCodeForErrors } from './code-scanner.js';

let isRunning = false;
let lastCheckDuration = 0;
let checkCount = 0;

/**
 * Processa um erro detectado
 */
async function processError(error) {
  try {
    // Gera código de erro
    const errorCode = generateErrorCode(error.type, error.category || 'general');
    
    // Verifica se erro já existe
    const existingError = await findErrorByCode(errorCode);
    
    if (existingError) {
      // Atualiza contagem de ocorrências
      await updateErrorOccurrence(errorCode);
      return existingError;
    }
    
    // Analisa erro com IA
    console.log(chalk.blue(`🤖 Analisando erro com IA...`));
    const aiAnalysis = await analyzeErrorWithAI({
      errorMessage: error.message,
      errorType: error.type,
      filePath: error.file,
      lineNumber: error.line,
      stackTrace: error.snippet || ''
    });
    
    // Insere novo erro no banco
    const logData = {
      error_code: errorCode,
      severity: aiAnalysis.severity,
      error_type: error.type,
      error_category: aiAnalysis.category,
      file_path: error.file,
      line_number: error.line,
      code_snippet: error.snippet,
      error_message: error.message,
      ai_description: aiAnalysis.aiDescription,
      ai_documentation: aiAnalysis.aiDocumentation,
      ai_solution_suggestions: aiAnalysis.aiSolutionSuggestions,
      ai_risk_assessment: aiAnalysis.aiRiskAssessment,
      ai_predicted_impact: aiAnalysis.aiPredictedImpact
    };
    
    const inserted = await insertSystemLog(logData);
    
    if (inserted) {
      console.log(chalk.green(`✓ Erro registrado: ${errorCode}`));
    }
    
    return inserted;
  } catch (err) {
    console.error(chalk.red('Erro ao processar erro:'), err);
    return null;
  }
}

/**
 * Executa verificação completa do sistema
 */
async function runSystemCheck() {
  if (isRunning) {
    console.log(chalk.yellow('⚠ Verificação anterior ainda em andamento...'));
    return;
  }
  
  isRunning = true;
  const startTime = Date.now();
  checkCount++;
  
  try {
    console.log(chalk.cyan(`\n${'='.repeat(60)}`));
    console.log(chalk.cyan(`🔍 VERIFICAÇÃO DO SISTEMA #${checkCount}`));
    console.log(chalk.cyan(`⏰ ${new Date().toLocaleString('pt-BR')}`));
    console.log(chalk.cyan('='.repeat(60)));
    
    // 1. Testa conectividade
    console.log(chalk.blue('\n📡 Testando conectividade...'));
    const dbHealthy = await testDatabaseConnection();
    const aiHealthy = await testAiConnection();
    
    console.log(dbHealthy ? chalk.green('✓ Banco de dados OK') : chalk.red('✗ Banco de dados falhou'));
    console.log(aiHealthy ? chalk.green('✓ Gemini AI OK') : chalk.red('✗ Gemini AI falhou'));
    
    // 2. Coleta métricas
    console.log(chalk.blue('\n📊 Coletando métricas...'));
    const metrics = await collectAllMetrics();
    
    if (metrics) {
      console.log(chalk.white(`   CPU: ${metrics.cpu_usage}%`));
      console.log(chalk.white(`   Memória: ${metrics.memory_usage}%`));
      console.log(chalk.white(`   Database: ${metrics.database_response_time}ms`));
      console.log(chalk.white(`   APIs: ${metrics.api_endpoints_healthy}/${metrics.api_endpoints_checked} saudáveis`));
    }
    
    // 3. Escaneia código
    console.log(chalk.blue('\n🔍 Escaneando código...'));
    const scanResult = await scanCodeForErrors();
    
    console.log(chalk.white(`   Arquivos verificados: ${scanResult.filesChecked}`));
    console.log(chalk.white(`   Erros encontrados: ${scanResult.errorsFound}`));
    console.log(chalk.white(`   Tempo de scan: ${scanResult.scanTime}ms`));
    
    // 4. Processa erros encontrados
    if (scanResult.errors.length > 0) {
      console.log(chalk.blue('\n🤖 Processando erros com IA...'));
      
      // Processa no máximo 5 erros por vez para não sobrecarregar
      const errorsToProcess = scanResult.errors.slice(0, 5);
      
      for (const error of errorsToProcess) {
        await processError(error);
      }
    }
    
    // 5. Avalia saúde com IA
    if (metrics && aiHealthy) {
      console.log(chalk.blue('\n🏥 Avaliando saúde do sistema com IA...'));
      const healthAssessment = await assessSystemHealth(metrics);
      
      // Insere métricas de saúde com análise da IA
      const healthData = {
        ...metrics,
        ...healthAssessment,
        errors_last_minute: scanResult.errorsFound,
        warnings_last_minute: scanResult.errors.filter(e => e.type === 'warning').length
      };
      
      await insertSystemHealth(healthData);
      
      console.log(chalk.white(`   Score de saúde: ${healthAssessment.overallHealthScore}/100`));
      console.log(chalk.white(`   Status: ${healthAssessment.healthStatus}`));
    }
    
    // 6. Atualiza status do monitor
    lastCheckDuration = Date.now() - startTime;
    
    await updateMonitorStatus({
      is_running: true,
      last_check_at: new Date().toISOString(),
      check_duration_ms: lastCheckDuration,
      monitor_healthy: true,
      ai_service_healthy: aiHealthy,
      database_healthy: dbHealthy,
      status_message: 'Trabalhando',
      files_checked: scanResult.filesChecked,
      errors_found: scanResult.errorsFound,
      warnings_found: scanResult.errors.filter(e => e.type === 'warning').length
    });
    
    console.log(chalk.green(`\n✓ Verificação completa em ${(lastCheckDuration / 1000).toFixed(2)}s`));
    console.log(chalk.cyan('='.repeat(60)));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Erro na verificação:'), error);
    
    // Registra erro do próprio monitor
    await updateMonitorStatus({
      is_running: false,
      monitor_healthy: false,
      status_message: 'Erro',
      error_message: error.message
    });
  } finally {
    isRunning = false;
  }
}

/**
 * Inicia o monitor
 */
async function startMonitor() {
  console.log(chalk.bold.green('\n🚀 INICIANDO SISTEMA DE MONITORAMENTO INPULSE'));
  console.log(chalk.white('=' .repeat(60)));
  console.log(chalk.white(`Intervalo: ${config.monitor.intervalMs}ms`));
  console.log(chalk.white(`Ambiente: ${config.env}`));
  console.log(chalk.white('='.repeat(60)));
  
  // Testa conectividade inicial
  console.log(chalk.blue('\n🔌 Testando conexões...'));
  
  const dbOk = await testDatabaseConnection();
  const aiOk = await testAiConnection();
  
  if (!dbOk) {
    console.error(chalk.red('❌ Não foi possível conectar ao banco de dados'));
    console.error(chalk.yellow('Verifique SUPABASE_URL e SUPABASE_SERVICE_KEY no .env'));
    process.exit(1);
  }
  
  if (!aiOk) {
    console.error(chalk.red('❌ Não foi possível conectar ao Gemini AI'));
    console.error(chalk.yellow('Verifique GEMINI_API_KEY no .env'));
    process.exit(1);
  }
  
  console.log(chalk.green('✓ Todas as conexões OK\n'));
  
  // Executa primeira verificação imediatamente
  await runSystemCheck();
  
  // Agenda verificações periódicas (a cada 5 segundos)
  cron.schedule('*/5 * * * * *', async () => {
    await runSystemCheck();
  });
  
  console.log(chalk.green('\n✓ Monitor ativo e executando verificações a cada 5 segundos'));
  console.log(chalk.gray('Pressione Ctrl+C para parar\n'));
}

/**
 * Encerra o monitor graciosamente
 */
async function stopMonitor() {
  console.log(chalk.yellow('\n⚠ Encerrando monitor...'));
  
  await updateMonitorStatus({
    is_running: false,
    status_message: 'Parado manualmente'
  });
  
  console.log(chalk.green('✓ Monitor encerrado'));
  process.exit(0);
}

// Handlers de sinais
process.on('SIGINT', stopMonitor);
process.on('SIGTERM', stopMonitor);

// Inicia o monitor
startMonitor().catch(error => {
  console.error(chalk.red('Erro fatal:'), error);
  process.exit(1);
});
