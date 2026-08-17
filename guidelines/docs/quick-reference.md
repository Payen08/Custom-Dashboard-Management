# 快速速查 · 研发常见问题

本文件解答研发接入时最常遇到的"到底用哪个值"的问题，并附 ✅ 正确写法 / ❌ 错误写法对比。
完整 Token 数值见 [`tokens/design-tokens-resolved.md`](../tokens/design-tokens-resolved.md)。

---

## 一、颜色

### Q：我怎么知道主操作色是什么？

**Light 模式下是 `#241F7D`，Dark 模式下是 `#4F46E5`，文字均为白色。** `#AFC2FF` 是暗色主题的交互强调文字，不是主按钮背景。但你永远不该把这些色号写死在代码里。

```tsx
// ✅ 正确：使用 CSS 变量或主题 Token
<button style={{ background: 'var(--ds-button-primary-bg)', color: 'var(--ds-button-primary-text)' }} />

// ✅ 正确：Ant Design 项目通过 createProductTheme() 注入，直接使用 colorPrimary
// 不需要在业务组件里写颜色

// ❌ 错误：硬编码色号
<button style={{ background: '#241F7D' }} />

// ❌ 错误：根据模式自行判断颜色
const color = isDark ? '#4F46E5' : '#241F7D'
```

### Q：Tag 的状态色怎么用？

Tag 不能用 `#00910E` 这样的色号。通过 `tone` 属性驱动，底层自动映射到 Token。

```tsx
// ✅ 正确
<Tag tone="success">已完成</Tag>
<Tag tone="warning">处理中</Tag>
<Tag tone="danger">已失败</Tag>
<Tag tone="neutral">草稿</Tag>

// ❌ 错误：手写背景色
<Tag style={{ background: '#E9F1E7', color: '#00910E' }}>已完成</Tag>
```

| tone | Light 背景 | Light 文字 |
|---|---|---|
| neutral（默认） | `#FAFAFA` | `#666666` |
| accent | `#EDEFFF` | `#241F7D` |
| success | `#E9F1E7` | `#176B25` |
| warning | `#FFF8EA` | `#745000` |
| danger | `#F9E7E7` | `#9F0C0A` |

### Q：禁用状态的颜色怎么处理？

**不要单独设置颜色或透明度；统一传 `disabled`，具体外观引用 `--ds-opacity-disabled`，数值以 Token 源为准。**

```tsx
// ✅ 正确：传 disabled prop，组件自动处理外观
<Button disabled>保存</Button>
<Input disabled />

// ❌ 错误：手动设置颜色/透明度
<Button style={{ color: '#999', opacity: 0.4 }}>保存</Button>
```

---

## 二、圆角

### Q：按钮、输入框、卡片的圆角分别是多少？

| 控件类型 | Current | Industrial |
|---|---|---|
| Button（所有尺寸） | **8px** | 4px |
| Input / Select / SearchInput | **10px** | 4px |
| Checkbox | **6px** | 2px |
| 内部容器 / 表头 | **12px** | 4px |
| 卡片 | **16px** | 6px |
| Modal / Drawer / Popover / Dropdown | **16px** | 6px |
| Tag / 胶囊 | **999px** | 999px |

```css
/* ✅ 正确：使用 Token 变量 */
.my-card {
  border-radius: var(--ds-radius-card);      /* 16px */
}
.my-button {
  border-radius: var(--ds-radius-button);    /* 8px */
}

/* ❌ 错误：自定义圆角 */
.my-button {
  border-radius: 6px;  /* 不在发布值列表中 */
}
.my-card {
  border-radius: 12px; /* 卡片应该是 16px */
}
```

> ⚠️ 注意：`8px` 按钮圆角和 `10px` 输入框圆角是**刻意不同的**。如果你用 Ant Design 并通过 `createProductTheme()` 接入，不需要自己处理——Ant Design 适配器已分别给 Button 和 Input 设置了正确的圆角覆盖。

---

## 三、字体

### Q：页面各位置用什么字号/字重？

