export const GRID_COLS = 12;
export const GRID_ROWS = 9;
export const CELL_W = 120;
export const CELL_H = 100;
export const CANVAS_W = GRID_COLS * CELL_W; // 1440
export const CANVAS_H = GRID_ROWS * CELL_H; // 900

export interface HomepageScheme {
  id: string;
  name: string;
  version: string;
  lastEdited: string;
}

export interface ComponentCategory {
  id: string;
  name: string;
}

export interface ComponentDef {
  id: string;
  name: string;
  categoryId: string;
  colSpan: number;
  rowSpan: number;
  description: string;
  scopes: string[];
}

export interface PlacedItem {
  instanceId: string;
  defId: string;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  config: Record<string, string | number | boolean>;
}

export interface DragItem {
  defId: string;
  colSpan: number;
  rowSpan: number;
}

// ── Property field schema ────────────────────────────────────────────────────

export type PropField =
  | { type: 'section'; label: string }
  | { type: 'text';   key: string; label: string; default: string }
  | { type: 'select'; key: string; label: string; options: string[]; default: string }
  | { type: 'toggle'; key: string; label: string; default: boolean }
  | { type: 'number'; key: string; label: string; min: number; max: number; unit?: string; default: number };

export const COMPONENT_PROPS: Record<string, PropField[]> = {
  'kpi-metrics': [
    { type: 'section', label: '基础设置' },
    { type: 'text',   key: 'title',        label: '标题',       default: '运行指标'  },
    { type: 'number', key: 'refreshRate',  label: '刷新频率',   min: 1,  max: 60, unit: 's', default: 5 },
    { type: 'section', label: '显示字段' },
    { type: 'toggle', key: 'showTaskCount',    label: '显示任务数',   default: true  },
    { type: 'toggle', key: 'showCycleTime',    label: '显示生产节拍', default: true  },
    { type: 'toggle', key: 'showEfficiency',   label: '显示生产效率', default: true  },
    { type: 'toggle', key: 'showRunTime',      label: '显示运行时长', default: true  },
  ],
  'device-status': [
    { type: 'section', label: '基础设置' },
    { type: 'text',   key: 'title',          label: '标题',         default: '设备状态'  },
    { type: 'number', key: 'maxDevices',      label: '最大设备数量', min: 3, max: 20, default: 8 },
    { type: 'section', label: '显示设置' },
    { type: 'toggle', key: 'showOfflineOnly', label: '仅显示离线设备', default: false },
    { type: 'toggle', key: 'showDeviceType',  label: '显示设备类型',   default: true  },
    { type: 'toggle', key: 'autoRefresh',     label: '自动刷新',       default: true  },
  ],
  'alert-info': [
    { type: 'section', label: '基础设置' },
    { type: 'text',   key: 'title',        label: '标题',         default: '告警信息'  },
    { type: 'number', key: 'maxCount',     label: '最大显示条数', min: 3, max: 20, default: 10 },
    { type: 'select', key: 'level',        label: '告警级别',     options: ['全部级别', '仅严重', '严重 + 警告'], default: '全部级别' },
    { type: 'section', label: '显示设置' },
    { type: 'toggle', key: 'showResolved', label: '显示已处理告警', default: false },
    { type: 'toggle', key: 'autoRefresh',  label: '自动刷新',      default: true  },
  ],
  'map-view': [
    { type: 'section', label: '基础设置' },
    { type: 'text',   key: 'title',        label: '标题',       default: '实时地图与机器人状态' },
    { type: 'select', key: 'mapType',      label: '地图模式',   options: ['3D实时视图', '2D平面图', '混合模式'], default: '3D实时视图' },
    { type: 'number', key: 'refreshRate',  label: '刷新频率',   min: 1, max: 30, unit: 'Hz', default: 10 },
    { type: 'section', label: '显示设置' },
    { type: 'toggle', key: 'showRobot',    label: '显示机器人模型', default: true  },
    { type: 'toggle', key: 'showPath',     label: '显示运动路径',   default: true  },
    { type: 'toggle', key: 'showCoords',   label: '显示坐标信息',   default: true  },
    { type: 'toggle', key: 'showGrid',     label: '显示空间网格',   default: true  },
  ],
  'tray-status': [
    { type: 'section', label: '基础设置' },
    { type: 'text',   key: 'title',         label: '标题',           default: '料盘情况'  },
    { type: 'number', key: 'rawTrayTotal',  label: '生料盘总数',     min: 4, max: 32, default: 8  },
    { type: 'number', key: 'tempTrayTotal', label: '暂料盘总数',     min: 4, max: 32, default: 8  },
    { type: 'section', label: '显示设置' },
    { type: 'toggle', key: 'showProdStatus', label: '显示生产完成状态', default: true },
    { type: 'toggle', key: 'showSummary',    label: '显示汇总统计',     default: true },
    { type: 'select', key: 'trayLayout',     label: '料盘列数', options: ['4列', '6列', '8列'], default: '8列' },
  ],
  'active-tasks': [
    { type: 'section', label: '基础设置' },
    { type: 'text',   key: 'title',           label: '标题',         default: '正在执行的任务' },
    { type: 'number', key: 'maxCount',         label: '最大显示数量', min: 1, max: 10, default: 5 },
    { type: 'section', label: '显示设置' },
    { type: 'toggle', key: 'showCancelBtn',    label: '显示取消按钮',   default: true  },
    { type: 'toggle', key: 'showTaskType',     label: '显示任务类型',   default: true  },
    { type: 'toggle', key: 'showSubtitle',     label: '显示副标题信息', default: true  },
  ],
  'task-queue': [
    { type: 'section', label: '基础设置' },
    { type: 'text',   key: 'title',        label: '标题',         default: '任务队列'  },
    { type: 'number', key: 'maxCount',     label: '显示条数',     min: 5,  max: 50, default: 20 },
    { type: 'section', label: '显示字段' },
    { type: 'toggle', key: 'showStartTime', label: '显示月始时间', default: true  },
    { type: 'toggle', key: 'showTrips',     label: '显示往来次数', default: true  },
    { type: 'toggle', key: 'showDetail',    label: '显示详细按钮', default: true  },
    { type: 'toggle', key: 'showGroupBy',   label: '分组显示',     default: false },
  ],
};

