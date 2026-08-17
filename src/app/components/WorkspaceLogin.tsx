import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileUp,
  Link2,
  LoaderCircle,
  LockKeyhole,
  Moon,
  PanelTop,
  PlugZap,
  Save,
  Sun,
  User,
  XCircle,
} from 'lucide-react';
import loginWorkspaceBackground from '../../imports/login-workspace-bg.png';
import { AdaptiveText, LanguageSelect, useI18n } from '../i18n';

const FONT = "'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
const SERVICE_CONFIG_STORAGE_KEY = 'moying-workspace-service-config';

type ServiceFieldKey = 'BASE_URL' | 'MINIO_HOST' | 'NODE_BACKEND_HOST' | 'MQTT_HOST';
type TestState = 'idle' | 'testing' | 'success' | 'error';

type ServiceConfig = Record<ServiceFieldKey, string>;
type ServiceTestState = Record<ServiceFieldKey, TestState>;

const EMPTY_SERVICE_CONFIG: ServiceConfig = {
  BASE_URL: '',
  MINIO_HOST: '',
  NODE_BACKEND_HOST: '',
  MQTT_HOST: '',
};

const IDLE_TEST_STATE: ServiceTestState = {
  BASE_URL: 'idle',
  MINIO_HOST: 'idle',
  NODE_BACKEND_HOST: 'idle',
  MQTT_HOST: 'idle',
};

const SERVICE_FIELDS: Array<{
  key: ServiceFieldKey;
  labelKey: string;
  helper: string;
  placeholder: string;
}> = [
  { key: 'BASE_URL', labelKey: 'backendAddress', helper: 'BASE_URL', placeholder: 'http://localhost:10882' },
  { key: 'MINIO_HOST', labelKey: 'fileAddress', helper: 'MINIO_HOST', placeholder: 'http://localhost:9000' },
  { key: 'NODE_BACKEND_HOST', labelKey: 'frontendAddress', helper: 'NODE_BACKEND_HOST', placeholder: 'http://localhost:3000' },
  { key: 'MQTT_HOST', labelKey: 'mqttAddress', helper: 'MQTT_HOST', placeholder: 'mqtt://localhost:1883' },
];

function loadServiceConfig(): ServiceConfig {
  if (typeof window === 'undefined') return EMPTY_SERVICE_CONFIG;
  try {
    const stored = JSON.parse(window.localStorage.getItem(SERVICE_CONFIG_STORAGE_KEY) ?? '{}');
    return SERVICE_FIELDS.reduce<ServiceConfig>((config, field) => {
      config[field.key] = typeof stored[field.key] === 'string' ? stored[field.key] : '';
      return config;
    }, { ...EMPTY_SERVICE_CONFIG });
  } catch {
    return EMPTY_SERVICE_CONFIG;
  }
}

