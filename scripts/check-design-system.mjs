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
const dataManagementStyles = read('src/styles/business/data-management.css');
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
  '--ds-button-danger-soft-bg',
  '--ds-button-danger-solid-bg',
  '--ds-color-info-text',
  '--ds-color-success-text',
  '--ds-color-warning-text',
  '--ds-color-danger-text',
  '--ds-icon-size-xs',
  '--ds-icon-stroke-width',
  '--ds-search-height',
  '--ds-radio-control-size',
  '--ds-switch-width',
  '--ds-number-height',
  '--ds-pagination-item-size',
  '--ds-input-border-focus',
  '--ds-select-option-bg-selected',
  '--ds-modal-surface',
  '--ds-modal-control-bg',
  '--ds-popover-surface',
  '--ds-checkbox-indicator-checked',
  '--ds-checkbox-indeterminate-bg',
  '--ds-checkbox-indicator-indeterminate',
  '--ds-table-row-bg-selected',
  '--ds-table-title-font-size',
  '--ds-table-header-font-weight',
  '--ds-table-cell-font-weight',
  '--ds-table-cell-primary-font-weight',
  '--ds-tabs-indicator',
  '--ds-menu-item-bg-selected',
  '--ds-navigation-selected-bg',
  '--ds-navigation-selected-text',
  '--ds-component-picker-selected-bg',
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
expect(/\.ds-guidelines__main-content\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/.test(designGuidelines), 'Design Guidelines main content must allocate its remaining viewport height vertically.');
expect(/\.ds-guidelines__panel\s*\{[^}]*flex:\s*1 0 auto/.test(designGuidelines), 'Design Guidelines panel must fill unused main-content height without fixing content height.');
expect(!/data-state=['"]active['"]/.test(foundation), 'Use pressed, selected, checked, open or expanded instead of ambiguous active state.');
expect(/\.arcoui-button:not\(:disabled\):active/.test(sharedControls), 'Shared buttons must provide a transient Pressed treatment.');
expect(/\.arcoui-input\.is-readonly/.test(sharedControls), 'Shared inputs must provide a Readonly treatment.');
expect(/\.dark\s*\{[\s\S]*--ds-modal-surface:\s*var\(--ds-color-layout\)/.test(foundation), 'Dark Modal must use the published deep overlay surface.');
expect(/--ds-modal-header-min-height:\s*64px/.test(foundation) && /--ds-modal-footer-min-height:\s*64px/.test(foundation), 'Modal Header and Footer must publish baseline minimum geometry without fixing their rendered height.');
expect(/\.arcoui-modal-header\s*\{[\s\S]*border-bottom:\s*1px/.test(sharedControls) && /\.arcoui-modal-footer\s*\{[\s\S]*border-top:\s*1px/.test(sharedControls), 'Shared Modal must separate Header, Body and Footer with one weak divider.');
expect(!/bodyStyle=\{\{[^}]*\b(?:padding|overflow)\s*:/.test(productUiSource), 'Business modals must not override platform Body padding or overflow; use a published bodyLayout variant.');
expect(/\.dark\s*\{[\s\S]*--ds-navigation-selected-bg:\s*var\(--ds-color-brand\)/.test(foundation), 'Dark primary navigation Selected must use the solid brand background.');
expect(!/html\[data-theme=['"]dark['"]\]\s+\.arcoui-tag\[data-tone=['"]accent['"]\]/.test(sharedControls), 'Accent Tag must remain metadata styling and must not masquerade as a Selected control.');
expect(!/\.arcoui-select-option\[data-selected\][^}]*box-shadow:\s*inset\s+3px\s+0/.test(sharedControls), 'Selected options must not use a navigation-style leading indicator.');
expect(!/#ECECF0|#FFFFFF/.test(dataManagementStyles), 'Data-management tabs and overlays must use theme tokens instead of fixed Light-theme colors.');
expect(/--ds-state-success-(?:bg|border|text)/.test(sourceContent), 'At least one product feedback surface must consume the Success state tokens.');

['## 12. 组件状态模型', '## 14. 表单规范', '## 15. Table、列表与数据操作规范', '## 16. 浮层与反馈规范', '## 18. 版本管理与自动化验收', '## 27. 交互规范'].forEach((heading) => {
  expect(guidelines.includes(heading), `Guidelines is missing required section: ${heading}`);
});

['## 20. 页面模板、业务组合与页面级状态', '### 20.2 页面模板矩阵', '### 20.3 可复用业务组合', '### 20.4 页面级状态矩阵', '### 20.5 响应式、溢出与拉伸规则'].forEach((heading) => {
  expect(guidelines.includes(heading), `Guidelines is missing page-pattern coverage: ${heading}`);
});

['## 21. 动效规范', '### 21.1 动效场景矩阵', '### 21.2 实现与无障碍约束'].forEach((heading) => {
  expect(guidelines.includes(heading), `Guidelines is missing motion coverage: ${heading}`);
});

expect(handoffTokens.version === '1.8.0', 'Token handoff version must match the published token contract.');
expect(handoffTokens.theme?.light?.color?.brand === '#241F7D', 'Token handoff is missing the light brand token.');
expect(handoffTokens.theme?.dark?.color?.brand === '#4F46E5', 'Token handoff is missing the dark brand token.');
expect(handoffTokens.stylePresets?.current?.status === 'stable', 'Token handoff is missing the stable Current style preset.');
expect(JSON.stringify(handoffTokens.stylePresets?.industrial?.supportedThemes) === JSON.stringify(['light', 'dark']), 'Industrial style preset must support Light and Dark.');
expect(handoffTokens.stylePresets?.industrial?.theme?.light?.color?.brand === '#255D76', 'Industrial Light is missing the published steel-blue interface color.');
expect(handoffTokens.stylePresets?.industrial?.theme?.dark?.color?.brand === '#317895', 'Industrial Dark is missing the published steel-blue interface color.');
expect(handoffTokens.stylePresets?.industrial?.theme?.light?.color?.signal === '#E56A17', 'Industrial Light is missing the published orange signal color.');
expect(handoffTokens.stylePresets?.industrial?.defaultColorTheme === 'steel', 'Industrial style must default to the steel color theme.');
expect(Object.keys(handoffTokens.stylePresets?.industrial?.colorThemes ?? {}).length === 3, 'Industrial style must publish steel, cobalt, and graphite color themes.');
expect(handoffTokens.stylePresets?.industrial?.colorThemes?.cobalt?.theme?.light?.color?.brand === '#241F7D', 'Industrial brand-purple theme must use #241F7D.');
expect(handoffTokens.stylePresets?.industrial?.theme?.light?.color?.page === '#F0F0F0', 'Industrial Light default page background must be #F0F0F0.');
expect(handoffTokens.stylePresets?.industrial?.theme?.light?.color?.border === '#D9E0E4', 'Industrial Light default border must be #D9E0E4.');
expect(handoffTokens.stylePresets?.industrial?.theme?.light?.color?.borderStrong === '#C7D0D5', 'Industrial Light strong border must be #C7D0D5.');
expect(handoffTokens.stylePresets?.industrial?.colorThemes?.cobalt?.theme?.light?.color?.page === '#F0F0F0', 'Industrial Light brand-purple page background must be #F0F0F0.');
expect(handoffTokens.stylePresets?.industrial?.colorThemes?.graphite?.theme?.light?.color?.page === '#F0F0F0', 'Industrial Light graphite page background must be #F0F0F0.');
expect(handoffTokens.stylePresets?.industrial?.layout?.pagePadding === 0, 'Industrial page padding must be zero.');
expect(handoffTokens.stylePresets?.industrial?.layout?.moduleGap === 0, 'Industrial first-level module gap must be zero.');
expect(handoffTokens.stylePresets?.industrial?.radius?.control === 4, 'Industrial style preset is missing the compact control radius.');
expect(handoffTokens.components?.button?.height?.md === 40, 'Token handoff is missing the standard button height.');
expect(handoffTokens.components?.button?.paddingInline?.md === 14, 'Token handoff is missing the published button padding matrix.');
expect(handoffTokens.components?.button?.spinner?.size === 14, 'Token handoff is missing the button spinner specification.');
expect(handoffTokens.components?.button?.primary?.hover?.background, 'Token handoff is missing the Primary hover specification.');
expect(handoffTokens.components?.button?.primary?.default?.background === '{theme.color.brand}', 'Primary button must use the published brand color in Light and Dark.');
expect(handoffTokens.components?.button?.secondary?.pressed?.border === '{state.pressed.border}', 'Token handoff is missing the Secondary pressed specification.');
expect(handoffTokens.shared?.icon?.style?.includes('24 × 24 viewBox'), 'Token handoff is missing the icon viewBox contract.');
expect(handoffTokens.shared?.icon?.size?.md === 16, 'Token handoff is missing the standard icon size scale.');
expect(handoffTokens.components?.search?.height === 40, 'Token handoff is missing SearchInput dimensions.');
expect(handoffTokens.components?.switch?.width === 36, 'Token handoff is missing Switch dimensions.');
expect(handoffTokens.components?.switch?.thumb === '{theme.color.accentContrast}' && foundation.includes('--ds-switch-thumb: var(--ds-color-accent-contrast)'), 'Switch thumb must remain high contrast in Light and Dark themes.');
expect(handoffTokens.components?.pagination?.itemSize === 32, 'Token handoff is missing Pagination dimensions.');
expect(Boolean(handoffTokens.components?.table?.outerBorder && handoffTokens.components?.table?.headerDivider && handoffTokens.components?.table?.rowDivider), 'Table divider tokens are incomplete.');
expect(handoffTokens.components?.table?.columnDivider === 'transparent', 'Table column dividers must be transparent by default.');
expect(Boolean(handoffTokens.components?.table?.fixedDivider), 'Table fixed-column divider token is missing.');
expect(handoffTokens.components?.table?.typography?.header?.fontSize === 12, 'Table header typography must use 12px.');
expect(handoffTokens.components?.table?.typography?.header?.fontWeight === 500, 'Table header typography must use weight 500.');
expect(handoffTokens.components?.table?.typography?.cell?.fontSize === 14, 'Table cell typography must use 14px.');
expect(handoffTokens.components?.table?.typography?.cell?.fontWeight === 400, 'Table cell typography must use weight 400.');
expect(handoffTokens.components?.table?.typography?.primaryCell?.fontWeight === 500, 'Table primary cells must use weight 500.');
expect(handoffTokens.components?.table?.typography?.number?.fontVariantNumeric === 'tabular-nums', 'Table numbers must use tabular numerals.');
expect(handoffTokens.shared?.control?.table?.rowHeight === 60 && foundation.includes('--ds-table-row-height: 60px'), 'Current table row height must remain 60px in tokens and runtime CSS.');
expect(handoffTokens.shared?.motion?.duration?.mid === '160ms', 'Token handoff is missing the standard motion duration.');
expect(handoffTokens.state?.focus?.ringWidth === 2, 'Token handoff is missing the focus-ring contract.');
expect(handoffTokens.shared?.zIndex?.modalPopover === 75, 'Token handoff is missing the modal-popover layer.');
expect(handoffTokens.components?.checkbox?.checked?.background === '{theme.color.brand}' && handoffTokens.components?.checkbox?.checked?.indicator === '{theme.color.accentContrast}', 'Token handoff is missing the checked-checkbox brand background or contrast indicator.');
expect(handoffTokens.components?.checkbox?.indeterminate?.background === '{theme.color.brand}' && handoffTokens.components?.checkbox?.indeterminate?.indicator === '{theme.color.accentContrast}', 'Token handoff is missing the indeterminate-checkbox background or contrast indicator.');
expect(componentContracts.version === handoffTokens.version, 'Component contracts and token handoff must use the same published version.');
expect(componentContracts.components?.length >= 15, 'Component contracts must cover the published baseline component set.');
['Button', 'ToggleButton', 'IconToggleButton', 'IconButton', 'Tag', 'Tabs', 'Pagination', 'Menu / Dropdown', 'Input / TextArea', 'SearchInput / SearchBar', 'InputNumber', 'Select', 'Radio', 'Switch', 'Checkbox', 'Upload', 'Table', 'Tree', 'DateTimePicker', 'Steps', 'Modal', 'Drawer', 'Tooltip / Popover', 'Toast / Notification', 'ContentState (Empty / Loading / Error)'].forEach((name) => {
  expect(componentContracts.components?.some((component) => component.name === name), `Component contracts is missing ${name}.`);
});
const buttonContract = componentContracts.components?.find((component) => component.name === 'Button');
const inputContract = componentContracts.components?.find((component) => component.name === 'Input / TextArea');
const selectContract = componentContracts.components?.find((component) => component.name === 'Select');
const checkboxContract = componentContracts.components?.find((component) => component.name === 'Checkbox');
const tableContract = componentContracts.components?.find((component) => component.name === 'Table');
const modalContract = componentContracts.components?.find((component) => component.name === 'Modal');
expect(JSON.stringify(buttonContract?.states) === JSON.stringify(['Default', 'Hover', 'Pressed', 'Focus', 'Disabled', 'Loading']), 'Button must not expose Selected or Danger as an interaction state.');
['primary', 'secondary', 'dangerSoft', 'dangerSolid'].forEach((variant) => {
  const rows = buttonContract?.stateMatrix?.[variant] ?? [];
  expect(rows.length === 6, `Button ${variant} state matrix must include six states.`);
  rows.forEach((row) => ['background', 'text', 'border', 'icon', 'shadow', 'focusRing', 'cursor', 'opacity', 'transition'].forEach((field) => {
    expect(Boolean(row[field]), `Button ${variant} ${row.state ?? 'state'} must declare ${field}.`);
  }));
});
expect(buttonContract?.metrics?.length >= 6, 'Button must publish internal metrics.');
expect(buttonContract?.contentStructures?.length === 5, 'Button must publish all supported content structures.');
expect(buttonContract?.selectedBoundary?.includes('ToggleButton'), 'Button must define the Selected boundary.');
expect(inputContract?.states?.includes('Loading'), 'Input / TextArea must publish its Loading state.');
expect(selectContract?.states?.includes('Filled'), 'Select must publish its Filled state.');
expect(checkboxContract?.states?.includes('Indeterminate'), 'Checkbox must publish its Indeterminate state.');
expect(tableContract?.presetMetrics?.current?.headerHeight === 44 && tableContract?.presetMetrics?.current?.rowHeight === 60, 'Current Table metrics must remain 44px / 60px.');
expect(tableContract?.presetMetrics?.industrial?.headerHeight === 40 && tableContract?.presetMetrics?.industrial?.rowHeight === 48, 'Industrial Table metrics must remain 40px / 48px.');
expect(modalContract?.rules?.some((rule) => rule.includes('统一引用 §3.2')), 'Modal must reference the authoritative natural-height and scrolling contract.');
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
expect(/\.arcoui-checkbox-row\[data-indeterminate\][\s\S]*?--ds-checkbox-indeterminate-bg/.test(sharedControls), 'Shared checkboxes must render the published Indeterminate treatment.');
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
const designGuidelinesSource = read('src/app/components/DesignGuidelines.tsx');
expect(designGuidelinesSource.includes("label: '键盘与快捷键'"), 'Design Guidelines must expose one combined keyboard and shortcut entry.');
expect(!designGuidelinesSource.includes("label: '快捷键体系'") && !designGuidelinesSource.includes("label: '导航与历史状态'"), 'Design Guidelines must not expose duplicate shortcut or navigation-history entries.');
const interactionPreviewSource = designGuidelinesSource.slice(designGuidelinesSource.indexOf('function InteractionSpecPreview'), designGuidelinesSource.indexOf('function ConfigurationAuthoringPreview'));
expect(interactionPreviewSource.includes('<ProductButton') && interactionPreviewSource.includes('<ProductModal') && interactionPreviewSource.includes('<ProductDrawer'), 'Interaction previews must reuse the published Product UI components.');
expect(interactionPreviewSource.includes('PublishedInteractionPreview'), 'Interaction topics must render the already-published component previews.');
expect(!/<(?:button|input|select|textarea)\b/.test(interactionPreviewSource), 'Interaction previews must not recreate controls with raw HTML; use Product UI components.');
expect(!/ds-interaction-demo|ds-overlay-decision__(?:surface|drawer|stage|tabs|tab|preview|launch|question)/.test(interactionPreviewSource), 'Interaction previews must not introduce a private demonstration visual system.');
expect(!read('src/styles/business/design-guidelines.css').includes('.ds-interaction-demo'), 'Interaction preview CSS must not retain private component replicas.');
expect(/function DangerOperationPreview[\s\S]*<ProductModal[\s\S]*status="danger"/.test(interactionPreviewSource), 'Danger-operation preview must open the published ProductModal danger variant.');
expect(read('src/app/components/DesignGuidelines.tsx').includes("topicKey === 'search-filter'"), 'Search guidance must provide its own visual preview.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('isNumericComponentSearchTerm'), 'Design Guidelines search must match numeric queries against published component sizes only.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('getComponentSearchScore'), 'Design Guidelines search must rank structured component fields instead of concatenating every value.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('createTokenSearchItems'), 'Design Guidelines search must index published Token names and values.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('createTopicSearchItems'), 'Design Guidelines search must index all published guideline topics and source excerpts.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('requiresPixels'), 'Pixel queries must not match unitless or motion Token values.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('closeComponentSearch'), 'Design Guidelines search must dismiss when the user clicks outside.');
expect(/\.ds-guidelines__component-search-results[^}]*max-height:[^}]*overflow-y:\s*auto/.test(designGuidelines), 'Design Guidelines search results must scroll within a bounded overlay.');
expect(/\.ds-guidelines__content-toolbar[^}]*position:\s*sticky[^}]*top:\s*0/.test(designGuidelines), 'Design Guidelines global search toolbar must remain fixed while content scrolls.');
expect(/\.ds-guidelines__content-toolbar[^}]*border-bottom:\s*0/.test(designGuidelines), 'Design Guidelines sticky toolbar must not add an extra horizontal divider.');
expect(read('src/app/components/DesignGuidelines.tsx').indexOf('复制 Token') < read('src/app/components/DesignGuidelines.tsx').indexOf('ds-guidelines__search-shell'), 'Design Guidelines global search must be the final toolbar action.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('className="ds-guidelines__copy-token"'), 'Copy Token must publish a dedicated height contract.');
expect(/\.ds-guidelines__copy-token\s*\{[^}]*height:\s*var\(--ds-search-height\)/.test(designGuidelines), 'Copy Token must be the same height as global search.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('ds-status-tabs ds-guidelines__component-tabs-preview'), 'Tabs preview must reuse the published Data Management tab pattern.');
expect(foundation.includes('--ds-tabs-item-bg-default: var(--ds-color-button-bg)'), 'Tabs must publish a Default background Token.');
expect(pagePatterns.includes('background: var(--ds-tabs-item-bg-default)'), 'Shared Tabs must consume the Default background Token.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('taxonomy-tree ds-guidelines__component-tree'), 'Tree preview must reuse the published Product Directory tree pattern.');
expect(read('src/app/components/ProductUI.tsx').includes('ArcoDateTimePicker as ProductDateTimePicker'), 'Product UI must publish the shared DateTimePicker wrapper.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('<ProductDateTimePicker'), 'DateTimePicker contract must include a working product-component preview.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('status="error"'), 'Error-field preview must use the shared error state contract.');
expect(read('src/styles/business/design-guidelines.css').includes('.ds-guidelines__component-query button'), 'Search preview button styles must stay scoped to the query control.');
expect(!read('src/styles/business/design-guidelines.css').includes('.ds-guidelines__component-search button'), 'Search preview must not override nested Select or Button components.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('function SearchInputStylePreview()'), 'SearchInput preview must provide immediate result updates.');
expect(!read('src/app/components/DesignGuidelines.tsx').includes('ProductButton type="primary">筛选</ProductButton>'), 'Search preview must not include a filter submit button.');
expect(/SearchInputStylePreview[\s\S]*ProductSelect[\s\S]*重置/.test(read('src/app/components/DesignGuidelines.tsx')), 'SearchBar preview must retain live filter and reset controls.');
expect(foundation.includes('--ds-button-danger-soft-border: transparent'), 'Danger Soft actions must not render a red outer border.');
expect(!read('src/app/components/ConfigurationTemplateManager.tsx').includes("item.description || '暂无描述'"), 'Configuration Template list must not render the description below the name.');
expect(/\.dictionary-row-actions\s*\{[^}]*width:\s*100%[^}]*justify-content:\s*flex-end/.test(read('src/styles/business/dictionary-config.css')), 'Dictionary action icons must align to the right edge of the operation column.');
expect(read('src/styles/business/dictionary-config.css').includes('.dictionary-empty'), 'Dictionary filtered-empty state must use a centered ContentState layout.');
expect(foundation.includes('--ds-tag-font-size-sm: var(--ds-font-size-12)'), 'Small Tag typography must remain readable at 12px.');
['neutral', 'accent', 'success', 'warning', 'danger'].forEach((tone) => {
  expect(foundation.includes(`--ds-tag-${tone}-bg:`) && foundation.includes(`--ds-tag-${tone}-text:`), `Tag tone ${tone} must publish semantic fill and text Tokens.`);
  expect(sharedControls.includes(`var(--ds-tag-${tone}-bg)`) && sharedControls.includes(`var(--ds-tag-${tone}-text)`), `Tag tone ${tone} must consume its published semantic Tokens.`);
});
expect(!/\.arcoui-tag[^}]*color-mix/.test(sharedControls), 'Tag base styles must not create ad-hoc mixed colors.');
expect(!read('src/app/components/DesignGuidelines.tsx').includes('<ProductButton size="small">重置</ProductButton>'), 'List-page Reset must use the shared 40px toolbar button size.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('PageTemplateVisualPreview'), 'Page templates must provide structural visual previews.');
expect(read('src/app/components/DesignGuidelines.tsx').includes("setConfigTab(key)"), 'Config-page preview must provide working configuration navigation.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('ds-guidelines__template-form-grid'), 'Form-page preview must use the published grouped form layout.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('ds-guidelines__template-status-list'), 'Dashboard preview must contain a concrete status list.');
expect(read('src/app/components/DesignGuidelines.tsx').includes('ds-guidelines__template-canvas-widget'), 'Editor preview must contain concrete canvas widgets.');
expect(read('src/app/components/ArcoLike.tsx').includes('arcoui-field-description'), 'Field component must support a short right-aligned label description.');
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
