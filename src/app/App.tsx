import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Activity, ArrowLeft, ArrowRight, Bell, Box, CheckCircle2, ChevronRight, ClipboardList, Clock3, Cpu, Download, Eye, FileKey2, FileText,
  Home, LogOut, Moon, Package, PanelLeft, Pencil, RotateCcw, Save, Search, ShieldCheck, Sun, Trash2, User, Wand2,
} from 'lucide-react';
import { PanelList } from './components/PanelList';
import { ComponentLibrary } from './components/ComponentLibrary';
import { CanvasArea } from './components/CanvasArea';
import { PropertiesPanel } from './components/PropertiesPanel';
import { RobotComponentLibrary, RobotModelManager } from './components/RobotModelManager';
import { ProductVersionManager } from './components/ProductVersionManager';
import { SoftwareManager } from './components/SoftwareManager';
import { InstallationRecordsManager } from './components/InstallationRecordsManager';
import { WorkspaceLogin as WorkspaceLoginScreen } from './components/WorkspaceLogin';
import { INITIAL_SOFTWARE_PRODUCTS, type SoftwareProduct } from './softwareProducts';
import { useComponentCatalog } from './components/useComponentCatalog';
import { ArcoButton, ArcoIconButton, ArcoModal, ArcoTag } from './components/HeroUI';
import { APP_THEME_VARS, type ThemeMode } from './theme';
import {
  type HomepageScheme, type PlacedItem,
  COMPONENT_PROPS, GRID_COLS, GRID_ROWS, CANVAS_W, CANVAS_H,
  INITIAL_SCHEMES, INITIAL_ITEMS, isFree,
} from './shared';

const FONT = "'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif";

type EditorNavKey = 'home' | 'status' | 'components' | 'records' | 'alerts' | 'settings' | 'apps' | 'products' | 'software' | 'installations';
type AppThemeMode = ThemeMode;
type WorkspaceProduct = 'login' | 'workspace' | 'software' | 'authorization' | 'machine';

const ROBOT_THEME_STORAGE_KEY = 'robot-manager-theme-mode';

