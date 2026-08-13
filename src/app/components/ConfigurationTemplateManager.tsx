import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RotateCcw, Search, Settings2, Trash2 } from 'lucide-react';
import type { DictionaryCategory, DictionaryValue } from '../dictionaryData';
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

export type SlotKind = 'base' | 'joint' | 'link';
export type SlotPolicies = Record<SlotKind, string[]>;

export interface ConfigurationSlot {
  id: string;
  kind: SlotKind;
  name: string;
  allowedSpecIds: string[];
}

export interface ConfigurationTemplate {
  id: string;
  name: string;
  key: string;
  dof: number;
  enabled: boolean;
  description: string;
  slots: ConfigurationSlot[];
}

const STORAGE_KEY = 'digital-machine-configuration-templates';
const SLOT_RULES_STORAGE_KEY = 'digital-machine-global-slot-rules';

const SLOT_META: Record<SlotKind, { label: string; typeKey: string }> = {
  base: { label: '底座', typeKey: 'chassis' },
  joint: { label: '关节', typeKey: 'robot_arm' },
  link: { label: '连杆', typeKey: 'robot_arm' },
};

function TemplateStatusSwitch({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className="dictionary-switch" data-selected={checked ? 'true' : undefined} onClick={() => onChange(!checked)}><span /></button>;
}

function getComponentDictionary(categories: DictionaryCategory[]) {
  return categories.find(category => category.key === 'component_library' && category.enabled);
}

function getEnabledSpecifications(categories: DictionaryCategory[]): DictionaryValue[] {
  return getComponentDictionary(categories)
    ?.fields.find(field => field.key === 'component_specification' && field.enabled)
    ?.values.filter(value => value.enabled) ?? [];
}

function getDefaultSpecIds(categories: DictionaryCategory[], kind: SlotKind): string[] {
  const category = getComponentDictionary(categories);
  if (!category) return [];
  const typeField = category.fields.find(field => field.key === 'component_type');
  const subtypeField = category.fields.find(field => field.key === 'component_subtype');
  const specField = category.fields.find(field => field.key === 'component_specification');
  if (!typeField || !subtypeField || !specField) return [];

  const typeValue = typeField.values.find(value => value.key === SLOT_META[kind].typeKey && value.enabled);
  const subtypeIds = new Set(category.cascadeRules
    .filter(rule => rule.enabled && rule.parentFieldId === typeField.id && rule.parentValueId === typeValue?.id && rule.childFieldId === subtypeField.id)
    .flatMap(rule => rule.allowedChildValueIds));
  const specIds = new Set(category.cascadeRules
    .filter(rule => rule.enabled && rule.parentFieldId === subtypeField.id && subtypeIds.has(rule.parentValueId) && rule.childFieldId === specField.id)
    .flatMap(rule => rule.allowedChildValueIds));
  const enabledSpecIds = specField.values.filter(value => value.enabled).map(value => value.id);
  const matched = enabledSpecIds.filter(id => specIds.has(id));
  return matched.length ? matched : enabledSpecIds;
}

function getDefaultSlotPolicies(categories: DictionaryCategory[]): SlotPolicies {
  return {
    base: getDefaultSpecIds(categories, 'base'),
    joint: getDefaultSpecIds(categories, 'joint'),
    link: getDefaultSpecIds(categories, 'link'),
  };
}

function normalizeSlotPolicies(value: unknown, categories: DictionaryCategory[], legacySlots: ConfigurationSlot[] = []): SlotPolicies {
  const stored = value && typeof value === 'object' ? value as Partial<SlotPolicies> : {};
  return {
    base: Array.isArray(stored.base) ? stored.base : (legacySlots.find(slot => slot.kind === 'base')?.allowedSpecIds ?? getDefaultSpecIds(categories, 'base')),
    joint: Array.isArray(stored.joint) ? stored.joint : (legacySlots.find(slot => slot.kind === 'joint')?.allowedSpecIds ?? getDefaultSpecIds(categories, 'joint')),
    link: Array.isArray(stored.link) ? stored.link : (legacySlots.find(slot => slot.kind === 'link')?.allowedSpecIds ?? getDefaultSpecIds(categories, 'link')),
  };
}

function generateSlots(dof: number, existing: ConfigurationSlot[] = []): ConfigurationSlot[] {
  const definitions: Array<Omit<ConfigurationSlot, 'allowedSpecIds'>> = [
    { id: 'base', kind: 'base', name: '底座' },
  ];
  for (let index = 1; index <= dof; index += 1) {
    definitions.push({ id: `joint-${index}`, kind: 'joint', name: `关节 ${index}` });
    definitions.push({ id: `link-${index}`, kind: 'link', name: `连杆 ${index}` });
  }
  return definitions.map(slot => ({
    ...slot,
    allowedSpecIds: existing.find(item => item.id === slot.id)?.allowedSpecIds ?? [],
  }));
}

function initialTemplates(): ConfigurationTemplate[] {
  const presets = [
    { id: 'config-cobot-6', name: '六轴协作机械臂', key: 'cobot_arm_6', dof: 6, description: '适用于协作装配与柔性搬运场景。' },
    { id: 'config-palletizer-4', name: '四轴码垛机械臂', key: 'palletizer_arm_4', dof: 4, description: '适用于箱体搬运与码垛作业。' },
    { id: 'config-flexible-7', name: '七轴柔性机械臂', key: 'flexible_arm_7', dof: 7, description: '适用于复杂姿态和狭窄空间作业。' },
  ];
  return presets.map(item => ({
    ...item,
    enabled: true,
    slots: generateSlots(item.dof),
  }));
}

export function readConfigurationTemplates(): ConfigurationTemplate[] {
  if (typeof window === 'undefined') return initialTemplates();
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (Array.isArray(stored)) {
      return stored.map(item => {
        const dof = Math.min(12, Math.max(2, Number(item.dof) || 6));
        const legacySlots = Array.isArray(item.slots) ? item.slots : [];
        return {
          id: String(item.id),
          name: String(item.name),
          key: String(item.key),
          enabled: item.enabled !== false,
          description: String(item.description ?? ''),
          dof,
          slots: generateSlots(dof, legacySlots),
        };
      });
    }
  } catch {
    // Invalid local data falls back to the product presets.
  }
  return initialTemplates();
}