```tsx
// ✅ 正确
<h1 style={{ fontSize: 'var(--ds-font-size-20)', fontWeight: 600 }}>页面标题</h1>
<h2 style={{ fontSize: 'var(--ds-font-size-16)', fontWeight: 600 }}>模块标题</h2>
<p  style={{ fontSize: 'var(--ds-font-size-14)', fontWeight: 400 }}>正文内容</p>
<span style={{ fontSize: 'var(--ds-font-size-12)', fontWeight: 400 }}>辅助信息</span>

// ❌ 错误：使用未发布字号
<span style={{ fontSize: '13px' }}>辅助信息</span>  /* 13 不在发布列表 */
<span style={{ fontSize: '15px' }}>标签</span>      /* 15 不在发布列表 */
```

### Q：数字、版本号用什么字体？

```tsx
// ✅ 正确：数字类内容使用 mono 字体
<code style={{ fontFamily: 'var(--ds-font-family-mono)' }}>v1.7.0</code>
<span style={{ fontFamily: 'var(--ds-font-family-mono)' }}>12,345.67</span>
```

---

## 四、间距

### Q：元素之间的间距怎么定？

```css
/* ✅ 正确：使用 4px 栅格 */
.field + .field  { margin-top: 16px; }  /* var(--ds-spacing-4) */
.module + .module { margin-top: 24px; } /* var(--ds-spacing-6) */
.section + .section { margin-top: 32px; } /* var(--ds-spacing-8) */

/* ❌ 错误：使用非 4px 倍数 */
.field + .field  { margin-top: 13px; }
.module + .module { margin-top: 17px; }
```

### Q：页面左右边距是多少？

```
Desktop (≥1200px): 24px
Tablet (768–1199px): 20px
Mobile (<768px): 16px
```

---

## 五、按钮

### Q：按钮有哪些尺寸？什么场景用哪个？

| 尺寸 | 高度 | 场景 |
|---|---|---|
| xs | 24px | 表格行内操作、标签内操作、紧凑图标按钮 |
| sm | 32px | 整行明确采用紧凑模式的工具栏；同一行不得与 40px 混用 |
| md | 40px | **默认**：页面工具栏、弹窗 Footer、表单提交 |

```tsx
// ✅ 正确
<Button size="md">保存</Button>          // 40px，页面主操作
<Button size="sm">取消</Button>          // 32px，次要操作紧凑时
<IconButton size="xs" icon="edit" />     // 24px，表格行内

// ❌ 错误：自定义高度或圆角
<button style={{ height: '36px', borderRadius: '6px' }}>保存</button>
```

> 同类型操作（新增 / 编辑 / 删除 / 搜索 / 刷新 / 导出等）的命名与样式统一，以及纯图标按钮 Hover / Focus 显示操作名 Tooltip 的规则，统一见 `ui-guidelines.md` §27.50；操作词以《多语言文案规则》"全局操作词"为唯一词表。

### Q：一个区域能有几个 Primary 按钮？

主操作数量与“同一操作区”的边界以 `ui-guidelines.md` §13.1.1 为准。

```tsx
// ✅ 正确
<>
  <Button variant="secondary">取消</Button>
  <Button variant="primary">确认</Button>
</>

// ❌ 错误：两个 primary
<>
  <Button variant="primary">导出</Button>
  <Button variant="primary">新建</Button>
</>
```

---

## 六、Modal / Drawer

### Q：什么时候用 Modal，什么时候用 Drawer？

| 组件 | 场景 |
|---|---|
| **Modal** | 需要确认的短任务：新建、编辑（简单表单）、删除确认 |
| **Drawer** | 不离开当前页的详情查看、连续配置、长表单 |

### Q：Modal 的宽度如何选择？

```tsx
// ✅ 正确：选择最接近内容量的标准尺寸
<Modal size="sm">/* 确认/删除 */</Modal>        // 420px
<Modal size="md">/* 标准表单 */</Modal>          // 560px
<Modal size="lg">/* 多段表单、小列表 */</Modal>  // 720px
<Modal size="xl">/* 大型列表、对比 */</Modal>    // 900px

// ❌ 错误：自定义宽度
<Modal style={{ width: '500px' }}>...</Modal>
```

