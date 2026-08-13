import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown, ArrowDownUp, ArrowUp, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleAlert,
  Download, Eye, FileSpreadsheet, Pencil, Plus, ScanLine, Search,
  SlidersHorizontal, Trash2, Upload,
} from 'lucide-react';
import '../../styles/business/work-order.css';
import {
  ProductButton, ProductDrawer, ProductField, ProductIconButton, ProductModal,
  ProductSelect, ProductTag, ProductTextInput, ProductUploadBox,
} from './ProductUI';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from './ui/dropdown-menu';

/* ---------- 类型 ---------- */
type WorkOrderStatus = '新建' | '加工中' | '加工完成';
type PostedStatus = '未过账' | '已过账';
type WorkOrderPriority = '普通' | '高优先级';
type Programmed = '是' | '否';
type OrderSource = '系统新增' | 'Excel 导入';

interface WorkOrderOperation {
  lineNo: number;
  name: string;
  planned: number;
  hours: number;
  worker: string;
  remark: string;
}

interface WorkOrderLog {
  action: string;
  operator: string;
  time: string;
}

interface WorkOrderPriorityLog {
  from: WorkOrderPriority;
  to: WorkOrderPriority;
  operator: string;
  time: string;
}

interface WorkOrder {
  id: string;
  status: WorkOrderStatus;
  posted: PostedStatus;
  source: OrderSource;
  creator: string;
  createdAt: string;
  updatedAt: string;
  priority: WorkOrderPriority;
  due: string;
  programmed: Programmed;
  orderNo: string;
  projectName: string;
  orderOwner: string;
  orderCreator: string;
  partNo: string;
  partName: string;
  program: string;
  unit: string;
  moldNo: string;
  moldType: string;
  revision: string;
  operations: WorkOrderOperation[];
  extensions: Record<string, string>;
  snapshot: Record<string, string>;
  priorityLogs: WorkOrderPriorityLog[];
  logs: WorkOrderLog[];
  processed: number;  // 已加工数（工作台回写）
  clamped: number;    // 已装夹数
  unclamped: number;  // 已拆夹数
}

interface OrderDraft {
  id: string;
  priority: WorkOrderPriority;
  due: string;
  programmed: Programmed;
  orderNo: string;
  projectName: string;
  orderOwner: string;
  orderCreator: string;
  partNo: string;
  partName: string;
  program: string;
  unit: string;
  moldNo: string;
  moldType: string;
  revision: string;
  operations: WorkOrderOperation[];
  extensions: Record<string, string>;
}

/* ---------- 工单模板（动态扩展字段） ---------- */
interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'enum' | 'date';
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
}

const TEMPLATE_FIELDS: TemplateField[] = [
  { key: 'customer', label: '客户名称', type: 'text', required: true, maxLength: 40 },
  { key: 'material', label: '材料', type: 'text', maxLength: 20 },
  { key: 'surface', label: '表面处理', type: 'enum', options: ['抛光', '喷砂', '阳极氧化'] },
  { key: 'heatTreat', label: '热处理', type: 'enum', options: ['无', '淬火', '渗碳'] },
  { key: 'batchQty', label: '批量', type: 'number', min: 1, max: 99999 },
  { key: 'delivery', label: '交期要求', type: 'date' },
];

const OPERATION_OPTIONS = ['RG', 'SM', 'CNC', 'QC'];
const UNIT_OPTIONS = ['PCS', '件', '套'];
const CURRENT_USER = 'robot-admin';
const PAGE_SIZE = 10;

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmtNow() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toDateTimeLocal(value: string) { return value.replace(' ', 'T'); }
function totalPlanned(order: WorkOrder) { return order.operations.reduce((sum, op) => sum + op.planned, 0); }

/* ---------- 种子数据 ---------- */
const SEED: WorkOrder[] = [
  {
    id: 'MO20260803001', status: '加工中', posted: '未过账', source: '系统新增', creator: '张敏',
    createdAt: '2026-08-03 09:16', updatedAt: '2026-08-03 13:40', priority: '高优先级', due: '2026-08-04 18:00',
    programmed: '是', orderNo: 'SO-2608-0117', projectName: '前模组件', orderOwner: '李经理', orderCreator: '张敏',
    partNo: 'MJ-A17-042', partName: '前模镶件', program: 'MJ-A17-R3.nc', unit: 'PCS', moldNo: 'MOULD-240817', moldType: '热流道模', revision: 'V1.0',
    operations: [
      { lineNo: 1, name: 'RG', planned: 4, hours: 2.5, worker: '王磊', remark: '先确认毛坯余量' },
      { lineNo: 2, name: 'CNC', planned: 4, hours: 6, worker: '李跃', remark: '按 R3 程序加工' },
      { lineNo: 3, name: 'QC', planned: 4, hours: 1, worker: '陈舟', remark: '' },
    ],
    extensions: { customer: '恒瑞模具', material: 'P20', surface: '抛光', heatTreat: '无', batchQty: '4', delivery: '2026-08-06' },
    snapshot: {}, priorityLogs: [{ from: '普通', to: '高优先级', operator: '刘组长', time: '2026-08-03 09:40' }],
    logs: [
      { action: '创建工单', operator: '张敏', time: '2026-08-03 09:16' },
      { action: '调整优先级为“高优先级”', operator: '刘组长', time: '2026-08-03 09:40' },
      { action: '工作台回写：装夹 4 / 加工 2 / 拆夹 0', operator: '系统', time: '2026-08-03 13:40' },
    ],
    processed: 2, clamped: 4, unclamped: 0,
  },
  {
    id: 'MO20260803002', status: '新建', posted: '未过账', source: '系统新增', creator: '刘畅',
    createdAt: '2026-08-03 10:42', updatedAt: '2026-08-03 10:42', priority: '普通', due: '2026-08-06 12:00',
    programmed: '否', orderNo: 'SO-2608-0121', projectName: '斜顶组件', orderOwner: '王工', orderCreator: '刘畅',
    partNo: 'ZJ-B03-118', partName: '斜顶座', program: '', unit: 'PCS', moldNo: 'MOULD-240821', moldType: '斜顶模', revision: '',
    operations: [{ lineNo: 1, name: 'CNC', planned: 6, hours: 8, worker: '', remark: '' }],
    extensions: { customer: '东成精工', material: 'SKD11', surface: '', heatTreat: '淬火', batchQty: '6', delivery: '2026-08-08' },
    snapshot: {}, priorityLogs: [], logs: [{ action: '创建工单', operator: '刘畅', time: '2026-08-03 10:42' }],
    processed: 0, clamped: 0, unclamped: 0,
  },
  {
    id: 'MO20260802016', status: '加工完成', posted: '已过账', source: 'Excel 导入', creator: '系统导入',
    createdAt: '2026-08-02 14:05', updatedAt: '2026-08-03 08:30', priority: '普通', due: '2026-08-03 16:00',
    programmed: '是', orderNo: 'PO-2607-0889', projectName: '滑块组件', orderOwner: '赵经理', orderCreator: '系统导入',
    partNo: 'HX-C22-009', partName: '滑块镶件', program: 'HX-C22-V6.nc', unit: 'PCS', moldNo: 'MOULD-240806', moldType: '滑块模', revision: 'V2.1',
    operations: [
      { lineNo: 1, name: 'RG', planned: 8, hours: 2, worker: '周海', remark: '' },
      { lineNo: 2, name: 'CNC', planned: 8, hours: 5.5, worker: '周海', remark: '注意型面公差' },
      { lineNo: 3, name: 'QC', planned: 8, hours: 1, worker: '周海', remark: '' },
    ],
    extensions: { customer: '鑫锐模具', material: 'H13', surface: '喷砂', heatTreat: '渗碳', batchQty: '8', delivery: '2026-08-04' },
    snapshot: { 客户交期: '2026-08-04', 客户备注: '加硬后出货' },
    priorityLogs: [], logs: [
      { action: 'Excel 导入创建工单', operator: '系统导入', time: '2026-08-02 14:05' },
      { action: '工作台回写：装夹 8 / 加工 8 / 拆夹 8', operator: '系统', time: '2026-08-03 08:30' },
      { action: '过账完成', operator: 'robot-admin', time: '2026-08-03 08:35' },
    ],
    processed: 8, clamped: 8, unclamped: 8,
  },
  {
    id: 'MO20260802015', status: '加工中', posted: '未过账', source: '系统新增', creator: '赵琪',
    createdAt: '2026-08-02 11:28', updatedAt: '2026-08-03 10:05', priority: '普通', due: '2026-08-05 10:00',
    programmed: '是', orderNo: 'SO-2607-1002', projectName: '动模组件', orderOwner: '孙工', orderCreator: '赵琪',
    partNo: 'DX-P11-205', partName: '动模仁', program: 'DX-P11-R2.nc', unit: '件', moldNo: 'MOULD-240798', moldType: '二板模', revision: 'V1.2',
    operations: [
      { lineNo: 1, name: 'SM', planned: 2, hours: 1, worker: '孙宁', remark: '' },
      { lineNo: 2, name: 'CNC', planned: 2, hours: 4, worker: '孙宁', remark: '' },
    ],
    extensions: { customer: '联创精密', material: '718H', surface: '阳极氧化', heatTreat: '无', batchQty: '2', delivery: '2026-08-06' },
    snapshot: {}, priorityLogs: [], logs: [
      { action: '创建工单', operator: '赵琪', time: '2026-08-02 11:28' },
      { action: '工作台回写：装夹 2 / 加工 1 / 拆夹 0', operator: '系统', time: '2026-08-03 10:05' },
    ],
    processed: 1, clamped: 2, unclamped: 0,
  },
  {
    id: 'MO20260801028', status: '新建', posted: '未过账', source: '系统新增', creator: '张敏',
    createdAt: '2026-08-01 17:32', updatedAt: '2026-08-01 17:32', priority: '高优先级', due: '2026-08-04 09:00',
    programmed: '是', orderNo: 'SO-2608-0099', projectName: '抽芯组件', orderOwner: '李经理', orderCreator: '张敏',
    partNo: 'CD-K09-077', partName: '抽芯滑块', program: 'CD-K09-R1.nc', unit: 'PCS', moldNo: 'MOULD-240812', moldType: '抽芯模', revision: '',
    operations: [
      { lineNo: 1, name: 'CNC', planned: 3, hours: 5, worker: '王磊', remark: '优先安排加工' },
      { lineNo: 2, name: 'QC', planned: 3, hours: 1, worker: '', remark: '' },
    ],
    extensions: { customer: '恒瑞模具', material: 'P20', surface: '', heatTreat: '', batchQty: '3', delivery: '' },
    snapshot: {}, priorityLogs: [], logs: [{ action: '创建工单', operator: '张敏', time: '2026-08-01 17:32' }],
    processed: 0, clamped: 0, unclamped: 0,
  },
];

