import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const read = (path) => readFileSync(join(root, path), 'utf8');
const expect = (condition, message) => { if (!condition) errors.push(message); };
const countOccurrences = (source, value) => source.split(value).length - 1;

const requiredFiles = [
  'README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  '.gitlab-ci.yml',
  'package.json',
  'docs/ui-guidelines.md',
  'docs/quick-reference.md',
  'docs/token-integration.md',
  'docs/product-shell.md',
  'docs/page-recipes.md',
  'docs/product-ui-mapping.md',
  'docs/frontend-onboarding.md',
  'docs/visual-regression.md',
  'tokens/design-tokens.json',
  'tokens/design-tokens-resolved.md',
  'components/component-specs.json',
  'patterns/product-patterns.json',
  'runtime/product-ui-manifest.json',
  'examples/react/README.md',
  'examples/react/ProductShell.template.tsx',
  'examples/react/ManagementListPage.template.tsx',
  'examples/react/ModalForm.template.tsx',
  'examples/react/DrawerDetail.template.tsx',
  'adapters/ant-design-theme.ts',
  'references/ant-design-background.md',
  'scripts/audit-frontend.mjs',
  'scripts/generate-resolved-tokens.mjs',
  'scripts/package.sh',
];

requiredFiles.forEach((path) => expect(existsSync(join(root, path)), `缺少交付文件：${path}`));

let packageInfo;
let tokens;
let componentSpecs;
let productPatterns;
let runtimeManifest;
try { packageInfo = JSON.parse(read('package.json')); } catch (error) { errors.push(`package.json 无法解析：${error.message}`); }
try { tokens = JSON.parse(read('tokens/design-tokens.json')); } catch (error) { errors.push(`design-tokens.json 无法解析：${error.message}`); }
try { componentSpecs = JSON.parse(read('components/component-specs.json')); } catch (error) { errors.push(`component-specs.json 无法解析：${error.message}`); }
try { productPatterns = JSON.parse(read('patterns/product-patterns.json')); } catch (error) { errors.push(`product-patterns.json 无法解析：${error.message}`); }
try { runtimeManifest = JSON.parse(read('runtime/product-ui-manifest.json')); } catch (error) { errors.push(`product-ui-manifest.json 无法解析：${error.message}`); }

const get = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);
const tokenVariants = source => [
  ['Current Light', source.theme?.light],
  ['Current Dark', source.theme?.dark],
  ['Industrial Steel Light', source.stylePresets?.industrial?.theme?.light],
  ['Industrial Steel Dark', source.stylePresets?.industrial?.theme?.dark],
  ['Industrial Cobalt Light', source.stylePresets?.industrial?.colorThemes?.cobalt?.theme?.light],
  ['Industrial Cobalt Dark', source.stylePresets?.industrial?.colorThemes?.cobalt?.theme?.dark],
  ['Industrial Graphite Light', source.stylePresets?.industrial?.colorThemes?.graphite?.theme?.light],
  ['Industrial Graphite Dark', source.stylePresets?.industrial?.colorThemes?.graphite?.theme?.dark],
];
const walk = (value, callback, path = '') => {
  if (Array.isArray(value)) return value.forEach((item, index) => walk(item, callback, `${path}.${index}`));
  if (value && typeof value === 'object') return Object.entries(value).forEach(([key, item]) => walk(item, callback, path ? `${path}.${key}` : key));
  callback(value, path);
};
const hexRgb = value => {
  const match = /^#([\da-f]{6})$/i.exec(value ?? '');
  return match ? [0, 2, 4].map(offset => Number.parseInt(match[1].slice(offset, offset + 2), 16) / 255) : null;
};
const luminance = value => {
  const rgb = hexRgb(value);
  if (!rgb) return null;
  const linear = rgb.map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};
