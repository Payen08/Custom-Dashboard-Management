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
const implementationAllowlist = [/ProductUI\.[tj]sx?$/, /ArcoLike\.[tj]sx?$/, /[/\\]ui[/\\]/, /[/\\]adapters?[/\\]/, /[/\\]theme(s)?[/\\]?/, /[/\\]styles[/\\](?:design-system|arco-like)\.css$/];
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
    { regex: /z-index\s*:\s*(?!var\()[^;\n]+/g, severity: 'error', rule: 'arbitrary-z-index', message: '不得声明任意 z-index；使用已发布层级 Token。', skip: allowedImplementation },
    { regex: /className\s*=\s*[{"'][^\n}]*\b(?:modal|drawer)-(?:overlay|backdrop|container|panel)\b/gi, severity: 'error', rule: 'private-overlay', message: '检测到私有 Modal/Drawer 外观；使用批准的 ProductModal/ProductDrawer。', skip: allowedImplementation },
    { regex: /className\s*=\s*[{"'][^\n}]*\b(?:toast|notification|tooltip|popover)-(?:root|panel|content|container)\b/gi, severity: 'error', rule: 'private-feedback', message: '检测到私有反馈或提示浮层；使用批准的 ProductUI 反馈组件。', skip: allowedImplementation },
    { regex: /#[0-9a-fA-F]{3,8}\b/g, severity: 'warning', rule: 'hard-coded-color', message: '业务源码中发现硬编码颜色；确认是否应使用语义 Token。', skip: allowedImplementation },
    { regex: /\b(?:rgb|rgba|hsl|hsla|oklch|lab)\s*\(/g, severity: 'warning', rule: 'hard-coded-functional-color', message: '发现硬编码功能色；3D 与图表同样应引用已发布场景 Token。', skip: allowedImplementation },
    { regex: /outline\s*:\s*(?:none|0)\b/g, severity: 'error', rule: 'focus-outline-removed', message: '不得移除焦点轮廓而不提供 focus-visible 替代。', skip: allowedImplementation },
    { regex: /data-state\s*=\s*["']active["']/g, severity: 'warning', rule: 'ambiguous-active-state', message: 'Active 语义不明确；使用 Pressed、Selected、Open 或 Expanded。' },
    { regex: /<(?:div|span)\b[^>]*\bonClick\s*=/g, severity: 'warning', rule: 'non-semantic-click-target', message: '可点击 div/span 缺少原生按钮语义与键盘行为；优先使用 Button。' },
    { regex: /<img\b(?![^>]*\balt\s*=)[^>]*>/g, severity: 'warning', rule: 'image-alt-missing', message: '图片缺少 alt；装饰图使用空 alt，内容图提供等价说明。' },
    { regex: /<ProductIconButton\b(?![^>]*(?:aria-label|ariaLabel)\s*=)[^>]*>/g, severity: 'warning', rule: 'icon-button-name-missing', message: 'ProductIconButton 缺少可访问名称。' },
    { regex: /font-size\s*:\s*\d+(?:\.\d+)?px/g, severity: 'warning', rule: 'hard-coded-font-size', message: '发现未通过 Token 引用的字号。', skip: allowedImplementation },
    { regex: /border-radius\s*:\s*\d+(?:\.\d+)?px/g, severity: 'warning', rule: 'hard-coded-radius', message: '发现未通过 Token 引用的圆角。', skip: allowedImplementation },
    { regex: /position\s*:\s*fixed/g, severity: 'warning', rule: 'fixed-layer', message: '固定定位需确认所属层级、遮挡、缩放和移动端行为。' },
    { regex: /style\s*=\s*\{\{/g, severity: 'warning', rule: 'inline-style', message: '发现页面内联样式；确认其仅为动态几何值且没有覆盖基础组件契约。' }
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
