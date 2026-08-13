import { useLocation, useNavigate } from 'react-router';
import {
  ArrowLeft, Bell, Box, ClipboardCheck, Gauge, Layers3, Moon, PanelLeft, RotateCcw,
  Search, Settings2, Sun, TableProperties, Wrench,
} from 'lucide-react';
import '../../styles/business/manufacturing-system.css';
import { WorkOrderManager } from './WorkOrderManager';

const nav = [
  { key: 'orders', label: '工单管理', icon: ClipboardCheck },
  { key: 'tooling', label: '工装管理', icon: Wrench },
  { key: 'stations', label: '工作台管理', icon: Gauge },
  { key: 'base', label: '基础数据管理', icon: TableProperties },
  { key: 'settings', label: '系统配置', icon: Settings2 },
];

const MANUFACTURING_PATHS: Record<string, string> = {
  orders: '/manufacturing/work-orders',
  tooling: '/manufacturing/tooling',
  stations: '/manufacturing/stations',
  base: '/manufacturing/base-data',
  settings: '/manufacturing/settings',
};

function activeModuleFromPath(pathname: string) {
  const modulePath = pathname.split('/').filter(Boolean)[1];
  if (modulePath === 'tooling') return 'tooling';
  if (modulePath === 'stations') return 'stations';
  if (modulePath === 'base-data') return 'base';
  if (modulePath === 'settings') return 'settings';
  return 'orders';
}

export function ManufacturingSystem({
  onBack,
  themeMode,
  onThemeToggle,
}: {
  onBack: () => void;
  themeMode: 'light' | 'dark';
  onThemeToggle: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const active = activeModuleFromPath(location.pathname);
  const routeSegments = location.pathname.split('/').filter(Boolean);
  const routeOrderId = active === 'orders' && routeSegments[2] ? decodeURIComponent(routeSegments[2]) : null;
  const setActive = (key: string) => navigate(MANUFACTURING_PATHS[key] ?? MANUFACTURING_PATHS.orders);

  if (active !== 'orders') return (
    <div className="mfg-shell">
      <Sidebar active={active} onActive={setActive} onBack={onBack} />
      <div className="mfg-content-column">
        <ManufacturingTopBar themeMode={themeMode} onThemeToggle={onThemeToggle} />
        <main className="mfg-placeholder">
          <div className="mfg-placeholder__icon"><Layers3 size={28} /></div>
          <h1>{nav.find(item => item.key === active)?.label}</h1>
          <p>模块入口已就位，将在后续迭代中接入业务能力。</p>
          <button className="mfg-button mfg-button--primary" onClick={() => setActive('orders')}>先查看工单管理</button>
        </main>
      </div>
    </div>
  );

  return (
    <div className="mfg-shell">
      <Sidebar active={active} onActive={setActive} onBack={onBack} />
      <div className="mfg-content-column">
        <ManufacturingTopBar themeMode={themeMode} onThemeToggle={onThemeToggle} />
        <WorkOrderManager
          routeOrderId={routeOrderId}
          onRouteOrderChange={orderId => navigate(orderId ? `${MANUFACTURING_PATHS.orders}/${encodeURIComponent(orderId)}` : MANUFACTURING_PATHS.orders)}
        />
      </div>
    </div>
  );
}

function ManufacturingTopBar({ themeMode, onThemeToggle }: { themeMode: 'light' | 'dark'; onThemeToggle: () => void }) {
  return <header className="mfg-topbar">
    <button className="mfg-topbar__icon" aria-label="切换侧边栏" title="切换侧边栏"><PanelLeft size={17}/></button>
    <div className="mfg-topbar__actions">
      <label className="mfg-global-search"><Search size={15}/><input placeholder="Search"/><span>/</span></label>
      <button className="mfg-topbar__icon" onClick={onThemeToggle} aria-label="切换主题" title="切换主题">{themeMode === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}</button>
      <button className="mfg-topbar__icon" aria-label="刷新" title="刷新"><RotateCcw size={16}/></button>
      <button className="mfg-topbar__icon" aria-label="通知" title="通知"><Bell size={16}/></button>
    </div>
  </header>;
}

function Sidebar({ active, onActive, onBack }: { active: string; onActive: (key:string)=>void; onBack:()=>void }) {
  return <aside className="mfg-sidebar"><div className="mfg-brand"><div><Box size={17}/></div><span>智能制造<small>工单与生产管理</small></span></div>
    <nav>{nav.map(item => { const Icon = item.icon; return <button key={item.key} className={active === item.key ? 'is-active' : ''} onClick={() => onActive(item.key)}><Icon size={17}/>{item.label}{active === item.key && <span/>}</button>})}</nav>
    <div className="mfg-sidebar__footer"><button onClick={onBack}><ArrowLeft size={16}/>返回墨影工作台</button><div className="mfg-user"><b>RA</b><span>robot-admin<small>系统管理员</small></span></div></div>
  </aside>;
}