const contrast = (foreground, background) => {
  const a = luminance(foreground);
  const b = luminance(background);
  if (a === null || b === null) return null;
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

if (packageInfo && tokens && componentSpecs) {
  expect(packageInfo.version === tokens.version, 'package.json 与 design-tokens.json 版本不一致。');
  expect(tokens.version === componentSpecs.version, 'Token 与组件契约版本不一致。');
  expect(read('CHANGELOG.md').includes(`## ${packageInfo.version}`), `CHANGELOG 缺少 ${packageInfo.version} 发布记录。`);

  expect(tokens.theme?.light?.color && tokens.theme?.dark?.color, 'Token 必须同时发布 Light 和 Dark 语义色。');
  expect(tokens.stylePresets?.current?.status === 'stable', 'Token 缺少 Stable 的 Current 风格预设。');
  expect(JSON.stringify(tokens.stylePresets?.industrial?.supportedThemes) === JSON.stringify(['light', 'dark']), 'Industrial 风格必须同时支持 Light 与 Dark。');
  expect(tokens.stylePresets?.industrial?.theme?.light?.color?.brand === '#255D76', 'Industrial Light 缺少已发布的钢铁蓝界面色。');
  expect(tokens.stylePresets?.industrial?.theme?.dark?.color?.brand === '#317895', 'Industrial Dark 缺少已发布的钢铁蓝界面色。');
  expect(tokens.stylePresets?.industrial?.theme?.light?.color?.signal === '#E56A17', 'Industrial Light 缺少已发布的橙色信号色。');
  expect(tokens.stylePresets?.industrial?.defaultColorTheme === 'steel', 'Industrial 风格默认主题色必须为 steel。');
  expect(Object.keys(tokens.stylePresets?.industrial?.colorThemes ?? {}).length === 3, 'Industrial 风格必须发布 steel、cobalt、graphite 三套主题色。');
  expect(tokens.stylePresets?.industrial?.colorThemes?.cobalt?.theme?.light?.color?.brand === '#241F7D', 'Industrial 品牌紫必须使用产品主题色 #241F7D。');
  expect(tokens.stylePresets?.industrial?.theme?.light?.color?.page === '#F0F0F0', 'Industrial Light 默认主题页面底色必须为 #F0F0F0。');
  expect(tokens.stylePresets?.industrial?.theme?.light?.color?.border === '#D9E0E4', 'Industrial Light 普通描边必须使用轻量边框 #D9E0E4。');
  expect(tokens.stylePresets?.industrial?.theme?.light?.color?.borderStrong === '#C7D0D5', 'Industrial Light 结构分隔线必须使用 #C7D0D5。');
  expect(tokens.stylePresets?.industrial?.colorThemes?.cobalt?.theme?.light?.color?.page === '#F0F0F0', 'Industrial Light 品牌紫页面底色必须为 #F0F0F0。');
  expect(tokens.stylePresets?.industrial?.colorThemes?.graphite?.theme?.light?.color?.page === '#F0F0F0', 'Industrial Light 石墨灰页面底色必须为 #F0F0F0。');
  expect(tokens.stylePresets?.industrial?.radius?.control === 4, 'Industrial 风格缺少 4px 控件圆角。');
  expect(tokens.stylePresets?.industrial?.layout?.pagePadding === 0, 'Industrial 风格页面外边距必须为 0。');
  expect(tokens.stylePresets?.industrial?.layout?.moduleGap === 0, 'Industrial 风格一级模块间距必须为 0。');
  expect(tokens.shared?.spacing && tokens.shared?.typography && tokens.shared?.motion, 'Token 缺少间距、字体或动效基础体系。');
  expect(tokens.state?.pressed && tokens.state?.selected && tokens.state?.focus, 'Token 缺少 Pressed、Selected 或 Focus 状态。');
  expect(tokens.components?.button && tokens.components?.input && tokens.components?.table, 'Token 缺少核心组件映射。');
  expect(tokens.theme?.dark?.color?.brand === '#4F46E5' && tokens.theme?.dark?.color?.accentContrast === '#FFFFFF', 'Current Dark 主按钮基色必须保持 #4F46E5 + #FFFFFF。');
  expect(tokens.components?.button?.primary?.default?.background === '{theme.color.brand}', 'Primary Button 必须引用 Brand，而不是暗色高亮 Accent。');
  expect(tokens.shared?.control?.table?.headerHeight === 44, 'Current 表格表头必须为 44px。');
  expect(tokens.shared?.control?.table?.rowHeight === 60, 'Current 表格数据行必须为 60px。');
  expect(tokens.components?.table?.rowHeight === tokens.shared?.control?.table?.rowHeight, '表格组件 Token 与共享控件行高不一致。');
  expect(tokens.components?.table?.outerBorder && tokens.components?.table?.headerDivider && tokens.components?.table?.rowDivider, '表格缺少外框、表头或数据行分隔线 Token。');
  expect(tokens.components?.table?.columnDivider === 'transparent', '表格普通列默认不得显示竖向分隔线。');
  expect(Boolean(tokens.components?.table?.fixedDivider), '表格缺少固定列分隔线 Token。');
  expect(tokens.components?.table?.typography?.header?.fontSize === 12, '表格表头字号必须为 12px。');
  expect(tokens.components?.table?.typography?.header?.fontWeight === 500, '表格表头字重必须为 500。');
  expect(tokens.components?.table?.typography?.cell?.fontSize === 14, '表格正文字号必须为 14px。');
  expect(tokens.components?.table?.typography?.cell?.fontWeight === 400, '表格正文字重必须为 400。');
  expect(tokens.components?.table?.typography?.primaryCell?.fontWeight === 500, '表格主标识单元格字重必须为 500。');
  expect(tokens.components?.table?.typography?.number?.fontVariantNumeric === 'tabular-nums', '表格数字必须使用等宽数字。');
  expect(tokens.shared?.layout?.productShell?.navigationWidth === 200, '数字造机产品导航宽度必须为 200px。');
  expect(tokens.shared?.layout?.productShell?.topbarHeight === 52, '数字造机产品顶栏高度必须为 52px。');

  walk(tokens, (value, ownerPath) => {
    if (typeof value !== 'string') return;
    for (const match of value.matchAll(/\{([^}]+)\}/g)) {
      const reference = match[1];
      if (reference.startsWith('theme.')) {
        tokenVariants(tokens).forEach(([name, theme]) => expect(get(theme, reference.slice(6)) !== undefined, `${ownerPath} 在 ${name} 引用了不存在的 {${reference}}。`));
      } else {
        expect(get(tokens, reference) !== undefined, `${ownerPath} 引用了不存在的 {${reference}}。`);
      }
    }
  });

  const resolveExact = (value, theme, stack = []) => {
    if (typeof value !== 'string') return value;
    const match = /^\{([^}]+)\}$/.exec(value);
    if (!match) return value;
    const reference = match[1];
    expect(!stack.includes(reference), `Token 循环引用：${[...stack, reference].join(' -> ')}。`);
    if (stack.includes(reference)) return value;
    const target = reference.startsWith('theme.') ? get(theme, reference.slice(6)) : get(tokens, reference);
    return resolveExact(target, theme, [...stack, reference]);
  };
  tokenVariants(tokens).forEach(([name, theme]) => {
    const pairs = [
      ['主按钮', theme.color.accentContrast, theme.color.brand],
      ['Danger 实色按钮', theme.color.dangerContrast, theme.color.danger],
      ['表头', resolveExact(tokens.components.table.typography.header.color, theme), theme.color.soft],
      ['Info 状态文字', theme.color.infoText, theme.color.infoSoft],
      ['Success 状态文字', theme.color.successText, theme.color.successSoft],
      ['Warning 状态文字', theme.color.warningText, theme.color.warningSoft],
      ['Danger 状态文字', theme.color.dangerText, theme.color.dangerSoft],
    ];
    pairs.forEach(([label, foreground, background]) => {
      const ratio = contrast(foreground, background);
      expect(ratio !== null && ratio >= 4.5, `${name} ${label}对比度不足：${foreground} / ${background} = ${ratio?.toFixed(2) ?? '无法计算'}，要求 ≥ 4.5:1。`);
    });
  });

  expect(Array.isArray(componentSpecs.components) && componentSpecs.components.length >= 25, '组件契约必须覆盖当前发布的 25 项基础组件。');
  componentSpecs.components?.forEach((component) => {
    const label = component.name || '<未命名组件>';
    expect(Boolean(component.name && component.purpose && component.whenToUse && component.avoid), `${label} 缺少用途或使用边界。`);
    expect(Array.isArray(component.api) && component.api.length > 0, `${label} 缺少 API。`);
    expect(Array.isArray(component.states) && component.states.length > 0, `${label} 缺少状态。`);
    expect(Array.isArray(component.tokens) && component.tokens.length > 0, `${label} 缺少关联 Token。`);
    expect(Array.isArray(component.a11y) && component.a11y.length > 0, `${label} 缺少无障碍规则。`);
    expect(Boolean(component.responsive && component.example), `${label} 缺少响应式或示例。`);
    expect(Array.isArray(component.acceptance) && component.acceptance.length > 0, `${label} 缺少验收项。`);
  });
  ['Button', 'Tree', 'Table', 'DateTimePicker', 'Steps', 'ContentState (Empty / Loading / Error)'].forEach(name => {
    expect(componentSpecs.components?.some(component => component.name === name), `组件契约缺少 ${name}。`);
  });
  const button = componentSpecs.components?.find(component => component.name === 'Button');
  expect(button?.api?.some(item => item.name === 'danger') && button?.stateMatrix?.dangerSoft && button?.stateMatrix?.dangerSolid, 'Button 缺少 Danger API 或 Soft/Solid 状态矩阵。');
}