### Q：Modal 内的按钮顺序？

**次要/取消在左，主要/确认在右。** 危险操作的确认按钮用 `danger` 语义。

```tsx
// ✅ 正确
<ModalFooter>
  <Button variant="text">取消</Button>
  <Button variant="primary">确认</Button>
</ModalFooter>

// ✅ 正确：删除确认
<ModalFooter>
  <Button variant="text">取消</Button>
<Button variant="primary" danger dangerEmphasis="solid">删除</Button>
</ModalFooter>

// ❌ 错误：确认在左
<ModalFooter>
  <Button variant="primary">确认</Button>
  <Button variant="text">取消</Button>
</ModalFooter>
```

普通页面中的“删除”入口默认使用 `dangerEmphasis="soft"`，保留浅危险底和红色文字；只有删除确认弹窗中的最终不可逆操作使用 `solid`。两种形态都必须覆盖 Default、Hover、Pressed、Focus、Disabled、Loading。

### Q：Toast / Notification 的尺寸？

| 组件 | 宽度 | 最小高度 | 内边距 |
|---|---:|---:|---:|
| 单行 Toast | 360px | 48px | 12px 16px |
| 双行 Toast | 360px | 64px | 12px 16px |
| Notification | 420px | 80px | 16px |

使用最小高度而非固定高度；文字换行、国际化或存在操作按钮时允许向下自然增高。
标题使用完整语义文字色；说明使用语义色与次级正文色混合后的低强调同色相，不与标题同色，也不退回纯中性灰。Notification 行内操作为 32px 高语义 Soft/Flat Button，默认有约 20% 语义色填充，不得撑满消息高度。

---

## 七、阴影

```css
/* ✅ 正确：使用 6 个阴影 Token */
.card     { box-shadow: var(--ds-shadow-card); }
.dropdown { box-shadow: var(--ds-shadow-overlay); }
.dialog   { box-shadow: var(--ds-shadow-dialog); }
.subtle   { box-shadow: var(--ds-shadow-xs); }
.flat     { box-shadow: none; }

/* ❌ 错误：自定义阴影值 */
.card { box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
```

---

## 八、Light / Dark 模式

### Q：我怎么保证组件在两种模式下都正确？

**不能在代码里判断 isDark 然后手动切颜色。** 所有颜色必须来自 CSS 变量或 Token，随主题自动切换。

```tsx
// ✅ 正确：用 CSS 变量，主题切换时自动更新
const style = {
  background: 'var(--ds-color-surface)',
  color: 'var(--ds-color-heading)',
  border: '1px solid var(--ds-color-border)',
}

// ✅ 正确（Ant Design 项目）：只用 token 中的 colorBgContainer、colorText 等
// createProductTheme() 已处理 light/dark，业务组件不写颜色

// ❌ 错误：根据主题手动切换色号
const bg = theme === 'dark' ? '#222226' : '#FFFFFF'
```

---

## 九、Ant Design 接入（快速核对）

使用 `adapters/ant-design-theme.ts` 中的 `createProductTheme()` 时，主要 Token 映射关系：

| Ant Design Token | 对应语义 | Current Light 值 |
|---|---|---|
| `colorPrimary` | accent / brand | `#241F7D` |
| `colorBgContainer` | surface | `#FFFFFF` |
| `colorBgLayout` | layout | `#F8F9FA` |
| `colorBgBase` | page | `#F0F0F0` |
| `colorText` | heading | `#333333` |
| `colorTextSecondary` | text | `#666666` |
| `colorBorder` | border | `#DDDDDD` |
| `borderRadius`（全局） | control (10px) | `10px` |
| `borderRadius`（Button 覆盖） | button (8px) | `8px` |
| `borderRadius`（Modal 覆盖） | overlay (16px) | `16px` |
| `controlHeight` | fieldHeight | `40px` |
| `fontFamily` | fontFamilySans | `PingFang SC, …` |

