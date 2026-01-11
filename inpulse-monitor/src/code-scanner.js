import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import config from './config.js';

/**
 * Escaneia arquivos recursivamente em um diretório
 */
async function scanDirectory(dirPath, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      // Ignora node_modules, dist, build, .git
      if (entry.name === 'node_modules' || 
          entry.name === 'dist' || 
          entry.name === 'build' ||
          entry.name === '.git') {
        continue;
      }
      
      if (entry.isDirectory()) {
        const subFiles = await scanDirectory(fullPath, extensions);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Diretório não existe ou sem permissão
    console.error(chalk.yellow(`⚠ Não foi possível ler: ${dirPath}`));
  }
  
  return files;
}

/**
 * Verifica sintaxe de um arquivo JavaScript/TypeScript
 */
async function checkFileSyntax(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Verificações básicas de sintaxe
    const errors = [];
    
    // Verifica parênteses/chaves balanceados
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push({
        type: 'syntax',
        message: `Chaves desbalanceadas: ${openBraces} aberturas, ${closeBraces} fechamentos`,
        file: filePath,
        line: null
      });
    }
    
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push({
        type: 'syntax',
        message: `Parênteses desbalanceados: ${openParens} aberturas, ${closeParens} fechamentos`,
        file: filePath,
        line: null
      });
    }
    
    // Verifica imports quebrados (linha que começa com import mas não tem 'from')
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('import ') && !trimmed.includes('from') && !trimmed.endsWith(';')) {
        errors.push({
          type: 'syntax',
          message: 'Import statement incompleto',
          file: filePath,
          line: index + 1,
          snippet: line
        });
      }
    });
    
    return errors;
  } catch (error) {
    return [{
      type: 'file_error',
      message: `Não foi possível ler o arquivo: ${error.message}`,
      file: filePath,
      line: null
    }];
  }
}

/**
 * Verifica arquivos corrompidos
 */
async function checkCorruptedFiles(filePath) {
  try {
    const stats = await fs.stat(filePath);
    
    // Verifica se o arquivo está vazio
    if (stats.size === 0) {
      return [{
        type: 'corrupted',
        message: 'Arquivo vazio',
        file: filePath,
        line: null
      }];
    }
    
    // Tenta ler o arquivo
    await fs.readFile(filePath, 'utf-8');
    
    return [];
  } catch (error) {
    return [{
      type: 'corrupted',
      message: `Arquivo pode estar corrompido: ${error.message}`,
      file: filePath,
      line: null
    }];
  }
}

/**
 * Escaneia código em busca de erros
 */
export async function scanCodeForErrors() {
  const startTime = Date.now();
  const errors = [];
  let filesChecked = 0;
  
  try {
    console.log(chalk.blue('🔍 Escaneando código...'));
    
    // Escaneia admin
    const adminPath = path.resolve(config.paths.admin);
    const adminFiles = await scanDirectory(path.join(adminPath, 'src'));
    
    // Escaneia website
    const websitePath = path.resolve(config.paths.website);
    const websiteFiles = await scanDirectory(path.join(websitePath, 'src'));
    
    const allFiles = [...adminFiles, ...websiteFiles];
    filesChecked = allFiles.length;
    
    console.log(chalk.blue(`📁 ${filesChecked} arquivos encontrados`));
    
    // Verifica cada arquivo (limitado a primeiros 100 para não sobrecarregar)
    const filesToCheck = allFiles.slice(0, 100);
    
    for (const file of filesToCheck) {
      const syntaxErrors = await checkFileSyntax(file);
      const corruptionErrors = await checkCorruptedFiles(file);
      
      errors.push(...syntaxErrors, ...corruptionErrors);
    }
    
    const scanTime = Date.now() - startTime;
    
    console.log(chalk.green(`✓ Scan completo em ${scanTime}ms`));
    console.log(chalk.yellow(`⚠ ${errors.length} problemas encontrados`));
    
    return {
      filesChecked,
      errorsFound: errors.length,
      errors,
      scanTime
    };
  } catch (error) {
    console.error(chalk.red('Erro no scan de código:'), error);
    return {
      filesChecked,
      errorsFound: 0,
      errors: [],
      scanTime: Date.now() - startTime
    };
  }
}

/**
 * Extrai snippet do código ao redor de uma linha específica
 */
export async function extractCodeSnippet(filePath, lineNumber, contextLines = 3) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const startLine = Math.max(0, lineNumber - contextLines - 1);
    const endLine = Math.min(lines.length, lineNumber + contextLines);
    
    const snippet = lines.slice(startLine, endLine).join('\n');
    
    return snippet;
  } catch (error) {
    return `Não foi possível extrair snippet: ${error.message}`;
  }
}