// ── Static catalog ───────────────────────────────────────────────────────────

export const CATEGORIES: ComponentCategory[] = [
  { id: 'monitor',    name: '监控看板' },
  { id: 'map',        name: '地图导航' },
  { id: 'production', name: '生产管理' },
  { id: 'task',       name: '任务管理' },
];

export const COMPONENT_DEFS: ComponentDef[] = [
  {
    id: 'kpi-metrics', name: '运行指标', categoryId: 'monitor', colSpan: 6, rowSpan: 1,
    description: '展示任务数、生产节拍、生产效率等核心运行KPI，数据实时刷新',
    scopes: ['复合机器人', 'AGV'],
  },
  {
    id: 'device-status', name: '设备状态', categoryId: 'monitor', colSpan: 2, rowSpan: 7,
    description: '列出感盘、机械臂、夹具、相机等所有连接设备的实时在线状态',
    scopes: ['复合机器人'],
  },
  {
    id: 'alert-info', name: '告警信息', categoryId: 'monitor', colSpan: 4, rowSpan: 4,
    description: '展示轨迹规划失败、通信异常等活跃告警，支持处理、忽略操作',
    scopes: ['通用'],
  },
  {
    id: 'map-view', name: '实时地图', categoryId: 'map', colSpan: 6, rowSpan: 5,
    description: '3D可视化机器人工作空间，实时显示机器人位置、姿态与运动轨迹',
    scopes: ['复合机器人', 'AGV', '巡检'],
  },
  {
    id: 'tray-status', name: '料盘情况', categoryId: 'production', colSpan: 6, rowSpan: 3,
    description: '展示生料盘、暂料盘的占用状态及料盘生产完成进度与汇总统计',
    scopes: ['复合机器人'],
  },
  {
    id: 'active-tasks', name: '正在执行的任务', categoryId: 'task', colSpan: 4, rowSpan: 3,
    description: '实时显示当前执行中的任务列表，含任务名称、类型，支持一键取消',
    scopes: ['复合机器人', 'AGV'],
  },
  {
    id: 'task-queue', name: '任务队列', categoryId: 'task', colSpan: 4, rowSpan: 6,
    description: '展示任务执行队列，含月始时间、往来次数及详情查看入口',
    scopes: ['通用'],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function isFree(
  items: PlacedItem[], col: number, row: number, colSpan: number, rowSpan: number, excludeId?: string,
): boolean {
  for (const item of items) {
    if (item.instanceId === excludeId) continue;
    const h = col < item.col + item.colSpan && col + colSpan > item.col;
    const v = row < item.row + item.rowSpan && row + rowSpan > item.row;
    if (h && v) return false;
  }
  return true;
}

function cfg(defId: string): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const f of COMPONENT_PROPS[defId] ?? []) {
    if (f.type !== 'section') out[f.key] = f.default;
  }
  return out;
}

