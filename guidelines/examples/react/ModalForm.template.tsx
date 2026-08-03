import { ProductButton, ProductField, ProductModal, ProductSelect, ProductTextInput } from '@your-org/product-ui';

export function ModalFormTemplate(props: { open: boolean; onClose: () => void; onSave: () => void }) {
  return <ProductModal
    open={props.open}
    onOpenChange={open => !open && props.onClose()}
    title="新增对象"
    description="填写对象基础信息"
    size="lg"
    footer={<><ProductButton onClick={props.onClose}>取消</ProductButton><ProductButton type="primary" onClick={props.onSave}>保存</ProductButton></>}
  >
    <form className="product-modal-form">
      <section><h2>基础信息</h2><div className="product-form-grid">
        <ProductField label="对象名称"><ProductTextInput /></ProductField>
        <ProductField label="状态"><ProductSelect value="enabled" options={[{ label: '已启用', value: 'enabled' }]} /></ProductField>
      </div></section>
      <section><h2>补充信息</h2><div className="product-form-grid"><ProductField label="说明"><ProductTextInput /></ProductField></div></section>
    </form>
  </ProductModal>;
}