> 业务组件只调用 `createProductTheme(mode, preset, industrialColorTheme)` 并传入提供者，**不要在业务层再写主题色**。

---

## 十、Industrial 风格使用规则

```
❌ 不能因为是"制造业相关页面"就自动用 Industrial 风格
✅ 只有经过评审批准的场景才可以启用 Industrial

允许的场景：
  - 设备实时监控大屏
  - 3D 场景 / 遥测视口
  - 明确标注使用工业预设的页面

启用方式：
  createProductTheme('light', 'industrial', 'steel')
  createProductTheme('dark',  'industrial', 'cobalt')
```

Industrial 与 Current 的主要视觉差异：

| 维度 | Current | Industrial (Steel) |
|---|---|---|
| 品牌/强调色 | `#241F7D`（紫） | `#255D76`（钢灰蓝） |
| 页面背景 Light | `#F0F0F0` | `#F0F0F0` |
| 按钮圆角 | `8px` | `4px` |
| 输入框圆角 | `10px` | `4px` |
| 卡片圆角 | `16px` | `6px` |
| 卡片阴影 | 有（`card` 阴影） | `none`（边框分割） |
| 专属色 | 无 | `signal` 橙（设备运行状态） |

---

## 十一、搜索与筛选交互

### Q：列表页搜索/筛选如何接入？

行为以 `ui-guidelines.md` §13.2 为准；以下仅展示接入现有 ProductUI 的实现示例。

```tsx
// ✅ 正确：输入变化直接更新列表
const filtered = useMemo(() => items.filter(item =>
  (!keyword || item.name.includes(keyword)) &&
  (status === '全部' || item.status === status)
), [items, keyword, status]);

// ✅ 正确：onChange 里同时重置分页
<ProductTextInput value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }} />
<ProductSelect value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} />

// ❌ 错误：输入后还要点"查询"按钮才生效
<ProductButton onClick={applyFilters}>查询</ProductButton>
```

### Q：列表页顶部可以放功能说明/联动提示条吗？

**不要放常驻的功能说明条**（如"工单保存后进入待办队列……"）。此类信息属于操作时需要才出现的帮助文本、Tooltip 或空状态，不应在列表页顶部堆叠与当前任务无关的引导文案。

---

## 十二、配置编排

- 枚举项编辑：Modal 内使用“显示名称 / 标识符 / 操作”三列，删除为 Danger IconButton，错误保留在编辑区内。
- 创建组件：基础信息两列，构型模板与描述通栏；下一步按槽位顺序完成模块装配。
- 新增级联：父值与子字段纵向排列；关联取值组使用 Header 全选 Checkbox 与可滚动选项区。
- 装配模板、槽位规则：使用 Drawer；说明条置顶，结构与滚动见 `ui-guidelines.md` §3.2；恢复默认不自动保存。

---

## 十三、多语言快速检查

- 最低验收：`zh-CN`、`en-US`、30%–40% 膨胀伪语言、至少一个非 UTC 时区。
- 文案使用稳定语义 Key 和 ICU MessageFormat；禁止中文原文作 Key、字符串拼句和在代码中追加标点。
- Button、Tab、Tag、表头按英文增长至少 30% 验收；关键动作不截断，不通过缩小字号解决溢出。
- 日期、数字、货币、列表、相对时间使用 `Intl.*`；时间格式化显式传入 IANA 时区。
- 筛选显示文案可以翻译，提交值必须稳定；切换语言后保留筛选、分页、表单草稿和当前页面。
- IME composition 期间不提交搜索或最终校验；文本排序使用带 Locale 的 `Intl.Collator`。
- `html[lang]` 与 `dir` 随语言切换；可见文案、Tooltip、`aria-label` 和动态播报同步翻译。
- RTL 未支持时明确声明；支持时使用逻辑属性，并完整验收导航、步骤、抽屉、分页和双向文本。

完整规则见 `docs/ui-guidelines.md` 的“26. 多语言与本地化规范”。
