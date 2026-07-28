import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function filesUnder(directory) {
  const absolute = join(root, directory);
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const path = join(absolute, entry.name);
    if (entry.isDirectory()) return filesUnder(relative(root, path));
    return /\.(?:tsx|ts|css)$/.test(entry.name) ? [relative(root, path)] : [];
  });
}

const foundation = read('src/styles/design-system.css');
const themeStyles = read('src/styles/theme.css');
const guidelines = read('guidelines/docs/ui-guidelines.md');
const adapter = read('src/styles/adapters/ui-kit.css');
const business = read('src/styles/business/taxonomy-tree.css');
const pagePatterns = read('src/styles/business/page-patterns.css');
const designGuidelines = read('src/styles/business/design-guidelines.css');
const sharedControls = read('src/styles/arco-like.css');
const sourceFiles = filesUnder('src');
const sourceContent = sourceFiles.map(read).join('\n');
const sourceOutsideCanvas = sourceFiles
  .filter((file) => file !== 'src/app/components/CanvasArea.tsx')
  .map(read)
  .join('\n');
const productUiSource = sourceFiles
  .filter((file) => file.startsWith('src/app/') && !file.startsWith('src/app/components/ui/') && file !== 'src/app/components/CanvasArea.tsx')
  .map(read)
  .join('\n');
const handoffTokens = JSON.parse(read('guidelines/tokens/design-tokens.json'));
const componentContracts = JSON.parse(read('guidelines/components/component-specs.json'));

[
  '--ds-button-primary-bg',
  '--ds-icon-size-xs',
  '--ds-icon-stroke-width',
  '--ds-search-height',
  '--ds-radio-control-size',
  '--ds-switch-width',
  '--ds-number-height',
  '--ds-pagination-item-size',
  '--ds-input-border-focus',
  '--ds-select-option-bg-selected',
  '--ds-checkbox-indicator-checked',
  '--ds-table-row-bg-selected',
  '--ds-tabs-indicator',
  '--ds-menu-item-bg-selected',
  '--ds-state-pressed-bg',
  '--ds-state-selected-bg',
  '--ds-state-readonly-bg',
  '--ds-state-success-bg',
  '--ds-button-primary-bg-pressed',
  '--ds-input-bg-readonly',
  '--ds-motion-duration-fast',
  '--ds-motion-duration-mid',
  '--ds-motion-duration-slow',
  '--ds-motion-ease-in',
  '--ds-motion-ease-out',
  '--ds-motion-ease-in-out',
].forEach((token) => expect(foundation.includes(token), `Missing published token: ${token}`));