if (packageInfo && productPatterns && runtimeManifest) {
  expect(packageInfo.version === productPatterns.version, 'package.json 与产品模式版本不一致。');
  expect(packageInfo.version === runtimeManifest.version, 'package.json 与运行时组件清单版本不一致。');
  expect(productPatterns.defaultStyle === 'current', '产品模式必须默认使用 Current。');
  expect(productPatterns.industrialPolicy === 'explicit-opt-in-only', 'Industrial 必须显式启用。');
  expect(productPatterns.shell?.metrics?.navigationWidth === 200, '产品模式导航宽度必须为 200px。');
  expect(productPatterns.patterns?.some(pattern => pattern.key === 'management-list'), '产品模式缺少标准管理列表。');
  expect(productPatterns.patterns?.some(pattern => pattern.key === 'modal-form'), '产品模式缺少 Modal 表单。');
  expect(productPatterns.patterns?.some(pattern => pattern.key === 'drawer-detail'), '产品模式缺少 Drawer 详情。');
  expect(productPatterns.interactionRules?.shortcutOwnership === 'keyboard', '快捷键必须统一归属键盘输入域。');
  expect(productPatterns.interactionRules?.shortcutEntry === 'keyboard-and-shortcuts', '快捷键不得拆成重复的同级入口。');
  expect(productPatterns.interactionRules?.ruleFields?.includes('exclusiveGroup') && productPatterns.interactionRules?.ruleFields?.includes('fallback'), '交互规则模型缺少互斥组或兜底字段。');
  expect(productPatterns.interactionRules?.conflictPolicy?.samePriorityExclusiveEffects === 'reject-on-save', '同优先级互斥规则必须在保存时拒绝。');
  expect(productPatterns.interactionRules?.dependencyPolicy?.graph === 'directed-acyclic', '交互规则依赖必须为有向无环图。');
  expect(runtimeManifest.stable?.some(item => item.export === 'ProductSelect'), '运行时清单缺少 ProductSelect。');
  expect(runtimeManifest.requiredNext?.includes('ProductShell'), '运行时清单必须声明 ProductShell。');
  expect(runtimeManifest.forbiddenBusinessImplementations?.includes('native-select'), '运行时清单必须禁止原生业务 Select。');
}