export function readGlobalSlotPolicies(categories: DictionaryCategory[]): SlotPolicies {
  if (typeof window === 'undefined') return getDefaultSlotPolicies(categories);
  try {
    const storedRules = JSON.parse(window.localStorage.getItem(SLOT_RULES_STORAGE_KEY) ?? 'null');
    if (storedRules) return normalizeSlotPolicies(storedRules, categories);

    const storedTemplates = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    const legacyTemplate = Array.isArray(storedTemplates) ? storedTemplates[0] : null;
    if (legacyTemplate?.slotPolicies) {
      return normalizeSlotPolicies(legacyTemplate.slotPolicies, categories, Array.isArray(legacyTemplate.slots) ? legacyTemplate.slots : []);
    }
  } catch {
    // Invalid local data falls back to dictionary-derived defaults.
  }
  return getDefaultSlotPolicies(categories);
}

function emptyTemplate(): ConfigurationTemplate {
  return {
    id: '',
    name: '',
    key: '',
    dof: 6,
    enabled: true,
    description: '',
    slots: generateSlots(6),
  };
}

export function ConfigurationTemplateManager({ categories }: { categories: DictionaryCategory[] }) {
  const [templates, setTemplates] = useState<ConfigurationTemplate[]>(readConfigurationTemplates);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<ConfigurationTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConfigurationTemplate | null>(null);
  const [slotRulesOpen, setSlotRulesOpen] = useState(false);
  const [configuringId, setConfiguringId] = useState<string | null>(null);
  const [slotPolicies, setSlotPolicies] = useState<SlotPolicies>(() => readGlobalSlotPolicies(categories));
  const [policyDraft, setPolicyDraft] = useState<SlotPolicies>(() => readGlobalSlotPolicies(categories));
  const [slotDraft, setSlotDraft] = useState<ConfigurationSlot[]>([]);

  const specifications = useMemo(() => getEnabledSpecifications(categories), [categories]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return templates.filter(item => !term || item.name.toLowerCase().includes(term) || item.key.toLowerCase().includes(term));
  }, [query, templates]);
  const configuring = templates.find(item => item.id === configuringId) ?? null;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    window.localStorage.setItem(SLOT_RULES_STORAGE_KEY, JSON.stringify(slotPolicies));
  }, [slotPolicies]);

  function openEdit(item: ConfigurationTemplate) {
    setForm({
      ...item,
      slots: item.slots.map(slot => ({ ...slot, allowedSpecIds: [...slot.allowedSpecIds] })),
    });
  }

  function saveTemplate() {
    if (!form || !form.name.trim() || !form.key.trim()) return;
    const dof = Math.min(12, Math.max(2, Number(form.dof) || 2));
    const normalized = {
      ...form,
      id: form.id || `config-${Date.now()}`,
      name: form.name.trim(),
      key: form.key.trim(),
      dof,
      slots: generateSlots(dof, form.slots),
    };
    setTemplates(current => form.id
      ? current.map(item => item.id === form.id ? normalized : item)
      : [...current, normalized]);
    setForm(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setTemplates(current => current.filter(item => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  function openConfiguration(item: ConfigurationTemplate) {
    setConfiguringId(item.id);
    setSlotDraft(generateSlots(item.dof, item.slots).map(slot => ({ ...slot, allowedSpecIds: [...slot.allowedSpecIds] })));
  }

  function openSlotRules() {
    setPolicyDraft({
      base: [...slotPolicies.base],
      joint: [...slotPolicies.joint],
      link: [...slotPolicies.link],
    });
    setSlotRulesOpen(true);
  }

  function updateSlot(slotId: string, allowedSpecIds: string[]) {
    setSlotDraft(current => current.map(slot => slot.id === slotId ? { ...slot, allowedSpecIds } : slot));
  }

  function updatePolicy(kind: SlotKind, allowedSpecIds: string[]) {
    setPolicyDraft(current => ({ ...current, [kind]: allowedSpecIds }));
  }

  function saveSlotRules() {
    const validSpecIds = new Set(specifications.map(item => item.id));
    const nextPolicies: SlotPolicies = {
      base: policyDraft.base.filter(id => validSpecIds.has(id)),
      joint: policyDraft.joint.filter(id => validSpecIds.has(id)),
      link: policyDraft.link.filter(id => validSpecIds.has(id)),
    };
    setSlotPolicies(nextPolicies);
    setTemplates(current => current.map(template => ({
      ...template,
      slots: template.slots.map(slot => {
        if (!slot.allowedSpecIds.length || !nextPolicies[slot.kind].length) return slot;
        const allowed = new Set(nextPolicies[slot.kind]);
        return { ...slot, allowedSpecIds: slot.allowedSpecIds.filter(id => allowed.has(id)) };
      }),
    })));
    setSlotRulesOpen(false);
  }

  function saveConfiguration() {
    if (!configuring) return;
    setTemplates(current => current.map(item => item.id === configuring.id
      ? {
          ...item,
          slots: slotDraft.map(slot => ({ ...slot, allowedSpecIds: [...slot.allowedSpecIds] })),
        }
      : item));
    setConfiguringId(null);
  }

  return (
    <div className="ds-page ds-page--list configuration-template-page">
      <header className="ds-page__header ds-page-header">
        <div>
          <h1>构型模板</h1>
          <p>维护机械臂构型、运动链槽位及模块装配规格范围。</p>
        </div>
        <div className="ds-page-toolbar">
          <div className="configuration-template-search">
            <Search size={14} />
            <ProductTextInput value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索构型名称或标识符" aria-label="搜索构型模板" />
          </div>
          <ProductButton type="outline" size="large" icon={<Settings2 size={15} />} style={{ background: 'var(--app-surface)' }} onClick={openSlotRules}>槽位规则</ProductButton>
          <ProductButton type="primary" size="large" icon={<Plus size={15} />} onClick={() => setForm(emptyTemplate())}>新增构型</ProductButton>
        </div>
      </header>

      <section className="ds-table-surface">
        <div className="ds-table-scroll">
          <table className="data-management-table data-management-table--actions configuration-template-table">
            <thead><tr><th>构型名称</th><th>标识符</th><th>自由度</th><th>运动链槽位</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td><button type="button" className="configuration-template-name" onClick={() => openConfiguration(item)}><strong>{item.name}</strong></button></td>
                  <td><code>{item.key}</code></td>
                  <td>{item.dof} 轴</td>
                  <td>{item.slots.length} 个</td>
                  <td><div className="configuration-template-status"><ProductTag tone={item.enabled ? 'success' : 'neutral'} size="small">{item.enabled ? '已启用' : '已停用'}</ProductTag><TemplateStatusSwitch checked={item.enabled} label={`${item.name}${item.enabled ? '停用' : '启用'}`} onChange={enabled => setTemplates(current => current.map(template => template.id === item.id ? { ...template, enabled } : template))} /></div></td>
                  <td><div className="configuration-template-actions">
                    <ProductButton size="small" icon={<Settings2 size={13} />} onClick={() => openConfiguration(item)}>装配模板</ProductButton>
                    <ProductIconButton size="small" icon={<Pencil size={13} />} aria-label={`编辑${item.name}`} title="编辑" onClick={() => openEdit(item)} />
                    <ProductIconButton size="small" status="danger" icon={<Trash2 size={13} />} aria-label={`删除${item.name}`} title="删除" onClick={() => setDeleteTarget(item)} />
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="ds-empty">{query.trim() ? '未找到匹配的构型模板' : '暂无构型模板，点击“新增构型”开始添加'}</div>}
        </div>
      </section>

      <ProductModal
        open={Boolean(form)}
        onOpenChange={open => !open && setForm(null)}
        title={form?.id ? '编辑构型' : '新增构型'}
        description="自由度调整后，系统会自动生成或收起对应的运动链槽位。"
        size="md"
        footer={<><ProductButton onClick={() => setForm(null)}>取消</ProductButton><ProductButton type="primary" disabled={!form?.name.trim() || !form?.key.trim() || templates.some(item => item.key === form?.key.trim() && item.id !== form?.id)} onClick={saveTemplate}>保存</ProductButton></>}
      >
        {form && <div className="configuration-template-form">
          <ProductField label="构型名称"><ProductTextInput value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></ProductField>
          <ProductField label="唯一标识符" hint={templates.some(item => item.key === form.key.trim() && item.id !== form.id) ? '标识符已存在' : '保存后用于业务接口识别该构型'}><ProductTextInput value={form.key} onChange={event => setForm({ ...form, key: event.target.value })} /></ProductField>
          <div className="configuration-template-form__grid">
            <ProductField label="自由度（2～12 轴）"><ProductSelect value={String(form.dof)} onChange={event => {
              const dof = Number(event.target.value);
              setForm({ ...form, dof, slots: generateSlots(dof, form.slots) });
            }}>{Array.from({ length: 11 }, (_, index) => index + 2).map(dof => <option key={dof} value={dof}>{dof} 轴</option>)}</ProductSelect></ProductField>
            <ProductCheckbox label="启用构型" checked={form.enabled} onChange={event => setForm({ ...form, enabled: event.target.checked })} />
          </div>
          <ProductField label="描述"><ProductTextArea rows={3} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></ProductField>
        </div>}
      </ProductModal>

      <ProductDrawer
        open={slotRulesOpen}
        onOpenChange={setSlotRulesOpen}
        title="槽位规则"
        width="min(680px, calc(100vw - 48px))"
        footer={<div className="configuration-drawer-footer"><ProductButton icon={<RotateCcw size={14} />} onClick={() => setPolicyDraft(getDefaultSlotPolicies(categories))}>恢复默认</ProductButton><span /><ProductButton onClick={() => setSlotRulesOpen(false)}>取消</ProductButton><ProductButton type="primary" onClick={saveSlotRules}>保存规则</ProductButton></div>}
      >
        <div className="configuration-slot-editor">
          <div className="configuration-slot-editor__notice">
            <strong>类型级槽位规则</strong>
            <span>规则来源于字段字典中的模块归属。选择“全部规格”表示该模块类型不限制规格，保存后所有构型装配模板都会使用该规则。</span>
          </div>
          <div className="configuration-policy-grid">
            {(['base', 'joint', 'link'] as SlotKind[]).map(kind => {
              const defaultSpecIds = getDefaultSpecIds(categories, kind);
              const availableSpecs = defaultSpecIds.length ? specifications.filter(spec => defaultSpecIds.includes(spec.id)) : specifications;
              const allowAll = policyDraft[kind].length === 0;
              const allSelected = allowAll || (availableSpecs.length > 0 && availableSpecs.every(spec => policyDraft[kind].includes(spec.id)));
              return <section className="configuration-slot-group configuration-policy-card" key={kind}>
                <header>
                  <div><ProductTag tone="neutral" size="small">{kind}</ProductTag><h2>{SLOT_META[kind].label}</h2></div>
                  <ProductCheckbox label="全选" checked={allSelected} onChange={event => updatePolicy(kind, event.target.checked ? [] : availableSpecs.map(spec => spec.id))} />
                </header>
                <div className="configuration-policy-card__body">
                  <div className="configuration-slot-options">
                    {availableSpecs.map(spec => <ProductCheckbox
                      key={spec.id}
                      label={<span className="configuration-spec-option">{spec.name}<code>{spec.key}</code></span>}
                      checked={allowAll || policyDraft[kind].includes(spec.id)}
                      onChange={event => {
                        const current = allowAll ? availableSpecs.map(item => item.id) : policyDraft[kind];
                        updatePolicy(kind, event.target.checked ? [...new Set([...current, spec.id])] : current.filter(id => id !== spec.id));
                      }}
                    />)}
                  </div>
                </div>
              </section>;
            })}
          </div>
          {!specifications.length && <div className="ds-empty">字段字典中暂无已启用的“规格”取值，请先完成字段字典配置。</div>}
        </div>
      </ProductDrawer>

      <ProductDrawer
        open={Boolean(configuring)}
        onOpenChange={open => !open && setConfiguringId(null)}
        title={configuring ? `${configuring.name} · 装配模板` : '装配模板'}
        width="min(760px, calc(100vw - 48px))"
        footer={<div className="configuration-drawer-footer"><ProductButton icon={<RotateCcw size={14} />} onClick={() => configuring && setSlotDraft(generateSlots(configuring.dof))}>恢复默认</ProductButton><span /><ProductButton onClick={() => setConfiguringId(null)}>取消</ProductButton><ProductButton type="primary" onClick={saveConfiguration}>保存模板</ProductButton></div>}
      >
        {configuring && <div className="configuration-slot-editor">
          <div className="configuration-slot-editor__notice">
            <strong>具体槽位装配模板</strong>
            <span>每个槽位只能选择顶部“槽位规则”允许的规格；不单独选择时继承对应类型的全局规则。</span>
          </div>
          <div className="configuration-assembly-list">
            {slotDraft.map(slot => {
              const inherited = slot.allowedSpecIds.length === 0;
              const availableSpecs = slotPolicies[slot.kind].length
                ? specifications.filter(spec => slotPolicies[slot.kind].includes(spec.id))
                : specifications;
              const code = slot.kind === 'base' ? '底座' : `${slot.kind === 'joint' ? 'J' : 'L'}${slot.id.split('-')[1]}`;
              return <article className="configuration-assembly-slot" key={slot.id}>
                <div className="configuration-assembly-slot__identity">
                  <span>{code}</span>
                  <strong>{SLOT_META[slot.kind].label}</strong>
                </div>
                <div className="configuration-assembly-slot__content">
                  <div className="configuration-slot-options">
                    {availableSpecs.map(spec => <ProductCheckbox
                      key={spec.id}
                      label={<span className="configuration-spec-option">{spec.name}<code>{spec.key}</code></span>}
                      checked={inherited || slot.allowedSpecIds.includes(spec.id)}
                      onChange={event => {
                        const current = inherited ? availableSpecs.map(item => item.id) : slot.allowedSpecIds;
                        updateSlot(slot.id, event.target.checked ? [...new Set([...current, spec.id])] : current.filter(id => id !== spec.id));
                      }}
                    />)}
                  </div>
                </div>
              </article>;
            })}
          </div>
          {!specifications.length && <div className="ds-empty">字段字典中暂无已启用的“规格”取值，请先完成字段字典配置。</div>}
        </div>}
      </ProductDrawer>

      <ProductModal open={Boolean(deleteTarget)} onOpenChange={open => !open && setDeleteTarget(null)} title="删除构型" description="确认要删除该构型吗？删除后无法恢复。" status="danger" footer={<><ProductButton onClick={() => setDeleteTarget(null)}>取消</ProductButton><ProductButton type="primary" status="danger" onClick={confirmDelete}>删除</ProductButton></>}>
        <p className="configuration-template-delete-copy">确定删除“{deleteTarget?.name ?? ''}”吗？对应的槽位装配规则也会一并删除。</p>
      </ProductModal>
    </div>
  );
}
