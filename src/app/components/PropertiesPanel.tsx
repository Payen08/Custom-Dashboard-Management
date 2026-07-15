import { X, Trash2, Settings2 } from 'lucide-react';
import { type PlacedItem, type ComponentDef, COMPONENT_DEFS, COMPONENT_PROPS, GRID_COLS, GRID_ROWS, type PropField } from '../shared';
import { ArcoButton, ArcoField, ArcoIconButton, ArcoSelect, ArcoTextInput } from './ArcoLike';

interface Props {
  item: PlacedItem | null;
  componentDefs?: ComponentDef[];
  showTitleIcon?: boolean;
  embedded?: boolean;
  onUpdateConfig: (instanceId: string, key: string, value: string | number | boolean) => void;
  onUpdateSize: (instanceId: string, colSpan: number, rowSpan: number) => void;
  onRemove: (instanceId: string) => void;
  onClose: () => void;
}

// ── Form field renderers ─────────────────────────────────────────────────────

function TextField({ field, value, onChange }: {
  field: Extract<PropField, { type: 'text' }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <ArcoField label={field.label}>
        <ArcoTextInput type="text" value={value} onChange={e => onChange(e.target.value)} />
      </ArcoField>
    </div>
  );
}

function SelectField({ field, value, onChange }: {
  field: Extract<PropField, { type: 'select' }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <ArcoField label={field.label}>
        <ArcoSelect value={value} onChange={e => onChange(e.target.value)}>
          {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </ArcoSelect>
      </ArcoField>
    </div>
  );
}

function ToggleField({ field, value, onChange }: {
  field: Extract<PropField, { type: 'toggle' }>;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 36, marginBottom: 8 }}>
      <span style={{ color: 'var(--app-text)', fontSize: 14 }}>{field.label}</span>
      <button
        onClick={() => onChange(!value)}
        aria-label={field.label}
        aria-pressed={value}
        title={field.label}
        style={{
          width: 40, height: 22, borderRadius: 99, border: 'none', cursor: 'pointer',
          background: value ? 'var(--app-accent)' : 'var(--app-border-strong)',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 3, borderRadius: 99,
          width: 16, height: 16,
          background: 'var(--app-surface)',
          left: value ? 21 : 3,
          boxShadow: '0 1px 3px var(--app-shadow-color)',
          transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );
}

function NumberField({ field, value, onChange }: {
  field: Extract<PropField, { type: 'number' }>;
  value: number;
  onChange: (v: number) => void;
}) {
  function clamp(v: number) { return Math.min(field.max, Math.max(field.min, v)); }
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', color: 'var(--app-muted)', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>{field.label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <ArcoButton
          onClick={() => onChange(clamp(value - 1))}
          style={{ width: 30, padding: 0, flexShrink: 0 }}
          aria-label={`${field.label}减少`}
        >
          −
        </ArcoButton>
        <ArcoTextInput
          type="number"
          value={value}
          min={field.min}
          max={field.max}
          onChange={e => onChange(clamp(parseInt(e.target.value) || field.min))}
          style={{ flex: 1, textAlign: 'center' }}
        />
        <ArcoButton
          onClick={() => onChange(clamp(value + 1))}
          style={{ width: 30, padding: 0, flexShrink: 0 }}
          aria-label={`${field.label}增加`}
        >
          +
        </ArcoButton>
        {field.unit && (
          <span style={{ color: 'var(--app-muted)', fontSize: 12, flexShrink: 0 }}>{field.unit}</span>
        )}
      </div>
    </div>
  );
}

function SizeField({ label, value, min, max, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  function clamp(v: number) { return Math.min(max, Math.max(min, v)); }
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', color: 'var(--app-muted)', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <ArcoButton
          onClick={() => onChange(clamp(value - 1))}
          size="small"
          style={{ width: 28, padding: 0, flexShrink: 0 }}
          aria-label={`${label}减少`}
        >
          −
        </ArcoButton>
        <ArcoTextInput
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={e => onChange(clamp(parseInt(e.target.value) || min))}
          style={{ width: 44, textAlign: 'center', padding: '0 6px' }}
        />
        <ArcoButton
          onClick={() => onChange(clamp(value + 1))}
          size="small"
          style={{ width: 28, padding: 0, flexShrink: 0 }}
          aria-label={`${label}增加`}
        >
          +
        </ArcoButton>
      </div>
    </div>
  );
}

// ── PropertiesPanel ──────────────────────────────────────────────────────────

