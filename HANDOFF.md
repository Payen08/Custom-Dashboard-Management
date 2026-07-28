# 数字造机 Web 交接文档

更新日期：2026-07-23  
项目目录：`/Users/mac/Downloads/原型APP/Custom Dashboard Management`

## 1. 任务目标

这是“墨影工作台 / 数字造机”的高保真前端原型。核心目标不是还原单张设计稿，而是把以下业务模块做成可演示、可操作且风格一致的 Web 端：

- 墨影工作台登录、服务地址配置和三业务入口：软件管理、授权平台、数字造机。
- 自定义首页：方案列表、预览、编辑画布、组件拖拽、组件属性、保存、导出、删除、导入组件。
- 型号模板：型号列表与详情、发布/取消发布、3D 场景、设备结构、软件配置、模型结构和节点参数。
- 机器人组件库：独立的 3D 组件管理模块，包含组件资料、参数配置、模型结构和 URDF 导入。
- 软件产品与版本管理：三级产品目录、版本包、测试包、批量操作及发布相关交互。
- 装机记录：列表、查询、编辑和装机详情中的软件安装状态与安装操作记录。

当前工程以本地状态和示例数据驱动，尚未接入真实后端、文件服务、ROS 或数据库。

## 2. 最重要的业务边界

### 首页组件面板和机器人组件库不是同一个模块

这是最近最容易被误改的边界，务必保持：

| 概念 | 代码状态 key | 入口 | 用途 | 主要实现 |
| --- | --- | --- | --- | --- |
| 首页编辑组件面板 | `components` | 自定义首页的“编辑面板” | 搜索、管理、拖拽 KPI/地图/告警/任务等首页组件到画布 | `src/app/components/ComponentLibrary.tsx` |
| 机器人组件库 | `robotComponents` | 数字造机左侧主导航“组件库” | 管理一个机器人硬件组件的 3D 预览、结构、URDF 和参数 | `RobotComponentLibrary`，位于 `src/app/components/RobotModelManager.tsx` |

`src/app/App.tsx` 中：

- “编辑面板”点击时必须执行 `setIsEditing(true)` 与 `setActiveEditorNav('components')`。
- 主导航“组件库”必须使用 `robotComponents`，且仅在 `!isEditing` 时渲染 `RobotComponentLibrary`。
- 不要把 `robotComponents` 改回 `components`，否则编辑面板会再次错误跳转到 3D 组件库。

## 3. 已完成内容

### 3.1 全局设计体系

- 主题核心色：`#241F7D`；浅色大底保持 `#F0F0F0`。
- 约束：卡片圆角 `16px`、按钮圆角 `8px`、常用表单/搜索/导入/导出/刷新/新建按钮高 `40px`、正文默认 `14px`。
- 弹窗、输入框、按钮、表格和状态色已收敛到 HeroUI 风格的内部封装；输入框应是白底 + 灰色描边。
- 设计规范和可检查的 Token 已补充：
  - `guidelines/docs/ui-guidelines.md`
  - `guidelines/tokens/design-tokens.json`
  - `guidelines/components/component-specs.json`
  - `scripts/check-design-system.mjs`
- `npm run check:design-system` 和 `npm run build` 可用于交付检查；`npm run check` 会顺序执行二者。

### 3.2 工作台与登录

- 登录页、服务地址配置页和工作台启动页已实现。
- 服务地址配置支持返回登录、导入、导出、测试和确认。
- 登录页背景资源：`src/imports/login-workspace-bg.png`。
- 主要文件：`src/app/components/WorkspaceLogin.tsx`、`src/app/App.tsx`。

### 3.3 自定义首页

- 方案列表可创建、复制、导出、删除和切换。
- 编辑器包含独立顶部操作区、左侧首页组件面板、中央栅格画布、右侧组件属性面板。
- 画布支持组件添加、选择、移动、缩放、删除和自动填补。
- 编辑态不能被机器人组件库入口截获，最近已通过 `robotComponents` key 修复。
- 主要文件：
  - `src/app/App.tsx`
  - `src/app/components/ComponentLibrary.tsx`
  - `src/app/components/PanelList.tsx`
  - `src/app/components/CanvasArea.tsx`
  - `src/app/components/PropertiesPanel.tsx`
  - `src/app/components/ComponentManagerDialog.tsx`

### 3.4 组件管理与首页组件导入

- “组件管理”和首页组件库已统一到同一组件数据源。
- 导入组件采用上传组件包的交互，可填写描述和标签；不是简单输入一个组件名。
- 新建组件定位为上传组件，不提供“分类”和“默认尺寸格子”的伪配置。
- 代码：`ComponentManagerDialog.tsx`、`useComponentCatalog.ts`、`shared.ts`。

### 3.5 型号模板

