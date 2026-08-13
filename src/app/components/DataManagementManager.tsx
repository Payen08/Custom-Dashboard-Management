import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  BookKey,
  Boxes,
  ChevronDown,
  ChevronRight,
  Folder,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import {
  ProductButton,
  ProductCheckbox,
  ProductField,
  ProductIconButton,
  ProductModal,
  ProductSelect,
  ProductTag,
  ProductTextInput,
} from './ProductUI';
import type { DictionaryCascadeRule, DictionaryCategory, DictionaryValue } from '../dictionaryData';
import { ConfigurationTemplateManager } from './ConfigurationTemplateManager';
import { ParameterDefinitionManager } from './ParameterDefinitionManager';
import '../../styles/business/data-management.css';
import { GLOBAL_ACTION_COPY, useI18n, type AppLocale } from '../i18n';

const DM_UI: Record<AppLocale, Record<string, string>> = {
  'zh-Hans': { catalog:'字典目录', maintain:'维护该字段的枚举取值及其对后序字段的级联范围。', enabled:'已启用', disabled:'已停用', values:'枚举取值', cascade:'级联配置', search:'搜索取值名称、标识符或实际值', currentParent:'当前父字段', addValue:'新增取值', addCascade:'新增级联', valueName:'取值名称', identifier:'标识符', actualValue:'实际值', dataType:'数据类型', status:'状态', actions:'操作', parentValue:'父字段取值', childField:'关联子字段', allowedValues:'允许显示的取值', edit:'编辑', delete:'删除', noValues:'暂无匹配取值', noCascade:'当前字段暂无级联配置', noFields:'暂无可配置字段', editValue:'编辑枚举取值', field:'当前字段', cancel:'取消', save:'保存', uniqueIdentifier:'唯一标识符', builtinLocked:'内置标识符不可修改', enterName:'请输入取值名称', enterIdentifier:'请输入唯一标识符', enterValue:'请输入实际值', selectType:'请选择数据类型', enableValue:'启用取值', deleteValue:'确认删除取值', deleteCascade:'确认删除级联', irreversible:'删除操作不可撤销。', confirmDelete:'确认删除', editCascade:'编辑级联', selectParent:'请选择父字段取值', selectChild:'请选择关联子字段', laterOnly:'仅可关联后序字段', relatedCascade:'关联级联', selectAll:'全选', selectChildFirst:'请先选择关联子字段', configureAfter:'选择后即可配置该字段允许显示的取值', fieldContent:'字段内容' },
  en: { catalog:'Dictionary Catalog', maintain:'Manage this field’s enumerated values and cascading range for subsequent fields.', enabled:'Enabled', disabled:'Disabled', values:'Values', cascade:'Cascading', search:'Search name, identifier, or actual value', currentParent:'Current parent field', addValue:'Add value', addCascade:'Add cascade', valueName:'Value name', identifier:'Identifier', actualValue:'Actual value', dataType:'Data type', status:'Status', actions:'Actions', parentValue:'Parent value', childField:'Related child field', allowedValues:'Allowed values', edit:'Edit', delete:'Delete', noValues:'No matching values', noCascade:'No cascading rules for this field', noFields:'No configurable fields', editValue:'Edit value', field:'Current field', cancel:'Cancel', save:'Save', uniqueIdentifier:'Unique identifier', builtinLocked:'Built-in identifiers cannot be changed', enterName:'Enter a value name', enterIdentifier:'Enter a unique identifier', enterValue:'Enter an actual value', selectType:'Select a data type', enableValue:'Enable value', deleteValue:'Delete value?', deleteCascade:'Delete cascade?', irreversible:'This action cannot be undone.', confirmDelete:'Delete', editCascade:'Edit cascade', selectParent:'Select a parent value', selectChild:'Select a child field', laterOnly:'Only subsequent fields can be linked', relatedCascade:'Cascade mapping', selectAll:'Select all', selectChildFirst:'Select a child field first', configureAfter:'You can configure its allowed values after selection', fieldContent:'Field content' },
  ms: { catalog:'Katalog Kamus', maintain:'Urus nilai enumerasi medan ini dan julat lata untuk medan seterusnya.', enabled:'Diaktifkan', disabled:'Dilumpuhkan', values:'Nilai', cascade:'Konfigurasi lata', search:'Cari nama, pengecam atau nilai sebenar', currentParent:'Medan induk semasa', addValue:'Tambah nilai', addCascade:'Tambah lata', valueName:'Nama nilai', identifier:'Pengecam', actualValue:'Nilai sebenar', dataType:'Jenis data', status:'Status', actions:'Tindakan', parentValue:'Nilai induk', childField:'Medan anak berkaitan', allowedValues:'Nilai dibenarkan', edit:'Edit', delete:'Padam', noValues:'Tiada nilai sepadan', noCascade:'Tiada peraturan lata', noFields:'Tiada medan boleh dikonfigurasi', editValue:'Edit nilai', field:'Medan semasa', cancel:'Batal', save:'Simpan', uniqueIdentifier:'Pengecam unik', builtinLocked:'Pengecam terbina tidak boleh diubah', enterName:'Masukkan nama nilai', enterIdentifier:'Masukkan pengecam unik', enterValue:'Masukkan nilai sebenar', selectType:'Pilih jenis data', enableValue:'Aktifkan nilai', deleteValue:'Padam nilai?', deleteCascade:'Padam lata?', irreversible:'Tindakan ini tidak boleh dibuat asal.', confirmDelete:'Padam', editCascade:'Edit lata', selectParent:'Pilih nilai induk', selectChild:'Pilih medan anak', laterOnly:'Hanya medan seterusnya boleh dipautkan', relatedCascade:'Pemetaan lata', selectAll:'Pilih semua', selectChildFirst:'Pilih medan anak dahulu', configureAfter:'Konfigurasi nilai dibenarkan selepas pemilihan', fieldContent:'Kandungan medan' },
  vi: { catalog:'Danh mục từ điển', maintain:'Quản lý các giá trị liệt kê và phạm vi liên kết cho các trường phía sau.', enabled:'Đã bật', disabled:'Đã tắt', values:'Giá trị', cascade:'Cấu hình liên kết', search:'Tìm tên, mã định danh hoặc giá trị thực', currentParent:'Trường cha hiện tại', addValue:'Thêm giá trị', addCascade:'Thêm liên kết', valueName:'Tên giá trị', identifier:'Mã định danh', actualValue:'Giá trị thực', dataType:'Kiểu dữ liệu', status:'Trạng thái', actions:'Thao tác', parentValue:'Giá trị trường cha', childField:'Trường con liên kết', allowedValues:'Giá trị được phép', edit:'Chỉnh sửa', delete:'Xóa', noValues:'Không có giá trị phù hợp', noCascade:'Trường này chưa có cấu hình liên kết', noFields:'Không có trường cấu hình', editValue:'Chỉnh sửa giá trị', field:'Trường hiện tại', cancel:'Hủy', save:'Lưu', uniqueIdentifier:'Mã định danh duy nhất', builtinLocked:'Không thể sửa mã định danh tích hợp', enterName:'Nhập tên giá trị', enterIdentifier:'Nhập mã định danh duy nhất', enterValue:'Nhập giá trị thực', selectType:'Chọn kiểu dữ liệu', enableValue:'Bật giá trị', deleteValue:'Xóa giá trị?', deleteCascade:'Xóa liên kết?', irreversible:'Không thể hoàn tác thao tác này.', confirmDelete:'Xóa', editCascade:'Chỉnh sửa liên kết', selectParent:'Chọn giá trị trường cha', selectChild:'Chọn trường con', laterOnly:'Chỉ có thể liên kết trường phía sau', relatedCascade:'Ánh xạ liên kết', selectAll:'Chọn tất cả', selectChildFirst:'Chọn trường con trước', configureAfter:'Có thể cấu hình giá trị được phép sau khi chọn', fieldContent:'Nội dung trường' },
  'zh-Hant': { catalog:'字典目錄', maintain:'維護該欄位的列舉取值及其對後序欄位的級聯範圍。', enabled:'已啟用', disabled:'已停用', values:'列舉取值', cascade:'級聯設定', search:'搜尋取值名稱、識別碼或實際值', currentParent:'目前父欄位', addValue:'新增取值', addCascade:'新增級聯', valueName:'取值名稱', identifier:'識別碼', actualValue:'實際值', dataType:'資料類型', status:'狀態', actions:'操作', parentValue:'父欄位取值', childField:'關聯子欄位', allowedValues:'允許顯示的取值', edit:'編輯', delete:'刪除', noValues:'暫無相符取值', noCascade:'目前欄位暫無級聯設定', noFields:'暫無可設定欄位', editValue:'編輯列舉取值', field:'目前欄位', cancel:'取消', save:'儲存', uniqueIdentifier:'唯一識別碼', builtinLocked:'內建識別碼不可修改', enterName:'請輸入取值名稱', enterIdentifier:'請輸入唯一識別碼', enterValue:'請輸入實際值', selectType:'請選擇資料類型', enableValue:'啟用取值', deleteValue:'確認刪除取值', deleteCascade:'確認刪除級聯', irreversible:'刪除操作不可復原。', confirmDelete:'確認刪除', editCascade:'編輯級聯', selectParent:'請選擇父欄位取值', selectChild:'請選擇關聯子欄位', laterOnly:'僅可關聯後序欄位', relatedCascade:'關聯級聯', selectAll:'全選', selectChildFirst:'請先選擇關聯子欄位', configureAfter:'選擇後即可設定該欄位允許顯示的取值', fieldContent:'欄位內容' },
};

