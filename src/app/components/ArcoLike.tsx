import { Children, forwardRef, isValidElement, useId, type CSSProperties, type ReactNode } from 'react';
import {
  ButtonRoot,
  Calendar as CalendarRoot,
  CheckboxContent,
  CheckboxControl,
  CheckboxIndicator,
  CheckboxRoot,
  ChipRoot,
  DateField,
  DatePicker,
  InputRoot,
  ListBoxItemRoot,
  ListBoxRoot,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeading,
  ModalRoot,
  SelectIndicator,
  SelectPopover,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  TextAreaRoot,
  useOverlayState,
} from '@heroui/react';
import { Upload, X } from 'lucide-react';
import '../../styles/arco-like.css';
import { useI18n } from '../i18n';

type ArcoScope = 'app' | 'robot';
type ButtonVisualType = 'default' | 'primary' | 'secondary' | 'text' | 'outline';
type ButtonStatus = 'normal' | 'success' | 'danger' | 'warning';
type ButtonSize = 'mini' | 'small' | 'default' | 'large';
type TagTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
type TagSize = 'small' | 'default';
type CssVars = CSSProperties & Record<string, string | number | undefined>;

function scopeVars(scope: ArcoScope): CssVars {
  const prefix = scope === 'robot' ? 'robot' : 'app';
  return {
    '--arcoui-card-radius': `var(--${prefix}-card-radius, 16px)`,
    '--arcoui-inner-radius': `var(--${prefix}-inner-radius, 12px)`,
    '--arcoui-button-radius': 'var(--ds-radius-button, 8px)',
    '--arcoui-control-radius': `var(--${prefix}-control-radius, 10px)`,
    '--arcoui-surface': `var(--${prefix}-surface)`,
    '--arcoui-soft': `var(--${prefix}-soft)`,
    '--arcoui-border': `var(--${prefix}-border)`,
    '--arcoui-border-strong': `var(--${prefix}-border-strong)`,
    '--arcoui-heading': `var(--${prefix}-heading)`,
    '--arcoui-text': `var(--${prefix}-text)`,
    '--arcoui-muted': `var(--${prefix}-muted)`,
    '--arcoui-accent': `var(--${prefix}-brand, var(--${prefix}-accent))`,
    '--arcoui-accent-text': scope === 'robot' ? 'var(--robot-accent-text)' : `var(--${prefix}-accent-text, var(--${prefix}-accent))`,
    '--arcoui-accent-contrast': scope === 'robot' ? 'var(--robot-accent-contrast)' : '#FFFFFF',
    '--arcoui-accent-soft': `var(--${prefix}-accent-soft)`,
    '--arcoui-accent-border': `var(--${prefix}-accent-border)`,
    '--arcoui-success': `var(--${prefix}-success)`,
    '--arcoui-success-soft': `var(--${prefix}-success-soft)`,
    '--arcoui-warning': `var(--${prefix}-warning)`,
    '--arcoui-warning-soft': `var(--${prefix}-warning-soft)`,
    '--arcoui-neutral': `var(--${prefix}-neutral)`,
    '--arcoui-neutral-soft': `var(--${prefix}-neutral-soft)`,
    '--arcoui-danger': `var(--${prefix}-danger)`,
    '--arcoui-danger-contrast': scope === 'robot' ? 'var(--robot-danger-contrast)' : 'var(--ds-color-danger-contrast)',
    '--arcoui-danger-soft': `var(--${prefix}-danger-soft)`,
    '--arcoui-danger-border': `var(--${prefix}-danger-border)`,
    '--arcoui-overlay': scope === 'robot' ? 'var(--robot-overlay)' : 'var(--app-overlay)',
    '--arcoui-shadow': scope === 'robot' ? 'var(--robot-dialog-shadow)' : 'var(--ds-shadow-dialog)',
    '--arcoui-shadow-color': scope === 'robot' ? 'var(--robot-shadow-color)' : 'var(--app-shadow-color)',
  };
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

interface ArcoButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: ButtonVisualType;
  status?: ButtonStatus;
  size?: ButtonSize;
  scope?: ArcoScope;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  iconOnly?: boolean;
  long?: boolean;
  loading?: boolean;
  htmlType?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

export const ArcoButton = forwardRef<HTMLButtonElement, ArcoButtonProps>(function ArcoButton({
  type = 'default',
  status = 'normal',
  size = 'default',
  scope = 'app',
  icon,
  trailingIcon,
  iconOnly = false,
  long = false,
  loading = false,
  disabled,
  htmlType = 'button',
  className,
  style,
  children,
  ...props
}, ref) {
  return (
    <ButtonRoot
      ref={ref}
      type={htmlType}
      isDisabled={disabled || loading}
      isIconOnly={iconOnly}
      size={size === 'large' ? 'lg' : size === 'default' ? 'md' : 'sm'}
      variant={type === 'primary' ? 'primary' : type === 'secondary' ? 'secondary' : type === 'outline' ? 'outline' : type === 'text' ? 'tertiary' : 'secondary'}
      data-scope={scope}
      data-type={type}
      data-status={status}
      data-size={size}
      data-icon-only={iconOnly ? 'true' : undefined}
      data-long={long ? 'true' : undefined}
      data-loading={loading ? 'true' : undefined}
      className={cx('arcoui-button', className)}
      style={{ ...scopeVars(scope), ...style }}
      {...props}
    >
      {loading ? <span className="arcoui-spinner" aria-hidden="true" /> : icon}
      {!iconOnly && children}
      {!loading && !iconOnly && trailingIcon}
    </ButtonRoot>
  );
});

export function ArcoIconButton(props: Omit<ArcoButtonProps, 'iconOnly'>) {
  return <ArcoButton {...props} iconOnly />;
}

interface ArcoToggleButtonProps extends Omit<ArcoButtonProps, 'type'> {
  selected: boolean;
}

/** A persistent choice control. Use ArcoButton for one-off actions instead. */
export function ArcoToggleButton({ selected, ...props }: ArcoToggleButtonProps) {
  return <ArcoButton {...props} type="secondary" aria-pressed={selected} data-toggle="true" data-selected={selected ? 'true' : undefined} />;
}

export function ArcoIconToggleButton(props: Omit<ArcoToggleButtonProps, 'iconOnly'>) {
  return <ArcoToggleButton {...props} iconOnly />;
}

interface ArcoTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
  size?: TagSize;
  scope?: ArcoScope;
}