export function PropertiesPanel({ item, componentDefs = COMPONENT_DEFS, showTitleIcon = true, embedded = false, onUpdateConfig, onUpdateSize, onRemove, onClose }: Props) {
  const emptyState = !item;
  const def = item ? componentDefs.find(d => d.id === item.defId) : undefined;
  if (!emptyState && !def) return null;

  const fields = item ? COMPONENT_PROPS[item.defId] ?? [] : [];

  function getValue<T>(key: string, fallback: T): T {
    if (!item) return fallback;
    const v = item.config[key];
    return v !== undefined ? (v as unknown as T) : fallback;
  }

  function update(key: string, value: string | number | boolean) {
    if (!item) return;
    onUpdateConfig(item.instanceId, key, value);
  }

  return (
    <div style={{
      width: embedded ? 'clamp(288px, 20vw, 320px)' : 280, flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      margin: embedded ? '16px 16px 16px 0' : '16px 12px 16px 0',
      background: 'var(--app-surface)',
      borderRadius: 16,
      border: '1px solid var(--app-border)',
      boxShadow: '0 18px 44px -32px var(--app-shadow-color)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '0 20px',
        height: 56,
        borderBottom: '1px solid var(--app-border)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showTitleIcon && <Settings2 size={16} color="var(--app-accent)" />}
          <span style={{ color: 'var(--app-heading)', fontSize: 16, fontWeight: 600 }}>组件属性</span>
        </div>
        {item && (
          <ArcoIconButton
            onClick={onClose}
            type="text"
            size="small"
            icon={<X size={14} />}
            aria-label="关闭组件属性"
            title="关闭组件属性"
          />
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: item ? '14px 20px 16px' : '16px 20px' }}>
        {!item && (
          <>
            <div style={{ borderRadius: 16, padding: '24px 16px', textAlign: 'center', background: 'var(--app-soft)', border: '1px dashed var(--app-border-strong)', marginBottom: 16 }}>
              <p style={{ color: 'var(--app-muted)', fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>选中组件以配置内容</p>
              <p style={{ color: 'var(--app-muted)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>点击画布中的任意组件，可调整属性、尺寸与删除操作</p>
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--app-border)' }}>
              <div style={{ color: 'var(--app-heading)', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                画布信息
              </div>
              {[
                ['栅格列数', '12'],
                ['栅格行数', '9'],
                ['吸附栅格', '开启'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ color: 'var(--app-muted)', fontSize: 12 }}>{label}</span>
                  <span style={{ color: value === '开启' ? 'var(--app-success)' : 'var(--app-heading)', background: value === '开启' ? 'var(--app-success-soft)' : 'var(--app-soft)', border: '1px solid var(--app-border)', borderRadius: 8, padding: '3px 8px', fontSize: 12, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {item && def && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
              <span style={{ color: 'var(--app-heading)', fontSize: 14, fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{def.name}</span>
              <span style={{ background: 'var(--app-accent-soft)', color: 'var(--app-accent)', border: '1px solid var(--app-accent-border)', fontSize: 12, fontWeight: 500, padding: '1px 7px', borderRadius: 8, flexShrink: 0 }}>
                {item.colSpan}×{item.rowSpan} 格
              </span>
            </div>
            <p style={{ color: 'var(--app-text)', fontSize: 12, margin: 0, lineHeight: 1.6 }}>{def.description}</p>
          </div>
        )}
        {item && (
          <div style={{ marginBottom: 18, paddingTop: 14, borderTop: '1px solid var(--app-border)' }}>
            <div style={{ color: 'var(--app-heading)', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              尺寸设置
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <SizeField
                label="宽度 (W)"
                value={item.colSpan}
                min={1}
                max={GRID_COLS - item.col + 1}
                onChange={v => onUpdateSize(item.instanceId, v, item.rowSpan)}
              />
              <SizeField
                label="高度 (H)"
                value={item.rowSpan}
                min={1}
                max={GRID_ROWS - item.row + 1}
                onChange={v => onUpdateSize(item.instanceId, item.colSpan, v)}
              />
            </div>
          </div>
        )}
        {fields.map((field, idx) => {
          if (field.type === 'section') {
            return (
              <div key={idx} style={{
                marginTop: idx > 0 ? 18 : 0,
                marginBottom: 12,
                paddingTop: idx > 0 ? 14 : 0,
                borderTop: idx > 0 ? '1px solid var(--app-border)' : 'none',
              }}>
                <span style={{ color: 'var(--app-heading)', fontSize: 14, fontWeight: 600 }}>
                  {field.label}
                </span>
              </div>
            );
          }

          if (field.type === 'text') {
            return <TextField key={idx} field={field} value={getValue(field.key, field.default)} onChange={v => update(field.key, v)} />;
          }
          if (field.type === 'select') {
            return <SelectField key={idx} field={field} value={getValue(field.key, field.default)} onChange={v => update(field.key, v)} />;
          }
          if (field.type === 'toggle') {
            return <ToggleField key={idx} field={field} value={getValue(field.key, field.default)} onChange={v => update(field.key, v)} />;
          }
          if (field.type === 'number') {
            return <NumberField key={idx} field={field} value={getValue(field.key, field.default)} onChange={v => update(field.key, v)} />;
          }
          return null;
        })}
      </div>

      {/* Delete button */}
      {item && (
      <div style={{ padding: '14px 20px 16px', borderTop: '1px solid var(--app-border)', flexShrink: 0 }}>
        <ArcoButton
          onClick={() => onRemove(item.instanceId)}
          status="danger"
          icon={<Trash2 size={14} />}
          long
          size="large"
        >
          删除组件
        </ArcoButton>
      </div>
      )}
    </div>
  );
}
