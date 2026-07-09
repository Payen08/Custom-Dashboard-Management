import { useMemo, useState, type ReactNode } from 'react';
import {
  Box,
  Cable,
  ChevronDown,
  ChevronRight,
  Cpu,
  Download,
  Edit3,
  GitBranch,
  Layers,
  Package,
  Plus,
  Search,
  ServerCog,
  Trash2,
  Upload,
} from 'lucide-react';
import { ArcoButton, ArcoIconButton, ArcoModal, ArcoTextArea, ArcoTextInput } from './ArcoLike';

interface ProductPackage {
  id: string;
  name: string;
  version: string;
  source: string;
  description: string;
  releaseNotes: string;
  architecture: string;
  fileSize: string;
  createdAt: string;
}

interface ProductVersionGroup {
  version: string;
  packages: ProductPackage[];
}

interface ProductBrand {
  id: string;
  name: string;
  versions: ProductVersionGroup[];
}

interface ProductSubcategory {
  id: string;
  name: string;
  brands: ProductBrand[];
}

interface ProductCategory {
  id: string;
  name: string;
  icon: 'controller' | 'external' | 'service';
  subcategories: ProductSubcategory[];
}

type PackageForm = Pick<ProductPackage, 'name' | 'version' | 'source' | 'description' | 'releaseNotes' | 'architecture' | 'fileSize'>;

const CARD_SHADOW = '0 18px 44px -32px rgba(15, 23, 42, 0.35)';

const emptyForm: PackageForm = {
  name: '',
  version: '',
  source: '',
  description: '',
  releaseNotes: '',
  architecture: 'x86_64',
  fileSize: '',
};

