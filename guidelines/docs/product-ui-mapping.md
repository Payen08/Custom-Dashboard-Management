# ProductUI 实现映射

本项目运行时以 `src/app/components/ProductUI.tsx` 为业务组件唯一入口。规范名称描述语义，ProductUI 名称描述当前实现；业务页面不得直接依赖底层 UI 库或复制 `ArcoLike` 外观。

## 1. 正式映射

| 规范组件 | ProductUI | 业务用途 |
| --- | --- | --- |
| Button | `ProductButton` | 页面、弹窗和抽屉操作。 |
| IconButton | `ProductIconButton` | 表格行内查看、编辑、删除、关闭。 |
| ToggleButton | `ProductToggleButton` | 持续选择状态。 |
| IconToggleButton | `ProductIconToggleButton` | 图标化持续选择。 |
| Tag | `ProductTag` | 状态、类型、数量和范围。 |
| Input | `ProductTextInput` | 文本、日期时间及浏览器支持的基础输入类型。 |
| TextArea | `ProductTextArea` | 多行说明。 |
| Select | `ProductSelect` | 单值预定义选项。 |
| Field | `ProductField` | Label、Control、Hint/Error 组合。 |
| Checkbox | `ProductCheckbox` | 多选与统一提交的确认项。 |
| Modal | `ProductModal` | 短创建、短编辑、确认。 |
| Drawer | `ProductDrawer` | 不离开列表上下文的详情和连续配置。 |
| Upload | `ProductUploadBox` | 文件选择及上传状态。 |

## 2. 导入规则

```tsx
import {
  ProductButton,
  ProductDrawer,
  ProductField,
  ProductIconButton,
  ProductModal,
  ProductSelect,
  ProductTag,
  ProductTextInput,
} from './ProductUI';
```

- 新业务组件只使用 `Product*` 正式导出，不使用过渡期 `Arco*` 别名。
- 不直接从 `@heroui/react`、MUI、Radix 或其他基础库导入可被 ProductUI 覆盖的组件。
- 不在业务 CSS 中重写 `.arcoui-*` 内部结构；扩展只允许作用于业务布局容器。
- 缺少的组件先补充 ProductUI 契约和映射，再进入业务页面，不使用原生控件临时代替正式交互。

## 3. 推荐组合

```tsx
<ProductModal
  open={open}
  onOpenChange={setOpen}
  title="新增对象"
  description="填写对象基础信息"
  size="lg"
  footer={(
    <>
      <ProductButton onClick={() => setOpen(false)}>取消</ProductButton>
      <ProductButton type="primary" loading={saving}>保存</ProductButton>
    </>
  )}
>
  <ProductField label="名称">
    <ProductTextInput value={name} onChange={handleNameChange} />
  </ProductField>
</ProductModal>
```

```tsx
<ProductDrawer
  open={Boolean(selected)}
  onOpenChange={open => !open && setSelected(null)}
  title={selected?.name ?? '详情'}
  width="min(760px, calc(100vw - 48px))"
  footer={<ProductButton onClick={() => setSelected(null)}>关闭</ProductButton>}
>
  <DetailSections value={selected} />
</ProductDrawer>
```

## 4. 禁止项

- 原生 `<select>` 作为业务下拉框。
- 页面私有 Modal、Drawer、Toast、Tag 或按钮视觉实现。
- 表格操作列使用无规范文字链接堆叠；高频明确操作应使用 ProductIconButton。
- 使用普通 Button 表达 Selected 状态。
- 在业务页面新增任意全局 `z-index`、主题色或组件级阴影。

## 5. 待补正式组件

以下组件已在 1.7.0 发布完整设计契约，但当前原型还没有对应的 ProductUI 正式导出。契约发布不等于运行时实现 Stable；进入业务页面前仍需完成组件实现、映射、交互测试和视觉回归：

- `ProductTree`
- `ProductTable`
- `ProductDateTimePicker`
- `ProductSteps`
- `ProductContentState`

以下能力仍需补齐组件契约或正式实现：

- `ProductDateTimePicker`
- `ProductInputNumber`
- `ProductPagination`
- `ProductTooltip`
- `ProductSteps`
- `ProductTimeline`
- `ProductBreadcrumb`
