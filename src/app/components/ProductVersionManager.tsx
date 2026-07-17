import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Box,
  Cable,
  Check,
  ChevronDown,
  ChevronRight,
  Cpu,
  Download,
  Edit3,
  Folder,
  GitBranch,
  Layers,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  ServerCog,
  Trash2,
  Upload,
} from 'lucide-react';
import { ArcoButton, ArcoIconButton, ArcoModal, ArcoTag, ArcoTextArea, ArcoTextInput } from './HeroUI';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export interface ProductPackage {
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

export interface ProductVersionGroup {
  version: string;
  packages: ProductPackage[];
}

export interface ProductBrand {
  id: string;
  name: string;
  identifier?: string;
  description?: string;
  relatedSoftwareIds?: string[];
  versions: ProductVersionGroup[];
}

export interface ProductSubcategory {
  id: string;
  name: string;
  identifier?: string;
  description?: string;
  relatedSoftwareIds?: string[];
  brands: ProductBrand[];
}

export interface ProductCategory {
  id: string;
  name: string;
  identifier?: string;
  description?: string;
  icon: 'controller' | 'external' | 'service';
  subcategories: ProductSubcategory[];
}

type PackageForm = Pick<ProductPackage, 'name' | 'version' | 'source' | 'description' | 'releaseNotes' | 'architecture' | 'fileSize'>;
type TaxonomyKind = 'category' | 'subcategory';
type TaxonomyMode = 'create' | 'edit';
type ProductFormMode = 'cascade' | 'category-context' | 'subcategory-context' | 'edit';
type ProductWizardStep = 'category' | 'subcategory' | 'product';

interface TaxonomyFormState {
  open: boolean;
  kind: TaxonomyKind;
  mode: TaxonomyMode;
  categoryId: string | null;
  subcategoryId: string | null;
  name: string;
  icon: ProductCategory['icon'];
}

interface TreeDeleteTarget {
  kind: CategoryTreeNodeAction['kind'];
  categoryId: string;
  subcategoryId?: string;
  brandId?: string;
}

const CARD_SHADOW = 'var(--ds-shadow-card)';

const emptyForm: PackageForm = {
  name: '',
  version: '',
  source: '',
  description: '',
  releaseNotes: '',
  architecture: 'x86_64',
  fileSize: '',
};

export function buildInitialData(): ProductCategory[] {
  return [
    {
      id: 'controller',
      name: '控制器类产品',
      identifier: 'controller-products',
      description: '控制器、机械臂及运动控制相关软件产品。',
      icon: 'controller',
      subcategories: [
        {
          id: 'controllers',
          name: '控制器',
          identifier: 'controllers',
          description: '机器人核心控制器与运行时软件。',
          relatedSoftwareIds: ['moying'],
          brands: [
            {
              id: 'moying',
              name: '墨影控制器',
              identifier: 'shadow-controller',
              description: '墨影机器人核心控制器软件，提供设备接入、运动控制与状态管理能力。',
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
  return <ArcoTag tone={tone}>{children}</ArcoTag>;
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
  disabled = false,
}: {
  label?: string;
  required?: boolean;
  startContent?: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
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
          disabled={disabled}
          onChange={event => onValueChange(event.target.value)}
          style={{ height: 40, paddingLeft: startContent ? 36 : 13 }}
        />
      </div>
    </label>
  );
}

function EditableCombobox({
  label,
  required = false,
  value,
  options,
  placeholder,
  onValueChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  options: { id: string; label: string }[];
  placeholder: string;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const keyword = value.trim().toLowerCase();
  const visibleOptions = options.filter(option => (
    !keyword || option.label.toLowerCase().includes(keyword)
  ));
  const exactMatch = options.some(option => option.label.trim().toLowerCase() === keyword);

  return (
    <div
      style={{ position: 'relative', minWidth: 0 }}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <FieldLabel required={required}>{label}</FieldLabel>
      <div style={{ position: 'relative' }}>
        <ArcoTextInput
          value={value}
          onFocus={() => setOpen(true)}
          onChange={event => {
            onValueChange(event.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          style={{ height: 40, paddingRight: 40 }}
        />
        <button
          type="button"
          aria-label={`${label}展开选项`}
          onClick={() => setOpen(current => !current)}
          style={{ position: 'absolute', top: 4, right: 4, width: 32, height: 32, border: 0, borderRadius: 8, background: 'transparent', color: 'var(--app-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }} />
        </button>
      </div>

      {open && (
        <div role="listbox" style={{ position: 'absolute', zIndex: 30, top: 'calc(100% + 6px)', left: 0, right: 0, maxHeight: 224, overflowY: 'auto', padding: 6, border: '1px solid var(--app-border)', borderRadius: 12, background: 'var(--app-surface)', boxShadow: 'var(--ds-shadow-card)' }}>
          {visibleOptions.map(option => {
            const selected = option.label.trim().toLowerCase() === keyword;
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onValueChange(option.label);
                  setOpen(false);
                }}
                style={{ width: '100%', height: 40, padding: '0 10px', border: 0, borderRadius: 8, background: selected ? 'var(--app-accent-soft)' : 'transparent', color: selected ? 'var(--app-accent)' : 'var(--app-text)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 14, textAlign: 'left', cursor: 'pointer' }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.label}</span>
                {selected && <Check size={15} />}
              </button>
            );
          })}
          {keyword && !exactMatch && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ width: '100%', minHeight: 40, padding: '7px 10px', border: 0, borderRadius: 8, background: 'var(--app-accent-soft)', color: 'var(--app-accent)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, textAlign: 'left', cursor: 'pointer' }}
            >
              <Plus size={15} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>新建“{value.trim()}”</span>
            </button>
          )}
          {!keyword && visibleOptions.length === 0 && (
            <div style={{ padding: '16px 10px', color: 'var(--app-muted)', fontSize: 14, textAlign: 'center' }}>暂无可选项，可直接输入新名称</div>
          )}
        </div>
      )}
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onValueChange,
  placeholder,
  disabled = false,
}: {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label style={{ display: 'block', minWidth: 0 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <ArcoTextArea
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={event => onValueChange(event.target.value)}
        style={{ minHeight: 86 }}
      />
    </label>
  );
}

export type CategoryTreeNodeAction = {
  action: 'add' | 'edit' | 'delete';
  kind: 'category' | 'subcategory' | 'brand';
  categoryId: string;
  subcategoryId?: string;
  brandId?: string;
};

export function CategoryTree({
  categories,
  selectedBrandId,
  expandedCategories,
  expandedSubs,
  onToggleCategory,
  onToggleSub,
  onSelectBrand,
  onNodeAction,
}: {
  categories: ProductCategory[];
  selectedBrandId: string | null;
  expandedCategories?: Set<string>;
  expandedSubs: Set<string>;
  onToggleCategory?: (id: string) => void;
  onToggleSub: (id: string) => void;
  onSelectBrand?: (id: string) => void;
  onNodeAction?: (action: CategoryTreeNodeAction) => void;
}) {
  const [localExpandedCategories, setLocalExpandedCategories] = useState<Set<string>>(
    () => new Set(categories.map(category => category.id)),
  );
  const visibleExpandedCategories = expandedCategories ?? localExpandedCategories;

  function toggleCategory(categoryId: string) {
    if (onToggleCategory) {
      onToggleCategory(categoryId);
      return;
    }
    setLocalExpandedCategories(current => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  function nodeMenu(label: string, actionBase: Omit<CategoryTreeNodeAction, 'action'>) {
    if (!onNodeAction) return null;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="taxonomy-tree-action"
            aria-label={`${label} 更多操作`}
            title="更多操作"
          >
            <MoreHorizontal size={15} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="heroui-tree-menu">
          <DropdownMenuItem className="heroui-tree-menu__item" onSelect={() => onNodeAction({ ...actionBase, action: 'add' })}>
            <Plus size={16} strokeWidth={1.8} />
            <span data-slot="label">新增</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="heroui-tree-menu__item" onSelect={() => onNodeAction({ ...actionBase, action: 'edit' })}>
            <Pencil size={16} strokeWidth={1.8} />
            <span data-slot="label">编辑</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="heroui-tree-menu__item" variant="destructive" onSelect={() => onNodeAction({ ...actionBase, action: 'delete' })}>
            <Trash2 size={16} strokeWidth={1.8} />
            <span data-slot="label">删除</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="taxonomy-tree">
      {categories.map(category => {
        const categoryExpanded = visibleExpandedCategories.has(category.id);
        return (
        <section key={category.id} className="taxonomy-tree-section">
          <div className="taxonomy-tree-node taxonomy-tree-category">
            <button
              type="button"
              className="taxonomy-tree-category-main"
              onClick={() => toggleCategory(category.id)}
              aria-expanded={categoryExpanded}
              title={category.name}
            >
              <span className="taxonomy-tree-folder">
                <Folder size={18} strokeWidth={1.8} />
              </span>
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{category.name}</span>
              {categoryExpanded
                ? <ChevronDown className="taxonomy-tree-expand-icon" size={18} />
                : <ChevronRight className="taxonomy-tree-expand-icon" size={18} />}
            </button>
            {nodeMenu(category.name, { kind: 'category', categoryId: category.id })}
          </div>

          {categoryExpanded && (
            <div className="taxonomy-tree-category-children">
              {category.subcategories.map(subcategory => {
                const expanded = expandedSubs.has(subcategory.id);
                return (
                  <div key={subcategory.id} className="taxonomy-tree-subcategory-branch">
                    <div className="taxonomy-tree-node taxonomy-tree-subcategory">
                      <button
                        type="button"
                        className="taxonomy-tree-subcategory-main"
                        onClick={() => onToggleSub(subcategory.id)}
                        aria-expanded={expanded}
                        title={subcategory.name}
                      >
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subcategory.name}</span>
                      </button>
                      {nodeMenu(subcategory.name, { kind: 'subcategory', categoryId: category.id, subcategoryId: subcategory.id })}
                    </div>

                    {expanded && (
                      <div className="taxonomy-tree-brand-list">
                        {subcategory.brands.map(brand => {
                          const active = brand.id === selectedBrandId;
                          const rowStyle: CSSProperties = {
                            color: active ? 'var(--app-accent)' : 'var(--app-text)',
                            fontSize: 14,
                            fontWeight: active ? 600 : 400,
                            cursor: onSelectBrand ? 'pointer' : 'default',
                          };
                          const content = (
                            <>
                              <span className="product-tree-dot" aria-hidden="true" />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand.name}</span>
                            </>
                          );

                          if (!onSelectBrand) {
                            return (
                              <div key={brand.id} className={`taxonomy-tree-node product-tree-item${active ? ' is-active' : ''}`}>
                                <div className="product-tree-main" style={rowStyle} title={brand.name}>{content}</div>
                              </div>
                            );
                          }

                          return (
                            <div key={brand.id} className={`taxonomy-tree-node product-tree-item${active ? ' is-active' : ''}`}>
                              <button
                                type="button"
                                className="product-tree-main"
                                onClick={() => onSelectBrand(brand.id)}
                                style={rowStyle}
                                title={brand.name}
                              >
                                {content}
                              </button>
                              {nodeMenu(brand.name, { kind: 'brand', categoryId: category.id, subcategoryId: subcategory.id, brandId: brand.id })}
                            </div>
                          );
                        })}
                        {onNodeAction && (
                          <button
                            type="button"
                            className="taxonomy-tree-inline-add"
                            onClick={() => onNodeAction({ action: 'add', kind: 'brand', categoryId: category.id, subcategoryId: subcategory.id })}
                          >
                            <Plus size={16} />
                            添加产品
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {onNodeAction && (
                <button
                  type="button"
                  className="taxonomy-tree-inline-add taxonomy-tree-add-subcategory"
                  onClick={() => onNodeAction({ action: 'add', kind: 'category', categoryId: category.id })}
                >
                  <Plus size={16} />
                  添加子品类
                </button>
              )}
            </div>
          )}
        </section>
      )})}
    </div>
  );
}


function VersionAccordion({
  group,
  selectedPkgIds,
  onTogglePkg,
  onBatchDelete,
  onEditPackage,
  onDeletePackage,
  onDownloadPackage,
}: {
  group: ProductVersionGroup;
  selectedPkgIds: Set<string>;
  onTogglePkg: (pkgId: string) => void;
  onBatchDelete: () => void;
  onEditPackage: (pkg: ProductPackage) => void;
  onDeletePackage: (pkg: ProductPackage) => void;
  onDownloadPackage: (pkg: ProductPackage) => void;
}) {
  const hasRC = group.packages.some(pkg => isRC(pkg.version));
  const [isOpen, setIsOpen] = useState(group.version === '1.8.0');

  return (
    <section style={{
      borderRadius: 'var(--app-inner-radius)',
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
        {(() => {
          const selCount = group.packages.filter(p => selectedPkgIds.has(p.id)).length;
          const total = group.packages.length;
          if (selCount > 0) {
            return (
              <>
                <span style={{ color: 'var(--app-accent)', fontSize: 12, fontWeight: 500 }}>已选 {selCount}</span>
                <ArcoButton size="small" onClick={e => {
                  e.stopPropagation();
                  const ids = group.packages.map(p => p.id);
                  const allSel = ids.every(id => selectedPkgIds.has(id));
                  ids.forEach(id => { if (allSel) onTogglePkg(id); else if (!selectedPkgIds.has(id)) onTogglePkg(id); });
                }}>
                  {group.packages.every(p => selectedPkgIds.has(p.id)) ? '取消' : '全选'}
                </ArcoButton>
                <ArcoButton size="small" status="danger" icon={<Trash2 size={12} />} onClick={e => {
                  e.stopPropagation();
                  group.packages = group.packages.filter(p => !selectedPkgIds.has(p.id));
                  onBatchDelete();
                }}>
                  删除
                </ArcoButton>
              </>
            );
          }
          return <Badge>{total} 个包</Badge>;
        })()}
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
                  gap: 12,
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--app-border)',
                  background: selectedPkgIds.has(pkg.id) ? 'var(--app-accent-soft)' : 'transparent',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedPkgIds.has(pkg.id)}
                  onChange={() => onTogglePkg(pkg.id)}
                  style={{ accentColor: 'var(--app-accent)', width: 15, height: 15, flexShrink: 0, cursor: 'pointer' }}
                />
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
                      fontSize: 14,
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
                      {pkg.description && <span style={{ color: 'var(--app-text)', fontSize: 12 }}>{pkg.description}</span>}
                      {pkg.description && pkg.releaseNotes && <span style={{ color: 'var(--app-border-strong)' }}>·</span>}
                      {pkg.releaseNotes && <span style={{ color: 'var(--app-muted)', fontSize: 12, fontStyle: 'italic' }}>{pkg.releaseNotes}</span>}
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

function findBrandLocation(categories: ProductCategory[], brandId: string | null) {
  if (!brandId) return null;
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      const brand = subcategory.brands.find(item => item.id === brandId);
      if (brand) return { category, subcategory, brand };
    }
  }
  return null;
}

function firstBrandId(categories: ProductCategory[]) {
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      if (subcategory.brands[0]) return subcategory.brands[0].id;
    }
  }
  return null;
}

function SoftwarePackageModal({
  title,
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  submitLabel,
  submitDisabled,
}: {
  title: string;
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
      size="lg"
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

function ProductWizardNav({
  step,
  categoryLabel,
  subcategoryLabel,
  categoryExists,
  subcategoryExists,
  productActionLabel = '新增产品',
  canOpenSubcategory,
  canOpenProduct,
  categoryLocked = false,
  subcategoryLocked = false,
  onStepChange,
}: {
  step: ProductWizardStep;
  categoryLabel: string;
  subcategoryLabel: string;
  categoryExists: boolean;
  subcategoryExists: boolean;
  productActionLabel?: string;
  canOpenSubcategory: boolean;
  canOpenProduct: boolean;
  categoryLocked?: boolean;
  subcategoryLocked?: boolean;
  onStepChange: (step: ProductWizardStep) => void;
}) {
  const item = (
    target: ProductWizardStep,
    label: string,
    clickable: boolean,
    pending: boolean,
  ) => {
    const active = step === target;
    return (
      <button
        type="button"
        disabled={!clickable}
        onClick={() => onStepChange(target)}
        style={{
          height: 40,
          maxWidth: 210,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '0 12px',
          border: 0,
          borderRadius: 8,
          background: active ? 'var(--app-surface)' : 'transparent',
          boxShadow: active ? 'var(--ds-shadow-card)' : 'none',
          color: active ? 'var(--app-accent)' : pending && !clickable ? 'var(--app-subtle)' : 'var(--app-text)',
          fontSize: 14,
          fontWeight: active ? 600 : 500,
          cursor: clickable ? 'pointer' : 'default',
          opacity: pending && !clickable ? 0.62 : 1,
        }}
      >
        {pending && <Plus size={15} />}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      </button>
    );
  };

  const separator = <ChevronRight size={18} color="var(--app-subtle)" style={{ flexShrink: 0 }} />;
  const categoryItem = step === 'category'
    ? item('category', categoryExists ? categoryLabel : '新增产品类型', true, !categoryExists)
    : item('category', categoryLabel || '产品类型', !categoryLocked, false);
  const subcategoryItem = step === 'subcategory'
    ? item('subcategory', subcategoryExists ? subcategoryLabel : '新增子品类', true, !subcategoryExists)
    : item('subcategory', subcategoryLabel || '新增子品类', step === 'category' ? canOpenSubcategory : !subcategoryLocked, step === 'category');
  const productItem = step === 'product'
    ? item('product', productActionLabel, true, productActionLabel.startsWith('新增'))
    : item('product', '新增产品', canOpenProduct, true);

  return (
    <div aria-label="产品层级步骤" style={{ padding: '14px 16px 16px', borderRadius: 12, background: 'var(--app-soft)' }}>
      <div style={{ marginBottom: 10, color: 'var(--app-muted)', fontSize: 12, fontWeight: 500 }}>所属目录</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto' }}>
        {categoryItem}
        {separator}
        {subcategoryItem}
        {step !== 'category' && <>{separator}{productItem}</>}
      </div>
    </div>
  );
}

function RelatedSoftwarePicker({
  options,
  selectedIds,
  query,
  onQueryChange,
  onToggle,
  disabled = false,
}: {
  options: { id: string; name: string; path: string }[];
  selectedIds: string[];
  query: string;
  onQueryChange: (value: string) => void;
  onToggle: (id: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const keyword = query.trim().toLowerCase();
  const visibleOptions = options.filter(option => (
    !keyword || option.name.toLowerCase().includes(keyword) || option.path.toLowerCase().includes(keyword)
  ));

  const selectedOptions = options.filter(option => selectedIds.includes(option.id));

  return (
    <div
      style={{ position: 'relative' }}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <FieldLabel>关联软件</FieldLabel>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(current => !current)}
        style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--app-border)', borderRadius: 8, background: 'var(--app-surface)', color: selectedOptions.length ? 'var(--app-text)' : 'var(--app-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 14, cursor: disabled ? 'default' : 'pointer' }}
      >
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOptions.length === 0
            ? '请选择'
            : selectedOptions.length <= 2
              ? selectedOptions.map(option => option.name).join('、')
              : `${selectedOptions[0].name}等 ${selectedOptions.length} 项`}
        </span>
        <ChevronDown size={16} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }} />
      </button>

      {open && !disabled && (
        <div style={{ position: 'absolute', zIndex: 30, top: 'calc(100% + 6px)', left: 0, right: 0, border: '1px solid var(--app-border)', borderRadius: 12, background: 'var(--app-surface)', boxShadow: 'var(--ds-shadow-card)', overflow: 'hidden' }}>
          <div style={{ position: 'relative', padding: 8, borderBottom: '1px solid var(--app-border)' }}>
            <Search size={16} color="var(--app-muted)" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <ArcoTextInput
              value={query}
              onChange={event => onQueryChange(event.target.value)}
              placeholder="搜索软件"
              style={{ height: 40, paddingLeft: 36, background: 'var(--app-soft)' }}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto', padding: 6 }}>
          {visibleOptions.length === 0 ? (
            <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--app-muted)', fontSize: 14 }}>没有匹配的软件</div>
          ) : visibleOptions.map(option => {
            const selected = selectedIds.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => onToggle(option.id)}
                style={{
                  width: '100%',
                  minHeight: 44,
                  display: 'grid',
                  gridTemplateColumns: '24px minmax(0, 1fr)',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  border: 0,
                  borderRadius: 8,
                  background: selected ? 'var(--app-accent-soft)' : 'transparent',
                  color: selected ? 'var(--app-accent)' : 'var(--app-text)',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <span style={{ width: 18, height: 18, borderRadius: 5, border: `1px solid ${selected ? 'var(--app-accent)' : 'var(--app-border-strong)'}`, background: selected ? 'var(--app-accent)' : 'var(--app-surface)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selected && <Check size={12} strokeWidth={2.5} />}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14, fontWeight: selected ? 600 : 500 }}>{option.name}</span>
                  <span style={{ display: 'block', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--app-muted)', fontSize: 12 }}>{option.path}</span>
                </span>
              </button>
            );
          })}
          </div>
          <div style={{ minHeight: 36, display: 'flex', alignItems: 'center', padding: '0 12px', borderTop: '1px solid var(--app-border)', color: 'var(--app-muted)', fontSize: 12 }}>
            已选 {selectedIds.length} 项
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductVersionManager() {
  const [categories, setCategories] = useState<ProductCategory[]>(buildInitialData);
  const [revision, setRevision] = useState(0);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>('moying');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(['controller']),
  );
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set(['controllers', 'arms']));
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [productFormMode, setProductFormMode] = useState<ProductFormMode>('cascade');
  const [productWizardStep, setProductWizardStep] = useState<ProductWizardStep>('category');
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [taxonomyForm, setTaxonomyForm] = useState<TaxonomyFormState>({
    open: false,
    kind: 'category',
    mode: 'create',
    categoryId: null,
    subcategoryId: null,
    name: '',
    icon: 'controller',
  });
  const [treeDeleteTarget, setTreeDeleteTarget] = useState<TreeDeleteTarget | null>(null);
  const [newBrandCatId, setNewBrandCatId] = useState('');
  const [newCategoryIdentifier, setNewCategoryIdentifier] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newBrandSubId, setNewBrandSubId] = useState('');
  const [newSubcategoryIdentifier, setNewSubcategoryIdentifier] = useState('');
  const [newSubcategoryDescription, setNewSubcategoryDescription] = useState('');
  const [newSubcategorySoftwareIds, setNewSubcategorySoftwareIds] = useState<string[]>([]);
  const [softwareLinkQuery, setSoftwareLinkQuery] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandIdentifier, setNewBrandIdentifier] = useState('');
  const [newBrandDescription, setNewBrandDescription] = useState('');
  const [newBrandSoftwareIds, setNewBrandSoftwareIds] = useState<string[]>([]);
  // Batch publish
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchVersion, setBatchVersion] = useState('');
  const [batchSelection, setBatchSelection] = useState<Set<string>>(new Set());
  const [batchCatIds, setBatchCatIds] = useState<Set<string>>(new Set());
  const [batchSubIds, setBatchSubIds] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<PackageForm>(emptyForm);
  const [editPackage, setEditPackage] = useState<ProductPackage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductPackage | null>(null);
  const [selectedPkgIds, setSelectedPkgIds] = useState<Set<string>>(new Set());

  const activeBrandLocation = useMemo(
    () => findBrandLocation(categories, selectedBrandId),
    [categories, selectedBrandId, revision],
  );
  const brand = activeBrandLocation?.brand ?? null;
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
  const softwareOptions = useMemo(() => categories.flatMap(category => (
    category.subcategories.flatMap(subcategory => subcategory.brands.map(item => ({
      id: item.id,
      name: item.name,
      path: `${category.name} / ${subcategory.name}`,
    })))
  )), [categories]);

  const categoryInput = newBrandCatId.trim();
  const subcategoryInput = newBrandSubId.trim();
  const productNameInput = newBrandName.trim();
  const productIdentifierInput = newBrandIdentifier.trim();
  const productDescriptionInput = newBrandDescription.trim();
  const createBrandCat = categories.find(category => (
    category.id === categoryInput || category.name.trim().toLowerCase() === categoryInput.toLowerCase()
  ));
  const createBrandSub = createBrandCat?.subcategories.find(subcategory => (
    subcategory.id === subcategoryInput || subcategory.name.trim().toLowerCase() === subcategoryInput.toLowerCase()
  ));
  const categoryIdentifierInput = (createBrandCat?.identifier ?? createBrandCat?.id ?? newCategoryIdentifier).trim();
  const categoryDescriptionInput = createBrandCat?.description ?? newCategoryDescription.trim();
  const subcategoryIdentifierInput = (createBrandSub?.identifier ?? createBrandSub?.id ?? newSubcategoryIdentifier).trim();
  const subcategoryDescriptionInput = createBrandSub?.description ?? newSubcategoryDescription.trim();
  const relatedSoftwareIds = createBrandSub?.relatedSoftwareIds ?? newSubcategorySoftwareIds;
  const duplicateCategoryIdentifier = Boolean(!createBrandCat && categoryIdentifierInput && categories.some(category => (
    (category.identifier ?? category.id).trim().toLowerCase() === categoryIdentifierInput.toLowerCase()
  )));
  const duplicateSubcategoryIdentifier = Boolean(!createBrandSub && subcategoryIdentifierInput && categories.some(category => (
    category.subcategories.some(subcategory => (
      (subcategory.identifier ?? subcategory.id).trim().toLowerCase() === subcategoryIdentifierInput.toLowerCase()
    ))
  )));
  const editingBrandLocation = findBrandLocation(categories, editingBrandId);
  const duplicateBrand = createBrandSub?.brands.some(item => (
    item.id !== editingBrandId && item.name.trim().toLowerCase() === productNameInput.toLowerCase()
  ));
  const duplicateIdentifier = Boolean(productIdentifierInput && categories.some(category => (
    category.subcategories.some(subcategory => (
      subcategory.brands.some(item => (
        item.id !== editingBrandId
        && (item.identifier ?? item.id).trim().toLowerCase() === productIdentifierInput.toLowerCase()
      ))
    ))
  )));
  const categoryLocked = productFormMode !== 'cascade';
  const fixedProductContext = productFormMode === 'subcategory-context' || productFormMode === 'edit';
  const subcategoryLocked = fixedProductContext;
  const categoryStepValid = Boolean(categoryInput && categoryIdentifierInput && !duplicateCategoryIdentifier);
  const subcategoryStepValid = Boolean(
    categoryStepValid
    && subcategoryInput
    && subcategoryIdentifierInput
    && !duplicateSubcategoryIdentifier,
  );
  const productStepValid = Boolean(
    subcategoryStepValid
    && productNameInput
    && productIdentifierInput
    && !duplicateBrand
    && !duplicateIdentifier,
  );
  const productFormValid = editingBrandId
    ? Boolean(createBrandCat && createBrandSub && productNameInput && productIdentifierInput && !duplicateBrand && !duplicateIdentifier)
    : fixedProductContext
      ? Boolean(createBrandCat && createBrandSub && productNameInput && productIdentifierInput && !duplicateBrand && !duplicateIdentifier)
      : productWizardStep === 'category'
        ? categoryStepValid
        : productWizardStep === 'subcategory'
          ? subcategoryStepValid
          : productStepValid;
  const currentLayerExists = productWizardStep === 'category'
    ? Boolean(createBrandCat)
    : productWizardStep === 'subcategory'
      ? Boolean(createBrandSub)
      : false;
  const taxonomyDuplicate = taxonomyForm.kind === 'category'
    ? categories.some(category => category.id !== taxonomyForm.categoryId && category.name.trim().toLowerCase() === taxonomyForm.name.trim().toLowerCase())
    : categories
      .find(category => category.id === taxonomyForm.categoryId)
      ?.subcategories.some(subcategory => subcategory.id !== taxonomyForm.subcategoryId && subcategory.name.trim().toLowerCase() === taxonomyForm.name.trim().toLowerCase());
  const taxonomyFormValid = Boolean(taxonomyForm.name.trim() && !taxonomyDuplicate && (
    taxonomyForm.kind === 'category' || taxonomyForm.categoryId
  ));
  const treeDeleteInfo = (() => {
    if (!treeDeleteTarget) return null;
    const category = categories.find(item => item.id === treeDeleteTarget.categoryId);
    if (!category) return null;
    const subcategory = treeDeleteTarget.subcategoryId
      ? category.subcategories.find(item => item.id === treeDeleteTarget.subcategoryId)
      : null;
    const targetBrands = treeDeleteTarget.kind === 'category'
      ? category.subcategories.flatMap(item => item.brands)
      : treeDeleteTarget.kind === 'subcategory'
        ? subcategory?.brands ?? []
        : subcategory?.brands.filter(item => item.id === treeDeleteTarget.brandId) ?? [];
    const versionCount = targetBrands.reduce((sum, item) => sum + item.versions.length, 0);
    const packageCount = targetBrands.reduce((sum, item) => (
      sum + item.versions.reduce((versionSum, version) => versionSum + version.packages.length, 0)
    ), 0);
    if (treeDeleteTarget.kind === 'category') {
      return {
        title: '删除大类',
        label: category.name,
        description: '此操作会同时移除大类下的所有子品类、产品、版本和安装包。',
        impact: `${category.subcategories.length} 个子品类、${targetBrands.length} 个产品、${versionCount} 个版本、${packageCount} 个安装包`,
      };
    }
    if (treeDeleteTarget.kind === 'subcategory') {
      return {
        title: '删除子品类',
        label: subcategory?.name ?? '',
        description: '此操作会同时移除子品类下的所有产品、版本和安装包。',
        impact: `${targetBrands.length} 个产品、${versionCount} 个版本、${packageCount} 个安装包`,
      };
    }
    return {
      title: '删除产品',
      label: targetBrands[0]?.name ?? '',
      description: '此操作会同时移除该产品下的版本和安装包。',
      impact: `${versionCount} 个版本、${packageCount} 个安装包`,
    };
  })();

  function handleCreateProduct() {
    if (!productFormValid) return;
    const currentBrand = editingBrandLocation?.brand;
    const stamp = Date.now().toString(36);
    const next = categories.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({
        ...subcategory,
        brands: subcategory.brands.filter(item => item.id !== editingBrandId),
      })),
    }));

    let targetCategory = next.find(category => (
      category.id === categoryInput || category.name.trim().toLowerCase() === categoryInput.toLowerCase()
    ));
    if (!targetCategory) {
      targetCategory = {
        id: `category-${stamp}`,
        name: categoryInput,
        identifier: categoryIdentifierInput,
        description: categoryDescriptionInput,
        icon: 'controller',
        subcategories: [],
      };
      next.push(targetCategory);
    }
    setExpandedCategories(current => new Set(current).add(targetCategory.id));

    if (!fixedProductContext && productWizardStep === 'category') {
      setCategories(next);
      setCreateProductOpen(false);
      return;
    }

    let targetSubcategory = targetCategory.subcategories.find(subcategory => (
      subcategory.id === subcategoryInput || subcategory.name.trim().toLowerCase() === subcategoryInput.toLowerCase()
    ));
    if (!targetSubcategory) {
      targetSubcategory = {
        id: `subcategory-${stamp}`,
        name: subcategoryInput,
        identifier: subcategoryIdentifierInput,
        description: subcategoryDescriptionInput,
        relatedSoftwareIds,
        brands: [],
      };
      targetCategory.subcategories.push(targetSubcategory);
    }
    setExpandedSubs(current => new Set(current).add(targetSubcategory.id));

    if (!fixedProductContext && productWizardStep === 'subcategory') {
      setCategories(next);
      setCreateProductOpen(false);
      return;
    }

    const brandId = currentBrand?.id ?? `product-${stamp}`;
    targetSubcategory.brands.push({
      id: brandId,
      name: productNameInput,
      identifier: productIdentifierInput,
      description: productDescriptionInput,
      relatedSoftwareIds: newBrandSoftwareIds,
      versions: currentBrand?.versions ?? [],
    });
    setCategories(next);
    setSelectedBrandId(brandId);
    setNewBrandName('');
    setNewBrandIdentifier('');
    setNewBrandDescription('');
    setNewBrandSoftwareIds([]);
    setEditingBrandId(null);
    setCreateProductOpen(false);
  }

  function handleWizardNext() {
    if (fixedProductContext || productWizardStep === 'product') return;
    if (productWizardStep === 'category') {
      if (!categoryStepValid) return;
      setProductWizardStep('subcategory');
    } else {
      if (!subcategoryStepValid) return;
      setProductWizardStep('product');
    }
    setSoftwareLinkQuery('');
  }

  function openCreateProduct(categoryId = '', subcategoryId = '') {
    const categoryContext = Boolean(categoryId);
    const subcategoryContext = Boolean(categoryId && subcategoryId);
    const initialCategoryId = categoryContext ? categoryId : '';
    const initialCategory = categories.find(category => category.id === initialCategoryId);
    const initialSubcategory = initialCategory?.subcategories.find(subcategory => subcategory.id === subcategoryId);
    setProductFormMode(subcategoryContext ? 'subcategory-context' : categoryContext ? 'category-context' : 'cascade');
    setProductWizardStep(subcategoryContext ? 'product' : categoryContext ? 'subcategory' : 'category');
    setEditingBrandId(null);
    setNewBrandCatId(initialCategoryId);
    setNewCategoryIdentifier(initialCategory?.identifier ?? '');
    setNewCategoryDescription(initialCategory?.description ?? '');
    setNewBrandSubId(subcategoryContext ? subcategoryId : '');
    setNewSubcategoryIdentifier(initialSubcategory?.identifier ?? '');
    setNewSubcategoryDescription(initialSubcategory?.description ?? '');
    setNewSubcategorySoftwareIds(initialSubcategory?.relatedSoftwareIds ?? []);
    setSoftwareLinkQuery('');
    setNewBrandName('');
    setNewBrandIdentifier('');
    setNewBrandDescription('');
    setNewBrandSoftwareIds([]);
    setCreateProductOpen(true);
  }

  function openEditProduct(brandId: string) {
    const location = findBrandLocation(categories, brandId);
    if (!location) return;
    setProductFormMode('edit');
    setProductWizardStep('product');
    setEditingBrandId(brandId);
    setNewBrandCatId(location.category.id);
    setNewBrandSubId(location.subcategory.id);
    setNewBrandName(location.brand.name);
    setNewBrandIdentifier(location.brand.identifier ?? location.brand.id);
    setNewBrandDescription(location.brand.description ?? '');
    setNewBrandSoftwareIds(location.brand.relatedSoftwareIds ?? []);
    setCreateProductOpen(true);
  }

  function openEditCategory(categoryId: string) {
    const category = categories.find(item => item.id === categoryId);
    if (!category) return;
    setTaxonomyForm({
      open: true,
      kind: 'category',
      mode: 'edit',
      categoryId,
      subcategoryId: null,
      name: category.name,
      icon: category.icon,
    });
  }

  function openEditSubcategory(categoryId: string, subcategoryId: string) {
    const subcategory = categories
      .find(category => category.id === categoryId)
      ?.subcategories.find(item => item.id === subcategoryId);
    if (!subcategory) return;
    setTaxonomyForm({
      open: true,
      kind: 'subcategory',
      mode: 'edit',
      categoryId,
      subcategoryId,
      name: subcategory.name,
      icon: 'controller',
    });
  }

  function handleSaveTaxonomy() {
    if (!taxonomyFormValid) return;
    const name = taxonomyForm.name.trim();
    if (taxonomyForm.kind === 'category') {
      if (taxonomyForm.mode === 'create') {
        setCategories(current => [...current, {
          id: `category-${Date.now().toString(36)}`,
          name,
          icon: taxonomyForm.icon,
          subcategories: [],
        }]);
      } else {
        setCategories(current => current.map(category => category.id === taxonomyForm.categoryId
          ? { ...category, name, icon: taxonomyForm.icon }
          : category));
      }
    } else if (taxonomyForm.categoryId) {
      const newSubcategoryId = `subcategory-${Date.now().toString(36)}`;
      setCategories(current => current.map(category => {
        if (category.id !== taxonomyForm.categoryId) return category;
        if (taxonomyForm.mode === 'create') {
          return { ...category, subcategories: [...category.subcategories, { id: newSubcategoryId, name, brands: [] }] };
        }
        return {
          ...category,
          subcategories: category.subcategories.map(subcategory => subcategory.id === taxonomyForm.subcategoryId
            ? { ...subcategory, name }
            : subcategory),
        };
      }));
      if (taxonomyForm.mode === 'create') setExpandedSubs(current => new Set(current).add(newSubcategoryId));
    }
    setTaxonomyForm(current => ({ ...current, open: false }));
  }

  function handleTreeNodeAction(nodeAction: CategoryTreeNodeAction) {
    if (nodeAction.action === 'delete') {
      setTreeDeleteTarget(nodeAction);
      return;
    }
    if (nodeAction.kind === 'category') {
      if (nodeAction.action === 'add') openCreateProduct(nodeAction.categoryId);
      else openEditCategory(nodeAction.categoryId);
      return;
    }
    if (nodeAction.kind === 'subcategory' && nodeAction.subcategoryId) {
      if (nodeAction.action === 'add') openCreateProduct(nodeAction.categoryId);
      else openEditSubcategory(nodeAction.categoryId, nodeAction.subcategoryId);
      return;
    }
    if (nodeAction.kind === 'brand') {
      if (nodeAction.action === 'add' && nodeAction.subcategoryId) {
        openCreateProduct(nodeAction.categoryId, nodeAction.subcategoryId);
      } else if (nodeAction.action === 'edit' && nodeAction.brandId) {
        openEditProduct(nodeAction.brandId);
      }
    }
  }

  function handleDeleteTreeNode() {
    if (!treeDeleteTarget) return;
    let next = categories;
    if (treeDeleteTarget.kind === 'category') {
      next = categories.filter(category => category.id !== treeDeleteTarget.categoryId);
    } else if (treeDeleteTarget.kind === 'subcategory') {
      next = categories.map(category => category.id === treeDeleteTarget.categoryId
        ? { ...category, subcategories: category.subcategories.filter(subcategory => subcategory.id !== treeDeleteTarget.subcategoryId) }
        : category);
    } else {
      next = categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          brands: subcategory.brands.filter(item => item.id !== treeDeleteTarget.brandId),
        })),
      }));
    }
    setCategories(next);
    if (!findBrand(next, selectedBrandId)) setSelectedBrandId(firstBrandId(next));
    setSelectedPkgIds(new Set());
    setTreeDeleteTarget(null);
  }

  function openBatchPublish() {
    setBatchVersion('');
    setBatchSelection(new Set());
    setBatchCatIds(new Set(categories.length > 0 ? [categories[0].id] : []));
    setBatchSubIds(new Set());
    setBatchOpen(true);
  }

  // Derived: brands from selected categories + subcategories
  const batchBrands = (() => {
    const result: { brand: ProductBrand; catName: string; subName: string }[] = [];
    for (const cat of categories) {
      if (!batchCatIds.has(cat.id)) continue;
      for (const sub of cat.subcategories) {
        if (batchSubIds.size > 0 && !batchSubIds.has(sub.id)) continue;
        for (const b of sub.brands) {
          result.push({ brand: b, catName: cat.name, subName: sub.name });
        }
      }
    }
    return result;
  })();

  const allBatchVersions = (() => {
    const vs = new Set<string>();
    for (const cat of categories)
      for (const sub of cat.subcategories)
        for (const b of sub.brands)
          for (const v of b.versions)
            vs.add(v.version);
    return [...vs].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  })();

  function toggleBatchCat(catId: string) {
    setBatchCatIds(prev => { const n = new Set(prev); n.has(catId) ? n.delete(catId) : n.add(catId); return n; });
    setBatchSubIds(new Set());
  }

  function toggleBatchSub(subId: string) {
    setBatchSubIds(prev => { const n = new Set(prev); n.has(subId) ? n.delete(subId) : n.add(subId); return n; });
  }

  function toggleBatchBrand(brandId: string) {
    setBatchSelection(prev => { const n = new Set(prev); n.has(brandId) ? n.delete(brandId) : n.add(brandId); return n; });
  }

  function handleBatchPublish() {
    if (!batchVersion.trim() || batchSelection.size === 0) return;
    const target = batchVersion.trim();
    let count = 0;
    for (const cat of categories) {
      if (!batchCatIds.has(cat.id)) continue;
      for (const sub of cat.subcategories) {
        if (batchSubIds.size > 0 && !batchSubIds.has(sub.id)) continue;
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

  function toggleCategory(id: string) {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectBrand(brandId: string) {
    const location = findBrandLocation(categories, brandId);
    if (location) {
      setExpandedCategories(current => new Set(current).add(location.category.id));
      setExpandedSubs(current => new Set(current).add(location.subcategory.id));
    }
    setSelectedBrandId(brandId);
  }

  function togglePkgSelect(pkgId: string) {
    setSelectedPkgIds(prev => { const n = new Set(prev); n.has(pkgId) ? n.delete(pkgId) : n.add(pkgId); return n; });
  }

  function selectAllPkgs() {
    if (!brand) return;
    const allIds = new Set(brand.versions.flatMap(v => v.packages.map(p => p.id)));
    setSelectedPkgIds(prev => prev.size === allIds.size ? new Set() : allIds);
  }

  function batchDeletePkgs() {
    if (!brand || selectedPkgIds.size === 0) return;
    brand.versions = brand.versions.filter(vg => vg.packages.length > 0);
    setRevision(v => v + 1);
    setSelectedPkgIds(new Set());
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
      gap: 'var(--app-section-gap)',
      padding: 'var(--app-page-padding)',
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
        borderRadius: 'var(--app-card-radius)',
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        boxShadow: CARD_SHADOW,
        overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--app-border)' }}>
          <div style={{ color: 'var(--app-heading)', fontSize: 18, fontWeight: 700 }}>产品目录</div>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <CategoryTree
            categories={categories}
            selectedBrandId={selectedBrandId}
            expandedCategories={expandedCategories}
            expandedSubs={expandedSubs}
            onToggleCategory={toggleCategory}
            onToggleSub={toggleSubcategory}
            onSelectBrand={selectBrand}
            onNodeAction={handleTreeNodeAction}
          />
        </div>
        <div style={{ flexShrink: 0, padding: 12, borderTop: '1px solid var(--app-border)' }}>
          <ArcoButton
            type="secondary"
            size="large"
            long
            icon={<Plus size={16} />}
            onClick={() => openCreateProduct()}
          >
            新增产品
          </ArcoButton>
        </div>
      </aside>

      <main style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--app-card-radius)',
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        boxShadow: CARD_SHADOW,
        overflow: 'hidden',
      }}>
        <header style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          padding: '18px 22px',
          borderBottom: '1px solid var(--app-border)',
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, whiteSpace: 'nowrap' }}>
              {activeBrandLocation && (
                <>
                  <span title={activeBrandLocation.category.name} style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--app-muted)', fontSize: 12 }}>
                    {activeBrandLocation.category.name}
                  </span>
                  <ChevronRight size={14} color="var(--app-subtle)" style={{ flexShrink: 0 }} />
                  <span title={activeBrandLocation.subcategory.name} style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--app-muted)', fontSize: 12 }}>
                    {activeBrandLocation.subcategory.name}
                  </span>
                  <ChevronRight size={14} color="var(--app-subtle)" style={{ flexShrink: 0 }} />
                </>
              )}
              <h1 title={brand?.name} style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--app-heading)', fontSize: 20, fontWeight: 700, margin: 0, lineHeight: 1.25 }}>
                {brand ? brand.name : '产品包/版本管理'}
              </h1>
              {brand && <span style={{ flexShrink: 0 }}><Badge tone="accent">{brand.identifier ?? brand.id}</Badge></span>}
            </div>
            {brand && (
              <>
                <p style={{ maxWidth: 640, margin: '6px 0 0', color: 'var(--app-text)', fontSize: 14, lineHeight: 1.5 }}>
                  {brand.description || '管理该产品的软件版本、安装包与发布记录。'}
                </p>
                <div style={{ color: 'var(--app-muted)', fontSize: 12, marginTop: 6 }}>
                  {brand.versions.length} 个版本 · {totalPackages} 个安装包 · 最近更新 {brand.versions[0]?.packages[0]?.createdAt ?? '-'}
                </div>
              </>
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
              <>
                <ArcoButton type="primary" size="large" icon={<Layers size={14} />} onClick={openBatchPublish}>
                  一键发版
                </ArcoButton>
              </>
            )}
          </div>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 18, background: 'var(--app-soft)' }}>
          {!brand ? (
            <div style={{ textAlign: 'center', padding: '72px 0', color: 'var(--app-muted)', fontSize: 14 }}>
              <Layers size={40} style={{ margin: '0 auto 12px', color: 'var(--app-subtle)' }} />
              <p style={{ margin: 0 }}>请从左侧选择一个品牌/型号</p>
            </div>
          ) : versions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '72px 0', color: 'var(--app-muted)', fontSize: 14 }}>
              <Search size={40} style={{ margin: '0 auto 12px', color: 'var(--app-subtle)' }} />
              <p style={{ margin: 0 }}>{query ? '没有匹配的包' : '暂无版本包，点击“发布新版本”开始'}</p>
            </div>
          ) : (
            versions.map(versionGroup => (
              <VersionAccordion
                key={versionGroup.version}
                group={versionGroup}
                selectedPkgIds={selectedPkgIds}
                onTogglePkg={togglePkgSelect}
                onBatchDelete={batchDeletePkgs}
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
        size="sm"
        footer={(
          <>
            <ArcoButton onClick={() => setDeleteOpen(false)}>取消</ArcoButton>
            <ArcoButton type="primary" status="danger" onClick={handleDelete}>删除</ArcoButton>
          </>
        )}
      >
        <p style={{ color: 'var(--app-muted)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          确认删除「{deleteTarget?.name ?? ''}」吗？删除后将无法恢复。
        </p>
      </ArcoModal>

      <ArcoModal
        open={taxonomyForm.open}
        onOpenChange={open => setTaxonomyForm(current => ({ ...current, open }))}
        title={`${taxonomyForm.mode === 'create' ? '新增' : '编辑'}${taxonomyForm.kind === 'category' ? '大类' : '子品类'}`}
        size="md"
        footer={(
          <>
            <ArcoButton onClick={() => setTaxonomyForm(current => ({ ...current, open: false }))}>取消</ArcoButton>
            <ArcoButton type="primary" onClick={handleSaveTaxonomy} disabled={!taxonomyFormValid}>
              {taxonomyForm.mode === 'create' ? '确认新增' : '保存修改'}
            </ArcoButton>
          </>
        )}
      >
        <div style={{ display: 'grid', gap: 14 }}>
          <TextInput
            label={taxonomyForm.kind === 'category' ? '大类名称' : '子品类名称'}
            required
            value={taxonomyForm.name}
            onValueChange={name => setTaxonomyForm(current => ({ ...current, name }))}
            placeholder={taxonomyForm.kind === 'category' ? '例如：控制器类产品' : '例如：控制器'}
          />
          {taxonomyForm.kind === 'category' && (
            <label style={{ display: 'block' }}>
              <FieldLabel required>大类图标</FieldLabel>
              <select
                value={taxonomyForm.icon}
                onChange={event => setTaxonomyForm(current => ({ ...current, icon: event.target.value as ProductCategory['icon'] }))}
                style={{ width: '100%', height: 40, borderRadius: 9, border: '1px solid var(--app-border)', background: 'var(--app-soft)', color: 'var(--app-heading)', padding: '0 11px', outline: 'none' }}
              >
                <option value="controller">控制器</option>
                <option value="external">外接设备</option>
                <option value="service">服务</option>
              </select>
            </label>
          )}
          {taxonomyDuplicate && (
            <div role="alert" style={{ color: 'var(--app-danger)', fontSize: 12 }}>
              当前层级下已存在同名项，请修改名称。
            </div>
          )}
        </div>
      </ArcoModal>

      {/* ── Create / edit product ── */}
      <ArcoModal
        open={createProductOpen}
        onOpenChange={open => {
          setCreateProductOpen(open);
          if (!open) setEditingBrandId(null);
        }}
        title={editingBrandId ? '编辑产品' : '新增产品'}
        size={fixedProductContext ? 'md' : 'lg'}
        footer={(
          <>
            <ArcoButton onClick={() => setCreateProductOpen(false)}>取消</ArcoButton>
            {!fixedProductContext && productWizardStep !== 'product' ? (
              <>
                {!currentLayerExists && (
                  <ArcoButton onClick={handleCreateProduct} disabled={!productFormValid}>
                    保存
                  </ArcoButton>
                )}
                <ArcoButton type="primary" onClick={handleWizardNext} disabled={!productFormValid}>
                  下一步
                  <ChevronRight size={15} />
                </ArcoButton>
              </>
            ) : (
              <ArcoButton type="primary" onClick={handleCreateProduct} disabled={!productFormValid}>
                {editingBrandId ? '保存修改' : '保存'}
              </ArcoButton>
            )}
          </>
        )}
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <ProductWizardNav
            step={productWizardStep}
            categoryLabel={createBrandCat?.name ?? categoryInput}
            subcategoryLabel={createBrandSub?.name ?? subcategoryInput}
            categoryExists={Boolean(createBrandCat)}
            subcategoryExists={Boolean(createBrandSub)}
            productActionLabel={editingBrandId ? '编辑产品' : '新增产品'}
            canOpenSubcategory={categoryStepValid}
            canOpenProduct={subcategoryStepValid}
            categoryLocked={categoryLocked}
            subcategoryLocked={subcategoryLocked}
            onStepChange={step => {
              setProductWizardStep(step);
              setSoftwareLinkQuery('');
            }}
          />

          {!fixedProductContext && productWizardStep === 'category' && (
            <>
              <EditableCombobox
                label="产品类型名称"
                required
                value={createBrandCat?.name ?? newBrandCatId}
                options={categories.map(category => ({ id: category.id, label: category.name }))}
                onValueChange={value => {
                  const match = categories.find(category => category.name === value);
                  setNewBrandCatId(match?.id ?? value);
                  setNewCategoryIdentifier(match?.identifier ?? match?.id ?? '');
                  setNewCategoryDescription(match?.description ?? '');
                  setNewBrandSubId('');
                  setNewSubcategoryIdentifier('');
                  setNewSubcategoryDescription('');
                  setNewSubcategorySoftwareIds([]);
                  setNewBrandName('');
                  setNewBrandIdentifier('');
                  setNewBrandDescription('');
                  setNewBrandSoftwareIds([]);
                }}
                placeholder="选择已有类型或输入新名称"
              />
              <TextInput
                label="标识符"
                required
                value={categoryIdentifierInput}
                onValueChange={setNewCategoryIdentifier}
                placeholder="例如：controller-products"
                disabled={Boolean(createBrandCat)}
              />
              {duplicateCategoryIdentifier && (
                <div role="alert" style={{ color: 'var(--app-danger)', fontSize: 12, marginTop: -10 }}>
                  产品类型标识符已存在，请使用唯一标识符。
                </div>
              )}
              <TextAreaField
                label="描述"
                value={categoryDescriptionInput}
                onValueChange={setNewCategoryDescription}
                placeholder="请输入该类型的业务范围"
                disabled={Boolean(createBrandCat)}
              />
            </>
          )}

          {!fixedProductContext && productWizardStep === 'subcategory' && (
            <>
              <EditableCombobox
                label="子品类名称"
                required
                value={createBrandSub?.name ?? newBrandSubId}
                options={(createBrandCat?.subcategories ?? []).map(subcategory => ({ id: subcategory.id, label: subcategory.name }))}
                onValueChange={value => {
                  const match = createBrandCat?.subcategories.find(subcategory => subcategory.name === value);
                  setNewBrandSubId(match?.id ?? value);
                  setNewSubcategoryIdentifier(match?.identifier ?? match?.id ?? '');
                  setNewSubcategoryDescription(match?.description ?? '');
                  setNewSubcategorySoftwareIds(match?.relatedSoftwareIds ?? []);
                  setNewBrandName('');
                  setNewBrandIdentifier('');
                  setNewBrandDescription('');
                  setNewBrandSoftwareIds([]);
                }}
                placeholder="选择已有子品类或输入新名称"
              />
              <TextInput
                label="标识符"
                required
                value={subcategoryIdentifierInput}
                onValueChange={setNewSubcategoryIdentifier}
                placeholder="例如：controllers"
                disabled={Boolean(createBrandSub)}
              />
              {duplicateSubcategoryIdentifier && (
                <div role="alert" style={{ color: 'var(--app-danger)', fontSize: 12, marginTop: -10 }}>
                  子品类标识符已存在，请使用唯一标识符。
                </div>
              )}
              <TextAreaField
                label="描述"
                value={subcategoryDescriptionInput}
                onValueChange={setNewSubcategoryDescription}
                placeholder="请输入该子品类的用途或适配范围"
                disabled={Boolean(createBrandSub)}
              />
              <RelatedSoftwarePicker
                options={softwareOptions}
                selectedIds={relatedSoftwareIds}
                query={softwareLinkQuery}
                onQueryChange={setSoftwareLinkQuery}
                disabled={Boolean(createBrandSub)}
                onToggle={id => setNewSubcategorySoftwareIds(current => (
                  current.includes(id) ? current.filter(item => item !== id) : [...current, id]
                ))}
              />
            </>
          )}

          {(fixedProductContext || productWizardStep === 'product') && (
            <>
              <TextInput
                label="产品名称"
                required
                value={newBrandName}
                onValueChange={setNewBrandName}
                placeholder="请输入产品名称"
              />
              <TextInput
                label="产品标识符"
                required
                value={newBrandIdentifier}
                onValueChange={setNewBrandIdentifier}
                placeholder="例如：shadow-controller"
              />
              {productNameInput && !productIdentifierInput && (
                <div role="alert" style={{ color: 'var(--app-danger)', fontSize: 12, marginTop: -10 }}>
                  请填写唯一的产品标识符后再添加。
                </div>
              )}
              <RelatedSoftwarePicker
                options={softwareOptions.filter(option => option.id !== editingBrandId)}
                selectedIds={newBrandSoftwareIds}
                query={softwareLinkQuery}
                onQueryChange={setSoftwareLinkQuery}
                onToggle={id => setNewBrandSoftwareIds(current => (
                  current.includes(id) ? current.filter(item => item !== id) : [...current, id]
                ))}
              />
              <TextAreaField
                label="产品描述"
                value={newBrandDescription}
                onValueChange={setNewBrandDescription}
                placeholder="请输入产品能力、用途或适配范围"
              />
            </>
          )}

          {duplicateBrand && (
            <div role="alert" style={{ color: 'var(--app-danger)', fontSize: 12, marginTop: -8 }}>
              当前分类下已存在同名产品，请修改产品名称。
            </div>
          )}
          {duplicateIdentifier && (
            <div role="alert" style={{ color: 'var(--app-danger)', fontSize: 12, marginTop: -8 }}>
              产品标识符已存在，请使用唯一标识符。
            </div>
          )}
        </div>
      </ArcoModal>

      <ArcoModal
        open={Boolean(treeDeleteTarget)}
        onOpenChange={open => { if (!open) setTreeDeleteTarget(null); }}
        title={treeDeleteInfo?.title ?? '删除'}
        status="danger"
        size="sm"
        footer={(
          <>
            <ArcoButton onClick={() => setTreeDeleteTarget(null)}>取消</ArcoButton>
            <ArcoButton type="primary" status="danger" onClick={handleDeleteTreeNode}>确认删除</ArcoButton>
          </>
        )}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <p style={{ color: 'var(--app-text)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            确认删除「{treeDeleteInfo?.label ?? ''}」吗？删除后无法恢复。
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 12px', borderRadius: 9, background: 'var(--app-danger-soft)', color: 'var(--app-danger)', fontSize: 12 }}>
            <Trash2 size={14} />
            将删除 {treeDeleteInfo?.impact ?? '相关数据'}
          </div>
        </div>
      </ArcoModal>

            
            

                        {/* ── Batch Publish Modal ── */}
      <ArcoModal
        open={batchOpen}
        onOpenChange={setBatchOpen}
        title="一键发版"
        size="lg"
        footer={(
          <>
            <ArcoButton onClick={() => setBatchOpen(false)}>关闭</ArcoButton>
            <ArcoButton type="primary" onClick={handleBatchPublish} disabled={!batchVersion.trim() || batchSelection.size === 0}>
              一键发版（{batchSelection.size} 个品牌）
            </ArcoButton>
          </>
        )}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '160px 160px 1fr 170px', gap: 1, background: 'var(--app-border)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--app-border)' }}>
          {/* Col 1: 产品分组 — 多选 */}
          <div style={{ background: 'var(--app-surface)', padding: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-muted)', padding: '4px 8px', marginBottom: 4 }}>产品分组</div>
            {categories.map(cat => {
              const checked = batchCatIds.has(cat.id);
              return (
                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                  background: checked ? 'var(--app-accent-soft)' : 'transparent', marginBottom: 2 }}>
                  <input type="checkbox" checked={checked} onChange={() => toggleBatchCat(cat.id)} style={{ accentColor: 'var(--app-accent)', width: 14, height: 14, flexShrink: 0 }} />
                  <span style={{ color: checked ? 'var(--app-accent)' : 'var(--app-text)', fontSize: 12, fontWeight: checked ? 600 : 400 }}>{cat.name}</span>
                </label>
              );
            })}
          </div>

          {/* Col 2: 子产品 — 多选（基于选中产品分组的所有子产品） */}
          <div style={{ background: 'var(--app-surface)', padding: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-muted)', padding: '4px 8px', marginBottom: 4 }}>子产品</div>
            {(() => {
              const subs: { id: string; name: string }[] = [];
              const seen = new Set<string>();
              for (const cat of categories) {
                if (!batchCatIds.has(cat.id)) continue;
                for (const s of cat.subcategories) {
                  if (!seen.has(s.id)) { seen.add(s.id); subs.push({ id: s.id, name: s.name }); }
                }
              }
              return subs.map(sub => {
                const checked = batchSubIds.has(sub.id);
                return (
                  <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                    background: checked ? 'var(--app-accent-soft)' : 'transparent', marginBottom: 2 }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleBatchSub(sub.id)} style={{ accentColor: 'var(--app-accent)', width: 14, height: 14, flexShrink: 0 }} />
                    <span style={{ color: checked ? 'var(--app-accent)' : 'var(--app-text)', fontSize: 12, fontWeight: checked ? 600 : 400 }}>{sub.name}</span>
                  </label>
                );
              });
            })()}
            {batchCatIds.size === 0 && <div style={{ color: 'var(--app-muted)', fontSize: 12, padding: 12, textAlign: 'center' }}>请先选择产品分组</div>}
          </div>

          {/* Col 3: 品牌 — 多选 */}
          <div style={{ background: 'var(--app-surface)', padding: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-muted)', padding: '4px 8px', marginBottom: 4 }}>产品（勾选发布）</div>
            <div style={{ maxHeight: 260, overflow: 'auto' }}>
              {batchBrands.length > 0 ? batchBrands.map(({ brand: br }) => {
                const checked = batchSelection.has(br.id);
                return (
                  <label key={br.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                    background: checked ? 'var(--app-accent-soft)' : 'transparent', marginBottom: 2 }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleBatchBrand(br.id)} style={{ accentColor: 'var(--app-accent)', width: 14, height: 14, flexShrink: 0 }} />
                    <span style={{ color: checked ? 'var(--app-accent)' : 'var(--app-text)', fontSize: 12, fontWeight: checked ? 600 : 400 }}>{br.name}</span>
                  </label>
                );
              }) : <div style={{ color: 'var(--app-muted)', fontSize: 12, padding: 12, textAlign: 'center' }}>暂无产品</div>}
            </div>
          </div>

          {/* Col 4: 共同版本 */}
          <div style={{ background: 'var(--app-surface)', padding: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-muted)', padding: '4px 8px', marginBottom: 4 }}>共同版本</div>
            <div style={{ maxHeight: 260, overflow: 'auto' }}>
              {allBatchVersions.map(ver => {
                const active = batchVersion === ver;
                return (
                  <label key={ver} onClick={() => setBatchVersion(ver)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, cursor: 'pointer',
                    background: active ? 'var(--app-accent-soft)' : 'transparent', marginBottom: 2 }}>
                    <input type="radio" name="batchVersion" checked={active} onChange={() => setBatchVersion(ver)} style={{ accentColor: 'var(--app-accent)', width: 14, height: 14, flexShrink: 0 }} />
                    <div>
                      <span style={{ color: active ? 'var(--app-accent)' : 'var(--app-text)', fontSize: 14, fontWeight: active ? 600 : 400 }}>{ver}</span>
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
                    <code style={{ fontSize: 12, color: 'var(--app-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.pkg.name}</code>
                    <span style={{ fontSize: 12, color: 'var(--app-muted)', whiteSpace: 'nowrap' }}>{p.fromVer} → <span style={{ color: 'var(--app-accent)', fontWeight: 600 }}>{batchVersion}</span></span>
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
