import tokens from '../tokens/design-tokens.json';

export type ProductThemeMode = 'light' | 'dark';
export type ProductStylePreset = 'current' | 'industrial';
export type ProductIndustrialColorTheme = 'steel' | 'cobalt' | 'graphite';

/**
 * Copy this file and tokens/design-tokens.json into the frontend project, then pass
 * createProductTheme(mode, preset, industrialColorTheme) to the application theme provider.
 *
 * The JSON file remains the source of truth. Do not add page-specific values
 * to this mapping; publish a token first.
 *
 * @param mode              - 'light' | 'dark'
 * @param preset            - 'current' (default) | 'industrial' (requires explicit approval)
 * @param industrialColorTheme - 'steel' (default) | 'cobalt' | 'graphite'
 *                             Only used when preset === 'industrial'.
 *
 * Resolved radius (Current):
 *   button   = 8px   → Button
 *   control  = 10px  → Input, Select, SearchInput
 *   xs       = 6px   → Checkbox
 *   inner    = 12px  → Table header, inner containers
 *   overlay  = 16px  → Modal, Drawer, Popover, Tooltip, Dropdown
 *   pill     = 999px → Tag
 *
 * Resolved radius (Industrial):
 *   button   = 4px   (all controls use tighter radius)
 *   control  = 4px
 *   xs       = 2px
 *   card     = 6px
 *   overlay  = 6px
 */
