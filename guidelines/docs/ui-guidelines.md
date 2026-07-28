# 产品视觉与交互规范

本文件是页面设计、前端实现与代码生成的强制文字依据。设计系统交付包的单一来源为：

- 文字规则与验收：`docs/ui-guidelines.md`
- 机器可读 Token：`tokens/design-tokens.json`
- 组件契约：`components/component-specs.json`
- Ant Design 映射示例：`adapters/ant-design-theme.ts`

原型工程中的 `src/styles/*` 与 `src/app/theme.ts` 仅用于验证规范映射，不属于前端接入源。

优先级：页面特殊规则 < 业务组件规则 < 基础组件规则 < Design Token。页面不得重复定义已存在的 Token。

## 1. Design Token

### 命名

- `--ds-*`：跨产品共享的设计 Token。
- `--app-*`：Web 应用语义变量，兼容既有页面。
- `--robot-*`：机器人工作区语义变量，兼容既有页面。
- 颜色必须使用语义名称，不按视觉值命名；例如使用 `danger`，不得使用 `red`。

### 颜色

- 页面、布局、卡片、弱背景分别使用 `page / layout / surface / soft`。
- 文本按 `heading / text / muted` 三级使用。
- 品牌和状态色按 `accent / info / success / warning / danger` 使用。
- 禁止在组件内新增十六进制颜色；3D 场景、坐标轴、图表数据系列除外。
- 明暗模式必须来自 `THEME_PALETTES`，不得在页面组件中独立维护两套颜色。

### 字体

- 仅使用 `--ds-font-size-*`、`--ds-font-weight-*`、`--ds-line-height-*`。
- 字号只使用偶数阶梯：10 / 12 / 14 / 16 / 18 / 20 / 24px，禁止新增 11 / 13 / 15px 等单数字号。
- 正文默认 14px；辅助信息与紧凑标签 12px；模块标题 16–18px；页面标题 20–24px。
- 正文常规字重 400；交互和标签 500/600；页面标题不超过 700。
- 数字、版本号、坐标、代码和文件名可使用等宽字体 Token。

| 应用位置 | 字号 | 字重 | 行高 | 使用说明 |
| --- | ---: | ---: | --- | --- |
| 页面标题 | 20 / 24px | 600 | tight | Page Header 中的唯一页面标题。 |
| 弹窗标题 | 18px | 600 | normal | Modal Header 标题。 |
| 模块标题 | 16px | 600 | normal | 内容区模块标题。 |
| 正文 / 表单字段 | 14px | 400 | normal | 正文、Input 内容与字段说明主体。 |
| 菜单 / 按钮 | 14px | 500 / 600 | normal | Menu 条目 500；Button 文案 600。 |
| 表头 / 标签 / 辅助信息 | 12px | 500 / 400 | normal | 表头与标签 500；帮助、日期与状态补充 400。 |
| 紧凑补充 | 10px | 400 | normal | 仅限低优先级版本、单位或补充信息。 |

### 间距

- 使用 4px 基础栅格：4、8、12、16、20、24、32、40、48、64。
- 控件内部优先 8/12/16；模块之间优先 16/24；页面区块之间优先 24/32。
- 禁止为“看起来差不多”新增 13px、15px、17px 等临时间距。

### 圆角、阴影、层级与透明度

- 按钮 8px、输入类控件 10px、内部容器 12px、卡片/浮层 16px、胶囊 999px。
- 阴影只使用 `none / xs / sm / card / overlay / dialog` 六级。
- 层级只使用 `base / sticky / dropdown / drawer / modal / toast / tooltip`。
- Disabled 透明度统一为 0.45；不得仅依赖透明度表达 Error 或选中状态。

## 2. 页面布局

- 页面必须使用 `--ds-layout-*`；默认页面边距 24px、模块间距 16px。
- 导航、侧栏、内容区必须是 `flex/grid` 布局，禁止用绝对定位搭建主体结构。
- 主内容必须设置 `min-width: 0`、`min-height: 0`，需要滚动的最近容器负责 `overflow`。
- 固定表格列、吸顶栏、侧栏不得制造无意义竖线；通过背景和阴影表达层级。
- 12 列栅格用于桌面端，移动端降为 4 列。

## 3. 基础组件

- 所有基础控件必须遵循平台发布的 Token、尺寸、状态和无障碍规范；研发可使用团队批准的组件库实现，不得为已有控件另起一套视觉语言。
- 文件选择必须保留浏览器可访问的文件选择行为；不得制作不可访问的伪上传控件。
- 业务页面不得覆盖 Button、Tag、Input、Select、Checkbox、Modal 的字体、尺寸、圆角、描边、禁用或焦点状态。
- 新基础组件必须按适用范围包含 Default、Hover、Pressed、Focus、Selected、Disabled、Loading、Error 状态；`Pressed` 与 `Selected` 不得混用。
- 同一模块仅允许一个主按钮；危险操作必须使用 danger 状态并二次确认。
- 输入框与选择器必须有可见 Label；Placeholder 不能替代 Label。
- 表格默认表头 44px、数据行 60px；宽表使用内部横向滚动。
- 页面工具栏的搜索框与“导入、导出、刷新、新建/新增”主要操作统一 40px 高；弹窗表单输入和 Footer 按钮也使用 40px。表格行内操作、标签增删等紧凑控件保持 24–32px。
- 常规文字按钮默认 40px 高，紧凑按钮只允许 32px，迷你图标操作只允许 24px；按钮圆角全部使用 8px，不允许页面自行定义高度或圆角。
- Modal 用于需要确认的短任务。当前系统尚未发布可复用的 Drawer 运行时样式；连续配置使用页面内侧栏或已发布 Modal，不得自行搭建 Drawer 外观。
- Dropdown 浮层使用 16px 外圆角、12px 条目圆角、overlay 阴影、危险项独立状态。

### 3.1 组件使用与视觉契约

| 组件 | 视觉与交互规则 |
| --- | --- | --- |
| Button / IconButton | `primary` 只用于当前区域主操作；`secondary`、`text` 不描边；`outline` 仅用于需要弱边界的工具栏操作。高度只允许 24 / 32 / 40px。 |
| Tag / Badge | 仅用于状态、范围、版本、计数等元信息；统一使用语义色填充，**禁止描边和 outline 变体**；不得充当普通按钮。 |
| Input / TextArea | 必须有可见 Label；页面搜索可使用弱填充底，表单控件使用 surface 底与中性描边。 |
| Select / Checkbox | 必须支持键盘操作、可见 Focus 和明确的选中/禁用状态；不得重新制作与平台规范冲突的通用控件。 |
| Modal | 必须包含遮罩、焦点管理以及 Esc/遮罩关闭机制；业务层只传入内容和状态。 |

标签与按钮的用途不同：标签不带描边、不承担操作；按钮必须有明确的动作语义。任何页面发现同一语义的标签有的有描边、有的没有，视为规范不通过。

### 3.2 弹窗标准

弹窗统一使用平台标准弹窗，不得在业务页面重新搭建遮罩、定位、标题栏或底部操作区。

| 规格 | 宽度 | 适用场景 |
| --- | ---: | --- |
| `sm` | 420px | 确认、删除、单一短任务 |
| `md` | 560px | 标准表单、创建或编辑 |
| `lg` | 720px | 多段表单、小型数据列表 |
| `xl` | 900px | 大型列表、对比、可展开详情 |

