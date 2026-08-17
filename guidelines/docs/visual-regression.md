# 视觉回归与交互验收

视觉回归是 Product Token、组件契约和页面 Recipe 的运行时门禁。`npm run check` 只能验证规范包内部一致性，不能替代浏览器截图与交互测试。

## 1. 基准页面

接入团队至少维护以下稳定参考页面：

1. ProductShell＋标准列表页。
2. 宽表格＋固定主标识列和操作列。
3. Modal 新增/编辑表单＋Select 展开。
4. Drawer 详情＋Drawer 内二级详情。
5. 导入 Workflow＋部分成功结果。
6. Empty、Filtered Empty、Loading、Error、Readonly。
7. Tree、DateTimePicker、Steps 与 ContentState 状态页。
8. 3D Scene（加载、Ready、Selected、Error）与图表（Ready、Empty、部分数据、过期）。

基准页面使用固定数据、固定字体加载策略和确定性时间；禁止使用随机值、实时接口或持续动画生成截图。

## 2. 截图矩阵

| 维度 | 必测值 |
| --- | --- |
| Theme | Light、Dark |
| Viewport | 1440×900、1024×768、390×844 |
| Style | Current；Industrial Steel / Cobalt / Graphite，三套均覆盖 Light / Dark |
| Overlay | Select Open、Modal Open、Drawer Open、Tooltip Focus |
| Content | Ready、Empty、Filtered Empty、Loading、Error |
| Table | 默认、横向滚动终点、行 Hover、行 Selected（如适用） |
| Accessibility | 键盘模式、200% / 400% 缩放、`forced-colors`、`prefers-reduced-motion` |
| Locale | zh-CN、en-US、30%–40% 膨胀伪语言、至少一个非 UTC 时区；承诺 RTL 时增加 RTL 与双向文本 |

## 3. 交互断言

- ProductShell 在页面切换时尺寸和位置不变化。
- Select 的浮层不被 Modal/Drawer 遮挡，Esc 后焦点回到触发器。
- Modal/Drawer 只滚动 Body，Header/Footer 保持可见。
- Modal 的 Header、Body、Footer 通过留白分区，壳内不得出现 Header 下边线与 Footer 上边线。
- Drawer 关闭后列表查询、筛选、排序、分页和滚动位置不变。
- 表格操作按钮可通过键盘聚焦，Tooltip 在 Hover 与 Focus 时均可见。
- 保存 Loading 阻止重复提交但不清空表单、不改变按钮宽度。
- `prefers-reduced-motion` 下无非必要位移、缩放和持续装饰动画。
- 工业主题在 Current → Industrial → Current 往返后不残留颜色、圆角、密度或 Scene Token；Portal 浮层继承触发页面的 Theme/Style/Industrial Color Theme。
- 表格全选范围、跨页选择、禁用行、部分成功、固定列两端和虚拟滚动均与可见状态一致。
- 200%/400% 缩放不遮挡主操作；`forced-colors` 中 Focus、Selected、Checked、Error 仍可辨认。
- 自动对比度断言覆盖主按钮文字、Danger 实色按钮、表头和 Info/Success/Warning/Danger 状态文字，要求至少 4.5:1。
- 3D 视口在 Light/Dark 均保持近黑场景底，坐标轴同时有字母；图表系列不能只靠颜色区分，并提供可访问摘要或数据表。
- 切换 Locale 后保留主题、风格、路由、筛选、分页和表单草稿；`html[lang]`、RTL `dir`、Tooltip、`aria-label` 与动态播报同步更新。
- 英文和伪语言下 Button、Tab、Tag、表头、Modal Footer、Toast/Notification 无关键文案截断、重叠或固定高度溢出。

## 4. 合并门禁

- 组件或 Token 修改必须更新受影响基准；业务需求不得用“更新所有截图”规避差异评审。
- 像素差异阈值由接入团队的截图工具设定，任何 ProductShell、表格行高、操作列、Modal、Drawer 或 Select 差异必须人工确认。
- 新页面首次合并必须提供对应 Recipe、Light/Dark 和至少一个窄屏截图。
- 截图通过不代表无障碍通过；键盘、可访问名称、焦点恢复和语义状态必须单独断言。
- CI 同时运行 Token 引用/对比度校验、静态审计、组件交互测试和截图差异；任何单项通过都不能替代其他门禁。
