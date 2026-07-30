export type DictionarySource = 'builtin' | 'custom';
export type DictionaryValueDataType = 'string' | 'number' | 'boolean';

export interface DictionaryValue {
  id: string;
  name: string;
  key: string;
  value: string;
  dataType: DictionaryValueDataType;
  enabled: boolean;
  source: DictionarySource;
}

export interface DictionaryField {
  id: string;
  name: string;
  key: string;
  type: 'enum';
  enabled: boolean;
  seq: number;
  source: DictionarySource;
  values: DictionaryValue[];
}

export interface DictionaryCascadeRule {
  id: string;
  parentFieldId: string;
  parentValueId: string;
  childFieldId: string;
  allowedChildValueIds: string[];
  enabled: boolean;
  source: DictionarySource;
}

export interface DictionaryCategory {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  source: DictionarySource;
  fields: DictionaryField[];
  cascadeRules: DictionaryCascadeRule[];
}

const value = (
  id: string,
  name: string,
  key: string,
  actualValue = key,
  dataType: DictionaryValueDataType = 'string',
  source: DictionarySource = 'builtin',
): DictionaryValue => ({
  id,
  name,
  key,
  value: actualValue,
  dataType,
  enabled: true,
  source,
});

export function buildInitialDictionaryCategories(): DictionaryCategory[] {
  return [
    {
      id: 'model-template',
      name: '型号模板分类',
      key: 'model_template',
      description: '用于创建型号时配置机器人类型、自由度等型号属性。',
      enabled: true,
      source: 'builtin',
      fields: [
        {
          id: 'robot-type',
          name: '机器人类型',
          key: 'robot_type',
          type: 'enum',
          enabled: true,
          seq: 1,
          source: 'builtin',
          values: [
            value('robot-type-composite', '复合机器人', 'composite_robot'),
            value('robot-type-humanoid', '人形双足机器人', 'humanoid_robot'),
            value('robot-type-agv', 'AGV 搬运机器人', 'agv_robot'),
          ],
        },
        {
          id: 'degrees-of-freedom',
          name: '自由度',
          key: 'degrees_of_freedom',
          type: 'enum',
          enabled: true,
          seq: 2,
          source: 'builtin',
          values: [
            value('dof-4', '4 自由度', 'dof_4', '4', 'number'),
            value('dof-6', '6 自由度', 'dof_6', '6', 'number'),
            value('dof-7', '7 自由度', 'dof_7', '7', 'number'),
          ],
        },
      ],
      cascadeRules: [
        {
          id: 'model-composite-dof',
          parentFieldId: 'robot-type',
          parentValueId: 'robot-type-composite',
          childFieldId: 'degrees-of-freedom',
          allowedChildValueIds: ['dof-4', 'dof-6'],
          enabled: true,
          source: 'builtin',
        },
        {
          id: 'model-humanoid-dof',
          parentFieldId: 'robot-type',
          parentValueId: 'robot-type-humanoid',
          childFieldId: 'degrees-of-freedom',
          allowedChildValueIds: ['dof-6', 'dof-7'],
          enabled: true,
          source: 'builtin',
        },
      ],
    },
    {
      id: 'component-library',
      name: '组件库分类',
      key: 'component_library',
      description: '用于创建组件和类型筛选时配置组件类型、子类型与规格。',
      enabled: true,
      source: 'builtin',
      fields: [
        {
          id: 'component-type',
          name: '组件类型',
          key: 'component_type',
          type: 'enum',
          enabled: true,
          seq: 1,
          source: 'builtin',
          values: [
            value('component-chassis', '底盘', 'chassis'),
            value('component-arm', '机械臂', 'robot_arm'),
            value('component-lift', '升降机构', 'lifting_mechanism'),
            value('component-humanoid', '人形组件', 'humanoid_component'),
          ],
        },
        {
          id: 'component-subtype',
          name: '子类型',
          key: 'component_subtype',
          type: 'enum',
          enabled: true,
          seq: 2,
          source: 'builtin',
          values: [
            value('sub-wheel', '轮式底盘', 'wheeled_chassis'),
            value('sub-track', '履带底盘', 'tracked_chassis'),
            value('sub-cobot', '协作机械臂', 'collaborative_arm'),
            value('sub-industrial-arm', '工业机械臂', 'industrial_arm'),
            value('sub-linear-lift', '直线升降', 'linear_lift'),
            value('sub-head', '人形头部', 'humanoid_head'),
            value('sub-hand', '灵巧手', 'dexterous_hand'),
          ],
        },
        {
          id: 'component-spec',
          name: '规格',
          key: 'component_specification',
          type: 'enum',
          enabled: true,
          seq: 3,
          source: 'builtin',
          values: [
            value('spec-light', '轻载型', 'light_duty'),
            value('spec-standard', '标准型', 'standard'),
            value('spec-heavy', '重载型', 'heavy_duty'),
            value('spec-compact', '紧凑型', 'compact'),
          ],
        },
      ],
      cascadeRules: [
        {
          id: 'type-chassis-subtype',
          parentFieldId: 'component-type',
          parentValueId: 'component-chassis',
          childFieldId: 'component-subtype',
          allowedChildValueIds: ['sub-wheel', 'sub-track'],
          enabled: true,
          source: 'builtin',
        },
        {
          id: 'type-arm-subtype',
          parentFieldId: 'component-type',
          parentValueId: 'component-arm',
          childFieldId: 'component-subtype',
          allowedChildValueIds: ['sub-cobot', 'sub-industrial-arm'],
          enabled: true,
          source: 'builtin',
        },
        {
          id: 'type-lift-subtype',
          parentFieldId: 'component-type',
          parentValueId: 'component-lift',
          childFieldId: 'component-subtype',
          allowedChildValueIds: ['sub-linear-lift'],
          enabled: true,
          source: 'builtin',
        },
        {
          id: 'type-humanoid-subtype',
          parentFieldId: 'component-type',
          parentValueId: 'component-humanoid',
          childFieldId: 'component-subtype',
          allowedChildValueIds: ['sub-head', 'sub-hand'],
          enabled: true,
          source: 'builtin',
        },
        {
          id: 'sub-wheel-spec',
          parentFieldId: 'component-subtype',
          parentValueId: 'sub-wheel',
          childFieldId: 'component-spec',
          allowedChildValueIds: ['spec-light', 'spec-standard', 'spec-heavy'],
          enabled: true,
          source: 'builtin',
        },
        {
          id: 'sub-cobot-spec',
          parentFieldId: 'component-subtype',
          parentValueId: 'sub-cobot',
          childFieldId: 'component-spec',
          allowedChildValueIds: ['spec-standard', 'spec-compact'],
          enabled: true,
          source: 'builtin',
        },
      ],
    },
    {
      id: 'project-extension',
      name: '项目扩展属性',
      key: 'project_extension',
      description: '自定义分类示例，可按项目补充筛选字段。',
      enabled: true,
      source: 'custom',
      fields: [
        {
          id: 'protection-level',
          name: '防护等级',
          key: 'protection_level',
          type: 'enum',
          enabled: true,
          seq: 1,
          source: 'custom',
          values: [
            value('ip54', 'IP54', 'ip54', 'IP54', 'string', 'custom'),
            value('ip65', 'IP65', 'ip65', 'IP65', 'string', 'custom'),
          ],
        },
      ],
      cascadeRules: [],
    },
  ];
}