- 默认最大宽度为 `calc(100vw - 48px)`，最大高度为 `calc(100vh - 48px)`；窄屏不得超出视口。
- 弹窗圆角统一 16px，遮罩使用 `overlay` 语义色，阴影使用 `--ds-shadow-dialog`。危险弹窗也保持中性外边框，不使用整圈红色边框。
- 标题统一使用 18px / 600；禁止在标题左侧放图标，右侧只保留关闭按钮。
- 标题描述是可选项，非必要不显示。只有需要在任务开始前说明系统行为、输入结果或操作范围时，才使用一行 12px 描述；禁止重复标题或堆叠多行帮助文字。
- 具体风险、影响数量、校验错误和表单字段帮助属于正文内容，应放入 Body 的提示区、字段帮助文字或危险信息条。
- Header 左右间距 24px；Body 左右间距 24px；Footer 右对齐，与正文共用同一对齐线。
- 弹窗内的 Input、Textarea 和 Select 统一使用 `surface` 底与中性灰色描边；Hover 只加深边框，Focus 使用主题色 Focus Ring。页面搜索框可继续使用弱填充背景。
- 高度超出时只允许 Body 滚动，Header 与 Footer 必须固定；列表型弹窗的局部列表可再设内部最大高度。
- Footer 操作顺序为“次要 / 取消”在左、“主要 / 确认”在右；只有关闭动作时使用普通次要按钮。
- 同一弹窗最多一个主按钮；删除等危险操作使用 danger 按钮并提供明确后果说明。取消发布、停用等可恢复的状态回退使用品牌主按钮；Warning 仅用于提示信息或状态标记，不能因为弹窗包含提醒文案就改用黄色确认按钮。
- 弹窗类型统一使用同一套中性壳、标题栏、关闭按钮和 Footer：提示用于可恢复状态回退；警示用于未保存修改、风险前置说明，确认仍为品牌主按钮；删除用于不可恢复动作，只有确认按钮使用 danger 语义。不得为不同类型新增黄色背景、整圈状态描边或标题左侧图标。
- 列表型弹窗优先使用分段切换 + 单层列表 / 折叠列表，禁止在展开区再套完整表格或多层卡片。
- 关闭规则统一：右上角 `X`、`Esc`、点击遮罩及 Footer “关闭 / 取消”必须使用同一套关闭逻辑；未保存表单关闭前需二次确认。

## 4. 业务组件

- 设备卡片、状态卡片、数据面板、配置面板和图表容器必须建立独立业务类，不得复制页面内联样式。
- 业务组件只能组合基础组件和 Token，不得覆盖基础组件的核心状态规则。
- 卡片必须预留异步内容空间，避免 Loading 完成后发生布局跳动。
- 状态不能只用颜色表达，必须同时使用文字、图标或形状。
- 3D、图表等深色内容区属于独立 Scene Scope，不得反向污染普通页面主题。

## 5. 页面模板

页面模板解决整体布局；基础组件和业务组合解决局部一致性。模板及页面级状态的完整规则见第 20 节。

- 新页面优先使用 `.ds-page--list/detail/form/config/dashboard/workflow/workbench/editor/split` 模板类；不得由业务页面重新定义页面外边距、主体滚动策略或固定操作区。
- Modal Form 与 Drawer Detail 使用第 3.2 节的浮层壳，只定义 Header、Body、Footer 中的业务内容。

## 6. 响应规则

- ≥1200px：完整导航与多栏布局。
- 768–1199px：减少页面边距和侧栏宽度，优先保持主任务区。
- <768px：多栏改纵向；侧栏宽度变 100%；页面边距 16px。
- 内容溢出时先压缩可伸缩区域，再启用内部滚动，不允许正文被裁切。
- 表格在窄屏可横向滚动或转卡片；操作列不得被遮挡。
- Hover 入口在触屏设备必须常显或有等价点击入口。

## 7. 状态规则

- Normal：信息层级清晰，不使用多余高亮。
- Hover：只改变颜色、背景、边框或阴影，不改变占位尺寸。
- Pressed：只在按压过程中可见；Selected：点击完成后持续可见，两者都必须与 Hover 有明显区别。
- Focus：所有键盘可操作组件显示 2px Focus Ring。
- Disabled：降低透明度、显示不可用光标，并阻止事件。
- Loading：按钮显示 Spinner；内容区优先 Skeleton，并保留最终尺寸。
- Empty：说明为什么为空，并在可执行时提供下一步操作。
- Error：说明问题与恢复方式；危险色不能作为唯一信息。
- 动效默认 120–240ms，并遵守 `prefers-reduced-motion`。

## 8. 开发约束

- 新页面不得新增大段 `<style>` 内联样式；通用样式进入设计系统，业务样式进入对应业务组件样式文件。
- 内联样式仅允许动态几何值、运行时坐标、图表数据或一次性计算结果。
- 新增基础控件前，先确认平台现有规范与团队组件库是否已覆盖需求；存在时必须复用，不得以不一致的自定义控件替代。
- 新增业务页面不得引入与平台视觉规范冲突的基础控件样式；存量页面按迁移计划逐步收敛。
- UI 提交验收至少检查：主按钮唯一、Tag 无描边、Label 可见、键盘 Focus 可见、Light/Dark 正常、Normal/Loading/Empty/Error/Disabled 状态完整。
- 改动后必须执行 `npm run build` 与 `git diff --check`。
- 每次新增组件前，先确认现有基础组件或业务组件是否已覆盖需求。

## 9. 已发布设计 Token 对照

本节仅摘录当前设计系统已发布的 Token，未列出的数值不得自行补充为全局规范。

### 9.1 语义颜色与主题

- 页面、布局、表面、弱背景、边框、标题、正文、辅助文字分别使用 `--ds-color-page`、`--ds-color-layout`、`--ds-color-surface`、`--ds-color-soft`、`--ds-color-border`、`--ds-color-heading`、`--ds-color-text`、`--ds-color-muted`。
- 品牌与状态使用 `--ds-color-accent`、`--ds-color-accent-soft`、`--ds-color-success`、`--ds-color-warning`、`--ds-color-danger` 及对应的 `*-soft` Token。
- 当前主题系统仅发布 light / dark 两套语义值；页面不得直接取用调色板中的十六进制色值。

### 9.2 尺寸、圆角与阴影

| 类别 | 已发布值 |
| --- | --- |
| 字号 | 10 / 12 / 14 / 16 / 18 / 20 / 24px |
| 间距 | 0 / 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64px |
| 圆角 | 0 / 6 / 8 / 10 / 12 / 16px，以及 999px 胶囊 |
| 阴影 | `none` / `xs` / `sm` / `card` / `overlay` / `dialog` |
| 动效时长 | 120 / 160 / 240ms |

### 9.3 已发布基础控件尺寸

| 控件 | 已发布值 |
| --- | --- |
| Button | 24 / 32 / 40px 高，圆角 8px |
| 通用 Control | 24 / 28 / 36 / 40px 高，输入类圆角 10px |
| Tag | 默认 24px 高、水平内边距 8px；紧凑态 20px 高、水平内边距 7px；胶囊圆角 |
| Table | 表头 44px，数据行 60px |
| Modal | 420 / 560 / 720 / 900px 宽；最大尺寸为视口减 48px |

### 9.4 布局与响应值

- 默认页面内边距为 24px，模块间距与网格间距为 16px；内容最大宽度为 1680px，桌面网格为 12 列。
- 768–1199px：页面内边距 20px，模块与网格间距 12px；导航、侧栏尺寸使用对应的响应 Token。
- 小于 768px：页面内边距 16px，模块与网格间距 12px，网格为 4 列，导航和侧栏宽度为 100%。

## 10. 基于现有 Token 的验收清单

- [ ] 除第 4 节定义的 3D、图表等场景例外外，页面没有使用未发布的全局字号、间距、圆角、阴影或颜色值。
- [ ] 页面使用 light / dark 主题语义 Token，不直接写死普通界面的颜色值。
- [ ] Button、Tag、Table、Modal 的尺寸符合第 9.3 节；Tag 为无描边填充样式。
- [ ] 页面内边距、网格和侧栏在各响应断点使用第 9.4 节的已发布值。
- [ ] 页面通过 Default、Hover、Pressed、Focus、Selected、Disabled、Loading、Empty、Error 状态规则验收。
- [ ] 改动已执行 `npm run build` 与 `git diff --check`。

## 11. 已实现交互契约

本节描述当前系统已经实现的交互行为。新增页面或改造现有页面时，应沿用这些行为；未在本节列出的交互不应直接作为全局规则扩展。

### 11.1 可交互元素状态

- 可点击的通用元素使用统一状态契约：基础层仅负责 Hover/Pressed/Selected 的 Token、过渡、Focus Ring、Disabled 和 Loading 事件约束；具体背景、边框和文字颜色由所属组件 Token 决定。
- Disabled 状态使用 `--ds-opacity-disabled`（当前值 0.45）、禁用光标并阻止指针事件；Loading 状态使用进度光标并阻止重复点击。
- 按钮 Loading 时显示 Spinner，且与 Disabled 一样不可重复触发。
- 当系统启用“减少动效”偏好时，交互元素、树节点和菜单的过渡与动画必须关闭。

### 11.2 弹窗与确认

