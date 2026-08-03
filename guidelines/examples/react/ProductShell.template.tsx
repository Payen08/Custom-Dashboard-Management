import type { ReactNode } from 'react';
import { ProductIconButton } from '@your-org/product-ui';

export interface ProductNavigationItem {
  key: string;
  label: string;
  icon: ReactNode;
}

export function ProductShellTemplate(props: {
  productName: string;
  productDescription: string;
  activeKey: string;
  items: ProductNavigationItem[];
  onNavigate: (key: string) => void;
  onReturnWorkspace: () => void;
  children: ReactNode;
}) {
  return <div className="product-shell">
    <aside className="product-navigation" aria-label={`${props.productName}导航`}>
      <button className="product-identity" onClick={props.onReturnWorkspace}>
        <span className="product-identity__mark" aria-hidden="true" />
        <span><strong>{props.productName}</strong><small>{props.productDescription}</small></span>
      </button>
      <nav>{props.items.map(item => <button
        key={item.key}
        className="product-navigation__item"
        aria-current={props.activeKey === item.key ? 'page' : undefined}
        onClick={() => props.onNavigate(item.key)}
      >{item.icon}<span>{item.label}</span></button>)}</nav>
      <button className="product-navigation__return" onClick={props.onReturnWorkspace}>返回墨影工作台</button>
    </aside>
    <div className="product-main">
      <header className="product-topbar">
        <ProductIconButton icon="panel-left" aria-label="切换侧栏" tooltip="切换侧栏" />
        <div className="product-topbar__actions">
          <ProductIconButton icon="theme" aria-label="切换主题" tooltip="切换主题" />
          <ProductIconButton icon="refresh" aria-label="刷新" tooltip="刷新" />
          <ProductIconButton icon="bell" aria-label="通知" tooltip="通知" />
        </div>
      </header>
      <main className="product-page-viewport">{props.children}</main>
    </div>
  </div>;
}

