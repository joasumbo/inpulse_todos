import { GoogleGenerativeAI } from '@google/generative-ai';
import config from './config.js';
import chalk from 'chalk';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  }
});

/**
 * Gera código de erro único baseado em data, tipo e categoria
 */
export function generateErrorCode(errorType, category) {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  const typeAbbr = errorType.substring(0, 3).toLowerCase();
  const catAbbr = category.substring(0, 3).toLowerCase();
  
  return `${day}${month}${year}-${typeAbbr}-${catAbbr}`;
}

/**
 * Classifica erro e gera análise completa com IA
 */
export async function analyzeErrorWithAI(errorData) {
  try {
    const prompt = `
Você é um especialista em análise de erros de sistemas. Analise o seguinte erro e forneça uma resposta em JSON:

ERRO:
- Mensagem: ${errorData.errorMessage}
- Tipo: ${errorData.errorType || 'desconhecido'}
- Arquivo: ${errorData.filePath || 'não especificado'}
- Linha: ${errorData.lineNumber || 'não especificada'}
- Stack Trace: ${errorData.stackTrace || 'não disponível'}

Forneça a análise no seguinte formato JSON:
{
  "severity": "warning | danger | urgent",
  "category": "categoria específica do erro (ex: syntax_error, null_reference, database_connection)",
  "description": "descrição detalhada do erro em português",
  "documentation": "mini documentação explicando quando e por que este erro ocorre",
  "solutions": ["solução 1", "solução 2", "solução 3"],
  "riskAssessment": "avaliação do risco que este erro representa",
  "predictedImpact": "impacto previsto no sistema",
  "rootCause": "causa raiz provável do erro"
}

IMPORTANTE: 
- Seja objetivo e técnico
- Use português brasileiro
- "severity" deve ser "warning" para erros normais, "danger" para erros que podem comprometer o sistema, "urgent" para erros críticos que param funcionalidades
- Retorne APENAS o JSON, sem texto adicional
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Remove markdown code blocks se existirem
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const analysis = JSON.parse(jsonText);
    
    console.log(chalk.green('✓ Análise IA concluída para erro'));
    
    return {
      severity: analysis.severity || 'warning',
      category: analysis.category || 'unknown',
      aiDescription: analysis.description,
      aiDocumentation: analysis.documentation,
      aiSolutionSuggestions: analysis.solutions || [],
      aiRiskAssessment: analysis.riskAssessment,
      aiPredictedImpact: analysis.predictedImpact,
      rootCause: analysis.rootCause
    };
  } catch (error) {
    console.error(chalk.red('Erro na análise IA:'), error.message);
    
    // Fallback: classificação básica sem IA
    return {
      severity: 'warning',
      category: errorData.errorType || 'unknown',
      aiDescription: errorData.errorMessage,
      aiDocumentation: 'Análise IA não disponível',
      aiSolutionSuggestions: ['Verifique os logs do sistema', 'Revise o código mencionado'],
      aiRiskAssessment: 'Não avaliado',
      aiPredictedImpact: 'Não determinado',
      rootCause: 'Não determinado'
    };
  }
}

/**
 * Analisa padrões de erros e sugere prevenção
 */
export async function analyzeErrorPatterns(errors) {
  try {
    const errorSummary = errors.map(e => ({
      type: e.error_type,
      message: e.error_message,
      file: e.file_path,
      count: e.occurrence_count
    }));

    const prompt = `
Você é um especialista em análise de padrões de erros. Analise os seguintes erros recorrentes:

${JSON.stringify(errorSummary, null, 2)}

Identifique padrões e forneça análise em JSON:
{
  "patterns": [
    {
      "name": "nome do padrão identificado",
      "description": "descrição do padrão",
      "errorTypes": ["tipo1", "tipo2"],
      "severity": "warning | danger | urgent",
      "rootCause": "causa raiz do padrão",
      "preventionSteps": ["passo 1", "passo 2"],
      "mitigationSteps": ["passo 1", "passo 2"]
    }
  ]
}

Retorne APENAS o JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(jsonText);
    
    console.log(chalk.green(`✓ ${analysis.patterns?.length || 0} padrões identificados pela IA`));
    
    return analysis.patterns || [];
  } catch (error) {
    console.error(chalk.red('Erro na análise de padrões:'), error.message);
    return [];
  }
}

/**
 * Gera sugestões de melhorias para o sistema
 */
export async function generateImprovementSuggestions(systemMetrics) {
  try {
    const prompt = `
Você é um auditor de sistemas. Analise as métricas e sugira melhorias:

MÉTRICAS:
- CPU: ${systemMetrics.cpuUsage}%
- Memória: ${systemMetrics.memoryUsage}%
- Erros última hora: ${systemMetrics.errorsLastHour}
- Warnings última hora: ${systemMetrics.warningsLastHour}
- Tempo médio de resposta: ${systemMetrics.avgResponseTime}ms
- Status do banco: ${systemMetrics.databaseStatus}

Forneça sugestões em JSON:
{
  "suggestions": [
    {
      "category": "performance | security | code_quality | scalability",
      "priority": "low | medium | high | critical",
      "title": "título da sugestão",
      "description": "descrição detalhada",
      "technicalDetails": "detalhes técnicos",
      "estimatedImpact": "impacto estimado",
      "implementationComplexity": "low | medium | high"
    }
  ]
}

Retorne APENAS o JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(jsonText);
    
    console.log(chalk.green(`✓ ${analysis.suggestions?.length || 0} sugestões geradas pela IA`));
    
    return analysis.suggestions || [];
  } catch (error) {
    console.error(chalk.red('Erro ao gerar sugestões:'), error.message);
    return [];
  }
}

/**
 * Avalia saúde geral do sistema
 */
export async function assessSystemHealth(healthData) {
  try {
    const prompt = `
Você é um especialista em saúde de sistemas. Avalie o sistema baseado nestas métricas:

${JSON.stringify(healthData, null, 2)}

Forneça avaliação em JSON:
{
  "healthScore": 0-100,
  "healthStatus": "healthy | degraded | critical",
  "assessment": "avaliação detalhada em português",
  "recommendations": ["recomendação 1", "recomendação 2"],
  "predictedIssues": ["possível problema 1", "possível problema 2"]
}

Retorne APENAS o JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(jsonText);
    
    return {
      overallHealthScore: analysis.healthScore || 50,
      healthStatus: analysis.healthStatus || 'degraded',
      aiHealthAssessment: analysis.assessment,
      aiRecommendations: analysis.recommendations || [],
      aiPredictedIssues: analysis.predictedIssues || []
    };
  } catch (error) {
    console.error(chalk.red('Erro na avaliação de saúde:'), error.message);
    
    // Fallback: cálculo simples
    const score = Math.max(0, 100 - 
      (healthData.cpu_usage > 80 ? 30 : 0) -
      (healthData.memory_usage > 80 ? 30 : 0) -
      (healthData.errors_last_minute * 2)
    );
    
    return {
      overallHealthScore: score,
      healthStatus: score > 70 ? 'healthy' : score > 40 ? 'degraded' : 'critical',
      aiHealthAssessment: 'Avaliação IA não disponível',
      aiRecommendations: [],
      aiPredictedIssues: []
    };
  }
}

/**
 * Testa conexão com Gemini AI
 */
export async function testAiConnection() {
  try {
    const result = await model.generateContent('Responda apenas "OK"');
    const response = await result.response;
    return response.text().includes('OK');
  } catch (error) {
    console.error(chalk.red('Erro ao testar Gemini AI:'), error.message);
    return false;
  }
}
