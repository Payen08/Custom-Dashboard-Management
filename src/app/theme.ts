export type ThemeMode = 'light' | 'dark';

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

function designSystemSemanticVars(palette: ThemePalette, mode: ThemeMode): Record<string, string> {
  return {
    '--ds-color-page': palette.bgBase,
    '--ds-color-layout': palette.bgLayout,
    '--ds-color-surface': palette.surface,
    '--ds-color-surface-raised': mode === 'dark' ? palette.neutralBg : palette.surface,
    '--ds-color-soft': palette.fillAlter,
    '--ds-color-border': palette.border,
    '--ds-color-border-strong': mode === 'dark' ? palette.iconSecondary : palette.border,
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
    '--app-border-strong': mode === 'dark' ? palette.iconSecondary : palette.border,
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
    '--robot-border-strong': mode === 'dark' ? palette.iconSecondary : palette.border,
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
