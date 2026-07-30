import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';
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

export type ParameterDataType = 'enum' | 'integer' | 'float' | 'text';

export interface ParameterEnumOption {
  id: string;
  name: string;
  key: string;
}

export interface ParameterDefinition {
  id: string;
  name: string;
  key: string;
  type: ParameterDataType;
  enabled: boolean;
  defaultValue: string;
  enumOptions: ParameterEnumOption[];
}

export interface ParameterGroup {
  id: string;
  name: string;
  key: string;
  parentId?: string;
  fields: ParameterDefinition[];
}

interface ParameterForm extends ParameterDefinition {
  groupId: string;
}

const STORAGE_KEY = 'digital-machine-parameter-definitions';
export const PARAMETER_DEFINITIONS_EVENT = 'digital-machine:parameter-definitions-updated';

const TYPE_LABELS: Record<ParameterDataType, string> = {
  enum: '枚举型',
  integer: '整型',
  float: '浮点型',
  text: '文本型',
};

function option(id: string, name: string, key: string): ParameterEnumOption {
  return { id, name, key };
}

function initialGroups(): ParameterGroup[] {
  return [
    {
      id: 'parameter-chassis',
      name: '底盘',
      key: 'chassis',
      fields: [
        { id: 'chassis-drive-mode', name: '驱动方式', key: 'drive_mode', type: 'enum', enabled: true, defaultValue: 'differential', enumOptions: [option('drive-differential', '差速驱动', 'differential'), option('drive-omni', '全向驱动', 'omnidirectional')] },
        { id: 'chassis-wheelbase', name: '轴距', key: 'wheelbase', type: 'float', enabled: true, defaultValue: '0.6', enumOptions: [] },
      ],
    },
    {
      id: 'parameter-arm',
      name: '机械臂整臂',
      key: 'robot_arm',
      fields: [
        { id: 'arm-payload', name: '额定负载', key: 'rated_payload', type: 'float', enabled: true, defaultValue: '5', enumOptions: [] },
        { id: 'arm-control-mode', name: '控制模式', key: 'control_mode', type: 'enum', enabled: true, defaultValue: 'position', enumOptions: [option('control-position', '位置控制', 'position'), option('control-force', '力控', 'force')] },
      ],
    },
    {
      id: 'parameter-arm-module',
      name: '机械臂模块',
      key: 'robot_arm_module',
      fields: [],
    },
    {
      id: 'parameter-arm-module-base',
      parentId: 'parameter-arm-module',
      name: '底座',
      key: 'arm_module:base',
      fields: [
        { id: 'module-base-mount', name: '安装方式', key: 'base_mount_type', type: 'enum', enabled: true, defaultValue: 'fixed', enumOptions: [option('base-fixed', '固定式', 'fixed'), option('base-mobile', '移动式', 'mobile')] },
      ],
    },
    {
      id: 'parameter-arm-module-joint',
      parentId: 'parameter-arm-module',
      name: '关节',
      key: 'arm_module:joint',
      fields: [
        { id: 'module-reduction-ratio', name: '减速比', key: 'reduction_ratio', type: 'float', enabled: true, defaultValue: '100', enumOptions: [] },
      ],
    },
    {
      id: 'parameter-arm-module-link',
      parentId: 'parameter-arm-module',
      name: '连杆',
      key: 'arm_module:link',
      fields: [
        { id: 'module-link-length', name: '连杆长度', key: 'link_length', type: 'float', enabled: true, defaultValue: '400', enumOptions: [] },
      ],
    },
    {
      id: 'parameter-arm-module-end',
      parentId: 'parameter-arm-module',
      name: '末端',
      key: 'arm_module:end_effector',
      fields: [
        { id: 'module-end-interface', name: '末端接口', key: 'end_interface', type: 'enum', enabled: true, defaultValue: 'iso_9409', enumOptions: [option('end-iso-9409', 'ISO 9409', 'iso_9409'), option('end-custom', '自定义接口', 'custom')] },
      ],
    },
    {
      id: 'parameter-lift',
      name: '升降机构',
      key: 'lifting_mechanism',
      fields: [
        { id: 'lift-stroke', name: '有效行程', key: 'effective_stroke', type: 'integer', enabled: true, defaultValue: '500', enumOptions: [] },
      ],
    },
  ];
}