function initialRobotThemeMode(): AppThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.localStorage.getItem(ROBOT_THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

const WORKSPACE_PRODUCTS = [
  {
    key: 'software' as const,
    icon: Package,
    eyebrow: 'Software',
    title: '软件管理',
    description: '统一管理软件包、产品版本、测试包与发布流程。',
    meta: '版本与制品',
  },
  {
    key: 'authorization' as const,
    icon: ShieldCheck,
    eyebrow: 'License',
    title: '授权平台',
    description: '集中配置产品授权、许可策略与设备使用权限。',
    meta: '许可与权限',
  },
  {
    key: 'machine' as const,
    icon: Box,
    eyebrow: 'Digital Machine',
    title: '数字造机',
    description: '配置机器人型号、组件生态与自定义运行面板。',
    meta: '型号与工作台',
  },
];

function WorkspaceLauncher({
  themeMode,
  onThemeToggle,
  onReturnLogin,
  onOpen,
}: {
  themeMode: AppThemeMode;
  onThemeToggle: () => void;
  onReturnLogin: () => void;
  onOpen: (product: Exclude<WorkspaceProduct, 'workspace' | 'login'>) => void;
}) {
  const isDark = themeMode === 'dark';

  return (
    <div className="workspace-launcher">
      <style>{`
        .workspace-launcher {
          width: 100%;
          height: 100%;
          min-height: 0;
          overflow: auto;
          background: var(--app-bg);
          color: var(--app-heading);
          font-family: ${FONT};
        }
        .workspace-launcher__header {
          height: 64px;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          border-bottom: 1px solid var(--app-border);
          background: var(--app-surface);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .workspace-launcher__main {
          width: min(1180px, calc(100% - 48px));
          min-height: calc(100% - 64px);
          margin: 0 auto;
          padding: 44px 0 40px;
          box-sizing: border-box;
        }
        .workspace-launcher__grid {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          grid-template-rows: repeat(2, minmax(180px, 1fr));
          gap: 16px;
          margin-top: 28px;
        }
        .workspace-product {
          padding: 24px;
          border: 1px solid var(--app-border);
          border-radius: 16px;
          background: var(--app-surface);
          color: var(--app-heading);
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
        }
        .workspace-product--primary {
          grid-column: span 7;
          grid-row: span 2;
          min-height: 404px;
          padding: 28px;
          border-color: var(--app-border);
          background: var(--app-surface);
          color: var(--app-heading);
          overflow: hidden;
          position: relative;
        }
        .workspace-product--secondary {
          grid-column: span 5;
          min-height: 194px;
        }
        .workspace-product:hover {
          border-color: var(--app-accent-border);
          box-shadow: 0 8px 24px var(--app-shadow-color);
        }
        .workspace-product--primary:hover {
          border-color: var(--app-accent-border);
          box-shadow: 0 12px 32px var(--app-shadow-color);
        }
        .workspace-product:focus-visible,
        .workspace-icon-button:focus-visible {
          outline: 3px solid var(--app-accent-soft);
          outline-offset: 2px;
        }
        .workspace-machine-visual {
          position: absolute;
          right: 24px;
          bottom: 26px;
          width: 46%;
          height: 58%;
          border: 1px solid var(--app-scene-border);
          border-radius: 16px;
          background: var(--app-scene);
          overflow: hidden;
        }
        .workspace-primary-content {
          position: relative;
          z-index: 1;
          width: 52%;
          min-width: 260px;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .workspace-primary-entry {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--app-accent);
          font-size: 14px;
          font-weight: 650;
        }
        .workspace-machine-axis {
          position: absolute;
          left: 20px;
          bottom: 20px;
          width: 52px;
          height: 1px;
          background: var(--app-danger);
        }
        .workspace-machine-axis::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 1px;
          height: 40px;
          background: var(--app-success);
        }
        .workspace-machine-body {
          position: absolute;
          left: 50%;
          bottom: 38px;
          width: 74px;
          height: 62px;
          margin-left: -37px;
          border: 1px solid var(--app-accent-border);
          border-radius: 8px;
          background: var(--app-accent-soft);
        }
        .workspace-machine-arm {
          position: absolute;
          left: calc(50% + 7px);
          bottom: 96px;
          width: 18px;
          height: 70px;
          border-radius: 8px;
          background: var(--app-brand);
          transform: rotate(23deg);
          transform-origin: bottom center;
        }
        .workspace-machine-arm::after {
          content: "";
          position: absolute;
          left: 2px;
          top: -48px;
          width: 14px;
          height: 56px;
          border-radius: 8px;
          background: var(--app-accent);
          transform: rotate(34deg);
          transform-origin: bottom center;
        }
        .workspace-machine-floor {
          position: absolute;
          left: 14%;
          right: 14%;
          bottom: 37px;
          height: 1px;
          background: var(--app-scene-border);
          box-shadow: 0 -36px 0 var(--app-neutral-soft), 0 -72px 0 var(--app-surface), 0 -108px 0 var(--app-soft);
        }
        .workspace-product__footer {
          margin-top: auto;
          padding-top: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: var(--app-accent);
          font-size: 14px;
          font-weight: 600;
        }
        .workspace-recent {
          margin-top: 16px;
          padding: 14px 18px;
          border: 1px solid var(--app-border);
          border-radius: 16px;
          background: var(--app-surface);
          display: flex;
          align-items: center;
          gap: 16px;
          color: var(--app-text);
          font-size: 14px;
        }
        @media (max-width: 860px) {
          .workspace-launcher__grid {
            grid-template-columns: 1fr;
            grid-template-rows: none;
          }
          .workspace-product--primary,
          .workspace-product--secondary {
            grid-column: auto;
            grid-row: auto;
          }
          .workspace-product--primary { min-height: 360px; }
          .workspace-product--secondary { min-height: 190px; }
          .workspace-launcher__main { padding-top: 36px; }
        }
        @media (max-width: 520px) {
          .workspace-launcher__header { height: 56px; padding: 0 16px; }
          .workspace-launcher__main {
            width: calc(100% - 32px);
            min-height: calc(100% - 56px);
            padding: 36px 0 32px;
          }
          .workspace-launcher__grid { margin-top: 28px; }
          .workspace-product--primary { min-height: 500px; }
          .workspace-primary-content {
            position: static;
            width: 100%;
            min-width: 0;
            height: auto;
          }
          .workspace-primary-entry {
            position: absolute;
            left: 28px;
            bottom: 220px;
          }
          .workspace-machine-visual {
            left: 20px;
            right: 20px;
            bottom: 20px;
            width: auto;
            height: 180px;
          }
          .workspace-recent { align-items: flex-start; }
        }
        @media (prefers-reduced-motion: reduce) {
          .workspace-product { transition: none; }
        }
      `}</style>

      <header className="workspace-launcher__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--app-brand)',
            color: '#FFFFFF',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}>
            <Box size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>墨影工作台</div>
            <div style={{ marginTop: 2, color: 'var(--app-muted)', fontSize: 12 }}>产品与设备开发中心</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArcoButton icon={<LogOut size={14} />} onClick={onReturnLogin}>返回登录</ArcoButton>
          <button
            className="workspace-icon-button"
            onClick={onThemeToggle}
            title={isDark ? '切换为浅色模式' : '切换为暗色模式'}
            aria-label={isDark ? '切换为浅色模式' : '切换为暗色模式'}
            style={{
              width: 40,
              height: 40,
              border: '1px solid var(--app-border)',
              borderRadius: 8,
              background: 'var(--app-surface)',
              color: 'var(--app-text)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      <main className="workspace-launcher__main">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
          <div style={{ maxWidth: 660 }}>
            <div style={{
              color: 'var(--app-accent)',
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1.5,
              marginBottom: 10,
            }}>
              MOYING WORKBENCH
            </div>
            <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.25, fontWeight: 700, letterSpacing: 0 }}>
              上午好，robot-admin
            </h1>
            <p style={{ margin: '12px 0 0', color: 'var(--app-text)', fontSize: 14, lineHeight: 1.7 }}>
              从一个工作台进入软件、授权与数字造机能力。
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 10px',
            borderRadius: 8,
            border: '1px solid var(--app-border)',
            background: 'var(--app-surface)',
            color: 'var(--app-text)',
            fontSize: 12,
            flexShrink: 0,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--app-success)' }} />
            所有服务运行正常
          </div>
        </div>

        <div className="workspace-launcher__grid" aria-label="工作空间列表">
          <button className="workspace-product workspace-product--primary" onClick={() => onOpen('machine')} aria-label="进入数字造机">
            <div className="workspace-primary-content">
              <div style={{
                width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center',
                color: '#FFFFFF', background: 'var(--app-brand)', border: '1px solid var(--app-accent-border)',
              }}>
                <Cpu size={21} />
              </div>
              <div style={{ marginTop: 28, color: 'var(--app-muted)', fontSize: 12, fontWeight: 700 }}>DIGITAL MACHINE</div>
              <h2 style={{ margin: '7px 0 0', fontSize: 24, lineHeight: 1.3, fontWeight: 700 }}>数字造机</h2>
              <p style={{ margin: '12px 0 0', color: 'var(--app-text)', fontSize: 14, lineHeight: 1.7 }}>
                从机器人型号、三维模型到组件生态与运行面板，完成数字设备配置。
              </p>
              <div className="workspace-primary-entry">
                进入工作空间 <ArrowRight size={16} />
              </div>
            </div>
            <div className="workspace-machine-visual" aria-hidden="true">
              <div className="workspace-machine-floor" />
              <div className="workspace-machine-axis" />
              <div className="workspace-machine-body" />
              <div className="workspace-machine-arm" />
              <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--app-scene-muted)', fontSize: 10 }}>
                <Activity size={12} color="var(--app-success)" /> MCR-01 · ONLINE
              </div>
            </div>
          </button>

          {WORKSPACE_PRODUCTS.filter(product => product.key !== 'machine').map(product => {
            const Icon = product.icon;
            return (
              <button key={product.key} className="workspace-product workspace-product--secondary" onClick={() => onOpen(product.key)} aria-label={`进入${product.title}`}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center',
                    color: 'var(--app-accent)', background: 'var(--app-accent-soft)', border: '1px solid var(--app-accent-border)',
                  }}>
                    <Icon size={19} />
                  </div>
                  <ArrowRight size={16} color="var(--app-muted)" />
                </div>
                <div style={{ marginTop: 20 }}>
                  <div style={{ color: 'var(--app-muted)', fontSize: 10, fontWeight: 700 }}>{product.eyebrow.toUpperCase()}</div>
                  <h2 style={{ margin: '5px 0 0', fontSize: 18, lineHeight: 1.35, fontWeight: 650 }}>{product.title}</h2>
                  <p style={{ margin: '8px 0 0', color: 'var(--app-text)', fontSize: 14, lineHeight: 1.6 }}>{product.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="workspace-recent">
          <Clock3 size={16} color="var(--app-accent)" style={{ flexShrink: 0 }} />
          <span style={{ color: 'var(--app-muted)', flexShrink: 0 }}>最近访问</span>
          <strong style={{ color: 'var(--app-heading)', fontWeight: 600 }}>MCR复合机器人 · 软件版本 2.1.0</strong>
          <span style={{ flex: 1 }} />
          <span style={{ color: 'var(--app-muted)', flexShrink: 0 }}>今天 09:42</span>
        </div>
      </main>
    </div>
  );
}

function WorkspaceLogin({
  themeMode,
  onThemeToggle,
  onLogin,
}: {
  themeMode: AppThemeMode;
  onThemeToggle: () => void;
  onLogin: () => void;
}) {
  const isDark = themeMode === 'dark';
  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: 0,
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      boxSizing: 'border-box',
      background: 'var(--app-bg)',
      color: 'var(--app-heading)',
      fontFamily: FONT,
      position: 'relative',
    }}>
      <button
        onClick={onThemeToggle}
        title={isDark ? '切换为浅色模式' : '切换为暗色模式'}
        aria-label={isDark ? '切换为浅色模式' : '切换为暗色模式'}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          border: '1px solid var(--app-border)',
          borderRadius: 8,
          background: 'var(--app-surface)',
          color: 'var(--app-text)',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
        }}
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      <main style={{
        width: 'min(400px, 100%)',
        padding: 32,
        borderRadius: 16,
        border: '1px solid var(--app-border)',
        background: 'var(--app-surface)',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          display: 'grid',
          placeItems: 'center',
          color: '#FFFFFF',
          background: 'var(--app-brand)',
        }}>
          <Box size={21} />
        </div>
        <h1 style={{ margin: '24px 0 0', fontSize: 24, lineHeight: 1.35, fontWeight: 700 }}>登录墨影工作台</h1>
        <p style={{ margin: '8px 0 24px', color: 'var(--app-muted)', fontSize: 14, lineHeight: 1.65 }}>
          使用工作台账号进入产品与设备开发中心。
        </p>
        <form
          onSubmit={event => {
            event.preventDefault();
            onLogin();
          }}
        >
          <label htmlFor="workspace-account" style={{ display: 'block', color: 'var(--app-text)', fontSize: 14, fontWeight: 600 }}>
            账号
          </label>
          <div style={{ position: 'relative', marginTop: 8 }}>
            <User size={15} color="var(--app-muted)" style={{ position: 'absolute', left: 12, top: 12, pointerEvents: 'none' }} />
            <input
              id="workspace-account"
              autoComplete="username"
              defaultValue="robot-admin"
              style={{
                width: '100%',
                height: 40,
                padding: '0 12px 0 36px',
                borderRadius: 8,
                border: '1px solid var(--app-border)',
                background: 'var(--app-soft)',
                color: 'var(--app-heading)',
                outline: 'none',
                boxSizing: 'border-box',
                fontSize: 14,
              }}
            />
          </div>
          <label htmlFor="workspace-password" style={{ display: 'block', marginTop: 18, color: 'var(--app-text)', fontSize: 14, fontWeight: 600 }}>
            密码
          </label>
          <div style={{ position: 'relative', marginTop: 8 }}>
            <FileKey2 size={15} color="var(--app-muted)" style={{ position: 'absolute', left: 12, top: 12, pointerEvents: 'none' }} />
            <input
              id="workspace-password"
              type="password"
              autoComplete="current-password"
              defaultValue="12345678"
              style={{
                width: '100%',
                height: 40,
                padding: '0 12px 0 36px',
                borderRadius: 8,
                border: '1px solid var(--app-border)',
                background: 'var(--app-soft)',
                color: 'var(--app-heading)',
                outline: 'none',
                boxSizing: 'border-box',
                fontSize: 14,
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              height: 40,
              marginTop: 24,
              border: 'none',
              borderRadius: 8,
              background: 'var(--app-brand)',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            登录
          </button>
        </form>
      </main>
    </div>
  );
}

