import type { SourceGroup, SourcePolicy } from '../types/chat';

export const DEFAULT_SOURCE_POLICY: SourcePolicy = {
  scope: 'all',
  groups: ['BYT', 'VN_ASSOC', 'INTL_TOP_ASSOC'],
};

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
    shortLabel: 'Tất cả',
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

export function areGroupsEqual(a: SourceGroup[], b: SourceGroup[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((item) => setA.has(item));
}

export function getPresetFromPolicy(policy?: SourcePolicy): SourcePreset {
  if (!policy || !policy.groups || policy.groups.length === 0) {
    return SOURCE_PRESETS[0];
  }
  const match = SOURCE_PRESETS.find((preset) => areGroupsEqual(preset.policy.groups, policy.groups));
  return match || SOURCE_PRESETS[0];
}

export function isExternalSourcesEnabled(): boolean {
  const envVal = (import.meta as { env?: Record<string, unknown> }).env?.VITE_ENABLE_EXTERNAL_SOURCES;
  return envVal === true || envVal === 'true' || envVal === 1 || envVal === '1';
}
