export type ThemeMode = 'light' | 'dark';
export type StylePreset = 'current' | 'industrial';
export type IndustrialColorTheme = 'steel' | 'cobalt' | 'graphite';

export interface ThemePalette {
  bgBase: string;
  bgLayout: string;
  fillAlter: string;
  surface: string;
  primary: string;
  primaryText: string;
  primaryContrast: string;
  primaryBg: string;
  primaryAccent: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  iconPrimary: string;
  iconSecondary: string;
  textDisabled: string;
  warning: string;
  warningBg: string;
  success: string;
  successBg: string;
  info: string;
  infoBg: string;
  neutral: string;
  neutralBg: string;
  danger: string;
  dangerBg: string;
}

export const THEME_PALETTES: Record<ThemeMode, ThemePalette> = {
  light: {
    bgBase: '#F0F0F0',
    bgLayout: '#F8F9FA',
    fillAlter: '#FAFAFA',
    surface: '#FFFFFF',
    primary: '#241F7D',
    primaryText: '#241F7D',
    primaryContrast: '#FFFFFF',
    primaryBg: '#EDEFFF',
    primaryAccent: '#CAD9FF',
    border: '#DDDDDD',
    textPrimary: '#333333',
    textSecondary: '#666666',
    iconPrimary: '#4E4E4E',
    iconSecondary: '#DDDDDD',
    textDisabled: '#999999',
    warning: '#C68700',
    warningBg: '#FFF8EA',
    success: '#00910E',
    successBg: '#E9F1E7',
    info: '#241F7D',
    infoBg: '#EBE9F9',
    neutral: '#333333',
    neutralBg: '#EFEFEF',
    danger: '#C00F0C',
    dangerBg: '#F9E7E7',
  },
  dark: {
    bgBase: '#0F0F11',
    bgLayout: '#151517',
    fillAlter: '#1B1B1E',
    surface: '#222226',
    primary: '#4F46E5',
    primaryText: '#FFFFFF',
    primaryContrast: '#FFFFFF',
    primaryBg: '#261F36',
    primaryAccent: '#AFC2FF',
    border: '#36363C',
    textPrimary: '#F3F3F4',
    textSecondary: '#B9B9BF',
    iconPrimary: '#AAAAAA',
    iconSecondary: '#5E5E5E',
    textDisabled: '#8E9098',
    warning: '#E6A23C',
    warningBg: '#3A2A12',
    success: '#39D353',
    successBg: '#14351D',
    info: '#878BFF',
    infoBg: '#26213F',
    neutral: '#C8C8CE',
    neutralBg: '#2A2A2E',
    danger: '#FF5C5C',
    dangerBg: '#3A1717',
  },
};

export const INDUSTRIAL_PALETTES: Record<ThemeMode, ThemePalette> = {
  light: {
    bgBase: '#F0F0F0',
    bgLayout: '#F7F9FA',
    fillAlter: '#F5F7F9',
    surface: '#FFFFFF',
    primary: '#255D76',
    primaryText: '#1F5067',
    primaryContrast: '#FFFFFF',
    primaryBg: '#E6F0F5',
    primaryAccent: '#39758F',
    border: '#D9E0E4',
    textPrimary: '#17252C',
    textSecondary: '#42545D',
    iconPrimary: '#53666F',
    iconSecondary: '#C7D0D5',
    textDisabled: '#788891',
    warning: '#A96B00',
    warningBg: '#FFF2D6',
    success: '#267A43',
    successBg: '#E5F3E9',
    info: '#356B9A',
    infoBg: '#E5EEF6',
    neutral: '#3F525C',
    neutralBg: '#E8EEF1',
    danger: '#B93A35',
    dangerBg: '#F8E5E3',
  },
  dark: {
    bgBase: '#09131A',
    bgLayout: '#0D1921',
    fillAlter: '#13222C',
    surface: '#172730',
    primary: '#317895',
    primaryText: '#8CC3DA',
    primaryContrast: '#FFFFFF',
    primaryBg: '#153443',
    primaryAccent: '#69A9C4',
    border: '#263C47',
    textPrimary: '#F1F6F8',
    textSecondary: '#B8C7CE',
    iconPrimary: '#A8BBC4',
    iconSecondary: '#37515F',
    textDisabled: '#7E929C',
    warning: '#E3B341',
    warningBg: '#34270D',
    success: '#42C879',
    successBg: '#102A1D',
    info: '#60A5FA',
    infoBg: '#10253D',
    neutral: '#CAD5DA',
    neutralBg: '#20323C',
    danger: '#FF6B6B',
    dangerBg: '#321719',
  },
};

