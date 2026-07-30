import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  BookKey,
  Boxes,
  ChevronDown,
  ChevronRight,
  Folder,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import {
  ProductButton,
  ProductCheckbox,
  ProductField,
  ProductIconButton,
  ProductModal,
  ProductSelect,
  ProductTag,
  ProductTextInput,
} from './ProductUI';
import type { DictionaryCategory, DictionaryValue } from '../dictionaryData';
import { ConfigurationTemplateManager } from './ConfigurationTemplateManager';
import { ParameterDefinitionManager } from './ParameterDefinitionManager';
import '../../styles/business/data-management.css';

export type DataManagementSection = 'dictionary' | 'templates' | 'parameters';
export const DATA_MANAGEMENT_SECTION_EVENT = 'digital-machine:data-management-section';
const DATA_MANAGEMENT_SECTION_KEY = 'digital-machine-data-management-section';

export const DATA_MANAGEMENT_SECTIONS = [
  { key: 'dictionary' as const, label: '字段字典', description: '字段、枚举取值与级联关系', icon: BookKey },
  { key: 'templates' as const, label: '构型模板', description: '型号与组件构型模板', icon: Boxes },
  { key: 'parameters' as const, label: '参数定义', description: '参数结构与数据约束', icon: SlidersHorizontal },
];

function initialSection(): DataManagementSection {
  if (typeof window === 'undefined') return 'dictionary';
  const stored = window.localStorage.getItem(DATA_MANAGEMENT_SECTION_KEY);
  return stored === 'templates' || stored === 'parameters' ? stored : 'dictionary';
}

export function activateDataManagementSection(section: DataManagementSection) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DATA_MANAGEMENT_SECTION_KEY, section);
  window.dispatchEvent(new CustomEvent<DataManagementSection>(DATA_MANAGEMENT_SECTION_EVENT, { detail: section }));
}

export function readDataManagementSection(): DataManagementSection {
  return initialSection();
}

