# 数字造机 UI 设计规范

当前发布版本：**1.7.0**

状态：**Active**

适用对象：产品、设计、前端、测试，以及接入平台的第三方组件团队。

本目录是一份可独立上传到 GitLab 的设计规范仓库。前端接入只需要本目录中的发布文件，不需要复制原型工程的 `src/styles/*`、页面组件或业务代码。

## 从这里开始

| 角色 | 首先阅读 | 实际使用 |
| --- | --- | --- |
| 前端 | [前端接入清单](docs/frontend-onboarding.md) | [Design Token](tokens/design-tokens.json)、[产品模式](patterns/product-patterns.json)、[运行时清单](runtime/product-ui-manifest.json)、[React 模板](examples/react/README.md) |
| 设计 | [UI 总规范](docs/ui-guidelines.md) | 颜色、字体、间距、状态、模板和组件边界 |
| 测试 | [UI 总规范](docs/ui-guidelines.md#18-版本管理与自动化验收) | 状态矩阵、响应式、无障碍和验收清单 |
| 维护者 | [贡献与发布](CONTRIBUTING.md) | 版本升级、变更评审、CI 校验与发布记录 |

产品级页面实现还必须同时阅读 [产品外壳规范](docs/product-shell.md)、[页面 Recipe](docs/page-recipes.md)、[ProductUI 映射](docs/product-ui-mapping.md) 与 [视觉回归要求](docs/visual-regression.md)。

完整接入资料包括 [Token 接入说明](docs/token-integration.md)、[ProductShell 模板](examples/react/ProductShell.template.tsx)、[管理列表模板](examples/react/ManagementListPage.template.tsx)、[Modal 表单模板](examples/react/ModalForm.template.tsx)、[Drawer 详情模板](examples/react/DrawerDetail.template.tsx)、[前端审计脚本](scripts/audit-frontend.mjs) 和 [打包脚本](scripts/package.sh)。

## 目录结构

```text
.
├── README.md                         # GitLab 项目入口
├── CHANGELOG.md                      # 唯一版本变更记录
├── CONTRIBUTING.md                   # 修改与发布流程
├── .gitlab-ci.yml                    # GitLab 自动校验
├── package.json                      # 规范包版本与本地命令
├── docs/
│   ├── ui-guidelines.md              # 唯一文字规范与验收依据
│   ├── token-integration.md          # 前端 Token 接入说明
│   ├── product-shell.md              # 数字造机产品外壳与全局导航规范
│   ├── page-recipes.md               # 管理页面、表单、抽屉与 CRUD 配方
│   ├── product-ui-mapping.md         # 规范组件到 ProductUI 的实现映射
│   ├── frontend-onboarding.md        # 前端接入顺序与完成定义
│   └── visual-regression.md          # 视觉回归矩阵与合并门禁
├── patterns/
│   └── product-patterns.json         # 机器可读产品外壳与页面模式
├── runtime/
│   └── product-ui-manifest.json      # 正式组件、待补组件与禁止依赖
├── examples/react/                   # 可复制的 React 产品结构模板
├── tokens/
│   └── design-tokens.json            # 唯一机器可读 Token 源
├── components/
│   └── component-specs.json          # 组件行为与状态契约
├── adapters/
│   └── ant-design-theme.ts           # Ant Design 映射示例
├── references/
│   └── ant-design-background.md      # 背景资料，不是当前规范
└── scripts/
    ├── validate.mjs                  # 独立规范校验
    ├── audit-frontend.mjs            # 业务源码静态审计
    └── package.sh                    # 生成分发压缩包
```

## 文件优先级

发生冲突时按以下顺序处理：

1. `tokens/design-tokens.json` 决定可使用的 Token 名称和值。
2. `components/component-specs.json` 决定组件参数、状态、行为和验收边界。
3. `docs/ui-guidelines.md` 决定页面模板、组合模式、内容、响应式和无障碍规则。
4. `adapters/*` 仅说明如何映射到特定组件库，不得反向修改前三项。
5. `references/*` 只提供背景信息，不能作为实现或验收依据。

## 前端接入

1. 读取 `tokens/design-tokens.json`，在构建阶段解析 `{...}` 引用，并输出团队需要的 CSS Variables、TypeScript 常量或主题对象。
2. 使用 `components/component-specs.json` 将设计参数映射到团队批准的组件库；保留相同语义、状态和键盘行为。
3. 使用 `adapters/ant-design-theme.ts` 时，应连同 Token JSON 保持目录关系，或调整其 import 路径。
4. 页面不得复制原型工程样式，也不得用页面私有 CSS 覆盖基础组件契约。
5. 接入完成后，按 UI 总规范覆盖 Light/Dark、桌面/Pad、全部适用状态及键盘操作。

## 前端项目审计

```bash
npm run audit -- ../your-frontend/src
```

存量项目可增加 `--report-only` 建立整改基线。审计会阻止原生业务 Select、底层 UI 库直连、私有 Modal/Drawer 和任意 `z-index`，并报告硬编码颜色与页面内联样式。

## 生成分发包

```bash
npm run check
npm run pack:bundle
```

压缩包生成在规范目录的上一级，文件名包含当前版本。

## 本地校验

本规范包无第三方依赖，安装 Node.js 20+ 后执行：

```bash
npm run check
```

该命令会检查目录完整性、版本一致性、JSON 可解析性、组件契约字段、文档章节和适配器引用。推送到 GitLab 后，`.gitlab-ci.yml` 会执行同一检查。

## 上传到 GitLab

把当前 `guidelines/` 目录中的内容作为新 GitLab 项目的仓库根目录，再执行：

```bash
git init
git add .
git commit -m "docs: publish design system v1.7.0"
git branch -M main
git remote add origin <your-gitlab-repository-url>
git push -u origin main
```

建议在 GitLab 中保护 `main`，要求通过 Merge Request 和 CI 后才能合并，并由设计系统维护者与前端负责人共同审批 Token 或组件契约变更。

## 非交付内容

- 原型工程的 `src/styles/*`、`src/app/theme.ts` 和页面内 CSS；
- 示例业务数据、路由、3D/URDF 原型实现；
- `references/` 中标记为背景资料或历史资料的内容。

这些内容可以用于验证和理解，但不能作为前端项目的规范单一来源。
