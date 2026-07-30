# 数字造机 Web 原型交接文档

更新时间：2026-07-30

项目目录：`/Users/mac/Downloads/原型APP/Custom Dashboard Management`

当前分支：`master`

最近提交：`db0f474 chore: 更新API地址为localhost:10882，更新guidelines结构，修改组件样式`

> 本工作区存在大量未提交修改和新增文件。它们包含用户持续确认的 UI、交互和设计规范成果，不要执行 `git reset --hard`、`git checkout -- .` 或批量覆盖。

## 1. 任务目标

这是“墨影工作台 / 数字造机”的高保真可交互 Web 原型。当前目标是：

1. 保持软件产品、装机记录、型号模板、版本管理、数据管理等模块的视觉与交互一致。
2. 使用项目内部 HeroUI 风格封装和 Design Token，不直接照搬用户提供的低保真原型样式。
3. 将“数据管理”建设为与软件产品、装机记录同级的主导航模块，二级功能包括：
   - 字段字典
   - 构型模板
   - 参数定义
4. 所有业务设计必须符合真实功能逻辑，而不仅是静态页面：
   - 字典字段、取值、级联关系可维护；
   - 构型模板能生成运动链槽位并限制模块规格；
   - 参数定义能按真实组件层级维护字段；
   - 内置数据和自定义数据遵循不同编辑/删除权限。
5. 逐步沉淀全局视觉规范：颜色、字号、圆角、间距、表格、弹窗、抽屉、页面模板、响应式和状态规则。

目前仍是前端原型，数据主要存放在 React 状态和 `localStorage`，没有真实后端、数据库或 ROS 服务。

## 2. 用户已经确认的设计原则

后续修改必须优先遵守：

- 用户提供的截图主要表达信息架构和业务逻辑，不是像素级照抄目标。
- UI 应符合现有 HeroUI 风格封装与产品 Design Token。
- 页面边距、卡片圆角、按钮高度、表格行高需要全局一致。
- 列表页应参考“软件产品”和“装机记录”的页面骨架。
- 表格只保留横向分隔线，不要竖线。
- 搜索与新增按钮放在同一工具栏。
- 只有选中项显示蓝色选中背景，不要让所有树节点都带蓝色条。
- 数据较多时优先使用主从布局、抽屉和内部滚动，不要堆叠很多大卡片。
- 固定分类应使用稳定的导航结构，不要伪装成可新增的动态分类。
- 工具型操作使用“刷新 / 导出”同类白底描边按钮；创建操作使用主按钮。
- 弹窗标题区域避免冗余图标和大段说明。
- 内置名称可调整、标识符不可修改、内置字段及取值不可删除；自定义内容支持完整 CRUD。

## 3. 已完成内容

### 3.1 全局设计体系

- 主色、字号、间距、圆角、阴影、按钮和表格规范已经写入设计规范目录。
- 内部 UI 统一通过 `ProductUI.tsx` / `ArcoLike.tsx` 使用，新增业务组件不要直接随意引入第三方原子组件。
- 设计规范版本当前为 `v1.5.0`。
- `npm run check` 会执行规范校验和 Vite 生产构建。
- 当前约定的核心尺寸：
  - 页面主标题：20px；
  - 正文：14px；
  - 辅助文字：12px；
  - 常用按钮/输入框：40px；
  - 表格表头：44px；
  - 表格数据行：60px；
  - 卡片圆角：16px；
  - 控件/按钮圆角：8px。

主要文件：

- `guidelines/tokens/design-tokens.json`
- `guidelines/components/component-specs.json`
- `guidelines/docs/ui-guidelines.md`
- `scripts/check-design-system.mjs`
- `src/app/components/ProductUI.tsx`
- `src/app/components/ArcoLike.tsx`
- `src/styles/design-system.css`
- `src/styles/arco-like.css`
- `src/styles/style-presets.css`

### 3.2 主导航和数据管理入口

- “数据管理”与软件产品、装机记录同级。
- 点击/悬停数据管理后显示浮层二级导航。
- 二级导航已按用户最后要求精简为纯文字：
  - 字段字典
  - 构型模板
  - 参数定义
- 已移除二级浮层中的“数据管理”标题、图标、描述和右侧箭头。
- 当前二级页面通过事件和 `localStorage` 切换，避免再增加一整列持久二级导航。

关键实现：

- `src/app/App.tsx`
- `src/app/components/DataManagementManager.tsx`
- `src/styles/business/data-management.css`

事件与存储：