- 弹窗通过右上角关闭、`Esc`、点击遮罩、Footer 的“关闭/取消”四种已有入口退出，并统一回收打开状态。
- 删除等危险操作使用危险语义的确认按钮；取消和确认并列展示，取消不应执行任何数据变更。
- 表单型弹窗的确认按钮可在必填信息不完整时禁用；字段错误在字段附近展示，不以单纯颜色替代提示。

### 11.3 展开、选择与筛选

- 可展开的树节点、折叠区域和下拉入口使用 `aria-expanded` 表达当前开合状态；视觉指示与状态同步变化。
- 二选一或多选筛选项使用 `aria-pressed` 表达已选状态；列表选项使用 `aria-selected` 表达选中状态。
- 当前已实现的可搜索选择器在输入聚焦或内容变化时展开候选项；选中候选项后关闭，在焦点离开整个控件时关闭。候选项区域可滚动，避免撑开页面。

### 11.4 表单、图标操作与反馈

- 字段通过可见 Label 或 `aria-label` 提供名称；纯图标操作必须提供 `aria-label`，并在现有界面中配合标题提示。
- 可快速提交的现有输入场景支持 Enter；重命名场景支持 Escape 关闭。其他输入场景不得默认推断或强制绑定这两个按键。
- 校验错误使用字段附近的错误文本和 `role="alert"`；状态、错误、选中不能仅依赖颜色。
- 成功保存、刷新和复制等操作沿用对应页面现有的局部状态反馈方式，避免在同一页面新增不同的反馈样式。

### 11.5 图标规范

- 图标统一使用项目已批准的**线性系统图标库**；同一页面不得混用不同风格、不同圆角语言或不同描边粗细的图标。面性图标只可作为既有品牌资产或明确的业务插画，不能与线性操作图标并列混用。
- 标准尺寸为：12px 用于紧凑状态标记；14px 用于 24px 控件；16px 用于 32 / 40px 常规控件；20px 用于页面级操作或空状态辅助；24px 用于模块级图标。除这五档外不得新增页面私有尺寸。
- 线性图标统一使用 `24 × 24` viewBox 和 1.8px 描边；自定义 SVG 必须移除硬编码 fill / stroke，使用 `currentColor`，并在导入前按该 viewBox 和描边规则校正。
- 常规功能图标默认继承相邻文字色或 `--ds-icon-color`；按钮内图标继承文字色。成功、警示、错误等状态图标分别使用对应语义色，且必须配合状态文字，不能只依赖颜色。
- 方向语义统一：向右表示进入、下一步或展开的目标方向；向下表示展开；向上表示收起；向左表示返回；同一页面不得让同一方向表达相反含义。左右、上下方向图标不作镜像替换来表达不同业务含义。
- 装饰图标不得使用品牌主色抢占主操作层级；图标不能替代含义不明确的文字。纯图标操作仅用于高频且图标含义明确的动作，并提供 `aria-label` 与 Tooltip。
- 业务专属图标应先归类为对象、状态或功能图标；不能以随机 Emoji、彩色图片或临时 SVG 代替系统图标。新增图标须经过设计评审并加入统一资产清单。

### 11.6 内容文案规范

- 文案以用户任务、对象和结果为中心，优先使用明确动词：使用“保存配置”“创建型号”“重新加载”，避免“确定”“提交”“处理”等脱离上下文的泛化词。
- 页面标题表达当前对象或任务；按钮表达下一步动作；状态表达“对象 + 当前结果”；错误说明包含问题与可执行修正方向。相同概念在同一产品内使用同一名称，不混用同义词。
- Placeholder 只给输入示例，不重复 Label，也不承载必填、格式、范围或错误规则；这些信息使用 Label、帮助文本和错误文本表达。
- 成功、错误、空状态和无权限文案必须同时给出可理解的原因或下一步；不显示内部接口名、错误码、堆栈或“操作失败，请重试”这类无上下文提示。
- 日期、数字、版本号、文件名和单位使用统一格式；数值与单位、状态图标与状态文字不可拆行。中英文、数字与标点之间遵循同一页面既有格式，不为视觉凑字新增空格或换行。
- 文案优先简短、单义、可扫描；长说明放入帮助文本、详情或 Tooltip，Tooltip 不能承担唯一关键说明。危险操作必须说明影响对象和不可恢复后果。

### 11.7 交互验收

- [ ] Hover、Pressed、Selected、Focus、Disabled、Loading、Readonly、Error、Success 的视觉和事件行为符合第 11.1 节。
- [ ] 弹窗的四种关闭入口均能正确收口；危险确认不会由取消入口触发。
- [ ] 展开、选中、筛选和图标操作具有对应的可访问状态或名称。
- [ ] 图标尺寸、描边、颜色、方向与自定义 SVG 均符合第 11.5 节；页面未混用多套操作图标风格。
- [ ] 标题、按钮、状态、错误与空状态文案符合第 11.6 节，且未以 Placeholder 或 Tooltip 承载唯一关键信息。
- [ ] 可搜索选择器在打开、选择、失焦关闭和候选项滚动时行为正确。
- [ ] 开启“减少动效”偏好后，不保留非必要过渡或动画。

## 12. 组件状态模型

### 12.1 统一命名与代码映射

`Active` 禁止再作为通用状态名称。它同时可能表示鼠标按压、当前页面、Toggle 打开或菜单高亮，无法形成可靠的设计、代码和测试映射。统一使用下表。

| 规范状态 | 定义 | 推荐代码映射 |
| --- | --- | --- |
| Default | 未被操作的基础状态 | 默认样式 |
| Hover | 指针位于有效热区 | `:hover` |
| Pressed | 指针或键盘仍处于按下过程 | `:active`、`data-state="pressed"` |
| Focus | 获得键盘焦点 | `:focus-visible`、`data-state="focus"` |
| Selected | 点击完成后持续选中 | `aria-selected="true"`、`data-selected="true"` |
| Checked | 勾选或开关值为真 | `aria-checked="true"`、`data-checked="true"` |
| Open | 下拉、菜单或浮层已展开 | `aria-expanded="true"`、`data-state="open"` |
| Expanded | 树、折叠面板已展开 | `aria-expanded="true"` |
| Disabled | 当前不可操作 | 原生 `disabled` 或 `aria-disabled="true"` |
| Loading | 正在等待异步结果 | `data-state="loading"` |
| Readonly | 可查看/复制、不可编辑 | `readonly`、`aria-readonly="true"` |
| Error | 校验或请求失败 | `aria-invalid="true"`、`data-state="error"` |
| Success | 操作完成后的结果反馈 | `data-state="success"`、状态文字或提示条 |
| Empty | 数据、搜索或筛选结果为空 | 空状态容器与下一步操作 |

`Pressed` 是瞬时状态：按下开始、释放或取消即结束。`Selected` 是持续状态：例如当前 Tab、已选菜单项、已选表格行；两者可以组合为 `Selected + Pressed`，但不能互相替代。

### 12.2 状态组合与收敛规则

状态不是单一优先级链。以下四类可以同时存在，组件只实现适用项：

| 类别 | 状态 | 收敛规则 |
| --- | --- | --- |
| 可操作性 | Disabled、Loading、Readonly | Disabled 阻止一切交互；Loading 默认阻止重复提交；Readonly 保留查看、选择和复制能力，但不允许修改。 |
| 瞬时交互 | Hover、Pressed、Focus | Pressed 只在按压期间有效；Focus 必须在 Error、Selected 等状态上继续可见。 |
| 持续选择 | Selected、Checked、Open、Expanded | 这些状态可与 Hover、Pressed、Focus 组合；Selected + Hover 以 Selected 为底色，不退回普通 Hover。 |
| 结果与内容 | Error、Success、Empty | Error 与 Success 是结果反馈，不替代 Focus 或选择状态；Empty 是内容状态，不应用于单个交互控件。 |

- `Disabled` 覆盖其他交互反馈，事件处理函数也必须提前返回；仅 CSS `pointer-events: none` 不足以阻止键盘和程序调用。
- `Error + Focus` 必须同时保留：错误边框传达错误语义，Focus Ring 传达键盘位置。
- `Open` 用于触发器和浮层之间的持续关联，关闭后恢复 Default 或 Selected。
- `Success` 必须有可读文本或可感知提示；它不等同于绿色的 Hover、Pressed 或 Selected。

### 12.3 基础状态行为

