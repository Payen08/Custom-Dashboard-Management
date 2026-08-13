import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type UIEvent } from 'react';
import {
  ChevronRight, Edit3, FileText, RefreshCw, Search, Upload,
} from 'lucide-react';
import {
  ArcoButton, ArcoField, ArcoIconButton, ArcoModal, ArcoTag, ArcoTextArea, ArcoTextInput,
} from './ProductUI';
import { useI18n, type AppLocale } from '../i18n';

const INSTALL_COPY: Record<AppLocale, Record<string, string>> = {
  'zh-Hans': { title:'装机记录', description:'追踪机器人从软件出库到交付的安装版本、执行过程与责任人', search:'搜索', refresh:'刷新', export:'导出', projectId:'项目编号', projectName:'项目名称', robotId:'机器人编号', robotIp:'机器人 IP', model:'型号', releaseTime:'软件出库时间', processId:'流程编号', itemDescription:'描述', operator:'操作人', actions:'操作', noMatch:'未找到匹配的装机记录', details:'查看详情', edit:'编辑记录', suzhou:'苏州柔性产线项目', hangzhou:'杭州仓储自动化项目', shanghai:'上海实验室验证项目', nanjing:'南京智能工厂项目', desc1:'A 区物料搬运工位首台装机，已完成联调。', desc2:'B 区首台验证设备。', desc3:'交付前软件基线装机。', desc4:'姿态算法与驱动兼容性验证。', desc5:'样机装机归档。', humanoid:'人形双足机器人' },
  en: { title:'Installation Records', description:'Track installed versions, execution history, and owners from software release through delivery.', search:'Search', refresh:'Refresh', export:'Export', projectId:'Project ID', projectName:'Project Name', robotId:'Robot ID', robotIp:'Robot IP', model:'Model', releaseTime:'Software Release Time', processId:'Process ID', itemDescription:'Description', operator:'Operator', actions:'Actions', noMatch:'No matching installation records.', details:'View Details', edit:'Edit Record', suzhou:'Suzhou Flexible Production Line', hangzhou:'Hangzhou Warehouse Automation', shanghai:'Shanghai Lab Validation', nanjing:'Nanjing Smart Factory', desc1:'First installation at the Area A material-handling station; commissioning completed.', desc2:'First validation unit in Area B.', desc3:'Software baseline installed before delivery.', desc4:'Pose algorithm and driver compatibility validation.', desc5:'Prototype installation archived.', humanoid:'Humanoid Biped Robot' },
  ms: { title:'Rekod Pemasangan', description:'Jejak versi, proses pelaksanaan dan pemilik dari keluaran perisian hingga penghantaran.', search:'Cari', refresh:'Muat semula', export:'Eksport', projectId:'ID Projek', projectName:'Nama Projek', robotId:'ID Robot', robotIp:'IP Robot', model:'Model', releaseTime:'Masa Keluaran Perisian', processId:'ID Proses', itemDescription:'Penerangan', operator:'Operator', actions:'Tindakan', noMatch:'Tiada rekod pemasangan sepadan.', details:'Lihat Butiran', edit:'Edit Rekod', suzhou:'Barisan Pengeluaran Fleksibel Suzhou', hangzhou:'Automasi Gudang Hangzhou', shanghai:'Pengesahan Makmal Shanghai', nanjing:'Kilang Pintar Nanjing', desc1:'Pemasangan pertama di stesen pengendalian bahan Kawasan A; pentauliahan selesai.', desc2:'Unit pengesahan pertama di Kawasan B.', desc3:'Garis dasar perisian dipasang sebelum penghantaran.', desc4:'Pengesahan algoritma pose dan keserasian pemacu.', desc5:'Pemasangan prototaip diarkibkan.', humanoid:'Robot Humanoid Dwiped' },
  vi: { title:'Lịch sử cài đặt', description:'Theo dõi phiên bản, quá trình thực hiện và người phụ trách từ khi xuất phần mềm đến bàn giao.', search:'Tìm kiếm', refresh:'Làm mới', export:'Xuất', projectId:'Mã dự án', projectName:'Tên dự án', robotId:'Mã Robot', robotIp:'IP Robot', model:'Mô hình', releaseTime:'Thời gian xuất phần mềm', processId:'Mã quy trình', itemDescription:'Mô tả', operator:'Người thực hiện', actions:'Thao tác', noMatch:'Không có bản ghi cài đặt phù hợp.', details:'Xem chi tiết', edit:'Sửa bản ghi', suzhou:'Dây chuyền linh hoạt Tô Châu', hangzhou:'Tự động hóa kho Hàng Châu', shanghai:'Xác thực phòng thí nghiệm Thượng Hải', nanjing:'Nhà máy thông minh Nam Kinh', desc1:'Cài đặt đầu tiên tại trạm vận chuyển Khu A; đã hoàn tất chạy thử.', desc2:'Thiết bị xác thực đầu tiên tại Khu B.', desc3:'Đã cài đặt bản phần mềm chuẩn trước bàn giao.', desc4:'Xác thực thuật toán tư thế và khả năng tương thích trình điều khiển.', desc5:'Đã lưu hồ sơ cài đặt nguyên mẫu.', humanoid:'Robot hai chân hình người' },
  'zh-Hant': { title:'裝機記錄', description:'追蹤機器人從軟體出庫到交付的安裝版本、執行過程與負責人', search:'搜尋', refresh:'重新整理', export:'匯出', projectId:'專案編號', projectName:'專案名稱', robotId:'機器人編號', robotIp:'機器人 IP', model:'型號', releaseTime:'軟體出庫時間', processId:'流程編號', itemDescription:'描述', operator:'操作人', actions:'操作', noMatch:'找不到相符的裝機記錄', details:'查看詳情', edit:'編輯記錄', suzhou:'蘇州柔性產線專案', hangzhou:'杭州倉儲自動化專案', shanghai:'上海實驗室驗證專案', nanjing:'南京智慧工廠專案', desc1:'A 區物料搬運工位首台裝機，已完成聯調。', desc2:'B 區首台驗證設備。', desc3:'交付前軟體基線裝機。', desc4:'姿態演算法與驅動相容性驗證。', desc5:'樣機裝機歸檔。', humanoid:'人形雙足機器人' },
};

