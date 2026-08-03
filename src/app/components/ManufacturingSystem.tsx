import { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, Bell, Box, ChevronLeft, ChevronRight, CircleAlert, ClipboardCheck, Download,
  Eye, FileSpreadsheet, Gauge, Layers3, PackageCheck, Pencil, Plus,
  PanelLeft, QrCode, RotateCcw, Search, Settings2, SlidersHorizontal, Sun,
  Moon, TableProperties, Upload, Wrench,
} from 'lucide-react';
import '../../styles/business/manufacturing-system.css';
import {
  ProductButton, ProductDrawer, ProductField, ProductIconButton, ProductModal,
  ProductSelect, ProductTag, ProductTextInput,
} from './ProductUI';

type Status = '新建' | '加工中' | '加工完成';
type Priority = '普通' | '高';
type Operation = { name: string; planned: number; completed: number; hours: number; worker: string; state: string };
type WorkOrder = {
  id: string; status: Status; programmed: boolean; posted: boolean; source: string;
  priority: Priority; due: string; createdAt: string; creator: string; partNo: string;
  partName: string; program: string; mold: string; operations: Operation[];
};

const SEED: WorkOrder[] = [
  { id: 'MO20260803001', status: '加工中', programmed: true, posted: false, source: '生产联络单', priority: '高', due: '2026-08-04 18:00', createdAt: '2026-08-03 09:16', creator: '张敏', partNo: 'MJ-A17-042', partName: '前模镶件', program: 'MJ-A17-R3.nc', mold: 'MOULD-240817', operations: [
    { name: '精铣基准面', planned: 4, completed: 4, hours: 2.5, worker: '王磊', state: '已完成' },
    { name: 'CNC精加工', planned: 4, completed: 2, hours: 6, worker: '李跃', state: '加工中' },
    { name: '去毛刺', planned: 4, completed: 0, hours: 1, worker: '陈舟', state: '待开始' },
  ] },
  { id: 'MO20260803002', status: '新建', programmed: false, posted: false, source: '手工录入', priority: '普通', due: '2026-08-06 12:00', createdAt: '2026-08-03 10:42', creator: '刘畅', partNo: 'ZJ-B03-118', partName: '斜顶座', program: '待编程', mold: 'MOULD-240821', operations: [{ name: 'CNC粗加工', planned: 6, completed: 0, hours: 8, worker: '未分配', state: '待开始' }] },
  { id: 'MO20260802016', status: '加工完成', programmed: true, posted: true, source: 'Excel导入', priority: '普通', due: '2026-08-03 16:00', createdAt: '2026-08-02 14:05', creator: '系统导入', partNo: 'HX-C22-009', partName: '滑块镶件', program: 'HX-C22-V6.nc', mold: 'MOULD-240806', operations: [{ name: 'CNC精加工', planned: 8, completed: 8, hours: 5.5, worker: '周海', state: '已完成' }] },
  { id: 'MO20260802015', status: '加工中', programmed: true, posted: false, source: '扫码录入', priority: '普通', due: '2026-08-05 10:00', createdAt: '2026-08-02 11:28', creator: '赵琪', partNo: 'DX-P11-205', partName: '动模仁', program: 'DX-P11-R2.nc', mold: 'MOULD-240798', operations: [{ name: '深孔加工', planned: 2, completed: 1, hours: 4, worker: '孙宁', state: '加工中' }] },
  { id: 'MO20260801028', status: '新建', programmed: true, posted: false, source: '生产联络单', priority: '高', due: '2026-08-04 09:00', createdAt: '2026-08-01 17:32', creator: '张敏', partNo: 'CD-K09-077', partName: '抽芯滑块', program: 'CD-K09-R1.nc', mold: 'MOULD-240812', operations: [{ name: 'CNC粗加工', planned: 3, completed: 0, hours: 5, worker: '王磊', state: '待开始' }] },
];

const nav = [
  { key: 'orders', label: '工单管理', icon: ClipboardCheck },
  { key: 'tooling', label: '工装管理', icon: Wrench },
  { key: 'stations', label: '工作台管理', icon: Gauge },
  { key: 'base', label: '基础数据管理', icon: TableProperties },
  { key: 'settings', label: '系统配置', icon: Settings2 },
];

