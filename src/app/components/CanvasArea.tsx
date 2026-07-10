import { useRef, useState, useCallback, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Bot, Eye, Layers, Maximize2, Package, Rocket, X } from 'lucide-react';
import {
  type PlacedItem, type DragItem, type ComponentDef,
  COMPONENT_DEFS, GRID_COLS, GRID_ROWS, CELL_W, CELL_H, CANVAS_W, CANVAS_H, isFree,
} from '../shared';
import { ArcoButton } from './ArcoLike';

// ── Widget renderers (faithful to dashboard screenshot) ───────────────────────

// 1. 运行指标 ─────────────────────────────────────────────────────────────────
function KpiMetricsWidget() {
  const metrics = [
    { label: '运行时长', value: '11:45',  unit: '',    color: 'var(--app-accent)' },
    { label: '生产节拍', value: '4.2',    unit: 's',   color: 'var(--app-success)' },
    { label: '生产效率', value: '0.8',    unit: '/s',  color: 'var(--app-info)' },
    { label: '完成任务', value: '12',     unit: '件',  color: 'var(--app-warning)' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--app-surface)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
      {metrics.map((m, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: 8, padding: '8px 12px',
          background: 'var(--app-soft)', border: `1px solid color-mix(in srgb, ${m.color} 18%, transparent)`,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{ color: m.color, fontSize: 22, fontWeight: 600, lineHeight: 1 }}>{m.value}</span>
            <span style={{ color: m.color, fontSize: 12, fontWeight: 600 }}>{m.unit}</span>
          </div>
          <span style={{ color: 'var(--app-muted)', fontSize: 11 }}>{m.label}</span>
        </div>
      ))}
    </div>
  );
}