const INDUSTRIAL_SIGNAL: Record<ThemeMode, string> = {
  light: '#E56A17',
  dark: '#D46A28',
};

const INDUSTRIAL_COBALT_PALETTES: Record<ThemeMode, ThemePalette> = {
  light: {
    bgBase: '#F0F0F0',
    bgLayout: '#F7F9FA',
    fillAlter: '#F5F7F9',
    surface: '#FFFFFF',
    primary: '#241F7D',
    primaryText: '#241F7D',
    primaryContrast: '#FFFFFF',
    primaryBg: '#EEEDF7',
    primaryAccent: '#4B4595',
    border: '#D9E0E4',
    textPrimary: '#17252C',
    textSecondary: '#42545D',
    iconPrimary: '#53666F',
    iconSecondary: '#C7D0D5',
    textDisabled: '#788891',
    warning: '#A96B00',
    warningBg: '#FFF2D6',
    success: '#267A43',
    successBg: '#E5F3E9',
    info: '#241F7D',
    infoBg: '#EEEDF7',
    neutral: '#3F525C',
    neutralBg: '#E8EEF1',
    danger: '#B93A35',
    dangerBg: '#F8E5E3',
  },
  dark: {
    bgBase: '#09131A',
    bgLayout: '#0D1921',
    fillAlter: '#13222C',
    surface: '#172730',
    primary: '#645CC7',
    primaryText: '#C4C0FF',
    primaryContrast: '#FFFFFF',
    primaryBg: '#27264A',
    primaryAccent: '#918AED',
    border: '#263C47',
    textPrimary: '#F1F6F8',
    textSecondary: '#B8C7CE',
    iconPrimary: '#A8BBC4',
    iconSecondary: '#37515F',
    textDisabled: '#7E929C',
    warning: '#E3B341',
    warningBg: '#34270D',
    success: '#42C879',
    successBg: '#102A1D',
    info: '#918AED',
    infoBg: '#27264A',
    neutral: '#CAD5DA',
    neutralBg: '#20323C',
    danger: '#FF6B6B',
    dangerBg: '#321719',
  },
};

const INDUSTRIAL_GRAPHITE_PALETTES: Record<ThemeMode, ThemePalette> = {
  light: {
    bgBase: '#F0F0F0',
    bgLayout: '#F0F1F0',
    fillAlter: '#F4F5F4',
    surface: '#FFFFFF',
    primary: '#353A3D',
    primaryText: '#30383C',
    primaryContrast: '#FFFFFF',
    primaryBg: '#ECEFEE',
    primaryAccent: '#5B666B',
    border: '#D7DBD9',
    textPrimary: '#1B2023',
    textSecondary: '#505A5F',
    iconPrimary: '#596267',
    iconSecondary: '#C3C9C6',
    textDisabled: '#7D868A',
    warning: '#A96B00',
    warningBg: '#FFF2D6',
    success: '#267A43',
    successBg: '#E5F3E9',
    info: '#426D80',
    infoBg: '#E5EEF1',
    neutral: '#454D51',
    neutralBg: '#E2E5E3',
    danger: '#B93A35',
    dangerBg: '#F8E5E3',
  },
  dark: {
    bgBase: '#0B0D0E',
    bgLayout: '#111416',
    fillAlter: '#181C1E',
    surface: '#1D2225',
    primary: '#626B70',
    primaryText: '#C3CBCF',
    primaryContrast: '#111315',
    primaryBg: '#252A2D',
    primaryAccent: '#C3CBCF',
    border: '#30363A',
    textPrimary: '#F1F3F4',
    textSecondary: '#BAC1C5',
    iconPrimary: '#A8B0B4',
    iconSecondary: '#454D51',
    textDisabled: '#80898E',
    warning: '#E3B341',
    warningBg: '#34270D',
    success: '#42C879',
    successBg: '#102A1D',
    info: '#76A8BC',
    infoBg: '#182B33',
    neutral: '#CBD0D3',
    neutralBg: '#292E31',
    danger: '#FF6B6B',
    dangerBg: '#321719',
  },
};