function isValidServiceAddress(key: ServiceFieldKey, value: string): boolean {
  const address = value.trim();
  if (!address) return false;
  try {
    const parsed = new URL(address);
    if (key === 'MQTT_HOST') return ['mqtt:', 'mqtts:', 'ws:', 'wss:', 'http:', 'https:'].includes(parsed.protocol);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function safeServiceConfig(value: unknown): ServiceConfig | null {
  if (!value || typeof value !== 'object') return null;
  const source = ('serviceAddresses' in value && value.serviceAddresses && typeof value.serviceAddresses === 'object')
    ? value.serviceAddresses as Record<string, unknown>
    : value as Record<string, unknown>;
  const next = { ...EMPTY_SERVICE_CONFIG };
  for (const field of SERVICE_FIELDS) {
    if (typeof source[field.key] !== 'string') return null;
    next[field.key] = String(source[field.key]);
  }
  return next;
}

export function WorkspaceLogin({
  themeMode,
  onThemeToggle,
  onLogin,
}: {
  themeMode: 'light' | 'dark';
  onThemeToggle: () => void;
  onLogin: () => void;
}) {
  const [view, setView] = useState<'login' | 'services'>('login');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [serviceConfig, setServiceConfig] = useState<ServiceConfig>(loadServiceConfig);
  const [testState, setTestState] = useState<ServiceTestState>({ ...IDLE_TEST_STATE });
  const [serviceMessage, setServiceMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const isDark = themeMode === 'dark';
  const { copy, t } = useI18n();

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account.trim() || !password) {
      setLoginError(t('credentialsRequired'));
      return;
    }
    setLoginError('');
    onLogin();
  }

  async function testAddress(key: ServiceFieldKey): Promise<boolean> {
    setTestState(current => ({ ...current, [key]: 'testing' }));
    await new Promise(resolve => window.setTimeout(resolve, 520));
    const success = isValidServiceAddress(key, serviceConfig[key]);
    setTestState(current => ({ ...current, [key]: success ? 'success' : 'error' }));
    return success;
  }

  async function testAllAddresses() {
    setServiceMessage(null);
    const results = await Promise.all(SERVICE_FIELDS.map(field => testAddress(field.key)));
    const passed = results.filter(Boolean).length;
    setServiceMessage({
      tone: passed === SERVICE_FIELDS.length ? 'success' : 'error',
      text: passed === SERVICE_FIELDS.length ? '4 项服务地址测试通过' : `${passed} 项通过，${SERVICE_FIELDS.length - passed} 项需要检查`,
    });
  }

  function exportServiceConfig() {
    const payload = {
      type: 'moying-workspace-service-config',
      version: 1,
      exportedAt: new Date().toISOString(),
      serviceAddresses: serviceConfig,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'moying-service-config.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function importServiceConfig(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const next = safeServiceConfig(parsed);
      if (!next) throw new Error('invalid');
      setServiceConfig(next);
      setTestState({ ...IDLE_TEST_STATE });
      setServiceMessage({ tone: 'success', text: `已导入 ${file.name}` });
    } catch {
      setServiceMessage({ tone: 'error', text: '配置文件格式不正确，请导入 JSON 配置文件' });
    }
  }

  function saveServiceConfig() {
    window.localStorage.setItem(SERVICE_CONFIG_STORAGE_KEY, JSON.stringify(serviceConfig));
    setServiceMessage({ tone: 'success', text: '服务地址已保存' });
    window.setTimeout(() => setView('login'), 420);
  }

  return (
    <div className="workspace-login" data-theme={themeMode}>
      <style>{`
        .workspace-login {
          width: 100%;
          height: 100%;
          min-height: 0;
          position: relative;
          overflow: auto;
          background: var(--app-bg);
          color: var(--app-heading);
          font-family: ${FONT};
        }
        .workspace-login *, .workspace-login *::before, .workspace-login *::after { box-sizing: border-box; }
        .workspace-login__background {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: right center;
          background: #FFFFFF;
          pointer-events: none;
          user-select: none;
        }
        .workspace-login__left-surface {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 0;
          width: 52%;
          background: #FFFFFF;
          pointer-events: none;
        }
        .workspace-login[data-theme="dark"] .workspace-login__left-surface { background: var(--app-bg); }
        .workspace-login[data-theme="dark"] .workspace-login__background { opacity: 0.14; filter: brightness(0.55) saturate(0.7); }
        .workspace-login__brand {
          position: fixed;
          top: 32px;
          left: 40px;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: var(--app-heading);
        }
        .workspace-login__logo {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #4B83FF;
          color: #FFFFFF;
          box-shadow: 0 10px 24px rgba(36, 31, 125, 0.16);
        }
        .workspace-login__brand strong { font-size: 20px; line-height: 28px; font-weight: 700; }
        .workspace-login__theme {
          position: fixed;
          top: 32px;
          right: 40px;
          z-index: 3;
          width: 40px;
          height: 40px;
          padding: 0;
          display: grid;
          place-items: center;
          border: 1px solid var(--app-border);
          border-radius: 8px;
          background: var(--app-surface);
          color: var(--app-text);
          cursor: pointer;
        }
        .workspace-login__preferences {
          position: fixed;
          top: 32px;
          right: 40px;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .workspace-login__preferences .workspace-login__theme { position: static; }
        .workspace-login__main {
          width: 100%;
          min-height: 100%;
          padding: 120px clamp(40px, 7.8vw, 150px) 64px;
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
        }
        .workspace-login__form { width: min(500px, 42vw); }
        .workspace-login__eyebrow { margin: 0 0 4px; color: var(--app-heading); font-size: 32px; line-height: 40px; font-weight: 700; }
        .workspace-login__title-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .workspace-login__title { margin: 0; color: var(--app-brand); font-size: clamp(36px, 3vw, 52px); line-height: 1.16; font-weight: 700; }
        .workspace-login__profile {
          height: 32px;
          padding: 0 28px;
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          background: var(--app-accent-soft);
          color: var(--app-accent-text);
          font-size: 14px;
          font-weight: 500;
        }
        .workspace-login__fields { margin-top: 36px; display: grid; gap: 16px; }
        .workspace-login__field { position: relative; }
        .workspace-login__field > svg:first-child { position: absolute; left: 16px; top: 14px; color: var(--app-muted); pointer-events: none; }
        .workspace-login__input {
          width: 100%;
          height: 48px;
          padding: 0 44px;
          border: 1px solid var(--app-border);
          border-radius: 8px;
          outline: none;
          background: var(--app-surface);
          color: var(--app-heading);
          font: inherit;
          font-size: 14px;
          transition: border-color var(--ds-motion-duration-mid) var(--ds-motion-ease-in-out), box-shadow var(--ds-motion-duration-mid) var(--ds-motion-ease-in-out);
        }
        .workspace-login__input:focus { border-color: var(--app-brand); box-shadow: 0 0 0 3px var(--app-accent-soft); }
        .workspace-login__input::placeholder { color: var(--app-subtle); }
        .workspace-login__password-toggle {
          position: absolute;
          right: 8px;
          top: 4px;
          width: 40px;
          height: 40px;
          padding: 0;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: var(--app-muted);
          cursor: pointer;
        }
        .workspace-login__primary {
          width: 100%;
          height: 48px;
          border: 0;
          border-radius: 8px;
          background: var(--app-brand);
          color: #FFFFFF;
          font: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 10px 22px rgba(36, 31, 125, 0.16);
        }
        .workspace-login__primary:hover { background: color-mix(in srgb, var(--app-brand) 88%, #000000); }
        .workspace-login__error { min-height: 20px; margin-top: 8px; color: var(--app-danger); font-size: 12px; line-height: 20px; }
        .workspace-login__service-entry {
          min-height: 40px;
          margin: 8px auto 0;
          padding: 0 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: var(--app-muted);
          font: inherit;
          font-size: 14px;
          cursor: pointer;
        }
        .workspace-login__service-entry:hover { background: var(--app-soft); color: var(--app-accent-text); }
        .service-config {
          width: min(620px, 42vw);
          margin: 0;
          padding-bottom: 24px;
        }
        .service-config__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
        .service-config__heading { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .service-config__back {
          width: 40px;
          height: 40px;
          padding: 0;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 1px solid var(--app-border);
          border-radius: 8px;
          background: var(--app-surface);
          color: var(--app-heading);
          cursor: pointer;
        }
        .service-config__heading h1 { margin: 0; font-size: 24px; line-height: 32px; font-weight: 700; }
        .service-config__actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
        .service-config__button {
          height: 40px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid var(--app-border);
          border-radius: 8px;
          background: var(--app-surface);
          color: var(--app-heading);
          font: inherit;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .service-config__button:hover { border-color: var(--app-accent-border); background: var(--app-accent-soft); color: var(--app-accent-text); }
        .service-config__button[data-variant="primary"] { border-color: var(--app-brand); background: var(--app-brand); color: #FFFFFF; }
        .service-config__panel {
          padding: 0;
          border: 0;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
        }
        .service-config__fields { display: grid; gap: 20px; }
        .service-config__label { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; color: var(--app-heading); font-size: 14px; font-weight: 600; }
        .service-config__label code { color: var(--app-muted); font: inherit; font-size: 12px; font-weight: 400; }
        .service-config__input-row { display: grid; grid-template-columns: minmax(0, 1fr) 40px; gap: 8px; }
        .service-config__input {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          border: 1px solid var(--app-border);
          border-radius: 8px;
          outline: none;
          background: var(--app-surface);
          color: var(--app-heading);
          font: inherit;
          font-size: 14px;
        }
        .service-config__input:focus { border-color: var(--app-brand); box-shadow: 0 0 0 3px var(--app-accent-soft); }
        .service-config__test {
          width: 40px;
          height: 40px;
          padding: 0;
          display: grid;
          place-items: center;
          border: 1px solid var(--app-border);
          border-radius: 8px;
          background: var(--app-surface);
          color: var(--app-muted);
          cursor: pointer;
        }
        .service-config__test[data-state="success"] { border-color: var(--ds-state-success-border, var(--app-success)); background: var(--ds-state-success-bg, var(--app-success-soft)); color: var(--ds-state-success-text, var(--app-success)); }
        .service-config__test[data-state="error"] { border-color: var(--app-danger-border); background: var(--app-danger-soft); color: var(--app-danger); }
        .service-config__test svg[data-loading="true"] { animation: service-spin 800ms linear infinite; }
        .service-config__status { min-height: 18px; margin-top: 5px; color: var(--app-muted); font-size: 12px; line-height: 18px; }
        .service-config__status[data-state="success"] { color: var(--ds-state-success-text, var(--app-success)); }
        .service-config__status[data-state="error"] { color: var(--app-danger); }
        .service-config__footer { margin-top: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .service-config__message { min-height: 20px; color: var(--app-muted); font-size: 12px; line-height: 20px; }
        .service-config__message[data-tone="success"] { color: var(--ds-state-success-text, var(--app-success)); }
        .service-config__message[data-tone="error"] { color: var(--app-danger); }
        .service-config__save { min-width: 120px; }
        @keyframes service-spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .workspace-login__background { opacity: 0.24; object-position: 62% center; }
          .workspace-login__left-surface { width: 100%; background: color-mix(in srgb, var(--app-surface) 94%, transparent); }
          .workspace-login__main { padding: 112px 24px 48px; align-items: flex-start; }
          .workspace-login__form { width: min(500px, 100%); padding: 24px; border-radius: 16px; background: color-mix(in srgb, var(--app-surface) 92%, transparent); backdrop-filter: blur(12px); }
          .workspace-login__brand { top: 24px; left: 24px; }
          .workspace-login__preferences { top: 24px; right: 24px; }
          .service-config { width: 100%; }
        }
        @media (max-width: 640px) {
          .workspace-login__brand strong { font-size: 16px; }
          .workspace-login__logo { width: 36px; height: 36px; }
          .workspace-login__eyebrow { font-size: 24px; line-height: 32px; }
          .workspace-login__title { font-size: 36px; }
          .workspace-login__profile { height: 28px; padding: 0 16px; }
          .service-config__header { display: grid; }
          .service-config__actions { justify-content: flex-start; }
          .service-config__panel { padding: 16px; }
          .service-config__footer { align-items: stretch; flex-direction: column; }
          .service-config__save { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) { .service-config__test svg[data-loading="true"] { animation: none; } }
      `}</style>

      <img className="workspace-login__background" src={loginWorkspaceBackground} alt="" />
      <div className="workspace-login__left-surface" aria-hidden="true" />

      <div className="workspace-login__brand">
        <span className="workspace-login__logo"><PanelTop size={22} /></span>
        <strong>{t('workbench')}</strong>
      </div>

      <div className="workspace-login__preferences">
        <LanguageSelect />
        <button
          type="button"
          className="workspace-login__theme"
          onClick={onThemeToggle}
          aria-label={t(isDark ? 'lightMode' : 'darkMode')}
          title={t(isDark ? 'lightMode' : 'darkMode')}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <main className="workspace-login__main">
        {view === 'login' ? (
          <form className="workspace-login__form" onSubmit={submitLogin}>
            <p className="workspace-login__eyebrow">{t('signInTo')}</p>
            <div className="workspace-login__title-row">
              <h1 className="workspace-login__title">{t('workbench')}</h1>
              <span className="workspace-login__profile">myWorkspace</span>
            </div>

            <div className="workspace-login__fields">
              <div className="workspace-login__field">
                <User size={18} />
                <input
                  className="workspace-login__input"
                  value={account}
                  onChange={event => setAccount(event.target.value)}
                  autoComplete="username"
                  placeholder={t('accountPlaceholder')}
                  aria-label={t('account')}
                />
              </div>
              <div className="workspace-login__field">
                <LockKeyhole size={18} />
                <input
                  className="workspace-login__input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder={t('passwordPlaceholder')}
                  aria-label={t('password')}
                />
                <button
                  type="button"
                  className="workspace-login__password-toggle"
                  onClick={() => setShowPassword(current => !current)}
                  aria-label={t(showPassword ? 'hidePassword' : 'showPassword')}
                  title={t(showPassword ? 'hidePassword' : 'showPassword')}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="workspace-login__error" role="alert">{loginError}</div>
            <button type="submit" className="workspace-login__primary">{t('signIn')}</button>
            <button type="button" className="workspace-login__service-entry" onClick={() => setView('services')}>
              <Link2 size={16} />
              <AdaptiveText copy={copy('editServices')} style={{ display: 'block', maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden' }} />
            </button>
          </form>
        ) : (
          <section className="service-config" aria-label={t('serviceAddresses')}>
            <header className="service-config__header">
              <div className="service-config__heading">
                <button type="button" className="service-config__back" onClick={() => setView('login')} aria-label={t('backToLogin')} title={t('backToLogin')}>
                  <ArrowLeft size={19} />
                </button>
                <h1>{t('serviceAddresses')}</h1>
              </div>
              <div className="service-config__actions">
                <input ref={importInputRef} type="file" accept="application/json,.json" hidden onChange={importServiceConfig} />
                <button type="button" className="service-config__button" onClick={() => importInputRef.current?.click()}><FileUp size={16} />{t('import')}</button>
                <button type="button" className="service-config__button" onClick={exportServiceConfig}><Download size={16} />{t('export')}</button>
                <button type="button" className="service-config__button" onClick={testAllAddresses}><PlugZap size={16} /><AdaptiveText copy={copy('testAll')} style={{ display: 'block', maxWidth: 128, whiteSpace: 'nowrap', overflow: 'hidden' }} /></button>
              </div>
            </header>

            <div className="service-config__panel">
              <div className="service-config__fields">
                {SERVICE_FIELDS.map(field => {
                  const state = testState[field.key];
                  return (
                    <label key={field.key}>
                      <span className="service-config__label">{t(field.labelKey)}<code>{field.helper}</code></span>
                      <span className="service-config__input-row">
                        <input
                          className="service-config__input"
                          value={serviceConfig[field.key]}
                          onChange={event => {
                            setServiceConfig(current => ({ ...current, [field.key]: event.target.value }));
                            setTestState(current => ({ ...current, [field.key]: 'idle' }));
                            setServiceMessage(null);
                          }}
                          placeholder={`${t('example')} ${field.placeholder}`}
                        />
                        <button
                          type="button"
                          className="service-config__test"
                          data-state={state}
                          onClick={() => testAddress(field.key)}
                          disabled={state === 'testing'}
                          aria-label={`${t('testAll', 'short')} ${t(field.labelKey)}`}
                          title={`${t('testAll', 'short')} ${t(field.labelKey)}`}
                        >
                          {state === 'testing' ? <LoaderCircle size={17} data-loading="true" /> : state === 'success' ? <CheckCircle2 size={17} /> : state === 'error' ? <XCircle size={17} /> : <PlugZap size={17} />}
                        </button>
                      </span>
                      <span className="service-config__status" data-state={state}>
                        {state === 'testing' ? t('testing') : state === 'success' ? t('testSuccess') : state === 'error' ? t('testError') : ''}
                      </span>
                    </label>
                  );
                })}
              </div>

              <footer className="service-config__footer">
                <span className="service-config__message" data-tone={serviceMessage?.tone} role="status">{serviceMessage?.text ?? ''}</span>
                <button type="button" className="service-config__button service-config__save" data-variant="primary" onClick={saveServiceConfig}><Save size={16} /><AdaptiveText copy={copy('save')} style={{ display: 'block', maxWidth: 96, whiteSpace: 'nowrap', overflow: 'hidden' }} /></button>
              </footer>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
