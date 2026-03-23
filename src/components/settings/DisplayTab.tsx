import { useSettingsStore } from '@/store/settingsStore'
import { Separator } from '@/components/ui'

/**
 * Display Tab — Visual effects toggles.
 * PRD: "All effects are layered CSS/canvas overlays. Each can be toggled in Settings > Display."
 */
export function DisplayTab() {
  const display = useSettingsStore((s) => s.display)
  const updateDisplay = useSettingsStore((s) => s.updateDisplay)

  return (
    <div>
      <div
        style={{
          fontSize: '13px',
          color: 'var(--phosphor)',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
        className="text-glow"
      >
        DISPLAY SETTINGS
      </div>
      <div
        style={{
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}
      >
        VISUAL EFFECT OVERLAYS // PHANTOM GRID AESTHETICS
      </div>

      <Separator />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        <ToggleRow
          label="SCANLINE OVERLAY"
          description="CRT HORIZONTAL LINE EFFECT ACROSS ENTIRE VIEWPORT"
          enabled={display.scanlines}
          onChange={(v) => updateDisplay('scanlines', v)}
        />
        <ToggleRow
          label="CRT VIGNETTE"
          description="DARK EDGE GRADIENT SIMULATING CRT MONITOR CURVATURE"
          enabled={display.crtVignette}
          onChange={(v) => updateDisplay('crtVignette', v)}
        />
        <ToggleRow
          label="NOISE OVERLAY"
          description="SUBTLE STATIC GRAIN EFFECT FOR ANALOG FEEL"
          enabled={display.noiseOverlay}
          onChange={(v) => updateDisplay('noiseOverlay', v)}
        />
        <ToggleRow
          label="BOOT SEQUENCE"
          description="PLAY STARTUP ANIMATION ON EACH NEW SESSION"
          enabled={display.bootSequence}
          onChange={(v) => updateDisplay('bootSequence', v)}
        />
        <ToggleRow
          label="TYPEWRITER EFFECT"
          description="CHARACTER-BY-CHARACTER TEXT REVEAL ON NEW CONTENT"
          enabled={display.typewriterEffect}
          onChange={(v) => updateDisplay('typewriterEffect', v)}
        />
        <ToggleRow
          label="GLOW EFFECTS"
          description="TEXT-SHADOW PHOSPHOR GLOW ON ACTIVE ELEMENTS"
          enabled={display.glowEffects}
          onChange={(v) => updateDisplay('glowEffects', v)}
        />
      </div>

      <Separator />

      {/* Preview area */}
      <div
        style={{
          marginTop: '12px',
          fontSize: '11px',
          color: 'var(--phosphor)',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}
      >
        EFFECT PREVIEW
      </div>
      <div
        style={{
          padding: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--phosphor-faint)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '80px',
        }}
        className="corner-brackets"
      >
        {display.scanlines && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)',
            }}
          />
        )}
        <div
          style={{
            color: 'var(--phosphor)',
            fontSize: '12px',
            textTransform: 'uppercase',
            textShadow: display.glowEffects ? '0 0 8px var(--phosphor-glow)' : 'none',
          }}
        >
          SENTINELPRIME // PHANTOM GRID PREVIEW
        </div>
        <div
          style={{
            color: 'var(--phosphor-dim)',
            fontSize: '10px',
            marginTop: '8px',
            textTransform: 'uppercase',
          }}
        >
          THIS IS HOW YOUR INTERFACE WILL APPEAR WITH CURRENT SETTINGS
        </div>
        <div
          style={{
            marginTop: '8px',
            fontSize: '10px',
            color: 'var(--amber)',
            textTransform: 'uppercase',
          }}
        >
          ● ACTIVE EFFECTS: {
            [
              display.scanlines && 'SCANLINES',
              display.crtVignette && 'VIGNETTE',
              display.noiseOverlay && 'NOISE',
              display.glowEffects && 'GLOW',
            ].filter(Boolean).join(' // ') || 'NONE'
          }
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string
  description: string
  enabled: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        background: 'var(--bg-card)',
        border: '1px solid var(--phosphor-faint)',
        cursor: 'pointer',
      }}
      onClick={() => onChange(!enabled)}
    >
      <div>
        <div
          style={{
            fontSize: '11px',
            color: enabled ? 'var(--phosphor)' : 'var(--phosphor-dim)',
            textTransform: 'uppercase',
          }}
          className={enabled ? 'text-glow' : ''}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: '9px',
            color: 'var(--phosphor-dim)',
            opacity: 0.5,
            marginTop: '2px',
            textTransform: 'uppercase',
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          width: '36px',
          height: '18px',
          border: `1px solid ${enabled ? 'var(--phosphor)' : 'var(--phosphor-faint)'}`,
          background: enabled ? 'var(--phosphor-faint)' : 'transparent',
          position: 'relative',
          flexShrink: 0,
          transition: 'all 0.15s ease',
        }}
      >
        <div
          style={{
            width: '14px',
            height: '14px',
            background: enabled ? 'var(--phosphor)' : 'var(--phosphor-dim)',
            position: 'absolute',
            top: '1px',
            left: enabled ? '19px' : '1px',
            transition: 'left 0.15s ease',
          }}
        />
      </div>
    </div>
  )
}