interface SoftwareItem {
  name: string;
  version?: string;
  packageName?: string;
}

interface InstallationActivity {
  softwareName?: string;
  time: string;
  packageName: string;
  version: string;
  action: '安装' | '回退' | '手动' | '卸载';
  operator: string;
}

interface InstallationRecord {
  id: string;
  projectCode: string;
  projectName: string;
  robotId: string;
  robotIp: string;
  model: string;
  deliveredAt: string;
  workflowId: string;
  description: string;
  operator: string;
  installedSoftware: SoftwareItem[];
  missingSoftware: SoftwareItem[];
  activities: InstallationActivity[];
}

const INITIAL_RECORDS: InstallationRecord[] = [
  {
    id: 'install-001',
    projectCode: 'PRJ-MY-260710',
    projectName: '苏州柔性产线项目',
    robotId: 'RBT-MY-260710-794',
    robotIp: '172.31.22.101',
    model: 'Man-Robot',
    deliveredAt: '2026-07-10 16:58',
    workflowId: 'FLOW-INS-260710-028',
    description: 'A 区物料搬运工位首台装机，已完成联调。',
    operator: 'admin',
    installedSoftware: [
      { name: '墨影控制器', version: 'v1.8.0', packageName: 'device-backend-for-shadow-controller_1.8.0_x86_64.deb' },
      { name: '电动夹爪', version: 'v1.8.0', packageName: 'device-driver-for-electric-gripper_1.8.0_x86_64.deb' },
      { name: '六维力传感器', version: 'v1.8.0', packageName: 'device-driver-for-force-sensor_1.8.0_x86_64.deb' },
      { name: '3D结构光相机', version: 'v1.8.0', packageName: 'device-driver-for-3d-camera_1.8.0_x86_64.deb' },
    ],
    missingSoftware: [{ name: '节卡机械臂' }],
    activities: [
      { softwareName: '墨影控制器', time: '07-10 16:51', packageName: 'device-backend-for-shadow-controller_1.8.0_x86_64.deb', version: '1.8.0', action: '安装', operator: 'admin' },
      { softwareName: '墨影控制器', time: '07-10 16:48', packageName: 'device-backend-for-shadow-controller_1.8.0-rc.2_x86_64.deb', version: '1.8.0-rc.2', action: '回退', operator: 'admin' },
      { softwareName: '墨影控制器', time: '07-10 16:42', packageName: 'device-backend-for-shadow-controller_1.8.0-rc.2_x86_64.deb', version: '1.8.0-rc.2', action: '手动', operator: 'admin' },
      { softwareName: '墨影控制器', time: '07-10 16:36', packageName: 'device-backend-for-shadow-controller_1.7.2_x86_64.deb', version: '1.7.2', action: '卸载', operator: 'admin' },
      { softwareName: '3D结构光相机', time: '07-10 16:42', packageName: 'device-driver-for-3d-camera_1.8.0_x86_64.deb', version: '1.8.0', action: '安装', operator: 'admin' },
      { softwareName: '六维力传感器', time: '07-10 16:34', packageName: 'device-driver-for-force-sensor_1.8.0_x86_64.deb', version: '1.8.0', action: '安装', operator: 'admin' },
      { softwareName: '电动夹爪', time: '07-10 16:26', packageName: 'device-driver-for-electric-gripper_1.8.0_x86_64.deb', version: '1.8.0', action: '安装', operator: 'admin' },
    ],
  },
  {
    id: 'install-002', projectCode: 'PRJ-MY-260710', projectName: '苏州柔性产线项目', robotId: 'RBT-MY-260710-795', robotIp: '172.31.22.102', model: 'MCR4O-MY', deliveredAt: '2026-07-10 15:42', workflowId: 'FLOW-INS-260710-027', description: 'B 区首台验证设备。', operator: '赵晨',
    installedSoftware: [{ name: '墨影控制器', version: 'v1.8.0' }, { name: '电动夹爪', version: 'v1.8.0' }], missingSoftware: [{ name: '视觉相机' }],
    activities: [{ softwareName: '墨影控制器', time: '07-10 15:42', packageName: 'mcr4o-base_1.8.0_x86_64.deb', version: '1.8.0', action: '安装', operator: '赵晨' }],
  },
  {
    id: 'install-003', projectCode: 'PRJ-HZ-260708', projectName: '杭州仓储自动化项目', robotId: 'RBT-MY-260708-611', robotIp: '172.31.18.44', model: 'Man-Robot', deliveredAt: '2026-07-08 10:16', workflowId: 'FLOW-INS-260708-014', description: '交付前软件基线装机。', operator: '李航',
    installedSoftware: [{ name: '墨影控制器', version: 'v1.7.2' }, { name: '六维力传感器', version: 'v1.7.2' }], missingSoftware: [],
    activities: [{ softwareName: '墨影控制器', time: '07-08 10:16', packageName: 'shadow-controller_1.7.2_x86_64.deb', version: '1.7.2', action: '安装', operator: '李航' }],
  },
  {
    id: 'install-004', projectCode: 'PRJ-SH-260706', projectName: '上海实验室验证项目', robotId: 'RBT-MY-260706-318', robotIp: '10.33.16.87', model: '人形双足机器人', deliveredAt: '2026-07-06 18:21', workflowId: 'FLOW-INS-260706-008', description: '姿态算法与驱动兼容性验证。', operator: '陈雨',
    installedSoftware: [{ name: '墨影控制器', version: 'v1.8.0-rc.1' }], missingSoftware: [{ name: '伺服电机驱动' }, { name: '距离传感器' }],
    activities: [{ softwareName: '墨影控制器', time: '07-06 18:21', packageName: 'humanoid-controller_1.8.0-rc.1_x86_64.deb', version: '1.8.0-rc.1', action: '安装', operator: '陈雨' }],
  },
  {
    id: 'install-005', projectCode: 'PRJ-NJ-260703', projectName: '南京智能工厂项目', robotId: 'RBT-MY-260703-206', robotIp: '172.30.6.59', model: 'MCR4O-MY', deliveredAt: '2026-07-03 14:08', workflowId: 'FLOW-INS-260703-006', description: '样机装机归档。', operator: '王岩',
    installedSoftware: [{ name: '墨影控制器', version: 'v1.6.0' }], missingSoftware: [{ name: '气动夹爪' }],
    activities: [{ softwareName: '墨影控制器', time: '07-03 14:08', packageName: 'mcr4o-base_1.6.0_x86_64.deb', version: '1.6.0', action: '安装', operator: '王岩' }],
  },
];