- Hover、Pressed、Focus 和 Selected 的状态切换不得改变控件占位尺寸、文本换行或页面布局。
- Hover 不能承载唯一操作；触控端必须提供常显或可点击的等价入口。
- Pressed 必须即时响应，不使用延迟、弹跳或大幅缩放；可使用颜色加深、阴影收缩或最多 1px 的内容位移。
- Focus Ring 为 2px，偏移为 2px，必须在周边背景上可辨识；不可通过 `outline: none` 移除后不提供替代。
- 状态、错误、选中和禁用都不能仅依赖颜色，必须有文字、图标、形状或可访问状态中的至少一种补充。

## 13. 已发布组件 Token 与组件契约

组件只能消费 `tokens/design-tokens.json` 发布的组件 Token。前端可将其转换为 CSS Variables 或组件库主题对象，但业务页面不得直接写各状态色值或重新创造同义变量。

| 组件 | Token 前缀 | 必须覆盖的状态 |
| --- | --- | --- |
| Button / IconButton | `--ds-button-*` | Default、Hover、Pressed、Focus、Disabled、Loading；危险按钮加 Error/Danger 语义 |
| Input / TextArea | `--ds-input-*` | Default、Hover、Focus、Filled、Readonly、Disabled、Error |
| Select | `--ds-input-*`、`--ds-select-*` | Default、Hover、Pressed、Focus、Open、Selected、Disabled、Loading、Error |
| Checkbox | `--ds-checkbox-*` | Default、Hover、Focus、Checked、Disabled、Readonly |
| Table | `--ds-table-*` | Header、Row Hover、Row Pressed、Row Selected、Loading、Empty、Error |
| Tabs | `--ds-tabs-*` | Default、Hover、Pressed、Focus、Selected、Disabled |
| Menu | `--ds-menu-*` | Default、Hover、Pressed、Focus、Selected、Disabled、Open/Expanded |

### 13.1 Button、ToggleButton 与 IconButton

#### 13.1.1 使用边界

- `Button` 用于保存、创建、确认、刷新和提交等一次性动作，只含 Default、Hover、Pressed、Focus、Disabled、Loading；**普通 Button 没有 Selected**。
- `ToggleButton` 用于网格／列表视图、吸附开启等持续选择，包含 Default、Hover、Pressed、Focus、Selected、Disabled；使用 `aria-pressed` 表达状态。
- `IconToggleButton` 仅用于图标语义明确的高频持续选择，状态同 ToggleButton，必须有 `aria-label` 和 Tooltip。
- 类型只允许 `primary`、`secondary`、`outline`、`text`、`danger`；一个操作区域最多一个 `primary`。`danger` 是风险语义，不等同于 Pressed、Error 或 Selected；删除、解绑等不可逆操作必须二次确认。

#### 13.1.2 Primary 与 Secondary 状态矩阵

所有状态均须明确 background、text、border、icon、shadow、focus ring、cursor、opacity 与 transition；图标始终继承 `currentColor`。

| 类型 / 状态 | Background | Text / Icon | Border | Shadow | Focus ring | Cursor | Opacity | Transition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Primary Default | `--ds-button-primary-bg` | `--ds-button-primary-text` | `--ds-button-primary-border` | `--ds-button-primary-shadow` | 无 | pointer | 1 | `--ds-button-transition` |
| Primary Hover | `--ds-button-primary-bg-hover` | Default | `--ds-button-primary-border` | `--ds-button-primary-shadow-hover` | 无 | pointer | 1 | 同上 |
| Primary Pressed | `--ds-button-primary-bg-pressed` | Default | Pressed 背景值 | none | 无 | pointer | 1 | 同上 |
| Primary Focus | Default | Default | Default | Default | `--ds-state-focus-ring` / 2px | pointer | 1 | 同上 |
| Primary Disabled | `--ds-button-disabled-bg` | `--ds-button-disabled-text` | `--ds-button-disabled-border` | none | 无 | not-allowed | `--ds-opacity-disabled` | 同上 |
| Primary Loading | 保持触发前类型 | 保持触发前类型；Spinner 使用 currentColor | 保持触发前类型 | 保持触发前类型 | 无 | progress | 1 | 同上 |
| Secondary Default | `--ds-button-secondary-bg` | `--ds-button-secondary-text` | `--ds-button-secondary-border` | none | 无 | pointer | 1 | `--ds-button-transition` |
| Secondary Hover | `--ds-button-secondary-bg-hover` | Default | Default | none | 无 | pointer | 1 | 同上 |
| Secondary Pressed | `--ds-button-secondary-bg-pressed` | Default | `--ds-state-pressed-border` | none | 无 | pointer | 1 | 同上 |
| Secondary Focus | Default | Default | Default | none | `--ds-state-focus-ring` / 2px | pointer | 1 | 同上 |
| Secondary Disabled | `--ds-button-disabled-bg` | `--ds-button-disabled-text` | `--ds-button-disabled-border` | none | 无 | not-allowed | `--ds-opacity-disabled` | 同上 |
| Secondary Loading | 保持触发前类型 | 保持触发前类型；Spinner 使用 currentColor | 保持触发前类型 | none | 无 | progress | 1 | 同上 |

#### 13.1.3 内部规格与内容结构

| 规格 | 24px / 32px / 40px | Token |
| --- | --- | --- |
| 水平内边距 | 8 / 10 / 14px | `--ds-button-padding-inline-*` |
| 最小宽度 | 48 / 56 / 64px | `--ds-button-min-width-*` |
| 最大宽度 | 常规按钮不设全局最大值；不得超过所在操作区。`fullWidth` = 容器可用宽度 | 布局约束 |
| 文字 | 12 / 12 / 14px；行高 1；字重 600 | `--ds-button-font-size-*`、`--ds-button-line-height`、`--ds-button-font-weight` |
| 图标与图文间距 | 14 / 14 / 16px；8px | `--ds-button-icon-size-*`、`--ds-button-icon-gap` |
| 边框与 Spinner | 1px；14px / 2px 描边 | `--ds-button-border-width`、`--ds-button-spinner-*` |

允许纯文字、前置图标＋文字、文字＋后置图标、纯图标、Loading 图标＋文字五种形态。普通动作图标默认前置；展开、跳转类图标可后置；同一按钮不得同时出现前后两个图标。纯图标只用于高频且含义明确的操作。文案默认单行，过长时优先缩短文案或收进 More，不得在按钮内换行。常规 Button 不发布固定最大宽度，宽度由内容与内边距决定且不得超出所在操作区；`fullWidth` 只用于窄栏表单、固定底部操作等通栏任务，并等于容器可用宽度。Loading 前后保留同一宽度，不得因文案变化跳动。

#### 13.1.4 IconButton

- 高度只允许 24 / 32 / 40px；视觉尺寸可为 24px，但鼠标热区至少 32×32px、触控热区至少 44×44px。
- 纯图标按钮必须有 `aria-label` 和 Tooltip；Loading 时保持原宽度并阻止重复触发。

### 13.2 SearchInput 与 SearchBar

- `SearchInput` 用于在当前数据集内按关键词查询；默认高度 40px，搜索图标 16px。输入变化可即时筛选，或经明确的“搜索”动作提交；同一场景不能同时采用两套触发方式。
- 有内容时可提供清除入口；清除后恢复默认结果和筛选状态。Loading 在输入框尾部展示，保留已输入关键词与控件宽度。
- `SearchBar` 由 SearchInput、主筛选条件、筛选/重置操作和已生效条件组成；只在列表、看板等查询上下文使用，不替代页面标题或全局导航搜索。
- 搜索词不得只用 Placeholder 表达字段含义；没有可见 Label 时必须提供可访问名称。无结果时保留搜索词和筛选条件，并提供清除入口。

### 13.3 Input、InputNumber 与 Select

- Input、TextArea、Select 都必须有可见 Label；Placeholder 仅用于输入示例，不能代替字段名称。
- Readonly 保留正常文本对比度并允许复制；Disabled 不可编辑、不可聚焦，并在需要时通过外层 Tooltip 解释原因。
- Select 的触发器在 `Open` 时保持 Focus/品牌边框；选项使用 `aria-selected`，多选筛选项使用 `aria-pressed` 或 `aria-checked`。
- 可搜索 Select 输入变化后打开候选列表；`Esc`、点击外部、焦点离开整个控件或完成选择后按产品规则关闭。选项过多时列表内部滚动，不得撑开页面。
- `InputNumber` 仅用于有明确数值含义、单位、范围或步长的字段；键盘输入、上下键、步进按钮使用同一 `min / max / step` 校验，禁止让三种方式得到不同结果。
- 数值与单位不可分离；步进按钮不能是唯一输入方式。范围、精度、单位和非法输入提示应在字段附近说明；Loading、Error、Readonly、Disabled 沿用 Input 状态规则。

