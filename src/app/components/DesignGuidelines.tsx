import { useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronRight, CircleAlert, CircleCheck, ClipboardCopy, FileText, Info, Minus, Pencil, Plus, Search, Sparkles, Trash2, X } from 'lucide-react';
import tokens from '../../../guidelines/tokens/design-tokens.json';
import componentSpecs from '../../../guidelines/components/component-specs.json';
import guidelinesMarkdown from '../../../guidelines/docs/ui-guidelines.md?raw';
import {
  ProductButton,
  ProductCheckbox,
  ProductField,
  ProductIconButton,
  ProductIconToggleButton,
  ProductTag,
  ProductToggleButton,
  ProductSelect,
  ProductTextInput,
  ProductUploadBox,
} from './ProductUI';
import type { ThemeMode } from '../theme';

type GuideSection = 'tokens' | 'components' | 'overlays';
type ComponentSpec = typeof componentSpecs.components[number];
type GuidelineExcerpt = { marker: string; title: string };

const GUIDE_GROUPS: Array<{ label: string; items: Array<{ key: string; label: string; section: GuideSection }> }> = [
  { label: '基础', items: [
    { key: 'colors', label: '颜色', section: 'tokens' }, { key: 'typography', label: '字体', section: 'tokens' },
    { key: 'icons', label: '图标', section: 'tokens' }, { key: 'spacing', label: '间距', section: 'tokens' },
    { key: 'copywriting', label: '内容文案', section: 'components' }, { key: 'radius', label: '圆角', section: 'tokens' }, { key: 'shadow', label: '阴影', section: 'tokens' },
    { key: 'motion', label: '动效', section: 'tokens' }, { key: 'layers', label: '层级', section: 'overlays' },
  ] },
  { label: '布局', items: [
    { key: 'page-frame', label: '页面框架', section: 'tokens' }, { key: 'grid', label: '栅格', section: 'tokens' },
    { key: 'layout-spacing', label: '间距', section: 'tokens' }, { key: 'responsive', label: '响应式', section: 'tokens' },
    { key: 'overflow', label: '滚动与溢出', section: 'tokens' },
  ] },
  { label: '组件', items: [
    { key: 'general', label: '通用', section: 'components' }, { key: 'button', label: '按钮', section: 'components' }, { key: 'navigation', label: '导航', section: 'components' },
    { key: 'data-entry', label: '数据录入', section: 'components' }, { key: 'data-display', label: '数据展示', section: 'components' },
    { key: 'feedback', label: '反馈', section: 'overlays' }, { key: 'other', label: '其他', section: 'components' },
  ] },
  { label: '模式', items: [
    { key: 'search-filter', label: '搜索与筛选', section: 'components' }, { key: 'form-submit', label: '表单提交', section: 'components' },
    { key: 'batch', label: '批量操作', section: 'overlays' }, { key: 'import', label: '上传导入', section: 'components' },
    { key: 'delete-confirm', label: '删除确认', section: 'overlays' }, { key: 'long-task', label: '长任务', section: 'overlays' },
  ] },
  { label: '模板', items: [
    { key: 'list-page', label: '列表页', section: 'components' }, { key: 'detail-page', label: '详情页', section: 'components' },
    { key: 'config-page', label: '配置页', section: 'components' }, { key: 'form-page', label: '表单页', section: 'components' },
    { key: 'dashboard-page', label: '看板页', section: 'components' }, { key: 'editor-page', label: '编辑器', section: 'components' },
  ] },
  { label: '开发', items: [
    { key: 'design-tokens', label: 'Design Token', section: 'tokens' }, { key: 'component-api', label: '组件 API', section: 'components' },
    { key: 'code-examples', label: '代码示例', section: 'components' }, { key: 'changelog', label: '版本记录', section: 'tokens' },
    { key: 'migration', label: '迁移说明', section: 'tokens' },
  ] },
];

const GUIDELINE_SECTION_MAP: Record<string, GuidelineExcerpt[]> = {
  colors: [{ marker: '### 颜色', title: '颜色' }, { marker: '### 9.1 语义颜色与主题', title: '语义颜色与主题' }],
  typography: [{ marker: '### 字体', title: '字体' }],
  icons: [{ marker: '### 11.5 图标规范', title: '图标规范' }],
  copywriting: [{ marker: '### 11.6 内容文案规范', title: '内容文案规范' }],
  button: [{ marker: '### 13.1 Button、ToggleButton 与 IconButton', title: '按钮' }],
  spacing: [{ marker: '### 间距', title: '间距' }],
  radius: [{ marker: '### 圆角、阴影、层级与透明度', title: '圆角、阴影、层级与透明度' }],
  shadow: [{ marker: '### 圆角、阴影、层级与透明度', title: '圆角、阴影、层级与透明度' }],
  motion: [{ marker: '## 21. 动效规范', title: '动效规范' }],
  layers: [{ marker: '### 圆角、阴影、层级与透明度', title: '层级与透明度' }, { marker: '## 16. 浮层与反馈规范', title: '浮层层级' }],
  'page-frame': [{ marker: '## 2. 页面布局', title: '页面布局' }, { marker: '### 20.1 模板通用骨架', title: '模板通用骨架' }],
  grid: [{ marker: '## 2. 页面布局', title: '页面布局' }, { marker: '### 9.4 布局与响应值', title: '布局与响应值' }],
  'layout-spacing': [{ marker: '### 间距', title: '间距' }, { marker: '### 9.4 布局与响应值', title: '布局与响应值' }],
  responsive: [{ marker: '## 6. 响应规则', title: '响应规则' }, { marker: '## 17. 响应式、溢出与国际化', title: '响应式、溢出与国际化' }, { marker: '### 20.5 响应式、溢出与拉伸规则', title: '页面收敛规则' }],
  overflow: [{ marker: '## 17. 响应式、溢出与国际化', title: '响应式、溢出与国际化' }, { marker: '### 20.5 响应式、溢出与拉伸规则', title: '页面收敛规则' }],
  general: [{ marker: '## 3. 基础组件', title: '基础组件' }, { marker: '### 3.1 组件使用与视觉契约', title: '组件使用与视觉契约' }],
  navigation: [{ marker: '### 13.5 Pagination', title: 'Pagination' }, { marker: '### 13.6 Tabs 与 Menu', title: 'Tabs 与 Menu' }, { marker: '### 11.3 展开、选择与筛选', title: '展开、选择与筛选' }],
  'data-entry': [{ marker: '## 14. 表单规范', title: '表单规范' }, { marker: '### 13.2 SearchInput 与 SearchBar', title: 'SearchInput 与 SearchBar' }, { marker: '### 13.3 Input、InputNumber 与 Select', title: '输入控件' }, { marker: '### 13.4 Radio、Switch 与 Checkbox', title: '选择控件' }],
  'data-display': [{ marker: '## 15. Table、列表与数据操作规范', title: 'Table、列表与数据操作规范' }],
  feedback: [{ marker: '## 16. 浮层与反馈规范', title: '浮层与反馈规范' }, { marker: '### 3.2 弹窗标准', title: '弹窗标准' }, { marker: '### 11.2 弹窗与确认', title: '弹窗与确认' }],
  other: [{ marker: '## 4. 业务组件', title: '业务组件' }, { marker: '### 20.4 页面级状态矩阵', title: '页面级状态矩阵' }],
  'search-filter': [{ marker: '### 11.3 展开、选择与筛选', title: '搜索与筛选' }, { marker: '### 20.3 可复用业务组合', title: '业务组合' }],
  'form-submit': [{ marker: '## 14. 表单规范', title: '表单提交' }, { marker: '### 20.3 可复用业务组合', title: '业务组合' }],
  batch: [{ marker: '### 15.2 状态与行为', title: '批量操作' }, { marker: '### 20.3 可复用业务组合', title: '业务组合' }],
  import: [{ marker: '### 20.3 可复用业务组合', title: '上传导入' }],
  'delete-confirm': [{ marker: '### 3.2 弹窗标准', title: '删除确认' }, { marker: '### 20.3 可复用业务组合', title: '业务组合' }],
  'long-task': [{ marker: '## 16. 浮层与反馈规范', title: '长任务反馈' }, { marker: '### 20.3 可复用业务组合', title: '业务组合' }],
  'list-page': [{ marker: '### 20.1 模板通用骨架', title: '模板通用骨架' }],
  'detail-page': [{ marker: '### 20.1 模板通用骨架', title: '模板通用骨架' }],
  'config-page': [{ marker: '### 20.1 模板通用骨架', title: '模板通用骨架' }],
  'form-page': [{ marker: '### 20.1 模板通用骨架', title: '模板通用骨架' }],
  'dashboard-page': [{ marker: '### 20.1 模板通用骨架', title: '模板通用骨架' }],
  'editor-page': [{ marker: '### 20.1 模板通用骨架', title: '模板通用骨架' }],
  'design-tokens': [{ marker: '## 9. 已发布设计 Token 对照', title: '已发布设计 Token 对照' }, { marker: '## 10. 基于现有 Token 的验收清单', title: 'Token 验收清单' }],
  'component-api': [{ marker: '### 18.4 组件交付契约', title: '组件交付契约' }, { marker: '## 13. 已发布组件 Token 与组件契约', title: '组件 Token 与契约' }],
  'code-examples': [{ marker: '## 19. Vibe Coding 生成约束', title: '生成约束' }, { marker: '### 18.4 组件交付契约', title: '组件交付契约' }],
  changelog: [{ marker: '## 18. 版本管理与自动化验收', title: '版本管理与自动化验收' }],
  migration: [{ marker: '## 8. 开发约束', title: '开发约束' }, { marker: '## 10. 基于现有 Token 的验收清单', title: '验收清单' }, { marker: '## 18. 版本管理与自动化验收', title: '发布与迁移' }],
};

