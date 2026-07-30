/**
 * Product-wide UI entry point.
 *
 * New business components must import from this module instead of importing a
 * UI-kit implementation directly. The compatibility exports keep existing
 * screens stable while the remaining overlay and form primitives migrate.
 */
export {
  ArcoButton as ProductButton,
  ArcoCheckbox as ProductCheckbox,
  ArcoDrawer as ProductDrawer,
  ArcoIconButton as ProductIconButton,
  ArcoIconToggleButton as ProductIconToggleButton,
  ArcoModal as ProductModal,
  ArcoTag as ProductTag,
  ArcoToggleButton as ProductToggleButton,
  ArcoField as ProductField,
  ArcoSelect as ProductSelect,
  ArcoTextArea as ProductTextArea,
  ArcoTextInput as ProductTextInput,
  ArcoUploadBox as ProductUploadBox,
} from './ArcoLike';

// Transitional aliases: existing pages can move their import path without a
// behavior change. Do not use these aliases in newly created components.
export {
  ArcoButton,
  ArcoCheckbox,
  ArcoDrawer,
  ArcoIconButton,
  ArcoIconToggleButton,
  ArcoModal,
  ArcoTag,
  ArcoToggleButton,
  ArcoField,
  ArcoSelect,
  ArcoTextArea,
  ArcoTextInput,
  ArcoUploadBox,
} from './ArcoLike';
