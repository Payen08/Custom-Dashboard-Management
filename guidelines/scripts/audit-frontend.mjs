import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const args = process.argv.slice(2);
const reportOnly = args.includes('--report-only');
const targetArg = args.find(arg => !arg.startsWith('--'));

if (!targetArg) {
  console.error('用法：npm run audit -- <业务源码目录> [--report-only]');
  process.exit(2);
}

const target = resolve(process.cwd(), targetArg);
if (!existsSync(target) || !statSync(target).isDirectory()) {
  console.error(`审计目录不存在：${target}`);
  process.exit(2);
}

const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.less']);
const ignoredSegments = new Set(['node_modules', 'dist', 'build', 'coverage', '.git']);
const implementationAllowlist = [/ProductUI\.[tj]sx?$/, /ArcoLike\.[tj]sx?$/, /[/\\]ui[/\\]/, /[/\\]adapters?[/\\]/, /[/\\]theme(s)?[/\\]?/];
const findings = [];

function walk(directory) {
  return readdirSync(directory).flatMap(name => {
    if (ignoredSegments.has(name)) return [];
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : extensions.has(extname(path)) ? [path] : [];
  });
}

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length;
}

function add(path, source, match, severity, rule, message) {
  findings.push({ severity, rule, file: relative(target, path), line: lineOf(source, match.index), message });
}

for (const path of walk(target)) {
  const source = readFileSync(path, 'utf8');
  const allowedImplementation = implementationAllowlist.some(pattern => pattern.test(path));
  const checks = [
    { regex: /<select\b/g, severity: 'error', rule: 'native-select', message: '业务页面不得使用原生 select；映射到批准的 ProductSelect。' },
    { regex: /from\s+['"](@heroui\/react|@mui\/material|@mui\/icons-material|@radix-ui\/[^'"]+)['"]/g, severity: 'error', rule: 'direct-ui-import', message: '业务页面不得直接依赖底层 UI 库；通过 ProductUI 入口接入。', skip: allowedImplementation },
    { regex: /z-index\s*:\s*(?!var\()[^;\n]+/g, severity: 'error', rule: 'arbitrary-z-index', message: '不得声明任意 z-index；使用已发布层级 Token。' },
    { regex: /className\s*=\s*[{"'][^\n}]*\b(?:modal|drawer)-(?:overlay|backdrop|container|panel)\b/gi, severity: 'error', rule: 'private-overlay', message: '检测到私有 Modal/Drawer 外观；使用批准的 ProductModal/ProductDrawer。' },
    { regex: /#[0-9a-fA-F]{3,8}\b/g, severity: 'warning', rule: 'hard-coded-color', message: '业务源码中发现硬编码颜色；确认是否应使用语义 Token。', skip: allowedImplementation },
    { regex: /style\s*=\s*\{\{/g, severity: 'warning', rule: 'inline-style', message: '发现页面内联样式；确认其仅为业务布局且没有覆盖基础组件契约。' }
  ];

  checks.forEach(check => {
    if (check.skip) return;
    for (const match of source.matchAll(check.regex)) add(path, source, match, check.severity, check.rule, check.message);
  });
}

if (!findings.length) {
  console.log('前端规范审计通过：未发现阻断项或警告。');
  process.exit(0);
}

findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
for (const finding of findings) {
  console.log(`${finding.severity.toUpperCase()} [${finding.rule}] ${finding.file}:${finding.line} ${finding.message}`);
}

const errors = findings.filter(item => item.severity === 'error').length;
const warnings = findings.length - errors;
console.log(`\n审计结果：${errors} 个阻断项，${warnings} 个警告。`);
if (errors && !reportOnly) process.exit(1);

