import { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ArrowLeft, BarChart2, Map, Factory, ListChecks, ChevronDown, ChevronRight, List, Search } from 'lucide-react';
import { CATEGORIES, type ComponentDef } from '../shared';
import { ArcoButton, ArcoIconButton, ArcoTextInput } from './ArcoLike';
import { ComponentManagerDialog } from './ComponentManagerDialog';
import { useComponentCatalog } from './useComponentCatalog';

interface ComponentLibraryProps {
  onExit?: () => void;
}

const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  monitor:    { icon: <BarChart2 size={13} />, color: 'var(--app-accent)', bg: 'var(--app-accent-soft)', border: 'var(--app-accent-border)' },
  map:        { icon: <Map size={13} />,       color: 'var(--app-accent)', bg: 'var(--app-accent-soft)', border: 'var(--app-accent-border)' },
  production: { icon: <Factory size={13} />,   color: 'var(--app-accent)', bg: 'var(--app-accent-soft)', border: 'var(--app-accent-border)' },
  task:       { icon: <ListChecks size={13} />, color: 'var(--app-accent)', bg: 'var(--app-accent-soft)', border: 'var(--app-accent-border)' },
};

const SCOPE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  '复合机器人': { bg: 'var(--app-accent-soft)', color: 'var(--app-accent)', border: 'var(--app-accent-border)' },
  'AGV':        { bg: 'var(--app-soft)', color: 'var(--app-text)', border: 'var(--app-border)' },
  '巡检':       { bg: 'var(--app-soft)', color: 'var(--app-text)', border: 'var(--app-border)' },
  '通用':       { bg: 'var(--app-soft)', color: 'var(--app-text)', border: 'var(--app-border)' },
};

const THUMBNAILS: Record<string, React.ReactNode> = {
  'kpi-metrics': (
    <div style={{ display: 'flex', gap: 3, width: '100%', height: '100%', alignItems: 'center', padding: '0 2px' }}>
      {['var(--app-accent)','var(--app-success)','var(--app-info)','var(--app-warning)'].map(c => (
        <div key={c} style={{ flex: 1, borderRadius: 8, background: `color-mix(in srgb, ${c} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${c} 20%, transparent)`, height: '100%', display: 'flex', alignItems: 'flex-end', padding: '2px', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
          <div style={{ width: '70%', height: 3, borderRadius: 2, background: c, opacity: 0.9 }} />
          <div style={{ width: '100%', height: 2, borderRadius: 2, background: 'var(--app-border-strong)' }} />
        </div>
      ))}
    </div>
  ),
};

function DraggableCard({ def, categoryId }: { def: ComponentDef; categoryId: string }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'COMPONENT',
    item: { defId: def.id, colSpan: def.colSpan, rowSpan: def.rowSpan },
    collect: m => ({ isDragging: m.isDragging() }),
  });
  const meta = CATEGORY_META[categoryId];
  return (
    <div ref={drag as unknown as React.Ref<HTMLDivElement>}
      style={{ background: isDragging ? 'var(--app-accent-soft)' : 'var(--app-surface)', border: '1px solid ' + (isDragging ? 'var(--app-accent)' : 'var(--app-border)'), borderRadius: 16, padding: '12px 14px', cursor: 'grab', opacity: isDragging ? 0.5 : 1, boxShadow: isDragging ? '0 4px 20px var(--app-shadow-color)' : 'none', transition: 'all 0.2s ease', userSelect: 'none' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--app-soft)', border: '1px solid var(--app-border)', padding: 4, flexShrink: 0, overflow: 'hidden' }}>
          {THUMBNAILS[def.id] ?? <div style={{ width: '100%', height: '100%', background: meta.bg, borderRadius: 8 }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ color: 'var(--app-heading)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{def.name}</div>
          </div>
          <p style={{ color: 'var(--app-text)', fontSize: 12, lineHeight: 1.55, margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{def.description}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {def.scopes.map(s => {
              const sc = SCOPE_STYLE[s] ?? { bg: 'var(--app-soft)', color: 'var(--app-text)', border: 'var(--app-border)' };
              return <span key={s} style={{ background: sc.bg, color: sc.color, border: '1px solid ' + sc.border, fontSize: 11, fontWeight: 500, padding: '1px 7px', borderRadius: 8, lineHeight: 1.6 }}>{s}</span>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComponentLibrary({ onExit }: ComponentLibraryProps = {}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(CATEGORIES.map(c => c.id)));
  const [query, setQuery] = useState('');
  const [managerOpen, setManagerOpen] = useState(false);
  const { components } = useComponentCatalog();

  function toggle(id: string) { setExpanded(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }

  return (
    <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', margin: '16px 0 16px 12px', background: 'var(--app-surface)', borderRadius: 16, border: '1px solid var(--app-border)', boxShadow: 'none', overflow: 'hidden' }}>
      <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--app-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ArcoIconButton onClick={onExit} aria-label="返回" title="返回" type="text" size="small" icon={<ArrowLeft size={16} />} />
          <div><div style={{ color: 'var(--app-heading)', fontSize: 16, fontWeight: 600, lineHeight: 1.2 }}>组件库</div></div>
        </div>
        <label style={{ display: 'block' }}>
          <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>搜索组件</span>
          <div style={{ position: 'relative' }}>
            <Search size={15} color="var(--app-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <ArcoTextInput value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索组件" style={{ width: '100%', height: 32, borderRadius: 8, padding: '0 12px 0 36px' }} />
          </div>
        </label>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {CATEGORIES.map(cat => {
          const keyword = query.trim().toLowerCase();
          const items = components.filter(d => d.categoryId === cat.id && (!keyword || (d.name + ' ' + d.description + ' ' + d.scopes.join(' ') + ' ' + d.tags.join(' ')).toLowerCase().includes(keyword)));
          if (items.length === 0) return null;
          const meta = CATEGORY_META[cat.id];
          const isExpanded = expanded.has(cat.id);
          return (
            <div key={cat.id} style={{ marginBottom: 4 }}>
              <button onClick={() => toggle(cat.id)} aria-expanded={isExpanded} style={{ width: '100%', height: 38, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 8, transition: 'background 0.15s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, background: meta.bg, color: meta.color, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + meta.border }}>{meta.icon}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-heading)' }}>{cat.name}</span>
                  <span style={{ background: 'var(--app-soft)', color: 'var(--app-muted)', fontSize: 11, fontWeight: 600, minWidth: 22, height: 22, padding: '0 7px', borderRadius: 7, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--app-border)' }}>{items.length}</span>
                </div>
                {isExpanded ? <ChevronDown size={12} color="var(--app-muted)" /> : <ChevronRight size={12} color="var(--app-muted)" />}
              </button>
              {isExpanded && <div style={{ padding: '0 12px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>{items.map(def => <DraggableCard key={def.id} def={def} categoryId={cat.id} />)}</div>}
            </div>
          );
        })}
      </div>
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--app-border)', flexShrink: 0 }}>
        <ArcoButton long size="large" icon={<List size={15} />} onClick={() => setManagerOpen(true)}>组件管理</ArcoButton>
      </div>
      <ComponentManagerDialog open={managerOpen} onOpenChange={setManagerOpen} />
    </div>
  );
}