- 已实现型号库列表、搜索、创建、编辑、删除、发布/取消发布、URDF/JSON 导出。
- 已发布型号的编辑按钮不置灰；点击后提示“请先取消发布后再编辑”。
- 型号详情当前按用户最后确认的布局：左侧基础资料与软件配置，中间 3D 场景，右侧设备结构与节点参数。
- 右上“设备结构”用于机械臂、底盘、底座等设备层级；模型 Link/Joint/Mesh 结构已移到独立机器人组件库。
- 设备结构和模型结构可新增、删除、编辑，树内部可调整层级；结构区域固定，树本身滚动，节点参数面板固定。
- 文件：`src/app/components/RobotModelManager.tsx`。

### 3.6 机器人组件库（3D 组件模块）

- 左侧：当前示例“仙工底盘”的名称、标识 `xiangong-base`、类型、描述、子类型、可编辑底盘参数和尺寸。
- 中间：3D 底盘示意和坐标信息。
- 右侧：模型结构树及节点 Origin / RPY 参数编辑。
- Link 下可有多个 Mesh 子节点，Tree 支持 Link / Joint / Mesh 层级。
- URDF 导入已改为两步：
  1. 上传并解析 `.urdf` / `.xml`；
  2. 预览 Link、Joint、Mesh 数量和层级；点击“确认导入”后才替换当前结构。
- URDF 弹窗曾因 Portal 不能继承局部 `--robot-*` CSS 变量而透明，已在 `RobotComponentLibrary` 通过 `useEffect` 同步 Token 到 `document.documentElement` 修复。
- 文件：`src/app/components/RobotModelManager.tsx`，约 `RobotComponentLibrary` 定义处。

### 3.7 软件产品、版本与目录

- 软件产品页和装机记录已使用一致的表格式页面骨架。
- 产品目录是三级结构：产品类型 → 子品类 → 产品。
- 新增产品交互做成级联流程：产品类型、子品类都支持选择已有或输入新值；根据点击的目录层级锁定上级，避免跳级创建。
- 子品类和产品支持名称、标识符、描述；子品类/产品有关联软件配置。
- 版本管理包含包描述、发布说明、批量删除、共同版本和多个型号测试包的示例数据/呈现逻辑。
- 文件：
  - `src/app/components/ProductVersionManager.tsx`
  - `src/app/components/SoftwareManager.tsx`
  - `src/app/components/ProductUI.tsx`

### 3.8 装机记录

- 已有装机记录列表、按项目/机器人/IP 查询、刷新、导出、详情、编辑入口。
- 装机详情按最终设计：已安装/未安装切换；已安装条目可展开，以紧凑记录卡展示安装包、时间、操作员、版本和动作（安装、回退、手动、卸载），不是嵌套大表格。
- 文件：`src/app/components/InstallationRecordsManager.tsx`。

## 4. 当前问题与风险

### 高优先级

1. **编辑面板入口刚修复，建议人工回归一次。**
   - 路径：数字造机 → 首页自定义 → 选择方案 → 编辑面板。
   - 预期：显示原有的首页编辑器，左侧为 `ComponentLibrary`，不是 `RobotComponentLibrary`。
   - 主导航 → 组件库：预期进入 3D 机器人组件库。

2. **状态均为内存状态。**
   刷新页面会回到初始示例数据；上传、保存、发布、导入、导出大多是前端演示行为，需要接 API 才能成为正式业务功能。

3. **URDF 解析仅适合原型。**
   目前以浏览器 FileReader + 项目内解析函数读取 XML；尚未覆盖复杂 xacro、外部 mesh 路径解析、材质、惯量、传动或 ROS 包路径。

### 中优先级

4. **3D 视图为视觉示意，不是真实模型渲染器。**
   当前场景是 SVG/静态示意，用于原型展示坐标、结构和选择关系；如需真实 URDF/mesh 装配，应接 Three.js 或专业机器人模型渲染链路。

5. **组件与型号数据尚未互通。**
   机器人组件库当前展示固定的“仙工底盘”示例；型号模板、组件库、软件产品之间尚未建立真实的共享实体和引用关系。

6. **存在较大的打包体积告警。**
   `vite build` 当前会提示 JS chunk 超过 500 kB，但构建成功。后续可按模块动态导入或做 Rollup manual chunks。

7. **工作区含已有未提交设计规范改动。**
   `git status` 当前有 `guidelines/*`、`scripts/check-design-system.mjs`、`ArcoLike.tsx`、`ProductUI.tsx`、多份样式文件等修改。不要随意回滚，先确认这些改动是否为用户的最新规范工作。

## 5. 下一步计划

按优先顺序建议：