- 当前二级页面：`digital-machine-data-management-section`
- 切换事件：`digital-machine:data-management-section`

### 3.3 字段字典

数据模型位于 `src/app/dictionaryData.ts`，包含：

- 分类；
- 字段；
- 枚举取值；
- 字段 `seq`；
- 启用状态；
- 内置/自定义来源；
- 级联规则。

当前预置分类：

- 型号模板分类；
- 组件库分类；
- 项目扩展属性。

组件库分类预置字段：

- 组件类型；
- 子类型；
- 规格。

已完成的交互：

- 左侧为“分类 → 字段”两级树，只保留一条层级引导线。
- 字段按 `seq` 排序。
- 右侧顶部显示分类、字段、标识符、字段说明和明确的“已启用/已停用”状态。
- “枚举取值 / 级联配置”使用分段 Tab。
- Tab、搜索/父字段信息、新增按钮保持同一行。
- 枚举值支持搜索、新增、编辑、启停和删除。
- 内置枚举值可编辑，但标识符只读、删除按钮禁用。
- 自定义枚举值可删除，并同步清理引用它的级联规则。
- 级联配置限定为大 `seq` 字段依赖小 `seq` 字段。
- 数据管理下的字典页与原有“字典配置”页共用 `dictionaryCategories` 数据源。

存储：

- `digital-machine-dictionary-config-v1`

主要文件：

- `src/app/dictionaryData.ts`
- `src/app/components/DataManagementManager.tsx`
- `src/app/components/DictionaryConfigManager.tsx`
- `src/styles/business/data-management.css`
- `src/styles/business/dictionary-config.css`

### 3.4 构型模板

页面入口：`数据管理 → 构型模板`。

已完成：

- 构型列表、搜索、新增、编辑、删除、启停。
- 构型字段：名称、标识符、自由度、启用状态、描述。
- 自由度支持 2～12 轴。
- 根据自由度生成：
  - `BASE`
  - `J1/L1`
  - `J2/L2`
  - 依此类推。
- 列表中的“装配模板”打开具体构型抽屉。
- 顶部“槽位规则”按钮放在“新增构型”旁边，并与“刷新 / 导出”使用同类白底描边样式。
- 槽位规则是全局配置，不属于某一个具体构型。
- 全局槽位规则按底座、关节、连杆维护允许规格，支持同类型全选。
- 规格来源于“字段字典 → 组件库分类 → 规格”。
- 系统通过字段字典的“组件类型 → 子类型 → 规格”级联生成默认规则。
- 装配模板逐槽位配置允许规格，并受全局槽位规则约束。
- 某个具体槽位不选择规格时，表示继承对应类型的全局槽位规则。
- 修改全局规则后，会清理装配模板中超出规则范围的显式规格。
- 支持恢复默认规则、恢复继承状态和保存。
- 旧的构型本地数据会迁移到全局槽位规则结构。

存储：

- 构型：`digital-machine-configuration-templates`
- 全局槽位规则：`digital-machine-global-slot-rules`

主要文件：

- `src/app/components/ConfigurationTemplateManager.tsx`
- `src/styles/business/data-management.css`

### 3.5 参数定义

页面入口：`数据管理 → 参数定义`。

当前采用左右主从结构：

- 左侧：固定组件分类和字段数量；
- 右侧：当前实际参数归属的字段表；
- 顶部：分类/字段搜索和新增字段。

固定一级分类：

- 底盘；
- 机械臂整臂；
- 机械臂模块；
- 升降机构。

“机械臂模块”包含固定二级分类：

- 底座：`arm_module:base`
- 关节：`arm_module:joint`
- 连杆：`arm_module:link`
- 末端：`arm_module:end_effector`

业务规则：

- “机械臂模块”父级只汇总和展开，不直接承载参数字段。
- 新增/编辑字段只能选择末级组件归属。
- 原先直接挂在机械臂模块上的字段会自动迁移到“关节”。
- 父级数量为四个子模块字段数之和。
- 搜索支持一级分类、二级分类、字段名称和标识符。

字段功能：

- 名称；
- 唯一标识符；
- 所属组件；
- 数据类型；
- 启用状态；
- 默认值；
- 新增、编辑、删除、启停。

数据类型：

- 枚举型；
- 整型；
- 浮点型；
- 文本型。

枚举型支持：

- 枚举项显示名称；
- 枚举项标识符；
- 新增/删除枚举项；
- 枚举项标识符重复校验；
- 默认枚举值选择。

同步机制：