function migrateParameterGroups(stored: ParameterGroup[]): ParameterGroup[] {
  const subgroupIds = new Set([
    'parameter-arm-module-base',
    'parameter-arm-module-joint',
    'parameter-arm-module-link',
    'parameter-arm-module-end',
  ]);
  if ([...subgroupIds].every(id => stored.some(group => group.id === id))) return stored;

  const presets = initialGroups();
  const legacyParent = stored.find(group => group.id === 'parameter-arm-module');
  const migrated = stored
    .filter(group => !subgroupIds.has(group.id))
    .map(group => group.id === 'parameter-arm-module' ? { ...group, fields: [] } : group);
  for (const preset of presets.filter(group => subgroupIds.has(group.id))) {
    if (preset.id === 'parameter-arm-module-joint' && legacyParent?.fields.length) {
      migrated.push({ ...preset, fields: legacyParent.fields });
    } else {
      migrated.push(preset);
    }
  }
  return migrated;
}

export function readParameterDefinitions(): ParameterGroup[] {
  if (typeof window === 'undefined') return initialGroups();
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (Array.isArray(stored)) return migrateParameterGroups(stored);
  } catch {
    // Invalid local data falls back to presets.
  }
  return initialGroups();
}

function emptyField(groupId: string): ParameterForm {
  return {
    id: '',
    groupId,
    name: '',
    key: '',
    type: 'text',
    enabled: true,
    defaultValue: '',
    enumOptions: [],
  };
}