const INDUSTRIAL_COLOR_PALETTES: Record<IndustrialColorTheme, Record<ThemeMode, ThemePalette>> = {
  steel: INDUSTRIAL_PALETTES,
  cobalt: INDUSTRIAL_COBALT_PALETTES,
  graphite: INDUSTRIAL_GRAPHITE_PALETTES,
};

const INDUSTRIAL_SIGNALS: Record<IndustrialColorTheme, Record<ThemeMode, string>> = {
  steel: INDUSTRIAL_SIGNAL,
  cobalt: { light: '#E56A17', dark: '#D46A28' },
  graphite: { light: '#D97706', dark: '#E09A3E' },
};

function designSystemSemanticVars(palette: ThemePalette, mode: ThemeMode): Record<string, string> {
  return {
    '--ds-color-page': palette.bgBase,
    '--ds-color-layout': palette.bgLayout,
    '--ds-color-surface': palette.surface,
    '--ds-color-surface-raised': mode === 'dark' ? palette.neutralBg : palette.surface,
    '--ds-color-soft': palette.fillAlter,
    '--ds-color-border': palette.border,
    '--ds-color-border-strong': palette.iconSecondary,
    '--ds-color-heading': palette.textPrimary,
    '--ds-color-text': palette.textSecondary,
    '--ds-color-muted': palette.textDisabled,
    '--ds-color-icon': palette.iconPrimary,
    '--ds-color-brand': palette.primary,
    '--ds-color-accent': mode === 'dark' ? palette.primaryAccent : palette.primaryText,
    '--ds-color-accent-contrast': palette.primaryContrast,
    '--ds-color-accent-soft': palette.primaryBg,
    '--ds-color-focus': mode === 'dark' ? palette.primary : palette.primaryAccent,
    '--ds-color-info': palette.info,
    '--ds-color-info-soft': palette.infoBg,
    '--ds-color-warning': palette.warning,
    '--ds-color-warning-soft': palette.warningBg,
    '--ds-color-success': palette.success,
    '--ds-color-success-soft': palette.successBg,
    '--ds-color-danger': palette.danger,
    '--ds-color-danger-soft': palette.dangerBg,
    '--ds-color-overlay': mode === 'dark' ? 'rgba(0,0,0,0.64)' : 'rgba(15,15,17,0.42)',
    '--ds-shadow-xs': mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.24)' : '0 1px 2px rgba(51,51,51,0.06)',
    '--ds-shadow-card': mode === 'dark' ? '0 18px 44px -32px rgba(0,0,0,0.52)' : '0 18px 44px -32px rgba(15,23,42,0.35)',
    '--ds-shadow-overlay': mode === 'dark'
      ? '0 18px 48px -18px rgba(0,0,0,0.64), 0 4px 12px rgba(0,0,0,0.24)'
      : '0 18px 48px -18px rgba(15,23,42,0.30), 0 4px 12px rgba(15,23,42,0.06)',
    '--ds-shadow-dialog': mode === 'dark' ? '0 24px 72px -24px rgba(0,0,0,0.72)' : '0 24px 72px -24px rgba(15,23,42,0.38)',
  };
}

function appVars(palette: ThemePalette, mode: ThemeMode): Record<string, string> {
  return {
    ...designSystemSemanticVars(palette, mode),
    '--app-page-padding': 'var(--ds-layout-page-padding)',
    '--app-section-gap': 'var(--ds-layout-module-gap)',
    '--app-card-radius': 'var(--ds-radius-card)',
    '--app-inner-radius': 'var(--ds-radius-inner)',
    '--app-control-radius': 'var(--ds-radius-control)',
    '--app-bg': palette.bgBase,
    '--app-layout': palette.bgLayout,
    '--app-surface': palette.surface,
    '--app-soft': palette.fillAlter,
    '--app-border': palette.border,
    '--app-border-strong': palette.iconSecondary,
    '--app-heading': palette.textPrimary,
    '--app-text': palette.textSecondary,
    '--app-muted': palette.textDisabled,
    '--app-subtle': palette.textDisabled,
    '--app-icon': palette.iconPrimary,
    '--app-brand': palette.primary,
    '--app-accent': mode === 'dark' ? palette.primaryAccent : palette.primaryText,
    '--app-accent-text': mode === 'dark' ? palette.primaryAccent : palette.primaryText,
    '--app-accent-soft': palette.primaryBg,
    '--app-accent-border': mode === 'dark' ? palette.primary : palette.primaryAccent,
    '--app-info': palette.info,
    '--app-info-soft': palette.infoBg,
    '--app-warning': palette.warning,
    '--app-warning-soft': palette.warningBg,
    '--app-success': palette.success,
    '--app-success-soft': palette.successBg,
    '--app-neutral': palette.neutral,
    '--app-neutral-soft': palette.neutralBg,
    '--app-danger': palette.danger,
    '--app-danger-soft': palette.dangerBg,
    '--app-danger-border': palette.danger,
    '--app-overlay': mode === 'dark' ? 'rgba(0,0,0,0.64)' : 'rgba(15,15,17,0.42)',
    '--app-shadow-color': mode === 'dark' ? 'rgba(0,0,0,0.32)' : 'rgba(51,51,51,0.10)',
    '--app-scene': mode === 'dark' ? palette.bgLayout : '#222226',
    '--app-scene-soft': mode === 'dark' ? palette.fillAlter : '#2A2A2E',
    '--app-scene-border': mode === 'dark' ? palette.border : '#36363C',
    '--app-scene-text': '#F3F3F4',
    '--app-scene-muted': '#B9B9BF',
  };
}

