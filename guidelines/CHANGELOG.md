# 变更记录

本文件是设计规范发布历史的唯一记录。版本遵循语义化版本：

- Major：删除或改变既有 Token、组件参数或行为，前端必须迁移。
- Minor：新增向后兼容的 Token、组件、模板或规则。
- Patch：不改变契约的文字澄清、错误修正或示例更新。

## 1.5.0 — 2026-07-30

- 正式发布产品级 Drawer 组件，用于不离开列表上下文的详情与连续配置。
- Drawer 统一复用浮层遮罩、焦点限制、关闭逻辑、层级、圆角与阴影 Token。
- 明确 Drawer 固定 Header/Footer、仅 Body 滚动，并补充窄屏近全屏响应规则。

## 1.4.0 — 2026-07-28

- 工业风新增钢铁蓝、品牌紫、石墨灰三套独立主题色，默认使用钢铁蓝。
- 工业主题色与 Current、Style、Light/Dark 分开保存，切换不修改初始 UI。
- Ant Design 映射新增 `industrialColorTheme` 参数。
- 钢铁蓝主题改为冷白蓝灰层级，减少大面积中性灰；Primary、Default、Secondary、Danger、Input 与 Table 增加明确的 B 端组件边界。
- Industrial 页面外边距收敛为 12px、模块间距收敛为 8px；Current 间距保持不变。
- Industrial 首页预览与固定分栏工作区改为无缝应用框架，一级区域取消外部留白、间距和圆角，统一通过 1px 分割线连接。
- Industrial 无缝框架扩展到列表、配置、设计规范、首页编辑器、型号与组件工作区；一级页面外边距和模块间距统一为 0。
- 原“设备蓝”主题更名为“品牌紫”，Light 主色改为产品品牌色 `#241F7D`；页面背景、容器、边框和正文继续沿用钢铁蓝工业主题的中性灰白层级，品牌紫仅用于主操作、选中、Focus 与设备蓝色部件。
- 修正 Industrial 将零间距误用于内容层的问题：列表表格恢复 16px 水平安全边距，组件配置与表单卡片恢复 12px 栅格和 6px 圆角，消除相邻边框形成的双线。
- Industrial Light 的三套主题统一使用 `#F0F0F0` 页面底色；纯白内容容器、主题强调色和设备信号色保持独立。
- Industrial 3D 预览改为独立近黑 Scene Scope（基准 `#101316`），Light / Dark 均保持暗色画布，并同步提升遥测文字、HUD、网格与坐标轴对比度。
- 降低 Industrial 普通描边与结构分隔线对比度，建立 `border / borderStrong` 两级层次；Focus、选中与错误状态仍保留明确强调。
- 进一步弱化首页工作区分隔线，并将选中方案卡片从 2px 深色框改为 1px 混合强调框；普通删除按钮统一为危险浅底、红色文字和轻红描边。

## 1.3.0 — 2026-07-28

- 新增不覆盖默认外观的 `current / industrial` 风格预设契约。
- 首次发布 Industrial Light / Dark：冷灰明亮主题、近黑暗色主题、钢灰蓝界面交互与橙色设备信号、小圆角、紧凑表格与低阴影规则。
- 工业预设状态为 Experimental；风格与明暗主题可独立切换。

## 1.2.0 — 2026-07-22

- 发布 SearchInput / SearchBar、Radio、Switch、InputNumber、Pagination 组件契约。
- 补齐内容文案规范。

## 1.1.9 — 2026-07-22

- 发布图标来源、线性风格、尺寸、描边、颜色、方向与自定义 SVG 约束。

## 1.1.8 — 2026-07-22

- 发布 Button Primary / Secondary 完整状态矩阵、内部规格和内容结构。
- 明确 ToggleButton / IconToggleButton 与普通 Button 的边界。

## 1.1.7 — 2026-07-21

- 发布基础组件完整契约：使用边界、参数、状态、Token、无障碍、响应式、示例与验收项。

## 1.1.6 — 2026-07-21

- 发布 Checkbox 选中态 Token、反白勾选、禁用态映射与验收规则。

## 1.1.5 — 2026-07-21

- 发布弹窗内 Select / Popover 嵌套层级 Token。

## 1.1.4 — 2026-07-21

- 发布前端 Token JSON、Ant Design 主题映射示例与交付说明。

## 1.1.3 — 2026-07-21

- 发布动效 Token、八类动效场景、减弱动效与验收规则。

## 1.1.2 — 2026-07-21

- 补齐页面模板、业务组合、页面级状态和响应式/溢出规则。

## 1.1.1 — 2026-07-21

- 补齐 Success / Readonly Token 与控件实现要求。
- 明确 Button Pressed、Tab 键盘切换和状态命名。

## 1.1.0 — 2026-07-21

- 新增 Pressed / Selected 状态模型。
- 发布 Button、Input、Select、Table、Tabs、Menu 组件 Token。
- 增加表单、表格、浮层、版本治理与静态验收规则。