const guidelines = read('docs/ui-guidelines.md');
[
  '## 12. 组件状态模型',
  '## 14. 表单规范',
  '## 15. Table、列表与数据操作规范',
  '## 16. 浮层与反馈规范',
  '## 18. 版本管理与自动化验收',
  '## 20. 页面模板、业务组合与页面级状态',
  '## 21. 动效规范',
  '## 22. 风格预设',
  '## 23. 数字造机产品一致性规范',
  '## 24. 无障碍与高对比度',
  '## 25. 3D 与图表规范',
  '## 26. 多语言与本地化规范',
  '## 27. 交互规范',
].forEach((heading) => expect(guidelines.includes(heading), `UI 总规范缺少章节：${heading}`));
expect(guidelines.includes('### 27.0 交互领域、规则求值与冲突处理'), '交互规范缺少统一规则求值与冲突处理契约。');
expect(guidelines.includes('### 27.3 键盘与快捷键'), '键盘导航与快捷键必须合并为统一章节。');
expect(!guidelines.includes('### 27.18 快捷键') && !guidelines.includes('### 27.34 快捷键体系'), '快捷键不得保留重复章节。');
expect(!guidelines.includes('### 27.32 导航与历史状态'), '导航与历史状态不得保留重复章节。');
expect(countOccurrences(guidelines, '未保存离开保护统一契约') === 1, '未保存离开保护只能在 §27.17 保留一份权威定义。');
expect(guidelines.includes('**画布图层例外**') && guidelines.includes('isolation: isolate'), '§16.0 缺少限制在画布层叠上下文内的图层例外。');
expect(guidelines.includes('**表单 Section 标题全局规则**'), '§14.1 缺少表单 Section 标题全局规则。');
expect(guidelines.includes('| Input / TextArea | `--ds-input-*` | Default、Hover、Focus、Filled、Loading、Readonly、Disabled、Error |'), '组件总表必须包含 Input / TextArea Loading。');
expect(guidelines.includes('| Select | `--ds-input-*`、`--ds-select-*` | Default、Hover、Pressed、Focus、Filled、Open、Selected、Disabled、Loading、Error |'), '组件总表必须包含 Select Filled。');
expect(guidelines.includes('| Checkbox | `--ds-checkbox-*` | Default、Hover、Focus、Checked、Indeterminate、Disabled、Readonly |'), '组件总表必须包含 Checkbox Indeterminate。');
expect(guidelines.includes('Expanded Loading、Expanded Error'), '组件总表必须包含 Table 展开内容的 Loading / Error。');
expect(guidelines.includes('筛选 Select') && guidelines.includes('同一行不得混用 32px 与 40px'), '工具栏控件高度裁决不完整。');
expect(guidelines.includes('可恢复的状态回退') && guidelines.includes('判断依据是能否无损撤销'), '§27.10 缺少可恢复回退与 Danger 的明确边界。');
expect(guidelines.includes('不设固定 64px') && guidelines.includes('上内边距 24px、下内边距 20px'), '§3.2 必须明确 Modal Header 使用自然高度而非固定 64px。');
expect(!guidelines.includes('420 / 560 / 720 / 900px 宽'), 'Modal 四档宽度数值只能在 §3.2 保留，其他章节必须引用。');
expect(!guidelines.includes('Focus：所有键盘可操作组件显示 2px Focus Ring'), 'Focus Ring 数值只能由 §12.3 定义。');