function StatusPill({ tone = 'neutral', children }: { tone?: 'success' | 'danger' | 'accent' | 'neutral'; children: ReactNode }) {
  return <ArcoTag tone={tone} style={{ flexShrink: 0 }}>{children}</ArcoTag>;
}

function ModelPill({ children }: { children: ReactNode }) {
  return <ArcoTag>{children}</ArcoTag>;
}

function RecordEditModal({ record, onClose, onSave }: { record: InstallationRecord | null; onClose: () => void; onSave: (next: InstallationRecord) => void }) {
  const [draft, setDraft] = useState<InstallationRecord | null>(null);
  const open = Boolean(record);
  const activeDraft = draft?.id === record?.id ? draft : record;
  const close = () => {
    setDraft(null);
    onClose();
  };

  return (
    <ArcoModal
      open={open}
      onOpenChange={next => !next && close()}
      title="编辑装机记录"
      size="md"
      footer={<><ArcoButton onClick={close}>取消</ArcoButton><ArcoButton type="primary" onClick={() => { if (activeDraft) { setDraft(null); onSave(activeDraft); } }}>保存记录</ArcoButton></>}
    >
      {activeDraft && <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--app-soft)', color: 'var(--app-text)', fontSize: 14 }}>
          <strong style={{ color: 'var(--app-heading)' }}>{activeDraft.robotId}</strong><span style={{ margin: '0 7px', color: 'var(--app-muted)' }}>·</span>{activeDraft.model}<span style={{ margin: '0 7px', color: 'var(--app-muted)' }}>·</span>{activeDraft.robotIp}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <ArcoField label="项目编号"><ArcoTextInput value={activeDraft.projectCode} onChange={event => setDraft({ ...activeDraft, projectCode: event.target.value })} /></ArcoField>
          <ArcoField label="项目名称"><ArcoTextInput value={activeDraft.projectName} onChange={event => setDraft({ ...activeDraft, projectName: event.target.value })} /></ArcoField>
        </div>
        <ArcoField label="装机备注"><ArcoTextArea rows={4} value={activeDraft.description} onChange={event => setDraft({ ...activeDraft, description: event.target.value })} /></ArcoField>
      </div>}
    </ArcoModal>
  );
}