function WorkspaceModulePlaceholder({
  title,
  description,
  icon,
  onBack,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  onBack: () => void;
}) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      boxSizing: 'border-box',
      background: 'var(--app-bg)',
      fontFamily: FONT,
    }}>
      <section style={{
        width: 'min(520px, 100%)',
        padding: 32,
        borderRadius: 16,
        border: '1px solid var(--app-border)',
        background: 'var(--app-surface)',
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          display: 'grid',
          placeItems: 'center',
          color: 'var(--app-accent)',
          background: 'var(--app-accent-soft)',
          border: '1px solid var(--app-accent-border)',
        }}>
          {icon}
        </div>
        <h1 style={{ margin: '24px 0 0', color: 'var(--app-heading)', fontSize: 24, lineHeight: 1.35 }}>{title}</h1>
        <p style={{ margin: '10px 0 28px', color: 'var(--app-muted)', fontSize: 14, lineHeight: 1.7 }}>{description}</p>
        <ArcoButton icon={<ArrowLeft size={14} />} onClick={onBack}>返回墨影工作台</ArcoButton>
      </section>
    </div>
  );
}

function WorkspaceProductFrame({
  title,
  themeMode,
  onThemeToggle,
  onBack,
  children,
}: {
  title: string;
  themeMode: AppThemeMode;
  onThemeToggle: () => void;
  onBack: () => void;
  children: ReactNode;
}) {
  const isDark = themeMode === 'dark';
  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--app-bg)',
      fontFamily: FONT,
    }}>
      <header style={{
        height: 56,
        padding: '0 20px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        borderBottom: '1px solid var(--app-border)',
        background: 'var(--app-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <ArcoIconButton
            type="text"
            icon={<ArrowLeft size={16} />}
            onClick={onBack}
            aria-label="返回墨影工作台"
            title="返回墨影工作台"
          />
          <span style={{ color: 'var(--app-heading)', fontSize: 16, fontWeight: 650 }}>{title}</span>
        </div>
        <ArcoIconButton
          type="text"
          icon={isDark ? <Sun size={16} /> : <Moon size={16} />}
          onClick={onThemeToggle}
          aria-label={isDark ? '切换为浅色模式' : '切换为暗色模式'}
          title={isDark ? '切换为浅色模式' : '切换为暗色模式'}
        />
      </header>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>{children}</div>
    </div>
  );
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
  software: { label: '软件产品', description: '管理软件产品信息、标识码与授权' },
};

