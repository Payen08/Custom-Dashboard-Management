import { useEffect, useMemo, useState } from 'react';
import {
  Box, CheckCircle2, ChevronRight, FileCode2, FileJson, GitBranch,
  Pencil, Plus, RefreshCw, Save, Search, SlidersHorizontal, Trash2, X,
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
} from './ArcoLike';
import { ROBOT_THEME_VARS, type ThemeMode } from '../theme';

type PublishStatus = 'published' | 'draft';
type TopologyKind = 'link' | 'joint';
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

interface TopologyNode {
  id: string;
  label: string;
  kind: TopologyKind;
  origin?: OriginPose;
  axis?: Vector3;
  jointType?: JointType;
  limit?: JointLimit;
  children?: TopologyNode[];
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
  totalCount: number;
  groups: SoftwareVersionGroup[];
}

interface RobotModel {
  id: string;
  name: string;
  type: string;
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
}

interface RobotDraft {
  id?: string;
  name: string;
  type: string;
  ownerAccount: string;
  status: PublishStatus;
  version: string;
  componentCount: number;
  peripheralsText: string;
}

const ROBOT_TYPES = ['复合机器人', '人形双足机器人', 'AGV搬运机器人', '巡检机器人'];

const STATUS_META: Record<PublishStatus, { label: string; color: string; bg: string; border: string }> = {
  published: { label: '已发布', color: 'var(--robot-success)', bg: 'var(--robot-success-soft)', border: 'var(--robot-success-border)' },
  draft: { label: '未发布', color: 'var(--robot-muted)', bg: 'var(--robot-soft)', border: 'var(--robot-border-strong)' },
};

const DEFAULT_ORIGIN: OriginPose = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
const DEFAULT_AXIS: Vector3 = { x: 0, y: 0, z: 1 };
const DEFAULT_LIMIT: JointLimit = { lower: -180, upper: 180, effort: 80, velocity: 1.2 };
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

