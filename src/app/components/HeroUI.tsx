/**
 * Product-wide HeroUI entry point.
 *
 * New business components must import from this module instead of importing a
 * UI-kit implementation directly. The compatibility exports keep existing
 * screens stable while the remaining overlay and form primitives migrate.
 */
export {
  ArcoButton as HeroButton,
  ArcoCheckbox as HeroCheckbox,
  ArcoIconButton as HeroIconButton,
  ArcoModal as HeroModal,
  ArcoTag as HeroTag,
  ArcoField as HeroField,
  ArcoSelect as HeroSelect,
  ArcoTextArea as HeroTextArea,
  ArcoTextInput as HeroTextInput,
  ArcoUploadBox as HeroUploadBox,
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
