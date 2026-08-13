import { useState, useMemo } from 'react';
import { Check, Copy, Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { ArcoButton, ArcoIconButton, ArcoModal, ArcoTextArea, ArcoTextInput } from './ProductUI';
import { INITIAL_SOFTWARE_PRODUCTS, type SoftwareProduct } from '../softwareProducts';
import { GLOBAL_ACTION_COPY, useI18n, type AppLocale } from '../i18n';

const SOFTWARE_COPY: Record<AppLocale, Record<string, string>> = {
  'zh-Hans': { title:'软件产品', description:'管理系统中已登记的软件产品信息与标识码', search:'搜索', add:'新增', name:'软件产品名称', itemDescription:'描述', actions:'操作', noMatch:'未找到匹配的软件产品', empty:'暂无软件产品，请点击“新增”创建', copy:'复制 Key', copied:'已复制', edit:'编辑', delete:'删除', addTitle:'新增软件产品', editTitle:'编辑软件产品', addHelp:'填写名称与描述，保存后系统将自动生成唯一 Key', cancel:'取消', saveChanges:'保存修改', productName:'软件产品名称', input:'请输入', deleteTitle:'删除软件产品', confirmDelete:'删除', deletePrefix:'确认要删除软件产品“', deleteSuffix:'”吗？删除后无法恢复。', shadow:'墨影控制器驱动', seer:'仙工控制器驱动', jaka:'节卡机械臂驱动' },
  en: { title:'Software Products', description:'Manage registered software products and their identifiers.', search:'Search', add:'Create', name:'Software Product', itemDescription:'Description', actions:'Actions', noMatch:'No matching software products.', empty:'No software products yet. Select Create to begin.', copy:'Copy key', copied:'Copied', edit:'Edit', delete:'Delete', addTitle:'Create Software Product', editTitle:'Edit Software Product', addHelp:'Enter a name and description. A unique key will be generated automatically.', cancel:'Cancel', saveChanges:'Save', productName:'Product Name', input:'Enter text', deleteTitle:'Delete Software Product', confirmDelete:'Delete', deletePrefix:'Are you sure you want to delete “', deleteSuffix:'”? This action cannot be undone.', shadow:'Shadow Controller Driver', seer:'SEER Controller Driver', jaka:'JAKA Robot Arm Driver' },
  ms: { title:'Produk Perisian', description:'Urus produk perisian berdaftar dan pengecamnya.', search:'Cari', add:'Cipta', name:'Produk Perisian', itemDescription:'Penerangan', actions:'Tindakan', noMatch:'Tiada produk perisian sepadan.', empty:'Tiada produk perisian. Pilih Cipta untuk bermula.', copy:'Salin kunci', copied:'Disalin', edit:'Edit', delete:'Padam', addTitle:'Cipta Produk Perisian', editTitle:'Edit Produk Perisian', addHelp:'Masukkan nama dan penerangan. Kunci unik akan dijana secara automatik.', cancel:'Batal', saveChanges:'Simpan', productName:'Nama Produk', input:'Masukkan teks', deleteTitle:'Padam Produk Perisian', confirmDelete:'Padam', deletePrefix:'Adakah anda pasti mahu memadam “', deleteSuffix:'”? Tindakan ini tidak boleh dibuat asal.', shadow:'Pemacu Pengawal Shadow', seer:'Pemacu Pengawal SEER', jaka:'Pemacu Lengan Robot JAKA' },
  vi: { title:'Sản phẩm phần mềm', description:'Quản lý sản phẩm phần mềm đã đăng ký và mã định danh.', search:'Tìm kiếm', add:'Tạo', name:'Sản phẩm phần mềm', itemDescription:'Mô tả', actions:'Thao tác', noMatch:'Không có sản phẩm phần mềm phù hợp.', empty:'Chưa có sản phẩm phần mềm. Chọn Tạo để bắt đầu.', copy:'Sao chép khóa', copied:'Đã sao chép', edit:'Chỉnh sửa', delete:'Xóa', addTitle:'Tạo sản phẩm phần mềm', editTitle:'Chỉnh sửa sản phẩm', addHelp:'Nhập tên và mô tả. Hệ thống sẽ tự động tạo khóa duy nhất.', cancel:'Hủy', saveChanges:'Lưu', productName:'Tên sản phẩm', input:'Nhập nội dung', deleteTitle:'Xóa sản phẩm phần mềm', confirmDelete:'Xóa', deletePrefix:'Bạn có chắc muốn xóa “', deleteSuffix:'” không? Không thể hoàn tác thao tác này.', shadow:'Trình điều khiển bộ điều khiển Shadow', seer:'Trình điều khiển bộ điều khiển SEER', jaka:'Trình điều khiển tay máy JAKA' },
  'zh-Hant': { title:'軟體產品', description:'管理系統中已登記的軟體產品資訊與識別碼', search:'搜尋', add:'新增', name:'軟體產品名稱', itemDescription:'描述', actions:'操作', noMatch:'找不到相符的軟體產品', empty:'暫無軟體產品，請點擊「新增」建立', copy:'複製 Key', copied:'已複製', edit:'編輯', delete:'刪除', addTitle:'新增軟體產品', editTitle:'編輯軟體產品', addHelp:'填寫名稱與描述，儲存後系統將自動產生唯一 Key', cancel:'取消', saveChanges:'儲存修改', productName:'軟體產品名稱', input:'請輸入', deleteTitle:'刪除軟體產品', confirmDelete:'刪除', deletePrefix:'確認要刪除軟體產品「', deleteSuffix:'」嗎？刪除後無法復原。', shadow:'墨影控制器驅動', seer:'仙工控制器驅動', jaka:'節卡機械臂驅動' },
};

type FormData = Pick<SoftwareProduct, 'name' | 'description'>;
const emptyForm: FormData = { name: '', description: '' };

function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const seg1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const seg2 = Array.from({ length: 4 }, () => nums[Math.floor(Math.random() * nums.length)]).join('');
  return `SW-${seg1}-${seg2}`;
}

