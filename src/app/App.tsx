import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  ArrowLeft, Bell, Box, CheckCircle2, ChevronRight, Download, Eye, FileText,
  Folder, Home, LayoutGrid, Moon, Package, PanelLeft, Pencil, RotateCcw, Save, Search, Sun, Trash2, Users, Wand2,
} from 'lucide-react';
import { PanelList } from './components/PanelList';
import { ComponentLibrary } from './components/ComponentLibrary';
import { CanvasArea } from './components/CanvasArea';
import { PropertiesPanel } from './components/PropertiesPanel';
import { RobotModelManager } from './components/RobotModelManager';
import { ProductVersionManager } from './components/ProductVersionManager';
import { ArcoButton, ArcoIconButton, ArcoModal } from './components/ArcoLike';
import {
  type HomepageScheme, type PlacedItem,
  COMPONENT_DEFS, COMPONENT_PROPS, GRID_COLS, GRID_ROWS, CANVAS_W, CANVAS_H,
  INITIAL_SCHEMES, INITIAL_ITEMS, isFree,
} from './shared';

const FONT = "'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif";

type EditorNavKey = 'home' | 'status' | 'components' | 'records' | 'alerts' | 'settings' | 'apps' | 'products';
type AppThemeMode = 'light' | 'dark';

const ROBOT_THEME_STORAGE_KEY = 'robot-manager-theme-mode';