function buildInitialData(): ProductCategory[] {
  return [
    {
      id: 'controller',
      name: '控制器类产品',
      icon: 'controller',
      subcategories: [
        {
          id: 'controllers',
          name: '控制器',
          brands: [
            {
              id: 'moying',
              name: '墨影控制器',
              versions: [
                {
                  version: '1.8.0',
                  packages: [
                    { id: 'p1', name: 'device-backend-for-shadow-controller-x86_64.tar.gz', version: '1.8.0', source: 'CI 构建 #2841', description: '墨影 Shadow 控制器后端服务包，适配 x86_64 架构', releaseNotes: '正式发布版本', architecture: 'x86_64', fileSize: '24.6 MB', createdAt: '2026-07-01 14:32' },
                    { id: 'p2', name: 'device-backend-for-shadow-controller-arm64.tar.gz', version: '1.8.0', source: 'CI 构建 #2841', description: '墨影 Shadow 控制器后端服务包，适配 ARM64 架构', releaseNotes: '正式发布版本', architecture: 'arm64', fileSize: '22.1 MB', createdAt: '2026-07-01 14:28' },
                  ],
                },
                {
                  version: '1.7.0',
                  packages: [
                    { id: 'p3', name: 'device-backend-for-shadow-controller-x86_64.tar.gz', version: '1.7.0-rc.4', source: 'CI 构建 #2780', description: '墨影 Shadow 控制器后端服务包，适配 x86_64 架构', releaseNotes: 'RC 候选构建', architecture: 'x86_64', fileSize: '23.8 MB', createdAt: '2026-06-20 09:15' },
                  ],
                },
                {
                  version: '2.1.0',
                  packages: [
                    { id: 'p15', name: 'device-backend-for-shadow-controller-x86_64.tar.gz', version: '2.1.0-rc.2', source: 'CI 构建 #3200', description: '墨影 Shadow 控制器后端服务包 v2.1，适配 x86_64', releaseNotes: '2.1.0 RC2 候选构建，新增多机械臂协同调度', architecture: 'x86_64', fileSize: '26.8 MB', createdAt: '2026-07-05 09:30' },
                    { id: 'p16', name: 'device-backend-for-shadow-controller-arm64.tar.gz', version: '2.1.0-rc.2', source: 'CI 构建 #3200', description: '墨影 Shadow 控制器后端服务包 v2.1，适配 ARM64', releaseNotes: '2.1.0 RC2 候选构建，新增多机械臂协同调度', architecture: 'arm64', fileSize: '24.3 MB', createdAt: '2026-07-05 09:28' },
                  ],
                },
                {
                  version: '1.6.0',
                  packages: [
                    { id: 'p4', name: 'device-backend-for-shadow-controller-x86_64.tar.gz', version: '1.6.0', source: 'CI 构建 #2650', description: '墨影 Shadow 控制器后端服务包', releaseNotes: '正式发布版本', architecture: 'x86_64', fileSize: '21.2 MB', createdAt: '2026-05-15 16:40' },
                  ],
                },
              ],
            },
            {
              id: 'src',
              name: '仙工控制器',
              versions: [
                { version: '3.12.0', packages: [{ id: 'p5', name: 'src-controller-kit-x86_64.tar.gz', version: '3.12.0', source: 'CI 构建 #3120', description: '仙工 SRC Controller Kit，适配 x86_64', releaseNotes: '正式发布版本', architecture: 'x86_64', fileSize: '31.5 MB', createdAt: '2026-06-28 10:00' }] },
                { version: '3.10.4', packages: [{ id: 'p6', name: 'src-controller-kit-x86_64.tar.gz', version: '3.10.4', source: 'CI 构建 #2900', description: '仙工 SRC Controller Kit', releaseNotes: '正式发布版本', architecture: 'x86_64', fileSize: '30.1 MB', createdAt: '2026-05-10 08:30' }] },
              ],
            },
          ],
        },
        {
          id: 'arms',
          name: '机械臂',
          brands: [
            { id: 'jaka', name: '节卡机械臂', versions: [{ version: '2.5.3', packages: [{ id: 'p7', name: 'jaka-ros2-driver-x86_64.tar.gz', version: '2.5.3', source: 'CI 构建 #3050', description: 'JAKA ROS2 Driver，适配 x86_64', releaseNotes: '正式发布版本', architecture: 'x86_64', fileSize: '18.3 MB', createdAt: '2026-07-02 15:20' }] }] },
            { id: 'agile', name: '思灵机械臂', versions: [{ version: '3.1.0', packages: [{ id: 'p8', name: 'agile-robots-arm-bridge-x86_64.tar.gz', version: '3.1.0', source: 'CI 构建 #2980', description: 'Agile Robots Arm Bridge，适配 x86_64', releaseNotes: '正式发布版本', architecture: 'x86_64', fileSize: '20.7 MB', createdAt: '2026-06-25 11:45' }] }] },
            { id: 'rokae', name: '珞石机械臂', versions: [{ version: '1.7.2', packages: [{ id: 'p9', name: 'rokae-xmate-sdk-adapter-x86_64.tar.gz', version: '1.7.2', source: 'CI 构建 #2850', description: 'Rokae xMate SDK Adapter', releaseNotes: '正式发布版本', architecture: 'x86_64', fileSize: '16.5 MB', createdAt: '2026-06-15 09:00' }] }] },
          ],
        },
      ],
    },
    {
      id: 'external',
      name: '外接设备类产品',
      icon: 'external',
      subcategories: [
        {
          id: 'grippers',
          name: '夹爪',
          brands: [
            { id: 'electric-gripper', name: '电动夹爪', versions: [{ version: '2.2.0', packages: [{ id: 'p10', name: 'electric-gripper-control-x86_64.tar.gz', version: '2.2.0', source: 'CI 构建 #2700', description: 'Electric Gripper Control 包', releaseNotes: '正式发布版本', architecture: 'x86_64', fileSize: '8.2 MB', createdAt: '2026-05-20 13:10' }] }] },
            { id: 'adaptive-gripper', name: '自适应夹爪', versions: [{ version: '3.0.2', packages: [{ id: 'p11', name: 'adaptive-gripper-runtime-x86_64.tar.gz', version: '3.0.2', source: 'CI 构建 #2600', description: 'Adaptive Gripper Runtime', releaseNotes: '正式发布版本', architecture: 'x86_64', fileSize: '9.5 MB', createdAt: '2026-04-15 08:00' }] }] },
          ],
        },
        {
          id: 'sensors',
          name: '传感器',
          brands: [
            { id: 'vision-lidar', name: '相机/雷达', versions: [{ version: '4.0.1', packages: [{ id: 'p12', name: 'vision-lidar-fusion-pack-x86_64.tar.gz', version: '4.0.1', source: 'CI 构建 #2950', description: 'Vision Lidar Fusion Pack', releaseNotes: '正式发布版本', architecture: 'x86_64', fileSize: '35.8 MB', createdAt: '2026-06-22 16:30' }] }] },
          ],
        },
      ],
    },
    {
      id: 'service',
      name: '服务类产品',
      icon: 'service',
      subcategories: [
        {
          id: 'device-services',
          name: '设备服务',
          brands: [
            { id: 'device-manager', name: '设备管家', versions: [{ version: '2.6.0', packages: [{ id: 'p13', name: 'device-manager-service-x86_64.tar.gz', version: '2.6.0', source: 'CI 构建 #2750', description: 'Device Manager Service', releaseNotes: '正式发布版本', architecture: 'x86_64', fileSize: '12.4 MB', createdAt: '2026-06-10 10:20' }] }] },
          ],
        },
        {
          id: 'ops-services',
          name: '运维服务',
          brands: [
            { id: 'ota', name: 'OTA 升级', versions: [{ version: '2.1.0', packages: [{ id: 'p14', name: 'ota-update-agent-x86_64.tar.gz', version: '2.1.0', source: 'CI 构建 #2800', description: 'OTA Update Agent', releaseNotes: '正式发布版本', architecture: 'x86_64', fileSize: '7.8 MB', createdAt: '2026-06-18 14:50' }] }] },
          ],
        },
      ],
    },
  ];
}

function isRC(version: string) {
  return version.includes('-rc');
}

function categoryIcon(kind: ProductCategory['icon']) {
  const props = { size: 15, strokeWidth: 2 };
  if (kind === 'external') return <Cable {...props} />;
  if (kind === 'service') return <ServerCog {...props} />;
  return <Cpu {...props} />;
}