export function SoftwareManager({
  items: controlledItems,
  onItemsChange,
}: {
  items?: SoftwareProduct[];
  onItemsChange?: (items: SoftwareProduct[]) => void;
}) {
  const { locale } = useI18n();
  const copy = SOFTWARE_COPY[locale];
  const action = GLOBAL_ACTION_COPY[locale];
  const productName = (item: SoftwareProduct) => item.id === 'sw1' ? copy.shadow : item.id === 'sw2' ? copy.seer : item.id === 'sw3' ? copy.jaka : item.name;
  const [internalItems, setInternalItems] = useState<SoftwareProduct[]>(INITIAL_SOFTWARE_PRODUCTS);
  const items = controlledItems ?? internalItems;
  const setItems = onItemsChange ?? setInternalItems;
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
      i => productName(i).toLowerCase().includes(q) || i.key.toLowerCase().includes(q) || i.description.toLowerCase().includes(q),
    );
  }, [items, query, locale]);

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
    <div className="ds-page ds-page--list">
      {/* Header + Search row */}
      <div className="ds-page__header ds-page-header">
        <div style={{ minWidth: 0 }}>
          <h1 style={{ color: 'var(--app-heading)', fontSize: 20, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{copy.title}</h1>
          <p style={{ color: 'var(--app-muted)', fontSize: 12, margin: '4px 0 0', fontWeight: 400 }}>{copy.description}</p>
        </div>
        <div className="ds-page-toolbar">
          <div style={{ position: 'relative', width: 312 }}>
            <Search size={14} color="var(--app-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <ArcoTextInput
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={action.search}
              aria-label={action.search}
              style={{ width: '100%', height: 40, padding: '0 12px 0 36px', fontSize: 14 }}
            />
          </div>
          <ArcoButton type="primary" size="large" icon={<Plus size={15} />} onClick={openAdd}>
            {action.create}
          </ArcoButton>
        </div>
      </div>

      {/* Table */}
      <div className="ds-table-surface">
        <div className="ds-table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--ds-table-cell-font-size)', fontWeight: 'var(--ds-table-cell-font-weight)', color: 'var(--ds-table-cell-color)' }}>
            <thead>
              <tr className="ds-table-header" style={{ height: 44, borderBottom: '1px solid var(--ds-table-header-divider)', position: 'sticky', top: 0, background: 'var(--ds-table-header-bg)' }}>
                <th style={{ textAlign: 'left', padding: '0 16px' }}>{copy.name}</th>
                <th style={{ textAlign: 'left', padding: '0 16px' }}>{copy.itemDescription}</th>
                <th style={{ textAlign: 'left', padding: '0 16px' }}>Key</th>
                <th style={{ textAlign: 'right', padding: '0 16px', width: 120 }}>{copy.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4}><div className="ds-empty">{query.trim() ? copy.noMatch : copy.empty}</div></td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr className="ds-table-row" key={item.id} style={{ borderBottom: '1px solid var(--ds-table-row-divider)' }}>
                    <td style={{ height: 60, padding: '0 16px' }}>
                      <span className="ds-table-cell--primary">{productName(item)}</span>
                    </td>
                    <td style={{ height: 60, padding: '0 16px', color: item.description ? 'var(--ds-table-cell-color)' : 'var(--ds-table-cell-secondary-color)' }}>
                      {item.description || '--'}
                    </td>
                    <td style={{ height: 60, padding: '0 16px' }}>
                      <button
                        type="button"
                        className="ds-copy-key"
                        data-state={copiedKey === item.key ? 'success' : undefined}
                        onClick={() => handleCopy(item.key)}
                        title={copiedKey === item.key ? copy.copied : copy.copy}
                      >
                        {item.key}
                        {copiedKey === item.key ? <Check size={12} /> : <Copy size={11} />}
                      </button>
                    </td>
                    <td style={{ height: 60, padding: '0 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <ArcoIconButton size="small" icon={<Edit3 size={13} />} aria-label={action.edit} title={action.edit} onClick={() => openEdit(item)} />
                        <ArcoIconButton size="small" icon={<Trash2 size={13} />} aria-label={action.delete} title={action.delete} onClick={() => setDeleteTarget(item)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      <ArcoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingId ? copy.editTitle : copy.addTitle}
        description={editingId ? undefined : copy.addHelp}
        size="md"
        footer={(
          <>
            <ArcoButton onClick={() => setModalOpen(false)}>{action.cancel}</ArcoButton>
            <ArcoButton type="primary" onClick={handleSave} disabled={!form.name.trim()}>
              {editingId ? action.save : action.create}
            </ArcoButton>
          </>
        )}
      >
        <div style={{ display: 'grid', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--app-heading)', marginBottom: 8 }}><span style={{ marginRight: 6, color: 'var(--app-danger)' }}>*</span>{copy.productName}</label>
            <ArcoTextInput
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder={copy.input}
              style={{ width: '100%', height: 40 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--app-heading)', marginBottom: 8 }}>{copy.itemDescription}</label>
            <ArcoTextArea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder={copy.input}
              rows={6}
              style={{ width: '100%', minHeight: 140, resize: 'vertical' }}
            />
          </div>
        </div>
      </ArcoModal>

      {/* ── Delete Confirm Modal ── */}
      <ArcoModal
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={copy.deleteTitle}
        size="sm"
        status="danger"
        footer={(
          <>
            <ArcoButton onClick={() => setDeleteTarget(null)}>{action.cancel}</ArcoButton>
            <ArcoButton type="primary" status="danger" onClick={handleDelete}>{action.delete}</ArcoButton>
          </>
        )}
      >
        <p style={{ color: 'var(--app-text)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          {copy.deletePrefix}<strong style={{ color: 'var(--app-heading)' }}>{deleteTarget ? productName(deleteTarget) : ''}</strong>{copy.deleteSuffix}
        </p>
      </ArcoModal>
    </div>
  );
}