function mcrTopology(): TopologyNode[] {
  return [
    {
      id: 'base_link',
      label: 'base_link',
      kind: 'link',
      origin: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
      children: [
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
                { id: 'camera_mount_link', label: 'camera_mount_link', kind: 'link', origin: { x: 0.2, y: 0.08, z: 0.62, rx: 0, ry: 0, rz: 12 } },
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

function softwareCatalogItems() {
  return SOFTWARE_VERSION_CATALOG.flatMap(category => category.groups.flatMap(group => group.items));
}

function findSoftwareCatalogItem(id: string) {
  return softwareCatalogItems().find(item => item.id === id);
}

function selectedSoftwareCatalogItems(ids: string[]) {
  const selected = new Set(ids);
  return softwareCatalogItems().filter(item => selected.has(item.id));
}

function defaultSoftwareSelectionIds(type: string) {
  if (type.includes('人形')) {
    return ['controller-src', 'arm-agile', 'gripper-adaptive', 'motor-servo', 'sensor-vision-lidar', 'service-health'];
  }
  if (type.includes('AGV')) {
    return ['controller-src', 'motor-stepper', 'sensor-distance', 'io-digital', 'service-device-manager', 'algo-navigation'];
  }
  return ['controller-src', 'arm-jaka', 'gripper-electric', 'motor-servo', 'sensor-vision-lidar', 'io-digital'];
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
) {
  return selectedSoftwareCatalogItems(ids).reduce<Record<SoftwarePackageSlot, SoftwarePackageConfig>>((next, item) => ({
    ...next,
    [item.slot]: packageFromSoftwareItem(item),
  }), { ...fallback });
}

const INITIAL_ROBOT_MODELS: RobotModel[] = [
  {
    id: 'robot-mcr',
    name: 'MCR复合机器人',
    type: '复合机器人',
    ownerAccount: 'robot-admin',
    status: 'published',
    version: 'R1.4',
    updatedAt: '2026-07-01 14:32',
    componentCount: 18,
    peripherals: ['视觉相机', '激光雷达', 'I/O模块', '夹爪'],
    pose: { rotation: 28, height: 64, reach: 72 },
    topology: mcrTopology(),
    softwareSelectionIds: defaultSoftwareSelectionIds('复合机器人'),
    softwarePackages: {
      ...defaultSoftwarePackages('复合机器人'),
      controller: packageConfig('controller', 0, 0),
      armDriver: packageConfig('armDriver', 0, 0),
      endEffector: packageConfig('endEffector', 0, 0),
      powerDriver: packageConfig('powerDriver', 0, 0),
      perception: packageConfig('perception', 2, 0),
    },
  },
  {
    id: 'robot-humanoid',
    name: '人形双足机器人',
    type: '人形双足机器人',
    ownerAccount: 'biped-lab',
    status: 'draft',
    version: 'R0.9',
    updatedAt: '2026-06-29 10:18',
    componentCount: 26,
    peripherals: ['IMU', '深度相机', '足底力传感器'],
    pose: { rotation: -12, height: 78, reach: 55 },
    topology: humanoidTopology(),
    softwareSelectionIds: defaultSoftwareSelectionIds('人形双足机器人'),
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
    ownerAccount: 'factory-ops',
    status: 'published',
    version: 'R2.1',
    updatedAt: '2026-06-26 16:04',
    componentCount: 12,
    peripherals: ['激光雷达', '电池模组', '导航控制器'],
    pose: { rotation: 18, height: 42, reach: 46 },
    topology: mcrTopology(),
    softwareSelectionIds: defaultSoftwareSelectionIds('AGV搬运机器人'),
    softwarePackages: {
      ...defaultSoftwarePackages('AGV搬运机器人'),
      controller: packageConfig('controller', 0, 1),
      armDriver: packageConfig('armDriver', 3, 1),
      powerDriver: packageConfig('powerDriver', 1, 0),
      perception: packageConfig('perception', 0, 0),
    },
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
  return { ...DEFAULT_ORIGIN, ...(node.origin ?? {}) };
}

function axisOf(node: TopologyNode): Vector3 {
  return { ...DEFAULT_AXIS, ...(node.axis ?? {}) };
}

function limitOf(node: TopologyNode): JointLimit {
  return { ...DEFAULT_LIMIT, ...(node.limit ?? {}) };
}

function buildUrdf(model: RobotModel) {
  const flat = flattenTopology(model.topology);
  const links = flat.filter(node => node.kind === 'link');
  const joints = flat.filter(node => node.kind === 'joint');
  const linkXml = links.map(link => {
    const origin = originOf(link);
    return [
      `  <!-- link_origin name="${escapeXml(link.label)}" xyz="${origin.x} ${origin.y} ${origin.z}" rpy="${origin.rx} ${origin.ry} ${origin.rz}" -->`,
      `  <link name="${escapeXml(link.label)}" />`,
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
    links.push({ name, origin });
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
      children: [],
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
          childLink.children = buildChildren(joint.child);
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
      rootLink.children = buildChildren(rootName);
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

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    height: 32,
    borderRadius: 8,
    border: '1px solid var(--robot-border-strong)',
    background: 'var(--robot-surface)',
    color: 'var(--robot-heading)',
    fontSize: 13,
    padding: '0 12px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  };
}

function RobotScene({
  model,
  editing,
  onToggleEditing,
  onPoseChange,
}: {
  model: RobotModel;
  editing: boolean;
  onToggleEditing: () => void;
  onPoseChange: (pose: RobotPose) => void;
}) {
  const isHumanoid = model.type.includes('人形');
  const baseY = 282 - model.pose.height * 0.35;
  const reach = model.pose.reach;

  return (
    <div style={{
      height: '100%',
      minHeight: 0,
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--robot-surface)',
      border: '1px solid var(--robot-border)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: 'var(--robot-shadow)',
    }}>
      <div style={{ padding: '15px 18px', borderBottom: '1px solid var(--robot-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ color: 'var(--robot-heading)', fontSize: 15, fontWeight: 600 }}>3D模型可视化</div>
        </div>
        <ArcoButton
          scope="robot"
          onClick={onToggleEditing}
          type={editing ? 'primary' : 'default'}
          icon={<SlidersHorizontal size={14} />}
        >
          {editing ? '结束编辑' : '开始编辑'}
        </ArcoButton>
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: 360, background: 'var(--robot-scene-bg)', overflow: 'hidden' }}>
        <svg viewBox="0 0 720 430" style={{ width: '100%', height: '100%', display: 'block' }}>
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

          <g transform="translate(82 342)">
            <line x1="0" y1="0" x2="70" y2="0" stroke="var(--robot-axis-x)" strokeWidth="3" />
            <line x1="0" y1="0" x2="0" y2="-70" stroke="var(--robot-axis-y)" strokeWidth="3" />
            <line x1="0" y1="0" x2="46" y2="-42" stroke="var(--robot-axis-z)" strokeWidth="3" />
            <text x="78" y="5" fill="var(--robot-axis-x)" fontSize="12" fontWeight="700">X</text>
            <text x="-10" y="-78" fill="var(--robot-axis-y)" fontSize="12" fontWeight="700">Y</text>
            <text x="52" y="-48" fill="var(--robot-axis-z)" fontSize="12" fontWeight="700">Z</text>
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

        <div style={{
          position: 'absolute',
          left: 18,
          top: 18,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <span style={{ color: 'var(--robot-accent-text)', background: 'var(--robot-accent-soft)', border: '1px solid var(--robot-accent-border)', borderRadius: 999, padding: '5px 10px', fontSize: 12, fontWeight: 500 }}>
            {model.type}
          </span>
          <span style={{ color: 'var(--robot-success)', background: 'var(--robot-success-soft)', border: '1px solid var(--robot-success-border)', borderRadius: 999, padding: '5px 10px', fontSize: 12, fontWeight: 500 }}>
            {model.componentCount} 组件
          </span>
        </div>

        {editing && (
          <div style={{
            position: 'absolute',
            right: 18,
            top: 18,
            width: 220,
            borderRadius: 8,
            background: 'var(--robot-hud-bg)',
            border: '1px solid var(--robot-hud-border)',
            padding: 14,
            color: 'var(--robot-hud-text)',
          }}>
            {[
              ['姿态旋转', 'rotation', -45, 45],
              ['模型高度', 'height', 30, 90],
              ['臂展/步幅', 'reach', 30, 90],
            ].map(([label, key, min, max]) => (
              <label key={String(key)} style={{ display: 'block', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--robot-muted)', fontSize: 11, fontWeight: 500, marginBottom: 7 }}>
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
  depth = 0,
}: {
  nodes: TopologyNode[];
  selectedId: string;
  onSelect: (id: string) => void;
  onRename?: (id: string, label: string) => void;
  onAddChild?: (parentId: string, kind: TopologyKind) => void;
  onDelete?: (id: string) => void;
  depth?: number;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  function startEdit(id: string, currentLabel: string) {
    setEditingId(id);
    setEditValue(currentLabel);
  }

  function commitEdit() {
    if (editingId && editValue.trim() && onRename) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  }

  const isOnlyRoot = depth === 0 && nodes.length === 1;

  return (
    <div>
      {nodes.map(node => {
        const selected = node.id === selectedId;
        const isEditing = node.id === editingId;
        const isHovered = node.id === hoveredId;
        return (
          <div key={node.id}>
            <div
              onDoubleClick={() => startEdit(node.id, node.label)}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                minHeight: 34,
                marginLeft: depth * 14,
                padding: '0 4px 0 8px',
                borderRadius: 8,
                border: selected ? '1px solid var(--robot-accent-border)' : '1px solid transparent',
                background: selected ? 'var(--robot-accent-soft)' : isHovered ? 'var(--robot-soft)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              <button
                onClick={() => onSelect(node.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flex: 1,
                  minWidth: 0,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--robot-text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <ChevronRight size={13} color="var(--robot-subtle)" />
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: node.kind === 'link' ? 'var(--robot-accent)' : 'var(--robot-success)',
                  flexShrink: 0,
                }} />
                {isEditing ? (
                  <input
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEdit();
                      if (e.key === 'Escape') { setEditingId(null); setEditValue(''); }
                    }}
                    autoFocus
                    onClick={e => e.stopPropagation()}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: 26,
                      borderRadius: 8,
                      border: '1px solid var(--robot-accent-border)',
                      background: 'var(--robot-surface)',
                      color: 'var(--robot-heading)',
                      fontSize: 12,
                      fontWeight: 500,
                      padding: '0 6px',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <span
                    style={{ fontSize: 12, fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title="双击重命名"
                  >
                    {node.label}
                  </span>
                )}
              </button>
              <span style={{
                borderRadius: 999,
                background: node.kind === 'link' ? 'var(--robot-accent-soft)' : 'var(--robot-success-soft)',
                color: node.kind === 'link' ? 'var(--robot-accent-text)' : 'var(--robot-success)',
                fontSize: 10,
                fontWeight: 500,
                padding: '2px 7px',
                flexShrink: 0,
              }}>
                {node.kind === 'link' ? '连杆' : '关节'}
              </span>

              {/* Hover action buttons */}
              {isHovered && (
                <div style={{ display: 'flex', gap: 2, flexShrink: 0, marginLeft: 2 }}>
                  <ArcoIconButton
                    scope="robot"
                    title="添加子连杆"
                    aria-label="添加子连杆"
                    onClick={(e) => { e.stopPropagation(); onAddChild?.(node.id, 'link'); }}
                    size="mini"
                    type="secondary"
                    icon={<Plus size={11} />}
                  />
                  <ArcoIconButton
                    scope="robot"
                    title="添加子关节"
                    aria-label="添加子关节"
                    onClick={(e) => { e.stopPropagation(); onAddChild?.(node.id, 'joint'); }}
                    size="mini"
                    icon={<Plus size={11} />}
                  />
                  <ArcoIconButton
                    scope="robot"
                    title="删除节点"
                    aria-label="删除节点"
                    disabled={isOnlyRoot && node.id === nodes[0]?.id}
                    onClick={(e) => { e.stopPropagation(); onDelete?.(node.id); }}
                    size="mini"
                    status="danger"
                    icon={<X size={12} />}
                  />
                </div>
              )}
            </div>
            {node.children && (
              <TopologyTree
                nodes={node.children}
                selectedId={selectedId}
                onSelect={onSelect}
                onRename={onRename}
                onAddChild={onAddChild}
                onDelete={onDelete}
                depth={depth + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function axisInputStyle(): React.CSSProperties {
  return { ...inputStyle(), height: 28, borderRadius: 8, padding: '0 8px', fontSize: 12 };
}

function TopologyParamPanel({
  node,
  onChange,
}: {
  node: TopologyNode;
  onChange: (patch: Partial<TopologyNode>) => void;
}) {
  const origin = originOf(node);
  const axis = axisOf(node);
  const limit = limitOf(node);

  function updateOrigin(key: keyof OriginPose, value: string) {
    onChange({ origin: { ...origin, [key]: Number(value) || 0 } });
  }

  function updateAxis(key: keyof Vector3, value: string) {
    onChange({ axis: { ...axis, [key]: Number(value) || 0 } });
  }

  function updateLimit(key: keyof JointLimit, value: string) {
    onChange({ limit: { ...limit, [key]: Number(value) || 0 } });
  }

  return (
    <section style={{ background: 'var(--robot-surface)', border: '1px solid var(--robot-border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--robot-shadow)', flexShrink: 0, height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--robot-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: 'var(--robot-heading)', fontSize: 15, fontWeight: 600 }}>节点参数</div>
        </div>
        <span style={{
          borderRadius: 999,
          background: node.kind === 'link' ? 'var(--robot-accent-soft)' : 'var(--robot-success-soft)',
          color: node.kind === 'link' ? 'var(--robot-accent-text)' : 'var(--robot-success)',
          fontSize: 10,
          fontWeight: 600,
          padding: '3px 8px',
          flexShrink: 0,
        }}>
          {node.kind === 'link' ? 'Link' : 'Joint'}
        </span>
      </div>

      <div style={{ padding: 12, display: 'grid', gap: 12 }}>
        <div>
          <div style={{ color: 'var(--robot-muted)', fontSize: 11, fontWeight: 600, marginBottom: 7 }}>位置 xyz</div>
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
          <div style={{ color: 'var(--robot-muted)', fontSize: 11, fontWeight: 600, marginBottom: 7 }}>旋转 xyz</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
            {(['rx', 'ry', 'rz'] as const).map((key, index) => (
              <label key={key}>
                <span style={{ color: 'var(--robot-subtle)', fontSize: 10, fontWeight: 600, display: 'block', marginBottom: 4 }}>{['RX', 'RY', 'RZ'][index]}</span>
                <ArcoTextInput scope="robot" type="number" step="1" value={origin[key]} onChange={event => updateOrigin(key, event.target.value)} style={axisInputStyle()} />
              </label>
            ))}
          </div>
        </div>

        {node.kind === 'joint' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <label>
                <span style={{ color: 'var(--robot-muted)', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 5 }}>关节类型</span>
                <ArcoSelect scope="robot" value={node.jointType ?? 'revolute'} onChange={event => onChange({ jointType: event.target.value as JointType })} style={axisInputStyle()}>
                  {JOINT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </ArcoSelect>
              </label>
              <label>
                <span style={{ color: 'var(--robot-muted)', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 5 }}>速度</span>
                <ArcoTextInput scope="robot" type="number" step="0.1" value={limit.velocity} onChange={event => updateLimit('velocity', event.target.value)} style={axisInputStyle()} />
              </label>
            </div>

            <div>
              <div style={{ color: 'var(--robot-muted)', fontSize: 11, fontWeight: 600, marginBottom: 7 }}>旋转轴 axis</div>
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
                  <span style={{ color: 'var(--robot-muted)', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 5 }}>{label}</span>
                  <ArcoTextInput scope="robot" type="number" step="1" value={limit[key]} onChange={event => updateLimit(key, event.target.value)} style={axisInputStyle()} />
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function SoftwareVersionPanel({
  selectionIds,
  onConfigure,
}: {
  selectionIds: string[];
  onConfigure: () => void;
}) {
  const selectedSet = new Set(selectionIds);

  return (
    <section style={{ background: 'var(--robot-surface)', border: '1px solid var(--robot-border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--robot-shadow)', flexShrink: 0 }}>
      <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ color: 'var(--robot-heading)', fontSize: 14, fontWeight: 600, marginBottom: 10 }}>软件版本</div>
          <div style={{ color: 'var(--robot-success)', fontSize: 13, fontWeight: 600 }}>已发布</div>
        </div>
        <ArcoButton scope="robot" onClick={onConfigure} type="secondary" size="small">
          配置
        </ArcoButton>
      </div>

      <div style={{ padding: '6px 16px 16px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {SOFTWARE_VERSION_CATALOG.map(category => (
          <div key={category.id} style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 26 }}>
              <ChevronRight size={13} color="var(--robot-muted)" style={{ transform: 'rotate(90deg)' }} />
              <span style={{ color: 'var(--robot-heading)', fontSize: 13, fontWeight: 600 }}>{category.label}</span>
            </div>

            <div style={{ marginLeft: 17, borderLeft: '1px solid var(--robot-border-strong)', paddingLeft: 14 }}>
              {category.groups.map(group => (
                <div key={group.id} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 26 }}>
                    <ChevronRight size={12} color="var(--robot-subtle)" style={{ transform: 'rotate(90deg)' }} />
                    <span style={{ color: 'var(--robot-text)', fontSize: 13, fontWeight: 500 }}>{group.label}</span>
                  </div>

                  <div style={{ marginLeft: 15, borderLeft: '1px solid var(--robot-border-strong)', paddingLeft: 20 }}>
                    {group.items.map(item => {
                      const selected = selectedSet.has(item.id);
                      return (
                        <div
                          key={item.id}
                          title={`${item.packageName} ${item.version}`}
                          style={{
                            minHeight: 28,
                            display: 'flex',
                            alignItems: 'center',
                            color: selected ? 'var(--robot-text)' : 'var(--robot-muted)',
                            fontSize: 13,
                            fontWeight: selected ? 700 : 500,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SoftwareVersionDialog({
  open,
  selectionIds,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  selectionIds: string[];
  onOpenChange: (open: boolean) => void;
  onSave: (ids: string[]) => void;
}) {
  const [draftIds, setDraftIds] = useState<string[]>(selectionIds);
  const [activeCategoryId, setActiveCategoryId] = useState(SOFTWARE_VERSION_CATALOG[0].id);
  const [activeGroupId, setActiveGroupId] = useState(SOFTWARE_VERSION_CATALOG[0].groups[0].id);
  const [query, setQuery] = useState('');
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraftIds(selectionIds);
    setQuery('');
    setSynced(false);
  }, [open, selectionIds]);

  const activeCategory = SOFTWARE_VERSION_CATALOG.find(category => category.id === activeCategoryId) ?? SOFTWARE_VERSION_CATALOG[0];
  const activeGroup = activeCategory.groups.find(group => group.id === activeGroupId) ?? activeCategory.groups[0];
  const selectedSet = new Set(draftIds);
  const filteredItems = activeGroup.items.filter(item => item.label.toLowerCase().includes(query.trim().toLowerCase()));
  const currentGroupSelectedCount = activeGroup.items.filter(item => selectedSet.has(item.id)).length;
  const allCurrentGroupSelected = activeGroup.items.every(item => selectedSet.has(item.id));
  const catalogTotal = SOFTWARE_VERSION_CATALOG.reduce((total, category) => total + category.totalCount, 0);

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
      activeGroup.items.forEach(item => {
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
      description={(
        <>
          <span>打开时自动从墨影工作台同步目录；勾选类型后点击保存写入型号配置。</span>
          <br />
          <span>已选 {draftIds.length} 个类型 · 目录 {catalogTotal} 个类型</span>
        </>
      )}
      icon={<Box size={17} />}
      width="min(940px, calc(100vw - 56px))"
      maxWidth="calc(100vw - 56px)"
      maxHeight="calc(100vh - 56px)"
      contentStyle={{ height: 'min(720px, calc(100vh - 56px))' }}
      bodyStyle={{ padding: 0, flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}
      headerExtra={(
        <ArcoButton
          scope="robot"
          size="small"
          icon={<RefreshCw size={13} />}
          onClick={() => setSynced(true)}
        >
          {synced ? '已刷新' : '刷新目录'}
        </ArcoButton>
      )}
      footer={(
        <>
          <ArcoButton scope="robot" onClick={() => onOpenChange(false)}>关闭</ArcoButton>
          <ArcoButton scope="robot" type="primary" onClick={() => { onSave(draftIds); onOpenChange(false); }}>保存</ArcoButton>
        </>
      )}
    >
          <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '160px 160px minmax(0, 1fr)' }}>
            <div style={{ borderRight: '1px solid var(--robot-border)', padding: '14px 10px', overflowY: 'auto' }}>
              <div style={{ color: 'var(--robot-subtle)', fontSize: 11, fontWeight: 600, margin: '0 0 10px 2px' }}>产品</div>
              {SOFTWARE_VERSION_CATALOG.map(category => {
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
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{category.label}</span>
                    <span style={{ borderRadius: 999, background: active ? 'var(--robot-accent-soft)' : 'var(--robot-soft)', color: active ? 'var(--robot-accent-text)' : 'var(--robot-subtle)', fontSize: 11, padding: '3px 7px', flexShrink: 0 }}>
                      {selectedCount || category.totalCount}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ borderRight: '1px solid var(--robot-border)', padding: '14px 10px', overflowY: 'auto' }}>
              <div style={{ color: 'var(--robot-subtle)', fontSize: 11, fontWeight: 600, margin: '0 0 10px 2px' }}>子产品</div>
              {activeCategory.groups.map(group => {
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
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.label}</span>
                    <span style={{ borderRadius: 999, background: active ? 'var(--robot-accent-soft)' : 'var(--robot-soft)', color: active ? 'var(--robot-accent-text)' : 'var(--robot-subtle)', fontSize: 11, padding: '3px 7px', flexShrink: 0 }}>
                      {selectedCount || group.totalCount}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--robot-border)' }}>
                <div style={{ color: 'var(--robot-heading)', fontSize: 15, fontWeight: 600, marginBottom: 7 }}>{activeGroup.label}</div>
                <div style={{ color: 'var(--robot-muted)', fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
                  勾选需要推送到引擎装机的软件类型，已发布包也可勾选。
                </div>
                <div style={{ color: 'var(--robot-muted)', fontSize: 12, marginBottom: 12 }}>已选 {currentGroupSelectedCount} / {activeGroup.totalCount}</div>
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
                        borderRadius: 8,
                        display: 'grid',
                        gridTemplateColumns: '24px minmax(0, 1fr) 80px',
                        alignItems: 'center',
                        gap: 8,
                        padding: '0 10px',
                        cursor: 'pointer',
                        background: selectedSet.has(item.id) ? 'var(--robot-soft)' : 'transparent',
                      }}
                    >
                      <ArcoCheckbox
                        scope="robot"
                        checked={selectedSet.has(item.id)}
                        onChange={event => toggleItem(item.id, event.target.checked)}
                        style={{ width: 16, height: 16, gap: 0 }}
                      />
                      <span style={{ color: 'var(--robot-heading)', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                      <span style={{ color: 'var(--robot-subtle)', fontSize: 11, textAlign: 'right' }}>{item.versionCount} 个版本</span>
                    </label>
                  ))}
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
} = {}) {
  const [models, setModels] = useState<RobotModel[]>(INITIAL_ROBOT_MODELS);
  const [activeId, setActiveId] = useState<string | null>(INITIAL_ROBOT_MODELS[0]?.id ?? null);
  const [editingScene, setEditingScene] = useState(false);
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [softwareDialogOpen, setSoftwareDialogOpen] = useState(false);
  const [selectedTopologyId, setSelectedTopologyId] = useState('base_link');
  const [internalThemeMode] = useState<ThemeMode>(initialThemeMode);
  const [draft, setDraft] = useState<RobotDraft | null>(null);

  // Topology CRUD state
  const [addNodeDialogOpen, setAddNodeDialogOpen] = useState(false);
  const [addTargetId, setAddTargetId] = useState<string>('base_link');
  const [newNodeKind, setNewNodeKind] = useState<TopologyKind>('link');
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [urdfImportError, setUrdfImportError] = useState<string | null>(null);

  const themeMode = controlledThemeMode ?? internalThemeMode;
  const activeModel = activeId ? (models.find(model => model.id === activeId) ?? null) : null;
  const flatTopology = useMemo(() => activeModel ? flattenTopology(activeModel.topology) : [], [activeModel]);
  const selectedTopologyNode = useMemo(
    () => activeModel ? (findTopologyNode(activeModel.topology, selectedTopologyId) ?? activeModel.topology[0]) : null,
    [activeModel, selectedTopologyId],
  );

  // Keep a valid active model after hot reloads, deletions, or restored local state.
  useEffect(() => {
    if (activeId && models.some(model => model.id === activeId)) return;
    setActiveId(models[0]?.id ?? null);
  }, [activeId, models]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    Object.entries(ROBOT_THEME_VARS[themeMode]).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    document.documentElement.dataset.robotTheme = themeMode;
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  if (!activeModel) {
    return (
      <div style={{
        ...robotThemeVars(themeMode),
        flex: 1,
        minWidth: 0,
        height: '100%',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--robot-page)',
        color: 'var(--robot-muted)',
        fontSize: 13,
      }}>
        正在恢复当前机器人型号…
      </div>
    );
  }

  function updateActive(partial: Partial<RobotModel>) {
    setModels(prev => prev.map(model => model.id === activeModel.id ? { ...model, ...partial, updatedAt: nowLabel() } : model));
  }

  function saveSoftwareSelections(ids: string[]) {
    updateActive({
      softwareSelectionIds: ids,
      softwarePackages: packagesFromSoftwareSelections(ids, activeModel.softwarePackages),
    });
  }

  // ── Topology CRUD handlers ──────────────────────────────────

  function handleAddTopologyNode() {
    if (!newNodeLabel.trim()) return;
    const child: TopologyNode = {
      id: topoUid(),
      label: newNodeLabel.trim(),
      kind: newNodeKind,
      origin: { ...DEFAULT_ORIGIN },
      ...(newNodeKind === 'joint' ? { jointType: 'revolute' as JointType, axis: { ...DEFAULT_AXIS }, limit: { ...DEFAULT_LIMIT } } : {}),
      children: [],
    };
    updateActive({ topology: addTopologyChild(activeModel.topology, addTargetId, child) });
    setSelectedTopologyId(child.id);
    setAddNodeDialogOpen(false);
    setNewNodeLabel('');
  }

  function handleDeleteTopologyNode(targetId: string) {
    const targetNode = findTopologyNode(activeModel.topology, targetId);
    if (!targetNode || activeModel.topology.length <= 1) return;
    // Prevent deleting the only root
    const roots = activeModel.topology;
    if (roots.length === 1 && roots[0].id === targetId) return;
    const newTopology = removeTopologyNode(activeModel.topology, targetId);
    updateActive({ topology: newTopology });
    setSelectedTopologyId(newTopology[0]?.id ?? 'base_link');
  }

  function handleUrdfImport(event: React.ChangeEvent<HTMLInputElement>) {
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

  function openCreateDialog() {
    setDraft({
      name: '新建机器人型号',
      type: '复合机器人',
      ownerAccount: 'robot-admin',
      status: 'draft',
      version: 'R1.0',
      componentCount: 8,
      peripheralsText: '视觉相机\n激光雷达',
    });
    setModelDialogOpen(true);
  }

  function openEditDialog() {
    setDraft({
      id: activeModel.id,
      name: activeModel.name,
      type: activeModel.type,
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
    const nextSoftwareSelectionIds = draft.id ? activeModel.softwareSelectionIds : defaultSoftwareSelectionIds(draft.type);
    const nextModel: RobotModel = {
      id: draft.id ?? `robot-${Date.now()}`,
      name: draft.name.trim(),
      type: draft.type,
      ownerAccount: draft.ownerAccount.trim() || 'robot-admin',
      status: draft.status,
      version: draft.version.trim() || 'R1.0',
      updatedAt: nowLabel(),
      componentCount: Math.max(1, Number(draft.componentCount) || 1),
      peripherals: splitPeripherals(draft.peripheralsText),
      pose: activeModel?.pose ?? { rotation: 0, height: 58, reach: 58 },
      topology: draft.id ? activeModel.topology : defaultTopology(draft.type),
      softwareSelectionIds: nextSoftwareSelectionIds,
      softwarePackages: draft.id ? activeModel.softwarePackages : packagesFromSoftwareSelections(nextSoftwareSelectionIds, defaultSoftwarePackages(draft.type)),
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
    updateActive({ status: activeModel.status === 'published' ? 'draft' : 'published' });
  }

  function confirmDelete() {
    if (models.length <= 1) return;
    const currentIndex = models.findIndex(model => model.id === activeModel.id);
    const next = models.filter(model => model.id !== activeModel.id);
    setModels(next);
    setActiveId(next[Math.max(0, currentIndex - 1)]?.id ?? next[0].id);
    setSelectedTopologyId('base_link');
    setDeleteDialogOpen(false);
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
      padding: '24px 12px',
      display: 'flex',
      gap: 16,
      background: 'var(--robot-page)',
      color: 'var(--robot-text)',
      boxSizing: 'border-box',
      overflow: 'hidden',
      transition: 'background 0.22s ease, color 0.22s ease',
    }}>
      <aside style={{
        width: 280,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--robot-surface)',
        border: '1px solid var(--robot-border)',
        borderRadius: 16,
        boxShadow: 'var(--robot-shadow)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--robot-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <h1 style={{ color: 'var(--robot-heading)', fontSize: 16, fontWeight: 600, margin: 0 }}>型号库</h1>
            <ArcoButton scope="robot" type="primary" icon={<Plus size={14} />} onClick={openCreateDialog}>
              新建型号
            </ArcoButton>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {models.map(model => {
            const active = model.id === activeModel.id;
            const status = STATUS_META[model.status];
            return (
              <button
                key={model.id}
                onClick={() => { setActiveId(model.id); setEditingScene(false); setSelectedTopologyId('base_link'); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: 16,
                  border: `1px solid ${active ? 'var(--robot-accent)' : 'var(--robot-border)'}`,
                  background: active ? 'var(--robot-accent-soft)' : 'var(--robot-soft)',
                  padding: 12,
                  marginBottom: 8,
                  cursor: 'pointer',
                  boxShadow: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                  <span style={{ color: active ? 'var(--robot-accent-text)' : 'var(--robot-heading)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {model.name}
                  </span>
                  <span style={{ borderRadius: 999, background: status.bg, color: status.color, border: `1px solid ${status.border}`, fontSize: 10, fontWeight: 600, padding: '2px 8px', flexShrink: 0 }}>
                    {status.label}
                  </span>
                </div>
                <div style={{ color: active ? 'var(--robot-text)' : 'var(--robot-muted)', fontSize: 11, lineHeight: 1.6 }}>
                  {model.type} · {model.version}<br />
                  {model.componentCount} 组件 · {model.peripherals.length} 外设
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        <header style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexShrink: 0,
          padding: '4px 0',
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ color: 'var(--robot-muted)', fontSize: 12, fontWeight: 500 }}>型号库</span>
              <ChevronRight size={12} color="var(--robot-subtle)" />
              <span style={{ color: 'var(--robot-heading)', fontSize: 12, fontWeight: 600 }}>{activeModel.name}</span>
            </div>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h2 style={{ color: 'var(--robot-heading)', fontSize: 18, fontWeight: 600, margin: 0 }}>{activeModel.name}</h2>
              <span style={{
                borderRadius: 99, fontSize: 11, fontWeight: 500, padding: '2px 10px',
                background: STATUS_META[activeModel.status].bg,
                color: STATUS_META[activeModel.status].color,
                border: `1px solid ${STATUS_META[activeModel.status].border}`,
              }}>
                {STATUS_META[activeModel.status].label}
              </span>
            </div>
            {/* Stats row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--robot-text)', fontSize: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Box size={11} />{activeModel.type}
              </span>
              <span style={{ color: 'var(--robot-border-strong)' }}>|</span>
              <span>v{activeModel.version}</span>
              <span style={{ color: 'var(--robot-border-strong)' }}>|</span>
              <span>{activeModel.componentCount} 组件</span>
              <span style={{ color: 'var(--robot-border-strong)' }}>|</span>
              <span>{activeModel.peripherals.length} 外设</span>
              <span style={{ color: 'var(--robot-border-strong)' }}>|</span>
              <span>{flatTopology.length} 拓扑节点</span>
              <span style={{ color: 'var(--robot-border-strong)' }}>|</span>
              <span>更新于 {activeModel.updatedAt}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <ArcoButton scope="robot" icon={<Pencil size={13} />} onClick={openEditDialog}>编辑</ArcoButton>
            <ArcoButton
              scope="robot"
              onClick={togglePublish}
              type={activeModel.status === 'published' ? 'default' : 'primary'}
              icon={<CheckCircle2 size={13} />}
            >
              {activeModel.status === 'published' ? '取消发布' : '发布'}
            </ArcoButton>
            <span style={{ width: 1, height: 20, background: 'var(--robot-border-strong)', margin: '0 2px' }} />
            <ArcoButton scope="robot" icon={<FileCode2 size={13} />} onClick={exportUrdf}>URDF</ArcoButton>
            <ArcoButton scope="robot" icon={<FileJson size={13} />} onClick={exportJson}>JSON</ArcoButton>
            <ArcoButton
              scope="robot"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={models.length <= 1}
              status="danger"
              icon={<Trash2 size={13} />}
            >
              删除
            </ArcoButton>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(380px, 1fr) 330px', gap: 14, minHeight: 0, flex: 1, overflow: 'hidden' }}>
          <div style={{ minHeight: 0, overflow: 'hidden' }}>
            <SoftwareVersionPanel
              selectionIds={activeModel.softwareSelectionIds}
              onConfigure={() => setSoftwareDialogOpen(true)}
            />
          </div>

          <div style={{ minHeight: 0, overflow: 'hidden' }}>
            <RobotScene
              model={activeModel}
              editing={editingScene}
              onToggleEditing={() => setEditingScene(prev => !prev)}
              onPoseChange={pose => updateActive({ pose })}
            />
          </div>

          <aside style={{ minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', paddingRight: 2 }}>
            <section style={{ background: 'var(--robot-surface)', border: '1px solid var(--robot-border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--robot-shadow)', flexShrink: 0, maxHeight: 340, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--robot-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <GitBranch size={15} color="var(--robot-accent)" />
                <span style={{ color: 'var(--robot-heading)', fontSize: 15, fontWeight: 600, flex: 1 }}>拓扑结构与链路</span>
                <input type="file" accept=".urdf,.xml" onChange={handleUrdfImport} style={{ display: 'none' }} id="urdf-file-input" />
                <ArcoButton
                  scope="robot"
                  onClick={() => document.getElementById('urdf-file-input')?.click()}
                  size="small"
                  icon={<FileCode2 size={12} />}
                >
                  导入URDF
                </ArcoButton>
              </div>

              {urdfImportError && (
                <div style={{ margin: '8px 12px 0', padding: '8px 12px', borderRadius: 8, background: 'var(--robot-danger-soft)', color: 'var(--robot-danger)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span>{urdfImportError}</span>
                  <ArcoIconButton
                    scope="robot"
                    type="text"
                    status="danger"
                    size="mini"
                    aria-label="关闭导入错误提示"
                    title="关闭导入错误提示"
                    icon={<X size={12} />}
                    onClick={() => setUrdfImportError(null)}
                  />
                </div>
              )}

              <div style={{ padding: '8px 12px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
                <TopologyTree
                  nodes={activeModel.topology}
                  selectedId={selectedTopologyNode?.id ?? 'base_link'}
                  onSelect={(id) => setSelectedTopologyId(id)}
                  onRename={(id, label) => {
                    updateActive({ topology: renameTopologyNode(activeModel.topology, id, label) });
                  }}
                  onAddChild={(parentId, kind) => {
                    setAddTargetId(parentId);
                    setNewNodeKind(kind);
                    setNewNodeLabel(kind === 'link' ? 'new_link' : 'new_joint');
                    setAddNodeDialogOpen(true);
                  }}
                  onDelete={(id) => handleDeleteTopologyNode(id)}
                />
              </div>
            </section>

            {selectedTopologyNode && (
              <TopologyParamPanel
                node={selectedTopologyNode}
                onChange={updateSelectedTopologyNode}
              />
            )}
          </aside>
        </div>
      </main>

      <SoftwareVersionDialog
        open={softwareDialogOpen}
        selectionIds={activeModel.softwareSelectionIds}
        onOpenChange={setSoftwareDialogOpen}
        onSave={saveSoftwareSelections}
      />

      {/* Add Topology Node Dialog */}
      <ArcoModal
        open={addNodeDialogOpen}
        onOpenChange={setAddNodeDialogOpen}
        scope="robot"
        title={`添加${newNodeKind === 'link' ? '连杆' : '关节'}节点`}
        width={380}
        footer={(
          <>
            <ArcoButton scope="robot" onClick={() => setAddNodeDialogOpen(false)}>取消</ArcoButton>
            <ArcoButton scope="robot" type="primary" onClick={handleAddTopologyNode} disabled={!newNodeLabel.trim()}>添加</ArcoButton>
          </>
        )}
      >
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['link', 'joint'] as TopologyKind[]).map(kind => (
                  <ArcoButton
                    scope="robot"
                    key={kind}
                    onClick={() => setNewNodeKind(kind)}
                    type={newNodeKind === kind ? 'secondary' : 'default'}
                    size="large"
                    long
                  >
                    {kind === 'link' ? '连杆 Link' : '关节 Joint'}
                  </ArcoButton>
                ))}
              </div>
              <ArcoField label="节点名称">
                <ArcoTextInput
                  scope="robot"
                  value={newNodeLabel}
                  onChange={e => setNewNodeLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddTopologyNode(); }}
                  placeholder={newNodeKind === 'link' ? '例如: forearm_link' : '例如: elbow_joint'}
                  autoFocus
                />
              </ArcoField>
              {(() => {
                const targetNode = findTopologyNode(activeModel.topology, addTargetId);
                return targetNode ? (
                  <div style={{ color: 'var(--robot-subtle)', fontSize: 12 }}>
                    添加到 <strong style={{ color: 'var(--robot-accent-text)' }}>{targetNode.label}</strong> 下
                  </div>
                ) : null;
              })()}
            </div>
      </ArcoModal>

      <ArcoModal
        open={modelDialogOpen}
        onOpenChange={setModelDialogOpen}
        scope="robot"
        title={draft?.id ? '编辑机器人型号' : '新建机器人型号'}
        width={440}
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
              </div>
            )}
      </ArcoModal>

      <ArcoModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        scope="robot"
        status="danger"
        title="删除机器人型号"
        icon={<Trash2 size={16} />}
        width={360}
        footer={(
          <>
            <ArcoButton scope="robot" onClick={() => setDeleteDialogOpen(false)}>取消</ArcoButton>
            <ArcoButton scope="robot" type="primary" status="danger" onClick={confirmDelete}>删除</ArcoButton>
          </>
        )}
      >
            <p style={{ color: 'var(--robot-muted)', fontSize: 13, lineHeight: 1.7, margin: '0 0 18px' }}>
              确认删除「{activeModel.name}」吗？删除后该型号的拓扑结构、外设配置与导出配置会一并移除。
            </p>
      </ArcoModal>
    </div>
  );
}
