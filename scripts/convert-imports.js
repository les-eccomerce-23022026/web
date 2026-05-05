#!/usr/bin/env node

/**
 * Script para converter imports @/ para imports relativos
 * Uso: node scripts/convert-imports.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const APP_DIR = path.join(ROOT_DIR, 'app');

// Mapa de aliases para diretórios
const ALIAS_MAP = {
  '@': SRC_DIR,
};

// Extensões de arquivo para processar
const EXTENSIONS = ['.ts', '.tsx'];

/**
 * Calcula o caminho relativo entre dois arquivos
 */
function getRelativePath(from, to) {
  const relative = path.relative(path.dirname(from), to);
  return relative.startsWith('.') ? relative : `./${relative}`;
}

/**
 * Converte um import com alias para import relativo
 */
function convertImport(importPath, filePath) {
  // Garante que importPath é string
  if (typeof importPath !== 'string') {
    return importPath;
  }
  
  // Verifica se o import usa alias
  for (const [alias, targetDir] of Object.entries(ALIAS_MAP)) {
    if (importPath.startsWith(`${alias}/`)) {
      const relativePath = importPath.replace(`${alias}/`, '');
      const targetFile = path.join(targetDir, relativePath);
      
      // Adiciona extensão .ts se não tiver
      const targetWithExt = EXTENSIONS.includes(path.extname(targetFile))
        ? targetFile
        : `${targetFile}.ts`;
      
      // Verifica se o arquivo existe (com ou sem .tsx)
      const finalTarget = fs.existsSync(targetWithExt)
        ? targetWithExt
        : fs.existsSync(targetWithExt.replace('.ts', '.tsx'))
        ? targetWithExt.replace('.ts', '.tsx')
        : targetWithExt;
      
      return getRelativePath(filePath, finalTarget);
    }
  }
  
  return importPath; // Não converte se não for alias
}

/**
 * Processa um arquivo TypeScript
 */
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Regex para encontrar imports - captura apenas o caminho entre aspas
  const importRegex = /from\s+['"]([^'"]+)['"]/g;
  
  let newContent = content;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const importPath = match[1];
    
    if (typeof importPath !== 'string') {
      continue;
    }
    
    const newImportPath = convertImport(importPath, filePath);
    
    if (newImportPath !== importPath) {
      modified = true;
      console.log(`  ${filePath}: ${importPath} → ${newImportPath}`);
      newContent = newContent.replace(fullMatch, fullMatch.replace(importPath, newImportPath));
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    return true;
  }
  
  return false;
}

/**
 * Encontra todos os arquivos TypeScript em um diretório
 */
function findTypeScriptFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      findTypeScriptFiles(fullPath, files);
    } else if (entry.isFile() && EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Função principal
 */
function main() {
  console.log('🔧 Convertendo imports @/ para relativos...');
  console.log(`📁 Diretório raiz: ${ROOT_DIR}`);
  console.log(`📁 Diretório src: ${SRC_DIR}`);
  console.log(`📁 Diretório app: ${APP_DIR}`);
  console.log('');
  
  // Encontra todos os arquivos TypeScript em src/ e app/
  const files = [
    ...findTypeScriptFiles(SRC_DIR),
    ...findTypeScriptFiles(APP_DIR),
  ];
  
  console.log(`📊 Encontrados ${files.length} arquivos TypeScript`);
  console.log('');
  
  let convertedCount = 0;
  
  for (const file of files) {
    if (processFile(file)) {
      convertedCount++;
    }
  }
  
  console.log('');
  console.log(`✅ Conversão concluída: ${convertedCount} arquivos modificados`);
  
  if (convertedCount > 0) {
    console.log('');
    console.log('⚠️  Revise as mudanças antes de commitar');
    console.log('⚠️  Execute `npm run lint` para validar');
  }
}

main();