export const INITIAL_SCHEMES: HomepageScheme[] = [
  { id: 's1', name: 'MCR复合机器人', version: 'V1', lastEdited: '2026-07-01 14:32' },
  { id: 's2', name: 'AGV搬运机器人', version: 'V2', lastEdited: '2026-06-28 09:15' },
  { id: 's3', name: '巡检机器人',    version: 'V1', lastEdited: '2026-06-25 16:48' },
];

// Layout mirrors the screenshot: device list + map (center) + tasks (right)
export const INITIAL_ITEMS: Record<string, PlacedItem[]> = {
  s1: [
    { instanceId: 'i1', defId: 'kpi-metrics',  col: 1, row: 1, colSpan: 6, rowSpan: 1, config: cfg('kpi-metrics')  },
    { instanceId: 'i2', defId: 'device-status', col: 1, row: 2, colSpan: 2, rowSpan: 7, config: cfg('device-status') },
    { instanceId: 'i3', defId: 'map-view',      col: 3, row: 2, colSpan: 6, rowSpan: 5, config: cfg('map-view')     },
    { instanceId: 'i4', defId: 'tray-status',   col: 3, row: 7, colSpan: 6, rowSpan: 3, config: cfg('tray-status')  },
    { instanceId: 'i5', defId: 'active-tasks',  col: 9, row: 1, colSpan: 4, rowSpan: 3, config: cfg('active-tasks') },
    { instanceId: 'i6', defId: 'task-queue',    col: 9, row: 4, colSpan: 4, rowSpan: 6, config: cfg('task-queue')   },
  ],
  s2: [
    { instanceId: 'j1', defId: 'kpi-metrics',  col: 1,  row: 1, colSpan: 8, rowSpan: 1, config: cfg('kpi-metrics')  },
    { instanceId: 'j2', defId: 'map-view',      col: 1,  row: 2, colSpan: 8, rowSpan: 5, config: cfg('map-view')     },
    { instanceId: 'j3', defId: 'active-tasks',  col: 9,  row: 1, colSpan: 4, rowSpan: 3, config: cfg('active-tasks') },
    { instanceId: 'j4', defId: 'task-queue',    col: 9,  row: 4, colSpan: 4, rowSpan: 6, config: cfg('task-queue')   },
    { instanceId: 'j5', defId: 'alert-info',    col: 1,  row: 7, colSpan: 4, rowSpan: 3, config: cfg('alert-info')   },
  ],
  s3: [
    { instanceId: 'k1', defId: 'device-status', col: 1,  row: 1, colSpan: 2, rowSpan: 9, config: cfg('device-status') },
    { instanceId: 'k2', defId: 'map-view',       col: 3,  row: 1, colSpan: 7, rowSpan: 6, config: cfg('map-view')     },
    { instanceId: 'k3', defId: 'task-queue',     col: 10, row: 1, colSpan: 3, rowSpan: 9, config: cfg('task-queue')   },
    { instanceId: 'k4', defId: 'alert-info',     col: 3,  row: 7, colSpan: 4, rowSpan: 3, config: cfg('alert-info')   },
  ],
};
