import fs from 'node:fs';
import path from 'node:path';

const raiz = process.cwd();
const estrito = process.argv.includes('--strict');

const diretoriosAnalisados = ['app', 'src'];
const extensoesValidas = new Set(['.ts', '.tsx']);
const ignorarCaminhos = [
  'node_modules',
  '.next',
  'dist',
  'coverage',
  'src/pages-react-router',
];

function listarArquivos(diretorio) {
  const arquivos = [];
  const itens = fs.readdirSync(diretorio, { withFileTypes: true });

  for (const item of itens) {
    const caminhoAbsoluto = path.join(diretorio, item.name);
    const caminhoRelativo = path.relative(raiz, caminhoAbsoluto).replaceAll('\\', '/');
    if (ignorarCaminhos.some((ignorado) => caminhoRelativo.startsWith(ignorado))) {
      continue;
    }

    if (item.isDirectory()) {
      arquivos.push(...listarArquivos(caminhoAbsoluto));
      continue;
    }

    if (extensoesValidas.has(path.extname(item.name))) {
      arquivos.push(caminhoAbsoluto);
    }
  }

  return arquivos;
}

function contarLinhas(conteudo) {
  return conteudo.split('\n').length;
}

function contarOcorrencias(regex, conteudo) {
  return [...conteudo.matchAll(regex)].length;
}

const regras = [
  {
    id: 'sem-else',
    descricao: 'Evitar else/else if (preferir guard clauses)',
    regex: /\belse\s+if\b|\belse\b/g,
  },
  {
    id: 'sem-style-inline',
    descricao: 'Evitar style={{}} (usar CSS Modules)',
    regex: /style=\{\{/g,
  },
  {
    id: 'imports-profundos',
    descricao: 'Evitar import relativo profundo (../../../)',
    regex: /from\s+['"]\.\.\/\.\.\//g,
  },
];

const violacoes = [];
let totalArquivos = 0;

for (const dir of diretoriosAnalisados) {
  const base = path.join(raiz, dir);
  if (!fs.existsSync(base)) continue;
  const arquivos = listarArquivos(base);
  totalArquivos += arquivos.length;

  for (const arquivo of arquivos) {
    const conteudo = fs.readFileSync(arquivo, 'utf-8');
    const caminhoRelativo = path.relative(raiz, arquivo).replaceAll('\\', '/');
    const linhas = contarLinhas(conteudo);

    if (linhas > 150) {
      violacoes.push({
        regra: 'max-150-linhas',
        caminho: caminhoRelativo,
        total: linhas,
      });
    }

    for (const regra of regras) {
      const total = contarOcorrencias(regra.regex, conteudo);
      if (total === 0) continue;
      violacoes.push({
        regra: regra.id,
        caminho: caminhoRelativo,
        total,
      });
    }
  }
}

const resumo = new Map();
for (const violacao of violacoes) {
  const atual = resumo.get(violacao.regra) ?? 0;
  resumo.set(violacao.regra, atual + 1);
}

console.log(`Arquivos analisados: ${totalArquivos}`);
console.log(`Arquivos com violacao: ${new Set(violacoes.map((v) => v.caminho)).size}`);
for (const [regra, total] of resumo.entries()) {
  console.log(`- ${regra}: ${total}`);
}

if (violacoes.length > 0) {
  console.log('\nTop violacoes:');
  for (const violacao of violacoes.slice(0, 30)) {
    console.log(`- ${violacao.caminho} -> ${violacao.regra} (${violacao.total})`);
  }
}

if (estrito && violacoes.length > 0) {
  process.exit(1);
}