const quickReference = read('docs/quick-reference.md');
expect(!quickReference.includes('opacity: 0.45'), 'Quick Reference 不得复制 Disabled Token 数值。');
expect(quickReference.includes('ui-guidelines.md` §13.1.1'), 'Quick Reference 的 Primary 规则必须引用权威章节。');
expect(quickReference.includes('ui-guidelines.md` §13.2'), 'Quick Reference 的搜索筛选规则必须引用权威章节。');

if (componentSpecs) {
  const modal = componentSpecs.components?.find(component => component.name === 'Modal');
  const search = componentSpecs.components?.find(component => component.name === 'SearchInput / SearchBar');
  const button = componentSpecs.components?.find(component => component.name === 'Button');
  const table = componentSpecs.components?.find(component => component.name === 'Table');
  expect(modal?.sizes?.some(size => size.includes('数值见 §3.2')) && !modal?.sizes?.includes('420'), 'Modal 组件契约必须引用 §3.2，不得复制四档宽度数值。');
  expect(modal?.rules?.some(rule => rule.includes('统一引用 §3.2')), 'Modal 结构和滚动规则必须引用 §3.2。');
  expect(search?.rules?.some(rule => rule.includes('统一引用 §13.2')), 'SearchInput 提交时机必须引用 §13.2。');
  expect(!JSON.stringify(button?.stateMatrix).includes('/ 2px'), '组件状态矩阵不得复制 Focus Ring 数值。');
  expect(table?.rules?.some(rule => rule.includes('统一引用 §15.1')), 'Table 操作列规则必须引用 §15.1。');
}