### 13.4 Radio、Switch 与 Checkbox

- `Radio` 用于少量互斥选项；选项必须始终可见且可比较。当前值使用 `aria-checked`，键盘方向键在同组内移动；选项过多、需要搜索或分组时改用 Select。
- `Switch` 用于开/关立即生效的独立设置；切换后如需要异步保存，应在控件附近反馈保存中、成功或失败，并在失败时恢复或明确保留原值，不能把 Switch 当作表单提交前的多项选择。
- Radio 和 Switch 的标签是完整热区的一部分；Disabled 必须说明原因（需要时用外层 Tooltip），Checked 与 Focus 可同时可见。

- Checked 使用品牌色底和品牌描边，勾选图标使用 `accent-contrast` 反白色；不得继承正文灰或状态色。
- Disabled 使用 Disabled Token，可呈现灰色勾选图标；这只适用于不可操作状态，不能与正常 Checked 混用。
- 复选框及标签作为一个可聚焦操作项；Focus Ring 覆盖完整控件，Checked + Focus 同时保留。

### 13.5 Pagination

- Pagination 用于可分页的结果集合，默认单项尺寸 32px；当前页使用 Selected 语义，前后页不可用时 Disabled，不以 Hover 表达当前页。
- 分页位于结果区底部或列表 Footer；切换页后保留筛选和排序，内容区回到结果起点，并通过可访问状态告知当前页。
- 页码过多时收敛为首尾页、当前页邻近页与省略号；省略号不可点击。窄屏优先保留上一页、当前页、下一页和总数／跳页入口，不能挤压成不可读密度。

### 13.6 Tabs 与 Menu

- Tab 的当前项使用 `aria-selected="true"`，不是 `Active`；左右方向键在同组内移动，Enter/Space 激活。
- Menu 的当前页面或当前命令使用 `aria-current` 或 `aria-selected`；展开父级使用 `aria-expanded`。
- 菜单项 Hover 只表示可操作，Selected 才表示当前位置；收起导航中不得仅保留无说明图标。

## 14. 表单规范

### 14.1 字段结构与间距

每个字段按以下顺序组织：

```text
Label（必填标记）
Control
Help / Unit / Character count（可选）
Error message（可选）
```

- Label 与 Control 间距 8px；Control 与帮助或错误文本间距 4px。
- 常规字段间距 16px；表单分组间距 24px。
- 必填标记置于 Label 后，不能只依赖 Placeholder 或红色边框。
- 单列表单为默认；双列表单只用于字段短、编辑任务明确且宽度充足的场景。窄屏统一退为单列。
- Label 过长允许最多两行；数值与单位不可拆开，单位优先置于控件后缀或字段帮助中。

### 14.2 校验与提交

- 必填、格式和范围可在失焦或提交时校验；异步唯一性校验需要说明“校验中”状态。
- Error 必须保留用户输入内容，并在字段附近显示可执行的修正说明，使用 `role="alert"`。
- 提交时定位第一个错误字段；当错误字段不在可视区时滚动到该字段并保持页面上下文。
- 提交按钮在请求中进入 Loading；成功后按页面规则关闭、重置或停留，不得静默改变表单。
- 关闭含未保存修改的表单、Drawer 或 Modal 时必须请求确认；取消确认不得修改数据。
- Enter 仅可在明确的短表单中提交；TextArea 中 Enter 默认换行，Esc 只用于已有明确取消语义的场景。

### 14.3 FormItem 状态矩阵

| 状态 | 视觉与行为 |
| --- | --- |
| Default | 中性描边、正常 Label、可输入 |
| Hover | 仅加强描边或弱背景，不代替 Focus |
| Focus | 品牌描边 + Focus Ring，光标可见 |
| Filled | 内容可见，可按需显示清除按钮 |
| Error | 错误描边 + 错误说明；获得焦点时保留 Error 语义和 Focus Ring |
| Readonly | 正常文字、不可编辑、可选择复制 |
| Disabled | 降低可用性提示、不可输入或聚焦；必要时给出禁用原因 |
| Loading | 异步候选、上传或校验显示局部进度，尺寸不跳动 |

## 15. Table、列表与数据操作规范

### 15.1 结构与内容

- 表头 44px、数据行 60px；数字、金额和百分比右对齐，文本和状态按列语义对齐。
- 长文本单行省略，并通过 Tooltip 或详情入口呈现完整值；操作列固定在右侧，主标识列可按需要固定在左侧。
- 宽表使用表格容器内部横向滚动；页面主体不因表格产生横向滚动。窄屏可切换卡片列表，但必须保留关键字段和主要操作。
- 行点击、复选框和行内按钮必须各自处理事件；行内操作不得意外切换行选中，除非业务明确要求。

### 15.2 状态与行为

| 场景 | 规则 |
| --- | --- |
| 排序 | 可排序表头 Hover 显示排序入口；当前排序列显示方向和优先级，重复点击在升序/降序/默认间循环。 |
| 筛选 | 筛选条件在工具栏或表头统一展示；已生效条件可见、可逐项清除，清空后恢复默认数据集。 |
| 行 Hover / Pressed | Hover 使用 `--ds-table-row-bg-hover`；Pressed 仅在鼠标按下期间使用 `--ds-table-row-bg-pressed`。 |
| 行 Selected | 使用 `aria-selected` 或复选框状态，持续使用 `--ds-table-row-bg-selected`；Selected + Hover 不退回普通 Hover。 |
| 展开行 | 用 `aria-expanded` 标识；展开内容与主行关联，缩回时恢复原行高度。 |
| 批量操作 | 选择至少一行后出现批量操作栏，必须显示已选数量；清除选择可恢复原工具栏。 |
| Loading | 首次加载使用 Skeleton 或固定高度 Loading；局部刷新保留已有内容并显示局部进度。 |
| Empty | 区分“尚无数据”和“筛选无结果”；后者提供清除筛选，前者在可创建时提供下一步操作。 |
| Error | 说明加载失败原因并提供重试；不可只显示红色图标或空白表格。 |

## 16. 浮层与反馈规范

全局浮层由平台基础控件负责 Portal、层级、视口碰撞、焦点和关闭行为；业务页面不得自行创建同类遮罩或 z-index。

| 组件 | 用途 | 必须行为 |
| --- | --- | --- |
| Tooltip | 一句短说明；纯图标操作的补充 | 不承载唯一操作；Hover/Focus 显示，Esc 或失焦关闭；最大宽度 `--ds-tooltip-max-width`。 |
| Popover | 少量解释、预览或轻量操作 | 触发器用 `aria-expanded`；点击外部和 Esc 关闭；内部可有少量操作，不用于长表单。 |
| Dropdown | 命令或选项列表 | 键盘上下移动、Enter 执行、Esc 关闭；危险项独立语义。 |
| Drawer | 保留当前页面上下文的连续配置、详情 | 只允许内容区滚动；关闭、Esc、遮罩逻辑统一；未保存时确认。 |
| Modal | 独立短任务或高风险确认 | 焦点限制在浮层内，关闭后返回触发元素；Header/Footer 固定，Body 滚动。 |
| Toast | 短暂、非阻塞的操作结果 | 不放关键长文本；成功/失败都要有文字，避免连续重复弹出。 |
| Notification | 需要保留、可行动或多行的信息 | 支持关闭和明确下一步；宽度使用 `--ds-notification-width`，不替代 Modal。 |

- 反馈颜色必须表达语义：Info 使用 `accent / accent-soft`，Success 使用 `success / success-soft`，Warning 使用 `warning / warning-soft`，Error 与危险操作使用 `danger / danger-soft`；不得把所有反馈统一做成深色或同一种颜色。
- Toast/Notification 的状态图标使用对应语义色且不加装饰性圆形底框；背景使用对应 `*-soft` 状态面，描边使用同色低对比混合值。信息内容必须同时有图标、文字和可读状态。
- Toast 用于 360px 内的短结果，默认可自动关闭；Notification 用于 420px 内需要保留、重试或下一步操作的消息。两者均支持 Info、Success、Warning、Danger：Info 为品牌弱背景，Success 为成功弱背景，Warning 为警示弱背景，Danger 为错误弱背景；不得使用深色统一背景、灰色状态图标或“!”字符代替系统状态图标。
- 层级固定为 Dropdown 50、Drawer 60、Modal 70、Toast 80、Tooltip 90；弹窗内的 Select/Popover 使用 `modal-popover` 75，确保其位于所属弹窗之上但低于 Toast；业务代码不得新增任意 `z-index`。
- Tooltip、Popover、Dropdown、Select Popup 必须在视口碰撞时翻转或收缩；最大高度内滚动。
- 触控端 Tooltip 不得成为理解或操作的唯一入口；Drawer 和 Modal 在窄屏可采用近全屏样式。