function initialRobotThemeMode(): AppThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.localStorage.getItem(ROBOT_THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

const EDITOR_NAV_META: Record<EditorNavKey, { label: string; description: string }> = {
  home: { label: '首页', description: '切换首页视图与基础信息' },
  status: { label: '设备状态', description: '管理现场设备与运行状态模块' },
  components: { label: '组件库', description: '选择并拖入首页画布' },
  records: { label: '记录', description: '查看任务记录与运行日志' },
  alerts: { label: '告警', description: '查看告警组件与消息配置' },
  settings: { label: '设置', description: '配置当前编辑器偏好' },
  apps: { label: '型号管理', description: '管理机器人型号、拓扑结构与模型导出' },
  products: { label: '版本管理', description: '产品包与版本迭代发布管理' },
};

// ── Global Top Bar ──────────────────────────────────────

function GlobalTopBar({
  themeMode = 'light',
  onThemeToggle,
}: {
  themeMode?: AppThemeMode;
  onThemeToggle?: () => void;
}) {
  const isDark = themeMode === 'dark';
  const barBg = isDark ? '#232324' : '#FFFFFF';
  const barBorder = isDark ? '#353537' : '#E5E6EB';
  const textColor = isDark ? '#C9CDD4' : '#4E5969';
  const hoverBg = isDark ? '#2E2E30' : '#F2F3F5';

  return (
    <header style={{
      height: 52,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: barBg,
      borderBottom: `1px solid ${barBorder}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ArcoIconButton
          type="text"
          size="small"
          icon={<PanelLeft size={17} />}
          aria-label="切换侧边栏"
          title="切换侧边栏"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ position: 'relative', width: 162, height: 34, display: 'block' }}>
          <Search size={15} color="var(--app-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            placeholder="Search"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 16,
              border: '1px solid var(--app-border)',
              background: 'var(--app-soft)',
              color: 'var(--app-heading)',
              padding: '0 34px 0 36px',
              outline: 'none',
              fontSize: 13,
              boxSizing: 'border-box',
            }}
          />
          <span style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--app-subtle)',
            border: '1px solid var(--app-border)',
            borderRadius: 8,
            height: 18,
            minWidth: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
          }}>
            /
          </span>
        </label>
        <button
          onClick={onThemeToggle}
          title={isDark ? '浅色模式' : '暗色模式'}
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: 'none', background: 'transparent', color: textColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <ArcoIconButton type="text" size="small" icon={<RotateCcw size={16} />} aria-label="刷新" title="刷新" />
        <ArcoIconButton type="text" size="small" icon={<Bell size={16} />} aria-label="通知" title="通知" />
      </div>
    </header>
  );
}

function EditorNavRail({
  active,
  onChange,
  themeMode = 'light',
}: {
  active: EditorNavKey;
  onChange: (key: EditorNavKey) => void;
  themeMode?: AppThemeMode;
}) {
  const isDark = themeMode === 'dark';
  const bg = isDark ? '#232324' : '#FFFFFF';
  const textColor = isDark ? '#C9CDD4' : '#4E5969';
  const mutedColor = isDark ? '#5E626A' : '#86909C';
  const hoverBg = isDark ? '#2E2E30' : '#F2F3F5';
  const activeBg = isDark ? '#1B2D4A' : '#E8F3FF';
  const activeColor = isDark ? '#4080FF' : '#2D2499';
  const borderColor = isDark ? '#353537' : '#E5E6EB';

  const navItems = [
    { key: 'home' as const, icon: Home, label: '首页自定义' },
    { key: 'apps' as const, icon: FileText, label: '型号模板' },
    { key: 'components' as const, icon: Folder, label: '组件库' },
    { key: 'records' as const, icon: LayoutGrid, label: '外设库' },
    { key: 'products' as const, icon: Package, label: '版本管理' },
    { key: 'status' as const, icon: Users, label: '用户管理' },
  ];

  function renderItem(key: EditorNavKey, Icon: typeof Home, label: string) {
    const isActive = active === key;
    return (
      <button
        key={key}
        onClick={() => onChange(key)}
        style={{
          width: '100%',
          height: 48,
          padding: '0 16px',
          borderRadius: 12,
          border: 'none',
          background: isActive ? activeBg : 'transparent',
          color: isActive ? activeColor : textColor,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: isActive ? 600 : 400,
          transition: 'all 0.15s ease',
          position: 'relative',
        }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = hoverBg; }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        {isActive && (
          <div style={{
            position: 'absolute', left: 0, top: 10, bottom: 10, width: 3,
            borderRadius: '0 4px 4px 0', background: activeColor,
          }} />
        )}
        <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <nav
      aria-label="编辑器模块切换"
      style={{
        width: 200,
        flexShrink: 0,
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        background: bg,
        borderRight: `1px solid ${borderColor}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, padding: '0 10px' }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          background: 'var(--app-accent)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Box size={17} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: isDark ? '#F2F3F5' : '#1D2129', fontSize: 14, fontWeight: 700, lineHeight: 1.25 }}>数字造机</div>
          <div style={{ color: mutedColor, fontSize: 10, marginTop: 2 }}>百川软件 · 版本管理中心</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {navItems.map(item => renderItem(item.key, item.icon, item.label))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px' }}>
        <div style={{ width: 24, height: 24, borderRadius: 99, background: 'var(--app-heading)', flexShrink: 0 }} />
        <span style={{ color: textColor, fontSize: 13, fontWeight: 500 }}>ByeWind</span>
      </div>
    </nav>
  );
}

function AppShell({
  active,
  themeMode,
  onThemeToggle,
  onNavChange,
  children,
}: {
  active: EditorNavKey;
  themeMode: AppThemeMode;
  onThemeToggle: () => void;
  onNavChange: (key: EditorNavKey) => void;
  children: ReactNode;
}) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        fontFamily: FONT,
        background: 'var(--app-bg)',
        overflow: 'hidden',
      }}>
        <EditorNavRail active={active} themeMode={themeMode} onChange={onNavChange} />
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <GlobalTopBar themeMode={themeMode} onThemeToggle={onThemeToggle} />
          <div style={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
            {children}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

function EditorPlaceholderPanel({
  active,
  onExit,
  onBackToComponents,
}: {
  active: Exclude<EditorNavKey, 'components'>;
  onExit: () => void;
  onBackToComponents: () => void;
}) {
  const meta = EDITOR_NAV_META[active];

  return (
    <div style={{
      width: 280,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      margin: '24px 0 24px 12px',
      background: 'var(--app-surface)',
      borderRadius: 16,
      border: '1px solid #E5E6EB',
      boxShadow: 'none',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #E5E6EB', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ArcoIconButton
            onClick={onExit}
            aria-label="返回"
            title="返回"
            type="text"
            size="small"
            icon={<ArrowLeft size={16} />}
          />
          <div style={{ color: 'var(--app-heading)', fontSize: 15, fontWeight: 600 }}>{meta.label}</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{
          borderRadius: 8, padding: '24px 20px',
          background: 'var(--app-soft)',
          border: '1px dashed #C9CDD4',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--app-text)', fontSize: 13, fontWeight: 500, margin: '0 0 6px' }}>{meta.label}</p>
          <p style={{ color: 'var(--app-muted)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{meta.description}</p>
        </div>
        <ArcoButton
          onClick={onBackToComponents}
          long
          size="large"
        >
          回到组件库
        </ArcoButton>
      </div>
    </div>
  );
}

function getSchemePageTitle(scheme: HomepageScheme) {
  const prefix = scheme.name
    .replace('复合机器人', '')
    .replace('搬运机器人', '')
    .replace('机器人', '')
    .trim();
  return `${prefix || scheme.name}自定义首页-01`;
}

function safeFileName(value: string) {
  return value
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'custom-homepage';
}

function DeleteHomepageDialog({
  scheme,
  open,
  onOpenChange,
  onConfirm,
}: {
  scheme: HomepageScheme | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <ArcoModal
      open={open}
      onOpenChange={onOpenChange}
      title="删除首页"
      status="danger"
      icon={<Trash2 size={16} />}
      width={360}
      footer={(
        <>
          <ArcoButton onClick={() => onOpenChange(false)}>取消</ArcoButton>
          <ArcoButton type="primary" status="danger" onClick={onConfirm}>删除</ArcoButton>
        </>
      )}
    >
      <p style={{ color: 'var(--app-muted)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
        确认删除「{scheme?.name ?? '当前首页'}」吗？该首页的组件布局与属性配置会一起移除。
      </p>
    </ArcoModal>
  );
}

function EditToolbar({
  scheme,
  saveState,
  onAutoFill,
  onPreview,
  onSave,
}: {
  scheme?: HomepageScheme;
  saveState: 'idle' | 'saved';
  onAutoFill: () => void;
  onPreview: () => void;
  onSave: () => void;
}) {
  if (!scheme) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      padding: '12px 24px',
      flexShrink: 0,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <span style={{ color: 'var(--app-muted)', fontSize: 12 }}>首页</span>
        <ChevronRight size={11} color="#C9CDD4" />
        <span style={{ color: 'var(--app-heading)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getSchemePageTitle(scheme)}
        </span>
        <span style={{
          background: 'var(--app-accent-soft)', color: 'var(--app-accent)',
          fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 99, flexShrink: 0,
        }}>
          {scheme.version}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ color: 'var(--app-muted)', fontSize: 11 }}>上次编辑 {scheme.lastEdited}</span>
        <ArcoButton onClick={onPreview} icon={<Eye size={13} />}>
          预览
        </ArcoButton>
        <ArcoButton onClick={onAutoFill} icon={<Wand2 size={13} />}>
          自动填补
        </ArcoButton>
        <ArcoButton
          onClick={onSave}
          type={saveState === 'saved' ? 'default' : 'primary'}
          status={saveState === 'saved' ? 'success' : 'normal'}
          icon={saveState === 'saved' ? <CheckCircle2 size={13} /> : <Save size={13} />}
        >
          {saveState === 'saved' ? '已保存' : '保存'}
        </ArcoButton>
      </div>
    </div>
  );
}

function defaultConfig(defId: string): Record<string, string | number | boolean> {
  const cfg: Record<string, string | number | boolean> = {};
  for (const f of COMPONENT_PROPS[defId] ?? []) {
    if (f.type !== 'section') cfg[f.key] = f.default;
  }
  return cfg;
}

function clampGridSize(item: PlacedItem, colSpan: number, rowSpan: number) {
  return {
    colSpan: Math.min(Math.max(1, colSpan), GRID_COLS - item.col + 1),
    rowSpan: Math.min(Math.max(1, rowSpan), GRID_ROWS - item.row + 1),
  };
}

function fillEmptySpaces(items: PlacedItem[]): PlacedItem[] {
  const updated = items.map(item => ({ ...item }));
  let changed = true;

  while (changed) {
    changed = false;

    for (const item of updated) {
      if (
        item.col + item.colSpan <= GRID_COLS &&
        isFree(updated, item.col + item.colSpan, item.row, 1, item.rowSpan, item.instanceId)
      ) {
        item.colSpan += 1;
        changed = true;
        break;
      }

      if (
        item.col > 1 &&
        isFree(updated, item.col - 1, item.row, 1, item.rowSpan, item.instanceId)
      ) {
        item.col -= 1;
        item.colSpan += 1;
        changed = true;
        break;
      }

      if (
        item.row + item.rowSpan <= GRID_ROWS &&
        isFree(updated, item.col, item.row + item.rowSpan, item.colSpan, 1, item.instanceId)
      ) {
        item.rowSpan += 1;
        changed = true;
        break;
      }

      if (
        item.row > 1 &&
        isFree(updated, item.col, item.row - 1, item.colSpan, 1, item.instanceId)
      ) {
        item.row -= 1;
        item.rowSpan += 1;
        changed = true;
        break;
      }
    }
  }

  return updated;
}

export default function App() {
  const [schemes, setSchemes] = useState<HomepageScheme[]>(INITIAL_SCHEMES);
  const [activeSchemeId, setActiveSchemeId] = useState('s1');
  const [canvasItems, setCanvasItems] = useState<Record<string, PlacedItem[]>>(INITIAL_ITEMS);
  const [isEditing, setIsEditing] = useState(false);
  const [isCanvasPreview, setIsCanvasPreview] = useState(false);
  const [activeEditorNav, setActiveEditorNav] = useState<EditorNavKey>('home');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [robotThemeMode, setRobotThemeMode] = useState<AppThemeMode>(initialRobotThemeMode);

  const toggleRobotThemeMode = useCallback(() => {
    setRobotThemeMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ROBOT_THEME_STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  // Inject global dark/light CSS variables
  useEffect(() => {
    const vars: Record<string, string> = robotThemeMode === 'dark' ? {
      '--app-bg': '#17171A',
      '--app-surface': '#232324',
      '--app-border': '#353537',
      '--app-border-strong': '#484849',
      '--app-heading': '#F2F3F5',
      '--app-text': '#C9CDD4',
      '--app-muted': '#86909C',
      '--app-subtle': '#5E626A',
      '--app-soft': '#2E2E30',
      '--app-accent': '#4080FF',
      '--app-accent-soft': '#1B2D4A',
      '--app-accent-border': '#2B4A7A',
      '--app-success': '#27C346',
      '--app-success-soft': '#1A3520',
      '--app-danger': '#F76965',
      '--app-danger-soft': '#3A211F',
      '--app-danger-border': '#6B3630',
    } : {
      '--app-bg': '#F2F3F5',
      '--app-surface': '#FFFFFF',
      '--app-border': '#E5E6EB',
      '--app-border-strong': '#C9CDD4',
      '--app-heading': '#1D2129',
      '--app-text': '#4E5969',
      '--app-muted': '#86909C',
      '--app-subtle': '#C9CDD4',
      '--app-soft': '#F7F8FA',
      '--app-accent': '#165DFF',
      '--app-accent-soft': '#E8F3FF',
      '--app-accent-border': '#BEDAFF',
      '--app-success': '#00B42A',
      '--app-success-soft': '#E8FFEA',
      '--app-danger': '#F53F3F',
      '--app-danger-soft': '#FFECE8',
      '--app-danger-border': '#FFBBAE',
    };
    Object.entries(vars).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
  }, [robotThemeMode]);

  const activeScheme = schemes.find(s => s.id === activeSchemeId);
  const activeItems = canvasItems[activeSchemeId] ?? [];
  const selectedItem = activeItems.find(i => i.instanceId === selectedItemId) ?? null;
  const deleteTarget = schemes.find(s => s.id === deleteTargetId) ?? null;
  const canDeleteScheme = schemes.length > 1;

  const handleSelectScheme = useCallback((id: string) => {
    setActiveSchemeId(id);
    setIsEditing(false);
    setIsCanvasPreview(false);
    setActiveEditorNav('home');
    setSelectedItemId(null);
  }, []);

  const handleSchemesChange = useCallback((next: HomepageScheme[]) => {
    setSchemes(next);
    if (!next.find(s => s.id === activeSchemeId) && next.length > 0) {
      setActiveSchemeId(next[0].id);
      setIsEditing(false);
      setIsCanvasPreview(false);
      setActiveEditorNav('home');
    }
  }, [activeSchemeId]);

  const createScheme = useCallback(() => {
    const id = `s-${Date.now()}`;
    const next: HomepageScheme = { id, name: '新建首页', version: 'V1', lastEdited: '刚刚' };
    setSchemes(prev => [...prev, next]);
    setCanvasItems(prev => ({ ...prev, [id]: [] }));
    setActiveSchemeId(id);
    setIsEditing(false);
    setIsCanvasPreview(false);
    setActiveEditorNav('home');
    setSelectedItemId(null);
  }, []);

  const copyScheme = useCallback((id: string) => {
    const source = schemes.find(s => s.id === id);
    if (!source) return;
    const nextId = `s-${Date.now()}`;
    const copy: HomepageScheme = { ...source, id: nextId, name: `${source.name} 副本`, lastEdited: '刚刚' };
    setSchemes(prev => [...prev, copy]);
    setCanvasItems(prev => ({
      ...prev,
      [nextId]: (prev[id] ?? []).map((item, index) => ({
        ...item,
        instanceId: `${item.instanceId}-copy-${Date.now()}-${index}`,
        config: { ...item.config },
      })),
    }));
    setActiveSchemeId(nextId);
    setIsEditing(false);
    setIsCanvasPreview(false);
    setActiveEditorNav('home');
    setSelectedItemId(null);
  }, [schemes]);

  const requestDeleteScheme = useCallback((id: string) => {
    if (schemes.length <= 1) return;
    setDeleteTargetId(id);
  }, [schemes.length]);

  const deleteScheme = useCallback((id: string) => {
    if (schemes.length <= 1) return;
    const deleteIndex = schemes.findIndex(s => s.id === id);
    const nextSchemes = schemes.filter(s => s.id !== id);
    const fallbackIndex = Math.max(0, deleteIndex - 1);
    const nextActiveId = id === activeSchemeId
      ? nextSchemes[fallbackIndex]?.id ?? nextSchemes[0]?.id
      : activeSchemeId;

    setSchemes(nextSchemes);
    setCanvasItems(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (nextActiveId) setActiveSchemeId(nextActiveId);
    setIsEditing(false);
    setIsCanvasPreview(false);
    setActiveEditorNav('home');
    setSelectedItemId(null);
  }, [activeSchemeId, schemes]);

  const confirmDeleteScheme = useCallback(() => {
    if (!deleteTargetId) return;
    deleteScheme(deleteTargetId);
    setDeleteTargetId(null);
  }, [deleteScheme, deleteTargetId]);

  const exportScheme = useCallback((id: string) => {
    const scheme = schemes.find(s => s.id === id);
    if (!scheme) return;

    const payload = {
      type: 'custom-dashboard-homepage',
      version: 1,
      exportedAt: new Date().toISOString(),
      canvas: {
        width: CANVAS_W,
        height: CANVAS_H,
        grid: {
          columns: GRID_COLS,
          rows: GRID_ROWS,
        },
      },
      scheme,
      items: canvasItems[id] ?? [],
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeFileName(getSchemePageTitle(scheme))}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [canvasItems, schemes]);

  const addItem = useCallback((defId: string, col: number, row: number) => {
    const def = COMPONENT_DEFS.find(d => d.id === defId);
    if (!def) return;
    const newItem: PlacedItem = {
      instanceId: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      defId, col, row,
      colSpan: def.colSpan, rowSpan: def.rowSpan,
      config: defaultConfig(defId),
    };
    setCanvasItems(prev => ({ ...prev, [activeSchemeId]: [...(prev[activeSchemeId] ?? []), newItem] }));
  }, [activeSchemeId]);

  const removeItem = useCallback((instanceId: string) => {
    setCanvasItems(prev => ({
      ...prev,
      [activeSchemeId]: (prev[activeSchemeId] ?? []).filter(i => i.instanceId !== instanceId),
    }));
    if (selectedItemId === instanceId) setSelectedItemId(null);
  }, [activeSchemeId, selectedItemId]);

  const updateItemConfig = useCallback((instanceId: string, key: string, value: string | number | boolean) => {
    setCanvasItems(prev => ({
      ...prev,
      [activeSchemeId]: (prev[activeSchemeId] ?? []).map(item =>
        item.instanceId === instanceId
          ? { ...item, config: { ...item.config, [key]: value } }
          : item
      ),
    }));
  }, [activeSchemeId]);

  const moveItem = useCallback((instanceId: string, col: number, row: number) => {
    setCanvasItems(prev => {
      const items = prev[activeSchemeId] ?? [];
      const item = items.find(i => i.instanceId === instanceId);
      if (!item) return prev;
      const nextCol = Math.min(Math.max(1, col), GRID_COLS - item.colSpan + 1);
      const nextRow = Math.min(Math.max(1, row), GRID_ROWS - item.rowSpan + 1);
      if (!isFree(items, nextCol, nextRow, item.colSpan, item.rowSpan, instanceId)) return prev;
      return {
        ...prev,
        [activeSchemeId]: items.map(i => i.instanceId === instanceId ? { ...i, col: nextCol, row: nextRow } : i),
      };
    });
  }, [activeSchemeId]);

  const updateItemSize = useCallback((instanceId: string, colSpan: number, rowSpan: number) => {
    setCanvasItems(prev => {
      const items = prev[activeSchemeId] ?? [];
      const item = items.find(i => i.instanceId === instanceId);
      if (!item) return prev;
      const next = clampGridSize(item, colSpan, rowSpan);
      if (!isFree(items, item.col, item.row, next.colSpan, next.rowSpan, instanceId)) return prev;
      return {
        ...prev,
        [activeSchemeId]: items.map(i => i.instanceId === instanceId ? { ...i, ...next } : i),
      };
    });
  }, [activeSchemeId]);

  const autoFill = useCallback(() => {
    setCanvasItems(prev => ({
      ...prev,
      [activeSchemeId]: fillEmptySpaces(prev[activeSchemeId] ?? []),
    }));
  }, [activeSchemeId, canvasItems]);

  const handleSave = useCallback(() => {
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 2200);
  }, []);

  const handleShellNavChange = useCallback((key: EditorNavKey) => {
    setSelectedItemId(null);
    setIsCanvasPreview(false);

    if (key === 'components') {
      setIsEditing(true);
      setActiveEditorNav('components');
      return;
    }

    setIsEditing(false);
    setActiveEditorNav(key);
  }, []);

  if (!isCanvasPreview && activeEditorNav === 'apps') {
    return (
      <AppShell
        active={activeEditorNav}
        themeMode={robotThemeMode}
        onThemeToggle={toggleRobotThemeMode}
        onNavChange={handleShellNavChange}
      >
        <RobotModelManager themeMode={robotThemeMode} />
      </AppShell>
    );
  }

  if (!isCanvasPreview && activeEditorNav === 'products') {
    return (
      <AppShell
        active={activeEditorNav}
        themeMode={robotThemeMode}
        onThemeToggle={toggleRobotThemeMode}
        onNavChange={handleShellNavChange}
      >
        <ProductVersionManager />
      </AppShell>
    );
  }

  // ── Edit mode ─────────────────────────────────────────
  if (isEditing) {
    return (
      <AppShell
        active={activeEditorNav}
        themeMode={robotThemeMode}
        onThemeToggle={toggleRobotThemeMode}
        onNavChange={handleShellNavChange}
      >
        <div style={{ height: '100%', display: 'flex', minHeight: 0, background: 'var(--app-bg)' }}>
          {!isCanvasPreview && (
            <>
              {activeEditorNav === 'components' ? (
                <ComponentLibrary
                  onExit={() => { setIsEditing(false); setIsCanvasPreview(false); setActiveEditorNav('home'); setSelectedItemId(null); }}
                />
              ) : (
                <EditorPlaceholderPanel
                  active={activeEditorNav}
                  onExit={() => { setIsEditing(false); setIsCanvasPreview(false); setActiveEditorNav('home'); setSelectedItemId(null); }}
                  onBackToComponents={() => setActiveEditorNav('components')}
                />
              )}
            </>
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
            {!isCanvasPreview && (
              <EditToolbar
                scheme={activeScheme}
                saveState={saveState}
                onAutoFill={autoFill}
                onPreview={() => { setSelectedItemId(null); setIsCanvasPreview(true); }}
                onSave={handleSave}
              />
            )}
            <CanvasArea
              items={activeItems}
              isEditing={!isCanvasPreview}
              selectedItemId={isCanvasPreview ? null : selectedItemId}
              onSelectItem={isCanvasPreview ? () => {} : setSelectedItemId}
              onAddItem={addItem}
              onMoveItem={moveItem}
              onResizeItem={updateItemSize}
              onRemoveItem={removeItem}
            />
            {isCanvasPreview && (
              <button
                onClick={() => setIsCanvasPreview(false)}
                style={{
                  position: 'fixed',
                  left: '50%',
                  bottom: 24,
                  transform: 'translateX(-50%)',
                  zIndex: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 22px',
                  borderRadius: 99,
                  background: 'var(--app-heading)',
                  color: 'var(--app-surface)',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={15} />退出预览
              </button>
            )}
          </div>
          {!isCanvasPreview && (
            <PropertiesPanel
              item={selectedItem}
              onUpdateConfig={updateItemConfig}
              onUpdateSize={updateItemSize}
              onRemove={removeItem}
              onClose={() => setSelectedItemId(null)}
            />
          )}
          <DeleteHomepageDialog
            scheme={deleteTarget}
            open={deleteTargetId !== null}
            onOpenChange={open => { if (!open) setDeleteTargetId(null); }}
            onConfirm={confirmDeleteScheme}
          />
        </div>
      </AppShell>
    );
  }

  // ── Preview mode ──────────────────────────────────────
  return (
    <AppShell
      active={activeEditorNav}
      themeMode={robotThemeMode}
      onThemeToggle={toggleRobotThemeMode}
      onNavChange={handleShellNavChange}
    >
      <div style={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        gap: 16,
        padding: 16,
        background: 'var(--app-bg)',
        overflow: 'hidden',
      }}>
        {activeEditorNav === 'home' ? (
          <PanelList
            schemes={schemes}
            activeSchemeId={activeSchemeId}
            onSelectScheme={handleSelectScheme}
            onSchemesChange={handleSchemesChange}
            onCreateScheme={createScheme}
            onCopyScheme={copyScheme}
            onRequestDeleteScheme={requestDeleteScheme}
            onExportScheme={exportScheme}
          />
        ) : (
          <EditorPlaceholderPanel
            active={activeEditorNav}
            onExit={() => setActiveEditorNav('home')}
            onBackToComponents={() => {
              setIsEditing(true);
              setIsCanvasPreview(false);
              setActiveEditorNav('components');
            }}
          />
        )}

        <main style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: 24,
          borderRadius: 16,
          background: 'var(--app-surface)',
          border: '1px solid var(--app-border)',
          overflow: 'hidden',
        }}>
          {activeScheme && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 20,
              marginBottom: 20,
              flexShrink: 0,
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, marginBottom: 8 }}>
                  <h1 style={{
                    color: 'var(--app-heading)',
                    fontSize: 20,
                    fontWeight: 600,
                    lineHeight: 1.25,
                    margin: 0,
                    flexShrink: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {getSchemePageTitle(activeScheme)}
                  </h1>
                  <span style={{
                    flexShrink: 0,
                    background: 'var(--app-accent-soft)',
                    color: 'var(--app-accent)',
                    border: '1px solid var(--app-accent-border)',
                    fontSize: 12,
                    fontWeight: 500,
                    padding: '3px 8px',
                    borderRadius: 99,
                  }}>
                    {activeScheme.name} · {activeScheme.version}
                  </span>
                </div>
                <p style={{ color: 'var(--app-muted)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                  根据现场任务和设备状态搭建首页
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <ArcoButton
                  onClick={() => requestDeleteScheme(activeScheme.id)}
                  disabled={!canDeleteScheme}
                  status="danger"
                  icon={<Trash2 size={14} />}
                >
                  删除
                </ArcoButton>
                <ArcoButton
                  onClick={() => exportScheme(activeScheme.id)}
                  icon={<Download size={14} />}
                >
                  导出面板
                </ArcoButton>
                <ArcoButton
                  onClick={() => { setIsEditing(true); setIsCanvasPreview(false); setActiveEditorNav('components'); }}
                  type="primary"
                  icon={<Pencil size={14} />}
                >
                  编辑面板
                </ArcoButton>
              </div>
            </div>
          )}

          <div style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            borderRadius: 16,
            border: '1px solid var(--app-border-strong)',
            background: 'var(--app-bg)',
            overflow: 'hidden',
          }}>
            <CanvasArea
              items={activeItems}
              isEditing={false}
              selectedItemId={null}
              onSelectItem={() => {}}
              onAddItem={() => {}}
              onMoveItem={() => {}}
              onResizeItem={() => {}}
              onRemoveItem={() => {}}
            />
          </div>

          <DeleteHomepageDialog
            scheme={deleteTarget}
            open={deleteTargetId !== null}
            onOpenChange={open => { if (!open) setDeleteTargetId(null); }}
            onConfirm={confirmDeleteScheme}
          />
        </main>
      </div>
    </AppShell>
  );
}
