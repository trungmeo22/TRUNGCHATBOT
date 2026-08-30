import type { SourceGroup, SourcePolicy } from '../types/chat';

export const ALL_SOURCE_GROUPS: SourceGroup[] = ['BYT', 'VN_ASSOC', 'INTL_TOP_ASSOC'];

export const DEFAULT_SOURCE_POLICY: SourcePolicy = {
  scope: 'all',
  groups: [...ALL_SOURCE_GROUPS],
};

export interface SourceGroupOption {
  id: SourceGroup;
  label: string;
  shortLabel: string;
  description: string;
}

export const SOURCE_GROUP_OPTIONS: SourceGroupOption[] = [
  {
    id: 'BYT',
    label: 'Bộ Y tế Việt Nam',
    shortLabel: 'Bộ Y tế',
    description: 'Hướng dẫn chẩn đoán & phác đồ điều trị Bộ Y tế',
  },
  {
    id: 'VN_ASSOC',
    label: 'Hiệp hội Y học trong nước',
    shortLabel: 'Hiệp hội VN',
    description: 'Khuyến cáo chuyên khoa tim mạch, nội tiết, hô hấp VN...',
  },
  {
    id: 'INTL_TOP_ASSOC',
    label: 'Hiệp hội hàng đầu quốc tế',
    shortLabel: 'Quốc tế (ESC/AHA/ADA...)',
    description: 'Khuyến cáo quốc tế uy tín (ESC, AHA, ACC, KDIGO, ADA...)',
  },
];

export interface SourcePreset {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  policy: SourcePolicy;
}

export const SOURCE_PRESETS: SourcePreset[] = [
  {
    id: 'all',
    label: 'Tất cả nguồn',
    shortLabel: 'Tất cả nguồn',
    description: 'Bộ Y tế, Hiệp hội chuyên khoa trong nước & quốc tế',
    policy: {
      scope: 'all',
      groups: ['BYT', 'VN_ASSOC', 'INTL_TOP_ASSOC'],
    },
  },
  {
    id: 'byt',
    label: 'Bộ Y tế',
    shortLabel: 'Bộ Y tế',
    description: 'Hướng dẫn chẩn đoán và điều trị của Bộ Y tế Việt Nam',
    policy: {
      scope: 'all',
      groups: ['BYT'],
    },
  },
  {
    id: 'vn_assoc',
    label: 'Hiệp hội trong nước',
    shortLabel: 'Hiệp hội VN',
    description: 'Khuyến cáo của các hội chuyên khoa y học Việt Nam',
    policy: {
      scope: 'all',
      groups: ['VN_ASSOC'],
    },
  },
  {
    id: 'intl_top_assoc',
    label: 'Hiệp hội hàng đầu quốc tế',
    shortLabel: 'Quốc tế',
    description: 'Khuyến cáo của ESC, AHA, ACC, KDIGO, ADA, v.v.',
    policy: {
      scope: 'all',
      groups: ['INTL_TOP_ASSOC'],
    },
  },
];

export function areGroupsEqual(a: SourceGroup[] = [], b: SourceGroup[] = []): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((item) => setA.has(item));
}

export function isAllGroupsSelected(groups: SourceGroup[] = []): boolean {
  return ALL_SOURCE_GROUPS.every((g) => groups.includes(g));
}

export function formatSelectedSourcesLabel(groups: SourceGroup[] = []): { short: string; full: string } {
  if (groups.length === 0 || isAllGroupsSelected(groups)) {
    return {
      short: 'Tất cả nguồn',
      full: 'Tất cả nguồn tài liệu',
    };
  }

  const selectedOptions = SOURCE_GROUP_OPTIONS.filter((opt) => groups.includes(opt.id));
  if (selectedOptions.length === 1) {
    return {
      short: selectedOptions[0].shortLabel,
      full: selectedOptions[0].label,
    };
  }

  const shortCombined = selectedOptions.map((o) => o.shortLabel).join(', ');
  return {
    short: shortCombined,
    full: `${groups.length} nhóm nguồn (${shortCombined})`,
  };
}

export function getPresetFromPolicy(policy?: SourcePolicy): SourcePreset {
  if (!policy || !policy.groups || policy.groups.length === 0) {
    return SOURCE_PRESETS[0];
  }
  const match = SOURCE_PRESETS.find((preset) => areGroupsEqual(preset.policy.groups, policy.groups));
  return match || {
    id: 'custom',
    label: formatSelectedSourcesLabel(policy.groups).full,
    shortLabel: formatSelectedSourcesLabel(policy.groups).short,
    description: 'Tùy chọn kết hợp nguồn tài liệu',
    policy,
  };
}

export function isExternalSourcesEnabled(): boolean {
  const envVal = (import.meta as { env?: Record<string, unknown> }).env?.VITE_ENABLE_EXTERNAL_SOURCES;
  return envVal === true || envVal === 'true' || envVal === 1 || envVal === '1';
}