export function InstallationRecordsManager() {
  const { locale } = useI18n();
  const copy = INSTALL_COPY[locale];
  const displayRecord = (record: InstallationRecord) => ({
    projectName: record.id === 'install-001' || record.id === 'install-002' ? copy.suzhou : record.id === 'install-003' ? copy.hangzhou : record.id === 'install-004' ? copy.shanghai : record.id === 'install-005' ? copy.nanjing : record.projectName,
    description: ({ 'install-001':copy.desc1, 'install-002':copy.desc2, 'install-003':copy.desc3, 'install-004':copy.desc4, 'install-005':copy.desc5 } as Record<string,string>)[record.id] ?? record.description,
    model: record.id === 'install-004' ? copy.humanoid : record.model,
  });
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<InstallationRecord | null>(null);
  const [scrollEdges, setScrollEdges] = useState({ left: false, right: false });
  const tableScrollRef = useRef<HTMLDivElement>(null);

  const detailRecord = records.find(record => record.id === detailId) ?? null;
  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return records;
    return records.filter(record => [record.projectCode, record.projectName, record.robotId, record.robotIp].some(value => value.toLowerCase().includes(normalized)));
  }, [query, records]);

  const saveRecord = (next: InstallationRecord) => {
    setRecords(current => current.map(record => record.id === next.id ? next : record));
    setEditingRecord(null);
  };

  const refreshRecords = () => {
    if (refreshing) return;
    setRefreshing(true);
    window.setTimeout(() => {
      setRecords(current => [...current]);
      setRefreshing(false);
    }, 500);
  };

  const exportRecords = () => {
    const columns: Array<[string, keyof InstallationRecord]> = [
      ['项目编号', 'projectCode'], ['项目名称', 'projectName'], ['机器人编号', 'robotId'], ['机器人 IP', 'robotIp'],
      ['型号', 'model'], ['软件出库时间', 'deliveredAt'], ['流程编号', 'workflowId'], ['描述', 'description'], ['操作人', 'operator'],
    ];
    const escapeCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [columns.map(([label]) => escapeCell(label)).join(','), ...filteredRecords.map(record => columns.map(([, key]) => escapeCell(record[key])).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `装机记录-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateScrollEdges = (element: HTMLDivElement | null) => {
    if (!element) return;
    const next = {
      left: element.scrollLeft > 1,
      right: element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
    };
    setScrollEdges(current => current.left === next.left && current.right === next.right ? current : next);
  };

  useEffect(() => {
    const element = tableScrollRef.current;
    if (!element) return;
    updateScrollEdges(element);
    const observer = new ResizeObserver(() => updateScrollEdges(element));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleTableScroll = (event: UIEvent<HTMLDivElement>) => updateScrollEdges(event.currentTarget);

  return (
    <div className="ds-page ds-page--list">
      <div className="ds-page__header ds-page-header">
        <div style={{ minWidth: 0 }}>
          <h1 style={{ color: 'var(--app-heading)', fontSize: 20, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{copy.title}</h1>
          <p style={{ color: 'var(--app-muted)', fontSize: 12, margin: '4px 0 0', fontWeight: 400 }}>{copy.description}</p>
        </div>
        <div className="ds-page-toolbar">
          <div style={{ position: 'relative', width: 312 }}>
            <Search size={14} color="var(--app-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <ArcoTextInput value={query} onChange={event => setQuery(event.target.value)} placeholder={copy.search} aria-label={copy.search} style={{ width: '100%', height: 40, padding: '0 12px 0 36px', fontSize: 14 }} />
          </div>
          <ArcoButton type="outline" size="large" icon={<RefreshCw size={14} />} loading={refreshing} onClick={refreshRecords} style={{ background: 'var(--app-surface)' }}>{copy.refresh}</ArcoButton>
          <ArcoButton type="outline" size="large" icon={<Upload size={14} />} onClick={exportRecords} style={{ background: 'var(--app-surface)' }}>{copy.export}</ArcoButton>
        </div>
      </div>

      <div className="ds-table-surface">
        <div className="ds-table-scroll" ref={tableScrollRef} onScroll={handleTableScroll}>
          <table style={{ width: '100%', minWidth: 1220, borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--ds-table-header-divider)', background: 'var(--ds-table-header-bg)', textAlign: 'left' }}>
              <th style={{ ...stickyFirstHeaderStyle, boxShadow: scrollEdges.left ? stickyLeftShadow : 'none' }}>{copy.projectId}</th>
              {[copy.projectName, copy.robotId, copy.robotIp, copy.model, copy.releaseTime, copy.processId, copy.itemDescription, copy.operator].map(title => <th key={title} style={stickyHeaderStyle}>{title}</th>)}
              <th style={{ ...stickyLastHeaderStyle, boxShadow: scrollEdges.right ? stickyRightShadow : 'none' }}>{copy.actions}</th>
            </tr></thead>
            <tbody>{filteredRecords.length === 0 ? <tr><td colSpan={10}><div className="ds-empty">{copy.noMatch}</div></td></tr> : filteredRecords.map(record => <tr className="ds-table-row" key={record.id} style={{ color: 'var(--app-text)', borderBottom: '1px solid var(--ds-table-row-divider)' }}>
              <td style={{ ...stickyFirstCellStyle, boxShadow: scrollEdges.left ? stickyLeftShadow : 'none' }}><span style={{ color: 'var(--app-heading)', fontWeight: 500, fontSize: 14 }}>{record.projectCode}</span></td>
              <td style={recordCellStyle}>{displayRecord(record).projectName}</td>
              <td style={recordCellStyle}><span style={{ color: 'var(--app-heading)', fontWeight: 500, fontSize: 14 }}>{record.robotId}</span></td>
              <td style={{ ...recordCellStyle, fontFamily: 'SF Mono, Monaco, monospace', fontSize: 12 }}>{record.robotIp}</td>
              <td style={recordCellStyle}><ModelPill>{displayRecord(record).model}</ModelPill></td>
              <td style={recordCellStyle}>{record.deliveredAt}</td>
              <td style={recordCellStyle}>{record.workflowId}</td>
              <td style={{ ...recordCellStyle, maxWidth: 220 }}><span style={{ display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={displayRecord(record).description}>{displayRecord(record).description || '--'}</span></td>
              <td style={recordCellStyle}>{record.operator}</td>
              <td style={{ ...stickyLastCellStyle, boxShadow: scrollEdges.right ? stickyRightShadow : 'none' }}><div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><ArcoIconButton size="small" icon={<FileText size={13} />} aria-label={copy.details} title={copy.details} onClick={() => setDetailId(record.id)} /><ArcoIconButton size="small" icon={<Edit3 size={13} />} aria-label={copy.edit} title={copy.edit} onClick={() => setEditingRecord(record)} /></div></td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>
      <InstallationDetailModal
        record={detailRecord}
        onClose={() => setDetailId(null)}
      />
      <RecordEditModal record={editingRecord} onClose={() => setEditingRecord(null)} onSave={saveRecord} />
    </div>
  );
}

const productCellStyle: CSSProperties = { height: 60, padding: '0 16px', verticalAlign: 'middle', whiteSpace: 'nowrap', color: 'var(--ds-table-cell-color)', fontWeight: 'var(--ds-table-cell-font-weight)', fontSize: 'var(--ds-table-cell-font-size)' };
const tableHeaderStyle: CSSProperties = { height: 44, padding: '0 16px', color: 'var(--ds-table-header-color)', fontWeight: 'var(--ds-table-header-font-weight)', fontSize: 'var(--ds-table-header-font-size)', whiteSpace: 'nowrap' };
const recordCellStyle: CSSProperties = { ...productCellStyle, borderBottom: '1px solid var(--ds-table-row-divider)' };
const stickyLeftShadow = '10px 0 18px -18px var(--app-shadow-color)';
const stickyRightShadow = '-10px 0 18px -18px var(--app-shadow-color)';
const stickyHeaderStyle: CSSProperties = {
  ...tableHeaderStyle,
  position: 'sticky',
  top: 0,
  zIndex: 'var(--ds-z-sticky)',
  background: 'var(--ds-table-header-bg)',
  borderBottom: '1px solid var(--ds-table-header-divider)',
};
const stickyFirstHeaderStyle: CSSProperties = {
  ...stickyHeaderStyle,
  left: 0,
  zIndex: 'var(--ds-z-sticky)',
  width: 160,
  minWidth: 160,
  maxWidth: 160,
};
const stickyLastHeaderStyle: CSSProperties = {
  ...stickyHeaderStyle,
  right: 0,
  zIndex: 'var(--ds-z-sticky)',
  width: 96,
  minWidth: 96,
  maxWidth: 96,
  textAlign: 'right',
};
const stickyFirstCellStyle: CSSProperties = {
  ...recordCellStyle,
  position: 'sticky',
  left: 0,
  zIndex: 'var(--ds-z-base)',
  width: 160,
  minWidth: 160,
  maxWidth: 160,
  background: 'var(--app-surface)',
};
const stickyLastCellStyle: CSSProperties = {
  ...recordCellStyle,
  position: 'sticky',
  right: 0,
  zIndex: 'var(--ds-z-base)',
  width: 96,
  minWidth: 96,
  maxWidth: 96,
  textAlign: 'right',
  background: 'var(--app-surface)',
};

function InstallationDetailModal({ record, onClose }: { record: InstallationRecord | null; onClose: () => void }) {
  const [expandedSoftwareName, setExpandedSoftwareName] = useState<string | null>(null);
  const [statusView, setStatusView] = useState<'installed' | 'missing'>('installed');
  const isOpen = Boolean(record);
  useEffect(() => {
    setExpandedSoftwareName(null);
    setStatusView('installed');
  }, [record?.id]);

  return <ArcoModal
    open={isOpen}
    onOpenChange={open => !open && onClose()}
    title="装机详情"
    size="xl"
    bodyStyle={{ minHeight: 360 }}
    footer={<ArcoButton onClick={onClose}>关闭</ArcoButton>}
  >
    {record && <div>
      <StatusTabs value={statusView} onChange={value => { setStatusView(value); setExpandedSoftwareName(null); }} />
      <SoftwareStatusList status={statusView} items={statusView === 'installed' ? record.installedSoftware : record.missingSoftware} activities={record.activities} expandedSoftwareName={expandedSoftwareName} onToggle={name => setExpandedSoftwareName(current => current === name ? null : name)} />
    </div>}
  </ArcoModal>;
}

function StatusTabs({ value, onChange }: { value: 'installed' | 'missing'; onChange: (value: 'installed' | 'missing') => void }) {
  const tabs = [{ key: 'installed' as const, label: '已安装' }, { key: 'missing' as const, label: '未安装' }];
  const moveSelection = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : direction ? (index + direction + tabs.length) % tabs.length : null;
    if (nextIndex === null) return;
    event.preventDefault();
    onChange(tabs[nextIndex].key);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus();
  };

  return <div className="ds-status-tabs" role="tablist" aria-label="安装状态" style={{ marginBottom: 20 }}>
    {tabs.map((tab, index) => {
      const active = value === tab.key;
      return <button className="ds-status-tab" key={tab.key} role="tab" aria-selected={active} tabIndex={active ? 0 : -1} onClick={() => onChange(tab.key)} onKeyDown={event => moveSelection(event, index)}>{tab.label}</button>;
    })}
  </div>;
}

function SoftwareStatusList({ status, items, activities, expandedSoftwareName, onToggle }: { status: 'installed' | 'missing'; items: SoftwareItem[]; activities: InstallationActivity[]; expandedSoftwareName: string | null; onToggle: (name: string) => void }) {
  const installed = status === 'installed';
  return <div role="list" aria-label={installed ? '已安装软件' : '未安装软件'} style={{ maxHeight: 474, overflowY: 'auto', border: '1px solid var(--app-border)', borderRadius: 'var(--app-card-radius)', background: 'var(--app-surface)', boxShadow: 'var(--ds-shadow-xs)' }}>
    {items.map((item, itemIndex) => {
      const expanded = installed && item.name === expandedSoftwareName;
      const itemActivities = activities.filter(activity => activity.softwareName === item.name);
      return <div key={`${item.name}-${itemIndex}`} role="listitem" style={{ borderBottom: itemIndex < items.length - 1 ? '1px solid var(--app-border)' : 'none' }}>
        {installed ? <button className="ds-accordion-trigger" type="button" aria-expanded={expanded} onClick={() => onToggle(item.name)} style={{ width: '100%', minHeight: 64, padding: '0 28px', display: 'flex', alignItems: 'center', gap: 12, border: 'none', background: 'var(--app-surface)', color: 'var(--app-heading)', cursor: 'pointer', textAlign: 'left' }}>
          <ChevronRight className="ds-accordion-trigger__icon" size={18} aria-hidden="true" style={{ flexShrink: 0, transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</span>
          <VersionPill>{item.version ?? '暂无版本'}</VersionPill>
        </button> : <div style={{ minHeight: 64, padding: '0 28px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--app-heading)', fontSize: 14, fontWeight: 600 }}>{item.name}</span>
          <VersionPill>{item.version ?? '暂无版本'}</VersionPill>
          <span style={{ marginLeft: 'auto' }}><StatusPill tone="danger">未安装</StatusPill></span>
        </div>}
        {expanded && <InlineSoftwareActivityList softwareName={item.name} activities={itemActivities} />}
      </div>;
    })}
    {items.length === 0 && <div style={{ padding: '52px 16px', color: 'var(--app-muted)', fontSize: 14, textAlign: 'center' }}>暂无软件</div>}
  </div>;
}

function VersionPill({ children }: { children: ReactNode }) {
  return <ArcoTag style={{ flexShrink: 0 }}>{children}</ArcoTag>;
}

function InlineSoftwareActivityList({ softwareName, activities }: { softwareName: string; activities: InstallationActivity[] }) {
  return <section aria-label={`${softwareName}的操作记录`} style={{ margin: '0 22px 16px', padding: '0 24px', borderRadius: 'var(--app-card-radius)', background: 'var(--app-soft)' }}>
    {activities.length ? <div role="list" style={{ maxHeight: 220, overflowY: 'auto' }}>
      {activities.map((activity, index) => <div key={`${activity.time}-${activity.packageName}-${index}`} role="listitem" style={{ minHeight: 74, display: 'flex', alignItems: 'center', gap: 16, borderBottom: index < activities.length - 1 ? '1px solid var(--app-border)' : 'none' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span title={activity.packageName} style={{ minWidth: 0, overflow: 'hidden', color: 'var(--app-heading)', fontSize: 14, fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activity.packageName}</span>
            <VersionPill>V{activity.version.replace(/^v/i, '')}</VersionPill>
            <StatusPill tone="success">{activity.action}</StatusPill>
          </div>
          <div style={{ marginTop: 7, overflow: 'hidden', color: 'var(--app-muted)', fontSize: 12, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activity.time} · {activity.operator}</div>
        </div>
      </div>)}
    </div> : <div style={{ padding: '28px 0', color: 'var(--app-muted)', fontSize: 12, textAlign: 'center' }}>暂无安装记录</div>}
  </section>;
}
