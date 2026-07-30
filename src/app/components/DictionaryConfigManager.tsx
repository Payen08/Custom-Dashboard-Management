import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  LockKeyhole,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  ProductButton,
  ProductCheckbox,
  ProductDrawer,
  ProductField,
  ProductIconButton,
  ProductModal,
  ProductSelect,
  ProductTag,
  ProductTextArea,
  ProductTextInput,
} from './ProductUI';
import type {
  DictionaryCascadeRule,
  DictionaryCategory,
  DictionaryField,
  DictionarySource,
  DictionaryValue,
  DictionaryValueDataType,
} from '../dictionaryData';

type Notice = { tone: 'success' | 'danger'; text: string } | null;
type DrawerView = 'fields' | 'field';
type FieldDetailTab = 'values' | 'cascade';
type CategoryForm = Pick<DictionaryCategory, 'name' | 'key' | 'description' | 'enabled' | 'source'> & { id?: string };
type FieldForm = Pick<DictionaryField, 'name' | 'key' | 'enabled' | 'source'> & { id?: string; seq: string };
type ValueForm = Pick<DictionaryValue, 'name' | 'key' | 'value' | 'dataType' | 'enabled' | 'source'> & { id?: string };
type RuleForm = Omit<DictionaryCascadeRule, 'id'> & { id?: string };
type DeleteTarget =
  | { kind: 'category'; categoryId: string; label: string }
  | { kind: 'field'; categoryId: string; fieldId: string; label: string }
  | { kind: 'value'; categoryId: string; fieldId: string; valueId: string; label: string }
  | { kind: 'rule'; categoryId: string; ruleId: string; label: string };

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const emptyCategory = (): CategoryForm => ({ name: '', key: '', description: '', enabled: true, source: 'custom' });
const emptyField = (seq: number): FieldForm => ({ name: '', key: '', seq: String(seq), enabled: true, source: 'custom' });
const emptyValue = (): ValueForm => ({ name: '', key: '', value: '', dataType: 'string', enabled: true, source: 'custom' });
const emptyRule = (): RuleForm => ({
  parentFieldId: '',
  parentValueId: '',
  childFieldId: '',
  allowedChildValueIds: [],
  enabled: true,
  source: 'custom',
});