// 2. 设备状态 ─────────────────────────────────────────────────────────────────
function DeviceStatusWidget() {
  const devices = [
    { name: '感盘',     icon: '○', status: 'ok' },
    { name: '机械臂',   icon: '✋', status: 'ok' },
    { name: '夹具',     icon: '⚙', status: 'ok' },
    { name: '相机',     icon: '◉', status: 'ok' },
    { name: '激光扫描', icon: '≋', status: 'ok' },
    { name: '请选模块', icon: '□', status: 'off' },
    { name: 'I/O模块',  icon: '⊞', status: 'ok' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--app-surface)', padding: '12px 10px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: 'var(--app-muted)', fontSize: 11, fontWeight: 500, marginBottom: 8, paddingLeft: 4 }}>设备状态</div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {devices.map((d, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '7px 10px', borderRadius: 8,
            background: 'var(--app-soft)',
            border: '1px solid var(--app-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--app-border-strong)', width: 16, textAlign: 'center' }}>{d.icon}</span>
              <span style={{ color: 'var(--app-text)', fontSize: 12, fontWeight: 500 }}>{d.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: 99, background: d.status === 'ok' ? 'var(--app-success)' : 'var(--app-border-strong)' }} />
              <span style={{ color: d.status === 'ok' ? 'var(--app-success)' : 'var(--app-muted)', fontSize: 10, fontWeight: 600 }}>
                {d.status === 'ok' ? '正常' : '离线'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. 告警信息 ─────────────────────────────────────────────────────────────────
function AlertInfoWidget() {
  const alerts = [
    { text: '机械臂轨迹规划失败', detail: '位置: A25 | 14:32', level: 'error', action: '处理',  actionColor: 'var(--app-danger)' },
    { text: '视觉定位相机超时',   detail: '位置: B区 | 14:28', level: 'error', action: '处理中', actionColor: 'var(--app-warning)' },
    { text: 'IO模块通信异常',     detail: '14:10',             level: 'warn',  action: '忽略',  actionColor: 'var(--app-muted)' },
    { text: '电池单元电量低',     detail: '13:58',             level: 'warn',  action: '待处理', actionColor: 'var(--app-warning)' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--app-surface)', padding: '12px 14px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ color: 'var(--app-muted)', fontSize: 11, fontWeight: 500 }}>告警信息</span>
        <span style={{ background: 'var(--app-danger-soft)', color: 'var(--app-danger)', fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 8 }}>
          {alerts.length} 条
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {alerts.map((a, i) => (
          <div key={i} style={{
            borderRadius: 8, padding: '8px 12px',
            background: a.level === 'error' ? 'var(--app-danger-soft)' : 'var(--app-soft)',
            border: `1px solid ${a.level === 'error' ? 'var(--app-danger-border)' : 'var(--app-warning)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: 99, flexShrink: 0, marginTop: 3, background: a.level === 'error' ? 'var(--app-danger)' : 'var(--app-warning)' }} />
              <span style={{ color: 'var(--app-heading)', fontSize: 12, fontWeight: 600, flex: 1 }}>{a.text}</span>
              <span style={{
                color: a.actionColor, fontSize: 10, fontWeight: 500,
                border: `1px solid ${a.actionColor}55`, padding: '1px 8px', borderRadius: 99, flexShrink: 0,
              }}>{a.action}</span>
            </div>
            <div style={{ paddingLeft: 15, color: 'var(--app-muted)', fontSize: 10 }}>{a.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. 实时地图与机器人状态 ───────────────────────────────────────────────────────
function MapViewWidget() {
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--app-heading)', position: 'relative', overflow: 'hidden' }}>
      {/* 3D floor grid */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--app-scene)" />
            <stop offset="100%" stopColor="var(--app-scene-soft)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#skyGrad)" />

        {/* 3D perspective floor grid */}
        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((t, i) => (
          <line key={`h${i}`}
            x1={`${50 - (50 - t * 100) * 0.3}%`} y1={`${40 + t * 45}%`}
            x2={`${50 + (50 - t * 100) * 0.3}%`} y2={`${40 + t * 45}%`}
            stroke="var(--app-accent)" strokeOpacity="0.16" strokeWidth="0.5"
          />
        ))}
        {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((n, i) => (
          <line key={`v${i}`}
            x1="50%" y1="40%"
            x2={`${50 + n * 12}%`} y2="85%"
            stroke="var(--app-accent)" strokeOpacity="0.12" strokeWidth="0.5"
          />
        ))}

        {/* Factory walls outline */}
        <rect x="20%" y="30%" width="60%" height="45%" rx="2" fill="none" stroke="var(--app-accent)" strokeOpacity="0.12" strokeWidth="1" />

        {/* Robot arm base */}
        <ellipse cx="50%" cy="68%" rx="8%" ry="2.5%" fill="var(--app-brand)" fillOpacity="0.5" stroke="var(--app-brand)" strokeWidth="0.5" />

        {/* Robot arm body */}
        <rect x="47%" y="52%" width="6%" height="18%" rx="2" fill="var(--app-brand)" stroke="var(--app-accent)" strokeWidth="0.5" />

        {/* Robot arm upper */}
        <rect x="46%" y="36%" width="4%" height="18%" rx="2"
          fill="var(--app-brand)" stroke="var(--app-accent)" strokeWidth="0.5"
          style={{ transformOrigin: '48% 52%', transform: 'rotate(-15deg)' }}
        />

        {/* Robot arm forearm */}
        <rect x="48%" y="26%" width="3%" height="14%" rx="2"
          fill="var(--app-brand)" stroke="var(--app-accent-border)" strokeWidth="0.5"
          style={{ transformOrigin: '49.5% 36%', transform: 'rotate(20deg)' }}
        />

        {/* End effector / gripper */}
        <circle cx="52%" cy="24%" r="2.5%" fill="var(--app-accent)" opacity="0.9" />
        <circle cx="52%" cy="24%" r="1.2%" fill="var(--app-accent-border)" />

        {/* Status glow rings */}
        <circle cx="50%" cy="68%" r="12%" fill="none" stroke="var(--app-accent)" strokeOpacity="0.16" strokeWidth="2" />
        <circle cx="50%" cy="68%" r="18%" fill="none" stroke="var(--app-accent)" strokeOpacity="0.08" strokeWidth="1.5" />

        {/* Coordinate axes */}
        <line x1="8%" y1="88%" x2="16%" y2="88%" stroke="var(--app-danger)" strokeWidth="1.5" />
        <line x1="8%" y1="88%" x2="8%"  y2="80%" stroke="var(--app-success)" strokeWidth="1.5" />
        <text x="17%" y="90%" fill="var(--app-danger)" fontSize="10" fontFamily="monospace">X</text>
        <text x="6%"  y="79%" fill="var(--app-success)" fontSize="10" fontFamily="monospace">Y</text>
      </svg>

      {/* Title */}
      <div style={{ position: 'absolute', top: 12, left: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: 'var(--app-scene-text)', fontSize: 13, fontWeight: 500 }}>实时地图与机器人状态</span>
        <span style={{ background: 'var(--app-success-soft)', color: 'var(--app-success)', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, border: '1px solid var(--app-success)' }}>● 在线</span>
      </div>

      {/* Expand icon */}
      <div style={{ position: 'absolute', top: 12, right: 14, color: 'var(--app-text)', cursor: 'pointer', fontSize: 14 }}>⛶</div>

      {/* Coordinate readout */}
      <div style={{ position: 'absolute', bottom: 10, left: 14, background: 'var(--app-overlay)', borderRadius: 8, padding: '4px 10px' }}>
        <span style={{ color: 'var(--app-muted)', fontSize: 10, fontFamily: 'monospace' }}>
          X: 124.3 / Y: -82.1 / Z: 445.6 mm
        </span>
      </div>
      <div style={{ position: 'absolute', bottom: 10, right: 14, background: 'var(--app-overlay)', borderRadius: 8, padding: '4px 10px' }}>
        <span style={{ color: 'var(--app-muted)', fontSize: 10, fontFamily: 'monospace' }}>速度: 0.8 m/s</span>
      </div>
    </div>
  );
}

// 5. 料盘情况 ──────────────────────────────────────────────────────────────────
function TrayStatusWidget() {
  const rawTrays  = [
    { id: 1, state: 'active'  },
    { id: 2, state: 'active'  },
    { id: 3, state: 'active'  },
    { id: 4, state: 'active'  },
    { id: 5, state: 'empty'   },
    { id: 6, state: 'empty'   },
    { id: 7, state: 'empty'   },
    { id: 8, state: 'empty'   },
  ];
  const tempTrays = rawTrays.map(t => ({ ...t, state: 'empty' as const }));
  const prodStatus = [
    { num: 6, label: '已完工', color: 'var(--app-success)', bg: 'var(--app-success-soft)', count: 12 },
    { num: 5, label: '已完工', color: 'var(--app-success)', bg: 'var(--app-success-soft)', count: 11 },
    { num: 4, label: '已完工', color: 'var(--app-success)', bg: 'var(--app-success-soft)', count: 10 },
    { num: 3, label: '已完工', color: 'var(--app-success)', bg: 'var(--app-success-soft)', count: 9  },
    { num: 2, label: '进行中', color: 'var(--app-accent)', bg: 'var(--app-accent-soft)', count: 5  },
    { num: 1, label: '待开始', color: 'var(--app-muted)', bg: 'var(--app-border)', count: 7  },
  ];

  const trayStyle = (state: string) =>
    state === 'active'
      ? { bg: 'var(--app-accent-soft)', border: 'var(--app-accent)', text: 'var(--app-accent)' }
      : { bg: 'var(--app-soft)', border: 'var(--app-border-strong)', text: 'var(--app-border-strong)' };

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--app-surface)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--app-muted)', fontSize: 11, fontWeight: 500 }}>料盘情况</span>
        <span style={{ color: 'var(--app-muted)', fontSize: 10 }}>233种进 3/9</span>
      </div>

      {/* Tray grids row */}
      <div style={{ display: 'flex', gap: 16, flex: 1 }}>
        {/* Raw trays (生料盘) */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--app-text)', fontSize: 11, fontWeight: 600 }}>生料盘</span>
            <span style={{ color: 'var(--app-accent)', fontSize: 10, fontWeight: 500 }}>4/0</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {rawTrays.map(t => {
              const s = trayStyle(t.state);
              return (
                <div key={t.id} style={{ aspectRatio: '1', borderRadius: 6, background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: s.text, fontSize: 10, fontWeight: 500 }}>{t.id}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Temp trays (暂料盘) */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--app-text)', fontSize: 11, fontWeight: 600 }}>暂料盘</span>
            <span style={{ color: 'var(--app-muted)', fontSize: 10, fontWeight: 500 }}>0/0</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {tempTrays.map((t, i) => (
              <div key={i} style={{ aspectRatio: '1', borderRadius: 6, background: 'var(--app-soft)', border: '1px solid var(--app-border-strong)' }} />
            ))}
          </div>
        </div>

        {/* Production completion */}
        <div style={{ flex: 1.5 }}>
          <div style={{ color: 'var(--app-text)', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>料盘生产完成状态</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {prodStatus.map(p => (
              <div key={p.num} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ width: '100%', aspectRatio: '1', borderRadius: 8, background: p.bg, border: `1px solid color-mix(in srgb, ${p.color} 27%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: p.color, fontSize: 12, fontWeight: 600 }}>{p.num}</span>
                </div>
                <span style={{ color: p.color, fontSize: 9, fontWeight: 600 }}>{p.label}</span>
                <span style={{ color: 'var(--app-heading)', fontSize: 11, fontWeight: 500 }}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. 正在执行的任务 ─────────────────────────────────────────────────────────────
function ActiveTasksWidget() {
  const tasks = [
    { name: '[移动圆柱充电电池]',  sub: '搬运 · 某某于工具', color: 'var(--app-success)' },
    { name: '[移动圆柱到目标位置]', sub: '搬运 · 某某于工具', color: 'var(--app-accent)' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--app-surface)', padding: '12px 14px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ color: 'var(--app-muted)', fontSize: 11, fontWeight: 500 }}>正在执行的任务</span>
        <span style={{ background: 'var(--app-success-soft)', color: 'var(--app-success)', fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 8 }}>
          {tasks.length} 个
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
        {tasks.map((t, i) => (
          <div key={i} style={{
            borderRadius: 8, padding: '10px 12px',
            background: 'var(--app-soft)', border: `1px solid color-mix(in srgb, ${t.color} 18%, transparent)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
              {/* Robot icon */}
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `color-mix(in srgb, ${t.color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${t.color} 20%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={14} color={t.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--app-heading)', fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{t.name}</div>
                <div style={{ color: 'var(--app-muted)', fontSize: 11 }}>{t.sub}</div>
              </div>
            </div>
            <ArcoButton long size="small" status="danger" icon={<X size={12} />}>
              取消
            </ArcoButton>
          </div>
        ))}
      </div>
    </div>
  );
}

// 7. 任务队列 ──────────────────────────────────────────────────────────────────
function TaskQueueWidget() {
  const items = [
    { name: '[移动圆柱充电电池]',   start: '2026-05-29 10:40:00', trips: '2026-05-29 10:13:54', Icon: Rocket },
    { name: '[移动运动到目标位置]',  start: '2026-05-29 10:20:30', trips: '2026-05-29 09:58:00', Icon: Bot },
    { name: '[移动运送物料至A区]',   start: '2026-05-29 10:13:54', trips: '2026-05-29 09:45:10', Icon: Package },
    { name: '[移动圆柱充电电池]',   start: '2026-05-29 09:55:00', trips: '2026-05-29 09:32:00', Icon: Rocket },
    { name: '[视觉定位任务]',       start: '2026-05-29 09:40:00', trips: '2026-05-29 09:18:00', Icon: Eye },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--app-surface)', padding: '12px 14px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexShrink: 0 }}>
        <span style={{ color: 'var(--app-muted)', fontSize: 11, fontWeight: 500 }}>任务队列</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ background: 'var(--app-accent-soft)', color: 'var(--app-accent)', fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 8 }}>20 条</span>
          <span style={{ color: 'var(--app-border-strong)', fontSize: 10 }}>近20条任务记录 ›</span>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            padding: '9px 10px', borderRadius: 8,
            background: i === 0 ? 'var(--app-soft)' : 'transparent',
            borderBottom: '1px solid var(--app-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              {/* Task icon */}
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--app-border)', border: '1px solid var(--app-border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--app-accent)' }}>
                <item.Icon size={14} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--app-heading)', fontSize: 12, fontWeight: 600, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                <div style={{ color: 'var(--app-muted)', fontSize: 10, marginBottom: 1 }}>
                  <span style={{ color: 'var(--app-border-strong)' }}>月始时间</span> {item.start}
                </div>
                <div style={{ color: 'var(--app-muted)', fontSize: 10 }}>
                  <span style={{ color: 'var(--app-border-strong)' }}>往来次数</span> {item.trips}
                </div>
              </div>
              <ArcoButton type="secondary" size="mini" style={{ flexShrink: 0 }}>
                详细
              </ArcoButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Widget map ───────────────────────────────────────────────────────────────

const WIDGET_MAP: Record<string, React.ComponentType> = {
  'kpi-metrics':   KpiMetricsWidget,
  'device-status': DeviceStatusWidget,
  'alert-info':    AlertInfoWidget,
  'map-view':      MapViewWidget,
  'tray-status':   TrayStatusWidget,
  'active-tasks':  ActiveTasksWidget,
  'task-queue':    TaskQueueWidget,
};

const EDIT_FRAME_PAD_X = 32;
const EDIT_FRAME_PAD_Y = 28;
const EDIT_FRAME_RADIUS = 24;
const CANVAS_MIN_SCALE = 0.12;

// ── Drop preview ──────────────────────────────────────────────────────────────

interface DropPreview { col: number; row: number; colSpan: number; rowSpan: number; canPlace: boolean }

// ── CanvasArea ────────────────────────────────────────────────────────────────

interface CanvasAreaProps {
  componentDefs?: ComponentDef[];
  items: PlacedItem[];
  isEditing: boolean;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onAddItem: (defId: string, col: number, row: number) => void;
  onMoveItem: (id: string, col: number, row: number) => void;
  onResizeItem: (id: string, colSpan: number, rowSpan: number) => void;
  onRemoveItem: (id: string) => void;
}

type CanvasInteraction =
  | {
      type: 'move';
      id: string;
      startX: number;
      startY: number;
      startCol: number;
      startRow: number;
      colSpan: number;
      rowSpan: number;
      moved: boolean;
    }
  | {
      type: 'resize';
      id: string;
      startX: number;
      startY: number;
      startColSpan: number;
      startRowSpan: number;
      moved: boolean;
    };

export function CanvasArea({
  componentDefs = COMPONENT_DEFS,
  items,
  isEditing,
  selectedItemId,
  onSelectItem,
  onAddItem,
  onMoveItem,
  onResizeItem,
  onRemoveItem,
}: CanvasAreaProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.72);
  const scaleRef = useRef(0.72);
  const [dropPreview, setDropPreview] = useState<DropPreview | null>(null);
  const lastCell = useRef<{ col: number; row: number } | null>(null);
  const interactionRef = useRef<CanvasInteraction | null>(null);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const framePadX = isEditing ? EDIT_FRAME_PAD_X : 0;
      const framePadY = isEditing ? EDIT_FRAME_PAD_Y : 0;
      const frameW = CANVAS_W + framePadX * 2;
      const frameH = CANVAS_H + framePadY * 2;
      const availableW = Math.max(width - 40, 1);
      const availableH = Math.max(height - 28, 1);
      const s = Math.min(availableW / frameW, availableH / frameH);
      const c = Math.min(Math.max(s, CANVAS_MIN_SCALE), 1);
      scaleRef.current = c;
      setScale(c);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [isEditing]);

  function calcCell(clientX: number, clientY: number, colSpan: number, rowSpan: number) {
    if (!innerRef.current) return null;
    const rect = innerRef.current.getBoundingClientRect();
    const s = scaleRef.current;
    const col = Math.max(1, Math.min(GRID_COLS - colSpan + 1, Math.floor((clientX - rect.left) / s / CELL_W) + 1));
    const row = Math.max(1, Math.min(GRID_ROWS - rowSpan + 1, Math.floor((clientY - rect.top)  / s / CELL_H) + 1));
    return { col, row };
  }

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: 'COMPONENT',
    hover(item, monitor) {
      if (!isEditing) return;
      const offset = monitor.getClientOffset();
      if (!offset) return;
      const cell = calcCell(offset.x, offset.y, item.colSpan, item.rowSpan);
      if (!cell) return;
      if (lastCell.current?.col === cell.col && lastCell.current?.row === cell.row) return;
      lastCell.current = cell;
      setDropPreview({ ...cell, colSpan: item.colSpan, rowSpan: item.rowSpan, canPlace: isFree(items, cell.col, cell.row, item.colSpan, item.rowSpan) });
    },
    drop(item, monitor) {
      if (!isEditing) return;
      const offset = monitor.getClientOffset();
      if (!offset) return;
      const cell = calcCell(offset.x, offset.y, item.colSpan, item.rowSpan);
      if (!cell) return;
      if (isFree(items, cell.col, cell.row, item.colSpan, item.rowSpan)) onAddItem(item.defId, cell.col, cell.row);
      setDropPreview(null);
      lastCell.current = null;
    },
    collect: m => ({ isOver: m.isOver() }),
  });

  useEffect(() => {
    if (!isOver) { setDropPreview(null); lastCell.current = null; }
  }, [isOver]);

  const setInnerRef = useCallback((node: HTMLDivElement | null) => {
    (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    drop(node);
  }, [drop]);

  const handleInteractionMove = useCallback((clientX: number, clientY: number) => {
    const interaction = interactionRef.current;
    if (!interaction || !isEditing) return;
    const dx = Math.round((clientX - interaction.startX) / scaleRef.current / CELL_W);
    const dy = Math.round((clientY - interaction.startY) / scaleRef.current / CELL_H);
    if (dx === 0 && dy === 0) return;
    interaction.moved = true;

    if (interaction.type === 'move') {
      const nextCol = Math.min(Math.max(1, interaction.startCol + dx), GRID_COLS - interaction.colSpan + 1);
      const nextRow = Math.min(Math.max(1, interaction.startRow + dy), GRID_ROWS - interaction.rowSpan + 1);
      onMoveItem(interaction.id, nextCol, nextRow);
      return;
    }

    const item = items.find(i => i.instanceId === interaction.id);
    if (!item) return;
    const nextColSpan = Math.min(Math.max(1, interaction.startColSpan + dx), GRID_COLS - item.col + 1);
    const nextRowSpan = Math.min(Math.max(1, interaction.startRowSpan + dy), GRID_ROWS - item.row + 1);
    onResizeItem(interaction.id, nextColSpan, nextRowSpan);
  }, [isEditing, items, onMoveItem, onResizeItem]);

  function endInteraction() {
    interactionRef.current = null;
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      handleInteractionMove(e.clientX, e.clientY);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', endInteraction);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', endInteraction);
    };
  }, [handleInteractionMove]);

  function startMove(e: React.MouseEvent<HTMLDivElement>, item: PlacedItem) {
    if (!isEditing || e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, textarea')) return;
    e.preventDefault();
    onSelectItem(item.instanceId);
    interactionRef.current = {
      type: 'move',
      id: item.instanceId,
      startX: e.clientX,
      startY: e.clientY,
      startCol: item.col,
      startRow: item.row,
      colSpan: item.colSpan,
      rowSpan: item.rowSpan,
      moved: false,
    };
  }

  function startResize(e: React.MouseEvent<HTMLButtonElement>, item: PlacedItem) {
    if (!isEditing || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    onSelectItem(item.instanceId);
    interactionRef.current = {
      type: 'resize',
      id: item.instanceId,
      startX: e.clientX,
      startY: e.clientY,
      startColSpan: item.colSpan,
      startRowSpan: item.rowSpan,
      moved: false,
    };
  }

  const framePadX = isEditing ? EDIT_FRAME_PAD_X : 0;
  const framePadY = isEditing ? EDIT_FRAME_PAD_Y : 0;
  const frameW = CANVAS_W + framePadX * 2;
  const frameH = CANVAS_H + framePadY * 2;
  const scaledFrameW = frameW * scale;
  const scaledFrameH = frameH * scale;
  const scaledCanvasW = CANVAS_W * scale;
  const scaledCanvasH = CANVAS_H * scale;

  return (
    <div
      ref={outerRef}
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '12px 16px 20px',
        background: isEditing ? 'var(--app-surface)' : 'var(--app-bg)',
      }}
    >
      <div style={{
        minWidth: '100%',
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Wrapper: visual dimensions include the edit frame around the logical 1440×900 canvas. */}
        <div style={{
          width: scaledFrameW,
          height: scaledFrameH,
          flexShrink: 0,
          position: 'relative',
          borderRadius: isEditing ? EDIT_FRAME_RADIUS : 16 * scale,
          background: isEditing ? 'var(--app-soft)' : 'transparent',
          border: isEditing ? '1px solid var(--app-border-strong)' : 'none',
          boxShadow: isEditing
            ? 'inset 0 1px 0 color-mix(in srgb, var(--app-surface) 72%, transparent), 0 16px 42px var(--app-shadow-color)'
            : '0 8px 32px var(--app-shadow-color)',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: framePadY * scale,
            left: framePadX * scale,
            width: scaledCanvasW,
            height: scaledCanvasH,
          }}>
            {/* Inner: logical 1440×900, CSS-scaled */}
            <div
              ref={setInnerRef}
              onClick={() => isEditing && onSelectItem(null)}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: CANVAS_W, height: CANVAS_H,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                borderRadius: 8, overflow: 'hidden',
                background: 'var(--app-bg)',
              }}
            >
          {/* Subtle grid */}
          {isEditing && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
              backgroundImage: `
                linear-gradient(to right, color-mix(in srgb, var(--app-border-strong) 45%, transparent) 1px, transparent 1px),
                linear-gradient(to bottom, color-mix(in srgb, var(--app-border-strong) 45%, transparent) 1px, transparent 1px)
              `,
              backgroundSize: `${CELL_W}px ${CELL_H}px`,
            }} />
          )}

          {/* Empty state */}
          {items.length === 0 && !isOver && isEditing && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--app-accent-soft)', border: '2px dashed var(--app-accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Layers size={26} color="var(--app-accent)" />
                </div>
                <p style={{ color: 'var(--app-muted)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                  从左侧拖拽组件到画布<br />或点击已放置组件编辑属性
                </p>
              </div>
            </div>
          )}

          {/* Drop preview */}
          {dropPreview && (
            <div style={{
              position: 'absolute', zIndex: 20, borderRadius: 8, pointerEvents: 'none',
              left: (dropPreview.col - 1) * CELL_W + 5,
              top:  (dropPreview.row - 1) * CELL_H + 5,
              width:  dropPreview.colSpan * CELL_W - 10,
              height: dropPreview.rowSpan * CELL_H - 10,
              background: dropPreview.canPlace ? 'var(--app-success-soft)' : 'var(--app-danger-soft)',
              border: `2px dashed ${dropPreview.canPlace ? 'var(--app-success)' : 'var(--app-danger)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: dropPreview.canPlace ? 'var(--app-success)' : 'var(--app-danger)', fontSize: 13, fontWeight: 600 }}>
                {dropPreview.canPlace ? '释放以放置' : '位置已占用'}
              </span>
            </div>
          )}

          {/* Placed components */}
          {items.map(item => {
            const def = componentDefs.find(d => d.id === item.defId);
            if (!def) return null;
            const Widget = WIDGET_MAP[item.defId] ?? (() => (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--app-surface)', color: 'var(--app-muted)', fontSize: 14 }}>{def.name}</div>
            ));
            const isSelected = selectedItemId === item.instanceId;

            return (
              <div
                key={item.instanceId}
                onClick={e => e.stopPropagation()}
                onMouseDown={e => startMove(e, item)}
                className="group"
                style={{
                  position: 'absolute',
                  left:   (item.col - 1) * CELL_W + 4,
                  top:    (item.row - 1) * CELL_H + 4,
                  width:  item.colSpan * CELL_W - 8,
                  height: item.rowSpan * CELL_H - 8,
                  borderRadius: 8, overflow: 'hidden',
                  cursor: isEditing ? 'grab' : 'default',
                  border: `2px solid ${isSelected ? 'var(--app-accent)' : 'transparent'}`,
                  boxShadow: isSelected
                    ? '0 0 0 3px color-mix(in srgb, var(--app-accent) 18%, transparent), 0 4px 20px var(--app-shadow-color)'
                    : '0 2px 10px var(--app-shadow-color)',
                  zIndex: isSelected ? 5 : 1,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              >
                {isEditing && (
                  <button
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); onRemoveItem(item.instanceId); }}
                    className="group-hover:opacity-100"
                    style={{
                      position: 'absolute', top: 10, right: 10, zIndex: 10,
                      opacity: 0, transition: 'opacity 0.15s',
                      width: 24, height: 24, borderRadius: 99,
                      background: 'var(--app-danger-soft)', color: 'var(--app-danger)',
                      border: '1px solid var(--app-danger-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
                <Widget />
                {isEditing && isSelected && (
                  <button
                    onMouseDown={e => startResize(e, item)}
                    aria-label="调整组件尺寸"
                    title="调整组件尺寸"
                    style={{
                      position: 'absolute',
                      right: 8,
                      bottom: 8,
                      zIndex: 12,
                      width: 28,
                      height: 28,
                      borderRadius: 9,
                      background: 'var(--app-brand)',
                      color: 'var(--app-surface)',
                      border: '1px solid color-mix(in srgb, var(--app-surface) 65%, transparent)',
                      boxShadow: '0 4px 12px var(--app-shadow-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'nwse-resize',
                    }}
                  >
                    <Maximize2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