const COLOR_GROUPS = [
  { title: '页面与表面', items: [
    { token: '--ds-color-page', label: '页面底色', description: '页面与工作区背景', light: tokens.theme.light.color.page, dark: tokens.theme.dark.color.page },
    { token: '--ds-color-layout', label: '布局底色', description: '次级布局容器', light: tokens.theme.light.color.layout, dark: tokens.theme.dark.color.layout },
    { token: '--ds-color-surface', label: '内容表面', description: '卡片、表单与弹窗', light: tokens.theme.light.color.surface, dark: tokens.theme.dark.color.surface },
    { token: '--ds-color-surface-raised', label: '抬升表面', description: '内容内部层级', light: tokens.theme.light.color.surfaceRaised, dark: tokens.theme.dark.color.surfaceRaised },
    { token: '--ds-color-soft', label: '弱背景', description: '局部弱分区', light: tokens.theme.light.color.soft, dark: tokens.theme.dark.color.soft },
    { token: '--ds-color-overlay', label: '遮罩', description: 'Modal、Drawer 背景遮罩', light: tokens.theme.light.color.overlay, dark: tokens.theme.dark.color.overlay },
  ] },
  { title: '文本、图标与边框', items: [
    { token: '--ds-color-heading', label: '标题文字', description: '标题与核心信息', light: tokens.theme.light.color.heading, dark: tokens.theme.dark.color.heading },
    { token: '--ds-color-text', label: '正文文字', description: '正文与常规信息', light: tokens.theme.light.color.text, dark: tokens.theme.dark.color.text },
    { token: '--ds-color-muted', label: '弱化文字', description: '说明、时间与低优先级信息', light: tokens.theme.light.color.muted, dark: tokens.theme.dark.color.muted },
    { token: '--ds-color-icon', label: '图标', description: '常规功能图标', light: tokens.theme.light.color.icon, dark: tokens.theme.dark.color.icon },
    { token: '--ds-color-border', label: '标准描边', description: '表面与控件边界', light: tokens.theme.light.color.border, dark: tokens.theme.dark.color.border },
    { token: '--ds-color-border-strong', label: '强调描边', description: '需要更强边界的场景', light: tokens.theme.light.color.borderStrong, dark: tokens.theme.dark.color.borderStrong },
  ] },
  { title: '品牌与交互', items: [
    { token: '--ds-color-brand', label: '品牌色', description: '品牌识别与主操作基调', light: tokens.theme.light.color.brand, dark: tokens.theme.dark.color.brand },
    { token: '--ds-color-accent', label: '交互主色', description: '主操作、已选与关键入口', light: tokens.theme.light.color.accent, dark: tokens.theme.dark.color.accent },
    { token: '--ds-color-accent-contrast', label: '主色反白', description: '主按钮和高对比背景前景', light: tokens.theme.light.color.accentContrast, dark: tokens.theme.dark.color.accentContrast },
    { token: '--ds-color-accent-soft', label: '主色弱背景', description: '已选与轻强调表面', light: tokens.theme.light.color.accentSoft, dark: tokens.theme.dark.color.accentSoft },
    { token: '--ds-color-focus', label: 'Focus', description: '键盘焦点关联颜色', light: tokens.theme.light.color.focus, dark: tokens.theme.dark.color.focus },
    { token: '--ds-color-info', label: '信息', description: '信息性反馈', light: tokens.theme.light.color.info, dark: tokens.theme.dark.color.info },
    { token: '--ds-color-info-soft', label: '信息弱背景', description: '信息提示表面', light: tokens.theme.light.color.infoSoft, dark: tokens.theme.dark.color.infoSoft },
  ] },
  { title: '反馈语义', items: [
    { token: '--ds-color-success', label: '成功', description: '操作完成与健康状态', light: tokens.theme.light.color.success, dark: tokens.theme.dark.color.success },
    { token: '--ds-color-success-soft', label: '成功弱背景', description: '成功提示表面', light: tokens.theme.light.color.successSoft, dark: tokens.theme.dark.color.successSoft },
    { token: '--ds-color-warning', label: '警示', description: '需关注但可恢复的提示', light: tokens.theme.light.color.warning, dark: tokens.theme.dark.color.warning },
    { token: '--ds-color-warning-soft', label: '警示弱背景', description: '警示提示表面', light: tokens.theme.light.color.warningSoft, dark: tokens.theme.dark.color.warningSoft },
    { token: '--ds-color-danger', label: '错误 / 危险', description: '失败与不可逆操作', light: tokens.theme.light.color.danger, dark: tokens.theme.dark.color.danger },
    { token: '--ds-color-danger-soft', label: '错误弱背景', description: '错误提示表面', light: tokens.theme.light.color.dangerSoft, dark: tokens.theme.dark.color.dangerSoft },
  ] },
];

const COLOR_TOKENS = COLOR_GROUPS.flatMap(group => group.items);

const SPACING_TOKENS = [
  ['--ds-space-1', '4px'], ['--ds-space-2', '8px'], ['--ds-space-3', '12px'],
  ['--ds-space-4', '16px'], ['--ds-space-5', '20px'], ['--ds-space-6', '24px'],
  ['--ds-space-8', '32px'], ['--ds-space-10', '40px'],
];

const MOTION_TOKENS = [
  ['--ds-motion-duration-fast', '120ms', '即时反馈'],
  ['--ds-motion-duration-mid', '160ms', '常规控件过渡'],
  ['--ds-motion-duration-slow', '240ms', '浮层与页面进入'],
  ['--ds-motion-ease-in-out', 'cubic-bezier(0.2, 0, 0, 1)', '状态切换'],
];

type TopicDocument = {
  title: string;
  description: string;
  parameterTitle: string;
  parameters: Array<{ token: string; value: string; description?: string }>;
  rules: string[];
  preview: 'colors' | 'type' | 'icon' | 'spacing' | 'radius' | 'shadow' | 'motion' | 'layout' | 'document';
};

