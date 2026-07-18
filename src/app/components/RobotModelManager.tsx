import { useEffect, useMemo, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {
  ArrowLeft, Box, CheckCircle2, ChevronDown, ChevronRight, FileCode2, FileJson, FileUp, LayoutGrid,
  LockKeyhole, MoreHorizontal, Pencil, Plus, RefreshCw, Save, Search, SlidersHorizontal, Trash2, X,
} from 'lucide-react';
import {
  ArcoButton,
  ArcoCheckbox,
  ArcoField,
  ArcoIconButton,
  ArcoModal,
  ArcoSelect,
  ArcoTextArea,
  ArcoTextInput,
} from './HeroUI';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ROBOT_THEME_VARS, type ThemeMode } from '../theme';
import { INITIAL_SCHEMES, type HomepageScheme } from '../shared';
import type { SoftwareProduct } from '../softwareProducts';
import { CategoryTree, buildInitialData as buildProductVersionData, type ProductCategory } from './ProductVersionManager';

type PublishStatus = 'published' | 'draft';
type TopologyKind = 'link' | 'joint' | 'mesh';
type TopologyDropPosition = 'before' | 'inside' | 'after';
type MeshRole = 'visual' | 'collision';
type SoftwarePackageSlot = 'controller' | 'armDriver' | 'endEffector' | 'powerDriver' | 'perception';
type JointType = 'fixed' | 'revolute' | 'continuous' | 'prismatic';

interface RobotPose {
  rotation: number;
  height: number;
  reach: number;
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface OriginPose extends Vector3 {
  rx: number;
  ry: number;
  rz: number;
}

interface JointLimit {
  lower: number;
  upper: number;
  effort: number;
  velocity: number;
}

interface LinkMesh {
  filename: string;
  scale: Vector3;
  origin: OriginPose;
}

interface TopologyNode {
  id: string;
  label: string;
  kind: TopologyKind;
  origin?: OriginPose;
  axis?: Vector3;
  jointType?: JointType;
  limit?: JointLimit;
  meshRole?: MeshRole;
  mesh?: LinkMesh;
  // Legacy fields remain readable so existing prototype data can be exported.
  visualMesh?: LinkMesh;
  collisionMesh?: LinkMesh;
  children?: TopologyNode[];
}

type DeviceKind = 'chassis' | 'base' | 'arm' | 'tool';

interface DeviceStructureNode {
  id: string;
  label: string;
  kind: DeviceKind;
  origin: OriginPose;
  children?: DeviceStructureNode[];
}

interface TopologyDragItem {
  type: 'TOPOLOGY_NODE';
  nodeId: string;
  kind: TopologyKind;
}

interface SoftwarePackageOption {
  vendor: string;
  packageName: string;
  versions: string[];
}

interface SoftwarePackageConfig {
  slot: SoftwarePackageSlot;
  vendor: string;
  packageName: string;
  version: string;
}

interface SoftwareVersionItem {
  id: string;
  label: string;
  slot: SoftwarePackageSlot;
  vendor: string;
  packageName: string;
  version: string;
  versionCount: number;
}

interface SoftwareVersionGroup {
  id: string;
  label: string;
  totalCount: number;
  items: SoftwareVersionItem[];
}

interface SoftwareVersionCategory {
  id: string;
  label: string;
  icon: ProductCategory['icon'];
  totalCount: number;
  groups: SoftwareVersionGroup[];
}

interface RobotModel {
  id: string;
  name: string;
  type: string;
  description: string;
  ownerAccount: string;
  status: PublishStatus;
  version: string;
  updatedAt: string;
  componentCount: number;
  peripherals: string[];
  pose: RobotPose;
  topology: TopologyNode[];
  softwareSelectionIds: string[];
  softwarePackages: Record<SoftwarePackageSlot, SoftwarePackageConfig>;
  homepageSchemeId?: string;
}

interface RobotDraft {
  id?: string;
  name: string;
  type: string;
  description: string;
  ownerAccount: string;
  status: PublishStatus;
  version: string;
  componentCount: number;
  peripheralsText: string;
  homepageSchemeId?: string;
}

const ROBOT_TYPES = ['复合机器人', '人形双足机器人', 'AGV搬运机器人', '巡检机器人'];

const STATUS_META: Record<PublishStatus, { label: string; color: string; bg: string; border: string }> = {
  published: { label: '已发布', color: 'var(--robot-success)', bg: 'var(--robot-success-soft)', border: 'var(--robot-success-border)' },
  draft: { label: '未发布', color: 'var(--robot-muted)', bg: 'var(--robot-soft)', border: 'var(--robot-border-strong)' },
};

const DEFAULT_ORIGIN: OriginPose = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
const DEFAULT_AXIS: Vector3 = { x: 0, y: 0, z: 1 };
const DEFAULT_LIMIT: JointLimit = { lower: -180, upper: 180, effort: 80, velocity: 1.2 };
const DEFAULT_MESH_SCALE: Vector3 = { x: 1, y: 1, z: 1 };
const JOINT_TYPES: JointType[] = ['fixed', 'revolute', 'continuous', 'prismatic'];
const THEME_STORAGE_KEY = 'robot-manager-theme-mode';

function initialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'dark' ? 'dark' : 'light';
}

function robotThemeVars(mode: ThemeMode): React.CSSProperties {
  return ROBOT_THEME_VARS[mode] as React.CSSProperties;
}

function HeroButton({
  children,
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  isIconOnly = false,
  disabled = false,
  onPress,
  ariaLabel,
  title,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  isIconOnly?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  ariaLabel?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      className="hero-detail-button"
      data-variant={variant}
      data-size={size}
      data-icon-only={isIconOnly ? 'true' : 'false'}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      onClick={onPress}
      style={{ width: fullWidth ? '100%' : undefined }}
    >
      {children}
    </button>
  );
}

function HeroChip({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'accent' | 'success' | 'danger';
}) {
  return <span className="hero-detail-chip" data-tone={tone}>{children}</span>;
}

const SOFTWARE_PACKAGE_SLOTS: SoftwarePackageSlot[] = ['controller', 'armDriver', 'endEffector', 'powerDriver', 'perception'];

const SOFTWARE_PACKAGE_META: Record<SoftwarePackageSlot, {
  label: string;
  description: string;
  options: SoftwarePackageOption[];
}> = {
  controller: {
    label: '核心控制器',
    description: '为机器人选配核心大脑，支持仙工控制器等控制系统即插即用',
    options: [
      { vendor: '仙工智能', packageName: 'SRC Controller Kit', versions: ['v3.12.0', 'v3.10.4', 'v2.9.8'] },
      { vendor: '凌华科技', packageName: 'ROScube Control Stack', versions: ['v2.6.1', 'v2.4.0'] },
      { vendor: '自研控制器', packageName: 'Robot Brain Runtime', versions: ['v1.8.0', 'v1.6.5'] },
    ],
  },
  armDriver: {
    label: '机械臂驱动',
    description: '适配主流机械臂品牌驱动，覆盖节卡、思灵、珞石、遨博等',
    options: [
      { vendor: '节卡', packageName: 'JAKA ROS2 Driver', versions: ['v2.5.3', 'v2.3.0', 'v1.9.6'] },
      { vendor: '思灵', packageName: 'Agile Robots Arm Bridge', versions: ['v3.1.0', 'v2.8.4'] },
      { vendor: '珞石', packageName: 'Rokae xMate SDK Adapter', versions: ['v1.7.2', 'v1.5.0'] },
      { vendor: '遨博', packageName: 'AUBO Robot Driver', versions: ['v4.2.1', 'v4.0.0'] },
    ],
  },
  endEffector: {
    label: '末端工具',
    description: '配置电动、气动、自适应夹爪等执行器软件包',
    options: [
      { vendor: '电动夹爪', packageName: 'Electric Gripper Control', versions: ['v2.2.0', 'v2.0.1'] },
      { vendor: '气动夹爪', packageName: 'Pneumatic Gripper IO Pack', versions: ['v1.6.3', 'v1.4.0'] },
      { vendor: '自适应夹爪', packageName: 'Adaptive Gripper Runtime', versions: ['v3.0.2', 'v2.7.1'] },
    ],
  },
  powerDriver: {
    label: '动力系统',
    description: '管理伺服、步进电机驱动的软件包版本与运行栈',
    options: [
      { vendor: '伺服电机', packageName: 'Servo Motor Driver Stack', versions: ['v5.4.0', 'v5.1.2'] },
      { vendor: '步进电机', packageName: 'Stepper Motor Driver Stack', versions: ['v3.8.1', 'v3.6.0'] },
      { vendor: '混合动力', packageName: 'Hybrid Motion Runtime', versions: ['v2.1.0', 'v2.0.0'] },
    ],
  },
  perception: {
    label: '感知元件',
    description: '配置 IO 模块、距离传感器、相机/雷达等感知组件包',
    options: [
      { vendor: 'IO模块', packageName: 'Industrial IO Module Pack', versions: ['v2.9.0', 'v2.7.5'] },
      { vendor: '距离传感器', packageName: 'Distance Sensor HAL', versions: ['v1.5.2', 'v1.3.0'] },
      { vendor: '相机/雷达', packageName: 'Vision Lidar Fusion Pack', versions: ['v4.0.1', 'v3.8.8'] },
    ],
  },
};

const SOFTWARE_VERSION_CATALOG: SoftwareVersionCategory[] = [
  {
    id: 'controller-products',
    label: '控制器类产品',
    icon: 'controller',
    totalCount: 10,
    groups: [
      {
        id: 'controllers',
        label: '控制器',
        totalCount: 2,
        items: [
          { id: 'controller-shadow', label: '墨影控制器', slot: 'controller', vendor: '墨影智能', packageName: 'Shadow Controller Runtime', version: 'v3.4.1', versionCount: 8 },
          { id: 'controller-src', label: '仙工控制器', slot: 'controller', vendor: '仙工智能', packageName: 'SRC Controller Kit', version: 'v3.12.0', versionCount: 8 },
        ],
      },
      {
        id: 'arms',
        label: '机械臂',
        totalCount: 8,
        items: [
          { id: 'arm-jaka', label: '节卡机械臂', slot: 'armDriver', vendor: '节卡', packageName: 'JAKA ROS2 Driver', version: 'v2.5.3', versionCount: 6 },
          { id: 'arm-agile', label: '思灵机械臂', slot: 'armDriver', vendor: '思灵', packageName: 'Agile Robots Arm Bridge', version: 'v3.1.0', versionCount: 5 },
          { id: 'arm-rokae', label: '珞石机械臂', slot: 'armDriver', vendor: '珞石', packageName: 'Rokae xMate SDK Adapter', version: 'v1.7.2', versionCount: 4 },
          { id: 'arm-aubo', label: '遨博机械臂', slot: 'armDriver', vendor: '遨博', packageName: 'AUBO Robot Driver', version: 'v4.2.1', versionCount: 5 },
          { id: 'arm-dobot', label: '大族机械臂', slot: 'armDriver', vendor: '大族机器人', packageName: 'HANS Arm Bridge', version: 'v2.8.0', versionCount: 3 },
          { id: 'arm-elite', label: '越疆机械臂', slot: 'armDriver', vendor: '越疆', packageName: 'Dobot CR Driver', version: 'v3.6.2', versionCount: 4 },
          { id: 'arm-estun', label: '埃斯顿机械臂', slot: 'armDriver', vendor: '埃斯顿', packageName: 'Estun Robot Adapter', version: 'v1.9.1', versionCount: 3 },
          { id: 'arm-kawasaki', label: '川崎机械臂', slot: 'armDriver', vendor: '川崎', packageName: 'Kawasaki Arm Driver', version: 'v2.1.5', versionCount: 4 },
        ],
      },
    ],
  },
  {
    id: 'external-devices',
    label: '外接设备类产品',
    icon: 'external',
    totalCount: 32,
    groups: [
      {
        id: 'io-modules',
        label: 'IO 模块',
        totalCount: 4,
        items: [
          { id: 'io-digital', label: '数字量 IO 模块', slot: 'perception', vendor: 'IO模块', packageName: 'Industrial IO Module Pack', version: 'v2.9.0', versionCount: 4 },
          { id: 'io-analog', label: '模拟量 IO 模块', slot: 'perception', vendor: 'IO模块', packageName: 'Analog IO Extension Pack', version: 'v1.8.4', versionCount: 3 },
        ],
      },
      {
        id: 'grippers',
        label: '夹爪',
        totalCount: 6,
        items: [
          { id: 'gripper-electric', label: '电动夹爪', slot: 'endEffector', vendor: '电动夹爪', packageName: 'Electric Gripper Control', version: 'v2.2.0', versionCount: 4 },
          { id: 'gripper-pneumatic', label: '气动夹爪', slot: 'endEffector', vendor: '气动夹爪', packageName: 'Pneumatic Gripper IO Pack', version: 'v1.6.3', versionCount: 3 },
          { id: 'gripper-adaptive', label: '自适应夹爪', slot: 'endEffector', vendor: '自适应夹爪', packageName: 'Adaptive Gripper Runtime', version: 'v3.0.2', versionCount: 5 },
        ],
      },
      {
        id: 'motor-drivers',
        label: '电机驱动',
        totalCount: 8,
        items: [
          { id: 'motor-servo', label: '伺服电机', slot: 'powerDriver', vendor: '伺服电机', packageName: 'Servo Motor Driver Stack', version: 'v5.4.0', versionCount: 6 },
          { id: 'motor-stepper', label: '步进电机', slot: 'powerDriver', vendor: '步进电机', packageName: 'Stepper Motor Driver Stack', version: 'v3.8.1', versionCount: 5 },
        ],
      },
      {
        id: 'sensors',
        label: '传感器',
        totalCount: 14,
        items: [
          { id: 'sensor-distance', label: '距离传感器', slot: 'perception', vendor: '距离传感器', packageName: 'Distance Sensor HAL', version: 'v1.5.2', versionCount: 3 },
          { id: 'sensor-vision-lidar', label: '相机/雷达', slot: 'perception', vendor: '相机/雷达', packageName: 'Vision Lidar Fusion Pack', version: 'v4.0.1', versionCount: 7 },
        ],
      },
    ],
  },
  {
    id: 'service-products',
    label: '服务类产品',
    icon: 'service',
    totalCount: 12,
    groups: [
      {
        id: 'device-services',
        label: '设备服务',
        totalCount: 6,
        items: [
          { id: 'service-device-manager', label: '设备管家', slot: 'controller', vendor: '设备服务', packageName: 'Device Manager Service', version: 'v2.6.0', versionCount: 4 },
          { id: 'service-health', label: '健康监测', slot: 'perception', vendor: '设备服务', packageName: 'Robot Health Monitor', version: 'v1.9.0', versionCount: 3 },
        ],
      },
      {
        id: 'ops-services',
        label: '运维服务',
        totalCount: 6,
        items: [
          { id: 'service-log', label: '日志采集', slot: 'controller', vendor: '运维服务', packageName: 'Runtime Log Collector', version: 'v1.4.2', versionCount: 3 },
          { id: 'service-ota', label: 'OTA 升级', slot: 'controller', vendor: '运维服务', packageName: 'OTA Update Agent', version: 'v2.1.0', versionCount: 4 },
        ],
      },
    ],
  },
  {
    id: 'other-products',
    label: '其他类产品',
    icon: 'controller',
    totalCount: 15,
    groups: [
      {
        id: 'runtime-tools',
        label: '运行工具',
        totalCount: 8,
        items: [
          { id: 'tool-calibration', label: '标定工具', slot: 'perception', vendor: '运行工具', packageName: 'Calibration Toolchain', version: 'v1.3.8', versionCount: 3 },
          { id: 'tool-simulator', label: '仿真工具', slot: 'controller', vendor: '运行工具', packageName: 'Robot Simulation Bridge', version: 'v2.0.5', versionCount: 4 },
        ],
      },
      {
        id: 'debug-tools',
        label: '调试工具',
        totalCount: 7,
        items: [
          { id: 'tool-debug-panel', label: '调试面板', slot: 'controller', vendor: '调试工具', packageName: 'Debug Console Panel', version: 'v1.6.1', versionCount: 3 },
          { id: 'tool-telemetry', label: '遥测工具', slot: 'perception', vendor: '调试工具', packageName: 'Telemetry Inspector', version: 'v1.2.9', versionCount: 3 },
        ],
      },
    ],
  },
  {
    id: 'algorithm-products',
    label: '算法类产品',
    icon: 'controller',
    totalCount: 1,
    groups: [
      {
        id: 'navigation',
        label: '导航算法',
        totalCount: 1,
        items: [
          { id: 'algo-navigation', label: '导航算法包', slot: 'controller', vendor: '算法产品', packageName: 'Navigation Algorithm Pack', version: 'v4.5.0', versionCount: 6 },
        ],
      },
    ],
  },
];

function slotForProductGroup(groupId: string): SoftwarePackageSlot {
  if (groupId === 'arms') return 'armDriver';
  if (groupId === 'grippers') return 'endEffector';
  if (groupId === 'sensors') return 'perception';
  return 'controller';
}

function buildSoftwareVersionCatalog(): SoftwareVersionCategory[] {
  return buildProductVersionData().map(category => ({
    id: category.id,
    label: category.name,
    icon: category.icon,
    totalCount: category.subcategories.reduce((total, group) => total + group.brands.length, 0),
    groups: category.subcategories.map(group => ({
      id: group.id,
      label: group.name,
      totalCount: group.brands.length,
      items: group.brands.map(brand => {
        const latestVersion = brand.versions[0];
        const latestPackage = latestVersion?.packages[0];
        return {
          id: brand.id,
          label: brand.name,
          slot: slotForProductGroup(group.id),
          vendor: brand.name,
          packageName: latestPackage?.name ?? brand.name,
          version: latestVersion?.version ?? '-',
          versionCount: brand.versions.length,
        };
      }),
    })),
  }));
}