/* ---------- Excel 解析工具 ---------- */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(cell => cell.trim() !== '')) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== '' || row.length) {
    row.push(field);
    if (row.some(cell => cell.trim() !== '')) rows.push(row);
  }
  return rows;
}

function parsedToRaw(cells: string[][]): Record<string, string>[] {
  if (!cells.length) return [];
  const headers = cells[0].map(h => h.trim());
  return cells.slice(1).map(rowCells => {
    const raw: Record<string, string> = {};
    headers.forEach((header, index) => { if (header) raw[header] = (rowCells[index] ?? '').trim(); });
    return raw;
  });
}

/** 工艺列表解析：支持“工序（工时）”或“工序|应加工数|工时|人员|生产备注”两种格式 */
function parseOperations(raw: string): WorkOrderOperation[] {
  if (!raw) return [];
  return raw.split(/[;；]/).map((item, index) => {
    const seg = item.trim();
    if (!seg) return null;
    let name = seg;
    let planned = 1;
    let hours = 1;
    let worker = '';
    let remark = '';
    const pipe = seg.split('|');
    if (pipe.length > 1) {
      name = pipe[0].trim();
      planned = Math.max(1, Number(pipe[1]) || 1);
      hours = Number(pipe[2]);
      worker = pipe[3]?.trim() ?? '';
      remark = pipe[4]?.trim() ?? '';
    } else {
      const match = seg.match(/^(.+?)[（(]([\d.]+)[）)]$/);
      if (match) { name = match[1].trim(); hours = Number(match[2]); }
    }
    return { lineNo: index + 1, name, planned, hours, worker, remark };
  }).filter((op): op is WorkOrderOperation => op !== null);
}

/* .xlsx 示例数据（原型演示，真实接入由后端解析） */
const DEMO_IMPORT_ROWS: Record<string, string>[] = [
  { 生产单号: 'MO20260803010', 件号: 'ZL-D08-311', 件名: '前模仁', 加工程序: 'ZL-D08-R1.nc', 单位: 'PCS', 模具编号: 'MOULD-240830', 优先级: '普通', 需求时间: '2026-08-07 12:00', 是否编程: '是', 工艺列表: 'RG（1.00）;CNC（6.50）', 客户名称: '恒瑞模具', 材料: 'P20', 批量: '2' },
  { 生产单号: 'MO20260803011', 件号: 'YK-E05-118', 件名: '压块', 加工程序: '', 单位: '套', 模具编号: 'MOULD-240833', 优先级: '高优先级', 需求时间: '2026-08-05 09:00', 是否编程: '否', 工艺列表: 'CNC（3.00）', 客户名称: '东成精工', 材料: 'Cr12MoV', 批量: '1', 客户备注: '急件，优先排产' },
  { 生产单号: 'MO20260803012', 件号: '', 件名: '顶针', 加工程序: 'DJ-F02-R1.nc', 单位: 'PCS', 优先级: '普通', 需求时间: '2026-08-08 18:00', 是否编程: '是', 工艺列表: 'CNC（2.00）', 客户名称: '联创精密' },
  { 生产单号: 'MO20260803001', 件号: 'MJ-A17-042', 件名: '前模镶件', 加工程序: 'MJ-A17-R3.nc', 单位: 'PCS', 优先级: '高优先级', 需求时间: '2026-08-04 18:00', 是否编程: '是', 工艺列表: 'RG（2.50）;CNC（6.00）;QC（1.00）', 客户名称: '恒瑞模具' },
  { 生产单号: 'MO20260803013', 件号: 'HD-G21-066', 件名: '后模仁', 加工程序: 'HD-G21-R2.nc', 单位: 'PCS', 模具编号: 'MOULD-240836', 优先级: '普通', 需求时间: '2026-08-09 10:00', 是否编程: '是', 工艺列表: 'RG（1.50）;SM（1.00）;CNC（5.00）;QC（1.00）', 客户名称: '鑫锐模具', 材料: 'H13', 表面处理: '喷砂' },
];

const FIELD_LABEL_MAP: Record<string, keyof OrderDraft | 'operations'> = {
  生产单号: 'id', 加工单号: 'id', 优先级: 'priority', 需求时间: 'due', 是否编程: 'programmed',
  订单号码: 'orderNo', 专案名称: 'projectName', 订单负责人: 'orderOwner', 订单创建人: 'orderCreator',
  件号: 'partNo', 件名: 'partName', 加工程序: 'program', 单位: 'unit', 模具编号: 'moldNo',
  模具类型: 'moldType', 版次: 'revision', 工艺列表: 'operations',
};

/* ---------- 排序规则：优先级高 → 需求时间早 → 创建时间早 ---------- */
function sortOrders(orders: WorkOrder[]) {
  return [...orders].sort((a, b) => {
    const pa = a.priority === '高优先级' ? 0 : 1;
    const pb = b.priority === '高优先级' ? 0 : 1;
    if (pa !== pb) return pa - pb;
    if (a.due !== b.due) return a.due < b.due ? -1 : 1;
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
    return 0;
  });
}

