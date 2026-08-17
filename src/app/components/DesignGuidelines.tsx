import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowRight, Box, Check, ChevronDown, ChevronRight, CircleAlert, CircleCheck, ClipboardCopy, FileText, Folder, GripVertical, Info, LayoutGrid, Minus, Pencil, Plus, Search, Settings2, Sparkles, Trash2, X } from 'lucide-react';
import tokens from '../../../guidelines/tokens/design-tokens.json';
import componentSpecs from '../../../guidelines/components/component-specs.json';
import guidelinesMarkdown from '../../../guidelines/docs/ui-guidelines.md?raw';
import {
  ProductButton,
  ProductCheckbox,
  ProductDateTimePicker,
  ProductField,
  ProductIconButton,
  ProductIconToggleButton,
  ProductModal,
  ProductDrawer,
  ProductTag,
  ProductToggleButton,
  ProductSelect,
  ProductTextArea,
  ProductTextInput,
  ProductUploadBox,
} from './ProductUI';
import type { ThemeMode } from '../theme';

type GuideSection = 'tokens' | 'components' | 'overlays';
type ComponentSpec = typeof componentSpecs.components[number];
type GuidelineExcerpt = { marker: string; title: string };
type TokenSearchItem = { path: string; label: string; value: string; numericValues: string[]; topicKey: string };
type TopicSearchItem = { key: string; label: string; group: string; summary: string; searchText: string; structuredNumericText: string; numericValues: string[]; structuredNumericValues: string[] };
type GuidelineSearchResult =
  | { kind: 'component'; component: ComponentSpec; score: number }
  | { kind: 'token'; token: TokenSearchItem; score: number }
  | { kind: 'topic'; topic: TopicSearchItem; score: number };

