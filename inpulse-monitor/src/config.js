import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const config = {
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },

  // Gemini AI
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },

  // Monitor settings
  monitor: {
    intervalMs: parseInt(process.env.MONITOR_INTERVAL_MS) || 1000,
    healthCheckIntervalMs: parseInt(process.env.HEALTH_CHECK_INTERVAL_MS) || 5000,
    maxErrorsPerBatch: parseInt(process.env.MAX_ERRORS_PER_BATCH) || 50,
  },

  // Paths to monitor
  paths: {
    admin: process.env.ADMIN_PATH || '../inpulse-admin',
    website: process.env.WEBSITE_PATH || '../Inpulse_website',
  },

  // Environment
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate required config
function validateConfig() {
  const errors = [];

  if (!config.supabase.url) errors.push('SUPABASE_URL is required');
  if (!config.supabase.serviceKey) errors.push('SUPABASE_SERVICE_KEY is required');
  if (!config.gemini.apiKey) errors.push('GEMINI_API_KEY is required');

  if (errors.length > 0) {
    console.error(chalk.red('\n❌ Configuração inválida:'));
    errors.forEach(error => console.error(chalk.red(`  - ${error}`)));
    console.error(chalk.yellow('\nCrie um arquivo .env baseado em .env.example\n'));
    process.exit(1);
  }
}

validateConfig();

export default config;