/**
 * Semantic metadata only. Tags are intentionally borderless so status, scope,
 * version and count labels keep one visual language throughout the product.
 */
export function ArcoTag({
  tone = 'neutral',
  size = 'default',
  scope = 'app',
  className,
  style,
  children,
  ...props
}: ArcoTagProps) {
  return (
    <ChipRoot
      color={tone === 'neutral' ? 'default' : tone}
      size={size === 'small' ? 'sm' : 'md'}
      variant="soft"
      data-tone={tone}
      data-size={size}
      className={cx('arcoui-tag', className)}
      style={{ ...scopeVars(scope), ...style }}
      {...props}
    >
      {children}
    </ChipRoot>
  );
}

interface ArcoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  scope?: ArcoScope;
  status?: 'normal' | 'info' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  width?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  bodyLayout?: 'padded' | 'flush';
  bodyStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  closeable?: boolean;
}

export function ArcoModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  scope = 'app',
  status = 'normal',
  size = 'sm',
  width,
  maxWidth = 'var(--ds-modal-max-width, calc(100vw - 48px))',
  maxHeight = 'var(--ds-modal-max-height, calc(100vh - 48px))',
  bodyLayout = 'padded',
  bodyStyle,
  contentStyle,
  closeable = true,
}: ArcoModalProps) {
  const { locale } = useI18n();
  const modalCopy = locale === 'zh-Hans' ? { content:'弹窗内容', close:'关闭' } : locale === 'zh-Hant' ? { content:'對話框內容', close:'關閉' } : locale === 'ms' ? { content:'Kandungan dialog', close:'Tutup' } : locale === 'vi' ? { content:'Nội dung hộp thoại', close:'Đóng' } : { content:'Dialog content', close:'Close' };
  const overlayState = useOverlayState({ isOpen: open, onOpenChange });
  const sizeWidth = {
    sm: 'var(--ds-modal-width-sm, 420px)',
    md: 'var(--ds-modal-width-md, 560px)',
    lg: 'var(--ds-modal-width-lg, 720px)',
    xl: 'var(--ds-modal-width-xl, 900px)',
  }[size];

  return (
    <ModalRoot state={overlayState}>
      <ModalBackdrop
          className="arcoui-modal-overlay"
          style={scopeVars(scope)}
      >
        <ModalContainer>
          <ModalDialog
          className="arcoui-modal-content"
          data-scope={scope}
          data-status={status}
          data-size={size}
          style={{
            ...scopeVars(scope),
            width: width ?? sizeWidth,
            maxWidth,
            maxHeight,
            ...contentStyle,
          }}
        >
          <div className="arcoui-modal-header">
            <div className="arcoui-modal-title-area">
              <ModalHeading className="arcoui-modal-title">{title}</ModalHeading>
              <p className={description ? 'arcoui-modal-description' : 'arcoui-visually-hidden'}>
                {description ?? modalCopy.content}
              </p>
            </div>
            {closeable && (
                <ArcoIconButton
                  scope={scope}
                  type="text"
                  size="small"
                  icon={<X size={15} />}
                  aria-label={modalCopy.close}
                  title={modalCopy.close}
                  className="arcoui-modal-close"
                  onClick={() => overlayState.close()}
                />
            )}
          </div>
          <div className="arcoui-modal-body" data-layout={bodyLayout} style={bodyStyle}>
            {children}
          </div>
          {footer && <div className="arcoui-modal-footer">{footer}</div>}
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </ModalRoot>
  );
}

