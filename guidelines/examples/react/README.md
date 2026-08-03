# React 接入模板

这些文件是产品结构模板，不是独立组件库。接入团队应将 `@your-org/product-ui` 替换为本团队对 `runtime/product-ui-manifest.json` 的批准映射，保留区域、操作层级、状态和滚动关系。

推荐顺序：

1. 先实现 `ProductShell.template.tsx`，保证所有页面共享外壳。
2. 用 `ManagementListPage.template.tsx` 建立列表、筛选、操作列和详情入口。
3. 用 `ModalForm.template.tsx` 承载短创建/编辑。
4. 用 `DrawerDetail.template.tsx` 承载不离开列表的详情。

模板中的业务字段、文案和数据可替换；组件类型、Header/Body/Footer、唯一主操作和滚动所有权不可随意改变。

