import { forwardRef, useId, type CSSProperties, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Upload, X } from 'lucide-react';
import '../../styles/arco-like.css';

type ArcoScope = 'app' | 'robot';
type ButtonVisualType = 'default' | 'primary' | 'secondary' | 'text' | 'outline';
type ButtonStatus = 'normal' | 'success' | 'danger' | 'warning';
type ButtonSize = 'mini' | 'small' | 'default' | 'large';
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
    '--arcoui-danger-contrast': scope === 'robot' ? 'var(--robot-danger-contrast)' : '#FFFFFF',
    '--arcoui-danger-soft': `var(--${prefix}-danger-soft)`,
    '--arcoui-danger-border': `var(--${prefix}-danger-border)`,
    '--arcoui-overlay': scope === 'robot' ? 'var(--robot-overlay)' : 'var(--app-overlay)',
    '--arcoui-shadow': scope === 'robot' ? 'var(--robot-dialog-shadow)' : '0 18px 56px var(--app-shadow-color)',
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
    <button
      ref={ref}
      type={htmlType}
      disabled={disabled || loading}
      data-scope={scope}
      data-type={type}
      data-status={status}
      data-size={size}
      data-icon-only={iconOnly ? 'true' : undefined}
      data-long={long ? 'true' : undefined}
      className={cx('arcoui-button', className)}
      style={{ ...scopeVars(scope), ...style }}
      {...props}
    >
      {loading ? <span className="arcoui-spinner" aria-hidden="true" /> : icon}
      {!iconOnly && children}
    </button>
  );
});

export function ArcoIconButton(props: Omit<ArcoButtonProps, 'iconOnly'>) {
  return <ArcoButton {...props} iconOnly />;
}

interface ArcoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  scope?: ArcoScope;
  status?: 'normal' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  width?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
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
  bodyStyle,
  contentStyle,
  closeable = true,
}: ArcoModalProps) {
  const sizeWidth = {
    sm: 'var(--ds-modal-width-sm, 420px)',
    md: 'var(--ds-modal-width-md, 560px)',
    lg: 'var(--ds-modal-width-lg, 720px)',
    xl: 'var(--ds-modal-width-xl, 900px)',
  }[size];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="arcoui-modal-overlay"
          style={scopeVars(scope)}
        />
        <Dialog.Content
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
              <Dialog.Title className="arcoui-modal-title">{title}</Dialog.Title>
              <Dialog.Description className={description ? 'arcoui-modal-description' : 'arcoui-visually-hidden'}>
                {description ?? '弹窗内容'}
              </Dialog.Description>
            </div>
            {closeable && (
              <Dialog.Close asChild>
                <ArcoIconButton
                  scope={scope}
                  type="text"
                  size="small"
                  icon={<X size={15} />}
                  aria-label="关闭"
                  title="关闭"
                  className="arcoui-modal-close"
                />
              </Dialog.Close>
            )}
          </div>
          <div className="arcoui-modal-body" style={bodyStyle}>
            {children}
          </div>
          {footer && <div className="arcoui-modal-footer">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface FieldProps {
  label?: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
}

export function ArcoField({ label, children, hint }: FieldProps) {
  return (
    <label className="arcoui-field">
      {label && <span className="arcoui-field-label">{label}</span>}
      {children}
      {hint && <span className="arcoui-field-hint">{hint}</span>}
    </label>
  );
}

interface ArcoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  scope?: ArcoScope;
}

export const ArcoTextInput = forwardRef<HTMLInputElement, ArcoInputProps>(function ArcoTextInput({
  scope = 'app',
  className,
  style,
  ...props
}, ref) {
  return (
    <input
      ref={ref}
      className={cx('arcoui-input', className)}
      style={{ ...scopeVars(scope), ...style }}
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
  ...props
}, ref) {
  return (
    <textarea
      ref={ref}
      className={cx('arcoui-input arcoui-textarea', className)}
      style={{ ...scopeVars(scope), ...style }}
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
  ...props
}, ref) {
  return (
    <select
      ref={ref}
      className={cx('arcoui-input arcoui-select', className)}
      style={{ ...scopeVars(scope), ...style }}
      {...props}
    >
      {children}
    </select>
  );
});

interface ArcoCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  scope?: ArcoScope;
  label?: ReactNode;
}

export function ArcoCheckbox({
  scope = 'app',
  label,
  className,
  style,
  ...props
}: ArcoCheckboxProps) {
  if (!label) {
    return (
      <input
        type="checkbox"
        className={cx('arcoui-checkbox', className)}
        style={{ ...scopeVars(scope), ...style }}
        {...props}
      />
    );
  }

  return (
    <label className={cx('arcoui-checkbox-row', className)} style={{ ...scopeVars(scope), ...style }}>
      <input type="checkbox" className="arcoui-checkbox" {...props} />
      {label && <span>{label}</span>}
    </label>
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