export const APP_THEME_VARS: Record<ThemeMode, Record<string, string>> = {
  light: appVars(THEME_PALETTES.light, 'light'),
  dark: appVars(THEME_PALETTES.dark, 'dark'),
};

const CURRENT_STYLE_VARS: Record<string, string> = {
  '--radius': '0.625rem',
  '--ds-radius-xs': '6px',
  '--ds-radius-sm': '8px',
  '--ds-radius-button': '8px',
  '--ds-radius-control': '10px',
  '--ds-radius-inner': '12px',
  '--ds-radius-card': '16px',
  '--ds-radius-overlay': '16px',
  '--ds-layout-grid-gap': '16px',
  '--ds-layout-module-gap': '16px',
  '--ds-table-header-height': '44px',
  '--ds-table-row-height': '52px',
  '--ds-icon-stroke-width': '1.8',
};

function industrialStyleVars(mode: ThemeMode, palette: ThemePalette): Record<string, string> {
  const hoverBg = `color-mix(in srgb, ${palette.primary} ${mode === 'dark' ? '16%' : '7%'}, ${palette.surface})`;
  const pressedBg = `color-mix(in srgb, ${palette.primary} ${mode === 'dark' ? '24%' : '13%'}, ${palette.surface})`;
  return {
  '--radius': '0.25rem',
  '--ds-radius-xs': '2px',
  '--ds-radius-sm': '4px',
  '--ds-radius-button': '4px',
  '--ds-radius-control': '4px',
  '--ds-radius-inner': '4px',
  '--ds-radius-card': '6px',
  '--ds-radius-overlay': '6px',
  '--ds-layout-page-padding': '0px',
  '--ds-layout-page-padding-block': '0px',
  '--ds-layout-grid-gap': '12px',
  '--ds-layout-module-gap': '0px',
  '--ds-table-header-height': '40px',
  '--ds-table-row-height': '48px',
  '--ds-icon-stroke-width': '1.6',
  '--ds-shadow-xs': mode === 'dark' ? '0 1px 0 rgba(0,0,0,0.48)' : '0 1px 0 rgba(29,36,40,0.10)',
  '--ds-shadow-card': 'none',
  '--ds-shadow-overlay': mode === 'dark' ? '0 12px 32px rgba(0,0,0,0.55)' : '0 12px 28px rgba(29,36,40,0.18)',
  '--ds-shadow-dialog': mode === 'dark' ? '0 18px 48px rgba(0,0,0,0.68)' : '0 18px 44px rgba(29,36,40,0.24)',
  '--ds-state-hover-bg': hoverBg,
  '--ds-state-hover-border': palette.primaryAccent,
  '--ds-state-pressed-bg': pressedBg,
  '--ds-state-pressed-border': palette.primary,
  '--ds-state-selected-bg': palette.primaryBg,
  '--ds-state-selected-border': palette.primary,
  '--ds-state-selected-text': mode === 'dark' ? palette.primaryText : palette.primaryText,
  '--ds-button-primary-bg': palette.primary,
  '--ds-button-primary-bg-hover': `color-mix(in srgb, ${palette.primary} 88%, ${palette.surface})`,
  '--ds-button-primary-bg-pressed': `color-mix(in srgb, ${palette.primary} 78%, #000000)`,
  '--ds-button-primary-text': palette.primaryContrast,
  '--ds-button-primary-border': palette.primary,
  '--ds-button-primary-shadow': 'none',
  '--ds-button-primary-shadow-hover': 'none',
  '--ds-button-secondary-bg': palette.primaryBg,
  '--ds-button-secondary-bg-hover': hoverBg,
  '--ds-button-secondary-bg-pressed': pressedBg,
  '--ds-button-secondary-text': mode === 'dark' ? palette.primaryText : palette.primaryText,
  '--ds-button-secondary-border': `color-mix(in srgb, ${palette.primary} 34%, ${palette.border})`,
  '--ds-button-default-bg': palette.surface,
  '--ds-button-default-text': palette.textPrimary,
  '--ds-button-default-border': palette.border,
  '--ds-button-default-border-hover': palette.primaryAccent,
  '--ds-input-bg': palette.surface,
  '--ds-input-border': palette.border,
  '--ds-input-border-hover': palette.primaryAccent,
  '--ds-input-border-focus': palette.primary,
  '--ds-table-header-bg': `color-mix(in srgb, ${palette.primary} ${mode === 'dark' ? '12%' : '5%'}, ${palette.surface})`,
  '--ds-table-border': palette.border,
  '--ds-table-row-bg-hover': hoverBg,
  '--ds-table-row-bg-selected': palette.primaryBg,
  };
}