1. 手动检查“编辑面板”和主导航“组件库”两个入口，确认不存在回归。
2. 等用户继续给组件库/型号模板交互反馈，再迭代 UI；不要主动将 3D 示例改成另一套风格。
3. 若开始接真实数据，先定义领域模型与 API：`RobotModel`、`RobotComponent`、`TopologyNode`、`SoftwareProduct`、`PackageVersion`、`InstallationRecord`。
4. 为 URDF 增加更完整的解析/校验和导入结果差异确认，不要在上传后直接覆盖已有结构。
5. 为本地状态增加持久化或接入后端；优先覆盖型号发布状态、产品目录、包版本、装机记录和首页方案。
6. 在功能稳定后再处理 Vite 分包告警，避免无关重构干扰视觉迭代。

## 6. 踩过的坑

### 6.1 两个组件库共用 `components` key

这是本会话最重要的回归。最初在主导航增加 3D 组件库时误用了 `components`，它和编辑画布的组件面板共用同一个 key，导致点击“编辑面板”直接进入 3D 组件库。

**正确做法：**

- `components`：仅首页编辑面板；
- `robotComponents`：仅主导航 3D 组件库；
- 主模块分支必须在 `!isEditing` 下才可渲染。

### 6.2 HeroUI Portal 不继承局部主题变量

`ArcoModal`/HeroUI Modal 是 Portal。若 `--robot-*` 只声明在某个页面根容器，弹窗会拿不到 `--robot-surface` 和 `--robot-overlay`，表现为透明，底层 3D 场景会穿透弹窗。

**当前修复：**`RobotComponentLibrary` 挂载时把 `ROBOT_THEME_VARS[activeTheme]` 写入 `document.documentElement`。

后续如增加更多局部 robot scope 的 Portal，需统一从全局主题提供 Token，或让封装组件支持显式 Portal Theme Provider。

### 6.3 HeroUI 导出和上下文兼容

- 之前误从 `@heroui/react` 直接导入不存在的 `Textarea`，引发 Vite 模块导出错误。
- 某些 HeroUI 原子组件直接使用会缺少上下文，出现 `render2 is not a function`。
- 项目已通过 `ArcoLike.tsx` / `HeroUI.tsx` 封装 Button、Input、Modal、Tag 等，新增 UI 优先复用封装，不要随手直连第三方组件。

### 6.4 弹窗不要随意加图标和冗余说明

用户最终规范：

- 非必要不显示标题说明；
- 标题左侧默认不要图标；
- 删除类弹窗只说明必要后果，不重复堆叠提示；
- 所有弹窗遵循现有 HeroUI 风格、白底、16px 容器圆角、8px 按钮圆角、40px 操作按钮。

### 6.5 设计稿是需求输入，不是像素抄写目标

用户反复强调：原型主要说明信息架构与交互，最终 UI 必须依照 HeroUI 组件规范、全局 Token 和页面层级重新设计；不能把原型中的拥挤结构、冗余标题或临时大表格原样照搬。

## 7. 开发与验证

```bash
cd "/Users/mac/Downloads/原型APP/Custom Dashboard Management"
npm run dev
npm run check
```

`npm run build` 在本次交接前已通过。构建会给出大 chunk 警告，但不会失败。

## 8. 重要文件索引

| 文件 | 说明 |
| --- | --- |
| `src/app/App.tsx` | 顶层状态、启动页、数字造机导航、首页编辑/预览和模块分流。 |
| `src/app/theme.ts` | 浅色/暗色语义 Token；主题色与 robot/app scope 变量。 |
| `src/app/components/RobotModelManager.tsx` | 型号模板、3D 示意、设备结构、模型结构、节点参数、机器人组件库、URDF 导入。 |
| `src/app/components/ComponentLibrary.tsx` | 自定义首页编辑器的拖拽组件面板，不是机器人组件库。 |
| `src/app/components/ComponentManagerDialog.tsx` | 首页组件管理/导入。 |
| `src/app/components/ProductVersionManager.tsx` | 软件产品目录、版本包、测试包、创建/编辑/删除交互。 |
| `src/app/components/InstallationRecordsManager.tsx` | 装机记录列表、详情弹窗与编辑。 |
| `src/app/components/WorkspaceLogin.tsx` | 登录和服务地址配置。 |
| `src/app/components/ArcoLike.tsx`、`src/app/components/HeroUI.tsx` | HeroUI 风格封装；优先复用。 |
| `guidelines/README.md` | 可独立上传 GitLab 的设计规范交付入口。 |
| `guidelines/docs/ui-guidelines.md` | 当前视觉、交互、表单、弹窗、表格与验收规范。 |

## 9. 与用户沟通的注意事项

- 用户非常重视“功能边界”和“不要擅自合并概念”；先读现有路由和命名再改。
- 不要把用户给的截图直接像素复刻；应保留其业务信息和交互意图，再输出符合 HeroUI 的实现。
- 不要自作主张把已发布型号的编辑按钮置灰；目前约定是允许点击，并给出“先取消发布”的提醒。
- 不要未经要求做大规模重构、回滚用户未提交改动或替换既有颜色基础。
- 完成修改后优先执行 `npm run build`；视觉问题再按需回归，不需要为了展示而频繁启动或重启服务器。