## 17. 响应式、溢出与国际化

- 1200px 以下使用 12px 网格/模块间距，禁止 14px 响应式例外；768px 以下为单列并使用 12px 间距。
- 工具栏空间不足时保留页面主操作，次要操作收进 More；搜索与复杂筛选可折叠进入 Drawer。
- Tab 空间不足时采用横向滚动或 More，不允许挤压文字至不可读；Modal 在窄屏转为近全屏。
- 文件名、长英文、版本号允许省略但需可查看完整内容；数字与单位、日期与时区、状态图标与状态文字不得断行分离。
- 每个业务组件需声明紧凑、标准、展开三种容器适配策略，以及唯一的内部滚动容器。

## 18. 版本管理与自动化验收

### 18.1 发布与变更

设计系统当前版本为 `1.2.0`，状态为 Active，适用 light / dark、desktop-web / pad-web。完整发布历史只维护在仓库根目录的 `CHANGELOG.md`，本文件不重复保存版本表。

- 新 Token、组件契约或废弃规则需要设计和前端共同评审。
- 破坏性变更必须提供替代 Token/组件、迁移期限和视觉回归截图。
- 组件状态标记为 Draft、Beta、Stable 或 Deprecated；业务页面只可依赖 Stable 组件，除非评审明确允许。

### 18.2 自动化验收

提交前执行：

```bash
npm run check
```

在独立规范仓库中，该命令验证：目录完整、三个发布版本一致、JSON 可解析、核心 Token 完整、22 项组件契约字段完整、必需文档章节存在、适配器只引用已发布 Token。

在原型工程根目录执行同名命令时，还会检查规范到组件实现的映射并执行生产构建。前端项目接入后，应建立自己的实现映射、视觉回归和构建检查，不能把规范仓库校验当作页面验收的替代品。

人工视觉回归仍需覆盖 Light/Dark、desktop/pad、Default/Hover/Pressed/Focus/Selected/Checked/Open/Expanded/Disabled/Loading/Readonly/Error/Success/Empty、键盘操作与 `prefers-reduced-motion`。

### 18.3 前端交付物

- `docs/ui-guidelines.md`：规范与验收的唯一文字依据。
- `tokens/design-tokens.json`：light / dark、共享、状态和组件 Token 的机器可读唯一来源。
- `components/component-specs.json`：22 项基础组件的机器可读契约；包含用途与边界、参数、状态、关联 Token、无障碍、响应式、示例和验收项。
- `adapters/ant-design-theme.ts`：Ant Design 主题映射示例，可复制到前端工程后按实际依赖调整。

交付文件的使用边界和 Token 引用规则见 `docs/token-integration.md`。原型工程的样式文件仅用于维护原型，不作为前端项目的接入文件。

### 18.4 组件交付契约

`components/component-specs.json` 是组件规范的唯一机器可读来源；每个前端实现将其中的行为参数映射到团队已批准的基础组件，不能通过页面私有样式改写同一契约。

| 类别 | 覆盖组件 |
| --- | --- |
| 通用 | Button、IconButton、Tag |
| 导航 | Tabs、Menu / Dropdown |
| 数据录入 | Input / TextArea、Select、Checkbox、Upload |
| 数据展示 | Table |
| 反馈 | Modal、Drawer、Tooltip / Popover、Toast / Notification、Empty / Loading / Error |
| 其他 | 按组件契约补充；未覆盖组件须先完成同等字段后才能进入 Stable。 |

每个组件契约必须完整包含以下内容：

- 用途、适用场景与不适用场景，避免将不同交互模式混用；
- 参数 / API 的名称、取值、是否必填和设计含义；
- Default、Hover、Pressed、Focus、Selected、Disabled、Loading、Error、Success、Read-only 等适用状态；不适用状态必须明确省略；
- 已发布 Token、键盘与读屏规则、响应式/溢出行为；
- 可复制的参考实现和可执行的验收项。

新增或修改组件时，必须同步更新契约、Token（如有）、主题映射、设计规范中心和静态验收；只改视觉预览或只改业务页面均不构成发布。

## 19. Vibe Coding 生成约束

```text
只使用已发布的 --ds-* Token 和平台基础组件；禁止硬编码普通页面颜色、圆角、阴影、间距和 z-index。
所有可操作组件提供 Default、Hover、Pressed、Focus、Disabled；可选择组件额外提供 Selected、Checked 或 Open。
Pressed 仅代表按压过程；Selected 代表持续选择，二者不得命名或实现为 Active。
表单字段必须有 Label、帮助/错误位置和 Readonly/Disabled 区别；异步提交必须有 Loading 和防重复提交。
表格必须支持 Loading、Empty、Error，且按需要明确筛选、排序、行选择、展开和批量操作规则。
Tooltip、Popover、Drawer、Toast、Notification 必须复用平台控件和层级，不自行创建全局浮层。
状态切换不能改变组件尺寸或造成布局跳动；触控端不可依赖 Hover。
```

## 20. 页面模板、业务组合与页面级状态

### 20.1 模板通用骨架

每个页面模板都必须明确以下区域，未适用的区域应明确省略，不能由业务页面临时决定：

```text
Page
├── Header：面包屑（按需）、标题、说明、页面主操作
├── Toolbar：搜索、筛选、视图切换、批量操作或局部操作（按需）
├── Content：唯一的页面主滚动容器
└── Fixed actions / Pagination：固定提交区或分页（二者按模板适用）
```

- Header 的标题和说明在左，页面级主操作在右；同一 Header 最多一个主按钮。上下文操作、批量操作和行内操作不得挤入页面主操作区。
- Toolbar 位于 Header 与 Content 之间。筛选条件过多时保留高频条件，将次要条件收纳至 More 或 Drawer；筛选结果必须可见、可清除。
- `.ds-page__content` 或 `.ds-page__scroll` 是模板指定的唯一主滚动容器；表格、日志、画布等可声明自己的局部滚动容器，但不能使 `body` 产生业务内容滚动。
- 固定提交区使用 `.ds-page__fixed-actions`，仅用于保存、发布、下一步等完成当前任务的操作；需要分页的列表页将分页置于结果区底部，不能与固定提交区共用同一位置。
- Loading、Empty、Error、Permission 等页面级状态替换或覆盖 Content，不替换 Header 和已生效的筛选条件，除非页面已被删除或无权访问。

### 20.2 页面模板矩阵