function baseThemeVars(palette: ThemePalette): Record<string, string> {
  return {
    '--background': palette.bgBase,
    '--foreground': palette.textPrimary,
    '--card': palette.surface,
    '--card-foreground': palette.textPrimary,
    '--popover': palette.surface,
    '--popover-foreground': palette.textPrimary,
    '--primary': palette.primary,
    '--primary-foreground': palette.primaryContrast,
    '--secondary': palette.primaryBg,
    '--secondary-foreground': palette.primaryAccent,
    '--muted': palette.neutralBg,
    '--muted-foreground': palette.textSecondary,
    '--accent': palette.primaryBg,
    '--accent-foreground': palette.primaryAccent,
    '--destructive': palette.danger,
    '--destructive-foreground': '#FFFFFF',
    '--border': palette.border,
    '--input': palette.fillAlter,
    '--input-background': palette.fillAlter,
    '--switch-background': palette.iconSecondary,
    '--ring': palette.primary,
    '--chart-1': palette.info,
    '--chart-2': palette.success,
    '--chart-3': palette.warning,
    '--chart-4': palette.neutral,
    '--chart-5': palette.danger,
    '--sidebar': palette.surface,
    '--sidebar-foreground': palette.textPrimary,
    '--sidebar-primary': palette.primary,
    '--sidebar-primary-foreground': palette.primaryContrast,
    '--sidebar-accent': palette.primaryBg,
    '--sidebar-accent-foreground': palette.primaryAccent,
    '--sidebar-border': palette.border,
    '--sidebar-ring': palette.primary,
  };
}

export function getAppThemeVars(
  mode: ThemeMode,
  preset: StylePreset,
  industrialColorTheme: IndustrialColorTheme = 'steel',
): Record<string, string> {
  if (preset === 'industrial') {
    const palette = INDUSTRIAL_COLOR_PALETTES[industrialColorTheme][mode];
    const signal = INDUSTRIAL_SIGNALS[industrialColorTheme][mode];
    return {
      ...baseThemeVars(palette),
      ...appVars(palette, mode),
      ...industrialStyleVars(mode, palette),
      '--ds-color-signal': signal,
      '--app-signal': signal,
    };
  }

  return {
    ...baseThemeVars(THEME_PALETTES[mode]),
    ...APP_THEME_VARS[mode],
    ...CURRENT_STYLE_VARS,
    '--ds-color-signal': THEME_PALETTES[mode].primary,
    '--app-signal': THEME_PALETTES[mode].primary,
  };
}