const productShell = read('docs/product-shell.md');
expect(productShell.includes('ProductNavigation') && productShell.includes('GlobalTopBar'), '产品外壳规范缺少导航或顶栏契约。');

const pageRecipes = read('docs/page-recipes.md');
['CRUD 交互决策表', '标准管理列表页', 'Modal 新增与编辑', 'Drawer 详情', '导入流程'].forEach((heading) => {
  expect(pageRecipes.includes(heading), `页面 Recipe 缺少：${heading}。`);
});
expect(pageRecipes.includes('§13.1.1') && pageRecipes.includes('§13.2') && pageRecipes.includes('§14.1') && pageRecipes.includes('§15.1'), '页面 Recipe 必须引用 Primary、搜索筛选、表单标题和操作列的权威章节。');

const productUiMapping = read('docs/product-ui-mapping.md');
['ProductButton', 'ProductIconButton', 'ProductSelect', 'ProductModal', 'ProductDrawer'].forEach((component) => {
  expect(productUiMapping.includes(component), `ProductUI 映射缺少 ${component}。`);
});

const onboarding = read('docs/frontend-onboarding.md');
expect(onboarding.includes('Definition of Done') && onboarding.includes('Industrial 不是制造业页面的默认风格'), '前端接入清单缺少完成定义或 Industrial 边界。');

const visualRegression = read('docs/visual-regression.md');
['1440×900', '1024×768', '390×844', 'Select Open', 'Drawer Open', '30%–40% 膨胀伪语言'].forEach(value => {
  expect(visualRegression.includes(value), `视觉回归矩阵缺少 ${value}。`);
});

const auditScript = read('scripts/audit-frontend.mjs');
['native-select', 'direct-ui-import', 'private-overlay', 'arbitrary-z-index'].forEach(rule => {
  expect(auditScript.includes(rule), `前端审计脚本缺少 ${rule} 规则。`);
});

const adapter = read('adapters/ant-design-theme.ts');
expect(adapter.includes("../tokens/design-tokens.json"), 'Ant Design 适配器没有引用发布 Token。');
expect(adapter.includes("ProductStylePreset"), 'Ant Design 适配器没有提供风格预设映射。');
expect(adapter.includes("ProductIndustrialColorTheme"), 'Ant Design 适配器没有提供工业主题色映射。');
expect(!adapter.includes("'./design-tokens.json'"), 'Ant Design 适配器仍使用整理前的 Token 路径。');
expect(adapter.includes('headerColor: color.text'), 'Ant Design Table 表头没有映射到高对比文字 Token。');
['Tree:', 'DatePicker:', 'Steps:'].forEach(component => expect(adapter.includes(component), `Ant Design 适配器缺少 ${component.slice(0, -1)} 映射。`));

const resolvedTokens = read('tokens/design-tokens-resolved.md');
expect(resolvedTokens.includes(`版本 **${packageInfo?.version}**`) && resolvedTokens.includes('components.table.typography.header.color'), '已解析 Token 文档版本或关键组件 Token 未同步。');

const readme = read('README.md');
requiredFiles.filter((path) => !path.startsWith('.') && path !== 'package.json').forEach((path) => {
  expect(readme.includes(path) || path.startsWith('references/'), `README 未说明交付文件：${path}`);
});
expect(readme.includes('不是当前规范'), 'README 必须明确 references 不是验收依据。');

if (errors.length) {
  console.error('设计规范校验失败：');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`设计规范 v${packageInfo.version} 校验通过。`);