const TOKEN_DOCUMENTS: Record<string, TopicDocument> = {
  colors: { title: '颜色', description: '颜色按语义使用，并随浅色与深色主题自动切换。业务页面不得直接写色值。', parameterTitle: '颜色 Token', parameters: COLOR_TOKENS.map(item => ({ token: item.token, value: `var(${item.token})`, description: item.description })), rules: ['品牌主色用于主操作、已选与 Focus 关联状态。', 'Success、Warning、Danger 只表达对应业务语义，不能互相替代。', '反馈同时使用文字、图标或形状，不只依赖颜色。'], preview: 'colors' },
  typography: { title: '字体', description: '字体、字号、字重和行高均从已发布 Token 选择，保证中英文与数字在不同页面一致。', parameterTitle: '排版 Token', parameters: [{ token: '--ds-font-family-sans', value: 'PingFang SC / Noto Sans SC / Microsoft YaHei' }, { token: '--ds-font-size-10', value: '10px', description: '低优先级补充信息' }, { token: '--ds-font-size-12', value: '12px', description: '辅助信息、表头、标签' }, { token: '--ds-font-size-14', value: '14px', description: '正文、字段、菜单与按钮' }, { token: '--ds-font-size-16', value: '16px', description: '模块标题' }, { token: '--ds-font-size-18', value: '18px', description: '弹窗标题' }, { token: '--ds-font-size-20 / 24', value: '20 / 24px', description: '页面标题' }, { token: '--ds-line-height-tight / normal / relaxed', value: '1.25 / 1.5 / 1.7', description: '标题 / 正文 / 长说明' }], rules: ['正文、字段、菜单与按钮使用 14px；辅助信息、表头与标签使用 12px。', '模块标题使用 16px，弹窗标题使用 18px，页面标题使用 20 或 24px。', '标题使用 600；正文使用 400；交互与表头使用 500/600。', '长文本允许换行或截断，但核心数值与单位不能分离。', '不得引入页面私有字体。'], preview: 'type' },
  icons: { title: '图标', description: '操作图标使用统一线性体系；尺寸、颜色和方向均遵循已发布规则。', parameterTitle: '图标参数', parameters: [{ token: '--ds-icon-size-xs', value: '12px', description: '紧凑状态标记' }, { token: '--ds-icon-size-sm', value: '14px', description: '24px 控件' }, { token: '--ds-icon-size-md', value: '16px', description: '32 / 40px 常规控件' }, { token: '--ds-icon-size-lg', value: '20px', description: '页面级操作或空状态辅助' }, { token: '--ds-icon-size-xl', value: '24px', description: '模块级图标' }, { token: '--ds-icon-stroke-width', value: '1.8px', description: '统一线性描边' }, { token: '--ds-icon-color', value: 'var(--ds-color-icon)', description: '默认图标色；按钮内继承文字色' }], rules: ['同一页面不得混用多套操作图标风格。', '状态图标使用语义色并与文字同时出现。', '自定义 SVG 统一 24 × 24 viewBox、1.8px 描边与 currentColor。', '方向图标遵循右进、左回、下展、上收。'], preview: 'icon' },
  spacing: { title: '间距', description: '以 4px 为基准；页面、模块与控件的间距仅从当前刻度选择。', parameterTitle: '间距 Token', parameters: SPACING_TOKENS.map(([token, value]) => ({ token, value })), rules: ['页面、模块、控件内间距分别使用已发布布局或间距 Token。', '局部强关联元素可使用 4px 或 8px；不得以 10px、14px、18px 等临时值补位。', '响应式断点下使用规范定义的间距，不另设例外。'], preview: 'spacing' },
  radius: { title: '圆角', description: '圆角表达层级，而非装饰。相同类型控件必须使用相同圆角。', parameterTitle: '圆角 Token', parameters: [{ token: '--ds-radius-xs', value: '6px' }, { token: '--ds-radius-button', value: '8px' }, { token: '--ds-radius-control', value: '10px' }, { token: '--ds-radius-inner', value: '12px' }, { token: '--ds-radius-card', value: '16px' }, { token: '--ds-radius-pill', value: '999px' }], rules: ['Button 使用 button 圆角，输入与 Select 使用 control 圆角。', 'Card、Modal、Drawer 使用 16px；Tag 使用 pill。', '不得在业务页面新增同义圆角。'], preview: 'radius' },
  shadow: { title: '阴影', description: '阴影只用于当前系统已有的悬浮层级；常规卡片和表格优先通过描边与背景区分。', parameterTitle: '阴影 Token', parameters: [{ token: '--ds-shadow-none', value: '常规内容面、表格行' }, { token: '--ds-shadow-xs', value: '表格表面与轻层级' }, { token: '--ds-shadow-sm', value: '短提示条' }, { token: '--ds-shadow-card', value: '首页方案卡、画布容器' }, { token: '--ds-shadow-overlay', value: 'Menu、Select、Popover' }, { token: '--ds-shadow-dialog', value: '系统 Modal' }], rules: ['业务卡片和表格优先使用描边，不用投影制造层级。', 'Menu、Select、Popover 使用 overlay；系统 Modal 使用 dialog，其他页面不得自行组合新阴影。', '阴影不承担 Hover 的唯一反馈，也不用于常规分组容器。'], preview: 'shadow' },
  motion: { title: '动效', description: '动效只表达状态变化和空间关系，不用于装饰或延迟操作。', parameterTitle: '动效 Token', parameters: MOTION_TOKENS.map(([token, value, description]) => ({ token, value, description })), rules: ['Hover 使用 fast，常规控件状态使用 mid，浮层进入和页面切换使用 slow。', '支持减弱动效时，动画应收敛为无动画或最短必要过渡。', 'Pressed 不使用弹跳或大幅缩放。'], preview: 'motion' },
  'page-frame': { title: '页面框架', description: '页面由统一内容最大宽度、页面边距、导航与侧栏宽度组成。', parameterTitle: '布局参数', parameters: [{ token: '--ds-layout-content-max-width', value: '1680px' }, { token: '--ds-layout-page-padding', value: '24px' }, { token: '--ds-layout-navigation-width', value: '232px' }, { token: '--ds-layout-sidebar-width', value: '292px' }], rules: ['页面标题区域、主要操作区和内容区采用对应页面模板。', '只允许内容区滚动；固定操作区不与分页占用同一位置。'], preview: 'layout' },
  grid: { title: '栅格', description: '桌面页面使用 12 列栅格，模块间距使用已发布布局间距。', parameterTitle: '栅格参数', parameters: [{ token: '--ds-layout-grid-columns', value: '12' }, { token: '--ds-layout-grid-gap', value: '16px' }, { token: '--ds-layout-module-gap', value: '16px' }], rules: ['组件按列跨度排布，不能通过负边距或绝对定位破坏栅格。', '窄屏转为单列，并保持唯一内部滚动容器。'], preview: 'layout' },
  responsive: { title: '响应式', description: '响应式需明确断点与行为，不能只写“自适应”。', parameterTitle: '断点参数', parameters: [{ token: '--ds-layout-page-padding', value: 'desktop 24px / tablet 20px / mobile 16px' }, { token: 'minimumViewport', value: '320px' }, { token: 'tabletMax', value: '1199px' }, { token: 'mobileMax', value: '767px' }], rules: ['工具栏空间不足时，次要操作收进 More。', '表格横向滚动位于表格内部；Modal 在窄屏转为近全屏。', '标题、文件名和版本号可截断，但必须可查看完整内容。'], preview: 'layout' },
  overflow: { title: '滚动与溢出', description: '页面和组件必须声明唯一内部滚动容器及内容收敛方式。', parameterTitle: '滚动规则', parameters: [{ token: '--ds-modal-max-height', value: 'calc(100vh - 48px)' }, { token: '--ds-popover-max-width', value: '420px' }, { token: '--ds-tooltip-max-width', value: '280px' }], rules: ['Header 和 Footer 固定时，只允许 Body 滚动。', 'Select、Dropdown 和 Popover 碰撞视口时翻转或在最大高度内滚动。', '禁止页面级横向滚动来处理表格或长内容。'], preview: 'layout' },
  'design-tokens': { title: 'Design Token', description: 'Token JSON 是前端接入的唯一机器可读来源；点击右上角可复制完整 JSON。', parameterTitle: '交付入口', parameters: [{ token: 'guidelines/tokens/design-tokens.json', value: `v${tokens.version}` }, { token: 'guidelines/adapters/ant-design-theme.ts', value: '主题映射' }, { token: 'src/styles/design-system.css', value: '原型实现（非交付源）' }], rules: ['主题切换只切换 Token 集合，不改变页面结构、字号或控件尺寸。', '新增全局样式前必须先发布 Token。'], preview: 'document' },
  changelog: { title: '版本记录', description: '设计系统变更以版本化 Token 和规范文档为准。', parameterTitle: '当前版本', parameters: [{ token: 'design-system.version', value: `v${tokens.version}` }, { token: 'status', value: 'Active' }], rules: ['每次变更记录版本、日期、负责人、变更类型与迁移说明。', '新 Token、组件契约或废弃规则需经过设计和前端共同评审。'], preview: 'document' },
  migration: { title: '迁移说明', description: '页面应逐步收敛到已发布 Token 与基础组件，避免并存多套视觉语言。', parameterTitle: '迁移检查', parameters: [{ token: 'color', value: '仅使用语义 Token' }, { token: 'spacing', value: '仅使用 4px 刻度' }, { token: 'overlay', value: '使用统一层级与焦点行为' }], rules: ['先替换硬编码颜色、圆角、阴影、间距和 z-index。', '再替换页面私有控件状态；最后执行规范与主题验收。'], preview: 'document' },
};

async function writeClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

