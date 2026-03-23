import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  prefix?: string
}

/**
 * PHANTOM GRID Input — terminal-style input field with >_ prefix and cursor blink.
 *
 * ```
 * LABEL
 * >_ [________________________]
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix = '>_', className = '', style, ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label
            className="phantom-label"
            style={{ display: 'block', marginBottom: '4px' }}
          >
            {label}
          </label>
        )}
        <div
          className="flex items-center gap-2"
          style={{
            background: 'var(--bg-card)',
            border: `1px solid ${error ? 'var(--amber)' : 'var(--phosphor-faint)'}`,
            padding: '0 12px',
            transition: 'border-color 0.2s ease',
          }}
        >
          <span
            style={{
              color: 'var(--phosphor)',
              fontSize: '13px',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            {prefix}
          </span>
          <input
            ref={ref}
            className="phantom-input"
            style={{
              border: 'none',
              background: 'transparent',
              padding: '8px 0',
              ...style,
            }}
            {...props}
          />
        </div>
        {error && (
          <div
            style={{
              fontSize: '10px',
              color: 'var(--amber)',
              marginTop: '4px',
              textTransform: 'uppercase',
            }}
          >
            ⚠ {error}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

/**
 * PHANTOM GRID TextArea — multi-line terminal input.
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', style, ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label
            className="phantom-label"
            style={{ display: 'block', marginBottom: '4px' }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className="phantom-input"
          style={{
            resize: 'vertical',
            minHeight: '80px',
            borderColor: error ? 'var(--amber)' : undefined,
            ...style,
          }}
          {...props}
        />
        {error && (
          <div
            style={{
              fontSize: '10px',
              color: 'var(--amber)',
              marginTop: '4px',
              textTransform: 'uppercase',
            }}
          >
            ⚠ {error}
          </div>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