interface ArcoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  scope?: ArcoScope;
  width?: number | string;
  closeable?: boolean;
}

/**
 * Product drawer for contextual details and continuous configuration.
 * Header and footer remain fixed; only the body scrolls.
 */
export function ArcoDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  scope = 'app',
  width = 'var(--ds-drawer-width, 420px)',
  closeable = true,
}: ArcoDrawerProps) {
  const { locale } = useI18n();
  const drawerCopy = locale === 'zh-Hans' ? { content:'抽屉内容', close:'关闭' } : locale === 'zh-Hant' ? { content:'抽屜內容', close:'關閉' } : locale === 'ms' ? { content:'Kandungan panel', close:'Tutup' } : locale === 'vi' ? { content:'Nội dung ngăn bên', close:'Đóng' } : { content:'Drawer content', close:'Close' };
  const overlayState = useOverlayState({ isOpen: open, onOpenChange });

  return (
    <ModalRoot state={overlayState}>
      <ModalBackdrop className="arcoui-drawer-overlay" style={scopeVars(scope)}>
        <ModalContainer className="arcoui-drawer-container">
          <ModalDialog
            className="arcoui-drawer"
            data-scope={scope}
            style={{ ...scopeVars(scope), width }}
          >
            <div className="arcoui-drawer-header">
              <div className="arcoui-modal-title-area">
                <ModalHeading className="arcoui-modal-title">{title}</ModalHeading>
                <p className={description ? 'arcoui-modal-description' : 'arcoui-visually-hidden'}>
                  {description ?? drawerCopy.content}
                </p>
              </div>
              {closeable && (
                <ArcoIconButton
                  scope={scope}
                  type="text"
                  size="small"
                  icon={<X size={15} />}
                  aria-label={drawerCopy.close}
                  title={drawerCopy.close}
                  onClick={() => overlayState.close()}
                />
              )}
            </div>
            <div className="arcoui-drawer-body">{children}</div>
            {footer && <div className="arcoui-drawer-footer">{footer}</div>}
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </ModalRoot>
  );
}

interface FieldProps {
  label?: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  description?: ReactNode;
  status?: 'default' | 'error';
}

