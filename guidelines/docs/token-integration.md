# Design Tokens 交付说明

`tokens/design-tokens.json` 是前端接入的唯一 Token 源；它给出了 light / dark 两套完整语义色、可选风格预设，以及共享的字体、间距、圆角、透明度、动效、层级、布局、控件、状态和组件 Token。

数字造机现有工程的组件实现入口与组合方式见 `docs/product-ui-mapping.md`，产品外壳及页面级组合分别见 `docs/product-shell.md` 和 `docs/page-recipes.md`。Token 只决定数值与语义，不能替代这些实现和组合契约。

`adapters/ant-design-theme.ts` 是 Ant Design 主题映射示例。应用根部按当前主题、风格和工业主题色调用 `createProductTheme(mode, preset, industrialColorTheme)` 并传入主题提供者即可；业务页面不得再写颜色、间距、圆角、阴影、控件高度或动效时长。

## 交付文件

| 文件 | 交付对象 | 用途 |
| --- | --- | --- |
| `docs/ui-guidelines.md` | 产品、设计、前端、测试 | 页面模板、业务组合、交互、状态、响应式、动效与验收规则。 |
| `tokens/design-tokens.json` | 前端、设计系统维护者 | 机器可读 Token 源；主题、组件和样式变量均由此映射。 |
| `components/component-specs.json` | 前端、设计、测试 | 组件用途、边界、参数、状态、关联 Token、无障碍、响应式、示例和验收项。 |
| `adapters/ant-design-theme.ts` | 前端 | Ant Design 主题映射示例。 |

## 使用规则

1. `tokens/design-tokens.json` 的 `theme.light` 与 `theme.dark` 是全部颜色和主题阴影的唯一来源；不得只接入浅色值后自行反相深色主题。
2. `shared` 是全局 Token：字体、间距、圆角、透明度、动效、层级、布局与控件尺寸。数值未出现在该文件时，不得在业务代码中新增。
3. `state` 是 Default 之外的交互与反馈 Token。Pressed 是瞬时按压，Selected 是持续选中；Error、Success、Readonly、Disabled、Loading 依照 `docs/ui-guidelines.md` 的状态矩阵实现。
4. `components` 是基础组件的语义覆盖。页面只能组合这些 Token，不能为 Button、Tag、Input、Select、Checkbox、Table、Tabs、Menu 或浮层单独造同义样式。
5. `{...}` 是 Token 引用，不是可直接渲染的 CSS 字符串。使用 JSON 的工程需要在构建阶段解析引用；直接使用主题映射文件时，常用引用已完成解析。
6. 组件库未开放某个组件 Token 时，保留全局语义 Token 映射并在接入记录中标注缺口；不得以硬编码样式绕过。
7. `components/component-specs.json` 的参数名描述设计行为，而非某个实现的专有接口；前端实现须保持同等行为、状态与验收项，并在映射表中记录差异。
8. `stylePresets` 只允许覆盖已发布 Token。`current` 是默认且稳定的回退；`industrial` 支持 Light / Dark，并通过 `colorThemes` 发布 steel、cobalt、graphite，不能为每套颜色复制组件。

## 主题与风格切换

- 主题、风格和工业主题色分开保存：`mode = light | dark`，`preset = current | industrial`，`industrialColorTheme = steel | cobalt | graphite`。
- `current` 与 `industrial` 均支持 Light / Dark；主题和风格可以独立组合。
- `industrialColorTheme` 仅在 `preset = industrial` 时参与 Token 解析；默认值为 `steel`。
- 切换回 `current` 时保留当前主题，并移除全部工业覆盖，不能残留小圆角、紧凑表格、钢灰交互色、橙色信号或工业阴影。
- 主题/风格切换不复制组件树，不改变 Button、Input、Select、Table 等组件 API。
- 每次修改 Token 必须同时更新 light、dark、组件引用和主题映射，并执行 `npm run check`。
- 页面验收仍以 `docs/ui-guidelines.md` 为准：Token 正确不代表表单、页面级状态、响应式、动效或可访问性自动通过。
