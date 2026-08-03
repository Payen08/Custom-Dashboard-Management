import { ProductButton, ProductDrawer, ProductTag } from '@your-org/product-ui';

export function DrawerDetailTemplate(props: { open: boolean; onClose: () => void; onEdit: () => void }) {
  return <ProductDrawer
    open={props.open}
    onOpenChange={open => !open && props.onClose()}
    title="OBJ-001"
    description="示例对象"
    width="min(760px, calc(100vw - 48px))"
    footer={<><ProductButton onClick={props.onClose}>关闭</ProductButton><ProductButton type="primary" onClick={props.onEdit}>编辑</ProductButton></>}
  >
    <div className="product-drawer-detail">
      <div className="product-drawer-detail__status"><ProductTag tone="success">已启用</ProductTag></div>
      <section><h2>基础信息</h2><dl className="product-description-grid"><div><dt>对象编号</dt><dd>OBJ-001</dd></div><div><dt>创建人</dt><dd>robot-admin</dd></div></dl></section>
      <section><h2>业务信息</h2><div>业务详情内容</div></section>
      <section><h2>操作日志</h2><div>2026-08-03 创建对象</div></section>
    </div>
  </ProductDrawer>;
}