expect(!/--ds-layout-(?:grid|module)-gap:\s*14px/.test(foundation), 'Foundation must not publish a 14px responsive spacing exception.');
expect(!/\.taxonomy-tree|\.product-tree-item|\.ds-context-menu/.test(foundation), 'Foundation must not contain adapter or business-component selectors.');
expect(!/\.ds-interactive:hover|\.ds-interactive:active|data-state=['"](?:hover|pressed|selected)['"]/.test(foundation), 'Foundation must not apply generic Hover, Pressed or Selected colors.');
expect(adapter.includes('.ds-context-menu'), 'UI-kit adapter must own the generic context-menu selector.');
expect(business.includes('.taxonomy-tree'), 'Business style layer must own the taxonomy-tree selector.');
expect(pagePatterns.includes('.ds-status-tab'), 'Business style layer must own the status-tab pattern.');
expect(pagePatterns.includes('.ds-table-surface'), 'Business style layer must own the table page pattern.');
expect(designGuidelines.includes('.ds-guidelines'), 'Business style layer must provide the visual design-guidelines page.');
expect(!/data-state=['"]active['"]/.test(foundation), 'Use pressed, selected, checked, open or expanded instead of ambiguous active state.');
expect(/\.arcoui-button:not\(:disabled\):active/.test(sharedControls), 'Shared buttons must provide a transient Pressed treatment.');
expect(/\.arcoui-input\.is-readonly/.test(sharedControls), 'Shared inputs must provide a Readonly treatment.');
expect(/--ds-state-success-(?:bg|border|text)/.test(sourceContent), 'At least one product feedback surface must consume the Success state tokens.');

['## 12. 组件状态模型', '## 14. 表单规范', '## 15. Table、列表与数据操作规范', '## 16. 浮层与反馈规范', '## 18. 版本管理与自动化验收'].forEach((heading) => {
  expect(guidelines.includes(heading), `Guidelines is missing required section: ${heading}`);
});

['## 20. 页面模板、业务组合与页面级状态', '### 20.2 页面模板矩阵', '### 20.3 可复用业务组合', '### 20.4 页面级状态矩阵', '### 20.5 响应式、溢出与拉伸规则'].forEach((heading) => {
  expect(guidelines.includes(heading), `Guidelines is missing page-pattern coverage: ${heading}`);
});

['## 21. 动效规范', '### 21.1 动效场景矩阵', '### 21.2 实现与无障碍约束'].forEach((heading) => {
  expect(guidelines.includes(heading), `Guidelines is missing motion coverage: ${heading}`);
});

expect(handoffTokens.version === '1.2.0', 'Token handoff version must match the published token contract.');
expect(handoffTokens.theme?.light?.color?.brand === '#241F7D', 'Token handoff is missing the light brand token.');
expect(handoffTokens.theme?.dark?.color?.brand === '#4F46E5', 'Token handoff is missing the dark brand token.');
expect(handoffTokens.components?.button?.height?.md === 40, 'Token handoff is missing the standard button height.');
expect(handoffTokens.components?.button?.paddingInline?.md === 14, 'Token handoff is missing the published button padding matrix.');
expect(handoffTokens.components?.button?.spinner?.size === 14, 'Token handoff is missing the button spinner specification.');
expect(handoffTokens.components?.button?.primary?.hover?.background, 'Token handoff is missing the Primary hover specification.');
expect(handoffTokens.components?.button?.secondary?.pressed?.border === '{state.pressed.border}', 'Token handoff is missing the Secondary pressed specification.');
expect(handoffTokens.shared?.icon?.style?.includes('24 × 24 viewBox'), 'Token handoff is missing the icon viewBox contract.');
expect(handoffTokens.shared?.icon?.size?.md === 16, 'Token handoff is missing the standard icon size scale.');
expect(handoffTokens.components?.search?.height === 40, 'Token handoff is missing SearchInput dimensions.');
expect(handoffTokens.components?.switch?.width === 36, 'Token handoff is missing Switch dimensions.');
expect(handoffTokens.components?.pagination?.itemSize === 32, 'Token handoff is missing Pagination dimensions.');
expect(handoffTokens.shared?.motion?.duration?.mid === '160ms', 'Token handoff is missing the standard motion duration.');
expect(handoffTokens.state?.focus?.ringWidth === 2, 'Token handoff is missing the focus-ring contract.');
expect(handoffTokens.shared?.zIndex?.modalPopover === 75, 'Token handoff is missing the modal-popover layer.');
expect(handoffTokens.components?.checkbox?.checked?.indicator === '{theme.color.accentContrast}', 'Token handoff is missing the checked-checkbox contrast indicator.');
expect(componentContracts.version === handoffTokens.version, 'Component contracts and token handoff must use the same published version.');
expect(componentContracts.components?.length >= 15, 'Component contracts must cover the published baseline component set.');
['Button', 'ToggleButton', 'IconToggleButton', 'IconButton', 'Tag', 'Tabs', 'Pagination', 'Menu / Dropdown', 'Input / TextArea', 'SearchInput / SearchBar', 'InputNumber', 'Select', 'Radio', 'Switch', 'Checkbox', 'Upload', 'Table', 'Modal', 'Drawer', 'Tooltip / Popover', 'Toast / Notification', 'Empty / Loading / Error'].forEach((name) => {
  expect(componentContracts.components?.some((component) => component.name === name), `Component contracts is missing ${name}.`);
});
const buttonContract = componentContracts.components?.find((component) => component.name === 'Button');
expect(JSON.stringify(buttonContract?.states) === JSON.stringify(['Default', 'Hover', 'Pressed', 'Focus', 'Disabled', 'Loading']), 'Button must not expose Selected or Danger as an interaction state.');
['primary', 'secondary'].forEach((variant) => {
  const rows = buttonContract?.stateMatrix?.[variant] ?? [];
  expect(rows.length === 6, `Button ${variant} state matrix must include six states.`);
  rows.forEach((row) => ['background', 'text', 'border', 'icon', 'shadow', 'focusRing', 'cursor', 'opacity', 'transition'].forEach((field) => {
    expect(Boolean(row[field]), `Button ${variant} ${row.state ?? 'state'} must declare ${field}.`);
  }));
});
expect(buttonContract?.metrics?.length >= 6, 'Button must publish internal metrics.');
expect(buttonContract?.contentStructures?.length === 5, 'Button must publish all supported content structures.');
expect(buttonContract?.selectedBoundary?.includes('ToggleButton'), 'Button must define the Selected boundary.');
componentContracts.components?.forEach((component) => {
  expect(component.purpose && component.whenToUse && component.avoid, `${component.name} must declare purpose and usage boundaries.`);
  expect(Array.isArray(component.api) && component.api.length > 0, `${component.name} must declare component parameters.`);
  expect(Array.isArray(component.states) && component.states.length > 0, `${component.name} must declare its state matrix.`);
  expect(Array.isArray(component.tokens) && component.tokens.length > 0, `${component.name} must declare related tokens.`);
  expect(Array.isArray(component.rules) && component.rules.length > 0, `${component.name} must declare rules.`);
  expect(Array.isArray(component.a11y) && component.a11y.length > 0, `${component.name} must declare accessibility rules.`);
  expect(component.responsive && component.example, `${component.name} must declare responsive behavior and an example.`);
  expect(Array.isArray(component.acceptance) && component.acceptance.length > 0, `${component.name} must declare acceptance items.`);
});

['list', 'detail', 'form', 'config', 'dashboard', 'workflow', 'workbench', 'editor', 'split'].forEach((template) => {
  expect(foundation.includes(`.ds-page--${template}`), `Foundation is missing page-template entry: ${template}`);
});

[
  ['src/app/components/SoftwareManager.tsx', 'ds-page ds-page--list'],
  ['src/app/components/InstallationRecordsManager.tsx', 'ds-page ds-page--list'],
  ['src/app/components/ProductVersionManager.tsx', 'ds-page ds-page--split'],
  ['src/app/App.tsx', 'ds-page ds-page--editor ds-homepage-editor'],
  ['src/app/App.tsx', 'ds-page ds-page--split ds-homepage-preview'],
  ['src/app/components/DesignGuidelines.tsx', 'ds-page ds-page--dashboard ds-guidelines'],
].forEach(([file, className]) => {
  expect(read(file).includes(className), `${file} must consume its declared page template.`);
});

expect(read('src/app/App.tsx').includes('className="ds-preview-exit"'), 'Canvas preview must use the standard fixed-action pattern.');
expect(read('src/app/components/RobotModelManager.tsx').includes('className="ds-global-notice"'), 'Global notices must use the shared toast pattern.');
expect(read('src/app/components/RobotModelManager.tsx').includes('data-tone="warning"'), 'Published-model feedback must use the Warning semantic tone.');
expect(read('src/app/components/RobotModelManager.tsx').includes('title="取消发布型号"'), 'Unpublishing a model must require a confirmation modal.');
expect(read('src/app/components/RobotModelManager.tsx').includes('确认取消发布'), 'Unpublish confirmation must provide an explicit confirm action.');
expect(!read('src/app/components/RobotModelManager.tsx').includes('status="warning" onClick={confirmUnpublish}'), 'A reversible unpublish action must use the brand primary action, not Warning.');
expect(read('src/app/theme.ts').includes("'--robot-dialog-shadow': 'var(--ds-shadow-dialog)'"), 'Robot dialogs must consume the published dialog-shadow token.');
expect(/\.arcoui-checkbox \[data-slot="checkbox-indicator"\][\s\S]*?--ds-checkbox-indicator-checked/.test(sharedControls), 'Shared checkboxes must render a contrast checked indicator.');
expect(read('src/app/App.tsx').includes("label: '设计规范'"), 'Digital Machine navigation must expose the Design Guidelines tab.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('复制完整 Token'), 'Design Guidelines must support copying the published token handoff.');
expect(read('src/app/components/DesignGuidelines.tsx').includes("components/component-specs.json"), 'Design Guidelines must consume the published component contracts.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('ComponentContractExplorer'), 'Design Guidelines must render component contract details.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('ComponentStylePreview'), 'Component contracts must include a live visual style preview.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('ButtonSpecification'), 'Design Guidelines must render the Button state matrix and internal specification.');
expect(read('src/app/components/DesignGuidelines.tsx').includes("icons: { title: '图标'"), 'Design Guidelines must publish the icon parameter reference.');
expect(read('src/app/components/DesignGuidelines.tsx').includes("docs/ui-guidelines.md?raw"), 'Design Guidelines must read the published UI guideline source directly.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('GUIDELINE_SECTION_MAP'), 'Design Guidelines must map navigation topics to Guidelines.md sections.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('GuidelineSourceContent'), 'Design Guidelines must render the mapped Guidelines.md sections.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('ColorTokenGroups'), 'Design Guidelines must render the complete grouped color token reference.');
expect(!read('src/app/components/DesignGuidelines.tsx').includes('以下是当前已发布的基础控件状态'), 'Modes and templates must not fall back to unrelated component previews.');
expect(!read('src/app/components/DesignGuidelines.tsx').includes('确认弹窗</h2>'), 'Mode pages must not fall back to unrelated overlay previews.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('GuidelineVisualPreview'), 'Design Guidelines must render topic-specific visual previews.');
expect(read('src/app/components/DesignGuidelines.tsx').includes("topicKey === 'search-filter'"), 'Search and filter guidance must provide its own visual preview.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('PageTemplateVisualPreview'), 'Page templates must provide structural visual previews.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('getTemplateMatrixExcerpt'), 'Each page template must read its own row from the template matrix.');
expect(read('src/app/components/DesignGuidelines.tsx').includes("spacing: { title: '间距'"), 'Design Guidelines must publish dedicated spacing content.');
expect(read('src/app/components/DesignGuidelines.tsx').includes("tokenDocument.preview === 'colors'"), 'Design Guidelines must not show color previews for every token topic.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('ds-guidelines__panel'), 'Design Guidelines must render a single primary content panel.');
expect(designGuidelines.includes('.ds-guidelines__nav { min-width: 0; min-height: 0; overflow: auto;'), 'Design Guidelines navigation must own an independent scroll container.');
['基础', '布局', '组件', '模式', '模板', '开发'].forEach((group) => {
  expect(read('src/app/components/DesignGuidelines.tsx').includes(`label: '${group}'`), `Design Guidelines is missing the ${group} navigation group.`);
});
expect(read('src/app/components/ArcoLike.tsx').includes('className="arcoui-select-popover"'), 'Shared selects must provide a styled popover surface.');
expect(!read('src/app/components/PanelList.tsx').includes("@radix-ui/react-dropdown-menu"), 'Homepage scheme actions must consume the shared context-menu composition.');
expect(read('src/app/components/PanelList.tsx').includes('className="ds-context-menu"'), 'Homepage scheme actions must use the shared context-menu surface.');
expect(!/position:\s*['"]fixed['"]/.test(sourceContent), 'Fixed feedback and actions must use the shared business patterns.');
expect(!/zIndex:\s*\d+/.test(sourceOutsideCanvas), 'Only the editor canvas may use local numeric z-index values; other pages must use layer tokens.');
expect(!/transition[^;\n]*(?:\d+(?:ms|s))/.test(productUiSource), 'Product UI motion must use published motion tokens; the editor canvas is the only local-motion exception.');

const forbiddenPrefix = /(?:hero-|heroui-)/i;
sourceFiles.forEach((file) => {
  const content = read(file);
  expect(!forbiddenPrefix.test(content), `${file} still exposes a legacy implementation CSS prefix.`);
  expect(!/\bHero[A-Za-z]/.test(content), `${file} still exposes a legacy implementation component name.`);
  expect(!/--ds-(?:button-height-lg|field-height-lg)/.test(content), `${file} still uses a duplicate large control-size token.`);
  expect(!/(?:data-active|data-\[active|data-state=['"]active['"])/.test(content), `${file} uses ambiguous active state naming.`);
});

expect(/--ds-motion-duration-loading/.test(sharedControls), 'Shared loading indicators must consume the motion loading-duration token.');
expect(guidelines.includes('### 11.5 图标规范'), 'Guidelines must provide a dedicated icon specification chapter.');
expect(guidelines.includes('### 11.6 内容文案规范'), 'Guidelines must provide a dedicated content-writing chapter.');
expect(themeStyles.includes('stroke-width: var(--ds-icon-stroke-width'), 'Approved linear icons must consume the published stroke-width token.');
expect(sharedControls.includes('data-loading={loading ?') || read('src/app/components/ArcoLike.tsx').includes("data-loading={loading ? 'true' : undefined}"), 'Shared buttons must expose Loading state to their visual contract.');
expect(read('src/app/components/ArcoLike.tsx').includes('ArcoToggleButton'), 'Shared controls must provide a dedicated ToggleButton primitive.');

const diffCheck = spawnSync('git', ['diff', '--check'], { cwd: root, encoding: 'utf8' });
expect(diffCheck.status === 0, `git diff --check failed: ${(diffCheck.stdout || diffCheck.stderr).trim()}`);

if (errors.length) {
  console.error('Design-system acceptance failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Design-system acceptance passed.');