export function getEnabledDictionaryCategory(
  categories: DictionaryCategory[],
  key: string,
): DictionaryCategory | undefined {
  const category = categories.find(item => item.key === key && item.enabled);
  if (!category) return undefined;

  const enabledFieldIds = new Set(category.fields.filter(field => field.enabled).map(field => field.id));
  return {
    ...category,
    fields: category.fields
      .filter(field => field.enabled)
      .sort((a, b) => a.seq - b.seq)
      .map(field => ({
        ...field,
        values: field.values.filter(item => item.enabled),
      })),
    cascadeRules: category.cascadeRules.filter(rule =>
      rule.enabled
      && enabledFieldIds.has(rule.parentFieldId)
      && enabledFieldIds.has(rule.childFieldId)),
  };
}

export function getAllowedDictionaryValues(
  category: DictionaryCategory,
  fieldId: string,
  selections: Record<string, string | undefined>,
): DictionaryValue[] {
  const field = category.fields.find(item => item.id === fieldId);
  if (!field?.enabled) return [];

  const activeRules = category.cascadeRules.filter(rule =>
    rule.enabled
    && rule.childFieldId === fieldId
    && selections[rule.parentFieldId] === rule.parentValueId);

  if (!activeRules.length) return field.values.filter(item => item.enabled);
  const allowedIds = new Set(activeRules.flatMap(rule => rule.allowedChildValueIds));
  return field.values.filter(item => item.enabled && allowedIds.has(item.id));
}