- 存储：`digital-machine-parameter-definitions`
- 更新事件：`digital-machine:parameter-definitions-updated`
- 导出读取函数：`readParameterDefinitions()`

目前还没有实际组件参数表单消费该事件，详见“当前问题”。

主要文件：

- `src/app/components/ParameterDefinitionManager.tsx`
- `src/styles/business/data-management.css`

### 3.6 数据管理表格规范

数据管理中的以下表格已统一为软件产品/装机记录样式：

- 字段字典枚举值表；
- 字段字典级联表；
- 构型模板列表；
- 参数定义字段表。

共享类：

- `.data-management-table`
- `.data-management-table--actions`

统一行为：

- 44px 浅灰表头；
- 60px 数据行；
- 16px 水平单元格内边距；
- 仅横向分隔线；
- 无竖线；
- Sticky 表头；
- 行 Hover；
- 操作列右对齐；
- 内容区域内部滚动。

不要再分别给三张表增加互相冲突的表头/行高样式。

### 3.7 型号模板与型号库

本工作区已有较多型号模块改动，主要集中在 `RobotModelManager.tsx`：

- 型号库改为 HeroUI 风格卡片视图，卡片包含表格信息和 3D 预览。
- 型号详情重新整理为左侧信息/软件配置、中间 3D、右侧模型结构/节点参数。
- 顶部冗余信息和面包屑按用户标注精简。
- 软件版本树参考版本管理的产品分类树。
- 只有选中节点显示蓝色背景。
- 模型结构节点支持拖拽调整层级。
- 节点 Hover 操作逻辑、增删改入口和模型结构面板有多轮调整。
- 型号详情中的汇总数据块按用户要求移除。
- 型号库搜索和新增保持同一工具栏。

注意：这里有大量未提交改动，后续接手前应先实际运行确认视觉状态，不要从旧提交重新覆盖。

### 3.8 版本管理与产品分类

`ProductVersionManager.tsx` 已有多轮交互调整：

- 产品类型 → 子品类 → 产品三级目录。
- 树样式被其他模块作为参考规范。
- 大类、子品类、产品 Hover/选中时显示三点菜单。
- 菜单支持新增、编辑、删除。
- 菜单样式使用项目内部 HeroUI 风格，不使用浏览器默认菜单。
- 产品搜索与新增位于同一行。

### 3.9 装机记录与软件产品

这两个页面是当前列表页和表格样式基准：

- `SoftwareManager.tsx`
- `InstallationRecordsManager.tsx`

装机记录：

- 搜索、刷新、导出；
- 首尾列固定；
- 无竖线；
- 详情弹窗只保留关闭按钮，不保留编辑按钮；
- 详情中展示软件安装状态和记录。

后续数据管理表格如果出现样式偏差，优先对照这两个文件，而不是自行创建新的表格视觉。

### 3.10 自定义首页与编辑器

已完成的主要方向：

- 编辑器按用户参考图重新组织顶部、左侧组件库、中央画布和右侧属性面板。
- 组件支持拖拽、移动、缩放、删除和属性配置。
- 首页组件库与机器人 3D 组件库是两个不同概念。
- `components` 仅表示首页编辑组件面板。
- `robotComponents` 表示机器人 3D 组件库。

## 4. 当前问题

### 4.1 高优先级

1. **当前工作区未提交。**
   - 分支仍是 `master`。
   - `git status` 有大量修改和新增文件。
   - 不要假设某个功能已经存在于 Git 历史中。
   - 首次接手应先运行 `git status --short`，再打开当前工作区文件。

2. **用户要求“组件库、外设库、用户管理模块暂时隐藏”，但当前主导航仍显示“组件库”。**
   - `App.tsx` 中 `robotComponents` 仍在 `navItems`。
   - 外设库和用户管理已隐藏。
   - 下一会话应先向用户确认这里的“组件库”是否仍需隐藏，再修改，避免误伤首页编辑器的 `components`。

3. **数据管理仍保留两套字典入口。**
   - 旧入口：主导航“字典配置” → `DictionaryConfigManager`。
   - 新入口：数据管理 → 字段字典 → `FieldDictionaryVersionView`。
   - 两者共用数据，但 UI 不同。
   - 新入口是用户最近持续调整的版本；是否删除旧入口尚未得到明确确认。

4. **参数定义的“同步组件表单”目前只有数据源和事件，没有实际消费方。**
   - 已提供 `readParameterDefinitions()`。
   - 已广播 `digital-machine:parameter-definitions-updated`。
   - 组件库/组件详情参数表单尚未读取这些定义。