function StatusSwitch({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className="dictionary-switch" data-selected={checked ? 'true' : undefined} onClick={() => onChange(!checked)}><span /></button>;
}

function FieldDictionaryVersionView({
  categories,
  onCategoriesChange: setCategories,
}: {
  categories: DictionaryCategory[];
  onCategoriesChange: Dispatch<SetStateAction<DictionaryCategory[]>>;
}) {
  const firstField = categories.flatMap(category => category.fields)[0];
  const [selectedFieldId, setSelectedFieldId] = useState(firstField?.id ?? '');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set(categories.map(item => item.id)));
  const [tab, setTab] = useState<'values' | 'cascade'>('values');
  const [query, setQuery] = useState('');
  const [valueOpen, setValueOpen] = useState(false);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [deleteValue, setDeleteValue] = useState<DictionaryValue | null>(null);
  const [valueForm, setValueForm] = useState<DictionaryValue>({
    id: '',
    name: '',
    key: '',
    value: '',
    dataType: 'string',
    enabled: true,
    source: 'custom',
  });
  const [ruleForm, setRuleForm] = useState({ parentValueId: '', childFieldId: '', allowedChildValueIds: [] as string[] });

  const location = useMemo(() => {
    for (const category of categories) {
      const field = category.fields.find(item => item.id === selectedFieldId);
      if (field) return { category, field };
    }
    const category = categories[0];
    return category?.fields[0] ? { category, field: category.fields[0] } : null;
  }, [categories, selectedFieldId]);
  const selectedCategory = location?.category;
  const selectedField = location?.field;
  const rules = selectedCategory?.cascadeRules.filter(rule => rule.parentFieldId === selectedField?.id) ?? [];
  const childField = selectedCategory?.fields.find(item => item.id === ruleForm.childFieldId);
  const filteredValues = selectedField?.values.filter(item => {
    const term = query.trim().toLowerCase();
    return !term || item.name.toLowerCase().includes(term) || item.key.toLowerCase().includes(term) || item.value.toLowerCase().includes(term);
  }) ?? [];

  useEffect(() => {
    if (!selectedField && firstField) setSelectedFieldId(firstField.id);
  }, [firstField, selectedField]);

  function updateSelectedCategory(updater: (category: DictionaryCategory) => DictionaryCategory) {
    if (!selectedCategory) return;
    setCategories(current => current.map(category => category.id === selectedCategory.id ? updater(category) : category));
  }

  function toggleCategory(id: string) {
    setExpandedCategories(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openCreateValue() {
    setValueForm({ id: '', name: '', key: '', value: '', dataType: 'string', enabled: true, source: 'custom' });
    setValueOpen(true);
  }

  function openEditValue(value: DictionaryValue) {
    setValueForm({ ...value });
    setValueOpen(true);
  }

  function saveValue() {
    if (!selectedField || !valueForm.name.trim() || !valueForm.key.trim() || !valueForm.value.trim()) return;
    if (selectedField.values.some(item => item.key === valueForm.key.trim() && item.id !== valueForm.id)) return;
    updateSelectedCategory(category => ({
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
            ...valueForm,
            id: `value-${Date.now()}`,
            name: valueForm.name.trim(),
            key: valueForm.key.trim(),
            value: valueForm.value.trim(),
            source: 'custom',
          }],
        };
      }),
    }));
    setValueOpen(false);
  }

  function confirmDeleteValue() {
    if (!selectedField || !deleteValue || deleteValue.source !== 'custom') return;
    updateSelectedCategory(category => ({
      ...category,
      fields: category.fields.map(field => field.id === selectedField.id
        ? { ...field, values: field.values.filter(value => value.id !== deleteValue.id) }
        : field),
      cascadeRules: category.cascadeRules.flatMap(rule => {
        if (rule.parentFieldId === selectedField.id && rule.parentValueId === deleteValue.id) return [];
        if (rule.childFieldId !== selectedField.id || !rule.allowedChildValueIds.includes(deleteValue.id)) return [rule];
        const allowedChildValueIds = rule.allowedChildValueIds.filter(id => id !== deleteValue.id);
        return allowedChildValueIds.length ? [{ ...rule, allowedChildValueIds }] : [];
      }),
    }));
    setDeleteValue(null);
  }

  function addRule() {
    if (!selectedField || !ruleForm.parentValueId || !ruleForm.childFieldId || !ruleForm.allowedChildValueIds.length) return;
    updateSelectedCategory(category => ({
      ...category,
      cascadeRules: [...category.cascadeRules, {
        id: `rule-${Date.now()}`,
        parentFieldId: selectedField.id,
        parentValueId: ruleForm.parentValueId,
        childFieldId: ruleForm.childFieldId,
        allowedChildValueIds: ruleForm.allowedChildValueIds,
        enabled: true,
        source: 'custom',
      }],
    }));
    setRuleForm({ parentValueId: '', childFieldId: '', allowedChildValueIds: [] });
    setRuleOpen(false);
  }

  return (
    <div className="ds-page ds-page--split data-field-dictionary">
      <aside className="ds-page__sidebar data-field-dictionary__sidebar">
        <header className="data-field-dictionary__tree-header">
          <div><h1>字典目录</h1><p>{categories.length} 个分类 · {categories.reduce((sum, item) => sum + item.fields.length, 0)} 个字段</p></div>
        </header>
        <div className="data-field-dictionary__tree">
          <div className="taxonomy-tree">
            {categories.map(category => {
              const expanded = expandedCategories.has(category.id);
              return <section className="taxonomy-tree-section" key={category.id}>
                <div className="taxonomy-tree-node taxonomy-tree-category">
                  <button type="button" className="taxonomy-tree-category-main" aria-expanded={expanded} onClick={() => toggleCategory(category.id)}>
                    <span className="taxonomy-tree-folder"><Folder size={18} /></span>
                    <span className="data-field-dictionary__tree-label">{category.name}</span>
                    {expanded ? <ChevronDown className="taxonomy-tree-expand-icon" size={18} /> : <ChevronRight className="taxonomy-tree-expand-icon" size={18} />}
                  </button>
                </div>
                {expanded && <div className="taxonomy-tree-category-children data-field-dictionary__field-list">
                  {[...category.fields].sort((a, b) => a.seq - b.seq).map(field => (
                    <div className={`taxonomy-tree-node product-tree-item ${field.id === selectedField?.id ? 'is-selected' : ''}`} key={field.id}>
                      <button type="button" className="product-tree-main" onClick={() => { setSelectedFieldId(field.id); setTab('values'); setQuery(''); }}>
                        <span className="product-tree-dot" />
                        <span className="data-field-dictionary__tree-label">{field.name}</span>
                        <small>{field.seq}</small>
                      </button>
                    </div>
                  ))}
                </div>}
              </section>;
            })}
          </div>
        </div>
      </aside>

      <main className="ds-page__content product-version-content data-field-dictionary__content">
        {selectedCategory && selectedField ? (
          <>
            <header className="data-field-dictionary__content-header">
              <div>
                <div className="data-field-dictionary__breadcrumb"><span>{selectedCategory.name}</span><ChevronRight size={14} /><h1>{selectedField.name}</h1><ProductTag tone="accent" size="small">{selectedField.key}</ProductTag></div>
                <p>维护“{selectedField.name}”字段的枚举取值及其对后序字段的级联范围。</p>
              </div>
              <div className="data-field-dictionary__field-status">
                <span>{selectedField.enabled ? '已启用' : '已停用'}</span>
                <StatusSwitch checked={selectedField.enabled} label={`${selectedField.name}${selectedField.enabled ? '停用' : '启用'}`} onChange={enabled => updateSelectedCategory(category => ({
                  ...category,
                  fields: category.fields.map(field => field.id === selectedField.id ? { ...field, enabled } : field),
                }))} />
              </div>
            </header>
            <div className="data-field-dictionary__toolbar">
              <div className="ds-status-tabs" role="tablist" aria-label="字段内容">
                <button className="ds-status-tab" type="button" role="tab" aria-selected={tab === 'values'} onClick={() => setTab('values')}>枚举取值</button>
                <button className="ds-status-tab" type="button" role="tab" aria-selected={tab === 'cascade'} onClick={() => setTab('cascade')}>级联配置</button>
              </div>
              {tab === 'values' ? <div className="data-field-dictionary__search"><Search size={14} /><ProductTextInput value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索取值名称、标识符或实际值" aria-label="搜索枚举取值" /></div> : <span>当前父字段：{selectedField.name}</span>}
              <ProductButton type="primary" size="large" icon={<Plus size={15} />} disabled={tab === 'cascade' && !selectedCategory.fields.some(field => field.seq > selectedField.seq)} onClick={() => tab === 'values' ? openCreateValue() : setRuleOpen(true)}>
                {tab === 'values' ? '新增取值' : '新增级联'}
              </ProductButton>
            </div>
            <div className="data-field-dictionary__table-scroll">
              {tab === 'values' ? (
                <table className="data-management-table data-management-table--actions data-field-dictionary__table">
                  <thead><tr><th>取值名称</th><th>标识符</th><th>实际值</th><th>数据类型</th><th>状态</th><th aria-label="操作">操作</th></tr></thead>
                  <tbody>{filteredValues.map(item => <tr key={item.id}>
                    <td><strong>{item.name}</strong></td><td><code>{item.key}</code></td><td>{item.value}</td><td>{item.dataType}</td>
                    <td><StatusSwitch checked={item.enabled} label={`${item.name}${item.enabled ? '停用' : '启用'}`} onChange={enabled => updateSelectedCategory(category => ({
                      ...category,
                      fields: category.fields.map(field => field.id === selectedField.id ? { ...field, values: field.values.map(value => value.id === item.id ? { ...value, enabled } : value) } : field),
                    }))} /></td>
                    <td><div className="data-field-dictionary__row-actions">
                      <ProductIconButton size="small" icon={<Pencil size={13} />} aria-label={`编辑${item.name}`} title="编辑" onClick={() => openEditValue(item)} />
                      <ProductIconButton
                        size="small"
                        status="danger"
                        icon={<Trash2 size={13} />}
                        aria-label={item.source === 'builtin' ? `${item.name}为内置取值，不可删除` : `删除${item.name}`}
                        title={item.source === 'builtin' ? '内置取值不可删除' : '删除'}
                        disabled={item.source === 'builtin'}
                        onClick={() => setDeleteValue(item)}
                      />
                    </div></td>
                  </tr>)}</tbody>
                </table>
              ) : (
                <table className="data-management-table data-field-dictionary__table">
                  <thead><tr><th>父字段取值</th><th>关联子字段</th><th>允许显示的取值</th><th>状态</th></tr></thead>
                  <tbody>{rules.map(rule => {
                    const parentValue = selectedField.values.find(item => item.id === rule.parentValueId);
                    const child = selectedCategory.fields.find(item => item.id === rule.childFieldId);
                    const allowed = child?.values.filter(item => rule.allowedChildValueIds.includes(item.id)).map(item => item.name) ?? [];
                    return <tr key={rule.id}><td><strong>{parentValue?.name ?? '-'}</strong></td><td>{child?.name ?? '-'}</td><td><span className="data-field-dictionary__ellipsis" title={allowed.join('、')}>{allowed.join('、') || '-'}</span></td><td><StatusSwitch checked={rule.enabled} label="切换级联状态" onChange={enabled => updateSelectedCategory(category => ({ ...category, cascadeRules: category.cascadeRules.map(item => item.id === rule.id ? { ...item, enabled } : item) }))} /></td></tr>;
                  })}</tbody>
                </table>
              )}
              {(tab === 'values' ? !filteredValues.length : !rules.length) && <div className="ds-empty">{tab === 'values' ? '暂无匹配取值' : '当前字段暂无级联配置'}</div>}
            </div>
          </>
        ) : <div className="ds-empty">暂无可配置字段</div>}
      </main>

      <ProductModal open={valueOpen} onOpenChange={setValueOpen} title={valueForm.id ? '编辑枚举取值' : '新增枚举取值'} description={`当前字段：${selectedField?.name ?? '-'}`} size="md" footer={<><ProductButton onClick={() => setValueOpen(false)}>取消</ProductButton><ProductButton type="primary" onClick={saveValue}>保存</ProductButton></>}>
        <div className="data-field-dictionary__form">
          <ProductField label="取值名称"><ProductTextInput value={valueForm.name} onChange={event => setValueForm({ ...valueForm, name: event.target.value })} /></ProductField>
          <ProductField label="唯一标识符" hint={valueForm.source === 'builtin' ? '内置标识符不可修改' : undefined}><ProductTextInput value={valueForm.key} readOnly={valueForm.source === 'builtin'} onChange={event => setValueForm({ ...valueForm, key: event.target.value })} /></ProductField>
          <ProductField label="实际值"><ProductTextInput value={valueForm.value} onChange={event => setValueForm({ ...valueForm, value: event.target.value })} /></ProductField>
          <ProductField label="数据类型"><ProductSelect value={valueForm.dataType} onChange={event => setValueForm({ ...valueForm, dataType: event.target.value as DictionaryValue['dataType'] })}><option value="string">string</option><option value="number">number</option><option value="boolean">boolean</option></ProductSelect></ProductField>
          <ProductCheckbox checked={valueForm.enabled} onChange={event => setValueForm({ ...valueForm, enabled: event.target.checked })} label="启用取值" />
        </div>
      </ProductModal>

      <ProductModal open={Boolean(deleteValue)} onOpenChange={open => !open && setDeleteValue(null)} title="确认删除取值" description="删除操作不可撤销。" status="danger" footer={<><ProductButton onClick={() => setDeleteValue(null)}>取消</ProductButton><ProductButton type="primary" status="danger" onClick={confirmDeleteValue}>确认删除</ProductButton></>}>
        <p className="data-field-dictionary__delete-copy">确定删除“{deleteValue?.name ?? ''}”吗？引用该取值的级联关系将同步清理。</p>
      </ProductModal>

      <ProductModal open={ruleOpen} onOpenChange={setRuleOpen} title="新增级联" description={`当前父字段：${selectedField?.name ?? '-'}`} size="md" footer={<><ProductButton onClick={() => setRuleOpen(false)}>取消</ProductButton><ProductButton type="primary" onClick={addRule}>保存</ProductButton></>}>
        {selectedCategory && selectedField && <div className="data-field-dictionary__form">
          <ProductField label="父字段取值"><ProductSelect value={ruleForm.parentValueId} onChange={event => setRuleForm({ ...ruleForm, parentValueId: event.target.value })}><option value="">请选择</option>{selectedField.values.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</ProductSelect></ProductField>
          <ProductField label="关联子字段"><ProductSelect value={ruleForm.childFieldId} onChange={event => setRuleForm({ parentValueId: ruleForm.parentValueId, childFieldId: event.target.value, allowedChildValueIds: [] })}><option value="">请选择</option>{selectedCategory.fields.filter(field => field.seq > selectedField.seq).map(field => <option key={field.id} value={field.id}>{field.name}</option>)}</ProductSelect></ProductField>
          <fieldset className="dictionary-value-options"><legend>允许显示的取值</legend>{childField?.values.map(item => <ProductCheckbox key={item.id} label={item.name} checked={ruleForm.allowedChildValueIds.includes(item.id)} onChange={event => setRuleForm({ ...ruleForm, allowedChildValueIds: event.target.checked ? [...ruleForm.allowedChildValueIds, item.id] : ruleForm.allowedChildValueIds.filter(id => id !== item.id) })} />)}{!childField && <span>请先选择子字段</span>}</fieldset>
        </div>}
      </ProductModal>
    </div>
  );
}

export function DataManagementManager({
  categories,
  onCategoriesChange,
}: {
  categories: DictionaryCategory[];
  onCategoriesChange: Dispatch<SetStateAction<DictionaryCategory[]>>;
}) {
  const [activeSection, setActiveSection] = useState<DataManagementSection>(initialSection);

  useEffect(() => {
    const handleSection = (event: Event) => {
      const section = (event as CustomEvent<DataManagementSection>).detail;
      if (section === 'dictionary' || section === 'templates' || section === 'parameters') setActiveSection(section);
    };
    window.addEventListener(DATA_MANAGEMENT_SECTION_EVENT, handleSection);
    return () => window.removeEventListener(DATA_MANAGEMENT_SECTION_EVENT, handleSection);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(DATA_MANAGEMENT_SECTION_KEY, activeSection);
  }, [activeSection]);

  const meta = DATA_MANAGEMENT_SECTIONS.find(item => item.key === activeSection) ?? DATA_MANAGEMENT_SECTIONS[0];
  const ActiveIcon = meta.icon;

  if (activeSection === 'dictionary') return <FieldDictionaryVersionView categories={categories} onCategoriesChange={onCategoriesChange} />;
  if (activeSection === 'templates') return <ConfigurationTemplateManager categories={categories} />;
  if (activeSection === 'parameters') return <ParameterDefinitionManager />;
  return <div className="ds-page data-management-placeholder"><span><ActiveIcon size={26} /></span><h1>{meta.label}</h1><p>该模块暂未建设，本轮先完成“字段字典”。</p></div>;
}