function ParameterStatusSwitch({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className="dictionary-switch" data-selected={checked ? 'true' : undefined} onClick={() => onChange(!checked)}><span /></button>;
}

export function ParameterDefinitionManager() {
  const [groups, setGroups] = useState<ParameterGroup[]>(readParameterDefinitions);
  const [selectedGroupId, setSelectedGroupId] = useState(() => groups.find(group => !groups.some(child => child.parentId === group.id))?.id ?? '');
  const [expandedParents, setExpandedParents] = useState<Set<string>>(() => new Set(['parameter-arm-module']));
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<ParameterForm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ groupId: string; field: ParameterDefinition } | null>(null);

  const selectableGroups = useMemo(() => groups.filter(group => !groups.some(child => child.parentId === group.id)), [groups]);
  const topLevelGroups = useMemo(() => groups.filter(group => !group.parentId), [groups]);
  const visibleGroups = useMemo(() => {
    const term = query.trim().toLowerCase();
    return selectableGroups.flatMap(group => {
      const parent = group.parentId ? groups.find(item => item.id === group.parentId) : undefined;
      const groupMatches = group.name.toLowerCase().includes(term)
        || group.key.toLowerCase().includes(term)
        || parent?.name.toLowerCase().includes(term)
        || parent?.key.toLowerCase().includes(term);
      if (!term || groupMatches) return [{ ...group, visibleFields: group.fields }];
      const visibleFields = group.fields.filter(field => field.name.toLowerCase().includes(term) || field.key.toLowerCase().includes(term));
      return visibleFields.length ? [{ ...group, visibleFields }] : [];
    });
  }, [groups, query, selectableGroups]);
  const selectedGroup = visibleGroups.find(group => group.id === selectedGroupId) ?? visibleGroups[0] ?? null;

  const duplicateKey = Boolean(form && groups.some(group => group.fields.some(field => field.key === form.key.trim() && field.id !== form.id)));
  const enumInvalid = Boolean(form?.type === 'enum' && (
    !form.enumOptions.length
    || form.enumOptions.some(item => !item.name.trim() || !item.key.trim())
    || new Set(form.enumOptions.map(item => item.key.trim())).size !== form.enumOptions.length
  ));
  const formValid = Boolean(form?.name.trim() && form?.key.trim() && form?.groupId && !duplicateKey && !enumInvalid);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    window.dispatchEvent(new CustomEvent<ParameterGroup[]>(PARAMETER_DEFINITIONS_EVENT, { detail: groups }));
  }, [groups]);

  function openEdit(groupId: string, field: ParameterDefinition) {
    setForm({ ...field, groupId, enumOptions: field.enumOptions.map(item => ({ ...item })) });
  }

  function saveField() {
    if (!formValid || !form) return;
    const normalized: ParameterDefinition = {
      id: form.id || `parameter-${Date.now()}`,
      name: form.name.trim(),
      key: form.key.trim(),
      type: form.type,
      enabled: form.enabled,
      defaultValue: form.defaultValue,
      enumOptions: form.type === 'enum' ? form.enumOptions.map(item => ({ ...item, name: item.name.trim(), key: item.key.trim() })) : [],
    };
    setGroups(current => current.map(group => {
      const withoutCurrent = group.fields.filter(field => field.id !== form.id);
      if (group.id !== form.groupId) return { ...group, fields: withoutCurrent };
      return { ...group, fields: form.id && group.fields.some(field => field.id === form.id) ? group.fields.map(field => field.id === form.id ? normalized : field) : [...withoutCurrent, normalized] };
    }));
    setSelectedGroupId(form.groupId);
    setForm(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setGroups(current => current.map(group => group.id === deleteTarget.groupId
      ? { ...group, fields: group.fields.filter(field => field.id !== deleteTarget.field.id) }
      : group));
    setDeleteTarget(null);
  }

  function updateFieldStatus(groupId: string, fieldId: string, enabled: boolean) {
    setGroups(current => current.map(group => group.id === groupId
      ? { ...group, fields: group.fields.map(field => field.id === fieldId ? { ...field, enabled } : field) }
      : group));
  }

  function addEnumOption() {
    if (!form) return;
    setForm({ ...form, enumOptions: [...form.enumOptions, { id: `enum-${Date.now()}`, name: '', key: '' }] });
  }

  function defaultValueControl(current: ParameterForm) {
    if (current.type === 'enum') {
      return <ProductSelect value={current.defaultValue} onChange={event => setForm({ ...current, defaultValue: event.target.value })}>
        <option value="">无默认值</option>
        {current.enumOptions.filter(item => item.name.trim() && item.key.trim()).map(item => <option key={item.id} value={item.key}>{item.name}</option>)}
      </ProductSelect>;
    }
    return <ProductTextInput
      type={current.type === 'integer' || current.type === 'float' ? 'number' : 'text'}
      step={current.type === 'integer' ? 1 : current.type === 'float' ? 'any' : undefined}
      value={current.defaultValue}
      onChange={event => setForm({ ...current, defaultValue: event.target.value })}
      placeholder="可不填写"
    />;
  }

  return (
    <div className="ds-page ds-page--list parameter-definition-page">
      <header className="ds-page__header ds-page-header">
        <div><h1>参数定义</h1><p>按组件类型统一维护组件参数字段及默认值。</p></div>
        <div className="ds-page-toolbar">
          <div className="parameter-definition-search"><Search size={14} /><ProductTextInput value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索分类名称或字段名称" aria-label="搜索参数分类或字段" /></div>
          <ProductButton type="primary" size="large" icon={<Plus size={15} />} onClick={() => setForm(emptyField(selectedGroup?.id ?? selectableGroups[0]?.id ?? ''))}>新增字段</ProductButton>
        </div>
      </header>

      <div className="parameter-definition-workspace">
        <aside className="parameter-definition-categories" aria-label="组件类型">
          <header><strong>组件类型</strong><span>固定 4 个大类</span></header>
          <div className="parameter-definition-category-list">
            {topLevelGroups.map(group => {
              const children = groups.filter(item => item.parentId === group.id);
              const hasChildren = children.length > 0;
              const isExpanded = query.trim() ? true : expandedParents.has(group.id);
              const totalFields = group.fields.length + children.reduce((sum, child) => sum + child.fields.length, 0);
              return <div className="parameter-definition-category-branch" key={group.id}>
                <button type="button" aria-expanded={hasChildren ? isExpanded : undefined} aria-current={!hasChildren && selectedGroup?.id === group.id ? 'page' : undefined} onClick={() => {
                  if (hasChildren) {
                    setExpandedParents(current => {
                      const next = new Set(current);
                      if (next.has(group.id)) next.delete(group.id);
                      else next.add(group.id);
                      return next;
                    });
                    const firstChild = children[0];
                    if (firstChild && !children.some(child => child.id === selectedGroup?.id)) setSelectedGroupId(firstChild.id);
                    return;
                  }
                  setSelectedGroupId(group.id);
                  if (!visibleGroups.some(item => item.id === group.id)) setQuery('');
                }}>
                  <span><strong>{group.name}</strong><code>{group.key}</code></span>
                  <small>{totalFields}</small>
                  {hasChildren && (isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />)}
                </button>
                {hasChildren && isExpanded && <div className="parameter-definition-category-children">
                  {children.map(child => <button type="button" key={child.id} aria-current={selectedGroup?.id === child.id ? 'page' : undefined} onClick={() => {
                    setSelectedGroupId(child.id);
                    if (!visibleGroups.some(item => item.id === child.id)) setQuery('');
                  }}>
                    <span><strong>{child.name}</strong><code>{child.key}</code></span>
                    <small>{child.fields.length}</small>
                  </button>)}
                </div>}
              </div>;
            })}
          </div>
        </aside>

        <section className="parameter-definition-content">
          {selectedGroup ? <>
            <header className="parameter-definition-content__header">
              <div><h2>{selectedGroup.name}</h2><code>{selectedGroup.key}</code></div>
              <ProductTag tone="neutral" size="small">{selectedGroup.fields.length} 个字段</ProductTag>
            </header>
            <div className="parameter-definition-group__content">
              <table className="data-management-table data-management-table--actions parameter-definition-table">
                <thead><tr><th>字段名称</th><th>标识符</th><th>数据类型</th><th>默认值</th><th>状态</th><th>操作</th></tr></thead>
                <tbody>{selectedGroup.visibleFields.map(field => {
                  const defaultLabel = field.type === 'enum'
                    ? field.enumOptions.find(item => item.key === field.defaultValue)?.name ?? '-'
                    : field.defaultValue || '-';
                  return <tr key={field.id}>
                    <td><strong>{field.name}</strong></td>
                    <td><code>{field.key}</code></td>
                    <td><ProductTag tone={field.type === 'enum' ? 'accent' : 'neutral'} size="small">{TYPE_LABELS[field.type]}</ProductTag></td>
                    <td><span className="parameter-definition-ellipsis" title={defaultLabel}>{defaultLabel}</span></td>
                    <td><ParameterStatusSwitch checked={field.enabled} label={`${field.name}${field.enabled ? '停用' : '启用'}`} onChange={enabled => updateFieldStatus(selectedGroup.id, field.id, enabled)} /></td>
                    <td><div className="parameter-definition-actions">
                      <ProductIconButton size="small" icon={<Pencil size={13} />} aria-label={`编辑${field.name}`} title="编辑" onClick={() => openEdit(selectedGroup.id, field)} />
                      <ProductIconButton size="small" status="danger" icon={<Trash2 size={13} />} aria-label={`删除${field.name}`} title="删除" onClick={() => setDeleteTarget({ groupId: selectedGroup.id, field })} />
                    </div></td>
                  </tr>;
                })}</tbody>
              </table>
              {!selectedGroup.visibleFields.length && <div className="ds-empty">该分类暂无参数字段</div>}
            </div>
          </> : <div className="ds-empty parameter-definition-empty">未找到匹配的分类或字段</div>}
        </section>
      </div>

      <ProductModal
        open={Boolean(form)}
        onOpenChange={open => !open && setForm(null)}
        title={form?.id ? '编辑参数字段' : '新增参数字段'}
        description="字段保存后，对应组件的参数配置表单将同步使用最新定义。"
        size="md"
        footer={<><ProductButton onClick={() => setForm(null)}>取消</ProductButton><ProductButton type="primary" disabled={!formValid} onClick={saveField}>保存</ProductButton></>}
      >
        {form && <div className="parameter-definition-form">
          <div className="parameter-definition-form__grid">
            <ProductField label="字段名称"><ProductTextInput value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></ProductField>
            <ProductField label="唯一标识符" hint={duplicateKey ? '标识符已存在' : undefined}><ProductTextInput value={form.key} onChange={event => setForm({ ...form, key: event.target.value })} /></ProductField>
          </div>
          <div className="parameter-definition-form__grid">
            <ProductField label="所属组件"><ProductSelect value={form.groupId} onChange={event => setForm({ ...form, groupId: event.target.value })}>{selectableGroups.map(group => {
              const parent = group.parentId ? groups.find(item => item.id === group.parentId) : undefined;
              return <option key={group.id} value={group.id}>{parent ? `${parent.name} / ${group.name}` : group.name}</option>;
            })}</ProductSelect></ProductField>
            <ProductField label="数据类型"><ProductSelect value={form.type} onChange={event => {
              const type = event.target.value as ParameterDataType;
              setForm({ ...form, type, defaultValue: '', enumOptions: type === 'enum' && !form.enumOptions.length ? [{ id: `enum-${Date.now()}`, name: '', key: '' }] : form.enumOptions });
            }}>{Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</ProductSelect></ProductField>
          </div>
          {form.type === 'enum' && <section className="parameter-enum-editor">
            <header><div><strong>枚举项</strong><span>组件参数表单中将以下拉选项展示</span></div><ProductButton size="small" icon={<Plus size={13} />} onClick={addEnumOption}>新增枚举项</ProductButton></header>
            <div className="parameter-enum-editor__list">
              {form.enumOptions.map(item => <div className="parameter-enum-editor__row" key={item.id}>
                <ProductTextInput value={item.name} placeholder="显示名称" aria-label="枚举项显示名称" onChange={event => setForm({ ...form, enumOptions: form.enumOptions.map(optionItem => optionItem.id === item.id ? { ...optionItem, name: event.target.value } : optionItem) })} />
                <ProductTextInput value={item.key} placeholder="标识符" aria-label="枚举项标识符" onChange={event => setForm({ ...form, defaultValue: form.defaultValue === item.key ? event.target.value : form.defaultValue, enumOptions: form.enumOptions.map(optionItem => optionItem.id === item.id ? { ...optionItem, key: event.target.value } : optionItem) })} />
                <ProductIconButton size="small" status="danger" icon={<Trash2 size={13} />} aria-label="删除枚举项" onClick={() => setForm({ ...form, defaultValue: form.defaultValue === item.key ? '' : form.defaultValue, enumOptions: form.enumOptions.filter(optionItem => optionItem.id !== item.id) })} />
              </div>)}
            </div>
            {enumInvalid && <small>请完整填写枚举项，并确保标识符不重复。</small>}
          </section>}
          <ProductField label="默认值">{defaultValueControl(form)}</ProductField>
          <ProductCheckbox label="启用字段" checked={form.enabled} onChange={event => setForm({ ...form, enabled: event.target.checked })} />
        </div>}
      </ProductModal>

      <ProductModal open={Boolean(deleteTarget)} onOpenChange={open => !open && setDeleteTarget(null)} title="确认删除字段" description="删除后，组件参数表单将不再加载该字段。" status="danger" footer={<><ProductButton onClick={() => setDeleteTarget(null)}>取消</ProductButton><ProductButton type="primary" status="danger" onClick={confirmDelete}>确认删除</ProductButton></>}>
        <p className="parameter-definition-delete-copy">确定删除“{deleteTarget?.field.name ?? ''}”吗？该操作不可撤销。</p>
      </ProductModal>
    </div>
  );
}
