import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = join(root, 'tokens/design-tokens.json');
const outputPath = join(root, 'tokens/design-tokens-resolved.md');
const tokens = JSON.parse(readFileSync(sourcePath, 'utf8'));

const get = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);
const flatten = (object, prefix = '', result = []) => {
  if (Array.isArray(object)) {
    result.push([prefix, object]);
  } else if (object && typeof object === 'object') {
    Object.entries(object).forEach(([key, value]) => flatten(value, prefix ? `${prefix}.${key}` : key, result));
  } else {
    result.push([prefix, object]);
  }
  return result;
};

const variants = [
  ['Current Light', tokens.theme.light],
  ['Current Dark', tokens.theme.dark],
  ['Industrial Steel Light', tokens.stylePresets.industrial.theme.light],
  ['Industrial Steel Dark', tokens.stylePresets.industrial.theme.dark],
  ['Industrial Cobalt Light', tokens.stylePresets.industrial.colorThemes.cobalt.theme.light],
  ['Industrial Cobalt Dark', tokens.stylePresets.industrial.colorThemes.cobalt.theme.dark],
  ['Industrial Graphite Light', tokens.stylePresets.industrial.colorThemes.graphite.theme.light],
  ['Industrial Graphite Dark', tokens.stylePresets.industrial.colorThemes.graphite.theme.dark],
];

function resolve(value, theme, stack = []) {
  if (Array.isArray(value)) return value.map(item => resolve(item, theme, stack));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolve(item, theme, stack)]));
  if (typeof value !== 'string') return value;
  return value.replace(/\{([^}]+)\}/g, (_, path) => {
    const target = path.startsWith('theme.') ? get(theme, path.slice(6)) : get(tokens, path);
    if (target === undefined) throw new Error(`无法解析 Token 引用：{${path}}`);
    if (stack.includes(path)) throw new Error(`Token 循环引用：${[...stack, path].join(' -> ')}`);
    const resolved = resolve(target, theme, [...stack, path]);
    return typeof resolved === 'object' ? JSON.stringify(resolved) : String(resolved);
  });
}

const format = value => Array.isArray(value) || (value && typeof value === 'object')
  ? `\`${JSON.stringify(value)}\``
  : `\`${String(value).replaceAll('|', '\\|')}\``;

function table(headers, rows) {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${row.join(' | ')} |`),
  ].join('\n');
}

const lines = [
  '# Design Tokens 已解析速查表',
  '',
  `版本 **${tokens.version}** · 由 \`scripts/generate-resolved-tokens.mjs\` 从 \`tokens/design-tokens.json\` 自动生成。`,
  '',
  '> 请勿手工编辑。本文件用于检索和评审；机器接入仍以 JSON 为唯一来源。所有主题引用均已按变体展开。',
  '',
  '## 1. 主题语义色',
  '',
];

for (const [name, theme] of variants) {
  lines.push(`### ${name}`, '', table(['Token', 'Resolved value'], flatten(theme.color).map(([path, value]) => [`\`theme.color.${path}\``, format(value)])), '');
}

lines.push('## 2. 共享 Token', '');
for (const key of ['typography', 'spacing', 'radius', 'opacity', 'motion', 'zIndex', 'layout', 'control']) {
  const value = tokens.shared[key];
  if (!value) continue;
  lines.push(`### shared.${key}`, '', table(['Token', 'Value'], flatten(value).map(([path, item]) => [`\`shared.${key}.${path}\``, format(item)])), '');
}

lines.push('## 3. 状态 Token（按主题解析）', '');
const statePaths = flatten(tokens.state).map(([path]) => path);
lines.push(table(['Token', ...variants.map(([name]) => name)], statePaths.map(path => [
  `\`state.${path}\``,
  ...variants.map(([, theme]) => format(resolve(get(tokens.state, path), theme))),
])), '');

lines.push('## 4. 组件 Token（按主题解析）', '');
const componentPaths = flatten(tokens.components).map(([path]) => path);
lines.push(table(['Token', ...variants.map(([name]) => name)], componentPaths.map(path => [
  `\`components.${path}\``,
  ...variants.map(([, theme]) => format(resolve(get(tokens.components, path), theme))),
])), '');

lines.push('## 5. 生成与校验', '', '- 重新生成：`npm run generate:resolved`', '- 校验未过期、引用和对比度：`npm run check`');

const output = `${lines.join('\n')}\n`;
if (process.argv.includes('--check')) {
  const existing = readFileSync(outputPath, 'utf8');
  if (existing !== output) {
    console.error('design-tokens-resolved.md 已过期，请运行 npm run generate:resolved。');
    process.exit(1);
  }
  console.log('已解析 Token 文档与源文件一致。');
} else {
  writeFileSync(outputPath, output);
  console.log(`已生成 ${outputPath}`);
}
