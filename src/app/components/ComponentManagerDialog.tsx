import { useMemo, useState } from 'react';
import {
  BarChart2, CheckCircle2, Edit3, FileArchive, LayoutGrid, Plus, Search, Tag, Trash2, Upload, X,
} from 'lucide-react';
import { type ComponentDef } from '../shared';
import {
  ArcoButton, ArcoIconButton, ArcoModal, ArcoTag, ArcoTextArea, ArcoTextInput,
} from './ProductUI';
import { useComponentCatalog } from './useComponentCatalog';

type CatalogFilter = 'all' | 'system' | 'custom';
type DialogView = 'manage' | 'add' | 'edit';

const ALL_SCOPES = ['复合机器人', 'AGV', '巡检', '通用'];
const MAX_TAGS = 8;

function componentNameFromFile(fileName: string) {
  return fileName
    .replace(/\.(tar\.gz|zip|tar|tgz|gz|json)$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim() || '导入组件';
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function emptyComponent(): ComponentDef {
  return {
    id: '',
    name: '',
    categoryId: 'monitor',
    colSpan: 4,
    rowSpan: 3,
    description: '',
    scopes: ['通用'],
    tags: [],
    isCustom: true,
  };
}

export function ComponentManagerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { components, saveComponent, deleteComponent } = useComponentCatalog();
  const [view, setView] = useState<DialogView>('manage');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CatalogFilter>('all');
  const [form, setForm] = useState<ComponentDef>(emptyComponent);
  const [tagInput, setTagInput] = useState('');
  const [packageFile, setPackageFile] = useState<File | null>(null);

  const filteredComponents = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return components.filter(component => {
      if (filter === 'system' && component.isCustom) return false;
      if (filter === 'custom' && !component.isCustom) return false;
      if (!keyword) return true;
      return [
        component.name,
        component.description,
        ...component.tags,
        ...component.scopes,
      ].join(' ').toLowerCase().includes(keyword);
    });
  }, [components, filter, query]);

  function closeDialog() {
    setView('manage');
    onOpenChange(false);
  }

  function beginAdd() {
    setForm(emptyComponent());
    setTagInput('');
    setPackageFile(null);
    setView('add');
  }

  function beginEdit(component: ComponentDef) {
    setForm({ ...component, tags: [...component.tags], scopes: [...component.scopes] });
    setTagInput('');
    setView('edit');
  }

  function submitForm() {
    if (view === 'add' && !packageFile) return;
    const component = view === 'add'
      ? {
          ...form,
          id: `custom-${Date.now()}`,
          name: componentNameFromFile(packageFile!.name),
          description: form.description.trim() || `由组件包 ${packageFile!.name} 导入`,
          packageName: packageFile!.name,
          packageSize: formatFileSize(packageFile!.size),
          importedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
          isCustom: true,
        }
      : form;
    saveComponent(component);
    setView('manage');
  }

  function addTags(value: string) {
    const nextTags = value
      .split(/[,，]/)
      .map(tag => tag.trim())
      .filter(Boolean);

    if (nextTags.length === 0) return;
    setForm(previous => {
      const tags = [...previous.tags];
      for (const tag of nextTags) {
        if (tags.length >= MAX_TAGS) break;
        if (!tags.includes(tag)) tags.push(tag);
      }
      return { ...previous, tags };
    });
    setTagInput('');
  }

  function addTag() {
    addTags(tagInput);
  }

  function addSuggestedTag(tag: string) {
    setForm(previous => {
      if (previous.tags.includes(tag) || previous.tags.length >= MAX_TAGS) return previous;
      return { ...previous, tags: [...previous.tags, tag] };
    });
  }

  function removeTag(tag: string) {
    setForm(previous => ({ ...previous, tags: previous.tags.filter(item => item !== tag) }));
  }

  function toggleScope(scope: string) {
    if (!form.isCustom && view === 'edit') return;
    setForm(previous => ({
      ...previous,
      scopes: previous.scopes.includes(scope)
        ? previous.scopes.filter(item => item !== scope)
        : [...previous.scopes, scope],
    }));
  }

  const isForm = view !== 'manage';
  const systemCount = components.filter(component => !component.isCustom).length;
  const customCount = components.length - systemCount;
  const suggestedTags = useMemo(() => {
    const allTags = new Set<string>();
    for (const component of components) for (const tag of component.tags) allTags.add(tag);
    return [...allTags].filter(tag => !form.tags.includes(tag)).slice(0, 6);
  }, [components, form.tags]);

  function renderTagEditor(placeholder: string, ariaLabel: string) {
    const atLimit = form.tags.length >= MAX_TAGS;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div style={{ color: 'var(--app-text)', fontSize: 12, fontWeight: 600 }}>标签</div>
          <span style={{ color: 'var(--app-muted)', fontSize: 12 }}>{form.tags.length}/{MAX_TAGS}</span>
        </div>
        {form.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {form.tags.map(tag => (
              <ArcoTag key={tag} tone="accent" style={{ gap: 4, minHeight: 32, padding: '0 8px 0 10px', fontWeight: 600 }}>
                <Tag size={11} />{tag}
                <button
                  onClick={() => removeTag(tag)}
                  aria-label={`移除标签${tag}`}
                  title={`移除标签${tag}`}
                  style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, padding: 0, border: 0, borderRadius: 8, background: 'transparent', color: 'inherit', cursor: 'pointer' }}
                >
                  <X size={11} />
                </button>
              </ArcoTag>
            ))}
          </div>
        )}
        {suggestedTags.length > 0 && !atLimit && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {suggestedTags.map(tag => (
              <button
                key={tag}
                onClick={() => addSuggestedTag(tag)}
                style={{ height: 32, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 10px', borderRadius: 8, border: '1px solid var(--app-border)', background: 'var(--app-soft)', color: 'var(--app-text)', fontSize: 12, cursor: 'pointer' }}
              >
                <Plus size={10} />{tag}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <ArcoTextInput
            value={tagInput}
            onChange={event => setTagInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addTag();
              }
            }}
            placeholder={atLimit ? '最多添加 8 个标签' : placeholder}
            aria-label={ariaLabel}
            disabled={atLimit}
            style={{ flex: 1, height: 40 }}
          />
          <ArcoIconButton
            type="secondary"
            icon={<Plus size={15} />}
            aria-label="添加标签"
            tooltip="添加标签"
            onClick={addTag}
            disabled={atLimit || !tagInput.trim()}
            style={{ width: 40, height: 40 }}
          />
        </div>
      </div>
    );
  }

  return (
    <ArcoModal
      open={open}
      onOpenChange={next => {
        if (!next) setView('manage');
        onOpenChange(next);
      }}
      title={isForm ? (view === 'add' ? '导入组件' : `编辑组件 · ${form.name}`) : '组件管理'}
      size={isForm ? 'lg' : 'xl'}
      footer={isForm ? (
        <>
          <ArcoButton onClick={() => setView('manage')}>取消</ArcoButton>
          <ArcoButton type="primary" onClick={submitForm} disabled={view === 'add' && !packageFile}>
            {view === 'add' ? '开始导入' : form.isCustom ? '保存修改' : '保存标签'}
          </ArcoButton>
        </>
      ) : (
        <>
          <ArcoButton onClick={closeDialog}>关闭</ArcoButton>
          <ArcoButton type="primary" icon={<Upload size={14} />} onClick={beginAdd}>导入组件</ArcoButton>
        </>
      )}
    >
      <style>{`
        .component-manager-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .component-manager-row {
          display: grid;
          grid-template-columns: minmax(180px, 1.5fr) minmax(170px, 1.2fr) minmax(140px, 1fr) 80px;
          gap: 12px;
        }
        .component-manager-form-top {
          display: grid;
          grid-template-columns: 1fr 180px;
          gap: 14px;
        }
        .component-manager-form-mid {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 18px;
        }
        @media (max-width: 720px) {
          .component-manager-toolbar {
            align-items: stretch;
            flex-direction: column;
          }
          .component-manager-row {
            grid-template-columns: minmax(0, 1fr) auto auto;
            gap: 8px 12px;
          }
          .component-manager-row--header {
            display: none;
          }
          .component-manager-row > :nth-child(1) {
            grid-column: 1 / 3;
          }
          .component-manager-row > :nth-child(4) {
            grid-column: 3;
            grid-row: 1;
          }
          .component-manager-row > :nth-child(2),
          .component-manager-row > :nth-child(3) {
            grid-row: 2;
          }
          .component-manager-form-top,
          .component-manager-form-mid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      {view === 'manage' ? (
        <>
          <div className="component-manager-toolbar" style={{
            padding: '14px 0',
            borderBottom: '1px solid var(--app-border)',
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <Search size={15} color="var(--app-muted)" style={{ position: 'absolute', left: 12, top: 9, pointerEvents: 'none' }} />
              <ArcoTextInput
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="搜索组件名称、标签或适用范围"
                aria-label="搜索组件"
                style={{ width: '100%', paddingLeft: 36 }}
              />
            </div>
            <div style={{
              display: 'flex',
              padding: 3,
              borderRadius: 8,
              background: 'var(--app-soft)',
              border: '1px solid var(--app-border)',
            }}>
              {([
                ['all', `全部 ${components.length}`],
                ['system', `系统 ${systemCount}`],
                ['custom', `自定义 ${customCount}`],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                  style={{
                    height: 26,
                    padding: '0 10px',
                    border: 'none',
                    borderRadius: 6,
                    background: filter === key ? 'var(--app-surface)' : 'transparent',
                    color: filter === key ? 'var(--app-accent)' : 'var(--app-muted)',
                    boxShadow: filter === key ? '0 1px 3px var(--app-shadow-color)' : 'none',
                    fontSize: 12,
                    fontWeight: filter === key ? 600 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ maxHeight: 470, overflow: 'auto', paddingTop: 8 }}>
            <div className="component-manager-row component-manager-row--header" style={{
              padding: '8px 12px',
              color: 'var(--app-muted)',
              fontSize: 12,
              fontWeight: 600,
            }}>
              <span>组件</span><span>组件包</span><span>适用范围</span><span style={{ textAlign: 'right' }}>操作</span>
            </div>
            {filteredComponents.map(component => {
              return (
                <div
                  key={component.id}
                  className="component-manager-row"
                  style={{
                    alignItems: 'center',
                    minHeight: 62,
                    padding: '9px 12px',
                    borderTop: '1px solid var(--app-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'var(--app-soft)',
                      color: 'var(--app-text)',
                      border: '1px solid var(--app-border)',
                      flexShrink: 0,
                    }}>
                      <BarChart2 size={15} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: 'var(--app-heading)', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {component.name}
                      </div>
                      <div style={{ marginTop: 3, color: 'var(--app-muted)', fontSize: 12 }}>
                        {component.isCustom ? '自定义组件' : '系统组件'}
                      </div>
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: 'var(--app-text)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {component.packageName ?? '系统内置'}
                    </div>
                    <div style={{ marginTop: 3, color: 'var(--app-muted)', fontSize: 10 }}>
                      {component.packageSize ?? (component.isCustom ? '已导入' : '随系统发布')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {component.scopes.slice(0, 2).map(scope => (
                      <ArcoTag key={scope} size="small">{scope}</ArcoTag>
                    ))}
                    {component.scopes.length > 2 && <span style={{ color: 'var(--app-muted)', fontSize: 10 }}>+{component.scopes.length - 2}</span>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                    <ArcoIconButton size="small" icon={<Edit3 size={13} />} aria-label={`编辑${component.name}`} tooltip="编辑" onClick={() => beginEdit(component)} />
                    {component.isCustom && (
                      <ArcoIconButton
                        size="small"
                        status="danger"
                        icon={<Trash2 size={13} />}
                        aria-label={`删除${component.name}`}
                        tooltip="删除"
                        onClick={() => deleteComponent(component.id)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            {filteredComponents.length === 0 && (
              <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--app-muted)', fontSize: 14 }}>
                没有符合条件的组件
              </div>
            )}
          </div>
        </>
      ) : view === 'add' ? (
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <div style={{ color: 'var(--app-heading)', fontSize: 14, fontWeight: 600, marginBottom: 9 }}>上传组件包</div>
            <label style={{
              minHeight: 190,
              padding: 24,
              borderRadius: 16,
              border: `1px dashed ${packageFile ? 'var(--app-accent)' : 'var(--app-border-strong)'}`,
              background: packageFile ? 'var(--app-accent-soft)' : 'var(--app-soft)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
            }}>
              <input
                type="file"
                accept=".zip,.tar,.gz,.tgz,.json"
                onChange={event => setPackageFile(event.target.files?.[0] ?? null)}
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
              />
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                display: 'grid',
                placeItems: 'center',
                background: packageFile ? 'var(--app-surface)' : 'var(--app-accent-soft)',
                color: 'var(--app-accent)',
                border: '1px solid var(--app-accent-border)',
              }}>
                {packageFile ? <CheckCircle2 size={20} /> : <Upload size={20} />}
              </div>
              <div style={{ marginTop: 14, color: 'var(--app-heading)', fontSize: 14, fontWeight: 600 }}>
                {packageFile ? packageFile.name : '选择组件包文件'}
              </div>
              <div style={{ marginTop: 6, color: 'var(--app-muted)', fontSize: 12 }}>
                {packageFile ? formatFileSize(packageFile.size) : '支持 ZIP、TAR、GZ、TGZ 或 JSON 格式'}
              </div>
            </label>
          </div>
          {packageFile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 13,
              borderRadius: 8,
              border: '1px solid var(--app-border)',
              background: 'var(--app-surface)',
            }}>
              <FileArchive size={18} color="var(--app-accent)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--app-heading)', fontSize: 12, fontWeight: 600 }}>{componentNameFromFile(packageFile.name)}</div>
                <div style={{ marginTop: 3, color: 'var(--app-muted)', fontSize: 12 }}>导入后将在组件库和自定义首页中同步可用</div>
              </div>
              <ArcoIconButton type="text" size="small" icon={<X size={13} />} aria-label="移除组件包" tooltip="移除组件包" onClick={() => setPackageFile(null)} />
            </div>
          )}
          {renderTagEditor('输入标签，例如：实时、告警', '导入组件标签')}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          {form.isCustom && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 13,
              borderRadius: 8,
              border: '1px solid var(--app-border)',
              background: 'var(--app-soft)',
            }}>
              <FileArchive size={18} color="var(--app-accent)" />
              <div>
                <div style={{ color: 'var(--app-heading)', fontSize: 12, fontWeight: 600 }}>{form.packageName ?? form.name}</div>
                <div style={{ marginTop: 3, color: 'var(--app-muted)', fontSize: 12 }}>{form.packageSize ?? '组件包'} · {form.importedAt ?? '已导入'}</div>
              </div>
            </div>
          )}
          <div>
              <div style={{ color: 'var(--app-text)', fontSize: 12, fontWeight: 600, marginBottom: 7 }}>适用范围</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {ALL_SCOPES.map(scope => {
                  const active = form.scopes.includes(scope);
                  return (
                    <button
                      key={scope}
                      onClick={() => toggleScope(scope)}
                      disabled={view === 'edit' && !form.isCustom}
                      aria-pressed={active}
                      style={{
                        height: 32,
                        padding: '0 11px',
                        borderRadius: 8,
                        border: `1px solid ${active ? 'var(--app-accent-border)' : 'var(--app-border)'}`,
                        background: active ? 'var(--app-accent-soft)' : 'var(--app-surface)',
                        color: active ? 'var(--app-accent)' : 'var(--app-text)',
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      {scope}
                    </button>
                  );
                })}
              </div>
          </div>

          {renderTagEditor('输入标签名称', '标签名称')}
        </div>
      )}
    </ArcoModal>
  );
}