5. **所有新增业务数据仍是本地原型数据。**
   - 字典、构型、槽位规则、参数定义使用 `localStorage`。
   - 没有后端并发、权限、服务端校验、版本迁移框架或 API 错误处理。

### 4.2 中优先级

6. **需要一次完整人工视觉回归。**
   建议至少检查：
   - 1440×900；
   - 1920×1080；
   - 1024px 宽；
   - 768px 以下。

   重点查看：
   - 数据管理二级菜单；
   - 字段字典左右结构；
   - 构型模板抽屉；
   - 参数定义两级左侧树；
   - 表格横向滚动和操作列；
   - 长中文名称和长标识符省略。

7. **构型槽位规则的字典归属映射仍是原型逻辑。**
   - 底座映射到组件类型 `chassis`。
   - 关节和连杆映射到 `robot_arm`。
   - 通过类型 → 子类型 → 规格级联求默认规格。
   - 如果某条链路没有规格级联，会回退为全部已启用规格。
   - 后续如果字段字典补充更精细的“模块归属”，需要替换此推断。

8. **参数分类迁移是一次性启发式迁移。**
   - 检测到旧数据没有四个机械臂子模块时：
     - 新建底座/关节/连杆/末端；
     - 旧“机械臂模块”字段迁移到“关节”。
   - 正式产品应使用带版本号的数据迁移，而不是运行时启发式判断。

9. **Vite 构建存在大 Chunk 警告。**
   - 当前构建成功。
   - JS 主包约 1.17 MB，gzip 约 335 KB。
   - 稳定功能前不要为了该告警进行大规模无关重构。

10. **没有本地 TypeScript CLI。**
    - `package.json` 没有 `typescript` devDependency。
    - 执行 `npx tsc --noEmit` 会尝试访问 npm registry；当前环境网络受限时会失败。
    - 当前可靠验证方式是 `npm run check`。

## 5. 下一步计划

建议按以下顺序继续：

1. 让用户对最新“参数定义两级左侧结构”做视觉确认。
2. 完成数据管理三页的人工浏览器回归，尤其是滚动、长文本、空状态和窄屏。
3. 根据用户确认处理旧“字典配置”入口是否保留。
4. 确认主导航“组件库”是否要按早先要求隐藏。
5. 将 `ParameterDefinitionManager` 接入实际组件参数配置表单：
   - 根据组件类型读取对应末级分类；
   - 仅加载启用字段；
   - 枚举型渲染下拉选择；
   - 数值型进行数值校验；
   - 默认值填充；
   - 监听参数定义更新事件。
6. 将字段字典、构型模板、槽位规则和参数定义迁移到正式 API。
7. 增加正式数据迁移版本号和服务端唯一性校验。
8. 功能稳定后再做代码拆分：
   - 把 `FieldDictionaryVersionView` 从 `DataManagementManager.tsx` 拆出；
   - 抽取共享 `StatusSwitch`；
   - 抽取共享数据管理表格组件；
   - 清理已无入口的旧样式和不可达占位分支。
9. 最后再处理 Vite 分包告警和自动化 UI 测试。

## 6. 踩过的坑

### 6.1 不要把原型 UI 原样搬过来

用户多次指出原型只是结构参考。正确做法是：

- 保留信息架构和业务逻辑；
- 使用现有 HeroUI 风格组件；
- 对大量内容采用主从布局、抽屉和内部滚动；
- 避免重复表头、巨型卡片和多余分栏。

### 6.2 固定分类与动态分类不能混用

参数定义最初做成四张可展开大卡片，导致：

- 重复表头；
- 内容被截断；
- 页面纵向浪费；
- 固定分类看起来像动态列表。

最终改为左右主从结构。机械臂模块又进一步改为父级 + 四个固定子模块。

### 6.3 槽位规则与装配模板不是一回事

最初把两层配置混在同一个构型抽屉里。实际逻辑应为：

- 全局槽位规则：按底座/关节/连杆限定规格；
- 具体装配模板：按 BASE、J1/L1…选择规格并继承全局规则。

因此“槽位规则”现在位于顶部，与“新增构型”相邻；构型行内只进入“装配模板”。

### 6.4 “全部规格”与“不选择”的语义必须明确

- 全局槽位规则不选具体规格：允许该类型下全部规格。
- 具体装配模板不选具体规格：继承全局槽位规则。

不要把两种空数组语义混成同一提示。

### 6.5 字典树不能套错层级