export function createProductTheme(
  mode: ProductThemeMode,
  preset: ProductStylePreset = 'current',
  industrialColorTheme: ProductIndustrialColorTheme = 'steel',
) {
  const industrial = preset === 'industrial';
  const theme = tokens.theme[mode];
  const industrialPreset = tokens.stylePresets.industrial;
  const presetTheme = industrialColorTheme === 'steel'
    ? industrialPreset.theme[mode]
    : industrialPreset.colorThemes[industrialColorTheme].theme[mode];
  const color = industrial ? presetTheme.color : theme.color;
  const shadow = industrial ? industrialPreset.theme[mode].shadow : theme.shadow;
  const { typography, control, motion } = tokens.shared;
  const radius = industrial ? tokens.stylePresets.industrial.radius : tokens.shared.radius;

  return {
    token: {
      // ── Brand & State Colors ──────────────────────────────────────────
      colorPrimary: color.brand,
      colorInfo: color.info,
      colorSuccess: color.success,
      colorWarning: color.warning,
      colorError: color.danger,

      // ── Surface Colors ────────────────────────────────────────────────
      colorBgBase: color.page,
      colorBgLayout: color.layout,
      colorBgContainer: color.surface,
      colorBgElevated: color.surfaceRaised,
      colorFillAlter: color.soft,
      colorFill: color.soft,
      colorFillSecondary: color.soft,
      colorBgMask: color.overlay,

      // ── Text Colors ───────────────────────────────────────────────────
      colorText: color.heading,
      colorTextSecondary: color.text,
      colorTextTertiary: color.muted,
      colorTextDisabled: color.muted,
      colorTextLightSolid: color.accentContrast,

      // ── Border Colors ─────────────────────────────────────────────────
      colorBorder: color.border,
      colorBorderSecondary: color.border,

      // ── Semantic Soft Backgrounds ─────────────────────────────────────
      colorPrimaryBg: color.accentSoft,
      colorPrimaryText: color.accent,
      colorInfoBg: color.infoSoft,
      colorInfoText: color.infoText,
      colorSuccessBg: color.successSoft,
      colorSuccessText: color.successText,
      colorWarningBg: color.warningSoft,
      colorWarningText: color.warningText,
      colorErrorBg: color.dangerSoft,
      colorErrorText: color.dangerText,

      // ── Link Colors ───────────────────────────────────────────────────
      colorLink: color.accent,
      colorLinkHover: color.accent,
      colorLinkActive: color.accent,

      // ── Typography ────────────────────────────────────────────────────
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

      // ── Radius ────────────────────────────────────────────────────────
      // Global default: input/control radius (10px for Current, 4px for Industrial).
      // Individual components override this as needed (see components section below).
      borderRadiusXS: radius.xs,      // 6px Current / 2px Industrial  → Checkbox, small elements
      borderRadiusSM: radius.sm,      // 8px Current / 4px Industrial  → subtle rounding
      borderRadius: radius.control,   // 10px Current / 4px Industrial → global fallback (Input-like)
      borderRadiusLG: radius.overlay, // 16px Current / 6px Industrial → Modal, Popover, Dropdown

      // ── Control Heights ───────────────────────────────────────────────
      controlHeight: control.fieldHeight,          // 40px
      controlHeightSM: control.buttonHeight.sm,    // 32px
      controlHeightLG: control.buttonHeight.md,    // 40px (same as md; spec has no larger size)

      // ── Shadow ────────────────────────────────────────────────────────
      boxShadow: shadow.overlay,
      boxShadowSecondary: shadow.card,

      // ── Motion ───────────────────────────────────────────────────────
      motionDurationFast: motion.duration.fast,
      motionDurationMid: motion.duration.mid,
      motionDurationSlow: motion.duration.slow,
      motionEaseInOut: motion.ease.inOut,
    },
    components: {
      // ── Button ───────────────────────────────────────────────────────
      // Overrides global borderRadius (control=10px) down to button=8px.
      // Heights: xs=24px not exposed by Ant Design; sm=32px, default=md=40px.
      Button: {
        borderRadius: radius.button,                                    // 8px Current / 4px Industrial
        controlHeight: control.buttonHeight.md,                         // 40px (md)
        controlHeightSM: control.buttonHeight.sm,                       // 32px (sm)
        controlHeightLG: control.buttonHeight.md,                       // 40px (no larger spec size)
        // FIX: paddingInline must be a number, not the whole object
        paddingInline: tokens.components.button.paddingInline.md,       // 14px (md)
        paddingInlineSM: tokens.components.button.paddingInline.sm,     // 10px (sm)
        // Font
        contentFontSize: tokens.components.button.fontSize.md,          // 14px
        contentFontSizeSM: tokens.components.button.fontSize.sm,        // 12px
        fontWeight: tokens.components.button.fontWeight,                 // 600
        // Colors
        primaryColor: color.accentContrast,
        dangerColor: color.dangerContrast,
        defaultBg: color.surface,
        defaultBorderColor: color.border,
        defaultColor: color.heading,
      },

      // ── Input ────────────────────────────────────────────────────────
      Input: {
        borderRadius: radius.control,                                    // 10px Current / 4px Industrial
        controlHeight: control.fieldHeight,                              // 40px
        colorBgContainer: color.surface,
        colorTextPlaceholder: color.muted,
        activeBorderColor: color.accent,
        hoverBorderColor: color.borderStrong,
        activeShadow: `0 0 0 ${tokens.state.focus.ringWidth}px ${color.focus}`,
        errorActiveShadow: `0 0 0 ${tokens.state.focus.ringWidth}px ${color.danger}`,
      },

      // ── Select ───────────────────────────────────────────────────────
      Select: {
        borderRadius: radius.control,                                    // 10px Current / 4px Industrial
        controlHeight: control.fieldHeight,                              // 40px
        optionActiveBg: color.soft,
        optionSelectedBg: color.accentSoft,
        optionSelectedColor: color.accent,
        activeBorderColor: color.accent,
        hoverBorderColor: color.borderStrong,
      },

      // ── Checkbox ─────────────────────────────────────────────────────
      // Overrides global borderRadius (control=10px) down to xs=6px.
      Checkbox: {
        borderRadiusSM: radius.xs,                                       // 6px Current / 2px Industrial
        colorPrimary: color.accent,
        colorPrimaryHover: color.accent,
      },

      // ── Radio ────────────────────────────────────────────────────────
      Radio: {
        colorPrimary: color.accent,
        colorPrimaryHover: color.accent,
      },

      // ── Switch ───────────────────────────────────────────────────────
      Switch: {
        colorPrimary: color.accent,
        colorPrimaryHover: color.accent,
        handleBg: color.surface,
        trackMinWidth: tokens.components.switch.width,                   // 36px
        trackHeight: tokens.components.switch.height,                    // 20px
      },

      // ── Table ────────────────────────────────────────────────────────
      Table: {
        headerBg: color.soft,
        headerColor: color.text,
        borderColor: color.border,
        headerSplitColor: 'transparent',
        rowHoverBg: color.soft,
        rowSelectedBg: color.accentSoft,
        rowSelectedHoverBg: color.accentSoft,
        headerBorderRadius: radius.inner,                                // 12px Current / 4px Industrial
        cellFontSize: tokens.components.table.typography.cell.fontSize, // 14px
        cellFontSizeSM: tokens.components.table.typography.cell.fontSize,
        cellPaddingBlock: 0,                                             // vertically centered by row height
        cellPaddingBlockSM: 0,
        cellPaddingInline: control.paddingInline.md,                    // 16px
      },

      // ── Tree ─────────────────────────────────────────────────────────
      Tree: {
        titleHeight: tokens.components.tree.rowHeight,
        indentSize: tokens.components.tree.indent,
        nodeHoverBg: color.soft,
        nodeSelectedBg: color.accentSoft,
        nodeSelectedColor: color.accent,
      },

      // ── DatePicker ───────────────────────────────────────────────────
      DatePicker: {
        controlHeight: tokens.components.dateTimePicker.height,
        borderRadius: radius.control,
        cellHeight: tokens.components.dateTimePicker.calendarCellSize,
        cellWidth: tokens.components.dateTimePicker.calendarCellSize,
        activeBorderColor: color.accent,
        hoverBorderColor: color.borderStrong,
        activeShadow: `0 0 0 ${tokens.state.focus.ringWidth}px ${color.focus}`,
      },

      // ── Steps ────────────────────────────────────────────────────────
      Steps: {
        iconSize: tokens.components.steps.iconSize,
        colorPrimary: color.accent,
        colorTextDescription: color.text,
        colorError: color.danger,
      },

      // ── Tabs ─────────────────────────────────────────────────────────
      Tabs: {
        itemColor: color.text,
        itemHoverColor: color.accent,
        itemSelectedColor: color.accent,
        inkBarColor: color.accent,
      },

      // ── Menu ─────────────────────────────────────────────────────────
      Menu: {
        itemColor: color.text,
        itemHoverBg: color.soft,
        itemSelectedBg: color.accentSoft,
        itemSelectedColor: color.accent,
        itemActiveBg: color.accentSoft,
        // Dropdown panel uses overlay radius
        borderRadius: radius.overlay,                                    // 16px Current / 6px Industrial
        itemBorderRadius: radius.inner,                                  // 12px Current / 4px Industrial
      },

      // ── Dropdown ─────────────────────────────────────────────────────
      Dropdown: {
        borderRadius: radius.overlay,                                    // 16px Current / 6px Industrial
        borderRadiusLG: radius.overlay,
        colorBgElevated: color.surfaceRaised,
      },

      // ── Tag ──────────────────────────────────────────────────────────
      // Tags use pill radius (999px) regardless of preset.
      Tag: {
        defaultBg: color.soft,
        defaultColor: color.text,
        defaultBorderColor: 'transparent',
        borderRadiusSM: tokens.shared.radius.pill,                       // always 999px — pill shape
      },

      // ── Popover ──────────────────────────────────────────────────────
      Popover: {
        borderRadiusLG: radius.overlay,                                  // 16px Current / 6px Industrial
        colorBgElevated: color.surfaceRaised,
        boxShadowSecondary: shadow.overlay,
      },

      // ── Tooltip ──────────────────────────────────────────────────────
      Tooltip: {
        borderRadius: radius.sm,                                         // 8px Current / 4px Industrial
        colorBgDefault: color.heading,                                   // inverted tooltip background
        colorTextLightSolid: color.surface,
      },

      // ── Modal ────────────────────────────────────────────────────────
      Modal: {
        contentBg: color.surfaceRaised,
        headerBg: color.surfaceRaised,
        titleFontSize: typography.fontSize['18'],                        // 18px
        titleLineHeight: typography.lineHeight.normal,
        borderRadiusLG: radius.overlay,                                  // 16px Current / 6px Industrial
        paddingMD: 24,
        paddingContentHorizontalLG: 24,
      },

      // ── Drawer ───────────────────────────────────────────────────────
      Drawer: {
        colorBgElevated: color.surfaceRaised,
        borderRadiusLG: radius.overlay,
      },

      // ── Pagination ───────────────────────────────────────────────────
      Pagination: {
        itemSize: tokens.components.pagination.itemSize,                 // 32px
        itemActiveBg: color.accentSoft,
        colorPrimary: color.accent,
        colorPrimaryHover: color.accent,
        borderRadius: radius.sm,                                         // 8px Current / 4px Industrial
      },
    },
  };
}