function robotVars(palette: ThemePalette, mode: ThemeMode): Record<string, string> {
  return {
    ...designSystemSemanticVars(palette, mode),
    '--robot-page-padding': 'var(--ds-layout-page-padding)',
    '--robot-section-gap': 'var(--ds-layout-module-gap)',
    '--robot-card-radius': 'var(--ds-radius-card)',
    '--robot-inner-radius': 'var(--ds-radius-inner)',
    '--robot-control-radius': 'var(--ds-radius-control)',
    '--robot-page': palette.bgBase,
    '--robot-surface': palette.surface,
    '--robot-surface-raised': mode === 'dark' ? palette.neutralBg : palette.surface,
    '--robot-soft': palette.fillAlter,
    '--robot-border': palette.border,
    '--robot-border-strong': palette.iconSecondary,
    '--robot-heading': palette.textPrimary,
    '--robot-text': palette.textSecondary,
    '--robot-muted': palette.textDisabled,
    '--robot-subtle': palette.textDisabled,
    '--robot-brand': palette.primary,
    '--robot-accent': mode === 'dark' ? palette.primaryAccent : palette.primaryText,
    '--robot-accent-text': mode === 'dark' ? palette.primaryAccent : palette.primaryText,
    '--robot-accent-contrast': palette.primaryContrast,
    '--robot-accent-soft': palette.primaryBg,
    '--robot-accent-border': mode === 'dark' ? palette.primary : palette.primaryAccent,
    '--robot-shadow': 'none',
    '--robot-shadow-color': mode === 'dark' ? 'rgba(0,0,0,0.32)' : 'rgba(51,51,51,0.10)',
    '--robot-shadow-soft': mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.24)' : '0 1px 2px rgba(51,51,51,0.06)',
    '--robot-dialog-shadow': 'var(--ds-shadow-dialog)',
    '--robot-overlay': mode === 'dark' ? 'rgba(0,0,0,0.64)' : 'rgba(15,15,17,0.42)',
    '--robot-input-bg': palette.fillAlter,
    '--robot-success': palette.success,
    '--robot-success-soft': palette.successBg,
    '--robot-success-border': palette.success,
    '--robot-danger': palette.danger,
    '--robot-danger-contrast': palette.primaryContrast,
    '--robot-danger-soft': palette.dangerBg,
    '--robot-danger-border': palette.danger,
    '--robot-warning': palette.warning,
    '--robot-warning-soft': palette.warningBg,
    '--robot-info': palette.info,
    '--robot-info-soft': palette.infoBg,
    '--robot-neutral': palette.neutral,
    '--robot-neutral-soft': palette.neutralBg,
    '--robot-scene-top': '#0F0F11',
    '--robot-scene-bottom': '#222226',
    '--robot-scene-bg': '#151517',
    '--robot-scene-muted': 'rgba(185,185,191,0.14)',
    '--robot-hud-bg': 'rgba(15,15,17,0.90)',
    '--robot-hud-border': 'rgba(175,194,255,0.22)',
    '--robot-hud-text': '#F3F3F4',
    '--robot-axis-x': palette.danger,
    '--robot-axis-y': palette.success,
    '--robot-axis-z': mode === 'dark' ? palette.primaryAccent : palette.primary,
  };
}

export const ROBOT_THEME_VARS: Record<ThemeMode, Record<string, string>> = {
  light: robotVars(THEME_PALETTES.light, 'light'),
  dark: robotVars(THEME_PALETTES.dark, 'dark'),
};

export function getRobotThemeVars(
  mode: ThemeMode,
  preset: StylePreset,
  industrialColorTheme: IndustrialColorTheme = 'steel',
): Record<string, string> {
  if (preset === 'industrial') {
    const palette = INDUSTRIAL_COLOR_PALETTES[industrialColorTheme][mode];
    const signal = INDUSTRIAL_SIGNALS[industrialColorTheme][mode];
    return {
      ...robotVars(palette, mode),
      ...industrialStyleVars(mode, palette),
      '--ds-color-signal': signal,
      '--robot-signal': signal,
      '--robot-scene-top': '#07090B',
      '--robot-scene-bottom': '#1B1F22',
      '--robot-scene-bg': '#101316',
      '--robot-scene-muted': `color-mix(in srgb, ${signal} 12%, transparent)`,
      '--robot-hud-bg': 'rgba(9,11,13,0.94)',
      '--robot-hud-border': `color-mix(in srgb, ${signal} 30%, transparent)`,
      '--robot-hud-text': '#F1F3F4',
    };
  }

  return {
    ...ROBOT_THEME_VARS[mode],
    ...CURRENT_STYLE_VARS,
    '--ds-color-signal': THEME_PALETTES[mode].primary,
    '--robot-signal': THEME_PALETTES[mode].primary,
  };
}