/* ---------- 状态标签 ---------- */
function StatusTag({ status }: { status: WorkOrderStatus }) {
  const tone = status === '加工完成' ? 'success' : status === '加工中' ? 'accent' : 'neutral';
  return <ProductTag tone={tone}>{status}</ProductTag>;
}

function display(value: string | number | undefined | null) {
  return value === '' || value === undefined || value === null ? '-' : String(value);
}

function emptyDraft(id: string): OrderDraft {
  return {
    id,
    priority: '普通',
    due: '',
    programmed: '否',
    orderNo: '',
    projectName: '',
    orderOwner: '',
    orderCreator: '',
    partNo: '',
    partName: '',
    program: '',
    unit: 'PCS',
    moldNo: '',
    moldType: '',
    revision: '',
    operations: [{ lineNo: 1, name: 'CNC', planned: 1, hours: 1, worker: '', remark: '' }],
    extensions: Object.fromEntries(TEMPLATE_FIELDS.map(field => [field.key, ''])),
  };
}

function draftFromOrder(order: WorkOrder): OrderDraft {
  return {
    id: order.id,
    priority: order.priority,
    due: order.due,
    programmed: order.programmed,
    orderNo: order.orderNo,
    projectName: order.projectName,
    orderOwner: order.orderOwner,
    orderCreator: order.orderCreator,
    partNo: order.partNo,
    partName: order.partName,
    program: order.program,
    unit: order.unit,
    moldNo: order.moldNo,
    moldType: order.moldType,
    revision: order.revision,
    operations: order.operations.map(op => ({ ...op })),
    extensions: { ...Object.fromEntries(TEMPLATE_FIELDS.map(field => [field.key, ''])), ...order.extensions },
  };
}

/* ---------- 保存校验 ---------- */
function validateDraft(draft: OrderDraft, existingIds: Set<string>, editingId: string | null): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.id.trim()) errors.id = '加工单号不能为空';
  else if (existingIds.has(draft.id.trim()) && draft.id.trim() !== editingId) errors.id = '加工单号已存在，请查看已有工单';
  if (!draft.priority) errors.priority = '优先级不能为空';
  if (!draft.due) errors.due = '需求时间不能为空';
  if (!draft.programmed) errors.programmed = '是否编程不能为空';
  if (!draft.partNo.trim()) errors.partNo = '件号不能为空';
  if (!draft.partName.trim()) errors.partName = '件名不能为空';
  if (draft.programmed === '是' && !draft.program.trim()) errors.program = '已编程，加工程序必填';
  if (draft.operations.length === 0) errors.operations = '至少存在一条工序明细';
  draft.operations.forEach((op, index) => {
    const prefix = `op_${index}`;
    if (!op.name) errors[prefix] = '工序不能为空';
    if (!(op.planned > 0)) errors[prefix] = '应加工数必须大于 0';
    if (op.hours < 0) errors[prefix] = '预计工时不能为负数';
  });
  return errors;
}