const DM_ENTITY: Record<AppLocale, Record<string, string>> = {
  'zh-Hans': {},
  en: { model_template:'Model Template Categories', robot_type:'Robot Type', degrees_of_freedom:'Degrees of Freedom', component_library:'Component Library Categories', component_type:'Component Type', component_subtype:'Subtype', component_specification:'Specification', project_extension:'Project Extensions', protection_level:'Protection Level', composite_robot:'Composite Robot', humanoid_robot:'Humanoid Biped Robot', agv_robot:'AGV Transport Robot', chassis:'Chassis', robot_arm:'Robot Arm', lifting_mechanism:'Lifting Mechanism', humanoid_component:'Humanoid Component', wheeled_chassis:'Wheeled Chassis', tracked_chassis:'Tracked Chassis', collaborative_arm:'Collaborative Arm', industrial_arm:'Industrial Arm', linear_lift:'Linear Lift', humanoid_head:'Humanoid Head', dexterous_hand:'Dexterous Hand', light_duty:'Light Duty', standard:'Standard', heavy_duty:'Heavy Duty', compact:'Compact' },
  ms: { model_template:'Kategori Templat Model', robot_type:'Jenis Robot', degrees_of_freedom:'Darjah Kebebasan', component_library:'Kategori Pustaka Komponen', component_type:'Jenis Komponen', component_subtype:'Subjenis', component_specification:'Spesifikasi', project_extension:'Atribut Projek', protection_level:'Tahap Perlindungan', composite_robot:'Robot Komposit', humanoid_robot:'Robot Humanoid Dwiped', agv_robot:'Robot Pengangkut AGV', chassis:'Casis', robot_arm:'Lengan Robot', lifting_mechanism:'Mekanisme Angkat', humanoid_component:'Komponen Humanoid' },
  vi: { model_template:'Danh mục mẫu mô hình', robot_type:'Loại Robot', degrees_of_freedom:'Bậc tự do', component_library:'Danh mục thư viện thành phần', component_type:'Loại thành phần', component_subtype:'Loại con', component_specification:'Thông số', project_extension:'Thuộc tính mở rộng', protection_level:'Cấp bảo vệ', composite_robot:'Robot tổ hợp', humanoid_robot:'Robot hai chân hình người', agv_robot:'Robot vận chuyển AGV', chassis:'Khung gầm', robot_arm:'Cánh tay Robot', lifting_mechanism:'Cơ cấu nâng', humanoid_component:'Thành phần hình người' },
  'zh-Hant': { model_template:'型號範本分類', robot_type:'機器人類型', degrees_of_freedom:'自由度', component_library:'元件庫分類', component_type:'元件類型', component_subtype:'子類型', component_specification:'規格', project_extension:'專案擴充屬性', protection_level:'防護等級', composite_robot:'複合機器人', humanoid_robot:'人形雙足機器人', agv_robot:'AGV 搬運機器人', chassis:'底盤', robot_arm:'機械臂', lifting_mechanism:'升降機構', humanoid_component:'人形元件' },
};