| 模板 | Header / 主操作 | Toolbar、内容与分页 | 滚动与固定区域 | 空、错、加载及业务模式 |
| --- | --- | --- | --- | --- |
| 列表页 `.ds-page--list` | 左侧标题、结果范围或说明；右侧新建/导入等一个主操作。 | Toolbar 放搜索、筛选、视图切换；Content 为表格或卡片结果；分页在结果区底部。 | 结果区滚动；筛选和分页不随行内容横向滚动。 | 模式：查询、筛选、批量管理。无数据与无搜索结果必须区分；首次 Loading 使用结果骨架，刷新保留结果。 |
| 详情页 `.ds-page--detail` | 左侧对象名称、状态和摘要；右侧编辑、更多或危险操作。 | 无通用筛选和分页；主内容按信息分组，按需使用右侧摘要/操作栏。 | 主内容滚动；侧栏有独立滚动需求时只滚动侧栏自身。 | 模式：查看、判断、单对象操作。对象删除时保留 Header 上下文并将 Content 换为“内容已删除”状态和返回列表入口。 |
| 表单页 `.ds-page--form` | 左侧任务标题和必要说明；主操作在固定提交区，不放在 Header。 | 无分页；字段按分组组织，长表单可提供锚点导航。 | 表单主体滚动，提交区固定在底部。 | 模式：创建、编辑、申请。初始加载为字段骨架；保存 Loading 不清空填写内容；无权限时字段不显示可编辑态。 |
| 配置页 `.ds-page--config` | 左侧配置名称和状态；右侧仅放预览、更多等非提交操作。 | 左侧导航树或步骤，中间配置内容，按需右侧说明/校验摘要；无分页。 | 各栏独立内部滚动；提交区固定在配置内容底部。 | 模式：持续配置、发布。局部加载只替换对应配置分组；离线或只读时保留内容并禁用提交。 |
| 数据看板 `.ds-page--dashboard` | 左侧标题、时间范围或说明；右侧刷新、导出等全局操作。 | 全局筛选在 Header 下；指标、图表、列表按 12 列栅格排布；列表卡片自行分页或展示“查看全部”。 | 页面主内容滚动；每个卡片仅在自身列表/日志溢出时内部滚动。 | 模式：监控、分析、概览。卡片允许局部 Loading / Error / Empty，不因单卡失败清空整个看板。 |
| 分步流程页 `.ds-page--workflow` | 左侧流程名称和当前步骤；右侧只放保存草稿等辅助操作。 | 步骤导航在内容顶部或左侧；当前步骤内容独占 Content；无分页。 | 当前步骤内容滚动；上一步、下一步、提交固定在底部。 | 模式：导入、向导、发布。切换步骤前校验当前步骤；已完成步骤可回看，未完成步骤不可跳过（除非业务明确允许）。 |
| 工作台 `.ds-page--workbench` | 顶部展示当前任务、全局状态和任务级操作。 | 左侧资源/队列，中间主任务区，右侧检查器或上下文信息；无通用分页。 | 三栏均可独立滚动；中心主任务区优先获得宽度。 | 模式：持续操作、任务处理。局部刷新只更新对应栏；断网或权限变化以栏级提示呈现，不遮挡其他可用区域。 |
| 全屏编辑器 `.ds-page--editor` | 顶部任务栏包含标题、保存状态和少量关键操作。 | 左侧资源，中间画布，右侧属性；画布工具栏在画布内容内，不作为页面级浮层；无分页。 | 画布、资源、属性三栏各自滚动或缩放；仅画布可占满剩余空间。 | 模式：可视化编辑、建模。保存/发布固定在顶部任务栏；内容 Loading 保留画布框架，错误不遮挡撤销、返回等逃生操作。 |
| 左右分栏页 `.ds-page--split` | Header 说明当前集合或当前对象；主操作归属当前上下文的一侧。 | 左栏为列表、筛选和分页；右栏为详情、预览或编辑；不把两栏内容混为单一表格。 | 左右栏独立滚动；窄屏按“列表 → 详情”纵向堆叠。 | 模式：主从浏览、选择后编辑。右栏未选择时显示引导 Empty；左栏刷新不清空已打开的右栏内容。 |
| 弹窗表单 | Header 左侧为任务标题，Footer 右侧为唯一确认主操作，取消在其左侧。 | Body 为字段和帮助信息；无页面筛选和分页。 | 仅 Body 滚动，Header/Footer 固定；最大尺寸遵循第 3.2 节。 | 模式：短创建、短编辑、二次确认。表单校验、Loading 和 Error 在 Body/字段附近显示；关闭未保存内容需确认。 |
| 抽屉详情 | Header 左侧为对象名称和状态，右侧为关闭与上下文操作。 | Body 为详情、时间线或辅助配置；按需在 Footer 放提交操作；无分页。 | 仅 Drawer Body 滚动，Header/Footer 固定。 | 模式：不离开上下文的详情、连续配置。加载中保留 Drawer 壳；对象删除、无权限或接口失败均在 Body 内说明并提供可行去向。 |

当前原型的落地基线：软件产品和装机记录使用列表页模板；产品包/版本管理以及自定义首页方案预览使用左右分栏模板；自定义首页编辑使用全屏编辑器模板；编辑器画布的局部图层是唯一允许使用数值层级的场景，且不得越出画布容器。新增页面必须先选择上述模板之一，并在代码评审中注明不适用区域。

### 20.3 可复用业务组合

下列组合位于基础组件之上，页面应优先复用其信息结构和状态规则，不得每页重新发明同一流程。

| 业务组合 | 固定结构 | 关键行为与状态 |
| --- | --- | --- |
| 搜索 + 筛选 + 结果列表 | 搜索框、已生效筛选、结果数、结果区、分页 | 输入防抖不清空现有结果；无结果保留筛选并提供清除筛选；请求失败提供重试。 |
| 批量选择 + 批量操作 | 行选择、已选数、批量操作栏、清除选择 | 仅选中至少一项后显示操作栏；危险批量操作必须确认并显示影响数量。 |
| 创建 / 编辑表单 | 标题、字段分组、字段帮助/错误、固定提交区 | 编辑保留初始值；提交 Loading 防重复；成功后的关闭、停留或跳转由页面明确说明。 |
| 删除二次确认 | 对象名称、影响范围、危险说明、取消/确认 | 确认按钮使用 danger；取消不改变数据；删除成功后回到仍有效的上级列表或上下文。 |
| 状态回退确认 | 对象名称、当前状态、回退后的影响、取消/确认 | 取消发布、停用、终止等会改变线上状态或可编辑性的操作必须二次确认；可恢复的回退使用品牌主按钮，不可逆或有数据损失风险时才使用 Danger；正文说明回退后哪些内容会受影响。 |
| 文件上传 | 选择文件、格式/大小说明、文件列表、逐项状态 | 保留原生可访问文件选择；上传、解析、失败、重试和移除逐项反馈；不因单文件失败丢失其他文件。 |
| 导入与导出 | 导入步骤/校验结果或导出范围/进度 | 导入先校验再确认写入；导出显示生成中、完成或失败，长任务可后台继续。 |
| 设备在线状态 | 状态图标/文字、最后更新时间、必要操作 | 在线、离线、未知均使用文字和图形补充；离线时保留最近数据并标注更新时间。 |
| 任务执行状态 | 任务标识、阶段、进度、开始/结束时间、操作 | 等待、执行、成功、失败、已取消有明确语义；取消高风险或不可逆时确认。 |
| 日志查看 | 日志级别、时间、来源、内容、筛选、定位到底部 | 仅日志面板内部滚动；新日志到达时不强制抢占阅读位置，提供“回到最新”入口。 |
| 参数配置 | 分组、字段帮助、校验、差异/默认值、提交区 | 只读、禁用、错误和已修改状态可区分；未保存离开必须确认。 |
| 长任务进度 | 任务名称、当前阶段、总进度、耗时、后台入口 | 关闭页面后任务可继续时需明确说明；失败说明可恢复动作，完成给出结果入口。 |
| 权限不足 | 权限说明、影响范围、返回或申请权限入口 | 不显示无效重试；保留可访问的页面导航和非受限信息。 |
| 数据加载失败 | 错误标题、简短说明、重试、必要时返回入口 | 有缓存时保留缓存和错误提示；无缓存时替换 Content，不能只留空白。 |

### 20.4 页面级状态矩阵

页面状态必须定义在 Content 或具体模块内；Header、导航和已生效筛选在安全情况下继续保留。图标优先使用系统图标；仅完整 Empty / Error 页面可使用统一插画，不能用装饰插画替代状态说明。

