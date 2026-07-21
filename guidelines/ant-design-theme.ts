import tokens from './design-tokens.json';

export type ProductThemeMode = 'light' | 'dark';

/**
 * Copy this file and design-tokens.json into the frontend project, then pass
 * createProductTheme(mode) to the application theme provider.
 *
 * The JSON file remains the source of truth. Do not add page-specific values
 * to this mapping; publish a token first.
 */
export function createProductTheme(mode: ProductThemeMode) {
  const theme = tokens.theme[mode];
  const { color, shadow } = theme;
  const { typography, control, radius, motion } = tokens.shared;

  return {
    token: {
      colorPrimary: color.brand,
      colorInfo: color.info,
      colorSuccess: color.success,
      colorWarning: color.warning,
      colorError: color.danger,
      colorBgBase: color.page,
      colorBgLayout: color.layout,
      colorBgContainer: color.surface,
      colorBgElevated: color.surfaceRaised,
      colorFillAlter: color.soft,
      colorText: color.heading,
      colorTextSecondary: color.text,
      colorTextTertiary: color.muted,
      colorTextDisabled: color.muted,
      colorTextLightSolid: color.accentContrast,
      colorBorder: color.border,
      colorBorderSecondary: color.border,
      colorPrimaryBg: color.accentSoft,
      colorPrimaryText: color.accent,
      colorInfoBg: color.infoSoft,
      colorSuccessBg: color.successSoft,
      colorWarningBg: color.warningSoft,
      colorErrorBg: color.dangerSoft,
      colorBgMask: color.overlay,
      colorLink: color.accent,
      colorLinkHover: color.accent,
      colorLinkActive: color.accent,
      fontFamily: typography.fontFamilySans,
      fontSize: typography.fontSize['14'],
      fontSizeSM: typography.fontSize['12'],
      fontSizeLG: typography.fontSize['16'],
      fontSizeHeading1: typography.fontSize['24'],
      fontSizeHeading2: typography.fontSize['20'],
      fontSizeHeading3: typography.fontSize['18'],
      fontSizeHeading4: typography.fontSize['16'],
      fontSizeHeading5: typography.fontSize['14'],
      fontWeightStrong: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.normal,
      borderRadius: radius.control,
      borderRadiusSM: radius.sm,
      borderRadiusLG: radius.card,
      controlHeight: control.fieldHeight,
      controlHeightSM: control.buttonHeight.sm,
      controlHeightLG: control.buttonHeight.md,
      boxShadow: shadow.overlay,
      boxShadowSecondary: shadow.overlay,
      motionDurationFast: motion.duration.fast,
      motionDurationMid: motion.duration.mid,
      motionDurationSlow: motion.duration.slow,
      motionEaseInOut: motion.ease.inOut,
    },
    components: {
      Button: {
        borderRadius: radius.button,
        controlHeight: control.buttonHeight.md,
        controlHeightSM: control.buttonHeight.sm,
        controlHeightLG: control.buttonHeight.md,
        paddingInline: tokens.components.button.paddingInline,
        primaryColor: color.accentContrast,
        defaultBg: color.surface,
        defaultBorderColor: color.border,
        defaultColor: color.heading,
      },
      Input: {
        activeBorderColor: color.accent,
        hoverBorderColor: color.borderStrong,
        activeShadow: `0 0 0 ${tokens.state.focus.ringWidth}px ${color.focus}`,
        colorBgContainer: color.surface,
        colorTextPlaceholder: color.muted,
        borderRadius: radius.control,
        controlHeight: control.fieldHeight,
      },
      Select: {
        optionActiveBg: color.soft,
        optionSelectedBg: color.accentSoft,
        optionSelectedColor: color.accent,
        activeBorderColor: color.accent,
        hoverBorderColor: color.borderStrong,
        borderRadius: radius.control,
        controlHeight: control.fieldHeight,
      },
      Table: {
        headerBg: color.soft,
        headerColor: color.heading,
        borderColor: color.border,
        rowHoverBg: color.soft,
        rowSelectedBg: color.accentSoft,
        headerBorderRadius: radius.inner,
        cellPaddingBlock: 0,
        cellPaddingInline: control.paddingInline.md,
      },
      Tabs: {
        itemColor: color.text,
        itemHoverColor: color.accent,
        itemSelectedColor: color.accent,
        inkBarColor: color.accent,
      },
      Menu: {
        itemColor: color.text,
        itemHoverBg: color.soft,
        itemSelectedBg: color.accentSoft,
        itemSelectedColor: color.accent,
      },
      Tag: {
        defaultBg: color.soft,
        defaultColor: color.text,
        defaultBorderColor: 'transparent',
        borderRadiusSM: radius.pill,
      },
      Modal: {
        contentBg: color.surfaceRaised,
        headerBg: color.surfaceRaised,
        titleFontSize: typography.fontSize['18'],
        borderRadiusLG: radius.overlay,
      },
      Drawer: {
        colorBgElevated: color.surfaceRaised,
      },
    },
  };
}
