
  import { createRoot } from "react-dom/client";
  import { HashRouter } from "react-router";
  import App from "./app/App.tsx";
  import { I18nProvider } from "./app/i18n.tsx";
  import "./styles/index.css";

  // 使用 HashRouter：GitHub Pages 是纯静态托管，BrowserRouter 刷新子路由会 404。
  // HashRouter 下 useLocation() 的 pathname 仍为 /xxx 形式，现有路由逻辑无需改动。
  createRoot(document.getElementById("root")!).render(
    <HashRouter>
      <I18nProvider>
        <App />
      </I18nProvider>
    </HashRouter>
  );
  
