import { useState, useMemo } from 'react';
import { Check, Copy, Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { ArcoButton, ArcoIconButton, ArcoModal, ArcoTextInput } from './ArcoLike';

interface SoftwareProduct {
  id: string;
  name: string;
  description: string;
  key: string;
}

function initialData(): SoftwareProduct[] {
  return [
    { id: 'sw1', name: '墨影控制器驱动', description: '', key: 'SW-EVEX-Y2R3' },
    { id: 'sw2', name: '仙工控制器驱动', description: '', key: 'SW-KXMZ-A7B1' },
    { id: 'sw3', name: '节卡机械臂驱动', description: '', key: 'SW-PLQN-D9F6' },
  ];
}

type FormData = Pick<SoftwareProduct, 'name' | 'description'>;
const emptyForm: FormData = { name: '', description: '' };

function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const seg1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const seg2 = Array.from({ length: 4 }, () => nums[Math.floor(Math.random() * nums.length)]).join('');
  return `SW-${seg1}-${seg2}`;
}

export function SoftwareManager() {
  const [items, setItems] = useState<SoftwareProduct[]>(initialData);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<SoftwareProduct | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      i => i.name.toLowerCase().includes(q) || i.key.toLowerCase().includes(q) || i.description.toLowerCase().includes(q),
    );
  }, [items, query]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: SoftwareProduct) {
    setEditingId(item.id);
    setForm({ name: item.name, description: item.description });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (editingId) {
      setItems(prev => prev.map(i => i.id === editingId ? { ...i, ...form } : i));
    } else {
      setItems(prev => [...prev, { id: `sw-${Date.now()}`, ...form, key: generateKey() }]);
    }
    setModalOpen(false);
  }

  function handleCopy(key: string) {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }).catch(() => {});
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px 28px', background: 'var(--app-bg)', overflow: 'hidden', boxSizing: 'border-box' }}>
      {/* Header + Search row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0, gap: 20 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ color: 'var(--app-heading)', fontSize: 20, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>软件产品</h1>
          <p style={{ color: 'var(--app-muted)', fontSize: 12, margin: '4px 0 0', fontWeight: 400 }}>管理系统中已登记的软件产品信息与标识码</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={14} color="var(--app-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <ArcoTextInput
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索名称、Key 或描述..."
              style={{ width: '100%', height: 36, borderRadius: 10, padding: '0 12px 0 36px', fontSize: 13 }}
            />
          </div>
          <ArcoButton type="primary" icon={<Plus size={15} />} onClick={openAdd}>
            新增
          </ArcoButton>
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, minHeight: 0, borderRadius: 12, border: '1px solid var(--app-border)', background: 'var(--app-surface)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--app-border)', position: 'sticky', top: 0, zIndex: 1 }}>
                <th style={{ textAlign: 'left', padding: '14px 20px', color: 'var(--app-muted)', fontWeight: 500, fontSize: 11 }}>软件产品名称</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', color: 'var(--app-muted)', fontWeight: 500, fontSize: 11 }}>描述</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', color: 'var(--app-muted)', fontWeight: 500, fontSize: 11 }}>Key</th>
                <th style={{ textAlign: 'right', padding: '14px 20px', color: 'var(--app-muted)', fontWeight: 500, fontSize: 11, width: 120 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '56px 20px', textAlign: 'center', color: 'var(--app-muted)', fontSize: 13 }}>
                    {query.trim() ? '未找到匹配的软件产品' : '暂无软件产品，点击"新增软件产品"开始添加'}
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--app-border)', transition: 'background 0.15s ease' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: 'var(--app-heading)', fontWeight: 500, fontSize: 13 }}>{item.name}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: item.description ? 'var(--app-text)' : 'var(--app-subtle)', fontSize: 13 }}>
                      {item.description || '--'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => handleCopy(item.key)}
                        title="点击复制 Key"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: copiedKey === item.key ? 'var(--app-success-soft)' : 'var(--app-accent-soft)',
                          color: copiedKey === item.key ? 'var(--app-success)' : 'var(--app-accent)',
                          fontSize: 12, fontWeight: 500, padding: '4px 12px', borderRadius: 8,
                          border: copiedKey === item.key ? '1px solid var(--app-border)' : '1px solid var(--app-accent-border)',
                          fontFamily: 'SF Mono, Monaco, monospace',
                          cursor: 'pointer', transition: 'all 0.15s ease',
                        }}
                      >
                        {item.key}
                        {copiedKey === item.key ? <Check size={12} /> : <Copy size={11} />}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <ArcoIconButton size="small" icon={<Edit3 size={13} />} aria-label="编辑" title="编辑" onClick={() => openEdit(item)} />
                        <ArcoIconButton size="small" icon={<Trash2 size={13} />} aria-label="删除" title="删除" onClick={() => setDeleteTarget(item)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

                {/* Footer stats */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--app-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ color: 'var(--app-muted)', fontSize: 12 }}>
            共 {filtered.length} 个软件产品{query.trim() ? `（筛选自 ${items.length} 条）` : ''}
          </span>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      <ArcoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingId ? '编辑软件产品' : '新增软件产品'}
        width={480}
        footer={(
          <>
            <ArcoButton onClick={() => setModalOpen(false)}>取消</ArcoButton>
            <ArcoButton type="primary" onClick={handleSave} disabled={!form.name.trim()}>
              {editingId ? '保存修改' : '添加'}
            </ArcoButton>
          </>
        )}
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--app-text)', marginBottom: 6 }}>软件产品名称 *</label>
            <ArcoTextInput
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="例如：墨影控制器驱动"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--app-text)', marginBottom: 6 }}>描述</label>
            <ArcoTextInput
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="记录该软件产品的详细说明（可选）"
              style={{ width: '100%' }}
            />
          </div>
          {!editingId && (
            <div style={{ background: 'var(--app-soft)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--app-border)' }}>
              <span style={{ color: 'var(--app-muted)', fontSize: 11, fontWeight: 500 }}>Key 将在保存后由系统自动生成</span>
            </div>
          )}
        </div>
      </ArcoModal>

      {/* ── Delete Confirm Modal ── */}
      <ArcoModal
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="删除软件产品"
        width={400}
        status="danger"
        footer={(
          <>
            <ArcoButton onClick={() => setDeleteTarget(null)}>取消</ArcoButton>
            <ArcoButton type="primary" status="danger" onClick={handleDelete}>确认删除</ArcoButton>
          </>
        )}
      >
        <p style={{ color: 'var(--app-text)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          确认删除软件产品「<strong style={{ color: 'var(--app-heading)' }}>{deleteTarget?.name}</strong>」吗？
          该操作不可撤销。
        </p>
      </ArcoModal>
    </div>
  );
}