function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'danger';
}) {
  const palette = {
    neutral: {
      color: 'var(--app-muted)',
      background: 'var(--app-soft)',
      border: 'var(--app-border)',
    },
    accent: {
      color: 'var(--app-accent)',
      background: 'var(--app-accent-soft)',
      border: 'var(--app-accent-border)',
    },
    success: {
      color: 'var(--app-success)',
      background: 'var(--app-success-soft)',
      border: 'color-mix(in srgb, var(--app-success) 24%, var(--app-border))',
    },
    danger: {
      color: 'var(--app-danger)',
      background: 'var(--app-danger-soft)',
      border: 'var(--app-danger-border)',
    },
  }[tone];

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 24,
      borderRadius: 999,
      border: `1px solid ${palette.border}`,
      background: palette.background,
      color: palette.color,
      padding: '0 9px',
      fontSize: 11,
      fontWeight: 600,
      lineHeight: 1,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <span style={{ display: 'block', marginBottom: 6, color: 'var(--app-muted)', fontSize: 12, fontWeight: 600 }}>
      {children}{required && <span style={{ color: 'var(--app-danger)', marginLeft: 3 }}>*</span>}
    </span>
  );
}

function TextInput({
  label,
  required,
  startContent,
  value,
  onValueChange,
  placeholder,
}: {
  label?: string;
  required?: boolean;
  startContent?: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label style={{ display: 'block', minWidth: 0 }}>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div style={{ position: 'relative' }}>
        {startContent && (
          <span style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            color: 'var(--app-muted)',
            pointerEvents: 'none',
          }}>
            {startContent}
          </span>
        )}
        <ArcoTextInput
          value={value}
          placeholder={placeholder}
          onChange={event => onValueChange(event.target.value)}
          style={{ height: 38, paddingLeft: startContent ? 36 : 13 }}
        />
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onValueChange,
  placeholder,
}: {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label style={{ display: 'block', minWidth: 0 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <ArcoTextArea
        value={value}
        placeholder={placeholder}
        onChange={event => onValueChange(event.target.value)}
        style={{ minHeight: 86 }}
      />
    </label>
  );
}

function CategoryTree({
  categories,
  selectedBrandId,
  expandedSubs,
  onToggleSub,
  onSelectBrand,
}: {
  categories: ProductCategory[];
  selectedBrandId: string | null;
  expandedSubs: Set<string>;
  onToggleSub: (id: string) => void;
  onSelectBrand: (id: string) => void;
}) {
  return (
    <div style={{ padding: '10px 12px 14px' }}>
      {categories.map(category => (
        <section key={category.id} style={{ marginBottom: 10 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--app-heading)',
            fontSize: 13,
            fontWeight: 700,
            padding: '9px 8px',
          }}>
            <span style={{
              width: 28,
              height: 28,
              borderRadius: 10,
              background: 'var(--app-accent-soft)',
              color: 'var(--app-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {categoryIcon(category.icon)}
            </span>
            <span>{category.name}</span>
          </div>

          {category.subcategories.map(subcategory => {
            const expanded = expandedSubs.has(subcategory.id);
            return (
              <div key={subcategory.id}>
                <button
                  type="button"
                  onClick={() => onToggleSub(subcategory.id)}
                  style={{
                    width: '100%',
                    height: 34,
                    border: 'none',
                    borderRadius: 8,
                    background: 'transparent',
                    color: 'var(--app-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '0 10px 0 20px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  <span>{subcategory.name}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--app-muted)', fontSize: 11 }}>{subcategory.brands.length}</span>
                </button>

                {expanded && subcategory.brands.map(brand => {
                  const active = brand.id === selectedBrandId;
                  return (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => onSelectBrand(brand.id)}
                      style={{
                        width: '100%',
                        height: 34,
                        border: active ? '1px solid var(--app-accent-border)' : '1px solid transparent',
                        borderRadius: 8,
                        background: active ? 'var(--app-accent-soft)' : 'transparent',
                        color: active ? 'var(--app-accent)' : 'var(--app-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '0 10px 0 42px',
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      <Box size={12} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand.name}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}


function VersionAccordion({
  group,
  onEditPackage,
  onDeletePackage,
  onDownloadPackage,
}: {
  group: ProductVersionGroup;
  onEditPackage: (pkg: ProductPackage) => void;
  onDeletePackage: (pkg: ProductPackage) => void;
  onDownloadPackage: (pkg: ProductPackage) => void;
}) {
  const hasRC = group.packages.some(pkg => isRC(pkg.version));
  const [isOpen, setIsOpen] = useState(group.version === '1.8.0');

  return (
    <section style={{
      borderRadius: 16,
      border: '1px solid var(--app-border)',
      background: 'var(--app-surface)',
      overflow: 'hidden',
      marginBottom: 12,
    }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          minHeight: 54,
          border: 'none',
          background: 'transparent',
          color: 'var(--app-heading)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 16px',
          cursor: 'pointer',
        }}
      >
        {isOpen ? <ChevronDown size={15} color="var(--app-muted)" /> : <ChevronRight size={15} color="var(--app-muted)" />}
        <span style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          background: 'var(--app-accent-soft)',
          color: 'var(--app-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <GitBranch size={14} />
        </span>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{group.version}</span>
        {hasRC && <Badge tone="accent">RC</Badge>}
        <span style={{ flex: 1 }} />
        <Badge>{group.packages.length} 个包</Badge>
      </button>

      {isOpen && (
        <div style={{ borderTop: '1px solid var(--app-border)' }}>
          {group.packages.map(pkg => {
            const rc = isRC(pkg.version);
            return (
              <div
                key={pkg.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--app-border)',
                }}
              >
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: 'var(--app-accent-soft)',
                  color: 'var(--app-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Package size={17} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, minWidth: 0 }}>
                    <span style={{
                      color: 'var(--app-heading)',
                      fontSize: 13,
                      fontWeight: 700,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {pkg.name}
                    </span>
                    <Badge tone={rc ? 'accent' : 'success'}>{rc ? 'RC' : '正式版'}</Badge>
                    <Badge>{pkg.architecture}</Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--app-muted)', fontSize: 12, minWidth: 0, flexWrap: 'wrap' }}>
                    <span>{pkg.source}</span>
                    <span>·</span>
                    <span>{pkg.fileSize}</span>
                    <span>·</span>
                    <span>{pkg.createdAt}</span>
                  </div>
                  {(pkg.description || pkg.releaseNotes) && (
                    <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {pkg.description && <span style={{ color: 'var(--app-text)', fontSize: 11 }}>{pkg.description}</span>}
                      {pkg.description && pkg.releaseNotes && <span style={{ color: 'var(--app-border-strong)' }}>·</span>}
                      {pkg.releaseNotes && <span style={{ color: 'var(--app-muted)', fontSize: 11, fontStyle: 'italic' }}>{pkg.releaseNotes}</span>}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <ArcoIconButton type="text" size="small" icon={<Edit3 size={14} />} title="编辑" aria-label="编辑" onClick={() => onEditPackage(pkg)} />
                  <ArcoIconButton type="secondary" size="small" icon={<Download size={14} />} title="下载" aria-label="下载" onClick={() => onDownloadPackage(pkg)} />
                  <ArcoIconButton type="text" status="danger" size="small" icon={<Trash2 size={14} />} title="删除" aria-label="删除" onClick={() => onDeletePackage(pkg)} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function findBrand(categories: ProductCategory[], brandId: string | null) {
  if (!brandId) return null;
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      const brand = subcategory.brands.find(item => item.id === brandId);
      if (brand) return brand;
    }
  }
  return null;
}

function SoftwarePackageModal({
  title,
  icon,
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  submitLabel,
  submitDisabled,
}: {
  title: string;
  icon: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: PackageForm;
  onFormChange: (form: PackageForm) => void;
  onSubmit: () => void;
  submitLabel: string;
  submitDisabled?: boolean;
}) {
  return (
    <ArcoModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      icon={icon}
      width={620}
      footer={(
        <>
          <ArcoButton onClick={() => onOpenChange(false)}>取消</ArcoButton>
          <ArcoButton type="primary" onClick={onSubmit} disabled={submitDisabled}>{submitLabel}</ArcoButton>
        </>
      )}
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
          <TextInput
            label="版本号"
            required
            placeholder="例如: 2.0.0"
            value={form.version}
            onValueChange={version => onFormChange({ ...form, version })}
          />
          <label style={{ display: 'block' }}>
            <FieldLabel>架构</FieldLabel>
            <select
              value={form.architecture}
              onChange={event => onFormChange({ ...form, architecture: event.target.value })}
              style={{
                width: '100%',
                height: 38,
                borderRadius: 8,
                border: '1px solid transparent',
                background: 'var(--app-soft)',
                color: 'var(--app-heading)',
                padding: '0 10px',
                outline: 'none',
              }}
            >
              <option value="x86_64">x86_64</option>
              <option value="arm64">arm64</option>
              <option value="aarch64">aarch64</option>
            </select>
          </label>
        </div>
        <TextInput
          label="包名/文件名"
          required
          placeholder="例如: device-backend-v2.0.0-x86_64.tar.gz"
          value={form.name}
          onValueChange={name => onFormChange({ ...form, name })}
        />
        <TextInput
          label="来源"
          placeholder="例如: CI 构建 #3000"
          value={form.source}
          onValueChange={source => onFormChange({ ...form, source })}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextInput
            label="文件大小"
            placeholder="例如: 24.6 MB"
            value={form.fileSize}
            onValueChange={fileSize => onFormChange({ ...form, fileSize })}
          />
          <TextInput
            label="发布说明"
            placeholder="例如: 正式发布版本"
            value={form.releaseNotes}
            onValueChange={releaseNotes => onFormChange({ ...form, releaseNotes })}
          />
        </div>
        <TextAreaField
          label="功能描述"
          placeholder="描述该版本的更新内容..."
          value={form.description}
          onValueChange={description => onFormChange({ ...form, description })}
        />
      </div>
    </ArcoModal>
  );
}

export function ProductVersionManager() {
  const [categories, setCategories] = useState<ProductCategory[]>(buildInitialData);
  const [revision, setRevision] = useState(0);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>('moying');
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set(['controllers', 'arms']));
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addBrandOpen, setAddBrandOpen] = useState(false);
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [newBrandCatId, setNewBrandCatId] = useState('');
  const [newBrandSubId, setNewBrandSubId] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandSoftware, setNewBrandSoftware] = useState('');
  // Batch publish
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchVersion, setBatchVersion] = useState('');
  const [batchSelection, setBatchSelection] = useState<Set<string>>(new Set());
  const [batchCatId, setBatchCatId] = useState('');
  const [batchSubId, setBatchSubId] = useState('');
  const [form, setForm] = useState<PackageForm>(emptyForm);
  const [editPackage, setEditPackage] = useState<ProductPackage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductPackage | null>(null);

  const brand = useMemo(() => findBrand(categories, selectedBrandId), [categories, selectedBrandId, revision]);
  const versions = useMemo(() => {
    if (!brand) return [];
    const keyword = query.trim().toLowerCase();
    return brand.versions
      .map(versionGroup => ({
        ...versionGroup,
        packages: versionGroup.packages.filter(pkg =>
          !keyword ||
          pkg.name.toLowerCase().includes(keyword) ||
          pkg.version.toLowerCase().includes(keyword) ||
          pkg.description.toLowerCase().includes(keyword) ||
          pkg.architecture.toLowerCase().includes(keyword)
        ),
      }))
      .filter(versionGroup => versionGroup.packages.length > 0);
  }, [brand, query, revision]);

  const totalPackages = versions.reduce((sum, versionGroup) => sum + versionGroup.packages.length, 0);

  // Derived: resolve category from name or id
  const resolvedCatId = categories.find(c => c.id === newBrandCatId || c.name === newBrandCatId)?.id;
  const createBrandCat = categories.find(c => c.id === resolvedCatId) ?? categories[0];
  const createBrandSub = createBrandCat?.subcategories.find(s => s.name === newBrandSubId || s.id === newBrandSubId);

  function handleCreateProduct() {
    const catName = categories.find(c => c.id === newBrandCatId)?.name ?? newBrandCatId;
    if (!catName.trim()) return;

    const next = categories.map(c => ({ ...c, subcategories: c.subcategories.map(s => ({ ...s, brands: [...s.brands] })) }));

    // Find or create category
    let cat = next.find(c => c.id === newBrandCatId || c.name === newBrandCatId);
    if (!cat) {
      cat = { id: catName.trim().toLowerCase().replace(/\s+/g, '-'), name: catName.trim(), icon: 'controller', subcategories: [] };
      next.push(cat);
    }

    // Find or create subcategory
    const subName = newBrandSubId.trim();
    let sub: ProductSubcategory | undefined;
    if (subName) {
      sub = cat.subcategories.find(s => s.name === subName || s.id === subName);
      if (!sub) {
        sub = { id: subName.toLowerCase().replace(/\s+/g, '-'), name: subName, brands: [] };
        cat.subcategories.push(sub);
      }
    } else {
      sub = cat.subcategories[0];
      if (!sub) {
        sub = { id: 'default', name: '默认', brands: [] };
        cat.subcategories.push(sub);
      }
    }

    // Create brand if name provided
    const name = newBrandName.trim();
    if (name) {
      sub.brands.push({
        id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36),
        name,
        versions: [],
      });
    }

    setCategories(next);
    setNewBrandName('');
    setNewBrandSoftware('');
    setCreateProductOpen(false);
  }

  function openCreateProduct() {
    setNewBrandCatId(categories[0]?.id ?? '');
    setNewBrandSubId('');
    setNewBrandName('');
    setNewBrandSoftware('');
    setCreateProductOpen(true);
  }

  function openBatchPublish() {
    setBatchVersion('');
    setBatchSelection(new Set());
    setBatchCatId(categories[0]?.id ?? '');
    setBatchSubId('');
    setBatchOpen(true);
  }

  // Batch publish helpers
  const batchCat = categories.find(c => c.id === batchCatId) ?? categories[0];
  const batchSub = batchCat?.subcategories.find(s => s.id === batchSubId) ?? batchCat?.subcategories[0];
  const allBatchVersions = (() => {
    const vs = new Set<string>();
    for (const cat of categories)
      for (const sub of cat.subcategories)
        for (const b of sub.brands)
          for (const v of b.versions)
            vs.add(v.version);
    return [...vs].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  })();

  function toggleBatchBrand(brandId: string) {
    setBatchSelection(prev => { const n = new Set(prev); n.has(brandId) ? n.delete(brandId) : n.add(brandId); return n; });
  }

  function handleBatchPublish() {
    if (!batchVersion.trim() || batchSelection.size === 0) return;
    const target = batchVersion.trim();
    let count = 0;
    for (const cat of categories) {
      for (const sub of cat.subcategories) {
        for (const b of sub.brands) {
          if (!batchSelection.has(b.id)) continue;
          let vg = b.versions.find(v => v.version === target);
          if (!vg) { vg = { version: target, packages: [] }; b.versions.unshift(vg); }
          const rcPkg = vg.packages.find(p => p.version.includes('-rc'));
          if (rcPkg) {
            rcPkg.version = target;
            rcPkg.releaseNotes = '正式发布版本（由 RC 升级）';
            count++;
          }
        }
      }
    }
    setRevision(v => v + 1);
    setBatchOpen(false);
    alert('批量发布完成：' + count + ' 个品牌已发布 ' + target);
  }

  function toggleSubcategory(id: string) {
    setExpandedSubs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openCreate() {
    setForm(emptyForm);
    setCreateOpen(true);
  }

  function handleCreate() {
    if (!brand || !form.name.trim() || !form.version.trim()) return;
    const pkg: ProductPackage = {
      id: `pkg-${Date.now()}`,
      name: form.name.trim(),
      version: form.version.trim(),
      source: form.source.trim() || '手动上传',
      description: form.description.trim(),
      releaseNotes: form.releaseNotes.trim() || '手动发布',
      architecture: form.architecture,
      fileSize: form.fileSize.trim() || '-',
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(/\//g, '-'),
    };
    const versionGroup = brand.versions.find(item => item.version === pkg.version);
    if (versionGroup) versionGroup.packages.unshift(pkg);
    else brand.versions.unshift({ version: pkg.version, packages: [pkg] });
    setRevision(value => value + 1);
    setCreateOpen(false);
  }

  function openEdit(pkg: ProductPackage) {
    setEditPackage(pkg);
    setForm({
      name: pkg.name,
      version: pkg.version,
      source: pkg.source,
      description: pkg.description,
      releaseNotes: pkg.releaseNotes,
      architecture: pkg.architecture,
      fileSize: pkg.fileSize,
    });
    setEditOpen(true);
  }

  function handleSaveEdit() {
    if (!editPackage || !brand || !form.name.trim() || !form.version.trim()) return;
    for (const versionGroup of brand.versions) {
      const index = versionGroup.packages.findIndex(pkg => pkg.id === editPackage.id);
      if (index !== -1) {
        versionGroup.packages[index] = {
          ...versionGroup.packages[index],
          ...form,
          name: form.name.trim(),
          version: form.version.trim(),
        };
        break;
      }
    }
    setRevision(value => value + 1);
    setEditOpen(false);
    setEditPackage(null);
  }

  function openDelete(pkg: ProductPackage) {
    setDeleteTarget(pkg);
    setDeleteOpen(true);
  }

  function handleDelete() {
    if (!deleteTarget || !brand) return;
    for (const versionGroup of brand.versions) {
      const index = versionGroup.packages.findIndex(pkg => pkg.id === deleteTarget.id);
      if (index !== -1) {
        versionGroup.packages.splice(index, 1);
        break;
      }
    }
    brand.versions = brand.versions.filter(versionGroup => versionGroup.packages.length > 0);
    setRevision(value => value + 1);
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  return (
    <div style={{
      height: '100%',
      minHeight: 0,
      display: 'flex',
      gap: 16,
      padding: 16,
      background: 'var(--app-bg)',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      <aside style={{
        width: 292,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        borderRadius: 16,
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        boxShadow: CARD_SHADOW,
        overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--app-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'var(--app-heading)', fontSize: 18, fontWeight: 700 }}>产品分类</div>
              <div style={{ color: 'var(--app-muted)', fontSize: 12, marginTop: 3 }}>按产品线管理软件包版本</div>
            </div>
            <ArcoIconButton
              size="small"
              icon={<Plus size={16} />}
              aria-label="创建产品"
              title="创建产品"
              onClick={openCreateProduct}
            />
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <CategoryTree
            categories={categories}
            selectedBrandId={selectedBrandId}
            expandedSubs={expandedSubs}
            onToggleSub={toggleSubcategory}
            onSelectBrand={setSelectedBrandId}
          />
        </div>
      </aside>

      <main style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 16,
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        boxShadow: CARD_SHADOW,
        overflow: 'hidden',
      }}>
        <header style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 18,
          padding: '20px 22px 16px',
          borderBottom: '1px solid var(--app-border)',
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                background: 'var(--app-accent-soft)',
                color: 'var(--app-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Layers size={17} />
              </span>
              <h1 style={{ color: 'var(--app-heading)', fontSize: 20, fontWeight: 700, margin: 0, lineHeight: 1.25 }}>
                {brand ? brand.name : '产品包/版本管理'}
              </h1>
              {brand && <Badge tone="accent">{totalPackages} 个包</Badge>}
            </div>
            {brand && (
              <div style={{ color: 'var(--app-muted)', fontSize: 12, marginTop: 6 }}>
                {brand.versions.length} 个版本 · 最近更新 {brand.versions[0]?.packages[0]?.createdAt ?? '-'}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 240 }}>
              <TextInput
                placeholder="搜索包名或版本..."
                value={query}
                onValueChange={setQuery}
                startContent={<Search size={14} />}
              />
            </div>
            {brand && (
              <ArcoButton type="primary" icon={<Layers size={14} />} onClick={openBatchPublish}>
                一键发布
              </ArcoButton>
            )}
          </div>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 18, background: 'var(--app-soft)' }}>
          {!brand ? (
            <div style={{ textAlign: 'center', padding: '72px 0', color: 'var(--app-muted)', fontSize: 13 }}>
              <Layers size={40} style={{ margin: '0 auto 12px', color: 'var(--app-subtle)' }} />
              <p style={{ margin: 0 }}>请从左侧选择一个品牌/型号</p>
            </div>
          ) : versions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '72px 0', color: 'var(--app-muted)', fontSize: 13 }}>
              <Search size={40} style={{ margin: '0 auto 12px', color: 'var(--app-subtle)' }} />
              <p style={{ margin: 0 }}>{query ? '没有匹配的包' : '暂无版本包，点击“发布新版本”开始'}</p>
            </div>
          ) : (
            versions.map(versionGroup => (
              <VersionAccordion
                key={versionGroup.version}
                group={versionGroup}
                onEditPackage={openEdit}
                onDeletePackage={openDelete}
                onDownloadPackage={pkg => window.alert(`下载 ${pkg.name}`)}
              />
            ))
          )}
        </div>
      </main>

      <SoftwarePackageModal
        title="发布新版本"
        icon={<Upload size={17} />}
        open={createOpen}
        onOpenChange={setCreateOpen}
        form={form}
        onFormChange={setForm}
        onSubmit={handleCreate}
        submitLabel="发布"
        submitDisabled={!form.name.trim() || !form.version.trim()}
      />

      <SoftwarePackageModal
        title="编辑包信息"
        icon={<Edit3 size={17} />}
        open={editOpen}
        onOpenChange={setEditOpen}
        form={form}
        onFormChange={setForm}
        onSubmit={handleSaveEdit}
        submitLabel="保存"
        submitDisabled={!form.name.trim() || !form.version.trim()}
      />

      <ArcoModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="删除安装包"
        status="danger"
        icon={<Trash2 size={17} />}
        width={420}
        footer={(
          <>
            <ArcoButton onClick={() => setDeleteOpen(false)}>取消</ArcoButton>
            <ArcoButton type="primary" status="danger" onClick={handleDelete}>删除</ArcoButton>
          </>
        )}
      >
        <p style={{ color: 'var(--app-muted)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
          确认删除「{deleteTarget?.name ?? ''}」吗？删除后将无法恢复。
        </p>
      </ArcoModal>

      {/* ── Create Product Model ── */}
      <ArcoModal
        open={createProductOpen}
        onOpenChange={setCreateProductOpen}
        title="创建产品型号"
        width={640}
        footer={(
          <>
            <ArcoButton onClick={() => setCreateProductOpen(false)}>取消</ArcoButton>
            <ArcoButton type="primary" onClick={handleCreateProduct}>创建产品型号</ArcoButton>
          </>
        )}
      >
        <div style={{ display: 'grid', gap: 18 }}>
          {/* 产品路径 — 横向联级 */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--app-text)', marginBottom: 8 }}>
              产品路径 <span style={{ color: 'var(--app-danger)' }}>*</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--app-soft)', borderRadius: 12, border: '1px solid var(--app-border)', overflow: 'hidden' }}>
              <input
                list="cat-list"
                value={categories.find(c => c.id === newBrandCatId)?.name ?? newBrandCatId}
                onChange={e => {
                  const v = e.target.value;
                  const m = categories.find(c => c.name === v);
                  setNewBrandCatId(m ? m.id : v);
                  setNewBrandSubId('');
                }}
                placeholder="产品类型"
                style={{ flex: '1 1 0', minWidth: 0, height: 46, padding: '0 16px', border: 'none', background: 'transparent', color: 'var(--app-heading)', fontSize: 14, fontWeight: 500, outline: 'none', borderRight: '1px solid var(--app-border)' }}
              />
              <datalist id="cat-list">
                {categories.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
              <span style={{ color: 'var(--app-muted)', padding: '0 4px', fontSize: 14, flexShrink: 0 }}>/</span>
              <input
                list="sub-list"
                value={newBrandSubId}
                onChange={e => setNewBrandSubId(e.target.value)}
                placeholder="子品类"
                style={{ flex: '1 1 0', minWidth: 0, height: 46, padding: '0 16px', border: 'none', background: 'transparent', color: 'var(--app-text)', fontSize: 14, outline: 'none', borderRight: '1px solid var(--app-border)' }}
              />
              <datalist id="sub-list">
                {createBrandCat?.subcategories.map(s => <option key={s.id} value={s.name} />)}
              </datalist>
              <span style={{ color: 'var(--app-muted)', padding: '0 4px', fontSize: 14, flexShrink: 0 }}>/</span>
              <input
                value={newBrandName}
                onChange={e => setNewBrandName(e.target.value)}
                placeholder="产品型号"
                style={{ flex: '1 1 0', minWidth: 0, height: 46, padding: '0 16px', border: 'none', background: 'transparent', color: 'var(--app-text)', fontSize: 14, outline: 'none' }}
              />
            </div>
          </div>

          {/* 关联软件 — 条件显示 */}
          {newBrandSubId.trim() !== '' && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--app-text)', marginBottom: 6 }}>关联软件</label>
              <ArcoTextInput
                value={newBrandSoftware}
                onChange={e => setNewBrandSoftware(e.target.value)}
                placeholder="输入关联软件包名，逗号分隔"
                style={{ width: '100%', height: 44 }}
              />
            </div>
          )}

          {/* 路径预览 */}
          <div style={{ background: 'var(--app-accent-soft)', borderRadius: 12, padding: '14px 18px', border: '1px solid var(--app-accent-border)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--app-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>路径预览</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--app-heading)', fontSize: 13, fontWeight: 600 }}>
                {(categories.find(c => c.id === newBrandCatId)?.name ?? newBrandCatId) || '未选择'}
              </span>
              {newBrandSubId.trim() && (
                <>
                  <ChevronRight size={13} color="var(--app-muted)" />
                  <span style={{ color: 'var(--app-text)', fontSize: 13 }}>{newBrandSubId.trim()}</span>
                </>
              )}
              {newBrandName.trim() && (
                <>
                  <ChevronRight size={13} color="var(--app-muted)" />
                  <span style={{ color: 'var(--app-accent)', fontSize: 13, fontWeight: 600 }}>{newBrandName.trim()}</span>
                </>
              )}
              {!newBrandName.trim() && !newBrandSubId.trim() && (
                <span style={{ color: 'var(--app-muted)', fontSize: 12 }}>—</span>
              )}
            </div>
          </div>
        </div>
      </ArcoModal>

            
            

                        {/* ── Batch Publish Modal ── */}
      <ArcoModal
        open={batchOpen}
        onOpenChange={setBatchOpen}
        title="一键发布"
        width={700}
        footer={(
          <>
            <ArcoButton onClick={() => setBatchOpen(false)}>关闭</ArcoButton>
            <ArcoButton type="primary" onClick={handleBatchPublish} disabled={!batchVersion.trim() || batchSelection.size === 0}>
              一键发布（{batchSelection.size} 个品牌）
            </ArcoButton>
          </>
        )}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '150px 150px 1fr 170px', gap: 1, background: 'var(--app-border)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--app-border)' }}>
          <div style={{ background: 'var(--app-surface)', padding: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--app-muted)', padding: '4px 8px', marginBottom: 4 }}>产品分组</div>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => { setBatchCatId(cat.id); setBatchSubId(''); }}
                style={{ width: '100%', textAlign: 'left', padding: '7px 10px', border: 'none', borderRadius: 6, cursor: 'pointer',
                  background: batchCatId === cat.id ? 'var(--app-accent-soft)' : 'transparent',
                  color: batchCatId === cat.id ? 'var(--app-accent)' : 'var(--app-text)', fontSize: 12, fontWeight: batchCatId === cat.id ? 600 : 400, marginBottom: 2 }}>
                {cat.name}
              </button>
            ))}
          </div>
          <div style={{ background: 'var(--app-surface)', padding: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--app-muted)', padding: '4px 8px', marginBottom: 4 }}>子产品</div>
            {batchCat?.subcategories.map(sub => (
              <button key={sub.id} onClick={() => setBatchSubId(sub.id)}
                style={{ width: '100%', textAlign: 'left', padding: '7px 10px', border: 'none', borderRadius: 6, cursor: 'pointer',
                  background: batchSubId === sub.id ? 'var(--app-accent-soft)' : 'transparent',
                  color: batchSubId === sub.id ? 'var(--app-accent)' : 'var(--app-text)', fontSize: 12, fontWeight: batchSubId === sub.id ? 600 : 400, marginBottom: 2 }}>
                {sub.name}
              </button>
            ))}
          </div>
          <div style={{ background: 'var(--app-surface)', padding: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--app-muted)', padding: '4px 8px', marginBottom: 4 }}>{batchSub?.name ?? '品牌'}（勾选发布）</div>
            <div style={{ maxHeight: 260, overflow: 'auto' }}>
              {(batchSub?.brands ?? []).map(br => {
                const checked = batchSelection.has(br.id);
                return (
                  <label key={br.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                    background: checked ? 'var(--app-accent-soft)' : 'transparent', marginBottom: 2 }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleBatchBrand(br.id)} style={{ accentColor: 'var(--app-accent)', width: 14, height: 14, flexShrink: 0 }} />
                    <span style={{ color: checked ? 'var(--app-accent)' : 'var(--app-text)', fontSize: 12, fontWeight: checked ? 600 : 400 }}>{br.name}</span>
                  </label>
                );
              })}
              {(!batchSub || batchSub.brands.length === 0) && <div style={{ color: 'var(--app-muted)', fontSize: 11, padding: 12, textAlign: 'center' }}>暂无品牌</div>}
            </div>
          </div>
          <div style={{ background: 'var(--app-surface)', padding: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--app-muted)', padding: '4px 8px', marginBottom: 4 }}>共同版本</div>
            <div style={{ maxHeight: 260, overflow: 'auto' }}>
              {allBatchVersions.map(ver => {
                const active = batchVersion === ver;
                return (
                  <label key={ver} onClick={() => setBatchVersion(ver)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, cursor: 'pointer',
                    background: active ? 'var(--app-accent-soft)' : 'transparent', marginBottom: 2 }}>
                    <input type="radio" name="batchVersion" checked={active} onChange={() => setBatchVersion(ver)} style={{ accentColor: 'var(--app-accent)', width: 14, height: 14, flexShrink: 0 }} />
                    <div>
                      <span style={{ color: active ? 'var(--app-accent)' : 'var(--app-text)', fontSize: 13, fontWeight: active ? 600 : 400 }}>{ver}</span>
                      <span style={{ color: 'var(--app-muted)', fontSize: 10, display: 'block' }}>正式版本</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      
        {/* RC preview */}
        {batchVersion.trim() && batchSelection.size > 0 && (() => {
          const preview: { brandName: string; pkg: any; fromVer: string }[] = [];
          for (const cat of categories)
            for (const sub of cat.subcategories)
              for (const b of sub.brands)
                if (batchSelection.has(b.id)) {
                  const vg = b.versions.find(v => v.version === batchVersion);
                  if (vg) for (const p of vg.packages)
                    if (p.version.includes('-rc')) preview.push({ brandName: b.name, pkg: p, fromVer: p.version });
                }
          if (preview.length === 0) return null;
          return (
            <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 10, background: 'var(--app-soft)', border: '1px solid var(--app-border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-heading)', marginBottom: 8 }}>将发布以下测试包</div>
              <div style={{ display: 'grid', gap: 6 }}>
                {preview.map((p, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-accent)' }}>{p.brandName}</span>
                    <code style={{ fontSize: 11, color: 'var(--app-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.pkg.name}</code>
                    <span style={{ fontSize: 11, color: 'var(--app-muted)', whiteSpace: 'nowrap' }}>{p.fromVer} → <span style={{ color: 'var(--app-accent)', fontWeight: 600 }}>{batchVersion}</span></span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </ArcoModal>
    </div>
  );
}