export type DataManagementSection = 'dictionary' | 'templates' | 'parameters';
export const DATA_MANAGEMENT_SECTION_EVENT = 'digital-machine:data-management-section';
const DATA_MANAGEMENT_SECTION_KEY = 'digital-machine-data-management-section';

export const DATA_MANAGEMENT_SECTIONS = [
  { key: 'dictionary' as const, label: '字段字典', description: '字段、枚举取值与级联关系', icon: BookKey },
  { key: 'templates' as const, label: '构型模板', description: '型号与组件构型模板', icon: Boxes },
  { key: 'parameters' as const, label: '参数定义', description: '参数结构与数据约束', icon: SlidersHorizontal },
];

function initialSection(): DataManagementSection {
  if (typeof window === 'undefined') return 'dictionary';
  const stored = window.localStorage.getItem(DATA_MANAGEMENT_SECTION_KEY);
  return stored === 'templates' || stored === 'parameters' ? stored : 'dictionary';
}

export function activateDataManagementSection(section: DataManagementSection) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DATA_MANAGEMENT_SECTION_KEY, section);
  window.dispatchEvent(new CustomEvent<DataManagementSection>(DATA_MANAGEMENT_SECTION_EVENT, { detail: section }));
}

export function readDataManagementSection(): DataManagementSection {
  return initialSection();
}

