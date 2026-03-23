import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'default' | 'primary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'phantom-btn',
  primary: 'phantom-btn primary',
  danger: 'phantom-btn danger',
  ghost: 'phantom-btn',
}

const ghostOverride: React.CSSProperties = {
  border: 'none',
  padding: '4px 8px',
}

/**
 * PHANTOM GRID Button — tactical terminal button with hover glow + click invert flash.
 *
 * Variants:
 * - default: phosphor border, transparent bg
 * - primary: phosphor-faint bg, phosphor-dim border
 * - danger: red border, red text
 * - ghost: no border, minimal padding
 */
export function Button({
  variant = 'default',
  icon,
  children,
  className = '',
  style,
  disabled,
  ...props
}: ButtonProps) {
  const isGhost = variant === 'ghost'

  return (
    <button
      className={`${variantClasses[variant]} ${className}`}
      style={{
        ...(isGhost ? ghostOverride : {}),
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        ...style,
      }}
      disabled={disabled}
      {...props}
    >
      {icon && <span style={{ display: 'inline-flex', fontSize: '12px' }}>{icon}</span>}
      {children}
    </button>
  )
}