/* ---------- 主组件 ---------- */
export function WorkOrderManager({
  routeOrderId = null,
  onRouteOrderChange,
}: {
  routeOrderId?: string | null;
  onRouteOrderChange?: (orderId: string | null) => void;
}) {
  const [orders, setOrders] = useState(SEED);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部状态');
  const [postedFilter, setPostedFilter] = useState('全部过账');
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState('');
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<OrderDraft>(() => emptyDraft(genOrderNo()));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<WorkOrder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkOrder | null>(null);
  const [priorityTarget, setPriorityTarget] = useState<WorkOrder | null>(null);
  const [priorityValue, setPriorityValue] = useState<WorkOrderPriority>('普通');
  const [importOpen, setImportOpen] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [importFileName, setImportFileName] = useState('');
  const [importRawRows, setImportRawRows] = useState<Record<string, string>[]>([]);
  const [importResult, setImportResult] = useState<{ total: number; success: number; skip: number; fail: number; rows: { id: string; status: 'success' | 'skip' | 'fail'; reason: string }[] } | null>(null);
  const formBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!routeOrderId) {
      setSelected(null);
      setView(current => current === 'detail' ? 'list' : current);
      return;
    }
    const routeOrder = orders.find(order => order.id === routeOrderId);
    if (routeOrder) {
      setSelected(routeOrder);
      setView('detail');
    }
  }, [orders, routeOrderId]);

  const flash = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(''), 2600); };

  /* ---------- 查询与分页 ---------- */
  const filtered = useMemo(() => {
    const term = keyword.trim().toLowerCase();
    return sortOrders(orders.filter(order =>
      (!term || order.id.toLowerCase().includes(term)) &&
      (statusFilter === '全部状态' || order.status === statusFilter) &&
      (postedFilter === '全部过账' || (postedFilter === '已过账' ? order.posted === '已过账' : order.posted === '未过账'))
    ));
  }, [orders, keyword, statusFilter, postedFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetFilters = () => {
    setKeyword('');
    setStatusFilter('全部状态');
    setPostedFilter('全部过账');
    setPage(1);
  };

  /* ---------- 新增 / 编辑 ---------- */
  function genOrderNo() {
    const d = new Date();
    return `MO${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${String(Math.floor(Math.random() * 900) + 100)}`;
  }

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft(genOrderNo()));
    setFormErrors({});
    setView('form');
  };

  const openEdit = (order: WorkOrder) => {
    onRouteOrderChange?.(null);
    setEditingId(order.id);
    setDraft(draftFromOrder(order));
    setFormErrors({});
    setView('form');
  };

  const openDetail = (order: WorkOrder) => {
    setSelected(order);
    setView('detail');
    onRouteOrderChange?.(order.id);
  };

  const closeDetail = () => {
    setView('list');
    setSelected(null);
    onRouteOrderChange?.(null);
  };

  const setDraftField = (key: keyof OrderDraft, value: string) => {
    setDraft(current => ({ ...current, [key]: value }));
    if (formErrors[key]) setFormErrors(current => { const next = { ...current }; delete next[key]; return next; });
  };

  const setOperationField = (index: number, field: keyof WorkOrderOperation, value: string | number) => {
    setDraft(current => ({
      ...current,
      operations: current.operations.map((op, i) => i === index
        ? { ...op, [field]: field === 'planned' || field === 'hours' ? Number(value) : value }
        : op),
    }));
    if (formErrors[`op_${index}`]) setFormErrors(current => { const next = { ...current }; delete next[`op_${index}`]; return next; });
  };

  const addOperation = () => {
    setDraft(current => ({
      ...current,
      operations: [...current.operations, { lineNo: current.operations.length + 1, name: 'CNC', planned: 1, hours: 1, worker: '', remark: '' }],
    }));
  };

  const removeOperation = (index: number) => {
    if (draft.operations.length <= 1) { flash('工单至少保留一条工序明细，删除已拦截'); return; }
    setDraft(current => ({
      ...current,
      operations: current.operations.filter((_, i) => i !== index).map((op, i) => ({ ...op, lineNo: i + 1 })),
    }));
  };

  const moveOperation = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.operations.length) return;
    setDraft(current => {
      const operations = [...current.operations];
      [operations[index], operations[target]] = [operations[target], operations[index]];
      return { ...current, operations: operations.map((op, i) => ({ ...op, lineNo: i + 1 })) };
    });
  };

  const scanId = () => {
    const code = genOrderNo();
    setDraft(current => ({ ...current, id: code }));
    if (formErrors.id) setFormErrors(current => { const next = { ...current }; delete next.id; return next; });
    flash(`扫码录入成功：${code}`);
  };

  const saveOrder = () => {
    const errors = validateDraft(draft, new Set(orders.map(order => order.id)), editingId);
    setFormErrors(errors);
    if (Object.keys(errors).length) {
      flash(`保存失败：${Object.keys(errors).length} 项校验未通过`);
      window.setTimeout(() => {
        const target = formBodyRef.current?.querySelector<HTMLElement>('[data-error="true"]');
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
      return;
    }
    const now = fmtNow();
    if (editingId) {
      setOrders(current => current.map(order => order.id === editingId
        ? {
            ...order,
            ...draft,
            id: draft.id.trim(),
            createdAt: order.createdAt,
            updatedAt: now,
            logs: [...order.logs, { action: '编辑工单', operator: CURRENT_USER, time: now }],
          }
        : order));
      flash('工单已更新，编辑日志已记录');
    } else {
      const next: WorkOrder = {
        ...draft,
        id: draft.id.trim(),
        status: '新建',
        posted: '未过账',
        source: '系统新增',
        creator: CURRENT_USER,
        createdAt: now,
        updatedAt: now,
        priorityLogs: [],
        logs: [{ action: '创建工单', operator: CURRENT_USER, time: now }],
        snapshot: {},
        processed: 0,
        clamped: 0,
        unclamped: 0,
      };
      setOrders(current => [next, ...current]);
      flash('工单已保存，状态为“新建”，已进入工作台待办队列');
    }
    setView('list');
  };

  /* ---------- 删除 ---------- */
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setOrders(current => current.filter(order => order.id !== deleteTarget.id));
    flash(`工单 ${deleteTarget.id} 已删除`);
    setDeleteTarget(null);
  };

  /* ---------- 优先级调整 ---------- */
  const openPriority = (order: WorkOrder) => {
    setPriorityTarget(order);
    setPriorityValue(order.priority);
  };

  const confirmPriority = () => {
    if (!priorityTarget || priorityValue === priorityTarget.priority) {
      setPriorityTarget(null);
      return;
    }
    const now = fmtNow();
    setOrders(current => current.map(order => order.id === priorityTarget.id
      ? {
          ...order,
          priority: priorityValue,
          updatedAt: now,
          priorityLogs: [...order.priorityLogs, { from: order.priority, to: priorityValue, operator: CURRENT_USER, time: now }],
          logs: [...order.logs, { action: `调整优先级为“${priorityValue}”`, operator: CURRENT_USER, time: now }],
        }
      : order));
    setSelected(current => current ? { ...current, priority: priorityValue } : current);
    flash(`优先级已调整为“${priorityValue}”，同步影响工作台队列排序`);
    setPriorityTarget(null);
  };

  /* ---------- Excel 导出（模板字段 + 快照回填 + 工序（工时）） ---------- */
  const exportOrders = () => {
    const snapshotKeys = Array.from(new Set(orders.flatMap(order => Object.keys(order.snapshot))));
    const columns = [
      '生产单号', '工单状态', '是否编程', '过账状态', '单据来源', '优先级', '需求时间',
      '订单号码', '专案名称', '订单负责人', '订单创建人',
      '件号', '件名', '加工程序', '单位', '模具编号', '模具类型', '版次', '工艺列表',
      ...TEMPLATE_FIELDS.map(field => field.label),
      ...snapshotKeys,
    ];
    const rows = orders.map(order => {
      const cell: Record<string, string> = {
        生产单号: order.id,
        工单状态: order.status,
        是否编程: order.programmed === '是' ? '是，已编程' : '否，未编程',
        过账状态: order.posted,
        单据来源: order.source,
        优先级: order.priority,
        需求时间: order.due,
        订单号码: order.orderNo,
        专案名称: order.projectName,
        订单负责人: order.orderOwner,
        订单创建人: order.orderCreator,
        件号: order.partNo,
        件名: order.partName,
        加工程序: order.program,
        单位: order.unit,
        模具编号: order.moldNo,
        模具类型: order.moldType,
        版次: order.revision,
        工艺列表: order.operations.map(op => `${op.name}|${op.planned}|${op.hours.toFixed(2)}|${op.worker}|${op.remark}`).join(';'),
      };
      TEMPLATE_FIELDS.forEach(field => { cell[field.label] = order.snapshot[field.label] ?? order.extensions[field.key] ?? ''; });
      snapshotKeys.forEach(key => { cell[key] = order.snapshot[key] ?? ''; });
      return columns.map(column => cell[column] ?? '');
    });
    const csv = [columns, ...rows]
      .map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `工单导出_${fmtNow().slice(0, 10).replaceAll('-', '')}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    flash(`已按模板字段导出 ${orders.length} 条工单`);
  };

  /* ---------- Excel 导入 ---------- */
  const handleImportFile = (file: File | null) => {
    if (!file) return;
    setImportFileName(file.name);
    if (file.name.toLowerCase().endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? '');
        setImportRawRows(parsedToRaw(parseCsv(text)));
        setImportStep(2);
      };
      reader.readAsText(file);
    } else {
      setImportRawRows(DEMO_IMPORT_ROWS);
      setImportStep(2);
    }
  };

  const mappedImportRows = useMemo(() => {
    const existing = new Set(orders.map(order => order.id));
    const seenInBatch = new Set<string>();
    return importRawRows.map(raw => {
      const get = (key: string) => raw[key] ?? '';
      const id = get('生产单号') || get('加工单号');
      const partNo = get('件号');
      const partName = get('件名');
      const operations = parseOperations(get('工艺列表'));
      const snapshot: Record<string, string> = {};
      const extensions: Record<string, string> = {};
      Object.entries(raw).forEach(([key, value]) => {
        if (!value) return;
        if (key === '生产单号' || key === '加工单号' || key === '工艺列表') return;
        const templateField = TEMPLATE_FIELDS.find(field => field.label === key);
        if (templateField) extensions[templateField.key] = value;
        else snapshot[key] = value;
      });
      const now = fmtNow();
      const order: WorkOrder = {
        id, status: '新建', posted: '未过账', source: 'Excel 导入', creator: '系统导入',
        createdAt: now, updatedAt: now,
        priority: get('优先级') === '高优先级' ? '高优先级' : '普通',
        due: get('需求时间') || now,
        programmed: get('是否编程') === '是' ? '是' : '否',
        orderNo: get('订单号码'), projectName: get('专案名称'), orderOwner: get('订单负责人'), orderCreator: get('订单创建人'),
        partNo, partName, program: get('加工程序'), unit: get('单位') || 'PCS',
        moldNo: get('模具编号'), moldType: get('模具类型'), revision: get('版次'),
        operations, extensions, snapshot, priorityLogs: [],
        logs: [{ action: 'Excel 导入创建工单', operator: '系统导入', time: now }],
        processed: 0, clamped: 0, unclamped: 0,
      };
      const reasons: string[] = [];
      if (!id) reasons.push('缺少生产单号');
      if (!partNo) reasons.push('缺少件号');
      if (!partName) reasons.push('缺少件名');
      if (operations.length === 0) reasons.push('工艺列表为空，无法生成工序');
      if (operations.some(op => op.planned <= 0)) reasons.push('存在应加工数小于等于 0 的工序');
      if (id && existing.has(id)) reasons.push('生产单号重复，跳过不覆盖');
      else if (id && seenInBatch.has(id)) reasons.push('与文件内其他行单号重复，跳过');
      else if (id) seenInBatch.add(id);
      return { raw, order, status: reasons.length ? ('fail' as const) : ('pending' as const), reason: reasons.join('；') };
    });
  }, [importRawRows, orders]);

  const successCount = mappedImportRows.filter(row => row.status === 'pending').length;
  const skipCount = mappedImportRows.filter(row => row.status === 'fail' && row.reason.includes('重复')).length;
  const failCount = mappedImportRows.filter(row => row.status === 'fail' && !row.reason.includes('重复')).length;

  const confirmImport = () => {
    const now = fmtNow();
    const nextOrders: WorkOrder[] = [];
    const resultRows: { id: string; status: 'success' | 'skip' | 'fail'; reason: string }[] = [];
    let success = 0;
    let skip = 0;
    let fail = 0;
    mappedImportRows.forEach(row => {
      if (row.status === 'pending') {
        success++;
        resultRows.push({ id: row.order.id, status: 'success', reason: '' });
        nextOrders.push({ ...row.order, createdAt: now, updatedAt: now, logs: [{ action: 'Excel 导入创建工单', operator: '系统导入', time: now }] });
      } else if (row.reason.includes('重复')) {
        skip++;
        resultRows.push({ id: row.order.id || '-', status: 'skip', reason: row.reason });
      } else {
        fail++;
        resultRows.push({ id: row.order.id || '-', status: 'fail', reason: row.reason });
      }
    });
    if (nextOrders.length) setOrders(current => [...nextOrders, ...current]);
    setImportResult({ total: mappedImportRows.length, success, skip, fail, rows: resultRows });
    setImportStep(3);
    flash(`导入完成：成功 ${success} 条，重复/失败 ${skip + fail} 条已跳过`);
  };

  /* ---------- 渲染 ---------- */
  const errorList = Object.values(formErrors);
  const editingOrder = editingId ? orders.find(order => order.id === editingId) : null;
  const isSystemReadonly = view === 'form' && !editingOrder;

  return (
    <main className="mfg-main ds-page ds-page--list wo-page">
      {notice && (
        <div className="ds-global-notice" data-tone="success" role="status">
          <span className="ds-global-notice__indicator"><CheckCircle2 size={16} /></span>
          <span className="ds-global-notice__message">{notice}</span>
        </div>
      )}

      <header className="ds-page__header ds-page-header wo-page-header">
        <div className="wo-page-heading">
          <h1>工单管理</h1>
          <p>统一承接生产联络单，将纸质或 Excel 工单转化为可执行、可追踪的生产工单。</p>
        </div>
        <div className="ds-page-toolbar wo-toolbar">
          <div className="wo-toolbar__filters">
            <div className="wo-search">
              <Search size={15} />
              <ProductTextInput value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }} placeholder="加工单号，支持模糊查询" aria-label="加工单号模糊查询" />
            </div>
            <ProductSelect value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1); }} aria-label="工单状态筛选">
              <option value="全部状态">全部状态</option>
              <option value="新建">新建</option>
              <option value="加工中">加工中</option>
              <option value="加工完成">加工完成</option>
            </ProductSelect>
            <ProductSelect value={postedFilter} onChange={event => { setPostedFilter(event.target.value); setPage(1); }} aria-label="过账状态筛选">
              <option value="全部过账">全部过账</option>
              <option value="未过账">未过账</option>
              <option value="已过账">已过账</option>
            </ProductSelect>
            <ProductButton type="outline" size="large" icon={<SlidersHorizontal size={14} />} onClick={resetFilters}>重置</ProductButton>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ProductButton type="outline" size="large" icon={<ArrowDownUp size={15} />} trailingIcon={<ChevronDown size={13} />}>导入 / 导出</ProductButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} collisionPadding={12} className="ds-context-menu wo-transfer-menu">
              <DropdownMenuItem className="ds-context-menu__item" onSelect={() => { setImportStep(1); setImportFileName(''); setImportRawRows([]); setImportResult(null); setImportOpen(true); }}>
                <Upload size={15} />Excel 导入
              </DropdownMenuItem>
              <DropdownMenuItem className="ds-context-menu__item" onSelect={exportOrders}>
                <Download size={15} />导出工单
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ProductButton type="primary" size="large" icon={<Plus size={16} />} onClick={openCreate}>新增工单</ProductButton>
        </div>
      </header>

      {/* 工单列表 */}
      <section className="ds-table-surface wo-list-surface">
        <div className="ds-table-scroll wo-table-scroll">
          <table className="wo-table">
            <thead>
              <tr className="ds-table-header">
                <th>加工单号</th>
                <th>状态</th>
                <th>是否编程</th>
                <th>过账</th>
                <th>单据来源</th>
                <th>优先级</th>
                <th>需求时间</th>
                <th>创建时间</th>
                <th>创建人</th>
                <th className="wo-table__actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(order => (
                <tr className="ds-table-row" key={order.id}>
                  <td>
                    <button className="wo-order-link" onClick={() => openDetail(order)}>{order.id}</button>
                    <small className="ds-table-cell--secondary">{order.partNo} · {order.partName}</small>
                  </td>
                  <td><StatusTag status={order.status} /></td>
                  <td><ProductTag tone={order.programmed === '是' ? 'success' : 'warning'}>{order.programmed === '是' ? '已编程' : '未编程'}</ProductTag></td>
                  <td><ProductTag tone={order.posted === '已过账' ? 'success' : 'neutral'}>{order.posted}</ProductTag></td>
                  <td>{order.source}</td>
                  <td>{order.priority === '高优先级' ? <ProductTag tone="danger">高优先级</ProductTag> : <ProductTag tone="neutral">普通</ProductTag>}</td>
                  <td>{order.due}</td>
                  <td>{order.createdAt}</td>
                  <td>{order.creator}</td>
                  <td className="wo-table__actions">
                    <div className="wo-row-actions">
                      <ProductIconButton size="small" icon={<Eye size={13} />} aria-label={`查看${order.id}`} title="查看" onClick={() => openDetail(order)} />
                      {order.status === '新建' && (
                        <>
                          <ProductIconButton size="small" icon={<Pencil size={13} />} aria-label={`编辑${order.id}`} title="编辑工单" onClick={() => openEdit(order)} />
                          <ProductIconButton size="small" icon={<ArrowDownUp size={13} />} aria-label={`调整${order.id}优先级`} title="调整优先级" onClick={() => openPriority(order)} />
                          <ProductIconButton status="danger" size="small" icon={<Trash2 size={13} />} aria-label={`删除${order.id}`} title="删除工单" onClick={() => setDeleteTarget(order)} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={10}><div className="ds-empty wo-table-empty">未找到匹配的工单，可调整查询条件或重置后重试</div></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <nav className="wo-pagination" aria-label="工单列表分页">
          <span className="wo-pagination__summary">每页 {PAGE_SIZE} 条 · 共 {filtered.length} 条</span>
          <ProductIconButton size="small" disabled={safePage <= 1} icon={<ChevronLeft size={14} />} onClick={() => setPage(safePage - 1)} aria-label="上一页" />
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <ProductButton
              key={number}
              size="small"
              className="wo-page-button"
              aria-current={number === safePage ? 'page' : undefined}
              onClick={() => setPage(number)}
            >
              {number}
            </ProductButton>
          ))}
          <ProductIconButton size="small" disabled={safePage >= totalPages} icon={<ChevronRight size={14} />} onClick={() => setPage(safePage + 1)} aria-label="下一页" />
        </nav>
      </section>

      {/* 新增 / 编辑表单 */}
      <ProductModal
        open={view === 'form'}
        onOpenChange={value => { if (!value) { setView('list'); setEditingId(null); } }}
        title={editingOrder ? '编辑工单' : '新增工单'}
        description={editingOrder ? '修改工单信息，关键生产字段修改需权限并记录日志。' : '手动录入生产联络单，工单创建后进入工作台待办队列。'}
        size="xl"
        footer={
          <>
            <ProductButton onClick={() => { setView('list'); setEditingId(null); }}>取消</ProductButton>
            <ProductButton type="primary" onClick={saveOrder}>保存工单</ProductButton>
          </>
        }
      >
        <div className="mfg-modal-form" ref={formBodyRef}>
          {errorList.length > 0 && (
            <div className="wo-form-errors" role="alert">
              <b>保存校验未通过（{errorList.length} 项）</b>
              {Object.entries(formErrors).map(([, message]) => <span key={message}>· {message}</span>)}
            </div>
          )}

          {/* 系统信息（只读，系统维护） */}
          <section>
            <h3>系统信息</h3>
            <dl className="wo-sys-grid">
              <div className="wo-sys-item"><dt>状态</dt><dd>{editingOrder?.status ?? '新建'}</dd></div>
              <div className="wo-sys-item"><dt>过账</dt><dd>{editingOrder?.posted ?? '未过账'}</dd></div>
              <div className="wo-sys-item"><dt>来源</dt><dd>{editingOrder?.source ?? '系统新增'}</dd></div>
              <div className="wo-sys-item"><dt>创建人</dt><dd>{editingOrder?.creator ?? CURRENT_USER}</dd></div>
              <div className="wo-sys-item"><dt>创建时间</dt><dd>{editingOrder?.createdAt ?? fmtNow()}</dd></div>
            </dl>
          </section>

          {/* 工单基本信息 */}
          <section>
            <h3>工单基本信息</h3>
            <div className="mfg-form-grid mfg-form-grid--modal">
              <ProductField label="加工单号 *" hint={formErrors.id ? <span className="wo-error">{formErrors.id}</span> : undefined}>
                <div className="wo-input-action">
                  <ProductTextInput value={draft.id} onChange={e => setDraftField('id', e.target.value)} data-error={formErrors.id ? 'true' : undefined} aria-label="加工单号" />
                  <ProductIconButton size="small" icon={<ScanLine size={15} />} aria-label="扫码输入加工单号" title="扫码输入" onClick={scanId} />
                </div>
              </ProductField>
              <ProductField label="优先级 *" hint={formErrors.priority ? <span className="wo-error">{formErrors.priority}</span> : undefined}>
                <ProductSelect value={draft.priority} onChange={e => setDraftField('priority', e.target.value)} data-error={formErrors.priority ? 'true' : undefined} aria-label="优先级">
                  <option value="普通">普通</option>
                  <option value="高优先级">高优先级</option>
                </ProductSelect>
              </ProductField>
              <ProductField label="需求时间 *" hint={formErrors.due ? <span className="wo-error">{formErrors.due}</span> : undefined}>
                <ProductTextInput type="datetime-local" value={draft.due ? toDateTimeLocal(draft.due) : ''} onChange={e => setDraftField('due', e.target.value.replace('T', ' '))} data-error={formErrors.due ? 'true' : undefined} aria-label="需求时间" />
              </ProductField>
              <ProductField label="是否编程 *" hint={formErrors.programmed ? <span className="wo-error">{formErrors.programmed}</span> : undefined}>
                <ProductSelect value={draft.programmed} onChange={e => setDraftField('programmed', e.target.value)} data-error={formErrors.programmed ? 'true' : undefined} aria-label="是否编程">
                  <option value="否">否，未编程</option>
                  <option value="是">是，已编程</option>
                </ProductSelect>
              </ProductField>
              <ProductField label="订单号码">
                <ProductTextInput value={draft.orderNo} onChange={e => setDraftField('orderNo', e.target.value)} placeholder="关联客户订单或销售订单" aria-label="订单号码" />
              </ProductField>
              <ProductField label="专案名称">
                <ProductTextInput value={draft.projectName} onChange={e => setDraftField('projectName', e.target.value)} placeholder="工单所属项目" aria-label="专案名称" />
              </ProductField>
              <ProductField label="订单负责人">
                <ProductTextInput value={draft.orderOwner} onChange={e => setDraftField('orderOwner', e.target.value)} aria-label="订单负责人" />
              </ProductField>
              <ProductField label="订单创建人">
                <ProductTextInput value={draft.orderCreator} onChange={e => setDraftField('orderCreator', e.target.value)} aria-label="订单创建人" />
              </ProductField>
            </div>
          </section>

          {/* 工件信息 */}
          <section>
            <h3>工件信息</h3>
            <div className="mfg-form-grid mfg-form-grid--modal">
              <ProductField label="件号 *" hint={formErrors.partNo ? <span className="wo-error">{formErrors.partNo}</span> : undefined}>
                <ProductTextInput value={draft.partNo} onChange={e => setDraftField('partNo', e.target.value)} data-error={formErrors.partNo ? 'true' : undefined} placeholder="生产联络单中的件号" aria-label="件号" />
              </ProductField>
              <ProductField label="件名 *" hint={formErrors.partName ? <span className="wo-error">{formErrors.partName}</span> : undefined}>
                <ProductTextInput value={draft.partName} onChange={e => setDraftField('partName', e.target.value)} data-error={formErrors.partName ? 'true' : undefined} aria-label="件名" />
              </ProductField>
              <ProductField label={draft.programmed === '是' ? '加工程序 *' : '加工程序'} hint={formErrors.program ? <span className="wo-error">{formErrors.program}</span> : draft.programmed === '是' ? undefined : <span className="wo-muted-note">未编程时允许为空</span>}>
                <ProductTextInput value={draft.program} onChange={e => setDraftField('program', e.target.value)} data-error={formErrors.program ? 'true' : undefined} placeholder="例：MJ-A17-R3.nc" aria-label="加工程序" />
              </ProductField>
              <ProductField label="单位">
                <ProductSelect value={draft.unit} onChange={e => setDraftField('unit', e.target.value)} aria-label="单位">
                  {UNIT_OPTIONS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </ProductSelect>
              </ProductField>
              <ProductField label="模具编号">
                <ProductTextInput value={draft.moldNo} onChange={e => setDraftField('moldNo', e.target.value)} placeholder="例：MOULD-240817" aria-label="模具编号" />
              </ProductField>
              <ProductField label="模具类型">
                <ProductTextInput value={draft.moldType} onChange={e => setDraftField('moldType', e.target.value)} aria-label="模具类型" />
              </ProductField>
              <ProductField label="版次">
                <ProductTextInput value={draft.revision} onChange={e => setDraftField('revision', e.target.value)} placeholder="例：V1.0" aria-label="版次" />
              </ProductField>
            </div>
          </section>

          {/* 工序明细 */}
          <section className="wo-operation-editor">
            <header className="wo-operation-editor__header">
              <div>
                <h3>工序明细 <ProductTag tone="accent" size="small">至少 1 条</ProductTag></h3>
                <p>工序顺序将生成工作台工艺流程，例如 RG → SM → CNC → QC</p>
              </div>
              <ProductButton size="small" icon={<Plus size={14} />} onClick={addOperation}>新增工序</ProductButton>
            </header>
            {formErrors.operations && <div className="wo-error wo-muted-note--spaced">{formErrors.operations}</div>}
            {draft.operations.length === 0 ? (
              <div className="wo-op-empty">暂无可执行工序，请点击「新增工序」添加工艺步骤</div>
            ) : (
              <>
                <div className="wo-op-head">
                  <span>行号</span><span>工序 *</span><span>应加工数 *</span><span>预计工时(H)</span><span>加工人员</span><span>生产备注</span><span className="wo-table__actions-label">操作</span>
                </div>
                <div className="wo-op-list">
                  {draft.operations.map((op, index) => (
                    <div className="wo-op-row" key={`${index}-${op.lineNo}`} data-error={formErrors[`op_${index}`] ? 'true' : undefined}>
                      <div className="wo-op-index">
                        {String(op.lineNo).padStart(2, '0')}
                        {formErrors[`op_${index}`] && <CircleAlert size={13} color="var(--app-danger)" />}
                      </div>
                      <div className="wo-op-field" data-label="工序">
                        <ProductSelect value={op.name} onChange={e => setOperationField(index, 'name', e.target.value)} aria-label={`第${index + 1}行工序`}>
                          {OPERATION_OPTIONS.map(name => <option key={name} value={name}>{name}</option>)}
                        </ProductSelect>
                      </div>
                      <div className="wo-op-field" data-label="应加工数">
                        <ProductTextInput type="number" min={1} step="1" value={op.planned} onChange={e => setOperationField(index, 'planned', e.target.value)} aria-label={`第${index + 1}行应加工数`} />
                      </div>
                      <div className="wo-op-field" data-label="预计工时(H)">
                        <ProductTextInput type="number" min={0} step="0.01" value={op.hours} onChange={e => setOperationField(index, 'hours', e.target.value)} aria-label={`第${index + 1}行预计工时`} />
                      </div>
                      <div className="wo-op-field" data-label="加工人员">
                        <ProductTextInput value={op.worker} onChange={e => setOperationField(index, 'worker', e.target.value)} placeholder="执行人员" aria-label={`第${index + 1}行加工人员`} />
                      </div>
                      <div className="wo-op-field" data-label="生产备注">
                        <ProductTextInput value={op.remark} onChange={e => setOperationField(index, 'remark', e.target.value)} placeholder="填写生产备注" aria-label={`第${index + 1}行生产备注`} />
                      </div>
                      <div className="wo-op-actions">
                        <ProductIconButton size="small" disabled={index === 0} icon={<ArrowUp size={13} />} aria-label="上移工序" title="上移" onClick={() => moveOperation(index, -1)} />
                        <ProductIconButton size="small" disabled={index === draft.operations.length - 1} icon={<ArrowDown size={13} />} aria-label="下移工序" title="下移" onClick={() => moveOperation(index, 1)} />
                        <ProductIconButton status="danger" size="small" icon={<Trash2 size={13} />} aria-label="删除工序" title="删除工序" onClick={() => removeOperation(index)} />
                      </div>
                    </div>
                  ))}
                </div>
                {draft.operations.some(op => formErrors[`op_${draft.operations.indexOf(op)}`]) && (
                  <div className="wo-form-errors wo-muted-note--spaced">
                    {draft.operations.map((op, index) => formErrors[`op_${index}`] ? <span key={index}>第 {index + 1} 行：{formErrors[`op_${index}`]}</span> : null)}
                  </div>
                )}
              </>
            )}
          </section>

        </div>
      </ProductModal>

      {/* 详情抽屉 */}
      <ProductDrawer
        open={view === 'detail' && !!selected}
        onOpenChange={value => { if (!value) closeDetail(); }}
        title={selected?.id ?? '工单详情'}
        description={selected ? `${selected.partNo} · ${selected.partName}` : undefined}
        width="min(760px, calc(100vw - 48px))"
        footer={selected && (
          <>
            <ProductButton onClick={closeDetail}>关闭</ProductButton>
            <ProductButton icon={<Download size={14} />} onClick={exportOrders}>导出</ProductButton>
            {selected.status === '新建' && (
              <>
                <ProductButton icon={<ArrowDownUp size={14} />} onClick={() => openPriority(selected)}>调整优先级</ProductButton>
                <ProductButton type="primary" icon={<Pencil size={14} />} onClick={() => openEdit(selected)}>编辑工单</ProductButton>
              </>
            )}
          </>
        )}
      >
        {selected && (
          <div className="mfg-drawer-content">
            <div className="mfg-drawer-tags">
              <StatusTag status={selected.status} />
              {selected.priority === '高优先级' && <ProductTag tone="danger" size="small">高优先级</ProductTag>}
              <ProductTag tone={selected.posted === '已过账' ? 'success' : 'neutral'} size="small">{selected.posted}</ProductTag>
              <ProductTag tone="accent" size="small">{selected.source}</ProductTag>
            </div>

            {/* 系统信息 */}
            <section className="mfg-drawer-section">
              <h3>系统信息</h3>
              <dl className="mfg-drawer-grid">
                <div><dt>状态</dt><dd>{selected.status}</dd></div>
                <div><dt>过账</dt><dd>{selected.posted}</dd></div>
                <div><dt>来源</dt><dd>{selected.source}</dd></div>
                <div><dt>创建人</dt><dd>{selected.creator}</dd></div>
                <div><dt>创建时间</dt><dd>{selected.createdAt}</dd></div>
              </dl>
            </section>

            {/* 工单基本信息 */}
            <section className="mfg-drawer-section">
              <h3>工单基本信息</h3>
              <dl className="mfg-drawer-grid">
                <div><dt>加工单号</dt><dd>{selected.id}</dd></div>
                <div><dt>优先级</dt><dd>{selected.priority}</dd></div>
                <div><dt>需求时间</dt><dd>{display(selected.due)}</dd></div>
                <div><dt>是否编程</dt><dd>{selected.programmed === '是' ? '是，已编程' : '否，未编程'}</dd></div>
                <div><dt>订单号码</dt><dd>{display(selected.orderNo)}</dd></div>
                <div><dt>专案名称</dt><dd>{display(selected.projectName)}</dd></div>
                <div><dt>订单负责人</dt><dd>{display(selected.orderOwner)}</dd></div>
                <div><dt>订单创建人</dt><dd>{display(selected.orderCreator)}</dd></div>
              </dl>
            </section>

            {/* 工件信息 */}
            <section className="mfg-drawer-section">
              <h3>工件信息</h3>
              <dl className="mfg-drawer-grid">
                <div><dt>件号</dt><dd>{display(selected.partNo)}</dd></div>
                <div><dt>件名</dt><dd>{display(selected.partName)}</dd></div>
                <div><dt>加工程序</dt><dd>{display(selected.program)}</dd></div>
                <div><dt>单位</dt><dd>{display(selected.unit)}</dd></div>
                <div><dt>模具编号</dt><dd>{display(selected.moldNo)}</dd></div>
                <div><dt>模具类型</dt><dd>{display(selected.moldType)}</dd></div>
                <div><dt>版次</dt><dd>{display(selected.revision)}</dd></div>
              </dl>
            </section>

            {/* 工序明细 */}
            <section className="mfg-drawer-section">
              <div className="mfg-modal-section-title">
                <div>
                  <h3>工序明细</h3>
                  <p>{selected.operations.map(op => op.name).join(' → ')}</p>
                </div>
                <ProductTag tone="accent" size="small">{selected.operations.length} 道工序</ProductTag>
              </div>
              <div className="wo-table-frame">
                <table className="wo-detail-table">
                  <thead>
                    <tr><th>行号</th><th>工序</th><th>应加工数</th><th>预计工时(H)</th><th>加工人员</th><th>生产备注</th></tr>
                  </thead>
                  <tbody>
                    {selected.operations.map(op => (
                      <tr key={op.lineNo}>
                        <td>{String(op.lineNo).padStart(2, '0')}</td>
                        <td><ProductTag size="small">{op.name}</ProductTag></td>
                        <td>{op.planned}</td>
                        <td>{op.hours.toFixed(2)} H</td>
                        <td>{display(op.worker)}</td>
                        <td>{display(op.remark)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 数量进度（工作台回写） */}
            {(selected.status === '加工中' || selected.status === '加工完成') && (
              <section className="mfg-drawer-section">
                <div className="mfg-modal-section-title">
                  <div>
                    <h3>数量进度</h3>
                    <p>由工作台装夹、加工、拆夹操作回写</p>
                  </div>
                </div>
                {(() => {
                  const total = totalPlanned(selected);
                  return (
                    <div className="wo-progress-grid">
                      <div className="wo-progress-item"><b>{selected.clamped}</b><span>已装夹 / {total}</span></div>
                      <div className="wo-progress-item"><b>{selected.processed}</b><span>已加工 / {total}</span></div>
                      <div className="wo-progress-item"><b>{selected.unclamped}</b><span>已拆夹 / {total}</span></div>
                      <div className="wo-progress-item"><b>{Math.max(0, total - selected.processed)}</b><span>待加工 / {total}</span></div>
                    </div>
                  );
                })()}
              </section>
            )}

            {/* Excel 导入快照 */}
            <section className="mfg-drawer-section">
              <div className="mfg-modal-section-title">
                <div>
                  <h3>Excel 导入快照</h3>
                  <p>客户原始扩展字段，导入、导出过程中不丢失</p>
                </div>
              </div>
              {Object.keys(selected.snapshot).length === 0 ? (
                <div className="wo-op-empty">无快照数据（非 Excel 导入）</div>
              ) : (
                <dl className="wo-snapshot">
                  {Object.entries(selected.snapshot).map(([key, value]) => (
                    <div key={key}><dt>{key}</dt><dd>{display(value)}</dd></div>
                  ))}
                </dl>
              )}
            </section>

            {/* 操作日志 */}
            <section className="mfg-drawer-section">
              <h3>操作日志</h3>
              <div className="mfg-log">
                {selected.logs.map((log, index) => (
                  <div key={index}>
                    <i />
                    <span><b>{log.operator}</b> {log.action}</span>
                    <time>{log.time}</time>
                  </div>
                ))}
                {selected.priorityLogs.length === 0 && selected.logs.length === 0 && <div className="wo-muted-note">暂无操作日志</div>}
              </div>
              {selected.priorityLogs.length > 0 && (
                <>
                  <div className="wo-muted-note wo-muted-note--spaced">优先级调整记录</div>
                  <div className="mfg-log">
                    {selected.priorityLogs.map((log, index) => (
                      <div key={index}>
                        <i />
                        <span><b>{log.operator}</b> 将优先级由“{log.from}”调整为“{log.to}”</span>
                        <time>{log.time}</time>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </ProductDrawer>

      {/* 删除确认 */}
      <ProductModal
        open={!!deleteTarget}
        onOpenChange={value => { if (!value) setDeleteTarget(null); }}
        title="删除工单"
        description="确认要删除该工单吗？删除后无法恢复。"
        size="sm"
        footer={
          <>
            <ProductButton onClick={() => setDeleteTarget(null)}>取消</ProductButton>
            <ProductButton status="danger" type="primary" icon={<Trash2 size={14} />} onClick={confirmDelete}>删除</ProductButton>
          </>
        }
      >
        <div className="wo-dialog-stack">
          <p className="wo-dialog-copy">
            即将删除工单 <b>{deleteTarget?.id}</b>（{deleteTarget?.partNo} · {deleteTarget?.partName}）。
          </p>
          <div className="wo-danger-note">
            仅允许删除尚未进入生产执行流程的工单；已产生装夹、加工、拆夹记录的工单不允许删除，避免历史记录失去关联。
          </div>
        </div>
      </ProductModal>

      {/* 优先级调整 */}
      <ProductModal
        open={!!priorityTarget}
        onOpenChange={value => { if (!value) setPriorityTarget(null); }}
        title="调整优先级"
        description="调整后同步影响工作台工单队列排序。"
        size="sm"
        footer={
          <>
            <ProductButton onClick={() => setPriorityTarget(null)}>取消</ProductButton>
            <ProductButton type="primary" onClick={confirmPriority}>确认调整</ProductButton>
          </>
        }
      >
        <div className="wo-dialog-stack">
          <div className="wo-priority-order">
            <span className="wo-muted-note">工单</span>
            <b>{priorityTarget?.id}</b>
          </div>
          <ProductField label="新优先级 *">
            <ProductSelect value={priorityValue} onChange={e => setPriorityValue(e.target.value as WorkOrderPriority)} aria-label="新优先级">
              <option value="普通">普通</option>
              <option value="高优先级">高优先级</option>
            </ProductSelect>
          </ProductField>
          <div className="wo-muted-note">
            当前优先级：{priorityTarget?.priority}。每次调整将记录原优先级、新优先级、操作人与操作时间。
          </div>
        </div>
      </ProductModal>

      {/* Excel 导入 */}
      <ProductModal
        open={importOpen}
        onOpenChange={value => { if (!value) { setImportOpen(false); setImportStep(1); setImportFileName(''); setImportRawRows([]); setImportResult(null); } }}
        title="Excel 导入工单"
        description="批量接收客户生产联络单，重复生产单号自动跳过。"
        size="lg"
        footer={
          <>
            <ProductButton onClick={() => { setImportOpen(false); setImportStep(1); setImportFileName(''); setImportRawRows([]); setImportResult(null); }}>关闭</ProductButton>
            {importStep === 2 && (
              <ProductButton type="primary" icon={<CheckCircle2 size={14} />} onClick={confirmImport}>
                确认导入 {successCount} 条
              </ProductButton>
            )}
            {importStep === 3 && <ProductButton type="primary" onClick={() => { setImportOpen(false); setImportStep(1); setImportFileName(''); setImportRawRows([]); setImportResult(null); }}>完成</ProductButton>}
          </>
        }
      >
        <div className="wo-import-steps" aria-label="导入步骤">
          <span className={importStep >= 1 ? 'is-done' : 'is-current'}><i>1</i>选择文件</span>
          <ArrowDownUp size={13} />
          <span className={importStep >= 2 ? 'is-done' : 'is-current'}><i>2</i>解析 · 字段匹配 · 校验</span>
          <ArrowDownUp size={13} />
          <span className={importStep >= 3 ? 'is-current' : ''}><i>3</i>导入结果</span>
        </div>

        {importStep === 1 && (
          <div className="wo-import-stack">
            <ProductUploadBox
              title="选择生产联络单文件"
              description="支持 .csv / .xlsx / .xls，Excel 列名与模板字段一致时自动匹配"
              fileName={importFileName}
              accept=".csv,.xlsx,.xls"
              onFileChange={handleImportFile}
            />
            <div className="wo-import-note">
              <FileSpreadsheet size={16} />
              <div>
                <b>字段匹配规则：</b>「生产单号」固定映射为加工单号；「工艺列表」解析为工序明细；未匹配列写入 Excel 导入快照（_snapshot）保留原始值；重复生产单号跳过不覆盖。
              </div>
            </div>
          </div>
        )}

        {importStep === 2 && (
          <div className="wo-import-stack">
            {mappedImportRows.length === 0 ? (
              <div className="wo-op-empty">文件中未解析到有效数据行，请检查文件格式</div>
            ) : (
              <>
                <div className="wo-import-stats">
                  <div className="wo-import-stat"><b>{mappedImportRows.length}</b><span>文件总数量</span></div>
                  <div className="wo-import-stat"><b data-tone="success">{successCount}</b><span>可导入</span></div>
                  <div className="wo-import-stat"><b data-tone="warning">{skipCount}</b><span>重复跳过</span></div>
                  <div className="wo-import-stat"><b data-tone="danger">{failCount}</b><span>校验失败</span></div>
                </div>
                <div className="wo-table-frame wo-table-frame--preview">
                  <table className="wo-detail-table">
                    <thead>
                      <tr><th>状态</th><th>生产单号</th><th>件号 / 件名</th><th>工艺路线</th><th>原因</th></tr>
                    </thead>
                    <tbody>
                      {mappedImportRows.map((row, index) => (
                        <tr key={index}>
                          <td>
                            {row.status === 'pending' ? <ProductTag tone="accent" size="small">可导入</ProductTag>
                              : row.reason.includes('重复') ? <ProductTag tone="warning" size="small">跳过</ProductTag>
                              : <ProductTag tone="danger" size="small">失败</ProductTag>}
                          </td>
                          <td>{row.order.id || '-'}</td>
                          <td>{row.order.partNo || '-'} · {row.order.partName || '-'}</td>
                          <td>{row.order.operations.map(op => op.name).join(' → ') || '-'}</td>
                          <td><span className="mfg-muted">{row.reason || '—'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {importStep === 3 && importResult && (
          <div className="wo-import-stack">
            <div className="wo-import-stats">
              <div className="wo-import-stat"><b>{importResult.total}</b><span>文件总数量</span></div>
              <div className="wo-import-stat"><b data-tone="success">{importResult.success}</b><span>成功数量</span></div>
              <div className="wo-import-stat"><b data-tone="warning">{importResult.skip}</b><span>跳过数量</span></div>
              <div className="wo-import-stat"><b data-tone="danger">{importResult.fail}</b><span>失败数量</span></div>
            </div>
            {(importResult.skip > 0 || importResult.fail > 0) ? (
              <div className="wo-table-frame wo-table-frame--result">
                <table className="wo-detail-table">
                  <thead>
                    <tr><th>生产单号</th><th>结果</th><th>跳过 / 失败原因</th></tr>
                  </thead>
                  <tbody>
                    {importResult.rows.filter(row => row.status !== 'success').map((row, index) => (
                      <tr key={index}>
                        <td>{row.id}</td>
                        <td>{row.status === 'skip' ? <ProductTag tone="warning" size="small">跳过</ProductTag> : <ProductTag tone="danger" size="small">失败</ProductTag>}</td>
                        <td><span className="mfg-muted">{row.reason}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="wo-import-note"><CheckCircle2 size={16} /><div>全部导入成功，工单状态为「新建」、过账状态「未过账」、单据来源「Excel 导入」，已进入工作台待办队列。</div></div>
            )}
          </div>
        )}
      </ProductModal>
    </main>
  );
}