function StatusSwitch({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className="dictionary-switch" data-selected={checked ? 'true' : undefined} onClick={() => onChange(!checked)}><span /></button>;
}

function FieldDictionaryVersionView({
  categories,
  onCategoriesChange: setCategories,
}: {
  categories: DictionaryCategory[];
  onCategoriesChange: Dispatch<SetStateAction<DictionaryCategory[]>>;
}) {
  const { locale } = useI18n();
  const action = GLOBAL_ACTION_COPY[locale];
  const ui = DM_UI[locale];
  const entity = (key: string, fallback: string) => DM_ENTITY[locale][key] ?? fallback;
  const firstField = categories.flatMap(category => category.fields)[0];
  const [selectedFieldId, setSelectedFieldId] = useState(firstField?.id ?? '');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set(categories.map(item => item.id)));
  const [tab, setTab] = useState<'values' | 'cascade'>('values');
  const [query, setQuery] = useState('');
  const [valueOpen, setValueOpen] = useState(false);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [deleteValue, setDeleteValue] = useState<DictionaryValue | null>(null);
  const [deleteRule, setDeleteRule] = useState<DictionaryCascadeRule | null>(null);
  const [valueForm, setValueForm] = useState<DictionaryValue>({
    id: '',
    name: '',
    key: '',
    value: '',
    dataType: 'string',
    enabled: true,
    source: 'custom',
  });
  const [ruleForm, setRuleForm] = useState({ parentValueId: '', childFieldId: '', allowedChildValueIds: [] as string[] });

  const location = useMemo(() => {
    for (const category of categories) {
      const field = category.fields.find(item => item.id === selectedFieldId);
      if (field) return { category, field };
    }
    const category = categories[0];
    return category?.fields[0] ? { category, field: category.fields[0] } : null;
  }, [categories, selectedFieldId]);
  const selectedCategory = location?.category;
  const selectedField = location?.field;
  const rules = selectedCategory?.cascadeRules.filter(rule => rule.parentFieldId === selectedField?.id) ?? [];
  const childField = selectedCategory?.fields.find(item => item.id === ruleForm.childFieldId);
  const filteredValues = selectedField?.values.filter(item => {
    const term = query.trim().toLowerCase();
    return !term || item.name.toLowerCase().includes(term) || item.key.toLowerCase().includes(term) || item.value.toLowerCase().includes(term);
  }) ?? [];

  useEffect(() => {
    if (!selectedField && firstField) setSelectedFieldId(firstField.id);
  }, [firstField, selectedField]);

  function updateSelectedCategory(updater: (category: DictionaryCategory) => DictionaryCategory) {
    if (!selectedCategory) return;
    setCategories(current => current.map(category => category.id === selectedCategory.id ? updater(category) : category));
  }

  function toggleCategory(id: string) {
    setExpandedCategories(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openCreateValue() {
    setValueForm({ id: '', name: '', key: '', value: '', dataType: 'string', enabled: true, source: 'custom' });
    setValueOpen(true);
  }

  function openEditValue(value: DictionaryValue) {
    setValueForm({ ...value });
    setValueOpen(true);
  }

  function openCreateRule() {
    setEditingRuleId(null);
    setRuleForm({ parentValueId: '', childFieldId: '', allowedChildValueIds: [] });
    setRuleOpen(true);
  }

  function openEditRule(rule: DictionaryCascadeRule) {
    setEditingRuleId(rule.id);
    setRuleForm({ parentValueId: rule.parentValueId, childFieldId: rule.childFieldId, allowedChildValueIds: rule.allowedChildValueIds });
    setRuleOpen(true);
  }

  function saveValue() {
    if (!selectedField || !valueForm.name.trim() || !valueForm.key.trim() || !valueForm.value.trim()) return;
    if (selectedField.values.some(item => item.key === valueForm.key.trim() && item.id !== valueForm.id)) return;
    updateSelectedCategory(category => ({
      ...category,
      fields: category.fields.map(field => {
        if (field.id !== selectedField.id) return field;
        if (valueForm.id) {
          return {
            ...field,
            values: field.values.map(item => item.id === valueForm.id ? {
              ...item,
              name: valueForm.name.trim(),
              key: item.source === 'builtin' ? item.key : valueForm.key.trim(),
              value: valueForm.value.trim(),
              dataType: valueForm.dataType,
              enabled: valueForm.enabled,
            } : item),
          };
        }
        return {
          ...field,
          values: [...field.values, {
            ...valueForm,
            id: `value-${Date.now()}`,
            name: valueForm.name.trim(),
            key: valueForm.key.trim(),
            value: valueForm.value.trim(),
            source: 'custom',
          }],
        };
      }),
    }));
    setValueOpen(false);
  }

  function confirmDeleteValue() {
    if (!selectedField || !deleteValue || deleteValue.source !== 'custom') return;
    updateSelectedCategory(category => ({
      ...category,
      fields: category.fields.map(field => field.id === selectedField.id
        ? { ...field, values: field.values.filter(value => value.id !== deleteValue.id) }
        : field),
      cascadeRules: category.cascadeRules.flatMap(rule => {
        if (rule.parentFieldId === selectedField.id && rule.parentValueId === deleteValue.id) return [];
        if (rule.childFieldId !== selectedField.id || !rule.allowedChildValueIds.includes(deleteValue.id)) return [rule];
        const allowedChildValueIds = rule.allowedChildValueIds.filter(id => id !== deleteValue.id);
        return allowedChildValueIds.length ? [{ ...rule, allowedChildValueIds }] : [];
      }),
    }));
    setDeleteValue(null);
  }

  function saveRule() {
    if (!selectedField || !ruleForm.parentValueId || !ruleForm.childFieldId || !ruleForm.allowedChildValueIds.length) return;
    updateSelectedCategory(category => ({
      ...category,
      cascadeRules: editingRuleId
        ? category.cascadeRules.map(rule => rule.id === editingRuleId
          ? { ...rule, parentValueId: ruleForm.parentValueId, childFieldId: ruleForm.childFieldId, allowedChildValueIds: ruleForm.allowedChildValueIds }
          : rule)
        : [...category.cascadeRules, {
          id: `rule-${Date.now()}`,
          parentFieldId: selectedField.id,
          parentValueId: ruleForm.parentValueId,
          childFieldId: ruleForm.childFieldId,
          allowedChildValueIds: ruleForm.allowedChildValueIds,
          enabled: true,
          source: 'custom',
        }],
    }));
    setRuleForm({ parentValueId: '', childFieldId: '', allowedChildValueIds: [] });
    setEditingRuleId(null);
    setRuleOpen(false);
  }

  function confirmDeleteRule() {
    if (!selectedCategory || !deleteRule) return;
    updateSelectedCategory(category => ({
      ...category,
      cascadeRules: category.cascadeRules.filter(rule => rule.id !== deleteRule.id),
    }));
    setDeleteRule(null);
  }

  return (
    <div className="ds-page ds-page--split data-field-dictionary">
      <aside className="ds-page__sidebar data-field-dictionary__sidebar">
        <header className="data-field-dictionary__tree-header"><h1>{ui.catalog}</h1></header>
        <div className="data-field-dictionary__tree">
          <div className="taxonomy-tree">
            {categories.map(category => {
              const expanded = expandedCategories.has(category.id);
              return <section className="taxonomy-tree-section" key={category.id}>
                <div className="taxonomy-tree-node taxonomy-tree-category">
                  <button type="button" className="taxonomy-tree-category-main" aria-expanded={expanded} onClick={() => toggleCategory(category.id)}>
                    <span className="taxonomy-tree-folder"><Folder size={18} /></span>
                    <span className="data-field-dictionary__tree-label">{entity(category.key, category.name)}</span>
                    {expanded ? <ChevronDown className="taxonomy-tree-expand-icon" size={18} /> : <ChevronRight className="taxonomy-tree-expand-icon" size={18} />}
                  </button>
                </div>
                {expanded && <div className="taxonomy-tree-category-children data-field-dictionary__field-list">
                  {[...category.fields].sort((a, b) => a.seq - b.seq).map(field => (
                    <div className={`taxonomy-tree-node product-tree-item ${field.id === selectedField?.id ? 'is-selected' : ''}`} key={field.id}>
                      <button type="button" className="product-tree-main" onClick={() => { setSelectedFieldId(field.id); setTab('values'); setQuery(''); }}>
                        <span className="product-tree-dot" />
                        <span className="data-field-dictionary__tree-label">{entity(field.key, field.name)}</span>
                        <small>{field.seq}</small>
                      </button>
                    </div>
                  ))}
                </div>}
              </section>;
            })}
          </div>
        </div>
      </aside>

      <main className="ds-page__content product-version-content data-field-dictionary__content">
        {selectedCategory && selectedField ? (
          <>
            <header className="data-field-dictionary__content-header">
              <div>
                <div className="data-field-dictionary__breadcrumb"><span>{entity(selectedCategory.key, selectedCategory.name)}</span><ChevronRight size={14} /><h1>{entity(selectedField.key, selectedField.name)}</h1><ProductTag tone="accent" size="small">{selectedField.key}</ProductTag></div>
                <p>{ui.maintain}</p>
              </div>
              <div className="data-field-dictionary__field-status">
                <span>{selectedField.enabled ? ui.enabled : ui.disabled}</span>
                <StatusSwitch checked={selectedField.enabled} label={`${entity(selectedField.key, selectedField.name)} ${selectedField.enabled ? ui.disabled : ui.enabled}`} onChange={enabled => updateSelectedCategory(category => ({
                  ...category,
                  fields: category.fields.map(field => field.id === selectedField.id ? { ...field, enabled } : field),
                }))} />
              </div>
            </header>
            <div className="data-field-dictionary__toolbar">
              <div className="ds-status-tabs" role="tablist" aria-label={ui.fieldContent}>
                <button className="ds-status-tab" type="button" role="tab" aria-selected={tab === 'values'} onClick={() => setTab('values')}>{ui.values}</button>
                <button className="ds-status-tab" type="button" role="tab" aria-selected={tab === 'cascade'} onClick={() => setTab('cascade')}>{ui.cascade}</button>
              </div>
              {tab === 'values' ? <div className="data-field-dictionary__search"><Search size={14} /><ProductTextInput value={query} onChange={event => setQuery(event.target.value)} placeholder={ui.search} aria-label={ui.search} /></div> : <span>{ui.currentParent}: {entity(selectedField.key, selectedField.name)}</span>}
              <ProductButton type="primary" size="large" icon={<Plus size={15} />} disabled={tab === 'cascade' && !selectedCategory.fields.some(field => field.seq > selectedField.seq)} onClick={() => tab === 'values' ? openCreateValue() : openCreateRule()}>
                {tab === 'values' ? ui.addValue : ui.addCascade}
              </ProductButton>
            </div>
            <div className="data-field-dictionary__table-scroll">
              {tab === 'values' ? (
                <table className="data-management-table data-management-table--actions data-field-dictionary__table">
                  <thead><tr><th>{ui.valueName}</th><th>{ui.identifier}</th><th>{ui.actualValue}</th><th>{ui.dataType}</th><th>{ui.status}</th><th aria-label={ui.actions}>{ui.actions}</th></tr></thead>
                  <tbody>{filteredValues.map(item => <tr key={item.id}>
                    <td><strong>{entity(item.key, item.name)}</strong></td><td><code>{item.key}</code></td><td>{item.value}</td><td>{item.dataType}</td>
                    <td><StatusSwitch checked={item.enabled} label={`${entity(item.key, item.name)} ${item.enabled ? ui.disabled : ui.enabled}`} onChange={enabled => updateSelectedCategory(category => ({
                      ...category,
                      fields: category.fields.map(field => field.id === selectedField.id ? { ...field, values: field.values.map(value => value.id === item.id ? { ...value, enabled } : value) } : field),
                    }))} /></td>
                    <td><div className="data-field-dictionary__row-actions">
                      <ProductIconButton size="small" icon={<Pencil size={13} />} aria-label={`${ui.edit} ${entity(item.key, item.name)}`} title={ui.edit} onClick={() => openEditValue(item)} />
                      {item.source !== 'builtin' && (
                        <ProductIconButton
                          size="small"
                          status="danger"
                          icon={<Trash2 size={13} />}
                          aria-label={`${ui.delete} ${entity(item.key, item.name)}`}
                          title={ui.delete}
                          onClick={() => setDeleteValue(item)}
                        />
                      )}
                    </div></td>
                  </tr>)}</tbody>
                </table>
              ) : (
                <table className="data-management-table data-management-table--actions data-field-dictionary__table">
                  <thead><tr><th>{ui.parentValue}</th><th>{ui.childField}</th><th>{ui.allowedValues}</th><th>{ui.status}</th><th aria-label={ui.actions}>{ui.actions}</th></tr></thead>
                  <tbody>{rules.map(rule => {
                    const parentValue = selectedField.values.find(item => item.id === rule.parentValueId);
                    const child = selectedCategory.fields.find(item => item.id === rule.childFieldId);
                    const allowed = child?.values.filter(item => rule.allowedChildValueIds.includes(item.id)).map(item => entity(item.key, item.name)) ?? [];
                    return <tr key={rule.id}><td><strong>{parentValue ? entity(parentValue.key, parentValue.name) : '-'}</strong></td><td>{child ? entity(child.key, child.name) : '-'}</td><td><span className="data-field-dictionary__ellipsis" title={allowed.join(', ')}>{allowed.join(', ') || '-'}</span></td><td><StatusSwitch checked={rule.enabled} label={ui.cascade} onChange={enabled => updateSelectedCategory(category => ({ ...category, cascadeRules: category.cascadeRules.map(item => item.id === rule.id ? { ...item, enabled } : item) }))} /></td><td><div className="data-field-dictionary__row-actions">
                      <ProductIconButton size="small" icon={<Pencil size={13} />} aria-label={`${ui.edit} ${parentValue ? entity(parentValue.key, parentValue.name) : ui.cascade}`} title={ui.edit} onClick={() => openEditRule(rule)} />
                      {rule.source !== 'builtin' && (
                        <ProductIconButton
                          size="small"
                          status="danger"
                          icon={<Trash2 size={13} />}
                          aria-label={`删除${parentValue?.name ?? '级联'}`}
                          title={ui.delete}
                          onClick={() => setDeleteRule(rule)}
                        />
                      )}
                    </div></td></tr>;
                  })}</tbody>
                </table>
              )}
              {(tab === 'values' ? !filteredValues.length : !rules.length) && <div className="ds-empty">{tab === 'values' ? ui.noValues : ui.noCascade}</div>}
            </div>
          </>
        ) : <div className="ds-empty">{ui.noFields}</div>}
      </main>

      <ProductModal open={valueOpen} onOpenChange={setValueOpen} title={valueForm.id ? ui.editValue : ui.addValue} description={`${ui.field}: ${selectedField ? entity(selectedField.key, selectedField.name) : '-'}`} size="md" footer={<><ProductButton onClick={() => setValueOpen(false)}>{ui.cancel}</ProductButton><ProductButton type="primary" onClick={saveValue}>{ui.save}</ProductButton></>}>
        <div className="data-field-dictionary__form">
          <ProductField label={ui.valueName}><ProductTextInput value={valueForm.name} onChange={event => setValueForm({ ...valueForm, name: event.target.value })} placeholder={ui.enterName} /></ProductField>
          <ProductField label={ui.uniqueIdentifier} hint={valueForm.source === 'builtin' ? ui.builtinLocked : undefined}><ProductTextInput value={valueForm.key} readOnly={valueForm.source === 'builtin'} onChange={event => setValueForm({ ...valueForm, key: event.target.value })} placeholder={ui.enterIdentifier} /></ProductField>
          <ProductField label={ui.actualValue}><ProductTextInput value={valueForm.value} onChange={event => setValueForm({ ...valueForm, value: event.target.value })} placeholder={ui.enterValue} /></ProductField>
          <ProductField label={ui.dataType}><ProductSelect value={valueForm.dataType} onChange={event => setValueForm({ ...valueForm, dataType: event.target.value as DictionaryValue['dataType'] })} placeholder={ui.selectType}><option value="string">string</option><option value="number">number</option><option value="boolean">boolean</option></ProductSelect></ProductField>
          <ProductCheckbox checked={valueForm.enabled} onChange={event => setValueForm({ ...valueForm, enabled: event.target.checked })} label={ui.enableValue} />
        </div>
      </ProductModal>

      <ProductModal open={Boolean(deleteValue)} onOpenChange={open => !open && setDeleteValue(null)} title={ui.deleteValue} description={ui.irreversible} status="danger" footer={<><ProductButton onClick={() => setDeleteValue(null)}>{action.cancel}</ProductButton><ProductButton type="primary" status="danger" onClick={confirmDeleteValue}>{action.delete}</ProductButton></>}>
        <p className="data-field-dictionary__delete-copy">{ui.delete} “{deleteValue ? entity(deleteValue.key, deleteValue.name) : ''}”?</p>
      </ProductModal>

      <ProductModal open={Boolean(deleteRule)} onOpenChange={open => !open && setDeleteRule(null)} title={ui.deleteCascade} description={ui.irreversible} status="danger" footer={<><ProductButton onClick={() => setDeleteRule(null)}>{action.cancel}</ProductButton><ProductButton type="primary" status="danger" onClick={confirmDeleteRule}>{action.delete}</ProductButton></>}>
        <p className="data-field-dictionary__delete-copy">{ui.deleteCascade}</p>
      </ProductModal>

      <ProductModal
        open={ruleOpen}
        onOpenChange={open => {
          setRuleOpen(open);
          if (!open) setEditingRuleId(null);
        }}
        title={editingRuleId ? ui.editCascade : ui.addCascade}
        description={ui.maintain}
        size="lg"
        footer={<><ProductButton onClick={() => { setRuleOpen(false); setEditingRuleId(null); }}>{ui.cancel}</ProductButton><ProductButton type="primary" disabled={!ruleForm.parentValueId || !ruleForm.childFieldId || !ruleForm.allowedChildValueIds.length} onClick={saveRule}>{ui.save}</ProductButton></>}
      >
        {selectedCategory && selectedField && <div className="data-field-dictionary__cascade-form">
          <div className="data-field-dictionary__cascade-fields">
            <ProductField label={ui.parentValue} description={`${ui.field}: ${entity(selectedField.key, selectedField.name)}`}>
              <ProductSelect value={ruleForm.parentValueId} onChange={event => setRuleForm({ ...ruleForm, parentValueId: event.target.value })} aria-label={ui.parentValue}><option value="">{ui.selectParent}</option>{selectedField.values.map(item => <option key={item.id} value={item.id}>{entity(item.key, item.name)}</option>)}</ProductSelect>
            </ProductField>
            <ProductField label={ui.childField} description={ui.laterOnly}>
              <ProductSelect value={ruleForm.childFieldId} onChange={event => setRuleForm({ parentValueId: ruleForm.parentValueId, childFieldId: event.target.value, allowedChildValueIds: [] })} aria-label={ui.childField}><option value="">{ui.selectChild}</option>{selectedCategory.fields.filter(field => field.seq > selectedField.seq).map(field => <option key={field.id} value={field.id}>{entity(field.key, field.name)}</option>)}</ProductSelect>
            </ProductField>
          </div>
          <section className="data-field-dictionary__allowed-values" aria-labelledby="allowed-values-title">
            <header className="data-field-dictionary__allowed-values-header">
              <div><h3 id="allowed-values-title">{ui.relatedCascade}</h3><p>{ui.allowedValues}</p></div>
              {childField ? <div className="data-field-dictionary__allowed-values-actions"><ProductCheckbox label={ui.selectAll} checked={ruleForm.allowedChildValueIds.length === childField.values.length && childField.values.length > 0} onChange={event => setRuleForm({ ...ruleForm, allowedChildValueIds: event.target.checked ? childField.values.map(item => item.id) : [] })} /></div> : null}
            </header>
            {childField ? <div className="data-field-dictionary__allowed-values-grid">
              {childField.values.map(item => <ProductCheckbox className="data-field-dictionary__value-choice" key={item.id} label={<span className="data-field-dictionary__value-choice-label"><strong>{entity(item.key, item.name)}</strong><code>{item.key}</code></span>} checked={ruleForm.allowedChildValueIds.includes(item.id)} onChange={event => setRuleForm({ ...ruleForm, allowedChildValueIds: event.target.checked ? [...ruleForm.allowedChildValueIds, item.id] : ruleForm.allowedChildValueIds.filter(id => id !== item.id) })} />)}
            </div> : <div className="data-field-dictionary__allowed-values-empty"><span>{ui.selectChildFirst}</span><small>{ui.configureAfter}</small></div>}
          </section>
        </div>}
      </ProductModal>
    </div>
  );
}

export function DataManagementManager({
  categories,
  onCategoriesChange,
}: {
  categories: DictionaryCategory[];
  onCategoriesChange: Dispatch<SetStateAction<DictionaryCategory[]>>;
}) {
  const [activeSection, setActiveSection] = useState<DataManagementSection>(initialSection);

  useEffect(() => {
    const handleSection = (event: Event) => {
      const section = (event as CustomEvent<DataManagementSection>).detail;
      if (section === 'dictionary' || section === 'templates' || section === 'parameters') setActiveSection(section);
    };
    window.addEventListener(DATA_MANAGEMENT_SECTION_EVENT, handleSection);
    return () => window.removeEventListener(DATA_MANAGEMENT_SECTION_EVENT, handleSection);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(DATA_MANAGEMENT_SECTION_KEY, activeSection);
  }, [activeSection]);

  const meta = DATA_MANAGEMENT_SECTIONS.find(item => item.key === activeSection) ?? DATA_MANAGEMENT_SECTIONS[0];
  const ActiveIcon = meta.icon;

  if (activeSection === 'dictionary') return <FieldDictionaryVersionView categories={categories} onCategoriesChange={onCategoriesChange} />;
  if (activeSection === 'templates') return <ConfigurationTemplateManager categories={categories} />;
  if (activeSection === 'parameters') return <ParameterDefinitionManager />;
  return <div className="ds-page data-management-placeholder"><span><ActiveIcon size={26} /></span><h1>{meta.label}</h1><p>该模块暂未建设，本轮先完成“字段字典”。</p></div>;
}
