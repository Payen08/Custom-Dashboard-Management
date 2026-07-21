import { useState } from 'react';
import { Plus, MoreHorizontal, LayoutGrid, Pencil, Copy, Trash2, Download, Search } from 'lucide-react';
import { type HomepageScheme } from '../shared';
import { ArcoButton, ArcoIconButton, ArcoModal, ArcoTag, ArcoTextInput } from './ProductUI';
import { ComponentManagerDialog } from './ComponentManagerDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

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
      className="ds-page__sidebar ds-homepage-list"
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
            style={{ height: 40, borderRadius: 8, paddingLeft: 38 }}
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
              role="button"
              tabIndex={0}
              aria-label={`选择首页方案：${scheme.name}`}
              onClick={() => onSelectScheme(scheme.id)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectScheme(scheme.id);
                }
              }}
              className="group relative cursor-pointer"
              style={{
                minHeight: 114,
                padding: '18px 16px',
                marginBottom: 12,
                borderRadius: 16,
                background: active ? 'var(--app-accent-soft)' : 'var(--app-surface)',
                border: active ? '2px solid var(--app-accent)' : '1px solid transparent',
                transition: 'background-color var(--ds-motion-duration-fast) var(--ds-motion-ease-in-out), border-color var(--ds-motion-duration-fast) var(--ds-motion-ease-in-out)',
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
                        color: active ? 'var(--app-accent)' : 'var(--app-heading)',
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
                  <div style={{ color: 'var(--app-muted)', fontSize: 14, marginBottom: 8 }}>{scheme.lastEdited} 更新</div>
                  <ArcoTag tone="accent">{schemeTag(scheme)}</ArcoTag>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <ArcoIconButton
                      type="text"
                      size="small"
                      icon={<MoreHorizontal size={16} />}
                      aria-label={`${scheme.name}的更多操作`}
                      title="更多操作"
                      onClick={event => event.stopPropagation()}
                      className="ds-context-menu-trigger group-hover:opacity-100"
                      style={{ marginTop: 2, opacity: active ? 1 : undefined }}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8} className="ds-context-menu">
                    <DropdownMenuItem className="ds-context-menu__item" onSelect={() => openRename(scheme.id)}>
                      <Pencil size={16} />重命名
                    </DropdownMenuItem>
                    <DropdownMenuItem className="ds-context-menu__item" onSelect={() => handleCopy(scheme.id)}>
                      <Copy size={16} />复制方案
                    </DropdownMenuItem>
                    <DropdownMenuItem className="ds-context-menu__item" onSelect={() => onExportScheme(scheme.id)}>
                      <Download size={16} />导出首页
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="ds-context-menu__separator" />
                    <DropdownMenuItem className="ds-context-menu__item" variant="destructive" disabled={!canDelete} onSelect={() => openDelete(scheme.id)}>
                      <Trash2 size={16} />删除首页
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
        {filteredSchemes.length === 0 && (
          <div className="ds-empty" style={{ minHeight: 0, border: '1px dashed var(--app-border-strong)', background: 'var(--app-soft)' }}>
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
          type="secondary"
          size="large"
          icon={<Plus size={14} />}
          long
        >
          新增首页
        </ArcoButton>
      </div>

      <ComponentManagerDialog open={catalogOpen} onOpenChange={setCatalogOpen} />

      {/* Rename dialog */}
      <ArcoModal
        open={renamingId !== null}
        onOpenChange={open => { if (!open) setRenamingId(null); }}
        title="重命名面板"
        size="sm"
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