字段字典只有“分类 → 字段”两级。最初复用了版本管理三级树的两层引导线，导致双竖线和过深缩进。

正确做法：

- 只使用一层 `taxonomy-tree-category-children`；
- 不再嵌套 `taxonomy-tree-brand-list`。

### 6.6 蓝色背景只表示选中

产品分类树和字典树中，蓝色条只能出现在当前选中项。不要为了“统一样式”给所有叶子节点加蓝底。

### 6.7 数据管理二级导航不要常驻一整列

用户明确反对为字段字典/构型模板/参数定义单独占一列导航。当前采用主导航旁的浮层菜单，并最终精简为纯文字。

### 6.8 表格不要各写一套

数据管理三页最初分别定义表头、行高和边框，视觉上与软件产品、装机记录不一致。现在通过：

- `.data-management-table`
- `.data-management-table--actions`

统一。后续不要再在页面级样式里覆盖成不同高度或添加竖线。

### 6.9 首页组件库与机器人组件库不能共用状态 key

- `components`：首页编辑器的组件面板。
- `robotComponents`：机器人 3D 组件库。

曾经混用导致点击“编辑面板”跳到 3D 组件库。后续隐藏/恢复导航时尤其小心。

### 6.10 Portal 不继承局部 CSS 变量

HeroUI Modal/Drawer 使用 Portal。如果主题变量只写在页面局部容器，弹窗可能透明或颜色错误。机器人模块曾通过把局部主题变量同步到 `document.documentElement` 修复。

新增 Portal 类组件时应确认主题 Token 在 Portal 根节点可用。

### 6.11 不要直接假设 `npx tsc` 可用

项目没有本地 TypeScript CLI。`npx tsc --noEmit` 会尝试下载名为 `tsc` 的包，在受限网络环境下出现 `ENOTFOUND`。不要把它作为当前交付门禁，使用 `npm run check`。

## 7. 快速开始与验证

```bash
cd "/Users/mac/Downloads/原型APP/Custom Dashboard Management"
npm run dev
```

完整交付检查：

```bash
npm run check
git diff --check
```

最近一次检查结果：

- 设计规范 `v1.5.0` 校验通过；
- Vite 生产构建通过；
- `git diff --check` 通过；
- 仅存在大 Chunk 警告。

## 8. 关键文件索引

| 文件 | 作用 |
| --- | --- |
| `src/app/App.tsx` | 顶层状态、主导航、模块路由、字典数据持久化。 |
| `src/app/components/DataManagementManager.tsx` | 数据管理二级页面切换及当前字段字典新版页面。 |
| `src/app/components/DictionaryConfigManager.tsx` | 旧“字典配置”完整页面。 |
| `src/app/dictionaryData.ts` | 字段字典类型、预置数据、级联读取函数。 |
| `src/app/components/ConfigurationTemplateManager.tsx` | 构型 CRUD、全局槽位规则、具体装配模板。 |
| `src/app/components/ParameterDefinitionManager.tsx` | 参数定义、两级组件分类、枚举项维护、同步事件。 |
| `src/styles/business/data-management.css` | 数据管理三页布局、表格和抽屉样式。 |
| `src/styles/business/dictionary-config.css` | 旧字典配置页样式。 |
| `src/app/components/SoftwareManager.tsx` | 标准列表页/表格视觉参考。 |
| `src/app/components/InstallationRecordsManager.tsx` | 标准表格、固定首尾列、工具按钮参考。 |
| `src/app/components/ProductVersionManager.tsx` | 产品分类树和版本管理交互参考。 |
| `src/app/components/RobotModelManager.tsx` | 型号库、型号详情、3D、结构树、机器人组件库。 |
| `src/app/components/ProductUI.tsx` | 产品 UI 统一导出入口。 |
| `src/app/components/ArcoLike.tsx` | HeroUI 风格兼容封装。 |
| `guidelines/docs/ui-guidelines.md` | 视觉和交互规范。 |
| `guidelines/tokens/design-tokens.json` | Design Token。 |

## 9. 给新会话的工作方式建议

1. 先读本文件，再读用户最新截图和最后一条反馈。
2. 修改前先运行 `git status --short`，确认不要覆盖未提交成果。
3. UI 任务先对照现有软件产品、装机记录、产品分类树和 Design Token。
4. 先确认业务层级，再决定页面布局；不要仅凭截图猜交互。
5. 修改后执行 `npm run check && git diff --check`。
6. 向用户汇报时只说实际完成内容，不声称已接后端或完成真实 3D/ROS 能力。