export function ArcoField({ label, children, hint, description, status = 'default' }: FieldProps) {
  return (
    <label className="arcoui-field" data-status={status}>
      {(label || description) && <span className="arcoui-field-heading">
        {label && <span className="arcoui-field-label">{label}</span>}
        {description && <span className="arcoui-field-description">{description}</span>}
      </span>}
      {children}
      {hint && <span className="arcoui-field-hint" role={status === 'error' ? 'alert' : undefined}>{hint}</span>}
    </label>
  );
}

interface ArcoDateTimePickerProps {
  'aria-label': string;
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  granularity?: 'day' | 'hour' | 'minute' | 'second';
}

/** Product date/time picker composed from the approved third-party primitives. */
export function ArcoDateTimePicker({
  'aria-label': ariaLabel,
  disabled = false,
  invalid = false,
  readOnly = false,
  granularity = 'minute',
}: ArcoDateTimePickerProps) {
  return (
    <DatePicker
      className="arcoui-date-picker"
      aria-label={ariaLabel}
      granularity={granularity}
      isDisabled={disabled}
      isInvalid={invalid}
      isReadOnly={readOnly}
    >
      <DateField.Group className="arcoui-date-picker-group" fullWidth variant="secondary">
        <DateField.Input className="arcoui-date-picker-input">
          {segment => <DateField.Segment className="arcoui-date-picker-segment" segment={segment} />}
        </DateField.Input>
        <DateField.Suffix className="arcoui-date-picker-suffix">
          <DatePicker.Trigger className="arcoui-date-picker-trigger" aria-label={`打开${ariaLabel}`}>
            <DatePicker.TriggerIndicator className="arcoui-date-picker-indicator" />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover className="arcoui-date-picker-popover">
        <CalendarRoot aria-label={`${ariaLabel}日历`} className="arcoui-calendar">
          <CalendarRoot.Header className="arcoui-calendar-header">
            <CalendarRoot.Heading className="arcoui-calendar-heading" />
            <CalendarRoot.NavButton className="arcoui-calendar-nav" slot="previous" />
            <CalendarRoot.NavButton className="arcoui-calendar-nav" slot="next" />
          </CalendarRoot.Header>
          <CalendarRoot.Grid className="arcoui-calendar-grid">
            <CalendarRoot.GridHeader>
              {day => <CalendarRoot.HeaderCell className="arcoui-calendar-header-cell">{day}</CalendarRoot.HeaderCell>}
            </CalendarRoot.GridHeader>
            <CalendarRoot.GridBody>
              {date => <CalendarRoot.Cell className="arcoui-calendar-cell" date={date} />}
            </CalendarRoot.GridBody>
          </CalendarRoot.Grid>
        </CalendarRoot>
      </DatePicker.Popover>
    </DatePicker>
  );
}

interface ArcoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  scope?: ArcoScope;
}

export const ArcoTextInput = forwardRef<HTMLInputElement, ArcoInputProps>(function ArcoTextInput({
  scope = 'app',
  className,
  style,
  readOnly,
  ...props
}, ref) {
  return (
    <InputRoot
      ref={ref}
      className={cx('arcoui-input', readOnly && 'is-readonly', className)}
      style={{ ...scopeVars(scope), ...style }}
      readOnly={readOnly}
      aria-readonly={readOnly || undefined}
      {...props}
    />
  );
});

interface ArcoTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  scope?: ArcoScope;
}

export const ArcoTextArea = forwardRef<HTMLTextAreaElement, ArcoTextAreaProps>(function ArcoTextArea({
  scope = 'app',
  className,
  style,
  readOnly,
  ...props
}, ref) {
  return (
    <TextAreaRoot
      ref={ref}
      className={cx('arcoui-input arcoui-textarea', readOnly && 'is-readonly', className)}
      style={{ ...scopeVars(scope), ...style }}
      readOnly={readOnly}
      aria-readonly={readOnly || undefined}
      {...props}
    />
  );
});

interface ArcoSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  scope?: ArcoScope;
}

