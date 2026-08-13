# 前端接入清单

## 1. 接入顺序

1. 导入并解析 `tokens/design-tokens.json`，完整映射 Light/Dark 和 Current。
   `tokens/design-tokens-resolved.md` 仅用于查值与评审，不能替代 JSON 或被手工修改。
2. 按 `runtime/product-ui-manifest.json` 建立唯一 ProductUI 入口。
3. 实现 `patterns/product-patterns.json` 中的 ProductShell。
4. 实现管理列表、Modal 表单、Drawer 详情和导入流程参考页面。
5. 接入静态审计、组件测试、键盘测试与视觉回归。
6. 通过本清单后再开始业务页面。

## 2. 组件完成定义

每个正式组件必须同时具备：

- ProductUI 唯一导出；
- API、状态、Token、键盘行为和响应式契约；
- Light/Dark；
- Default、Hover、Pressed、Focus、Disabled，以及组件适用的 Selected/Open/Loading/Error；
- 单元测试或交互测试；
- 基准页面中的视觉回归覆盖。

缺少其中任何一项时标记为 Pending，业务页面不能自行补一个“临时版本”。

1.7.0 已发布 Tree、Table、DateTimePicker、Steps、ContentState 设计契约；在 `runtime/product-ui-manifest.json` 标记为 `publishedContractsRuntimePending` 的能力仍须完成 ProductUI 正式导出后才可视为 Stable。

## 3. 新页面 Definition of Done

- [ ] 使用 ProductShell，没有第二套侧栏或顶栏。
- [ ] 明确选择一个页面 Recipe。
- [ ] 默认使用 Current，没有按业务名称推断 Industrial。
- [ ] 页面 Header 只有一个 Primary。
- [ ] 表格行高、单元格边距和操作列符合规范。
- [ ] 查看使用 Drawer；短新增/编辑使用 Modal。
- [ ] 只从批准的 ProductUI 入口导入基础组件。
- [ ] 没有原生业务 Select、私有 Modal/Drawer/Toast 或任意 z-index。
- [ ] 覆盖 Loading、Empty、Filtered Empty、Error 和权限状态。
- [ ] Light/Dark、桌面、Pad、窄屏和键盘操作通过。
- [ ] 静态审计无阻断项，视觉回归差异已评审。
- [ ] Token 引用、已解析文档同步、主按钮/表头/状态文字对比度校验通过。

## 4. Industrial 使用审批

Industrial 不是制造业页面的默认风格。只有设备实时监控、3D 场景、遥测和明确提出工业预设的页面可以启用，并需在评审中记录理由、作用域和退出 Current 后的回退行为。