// ── Edit mode props passed through to GlobalTopBar ─────
interface EditTopBarProps {
  scheme: HomepageScheme;
  saveState: 'idle' | 'saved';
  onExit: () => void;
  onSave: () => void;
}

function EditorWorkspaceHeader({
  scheme,
  saveState,
  onExit,
  onSave,
}: EditTopBarProps) {
  return (
    <header style={{
      height: 72,
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 20,
      flexShrink: 0,
      background: 'var(--app-surface)',
      borderBottom: '1px solid var(--app-border)',
    }}>
      <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <h1 style={{ color: 'var(--app-heading)', fontSize: 18, lineHeight: 1.3, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getSchemePageTitle(scheme)}
          </h1>
          <ArcoTag tone="accent" style={{ flexShrink: 0 }}>{scheme.name} · {scheme.version}</ArcoTag>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
        <ArcoButton type="outline" onClick={onExit}>退出编辑</ArcoButton>
        <ArcoButton
          onClick={onSave}
          type={saveState === 'saved' ? 'default' : 'primary'}
          status={saveState === 'saved' ? 'success' : 'normal'}
          icon={saveState === 'saved' ? <CheckCircle2 size={14} /> : <Save size={14} />}
        >
          {saveState === 'saved' ? '已保存' : '保存并提交'}
        </ArcoButton>
      </div>
    </header>
  );
}

function EditorCanvasHeader({
  scheme,
  onAutoFill,
  onExport,
}: {
  scheme: HomepageScheme;
  onAutoFill: () => void;
  onExport: () => void;
}) {
  return (
    <div style={{
      minHeight: 104,
      padding: '20px 24px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexShrink: 0,
    }}>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ color: 'var(--app-heading)', fontSize: 16, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>编辑自定义首页面板</h2>
        <div style={{ marginTop: 6, color: 'var(--app-muted)', fontSize: 12 }}>
          上次编辑 {scheme.lastEdited} · {CANVAS_W} × {CANVAS_H} PX
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <ArcoButton onClick={onAutoFill} icon={<Wand2 size={14} />}>自动填补</ArcoButton>
        <ArcoButton type="secondary" onClick={onExport} icon={<Download size={14} />}>导出看板</ArcoButton>
      </div>
    </div>
  );
}

// ── Global Top Bar ──────────────────────────────────────

function GlobalTopBar({
  themeMode = 'light',
  onThemeToggle,
}: {
  themeMode?: AppThemeMode;
  onThemeToggle?: () => void;
}) {
  const isDark = themeMode === 'dark';
  const barBg = 'var(--app-surface)';
  const barBorder = 'var(--app-border)';
  const textColor = 'var(--app-text)';
  const hoverBg = 'var(--app-soft)';

  // ── Default top bar ──
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
        <label style={{ position: 'relative', width: 162, height: 40, display: 'block' }}>
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
              fontSize: 14,
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
            fontSize: 12,
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
  onWorkspace,
  themeMode = 'light',
}: {
  active: EditorNavKey;
  onChange: (key: EditorNavKey) => void;
  onWorkspace?: () => void;
  themeMode?: AppThemeMode;
}) {
  const bg = 'var(--app-surface)';
  const textColor = 'var(--app-text)';
  const mutedColor = 'var(--app-muted)';
  const hoverBg = 'var(--app-soft)';
  const activeBg = 'var(--app-accent-soft)';
  const activeColor = 'var(--app-accent)';
  const borderColor = 'var(--app-border)';

  const navItems = [
    { key: 'home' as const, icon: Home, label: '首页自定义' },
    { key: 'apps' as const, icon: FileText, label: '型号模板' },
    { key: 'components' as const, icon: Box, label: '组件库' },
    { key: 'products' as const, icon: Package, label: '版本管理' },
    { key: 'software' as const, icon: Cpu, label: '软件产品' },
    { key: 'installations' as const, icon: ClipboardList, label: '装机记录' },
    // 外设库、用户管理模块暂时隐藏，页面能力保留以便后续恢复。
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
      <button
        onClick={onWorkspace}
        title="返回墨影工作台"
        aria-label="返回墨影工作台"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 28,
          padding: '4px 10px',
          border: 'none',
          borderRadius: 8,
          background: 'transparent',
          textAlign: 'left',
          cursor: onWorkspace ? 'pointer' : 'default',
        }}
      >
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          background: 'var(--app-brand)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Box size={17} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: 'var(--app-heading)', fontSize: 14, fontWeight: 700, lineHeight: 1.25 }}>数字造机</div>
          <div style={{ color: mutedColor, fontSize: 10, marginTop: 2 }}>软件管理与授权平台</div>
        </div>
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {navItems.map(item => renderItem(item.key, item.icon, item.label))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px' }}>
        <div style={{ width: 24, height: 24, borderRadius: 99, background: 'var(--app-heading)', flexShrink: 0 }} />
        <span style={{ color: textColor, fontSize: 14, fontWeight: 500 }}>ByeWind</span>
      </div>
    </nav>
  );
}

