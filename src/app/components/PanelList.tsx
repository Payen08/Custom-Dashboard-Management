import { useState } from 'react';
import { Plus, MoreHorizontal, LayoutGrid, Pencil, Copy, Trash2, Download, Search } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CATEGORIES, COMPONENT_DEFS, type HomepageScheme } from '../shared';
import { ArcoButton, ArcoModal, ArcoTextInput } from './ArcoLike';

interface PanelListProps {
  schemes: HomepageScheme[];
  activeSchemeId: string;
  onSelectScheme: (id: string) => void;
  onSchemesChange: (schemes: HomepageScheme[]) => void;
  onCreateScheme: () => void;
  onCopyScheme: (id: string) => void;
  onRequestDeleteScheme: (id: string) => void;
  onExportScheme: (id: string) => void;
}

export function PanelList({
  schemes,
  activeSchemeId,
  onSelectScheme,
  onSchemesChange,
  onCreateScheme,
  onCopyScheme,
  onRequestDeleteScheme,
  onExportScheme,
}: PanelListProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [schemeQuery, setSchemeQuery] = useState('');

  const canDelete = schemes.length > 1;
  const filteredSchemes = schemes.filter(scheme => {
    const query = schemeQuery.trim().toLowerCase();
    if (!query) return true;
    return `${scheme.name} ${scheme.version} ${scheme.lastEdited}`.toLowerCase().includes(query);
  });

  function schemeTag(scheme: HomepageScheme) {
    if (scheme.name.includes('AGV')) return 'AGV搬运机器人';
    if (scheme.name.includes('巡检')) return '巡检机器人';
    return 'MCR复合机器人';
  }

  function openRename(id: string) {
    const s = schemes.find(x => x.id === id);
    if (!s) return;
    setRenameValue(s.name);
    setRenamingId(id);
  }

  function confirmRename() {
    if (!renamingId || !renameValue.trim()) return;
    onSchemesChange(schemes.map(s =>
      s.id === renamingId ? { ...s, name: renameValue.trim(), lastEdited: '刚刚' } : s
    ));
    setRenamingId(null);
  }

  function handleCopy(id: string) {
    onCopyScheme(id);
  }

  function openDelete(id: string) {
    if (!canDelete) return;
    onRequestDeleteScheme(id);
  }

  function handleAdd() {
    onCreateScheme();
  }

  return (
    <div
      className="shrink-0 flex flex-col"
      style={{
        width: 344,
        height: '100%',
        margin: 0,
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        borderRadius: 16,
        boxShadow: '0 18px 44px -32px rgba(15, 23, 42, 0.35)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px 16px 18px', borderBottom: '1px solid var(--app-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h1 style={{ color: 'var(--app-heading)', fontSize: 20, fontWeight: 600, margin: 0 }}>自定义首页</h1>
          <span style={{ color: 'var(--app-muted)', fontSize: 12, fontWeight: 500 }}>{schemes.length} 个方案</span>
        </div>
        <label style={{ position: 'relative', display: 'block' }}>
          <Search
            size={15}
            color="var(--app-muted)"
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <ArcoTextInput
            value={schemeQuery}
            onChange={e => setSchemeQuery(e.target.value)}
            placeholder="搜索"
            style={{ height: 44, borderRadius: 8, paddingLeft: 38 }}
          />
        </label>
      </div>

      {/* Scheme list */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '18px 16px' }}>
        {filteredSchemes.map(scheme => {
          const active = scheme.id === activeSchemeId;
          return (
            <div
              key={scheme.id}
              onClick={() => onSelectScheme(scheme.id)}
              className="group relative cursor-pointer"
              style={{
                minHeight: 114,
                padding: '18px 16px',
                marginBottom: 12,
                borderRadius: 16,
                background: active ? 'var(--app-accent-soft)' : 'var(--app-surface)',
                border: active ? '2px solid #2D2499' : '1px solid transparent',
                transition: 'background 0.12s ease, border-color 0.12s ease',
                position: 'relative',
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--app-soft)'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--app-surface)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span
                      style={{
                        color: 'var(--app-heading)',
                        fontSize: 16,
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 200,
                      }}
                    >
                      {scheme.name}
                    </span>
                  </div>
                  <div style={{ color: 'var(--app-muted)', fontSize: 13, marginBottom: 8 }}>{scheme.lastEdited} 更新</div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      height: 22,
                      padding: '0 8px',
                      borderRadius: 99,
                      background: 'var(--app-accent-soft)',
                      color: 'var(--app-accent)',
                      border: '1px solid var(--app-accent-border)',
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    {schemeTag(scheme)}
                  </span>
                </div>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button
                      onClick={e => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 rounded p-0.5 transition-opacity shrink-0"
                      style={{ color: 'var(--app-muted)', marginTop: 2, opacity: active ? 1 : undefined }}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="z-50 rounded-md py-1.5"
                      style={{
                        background: 'var(--app-surface)',
                        border: '1px solid var(--app-border)',
                        minWidth: 150,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      }}
                      align="end"
                      sideOffset={4}
                    >
                      {[
                        { icon: Pencil,   label: '重命名', action: () => openRename(scheme.id),        danger: false, disabled: false },
                        { icon: Copy,     label: '复制方案', action: () => handleCopy(scheme.id),        danger: false, disabled: false },
                        { icon: Download, label: '导出首页', action: () => onExportScheme(scheme.id),    danger: false, disabled: false },
                        { icon: Trash2,   label: '删除首页', action: () => openDelete(scheme.id),        danger: true,  disabled: !canDelete },
                      ].map(({ icon: Icon, label, action, danger, disabled }) => (
                        <DropdownMenu.Item
                          key={label}
                          disabled={disabled}
                          onSelect={event => {
                            if (disabled) { event.preventDefault(); return; }
                            action();
                          }}
                          className="flex items-center gap-2.5 px-3 py-1.5 cursor-pointer outline-none mx-1 rounded"
                          style={{
                            color: danger ? 'var(--app-danger)' : 'var(--app-text)',
                            fontSize: 12,
                            opacity: disabled ? 0.45 : 1,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <Icon size={13} />
                          {label}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            </div>
          );
        })}
        {filteredSchemes.length === 0 && (
          <div style={{
            borderRadius: 16,
            background: 'var(--app-soft)',
            border: '1px dashed var(--app-border-strong)',
            color: 'var(--app-muted)',
            fontSize: 13,
            textAlign: 'center',
            padding: '28px 16px',
          }}>
            未找到匹配的首页
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div style={{ borderTop: '1px solid var(--app-border)', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <ArcoButton
          onClick={() => setCatalogOpen(true)}
          size="large"
          icon={<LayoutGrid size={14} />}
          long
        >
          组件管理
        </ArcoButton>
        <ArcoButton
          onClick={handleAdd}
          size="large"
          icon={<Plus size={14} />}
          long
          style={{
            borderStyle: 'dashed',
            borderColor: 'var(--app-accent-border)',
            color: 'var(--app-accent)',
          }}
        >
          新增首页
        </ArcoButton>
      </div>

      {/* Component catalog dialog */}
      <ArcoModal
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        title="组件清单"
        description="查看当前可用于自定义首页搭建的组件、默认尺寸与适用范围。"
        icon={<LayoutGrid size={18} />}
        width={680}
        maxHeight="calc(100vh - 72px)"
        bodyStyle={{ padding: '18px 24px 20px' }}
        footer={<ArcoButton type="primary" onClick={() => setCatalogOpen(false)}>关闭</ArcoButton>}
      >
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
                  <span style={{ borderRadius: 999, background: 'var(--app-accent-soft)', color: 'var(--app-accent)', fontSize: 11, fontWeight: 600, padding: '5px 10px' }}>
                    {COMPONENT_DEFS.length} 个组件
                  </span>
                  <span style={{ borderRadius: 999, background: 'var(--app-soft)', color: 'var(--app-muted)', fontSize: 11, fontWeight: 600, padding: '5px 10px', border: '1px solid var(--app-border)' }}>
                    {CATEGORIES.length} 个分类
                  </span>
            </div>

              {CATEGORIES.map(category => {
                const items = COMPONENT_DEFS.filter(def => def.categoryId === category.id);
                if (items.length === 0) return null;

                return (
                  <section key={category.id} style={{ marginBottom: 18 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                    }}>
                      <div style={{ color: 'var(--app-heading)', fontSize: 14, fontWeight: 600 }}>{category.name}</div>
                      <div style={{ color: 'var(--app-muted)', fontSize: 11, fontWeight: 600 }}>{items.length} 个</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                      {items.map(def => (
                        <div
                          key={def.id}
                          style={{
                            borderRadius: 8,
                            background: 'var(--app-soft)',
                            border: '1px solid var(--app-border)',
                            padding: '13px 14px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                            <div style={{ color: 'var(--app-heading)', fontSize: 13, fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {def.name}
                            </div>
                            <span style={{ flexShrink: 0, background: 'var(--app-accent-soft)', color: 'var(--app-accent)', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999 }}>
                              {def.colSpan}×{def.rowSpan}格
                            </span>
                          </div>
                          <p style={{ color: 'var(--app-muted)', fontSize: 12, lineHeight: 1.6, margin: '0 0 10px' }}>
                            {def.description}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            {def.scopes.map(scope => (
                              <span
                                key={scope}
                                style={{
                                  borderRadius: 999,
                                  background: scope === '通用' ? 'var(--app-border)' : 'var(--app-success-soft)',
                                  color: scope === '通用' ? 'var(--app-muted)' : 'var(--app-success)',
                                  fontSize: 10,
                                  fontWeight: 600,
                                  padding: '3px 8px',
                                }}
                              >
                                {scope}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
      </ArcoModal>

      {/* Rename dialog */}
      <ArcoModal
        open={renamingId !== null}
        onOpenChange={open => { if (!open) setRenamingId(null); }}
        title="重命名面板"
        width={340}
        footer={(
          <>
            <ArcoButton onClick={() => setRenamingId(null)}>取消</ArcoButton>
            <ArcoButton type="primary" onClick={confirmRename} disabled={!renameValue.trim()}>确认</ArcoButton>
          </>
        )}
      >
            <ArcoTextInput
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenamingId(null); }}
              autoFocus
              placeholder="请输入首页名称"
            />
      </ArcoModal>

    </div>
  );
}
