import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const read = (path) => readFileSync(join(root, path), 'utf8');
const expect = (condition, message) => { if (!condition) errors.push(message); };

const requiredFiles = [
  'README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  '.gitlab-ci.yml',
  'package.json',
  'docs/ui-guidelines.md',
  'docs/token-integration.md',
  'tokens/design-tokens.json',
  'components/component-specs.json',
  'adapters/ant-design-theme.ts',
  'references/ant-design-background.md',
];

requiredFiles.forEach((path) => expect(existsSync(join(root, path)), `缺少交付文件：${path}`));

let packageInfo;
let tokens;
let componentSpecs;
try { packageInfo = JSON.parse(read('package.json')); } catch (error) { errors.push(`package.json 无法解析：${error.message}`); }
try { tokens = JSON.parse(read('tokens/design-tokens.json')); } catch (error) { errors.push(`design-tokens.json 无法解析：${error.message}`); }
try { componentSpecs = JSON.parse(read('components/component-specs.json')); } catch (error) { errors.push(`component-specs.json 无法解析：${error.message}`); }

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

  expect(Array.isArray(componentSpecs.components) && componentSpecs.components.length >= 22, '组件契约必须覆盖当前发布的 22 项基础组件。');
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
].forEach((heading) => expect(guidelines.includes(heading), `UI 总规范缺少章节：${heading}`));

const adapter = read('adapters/ant-design-theme.ts');
expect(adapter.includes("../tokens/design-tokens.json"), 'Ant Design 适配器没有引用发布 Token。');
expect(adapter.includes("ProductStylePreset"), 'Ant Design 适配器没有提供风格预设映射。');
expect(adapter.includes("ProductIndustrialColorTheme"), 'Ant Design 适配器没有提供工业主题色映射。');
expect(!adapter.includes("'./design-tokens.json'"), 'Ant Design 适配器仍使用整理前的 Token 路径。');

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
