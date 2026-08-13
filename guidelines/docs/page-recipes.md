# 数字造机页面 Recipe

Recipe 是基础组件之上的产品级组合契约。新页面先选择 Recipe，再填充业务字段；不得从空白容器自行组合页面结构。

## 1. CRUD 交互决策表

| 用户任务 | 默认承载方式 | 禁止做法 |
| --- | --- | --- |
| 新增、编辑短表单 | `ProductModal` | 替换列表、在行内展开完整表单。 |
| 查看单对象详情 | `ProductDrawer` | 为轻量查看跳转整页或自建侧拉层。 |
| 连续查看多条对象 | Drawer 保留列表上下文 | 关闭列表或重置查询条件。 |
| 长表单、跨分组编辑 | `.ds-page--form` 独立页面 | 将超长表单塞入小弹窗。 |
| 多步骤导入、发布 | `.ds-page--workflow` 或大 Modal | 单击上传后直接完成且无校验反馈。 |
| 删除、不可逆变更 | Danger 确认 Modal | 仅 Toast 提示或直接执行。 |
| 少量辅助操作 | Popover / Dropdown | 用 Popover 承载长表单。 |
| 短暂操作结果 | Toast | 用深色统一背景表达所有语义。 |

## 2. 标准管理列表页

```text
.ds-page.ds-page--list
├── Header：标题＋12px 说明；右侧页面操作
└── TableSurface
    ├── Toolbar：搜索、筛选、结果数（提交时机见 §13.2）
    ├── TableScroll：表头＋数据行
    └── Pagination：总数、页码、每页数量
```

- Header 标题 20px / 600；说明 12px；主操作数量与操作区边界见 `ui-guidelines.md` §13.1.1。
- Toolbar 控件高 40px；搜索建议宽 312px；结果数靠右。
- 搜索、防抖、筛选提交与重置行为统一见 `ui-guidelines.md` §13.2。
- Current 表头高 44px，数据行高 60px，单元格水平内边距 16px。
- 主标识可使用文本链接；同单元格次级说明统一使用 12px / 400 的 `--ds-table-cell-secondary-color`，不得使用未发布的 11px 字号或 Disabled 灰。
- 操作列宽度、固定、收敛与 IconButton 规则统一见 `ui-guidelines.md` §15.1。
- 查看使用“眼睛/详情”图标，编辑使用“铅笔”图标，删除使用 Danger 图标按钮；均需 Tooltip 与 `aria-label`。
- 状态使用无描边 `ProductTag`，不得把 Tag 做成按钮或仅依赖颜色表达。
- 宽表只在 TableScroll 内横向滚动，按“非核心列 → 低优先级列 → 固定主列/操作列 → 横滚”收敛。

## 3. Modal 新增与编辑

- 使用 `ProductModal`，短表单选 `md/lg`，字段较多但仍为单任务时可用 `xl`。
- Header / Body / Footer 结构、自然高度与滚动见 `ui-guidelines.md` §3.2；Footer 主操作见 §13.1.1。
- 表单默认两列；字段与分组间距、Section 标题统一见 `ui-guidelines.md` §14.1。
- 字段必须由 `ProductField` 组织，顺序为 Label → Control → Hint/Error。
- 关闭存在未保存修改的表单前必须确认（见 §27.17 未保存离开保护统一契约）；保存 Loading 不得清空字段或改变按钮宽度。

## 4. Drawer 详情

- 查看详情使用 `ProductDrawer`；默认 420px，复杂详情可使用 `min(760px, calc(100vw - 48px))`。
- Header 显示对象标识和摘要；状态 Tag 放在 Body 首组或 Header 描述附近。
- Body 按“基础信息、业务信息、明细、操作日志”分组；滚动结构统一见 `ui-guidelines.md` §3.2。
- Footer 默认放关闭；可编辑对象可增加次要操作，主操作数量见 `ui-guidelines.md` §13.1.1。
- Drawer 内进入执行追踪等二级详情时，保留 Drawer 外壳并提供明确返回入口，不再叠加第二个 Drawer。
- **Drawer Body 内容加载失败时**：保留 Drawer 壳，Body 居中显示错误说明（不显示接口原始报错）和“重试”按钮；对象已被删除时说明“内容已删除”并提供关闭入口；Footer 关闭按钮始终可用。
- 抽屉关闭后的焦点返回见 `ui-guidelines.md` §16.0；列表查询、选择与滚动上下文恢复见 §27.22。

## 5. 表单与选择器

- 文本使用 `ProductTextInput`，预定义选项使用 `ProductSelect`，数值使用批准的 InputNumber，日期时间使用批准的 DateTimePicker。
- 业务页面禁止原生 `<select>`、私有下拉浮层和私有 Focus 样式。
- Select 的 Open、Selected、Disabled、Error 与弹窗层级必须由正式组件处理。
- 二选一且需比较时使用 Radio；立即生效的独立布尔值使用 Switch；统一提交的多选值使用 Checkbox。

## 6. 导入流程

- 选择文件后展示文件名、解析状态、重复数量、失败行数和可下载错误原因。
- 映射、预览、确认属于多步骤任务时使用 Workflow；步骤切换前校验当前步骤。
- 导入结果区分全部成功、部分成功和失败，不用单一“上传成功”覆盖解析结果。
- 关闭流程后列表保留原筛选，并仅刷新受影响结果。

## 7. 参考页面

| 模式 | 参考实现 |
| --- | --- |
| 简单列表＋Modal | 软件产品管理 |
| 宽表格＋固定操作列 | 装机记录管理 |
| Drawer 详情与子级切换 | 字典配置管理 |
| Modal 表单＋Drawer 连续配置 | 构型模板管理 |
| 产品外壳与全局导航 | 数字造机 AppShell |