function Tag({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: string }) {
  const mapped = tone === 'blue' ? 'accent' : tone === 'green' ? 'success' : tone === 'red' ? 'danger' : 'neutral';
  return <ProductTag tone={mapped} size="small">{children}</ProductTag>;
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
  const [active, setActive] = useState('orders');
  const [orders, setOrders] = useState(SEED);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('全部状态');
  const [posted, setPosted] = useState('全部过账');
  const [view, setView] = useState<'list' | 'form' | 'detail' | 'tracking'>('list');
  const [selected, setSelected] = useState<WorkOrder | null>(null);
  const [editing, setEditing] = useState<WorkOrder | null>(null);
  const [notice, setNotice] = useState('');
  const uploadRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => orders.filter(order =>
    (!keyword || order.id.toLowerCase().includes(keyword.toLowerCase())) &&
    (status === '全部状态' || order.status === status) &&
    (posted === '全部过账' || (posted === '已过账' ? order.posted : !order.posted))
  ), [orders, keyword, status, posted]);

  const flash = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(''), 2600); };
  const openDetail = (order: WorkOrder) => { setSelected(order); setView('detail'); };
  const openForm = (order?: WorkOrder) => { setEditing(order ?? null); setView('form'); };

  const saveOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = String(data.get('id'));
    const next: WorkOrder = {
      id, status: editing?.status ?? '新建', programmed: String(data.get('program')) !== '', posted: editing?.posted ?? false,
      source: editing?.source ?? '手工录入', priority: data.get('priority') as Priority, due: String(data.get('due')).replace('T', ' '),
      createdAt: editing?.createdAt ?? '2026-08-03 14:26', creator: editing?.creator ?? 'robot-admin', partNo: String(data.get('partNo')),
      partName: String(data.get('partName')), program: String(data.get('program')) || '待编程', mold: String(data.get('mold')),
      operations: [{ name: String(data.get('operation')), planned: Number(data.get('planned')), completed: editing?.operations[0]?.completed ?? 0, hours: Number(data.get('hours')), worker: String(data.get('worker')) || '未分配', state: editing?.operations[0]?.state ?? '待开始' }],
    };
    setOrders(current => editing ? current.map(item => item.id === editing.id ? next : item) : [next, ...current]);
    setView('list'); flash(editing ? '工单已更新' : '工单已创建，状态为“新建”');
  };

  const exportOrders = () => {
    const rows = [['生产单号','状态','是否编程','过账状态','优先级','需求时间','件号','件名','加工程序','模具信息','工艺列表'], ...orders.map(o => [o.id,o.status,o.programmed?'是':'否',o.posted?'已过账':'未过账',o.priority,o.due,o.partNo,o.partName,o.program,o.mold,o.operations.map(x => `${x.name}|${x.planned}|${x.hours}|${x.worker}`).join(';')])];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"','""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = '工单导出_20260803.csv'; a.click(); URL.revokeObjectURL(url); flash('已按模板字段导出工单');
  };

  if (active !== 'orders') return (
    <div className="mfg-shell">
      <Sidebar active={active} onActive={key => { setActive(key); setView('list'); }} onBack={onBack} />
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
      <Sidebar active={active} onActive={key => { setActive(key); setView('list'); }} onBack={onBack} />
      <div className="mfg-content-column">
      <ManufacturingTopBar themeMode={themeMode} onThemeToggle={onThemeToggle} />
      <main className="mfg-main ds-page ds-page--list">
        {notice && <div className="mfg-toast"><PackageCheck size={16} />{notice}</div>}
        <>
          <header className="mfg-page-header">
            <div><div className="mfg-breadcrumb">智能制造 / 工单管理</div><h1>工单管理</h1><p>统一承接生产联络单，追踪从装夹到拆夹的全过程。</p></div>
            <div className="mfg-actions">
              <input ref={uploadRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={e => { if (e.target.files?.[0]) flash(`已解析 ${e.target.files[0].name}，重复单号将自动跳过`); }} />
              <ProductButton type="outline" size="large" icon={<Upload size={15} />} onClick={() => uploadRef.current?.click()}>Excel 导入</ProductButton>
              <ProductButton type="outline" size="large" icon={<Download size={15} />} onClick={exportOrders}>导出</ProductButton>
              <ProductButton type="primary" size="large" icon={<Plus size={16} />} onClick={() => openForm()}>新增工单</ProductButton>
            </div>
          </header>
          <section className="mfg-card">
            <div className="mfg-filterbar">
              <div className="mfg-search"><Search size={15} /><ProductTextInput value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索加工单号" aria-label="搜索加工单号" /></div>
              <ProductSelect value={status} onChange={e => setStatus(e.target.value)} aria-label="状态筛选"><option value="全部状态">全部状态</option><option value="新建">新建</option><option value="加工中">加工中</option><option value="加工完成">加工完成</option></ProductSelect>
              <ProductSelect value={posted} onChange={e => setPosted(e.target.value)} aria-label="过账状态筛选"><option value="全部过账">全部过账</option><option value="已过账">已过账</option><option value="未过账">未过账</option></ProductSelect>
              <ProductIconButton icon={<SlidersHorizontal size={15} />} aria-label="更多筛选" title="更多筛选" />
              <span className="mfg-result-count">共 {filtered.length} 条</span>
            </div>
            <div className="mfg-table-wrap"><table className="mfg-table"><thead><tr><th>加工单号</th><th>状态</th><th>编程</th><th>过账状态</th><th>单据来源</th><th>优先级</th><th>需求时间</th><th>创建信息</th><th className="mfg-table__right">操作</th></tr></thead>
              <tbody>{filtered.map(order => <tr key={order.id}>
                <td><button className="mfg-link" onClick={() => openDetail(order)}>{order.id}</button><small>{order.partNo} · {order.partName}</small></td>
                <td><Tag tone={order.status === '加工完成' ? 'green' : order.status === '加工中' ? 'blue' : 'neutral'}>{order.status}</Tag></td>
                <td>{order.programmed ? <span className="mfg-yes">已编程</span> : <span className="mfg-warn">待编程</span>}</td>
                <td><Tag tone={order.posted ? 'green' : 'neutral'}>{order.posted ? '已过账' : '未过账'}</Tag></td>
                <td>{order.source}</td><td>{order.priority === '高' ? <Tag tone="red">高</Tag> : '普通'}</td><td>{order.due}</td>
                <td>{order.createdAt}<small>{order.creator}</small></td>
                <td className="mfg-table__right"><div className="mfg-row-actions"><ProductIconButton size="small" icon={<Eye size={13} />} aria-label={`查看${order.id}`} title="查看详情" onClick={() => openDetail(order)} />{order.status === '新建' && <ProductIconButton size="small" icon={<Pencil size={13} />} aria-label={`编辑${order.id}`} title="编辑工单" onClick={() => openForm(order)} />}</div></td>
              </tr>)}</tbody></table></div>
            <footer className="mfg-pagination"><span>每页 10 条</span><button disabled><ChevronLeft size={14}/></button><button className="is-current">1</button><button disabled><ChevronRight size={14}/></button></footer>
          </section>
        </>

        <OrderForm open={view === 'form'} order={editing} onBack={() => setView('list')} onSave={saveOrder} />
        <OrderDetail open={view === 'detail' || view === 'tracking'} tracking={view === 'tracking'} order={selected} onBack={() => { setView('list'); setSelected(null); }} onEdit={() => selected && openForm(selected)} onTrack={() => setView('tracking')} onTrackingBack={() => setView('detail')} onPriority={() => {
          if (!selected) return;
          const next = selected.priority === '高' ? '普通' : '高'; const updated = {...selected, priority: next as Priority}; setSelected(updated); setOrders(list => list.map(x => x.id === updated.id ? updated : x)); flash(`优先级已调整为“${next}”，操作日志已记录`);
        }} />
      </main>
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

function OrderForm({ open, order, onBack, onSave }: { open:boolean; order: WorkOrder|null; onBack:()=>void; onSave:(e:React.FormEvent<HTMLFormElement>)=>void }) {
  return <ProductModal open={open} onOpenChange={value => !value && onBack()} title={order ? '编辑工单' : '新增工单'} description="填写工单基础信息、工件信息和工序明细。" size="xl" footer={<><ProductButton onClick={onBack}>取消</ProductButton><ProductButton type="primary" htmlType="submit" form="mfg-order-form">保存工单</ProductButton></>}>
    <form id="mfg-order-form" className="mfg-modal-form" onSubmit={onSave}>
      <section><h3>基础信息</h3><div className="mfg-form-grid mfg-form-grid--modal">
        <ProductField label="加工单号 *"><div className="mfg-input-action"><ProductTextInput name="id" required defaultValue={order?.id ?? `MO20260803${String(Date.now()).slice(-3)}`} /><QrCode size={17}/></div></ProductField>
        <ProductField label="优先级 *"><ProductSelect name="priority" defaultValue={order?.priority ?? '普通'}><option value="普通">普通</option><option value="高">高</option></ProductSelect></ProductField>
        <ProductField label="需求时间 *"><ProductTextInput name="due" type="datetime-local" required defaultValue={(order?.due ?? '2026-08-06 18:00').replace(' ','T')} /></ProductField>
        <ProductField label="单据来源"><ProductTextInput readOnly value={order?.source ?? '手工录入'} /></ProductField>
      </div></section>
      <section><h3>工件与程序</h3><div className="mfg-form-grid mfg-form-grid--modal">
        <ProductField label="件号 *"><ProductTextInput name="partNo" required defaultValue={order?.partNo}/></ProductField>
        <ProductField label="件名 *"><ProductTextInput name="partName" required defaultValue={order?.partName}/></ProductField>
        <ProductField label="加工程序"><ProductTextInput name="program" defaultValue={order?.program === '待编程' ? '' : order?.program} placeholder="例：MJ-A17-R3.nc"/></ProductField>
        <ProductField label="模具信息"><ProductTextInput name="mold" defaultValue={order?.mold}/></ProductField>
      </div></section>
      <section><div className="mfg-modal-section-title"><h3>工序明细 <Tag tone="blue">至少 1 条</Tag></h3><ProductButton size="small" icon={<Plus size={14}/>}>添加工序</ProductButton></div><div className="mfg-operation-row mfg-operation-row--modal">
        <ProductField label="工序 *"><ProductTextInput name="operation" required defaultValue={order?.operations[0]?.name}/></ProductField>
        <ProductField label="应加工数 *"><ProductTextInput name="planned" type="number" min="1" required defaultValue={order?.operations[0]?.planned ?? 1}/></ProductField>
        <ProductField label="预计工时(h)"><ProductTextInput name="hours" type="number" step="0.5" defaultValue={order?.operations[0]?.hours ?? 1}/></ProductField>
        <ProductField label="加工人员"><ProductTextInput name="worker" defaultValue={order?.operations[0]?.worker === '未分配' ? '' : order?.operations[0]?.worker}/></ProductField>
      </div></section>
    </form>
  </ProductModal>;
}

function OrderDetail({ open, tracking, order, onBack, onEdit, onTrack, onTrackingBack, onPriority }: {open:boolean;tracking:boolean;order:WorkOrder|null;onBack:()=>void;onEdit:()=>void;onTrack:()=>void;onTrackingBack:()=>void;onPriority:()=>void}) {
  return <ProductDrawer open={open} onOpenChange={value => !value && onBack()} title={tracking ? '工件执行追踪' : (order?.id ?? '工单详情')} description={order ? `${order.partNo} · ${order.partName}` : undefined} width="min(760px, calc(100vw - 48px))" footer={order && !tracking ? <><ProductButton onClick={onBack}>关闭</ProductButton>{order.status === '新建' && <ProductButton icon={<CircleAlert size={14}/>} onClick={onPriority}>调整优先级</ProductButton>}{order.status === '新建' && <ProductButton type="primary" icon={<Pencil size={14}/>} onClick={onEdit}>编辑工单</ProductButton>}</> : tracking ? <ProductButton onClick={onTrackingBack}>返回工单详情</ProductButton> : undefined}>
    {order && (tracking ? <Tracking order={order} onBack={onTrackingBack}/> : <div className="mfg-drawer-content">
      <div className="mfg-drawer-tags"><Tag tone={order.status==='加工中'?'blue':order.status==='加工完成'?'green':'neutral'}>{order.status}</Tag>{order.priority==='高'&&<Tag tone="red">高优先级</Tag>}<Tag tone={order.posted?'green':'neutral'}>{order.posted?'已过账':'未过账'}</Tag></div>
      <section className="mfg-drawer-section"><h3>基础信息</h3><dl className="mfg-drawer-grid"><div><dt>需求时间</dt><dd>{order.due}</dd></div><div><dt>单据来源</dt><dd>{order.source}</dd></div><div><dt>创建人</dt><dd>{order.creator}</dd></div><div><dt>创建时间</dt><dd>{order.createdAt}</dd></div></dl></section>
      <section className="mfg-drawer-section"><h3>工件与程序</h3><dl className="mfg-drawer-grid"><div><dt>件号</dt><dd>{order.partNo}</dd></div><div><dt>件名</dt><dd>{order.partName}</dd></div><div><dt>加工程序</dt><dd>{order.program}</dd></div><div><dt>模具信息</dt><dd>{order.mold}</dd></div></dl></section>
      <section className="mfg-drawer-section"><div className="mfg-modal-section-title"><div><h3>工序进度</h3><p>同步装夹、加工和拆夹结果</p></div></div><div className="mfg-drawer-operation-list">{order.operations.map((op,i)=><article key={op.name}><header><span>{String(i+1).padStart(2,'0')}</span><strong>{op.name}</strong><Tag tone={op.state==='已完成'?'green':op.state==='加工中'?'blue':'neutral'}>{op.state}</Tag></header><div><span>应加工 <b>{op.planned}</b></span><span>已加工 <b>{op.completed}</b></span><span>待加工 <b>{op.planned-op.completed}</b></span><span>预计 {op.hours}h</span><span>{op.worker}</span></div><ProductButton type="text" size="small" onClick={onTrack}>执行追踪</ProductButton></article>)}</div></section>
      <section className="mfg-drawer-section"><h3>操作日志</h3><div className="mfg-log"><div><i/><span><b>{order.creator}</b> 创建工单</span><time>{order.createdAt}</time></div>{order.priority==='高'&&<div><i/><span><b>robot-admin</b> 将优先级调整为“高”</span><time>刚刚</time></div>}</div></section>
    </div>)}
  </ProductDrawer>;
}

function Tracking({order,onBack}:{order:WorkOrder;onBack:()=>void}) {
  const op = order.operations[0];
  return <div className="mfg-tracking"><div className="mfg-tracking-header"><ProductButton type="text" size="small" icon={<ArrowLeft size={14}/>} onClick={onBack}>返回工单详情</ProductButton><Tag tone="blue">{op.name} · 应加工 {op.planned} 件</Tag></div>
    <section className="mfg-card"><div className="mfg-table-wrap"><table className="mfg-table"><thead><tr><th>序号</th><th>件号 / 件名</th><th>唯一编码 SN</th><th>加工程序</th><th>当前状态</th><th>执行进度</th><th className="mfg-table__right">操作</th></tr></thead><tbody>{Array.from({length:op.planned},(_,i)=>{const generated=i<op.completed+1;return <tr key={i}><td>{String(i+1).padStart(2,'0')}</td><td><b>{order.partNo}</b><small>{order.partName}</small></td><td>{generated?<code>SN-{order.partNo}-{String(i+1).padStart(3,'0')}</code>:<span className="mfg-muted">未生成</span>}</td><td>{order.program}</td><td><Tag tone={i<op.completed?'green':generated?'blue':'neutral'}>{i<op.completed?'已加工':generated?'加工中':'待生成'}</Tag></td><td><div className="mfg-progress"><span style={{width:i<op.completed?'100%':generated?'58%':'0%'}}/></div></td><td className="mfg-table__right">{generated?<button className="mfg-row-action">查看轨迹</button>:'—'}</td></tr>})}</tbody></table></div></section>
    <section className="mfg-trace-note"><FileSpreadsheet size={18}/><div><b>执行轨迹说明</b><p>生成 SN 后将自动汇集装夹、MCR 运输、CNC 加工和拆夹节点记录。</p></div></section>
  </div>;
}
