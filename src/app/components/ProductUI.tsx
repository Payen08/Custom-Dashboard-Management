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
  ArcoIconButton as ProductIconButton,
  ArcoModal as ProductModal,
  ArcoTag as ProductTag,
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
  ArcoIconButton,
  ArcoModal,
  ArcoTag,
  ArcoField,
  ArcoSelect,
  ArcoTextArea,
  ArcoTextInput,
  ArcoUploadBox,
} from './ArcoLike';
