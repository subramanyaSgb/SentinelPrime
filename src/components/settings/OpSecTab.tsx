import { useSettingsStore } from '@/store/settingsStore'
import { Separator } from '@/components/ui'

/**
 * OpSec Configuration Tab — Operational Security settings.
 * PRD 13.3: OpSec module for investigator identity protection.
 */
export function OpSecTab() {
  const opsec = useSettingsStore((s) => s.opsec)
  const updateOpSec = useSettingsStore((s) => s.updateOpSec)

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
        OPERATIONAL SECURITY
      </div>
      <div
        style={{
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}
      >
        PROTECT INVESTIGATOR IDENTITY // EVIDENCE INTEGRITY CONTROLS
      </div>

      <Separator />

      {/* Toggle switches */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        <ToggleRow
          label="ANONYMOUS QUERY ROUTING"
          description="RECOMMEND PROXY/VPN FOR ALL EXTERNAL API QUERIES"
          enabled={opsec.proxyEnabled}
          onChange={(v) => updateOpSec('proxyEnabled', v)}
        />
        <ToggleRow
          label="METADATA STRIPPING"
          description="REMOVE METADATA FROM ALL EXPORTED EVIDENCE FILES"
          enabled={opsec.metadataStripping}
          onChange={(v) => updateOpSec('metadataStripping', v)}
        />
        <ToggleRow
          label="CHAIN OF CUSTODY LOGGING"
          description="RECORD EVERY ACCESS AND MODIFICATION TO EVIDENCE"
          enabled={opsec.chainOfCustody}
          onChange={(v) => updateOpSec('chainOfCustody', v)}
        />
        <ToggleRow
          label="TIMESTAMP VERIFICATION"
          description="CRYPTOGRAPHIC TIMESTAMP VERIFICATION ON ALL EVIDENCE"
          enabled={opsec.timestampVerification}
          onChange={(v) => updateOpSec('timestampVerification', v)}
        />
      </div>

      <Separator />

      {/* OpSec Checklist */}
      <div
        style={{
          marginTop: '12px',
          fontSize: '11px',
          color: 'var(--phosphor)',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}
      >
        ANTI-FORENSICS CHECKLIST
      </div>

      <div
        style={{
          padding: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--phosphor-faint)',
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
        }}
        className="corner-brackets"
      >
        <ChecklistItem label="USE VPN OR TOR FOR ALL OSINT QUERIES" />
        <ChecklistItem label="NEVER USE PERSONAL ACCOUNTS FOR INVESTIGATION" />
        <ChecklistItem label="CLEAR BROWSER CACHE AFTER EACH SESSION" />
        <ChecklistItem label="DISABLE JAVASCRIPT WHEN VISITING TARGET SITES" />
        <ChecklistItem label="USE SEPARATE DEVICE OR VM FOR INVESTIGATIONS" />
        <ChecklistItem label="ROTATE SEARCH PATTERNS TO AVOID DETECTION" />
        <ChecklistItem label="VERIFY EVIDENCE HASHES BEFORE SUBMISSION" />
        <ChecklistItem label="DOCUMENT ALL ACTIONS IN CHAIN OF CUSTODY" />
      </div>

      {/* Guidance note */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--amber-dim)',
          fontSize: '10px',
          color: 'var(--amber)',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ marginBottom: '4px' }}>⚠ OPSEC ADVISORY</div>
        <div style={{ color: 'var(--phosphor-dim)' }}>
          SENTINELPRIME IS A CLIENT-SIDE APPLICATION. ALL API CALLS ORIGINATE FROM
          YOUR BROWSER. USE A VPN OR PROXY TO MASK YOUR IP ADDRESS WHEN QUERYING
          EXTERNAL INTELLIGENCE APIS. YOUR ISP CAN SEE DNS QUERIES UNLESS YOU USE
          ENCRYPTED DNS (DOH/DOT).
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

      {/* Toggle switch */}
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

function ChecklistItem({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: '4px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span style={{ color: 'var(--phosphor)', fontSize: '8px' }}>◇</span>
      <span>{label}</span>
    </div>
  )
}
