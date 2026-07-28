# 贡献与发布

## 修改原则

- 保持单一来源：文字规则、Token、组件契约和适配器各自在指定文件维护，不复制同一份数据。
- 先定义语义，再修改实现；不得从某个页面或组件库的临时样式反推并直接发布全局 Token。
- 所有状态名称使用 Default、Hover、Pressed、Focus、Selected、Checked、Open、Expanded、Disabled、Loading、Readonly、Error、Success；禁止重新引入含义不清的 Active。
- Light 与 Dark 必须同步更新；组件状态不得只靠颜色表达。
- 第三方业务组件只管理容器内部内容，页面坐标、外部间距、全局浮层和 z-index 由平台管理。

## 文件职责

| 修改内容 | 必须更新 |
| --- | --- |
| 颜色、间距、字号、圆角、状态或组件 Token | `tokens/design-tokens.json`，必要时同步适配器和组件契约 |
| 组件参数、状态、键盘行为或验收项 | `components/component-specs.json`，必要时同步 UI 总规范 |
| 页面模板、业务组合、响应式、内容或无障碍 | `docs/ui-guidelines.md` |
| Ant Design 映射 | `adapters/ant-design-theme.ts`；不得在此新增未发布 Token |
| 发布版本 | `package.json`、两个 JSON 的 `version`、`CHANGELOG.md` |

## Merge Request 最低要求

1. 写明修改原因、影响范围和是否存在破坏性变更。
2. Token 变更列出 Light/Dark 前后值及受影响组件。
3. 组件变更列出状态矩阵、键盘行为、响应式和无障碍影响。
4. 提供必要的视觉对比或交互录屏，但不把截图当作唯一规范。
5. 执行 `npm run check` 并确保 GitLab Pipeline 通过。
6. 由设计系统维护者和前端负责人审批后合并。

## 发布流程

1. 确认变更属于 Major、Minor 或 Patch。
2. 同步 `package.json`、`tokens/design-tokens.json`、`components/component-specs.json` 的版本。
3. 在 `CHANGELOG.md` 顶部新增发布日期、变更和迁移说明。
4. 执行 `npm run check`。
5. 合并到受保护的 `main` 后创建 `vX.Y.Z` Git tag。

破坏性变更必须同时给出替代 Token/组件、迁移示例、兼容期限和移除版本。
