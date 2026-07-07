import { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ArrowLeft, BarChart2, Bot, Map, Factory, ListChecks, ChevronDown, ChevronRight, List, Search } from 'lucide-react';
import { CATEGORIES, COMPONENT_DEFS, type ComponentDef } from '../shared';
import { ArcoButton, ArcoIconButton, ArcoTextInput } from './ArcoLike';

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
  'AGV':        { bg: 'var(--app-surface)', color: 'var(--app-success)', border: 'var(--app-border)' },
  '巡检':       { bg: 'var(--app-surface)', color: 'var(--app-muted)', border: 'var(--app-border)' },
  '通用':       { bg: 'var(--app-surface)', color: 'var(--app-muted)', border: 'var(--app-border)' },
};

// Tiny canvas thumbnail to represent each component type
const THUMBNAILS: Record<string, React.ReactNode> = {
  'kpi-metrics': (
    <div style={{ display: 'flex', gap: 3, width: '100%', height: '100%', alignItems: 'center', padding: '0 2px' }}>
      {['var(--app-accent)','var(--app-success)','#722ED1','#FF7D00'].map(c => (
        <div key={c} style={{ flex: 1, borderRadius: 8, background: `${c}18`, border: `1px solid ${c}30`, height: '100%', display: 'flex', alignItems: 'flex-end', padding: '2px', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
          <div style={{ width: '70%', height: 3, borderRadius: 2, background: c, opacity: 0.9 }} />
          <div style={{ width: '100%', height: 2, borderRadius: 2, background: 'var(--app-border-strong)' }} />
        </div>
      ))}
    </div>
  ),
  'device-status': (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', height: '100%', padding: '1px', justifyContent: 'center' }}>
      {['var(--app-success)','var(--app-success)','var(--app-success)','var(--app-success)','var(--app-muted)'].map((c, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{ width: 4, height: 4, borderRadius: 99, background: c }} />
          <div style={{ flex: 1, height: 2, borderRadius: 2, background: 'var(--app-border)' }} />
        </div>
      ))}
    </div>
  ),
  'alert-info': (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', height: '100%', padding: '1px', justifyContent: 'center' }}>
      {['var(--app-danger)','var(--app-danger)','#FF7D00','#FF7D00'].map((c, i) => (
        <div key={i} style={{ borderRadius: 3, padding: '2px 4px', background: `${c}12`, border: `1px solid ${c}25`, display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{ width: 3, height: 3, borderRadius: 99, background: c }} />
          <div style={{ flex: 1, height: 2, borderRadius: 2, background: `${c}30` }} />
        </div>
      ))}
    </div>
  ),
  'map-view': (
    <div style={{ width: '100%', height: '100%', background: 'var(--app-heading)', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {[0.3,0.5,0.7].map((t,i) => <line key={i} x1="50%" y1="40%" x2={`${50+(i-1)*30}%`} y2="85%" stroke="rgba(106,161,255,0.2)" strokeWidth="0.5"/>)}
        <rect x="25%" y="25%" width="50%" height="55%" fill="none" stroke="rgba(106,161,255,0.16)" strokeWidth="0.5"/>
        <rect x="43%" y="40%" width="14%" height="35%" rx="1" fill="#165DFF" />
        <circle cx="50%" cy="75%" r="8%" fill="none" stroke="#165DFF" strokeWidth="0.8" opacity="0.5"/>
      </svg>
    </div>
  ),
  'tray-status': (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, flex: 1 }}>
        {[...Array(4).fill('var(--app-accent)'), ...Array(4).fill('var(--app-border-strong)')].map((c, i) => (
          <div key={i} style={{ borderRadius: 2, background: c === 'var(--app-accent)' ? 'var(--app-accent-soft)' : 'var(--app-soft)', border: `1px solid ${c === 'var(--app-accent)' ? '#165DFF44' : 'var(--app-border-strong)'}` }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        {['var(--app-success)','var(--app-success)','var(--app-accent)','var(--app-muted)','var(--app-muted)','var(--app-muted)'].map((c, i) => (
          <div key={i} style={{ flex: 1, aspectRatio: '1', borderRadius: 2, background: `${c}18`, border: `1px solid ${c}40` }} />
        ))}
      </div>
    </div>
  ),
  'active-tasks': (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', height: '100%', padding: '1px', justifyContent: 'center' }}>
      {[0, 1].map(i => (
        <div key={i} style={{ borderRadius: 8, padding: '3px 5px', background: 'var(--app-soft)', border: '1px solid #C9CDD4', display: 'flex', gap: 4, alignItems: 'center' }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--app-success-soft)', border: '1px solid #AFF0B5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--app-success)' }}>
            <Bot size={8} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <div style={{ width: '80%', height: 2, borderRadius: 2, background: 'var(--app-text)' }} />
            <div style={{ width: '50%', height: 2, borderRadius: 2, background: 'var(--app-border-strong)' }} />
          </div>
        </div>
      ))}
    </div>
  ),
  'task-queue': (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', height: '100%', padding: '1px', justifyContent: 'center' }}>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, borderBottom: '1px solid var(--app-border)', paddingBottom: 2 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--app-border)', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ width: '75%', height: 2, borderRadius: 2, background: 'var(--app-text)' }} />
            <div style={{ width: '55%', height: 1.5, borderRadius: 2, background: 'var(--app-border-strong)' }} />
          </div>
          <div style={{ width: 14, height: 8, borderRadius: 3, background: 'var(--app-accent-soft)', border: '1px solid #BEDAFF' }} />
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
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      style={{
        background: isDragging ? 'var(--app-accent-soft)' : 'var(--app-surface)',
        border: `1px solid ${isDragging ? 'var(--app-accent)' : 'var(--app-border)'}`,
        borderRadius: 16,
        padding: '10px 12px',
        cursor: 'grab', opacity: isDragging ? 0.55 : 1,
        boxShadow: 'none',
        transition: 'background 0.15s ease, border-color 0.15s ease',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--app-soft)', border: '1px solid var(--app-border)', padding: 4, flexShrink: 0, overflow: 'hidden' }}>
          {THUMBNAILS[def.id] ?? <div style={{ width: '100%', height: '100%', background: meta.bg, borderRadius: 8 }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ color: 'var(--app-heading)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{def.name}</div>
            <span style={{ background: 'var(--app-accent-soft)', color: 'var(--app-accent)', fontSize: 11, fontWeight: 500, padding: '1px 6px', borderRadius: 8, border: '1px solid var(--app-accent-border)', flexShrink: 0 }}>
              {def.colSpan}×{def.rowSpan}格
            </span>
          </div>
          <p style={{
            color: 'var(--app-muted)', fontSize: 12, lineHeight: 1.55, margin: '0 0 8px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {def.description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {def.scopes.map(s => {
              const sc = SCOPE_STYLE[s] ?? { bg: 'var(--app-surface)', color: 'var(--app-muted)', border: 'var(--app-border)' };
              return (
                <span key={s} style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontSize: 11, fontWeight: 500, padding: '1px 7px', borderRadius: 8, lineHeight: 1.6 }}>
                  {s}
                </span>
              );
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

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div style={{
      width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
      margin: '16px 0 16px 12px',
      background: 'var(--app-surface)',
      borderRadius: 16,
      border: '1px solid var(--app-border)',
      boxShadow: '0 18px 44px -32px rgba(15, 23, 42, 0.35)',
      overflow: 'hidden',
    }}>

      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--app-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ArcoIconButton
            onClick={onExit}
            aria-label="返回"
            title="返回"
            type="text"
            size="small"
            icon={<ArrowLeft size={16} />}
          />
          <div>
            <div style={{ color: 'var(--app-heading)', fontSize: 16, fontWeight: 600, lineHeight: 1.2 }}>组件库</div>
          </div>
        </div>

        <label style={{ display: 'block' }}>
          <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
            搜索组件
          </span>
          <div style={{ position: 'relative' }}>
            <Search size={15} color="var(--app-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <ArcoTextInput
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索组件"
              style={{
                width: '100%',
                height: 32,
                borderRadius: 8,
                padding: '0 12px 0 36px',
              }}
            />
          </div>
        </label>
      </div>

      {/* ── Component list ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {CATEGORIES.map(cat => {
          const keyword = query.trim().toLowerCase();
          const items = COMPONENT_DEFS.filter(d =>
            d.categoryId === cat.id &&
            (!keyword || `${d.name} ${d.description} ${d.scopes.join(' ')}`.toLowerCase().includes(keyword))
          );
          if (items.length === 0) return null;
          const meta = CATEGORY_META[cat.id];
          const isExpanded = expanded.has(cat.id);

          return (
            <div key={cat.id} style={{ marginBottom: 4 }}>
              <button
                onClick={() => toggle(cat.id)}
                aria-expanded={isExpanded}
                style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 24, height: 24, background: meta.bg, color: meta.color, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${meta.border}` }}>
                    {meta.icon}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-heading)' }}>{cat.name}</span>
                  <span style={{ background: 'var(--app-soft)', color: 'var(--app-muted)', fontSize: 11, fontWeight: 500, minWidth: 20, height: 20, padding: '0 6px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--app-border)' }}>
                    {items.length}
                  </span>
                </div>
                {isExpanded ? <ChevronDown size={12} color="#C9CDD4" /> : <ChevronRight size={12} color="#C9CDD4" />}
              </button>

              {isExpanded && (
                <div style={{ padding: '0 12px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(def => <DraggableCard key={def.id} def={def} categoryId={cat.id} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--app-border)', flexShrink: 0 }}>
        <ArcoButton
          long
          size="large"
          icon={<List size={15} />}
        >
          组件管理
        </ArcoButton>
      </div>
    </div>
  );
}