| 状态 | 显示位置与内容 | 操作与去向 | 是否保留原内容 |
| --- | --- | --- | --- |
| 初始状态 | Content 中显示首次进入的说明或可执行的起始操作。 | 提供创建、选择或开始操作；进入对应流程。 | 无既有内容。 |
| 加载中 | Content 使用与最终结构接近的 Skeleton；标题与 Toolbar 保持稳定。 | 默认无操作；超过正常等待时间可按产品规则显示取消或返回。 | 首次加载不保留；刷新不使用此状态清空旧内容。 |
| 局部加载 | 对应卡片、分组、表格区域或按钮内显示进度。 | 仅影响该模块；其他区域仍可操作。 | 保留模块已有内容或固定占位。 |
| 无数据 | 主结果区居中显示“暂无 [对象]”、原因和简短说明。 | 有创建权限时提供创建入口；否则不提供无效按钮。 | 替换结果区，不替换 Header/筛选。 |
| 无搜索结果 | 结果区显示“未找到符合当前条件的结果”。 | 提供清除筛选/搜索入口，回到默认数据集。 | 保留搜索词、筛选条件和 Toolbar。 |
| 网络异常 | Content 或受影响模块显示网络不可用说明。 | 提供重试；若有缓存则可继续查看缓存。 | 有缓存则保留并加提示；无缓存替换受影响区域。 |
| 接口异常 | Content 或受影响模块显示用户可理解的加载失败说明，不展示内部错误对象。 | 可恢复时重试；不可恢复时返回上级或联系支持。 | 同网络异常处理；不清空无关模块。 |
| 无权限 | Content 或受限模块显示权限不足和影响范围。 | 提供返回、切换对象或申请权限入口；不提供重试。 | 保留导航和允许查看的上下文，不展示受限数据。 |
| 内容被删除 | 原详情/编辑 Content 显示“内容已删除”。 | 返回列表、关闭 Drawer/Modal 或选择其他对象。 | 不保留可能已失效的对象内容。 |
| 数据过期 | Content 顶部或受影响模块显示最近更新时间和过期提示。 | 提供刷新；刷新失败转为网络/接口异常。 | 保留过期数据，明确其时间。 |
| 部分加载成功 | 页面顶部或模块顶部显示成功/失败摘要。 | 仅为失败模块提供重试。 | 保留成功模块和已获得数据。 |
| 离线 | Header 或受影响 Content 显示离线状态和最近同步时间。 | 保留只读浏览；需要联网的操作禁用并说明原因。 | 保留可用缓存，不伪造实时状态。 |
| 维护中 | Content 或全局提示区显示维护说明与预计恢复信息（若已提供）。 | 提供返回或稍后重试；不提供会失败的主操作。 | 可安全展示的只读内容可保留，其余替换为维护状态。 |

### 20.5 响应式、溢出与拉伸规则

- 支持的最小视口为 320 CSS px；页面根节点不得设置大于 320px 的 `min-width`。小于 320px 不另行承诺布局，浏览器缩放不视为响应式方案。
- ≥1200px：使用 12 列栅格、24px 页面边距、16px 模块间距；导航为 232px、详情侧栏为 320px。多栏模板保持并列，中心任务区优先伸缩。
- 768–1199px：页面边距 20px、网格/模块间距 12px；导航为 208px、通用侧栏为 272px、详情侧栏为 300px。保留主任务区，次要字段、低频筛选和辅助操作先收纳。
- 320–767px：页面边距 16px、4 列栅格、网格/模块间距 12px；导航和侧栏宽度均为 100%，多栏模板按内容顺序纵向堆叠。列表详情分栏先显示列表，选择后显示详情并保留返回列表入口。
- 表格只能由表格容器横向滚动，页面和 `body` 不得因表格横向滚动；收敛顺序固定为：收紧非核心列 → 隐藏低优先级列 → 固定主标识/操作列 → 表格容器横向滚动。
- 卡片区使用当前 12 列或 4 列栅格。当前容器不足以容纳卡片声明的最小列跨度时，卡片改为独占一行，不得压缩文字、图标和操作热区。
- 页面标题最多两行后截断；对象名、文件名、版本号、编号等不可拆分字段单行省略，并通过详情、Popover 或其他非 Hover 唯一入口查看完整值。说明性长文本允许换行，使用 `overflow-wrap: anywhere` 防止长英文或 URL 撑破容器。
- Toolbar 空间不足时保留一个页面级主操作；次要操作收纳至 More，搜索与复杂筛选可进入 Drawer。按钮不得通过缩小到未发布尺寸或折行挤压来适配。
- Modal 最大宽高保持 `calc(100vw - 48px)` 与 `calc(100vh - 48px)`；仅 Body 内部滚动，Header/Footer 固定。Drawer 同样仅允许 Body 滚动。
- 可拉伸的看板卡片、图表、日志、3D 或编辑器区域不得整体等比缩放。紧凑态先隐藏次级信息和收纳低频操作，标准态展示完整核心内容，展开态增加明细、趋势或可见行数；每个业务组件必须声明三态触发区间、可隐藏字段和唯一内部滚动容器。

## 21. 动效规范

动效只用于表达状态变化、空间关系和操作结果，不用于装饰或延迟用户操作。业务页面只能使用以下已发布 Token，不能自行声明时长、缓动曲线或全局关键帧。

| Token | 已发布值 | 用途 |
| --- | --- | --- |
| `--ds-motion-duration-fast` | 120ms | Focus、Pressed、输入框/菜单项 Hover 等微反馈。 |
| `--ds-motion-duration-mid` | 160ms | Hover 颜色、状态切换、下拉菜单、列表项增删、页面内容切换。 |
| `--ds-motion-duration-slow` | 240ms | Modal、Drawer 等空间关系明确的进入动效。 |
| `--ds-motion-duration-loading` | 800ms | Loading 指示器完整旋转一周。 |
| `--ds-motion-ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | 退出、收起。 |
| `--ds-motion-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | 进入、展开。 |
| `--ds-motion-ease-in-out` | `cubic-bezier(0.2, 0, 0, 1)` | 颜色、边框、阴影、尺寸不变的状态切换。 |

保留既有 `--ds-duration-*` 与 `--ds-ease-*` 仅用于兼容存量代码；新页面和新适配代码使用 `--ds-motion-*`。

### 21.1 动效场景矩阵

| 场景 | 允许的动效 | 时长与缓动 | 禁止项 |
| --- | --- | --- | --- |
| Hover 颜色过渡 | 背景、边框、文字、阴影颜色变化；不得改变占位尺寸。 | `mid` + `ease-in-out`；极轻量输入反馈可用 `fast`。 | 位移、弹跳、缩放和延迟触发。 |
| Modal 进入 / 退出 | 遮罩淡入/淡出；内容进入可淡入并从 0.96 缩放至 1，退出反向。 | 进入 `slow` + `ease-out`；退出 `mid` + `ease-in`。 | 从屏幕边缘滑入、长于 `slow`、关闭后继续阻塞操作。 |
| Drawer 滑入 / 退出 | 遮罩淡入/淡出；面板沿其打开方向滑入、反向退出。 | 进入 `slow` + `ease-out`；退出 `mid` + `ease-in`。 | 整页跟随缩放、跨方向滑动、在内容未关闭时提前移除焦点限制。 |
| Dropdown / Popover / Select 展开 | 淡入，最多从 `scale(0.96)` 与 `translateY(-2px)` 恢复到原位。 | 进入 `mid` + `ease-out`；退出 `fast` + `ease-in`。 | 超过 2px 的位移、弹簧/弹跳、因动效改变浮层最终定位。 |
| Loading 旋转 | Spinner 匀速旋转；Skeleton 只允许低对比度、尺寸固定的提示。 | `loading` + `linear` 无限循环。 | 用旋转替代错误说明；因 Loading 改变按钮、卡片或表格尺寸。 |
| 页面切换 | 仅 Content 可淡入/淡出；Header、导航、已生效筛选保持稳定。 | `mid` + `ease-in-out`。 | 整页横向滑动、全局路由转场、清空原内容后再闪现新内容。 |
| 列表增删 | 新项淡入并最多上移 2px；删除项淡出后再移除。排序/筛选变化直接更新结果。 | `mid` + `ease-out`（新增），`fast` + `ease-in`（删除）。 | 动画 `height`、连续重排、对长列表逐项播放。 |
| 状态切换 | 颜色、图标、文字和 Focus Ring 同步切换；成功、错误、离线等必须保留可读文案。 | `mid` + `ease-in-out`。 | 仅靠闪烁或颜色表达状态；用动效掩盖失败或加载超时。 |

### 21.2 实现与无障碍约束

- 仅可动画 `opacity`、`transform`、颜色、边框色和阴影；禁止通过动画 `width`、`height`、`margin`、`padding` 改变布局，也不允许因动效造成内容跳动。
- 进入动效不得阻塞点击、键盘 Focus、Esc 关闭或异步请求；退出动效结束后才卸载浮层，焦点恢复规则不因动效改变。
- 同一元素同一时刻只承担一种主视觉动效。Loading、Error、Success 等业务状态优先级高于装饰动效。
- `prefers-reduced-motion: reduce` 下禁用非必要的位移、缩放、旋转和列表增删动效；Hover/Focus/状态变化立即完成，Spinner 静止但保留 Loading 文案或图形。
- 动效验收应覆盖 Light/Dark、键盘操作、触控操作、Loading、Error、Success、页面切换和减少动效偏好；任何状态不得仅通过动效传达。