function StatusSwitch({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="dictionary-switch"
      data-selected={checked ? 'true' : undefined}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

function SourceTag({ source }: { source: DictionarySource }) {
  return <ProductTag tone={source === 'builtin' ? 'accent' : 'neutral'} size="small">{source === 'builtin' ? '内置' : '自定义'}</ProductTag>;
}

export function DictionaryConfigManager({
  categories,
  onCategoriesChange: setCategories,
  embedded = false,
  title = '字典配置',
}: {
  categories: DictionaryCategory[];
  onCategoriesChange: Dispatch<SetStateAction<DictionaryCategory[]>>;
  embedded?: boolean;
  title?: string;
}) {
  const [query, setQuery] = useState('');
  const [drawerCategoryId, setDrawerCategoryId] = useState<string | null>(null);
  const [drawerView, setDrawerView] = useState<DrawerView>('fields');
  const [fieldDetailTab, setFieldDetailTab] = useState<FieldDetailTab>('values');
  const [fieldQuery, setFieldQuery] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [valueQuery, setValueQuery] = useState('');
  const [notice, setNotice] = useState<Notice>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm | null>(null);
  const [fieldForm, setFieldForm] = useState<FieldForm | null>(null);
  const [valueForm, setValueForm] = useState<ValueForm | null>(null);
  const [ruleForm, setRuleForm] = useState<RuleForm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const drawerCategory = categories.find(item => item.id === drawerCategoryId);
  const sortedFields = useMemo(
    () => [...(drawerCategory?.fields ?? [])].sort((a, b) => a.seq - b.seq),
    [drawerCategory],
  );
  const selectedField = sortedFields.find(item => item.id === selectedFieldId) ?? sortedFields[0];
  const filteredFields = sortedFields.filter(item => {
    const term = fieldQuery.trim().toLowerCase();
    return !term || item.name.toLowerCase().includes(term) || item.key.toLowerCase().includes(term);
  });
  const filteredCategories = categories.filter(item => {
    const term = query.trim().toLowerCase();
    return !term || item.name.toLowerCase().includes(term) || item.key.toLowerCase().includes(term);
  });
  const filteredValues = (selectedField?.values ?? []).filter(item => {
    const term = valueQuery.trim().toLowerCase();
    return !term || item.name.toLowerCase().includes(term) || item.key.toLowerCase().includes(term) || item.value.toLowerCase().includes(term);
  });
  const fieldRules = drawerCategory?.cascadeRules.filter(rule => rule.parentFieldId === selectedField?.id) ?? [];
  const ruleChildField = drawerCategory?.fields.find(item => item.id === ruleForm?.childFieldId);

  useEffect(() => {
    if (!drawerCategory) return;
    if (!drawerCategory.fields.some(item => item.id === selectedFieldId)) {
      setSelectedFieldId([...drawerCategory.fields].sort((a, b) => a.seq - b.seq)[0]?.id ?? '');
    }
  }, [drawerCategory, selectedFieldId]);

  function updateCategory(categoryId: string, updater: (category: DictionaryCategory) => DictionaryCategory) {
    setCategories(current => current.map(category => category.id === categoryId ? updater(category) : category));
  }

  function notify(text: string, tone: 'success' | 'danger' = 'success') {
    setNotice({ text, tone });
    window.setTimeout(() => setNotice(null), 2600);
  }

  function openFields(category: DictionaryCategory) {
    setDrawerCategoryId(category.id);
    setSelectedFieldId('');
    setDrawerView('fields');
    setFieldDetailTab('values');
    setFieldQuery('');
    setValueQuery('');
  }

  function openField(field: DictionaryField) {
    setSelectedFieldId(field.id);
    setDrawerView('field');
    setFieldDetailTab('values');
    setValueQuery('');
  }

  function saveCategory() {
    if (!categoryForm?.name.trim() || !categoryForm.key.trim()) return notify('请完整填写分类名称与标识符。', 'danger');
    if (categories.some(item => item.key === categoryForm.key.trim() && item.id !== categoryForm.id)) return notify('分类标识符必须唯一。', 'danger');
    if (categoryForm.id) {
      setCategories(current => current.map(item => item.id === categoryForm.id ? {
        ...item,
        name: categoryForm.name.trim(),
        key: item.source === 'builtin' ? item.key : categoryForm.key.trim(),
        description: categoryForm.description.trim(),
        enabled: categoryForm.enabled,
      } : item));
    } else {
      setCategories(current => [...current, {
        id: uid('category'),
        name: categoryForm.name.trim(),
        key: categoryForm.key.trim(),
        description: categoryForm.description.trim(),
        enabled: categoryForm.enabled,
        source: 'custom',
        fields: [],
        cascadeRules: [],
      }]);
    }
    setCategoryForm(null);
    notify(categoryForm.id ? '分类已更新。' : '分类已新增。');
  }

  function saveField() {
    if (!fieldForm || !drawerCategory) return;
    const seq = Number(fieldForm.seq);
    if (!fieldForm.name.trim() || !fieldForm.key.trim() || !Number.isInteger(seq) || seq < 1) return notify('请完整填写字段信息与有效顺序。', 'danger');
    if (drawerCategory.fields.some(item => item.key === fieldForm.key.trim() && item.id !== fieldForm.id)) return notify('字段标识符必须唯一。', 'danger');
    if (drawerCategory.fields.some(item => item.seq === seq && item.id !== fieldForm.id)) return notify('字段顺序不可重复。', 'danger');

    if (fieldForm.id) {
      updateCategory(drawerCategory.id, category => {
        const fields = category.fields.map(item => item.id === fieldForm.id ? {
          ...item,
          name: fieldForm.name.trim(),
          key: item.source === 'builtin' ? item.key : fieldForm.key.trim(),
          seq,
          enabled: fieldForm.enabled,
        } : item);
        const seqMap = new Map(fields.map(item => [item.id, item.seq]));
        return {
          ...category,
          fields,
          cascadeRules: category.cascadeRules.filter(rule => (seqMap.get(rule.parentFieldId) ?? 0) < (seqMap.get(rule.childFieldId) ?? 0)),
        };
      });
    } else {
      const nextField: DictionaryField = {
        id: uid('field'),
        name: fieldForm.name.trim(),
        key: fieldForm.key.trim(),
        seq,
        type: 'enum',
        enabled: fieldForm.enabled,
        source: 'custom',
        values: [],
      };
      updateCategory(drawerCategory.id, category => ({ ...category, fields: [...category.fields, nextField] }));
      setSelectedFieldId(nextField.id);
    }
    setFieldForm(null);
    notify(fieldForm.id ? '字段已更新。' : '字段已新增。');
  }

  function saveValue() {
    if (!valueForm || !drawerCategory || !selectedField) return;
    if (!valueForm.name.trim() || !valueForm.key.trim() || !valueForm.value.trim()) return notify('请完整填写取值信息。', 'danger');
    if (selectedField.values.some(item => item.key === valueForm.key.trim() && item.id !== valueForm.id)) return notify('取值标识符必须唯一。', 'danger');

    updateCategory(drawerCategory.id, category => ({
      ...category,
      fields: category.fields.map(field => {
        if (field.id !== selectedField.id) return field;
        if (valueForm.id) {
          return {
            ...field,
            values: field.values.map(item => item.id === valueForm.id ? {
              ...item,
              name: valueForm.name.trim(),
              key: item.source === 'builtin' ? item.key : valueForm.key.trim(),
              value: valueForm.value.trim(),
              dataType: valueForm.dataType,
              enabled: valueForm.enabled,
            } : item),
          };
        }
        return {
          ...field,
          values: [...field.values, {
            id: uid('value'),
            name: valueForm.name.trim(),
            key: valueForm.key.trim(),
            value: valueForm.value.trim(),
            dataType: valueForm.dataType,
            enabled: valueForm.enabled,
            source: 'custom',
          }],
        };
      }),
    }));
    setValueForm(null);
    notify(valueForm.id ? '取值已更新。' : '取值已新增。');
  }

  function saveRule() {
    if (!ruleForm || !drawerCategory || !selectedField) return;
    const child = drawerCategory.fields.find(item => item.id === ruleForm.childFieldId);
    if (!ruleForm.parentValueId || !child || !ruleForm.allowedChildValueIds.length) return notify('请完整选择父取值、子字段和允许取值。', 'danger');
    if (selectedField.seq >= child.seq) return notify('子字段顺序必须大于当前字段。', 'danger');

    updateCategory(drawerCategory.id, category => {
      if (ruleForm.id) {
        return {
          ...category,
          cascadeRules: category.cascadeRules.map(rule => rule.id === ruleForm.id ? { ...rule, ...ruleForm, id: rule.id } : rule),
        };
      }
      return { ...category, cascadeRules: [...category.cascadeRules, { ...ruleForm, id: uid('rule') }] };
    });
    setRuleForm(null);
    notify(ruleForm.id ? '级联规则已更新。' : '级联规则已新增。');
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'category') {
      setCategories(current => current.filter(item => item.id !== deleteTarget.categoryId));
      if (drawerCategoryId === deleteTarget.categoryId) setDrawerCategoryId(null);
    } else {
      if (deleteTarget.kind === 'field' && deleteTarget.fieldId === selectedFieldId) setDrawerView('fields');
      updateCategory(deleteTarget.categoryId, category => {
        if (deleteTarget.kind === 'field') return {
          ...category,
          fields: category.fields.filter(item => item.id !== deleteTarget.fieldId),
          cascadeRules: category.cascadeRules.filter(rule => rule.parentFieldId !== deleteTarget.fieldId && rule.childFieldId !== deleteTarget.fieldId),
        };
        if (deleteTarget.kind === 'value') return {
          ...category,
          fields: category.fields.map(field => field.id === deleteTarget.fieldId ? { ...field, values: field.values.filter(item => item.id !== deleteTarget.valueId) } : field),
          cascadeRules: category.cascadeRules
            .filter(rule => rule.parentValueId !== deleteTarget.valueId)
            .map(rule => ({ ...rule, allowedChildValueIds: rule.allowedChildValueIds.filter(id => id !== deleteTarget.valueId) }))
            .filter(rule => rule.allowedChildValueIds.length),
        };
        return { ...category, cascadeRules: category.cascadeRules.filter(rule => rule.id !== deleteTarget.ruleId) };
      });
    }
    setDeleteTarget(null);
    notify('自定义配置及关联关系已删除。');
  }

  return (
    <main className={`ds-page ds-page--list dictionary-page${embedded ? ' dictionary-page--embedded' : ''}`}>
      <header className="ds-page__header ds-page-header">
        <div className="dictionary-page-heading">
          <h1>{title}</h1>
          <p>统一维护业务字段、枚举取值及字段间的级联依赖关系</p>
        </div>
        <div className="ds-page-toolbar">
          <div className="dictionary-page-search">
            <Search size={14} />
            <ProductTextInput
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="搜索"
              aria-label="搜索字典分类名称或标识符"
            />
          </div>
          <ProductButton type="primary" size="large" icon={<Plus size={15} />} onClick={() => setCategoryForm(emptyCategory())}>新增</ProductButton>
        </div>
      </header>

      {notice && <div className="dictionary-notice" data-tone={notice.tone} role="status" aria-live="polite">{notice.text}</div>}

      <section className="ds-table-surface">
        <div className="ds-table-scroll dictionary-category-table-wrap">
          <table className="dictionary-category-table">
            <thead>
              <tr>
                <th>分类名称</th>
                <th>标识符</th>
                <th>字段</th>
                <th>状态</th>
                <th>来源</th>
                <th aria-label="操作" />
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(category => (
                <tr className="ds-table-row" key={category.id}>
                  <td>
                    <div className="dictionary-category-name">
                      <div><strong>{category.name}</strong><small>{category.description || '暂无分类说明'}</small></div>
                    </div>
                  </td>
                  <td><code>{category.key}</code></td>
                  <td>{category.fields.length} 个字段</td>
                  <td>
                    <StatusSwitch
                      checked={category.enabled}
                      label={`${category.name}${category.enabled ? '停用' : '启用'}`}
                      onChange={enabled => updateCategory(category.id, item => ({ ...item, enabled }))}
                    />
                  </td>
                  <td><SourceTag source={category.source} /></td>
                  <td>
                    <div className="dictionary-row-actions">
                      <ProductButton type="text" size="small" trailingIcon={<ChevronRight size={14} />} onClick={() => openFields(category)}>
                        查看类型字段
                      </ProductButton>
                      <ProductIconButton
                        size="small"
                        icon={<Pencil size={14} />}
                        aria-label={`编辑${category.name}`}
                        title="编辑分类"
                        onClick={() => setCategoryForm({
                          id: category.id,
                          name: category.name,
                          key: category.key,
                          description: category.description,
                          enabled: category.enabled,
                          source: category.source,
                        })}
                      />
                      {category.source === 'custom' && (
                        <ProductIconButton
                          status="danger"
                          size="small"
                          icon={<Trash2 size={14} />}
                          aria-label={`删除${category.name}`}
                          title="删除分类"
                          onClick={() => setDeleteTarget({ kind: 'category', categoryId: category.id, label: category.name })}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredCategories.length && <div className="dictionary-empty"><Search size={24} /><strong>未找到分类</strong><span>请调整搜索关键词</span></div>}
        </div>
      </section>

      <ProductDrawer
        open={Boolean(drawerCategory)}
        onOpenChange={open => {
          if (!open) {
            setDrawerCategoryId(null);
            setDrawerView('fields');
          }
        }}
        title={drawerView === 'field' && selectedField ? selectedField.name : (drawerCategory?.name ?? '类型字段')}
        description={drawerView === 'field' && selectedField
          ? `seq ${selectedField.seq} · ${selectedField.key}`
          : drawerCategory ? `${drawerCategory.description} · ${drawerCategory.key}` : undefined}
        width="min(680px, calc(100vw - 48px))"
        footer={<ProductButton onClick={() => setDrawerCategoryId(null)}>关闭</ProductButton>}
      >
        {drawerCategory && (
          <div className="dictionary-drawer-content">
            {drawerView === 'fields' ? (
              <>
                <div className="dictionary-drawer-toolbar">
                  <div className="dictionary-drawer-search">
                    <Search size={14} />
                    <ProductTextInput value={fieldQuery} onChange={event => setFieldQuery(event.target.value)} placeholder="搜索字段" aria-label="搜索类型字段" />
                  </div>
                  <ProductButton type="primary" size="small" icon={<Plus size={14} />} onClick={() => setFieldForm(emptyField(Math.max(0, ...drawerCategory.fields.map(item => item.seq)) + 1))}>新增字段</ProductButton>
                </div>
                <div className="dictionary-drawer-table-wrap">
                  <table className="dictionary-drawer-table">
                    <thead><tr><th>字段名称</th><th>seq</th><th>状态</th><th aria-label="操作" /></tr></thead>
                    <tbody>{filteredFields.map(field => (
                      <tr key={field.id}>
                        <td><button type="button" className="dictionary-field-link" onClick={() => openField(field)}><strong>{field.name}</strong><code>{field.key}</code></button></td>
                        <td>{field.seq}</td>
                        <td><ProductTag tone={field.enabled ? 'success' : 'neutral'} size="small">{field.enabled ? '已启用' : '已停用'}</ProductTag></td>
                        <td><div className="dictionary-row-actions">
                          <ProductButton type="text" size="small" trailingIcon={<ChevronRight size={14} />} onClick={() => openField(field)}>查看</ProductButton>
                          <ProductIconButton size="small" icon={<Pencil size={13} />} aria-label={`编辑${field.name}`} onClick={() => setFieldForm({ id: field.id, name: field.name, key: field.key, seq: String(field.seq), enabled: field.enabled, source: field.source })} />
                          {field.source === 'custom' && <ProductIconButton size="small" status="danger" icon={<Trash2 size={13} />} aria-label={`删除${field.name}`} onClick={() => setDeleteTarget({ kind: 'field', categoryId: drawerCategory.id, fieldId: field.id, label: field.name })} />}
                        </div></td>
                      </tr>
                    ))}</tbody>
                  </table>
                  {!filteredFields.length && <div className="ds-empty">{fieldQuery ? '未找到匹配的字段' : '暂无类型字段，点击“新增字段”开始添加'}</div>}
                </div>
              </>
            ) : selectedField ? (
              <>
                <div className="dictionary-field-nav">
                  <ProductButton type="text" size="small" icon={<ArrowLeft size={14} />} onClick={() => setDrawerView('fields')}>返回字段列表</ProductButton>
                  <div className="dictionary-row-actions">
                    <StatusSwitch checked={selectedField.enabled} label={`${selectedField.name}${selectedField.enabled ? '停用' : '启用'}`} onChange={enabled => updateCategory(drawerCategory.id, category => ({
                      ...category,
                      fields: category.fields.map(item => item.id === selectedField.id ? { ...item, enabled } : item),
                    }))} />
                    <SourceTag source={selectedField.source} />
                    <ProductIconButton size="small" icon={<Pencil size={13} />} aria-label="编辑字段" onClick={() => setFieldForm({ id: selectedField.id, name: selectedField.name, key: selectedField.key, seq: String(selectedField.seq), enabled: selectedField.enabled, source: selectedField.source })} />
                  </div>
                </div>
                <div className="dictionary-detail-tabbar">
                  <div className="ds-status-tabs" role="tablist" aria-label="字段详情">
                    <button className="ds-status-tab" type="button" role="tab" aria-selected={fieldDetailTab === 'values'} onClick={() => setFieldDetailTab('values')}>枚举取值</button>
                    <button className="ds-status-tab" type="button" role="tab" aria-selected={fieldDetailTab === 'cascade'} onClick={() => setFieldDetailTab('cascade')}>级联配置</button>
                  </div>
                </div>
                {fieldDetailTab === 'values' ? (
                  <>
                    <div className="dictionary-drawer-toolbar">
                      <div className="dictionary-drawer-search">
                        <Search size={14} />
                        <ProductTextInput value={valueQuery} onChange={event => setValueQuery(event.target.value)} placeholder="搜索取值" aria-label="搜索字段取值" />
                      </div>
                      <ProductButton type="primary" size="small" icon={<Plus size={14} />} onClick={() => setValueForm(emptyValue())}>新增取值</ProductButton>
                    </div>
                    <div className="dictionary-drawer-table-wrap">
                      <table className="dictionary-drawer-table dictionary-value-table">
                        <thead><tr><th>取值名称</th><th>实际值</th><th>状态</th><th aria-label="操作" /></tr></thead>
                        <tbody>{filteredValues.map(item => (
                          <tr key={item.id}>
                            <td><div className="dictionary-value-name"><strong>{item.name}</strong><code>{item.key} · {item.dataType}</code></div></td>
                            <td><span className="dictionary-cell-ellipsis" title={item.value}>{item.value}</span></td>
                            <td><StatusSwitch checked={item.enabled} label={`${item.name}${item.enabled ? '停用' : '启用'}`} onChange={enabled => updateCategory(drawerCategory.id, category => ({
                              ...category,
                              fields: category.fields.map(field => field.id === selectedField.id ? { ...field, values: field.values.map(value => value.id === item.id ? { ...value, enabled } : value) } : field),
                            }))} /></td>
                            <td><div className="dictionary-row-actions">
                              {item.source === 'builtin' && <LockKeyhole size={13} aria-label="内置取值" />}
                              <ProductIconButton size="small" icon={<Pencil size={13} />} aria-label={`编辑${item.name}`} onClick={() => setValueForm({ ...item })} />
                              {item.source === 'custom' && <ProductIconButton size="small" status="danger" icon={<Trash2 size={13} />} aria-label={`删除${item.name}`} onClick={() => setDeleteTarget({ kind: 'value', categoryId: drawerCategory.id, fieldId: selectedField.id, valueId: item.id, label: item.name })} />}
                            </div></td>
                          </tr>
                        ))}</tbody>
                      </table>
                      {!filteredValues.length && <div className="ds-empty">{valueQuery ? '未找到匹配的取值' : '暂无枚举取值，点击“新增取值”开始添加'}</div>}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="dictionary-drawer-toolbar">
                      <span className="dictionary-toolbar-copy">当前父字段：{selectedField.name}</span>
                      <ProductButton type="primary" size="small" icon={<Plus size={14} />} disabled={!sortedFields.some(field => field.seq > selectedField.seq)} onClick={() => setRuleForm({ ...emptyRule(), parentFieldId: selectedField.id })}>新增级联</ProductButton>
                    </div>
                    <div className="dictionary-drawer-table-wrap">
                      <table className="dictionary-drawer-table dictionary-rule-table">
                        <thead><tr><th>父字段取值</th><th>关联子字段</th><th>状态</th><th aria-label="操作" /></tr></thead>
                        <tbody>{fieldRules.map(rule => {
                          const parentValue = selectedField.values.find(item => item.id === rule.parentValueId);
                          const child = drawerCategory.fields.find(item => item.id === rule.childFieldId);
                          const names = child?.values.filter(item => rule.allowedChildValueIds.includes(item.id)).map(item => item.name) ?? [];
                          return <tr key={rule.id}>
                            <td><strong>{parentValue?.name ?? '取值已删除'}</strong></td>
                            <td><div className="dictionary-value-name"><strong>{child?.name ?? '字段已删除'}</strong><span title={names.join('、')}>允许：{names.join('、') || '无可用取值'}</span></div></td>
                            <td><StatusSwitch checked={rule.enabled} label="切换级联规则状态" onChange={enabled => updateCategory(drawerCategory.id, category => ({
                              ...category,
                              cascadeRules: category.cascadeRules.map(item => item.id === rule.id ? { ...item, enabled } : item),
                            }))} /></td>
                            <td><div className="dictionary-row-actions">
                              <ProductIconButton size="small" icon={<Pencil size={13} />} aria-label="编辑级联" onClick={() => setRuleForm({ ...rule })} />
                              {rule.source === 'custom' ? <ProductIconButton size="small" status="danger" icon={<Trash2 size={13} />} aria-label="删除级联" onClick={() => setDeleteTarget({ kind: 'rule', categoryId: drawerCategory.id, ruleId: rule.id, label: `${parentValue?.name ?? ''} → ${child?.name ?? ''}` })} /> : <LockKeyhole size={13} aria-label="内置级联" />}
                            </div></td>
                          </tr>;
                        })}</tbody>
                      </table>
                      {!fieldRules.length && <div className="ds-empty">当前字段暂无级联配置</div>}
                    </div>
                  </>
                )}
              </>
            ) : null}
          </div>
        )}
      </ProductDrawer>

      <ProductModal open={Boolean(categoryForm)} onOpenChange={open => !open && setCategoryForm(null)} title={categoryForm?.id ? '编辑分类' : '新增分类'} description="分类用于按业务场景组织字段字典。" size="md" footer={<><ProductButton onClick={() => setCategoryForm(null)}>取消</ProductButton><ProductButton type="primary" onClick={saveCategory}>保存</ProductButton></>}>
        {categoryForm && <div className="dictionary-form">
          <ProductField label="分类名称"><ProductTextInput value={categoryForm.name} onChange={event => setCategoryForm({ ...categoryForm, name: event.target.value })} /></ProductField>
          <ProductField label="唯一标识符" hint={categoryForm.source === 'builtin' ? '内置标识符不可修改' : undefined}><ProductTextInput value={categoryForm.key} readOnly={categoryForm.source === 'builtin'} onChange={event => setCategoryForm({ ...categoryForm, key: event.target.value })} /></ProductField>
          <ProductField label="分类说明"><ProductTextArea value={categoryForm.description} onChange={event => setCategoryForm({ ...categoryForm, description: event.target.value })} /></ProductField>
          <ProductCheckbox checked={categoryForm.enabled} onChange={event => setCategoryForm({ ...categoryForm, enabled: event.target.checked })} label="启用分类" />
        </div>}
      </ProductModal>

      <ProductModal open={Boolean(fieldForm)} onOpenChange={open => !open && setFieldForm(null)} title={fieldForm?.id ? '编辑字段' : '新增字段'} description="字段类型固定为枚举，seq 决定展示与依赖顺序。" size="md" footer={<><ProductButton onClick={() => setFieldForm(null)}>取消</ProductButton><ProductButton type="primary" onClick={saveField}>保存</ProductButton></>}>
        {fieldForm && <div className="dictionary-form">
          <ProductField label="字段名称"><ProductTextInput value={fieldForm.name} onChange={event => setFieldForm({ ...fieldForm, name: event.target.value })} /></ProductField>
          <ProductField label="唯一标识符" hint={fieldForm.source === 'builtin' ? '内置标识符不可修改' : undefined}><ProductTextInput value={fieldForm.key} readOnly={fieldForm.source === 'builtin'} onChange={event => setFieldForm({ ...fieldForm, key: event.target.value })} /></ProductField>
          <div className="dictionary-form__grid">
            <ProductField label="字段类型"><ProductTextInput value="枚举（Enum）" readOnly /></ProductField>
            <ProductField label="主键顺序（seq）"><ProductTextInput type="number" min="1" value={fieldForm.seq} onChange={event => setFieldForm({ ...fieldForm, seq: event.target.value })} /></ProductField>
          </div>
          <ProductCheckbox checked={fieldForm.enabled} onChange={event => setFieldForm({ ...fieldForm, enabled: event.target.checked })} label="启用字段" />
        </div>}
      </ProductModal>

      <ProductModal open={Boolean(valueForm)} onOpenChange={open => !open && setValueForm(null)} title={valueForm?.id ? '编辑取值' : '新增取值'} description={`当前字段：${selectedField?.name ?? '-'}`} size="md" footer={<><ProductButton onClick={() => setValueForm(null)}>取消</ProductButton><ProductButton type="primary" onClick={saveValue}>保存</ProductButton></>}>
        {valueForm && <div className="dictionary-form">
          <ProductField label="取值名称"><ProductTextInput value={valueForm.name} onChange={event => setValueForm({ ...valueForm, name: event.target.value })} /></ProductField>
          <ProductField label="唯一标识符" hint={valueForm.source === 'builtin' ? '内置标识符不可修改' : undefined}><ProductTextInput value={valueForm.key} readOnly={valueForm.source === 'builtin'} onChange={event => setValueForm({ ...valueForm, key: event.target.value })} /></ProductField>
          <div className="dictionary-form__grid">
            <ProductField label="实际值"><ProductTextInput value={valueForm.value} onChange={event => setValueForm({ ...valueForm, value: event.target.value })} /></ProductField>
            <ProductField label="数据类型"><ProductSelect value={valueForm.dataType} onChange={event => setValueForm({ ...valueForm, dataType: event.target.value as DictionaryValueDataType })}><option value="string">string</option><option value="number">number</option><option value="boolean">boolean</option></ProductSelect></ProductField>
          </div>
          <ProductCheckbox checked={valueForm.enabled} onChange={event => setValueForm({ ...valueForm, enabled: event.target.checked })} label="启用取值" />
        </div>}
      </ProductModal>

      <ProductModal open={Boolean(ruleForm)} onOpenChange={open => !open && setRuleForm(null)} title={ruleForm?.id ? '编辑级联' : '新增级联'} description={`当前父字段：${selectedField?.name ?? '-'}`} size="md" footer={<><ProductButton onClick={() => setRuleForm(null)}>取消</ProductButton><ProductButton type="primary" onClick={saveRule}>保存</ProductButton></>}>
        {ruleForm && drawerCategory && selectedField && <div className="dictionary-form">
          <ProductField label={`${selectedField.name}取值`}>
            <ProductSelect value={ruleForm.parentValueId} onChange={event => setRuleForm({ ...ruleForm, parentValueId: event.target.value })}>
              <option value="">请选择父字段取值</option>
              {selectedField.values.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </ProductSelect>
          </ProductField>
          <ProductField label="关联子字段" hint="仅显示 seq 大于当前字段的字段">
            <ProductSelect value={ruleForm.childFieldId} onChange={event => setRuleForm({ ...ruleForm, childFieldId: event.target.value, allowedChildValueIds: [] })}>
              <option value="">请选择子字段</option>
              {sortedFields.filter(field => field.seq > selectedField.seq).map(field => <option key={field.id} value={field.id}>{field.name} · seq {field.seq}</option>)}
            </ProductSelect>
          </ProductField>
          <fieldset className="dictionary-value-options" disabled={!ruleChildField}>
            <legend>允许显示的子字段取值</legend>
            {ruleChildField?.values.map(item => <ProductCheckbox key={item.id} checked={ruleForm.allowedChildValueIds.includes(item.id)} onChange={event => setRuleForm({
              ...ruleForm,
              allowedChildValueIds: event.target.checked ? [...ruleForm.allowedChildValueIds, item.id] : ruleForm.allowedChildValueIds.filter(id => id !== item.id),
            })} label={item.name} />)}
            {!ruleChildField && <span>请先选择子字段</span>}
          </fieldset>
          <ProductCheckbox checked={ruleForm.enabled} onChange={event => setRuleForm({ ...ruleForm, enabled: event.target.checked })} label="启用级联" />
        </div>}
      </ProductModal>

      <ProductModal open={Boolean(deleteTarget)} onOpenChange={open => !open && setDeleteTarget(null)} title="确认删除" description="删除操作不可撤销。" status="danger" footer={<><ProductButton onClick={() => setDeleteTarget(null)}>取消</ProductButton><ProductButton type="primary" status="danger" onClick={confirmDelete}>确认删除</ProductButton></>}>
        <p className="dictionary-delete-copy">确定删除“{deleteTarget?.label}”吗？相关的自定义内容与级联关系将同步清理。</p>
      </ProductModal>
    </main>
  );
}