function AppShell({
  active,
  themeMode,
  onThemeToggle,
  onNavChange,
  onWorkspace,
  sidebarCollapsed = false,
  hideTopBar = false,
  children,
}: {
  active: EditorNavKey;
  themeMode: AppThemeMode;
  onThemeToggle: () => void;
  onNavChange: (key: EditorNavKey) => void;
  onWorkspace?: () => void;
  sidebarCollapsed?: boolean;
  hideTopBar?: boolean;
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
        {!sidebarCollapsed && (
          <EditorNavRail active={active} themeMode={themeMode} onChange={onNavChange} onWorkspace={onWorkspace} />
        )}
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {!hideTopBar && <GlobalTopBar themeMode={themeMode} onThemeToggle={onThemeToggle} />}
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
      border: '1px solid var(--app-border)',
      boxShadow: 'none',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--app-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ArcoIconButton
            onClick={onExit}
            aria-label="返回"
            title="返回"
            type="text"
            size="small"
            icon={<ArrowLeft size={16} />}
          />
          <div style={{ color: 'var(--app-heading)', fontSize: 16, fontWeight: 600 }}>{meta.label}</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{
          borderRadius: 8, padding: '24px 20px',
          background: 'var(--app-soft)',
          border: '1px dashed var(--app-border-strong)',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--app-text)', fontSize: 14, fontWeight: 500, margin: '0 0 6px' }}>{meta.label}</p>
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
      size="sm"
      footer={(
        <>
          <ArcoButton onClick={() => onOpenChange(false)}>取消</ArcoButton>
          <ArcoButton type="primary" status="danger" onClick={onConfirm}>删除</ArcoButton>
        </>
      )}
    >
      <p style={{ color: 'var(--app-muted)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
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
  onCancel,
}: {
  scheme?: HomepageScheme;
  saveState: 'idle' | 'saved';
  onAutoFill: () => void;
  onPreview: () => void;
  onSave: () => void;
  onCancel: () => void;
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
        <ChevronRight size={11} color="var(--app-muted)" />
        <span style={{ color: 'var(--app-heading)', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getSchemePageTitle(scheme)}
        </span>
        <ArcoTag tone="accent" size="small" style={{ flexShrink: 0 }}>{scheme.version}</ArcoTag>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ color: 'var(--app-muted)', fontSize: 12 }}>上次编辑 {scheme.lastEdited}</span>
        <ArcoButton onClick={onPreview} icon={<Eye size={13} />}>
          预览
        </ArcoButton>
        <ArcoButton onClick={onAutoFill} icon={<Wand2 size={13} />}>
          自动填补
        </ArcoButton>
        <ArcoButton onClick={onCancel}>
          取消
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
  const { components: catalogComponents } = useComponentCatalog();
  const [workspaceProduct, setWorkspaceProduct] = useState<WorkspaceProduct>('login');
  const [softwareProducts, setSoftwareProducts] = useState<SoftwareProduct[]>(INITIAL_SOFTWARE_PRODUCTS);
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
    const vars = APP_THEME_VARS[robotThemeMode];
    Object.entries(vars).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
    document.documentElement.classList.toggle('dark', robotThemeMode === 'dark');
    document.documentElement.dataset.theme = robotThemeMode;
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
    const def = catalogComponents.find(d => d.id === defId);
    if (!def) return;
    const newItem: PlacedItem = {
      instanceId: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      defId, col, row,
      colSpan: def.colSpan, rowSpan: def.rowSpan,
      config: defaultConfig(defId),
    };
    setCanvasItems(prev => ({ ...prev, [activeSchemeId]: [...(prev[activeSchemeId] ?? []), newItem] }));
  }, [activeSchemeId, catalogComponents]);

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

  const returnToWorkspace = useCallback(() => {
    setWorkspaceProduct('workspace');
    setIsEditing(false);
    setIsCanvasPreview(false);
    setActiveEditorNav('home');
    setSelectedItemId(null);
  }, []);

  if (workspaceProduct === 'login') {
    return (
      <WorkspaceLoginScreen
        themeMode={robotThemeMode}
        onThemeToggle={toggleRobotThemeMode}
        onLogin={() => setWorkspaceProduct('workspace')}
      />
    );
  }

  if (workspaceProduct === 'workspace') {
    return (
      <WorkspaceLauncher
        themeMode={robotThemeMode}
        onThemeToggle={toggleRobotThemeMode}
        onReturnLogin={() => setWorkspaceProduct('login')}
        onOpen={setWorkspaceProduct}
      />
    );
  }

  if (workspaceProduct === 'software') {
    return (
      <WorkspaceProductFrame
        title="软件管理"
        themeMode={robotThemeMode}
        onThemeToggle={toggleRobotThemeMode}
        onBack={returnToWorkspace}
      >
        <ProductVersionManager />
      </WorkspaceProductFrame>
    );
  }

  if (workspaceProduct === 'authorization') {
    return (
      <WorkspaceProductFrame
        title="授权平台"
        themeMode={robotThemeMode}
        onThemeToggle={toggleRobotThemeMode}
        onBack={returnToWorkspace}
      >
        <WorkspaceModulePlaceholder
          title="授权平台"
          description="产品授权、许可策略与设备权限将在这里统一管理。当前启动页和跨产品导航已接通。"
          icon={<FileKey2 size={21} />}
          onBack={returnToWorkspace}
        />
      </WorkspaceProductFrame>
    );
  }

  if (!isCanvasPreview && activeEditorNav === 'apps') {
    return (
      <AppShell
        active={activeEditorNav}
        themeMode={robotThemeMode}
        onThemeToggle={toggleRobotThemeMode}
        onNavChange={handleShellNavChange}
        onWorkspace={returnToWorkspace}
      >
        <RobotModelManager themeMode={robotThemeMode} softwareProducts={softwareProducts} />
      </AppShell>
    );
  }

  if (!isCanvasPreview && activeEditorNav === 'components') {
    return (
      <AppShell
        active={activeEditorNav}
        themeMode={robotThemeMode}
        onThemeToggle={toggleRobotThemeMode}
        onNavChange={handleShellNavChange}
        onWorkspace={returnToWorkspace}
      >
        <RobotComponentLibrary themeMode={robotThemeMode} />
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
        onWorkspace={returnToWorkspace}
      >
        <ProductVersionManager />
      </AppShell>
    );
  }

  if (!isCanvasPreview && activeEditorNav === 'software') {
    return (
      <AppShell
        active={activeEditorNav}
        themeMode={robotThemeMode}
        onThemeToggle={toggleRobotThemeMode}
        onNavChange={handleShellNavChange}
        onWorkspace={returnToWorkspace}
      >
        <SoftwareManager items={softwareProducts} onItemsChange={setSoftwareProducts} />
      </AppShell>
    );
  }

  if (!isCanvasPreview && activeEditorNav === 'installations') {
    return (
      <AppShell
        active={activeEditorNav}
        themeMode={robotThemeMode}
        onThemeToggle={toggleRobotThemeMode}
        onNavChange={handleShellNavChange}
        onWorkspace={returnToWorkspace}
      >
        <InstallationRecordsManager />
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
        onWorkspace={returnToWorkspace}
        sidebarCollapsed
        hideTopBar
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--app-bg)' }}>
          {!isCanvasPreview && activeScheme && (
            <EditorWorkspaceHeader
              scheme={activeScheme}
              saveState={saveState}
              onExit={() => { setIsEditing(false); setIsCanvasPreview(false); setActiveEditorNav('home'); setSelectedItemId(null); }}
              onSave={handleSave}
            />
          )}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: isCanvasPreview ? 0 : 'var(--app-section-gap)', padding: 'var(--app-page-padding)', overflow: 'hidden' }}>
          {!isCanvasPreview && (
            <>
              {activeEditorNav === 'components' ? (
                <ComponentLibrary
                  title="组件库"
                  showBack={false}
                  editorLayout
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
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: 'var(--app-card-radius)', boxShadow: '0 16px 40px -34px var(--app-shadow-color)', overflow: 'hidden' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
              {!isCanvasPreview && activeScheme && (
                <EditorCanvasHeader
                  scheme={activeScheme}
                  onAutoFill={autoFill}
                  onExport={() => exportScheme(activeScheme.id)}
                />
              )}
              <CanvasArea
                componentDefs={catalogComponents}
                items={activeItems}
                isEditing={!isCanvasPreview}
                selectedItemId={isCanvasPreview ? null : selectedItemId}
                onSelectItem={isCanvasPreview ? () => {} : setSelectedItemId}
                onAddItem={addItem}
                onMoveItem={moveItem}
                onResizeItem={updateItemSize}
                onRemoveItem={removeItem}
              />
            </div>
            {!isCanvasPreview && (
              <PropertiesPanel
                componentDefs={catalogComponents}
                item={selectedItem}
                showTitleIcon={false}
                embedded
                onUpdateConfig={updateItemConfig}
                onUpdateSize={updateItemSize}
                onRemove={removeItem}
                onClose={() => setSelectedItemId(null)}
              />
            )}
          </div>
          </div>
          {isCanvasPreview && (
            <button
              onClick={() => setIsCanvasPreview(false)}
              style={{
                position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 22px',
                borderRadius: 99, background: 'var(--app-heading)', color: 'var(--app-surface)', border: 'none',
                boxShadow: '0 4px 16px var(--app-shadow-color)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <ArrowLeft size={15} />退出预览
            </button>
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
      onWorkspace={returnToWorkspace}
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
                <p style={{ color: 'var(--app-muted)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
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
              componentDefs={catalogComponents}
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