export const ArcoSelect = forwardRef<HTMLSelectElement, ArcoSelectProps>(function ArcoSelect({
  scope = 'app',
  className,
  style,
  children,
  value,
  defaultValue,
  disabled,
  readOnly,
  onChange,
  name,
  required,
  autoFocus,
  placeholder,
  'aria-label': ariaLabel,
}, ref) {
  const options = Children.toArray(children).flatMap(child => {
    if (!isValidElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>(child) || child.type !== 'option') {
      return [];
    }

    const optionValue = String(child.props.value ?? child.props.children ?? '');
    return [{
      value: optionValue,
      label: child.props.children,
      disabled: child.props.disabled,
    }];
  });

  return (
    <SelectRoot
      ref={ref as unknown as React.Ref<HTMLDivElement>}
      selectedKey={value == null ? undefined : String(value)}
      defaultSelectedKey={defaultValue == null ? undefined : String(defaultValue)}
      isDisabled={disabled}
      isReadOnly={readOnly}
      name={name}
      isRequired={required}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      onSelectionChange={key => onChange?.({ target: { value: String(key) } } as React.ChangeEvent<HTMLSelectElement>)}
      style={{ ...scopeVars(scope), ...style }}
    >
      <SelectTrigger className={cx('arcoui-input arcoui-select', readOnly && 'is-readonly', className)} aria-readonly={readOnly || undefined}>
        <SelectValue placeholder={placeholder} />
        <SelectIndicator />
      </SelectTrigger>
      <SelectPopover className="arcoui-select-popover">
        <ListBoxRoot className="arcoui-select-listbox">
          {options.map(option => (
            <ListBoxItemRoot className="arcoui-select-option" key={option.value} id={option.value} isDisabled={option.disabled} textValue={String(option.label)}>
              {option.label}
            </ListBoxItemRoot>
          ))}
        </ListBoxRoot>
      </SelectPopover>
    </SelectRoot>
  );
});

interface ArcoCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  scope?: ArcoScope;
  label?: ReactNode;
  indeterminate?: boolean;
}

export function ArcoCheckbox({
  scope = 'app',
  label,
  className,
  style,
  checked,
  defaultChecked,
  indeterminate = false,
  disabled,
  readOnly,
  onChange,
  name,
  required,
  autoFocus,
  'aria-label': ariaLabel,
}: ArcoCheckboxProps) {
  return (
    <CheckboxRoot
      className={cx('arcoui-checkbox-row', className)}
      style={{ ...scopeVars(scope), ...style }}
      isSelected={checked}
      defaultSelected={defaultChecked}
      isIndeterminate={indeterminate}
      data-indeterminate={indeterminate || undefined}
      isDisabled={disabled}
      isReadOnly={readOnly}
      isRequired={required}
      autoFocus={autoFocus}
      name={name}
      aria-readonly={readOnly || undefined}
      aria-label={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
      onChange={isSelected => onChange?.({ target: { checked: isSelected } } as React.ChangeEvent<HTMLInputElement>)}
    >
      <CheckboxContent className="arcoui-checkbox">
        <CheckboxControl>
          <CheckboxIndicator />
        </CheckboxControl>
      </CheckboxContent>
      {label && <span>{label}</span>}
    </CheckboxRoot>
  );
}

interface ArcoUploadBoxProps {
  title: ReactNode;
  description?: ReactNode;
  fileName?: string;
  accept?: string;
  scope?: ArcoScope;
  onFileChange: (file: File | null) => void;
}

export function ArcoUploadBox({
  title,
  description,
  fileName,
  accept,
  scope = 'app',
  onFileChange,
}: ArcoUploadBoxProps) {
  const id = useId();

  return (
    <label className="arcoui-upload" htmlFor={id} style={scopeVars(scope)}>
      <input
        id={id}
        type="file"
        accept={accept}
        className="arcoui-upload-input"
        onChange={event => onFileChange(event.target.files?.[0] ?? null)}
      />
      <span className="arcoui-upload-icon">
        <Upload size={19} />
      </span>
      <span className="arcoui-upload-text">
        <span className="arcoui-upload-title">{title}</span>
        {description && <span className="arcoui-upload-description">{description}</span>}
        <span className={cx('arcoui-upload-filename', fileName && 'is-selected')}>
          {fileName || '点击选择文件'}
        </span>
      </span>
    </label>
  );
}