const GUIDE_GROUPS: Array<{ label: string; items: Array<{ key: string; label: string; section: GuideSection }> }> = [
  { label: '基础', items: [
    { key: 'colors', label: '颜色', section: 'tokens' }, { key: 'typography', label: '字体', section: 'tokens' },
    { key: 'icons', label: '图标', section: 'tokens' }, { key: 'spacing', label: '间距', section: 'tokens' },
    { key: 'copywriting', label: '内容文案', section: 'components' }, { key: 'i18n', label: '多语言', section: 'components' }, { key: 'radius', label: '圆角', section: 'tokens' }, { key: 'shadow', label: '阴影', section: 'tokens' },
    { key: 'motion', label: '动效', section: 'tokens' }, { key: 'layers', label: '层级', section: 'overlays' },
  ] },
  { label: '布局', items: [
    { key: 'page-frame', label: '页面框架', section: 'tokens' }, { key: 'grid', label: '栅格', section: 'tokens' },
    { key: 'layout-spacing', label: '间距', section: 'tokens' }, { key: 'responsive', label: '响应式', section: 'tokens' },
    { key: 'overflow', label: '滚动与溢出', section: 'tokens' },
  ] },
  { label: '交互规范', items: [
    { key: 'interaction-state', label: '状态模型', section: 'components' },
    { key: 'interaction-pointer', label: '鼠标与触控', section: 'components' },
    { key: 'interaction-keyboard', label: '键盘与快捷键', section: 'components' },
    { key: 'interaction-focus', label: 'Focus 与焦点管理', section: 'components' },
    { key: 'interaction-activation', label: '点击、选择与切换', section: 'components' },
    { key: 'interaction-search', label: '搜索', section: 'components' },
    { key: 'interaction-filter-sort', label: '筛选与排序', section: 'components' },
    { key: 'interaction-form-validation', label: '表单输入与校验', section: 'components' },
    { key: 'interaction-async', label: '异步操作', section: 'components' },
    { key: 'interaction-danger', label: '删除与危险操作', section: 'overlays' },
    { key: 'interaction-overlays', label: 'Dropdown / Popover / Modal / Drawer', section: 'overlays' },
    { key: 'interaction-collections', label: 'Table / List / Tree', section: 'components' },
    { key: 'interaction-feedback-states', label: 'Loading / Empty / Error / Success', section: 'overlays' },
    { key: 'interaction-scroll', label: '滚动与溢出', section: 'components' },
    { key: 'interaction-drag', label: '拖拽', section: 'components' },
    { key: 'interaction-upload', label: '上传与文件操作', section: 'components' },
    { key: 'interaction-history', label: 'Undo / Redo 与未保存状态', section: 'components' },
    { key: 'interaction-motion', label: '动效', section: 'components' },
    { key: 'interaction-responsive-touch', label: '响应式与触屏', section: 'components' },
    { key: 'interaction-availability', label: '权限、占用与不可用状态', section: 'components' },
    { key: 'interaction-navigation', label: '导航与返回逻辑', section: 'components' },
    { key: 'interaction-context-menu', label: '右键与上下文菜单', section: 'components' },
    { key: 'interaction-inline-edit', label: '行内编辑 Inline Edit', section: 'components' },
    { key: 'interaction-copy-paste', label: 'Copy / Paste / Duplicate', section: 'components' },
    { key: 'interaction-multi-select', label: '多选与范围选择', section: 'components' },
    { key: 'interaction-viewport', label: 'Resize / Zoom / Pan', section: 'components' },
    { key: 'interaction-autosave', label: '自动保存与保存状态', section: 'components' },
    { key: 'interaction-conflicts', label: '版本与并发冲突', section: 'components' },
    { key: 'interaction-realtime', label: '实时数据刷新', section: 'components' },
    { key: 'interaction-reconnect', label: '断线与重连', section: 'components' },
    { key: 'interaction-deep-link', label: '路由与深链接', section: 'components' },
    { key: 'interaction-command', label: 'Command / 快捷操作', section: 'components' },
    { key: 'interaction-interruption', label: '操作打断', section: 'components' },
    { key: 'interaction-session', label: 'Session / 超时', section: 'components' },
    { key: 'interaction-optimistic', label: '乐观更新 Optimistic UI', section: 'components' },
    { key: 'interaction-batch-feedback', label: '批处理执行反馈', section: 'components' },
    { key: 'interaction-task-queue', label: '任务队列', section: 'components' },
    { key: 'interaction-progress-cancel', label: '进度与取消', section: 'components' },
    { key: 'interaction-reload-recovery', label: '页面刷新与数据恢复', section: 'components' },
    { key: 'interaction-help', label: '帮助与解释交互', section: 'components' },
    { key: 'interaction-notifications', label: '系统级通知', section: 'components' },
    { key: 'interaction-live-regions', label: '可访问动态反馈', section: 'components' },
    { key: 'interaction-ime', label: '输入法与组合输入', section: 'components' },
    { key: 'interaction-refresh-conflict', label: '数据刷新与用户编辑冲突', section: 'components' },
    { key: 'interaction-escape-hatches', label: '恢复与逃生路径', section: 'components' },
    { key: 'interaction-accessibility', label: '无障碍交互', section: 'components' },
    { key: 'interaction-actions', label: '操作按钮与图标提示', section: 'components' },
  ] },
  { label: '组件', items: [
    { key: 'general', label: '通用', section: 'components' }, { key: 'button', label: '按钮', section: 'components' }, { key: 'navigation', label: '导航', section: 'components' },
    { key: 'data-entry', label: '数据录入', section: 'components' }, { key: 'data-display', label: '数据展示', section: 'components' },
    { key: 'feedback', label: '反馈', section: 'overlays' }, { key: 'other', label: '其他', section: 'components' },
  ] },
  { label: '模式', items: [
    { key: 'search-filter', label: '搜索', section: 'components' }, { key: 'form-submit', label: '表单提交', section: 'components' },
    { key: 'configuration-authoring', label: '配置编排', section: 'components' },
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
  i18n: [{ marker: '## 26. 多语言与本地化规范', title: '多语言与本地化规范' }],
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
  'search-filter': [{ marker: '### 13.2 SearchInput 与 SearchBar', title: '搜索' }],
  'form-submit': [{ marker: '## 14. 表单规范', title: '表单提交' }, { marker: '### 20.3 可复用业务组合', title: '业务组合' }],
  'configuration-authoring': [{ marker: '### 20.3.1 配置编排业务模式', title: '配置编排业务模式' }],
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
  'interaction-state': [
    { marker: '### 27.0 交互领域、规则求值与冲突处理', title: '规则求值与冲突处理' },
    { marker: '### 27.1 状态模型', title: '状态模型' },
  ],
  'interaction-pointer': [{ marker: '### 27.2 鼠标与触控', title: '鼠标与触控' }],
  'interaction-keyboard': [{ marker: '### 27.3 键盘与快捷键', title: '键盘与快捷键' }],
  'interaction-focus': [{ marker: '### 27.4 Focus 与焦点管理', title: 'Focus 与焦点管理' }],
  'interaction-activation': [{ marker: '### 27.5 点击、选择与切换', title: '点击、选择与切换' }],
  'interaction-search': [{ marker: '### 27.6 搜索', title: '搜索' }],
  'interaction-filter-sort': [{ marker: '### 27.7 筛选与排序', title: '筛选与排序' }],
  'interaction-form-validation': [{ marker: '### 27.8 表单输入与校验', title: '表单输入与校验' }],
  'interaction-async': [{ marker: '### 27.9 异步操作', title: '异步操作' }],
  'interaction-danger': [{ marker: '### 27.10 删除与危险操作', title: '删除与危险操作' }],
  'interaction-overlays': [{ marker: '### 27.11 Dropdown / Popover / Modal / Drawer', title: 'Dropdown / Popover / Modal / Drawer' }],
  'interaction-collections': [{ marker: '### 27.12 Table / List / Tree', title: 'Table / List / Tree' }],
  'interaction-feedback-states': [{ marker: '### 27.13 Loading / Empty / Error / Success', title: 'Loading / Empty / Error / Success' }],
  'interaction-scroll': [{ marker: '### 27.14 滚动与溢出', title: '滚动与溢出' }],
  'interaction-drag': [{ marker: '### 27.15 拖拽', title: '拖拽' }],
  'interaction-upload': [{ marker: '### 27.16 上传与文件操作', title: '上传与文件操作' }],
  'interaction-history': [{ marker: '### 27.17 Undo / Redo 与未保存状态', title: 'Undo / Redo 与未保存状态' }],
  'interaction-motion': [{ marker: '### 27.19 动效', title: '动效' }],
  'interaction-responsive-touch': [{ marker: '### 27.20 响应式与触屏', title: '响应式与触屏' }],
  'interaction-availability': [{ marker: '### 27.21 权限、占用与不可用状态', title: '权限、占用与不可用状态' }],
  'interaction-navigation': [{ marker: '### 27.22 导航、历史状态与列表上下文（权威定义）', title: '导航、历史状态与列表上下文' }],
  'interaction-context-menu': [{ marker: '### 27.23 右键与上下文菜单', title: '右键与上下文菜单' }],
  'interaction-inline-edit': [{ marker: '### 27.24 行内编辑 Inline Edit', title: '行内编辑 Inline Edit' }],
  'interaction-copy-paste': [{ marker: '### 27.25 Copy / Paste / Duplicate', title: 'Copy / Paste / Duplicate' }],
  'interaction-multi-select': [{ marker: '### 27.26 多选与范围选择', title: '多选与范围选择' }],
  'interaction-viewport': [{ marker: '### 27.27 Resize / Zoom / Pan', title: 'Resize / Zoom / Pan' }],
  'interaction-autosave': [{ marker: '### 27.28 自动保存与保存状态', title: '自动保存与保存状态' }],
  'interaction-conflicts': [{ marker: '### 27.29 版本与并发冲突', title: '版本与并发冲突' }],
  'interaction-realtime': [{ marker: '### 27.30 实时数据刷新', title: '实时数据刷新' }],
  'interaction-reconnect': [{ marker: '### 27.31 断线与重连', title: '断线与重连' }],
  'interaction-deep-link': [{ marker: '### 27.33 路由与深链接', title: '路由与深链接' }],
  'interaction-command': [{ marker: '### 27.35 Command / 快捷操作', title: 'Command / 快捷操作' }],
  'interaction-interruption': [{ marker: '### 27.36 操作打断', title: '操作打断' }],
  'interaction-session': [{ marker: '### 27.37 Session / 超时', title: 'Session / 超时' }],
  'interaction-optimistic': [{ marker: '### 27.38 乐观更新 Optimistic UI', title: '乐观更新 Optimistic UI' }],
  'interaction-batch-feedback': [{ marker: '### 27.39 批处理执行反馈', title: '批处理执行反馈' }],
  'interaction-task-queue': [{ marker: '### 27.40 任务队列', title: '任务队列' }],
  'interaction-progress-cancel': [{ marker: '### 27.41 进度与取消', title: '进度与取消' }],
  'interaction-reload-recovery': [{ marker: '### 27.42 页面刷新与数据恢复', title: '页面刷新与数据恢复' }],
  'interaction-help': [{ marker: '### 27.43 帮助与解释交互', title: '帮助与解释交互' }],
  'interaction-notifications': [{ marker: '### 27.44 系统级通知', title: '系统级通知' }],
  'interaction-live-regions': [{ marker: '### 27.45 可访问动态反馈', title: '可访问动态反馈' }],
  'interaction-ime': [{ marker: '### 27.46 输入法与组合输入', title: '输入法与组合输入' }],
  'interaction-refresh-conflict': [{ marker: '### 27.47 数据刷新与用户编辑冲突', title: '数据刷新与用户编辑冲突' }],
  'interaction-escape-hatches': [{ marker: '### 27.48 恢复与逃生路径', title: '恢复与逃生路径' }],
  'interaction-accessibility': [{ marker: '### 27.49 无障碍交互', title: '无障碍交互' }],
  'interaction-actions': [{ marker: '### 27.50 操作按钮统一命名、样式与图标提示', title: '操作按钮统一命名、样式与图标提示' }],
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
    { token: '--ds-color-brand', label: '品牌/主操作色', description: '品牌识别与实色 Primary Button', light: tokens.theme.light.color.brand, dark: tokens.theme.dark.color.brand },
    { token: '--ds-color-accent', label: '交互强调色', description: '选中文字、Focus 与暗色高亮', light: tokens.theme.light.color.accent, dark: tokens.theme.dark.color.accent },
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
  ['--ds-motion-duration-loading', '800ms', '加载指示器完整周期'],
  ['--ds-motion-ease-in', 'cubic-bezier(0.4, 0, 1, 1)', '退出与收起'],
  ['--ds-motion-ease-out', 'cubic-bezier(0.16, 1, 0.3, 1)', '进入与展开'],
  ['--ds-motion-ease-in-out', 'cubic-bezier(0.2, 0, 0, 1)', '状态切换'],
];

const DESIGN_TOKEN_SEARCH_ITEMS = createTokenSearchItems(tokens);

type TopicDocument = {
  title: string;
  description: string;
  parameterTitle: string;
  parameters: Array<{ token: string; value: string; description?: string }>;
  rules: string[];
  preview: 'colors' | 'type' | 'icon' | 'spacing' | 'radius' | 'shadow' | 'motion' | 'layout' | 'document';
};

const TOKEN_DOCUMENTS: Record<string, TopicDocument> = {
  colors: { title: '颜色', description: '颜色按语义使用，并随浅色与深色主题自动切换。业务页面不得直接写色值。', parameterTitle: '颜色 Token', parameters: COLOR_TOKENS.map(item => ({ token: item.token, value: `var(${item.token})`, description: item.description })), rules: ['Brand 用于实色主按钮；Accent 用于已选文字、Focus 与暗色高亮，两者不得互换。', 'Success、Warning、Danger 只表达对应业务语义，不能互相替代。', '反馈同时使用文字、图标或形状，不只依赖颜色。'], preview: 'colors' },
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

export function DesignGuidelines({ themeMode, initialTopicKey = 'colors', scope = 'all' }: { themeMode: ThemeMode; initialTopicKey?: string; scope?: 'all' | 'interaction' }) {
  const interactionOnly = scope === 'interaction';
  const visibleGroups = interactionOnly
    ? GUIDE_GROUPS.filter(group => group.label === '交互规范')
    : GUIDE_GROUPS.filter(group => group.label !== '交互规范');
  const [activeTopicKey, setActiveTopicKey] = useState(initialTopicKey);
  const [activeComponentName, setActiveComponentName] = useState('Button');
  const [componentSearch, setComponentSearch] = useState('');
  const [componentSearchOpen, setComponentSearchOpen] = useState(false);
  const componentSearchRef = useRef<HTMLDivElement>(null);
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
  const normalizedComponentSearch = normalizeComponentSearch(componentSearch);
  const componentSearchResults = useMemo(() => {
    if (!normalizedComponentSearch) return [];
    const componentResults: GuidelineSearchResult[] = componentSpecs.components
      .map(component => ({ kind: 'component' as const, component, score: getComponentSearchScore(component, normalizedComponentSearch) }))
      .filter(result => result.score >= 0)
    const tokenResults: GuidelineSearchResult[] = DESIGN_TOKEN_SEARCH_ITEMS
      .map(token => ({ kind: 'token' as const, token, score: getTokenSearchScore(token, normalizedComponentSearch) }))
      .filter(result => result.score >= 0);
    const topicResults: GuidelineSearchResult[] = createTopicSearchItems()
      .filter(topic => interactionOnly ? topic.group === '交互规范' : topic.group !== '交互规范')
      .map(topic => ({ kind: 'topic' as const, topic, score: getTopicSearchScore(topic, normalizedComponentSearch) }))
      .filter(result => result.score >= 0);
    return [...topicResults, ...componentResults, ...tokenResults]
      .sort((left, right) => right.score - left.score || getSearchResultName(left).localeCompare(getSearchResultName(right)))
      .slice(0, 24);
  }, [normalizedComponentSearch]);

  useEffect(() => {
    function closeComponentSearch(event: PointerEvent) {
      if (!componentSearchRef.current?.contains(event.target as Node)) setComponentSearchOpen(false);
    }
    document.addEventListener('pointerdown', closeComponentSearch);
    return () => document.removeEventListener('pointerdown', closeComponentSearch);
  }, []);

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
    setComponentSearchOpen(false);
    window.requestAnimationFrame(() => document.getElementById('ds-component-contract')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function locateToken(token: TokenSearchItem) {
    setActiveTopicKey(token.topicKey);
    setComponentSearch('');
    setComponentSearchOpen(false);
  }

  function locateTopic(topic: TopicSearchItem) {
    setActiveTopicKey(topic.key);
    setComponentSearch('');
    setComponentSearchOpen(false);
  }

  return (
    <main className="ds-page ds-page--dashboard ds-guidelines" aria-label={interactionOnly ? '交互规范' : '设计规范'}>
      <div className="ds-guidelines__body">
        <nav className="ds-guidelines__nav" aria-label={interactionOnly ? '交互规范目录' : '设计规范目录'}>
          <div className="ds-guidelines__nav-title"><Sparkles size={15} />{interactionOnly ? '交互规范' : '设计规范'}</div>
          {visibleGroups.map(group => (
            <section className="ds-guidelines__nav-group" key={group.label}>
              <h2>{group.label}</h2>
              {group.items.map(item => <button type="button" key={item.key} aria-current={activeTopicKey === item.key ? 'page' : undefined} onClick={() => setActiveTopicKey(item.key)}>{item.label}</button>)}
            </section>
          ))}
        </nav>

        <div className="ds-guidelines__main-content">
          <div className="ds-guidelines__content-toolbar">
            {interactionOnly
              ? <span><Sparkles size={14} />交互规范 / <strong>{activeTopic.label}</strong></span>
              : <span><Sparkles size={14} />设计规范 / {activeGroup.label} / <strong>{activeTopic.label}</strong></span>}
            {!interactionOnly && <div>
              <ProductTag tone="accent">v{tokens.version}</ProductTag>
              <ProductTag tone="neutral">{themeMode === 'dark' ? '深色主题' : '浅色主题'}</ProductTag>
              <ProductButton className="ds-guidelines__copy-token" type="outline" icon={<ClipboardCopy size={14} />} onClick={() => copy(JSON.stringify(tokens, null, 2), '已复制完整 Token JSON')}>复制 Token</ProductButton>
              <div className="ds-guidelines__search-shell" ref={componentSearchRef}>
                <label className="ds-guidelines__header-search" aria-label="搜索设计规范"><Search size={14} aria-hidden="true" /><input value={componentSearch} aria-expanded={componentSearchOpen && Boolean(normalizedComponentSearch)} aria-controls="ds-component-search-results" onFocus={() => { if (normalizedComponentSearch) setComponentSearchOpen(true); }} onChange={event => { setComponentSearch(event.target.value); setComponentSearchOpen(true); }} onKeyDown={event => { if (event.key === 'Escape') setComponentSearchOpen(false); }} placeholder="搜索组件、状态、Token、尺寸" /><button type="button" aria-label="清除搜索" onClick={() => { setComponentSearch(''); setComponentSearchOpen(false); }} hidden={!componentSearch}><X size={13} /></button></label>
                {componentSearchOpen && normalizedComponentSearch && <section id="ds-component-search-results" className="ds-guidelines__component-search-results" aria-label="设计规范搜索结果">
                  {componentSearchResults.length > 0 ? componentSearchResults.map(result => result.kind === 'component'
                    ? <button type="button" key={`component-${result.component.name}`} onClick={() => locateComponent(result.component)}><strong>{result.component.name}</strong><span>{result.component.purpose}</span><small>{getComponentSearchContext(result.component, normalizedComponentSearch)}</small></button>
                    : result.kind === 'token'
                      ? <button type="button" key={`token-${result.token.path}`} onClick={() => locateToken(result.token)}><strong>{result.token.label}</strong><span>{result.token.value}</span><small>Token · {result.token.path}</small></button>
                      : <button type="button" key={`topic-${result.topic.key}`} onClick={() => locateTopic(result.topic)}><strong>{result.topic.label}</strong><span>{result.topic.summary}</span><small>规范章节 · {result.topic.group}</small></button>) : <p>未找到匹配的规范、组件或 Token。</p>}
                </section>}
              </div>
            </div>}
          </div>

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
  return topicKey.startsWith('interaction-') || ['search-filter', 'form-submit', 'configuration-authoring', 'import', 'delete-confirm', 'long-task', 'list-page', 'detail-page', 'config-page', 'form-page', 'dashboard-page', 'editor-page'].includes(topicKey);
}

function GuidelineVisualPreview({ topicKey, title }: { topicKey: string; title: string }) {
  if (topicKey.startsWith('interaction-')) return <InteractionSpecPreview topicKey={topicKey} title={title} />;
  if (topicKey === 'search-filter') return <section className="ds-guidelines__pattern-preview"><h2>样式预览</h2><p>搜索词和筛选条件变化后直接更新结果；重置用于一次恢复全部条件。</p><SearchInputStylePreview /></section>;
  if (topicKey === 'form-submit') return <section className="ds-guidelines__pattern-preview"><h2>样式预览</h2><p>字段标题与短说明在同一行两端对齐；只有帮助、错误和服务端校验信息放在控件下方。</p><div className="ds-guidelines__pattern-surface ds-guidelines__pattern-surface--form"><div className="ds-guidelines__pattern-form-fields"><ProductField label="型号名称" description="最多 32 个字符"><ProductTextInput defaultValue="人形双足机器人" /></ProductField><ProductField label="发布状态"><ProductSelect defaultValue="draft"><option value="draft">未发布</option><option value="published">已发布</option></ProductSelect></ProductField></div><div className="ds-guidelines__pattern-footer"><ProductButton>取消</ProductButton><ProductButton type="primary">保存并发布</ProductButton></div></div></section>;
  if (topicKey === 'configuration-authoring') return <ConfigurationAuthoringPreview />;
  if (topicKey === 'import') return <section className="ds-guidelines__pattern-preview"><h2>样式预览</h2><p>导入按选择文件、解析校验、确认写入、逐项结果反馈组织。</p><div className="ds-guidelines__pattern-surface ds-guidelines__pattern-surface--import"><ProductUploadBox title="上传型号配置文件" description="支持 .json，单个文件最大 20MB" accept=".json" onFileChange={() => undefined} /><div className="ds-guidelines__pattern-file-result"><span>robot-model.json</span><ProductTag tone="success">解析通过</ProductTag><ProductButton size="small" type="text">移除</ProductButton></div><div className="ds-guidelines__pattern-footer"><ProductButton>取消</ProductButton><ProductButton type="primary">确认导入</ProductButton></div></div></section>;
  if (topicKey === 'delete-confirm') return <section className="ds-guidelines__pattern-preview"><h2>样式预览</h2><p>确认层只说明对象、影响范围与后果；危险确认使用 danger，取消不改变数据。</p><ModalStylePreview initialKind="danger" showVariants={false} /></section>;
  if (topicKey === 'long-task') return <section className="ds-guidelines__pattern-preview"><h2>样式预览</h2><p>长任务保留任务名称、阶段、进度、耗时与后台入口；失败提供可恢复操作。</p><div className="ds-guidelines__pattern-surface ds-guidelines__pattern-task"><div><strong>正在生成数字模型</strong><ProductTag tone="accent">进行中</ProductTag></div><span>第 2 / 3 阶段：校验部件参数</span><div className="ds-guidelines__pattern-progress"><i /></div><footer><span>已用时 01:24</span><ProductButton size="small" type="text">后台继续</ProductButton></footer></div></section>;
  if (topicKey.endsWith('-page')) return <PageTemplateVisualPreview topicKey={topicKey} title={title} />;
  return null;
}

const INTERACTION_PREVIEW_META: Record<string, { scenario: string; rule: string; avoid: string }> = {
  'interaction-state': { scenario: '同一控件的状态组合', rule: 'Selected 是持续状态，Focus 与 Hover 可与它并存。', avoid: '不用 Hover 代替 Selected，不在 Loading 时改变按钮宽度。' },
  'interaction-pointer': { scenario: '鼠标和触控的等价操作', rule: '图标可以是 16px，但触控热区不小于 44×44px。', avoid: '不把关键操作只放在 Hover 中，不用双击作为唯一入口。' },
  'interaction-keyboard': { scenario: '键盘导航、命令绑定与冲突管理', rule: '导航键遵循控件语义；快捷键按作用域注册，局部优先于全局并提供点击入口。', avoid: '不重复定义“快捷键”和“快捷键体系”，不占用系统保留键或让同一上下文重复映射。' },
  'interaction-focus': { scenario: '弹层打开与关闭的焦点恢复', rule: '打开后焦点进入任务，关闭后返回原触发器。', avoid: '不用正 tabindex 重排顺序，不在刷新时抢焦点。' },
  'interaction-activation': { scenario: '行点击、选择和开关的语义分工', rule: '打开详情、选中对象、切换设置是三类独立意图。', avoid: '不让行内按钮意外触发行选中或打开详情。' },
  'interaction-search': { scenario: '实时搜索与过期请求', rule: '输入后防抖查询，保留关键词，只接收最新响应。', avoid: '不在 IME composition 期间提交，不在无结果时清空关键词。' },
  'interaction-filter-sort': { scenario: '可见的已生效条件', rule: '展示已选筛选和当前排序，支持逐项清除与重置。', avoid: '不把已生效条件隐藏在关闭的面板中。' },
  'interaction-form-validation': { scenario: '可修正的字段错误', rule: '保留输入，在字段附近说明原因和修正方式。', avoid: '不只画红框，不在提交失败后清空表单。' },
  'interaction-async': { scenario: '保留已有内容的局部刷新', rule: '局部显示“更新中”，任务超时后提供阶段和恢复入口。', avoid: '不因一个局部请求将整页变成 Loading。' },
  'interaction-danger': { scenario: '不可逆的批量删除', rule: '确认对象、数量、影响和可恢复性，确认按钮使用明确动词。', avoid: '不使用“是 / 否”，不对可 Undo 的低风险删除层层阻断。' },
  'interaction-overlays': { scenario: '为编辑任务选择正确容器', rule: '短且独立用 Modal；需参照当前页用 Drawer；多步、大画布用整页。', avoid: '不把 Drawer 当成更大的 Modal，不在 Modal 里再打开 Modal。' },
  'interaction-collections': { scenario: '表格行中的多种意图', rule: '复选框用于选择，行主标识打开详情，行内按钮只执行自身操作。', avoid: '不使一次点击同时选中行并打开详情。' },
  'interaction-feedback-states': { scenario: '同一数据区的四种结果状态', rule: 'Loading、Empty、Error、Success 都提供对应范围和真实下一步。', avoid: '不把无数据、无结果、无权限都写成“暂无数据”。' },
  'interaction-scroll': { scenario: '页面、弹层和表格的滚动边界', rule: '页面保持唯一主滚动，宽表在自身容器内横向滚动。', avoid: '不使用同方向嵌套滚动，不在刷新时跳回顶部。' },
  'interaction-drag': { scenario: '可预期的重排', rule: '抓取热区、放置目标、合法性和结果都持续可见。', avoid: '不让拖拽成为唯一重排方式，不与触屏滚动抢手势。' },
  'interaction-upload': { scenario: '批量文件的逐项进度', rule: '每个文件显示名称、大小、进度、结果和可用操作。', avoid: '不静默覆盖同名文件，不将部分失败伪装为全部失败。' },
  'interaction-history': { scenario: '可撤销的编辑与自动保存', rule: '历史按用户可理解的操作分组，保存状态持续可见。', avoid: '不让新操作保留无效 Redo 分支，不对保存失败保持沉默。' },
  'interaction-motion': { scenario: '用动效表达状态与空间关系', rule: 'Hover 用 fast，状态切换用 mid，浮层进出用 slow。', avoid: '不为装饰延迟操作，不在减弱动效模式下保留大幅移动。' },
  'interaction-responsive-touch': { scenario: '同一任务在标准与紧凑容器中收敛', rule: '窄屏先重排，再收纳次要操作，最后隐藏低优先信息。', avoid: '不对整个界面等比缩放，不依赖 Hover 查看核心值。' },
  'interaction-availability': { scenario: '无权限、占用和依赖未满足的区分', rule: '保留业务信息可读，明确说明不可用原因和恢复路径。', avoid: '不用整个区域降低 opacity，不将隐藏按钮当成后端权限控制。' },
  'interaction-navigation': { scenario: '列表到详情再返回', rule: '返回后恢复搜索、筛选、分页和合理滚动位置。', avoid: '不将业务返回盲目实现为 history.back，不让微状态污染后退栈。' },
  'interaction-context-menu': { scenario: '对象与空白区域的右键菜单', rule: '右键同时选中对象，菜单在指针附近出现并在视口边缘翻转。', avoid: '不把右键设为唯一入口，不直接隐藏禁用项而应说明原因。' },
  'interaction-inline-edit': { scenario: '表格与列表中的行内编辑', rule: 'Enter 保存、Esc 取消；失焦按规范统一保存并保留校验反馈。', avoid: '不因失焦静默丢失校验错误，不切换对象时丢弃未保存编辑。' },
  'interaction-copy-paste': { scenario: '复制、粘贴与生成副本', rule: '副本生成新 ID 与不冲突名称，粘贴位置和跨页规则明确。', avoid: '不让副本继承原 ID，不把剪贴板失败当作成功。' },
  'interaction-multi-select': { scenario: '多选与范围选择', rule: 'Ctrl/Cmd 加减选、Shift 连续选择、框选与点击空白清空。', avoid: '不让混选对象执行不兼容操作，不清空选择时无反馈。' },
  'interaction-viewport': { scenario: '面板缩放、平移与视图恢复', rule: '缩放以指针为中心，滚轮 / 双指行为固定，提供 Fit / Reset View。', avoid: '不把视图操作改变对象数据，不无限缩放。' },
  'interaction-autosave': { scenario: '自动保存与保存状态', rule: 'Modified / Saving / Saved / Save Failed 持续可见并播报。', avoid: '不在保存失败时静默覆盖本地修改，不重复提交同一保存。' },
  'interaction-conflicts': { scenario: '版本与并发冲突', rule: '冲突给出覆盖 / 重载 / 合并选项并保留双方修改。', avoid: '不以静默覆盖解决冲突，不让锁过期无提示。' },
  'interaction-realtime': { scenario: '实时数据刷新', rule: '声明频率与最后更新时间，页面不可见时暂停刷新。', avoid: '不让新数据覆盖用户正在查看的内容，不伪装离线为正常。' },
  'interaction-reconnect': { scenario: '断线与重连', rule: '断线立即可见、退避重连，恢复后重新校验关键数据。', avoid: '不自动重发结果未知的指令，不允许重复创建副作用数据。' },
  'interaction-deep-link': { scenario: '路由与深链接', rule: 'URL 记录对象 ID、Tab 与筛选条件，刷新可恢复上下文。', avoid: '不存在 / 无权限时不只显示空白，需给出降级与下一步。' },
  'interaction-command': { scenario: 'Command Palette 与全局快捷操作', rule: '命令、搜索、最近访问合并，方向键选择、Enter 执行、权限过滤。', avoid: '不以搜索暴露无权限对象，不抢走关闭后的焦点。' },
  'interaction-interruption': { scenario: '操作被打断时的恢复', rule: '写请求继续并补报结果，草稿保留，长任务提供后台继续。', avoid: '不静默丢弃上传进度与本地修改，不基于过期数据继续操作。' },
  'interaction-session': { scenario: 'Session 与登录超时', rule: '失效即停发、重登恢复上下文，未保存内容本地保留。', avoid: '不静默重发过期 Token 的请求，不因超时中断服务端长任务。' },
  'interaction-optimistic': { scenario: '乐观更新 Optimistic UI', rule: '只对可逆低成本操作乐观更新，失败回滚不覆盖新修改。', avoid: '高风险操作禁止乐观更新，不伪装处理中为已完成。' },
  'interaction-batch-feedback': { scenario: '批处理执行反馈', rule: '汇总成功 / 失败数量，失败项可重试并导出失败列表。', avoid: '不要求重跑成功项，不把跳过伪装为成功。' },
  'interaction-task-queue': { scenario: '任务队列', rule: '六种状态、并发上限、优先级与暂停 / 继续可见，后台运行补报结果。', avoid: '不提供虚假暂停按钮，不因离开页面中断任务。' },
  'interaction-progress-cancel': { scenario: '进度与取消', rule: '确定 / 不确定进度分场景，取消只停止未执行部分并说明数据处理。', avoid: '不伪装百分比，不回滚已完成结果。' },
  'interaction-reload-recovery': { scenario: '页面刷新与数据恢复', rule: '刷新后提示恢复本地草稿，展示摘要由用户决定。', avoid: '恢复失败时不静默丢弃原文，不基于过期数据恢复。' },
  'interaction-help': { scenario: '帮助与解释交互', rule: 'Tooltip / Help Text / Info Popover / 首次引导各司其职且不阻碍操作。', avoid: '关键信息不只放 Hover，不重复字段名当帮助。' },
  'interaction-notifications': { scenario: '系统级通知', rule: 'Toast / Notification / 系统通知分工，后台完成通知可点击跳转。', avoid: '不重复打扰，站内通知中心保留完整记录。' },
  'interaction-live-regions': { scenario: '可访问动态反馈', rule: '动态结果用 aria-live / role=status 播报，视觉与播报同步。', avoid: '不播报每个键入字符，不抢用户焦点。' },
  'interaction-ime': { scenario: '输入法与组合输入', rule: '组合输入期间不搜索不提交，Enter 确认候选词不误触。', avoid: '不提前触发防抖查询，不截留 IME 按键。' },
  'interaction-refresh-conflict': { scenario: '数据刷新与用户编辑冲突', rule: '编辑中不覆盖、不移动当前行，冻结刷新并提示有新数据。', avoid: '不直接覆盖正在编辑的值，不丢失任一方修改。' },
  'interaction-escape-hatches': { scenario: '恢复与逃生路径', rule: '错误与异常状态保留返回、保存副本等安全出口。', avoid: '不把用户困在错误页，不只显示错误码。' },
  'interaction-accessibility': { scenario: '键盘、读屏与视觉的同一任务', rule: '使用语义控件、可见焦点、可访问名称和非颜色状态线索。', avoid: '不用 div 模拟按钮，不将 Tooltip 当作唯一可访问名称。' },
  'interaction-actions': { scenario: '同类型操作的命名、样式与图标悬停提示', rule: '图标按钮 Hover / Focus 时在图标上方显示操作名 Tooltip，文案与 aria-label 使用同一操作词。', avoid: '不用原生 title 充当提示，不让同一操作跨页面换名或换控件样式。' },
};

function InteractionSpecPreview({ topicKey, title }: { topicKey: string; title: string }) {
  const meta = INTERACTION_PREVIEW_META[topicKey] ?? { scenario: title, rule: '使用规范定义的默认行为。', avoid: '不自建重复交互模式。' };
  return <section className="ds-guidelines__pattern-preview ds-interaction-preview">
    <header className="ds-interaction-preview__heading"><div><h2>交互示范</h2><p>{meta.scenario}</p></div><ProductTag tone="accent">{title}</ProductTag></header>
    {topicKey === 'interaction-overlays'
      ? <OverlayDecisionPreview />
      : <PublishedInteractionPreview topicKey={topicKey} />}
    <div className="ds-interaction-preview__notes"><article><Check size={15} /><div><strong>正确做法</strong><span>{meta.rule}</span></div></article><article data-tone="danger"><X size={15} /><div><strong>避免</strong><span>{meta.avoid}</span></div></article></div>
  </section>;
}

function PublishedInteractionPreview({ topicKey }: { topicKey: string }) {
  if (topicKey === 'interaction-state') return <ComponentStylePreview componentName="Button" />;
  if (topicKey === 'interaction-pointer') return <ComponentStylePreview componentName="IconButton" />;
  if (topicKey === 'interaction-keyboard') return <ShortcutInteractionPreview />;
  if (topicKey === 'interaction-focus' || topicKey === 'interaction-accessibility') return <div className="ds-guidelines__preview-stack"><ComponentStylePreview componentName="Button" /><ComponentStylePreview componentName="Input / TextArea" /></div>;
  if (topicKey === 'interaction-activation') return <div className="ds-guidelines__preview-stack"><ComponentStylePreview componentName="ToggleButton" /><ComponentStylePreview componentName="Checkbox" /></div>;
  if (topicKey === 'interaction-search' || topicKey === 'interaction-filter-sort') return <SearchInputStylePreview />;
  if (topicKey === 'interaction-form-validation') return <ComponentStylePreview componentName="Input / TextArea" />;
  if (topicKey === 'interaction-async') return <div className="ds-guidelines__component-style-preview"><ProductButton type="primary" loading aria-busy="true">保存</ProductButton><span className="ds-guidelines__component-unpublished">局部刷新保留已有内容</span></div>;
  if (topicKey === 'interaction-danger') return <DangerOperationPreview />;
  if (topicKey === 'interaction-collections' || topicKey === 'interaction-scroll') return <TableStylePreview />;
  if (topicKey === 'interaction-feedback-states') return <div className="ds-guidelines__preview-stack"><ComponentStylePreview componentName="ContentState (Empty / Loading / Error)" /><ToastNotificationPreview /></div>;
  if (topicKey === 'interaction-upload') return <ComponentStylePreview componentName="Upload" />;
  if (topicKey === 'interaction-motion') return <MotionStylePreview />;
  if (topicKey === 'interaction-navigation') return <div className="ds-guidelines__preview-stack"><ComponentStylePreview componentName="Tabs" /><ComponentStylePreview componentName="Menu / Dropdown" /></div>;
  if (topicKey === 'interaction-responsive-touch') return null;
  if (topicKey === 'interaction-drag') return null;
  if (topicKey === 'interaction-history') return <div className="ds-guidelines__component-style-preview"><ProductButton>撤销</ProductButton><ProductButton disabled>重做</ProductButton><ProductButton type="primary">保存</ProductButton><ProductTag tone="neutral">未保存</ProductTag></div>;
  if (topicKey === 'interaction-availability') return null;
  if (topicKey === 'interaction-context-menu') return <ComponentStylePreview componentName="Menu / Dropdown" />;
  if (topicKey === 'interaction-multi-select') return <ComponentStylePreview componentName="Checkbox" />;
  if (topicKey === 'interaction-help') return <ComponentStylePreview componentName="Tooltip / Popover" />;
  if (topicKey === 'interaction-actions') return <ActionTooltipPreview />;
  if (topicKey === 'interaction-inline-edit' || topicKey === 'interaction-copy-paste' || topicKey === 'interaction-viewport' || topicKey === 'interaction-autosave' || topicKey === 'interaction-conflicts' || topicKey === 'interaction-realtime' || topicKey === 'interaction-reconnect' || topicKey === 'interaction-deep-link' || topicKey === 'interaction-command' || topicKey === 'interaction-interruption' || topicKey === 'interaction-session' || topicKey === 'interaction-optimistic' || topicKey === 'interaction-batch-feedback' || topicKey === 'interaction-task-queue' || topicKey === 'interaction-progress-cancel' || topicKey === 'interaction-reload-recovery' || topicKey === 'interaction-notifications' || topicKey === 'interaction-live-regions' || topicKey === 'interaction-ime' || topicKey === 'interaction-refresh-conflict' || topicKey === 'interaction-escape-hatches') return null;
  return <ComponentStylePreview componentName="Button" />;
}

function ActionTooltipPreview() {
  return <div className="ds-guidelines__preview-stack">
    <div className="ds-guidelines__component-style-preview" aria-label="工具栏与行内操作示范">
      <ProductButton type="primary" icon={<Plus size={16} />}>新增</ProductButton>
      <ProductButton type="outline">导出</ProductButton>
      <ProductButton type="outline">刷新</ProductButton>
    </div>
    <div className="ds-guidelines__component-style-preview" aria-label="行内图标操作示范">
      <ProductIconButton type="text" icon={<FileText size={16} />} aria-label="查看" tooltip="查看" />
      <ProductIconButton type="text" icon={<Pencil size={16} />} aria-label="编辑" tooltip="编辑" />
      <ProductIconButton type="text" status="danger" icon={<Trash2 size={16} />} aria-label="删除" tooltip="删除" />
    </div>
    <p className="ds-guidelines__component-unpublished">悬停或键盘聚焦图标按钮，在图标上方显示操作名 Tooltip；Tooltip 文案与 aria-label 使用《多语言文案规则》中的同一操作词。</p>
  </div>;
}

function OverlayDecisionPreview() {
  const [active, setActive] = useState<'modal' | 'drawer' | 'page'>('modal');
  const [realPreviewOpen, setRealPreviewOpen] = useState(false);
  const decisions = {
    modal: { label: 'Modal 编辑', hint: '单步·短表单·无需参照背后页', title: '编辑基础信息', detail: '名称、类型、说明等少量字段，一次保存完成。' },
    drawer: { label: 'Drawer 编辑', hint: '保留上下文·多分区·一次保存', title: '配置槽位规则', detail: '编辑时需对照左侧列表与当前机型，保存后留在原页。' },
    page: { label: '整页编辑', hint: '多步·大画布·长时任务·可深链接', title: '创建机器人模型', detail: '跨基础信息、模块装配、参数校验和发布的完整工作流。' },
  } as const;
  const current = decisions[active];
  return <div className="ds-overlay-decision">
    <div className="ds-guidelines__component-style-preview" role="tablist" aria-label="编辑容器选择示范">
      {(Object.keys(decisions) as Array<keyof typeof decisions>).map(key => <ProductToggleButton key={key} selected={active === key} role="tab" aria-selected={active === key} onClick={() => setActive(key)}>{decisions[key].label}</ProductToggleButton>)}
    </div>
    <div>
      {active !== 'page' && <div className="ds-guidelines__component-style-preview"><ProductTag tone="accent">{active === 'modal' ? 'ProductModal' : 'ProductDrawer'}</ProductTag><span>{current.title}：{current.detail}</span><ProductButton type="primary" onClick={() => setRealPreviewOpen(true)}>打开 {active === 'modal' ? 'Modal' : 'Drawer'}</ProductButton></div>}
      {active === 'page' && <div className="ds-guidelines__configuration-pattern ds-guidelines__pattern-surface"><header><div><strong>{current.title}</strong><span>{current.hint}</span></div></header><div className="ds-guidelines__configuration-body"><div className="ds-guidelines__configuration-notice"><strong>整页主任务</strong><span>{current.detail}</span></div><div className="ds-guidelines__configuration-grid"><ProductField label="型号名称"><ProductTextInput defaultValue="墨影二" /></ProductField><ProductField label="构型模板"><ProductSelect defaultValue="six"><option value="six">6 自由度</option></ProductSelect></ProductField></div></div><footer><ProductButton>保存草稿</ProductButton><ProductButton type="primary">继续</ProductButton></footer></div>}
    </div>
    <div className="ds-guidelines__configuration-notice"><strong>一句话判断</strong><span>{active === 'modal' ? '不看背后页也能快速完成 → Modal' : active === 'drawer' ? '需要边看当前页边编辑 → Drawer' : '任务本身就是当前主工作 → 整页'}</span></div>
    <ProductModal open={realPreviewOpen && active === 'modal'} onOpenChange={setRealPreviewOpen} title="编辑基础信息" description="独立短任务，使用平台 ProductModal。" size="md" footer={<><ProductButton onClick={() => setRealPreviewOpen(false)}>取消</ProductButton><ProductButton type="primary" onClick={() => setRealPreviewOpen(false)}>保存</ProductButton></>}><div className="ds-overlay-decision__real-form"><ProductField label="型号名称"><ProductTextInput defaultValue="墨影二" /></ProductField><ProductField label="发布状态"><ProductSelect defaultValue="draft"><option value="draft">未发布</option><option value="published">已发布</option></ProductSelect></ProductField></div></ProductModal>
    <ProductDrawer open={realPreviewOpen && active === 'drawer'} onOpenChange={setRealPreviewOpen} title="配置槽位规则" description="需对照当前页面的连续编辑，使用平台 ProductDrawer。" footer={<><ProductButton onClick={() => setRealPreviewOpen(false)}>取消</ProductButton><ProductButton type="primary" onClick={() => setRealPreviewOpen(false)}>保存规则</ProductButton></>}><div className="ds-overlay-decision__real-form"><ProductField label="槽位类型"><ProductSelect defaultValue="joint"><option value="joint">关节</option><option value="link">连杆</option></ProductSelect></ProductField><ProductCheckbox label="允许全部规格" defaultChecked /><ProductField label="说明"><ProductTextArea rows={4} defaultValue="保留背后型号列表作为编辑参照。" /></ProductField></div></ProductDrawer>
  </div>;
}

function ShortcutInteractionPreview() {
  const groups = [
    {
      label: '编辑',
      rows: [
        { label: '保存当前配置', mac: '⌘ S', win: 'Ctrl + S' },
        { label: '复制选中对象', mac: '⌘ C', win: 'Ctrl + C' },
        { label: '粘贴', mac: '⌘ V', win: 'Ctrl + V' },
        { label: '剪切', mac: '⌘ X', win: 'Ctrl + X' },
        { label: '撤销', mac: '⌘ Z', win: 'Ctrl + Z' },
        { label: '重做', mac: '⇧ ⌘ Z', win: 'Ctrl + Shift + Z' },
        { label: '全选', mac: '⌘ A', win: 'Ctrl + A' },
      ],
    },
    {
      label: '查找与导航',
      rows: [
        { label: '搜索型号', mac: '⌘ K', win: 'Ctrl + K' },
        { label: '页内查找', mac: '⌘ F', win: 'Ctrl + F' },
        { label: '新建型号', mac: '⌘ N', win: 'Ctrl + N' },
      ],
    },
  ];
  return <div className="ds-shortcut-preview">
    <div className="ds-table-surface ds-shortcut-preview__surface">
      <div className="ds-table-scroll">
        <table>
          <thead><tr className="ds-table-header"><th>操作</th><th>macOS</th><th>Windows</th></tr></thead>
          <tbody>
            {groups.map(group => <Fragment key={group.label}>
              <tr className="ds-shortcut-preview__group"><td colSpan={3}>{group.label}</td></tr>
              {group.rows.map(row => <tr className="ds-table-row" key={row.label}><td><strong>{row.label}</strong></td><td><kbd>{row.mac}</kbd></td><td><kbd>{row.win}</kbd></td></tr>)}
            </Fragment>)}
            <tr className="ds-table-row ds-shortcut-preview__danger"><td><strong>删除型号</strong></td><td colSpan={2}>不可逆操作无快捷键，仅可通过按钮二次确认执行</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <p className="ds-shortcut-preview__hint">界面按当前操作系统显示键位；输入中暂停页面级快捷键，保留文本编辑快捷键；所有快捷键均有可点击的等价入口。</p>
  </div>;
}

function DangerOperationPreview() {
  const [open, setOpen] = useState(false);
  return <div className="ds-guidelines__component-style-preview"><ProductButton type="primary" status="danger" onClick={() => setOpen(true)}>打开删除确认</ProductButton><ProductModal open={open} onOpenChange={setOpen} title="删除 3 个型号？" description="删除后将同时解除 12 条配置关系，且无法恢复。" status="danger" footer={<><ProductButton onClick={() => setOpen(false)}>取消</ProductButton><ProductButton type="primary" status="danger" onClick={() => setOpen(false)}>删除 3 个型号</ProductButton></>}><div className="ds-overlay-decision__real-form"><div className="ds-guidelines__configuration-notice" data-tone="danger"><strong>影响范围</strong><span>3 个型号、12 条配置关系，操作不可撤销。</span></div></div></ProductModal></div>;
}

type ConfigurationPreviewKey = 'enum' | 'component' | 'cascade' | 'assembly' | 'slot-rules';

const CONFIGURATION_PREVIEW_TABS: Array<{ key: ConfigurationPreviewKey; label: string }> = [
  { key: 'enum', label: '枚举项编辑' },
  { key: 'component', label: '创建组件' },
  { key: 'cascade', label: '新增级联' },
  { key: 'assembly', label: '装配模板' },
  { key: 'slot-rules', label: '槽位规则' },
];

function ConfigurationAuthoringPreview() {
  const [active, setActive] = useState<ConfigurationPreviewKey>('enum');
  return <section className="ds-guidelines__pattern-preview">
    <h2>样式预览</h2>
    <p>配置类任务复用同一字段、选择组、Modal / Drawer 和固定操作区；复杂配置只滚动 Body，标题与操作始终可见。</p>
    <div className="ds-guidelines__configuration-tabs ds-status-tabs" role="tablist" aria-label="配置编排模式">
      {CONFIGURATION_PREVIEW_TABS.map(item => <button className="ds-status-tab" key={item.key} type="button" role="tab" aria-selected={active === item.key} onClick={() => setActive(item.key)}>{item.label}</button>)}
    </div>
    <div className="ds-guidelines__pattern-surface ds-guidelines__configuration-pattern">
      <header><div><strong>{CONFIGURATION_PREVIEW_TABS.find(item => item.key === active)?.label}</strong><span>{active === 'component' ? '基础信息与模块装配使用连续两步' : active === 'assembly' || active === 'slot-rules' ? '连续配置使用 Drawer' : '短配置使用 Modal'}</span></div><X size={16} aria-hidden="true" /></header>
      <div className="ds-guidelines__configuration-body">
        {active === 'enum' && <EnumEditorPattern />}
        {active === 'component' && <ComponentCreatePattern />}
        {active === 'cascade' && <CascadePattern />}
        {active === 'assembly' && <AssemblyPattern />}
        {active === 'slot-rules' && <SlotRulesPattern />}
      </div>
      <footer data-has-reset={active === 'assembly' || active === 'slot-rules' ? 'true' : undefined}><ProductButton>{active === 'assembly' || active === 'slot-rules' ? '恢复默认' : '取消'}</ProductButton>{active === 'assembly' || active === 'slot-rules' ? <ProductButton>取消</ProductButton> : null}<ProductButton type="primary">{active === 'component' || active === 'cascade' ? '下一步' : active === 'assembly' || active === 'slot-rules' ? '保存模板' : '保存'}</ProductButton></footer>
    </div>
  </section>;
}

function EnumEditorPattern() {
  return <div className="ds-guidelines__configuration-form">
    <div className="ds-guidelines__configuration-grid"><ProductField label="字段名称"><ProductTextInput defaultValue="驱动方式" /></ProductField><ProductField label="数据类型"><ProductSelect defaultValue="enum"><option value="enum">枚举型</option></ProductSelect></ProductField></div>
    <section className="ds-guidelines__enum-pattern"><header><div><strong>枚举项</strong><span>组件参数表单中将以下拉选项展示</span></div><ProductButton size="small" icon={<Plus size={13} />}>新增枚举项</ProductButton></header><div className="ds-guidelines__enum-pattern__columns"><span>显示名称</span><span>标识符</span><span>操作</span></div>{[['差速驱动', 'differential'], ['全向驱动', 'omnidirectional']].map(([name, key]) => <div className="ds-guidelines__enum-pattern__row" key={key}><ProductTextInput defaultValue={name} /><ProductTextInput defaultValue={key} /><ProductIconButton size="small" status="danger" icon={<Trash2 size={13} />} aria-label={`删除${name}`} tooltip="删除" /></div>)}</section>
  </div>;
}

function ComponentCreatePattern() {
  return <div className="ds-guidelines__configuration-form"><div className="ds-guidelines__configuration-grid"><ProductField label="组件名称" required><ProductTextInput placeholder="请输入" /></ProductField><ProductField label="英文标识符" required><ProductTextInput placeholder="请输入" /></ProductField><ProductField label="组件类型" required><ProductSelect defaultValue="arm"><option value="arm">机械臂整臂</option></ProductSelect></ProductField><ProductField label="子类型" required><ProductSelect defaultValue="shadow"><option value="shadow">墨影</option></ProductSelect></ProductField></div><ProductField label="构型模板" required><ProductSelect defaultValue="six"><option value="six">墨影二构型 · 6 自由度</option></ProductSelect></ProductField><ProductField label="描述"><ProductTextArea rows={3} placeholder="请输入组件描述" /></ProductField></div>;
}

function CascadePattern() {
  return <div className="ds-guidelines__configuration-form"><ProductField label="父字段取值" required><ProductSelect defaultValue="base"><option value="base">底盘</option></ProductSelect></ProductField><ProductField label="关联子字段" required><ProductSelect defaultValue="subtype"><option value="subtype">子类型</option></ProductSelect></ProductField><section className="ds-guidelines__choice-group"><header><strong>关联级联</strong><ProductCheckbox label="全选" /></header><div>{['大臂420 mm', '小臂400 mm (fore_400)', '大臂250 mm (upper_250)', '小臂200 mm'].map((label, index) => <ProductCheckbox key={label} label={label} defaultChecked={index === 1 || index === 2} />)}</div></section></div>;
}

function AssemblyPattern() {
  return <div className="ds-guidelines__configuration-form"><div className="ds-guidelines__configuration-notice"><strong>具体槽位装配模板</strong><span>每个槽位只能选择槽位规则允许的模块与规格。</span></div><div className="ds-guidelines__assembly-pattern">{[['底座', '底座', '请选择底座模块', '1300'], ['J1', '关节', '请选择关节模块', 'j32、j25'], ['L1', '连杆', '请选择连杆模块', 'upper_420、fore_400']].map(([code, kind, label, specs]) => <div key={code}><div><ProductTag tone="accent">{code}</ProductTag><strong>{kind}</strong></div><button type="button"><Box size={16} /><span><strong>{label}</strong><small>允许规格：{specs}</small></span><ChevronDown size={15} /></button></div>)}</div></div>;
}

function SlotRulesPattern() {
  return <div className="ds-guidelines__configuration-form"><div className="ds-guidelines__configuration-notice"><strong>类型级槽位规则</strong><span>规则来源于字段字典；保存后所有构型装配模板共用该规则。</span></div><div className="ds-guidelines__slot-rules-pattern">{[['base', '底座', ['800 mm', '1300 mm']], ['joint', '关节', ['14 (j14)', '17 (j17)', '25 (j25)', '32 (j32)']], ['link', '连杆', ['大臂420 mm', '小臂400 mm', '大臂250 mm']]].map(([code, label, values]) => <section key={String(code)}><header><div><ProductTag tone="neutral">{String(code)}</ProductTag><strong>{String(label)}</strong></div><ProductCheckbox label="全选" /></header><div>{(values as string[]).map((value, index) => <ProductCheckbox key={value} label={value} defaultChecked={index === 1} />)}</div></section>)}</div></div>;
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
          <td className="ds-guidelines__table-sticky-last"><div><ProductIconButton size="small" icon={<FileText size={13} />} aria-label="查看详情" tooltip="查看详情" /><ProductIconButton size="small" icon={<Pencil size={13} />} aria-label="编辑记录" tooltip="编辑" /></div></td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}

function PageTemplateVisualPreview({ topicKey, title }: { topicKey: string; title: string }) {
  const [configTab, setConfigTab] = useState<'basic' | 'network' | 'safety'>('basic');
  const descriptions: Record<string, string> = {
    'list-page': '搜索、筛选和结果列表按上下顺序组织；分页固定在结果区底部，宽表只在结果区内部横向滚动。',
    'detail-page': '对象摘要与主要操作位于顶部；详情内容为主，辅助信息独立于主内容管理滚动。',
    'config-page': '导航、配置内容和固定提交区分工明确；提交不挤入 Header，配置内容保持独立滚动。',
    'form-page': '字段按分组排布，页面主体滚动；取消与保存固定在底部提交区。',
    'dashboard-page': '指标、核心数据和辅助信息按栅格排列；单个模块异常不影响其他模块内容。',
    'editor-page': '资源、画布、属性三栏各自管理内容；画布获得剩余空间，顶部仅放任务级操作。',
  };
  const headerTitles: Record<string, [string, string]> = {
    'list-page': ['型号库', '管理所有机器人型号与发布状态'],
    'detail-page': ['MCR 复合机器人', '型号详情与当前发布信息'],
    'config-page': ['机器人参数配置', '配置底盘、机械臂与通信参数'],
    'form-page': ['新建软件产品', '填写产品基本信息与唯一标识'],
    'dashboard-page': ['设备运行看板', '最近 24 小时运行状态'],
    'editor-page': ['自定义首页编辑器', '布局与组件配置自动保存'],
  };
  const [heading, description] = headerTitles[topicKey] ?? [title, '页面说明与状态信息'];
  return <section className="ds-guidelines__pattern-preview">
    <h2>样式预览</h2><p>{descriptions[topicKey] ?? `${title}使用统一页面边距、模块间距和内容区内部滚动。`}</p>
    <div className={`ds-guidelines__template-preview ds-guidelines__template-preview--${topicKey}`}>
      <header><div><strong>{heading}</strong><span>{description}</span></div><div className="ds-guidelines__template-actions"><ProductButton size="small">更多</ProductButton><ProductButton type="primary" size="small">{topicKey === 'editor-page' ? '发布' : '主要操作'}</ProductButton></div></header>
      {topicKey === 'list-page' && <main className="ds-guidelines__template-list"><div className="ds-guidelines__template-toolbar"><ProductTextInput aria-label="搜索型号" placeholder="搜索型号名称" /><ProductSelect aria-label="发布状态" defaultValue="all"><option value="all">全部状态</option></ProductSelect><ProductButton>重置</ProductButton></div><TableStylePreview labels={['MCR 复合机器人', 'AGV 搬运机器人']} /><div className="ds-guidelines__template-pagination">共 2 条 <ProductButton size="small">1</ProductButton></div></main>}
      {topicKey === 'detail-page' && <main className="ds-guidelines__template-columns"><section><h3>基础信息</h3><PreviewDefinitionRows rows={[['型号标识', 'mcr-composite-v2'], ['机器人类型', '复合机器人'], ['当前版本', 'R1.4'], ['更新时间', '2026-07-01 14:32']]} /></section><aside><h3>发布状态</h3><ProductTag tone="success">已发布</ProductTag><p>当前版本已用于 4 台设备。</p></aside></main>}
      {topicKey === 'config-page' && <main className="ds-guidelines__template-config"><nav aria-label="配置分组">{([['basic', '基础参数'], ['network', '通信配置'], ['safety', '安全限制']] as const).map(([key, label]) => <button key={key} type="button" aria-current={configTab === key ? 'page' : undefined} onClick={() => setConfigTab(key)}>{label}</button>)}</nav><section className="ds-guidelines__template-config-fields">{configTab === 'basic' && <><div className="ds-guidelines__template-section-heading"><div><h3>基础参数</h3><span>设备识别与控制方式</span></div><ProductTag tone="neutral">已保存</ProductTag></div><ProductField label="设备名称" description="必填"><ProductTextInput defaultValue="MCR-01" /></ProductField><ProductField label="控制模式"><ProductSelect defaultValue="manual"><option value="manual">手动控制</option><option value="auto">自动控制</option></ProductSelect></ProductField></>}{configTab === 'network' && <><div className="ds-guidelines__template-section-heading"><div><h3>通信配置</h3><span>控制器与设备网络</span></div><ProductTag tone="success">已连接</ProductTag></div><ProductField label="控制器 IP"><ProductTextInput defaultValue="172.31.22.101" /></ProductField><ProductField label="通信端口"><ProductTextInput defaultValue="8080" /></ProductField></>}{configTab === 'safety' && <><div className="ds-guidelines__template-section-heading"><div><h3>安全限制</h3><span>运行范围与停机保护</span></div><ProductTag tone="warning">待复核</ProductTag></div><ProductField label="最大速度" description="mm/s"><ProductTextInput defaultValue="800" /></ProductField><ProductCheckbox label="安全门打开时禁止运行" defaultChecked /></>}</section><aside><h3>配置检查</h3><ProductTag tone={configTab === 'safety' ? 'warning' : 'success'}>{configTab === 'safety' ? '有 1 项待复核' : '校验通过'}</ProductTag><p>{configTab === 'safety' ? '发布前需复核最大速度限制。' : '所有必填参数已完成。'}</p></aside></main>}
      {topicKey === 'form-page' && <main className="ds-guidelines__template-form-page"><section><div className="ds-guidelines__template-section-heading"><div><h3>基本信息</h3><span>用于软件产品列表与版本管理</span></div><ProductTag tone="neutral">草稿</ProductTag></div><div className="ds-guidelines__template-form-grid"><ProductField label="软件产品名称" description="必填"><ProductTextInput defaultValue="墨影控制器驱动" /></ProductField><ProductField label="产品 Key" description="保存后不可修改"><ProductTextInput defaultValue="SW-EVEX-Y2R3" /></ProductField><ProductField label="产品类型"><ProductSelect defaultValue="driver"><option value="driver">控制器驱动</option></ProductSelect></ProductField><ProductField label="负责团队"><ProductSelect defaultValue="control"><option value="control">运动控制组</option></ProductSelect></ProductField><ProductField label="描述" description="0 / 200"><ProductTextArea defaultValue="机器人核心控制器软件，提供设备接入与运动控制能力。" /></ProductField></div></section></main>}
      {topicKey === 'dashboard-page' && <main className="ds-guidelines__template-dashboard"><div className="ds-guidelines__template-metrics">{[['在线设备', '18', '正常'], ['执行任务', '6', '2 项即将完成'], ['生产节拍', '4.2s', '较昨日 -0.3s'], ['今日告警', '2', '需处理']].map(([label, value, detail]) => <section key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></section>)}</div><section className="ds-guidelines__template-chart"><div className="ds-guidelines__template-widget-heading"><div><h3>设备运行趋势</h3><span>近 6 小时</span></div><Activity size={16} /></div><div aria-label="设备运行趋势图"><i /><i /><i /><i /><i /><i /></div><footer><span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span></footer></section><aside><div className="ds-guidelines__template-widget-heading"><div><h3>正在执行</h3><span>3 个设备</span></div><CircleCheck size={16} /></div><div className="ds-guidelines__template-status-list">{[['MCR-01', '搬运任务', '运行中'], ['AGV-02', '充电任务', '即将完成'], ['ARM-03', '装配任务', '待机']].map(([name, task, state]) => <div key={name}><span className="ds-guidelines__template-device-icon"><Box size={14} /></span><div><strong>{name}</strong><small>{task}</small></div><ProductTag tone={state === '运行中' ? 'success' : 'neutral'}>{state}</ProductTag></div>)}</div></aside></main>}
      {topicKey === 'editor-page' && <main className="ds-guidelines__template-editor"><nav><div className="ds-guidelines__template-widget-heading"><div><h3>组件库</h3><span>拖入画布</span></div><LayoutGrid size={16} /></div><button type="button"><GripVertical size={14} />状态卡片</button><button type="button"><GripVertical size={14} />任务列表</button><button type="button"><GripVertical size={14} />3D 视图</button></nav><section className="ds-guidelines__template-editor-workspace"><div className="ds-guidelines__template-editor-toolbar"><span>桌面端 · 12 列栅格</span><ProductButton size="small" type="outline" icon={<Plus size={13} />}>添加组件</ProductButton></div><div className="ds-guidelines__template-canvas"><div className="ds-guidelines__template-canvas-widget" data-selected="true"><header><span>设备状态</span><ProductTag tone="success">在线</ProductTag></header><strong>18 / 20</strong><small>设备运行正常</small><i /><span className="ds-guidelines__template-resize-handle" aria-hidden="true" /></div><div className="ds-guidelines__template-canvas-widget"><header><span>任务进度</span></header><strong>72%</strong><small>当前批次</small><i /></div></div></section><aside><div className="ds-guidelines__template-widget-heading"><div><h3>属性</h3><span>已选中：设备状态</span></div><Settings2 size={16} /></div><ProductField label="组件标题"><ProductTextInput defaultValue="设备状态" /></ProductField><ProductField label="数据源"><ProductSelect defaultValue="device"><option value="device">设备数据</option></ProductSelect></ProductField><ProductField label="刷新频率" description="秒"><ProductTextInput defaultValue="5" /></ProductField></aside></main>}
      {['config-page', 'form-page'].includes(topicKey) && <footer><ProductButton size="small">取消</ProductButton><ProductButton size="small" type="primary">保存</ProductButton></footer>}
    </div>
  </section>;
}

function PreviewDefinitionRows({ rows }: { rows: Array<[string, string]> }) {
  return <dl className="ds-guidelines__template-definitions">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
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

function normalizeComponentSearch(value: string) {
  return value.normalize('NFKC').trim().toLocaleLowerCase();
}

function isNumericComponentSearchTerm(term: string) {
  return /^\d+(?:\.\d+)?(?:px)?$/.test(term);
}

function getNumericValues(value: string) {
  return normalizeComponentSearch(value).match(/\d+(?:\.\d+)?/g) ?? [];
}

function numericValueMatches(value: string, term: string) {
  return value === term || value.startsWith(term);
}

function getComponentSearchScore(component: ComponentSpec, query: string) {
  const terms = query.split(/\s+/).filter(Boolean);
  const textFields = [
    { value: component.name, weight: 120 },
    { value: component.purpose, weight: 80 },
    { value: component.states.join(' '), weight: 70 },
    { value: component.tokens.join(' '), weight: 65 },
    { value: component.api.map(parameter => parameter.name).join(' '), weight: 60 },
    { value: component.whenToUse, weight: 40 },
    { value: component.avoid, weight: 28 },
    { value: component.rules.join(' '), weight: 24 },
    { value: component.a11y.join(' '), weight: 18 },
    { value: component.responsive, weight: 12 },
  ].map(field => ({ ...field, value: normalizeComponentSearch(field.value) }));
  const componentSizes = component.sizes.flatMap(getNumericValues);

  let score = 0;
  for (const term of terms) {
    if (isNumericComponentSearchTerm(term)) {
      const numericTerm = term.replace(/px$/, '');
      const exactSize = componentSizes.some(size => size === numericTerm);
      const prefixSize = componentSizes.some(size => size.startsWith(numericTerm));
      if (!exactSize && !prefixSize) return -1;
      score += exactSize ? 150 : 100;
      continue;
    }
    let termScore = -1;
    for (const field of textFields) {
      if (!field.value.includes(term)) continue;
      const words = field.value.split(/[^\p{L}\p{N}_-]+/u).filter(Boolean);
      const matchScore = field.value === term
        ? field.weight + 60
        : words.some(word => word === term)
          ? field.weight + 40
          : words.some(word => word.startsWith(term))
            ? field.weight + 20
            : field.weight;
      termScore = Math.max(termScore, matchScore);
    }
    if (termScore < 0) return -1;
    score += termScore;
  }
  return score;
}

function getComponentSearchContext(component: ComponentSpec, query: string) {
  const numericTerms = query.split(/\s+/).filter(isNumericComponentSearchTerm).map(term => term.replace(/px$/, ''));
  if (numericTerms.length > 0) {
    const matchedSizes = component.sizes.filter(size => getNumericValues(size).some(value => numericTerms.some(term => numericValueMatches(value, term))));
    return `匹配尺寸：${matchedSizes.map(formatComponentSize).join(' · ')}`;
  }
  return component.states.join(' · ');
}

function formatComponentSize(size: string) {
  return /^\d+(?:\.\d+)?$/.test(size) ? `${size}px` : size;
}

function createTokenSearchItems(source: unknown) {
  const results: TokenSearchItem[] = [];
  function visit(value: unknown, path: string[]) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([key, child]) => visit(child, [...path, key]));
      return;
    }
    if (typeof value !== 'string' && typeof value !== 'number') return;
    const tokenPath = path.join('.');
    const formattedValue = formatTokenSearchValue(value, path);
    results.push({
      path: tokenPath,
      label: path[path.length - 1] ?? tokenPath,
      value: formattedValue,
      numericValues: typeof value === 'number' || /^\d+(?:\.\d+)?(?:px|ms)?$/.test(String(value)) ? getNumericValues(String(value)) : [],
      topicKey: getTokenSearchTopic(path),
    });
  }
  visit(source, []);
  return results;
}

function formatTokenSearchValue(value: string | number, path: string[]) {
  if (typeof value === 'string') return value;
  const joinedPath = path.join('.').toLocaleLowerCase();
  if (/fontweight|lineheight|opacity|zindex|gridcolumns/.test(joinedPath)) return String(value);
  return `${value}px`;
}

function getTokenSearchTopic(path: string[]) {
  const joinedPath = path.join('.').toLocaleLowerCase();
  if (joinedPath.includes('typography')) return 'typography';
  if (joinedPath.includes('spacing')) return 'spacing';
  if (joinedPath.includes('radius')) return 'radius';
  if (joinedPath.includes('motion')) return 'motion';
  if (joinedPath.includes('zindex')) return 'layers';
  if (joinedPath.includes('icon')) return 'icons';
  if (joinedPath.includes('table')) return 'data-display';
  if (joinedPath.includes('layout')) return 'page-frame';
  if (joinedPath.includes('color') || joinedPath.includes('theme')) return 'colors';
  return 'design-tokens';
}

function getTokenSearchScore(token: TokenSearchItem, query: string) {
  const terms = query.split(/\s+/).filter(Boolean);
  const path = normalizeComponentSearch(token.path);
  const label = normalizeComponentSearch(token.label);
  const value = normalizeComponentSearch(token.value);
  let score = 0;
  for (const term of terms) {
    if (isNumericComponentSearchTerm(term)) {
      const numericTerm = term.replace(/px$/, '');
      const requiresPixels = term.endsWith('px');
      if (requiresPixels && token.value !== `${numericTerm}px`) return -1;
      const exact = token.numericValues.some(item => item === numericTerm);
      const prefix = !requiresPixels && token.numericValues.some(item => item.startsWith(numericTerm));
      if (!exact && !prefix) return -1;
      score += exact ? 170 : 110;
      continue;
    }
    if (label === term) score += 180;
    else if (label.startsWith(term)) score += 140;
    else if (path.includes(term)) score += 100;
    else if (value.includes(term)) score += 70;
    else return -1;
  }
  return score;
}

function createTopicSearchItems() {
  return GUIDE_GROUPS.flatMap(group => group.items.map(item => {
    const tokenDocument = TOKEN_DOCUMENTS[item.key];
    const excerpts = getGuidelineSections(item.key);
    const structuredNumericContent = [
      ...(tokenDocument?.parameters.flatMap(parameter => [parameter.value, parameter.description ?? '']) ?? []),
      tokenDocument?.description,
    ].filter(Boolean).join(' ');
    const content = [
      item.label,
      group.label,
      tokenDocument?.title,
      tokenDocument?.description,
      tokenDocument?.parameterTitle,
      ...(tokenDocument?.parameters.flatMap(parameter => [parameter.token, parameter.value, parameter.description ?? '']) ?? []),
      ...(tokenDocument?.rules ?? []),
      ...excerpts.flatMap(excerpt => [excerpt.title, excerpt.content]),
    ].filter(Boolean).join(' ');
    return {
      key: item.key,
      label: item.label,
      group: group.label,
      summary: tokenDocument?.description ?? excerpts[0]?.title ?? `${group.label}设计规范`,
      searchText: normalizeComponentSearch(content),
      structuredNumericText: normalizeComponentSearch(structuredNumericContent),
      numericValues: getNumericValues(content),
      structuredNumericValues: getNumericValues(structuredNumericContent),
    };
  }));
}

function getTopicSearchScore(topic: TopicSearchItem, query: string) {
  const terms = query.split(/\s+/).filter(Boolean);
  const label = normalizeComponentSearch(topic.label);
  const group = normalizeComponentSearch(topic.group);
  let score = 0;
  for (const term of terms) {
    if (isNumericComponentSearchTerm(term)) {
      const numericTerm = term.replace(/px$/, '');
      const requiresPixels = term.endsWith('px');
      const hasExactPixels = topic.searchText.includes(`${numericTerm}px`);
      const hasStructuredPixels = topic.structuredNumericText.includes(`${numericTerm}px`);
      const structuredExact = topic.structuredNumericValues.some(value => value === numericTerm);
      const structuredPrefix = !requiresPixels && topic.structuredNumericValues.some(value => value.startsWith(numericTerm));
      const exact = topic.numericValues.some(value => value === numericTerm);
      const prefix = !requiresPixels && topic.numericValues.some(value => value.startsWith(numericTerm));
      if ((requiresPixels && !hasExactPixels) || (!requiresPixels && !exact && !prefix)) return -1;
      score += hasStructuredPixels || structuredExact ? 250 : hasExactPixels || exact ? 150 : structuredPrefix ? 120 : 100;
      continue;
    }
    if (label === term) score += 260;
    else if (label.includes(term)) score += 220;
    else if (group === term) score += 180;
    else if (topic.searchText.includes(term)) score += 110;
    else return -1;
  }
  return score;
}

function getSearchResultName(result: GuidelineSearchResult) {
  if (result.kind === 'component') return result.component.name;
  if (result.kind === 'token') return result.token.path;
  return result.topic.label;
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
      <h3>Primary / Secondary / Danger 状态矩阵</h3>
      <p className="ds-guidelines__contract-description">每个状态均明确背景、文字、描边、图标、阴影、焦点环、光标、不透明度与过渡；图标继承当前文字色。</p>
      <div className="ds-guidelines__button-matrices">
        {stateMatrices.map(([variant, rows]) => <div className="ds-guidelines__button-matrix" key={variant}>
          <h4>{{ primary: 'Primary', secondary: 'Secondary', dangerSoft: 'Danger Soft', dangerSolid: 'Danger Solid' }[variant] ?? variant}</h4>
          <div className="ds-guidelines__button-matrix-scroll"><table><thead><tr>{['状态', 'Background', 'Text', 'Border', 'Icon', 'Shadow', 'Focus ring', 'Cursor', 'Opacity', 'Transition'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.state}><td>{row.state}</td>{(['background', 'text', 'border', 'icon', 'shadow', 'focusRing', 'cursor', 'opacity', 'transition'] as const).map(key => <td key={`${row.state}-${key}`}><strong>{row.rendered[key]}</strong></td>)}</tr>)}</tbody></table></div>
        </div>)}
      </div>
    </section>
    <section className="ds-guidelines__contract-section ds-guidelines__contract-section--two-column">
      <div><h3>内部规格</h3><div className="ds-guidelines__button-metrics">{button.metrics.map(metric => <div key={metric.label}><strong>{metric.label}</strong><span>{metric.value}</span></div>)}</div></div>
      <div><h3>内容结构</h3><div className="ds-guidelines__button-structures">{button.contentStructures.map(item => <div key={item.name}><strong>{item.name}</strong><ButtonContentStructurePreview name={item.name} /><code>{item.example}</code></div>)}</div></div>
    </section>
    <section className="ds-guidelines__contract-section ds-guidelines__contract-section--two-column">
      <div><h3>内容与溢出规则</h3><DocumentRules rules={button.contentRules} /></div>
      <div><h3>Selected 边界</h3><p className="ds-guidelines__contract-description">{button.selectedBoundary}</p><p className="ds-guidelines__contract-description">保存、创建、刷新使用 Button；网格／列表视图、吸附开启等持续选择使用 ToggleButton。</p></div>
    </section>
  </>;
}

function ButtonContentStructurePreview({ name }: { name: string }) {
  if (name === '前置图标 + 文字') return <ProductButton size="small" type="text" icon={<Plus size={14} />}>新建</ProductButton>;
  if (name === '文字 + 后置图标') return <ProductButton size="small" type="text" trailingIcon={<ChevronRight size={14} />}>查看更多</ProductButton>;
  if (name === '纯图标') return <ProductIconButton size="small" icon={<ClipboardCopy size={14} />} aria-label="复制" tooltip="复制" />;
  if (name === 'Loading 图标 + 文字') return <ProductButton size="small" type="text" loading>保存中</ProductButton>;
  return <ProductButton size="small" type="text">保存</ProductButton>;
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

function SearchInputStylePreview() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const items = [
    { name: '人形双足机器人', status: 'draft' },
    { name: '四足巡检机器人', status: 'published' },
    { name: '机械臂控制器', status: 'published' },
  ];
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const results = items.filter(item => item.name.toLocaleLowerCase().includes(normalizedQuery) && (status === 'all' || item.status === status));
  const reset = () => { setQuery(''); setStatus('all'); };

  return <div className="ds-guidelines__component-search">
    <div className="ds-guidelines__component-search-controls">
      <div className="ds-guidelines__component-query">
        <Search size={16} aria-hidden="true" />
        <input value={query} onChange={event => setQuery(event.target.value)} aria-label="搜索型号" placeholder="搜索型号名称" />
        {query && <button type="button" aria-label="清除搜索" onClick={() => setQuery('')}><X size={14} /></button>}
      </div>
      <div className="ds-guidelines__component-filter"><ProductSelect aria-label="发布状态" value={status} onChange={event => setStatus(event.target.value)}><option value="all">全部状态</option><option value="published">已发布</option><option value="draft">未发布</option></ProductSelect></div>
      <ProductButton onClick={reset}>重置</ProductButton>
    </div>
    <div className="ds-guidelines__component-live-results" aria-live="polite">
      <span>{normalizedQuery ? `找到 ${results.length} 条结果` : `共 ${results.length} 条结果`}</span>
      <div>{results.length > 0 ? results.map(item => <strong key={item.name}>{item.name}<ProductTag tone={item.status === 'published' ? 'success' : 'neutral'} size="small">{item.status === 'published' ? '已发布' : '未发布'}</ProductTag></strong>) : <div className="ds-guidelines__component-filter-empty"><Search size={20} aria-hidden="true" /><b>未找到匹配结果</b><small>可调整搜索词、筛选条件或重置</small><ProductButton size="small" onClick={reset}>重置条件</ProductButton></div>}</div>
    </div>
  </div>;
}

function ComponentStylePreview({ componentName }: { componentName: string }) {
  if (componentName === 'Button') return <div className="ds-guidelines__component-style-preview"><ProductButton type="primary">保存</ProductButton><ProductButton>次要操作</ProductButton><ProductButton type="outline">工具操作</ProductButton><ProductButton type="primary" status="danger">删除</ProductButton><ProductButton disabled>禁用</ProductButton><ProductButton type="primary" loading aria-busy="true">保存</ProductButton></div>;
  if (componentName === 'ToggleButton') return <div className="ds-guidelines__component-style-preview"><ProductToggleButton selected={false}>列表视图</ProductToggleButton><ProductToggleButton selected>网格视图</ProductToggleButton><ProductToggleButton selected={false} disabled>吸附开启</ProductToggleButton></div>;
  if (componentName === 'IconToggleButton') return <div className="ds-guidelines__component-style-preview"><ProductIconToggleButton selected={false} icon={<ClipboardCopy size={16} />} aria-label="复制模式" /><ProductIconToggleButton selected icon={<Sparkles size={16} />} aria-label="吸附开启" /><ProductIconToggleButton selected={false} disabled icon={<X size={16} />} aria-label="关闭面板" /></div>;
  if (componentName === 'IconButton') return <div className="ds-guidelines__component-style-preview"><ProductIconButton icon={<ClipboardCopy size={16} />} aria-label="复制" tooltip="复制" /><ProductIconButton icon={<Check size={16} />} aria-label="确认" tooltip="确认" /><ProductIconButton icon={<Sparkles size={16} />} aria-label="更多操作" tooltip="更多操作" disabled /></div>;
  if (componentName === 'Tag') return <div className="ds-guidelines__component-style-preview"><ProductTag tone="neutral">草稿</ProductTag><ProductTag tone="accent">重点</ProductTag><ProductTag tone="success">已完成</ProductTag><ProductTag tone="warning">需关注</ProductTag><ProductTag tone="danger">失败</ProductTag></div>;
  if (componentName === 'Tabs') return <div className="ds-status-tabs ds-guidelines__component-tabs-preview" role="tablist" aria-label="Tab 样式预览"><button className="ds-status-tab" type="button" role="tab" aria-selected="true">枚举取值</button><button className="ds-status-tab" type="button" role="tab" aria-selected="false">级联配置</button></div>;
  if (componentName === 'Menu / Dropdown') return <div className="ds-context-menu ds-guidelines__component-menu" role="menu" aria-label="节点操作"><button className="ds-context-menu__item" type="button" role="menuitem"><Plus size={15} />新增</button><button className="ds-context-menu__item" type="button" role="menuitem"><Pencil size={15} />编辑</button><button className="ds-context-menu__item" data-variant="destructive" type="button" role="menuitem"><Trash2 size={15} />删除</button></div>;
  if (componentName === 'Input / TextArea') return <div className="ds-guidelines__component-inputs ds-guidelines__component-input-demo"><ProductField label="默认字段"><ProductTextInput placeholder="请输入名称" /></ProductField><ProductField label="错误字段" hint="名称不能为空" status="error"><ProductTextInput aria-invalid="true" defaultValue="" placeholder="请输入名称" /></ProductField></div>;
  if (componentName === 'SearchInput / SearchBar') return <SearchInputStylePreview />;
  if (componentName === 'InputNumber') return <div className="ds-guidelines__component-number"><label>并发数量<div><button type="button" aria-label="减少"><Minus size={14} /></button><input type="number" aria-label="并发数量" defaultValue="8" /><span>台</span><button type="button" aria-label="增加"><Plus size={14} /></button></div></label><label>禁用<div data-disabled="true"><button type="button" aria-label="减少"><Minus size={14} /></button><input type="number" aria-label="禁用数量" defaultValue="0" disabled /><span>秒</span><button type="button" aria-label="增加"><Plus size={14} /></button></div></label></div>;
  if (componentName === 'Select') return <div className="ds-guidelines__component-inputs"><ProductField label="发布状态"><ProductSelect defaultValue="draft"><option value="draft">未发布</option><option value="published">已发布</option></ProductSelect></ProductField><ProductField label="禁用字段"><ProductSelect defaultValue="draft" disabled><option value="draft">未发布</option></ProductSelect></ProductField></div>;
  if (componentName === 'DateTimePicker') return <div className="ds-guidelines__component-inputs ds-guidelines__component-date-time"><ProductField label="计划开始时间" description="Asia/Shanghai"><ProductDateTimePicker aria-label="计划开始时间" /></ProductField><ProductField label="禁用时间"><ProductDateTimePicker aria-label="禁用时间" disabled /></ProductField></div>;
  if (componentName === 'Tree') return <div className="taxonomy-tree ds-guidelines__component-tree" aria-label="产品目录 Tree 样式预览"><section className="taxonomy-tree-section"><div className="taxonomy-tree-node taxonomy-tree-category"><button type="button" className="taxonomy-tree-category-main" aria-expanded="true"><span className="taxonomy-tree-folder"><Folder size={18} strokeWidth={1.8} /></span><span>控制器类产品</span><ChevronDown className="taxonomy-tree-expand-icon" size={18} /></button></div><div className="taxonomy-tree-category-children"><div className="taxonomy-tree-subcategory-branch"><div className="taxonomy-tree-node taxonomy-tree-subcategory"><button type="button" className="taxonomy-tree-subcategory-main" aria-expanded="true"><ChevronDown size={16} /><span>控制器</span></button></div><div className="taxonomy-tree-brand-list"><div className="taxonomy-tree-node product-tree-item is-selected"><button type="button" className="product-tree-main"><span className="product-tree-dot" aria-hidden="true" /><span>墨影控制器</span></button></div><div className="taxonomy-tree-node product-tree-item"><button type="button" className="product-tree-main"><span className="product-tree-dot" aria-hidden="true" /><span>仙工控制器</span></button></div></div></div><div className="taxonomy-tree-subcategory-branch"><div className="taxonomy-tree-node taxonomy-tree-subcategory"><button type="button" className="taxonomy-tree-subcategory-main" aria-expanded="false"><ChevronRight size={16} /><span>机械臂</span></button></div></div></div></section></div>;
  if (componentName === 'Checkbox') return <div className="ds-guidelines__component-checkboxes"><ProductCheckbox label="默认未选中" /><ProductCheckbox label="已选中" defaultChecked /><ProductCheckbox label="部分选中" indeterminate /><ProductCheckbox label="已禁用" defaultChecked disabled /></div>;
  if (componentName === 'Radio') return <div className="ds-guidelines__component-radios" role="radiogroup" aria-label="发布方式"><label><input type="radio" name="guide-radio" defaultChecked />草稿保存</label><label><input type="radio" name="guide-radio" />立即发布</label><label><input type="radio" name="guide-radio" disabled />定时发布</label></div>;
  if (componentName === 'Switch') return <div className="ds-guidelines__component-switches"><label>启用自动同步<button type="button" role="switch" aria-checked="true"><i /></button></label><label>允许公开访问<button type="button" role="switch" aria-checked="false"><i /></button></label><label>同步中<button type="button" role="switch" aria-checked="true" disabled><i /></button></label></div>;
  if (componentName === 'Upload') return <div className="ds-guidelines__component-upload"><ProductUploadBox title="上传配置文件" description="支持 .json，最大 20MB" accept=".json" onFileChange={() => undefined} /><div><span>robot-model.json</span><ProductTag tone="success">上传完成</ProductTag><ProductButton type="text" size="small">移除</ProductButton></div></div>;
  if (componentName === 'Table') return <TableStylePreview />;
  if (componentName === 'Pagination') return <nav className="ds-guidelines__component-pagination" aria-label="结果分页"><button type="button" disabled>‹</button><button type="button">1</button><button type="button" aria-current="page">2</button><button type="button">3</button><span>…</span><button type="button">12</button><button type="button">›</button><small>共 240 条</small></nav>;
  if (componentName === 'Modal') return <ModalStylePreview />;
  if (componentName === 'Drawer') return <div className="ds-guidelines__component-drawer"><div><strong>组件类型</strong><span>查看字段、枚举取值与级联配置</span></div><section><small>类型字段</small><p>组件类型</p><p>子类型</p><p>规格</p></section><footer><ProductButton size="small">关闭</ProductButton></footer></div>;
  if (componentName === 'Tooltip / Popover') return <div className="ds-guidelines__component-popover"><ProductIconButton icon={<ClipboardCopy size={16} />} aria-label="复制链接" tooltip="复制链接" /><div><strong>复制链接</strong><span>复制当前型号的访问地址</span></div></div>;
  if (componentName === 'Toast / Notification') return <ToastNotificationPreview />;
  if (componentName === 'ContentState (Empty / Loading / Error)') return <ContentStateStylePreview />;
  return <div className="ds-guidelines__component-empty"><div aria-hidden="true">—</div><strong>暂无数据</strong><span>可调整筛选条件或创建第一条数据。</span><ProductButton size="small" type="primary">新建</ProductButton></div>;
}

function ContentStateStylePreview() {
  const [state, setState] = useState<'loading' | 'empty' | 'error' | 'success'>('loading');
  return <div className="ds-guidelines__preview-stack">
    <div className="ds-guidelines__component-style-preview" role="tablist" aria-label="内容状态示范">
      {(['loading', 'empty', 'error', 'success'] as const).map(item => <ProductToggleButton key={item} size="small" role="tab" selected={state === item} aria-selected={state === item} onClick={() => setState(item)}>{item === 'loading' ? '加载中' : item === 'empty' ? '空状态' : item === 'error' ? '错误' : '成功'}</ProductToggleButton>)}
    </div>
    <div className="ds-guidelines__component-empty" aria-live="polite" aria-busy={state === 'loading'}>
      {state === 'loading' ? <><div><ProductIconButton type="text" loading aria-label="正在加载" /></div><strong>正在加载型号</strong><span>保留已有布局与内容，完成后原位更新。</span></> : state === 'empty' ? <><div aria-hidden="true">—</div><strong>尚未创建型号</strong><span>创建第一个型号后，可在此管理配置。</span><ProductButton type="primary">新建型号</ProductButton></> : state === 'error' ? <><div aria-hidden="true"><CircleAlert size={20} /></div><strong>型号加载失败</strong><span>网络连接异常，检查连接后可重新加载。</span><ProductButton type="secondary" status="danger">重试</ProductButton></> : <><div aria-hidden="true"><Check size={20} /></div><strong>型号加载完成</strong><span>共加载 12 个型号。</span></>}
    </div>
  </div>;
}

type ModalPreviewKind = 'notice' | 'warning' | 'danger';

const MODAL_PREVIEWS: Record<ModalPreviewKind, { label: string; title: string; description: string; confirm: string; status: 'normal' | 'warning' | 'danger'; danger?: boolean }> = {
  notice: { label: '提示', title: '取消发布型号', description: '取消发布后，型号将恢复为可编辑状态；后续修改不会自动同步到已发布版本。', confirm: '确认取消发布', status: 'normal' },
  warning: { label: '警示', title: '关闭编辑', description: '当前修改尚未保存。继续关闭将丢失本次编辑内容。', confirm: '仍然关闭', status: 'warning' },
  danger: { label: '删除', title: '删除机器人型号', description: '删除后，型号的拓扑结构、外设配置与导出配置会一并移除，且无法恢复。', confirm: '删除型号', status: 'danger', danger: true },
};

function ModalStylePreview({ initialKind = 'notice', showVariants = true, title, description, confirm }: { initialKind?: ModalPreviewKind; showVariants?: boolean; title?: string; description?: string; confirm?: string }) {
  const [kind, setKind] = useState<ModalPreviewKind>(initialKind);
  const preview = MODAL_PREVIEWS[kind];
  const displayPreview = { ...preview, title: title ?? preview.title, description: description ?? preview.description, confirm: confirm ?? preview.confirm };

  return <div className="ds-guidelines__component-modal-stage">
    {showVariants && <div className="ds-guidelines__component-modal-variants" role="tablist" aria-label="弹窗类型">
      {Object.entries(MODAL_PREVIEWS).map(([key, item]) => <button key={key} type="button" role="tab" aria-selected={kind === key} onClick={() => setKind(key as ModalPreviewKind)}>{item.label}</button>)}
    </div>}
    <section className="arcoui-modal-content ds-guidelines__component-modal" data-status={displayPreview.status} aria-label={`${displayPreview.label}弹窗示例`}>
      <div className="arcoui-modal-header">
        <div className="arcoui-modal-title-area"><strong className="arcoui-modal-title">{displayPreview.title}</strong></div>
        <ProductIconButton type="text" size="small" icon={<X size={15} />} aria-label="关闭" tooltip="关闭" className="arcoui-modal-close" />
      </div>
      <div className="arcoui-modal-body"><p>{displayPreview.description}</p></div>
      <div className="arcoui-modal-footer"><ProductButton>取消</ProductButton><ProductButton type="primary" status={displayPreview.danger ? 'danger' : 'normal'}>{displayPreview.confirm}</ProductButton></div>
    </section>
  </div>;
}

function ToastNotificationPreview() {
  return <div className="ds-guidelines__component-toast-list" aria-label="消息提示示例">
    <div className="ds-global-notice" data-kind="toast" data-layout="single" data-tone="success" role="status" aria-live="polite"><span className="ds-global-notice__indicator"><Check size={16} /></span><strong className="ds-global-notice__message">保存成功</strong><ProductIconButton type="text" size="small" icon={<X size={14} />} aria-label="关闭提示" tooltip="关闭提示" className="ds-global-notice__close" /></div>
    <div className="ds-global-notice" data-kind="toast" data-layout="two-line" data-tone="warning" role="status" aria-live="polite"><span className="ds-global-notice__indicator"><CircleAlert size={16} /></span><span className="ds-global-notice__content"><strong>存在待处理项</strong><small>请完成必填参数后再发布型号</small></span><ProductIconButton type="text" size="small" icon={<X size={14} />} aria-label="关闭提示" tooltip="关闭提示" className="ds-global-notice__close" /></div>
    <div className="ds-global-notice" data-kind="notification" data-tone="danger" role="alert"><span className="ds-global-notice__indicator"><CircleAlert size={16} /></span><span className="ds-global-notice__content"><strong>保存失败</strong><small>网络连接异常，检查连接后可重新保存</small></span><ProductButton type="secondary" status="danger" size="small" className="ds-global-notice__action">重试</ProductButton></div>
    <div className="ds-global-notice" data-kind="toast" data-layout="two-line" data-tone="info" role="status" aria-live="polite"><span className="ds-global-notice__indicator"><Info size={16} /></span><span className="ds-global-notice__content"><strong>正在导出</strong><small>任务将在完成后通知你</small></span></div>
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
  if (kind === 'motion') return <MotionStylePreview />;
  return <section className="ds-guidelines__style-preview"><strong>布局样式预览</strong><div className="ds-guidelines__layout-preview"><i /><i /><i /><i /><i /><i /></div></section>;
}

function MotionStylePreview() {
  const [selected, setSelected] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [overlayReplay, setOverlayReplay] = useState(0);
  const [drawerReplay, setDrawerReplay] = useState(0);
  const [toastReplay, setToastReplay] = useState(0);
  return <section className="ds-guidelines__style-preview">
    <strong>动效样式预览</strong>
    <div className="ds-guidelines__motion-preview">
      <article>
        <header><b>Hover / Pressed</b><code>fast · 120ms</code></header>
        <ProductButton className="ds-guidelines__motion-control">悬停或按下</ProductButton>
        <small>颜色、边框与阴影立即反馈，不改变控件尺寸。</small>
      </article>
      <article>
        <header><b>状态切换</b><code>mid · 160ms</code></header>
        <ProductToggleButton selected={selected} onClick={() => setSelected(value => !value)}>{selected ? '已选' : '未选'}</ProductToggleButton>
        <small>Selected、Checked 等持续状态使用 ease-in-out。</small>
      </article>
      <article>
        <header><b>浮层进入</b><code>slow · 240ms</code></header>
        <div className="ds-guidelines__motion-overlay" key={overlayReplay}><span>Popover / Modal</span></div>
        <ProductButton className="ds-guidelines__motion-replay" size="small" type="text" onClick={() => setOverlayReplay(value => value + 1)}>重新播放</ProductButton>
      </article>
      <article>
        <header><b>Loading</b><code>loading · 800ms</code></header>
        <ProductButton type="primary" loading aria-busy="true">保存</ProductButton>
        <small>直接使用 Button Loading；文案、颜色与宽度在前后保持不变。</small>
      </article>
      <article>
        <header><b>展开 / 收起</b><code>mid · 160ms</code></header>
        <div className="ds-guidelines__motion-collapse" data-expanded={expanded}>
          <ProductButton type="text" long aria-expanded={expanded} trailingIcon={<ChevronDown size={14} />} onClick={() => setExpanded(value => !value)}>高级配置</ProductButton>
          <div><p>限位、速度与安全参数</p></div>
        </div>
        <small>高度与透明度协同变化；箭头同步旋转。</small>
      </article>
      <article>
        <header><b>Drawer 进入</b><code>slow · 240ms</code></header>
        <div className="ds-guidelines__motion-stage" key={drawerReplay}><aside><b>参数详情</b><span>从操作来源方向进入</span></aside></div>
        <ProductButton className="ds-guidelines__motion-replay" size="small" type="text" onClick={() => setDrawerReplay(value => value + 1)}>重新播放</ProductButton>
      </article>
      <article>
        <header><b>Toast / Notification</b><code>slow · 240ms</code></header>
        <div className="ds-guidelines__motion-toast" key={toastReplay}><CircleCheck size={16} /><span><b>保存成功</b><small>配置已同步</small></span></div>
        <ProductButton className="ds-guidelines__motion-replay" size="small" type="text" onClick={() => setToastReplay(value => value + 1)}>重新播放</ProductButton>
      </article>
      <article>
        <header><b>Skeleton</b><code>loading · 800ms</code></header>
        <div className="ds-guidelines__motion-skeleton" aria-label="内容加载中"><i /><span><i /><i /></span></div>
        <small>仅在等待超过 300ms 时出现，形状对应真实内容。</small>
      </article>
    </div>
    <p className="ds-guidelines__motion-reduced">系统启用“减少动效”后，位移、缩放和旋转停止，状态与文案仍然完整可见。</p>
  </section>;
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
