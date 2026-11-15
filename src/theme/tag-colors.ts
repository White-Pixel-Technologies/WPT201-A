export const lightTagColors = {
  red: '#FEE2E2',
  coral: '#FFE4E1',
  orange: '#FFEDD5',
  gold: '#FEF3C7',
  lime: '#ECFCCB',
  green: '#DCFCE7',
  teal: '#CCFBF1',
  cyan: '#CFFAFE',
  blue: '#DBEAFE',
  indigo: '#E0E7FF',
  purple: '#F3E8FF',
  pink: '#FCE7F3',
  magenta: '#FCE7F3',
  brown: '#EDE0D3',
  olive: '#E7EACB',
  grey: '#E5E7EB',
} as const;

export const darkTagColors = {
  red: '#7F1D1D',
  coral: '#7C2D2D',
  orange: '#7C2D12',
  gold: '#78350F',
  lime: '#365314',
  green: '#14532D',
  teal: '#134E4A',
  cyan: '#164E63',
  blue: '#1E3A8A',
  indigo: '#312E81',
  purple: '#581C87',
  pink: '#831843',
  magenta: '#861A5B',
  brown: '#5C4033',
  olive: '#4B5320',
  grey: '#374151',
} as const;

export type TagColorName = keyof typeof lightTagColors;