function mcrTopology(): TopologyNode[] {
  return [
    {
      id: 'base_link',
      label: 'base_link',
      kind: 'link',
      origin: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
      children: [
        {
          id: 'base_body_mesh',
          label: 'base_body_mesh',
          kind: 'mesh',
          meshRole: 'visual',
          origin: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
          mesh: {
            filename: 'package://mcr_description/meshes/base_link.stl',
            scale: { x: 1, y: 1, z: 1 },
            origin: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
          },
        },
        {
          id: 'base_cover_mesh',
          label: 'base_cover_mesh',
          kind: 'mesh',
          meshRole: 'visual',
          origin: { x: 0, y: 0, z: 0.08, rx: 0, ry: 0, rz: 0 },
          mesh: {
            filename: 'package://mcr_description/meshes/base_link_cover.stl',
            scale: { x: 1, y: 1, z: 1 },
            origin: { x: 0, y: 0, z: 0.08, rx: 0, ry: 0, rz: 0 },
          },
        },
        {
          id: 'base_collision_mesh',
          label: 'base_collision_mesh',
          kind: 'mesh',
          meshRole: 'collision',
          origin: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
          mesh: {
            filename: 'package://mcr_description/meshes/base_link_collision.stl',
            scale: { x: 1, y: 1, z: 1 },
            origin: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
          },
        },
        {
          id: 'chassis_joint',
          label: 'chassis_joint',
          kind: 'joint',
          jointType: 'fixed',
          origin: { x: 0, y: 0, z: 0.18, rx: 0, ry: 0, rz: 0 },
          axis: { x: 0, y: 0, z: 1 },
          limit: { lower: 0, upper: 0, effort: 0, velocity: 0 },
          children: [
            {
              id: 'chassis_link',
              label: 'chassis_link',
              kind: 'link',
              origin: { x: 0, y: 0, z: 0.18, rx: 0, ry: 0, rz: 0 },
              children: [
                {
                  id: 'shoulder_joint',
                  label: 'shoulder_joint',
                  kind: 'joint',
                  jointType: 'revolute',
                  origin: { x: 0.12, y: 0, z: 0.72, rx: 0, ry: 0, rz: 0 },
                  axis: { x: 0, y: 1, z: 0 },
                  limit: { lower: -135, upper: 135, effort: 120, velocity: 1.6 },
                  children: [
                    {
                      id: 'upper_arm_link',
                      label: 'upper_arm_link',
                      kind: 'link',
                      origin: { x: 0.12, y: 0, z: 0.72, rx: 0, ry: 0, rz: 0 },
                      children: [
                        {
                          id: 'wrist_joint',
                          label: 'wrist_joint',
                          kind: 'joint',
                          jointType: 'revolute',
                          origin: { x: 0.38, y: 0, z: 1.1, rx: 0, ry: 0, rz: 0 },
                          axis: { x: 1, y: 0, z: 0 },
                          limit: { lower: -180, upper: 180, effort: 60, velocity: 2.1 },
                          children: [{ id: 'end_effector_link', label: 'end_effector_link', kind: 'link', origin: { x: 0.48, y: 0, z: 1.12, rx: 0, ry: 0, rz: 0 } }],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'camera_mount_joint',
                  label: 'camera_mount_joint',
                  kind: 'joint',
                  jointType: 'fixed',
                  origin: { x: 0.2, y: 0.08, z: 0.62, rx: 0, ry: 0, rz: 12 },
                  axis: { x: 0, y: 0, z: 1 },
                  limit: { lower: 0, upper: 0, effort: 0, velocity: 0 },
                  children: [{ id: 'camera_mount_link', label: 'camera_mount_link', kind: 'link', origin: { x: 0.2, y: 0.08, z: 0.62, rx: 0, ry: 0, rz: 12 } }],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

function humanoidTopology(): TopologyNode[] {
  return [
    {
      id: 'base_link',
      label: 'base_link',
      kind: 'link',
      origin: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
      children: [
        {
          id: 'pelvis_joint',
          label: 'pelvis_joint',
          kind: 'joint',
          jointType: 'fixed',
          origin: { x: 0, y: 0, z: 0.86, rx: 0, ry: 0, rz: 0 },
          axis: { x: 0, y: 0, z: 1 },
          limit: { lower: 0, upper: 0, effort: 0, velocity: 0 },
          children: [
            {
              id: 'pelvis_link',
              label: 'pelvis_link',
              kind: 'link',
              origin: { x: 0, y: 0, z: 0.86, rx: 0, ry: 0, rz: 0 },
              children: [
                { id: 'left_hip_joint', label: 'left_hip_joint', kind: 'joint', jointType: 'revolute', origin: { x: -0.12, y: 0, z: 0.78, rx: 0, ry: 0, rz: 0 }, axis: { x: 0, y: 1, z: 0 }, limit: { lower: -90, upper: 70, effort: 90, velocity: 1.4 }, children: [{ id: 'left_leg_link', label: 'left_leg_link', kind: 'link', origin: { x: -0.12, y: 0, z: 0.42, rx: 0, ry: 0, rz: 0 } }] },
                { id: 'right_hip_joint', label: 'right_hip_joint', kind: 'joint', jointType: 'revolute', origin: { x: 0.12, y: 0, z: 0.78, rx: 0, ry: 0, rz: 0 }, axis: { x: 0, y: 1, z: 0 }, limit: { lower: -90, upper: 70, effort: 90, velocity: 1.4 }, children: [{ id: 'right_leg_link', label: 'right_leg_link', kind: 'link', origin: { x: 0.12, y: 0, z: 0.42, rx: 0, ry: 0, rz: 0 } }] },
                { id: 'torso_joint', label: 'torso_joint', kind: 'joint', jointType: 'revolute', origin: { x: 0, y: 0, z: 1.12, rx: 0, ry: 0, rz: 0 }, axis: { x: 0, y: 0, z: 1 }, limit: { lower: -45, upper: 45, effort: 60, velocity: 1 }, children: [{ id: 'torso_link', label: 'torso_link', kind: 'link', origin: { x: 0, y: 0, z: 1.24, rx: 0, ry: 0, rz: 0 } }] },
              ],
            },
          ],
        },
      ],
    },
  ];
}

function defaultTopology(type: string): TopologyNode[] {
  return type.includes('人形') ? humanoidTopology() : mcrTopology();
}

function defaultDeviceStructure(): DeviceStructureNode[] {
  return [
    {
      id: 'mcr-platform', label: 'MCR复合机器人', kind: 'base', origin: { ...DEFAULT_ORIGIN }, children: [
        { id: 'xiangong-chassis', label: '仙工底盘', kind: 'chassis', origin: { ...DEFAULT_ORIGIN }, children: [
          { id: 'mobile-base', label: '移动底座', kind: 'base', origin: { x: 0, y: 0, z: 0.18, rx: 0, ry: 0, rz: 0 } },
        ] },
        { id: 'jaka-arm', label: '节卡机械臂', kind: 'arm', origin: { x: 0, y: 0, z: 0.86, rx: 0, ry: 0, rz: 0 }, children: [
          { id: 'electric-gripper', label: '电动夹爪', kind: 'tool', origin: { x: 0, y: 0.32, z: 1.42, rx: 0, ry: 0, rz: 0 } },
        ] },
      ],
    },
  ];
}

function findDeviceStructureNode(nodes: DeviceStructureNode[], id: string): DeviceStructureNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findDeviceStructureNode(node.children ?? [], id);
    if (found) return found;
  }
  return null;
}

function updateDeviceStructureNode(nodes: DeviceStructureNode[], id: string, patch: Partial<DeviceStructureNode>): DeviceStructureNode[] {
  return nodes.map(node => node.id === id
    ? { ...node, ...patch }
    : { ...node, children: node.children ? updateDeviceStructureNode(node.children, id, patch) : undefined });
}

function packageConfig(slot: SoftwarePackageSlot, optionIndex = 0, versionIndex = 0): SoftwarePackageConfig {
  const option = SOFTWARE_PACKAGE_META[slot].options[optionIndex] ?? SOFTWARE_PACKAGE_META[slot].options[0];
  return {
    slot,
    vendor: option.vendor,
    packageName: option.packageName,
    version: option.versions[versionIndex] ?? option.versions[0],
  };
}

function defaultSoftwarePackages(type: string): Record<SoftwarePackageSlot, SoftwarePackageConfig> {
  return {
    controller: packageConfig('controller', 0),
    armDriver: packageConfig('armDriver', type.includes('人形') ? 1 : 0),
    endEffector: packageConfig('endEffector', type.includes('人形') ? 2 : 0),
    powerDriver: packageConfig('powerDriver', type.includes('AGV') ? 1 : 0),
    perception: packageConfig('perception', 0),
  };
}

function softwareCatalogItems(catalog: SoftwareVersionCategory[]) {
  return catalog.flatMap(category => category.groups.flatMap(group => group.items));
}

function selectedSoftwareCatalogItems(ids: string[], catalog: SoftwareVersionCategory[]) {
  const selected = new Set(ids);
  return softwareCatalogItems(catalog).filter(item => selected.has(item.id));
}

function defaultSoftwareSelectionIds() {
  return ['moying', 'src', 'jaka'];
}

function packageFromSoftwareItem(item: SoftwareVersionItem): SoftwarePackageConfig {
  return {
    slot: item.slot,
    vendor: item.vendor,
    packageName: item.packageName,
    version: item.version,
  };
}

function packagesFromSoftwareSelections(
  ids: string[],
  fallback: Record<SoftwarePackageSlot, SoftwarePackageConfig>,
  catalog: SoftwareVersionCategory[],
) {
  return selectedSoftwareCatalogItems(ids, catalog).reduce<Record<SoftwarePackageSlot, SoftwarePackageConfig>>((next, item) => ({
    ...next,
    [item.slot]: packageFromSoftwareItem(item),
  }), { ...fallback });
}

const INITIAL_ROBOT_MODELS: RobotModel[] = [
  {
    id: 'robot-mcr',
    name: 'MCR复合机器人',
    type: '复合机器人',
    description: '模块化复合协作机器人平台，集成移动底盘与多关节机械臂，适用于柔性制造、仓储分拣及实验室自动化场景。',
    ownerAccount: 'robot-admin',
    status: 'published',
    version: 'R1.4',
    updatedAt: '2026-07-01 14:32',
    componentCount: 18,
    peripherals: ['视觉相机', '激光雷达', 'I/O模块', '夹爪'],
    pose: { rotation: 28, height: 64, reach: 72 },
    topology: mcrTopology(),
    softwareSelectionIds: defaultSoftwareSelectionIds(),
    softwarePackages: {
      ...defaultSoftwarePackages('复合机器人'),
      controller: packageConfig('controller', 0, 0),
      armDriver: packageConfig('armDriver', 0, 0),
      endEffector: packageConfig('endEffector', 0, 0),
      powerDriver: packageConfig('powerDriver', 0, 0),
      perception: packageConfig('perception', 2, 0),
    },
    homepageSchemeId: 's1',
  },
  {
    id: 'robot-humanoid',
    name: '人形双足机器人',
    type: '人形双足机器人',
    description: '双足人形机器人原型机，具备全身运动控制与多模态感知能力，面向科研与服务场景。',
    ownerAccount: 'biped-lab',
    status: 'draft',
    version: 'R0.9',
    updatedAt: '2026-06-29 10:18',
    componentCount: 26,
    peripherals: ['IMU', '深度相机', '足底力传感器'],
    pose: { rotation: -12, height: 78, reach: 55 },
    topology: humanoidTopology(),
    softwareSelectionIds: defaultSoftwareSelectionIds(),
    softwarePackages: {
      ...defaultSoftwarePackages('人形双足机器人'),
      armDriver: packageConfig('armDriver', 1, 0),
      endEffector: packageConfig('endEffector', 2, 0),
      powerDriver: packageConfig('powerDriver', 2, 0),
    },
  },
  {
    id: 'robot-agv',
    name: 'AGV搬运机器人',
    type: 'AGV搬运机器人',
    description: '自主导航搬运平台，支持激光 SLAM 定位与多机调度，适用于工厂物流与仓储搬运。',
    ownerAccount: 'factory-ops',
    status: 'published',
    version: 'R2.1',
    updatedAt: '2026-06-26 16:04',
    componentCount: 12,
    peripherals: ['激光雷达', '电池模组', '导航控制器'],
    pose: { rotation: 18, height: 42, reach: 46 },
    topology: mcrTopology(),
    softwareSelectionIds: defaultSoftwareSelectionIds(),
    softwarePackages: {
      ...defaultSoftwarePackages('AGV搬运机器人'),
      controller: packageConfig('controller', 0, 1),
      armDriver: packageConfig('armDriver', 3, 1),
      powerDriver: packageConfig('powerDriver', 1, 0),
      perception: packageConfig('perception', 0, 0),
    },
    homepageSchemeId: 's2',
  },
];

function nowLabel() {
  return '刚刚';
}

function splitPeripherals(value: string) {
  return value
    .split(/[，,\n]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function safeFileName(value: string) {
  return value
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'robot-model';
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function flattenTopology(nodes: TopologyNode[], parent?: string): Array<TopologyNode & { parent?: string }> {
  return nodes.flatMap(node => [
    { ...node, parent },
    ...flattenTopology(node.children ?? [], node.label),
  ]);
}

function findTopologyNode(nodes: TopologyNode[], id: string): TopologyNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = findTopologyNode(node.children ?? [], id);
    if (child) return child;
  }
  return null;
}

function updateTopologyNode(nodes: TopologyNode[], id: string, patch: Partial<TopologyNode>): TopologyNode[] {
  return nodes.map(node => {
    if (node.id === id) return { ...node, ...patch };
    if (!node.children) return node;
    return { ...node, children: updateTopologyNode(node.children, id, patch) };
  });
}

function originOf(node: TopologyNode): OriginPose {
  return { ...DEFAULT_ORIGIN, ...(node.kind === 'mesh' ? node.mesh?.origin : node.origin) };
}

function axisOf(node: TopologyNode): Vector3 {
  return { ...DEFAULT_AXIS, ...(node.axis ?? {}) };
}

function limitOf(node: TopologyNode): JointLimit {
  return { ...DEFAULT_LIMIT, ...(node.limit ?? {}) };
}

function topologyMeshOf(node: TopologyNode): LinkMesh {
  return {
    filename: node.mesh?.filename ?? '',
    scale: { ...DEFAULT_MESH_SCALE, ...(node.mesh?.scale ?? {}) },
    origin: { ...DEFAULT_ORIGIN, ...(node.mesh?.origin ?? node.origin ?? {}) },
  };
}

function topologyKindMeta(kind: TopologyKind) {
  if (kind === 'link') {
    return { label: '连杆', code: 'Link', color: 'var(--robot-accent)', background: 'var(--robot-accent-soft)', text: 'var(--robot-accent-text)' };
  }
  if (kind === 'joint') {
    return { label: '关节', code: 'Joint', color: 'var(--robot-success)', background: 'var(--robot-success-soft)', text: 'var(--robot-success)' };
  }
  return { label: 'Mesh', code: 'Mesh', color: 'var(--robot-warning)', background: 'var(--robot-warning-soft)', text: 'var(--robot-warning)' };
}

function canAddTopologyChildKind(parentKind: TopologyKind, childKind: TopologyKind) {
  if (parentKind === 'link') return childKind === 'joint' || childKind === 'mesh';
  if (parentKind === 'joint') return childKind === 'link';
  return false;
}

function buildLinkMeshXml(slot: 'visual' | 'collision', mesh?: LinkMesh): string {
  if (!mesh?.filename.trim()) return '';
  const origin = { ...DEFAULT_ORIGIN, ...mesh.origin };
  const scale = { ...DEFAULT_MESH_SCALE, ...mesh.scale };
  return [
    `    <${slot}>`,
    `      <origin xyz="${origin.x} ${origin.y} ${origin.z}" rpy="${origin.rx} ${origin.ry} ${origin.rz}" />`,
    `      <geometry>`,
    `        <mesh filename="${escapeXml(mesh.filename.trim())}" scale="${scale.x} ${scale.y} ${scale.z}" />`,
    `      </geometry>`,
    `    </${slot}>`,
  ].join('\n');
}

function buildUrdf(model: RobotModel) {
  const flat = flattenTopology(model.topology);
  const links = flat.filter(node => node.kind === 'link');
  const joints = flat.filter(node => node.kind === 'joint');
  const linkXml = links.map(link => {
    const origin = originOf(link);
    const meshNodes = (link.children ?? []).filter(child => child.kind === 'mesh');
    const geometryXml = meshNodes.length > 0
      ? meshNodes
        .map(meshNode => buildLinkMeshXml(meshNode.meshRole ?? 'visual', topologyMeshOf(meshNode)))
        .filter(Boolean)
      : [
        buildLinkMeshXml('visual', link.visualMesh),
        buildLinkMeshXml('collision', link.collisionMesh),
      ].filter(Boolean);
    return [
      `  <!-- link_origin name="${escapeXml(link.label)}" xyz="${origin.x} ${origin.y} ${origin.z}" rpy="${origin.rx} ${origin.ry} ${origin.rz}" -->`,
      geometryXml.length === 0
        ? `  <link name="${escapeXml(link.label)}" />`
        : [`  <link name="${escapeXml(link.label)}">`, ...geometryXml, '  </link>'].join('\n'),
    ].join('\n');
  }).join('\n');
  const packageXml = SOFTWARE_PACKAGE_SLOTS.map(slot => {
    const pkg = model.softwarePackages[slot];
    const meta = SOFTWARE_PACKAGE_META[slot];
    return `  <!-- software_package slot="${escapeXml(meta.label)}" vendor="${escapeXml(pkg.vendor)}" package="${escapeXml(pkg.packageName)}" version="${escapeXml(pkg.version)}" -->`;
  }).join('\n');
  const jointXml = joints.map((joint, index) => {
    const child = joint.children?.find(node => node.kind === 'link')?.label ?? `generated_link_${index + 1}`;
    const origin = originOf(joint);
    const axis = axisOf(joint);
    const limit = limitOf(joint);
    const jointType = joint.jointType ?? 'revolute';
    return [
      `  <joint name="${escapeXml(joint.label)}" type="${jointType}">`,
      `    <parent link="${escapeXml(joint.parent ?? 'base_link')}" />`,
      `    <child link="${escapeXml(child)}" />`,
      `    <origin xyz="${origin.x} ${origin.y} ${origin.z}" rpy="${origin.rx} ${origin.ry} ${origin.rz}" />`,
      `    <axis xyz="${axis.x} ${axis.y} ${axis.z}" />`,
      jointType === 'fixed' ? '' : `    <limit lower="${limit.lower}" upper="${limit.upper}" effort="${limit.effort}" velocity="${limit.velocity}" />`,
      '  </joint>',
    ].filter(Boolean).join('\n');
  }).join('\n');

  return [
    `<?xml version="1.0"?>`,
    `<robot name="${escapeXml(model.name)}">`,
    `  <!-- type: ${escapeXml(model.type)} | version: ${escapeXml(model.version)} -->`,
    packageXml,
    linkXml,
    jointXml,
    `</robot>`,
  ].join('\n');
}

function downloadText(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// ── URDF Import ────────────────────────────────────────────

interface ParsedUrdfJoint {
  name: string;
  type: JointType;
  parent: string;
  child: string;
  origin: OriginPose;
  axis: Vector3;
  limit: JointLimit;
}

interface ParsedUrdfLink {
  name: string;
  origin: OriginPose;
  meshes: Array<{
    name: string;
    role: MeshRole;
    data: LinkMesh;
  }>;
}

function parseMeshElements(linkEl: Element, role: MeshRole, linkName: string): ParsedUrdfLink['meshes'] {
  const containers = Array.from(linkEl.querySelectorAll(`:scope > ${role}`));
  return containers.flatMap((container, index) => {
    const meshEl = container.querySelector(':scope > geometry > mesh');
    const filename = meshEl?.getAttribute('filename')?.trim();
    if (!meshEl || !filename) return [];
    const scaleValues = (meshEl.getAttribute('scale') ?? '1 1 1').trim().split(/\s+/).map(Number);
    return [{
      name: container.getAttribute('name')?.trim() || `${linkName}_${role}_${index + 1}_mesh`,
      role,
      data: {
        filename,
        scale: {
          x: Number.isFinite(scaleValues[0]) ? scaleValues[0] : 1,
          y: Number.isFinite(scaleValues[1]) ? scaleValues[1] : 1,
          z: Number.isFinite(scaleValues[2]) ? scaleValues[2] : 1,
        },
        origin: parseOrigin(container.querySelector(':scope > origin')),
      },
    }];
  });
}

function meshNodesFromParsedLink(link: ParsedUrdfLink): TopologyNode[] {
  return link.meshes.map((entry, index) => ({
    id: `mesh-${link.name}-${entry.role}-${index}-${Date.now()}`,
    label: entry.name,
    kind: 'mesh',
    meshRole: entry.role,
    mesh: entry.data,
    origin: entry.data.origin,
    children: [],
  }));
}

function parseUrdf(xmlText: string): { links: ParsedUrdfLink[]; joints: ParsedUrdfJoint[] } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) throw new Error('URDF 解析失败：XML 格式错误');

  const robot = doc.querySelector('robot');
  if (!robot) throw new Error('URDF 解析失败：缺少 <robot> 根元素');

  const links: ParsedUrdfLink[] = [];
  robot.querySelectorAll(':scope > link').forEach(linkEl => {
    const name = linkEl.getAttribute('name') ?? 'unnamed_link';
    const originEl = linkEl.querySelector(':scope > origin');
    const origin = parseOrigin(originEl);
    links.push({
      name,
      origin,
      meshes: [
        ...parseMeshElements(linkEl, 'visual', name),
        ...parseMeshElements(linkEl, 'collision', name),
      ],
    });
  });

  const joints: ParsedUrdfJoint[] = [];
  robot.querySelectorAll(':scope > joint').forEach(jointEl => {
    const name = jointEl.getAttribute('name') ?? 'unnamed_joint';
    const type = (jointEl.getAttribute('type') ?? 'fixed') as JointType;
    const parent = jointEl.querySelector(':scope > parent')?.getAttribute('link') ?? 'base_link';
    const child = jointEl.querySelector(':scope > child')?.getAttribute('link') ?? 'unnamed_child';
    const originEl = jointEl.querySelector(':scope > origin');
    const origin = parseOrigin(originEl);
    const axisEl = jointEl.querySelector(':scope > axis');
    const axis = parseVector3(axisEl, { x: 0, y: 0, z: 1 });
    const limitEl = jointEl.querySelector(':scope > limit');
    const limit = parseLimit(limitEl);
    joints.push({ name, type, parent, child, origin, axis, limit });
  });

  return { links, joints };
}

function parseOrigin(el: Element | null): OriginPose {
  if (!el) return { ...DEFAULT_ORIGIN };
  const xyz = (el.getAttribute('xyz') ?? '0 0 0').split(/\s+/).map(Number);
  const rpy = (el.getAttribute('rpy') ?? '0 0 0').split(/\s+/).map(Number);
  return {
    x: xyz[0] ?? 0, y: xyz[1] ?? 0, z: xyz[2] ?? 0,
    rx: rpy[0] ?? 0, ry: rpy[1] ?? 0, rz: rpy[2] ?? 0,
  };
}

function parseVector3(el: Element | null, fallback: Vector3): Vector3 {
  if (!el) return fallback;
  const xyz = (el.getAttribute('xyz') ?? '0 0 1').split(/\s+/).map(Number);
  return { x: xyz[0] ?? fallback.x, y: xyz[1] ?? fallback.y, z: xyz[2] ?? fallback.z };
}

function parseLimit(el: Element | null): JointLimit {
  if (!el) return { ...DEFAULT_LIMIT };
  return {
    lower: Number(el.getAttribute('lower') ?? -180),
    upper: Number(el.getAttribute('upper') ?? 180),
    effort: Number(el.getAttribute('effort') ?? 80),
    velocity: Number(el.getAttribute('velocity') ?? 1.2),
  };
}

function urdfToTopology(links: ParsedUrdfLink[], joints: ParsedUrdfJoint[]): TopologyNode[] {
  const linkMap = new Map<string, TopologyNode>();
  links.forEach(link => {
    linkMap.set(link.name, {
      id: `link-${link.name}-${Date.now()}`,
      label: link.name,
      kind: 'link',
      origin: link.origin,
      children: meshNodesFromParsedLink(link),
    });
  });

  // Ensure every joint.child link exists
  joints.forEach(joint => {
    if (!linkMap.has(joint.child)) {
      linkMap.set(joint.child, {
        id: `link-${joint.child}-${Date.now()}`,
        label: joint.child,
        kind: 'link',
        origin: { ...DEFAULT_ORIGIN },
        children: [],
      });
    }
  });

  const childToParents = new Map<string, string[]>();
  joints.forEach(joint => {
    const parents = childToParents.get(joint.child) ?? [];
    parents.push(joint.parent);
    childToParents.set(joint.child, parents);
  });

  // Build tree: start from links that are NOT a child of any joint
  const childLinks = new Set(joints.map(j => j.child));
  const rootLinks = links.filter(l => !childLinks.has(l.name)).map(l => l.name);

  // If no obvious root, use the first joint's parent
  const roots = rootLinks.length > 0 ? rootLinks : (joints.length > 0 ? [joints[0].parent] : links.map(l => l.name));

  function buildChildren(parentName: string): TopologyNode[] {
    const children: TopologyNode[] = [];
    joints
      .filter(j => j.parent === parentName)
      .forEach(joint => {
        const jointNode: TopologyNode = {
          id: `joint-${joint.name}-${Date.now()}`,
          label: joint.name,
          kind: 'joint',
          jointType: joint.type,
          origin: joint.origin,
          axis: joint.axis,
          limit: joint.limit,
          children: [],
        };
        const childLink = linkMap.get(joint.child);
        if (childLink) {
          childLink.children = [
            ...(childLink.children ?? []).filter(child => child.kind === 'mesh'),
            ...buildChildren(joint.child),
          ];
          jointNode.children!.push(childLink);
        }
        children.push(jointNode);
      });
    return children;
  }

  const rootNodes: TopologyNode[] = [];
  const visited = new Set<string>();

  roots.forEach(rootName => {
    if (visited.has(rootName)) return;
    visited.add(rootName);
    const rootLink = linkMap.get(rootName);
    if (rootLink) {
      rootLink.children = [
        ...(rootLink.children ?? []).filter(child => child.kind === 'mesh'),
        ...buildChildren(rootName),
      ];
      rootNodes.push(rootLink);
    }
  });

  return rootNodes.length > 0 ? rootNodes : [{ id: 'base_link', label: 'base_link', kind: 'link', origin: { ...DEFAULT_ORIGIN }, children: [] }];
}

// ── Topology CRUD helpers ────────────────────────────────────

let _topoIdCounter = Date.now();
function topoUid(): string {
  return `node-${++_topoIdCounter}`;
}

function addTopologyChild(nodes: TopologyNode[], parentId: string, child: TopologyNode): TopologyNode[] {
  return nodes.map(node => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children ?? []), child] };
    }
    if (!node.children) return node;
    return { ...node, children: addTopologyChild(node.children, parentId, child) };
  });
}

function removeTopologyNode(nodes: TopologyNode[], targetId: string): TopologyNode[] {
  return nodes
    .filter(node => node.id !== targetId)
    .map(node => {
      if (!node.children) return node;
      return { ...node, children: removeTopologyNode(node.children, targetId) };
    });
}

function renameTopologyNode(nodes: TopologyNode[], targetId: string, newLabel: string): TopologyNode[] {
  return nodes.map(node => {
    if (node.id === targetId) return { ...node, label: newLabel };
    if (!node.children) return node;
    return { ...node, children: renameTopologyNode(node.children, targetId, newLabel) };
  });
}

interface TopologyLocation {
  node: TopologyNode;
  parentId?: string;
  index: number;
}

function findTopologyLocation(nodes: TopologyNode[], targetId: string, parentId?: string): TopologyLocation | null {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.id === targetId) return { node, parentId, index };
    const child = findTopologyLocation(node.children ?? [], targetId, node.id);
    if (child) return child;
  }
  return null;
}

function topologyContains(node: TopologyNode, targetId: string): boolean {
  if (node.id === targetId) return true;
  return (node.children ?? []).some(child => topologyContains(child, targetId));
}

function canMoveTopologyNode(
  nodes: TopologyNode[],
  draggedId: string,
  targetId: string,
  _position: TopologyDropPosition,
): boolean {
  if (draggedId === targetId) return false;
  const dragged = findTopologyLocation(nodes, draggedId);
  const target = findTopologyLocation(nodes, targetId);
  if (!dragged || !target) return false;
  if (_position === 'inside') {
    if (target.node.kind === 'mesh') return false;
    if (dragged.node.kind === 'mesh') return target.node.kind === 'link';
    return true;
  }
  if (dragged.node.kind === 'mesh') {
    if (!target.parentId) return false;
    return findTopologyNode(nodes, target.parentId)?.kind === 'link';
  }
  return true;
}

function replaceTopologyNode(
  nodes: TopologyNode[],
  targetId: string,
  replacements: TopologyNode[],
): TopologyNode[] {
  const targetIndex = nodes.findIndex(node => node.id === targetId);
  if (targetIndex >= 0) {
    const nextNodes = [...nodes];
    nextNodes.splice(targetIndex, 1, ...replacements);
    return nextNodes;
  }

  return nodes.map(node => {
    if (!node.children?.length) return node;
    return { ...node, children: replaceTopologyNode(node.children, targetId, replacements) };
  });
}

function extractTopologyNode(nodes: TopologyNode[], targetId: string): { nodes: TopologyNode[]; extracted: TopologyNode | null } {
  let extracted: TopologyNode | null = null;
  const nextNodes: TopologyNode[] = [];

  for (const node of nodes) {
    if (node.id === targetId) {
      extracted = node;
      continue;
    }
    if (node.children?.length) {
      const childResult = extractTopologyNode(node.children, targetId);
      if (childResult.extracted) {
        extracted = childResult.extracted;
        nextNodes.push({ ...node, children: childResult.nodes });
        continue;
      }
    }
    nextNodes.push(node);
  }

  return { nodes: nextNodes, extracted };
}

function insertTopologyNode(
  nodes: TopologyNode[],
  targetId: string,
  position: TopologyDropPosition,
  nodeToInsert: TopologyNode,
): TopologyNode[] {
  if (position === 'inside') {
    return nodes.map(node => {
      if (node.id === targetId) return { ...node, children: [...(node.children ?? []), nodeToInsert] };
      if (!node.children?.length) return node;
      return { ...node, children: insertTopologyNode(node.children, targetId, position, nodeToInsert) };
    });
  }

  const targetIndex = nodes.findIndex(node => node.id === targetId);
  if (targetIndex >= 0) {
    const nextNodes = [...nodes];
    nextNodes.splice(position === 'before' ? targetIndex : targetIndex + 1, 0, nodeToInsert);
    return nextNodes;
  }

  return nodes.map(node => {
    if (!node.children?.length) return node;
    return { ...node, children: insertTopologyNode(node.children, targetId, position, nodeToInsert) };
  });
}

function moveTopologyNode(
  nodes: TopologyNode[],
  draggedId: string,
  targetId: string,
  position: TopologyDropPosition,
): TopologyNode[] {
  if (!canMoveTopologyNode(nodes, draggedId, targetId, position)) return nodes;
  const dragged = findTopologyLocation(nodes, draggedId);
  if (!dragged) return nodes;

  // Moving a parent onto one of its descendants needs a tree rotation. Detach
  // the target first, promote it to the parent's old slot, then place the
  // cleaned parent at the requested position. This keeps the tree acyclic and
  // lets users repair temporarily incorrect model hierarchies in one action.
  if (topologyContains(dragged.node, targetId)) {
    const { nodes: cleanedDraggedNodes, extracted: descendantTarget } = extractTopologyNode([dragged.node], targetId);
    const cleanedDragged = cleanedDraggedNodes[0];
    if (!descendantTarget || !cleanedDragged) return nodes;

    if (position === 'inside') {
      const promotedTarget = {
        ...descendantTarget,
        children: [...(descendantTarget.children ?? []), cleanedDragged],
      };
      return replaceTopologyNode(nodes, draggedId, [promotedTarget]);
    }

    return replaceTopologyNode(
      nodes,
      draggedId,
      position === 'before'
        ? [cleanedDragged, descendantTarget]
        : [descendantTarget, cleanedDragged],
    );
  }

  const { nodes: remainingNodes, extracted } = extractTopologyNode(nodes, draggedId);
  if (!extracted) return nodes;
  return insertTopologyNode(remainingNodes, targetId, position, extracted);
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    height: 32,
    borderRadius: 8,
    border: '1px solid var(--robot-border-strong)',
    background: 'var(--robot-surface)',
    color: 'var(--robot-heading)',
    fontSize: 14,
    padding: '0 12px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  };
}

function RobotCardPreview({ model }: { model: RobotModel }) {
  const isHumanoid = model.type.includes('人形');
  const safeId = model.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const gradientId = `model-card-gradient-${safeId}`;
  const glowId = `model-card-glow-${safeId}`;
  const reach = model.pose.reach;
  const baseY = 132 - model.pose.height * 0.14;

  return (
    <div className="model-card-preview" aria-hidden="true">
      <svg viewBox="0 0 420 230" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--robot-scene-top)" />
            <stop offset="100%" stopColor="var(--robot-scene-bottom)" />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="2.4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="420" height="230" fill={`url(#${gradientId})`} />
        {Array.from({ length: 8 }).map((_, index) => {
          const y = 104 + index * 16;
          const spread = index * 19;
          return <line key={`card-h-${index}`} x1={104 - spread} y1={y} x2={316 + spread} y2={y} stroke="var(--robot-scene-muted)" strokeWidth="1" />;
        })}
        {Array.from({ length: 9 }).map((_, index) => {
          const x = 50 + index * 40;
          return <line key={`card-v-${index}`} x1="210" y1="94" x2={x} y2="230" stroke="var(--robot-scene-muted)" strokeWidth="1" />;
        })}

        <g transform={`translate(210 ${baseY}) scale(0.62) rotate(${model.pose.rotation})`} filter={`url(#${glowId})`}>
          <ellipse cx="0" cy="116" rx="92" ry="18" fill="var(--robot-accent)" fillOpacity="0.13" stroke="var(--robot-accent)" opacity="0.7" />
          {isHumanoid ? (
            <>
              <rect x="-26" y="-18" width="52" height="92" rx="18" fill="var(--robot-accent)" stroke="var(--robot-accent-border)" strokeWidth="2" />
              <circle cx="0" cy="-42" r="24" fill="var(--robot-accent)" stroke="var(--robot-accent-soft)" strokeWidth="4" />
              <line x1="-22" y1="74" x2="-50" y2="132" stroke="var(--robot-accent)" strokeWidth="18" strokeLinecap="round" />
              <line x1="22" y1="74" x2="50" y2="132" stroke="var(--robot-accent)" strokeWidth="18" strokeLinecap="round" />
              <line x1="-28" y1="8" x2={-42 - reach * 0.28} y2="54" stroke="var(--robot-accent-text)" strokeWidth="14" strokeLinecap="round" />
              <line x1="28" y1="8" x2={42 + reach * 0.28} y2="54" stroke="var(--robot-accent-text)" strokeWidth="14" strokeLinecap="round" />
            </>
          ) : (
            <>
              <rect x="-58" y="52" width="116" height="58" rx="14" fill="var(--robot-soft)" stroke="var(--robot-accent-border)" strokeWidth="3" />
              <rect x="-16" y="-4" width="32" height="76" rx="10" fill="var(--robot-accent)" stroke="var(--robot-accent-border)" strokeWidth="2" />
              <line x1="0" y1="0" x2={reach * 0.45} y2="-70" stroke="var(--robot-accent)" strokeWidth="18" strokeLinecap="round" />
              <line x1={reach * 0.45} y1="-70" x2={reach * 0.72} y2="-122" stroke="var(--robot-accent-text)" strokeWidth="16" strokeLinecap="round" />
              <circle cx={reach * 0.72} cy="-122" r="15" fill="var(--robot-accent-border)" stroke="var(--robot-accent-soft)" strokeWidth="4" />
            </>
          )}
        </g>
      </svg>
      <span className="model-card-preview-label">3D 预览</span>
    </div>
  );
}

function RobotScene({
  model,
  editing,
  readOnly,
  onToggleEditing,
  onPoseChange,
  onExport,
  onReadOnlyAttempt,
}: {
  model: RobotModel;
  editing: boolean;
  readOnly: boolean;
  onToggleEditing: () => void;
  onPoseChange: (pose: RobotPose) => void;
  onExport: () => void;
  onReadOnlyAttempt: () => void;
}) {
  const isHumanoid = model.type.includes('人形');
  const baseY = 282 - model.pose.height * 0.35;
  const reach = model.pose.reach;

  return (
    <section className="hero-detail-card hero-scene-card">
      <div className="hero-scene-content" style={{ background: 'var(--robot-scene-bg)' }}>
        <svg viewBox="0 0 720 430" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs>
            <linearGradient id="robot-space-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--robot-scene-top)" />
              <stop offset="100%" stopColor="var(--robot-scene-bottom)" />
            </linearGradient>
            <filter id="robot-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="720" height="430" fill="url(#robot-space-bg)" />
          {Array.from({ length: 14 }).map((_, i) => {
            const y = 190 + i * 16;
            const spread = i * 18;
            return (
              <line
                key={`grid-h-${i}`}
                x1={180 - spread}
                y1={y}
                x2={540 + spread}
                y2={y}
                stroke="var(--robot-scene-muted)"
                strokeWidth="1"
              />
            );
          })}
          {Array.from({ length: 13 }).map((_, i) => {
            const x = 120 + i * 40;
            return (
              <line
                key={`grid-v-${i}`}
                x1={360}
                y1={178}
                x2={x}
                y2={408}
                stroke="var(--robot-scene-muted)"
                strokeWidth="1"
              />
            );
          })}

          <g transform="translate(640 382)">
            <line x1="0" y1="0" x2="70" y2="0" stroke="var(--robot-axis-x)" strokeWidth="3" />
            <line x1="0" y1="0" x2="0" y2="-70" stroke="var(--robot-axis-y)" strokeWidth="3" />
            <line x1="0" y1="0" x2="-42" y2="-38" stroke="var(--robot-axis-z)" strokeWidth="3" />
            <text x="76" y="5" fill="var(--robot-axis-x)" fontSize="12" fontWeight="700">X</text>
            <text x="-9" y="-78" fill="var(--robot-axis-y)" fontSize="12" fontWeight="700">Y</text>
            <text x="-56" y="-42" fill="var(--robot-axis-z)" fontSize="12" fontWeight="700">Z</text>
          </g>

          <g transform={`translate(360 ${baseY}) rotate(${model.pose.rotation})`} filter="url(#robot-glow)">
            <ellipse cx="0" cy="116" rx="92" ry="18" fill="var(--robot-accent)" fillOpacity="0.13" stroke="var(--robot-accent)" opacity="0.7" />
            {isHumanoid ? (
              <>
                <rect x="-26" y="-18" width="52" height="92" rx="18" fill="var(--robot-accent)" stroke="var(--robot-accent-border)" strokeWidth="2" />
                <circle cx="0" cy="-42" r="24" fill="var(--robot-accent)" stroke="var(--robot-accent-soft)" strokeWidth="4" />
                <line x1="-22" y1="74" x2="-50" y2="132" stroke="var(--robot-accent)" strokeWidth="18" strokeLinecap="round" />
                <line x1="22" y1="74" x2="50" y2="132" stroke="var(--robot-accent)" strokeWidth="18" strokeLinecap="round" />
                <line x1="-28" y1="8" x2={-42 - reach * 0.28} y2="54" stroke="var(--robot-accent-text)" strokeWidth="14" strokeLinecap="round" />
                <line x1="28" y1="8" x2={42 + reach * 0.28} y2="54" stroke="var(--robot-accent-text)" strokeWidth="14" strokeLinecap="round" />
              </>
            ) : (
              <>
                <rect x="-58" y="52" width="116" height="58" rx="14" fill="var(--robot-soft)" stroke="var(--robot-accent-border)" strokeWidth="3" />
                <rect x="-16" y="-4" width="32" height="76" rx="10" fill="var(--robot-accent)" stroke="var(--robot-accent-border)" strokeWidth="2" />
                <line x1="0" y1="0" x2={reach * 0.45} y2="-70" stroke="var(--robot-accent)" strokeWidth="18" strokeLinecap="round" />
                <line x1={reach * 0.45} y1="-70" x2={reach * 0.72} y2="-122" stroke="var(--robot-accent-text)" strokeWidth="16" strokeLinecap="round" />
                <circle cx={reach * 0.72} cy="-122" r="15" fill="var(--robot-accent-border)" stroke="var(--robot-accent-soft)" strokeWidth="4" />
              </>
            )}
          </g>
        </svg>

        <div className="hero-scene-status">
          3D预览 <span /> {model.id.replace('robot-', '').toUpperCase()}
        </div>

        <div className="hero-scene-telemetry" aria-hidden="true">
          {['J1  -0.292748', 'J2  -0.292748', 'J3  -0.292748', 'J4  -0.292748', 'J5  -0.292748', 'J6  -0.292748', 'X / Y / Z', '-0.292748 / -0.292748 / -0.292748', 'RX / RY / RZ', '-0.292748 / -0.292748 / -0.292748'].map((line, index) => (
            <span key={`${index}-${line}`}>{line}</span>
          ))}
        </div>

        <button type="button" className="hero-scene-export" onClick={onExport}>
          <FileCode2 size={17} />
          <span>导出</span>
        </button>

        <div className="hero-scene-tool-dock" aria-label="3D 场景工具">
          <button type="button" data-active={editing ? 'true' : 'false'} onClick={readOnly ? onReadOnlyAttempt : onToggleEditing} aria-label={editing ? '结束编辑' : '开始编辑'} title={readOnly ? '取消发布后可编辑模型' : editing ? '结束编辑' : '开始编辑'}>
            <SlidersHorizontal size={17} />
          </button>
          <button type="button" aria-label="模型视图" title="模型视图"><Box size={17} /></button>
          <button type="button" aria-label="网格视图" title="网格视图"><LayoutGrid size={17} /></button>
        </div>

        {editing && (
          <div style={{
            position: 'absolute',
            right: 88,
            top: 24,
            width: 220,
            borderRadius: 16,
            background: 'var(--robot-hud-bg)',
            border: '1px solid var(--robot-hud-border)',
            padding: 16,
            color: 'var(--robot-hud-text)',
          }}>
            {[
              ['姿态旋转', 'rotation', -45, 45],
              ['模型高度', 'height', 30, 90],
              ['臂展/步幅', 'reach', 30, 90],
            ].map(([label, key, min, max]) => (
              <label key={String(key)} style={{ display: 'block', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--robot-muted)', fontSize: 12, fontWeight: 500, marginBottom: 7 }}>
                  <span>{label}</span>
                  <span>{model.pose[key as keyof RobotPose]}</span>
                </div>
                <input
                  type="range"
                  min={Number(min)}
                  max={Number(max)}
                  value={model.pose[key as keyof RobotPose]}
                  onChange={event => onPoseChange({ ...model.pose, [key]: Number(event.target.value) })}
                  style={{ width: '100%' }}
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TopologyTreeRow({
  node,
  depth,
  selected,
  isEditing,
  editValue,
  expanded,
  deleteDisabled,
  rootNodes,
  onSelect,
  onToggle,
  onStartEdit,
  onEditValueChange,
  onCommitEdit,
  onCancelEdit,
  onAddChild,
  onDelete,
  onMove,
  readOnly,
  onReadOnlyAttempt,
}: {
  node: TopologyNode;
  depth: number;
  selected: boolean;
  isEditing: boolean;
  editValue: string;
  expanded: boolean;
  deleteDisabled: boolean;
  rootNodes: TopologyNode[];
  onSelect: (id: string) => void;
  onToggle: () => void;
  onStartEdit: () => void;
  onEditValueChange: (value: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onAddChild?: (parentId: string, kind: TopologyKind) => void;
  onDelete?: (id: string) => void;
  onMove?: (draggedId: string, targetId: string, position: TopologyDropPosition) => void;
  readOnly: boolean;
  onReadOnlyAttempt: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [dropPreview, setDropPreview] = useState<{ position: TopologyDropPosition; valid: boolean } | null>(null);
  const dropPreviewRef = useRef<{ position: TopologyDropPosition; valid: boolean } | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const hasChildren = Boolean(node.children?.length);
  const kindMeta = topologyKindMeta(node.kind);
  const childActions: Array<{ kind: TopologyKind; label: string }> = node.kind === 'link'
    ? [{ kind: 'mesh', label: 'Mesh' }, { kind: 'joint', label: '关节' }]
    : node.kind === 'joint'
      ? [{ kind: 'link', label: '连杆' }]
      : [];

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TOPOLOGY_NODE',
    item: { type: 'TOPOLOGY_NODE', nodeId: node.id, kind: node.kind } satisfies TopologyDragItem,
    canDrag: !readOnly && !isEditing,
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  }), [node.id, node.kind, isEditing, readOnly]);

  const [{ isOver }, drop] = useDrop<TopologyDragItem, void, { isOver: boolean }>(() => ({
    accept: 'TOPOLOGY_NODE',
    hover: (item, monitor) => {
      const element = rowRef.current;
      const pointer = monitor.getClientOffset();
      if (!element || !pointer) return;
      const bounds = element.getBoundingClientRect();
      const ratio = (pointer.y - bounds.top) / Math.max(bounds.height, 1);
      const position: TopologyDropPosition = ratio < 0.28 ? 'before' : ratio > 0.72 ? 'after' : 'inside';
      const valid = canMoveTopologyNode(rootNodes, item.nodeId, node.id, position);
      dropPreviewRef.current = { position, valid };
      setDropPreview(current => current?.position === position && current.valid === valid ? current : { position, valid });
    },
    drop: item => {
      const preview = dropPreviewRef.current;
      if (preview?.valid) {
        if (preview.position === 'inside' && !expanded) onToggle();
        onMove?.(item.nodeId, node.id, preview.position);
      }
      dropPreviewRef.current = null;
      setDropPreview(null);
    },
    collect: monitor => ({ isOver: monitor.isOver({ shallow: true }) }),
  }), [rootNodes, node.id, expanded, onToggle, onMove]);

  drag(drop(rowRef));
  useEffect(() => {
    if (!isOver) {
      dropPreviewRef.current = null;
      setDropPreview(null);
    }
  }, [isOver]);

  const dropColor = dropPreview?.valid ? 'var(--robot-accent)' : 'var(--robot-danger)';
  const dropBackground = dropPreview?.valid ? 'var(--robot-accent-soft)' : 'var(--robot-danger-soft)';
  const dropBoxShadow = isOver && dropPreview
    ? dropPreview.position === 'before'
      ? `inset 0 2px 0 ${dropColor}`
      : dropPreview.position === 'after'
        ? `inset 0 -2px 0 ${dropColor}`
        : `inset 0 0 0 1px ${dropColor}`
    : 'none';

  return (
    <div
      ref={rowRef}
      title={readOnly ? '取消发布后可调整模型结构' : !isEditing ? '拖动节点可调整层级、顺序或父级' : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        minHeight: 38,
        marginLeft: depth * 18,
        padding: '0 4px',
        borderRadius: 8,
        border: '1px solid transparent',
        background: isOver && dropPreview?.position === 'inside'
          ? dropBackground
          : selected
            ? 'var(--robot-accent-soft)'
            : isHovered
              ? 'var(--robot-soft)'
              : 'transparent',
        boxShadow: dropBoxShadow,
        opacity: isDragging ? 0.42 : 1,
        cursor: readOnly
          ? 'pointer'
          : isOver && dropPreview && !dropPreview.valid
          ? 'not-allowed'
          : !isEditing
            ? isDragging ? 'grabbing' : 'grab'
            : 'default',
        transition: 'background 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
      }}
    >
      {hasChildren ? (
        <button
          type="button"
          aria-label={expanded ? `收起 ${node.label}` : `展开 ${node.label}`}
          title={expanded ? '收起下级节点' : '展开下级节点'}
          onClick={event => { event.stopPropagation(); onToggle(); }}
          style={{ width: 20, height: 24, padding: 0, border: 'none', background: 'transparent', color: 'var(--robot-subtle)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
      ) : (
        <span style={{ width: 20, flexShrink: 0 }} />
      )}

      {isEditing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: kindMeta.color, flexShrink: 0 }} />
          <input
            value={editValue}
            onChange={event => onEditValueChange(event.target.value)}
            onBlur={onCommitEdit}
            onKeyDown={event => {
              if (event.key === 'Enter') onCommitEdit();
              if (event.key === 'Escape') onCancelEdit();
            }}
            autoFocus
            style={{ flex: 1, minWidth: 0, height: 26, borderRadius: 8, border: '1px solid var(--robot-accent-border)', background: 'var(--robot-surface)', color: 'var(--robot-heading)', fontSize: 12, fontWeight: 500, padding: '0 6px', outline: 'none' }}
          />
        </div>
      ) : (
        <button
          type="button"
          className="hero-topology-node-button"
          onClick={() => onSelect(node.id)}
          onDoubleClick={event => { event.stopPropagation(); readOnly ? onReadOnlyAttempt() : onStartEdit(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, background: 'none', border: 'none', padding: 0, color: 'var(--robot-text)', cursor: 'pointer', textAlign: 'left' }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 99, background: kindMeta.color, flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: selected ? 600 : 500, color: selected ? 'var(--robot-accent-text)' : 'var(--robot-text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title="双击重命名">{node.label}</span>
        </button>
      )}

      <div style={{ width: 28, height: 28, flexShrink: 0, marginLeft: 2 }}>
        {!isDragging && <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label={`${node.label} 节点操作`} title="节点操作" onClick={event => event.stopPropagation()} style={{ width: 32, height: 32, padding: 0, border: 'none', borderRadius: 8, background: 'transparent', color: 'var(--robot-muted)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <MoreHorizontal size={15} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} collisionPadding={12} className="heroui-tree-menu">
            {childActions.map(action => (
              <DropdownMenuItem key={action.kind} className="heroui-tree-menu__item" onSelect={() => readOnly ? onReadOnlyAttempt() : onAddChild?.(node.id, action.kind)}>
                {action.kind === 'mesh' ? <Box size={15} /> : <Plus size={15} />}
                新增{action.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem className="heroui-tree-menu__item" onSelect={readOnly ? onReadOnlyAttempt : onStartEdit}><Pencil size={15} />重命名</DropdownMenuItem>
            <DropdownMenuSeparator className="heroui-tree-menu__separator" />
            <DropdownMenuItem className="heroui-tree-menu__item" variant="destructive" disabled={!readOnly && deleteDisabled} onSelect={() => readOnly ? onReadOnlyAttempt() : onDelete?.(node.id)}><Trash2 size={15} />删除节点</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>}
      </div>

      {isOver && dropPreview && (
        <span aria-live="polite" style={{ position: 'absolute', right: 6, bottom: -18, zIndex: 5, padding: '2px 6px', borderRadius: 999, background: dropPreview.valid ? 'var(--robot-accent-soft)' : 'var(--robot-danger-soft)', color: dropPreview.valid ? 'var(--robot-accent-text)' : 'var(--robot-danger)', fontSize: 10, fontWeight: 600, pointerEvents: 'none' }}>
          {dropPreview.valid ? (dropPreview.position === 'inside' ? '移动到节点下' : '调整顺序') : '此处不可放置'}
        </span>
      )}
    </div>
  );
}

function TopologyTree({
  nodes,
  selectedId,
  onSelect,
  onRename,
  onAddChild,
  onDelete,
  onMove,
  depth = 0,
  rootNodes,
  readOnly = false,
  onReadOnlyAttempt = () => {},
}: {
  nodes: TopologyNode[];
  selectedId: string;
  onSelect: (id: string) => void;
  onRename?: (id: string, label: string) => void;
  onAddChild?: (parentId: string, kind: TopologyKind) => void;
  onDelete?: (id: string) => void;
  onMove?: (draggedId: string, targetId: string, position: TopologyDropPosition) => void;
  depth?: number;
  rootNodes?: TopologyNode[];
  readOnly?: boolean;
  onReadOnlyAttempt?: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const fullTree = rootNodes ?? nodes;
  const isOnlyRoot = depth === 0 && nodes.length === 1;

  function startEdit(id: string, currentLabel: string) {
    setEditingId(id);
    setEditValue(currentLabel);
  }

  function commitEdit() {
    if (editingId && editValue.trim() && onRename) onRename(editingId, editValue.trim());
    setEditingId(null);
    setEditValue('');
  }

  return (
    <div>
      {nodes.map(node => {
        const hasChildren = Boolean(node.children?.length);
        const expanded = hasChildren && !collapsedIds.has(node.id);
        return (
          <div key={node.id}>
            <TopologyTreeRow
              node={node}
              depth={depth}
              selected={node.id === selectedId}
              isEditing={node.id === editingId}
              editValue={editValue}
              expanded={expanded}
              deleteDisabled={isOnlyRoot && node.id === nodes[0]?.id}
              rootNodes={fullTree}
              onSelect={onSelect}
              onToggle={() => setCollapsedIds(current => {
                const next = new Set(current);
                if (next.has(node.id)) next.delete(node.id); else next.add(node.id);
                return next;
              })}
              onStartEdit={() => startEdit(node.id, node.label)}
              onEditValueChange={setEditValue}
              onCommitEdit={commitEdit}
              onCancelEdit={() => { setEditingId(null); setEditValue(''); }}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onMove={onMove}
              readOnly={readOnly}
              onReadOnlyAttempt={onReadOnlyAttempt}
            />
            {expanded && node.children && (
              <TopologyTree
                nodes={node.children}
                selectedId={selectedId}
                onSelect={onSelect}
                onRename={onRename}
                onAddChild={onAddChild}
                onDelete={onDelete}
                onMove={onMove}
                depth={depth + 1}
                rootNodes={fullTree}
                readOnly={readOnly}
                onReadOnlyAttempt={onReadOnlyAttempt}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function axisInputStyle(): React.CSSProperties {
  return { ...inputStyle(), height: 40, borderRadius: 8, padding: '0 10px', fontSize: 14 };
}

function TopologyParamPanel({
  node,
  onChange,
  readOnly,
  onReadOnlyAttempt,
}: {
  node: TopologyNode;
  onChange: (patch: Partial<TopologyNode>) => void;
  readOnly: boolean;
  onReadOnlyAttempt: () => void;
}) {
  const meshInputRef = useRef<HTMLInputElement>(null);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(node.label);
  const kindMeta = topologyKindMeta(node.kind);
  const origin = originOf(node);
  const axis = axisOf(node);
  const limit = limitOf(node);
  const mesh = topologyMeshOf(node);

  useEffect(() => {
    setNameDraft(node.label);
    setRenaming(false);
  }, [node.id, node.label]);

  function commitName() {
    const nextName = nameDraft.trim();
    if (nextName && nextName !== node.label) onChange({ label: nextName });
    else setNameDraft(node.label);
    setRenaming(false);
  }

  function updateOrigin(key: keyof OriginPose, value: string) {
    const nextOrigin = { ...origin, [key]: Number(value) || 0 };
    onChange(node.kind === 'mesh'
      ? { origin: nextOrigin, mesh: { ...mesh, origin: nextOrigin } }
      : { origin: nextOrigin });
  }

  function updateAxis(key: keyof Vector3, value: string) {
    onChange({ axis: { ...axis, [key]: Number(value) || 0 } });
  }

  function updateLimit(key: keyof JointLimit, value: string) {
    onChange({ limit: { ...limit, [key]: Number(value) || 0 } });
  }

  function updateMesh(patch: Partial<LinkMesh>) {
    const nextMesh = { ...mesh, ...patch };
    onChange({ mesh: nextMesh, origin: nextMesh.origin });
  }

  function updateMeshScale(key: keyof Vector3, value: string) {
    updateMesh({ scale: { ...mesh.scale, [key]: Number(value) || 0 } });
  }

  function selectMeshFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    updateMesh({ filename: `package://meshes/${file.name}` });
  }

  return (
    <section className="hero-topology-param-panel" style={{ position: 'relative', background: 'var(--robot-surface)', border: '1px solid var(--robot-border)', borderRadius: 'var(--robot-card-radius)', overflow: 'hidden', boxShadow: 'var(--robot-shadow)', flexShrink: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ minHeight: 64, padding: '12px 16px', borderBottom: '1px solid var(--robot-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          borderRadius: 999,
          background: kindMeta.background,
          color: kindMeta.text,
          fontSize: 10,
          fontWeight: 600,
          padding: '3px 8px',
          flexShrink: 0,
        }}>
          {kindMeta.code}
        </span>
        {renaming ? (
          <input
            value={nameDraft}
            onChange={event => setNameDraft(event.target.value)}
            onBlur={commitName}
            onKeyDown={event => {
              if (event.key === 'Enter') commitName();
              if (event.key === 'Escape') { setNameDraft(node.label); setRenaming(false); }
            }}
            autoFocus
            aria-label="节点名称"
            style={{ minWidth: 0, flex: 1, height: 32, border: '1px solid var(--robot-accent-border)', borderRadius: 8, padding: '0 8px', background: 'var(--robot-surface)', color: 'var(--robot-heading)', font: 'inherit', fontSize: 14, outline: 'none' }}
          />
        ) : (
          <strong style={{ minWidth: 0, flex: 1, overflow: 'hidden', color: 'var(--robot-heading)', fontSize: 14, fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.label}</strong>
        )}
        <button type="button" className="software-config-edit" onClick={readOnly ? onReadOnlyAttempt : () => setRenaming(true)} aria-label="编辑节点名称" title={readOnly ? '取消发布后可编辑节点' : '编辑节点名称'}>
          <Pencil size={14} />
        </button>
      </div>

      <fieldset className="hero-topology-param-body" style={{ minWidth: 0, margin: 0, padding: 12, border: 0, display: 'grid', gap: 12 }}>
        <div>
          <div style={{ color: 'var(--robot-muted)', fontSize: 12, fontWeight: 600, marginBottom: 7 }}>位置 xyz</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
            {(['x', 'y', 'z'] as const).map(key => (
              <label key={key}>
                <span style={{ color: 'var(--robot-subtle)', fontSize: 10, fontWeight: 600, display: 'block', marginBottom: 4 }}>{key.toUpperCase()}</span>
                <ArcoTextInput scope="robot" type="number" step="0.01" value={origin[key]} onChange={event => updateOrigin(key, event.target.value)} style={axisInputStyle()} />
              </label>
            ))}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--robot-muted)', fontSize: 12, fontWeight: 600, marginBottom: 7 }}>旋转 xyz</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
            {(['rx', 'ry', 'rz'] as const).map((key, index) => (
              <label key={key}>
                <span style={{ color: 'var(--robot-subtle)', fontSize: 10, fontWeight: 600, display: 'block', marginBottom: 4 }}>{['RX', 'RY', 'RZ'][index]}</span>
                <ArcoTextInput scope="robot" type="number" step="1" value={origin[key]} onChange={event => updateOrigin(key, event.target.value)} style={axisInputStyle()} />
              </label>
            ))}
          </div>
        </div>

        {node.kind === 'mesh' && (
          <div className="hero-link-mesh-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ color: 'var(--robot-heading)', fontSize: 12, fontWeight: 600 }}>Mesh 几何资源</span>
              <span style={{ color: 'var(--robot-subtle)', fontSize: 10 }}>{mesh.filename ? '已配置' : '未配置'}</span>
            </div>

            <div className="hero-link-mesh-tabs" aria-label="Mesh 类型">
              {(['visual', 'collision'] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  className="hero-link-mesh-tab"
                  data-active={(node.meshRole ?? 'visual') === role}
                  onClick={() => onChange({ meshRole: role })}
                >
                  {role === 'visual' ? 'Visual' : 'Collision'}
                </button>
              ))}
            </div>

            <input
              ref={meshInputRef}
              type="file"
              accept=".stl,.dae,.obj,.glb,.gltf,.mesh"
              onChange={selectMeshFile}
              style={{ display: 'none' }}
            />
            <label>
              <span style={{ color: 'var(--robot-muted)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Mesh URI</span>
              <div className="hero-link-mesh-file-row">
                <ArcoTextInput
                  scope="robot"
                  value={mesh.filename}
                  onChange={event => updateMesh({ filename: event.target.value })}
                  placeholder="package://robot/meshes/link.stl"
                  style={axisInputStyle()}
                />
                <button
                  type="button"
                  className="hero-link-mesh-file-button"
                  aria-label={`选择 ${(node.meshRole ?? 'visual') === 'visual' ? 'Visual' : 'Collision'} Mesh 文件`}
                  title="选择 Mesh 文件"
                  onClick={() => meshInputRef.current?.click()}
                >
                  <FileUp size={14} />
                </button>
              </div>
            </label>

            <div>
              <div style={{ color: 'var(--robot-muted)', fontSize: 12, fontWeight: 600, marginBottom: 7 }}>缩放 scale</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                {(['x', 'y', 'z'] as const).map(key => (
                  <label key={key}>
                    <span style={{ color: 'var(--robot-subtle)', fontSize: 10, fontWeight: 600, display: 'block', marginBottom: 4 }}>{key.toUpperCase()}</span>
                    <ArcoTextInput scope="robot" type="number" step="0.01" value={mesh.scale[key]} onChange={event => updateMeshScale(key, event.target.value)} style={axisInputStyle()} />
                  </label>
                ))}
              </div>
            </div>

          </div>
        )}

        {node.kind === 'joint' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <label>
                <span style={{ color: 'var(--robot-muted)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>关节类型</span>
                <ArcoSelect scope="robot" value={node.jointType ?? 'revolute'} onChange={event => onChange({ jointType: event.target.value as JointType })} style={axisInputStyle()}>
                  {JOINT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </ArcoSelect>
              </label>
              <label>
                <span style={{ color: 'var(--robot-muted)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>速度</span>
                <ArcoTextInput scope="robot" type="number" step="0.1" value={limit.velocity} onChange={event => updateLimit('velocity', event.target.value)} style={axisInputStyle()} />
              </label>
            </div>

            <div>
              <div style={{ color: 'var(--robot-muted)', fontSize: 12, fontWeight: 600, marginBottom: 7 }}>旋转轴 axis</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                {(['x', 'y', 'z'] as const).map(key => (
                  <label key={key}>
                    <span style={{ color: 'var(--robot-subtle)', fontSize: 10, fontWeight: 600, display: 'block', marginBottom: 4 }}>{key.toUpperCase()}</span>
                    <ArcoTextInput scope="robot" type="number" step="0.1" value={axis[key]} onChange={event => updateAxis(key, event.target.value)} style={axisInputStyle()} />
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
              {([
                ['lower', '下限'],
                ['upper', '上限'],
                ['effort', '力矩'],
              ] as const).map(([key, label]) => (
                <label key={key}>
                  <span style={{ color: 'var(--robot-muted)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>{label}</span>
                  <ArcoTextInput scope="robot" type="number" step="1" value={limit[key]} onChange={event => updateLimit(key, event.target.value)} style={axisInputStyle()} />
                </label>
              ))}
            </div>
          </>
        )}
      </fieldset>
      {readOnly && <button type="button" className="hero-readonly-interceptor" onClick={onReadOnlyAttempt} aria-label="取消发布后编辑节点参数" />}
    </section>
  );
}

const DEVICE_KIND_META: Record<DeviceKind, { label: string; color: string; background: string }> = {
  chassis: { label: '底盘', color: 'var(--robot-warning)', background: 'var(--robot-warning-soft)' },
  base: { label: '底座', color: 'var(--robot-accent)', background: 'var(--robot-accent-soft)' },
  arm: { label: '机械臂', color: 'var(--robot-success)', background: 'var(--robot-success-soft)' },
  tool: { label: '末端', color: 'var(--robot-danger)', background: 'var(--robot-danger-soft)' },
};

function DeviceStructureTree({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: DeviceStructureNode[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function renderNodes(items: DeviceStructureNode[], depth = 0): React.ReactNode {
    return items.map(node => {
      const hasChildren = Boolean(node.children?.length);
      const expanded = hasChildren && !collapsed.has(node.id);
      const meta = DEVICE_KIND_META[node.kind];
      const selected = node.id === selectedId;
      return (
        <div key={node.id}>
          <div style={{ minHeight: 38, marginLeft: depth * 18, padding: '0 6px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8, background: selected ? 'var(--robot-accent-soft)' : 'transparent' }}>
            {hasChildren ? (
              <button type="button" onClick={() => setCollapsed(current => {
                const next = new Set(current);
                if (next.has(node.id)) next.delete(node.id); else next.add(node.id);
                return next;
              })} aria-label={expanded ? `收起 ${node.label}` : `展开 ${node.label}`} style={{ width: 22, height: 28, padding: 0, border: 0, background: 'transparent', color: 'var(--robot-subtle)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : <span style={{ width: 22, flexShrink: 0 }} />}
            <button type="button" onClick={() => onSelect(node.id)} style={{ minWidth: 0, flex: 1, padding: 0, display: 'flex', alignItems: 'center', gap: 8, border: 0, background: 'transparent', color: selected ? 'var(--robot-accent-text)' : 'var(--robot-text)', font: 'inherit', fontSize: 14, fontWeight: selected ? 600 : 500, textAlign: 'left', cursor: 'pointer' }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: meta.color, flexShrink: 0 }} />
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.label}</span>
            </button>
            <span style={{ flexShrink: 0, padding: '2px 7px', borderRadius: 999, background: meta.background, color: meta.color, fontSize: 10, fontWeight: 600 }}>{meta.label}</span>
          </div>
          {expanded && node.children && renderNodes(node.children, depth + 1)}
        </div>
      );
    });
  }

  return <div className="hero-topology-tree-scroll">{renderNodes(nodes)}</div>;
}

function DeviceStructureParamPanel({
  node,
  readOnly,
  onChange,
  onReadOnlyAttempt,
}: {
  node: DeviceStructureNode;
  readOnly: boolean;
  onChange: (origin: OriginPose) => void;
  onReadOnlyAttempt: () => void;
}) {
  const meta = DEVICE_KIND_META[node.kind];
  const changeOrigin = (key: keyof OriginPose, value: string) => onChange({ ...node.origin, [key]: Number(value) || 0 });
  return (
    <section className="hero-topology-param-panel" style={{ position: 'relative', background: 'var(--robot-surface)', border: '1px solid var(--robot-border)', borderRadius: 'var(--robot-card-radius)', overflow: 'hidden', boxShadow: 'var(--robot-shadow)', flexShrink: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ minHeight: 64, padding: '12px 16px', borderBottom: '1px solid var(--robot-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ borderRadius: 999, background: meta.background, color: meta.color, fontSize: 10, fontWeight: 600, padding: '3px 8px' }}>{meta.label}</span>
        <strong style={{ minWidth: 0, flex: 1, overflow: 'hidden', color: 'var(--robot-heading)', fontSize: 14, fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.label}</strong>
      </div>
      <div className="hero-topology-param-body" style={{ padding: 12, display: 'grid', gap: 12 }}>
        {([
          ['位置 xyz', ['x', 'y', 'z'] as const, ['X', 'Y', 'Z']],
          ['旋转 xyz', ['rx', 'ry', 'rz'] as const, ['RX', 'RY', 'RZ']],
        ] as const).map(([title, keys, labels]) => (
          <div key={title}>
            <div style={{ color: 'var(--robot-muted)', fontSize: 12, fontWeight: 600, marginBottom: 7 }}>{title}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
              {keys.map((key, index) => (
                <label key={key}>
                  <span style={{ color: 'var(--robot-subtle)', fontSize: 10, fontWeight: 600, display: 'block', marginBottom: 4 }}>{labels[index]}</span>
                  <ArcoTextInput scope="robot" type="number" step="0.01" value={node.origin[key]} onChange={event => changeOrigin(key, event.target.value)} style={axisInputStyle()} />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {readOnly && <button type="button" className="hero-readonly-interceptor" onClick={onReadOnlyAttempt} aria-label="取消发布后编辑设备参数" />}
    </section>
  );
}

function SoftwareVersionPanel({
  catalog,
  selectionIds,
  onConfigure,
  readOnly,
  onReadOnlyAttempt,
}: {
  catalog: SoftwareVersionCategory[];
  selectionIds: string[];
  onConfigure: () => void;
  readOnly: boolean;
  onReadOnlyAttempt: () => void;
}) {
  const treeCategories = useMemo<ProductCategory[]>(() => {
    const selectedSet = new Set(selectionIds);
    return catalog
      .map(category => ({
        id: category.id,
        name: category.label,
        icon: category.icon,
        subcategories: category.groups
          .map(group => ({
            id: group.id,
            name: group.label,
            brands: group.items
              .filter(item => selectedSet.has(item.id))
              .map(item => ({ id: item.id, name: item.label, versions: [] })),
          }))
          .filter(group => group.brands.length > 0),
      }))
      .filter(category => category.subcategories.length > 0);
  }, [catalog, selectionIds]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(catalog.flatMap(category => category.groups.map(group => group.id))),
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(current => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  return (
    <section style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--robot-surface)', overflow: 'hidden' }}>
      <div style={{ minHeight: 48, padding: '8px 14px 6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
        <div style={{ color: 'var(--robot-heading)', fontSize: 16, lineHeight: '22px', fontWeight: 700 }}>软件配置</div>
        <button
          type="button"
          className="software-config-edit"
          onClick={readOnly ? onReadOnlyAttempt : onConfigure}
          aria-label="编辑软件配置"
          title={readOnly ? '取消发布后可编辑软件配置' : '编辑软件配置'}
        >
          <Pencil size={14} />
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {treeCategories.length === 0 && (
          <div style={{ height: '100%', minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--robot-muted)', padding: 20 }}>
            <Box size={24} style={{ marginBottom: 10, color: 'var(--robot-subtle)' }} />
            <div style={{ color: 'var(--robot-text)', fontSize: 14, fontWeight: 600 }}>尚未配置软件产品</div>
            <div style={{ fontSize: 12, marginTop: 5 }}>点击右上角编辑图标进行配置</div>
          </div>
        )}
        {treeCategories.length > 0 && (
          <CategoryTree
            categories={treeCategories}
            selectedBrandId={null}
            expandedSubs={expandedGroups}
            onToggleSub={toggleGroup}
          />
        )}
      </div>
    </section>
  );
}

function SoftwareVersionDialog({
  catalog,
  open,
  selectionIds,
  onOpenChange,
  onSave,
}: {
  catalog: SoftwareVersionCategory[];
  open: boolean;
  selectionIds: string[];
  onOpenChange: (open: boolean) => void;
  onSave: (ids: string[]) => void;
}) {
  const [draftIds, setDraftIds] = useState<string[]>(selectionIds);
  const [activeCategoryId, setActiveCategoryId] = useState(catalog[0]?.id ?? '');
  const [activeGroupId, setActiveGroupId] = useState(catalog[0]?.groups[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraftIds(selectionIds);
    setActiveCategoryId(catalog[0]?.id ?? '');
    setActiveGroupId(catalog[0]?.groups[0]?.id ?? '');
    setQuery('');
    setSynced(false);
  }, [catalog, open, selectionIds]);

  const activeCategory = catalog.find(category => category.id === activeCategoryId) ?? catalog[0];
  const activeGroup = activeCategory?.groups.find(group => group.id === activeGroupId) ?? activeCategory?.groups[0];
  const selectedSet = new Set(draftIds);
  const filteredItems = activeGroup?.items.filter(item => item.label.toLowerCase().includes(query.trim().toLowerCase())) ?? [];
  const currentGroupSelectedCount = activeGroup?.items.filter(item => selectedSet.has(item.id)).length ?? 0;
  const allCurrentGroupSelected = activeGroup?.items.length ? activeGroup.items.every(item => selectedSet.has(item.id)) : false;
  const catalogTotal = catalog.reduce((total, category) => total + category.totalCount, 0);

  function selectCategory(category: SoftwareVersionCategory) {
    setActiveCategoryId(category.id);
    setActiveGroupId(category.groups[0]?.id ?? '');
    setQuery('');
  }

  function toggleItem(id: string, checked: boolean) {
    setDraftIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return Array.from(next);
    });
  }

  function toggleActiveGroup(checked: boolean) {
    setDraftIds(prev => {
      const next = new Set(prev);
      activeGroup?.items.forEach(item => {
        if (checked) next.add(item.id);
        else next.delete(item.id);
      });
      return Array.from(next);
    });
  }

  return (
    <ArcoModal
      open={open}
      onOpenChange={onOpenChange}
      scope="robot"
      title="软件版本"
      size="xl"
      contentStyle={{ height: 'min(720px, var(--ds-modal-max-height))' }}
      bodyStyle={{ padding: 0, flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}
      footer={(
        <>
          <ArcoButton scope="robot" onClick={() => onOpenChange(false)}>关闭</ArcoButton>
          <ArcoButton scope="robot" type="primary" onClick={() => { onSave(draftIds); onOpenChange(false); }}>保存</ArcoButton>
        </>
      )}
    >
      <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ minHeight: 48, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--robot-border)' }}>
          <span style={{ color: 'var(--robot-muted)', fontSize: 12 }}>已选 {draftIds.length} 个类型 · 目录 {catalogTotal} 个类型</span>
          <ArcoButton scope="robot" size="small" icon={<RefreshCw size={13} />} onClick={() => setSynced(true)}>
            {synced ? '已刷新' : '刷新目录'}
          </ArcoButton>
        </div>
          <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '160px 160px minmax(0, 1fr)' }}>
            <div style={{ borderRight: '1px solid var(--robot-border)', padding: '14px 10px', overflowY: 'auto' }}>
              <div style={{ color: 'var(--robot-subtle)', fontSize: 12, fontWeight: 600, margin: '0 0 10px 2px' }}>产品</div>
              {catalog.map(category => {
                const selectedCount = category.groups.flatMap(group => group.items).filter(item => selectedSet.has(item.id)).length;
                const active = category.id === activeCategory.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => selectCategory(category)}
                    style={{
                      width: '100%',
                      minHeight: 38,
                      border: 'none',
                      borderRadius: 8,
                      background: active ? 'var(--robot-accent-soft)' : 'transparent',
                      color: active ? 'var(--robot-accent-text)' : 'var(--robot-text)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '0 8px',
                      marginBottom: 6,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{category.label}</span>
                    <span style={{ borderRadius: 999, background: active ? 'var(--robot-accent-soft)' : 'var(--robot-soft)', color: active ? 'var(--robot-accent-text)' : 'var(--robot-subtle)', fontSize: 12, padding: '3px 7px', flexShrink: 0 }}>
                      {selectedCount || category.totalCount}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ borderRight: '1px solid var(--robot-border)', padding: '14px 10px', overflowY: 'auto' }}>
              <div style={{ color: 'var(--robot-subtle)', fontSize: 12, fontWeight: 600, margin: '0 0 10px 2px' }}>子产品</div>
              {activeCategory?.groups.map(group => {
                const selectedCount = group.items.filter(item => selectedSet.has(item.id)).length;
                const active = group.id === activeGroup.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => { setActiveGroupId(group.id); setQuery(''); }}
                    style={{
                      width: '100%',
                      minHeight: 38,
                      border: 'none',
                      borderRadius: 8,
                      background: active ? 'var(--robot-accent-soft)' : 'transparent',
                      color: active ? 'var(--robot-accent-text)' : 'var(--robot-text)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '0 8px',
                      marginBottom: 6,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.label}</span>
                    <span style={{ borderRadius: 999, background: active ? 'var(--robot-accent-soft)' : 'var(--robot-soft)', color: active ? 'var(--robot-accent-text)' : 'var(--robot-subtle)', fontSize: 12, padding: '3px 7px', flexShrink: 0 }}>
                      {selectedCount || group.totalCount}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--robot-border)' }}>
                <div style={{ color: 'var(--robot-heading)', fontSize: 16, fontWeight: 600, marginBottom: 7 }}>{activeGroup?.label ?? '产品列表'}</div>
                <div style={{ color: 'var(--robot-muted)', fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
                  勾选需要推送到引擎装机的软件类型，已发布包也可勾选。
                </div>
                <div style={{ color: 'var(--robot-muted)', fontSize: 12, marginBottom: 12 }}>已选 {currentGroupSelectedCount} / {activeGroup?.totalCount ?? 0}</div>
                <div style={{ position: 'relative' }}>
                  <Search size={15} color="var(--robot-subtle)" style={{ position: 'absolute', left: 12, top: 10 }} />
                  <ArcoTextInput
                    scope="robot"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="搜索类型名称..."
                    style={{ ...inputStyle(), height: 38, borderRadius: 8, paddingLeft: 36 }}
                  />
                </div>
              </div>

              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                <ArcoCheckbox
                    scope="robot"
                    checked={allCurrentGroupSelected}
                    onChange={event => toggleActiveGroup(event.target.checked)}
                    label="全选当前子产品类型"
                    style={{ padding: '14px 20px', borderBottom: '1px solid var(--robot-border)' }}
                />

                <div style={{ padding: '8px 14px 18px' }}>
                  {filteredItems.map(item => (
                    <label
                      key={item.id}
                      style={{
                        minHeight: 44,
                        border: selectedSet.has(item.id) ? '1px solid var(--robot-accent-border)' : '1px solid transparent',
                        borderRadius: 8,
                        display: 'grid',
                        gridTemplateColumns: '24px minmax(0, 1fr) 80px',
                        alignItems: 'center',
                        gap: 8,
                        padding: '0 10px',
                        cursor: 'pointer',
                        background: selectedSet.has(item.id) ? 'var(--robot-accent-soft)' : 'transparent',
                        transition: 'background-color 180ms ease, border-color 180ms ease',
                      }}
                    >
                      <ArcoCheckbox
                        scope="robot"
                        checked={selectedSet.has(item.id)}
                        onChange={event => toggleItem(item.id, event.target.checked)}
                        style={{ width: 16, height: 16, gap: 0 }}
                      />
                      <span style={{ color: 'var(--robot-heading)', fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                      <span style={{ color: 'var(--robot-subtle)', fontSize: 12, textAlign: 'right' }}>{item.versionCount} 个版本</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
      </div>

    </ArcoModal>
  );
}

export function RobotModelManager({
  themeMode: controlledThemeMode,
}: {
  themeMode?: ThemeMode;
  softwareProducts?: SoftwareProduct[];
} = {}) {
  const [models, setModels] = useState<RobotModel[]>(INITIAL_ROBOT_MODELS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingScene, setEditingScene] = useState(false);
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [softwareDialogOpen, setSoftwareDialogOpen] = useState(false);
  const [selectedTopologyId, setSelectedTopologyId] = useState('base_link');
  const [selectedDeviceId, setSelectedDeviceId] = useState('xiangong-chassis');
  const [deviceStructures, setDeviceStructures] = useState<Record<string, DeviceStructureNode[]>>(
    () => Object.fromEntries(INITIAL_ROBOT_MODELS.map(model => [model.id, defaultDeviceStructure()])),
  );
  const [internalThemeMode] = useState<ThemeMode>(initialThemeMode);
  const [draft, setDraft] = useState<RobotDraft | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [publishLockNotice, setPublishLockNotice] = useState(false);
  const publishLockTimerRef = useRef<number | null>(null);

  // Topology CRUD state
  const [addNodeDialogOpen, setAddNodeDialogOpen] = useState(false);
  const [addNodeAsRoot, setAddNodeAsRoot] = useState(false);
  const [addTargetId, setAddTargetId] = useState<string>('base_link');
  const [newNodeKind, setNewNodeKind] = useState<TopologyKind>('link');
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [deleteTopologyTargetId, setDeleteTopologyTargetId] = useState<string | null>(null);
  const [urdfImportError, setUrdfImportError] = useState<string | null>(null);

  const themeMode = controlledThemeMode ?? internalThemeMode;
  const softwareCatalog = useMemo(() => buildSoftwareVersionCatalog(), []);
  const activeModel = activeId ? (models.find(model => model.id === activeId) ?? null) : null;
  const modelReadOnly = activeModel?.status === 'published';
  const selectedTopologyNode = useMemo(
    () => activeModel ? (findTopologyNode(activeModel.topology, selectedTopologyId) ?? activeModel.topology[0]) : null,
    [activeModel, selectedTopologyId],
  );
  const activeDeviceStructure = activeModel ? (deviceStructures[activeModel.id] ?? defaultDeviceStructure()) : [];
  const selectedDeviceNode = useMemo(
    () => findDeviceStructureNode(activeDeviceStructure, selectedDeviceId) ?? activeDeviceStructure[0] ?? null,
    [activeDeviceStructure, selectedDeviceId],
  );

  // Auto-fix activeId only when it points to a deleted/missing model (not when user is on table view)
  useEffect(() => {
    if (activeId === null) return; // user is on table view, don't override
    if (models.some(model => model.id === activeId)) return; // activeId is still valid
    setActiveId(models[0]?.id ?? null); // model was deleted, fallback to first
  }, [activeId, models]);

  useEffect(() => {
    const availableIds = new Set(softwareCatalogItems(softwareCatalog).map(product => product.id));
    setModels(prev => prev.map(model => ({
      ...model,
      softwareSelectionIds: model.softwareSelectionIds.filter(id => availableIds.has(id)),
    })));
  }, [softwareCatalog]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    Object.entries(ROBOT_THEME_VARS[themeMode]).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    document.documentElement.dataset.robotTheme = themeMode;
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  useEffect(() => () => {
    if (publishLockTimerRef.current !== null) window.clearTimeout(publishLockTimerRef.current);
  }, []);

  function notifyPublishLock() {
    setPublishLockNotice(true);
    if (publishLockTimerRef.current !== null) window.clearTimeout(publishLockTimerRef.current);
    publishLockTimerRef.current = window.setTimeout(() => setPublishLockNotice(false), 2600);
  }

  const publishLockToast = publishLockNotice ? (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 68,
        left: '50%',
        zIndex: 90,
        minHeight: 40,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        border: '1px solid var(--robot-accent-border)',
        borderRadius: 8,
        background: 'var(--robot-surface)',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.14)',
        color: 'var(--robot-heading)',
        fontSize: 14,
        fontWeight: 500,
        transform: 'translateX(-50%)',
      }}
    >
      <LockKeyhole size={16} color="var(--robot-accent)" />
      当前型号已发布，请先取消发布后再编辑
    </div>
  ) : null;

  const deleteModal = (
    <ArcoModal
      open={deleteDialogOpen}
      onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setDeleteTargetId(null); }}
      scope="robot"
      status="danger"
      title="删除机器人型号"
      size="sm"
      footer={(
        <>
          <ArcoButton scope="robot" onClick={() => { setDeleteDialogOpen(false); setDeleteTargetId(null); }}>取消</ArcoButton>
          <ArcoButton scope="robot" type="primary" status="danger" onClick={confirmDelete}>删除</ArcoButton>
        </>
      )}
    >
      <p style={{ color: 'var(--robot-muted)', fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        确认删除「{(deleteTargetId ? models.find(m => m.id === deleteTargetId) : activeModel)?.name ?? '此型号'}」吗？删除后该型号的拓扑结构、外设配置与导出配置会一并移除。
      </p>
    </ArcoModal>
  );

  const filteredModels = models.filter(model => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return model.name.toLowerCase().includes(query)
      || model.type.toLowerCase().includes(query)
      || model.version.toLowerCase().includes(query);
  });

  if (!activeModel) {
    return (
      <>
        {publishLockToast}
        <div style={{
          ...robotThemeVars(themeMode),
          flex: 1,
          minWidth: 0,
          height: '100%',
          padding: 'var(--robot-page-padding)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--robot-page)',
          color: 'var(--robot-text)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          transition: 'background 0.22s ease, color 0.22s ease',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--robot-section-gap)', flexShrink: 0, gap: 'var(--robot-section-gap)' }}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ color: 'var(--robot-heading)', fontSize: 20, fontWeight: 600, margin: 0 }}>型号库</h1>
              <p style={{ color: 'var(--robot-muted)', fontSize: 14, margin: '4px 0 0' }}>
                管理所有机器人型号，点击进入查看与编辑详情。
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <ArcoTextInput
                scope="robot"
                placeholder="搜索型号名称、类型…"
                icon={<Search size={14} />}
                value={searchQuery}
                onChange={e => setSearchQuery((e.target as HTMLInputElement).value)}
                style={{ width: 260 }}
              />
              <HeroButton variant="primary" onPress={openCreateDialog}>
                <Plus size={14} />新建型号
              </HeroButton>
            </div>
          </div>

          <style>{`
            .hero-detail-button {
              min-height: 40px;
              padding: 0 14px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 7px;
              border: 1px solid transparent;
              border-radius: var(--robot-control-radius);
              background: var(--robot-soft);
              color: var(--robot-heading);
              font: inherit;
              font-size: 14px;
              font-weight: 600;
              white-space: nowrap;
              cursor: pointer;
              transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease, opacity 180ms ease;
            }
            .hero-detail-button[data-size="sm"] { min-height: 32px; padding: 0 12px; border-radius: var(--ds-radius-button); font-size: 14px; }
            .hero-detail-button[data-icon-only="true"] { width: 40px !important; padding: 0; }
            .hero-detail-button[data-icon-only="true"][data-size="sm"] { width: 32px !important; padding: 0; }
            .hero-detail-button[data-variant="primary"] { background: var(--robot-brand); color: var(--robot-accent-contrast); }
            .hero-detail-button[data-variant="secondary"] { background: var(--robot-accent-soft); color: var(--robot-accent-text); }
            .hero-detail-button[data-variant="tertiary"] { border-color: var(--robot-border-strong); background: var(--robot-surface); }
            .hero-detail-button[data-variant="ghost"] { background: transparent; color: var(--robot-text); }
            .hero-detail-button[data-variant="danger"] { background: var(--robot-danger-soft); color: var(--robot-danger); }
            .hero-detail-button:hover { opacity: 0.86; }
            .hero-detail-button:focus-visible { outline: 3px solid var(--robot-accent-soft); outline-offset: 2px; }
            .hero-detail-chip {
              max-width: 100%;
              min-height: 24px;
              padding: 2px 9px;
              display: inline-flex;
              align-items: center;
              gap: 4px;
              border-radius: 999px;
              background: var(--robot-soft);
              color: var(--robot-text);
              font-size: 12px;
              line-height: 16px;
              font-weight: 600;
              white-space: nowrap;
            }
            .hero-detail-chip[data-tone="accent"] { background: var(--robot-accent-soft); color: var(--robot-accent-text); }
            .hero-detail-chip[data-tone="success"] { background: var(--robot-success-soft); color: var(--robot-success); }
            .hero-detail-chip[data-tone="danger"] { background: var(--robot-danger-soft); color: var(--robot-danger); }
            .model-library-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 2px 2px 20px; }
            .model-library-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); align-content: start; gap: 16px; }
            .model-library-card {
              min-width: 0;
              overflow: hidden;
              border: 1px solid var(--robot-border);
              border-radius: var(--robot-card-radius);
              background: var(--robot-surface);
              box-shadow: var(--robot-shadow-soft);
              transition: border-color 180ms ease, box-shadow 180ms ease;
            }
            .model-library-card:hover {
              border-color: var(--robot-accent-border);
              box-shadow: var(--robot-shadow);
            }
            .model-card-main { width: 100%; padding: 0; border: 0; background: transparent; color: inherit; text-align: left; cursor: pointer; }
            .model-card-main:active { opacity: 0.9; }
            .model-card-main:focus-visible { outline: 3px solid var(--robot-accent-soft); outline-offset: -3px; }
            .model-card-preview { position: relative; height: 190px; overflow: hidden; background: var(--robot-scene-bg); }
            .model-card-preview svg { width: 100%; height: 100%; display: block; }
            .model-card-preview-label {
              position: absolute;
              top: 12px;
              left: 12px;
              min-height: 24px;
              padding: 0 9px;
              display: inline-flex;
              align-items: center;
              border: 1px solid var(--robot-hud-border);
              border-radius: 999px;
              background: var(--robot-hud-bg);
              color: var(--robot-hud-text);
              font-size: 12px;
              font-weight: 600;
            }
            .model-card-content { padding: 16px; }
            .model-card-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
            .model-card-title { min-width: 0; margin: 0; overflow: hidden; color: var(--robot-heading); font-size: 16px; line-height: 24px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
            .model-card-type { margin: 3px 0 0; overflow: hidden; color: var(--robot-muted); font-size: 12px; line-height: 18px; text-overflow: ellipsis; white-space: nowrap; }
            .model-card-stats { margin-top: 14px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
            .model-card-stat { min-width: 0; padding: 10px 11px; border-radius: var(--robot-inner-radius); background: var(--robot-soft); }
            .model-card-stat span { display: block; color: var(--robot-muted); font-size: 10px; line-height: 15px; }
            .model-card-stat strong { display: block; margin-top: 2px; overflow: hidden; color: var(--robot-heading); font-size: 14px; line-height: 18px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
            .model-card-footer { min-height: 52px; padding: 8px 12px 8px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top: 1px solid var(--robot-border); }
            .model-card-updated { overflow: hidden; color: var(--robot-subtle); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
            .model-card-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
            .model-library-empty { min-height: 240px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--robot-border-strong); border-radius: var(--robot-card-radius); color: var(--robot-muted); background: var(--robot-surface); font-size: 14px; text-align: center; padding: 32px; }
            @media (max-width: 760px) {
              .model-library-grid { grid-template-columns: minmax(0, 1fr); }
              .model-card-preview { height: 176px; }
            }
            @media (prefers-reduced-motion: reduce) {
              .model-library-card, .hero-detail-button { transition: none; }
            }
          `}</style>

          <div className="model-library-scroll">
            {filteredModels.length > 0 ? (
              <div className="model-library-grid">
                {filteredModels.map(model => {
                  const status = STATUS_META[model.status];
                  return (
                    <article key={model.id} className="model-library-card">
                      <button
                        type="button"
                        className="model-card-main"
                        aria-label={`查看${model.name}详情`}
                        onClick={() => { setActiveId(model.id); setEditingScene(false); setSelectedTopologyId('base_link'); }}
                      >
                        <RobotCardPreview model={model} />
                        <div className="model-card-content">
                          <div className="model-card-title-row">
                            <div style={{ minWidth: 0 }}>
                              <h2 className="model-card-title">{model.name}</h2>
                              <p className="model-card-type">{model.type}</p>
                            </div>
                            <HeroChip tone={model.status === 'published' ? 'success' : 'default'}>{status.label}</HeroChip>
                          </div>
                          <div className="model-card-stats">
                            <div className="model-card-stat"><span>版本</span><strong>{model.version}</strong></div>
                            <div className="model-card-stat"><span>组件</span><strong>{model.componentCount}</strong></div>
                            <div className="model-card-stat"><span>外设</span><strong>{model.peripherals.length}</strong></div>
                          </div>
                        </div>
                      </button>
                      <footer className="model-card-footer">
                        <span className="model-card-updated">更新于 {model.updatedAt}</span>
                        <div className="model-card-actions">
                          <HeroButton
                            variant="ghost"
                            size="sm"
                            isIconOnly
                            ariaLabel={`编辑${model.name}`}
                            title={model.status === 'published' ? '取消发布后可编辑' : '编辑'}
                            onPress={() => {
                              if (model.status === 'published') {
                                notifyPublishLock();
                                return;
                              }
                              setActiveId(model.id);
                              setEditingScene(false);
                              setSelectedTopologyId('base_link');
                            }}
                          >
                            <Pencil size={14} />
                          </HeroButton>
                          <HeroButton
                            variant="danger"
                            size="sm"
                            isIconOnly
                            ariaLabel={`删除${model.name}`}
                            title={model.status === 'published' ? '取消发布后可删除' : '删除'}
                            onPress={() => {
                              if (model.status === 'published') {
                                notifyPublishLock();
                                return;
                              }
                              setDeleteTargetId(model.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 size={14} />
                          </HeroButton>
                        </div>
                      </footer>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="model-library-empty">
                {models.length === 0
                  ? '暂无型号，点击「新建型号」创建第一个机器人型号。'
                  : `没有匹配「${searchQuery}」的型号。`}
              </div>
            )}
          </div>
        </div>
        {deleteModal}
      </>
    );
  }

  function updateActive(partial: Partial<RobotModel>) {
    if (activeModel.status === 'published' && partial.status !== 'draft') return;
    setModels(prev => prev.map(model => model.id === activeModel.id ? { ...model, ...partial, updatedAt: nowLabel() } : model));
  }

  function saveSoftwareSelections(ids: string[]) {
    const availableIds = new Set(softwareCatalogItems(softwareCatalog).map(product => product.id));
    const selectionIds = ids.filter(id => availableIds.has(id));
    updateActive({
      softwareSelectionIds: selectionIds,
      softwarePackages: packagesFromSoftwareSelections(selectionIds, activeModel.softwarePackages, softwareCatalog),
    });
  }

  // ── Topology CRUD handlers ──────────────────────────────────

  function handleAddTopologyNode() {
    if (!newNodeLabel.trim()) return;
    const targetNode = addNodeAsRoot ? null : findTopologyNode(activeModel.topology, addTargetId);
    if (!addNodeAsRoot && !targetNode) return;
    const childKind: TopologyKind = addNodeAsRoot ? 'link' : newNodeKind;
    if (targetNode && !canAddTopologyChildKind(targetNode.kind, childKind)) return;
    const child: TopologyNode = {
      id: topoUid(),
      label: newNodeLabel.trim(),
      kind: childKind,
      origin: { ...DEFAULT_ORIGIN },
      ...(childKind === 'joint' ? { jointType: 'revolute' as JointType, axis: { ...DEFAULT_AXIS }, limit: { ...DEFAULT_LIMIT } } : {}),
      ...(childKind === 'mesh' ? {
        meshRole: 'visual' as MeshRole,
        mesh: { filename: '', scale: { ...DEFAULT_MESH_SCALE }, origin: { ...DEFAULT_ORIGIN } },
      } : {}),
      children: [],
    };
    updateActive({
      topology: addNodeAsRoot
        ? [...activeModel.topology, child]
        : addTopologyChild(activeModel.topology, addTargetId, child),
    });
    setSelectedTopologyId(child.id);
    setAddNodeDialogOpen(false);
    setAddNodeAsRoot(false);
    setNewNodeLabel('');
  }

  function handleDeleteTopologyNode(targetId: string) {
    const targetNode = findTopologyNode(activeModel.topology, targetId);
    if (!targetNode) return;
    // Prevent deleting the only root
    const roots = activeModel.topology;
    if (roots.length === 1 && roots[0].id === targetId) return;
    const newTopology = removeTopologyNode(activeModel.topology, targetId);
    updateActive({ topology: newTopology });
    setSelectedTopologyId(newTopology[0]?.id ?? 'base_link');
  }

  function handleMoveTopologyNode(draggedId: string, targetId: string, position: TopologyDropPosition) {
    const nextTopology = moveTopologyNode(activeModel.topology, draggedId, targetId, position);
    if (nextTopology === activeModel.topology) return;
    updateActive({ topology: nextTopology });
    setSelectedTopologyId(draggedId);
  }

  function handleUrdfImport(event: React.ChangeEvent<HTMLInputElement>) {
    if (modelReadOnly) {
      event.target.value = '';
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    setUrdfImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const { links, joints } = parseUrdf(text);
        if (links.length === 0 && joints.length === 0) {
          setUrdfImportError('URDF 文件中未找到 link 或 joint 定义');
          return;
        }
        const topology = urdfToTopology(links, joints);
        updateActive({ topology });
        setSelectedTopologyId(topology[0]?.id ?? 'base_link');
      } catch (err: any) {
        setUrdfImportError(err.message ?? 'URDF 导入失败');
      }
    };
    reader.onerror = () => setUrdfImportError('文件读取失败');
    reader.readAsText(file);
    // Reset input so the same file can be re-imported
    event.target.value = '';
  }

  function updateSelectedTopologyNode(patch: Partial<TopologyNode>) {
    if (!selectedTopologyNode) return;
    updateActive({
      topology: updateTopologyNode(activeModel.topology, selectedTopologyNode.id, patch),
    });
  }

  function updateSelectedDeviceNode(origin: OriginPose) {
    if (!activeModel || !selectedDeviceNode || modelReadOnly) return;
    setDeviceStructures(current => ({
      ...current,
      [activeModel.id]: updateDeviceStructureNode(activeDeviceStructure, selectedDeviceNode.id, { origin }),
    }));
  }

  function openCreateDialog() {
    setDraft({
      name: '新建机器人型号',
      type: '复合机器人',
      description: '',
      homepageSchemeId: undefined,
      ownerAccount: 'robot-admin',
      status: 'draft',
      version: 'R1.0',
      componentCount: 8,
      peripheralsText: '视觉相机\n激光雷达',
    });
    setModelDialogOpen(true);
  }

  function openEditDialog() {
    if (modelReadOnly) return;
    setDraft({
      id: activeModel.id,
      name: activeModel.name,
      type: activeModel.type,
      description: activeModel.description,
      homepageSchemeId: activeModel.homepageSchemeId,
      ownerAccount: activeModel.ownerAccount,
      status: activeModel.status,
      version: activeModel.version,
      componentCount: activeModel.componentCount,
      peripheralsText: activeModel.peripherals.join('\n'),
    });
    setModelDialogOpen(true);
  }

  function saveDraft() {
    if (!draft || !draft.name.trim()) return;
    const nextSoftwareSelectionIds = draft.id ? activeModel.softwareSelectionIds : defaultSoftwareSelectionIds();
    const nextModel: RobotModel = {
      id: draft.id ?? `robot-${Date.now()}`,
      name: draft.name.trim(),
      type: draft.type,
      description: (draft.description || '').trim(),
      ownerAccount: draft.ownerAccount.trim() || 'robot-admin',
      status: draft.status,
      version: draft.version.trim() || 'R1.0',
      updatedAt: nowLabel(),
      componentCount: Math.max(1, Number(draft.componentCount) || 1),
      peripherals: splitPeripherals(draft.peripheralsText),
      pose: activeModel?.pose ?? { rotation: 0, height: 58, reach: 58 },
      topology: draft.id ? activeModel.topology : defaultTopology(draft.type),
      softwareSelectionIds: nextSoftwareSelectionIds,
      softwarePackages: draft.id ? activeModel.softwarePackages : packagesFromSoftwareSelections(nextSoftwareSelectionIds, defaultSoftwarePackages(draft.type), softwareCatalog),
      homepageSchemeId: draft.homepageSchemeId,
    };

    setModels(prev => {
      if (draft.id) return prev.map(model => model.id === draft.id ? { ...model, ...nextModel, topology: model.topology, pose: model.pose } : model);
      return [...prev, nextModel];
    });
    setActiveId(nextModel.id);
    setSelectedTopologyId('base_link');
    setModelDialogOpen(false);
    setDraft(null);
  }

  function togglePublish() {
    setEditingScene(false);
    setSoftwareDialogOpen(false);
    setAddNodeDialogOpen(false);
    setDeleteTopologyTargetId(null);
    updateActive({ status: activeModel.status === 'published' ? 'draft' : 'published' });
  }

  function confirmDelete() {
    const targetId = deleteTargetId || activeModel?.id;
    if (!targetId || models.length <= 1) return;
    const targetModel = models.find(m => m.id === targetId);
    if (targetModel?.status === 'published') return;
    const currentIndex = models.findIndex(model => model.id === targetId);
    const next = models.filter(model => model.id !== targetId);
    setModels(next);
    // If deleting the currently active model, navigate to another
    if (activeModel && activeModel.id === targetId) {
      setActiveId(next[Math.max(0, currentIndex - 1)]?.id ?? next[0]?.id ?? null);
    }
    setSelectedTopologyId('base_link');
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  }

  function exportJson() {
    const payload = {
      format: 'robot-model-config',
      version: 1,
      exportedAt: new Date().toISOString(),
      model: activeModel,
    };
    downloadText(JSON.stringify(payload, null, 2), `${safeFileName(activeModel.name)}.json`, 'application/json;charset=utf-8');
  }

  function exportUrdf() {
    downloadText(buildUrdf(activeModel), `${safeFileName(activeModel.name)}.urdf`, 'application/xml;charset=utf-8');
  }

  return (
    <div style={{
      ...robotThemeVars(themeMode),
      flex: 1,
      minWidth: 0,
      height: '100%',
      padding: 'var(--robot-page-padding)',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--robot-page)',
      color: 'var(--robot-text)',
      boxSizing: 'border-box',
      overflow: 'hidden',
      transition: 'background 0.22s ease, color 0.22s ease',
    }}>
      {publishLockToast}
      <style>{`
        .hero-detail-card {
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid var(--robot-border);
          border-radius: var(--robot-card-radius);
          background: var(--robot-surface);
          box-shadow: var(--robot-shadow-soft);
        }
        .hero-detail-card-header {
          min-height: 68px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          border-bottom: 1px solid var(--robot-border);
        }
        .hero-detail-card-title {
          flex: 1;
          margin: 0;
          color: var(--robot-heading);
          font-size: 16px;
          line-height: 24px;
          font-weight: 600;
        }
        .hero-detail-button {
          min-height: 40px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid transparent;
          border-radius: var(--robot-control-radius);
          color: var(--robot-heading);
          background: var(--robot-soft);
          font: inherit;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: background 150ms ease, border-color 150ms ease, opacity 150ms ease;
        }
        .hero-detail-button:hover { background: var(--robot-neutral-soft); }
        .hero-detail-button:active { opacity: 0.88; }
        .hero-detail-button:focus-visible { outline: 3px solid var(--robot-accent-soft); outline-offset: 2px; }
        .hero-detail-button[data-variant="primary"] { background: var(--robot-brand); color: var(--robot-accent-contrast); }
        .hero-detail-button[data-variant="primary"]:hover { background: var(--robot-accent); }
        .hero-detail-button[data-variant="secondary"] { background: var(--robot-accent-soft); color: var(--robot-accent-text); }
        .hero-detail-button[data-variant="tertiary"] { border-color: var(--robot-border); background: transparent; }
        .hero-detail-button[data-variant="ghost"] { background: transparent; }
        .hero-detail-button[data-variant="danger"] { background: var(--robot-danger-soft); color: var(--robot-danger); }
        .hero-detail-button[data-icon-only="true"] { width: 40px !important; padding: 0; }
        .hero-detail-button:disabled { cursor: not-allowed; opacity: 0.45; }
        .software-config-edit {
          width: 32px;
          height: 32px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: var(--robot-control-radius);
          background: transparent;
          color: var(--robot-muted);
          cursor: pointer;
          transition: color 180ms ease, background-color 180ms ease;
        }
        .software-config-edit:hover { color: var(--robot-accent-text); background: var(--robot-accent-soft); }
        .software-config-edit:focus-visible { outline: 3px solid var(--robot-accent-soft); outline-offset: 2px; }
        .software-config-edit:disabled,
        .hero-detail-tool-button:disabled { cursor: not-allowed; opacity: 0.4; pointer-events: none; }
        .hero-detail-chip {
          max-width: 100%;
          min-height: 24px;
          padding: 2px 10px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border-radius: 999px;
          background: var(--robot-soft);
          color: var(--robot-text);
          font-size: 12px;
          line-height: 18px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hero-detail-chip[data-tone="accent"] { background: var(--robot-accent-soft); color: var(--robot-accent-text); }
        .hero-detail-chip[data-tone="success"] { background: var(--robot-success-soft); color: var(--robot-success); }
        .hero-status-dot { width: 6px; height: 6px; flex-shrink: 0; border-radius: 99px; background: currentColor; }
        .hero-detail-chip[data-tone="danger"] { background: var(--robot-danger-soft); color: var(--robot-heading); }
        .hero-info-card { height: auto; flex: 0 0 auto; display: flex; flex-direction: column; }
        .hero-info-header {
          min-height: 84px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          border-bottom: 1px solid var(--robot-border);
        }
        .hero-model-back {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          padding: 0;
          border: 1px solid transparent;
          border-radius: var(--robot-inner-radius);
          background: var(--robot-soft);
          color: var(--robot-heading);
          cursor: pointer;
          transition: background-color 180ms ease, border-color 180ms ease;
        }
        .hero-model-back:hover { border-color: var(--robot-accent-border); background: var(--robot-neutral-soft); }
        .hero-model-back:focus-visible { outline: 3px solid var(--robot-accent-soft); outline-offset: 2px; }
        .hero-model-heading { min-width: 0; flex: 1; }
        .hero-model-heading h2 {
          margin: 0;
          overflow: hidden;
          color: var(--robot-heading);
          font-size: 20px;
          line-height: 24px;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .hero-model-heading p {
          margin: 0;
          overflow: hidden;
          color: var(--robot-muted);
          font-size: 12px;
          line-height: 18px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .hero-info-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex-shrink: 0;
        }
        .hero-model-description {
          display: -webkit-box;
          margin: 0;
          overflow: hidden;
          color: var(--robot-muted);
          font-size: 14px;
          line-height: 22px;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        .hero-homepage-row { display: flex; align-items: center; gap: 8px; min-width: 0; color: var(--robot-muted); font-size: 14px; }
        .hero-homepage-row > span:first-child { flex-shrink: 0; }
        .hero-model-actions { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; }
        .hero-updated-at { color: var(--robot-subtle); font-size: 12px; line-height: 18px; }
        .hero-software-card { min-height: 0; flex: 1; }
        .hero-software-section { min-height: 0; flex: 1; overflow: hidden; }
        .hero-scene-card { min-height: 0; padding: 16px; }
        .hero-scene-content { position: relative; min-height: 520px; flex: 1; overflow: hidden; border-radius: 12px; }
        .hero-scene-status {
          position: absolute;
          left: 24px;
          top: 24px;
          min-height: 30px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid rgba(34, 197, 94, 0.35);
          border-radius: 999px;
          background: rgba(10, 88, 41, 0.72);
          color: #32d36d;
          font-size: 12px;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }
        .hero-scene-status > span { width: 3px; height: 3px; border-radius: 99px; background: currentColor; }
        .hero-scene-telemetry {
          position: absolute;
          left: 24px;
          top: 68px;
          display: grid;
          gap: 4px;
          color: rgba(255,255,255,0.68);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 10px;
          line-height: 14px;
          letter-spacing: 0;
          pointer-events: none;
        }
        .hero-scene-export {
          position: absolute;
          right: 24px;
          top: 24px;
          width: 64px;
          height: 64px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 5px;
          border: 0;
          border-radius: 12px;
          background: rgba(255,255,255,0.11);
          color: rgba(255,255,255,0.9);
          font: inherit;
          font-size: 12px;
          cursor: pointer;
          backdrop-filter: blur(12px);
          transition: background-color 180ms ease;
        }
        .hero-scene-export:hover { background: rgba(255,255,255,0.18); }
        .hero-scene-export:focus-visible { outline: 3px solid rgba(255,255,255,0.24); outline-offset: 2px; }
        .hero-scene-tool-dock {
          position: absolute;
          left: 24px;
          bottom: 24px;
          display: grid;
          gap: 2px;
          padding: 4px;
          border: 1px solid rgba(255,255,255,0.11);
          border-radius: 12px;
          background: rgba(18,18,18,0.78);
          backdrop-filter: blur(12px);
        }
        .hero-scene-tool-dock button { width: 36px; height: 36px; display: grid; place-items: center; padding: 0; border: 0; border-radius: 8px; background: transparent; color: rgba(255,255,255,0.78); cursor: pointer; }
        .hero-scene-tool-dock button:hover,
        .hero-scene-tool-dock button[data-active="true"] { background: var(--robot-brand); color: #fff; }
        .hero-scene-tool-dock button:disabled { cursor: not-allowed; opacity: 0.4; }
        .hero-scene-tool-dock button:disabled:hover { background: transparent; color: rgba(255,255,255,0.78); }
        .hero-topology-card { min-height: 0; flex: 1 1 50%; }
        .hero-topology-node-button:focus { outline: none; }
        .hero-topology-node-button:focus-visible { border-radius: 6px; outline: 2px solid var(--robot-accent-border); outline-offset: 2px; }
        .hero-topology-content { min-height: 0; padding: 12px 16px 16px; display: flex; flex: 1; flex-direction: column; overflow: hidden; }
        .hero-topology-tree-scroll {
          min-height: 132px;
          flex: 1 1 0;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          padding-right: 4px;
          scrollbar-gutter: stable;
        }
        .hero-topology-param-panel { min-height: 0; flex: 1 1 50%; }
        .hero-topology-param-body {
          min-height: 0;
          flex: 1;
          align-content: start;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          scrollbar-gutter: stable;
        }
        .hero-readonly-interceptor {
          position: absolute;
          inset: 64px 0 0;
          z-index: 5;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
        }
        .hero-readonly-interceptor:focus-visible { outline: 3px solid var(--robot-accent-soft); outline-offset: -4px; }
        .hero-link-mesh-card { display: grid; gap: 12px; padding: 10px; border: 1px solid var(--robot-border); border-radius: var(--robot-inner-radius); background: var(--robot-soft); }
        .hero-link-mesh-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; padding: 3px; border-radius: 10px; background: var(--robot-neutral-soft); }
        .hero-link-mesh-tab { height: 28px; border: 0; border-radius: 8px; background: transparent; color: var(--robot-muted); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
        .hero-link-mesh-tab[data-active="true"] { background: var(--robot-surface); color: var(--robot-accent-text); box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08); }
        .hero-link-mesh-file-row { display: grid; grid-template-columns: minmax(0, 1fr) 40px; gap: 8px; }
        .hero-link-mesh-file-button { width: 40px; height: 40px; display: grid; place-items: center; padding: 0; border: 1px solid var(--robot-border-strong); border-radius: var(--robot-control-radius); background: var(--robot-surface); color: var(--robot-muted); cursor: pointer; }
        .hero-link-mesh-file-button:hover { border-color: var(--robot-accent-border); background: var(--robot-accent-soft); color: var(--robot-accent-text); }
        .hero-link-mesh-file-button:focus-visible, .hero-link-mesh-tab:focus-visible { outline: 3px solid var(--robot-accent-soft); outline-offset: 2px; }
        .hero-import-error { margin: 16px 16px 0; padding: 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; border-radius: var(--robot-inner-radius); background: var(--robot-danger-soft); color: var(--robot-heading); font-size: 12px; }
        .hero-detail-tool-button {
          height: 40px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          flex-shrink: 0;
          border: 1px solid var(--robot-border-strong);
          border-radius: var(--robot-control-radius);
          background: var(--robot-surface);
          color: var(--robot-heading);
          font: inherit;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease;
        }
        .hero-detail-tool-button:hover,
        .hero-detail-tool-button[data-active="true"] {
          border-color: var(--robot-accent-border);
          background: var(--robot-accent-soft);
          color: var(--robot-accent-text);
        }
        .hero-detail-tool-button[data-icon-only="true"] { width: 40px; padding: 0; }
        .hero-detail-tool-button:focus-visible { outline: 3px solid var(--robot-accent-soft); outline-offset: 2px; }
        .hero-detail-model-menu { min-width: 184px !important; }
        .hero-detail-button[data-state="open"] { background: var(--robot-accent-soft); color: var(--robot-accent-text); }
        .robot-detail-main { overflow: hidden; }
        .robot-detail-grid {
          display: grid;
          grid-template-columns: 330px minmax(560px, 1fr) 330px;
          gap: var(--robot-section-gap);
          min-height: 0;
          flex: 1;
          overflow: hidden;
        }
        .robot-detail-left,
        .robot-detail-right { min-width: 0; min-height: 0; display: flex; flex-direction: column; gap: var(--robot-section-gap); overflow: hidden; }
        @media (max-width: 1540px) {
          .robot-detail-grid { grid-template-columns: 300px minmax(520px, 1fr) 300px; }
        }
        @media (max-width: 1240px) {
          .robot-detail-main { overflow-y: auto; padding-right: 4px; }
          .robot-detail-grid {
            grid-template-columns: minmax(280px, 0.8fr) minmax(420px, 1.2fr);
            grid-auto-rows: minmax(680px, auto);
            overflow: visible;
          }
          .robot-detail-right { grid-column: 1 / -1; min-height: 720px; display: grid; grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 860px) {
          .robot-detail-grid { grid-template-columns: minmax(0, 1fr); }
          .robot-detail-right { grid-column: auto; display: flex; }
        }
      `}</style>
      <main className="robot-detail-main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Content grid: 3 columns */}
        <div className="robot-detail-grid">
          <div className="robot-detail-left">
            <section className="hero-detail-card hero-info-card">
            <header className="hero-info-header">
              <button type="button" className="hero-model-back" onClick={() => setActiveId(null)} aria-label="返回型号库" title="返回型号库">
                <ArrowLeft size={20} />
              </button>
              <div className="hero-model-heading">
                <h2>{activeModel.name}</h2>
                <p>{activeModel.type}</p>
              </div>
              <HeroChip tone={activeModel.status === 'published' ? 'success' : 'default'}>
                <span className="hero-status-dot" />
                {STATUS_META[activeModel.status].label}
              </HeroChip>
            </header>

            <div className="hero-info-content">
              {activeModel.description && (
                <p className="hero-model-description">{activeModel.description}</p>
              )}

              <div className="hero-homepage-row">
                <span>关联首页</span>
                {activeModel.homepageSchemeId ? (
                  <HeroChip tone="accent">
                    <LayoutGrid size={14} />
                    {INITIAL_SCHEMES.find(s => s.id === activeModel.homepageSchemeId)?.name ?? activeModel.homepageSchemeId}
                  </HeroChip>
                ) : (
                  <span>未指定</span>
                )}
              </div>

              <div className="hero-model-actions">
                <HeroButton variant="primary" fullWidth title={modelReadOnly ? '取消发布后可编辑信息' : '编辑信息'} onPress={modelReadOnly ? notifyPublishLock : openEditDialog}>
                  <Pencil size={16} />编辑信息
                </HeroButton>
                <HeroButton variant={activeModel.status === 'published' ? 'tertiary' : 'primary'} fullWidth onPress={togglePublish}>
                  <CheckCircle2 size={16} />{activeModel.status === 'published' ? '取消发布' : '发布'}
                </HeroButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="hero-detail-button" data-variant="ghost" data-icon-only="true" aria-label="更多型号操作"><MoreHorizontal size={18} /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8} collisionPadding={12} className="heroui-tree-menu hero-detail-model-menu">
                    <DropdownMenuItem className="heroui-tree-menu__item" onSelect={exportUrdf}><FileCode2 size={16} />导出 URDF</DropdownMenuItem>
                    <DropdownMenuItem className="heroui-tree-menu__item" onSelect={exportJson}><FileJson size={16} />导出 JSON</DropdownMenuItem>
                    <DropdownMenuSeparator className="heroui-tree-menu__separator" />
                    <DropdownMenuItem
                      className="heroui-tree-menu__item"
                      variant="destructive"
                      disabled={!modelReadOnly && models.length <= 1}
                      onSelect={() => {
                        if (modelReadOnly) {
                          notifyPublishLock();
                          return;
                        }
                        setDeleteTargetId(activeModel.id);
                        setDeleteDialogOpen(true);
                      }}
                    ><Trash2 size={16} />删除型号</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            </section>

            <section className="hero-detail-card hero-software-card">
              <div className="hero-software-section">
              <SoftwareVersionPanel
                catalog={softwareCatalog}
                selectionIds={activeModel.softwareSelectionIds}
                onConfigure={() => setSoftwareDialogOpen(true)}
                readOnly={modelReadOnly}
                onReadOnlyAttempt={notifyPublishLock}
              />
              </div>
            </section>
          </div>

          <RobotScene
            model={activeModel}
            editing={editingScene}
            readOnly={modelReadOnly}
            onToggleEditing={() => setEditingScene(prev => !prev)}
            onPoseChange={pose => updateActive({ pose })}
            onExport={exportUrdf}
            onReadOnlyAttempt={notifyPublishLock}
          />

          <div className="robot-detail-right">
            <section className="hero-detail-card hero-topology-card robot-topology-card">
            <header className="hero-detail-card-header">
              <h3 className="hero-detail-card-title">设备结构</h3>
            </header>
            <div className="hero-topology-content">
              <DeviceStructureTree nodes={activeDeviceStructure} selectedId={selectedDeviceNode?.id ?? ''} onSelect={setSelectedDeviceId} />
            </div>
            </section>

            {selectedDeviceNode && (
              <DeviceStructureParamPanel
                node={selectedDeviceNode}
                onChange={updateSelectedDeviceNode}
                readOnly={modelReadOnly}
                onReadOnlyAttempt={notifyPublishLock}
              />
            )}
          </div>
        </div>
      </main>

      <SoftwareVersionDialog
        catalog={softwareCatalog}
        open={softwareDialogOpen}
        selectionIds={activeModel.softwareSelectionIds}
        onOpenChange={setSoftwareDialogOpen}
        onSave={saveSoftwareSelections}
      />

      {/* Add Topology Node Dialog */}
      <ArcoModal
        open={addNodeDialogOpen}
        onOpenChange={open => {
          setAddNodeDialogOpen(open);
          if (!open) setAddNodeAsRoot(false);
        }}
        scope="robot"
        title={addNodeAsRoot ? '添加根 Link' : `添加${topologyKindMeta(newNodeKind).label}节点`}
        size="sm"
        footer={(
          <>
            <ArcoButton scope="robot" onClick={() => { setAddNodeDialogOpen(false); setAddNodeAsRoot(false); }}>取消</ArcoButton>
            <ArcoButton scope="robot" type="primary" onClick={handleAddTopologyNode} disabled={!newNodeLabel.trim()}>添加</ArcoButton>
          </>
        )}
      >
            <div style={{ display: 'grid', gap: 12 }}>
              <ArcoField label="节点名称">
                <ArcoTextInput
                  scope="robot"
                  value={newNodeLabel}
                  onChange={e => setNewNodeLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddTopologyNode(); }}
                  placeholder={addNodeAsRoot
                    ? '例如: left_arm_base_link'
                    : newNodeKind === 'link'
                      ? '例如: forearm_link'
                      : newNodeKind === 'joint'
                        ? '例如: elbow_joint'
                        : '例如: forearm_visual_mesh'}
                  autoFocus
                />
              </ArcoField>
              {(() => {
                if (addNodeAsRoot) {
                  return (
                    <div style={{ padding: '10px 12px', borderRadius: 'var(--robot-inner-radius)', background: 'var(--robot-soft)', color: 'var(--robot-subtle)', fontSize: 12, lineHeight: 1.6 }}>
                      将创建一个独立根 Link。双臂模型也可在同一根 Link 下分别新增左、右两条 Joint → Link 分支。
                    </div>
                  );
                }
                const targetNode = findTopologyNode(activeModel.topology, addTargetId);
                return targetNode ? (
                  <div style={{ padding: '10px 12px', borderRadius: 'var(--robot-inner-radius)', background: 'var(--robot-soft)', color: 'var(--robot-subtle)', fontSize: 12, lineHeight: 1.6 }}>
                    将在 <strong style={{ color: 'var(--robot-accent-text)' }}>{targetNode.label}</strong> 下新增{topologyKindMeta(newNodeKind).label}。
                    {targetNode.kind === 'link'
                      ? newNodeKind === 'mesh'
                        ? ' 同一个 Link 可挂载多个 Visual 或 Collision Mesh。'
                        : ' Link 可同时包含 Mesh 与 Joint 分支。'
                      : ' Joint 下级为 Link。'}
                  </div>
                ) : null;
              })()}
            </div>
      </ArcoModal>

      <ArcoModal
        open={deleteTopologyTargetId !== null}
        onOpenChange={open => { if (!open) setDeleteTopologyTargetId(null); }}
        scope="robot"
        title="删除结构节点"
        status="danger"
        size="sm"
        footer={(
          <>
            <ArcoButton scope="robot" onClick={() => setDeleteTopologyTargetId(null)}>取消</ArcoButton>
            <ArcoButton scope="robot" type="primary" status="danger" onClick={() => {
              if (deleteTopologyTargetId) handleDeleteTopologyNode(deleteTopologyTargetId);
              setDeleteTopologyTargetId(null);
            }}>确认删除</ArcoButton>
          </>
        )}
      >
        {deleteTopologyTargetId && (() => {
          const targetNode = findTopologyNode(activeModel.topology, deleteTopologyTargetId);
          if (!targetNode) return null;
          const descendantCount = flattenTopology(targetNode.children ?? []).length;
          return (
            <p style={{ margin: 0, color: 'var(--robot-muted)', fontSize: 14, lineHeight: 1.7 }}>
              确认删除「<strong style={{ color: 'var(--robot-heading)' }}>{targetNode.label}</strong>」吗？
              {descendantCount > 0 ? ` 其下 ${descendantCount} 个下级节点也会同时删除。` : ' 此操作不会影响其他结构节点。'}
            </p>
          );
        })()}
      </ArcoModal>

      <ArcoModal
        open={modelDialogOpen}
        onOpenChange={setModelDialogOpen}
        scope="robot"
        title={draft?.id ? '编辑机器人型号' : '新建机器人型号'}
        size="md"
        footer={(
          <>
            <ArcoButton scope="robot" onClick={() => setModelDialogOpen(false)}>取消</ArcoButton>
            <ArcoButton scope="robot" type="primary" icon={<Save size={14} />} onClick={saveDraft}>保存</ArcoButton>
          </>
        )}
      >
            {draft && (
              <div style={{ display: 'grid', gap: 12 }}>
                <ArcoField label="型号名称">
                  <ArcoTextInput scope="robot" value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} />
                </ArcoField>
                <ArcoField label="描述">
                  <ArcoTextArea scope="robot" value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} placeholder="简要描述该型号的用途、场景与特点…" />
                </ArcoField>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <ArcoField label="类型">
                    <ArcoSelect scope="robot" value={draft.type} onChange={event => setDraft({ ...draft, type: event.target.value })}>
                      {ROBOT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </ArcoSelect>
                  </ArcoField>
                  <ArcoField label="发布状态">
                    <ArcoSelect scope="robot" value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value as PublishStatus })}>
                      <option value="draft">未发布</option>
                      <option value="published">已发布</option>
                    </ArcoSelect>
                  </ArcoField>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <ArcoField label="维护账号">
                    <ArcoTextInput scope="robot" value={draft.ownerAccount} onChange={event => setDraft({ ...draft, ownerAccount: event.target.value })} />
                  </ArcoField>
                  <ArcoField label="版本">
                    <ArcoTextInput scope="robot" value={draft.version} onChange={event => setDraft({ ...draft, version: event.target.value })} />
                  </ArcoField>
                </div>
                <ArcoField label="组件数量">
                  <ArcoTextInput scope="robot" type="number" min={1} value={draft.componentCount} onChange={event => setDraft({ ...draft, componentCount: Number(event.target.value) || 1 })} />
                </ArcoField>
                <ArcoField label="挂载外设">
                  <ArcoTextArea scope="robot" value={draft.peripheralsText} onChange={event => setDraft({ ...draft, peripheralsText: event.target.value })} />
                </ArcoField>
                <ArcoField label="关联首页">
                  <ArcoSelect scope="robot" value={draft.homepageSchemeId ?? ''} onChange={event => setDraft({ ...draft, homepageSchemeId: event.target.value || undefined })}>
                    <option value="">— 不关联 —</option>
                    {INITIAL_SCHEMES.map(scheme => (
                      <option key={scheme.id} value={scheme.id}>{scheme.name} ({scheme.version})</option>
                    ))}
                  </ArcoSelect>
                </ArcoField>
              </div>
            )}
      </ArcoModal>

      {deleteModal}
    </div>
  );
}

function ComponentChassisScene() {
  return (
    <section className="component-library-card component-library-scene">
      <div className="component-library-scene__viewport">
        <svg viewBox="0 0 760 540" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs>
            <linearGradient id="component-scene-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--robot-scene-top)" />
              <stop offset="100%" stopColor="var(--robot-scene-bottom)" />
            </linearGradient>
            <filter id="component-chassis-shadow"><feGaussianBlur stdDeviation="4" /></filter>
          </defs>
          <rect width="760" height="540" fill="url(#component-scene-bg)" />
          {Array.from({ length: 14 }).map((_, index) => {
            const y = 272 + index * 22;
            const spread = index * 28;
            return <line key={`component-grid-h-${index}`} x1={110 - spread} y1={y} x2={650 + spread} y2={y} stroke="var(--robot-scene-muted)" strokeWidth="1" />;
          })}
          {Array.from({ length: 15 }).map((_, index) => <line key={`component-grid-v-${index}`} x1="380" y1="252" x2={76 + index * 44} y2="530" stroke="var(--robot-scene-muted)" strokeWidth="1" />)}
          <ellipse cx="382" cy="444" rx="185" ry="34" fill="#05070d" opacity="0.45" filter="url(#component-chassis-shadow)" />
          <g transform="translate(382 300)">
            <path d="M-156 48 L-102 -6 L105 -6 L160 48 L126 112 L-126 112 Z" fill="var(--robot-soft)" stroke="var(--robot-accent-border)" strokeWidth="3" />
            <path d="M-102 -6 L-56 -50 L64 -50 L105 -6 Z" fill="var(--robot-accent-soft)" stroke="var(--robot-accent-border)" strokeWidth="3" />
            <rect x="-118" y="44" width="236" height="44" rx="8" fill="var(--robot-surface)" stroke="var(--robot-border-strong)" strokeWidth="2" />
            <rect x="-92" y="58" width="78" height="15" rx="4" fill="var(--robot-accent)" opacity="0.88" />
            <rect x="18" y="58" width="74" height="15" rx="4" fill="var(--robot-accent)" opacity="0.88" />
            {[-108, 108].map(x => <g key={x}><circle cx={x} cy="116" r="28" fill="#10141f" stroke="var(--robot-accent-border)" strokeWidth="3" /><circle cx={x} cy="116" r="13" fill="var(--robot-accent)" opacity="0.8" /></g>)}
            <rect x="-39" y="-38" width="78" height="26" rx="6" fill="var(--robot-accent)" opacity="0.72" />
          </g>
          <g transform="translate(672 468)">
            <line x1="0" y1="0" x2="52" y2="0" stroke="var(--robot-axis-x)" strokeWidth="3" />
            <line x1="0" y1="0" x2="0" y2="-52" stroke="var(--robot-axis-y)" strokeWidth="3" />
            <line x1="0" y1="0" x2="-34" y2="-30" stroke="var(--robot-axis-z)" strokeWidth="3" />
            <text x="58" y="5" fill="var(--robot-axis-x)" fontSize="12" fontWeight="700">X</text><text x="-8" y="-59" fill="var(--robot-axis-y)" fontSize="12" fontWeight="700">Y</text><text x="-48" y="-34" fill="var(--robot-axis-z)" fontSize="12" fontWeight="700">Z</text>
          </g>
        </svg>
        <div className="component-library-scene__status">3D预览 <span /> 仙工底盘</div>
        <div className="component-library-scene__telemetry">X / Y / Z<br />0.000 / 0.000 / 0.000<br /><br />RX / RY / RZ<br />0.000 / 0.000 / 0.000</div>
      </div>
    </section>
  );
}

export function RobotComponentLibrary({ themeMode }: { themeMode?: ThemeMode }) {
  const activeTheme = themeMode ?? initialThemeMode();
  const [topology, setTopology] = useState<TopologyNode[]>(() => mcrTopology());
  const [selectedId, setSelectedId] = useState('base_link');
  const [config, setConfig] = useState({ driver: '', payload: '', wheelbase: '', length: '', width: '', height: '' });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addTargetId, setAddTargetId] = useState('base_link');
  const [addAsRoot, setAddAsRoot] = useState(false);
  const [nodeKind, setNodeKind] = useState<TopologyKind>('link');
  const [nodeLabel, setNodeLabel] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [urdfImportOpen, setUrdfImportOpen] = useState(false);
  const [urdfImportStep, setUrdfImportStep] = useState<'upload' | 'preview'>('upload');
  const [pendingUrdfTopology, setPendingUrdfTopology] = useState<TopologyNode[] | null>(null);
  const [pendingUrdfFileName, setPendingUrdfFileName] = useState('');
  const [urdfImportError, setUrdfImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // HeroUI modals render in a portal, so the robot tokens must also be available on the document root.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    Object.entries(ROBOT_THEME_VARS[activeTheme]).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [activeTheme]);

  const selectedNode = useMemo(
    () => findTopologyNode(topology, selectedId) ?? topology[0] ?? null,
    [topology, selectedId],
  );

  function updateNode(patch: Partial<TopologyNode>) {
    if (!selectedNode) return;
    setTopology(current => updateTopologyNode(current, selectedNode.id, patch));
  }

  function openAdd(parentId?: string, kind: TopologyKind = 'link') {
    setAddAsRoot(!parentId);
    setAddTargetId(parentId ?? '');
    setNodeKind(parentId ? kind : 'link');
    setNodeLabel(parentId ? (kind === 'joint' ? 'new_joint' : kind === 'mesh' ? 'new_mesh' : 'new_link') : 'new_base_link');
    setAddDialogOpen(true);
  }

  function confirmAdd() {
    const label = nodeLabel.trim();
    if (!label) return;
    const target = addAsRoot ? null : findTopologyNode(topology, addTargetId);
    if (!addAsRoot && (!target || !canAddTopologyChildKind(target.kind, nodeKind))) return;
    const node: TopologyNode = {
      id: topoUid(), label, kind: addAsRoot ? 'link' : nodeKind, origin: { ...DEFAULT_ORIGIN }, children: [],
      ...(nodeKind === 'joint' ? { jointType: 'revolute' as JointType, axis: { ...DEFAULT_AXIS }, limit: { ...DEFAULT_LIMIT } } : {}),
      ...(nodeKind === 'mesh' ? { meshRole: 'visual' as MeshRole, mesh: { filename: '', scale: { ...DEFAULT_MESH_SCALE }, origin: { ...DEFAULT_ORIGIN } } } : {}),
    };
    setTopology(current => addAsRoot ? [...current, node] : addTopologyChild(current, addTargetId, node));
    setSelectedId(node.id);
    setAddDialogOpen(false);
  }

  function openUrdfImport() {
    setUrdfImportStep('upload');
    setPendingUrdfTopology(null);
    setPendingUrdfFileName('');
    setUrdfImportError(null);
    setUrdfImportOpen(true);
  }

  function stageUrdfImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUrdfImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const { links, joints } = parseUrdf(String(reader.result));
        const parsed = urdfToTopology(links, joints);
        if (!parsed.length) throw new Error('未识别到 Link 或 Joint 结构');
        setPendingUrdfTopology(parsed);
        setPendingUrdfFileName(file.name);
      } catch (error) {
        setPendingUrdfTopology(null);
        setPendingUrdfFileName('');
        setUrdfImportError(error instanceof Error ? error.message : 'URDF 文件解析失败');
      }
    };
    reader.onerror = () => setUrdfImportError('文件读取失败');
    reader.readAsText(file);
  }

  function confirmUrdfImport() {
    if (!pendingUrdfTopology?.length) return;
    setTopology(pendingUrdfTopology);
    setSelectedId(pendingUrdfTopology[0].id);
    setUrdfImportOpen(false);
  }

  function renderUrdfPreview(nodes: TopologyNode[], depth = 0) {
    return nodes.map(node => {
      const meta = topologyKindMeta(node.kind);
      return (
        <div key={node.id}>
          <div className="component-library-import-preview__node" style={{ paddingLeft: 14 + depth * 18 }}>
            <span className="component-library-import-preview__branch">{depth ? '└' : '•'}</span>
            <span className="component-library-import-preview__name">{node.label}</span>
            <span className="component-library-import-preview__kind">{meta.label}</span>
          </div>
          {node.children?.length ? renderUrdfPreview(node.children, depth + 1) : null}
        </div>
      );
    });
  }

  return (
    <div style={{ ...robotThemeVars(activeTheme), flex: 1, minWidth: 0, height: '100%', padding: 'var(--robot-page-padding)', display: 'flex', flexDirection: 'column', background: 'var(--robot-page)', color: 'var(--robot-text)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <style>{`
        .component-library-grid { display: grid; grid-template-columns: 320px minmax(560px, 1fr) 330px; gap: var(--robot-section-gap); min-height: 0; flex: 1; overflow: hidden; }
        .component-library-card { min-width: 0; min-height: 0; overflow: hidden; border: 1px solid var(--robot-border); border-radius: var(--robot-card-radius); background: var(--robot-surface); box-shadow: var(--robot-shadow-soft); }
        .component-library-card__header { min-height: 64px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--robot-border); }
        .component-library-card__header h1, .component-library-card__header h2 { margin: 0; color: var(--robot-heading); font-size: 16px; line-height: 24px; font-weight: 600; }
        .component-library-left { min-width: 0; min-height: 0; display: flex; flex-direction: column; gap: var(--robot-section-gap); overflow: hidden; }
        .component-library-info { flex: 0 0 312px; display: flex; flex-direction: column; }
        .component-library-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 14px 16px 16px; }
        .component-library-meta > div { grid-column: 1 / -1; }
        .component-library-meta label { display: grid; gap: 6px; color: var(--robot-muted); font-size: 12px; font-weight: 500; }
        .component-library-meta strong { min-height: 40px; padding: 0 12px; display: flex; align-items: center; border-radius: var(--robot-control-radius); background: var(--robot-soft); color: var(--robot-heading); font-size: 14px; font-weight: 500; }
        .component-library-parameter { min-height: 0; flex: 1; display: flex; flex-direction: column; }
        .component-library-parameter__body { min-height: 0; flex: 1; overflow-y: auto; padding: 16px; display: grid; align-content: start; gap: 20px; }
        .component-library-parameter__section { display: grid; gap: 12px; }
        .component-library-parameter__section h3 { margin: 0; color: var(--robot-heading); font-size: 14px; line-height: 22px; font-weight: 600; }
        .component-library-parameter__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .component-library-parameter__grid label { display: grid; gap: 6px; color: var(--robot-muted); font-size: 12px; font-weight: 500; }
        .component-library-footer { min-height: 72px; padding: 12px 16px; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--robot-border); }
        .component-library-scene { min-height: 0; padding: 12px; display: flex; }
        .component-library-scene__viewport { position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: 12px; background: var(--robot-scene-bg); }
        .component-library-scene__status { position: absolute; top: 18px; left: 18px; min-height: 28px; padding: 0 10px; display: inline-flex; align-items: center; gap: 7px; border-radius: 999px; background: var(--robot-success-soft); color: var(--robot-success); font-size: 12px; font-weight: 600; }
        .component-library-scene__status span { width: 4px; height: 4px; border-radius: 99px; background: currentColor; }
        .component-library-scene__telemetry { position: absolute; top: 56px; left: 18px; color: var(--robot-hud-text); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; line-height: 18px; opacity: 0.84; }
        .component-library-tree { min-height: 0; display: flex; flex-direction: column; }
        .component-library-tree__body { min-height: 0; flex: 1; overflow: hidden; }
        .component-library-tree .hero-topology-tree-scroll { height: 100%; overflow-y: auto; padding: 10px 12px; }
        .component-library-tree .hero-topology-node-button:focus-visible { outline: 2px solid var(--robot-accent-border); outline-offset: 2px; border-radius: 4px; }
        .component-library-right { min-height: 0; display: flex; flex-direction: column; gap: var(--robot-section-gap); }
        .component-library-right .hero-topology-param-panel { flex: 1; }
        .component-library-import-steps { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 18px; }
        .component-library-import-step { min-height: 40px; padding: 0 12px; display: flex; align-items: center; gap: 8px; border-radius: var(--robot-control-radius); background: var(--robot-soft); color: var(--robot-muted); font-size: 14px; font-weight: 500; }
        .component-library-import-step[data-active="true"] { background: var(--robot-accent-soft); color: var(--robot-accent-text); }
        .component-library-import-step__index { width: 20px; height: 20px; display: inline-grid; place-items: center; border-radius: 999px; background: currentColor; color: var(--robot-surface); font-size: 12px; font-weight: 700; }
        .component-library-import-upload { min-height: 164px; padding: 24px; display: grid; place-items: center; align-content: center; gap: 8px; border: 1px dashed var(--robot-border-strong); border-radius: var(--robot-inner-radius); background: var(--robot-soft); color: var(--robot-muted); cursor: pointer; text-align: center; }
        .component-library-import-upload:hover { border-color: var(--robot-accent-border); background: var(--robot-accent-soft); color: var(--robot-accent-text); }
        .component-library-import-upload strong { color: var(--robot-heading); font-size: 14px; font-weight: 600; }
        .component-library-import-upload span { font-size: 12px; }
        .component-library-import-file { min-height: 40px; margin-top: 12px; padding: 0 12px; display: flex; align-items: center; gap: 8px; border: 1px solid var(--robot-border); border-radius: var(--robot-control-radius); background: var(--robot-surface); color: var(--robot-text); font-size: 14px; }
        .component-library-import-file__name { min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .component-library-import-file__status { padding: 2px 8px; border-radius: 999px; background: var(--robot-success-soft); color: var(--robot-success); font-size: 12px; font-weight: 600; }
        .component-library-import-error { margin: 10px 0 0; color: var(--robot-danger); font-size: 12px; line-height: 18px; }
        .component-library-import-summary { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .component-library-import-summary span { min-height: 28px; padding: 0 10px; display: inline-flex; align-items: center; border-radius: 999px; background: var(--robot-soft); color: var(--robot-muted); font-size: 12px; }
        .component-library-import-preview { max-height: 320px; overflow: auto; border: 1px solid var(--robot-border); border-radius: var(--robot-inner-radius); background: var(--robot-surface); padding: 8px 0; }
        .component-library-import-preview__node { min-height: 34px; padding-right: 12px; display: flex; align-items: center; gap: 8px; color: var(--robot-text); font-size: 14px; }
        .component-library-import-preview__branch { width: 12px; color: var(--robot-muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        .component-library-import-preview__name { min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .component-library-import-preview__kind { padding: 2px 8px; border-radius: 999px; background: var(--robot-accent-soft); color: var(--robot-accent-text); font-size: 12px; }
        @media (max-width: 1240px) { .component-library-grid { grid-template-columns: 300px minmax(380px, 1fr); overflow-y: auto; } .component-library-right { grid-column: 1 / -1; min-height: 680px; display: grid; grid-template-columns: 1fr 1fr; } }
        @media (max-width: 760px) { .component-library-grid { grid-template-columns: minmax(0, 1fr); } .component-library-right { grid-column: auto; display: flex; } }
      `}</style>

      <div className="component-library-grid">
        <div className="component-library-left">
        <section className="component-library-card component-library-info">
          <header className="component-library-card__header"><Box size={18} color="var(--robot-accent)" /><h1>组件库</h1></header>
          <div className="component-library-meta">
            <div style={{ padding: 12, borderRadius: 'var(--robot-inner-radius)', background: 'var(--robot-accent-soft)', color: 'var(--robot-accent-text)', fontSize: 14, fontWeight: 600 }}>仙工底盘</div>
            <label>名称<strong>仙工底盘</strong></label>
            <label>标识<strong>xiangong-base</strong></label>
            <label>类型<strong>底盘</strong></label>
            <label>描述<strong>-</strong></label>
            <label>子类型<strong>仙工</strong></label>
          </div>
        </section>

        <section className="component-library-card component-library-parameter">
          <header className="component-library-card__header"><h2>参数配置</h2></header>
          <div className="component-library-parameter__body">
            <div className="component-library-parameter__section">
              <h3>底盘参数</h3>
              <div className="component-library-parameter__grid">
                <label>驱动形式<ArcoTextInput scope="robot" value={config.driver} onChange={event => setConfig(current => ({ ...current, driver: event.target.value }))} placeholder="-" /></label>
                <label>最大负载（kg）<ArcoTextInput scope="robot" value={config.payload} onChange={event => setConfig(current => ({ ...current, payload: event.target.value }))} placeholder="-" /></label>
                <label>轴距（mm）<ArcoTextInput scope="robot" value={config.wheelbase} onChange={event => setConfig(current => ({ ...current, wheelbase: event.target.value }))} placeholder="-" /></label>
              </div>
            </div>
            <div className="component-library-parameter__section">
              <h3>尺寸</h3>
              <div className="component-library-parameter__grid">
                <label>长（mm）<ArcoTextInput scope="robot" value={config.length} onChange={event => setConfig(current => ({ ...current, length: event.target.value }))} placeholder="-" /></label>
                <label>宽（mm）<ArcoTextInput scope="robot" value={config.width} onChange={event => setConfig(current => ({ ...current, width: event.target.value }))} placeholder="-" /></label>
                <label>高（mm）<ArcoTextInput scope="robot" value={config.height} onChange={event => setConfig(current => ({ ...current, height: event.target.value }))} placeholder="-" /></label>
              </div>
            </div>
          </div>
          <footer className="component-library-footer">
            <ArcoButton scope="robot" onClick={() => { setConfig({ driver: '', payload: '', wheelbase: '', length: '', width: '', height: '' }); setTopology(mcrTopology()); setSelectedId('base_link'); }}>取消</ArcoButton>
            <ArcoButton scope="robot" type="primary" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1600); }}>{saved ? '已保存' : '保存'}</ArcoButton>
          </footer>
        </section>
        </div>

        <ComponentChassisScene />

        <div className="component-library-right">
          <section className="component-library-card component-library-tree">
            <header className="component-library-card__header">
              <h2 style={{ flex: 1 }}>模型结构</h2>
              <input ref={fileInputRef} type="file" accept=".urdf,.xml" onChange={stageUrdfImport} style={{ display: 'none' }} />
              <button type="button" className="hero-detail-tool-button" data-icon-only="true" aria-label="新增根 Link" title="新增根 Link" onClick={() => openAdd()}><Plus size={16} /></button>
              <button type="button" className="hero-detail-tool-button" data-icon-only="true" aria-label="导入 URDF" title="导入 URDF" onClick={openUrdfImport}><FileCode2 size={16} /></button>
            </header>
            <div className="component-library-tree__body">
              <TopologyTree
                nodes={topology}
                selectedId={selectedNode?.id ?? ''}
                onSelect={setSelectedId}
                onRename={(id, label) => setTopology(current => renameTopologyNode(current, id, label))}
                onAddChild={openAdd}
                onDelete={setDeleteTargetId}
                onMove={(draggedId, targetId, position) => { setTopology(current => moveTopologyNode(current, draggedId, targetId, position)); setSelectedId(draggedId); }}
                onReadOnlyAttempt={() => {}}
              />
            </div>
          </section>
          {selectedNode && <TopologyParamPanel node={selectedNode} onChange={updateNode} readOnly={false} onReadOnlyAttempt={() => {}} />}
        </div>
      </div>

      <ArcoModal open={addDialogOpen} onOpenChange={setAddDialogOpen} scope="robot" title={addAsRoot ? '添加根 Link' : `添加${topologyKindMeta(nodeKind).label}节点`} size="sm" footer={<><ArcoButton scope="robot" onClick={() => setAddDialogOpen(false)}>取消</ArcoButton><ArcoButton scope="robot" type="primary" onClick={confirmAdd} disabled={!nodeLabel.trim()}>添加</ArcoButton></>}>
        <ArcoField label="节点名称"><ArcoTextInput scope="robot" value={nodeLabel} onChange={event => setNodeLabel(event.target.value)} autoFocus /></ArcoField>
      </ArcoModal>
      <ArcoModal open={deleteTargetId !== null} onOpenChange={open => { if (!open) setDeleteTargetId(null); }} scope="robot" status="danger" title="删除结构节点" size="sm" footer={<><ArcoButton scope="robot" onClick={() => setDeleteTargetId(null)}>取消</ArcoButton><ArcoButton scope="robot" type="primary" status="danger" onClick={() => { if (deleteTargetId) { setTopology(current => removeTopologyNode(current, deleteTargetId)); setSelectedId('base_link'); } setDeleteTargetId(null); }}>删除</ArcoButton></>}>
        <p style={{ margin: 0, color: 'var(--robot-muted)', fontSize: 14 }}>确认删除该结构节点吗？其下级节点会一并移除。</p>
      </ArcoModal>
      <ArcoModal
        open={urdfImportOpen}
        onOpenChange={open => { if (!open) setUrdfImportOpen(false); }}
        scope="robot"
        title="导入 URDF"
        size="md"
        footer={urdfImportStep === 'upload' ? <>
          <ArcoButton scope="robot" onClick={() => setUrdfImportOpen(false)}>取消</ArcoButton>
          <ArcoButton scope="robot" type="primary" disabled={!pendingUrdfTopology?.length} onClick={() => setUrdfImportStep('preview')}>下一步</ArcoButton>
        </> : <>
          <ArcoButton scope="robot" onClick={() => setUrdfImportStep('upload')}>重新上传</ArcoButton>
          <ArcoButton scope="robot" type="primary" onClick={confirmUrdfImport}>确认导入</ArcoButton>
        </>}
      >
        <div className="component-library-import-steps" aria-label="导入步骤">
          <div className="component-library-import-step" data-active={urdfImportStep === 'upload'}><span className="component-library-import-step__index">1</span>上传文件</div>
          <div className="component-library-import-step" data-active={urdfImportStep === 'preview'}><span className="component-library-import-step__index">2</span>预览结构</div>
        </div>
        {urdfImportStep === 'upload' ? <>
          <button type="button" className="component-library-import-upload" onClick={() => fileInputRef.current?.click()}>
            <FileUp size={22} />
            <strong>选择 URDF 文件</strong>
            <span>支持 .urdf、.xml 文件，解析后进入结构预览</span>
          </button>
          {pendingUrdfFileName ? <div className="component-library-import-file"><FileCode2 size={16} color="var(--robot-accent)" /><span className="component-library-import-file__name">{pendingUrdfFileName}</span><span className="component-library-import-file__status">已解析</span></div> : null}
          {urdfImportError ? <p className="component-library-import-error">{urdfImportError}</p> : null}
        </> : pendingUrdfTopology ? (() => {
          const nodes = flattenTopology(pendingUrdfTopology);
          const links = nodes.filter(node => node.kind === 'link').length;
          const joints = nodes.filter(node => node.kind === 'joint').length;
          const meshes = nodes.filter(node => node.kind === 'mesh').length;
          return <>
            <div className="component-library-import-file"><FileCode2 size={16} color="var(--robot-accent)" /><span className="component-library-import-file__name">{pendingUrdfFileName}</span><span className="component-library-import-file__status">等待导入</span></div>
            <div className="component-library-import-summary"><span>{links} 个 Link</span><span>{joints} 个 Joint</span><span>{meshes} 个 Mesh</span></div>
            <div className="component-library-import-preview">{renderUrdfPreview(pendingUrdfTopology)}</div>
          </>;
        })() : null}
      </ArcoModal>
    </div>
  );
}
