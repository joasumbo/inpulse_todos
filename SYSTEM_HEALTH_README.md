# 🏥 Sistema de Monitoramento e Saúde - Inpulse

Sistema completo de gerenciamento de erros com análise de IA (Google Gemini), monitoramento em tempo real e dashboard administrativo.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Funcionalidades](#funcionalidades)
- [Dashboard](#dashboard)
- [API e Integrações](#api-e-integrações)

## 🎯 Visão Geral

O Sistema de Monitoramento Inpulse é uma solução completa que:

- ✅ Monitora erros em tempo real
- 🤖 Analisa erros com IA (Google Gemini)
- 📊 Gera métricas e gráficos de saúde
- 🔍 Escaneia código fonte automaticamente
- 📝 Cria documentação automática de erros
- 💡 Sugere soluções e melhorias
- ⚡ Classifica erros por severidade (Warning/Perigo/Urgente)

## 🏗️ Arquitetura

### Componentes

```
inpulsev2/
├── inpulse-monitor/          # Serviço de monitoramento (Node.js)
│   ├── src/
│   │   ├── index.js          # Entrada principal
│   │   ├── config.js         # Configurações
│   │   ├── database.js       # Cliente Supabase
│   │   ├── ai-service.js     # Integração Gemini AI
│   │   ├── metrics-collector.js  # Coleta de métricas
│   │   └── code-scanner.js   # Scanner de código
│   └── package.json
│
├── inpulse-admin/            # Painel administrativo (React)
│   └── src/
│       └── pages/
│           └── SystemHealthPage.tsx  # Dashboard de saúde
│
└── system-health-setup.sql   # Schema do banco de dados
```

### Tecnologias

- **Backend Monitor**: Node.js 20+, ES Modules
- **IA**: Google Gemini 2.0 Flash
- **Banco de Dados**: Supabase (PostgreSQL)
- **Frontend**: React 19, TypeScript, Recharts
- **Agendamento**: node-cron
- **Métricas**: os-utils, axios

## 📦 Instalação

### 1. Banco de Dados

Execute o SQL no Supabase SQL Editor:

\`\`\`bash
# Abra system-health-setup.sql e execute no Supabase
\`\`\`

Isso criará as tabelas:
- `system_logs` - Logs de erros com análise IA
- `system_health` - Métricas de saúde
- `error_patterns` - Padrões identificados
- `monitor_status` - Status do assistente
- `ai_improvement_suggestions` - Sugestões de melhorias

### 2. Serviço de Monitoramento

\`\`\`bash
cd inpulse-monitor
npm install
\`\`\`

### 3. Painel Admin (se ainda não instalado)

\`\`\`bash
cd inpulse-admin
npm install framer-motion  # Para notificações
\`\`\`

## ⚙️ Configuração

### 1. Variáveis de Ambiente - Monitor

Crie `.env` em `inpulse-monitor/`:

\`\`\`env
# Supabase
SUPABASE_URL=https://mqkqfpbaxnjtadinctek.supabase.co
SUPABASE_SERVICE_KEY=sua-chave-service-role-aqui

# Google Gemini AI
GEMINI_API_KEY=sua-chave-gemini-aqui

# Configurações
MONITOR_INTERVAL_MS=5000
HEALTH_CHECK_INTERVAL_MS=5000
MAX_ERRORS_PER_BATCH=50

# Caminhos
ADMIN_PATH=../inpulse-admin
WEBSITE_PATH=../Inpulse_website

# Ambiente
NODE_ENV=production
LOG_LEVEL=info
\`\`\`

### 2. Obter API Key do Gemini

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API Key
3. Cole em `GEMINI_API_KEY`

### 3. Obter Service Role Key do Supabase

1. Acesse seu projeto no Supabase
2. Settings → API
3. Copie a `service_role` key (não a anon key!)
4. Cole em `SUPABASE_SERVICE_KEY`

## 🚀 Uso

### Iniciar o Monitor

\`\`\`bash
cd inpulse-monitor

# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
\`\`\`

Você verá:

\`\`\`
🚀 INICIANDO SISTEMA DE MONITORAMENTO INPULSE
============================================================
Intervalo: 5000ms
Ambiente: production
============================================================

🔌 Testando conexões...
✓ Banco de dados OK
✓ Gemini AI OK

🔍 VERIFICAÇÃO DO SISTEMA #1
⏰ 24/12/2025 13:45:30
============================================================
📡 Testando conectividade...
✓ Banco de dados OK
✓ Gemini AI OK

📊 Coletando métricas...
   CPU: 45%
   Memória: 62%
   Database: 15ms
   APIs: 2/2 saudáveis

🔍 Escaneando código...
   Arquivos verificados: 156
   Erros encontrados: 3
   Tempo de scan: 2345ms

✓ Verificação completa em 3.45s
\`\`\`

### Acessar o Dashboard

1. Inicie o painel admin:
   \`\`\`bash
   cd inpulse-admin
   npm run dev
   \`\`\`

2. Acesse: http://localhost:5174/system-health

3. Faça login como Super Admin

## 🎨 Funcionalidades

### 1. Monitoramento em Tempo Real

O assistente executa verificações a cada 5 segundos:

- ✅ Verifica conectividade (DB, IA, APIs)
- ✅ Coleta métricas (CPU, memória, disco)
- ✅ Escaneia código fonte
- ✅ Detecta erros e problemas
- ✅ Analisa com IA
- ✅ Registra no banco de dados

### 2. Classificação de Erros

Cada erro recebe uma severidade:

| Severidade | Cor    | Descrição |
|-----------|--------|-----------|
| **Warning** | 🟡 Amarelo | Erros normais, sem ameaça grave |
| **Danger**  | 🟠 Laranja | Erros que podem comprometer o sistema |
| **Urgent**  | 🔴 Vermelho | Erros críticos, funcionalidades paradas |

### 3. Código de Erro

Formato: `DDMMYYYY-TIP-CAT`

Exemplo: `24122025-syn-bre`
- Data: 24/12/2025
- Tipo: syntax (sintaxe)
- Categoria: braces (chaves)

### 4. Análise com IA

Para cada erro, a IA gera:

- 📄 **Descrição detalhada** do erro
- 📚 **Mini documentação** explicando causa
- 💡 **Sugestões de solução** (múltiplas)
- ⚠️ **Avaliação de risco**
- 📈 **Impacto previsto** no sistema
- 🔍 **Causa raiz** provável

### 5. Detecção de Padrões

A IA identifica:

- Erros recorrentes
- Padrões comportamentais
- Vulnerabilidades comuns
- Sugestões de prevenção

### 6. Sugestões de Melhorias

A IA audita o sistema e sugere:

- 🚀 Melhorias de performance
- 🔒 Melhorias de segurança
- 📝 Melhorias de qualidade de código
- 📊 Melhorias de escalabilidade

## 📊 Dashboard

### Status do Assistente

```
┌─────────────────────────────────────────────┐
│ Assistente de Logs                          │
│ ✓ Trabalhando  3.5s                         │
│                                             │
│ Erros: 12  |  Avisos: 45  |  Score: 87     │
│                                             │
│ ✓ Banco de dados: OK                        │
│ ✓ Gemini AI: OK                             │
│ ✓ Monitor: OK                               │
└─────────────────────────────────────────────┘
```

### Cards de Estatísticas

- 🟡 **Avisos**: Quantidade de warnings ativos
- 🟠 **Perigos**: Erros de risco médio
- 🔴 **Urgentes**: Erros críticos

### Gráficos

1. **Score de Saúde**: Linha do tempo do score (0-100)
2. **Uso de Recursos**: CPU e Memória ao longo do tempo
3. **Erros por Hora**: Distribuição temporal

### Tabela de Logs

Mostra últimos 20 erros com:
- Código único
- Severidade (badge colorido)
- Tipo e mensagem
- Arquivo e linha
- Contagem de ocorrências
- Data/hora

**Clique em um erro** para ver:
- Análise completa da IA
- Trecho do código
- Sugestões de solução
- Histórico de ocorrências

## 🔌 API e Integrações

### Funções do Banco de Dados

\`\`\`typescript
// Inserir log de erro
await insertSystemLog({
  error_code: '24122025-syn-bre',
  severity: 'warning',
  error_type: 'syntax',
  error_message: 'Chaves desbalanceadas',
  file_path: '/src/App.tsx',
  line_number: 45,
  ai_description: 'Descrição gerada pela IA...',
  ai_solution_suggestions: ['Solução 1', 'Solução 2']
});

// Inserir métrica de saúde
await insertSystemHealth({
  cpu_usage: 45.5,
  memory_usage: 62.3,
  overall_health_score: 87,
  health_status: 'healthy'
});

// Atualizar status do monitor
await updateMonitorStatus({
  is_running: true,
  check_duration_ms: 3500,
  errors_found: 3
});
\`\`\`

### Integração com Gemini

\`\`\`typescript
// Analisar erro
const analysis = await analyzeErrorWithAI({
  errorMessage: 'TypeError: undefined is not a function',
  errorType: 'runtime',
  filePath: '/src/App.tsx',
  lineNumber: 42
});

// Avaliar saúde
const health = await assessSystemHealth({
  cpu_usage: 45,
  memory_usage: 62,
  errors_last_minute: 3
});
\`\`\`

## 🎯 Próximos Passos

### Ainda Por Implementar

- [ ] Página de detalhes de erro individual
- [ ] Sistema de permissões multi-tenant
- [ ] Páginas de erro personalizadas (404, 403)
- [ ] Validação de URLs e redirecionamentos
- [ ] Paginação otimizada (20 itens)
- [ ] Notificações em tempo real (WebSocket)
- [ ] Exportar relatórios (PDF/CSV)
- [ ] Integração com Slack/Discord
- [ ] Machine Learning para previsão de erros

## 🔧 Troubleshooting

### Monitor não inicia

1. Verifique as variáveis de ambiente
2. Teste conectividade:
   \`\`\`bash
   npm run test
   \`\`\`

### IA não funciona

1. Verifique a API Key do Gemini
2. Verifique quota da API
3. Teste manualmente em [Google AI Studio](https://makersuite.google.com/)

### Dashboard vazio

1. Certifique-se de que o monitor está rodando
2. Verifique RLS policies no Supabase
3. Confirme que o usuário é Super Admin

### Erros não aparecem

1. Verifique se há erros reais no código
2. Aguarde 5 segundos (intervalo de scan)
3. Verifique logs do monitor no terminal

## 📝 Licença

© 2025 Inpulse Events. Todos os direitos reservados.

---

**Desenvolvido com ❤️ por Inpulse Team**

Para suporte: admin@inpulse-events.com
