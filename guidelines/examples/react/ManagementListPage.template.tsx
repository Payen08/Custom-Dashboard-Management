import { ProductButton, ProductIconButton, ProductSelect, ProductTag, ProductTextInput } from '@your-org/product-ui';

export function ManagementListPageTemplate() {
  return <section className="ds-page ds-page--list">
    <header className="ds-page__header ds-page-header">
      <div><h1>对象管理</h1><p>说明当前列表管理的对象与范围</p></div>
      <div className="ds-page-toolbar">
        <ProductButton type="outline">导入</ProductButton>
        <ProductButton type="primary">新增对象</ProductButton>
      </div>
    </header>
    <section className="ds-table-surface">
      <div className="product-filter-bar">
        <ProductTextInput aria-label="搜索对象" placeholder="搜索" />
        <ProductSelect aria-label="状态" value="all" options={[{ label: '全部状态', value: 'all' }]} />
        <span className="product-filter-bar__total">共 24 条</span>
      </div>
      <div className="ds-table-scroll">
        <table><thead><tr><th>对象名称</th><th>状态</th><th>创建信息</th><th className="is-action">操作</th></tr></thead>
          <tbody><tr><td><button className="product-identity-link">示例对象</button><small>OBJ-001</small></td><td><ProductTag tone="success">已启用</ProductTag></td><td>robot-admin<br/><small>2026-08-03 10:00</small></td><td className="is-action"><div className="product-table-actions"><ProductIconButton icon="eye" aria-label="查看示例对象" tooltip="查看详情"/><ProductIconButton icon="edit" aria-label="编辑示例对象" tooltip="编辑"/></div></td></tr></tbody>
        </table>
      </div>
      <footer className="product-pagination">分页组件</footer>
    </section>
  </section>;
}