export function DesignGuidelines({ themeMode }: { themeMode: ThemeMode }) {
  const [activeTopicKey, setActiveTopicKey] = useState('colors');
  const [activeComponentName, setActiveComponentName] = useState('Button');
  const [componentSearch, setComponentSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const activeTopic = GUIDE_GROUPS.flatMap(group => group.items).find(item => item.key === activeTopicKey) ?? GUIDE_GROUPS[0].items[0];
  const activeGroup = GUIDE_GROUPS.find(group => group.items.some(item => item.key === activeTopic.key)) ?? GUIDE_GROUPS[0];
  const section = activeTopic.section;
  const tokenDocument = getTokenDocument(activeTopic.key);
  const componentCategory = getComponentCategory(activeTopic.key);
  const showComponentContracts = activeGroup.label === '组件' || activeTopic.key === 'component-api' || activeTopic.key === 'code-examples';
  const buttonComponentNames = new Set(['Button', 'ToggleButton', 'IconToggleButton', 'IconButton']);
  const visibleComponentSpecs = componentSpecs.components.filter(component => activeTopic.key === 'button' ? buttonComponentNames.has(component.name) : componentCategory === 'all' || component.category === componentCategory);
  const activeComponent = visibleComponentSpecs.find(component => component.name === activeComponentName) ?? visibleComponentSpecs[0];
  const guidelineExcerpts = getGuidelineSections(activeTopic.key);
  const componentSearchResults = useMemo(() => {
    const query = componentSearch.trim().toLocaleLowerCase();
    if (!query) return [];
    return componentSpecs.components.filter(component => getComponentSearchText(component).toLocaleLowerCase().includes(query)).slice(0, 8);
  }, [componentSearch]);

  async function copy(value: string, feedback: string) {
    try {
      await writeClipboard(value);
      setCopied(feedback);
      window.setTimeout(() => setCopied(current => current === feedback ? null : current), 1800);
    } catch {
      setCopied('复制失败，请检查浏览器权限');
    }
  }

  function locateComponent(component: ComponentSpec) {
    const buttonNames = new Set(['Button', 'ToggleButton', 'IconToggleButton', 'IconButton']);
    const categoryTopics: Record<string, string> = { general: 'general', navigation: 'navigation', entry: 'data-entry', display: 'data-display', feedback: 'feedback', other: 'other' };
    setActiveTopicKey(buttonNames.has(component.name) ? 'button' : categoryTopics[component.category] ?? 'general');
    setActiveComponentName(component.name);
    setComponentSearch('');
    window.requestAnimationFrame(() => document.getElementById('ds-component-contract')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  return (
    <main className="ds-page ds-page--dashboard ds-guidelines" aria-label="设计规范">
      <div className="ds-guidelines__body">
        <nav className="ds-guidelines__nav" aria-label="设计规范目录">
          <div className="ds-guidelines__nav-title"><Sparkles size={15} />设计规范</div>
          {GUIDE_GROUPS.map(group => (
            <section className="ds-guidelines__nav-group" key={group.label}>
              <h2>{group.label}</h2>
              {group.items.map(item => <button type="button" key={item.key} aria-current={activeTopicKey === item.key ? 'page' : undefined} onClick={() => setActiveTopicKey(item.key)}>{item.label}</button>)}
            </section>
          ))}
        </nav>

        <div className="ds-guidelines__main-content">
          <div className="ds-guidelines__content-toolbar">
            <span><Sparkles size={14} />设计规范 / {activeGroup.label} / <strong>{activeTopic.label}</strong></span>
            <div>
              <label className="ds-guidelines__header-search" aria-label="搜索组件样式规范"><Search size={14} aria-hidden="true" /><input value={componentSearch} onChange={event => setComponentSearch(event.target.value)} placeholder="搜索组件、状态、Token" /><button type="button" aria-label="清除搜索" onClick={() => setComponentSearch('')} hidden={!componentSearch}><X size={13} /></button></label>
              <ProductTag tone="accent">v{tokens.version}</ProductTag>
              <ProductTag tone="neutral">{themeMode === 'dark' ? '深色主题' : '浅色主题'}</ProductTag>
              <ProductButton type="outline" size="small" icon={<ClipboardCopy size={14} />} onClick={() => copy(JSON.stringify(tokens, null, 2), '已复制完整 Token JSON')}>复制 Token</ProductButton>
            </div>
          </div>
          {componentSearch.trim() && <section className="ds-guidelines__component-search-results" aria-label="组件规范搜索结果">
            {componentSearchResults.length > 0 ? componentSearchResults.map(component => <button type="button" key={component.name} onClick={() => locateComponent(component)}><strong>{component.name}</strong><span>{component.purpose}</span><small>{component.states.join(' · ')}</small></button>) : <p>未找到匹配的组件规范。</p>}
          </section>}
          {copied && <div className="ds-guidelines__copy-status" role="status" aria-live="polite"><Check size={15} />{copied}</div>}
          <section className="ds-guidelines__panel">
          <GuidelineSourceContent excerpts={guidelineExcerpts} />
          {showComponentContracts && activeComponent && (
            <ComponentContractExplorer
              topic={activeTopic.label}
              components={visibleComponentSpecs}
              activeComponent={activeComponent}
              onSelect={setActiveComponentName}
              onCopy={copy}
              showExamples={activeTopic.key === 'code-examples'}
              themeMode={themeMode}
            />
          )}
          {!showComponentContracts && section === 'tokens' && (
        <section className="ds-guidelines__content" aria-label={`${activeTopic.label}规范`}>
          {tokenDocument.preview === 'colors' && <ColorTokenGroups onCopy={copy} />}
          {tokenDocument.preview !== 'colors' && <TokenList title={tokenDocument.parameterTitle} description="点击参数复制 CSS Token 或交付引用。" items={tokenDocument.parameters} onCopy={copy} wide />}
          <TokenStylePreview kind={tokenDocument.preview} />
        </section>
      )}

          {!showComponentContracts && (section === 'components' || section === 'overlays') && <GuidelineTopicChecklist topicKey={activeTopic.key} title={activeTopic.label} />}
          </section>
        </div>
      </div>
    </main>
  );
}

function getGuidelineSections(topicKey: string) {
  const templateExcerpt = getTemplateMatrixExcerpt(topicKey);
  const excerpts = [...(templateExcerpt ? [templateExcerpt] : []), ...(GUIDELINE_SECTION_MAP[topicKey] ?? [])];
  return excerpts.map(excerpt => ({
    ...excerpt,
    content: 'content' in excerpt ? excerpt.content : extractGuidelineSection(excerpt.marker),
  })).filter(excerpt => excerpt.content.length > 0);
}

function getTemplateMatrixExcerpt(topicKey: string): (GuidelineExcerpt & { content: string }) | null {
  const templateNames: Record<string, string> = {
    'list-page': '列表页',
    'detail-page': '详情页',
    'config-page': '配置页',
    'form-page': '表单页',
    'dashboard-page': '数据看板',
    'editor-page': '全屏编辑器',
  };
  const templateName = templateNames[topicKey];
  if (!templateName) return null;
  const matrix = extractGuidelineSection('### 20.2 页面模板矩阵');
  const tableLines = matrix.split('\n').filter(line => line.startsWith('|'));
  const row = tableLines.find(line => line.startsWith(`| ${templateName} `));
  if (!row || tableLines.length < 2) return null;
  return { marker: `template-matrix-${topicKey}`, title: `${templateName}模板规则`, content: [tableLines[0], tableLines[1], row].join('\n') };
}

function extractGuidelineSection(marker: string) {
  const lines = guidelinesMarkdown.replace(/\r/g, '').split('\n');
  const startIndex = lines.findIndex(line => line.trim() === marker);
  if (startIndex < 0) return '';
  const level = marker.match(/^#+/)?.[0].length ?? 2;
  let endIndex = lines.length;
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const heading = lines[index].match(/^(#+)\s/);
    if (heading && heading[1].length <= level) {
      endIndex = index;
      break;
    }
  }
  return lines.slice(startIndex + 1, endIndex).join('\n').trim();
}

function GuidelineSourceContent({ excerpts }: { excerpts: Array<GuidelineExcerpt & { content: string }> }) {
  if (excerpts.length === 0) return null;
  return (
    <section className="ds-guidelines__source" aria-label="规范原文">
      <div className="ds-guidelines__source-heading"><div><h2>文档规则</h2><p>以下内容直接读取 <code>docs/ui-guidelines.md</code> 的对应章节。</p></div><code>ui-guidelines.md</code></div>
      {excerpts.map(excerpt => <article className="ds-guidelines__source-section" key={excerpt.marker}><h3>{excerpt.title}</h3><GuidelineMarkdown markdown={excerpt.content} /></article>)}
    </section>
  );
}

function GuidelineTopicChecklist({ topicKey, title }: { topicKey: string; title: string }) {
  if (!hasTopicVisualPreview(topicKey)) return null;
  return (
    <section className="ds-guidelines__content" aria-label={`${title}落地检查`}>
      <GuidelineVisualPreview topicKey={topicKey} title={title} />
    </section>
  );
}

function hasTopicVisualPreview(topicKey: string) {
  return ['search-filter', 'form-submit', 'import', 'delete-confirm', 'long-task', 'list-page', 'detail-page', 'config-page', 'form-page', 'dashboard-page', 'editor-page'].includes(topicKey);
}

function GuidelineVisualPreview({ topicKey, title }: { topicKey: string; title: string }) {
  if (topicKey === 'search-filter') return <section className="ds-guidelines__pattern-preview"><h2>样式预览</h2><p>搜索、筛选和结果位于同一内容表面；已生效条件与结果数始终可见。</p><div className="ds-guidelines__pattern-surface ds-guidelines__pattern-surface--list"><div className="ds-guidelines__pattern-toolbar"><ProductTextInput aria-label="搜索" placeholder="搜索型号名称" /><ProductSelect aria-label="发布状态" defaultValue="all"><option value="all">全部状态</option><option value="draft">未发布</option></ProductSelect><ProductButton>重置</ProductButton><ProductButton type="primary">筛选</ProductButton></div><div className="ds-guidelines__pattern-result"><div><ProductTag tone="accent">已筛选：未发布</ProductTag><span>共 24 条结果</span></div><ProductButton type="text" size="small">清除筛选</ProductButton></div><PreviewRows labels={['人形双足机器人', '四足巡检机器人', '机械臂控制器']} /></div></section>;
  if (topicKey === 'form-submit') return <section className="ds-guidelines__pattern-preview"><h2>样式预览</h2><p>字段按 Label、Control、Help / Error 的顺序排列；提交区固定在内容底部。</p><div className="ds-guidelines__pattern-surface ds-guidelines__pattern-surface--form"><div className="ds-guidelines__pattern-form-fields"><ProductField label="型号名称" hint="最多 32 个字符"><ProductTextInput defaultValue="人形双足机器人" /></ProductField><ProductField label="发布状态"><ProductSelect defaultValue="draft"><option value="draft">未发布</option><option value="published">已发布</option></ProductSelect></ProductField></div><div className="ds-guidelines__pattern-footer"><ProductButton>取消</ProductButton><ProductButton type="primary">保存并发布</ProductButton></div></div></section>;
  if (topicKey === 'import') return <section className="ds-guidelines__pattern-preview"><h2>样式预览</h2><p>导入按选择文件、解析校验、确认写入、逐项结果反馈组织。</p><div className="ds-guidelines__pattern-surface ds-guidelines__pattern-surface--import"><ProductUploadBox title="上传型号配置文件" description="支持 .json，单个文件最大 20MB" accept=".json" onFileChange={() => undefined} /><div className="ds-guidelines__pattern-file-result"><span>robot-model.json</span><ProductTag tone="success">解析通过</ProductTag><ProductButton size="small" type="text">移除</ProductButton></div><div className="ds-guidelines__pattern-footer"><ProductButton>取消</ProductButton><ProductButton type="primary">确认导入</ProductButton></div></div></section>;
  if (topicKey === 'delete-confirm') return <section className="ds-guidelines__pattern-preview"><h2>样式预览</h2><p>确认层只说明对象、影响范围与后果；危险确认使用 danger，取消不改变数据。</p><ModalStylePreview initialKind="danger" showVariants={false} /></section>;
  if (topicKey === 'long-task') return <section className="ds-guidelines__pattern-preview"><h2>样式预览</h2><p>长任务保留任务名称、阶段、进度、耗时与后台入口；失败提供可恢复操作。</p><div className="ds-guidelines__pattern-surface ds-guidelines__pattern-task"><div><strong>正在生成数字模型</strong><ProductTag tone="accent">进行中</ProductTag></div><span>第 2 / 3 阶段：校验部件参数</span><div className="ds-guidelines__pattern-progress"><i /></div><footer><span>已用时 01:24</span><ProductButton size="small" type="text">后台继续</ProductButton></footer></div></section>;
  if (topicKey.endsWith('-page')) return <PageTemplateVisualPreview topicKey={topicKey} title={title} />;
  return null;
}

function PreviewRows({ labels }: { labels: string[] }) {
  return <TableStylePreview labels={labels} />;
}

function TableStylePreview({ labels = ['苏州柔性产线项目', '杭州仓储自动化项目', '上海实验室验证项目'] }: { labels?: string[] }) {
  const rows = labels.map((projectName, index) => ({
    projectName,
    projectCode: ['PRJ-MY-260710', 'PRJ-HZ-260708', 'PRJ-SH-260706'][index] ?? `PRJ-MY-26070${index}`,
    robotId: ['RBT-MY-260710-794', 'RBT-MY-260708-611', 'RBT-MY-260706-318'][index] ?? `RBT-MY-26070${index}-000`,
    robotIp: ['172.31.22.101', '172.31.18.44', '10.33.16.87'][index] ?? '172.31.0.1',
    model: ['Man-Robot', 'MCR4O-MY', '人形双足机器人'][index] ?? 'Man-Robot',
    deliveredAt: ['2026-07-10 16:58', '2026-07-08 10:16', '2026-07-06 18:21'][index] ?? '2026-07-01 10:00',
    workflowId: ['FLOW-INS-260710-028', 'FLOW-INS-260708-014', 'FLOW-INS-260706-008'][index] ?? 'FLOW-INS-260701-001',
    description: ['A 区物料搬运工位首台装机。', '交付前软件基线装机。', '姿态算法与驱动兼容性验证。'][index] ?? '交付前软件基线装机。',
  }));
  return <div className="ds-table-surface ds-guidelines__component-table">
    <div className="ds-table-scroll">
      <table>
        <thead><tr className="ds-table-header"><th className="ds-guidelines__table-sticky-first">项目编号</th><th>项目名称</th><th>机器人编号</th><th>机器人 IP</th><th>型号</th><th>软件出库时间</th><th>流程编号</th><th>描述</th><th className="ds-guidelines__table-sticky-last">操作</th></tr></thead>
        <tbody>{rows.map(row => <tr className="ds-table-row" key={row.projectCode}>
          <td className="ds-guidelines__table-sticky-first"><strong>{row.projectCode}</strong></td>
          <td>{row.projectName}</td>
          <td><strong>{row.robotId}</strong></td>
          <td className="ds-guidelines__component-table__mono">{row.robotIp}</td>
          <td><ProductTag tone="neutral">{row.model}</ProductTag></td>
          <td>{row.deliveredAt}</td>
          <td>{row.workflowId}</td>
          <td><span className="ds-guidelines__component-table__ellipsis" title={row.description}>{row.description}</span></td>
          <td className="ds-guidelines__table-sticky-last"><div><ProductIconButton size="small" icon={<FileText size={13} />} aria-label="查看详情" /><ProductIconButton size="small" icon={<Pencil size={13} />} aria-label="编辑记录" /></div></td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}

function PageTemplateVisualPreview({ topicKey, title }: { topicKey: string; title: string }) {
  const template = {
    'list-page': ['标题与主要操作', '搜索 / 筛选', '结果列表与分页'],
    'detail-page': ['对象摘要与主要操作', '详情内容', '侧栏信息'],
    'config-page': ['配置导航', '配置内容', '固定提交区'],
    'form-page': ['标题与操作', '字段区域', '固定提交区'],
    'dashboard-page': ['指标卡', '核心数据', '辅助信息'],
    'editor-page': ['资源区', '画布', '属性区'],
  }[topicKey] ?? ['标题区域', '内容区域', '固定操作区'];
  const descriptions: Record<string, string> = {
    'list-page': '搜索、筛选和结果列表按上下顺序组织；分页固定在结果区底部，宽表只在结果区内部横向滚动。',
    'detail-page': '对象摘要与主要操作位于顶部；详情内容为主，辅助信息独立于主内容管理滚动。',
    'config-page': '导航、配置内容和固定提交区分工明确；提交不挤入 Header，配置内容保持独立滚动。',
    'form-page': '字段按分组排布，页面主体滚动；取消与保存固定在底部提交区。',
    'dashboard-page': '指标、核心数据和辅助信息按栅格排列；单个模块异常不影响其他模块内容。',
    'editor-page': '资源、画布、属性三栏各自管理内容；画布获得剩余空间，顶部仅放任务级操作。',
  };
  return <section className="ds-guidelines__pattern-preview"><h2>样式预览</h2><p>{descriptions[topicKey] ?? `${title}使用统一页面边距、模块间距和内容区内部滚动。`}</p><div className={`ds-guidelines__template-preview ds-guidelines__template-preview--${topicKey}`}><header><div><strong>{template[0]}</strong><span>页面说明与状态信息</span></div><ProductButton type="primary" size="small">主要操作</ProductButton></header><main>{template.slice(1).map((section, index) => <section key={section} data-index={index}><strong>{section}</strong><span>{index === 0 ? '模块内容、字段或数据区域' : '辅助信息与状态反馈'}</span></section>)}</main>{['config-page', 'form-page'].includes(topicKey) && <footer><ProductButton size="small">取消</ProductButton><ProductButton size="small" type="primary">保存</ProductButton></footer>}</div></section>;
}

function GuidelineMarkdown({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n');
  const blocks: JSX.Element[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      blocks.push(<pre className="ds-guidelines__markdown-code" key={`code-${index}`}><code>{codeLines.join('\n')}</code></pre>);
      index += 1;
      continue;
    }
    const heading = line.match(/^(#{3,4})\s+(.+)$/);
    if (heading) {
      const content = renderInlineMarkdown(heading[2], `heading-${index}`);
      blocks.push(heading[1].length === 3 ? <h4 key={`heading-${index}`}>{content}</h4> : <h5 key={`heading-${index}`}>{content}</h5>);
      index += 1;
      continue;
    }
    if (line.startsWith('|')) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].startsWith('|')) {
        tableLines.push(lines[index]);
        index += 1;
      }
      const rows = tableLines.filter(tableLine => !/^\|\s*:?-{3,}/.test(tableLine)).map(tableLine => tableLine.split('|').slice(1, -1).map(cell => cell.trim()));
      if (rows.length > 0) {
        const [header, ...body] = rows;
        blocks.push(<div className="ds-guidelines__markdown-table-wrap" key={`table-${index}`}><table className="ds-guidelines__markdown-table"><thead><tr>{header.map((cell, cellIndex) => <th key={`${cell}-${cellIndex}`}>{renderInlineMarkdown(cell, `header-${cellIndex}`)}</th>)}</tr></thead><tbody>{body.map((row, rowIndex) => <tr key={`row-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{renderInlineMarkdown(cell, `cell-${rowIndex}-${cellIndex}`)}</td>)}</tr>)}</tbody></table></div>);
      }
      continue;
    }
    if (/^-\s+/.test(line)) {
      const entries: string[] = [];
      while (index < lines.length && /^-\s+/.test(lines[index])) {
        entries.push(lines[index].replace(/^-\s+/, ''));
        index += 1;
      }
      blocks.push(<ul className="ds-guidelines__markdown-list" key={`list-${index}`}>{entries.map((entry, entryIndex) => <li key={`${entry}-${entryIndex}`}>{renderInlineMarkdown(entry, `list-${entryIndex}`)}</li>)}</ul>);
      continue;
    }
    const paragraphLines: string[] = [];
    while (index < lines.length && lines[index].trim() && !lines[index].startsWith('```') && !lines[index].startsWith('|') && !/^-\s+/.test(lines[index]) && !/^(#{3,4})\s+/.test(lines[index])) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    if (paragraphLines.length > 0) blocks.push(<p key={`paragraph-${index}`}>{renderInlineMarkdown(paragraphLines.join(' '), `paragraph-${index}`)}</p>);
  }
  return <div className="ds-guidelines__markdown">{blocks}</div>;
}

function renderInlineMarkdown(value: string, keyPrefix: string) {
  return value.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) return <code key={`${keyPrefix}-${index}`}>{part.slice(1, -1)}</code>;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={`${keyPrefix}-${index}`}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

function getComponentCategory(topicKey: string) {
  const categories: Record<string, string> = {
    general: 'general',
    navigation: 'navigation',
    'data-entry': 'entry',
    'data-display': 'display',
    feedback: 'feedback',
    other: 'other',
  };
  return categories[topicKey] ?? 'all';
}

function getComponentSearchText(component: ComponentSpec) {
  return [
    component.name, component.purpose, component.whenToUse, component.avoid, component.states.join(' '), component.tokens.join(' '),
    component.rules.join(' '), component.a11y.join(' '), component.responsive, component.example,
    ...component.api.flatMap(parameter => [parameter.name, parameter.values, parameter.description]),
  ].join(' ');
}

function ComponentContractExplorer({ topic, components, activeComponent, onSelect, onCopy, showExamples, themeMode }: {
  topic: string;
  components: ComponentSpec[];
  activeComponent: ComponentSpec;
  onSelect: (name: string) => void;
  onCopy: (value: string, feedback: string) => void;
  showExamples: boolean;
  themeMode: ThemeMode;
}) {
  const states = activeComponent.states.join(' · ');
  return (
    <section className="ds-guidelines__content ds-guidelines__contracts" aria-label={`${topic}组件规范`}>
      <GuideHeading title={topic} description="每项规范均包含使用边界、参数、状态、已发布 Token、无障碍、响应式、示例和验收项；参数名称表达设计行为，由各前端实现映射到已批准的基础组件。" />
      <div className="ds-guidelines__component-picker" role="tablist" aria-label={`${topic}组件目录`}>
        {components.map(component => (
          <button
            type="button"
            key={component.name}
            role="tab"
            aria-selected={activeComponent.name === component.name}
            onClick={() => onSelect(component.name)}
          >{component.name}</button>
        ))}
      </div>
      <article id="ds-component-contract" className="ds-guidelines__contract" aria-label={`${activeComponent.name}组件契约`}>
        <header className="ds-guidelines__contract-heading">
          <div><h2>{activeComponent.name}</h2><p>{activeComponent.purpose}</p></div>
          <div className="ds-guidelines__contract-sizes" aria-label="已发布尺寸">{activeComponent.sizes.map(size => <ProductTag key={size} tone="neutral">{size}px</ProductTag>)}</div>
        </header>

        <section className="ds-guidelines__contract-section">
          <h3>样式预览</h3>
          <ComponentStylePreview componentName={activeComponent.name} />
        </section>

        {activeComponent.name === 'Button' && <ButtonSpecification component={activeComponent} themeMode={themeMode} />}

        <section className="ds-guidelines__contract-section">
          <h3>使用边界</h3>
          <dl className="ds-guidelines__boundary-list"><div><dt>适用</dt><dd>{activeComponent.whenToUse}</dd></div><div><dt>不适用</dt><dd>{activeComponent.avoid}</dd></div></dl>
          <DocumentRules rules={activeComponent.rules} />
        </section>

        <section className="ds-guidelines__contract-section">
          <h3>参数 / API</h3>
          <div className="ds-guidelines__contract-table" role="table" aria-label={`${activeComponent.name}参数`}>
            <div className="ds-guidelines__contract-table-head" role="row"><span role="columnheader">参数</span><span role="columnheader">取值</span><span role="columnheader">必填</span><span role="columnheader">说明</span></div>
            {activeComponent.api.map(parameter => <div role="row" key={parameter.name}><code role="cell">{parameter.name}</code><span role="cell">{parameter.values}</span><span role="cell">{parameter.required ? '是' : '否'}</span><small role="cell">{parameter.description}</small></div>)}
          </div>
        </section>

        <section className="ds-guidelines__contract-section">
          <h3>交互状态</h3>
          <p className="ds-guidelines__contract-description">{states}</p>
          <div className="ds-guidelines__state-list">{activeComponent.states.map(state => <ProductTag key={state} tone={getStateTone(state)}>{state}</ProductTag>)}</div>
        </section>

        <section className="ds-guidelines__contract-section">
          <h3>关联 Token</h3>
          <div className="ds-guidelines__contract-tokens">{activeComponent.tokens.map(token => <button type="button" key={token} onClick={() => onCopy(token.startsWith('--') ? `var(${token})` : token, `已复制 ${token.startsWith('--') ? `var(${token})` : token}`)}><code>{token}</code><ClipboardCopy size={14} aria-hidden="true" /></button>)}</div>
        </section>

        <section className="ds-guidelines__contract-section ds-guidelines__contract-section--two-column">
          <div><h3>无障碍</h3><ul>{activeComponent.a11y.map(item => <li key={item}>{item}</li>)}</ul></div>
          <div><h3>响应式与溢出</h3><p>{activeComponent.responsive}</p></div>
        </section>

        <section className="ds-guidelines__contract-section">
          <h3>{showExamples ? '代码示例' : '参考实现'}</h3>
          <div className="ds-guidelines__code-sample"><pre><code>{activeComponent.example}</code></pre><ProductButton size="small" type="outline" icon={<ClipboardCopy size={14} />} onClick={() => onCopy(activeComponent.example, `已复制 ${activeComponent.name} 示例`)}>复制示例</ProductButton></div>
        </section>

        <section className="ds-guidelines__contract-section">
          <h3>验收项</h3>
          <ul className="ds-guidelines__acceptance-list">{activeComponent.acceptance.map(item => <li key={item}><Check size={14} aria-hidden="true" />{item}</li>)}</ul>
        </section>
      </article>
    </section>
  );
}

type ButtonContract = ComponentSpec & {
  stateMatrix: Record<string, Array<Record<string, string>>>;
  metrics: Array<{ label: string; value: string; token: string }>;
  contentStructures: Array<{ name: string; example: string }>;
  contentRules: string[];
  selectedBoundary: string;
};

function ButtonSpecification({ component, themeMode }: { component: ComponentSpec; themeMode: ThemeMode }) {
  const button = component as ButtonContract;
  const stateMatrices = useMemo(() => Object.entries(button.stateMatrix).map(([variant, rows]) => [variant, rows.map(row => ({
    ...row,
    rendered: {
      background: resolveButtonCssValue(row.background, 'background-color'), text: resolveButtonCssValue(row.text, 'color'), border: resolveButtonCssValue(row.border, 'border-color'),
      icon: row.icon === 'currentColor' ? '与文字相同' : resolveButtonCssValue(row.icon, 'color'), shadow: resolveButtonCssValue(row.shadow, 'box-shadow'),
      focusRing: resolveButtonCssValue(row.focusRing, 'color'), cursor: row.cursor, opacity: resolveButtonCssValue(row.opacity, 'opacity'), transition: resolveButtonCssValue(row.transition, 'transition'),
    },
  }))] as const), [button, themeMode]);
  return <>
    <section className="ds-guidelines__contract-section">
      <h3>Primary / Secondary 状态矩阵</h3>
      <p className="ds-guidelines__contract-description">每个状态均明确背景、文字、描边、图标、阴影、焦点环、光标、不透明度与过渡；图标继承当前文字色。</p>
      <div className="ds-guidelines__button-matrices">
        {stateMatrices.map(([variant, rows]) => <div className="ds-guidelines__button-matrix" key={variant}>
          <h4>{variant === 'primary' ? 'Primary' : 'Secondary'}</h4>
          <div className="ds-guidelines__button-matrix-scroll"><table><thead><tr>{['状态', 'Background', 'Text', 'Border', 'Icon', 'Shadow', 'Focus ring', 'Cursor', 'Opacity', 'Transition'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.state}><td>{row.state}</td>{(['background', 'text', 'border', 'icon', 'shadow', 'focusRing', 'cursor', 'opacity', 'transition'] as const).map(key => <td key={`${row.state}-${key}`}><strong>{row.rendered[key]}</strong></td>)}</tr>)}</tbody></table></div>
        </div>)}
      </div>
    </section>
    <section className="ds-guidelines__contract-section ds-guidelines__contract-section--two-column">
      <div><h3>内部规格</h3><div className="ds-guidelines__button-metrics">{button.metrics.map(metric => <div key={metric.label}><strong>{metric.label}</strong><span>{metric.value}</span></div>)}</div></div>
      <div><h3>内容结构</h3><div className="ds-guidelines__button-structures">{button.contentStructures.map(item => <div key={item.name}><strong>{item.name}</strong><code>{item.example}</code></div>)}</div></div>
    </section>
    <section className="ds-guidelines__contract-section ds-guidelines__contract-section--two-column">
      <div><h3>内容与溢出规则</h3><DocumentRules rules={button.contentRules} /></div>
      <div><h3>Selected 边界</h3><p className="ds-guidelines__contract-description">{button.selectedBoundary}</p><p className="ds-guidelines__contract-description">保存、创建、刷新使用 Button；网格／列表视图、吸附开启等持续选择使用 ToggleButton。</p></div>
    </section>
  </>;
}

function resolveButtonCssValue(value: string, property: string) {
  if (typeof document === 'undefined' || value === '无' || value === 'none' || value === 'currentColor' || !value.includes('--')) return value;
  const [token, suffix] = value.split(/\s*\/\s*/, 2);
  if (!token.startsWith('--')) return value;
  const probe = document.createElement('span');
  probe.style.setProperty(property, `var(${token})`);
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).getPropertyValue(property).trim();
  probe.remove();
  const display = cssColorToHex(computed || value);
  return suffix ? `${display} / ${suffix}` : display;
}

function cssColorToHex(value: string) {
  const match = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (!match) return value;
  const hex = [match[1], match[2], match[3]].map(part => Number(part).toString(16).padStart(2, '0')).join('').toUpperCase();
  return match[4] && match[4] !== '1' ? `#${hex} / ${match[4]}` : `#${hex}`;
}

function ComponentStylePreview({ componentName }: { componentName: string }) {
  if (componentName === 'Button') return <div className="ds-guidelines__component-style-preview"><ProductButton type="primary">主要操作</ProductButton><ProductButton>次要操作</ProductButton><ProductButton type="outline">工具操作</ProductButton><ProductButton type="primary" status="danger">删除</ProductButton><ProductButton disabled>禁用</ProductButton><ProductButton type="primary" loading>加载中</ProductButton></div>;
  if (componentName === 'ToggleButton') return <div className="ds-guidelines__component-style-preview"><ProductToggleButton selected={false}>列表视图</ProductToggleButton><ProductToggleButton selected>网格视图</ProductToggleButton><ProductToggleButton selected={false} disabled>吸附开启</ProductToggleButton></div>;
  if (componentName === 'IconToggleButton') return <div className="ds-guidelines__component-style-preview"><ProductIconToggleButton selected={false} icon={<ClipboardCopy size={16} />} aria-label="复制模式" /><ProductIconToggleButton selected icon={<Sparkles size={16} />} aria-label="吸附开启" /><ProductIconToggleButton selected={false} disabled icon={<X size={16} />} aria-label="关闭面板" /></div>;
  if (componentName === 'IconButton') return <div className="ds-guidelines__component-style-preview"><ProductIconButton icon={<ClipboardCopy size={16} />} aria-label="复制" /><ProductIconButton icon={<Check size={16} />} aria-label="确认" /><ProductIconButton icon={<Sparkles size={16} />} aria-label="更多操作" disabled /></div>;
  if (componentName === 'Tag') return <div className="ds-guidelines__component-style-preview"><ProductTag tone="neutral">草稿</ProductTag><ProductTag tone="accent">已选择</ProductTag><ProductTag tone="success">已完成</ProductTag><ProductTag tone="warning">需关注</ProductTag><ProductTag tone="danger">失败</ProductTag></div>;
  if (componentName === 'Tabs') return <div className="ds-guidelines__component-tabs" role="tablist" aria-label="Tab 样式预览"><button type="button" role="tab" aria-selected="true">概览</button><button type="button" role="tab" aria-selected="false">配置</button><button type="button" role="tab" aria-selected="false">版本记录</button><button type="button" role="tab" disabled>权限</button></div>;
  if (componentName === 'Menu / Dropdown') return <div className="ds-context-menu ds-guidelines__component-menu" role="menu" aria-label="节点操作"><button className="ds-context-menu__item" type="button" role="menuitem"><Plus size={15} />新增</button><button className="ds-context-menu__item" type="button" role="menuitem"><Pencil size={15} />编辑</button><button className="ds-context-menu__item" data-variant="destructive" type="button" role="menuitem"><Trash2 size={15} />删除</button></div>;
  if (componentName === 'Input / TextArea') return <div className="ds-guidelines__component-inputs"><ProductField label="默认字段"><ProductTextInput placeholder="请输入名称" /></ProductField><ProductField label="错误字段" hint="名称不能为空"><ProductTextInput aria-invalid="true" defaultValue="" placeholder="请输入名称" /></ProductField></div>;
  if (componentName === 'SearchInput / SearchBar') return <div className="ds-guidelines__component-search"><div><Search size={16} /><input aria-label="搜索型号" placeholder="搜索型号名称" defaultValue="" /><button type="button" aria-label="清除搜索"><X size={14} /></button></div><ProductSelect aria-label="发布状态" defaultValue="all"><option value="all">全部状态</option><option value="draft">未发布</option></ProductSelect><ProductButton type="primary">筛选</ProductButton></div>;
  if (componentName === 'InputNumber') return <div className="ds-guidelines__component-number"><label>并发数量<div><button type="button" aria-label="减少"><Minus size={14} /></button><input type="number" aria-label="并发数量" defaultValue="8" /><span>台</span><button type="button" aria-label="增加"><Plus size={14} /></button></div></label><label>禁用<div data-disabled="true"><button type="button" aria-label="减少"><Minus size={14} /></button><input type="number" aria-label="禁用数量" defaultValue="0" disabled /><span>秒</span><button type="button" aria-label="增加"><Plus size={14} /></button></div></label></div>;
  if (componentName === 'Select') return <div className="ds-guidelines__component-inputs"><ProductField label="发布状态"><ProductSelect defaultValue="draft"><option value="draft">未发布</option><option value="published">已发布</option></ProductSelect></ProductField><ProductField label="禁用字段"><ProductSelect defaultValue="draft" disabled><option value="draft">未发布</option></ProductSelect></ProductField></div>;
  if (componentName === 'Checkbox') return <div className="ds-guidelines__component-checkboxes"><ProductCheckbox label="默认未选中" /><ProductCheckbox label="已选中" defaultChecked /><ProductCheckbox label="已禁用" defaultChecked disabled /></div>;
  if (componentName === 'Radio') return <div className="ds-guidelines__component-radios" role="radiogroup" aria-label="发布方式"><label><input type="radio" name="guide-radio" defaultChecked />草稿保存</label><label><input type="radio" name="guide-radio" />立即发布</label><label><input type="radio" name="guide-radio" disabled />定时发布</label></div>;
  if (componentName === 'Switch') return <div className="ds-guidelines__component-switches"><label>启用自动同步<button type="button" role="switch" aria-checked="true"><i /></button></label><label>允许公开访问<button type="button" role="switch" aria-checked="false"><i /></button></label><label>同步中<button type="button" role="switch" aria-checked="true" disabled><i /></button></label></div>;
  if (componentName === 'Upload') return <div className="ds-guidelines__component-upload"><ProductUploadBox title="上传配置文件" description="支持 .json，最大 20MB" accept=".json" onFileChange={() => undefined} /><div><span>robot-model.json</span><ProductTag tone="success">上传完成</ProductTag><ProductButton type="text" size="small">移除</ProductButton></div></div>;
  if (componentName === 'Table') return <TableStylePreview />;
  if (componentName === 'Pagination') return <nav className="ds-guidelines__component-pagination" aria-label="结果分页"><button type="button" disabled>‹</button><button type="button">1</button><button type="button" aria-current="page">2</button><button type="button">3</button><span>…</span><button type="button">12</button><button type="button">›</button><small>共 240 条</small></nav>;
  if (componentName === 'Modal') return <ModalStylePreview />;
  if (componentName === 'Drawer') return <div className="ds-guidelines__component-drawer"><div><strong>组件类型</strong><span>查看字段、枚举取值与级联配置</span></div><section><small>类型字段</small><p>组件类型</p><p>子类型</p><p>规格</p></section><footer><ProductButton size="small">关闭</ProductButton></footer></div>;
  if (componentName === 'Tooltip / Popover') return <div className="ds-guidelines__component-popover"><ProductIconButton icon={<ClipboardCopy size={16} />} aria-label="复制链接" /><div><strong>复制链接</strong><span>复制当前型号的访问地址</span></div></div>;
  if (componentName === 'Toast / Notification') return <ToastNotificationPreview />;
  return <div className="ds-guidelines__component-empty"><div aria-hidden="true">—</div><strong>暂无数据</strong><span>可调整筛选条件或创建第一条数据。</span><ProductButton size="small" type="primary">新建</ProductButton></div>;
}

type ModalPreviewKind = 'notice' | 'warning' | 'danger';

const MODAL_PREVIEWS: Record<ModalPreviewKind, { label: string; title: string; description: string; confirm: string; status: 'normal' | 'warning' | 'danger'; danger?: boolean }> = {
  notice: { label: '提示', title: '取消发布型号', description: '取消发布后，型号将恢复为可编辑状态；后续修改不会自动同步到已发布版本。', confirm: '确认取消发布', status: 'normal' },
  warning: { label: '警示', title: '关闭编辑', description: '当前修改尚未保存。继续关闭将丢失本次编辑内容。', confirm: '仍然关闭', status: 'warning' },
  danger: { label: '删除', title: '删除机器人型号', description: '删除后，型号的拓扑结构、外设配置与导出配置会一并移除，且无法恢复。', confirm: '删除型号', status: 'danger', danger: true },
};

function ModalStylePreview({ initialKind = 'notice', showVariants = true }: { initialKind?: ModalPreviewKind; showVariants?: boolean }) {
  const [kind, setKind] = useState<ModalPreviewKind>(initialKind);
  const preview = MODAL_PREVIEWS[kind];

  return <div className="ds-guidelines__component-modal-stage">
    {showVariants && <div className="ds-guidelines__component-modal-variants" role="tablist" aria-label="弹窗类型">
      {Object.entries(MODAL_PREVIEWS).map(([key, item]) => <button key={key} type="button" role="tab" aria-selected={kind === key} onClick={() => setKind(key as ModalPreviewKind)}>{item.label}</button>)}
    </div>}
    <section className="arcoui-modal-content ds-guidelines__component-modal" data-status={preview.status} aria-label={`${preview.label}弹窗示例`}>
      <div className="arcoui-modal-header">
        <div className="arcoui-modal-title-area"><strong className="arcoui-modal-title">{preview.title}</strong></div>
        <ProductIconButton type="text" size="small" icon={<X size={15} />} aria-label="关闭" className="arcoui-modal-close" />
      </div>
      <div className="arcoui-modal-body"><p>{preview.description}</p></div>
      <div className="arcoui-modal-footer"><ProductButton>取消</ProductButton><ProductButton type="primary" status={preview.danger ? 'danger' : 'normal'}>{preview.confirm}</ProductButton></div>
    </section>
  </div>;
}

function ToastNotificationPreview() {
  return <div className="ds-guidelines__component-toast-list" aria-label="消息提示示例">
    <div className="ds-global-notice" data-kind="toast" data-tone="success" role="status" aria-live="polite"><span className="ds-global-notice__indicator"><Check size={16} /></span><span className="ds-global-notice__content"><strong>保存成功</strong><small>型号配置已保存到草稿。</small></span><ProductIconButton type="text" size="small" icon={<X size={14} />} aria-label="关闭提示" className="ds-global-notice__close" /></div>
    <div className="ds-global-notice" data-kind="toast" data-tone="warning" role="status" aria-live="polite"><span className="ds-global-notice__indicator"><CircleAlert size={16} /></span><span className="ds-global-notice__content"><strong>存在待处理项</strong><small>请完成必填参数后再发布型号。</small></span><ProductIconButton type="text" size="small" icon={<X size={14} />} aria-label="关闭提示" className="ds-global-notice__close" /></div>
    <div className="ds-global-notice" data-kind="notification" data-tone="danger" role="alert"><span className="ds-global-notice__indicator"><CircleAlert size={16} /></span><span className="ds-global-notice__content"><strong>保存失败</strong><small>网络连接异常，检查连接后可重新保存。</small></span><ProductButton type="text" size="small" className="ds-global-notice__action">重试</ProductButton></div>
    <div className="ds-global-notice" data-kind="toast" data-tone="info" role="status" aria-live="polite"><span className="ds-global-notice__indicator"><Info size={16} /></span><span className="ds-global-notice__content"><strong>正在导出</strong><small>任务将在完成后通知你。</small></span></div>
  </div>;
}

function getStateTone(state: string): 'neutral' | 'accent' | 'success' | 'warning' | 'danger' {
  if (state === 'Error' || state === 'Danger') return 'danger';
  if (state === 'Success') return 'success';
  if (state === 'Warning') return 'warning';
  if (state === 'Selected' || state === 'Focus' || state === 'Checked' || state === 'Open') return 'accent';
  return 'neutral';
}

function GuideHeading({ title, description }: { title: string; description: string }) {
  return <div className="ds-guidelines__section-heading"><h2>{title}</h2><p>{description}</p></div>;
}

function ColorTokenGroups({ onCopy }: { onCopy: (value: string, feedback: string) => void }) {
  return <div className="ds-guidelines__color-groups">{COLOR_GROUPS.map(group => <section key={group.title}><h2>{group.title}</h2><div className="ds-guidelines__color-grid">{group.items.map(item => <button className="ds-guidelines__color-card" type="button" key={item.token} onClick={() => onCopy(`var(${item.token})`, `已复制 var(${item.token})`)}><span className="ds-guidelines__color-swatch" style={{ background: `var(${item.token})` }} aria-hidden="true" /><span className="ds-guidelines__token-copy"><strong>{item.label}</strong><code>{item.token}</code><small>{item.description}</small><em>浅色 {item.light} · 深色 {item.dark}</em></span><ClipboardCopy size={15} aria-hidden="true" /></button>)}</div></section>)}</div>;
}

function TokenList({ title, description, items, onCopy, wide = false }: { title: string; description: string; items: Array<{ token: string; value: string; description?: string }>; onCopy: (value: string, feedback: string) => void; wide?: boolean }) {
  return (
    <section className={`ds-guidelines__token-list${wide ? ' ds-guidelines__token-list--wide' : ''}`}>
      <GuideHeading title={title} description={description} />
      {items.map(item => {
        const copyValue = item.token.startsWith('--') ? `var(${item.token})` : item.token;
        return <button type="button" key={item.token} onClick={() => onCopy(copyValue, `已复制 ${copyValue}`)}><code>{item.token}</code><span>{item.value}</span>{item.description && <small>{item.description}</small>}<ClipboardCopy size={14} aria-hidden="true" /></button>;
      })}
    </section>
  );
}

function getTokenDocument(topicKey: string) {
  const aliases: Record<string, string> = {
    'layout-spacing': 'spacing',
    layers: 'shadow',
  };
  return TOKEN_DOCUMENTS[aliases[topicKey] ?? topicKey] ?? TOKEN_DOCUMENTS['design-tokens'];
}

function TokenStylePreview({ kind }: { kind: TopicDocument['preview'] }) {
  if (kind === 'colors' || kind === 'document') return null;
  if (kind === 'type') return <TypographyStylePreview />;
  if (kind === 'icon') return <section className="ds-guidelines__icon-preview"><div><small>12</small><CircleCheck size={12} /></div><div><small>14</small><ChevronDown size={14} /></div><div><small>16</small><ArrowRight size={16} /></div><div><small>20</small><CircleAlert size={20} /></div><div><small>24</small><ChevronRight size={24} /></div><p>线性图标 · 24 × 24 viewBox · 1.8px 描边 · 默认继承文字色</p></section>;
  if (kind === 'spacing') return <section className="ds-guidelines__style-preview"><strong>间距样式预览</strong><div className="ds-guidelines__spacing-preview"><i /><i /><i /><i /></div></section>;
  if (kind === 'radius') return <section className="ds-guidelines__style-preview"><strong>圆角样式预览</strong><div className="ds-guidelines__radius-preview"><i /><i /><i /><i /></div></section>;
  if (kind === 'shadow') return null;
  if (kind === 'motion') return <section className="ds-guidelines__style-preview"><strong>动效样式预览</strong><div className="ds-guidelines__motion-preview"><i /><span>Hover / Pressed / Open 使用已发布动效 Token</span></div></section>;
  return <section className="ds-guidelines__style-preview"><strong>布局样式预览</strong><div className="ds-guidelines__layout-preview"><i /><i /><i /><i /><i /><i /></div></section>;
}

function TypographyStylePreview() {
  const samples = [
    ['页面标题', '型号模板', '20 / 24px · 600 · tight'],
    ['弹窗标题', '取消发布型号', '18px · 600 · normal'],
    ['模块标题', '参数配置', '16px · 600 · normal'],
    ['正文 / 控件', '型号名称与操作按钮', '14px · 400 / 500 · normal'],
    ['辅助 / 表头', '更新时间 · 发布状态', '12px · 400 / 500 · normal'],
    ['紧凑补充', '版本号与低优先级说明', '10px · 400 · normal'],
  ] as const;
  return <section className="ds-guidelines__type-preview" aria-label="字体应用示例">{samples.map(([role, text, spec], index) => <div key={role} data-level={index}><span>{role}</span><strong>{text}</strong><small>{spec}</small></div>)}</section>;
}

function DocumentRules({ rules }: { rules: string[] }) {
  return <section className="ds-guidelines__document-rules"><h2>文档规则</h2><ul>{rules.map(rule => <li key={rule}>{rule}</li>)}</ul></section>;
}
