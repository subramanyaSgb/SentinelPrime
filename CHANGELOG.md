# SentinelPrime Changelog

## [0.2.0] — 2026-03-23

### Module: PHANTOM_GRID_DESIGN_SYSTEM
**Status:** 🧪 TESTING

#### Files Created:
- `src/components/ui/Panel.tsx` — Panel + PanelHeader with corner brackets, title, subtitle
- `src/components/ui/Button.tsx` — Button with default/primary/danger/ghost variants, icon support
- `src/components/ui/Input.tsx` — Input with >_ prefix + TextArea, both with label/error states
- `src/components/ui/Card.tsx` — Card with corner brackets, title/meta header, action bar
- `src/components/ui/ProgressBar.tsx` — ASCII progress bar (████░░) + ThreatLevel auto-color component
- `src/components/ui/StatusIndicator.tsx` — Status dots (●/○) + APIStatusBar (●●●○ 3/4 ONLINE)
- `src/components/ui/TypewriterText.tsx` — Single-line (18ms/char) + multi-line TypewriterBlock
- `src/components/ui/Display.tsx` — Label, Value, Separator, Timestamp, MetaRow, DataField
- `src/components/ui/ErrorDisplay.tsx` — PHANTOM GRID error card + RateLimitDisplay
- `src/components/ui/Overlays.tsx` — ScanlineOverlay, CRTVignette, NoiseOverlay (SVG feTurbulence), CriticalPulse
- `src/components/ui/Loading.tsx` — Loading (>_ SCANNING...), AIThinking (● ● ●), ScanningCursor
- `src/components/ui/index.ts` — Barrel export for all 26 UI components

#### Files Modified:
- `src/styles/phantom-grid.css` — Added --phosphor-muted variable, criticalPulse/errorStatic/amberFlash keyframes
- `src/App.tsx` — Replaced raw divs with ScanlineOverlay, CRTVignette, NoiseOverlay components
- `src/store/alertStore.ts` — Removed unused AlertSeverity import (TypeScript strict fix)

#### Decisions Made:
- All UI primitives are pure presentational components (no state management)
- Overlays use fixed positioning with aria-hidden for accessibility
- SVG feTurbulence used for noise grain (no external image dependency)
- TypewriterText speed defaults to 18ms per PRD spec, configurable via prop
- ThreatLevel auto-colors: 0-30 phosphor, 31-60 amber, 61-100 red
- Added --phosphor-muted CSS variable for muted text (was hardcoded rgba)
- forwardRef used on Input/TextArea for future form integration

#### Tests Passed:
- [x] No `any` types in any component
- [x] All props have TypeScript interfaces
- [x] No console statements
- [x] All colors use CSS variables
- [x] All imports use @/ path alias correctly
- [x] Barrel export matches all component files
- [x] Unused import fixed (alertStore)

#### Known Issues:
- Cannot verify runtime rendering without npm install (sandbox limitation)
- Overlays use inline styles for positioning (by design — these are fixed elements)

---

## [0.1.0] — 2026-03-23

### Module: PROJECT_SCAFFOLD
**Status:** ✅ USER APPROVED

#### Files Created:
- `package.json` — All dependencies (React 18, Vite 6, Three.js, D3.js, Zustand, Dexie, TanStack Query, Framer Motion, Tailwind, Lucide, OpenAI SDK, etc.)
- `tsconfig.json` — Strict TypeScript config with path aliases
- `tsconfig.app.json` — App-specific TS config
- `tsconfig.node.json` — Node/Vite TS config
- `vite.config.ts` — Vite with React plugin, PWA plugin, path aliases
- `tailwind.config.js` — Tailwind with PHANTOM GRID color tokens
- `postcss.config.js` — PostCSS with Tailwind + Autoprefixer
- `eslint.config.js` — ESLint with TypeScript, React hooks, no-console rule
- `.gitignore` — node_modules, dist, .env, logs
- `index.html` — PWA meta tags, Share Tech Mono font, favicon
- `src/main.tsx` — App entry with TanStack Query provider
- `src/App.tsx` — Root component with header, center, footer HUD layout + boot placeholder
- `src/styles/phantom-grid.css` — Complete PHANTOM GRID design system (CSS vars, scanlines, vignette, corner brackets, buttons, inputs, status indicators, animations)
- `src/types/target.ts` — Target, TargetType, TargetStatus interfaces
- `src/types/module.ts` — ModuleSpec, ToolResult, InputType interfaces
- `src/types/ai.ts` — AIProvider, AIMessage, AIConversation interfaces
- `src/types/index.ts` — Barrel export + Alert, TimelineEvent, Relationship, Evidence, AppView types
- `src/db/schema.ts` — Dexie.js v4 database schema (7 tables: targets, toolResults, timelineEvents, relationships, alerts, evidence, aiConversations)
- `src/db/db.ts` — Database singleton instance
- `src/store/appStore.ts` — Zustand global state (navigation, panels, active target/tool, AI provider, boot, search)
- `src/store/targetStore.ts` — Zustand target CRUD with IndexedDB persistence
- `src/store/alertStore.ts` — Zustand alert management with IndexedDB persistence
- `src/vite-env.d.ts` — Vite + PWA type declarations
- `public/icons/favicon.svg` — Tactical crosshair favicon

#### Directory Structure Created:
```
sentinelprime/
├── public/textures/
├── public/icons/
├── src/components/hud/
├── src/components/panels/
├── src/components/globe/
├── src/components/modules/person/
├── src/components/modules/domain/
├── src/components/modules/social/
├── src/components/target/
├── src/components/ai/
├── src/components/timeline/
├── src/components/graph/
├── src/components/ui/
├── src/providers/
├── src/services/
├── src/store/
├── src/db/
├── src/styles/
├── src/types/
├── src/utils/
├── src/hooks/
└── src/constants/
```

#### Decisions Made:
- **Manual scaffold** — npm registry is blocked in Cowork sandbox; all files hand-crafted. User runs `npm install` on their machine.
- **Vite 6 + React 18** — per PRD Section 11, pure client-side PWA, no SSR needed
- **CSS custom properties over Tailwind-only** — per CLAUDE.md, maximum control for PHANTOM GRID theme. Tailwind used for layout/spacing.
- **Zustand over Redux** — simpler, no boilerplate, sufficient for app scale
- **Dexie.js v4** — best TypeScript support for IndexedDB wrapper
- **Strict TypeScript** — `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `noFallthroughCasesInSwitch` all enabled
- **Path aliases** — `@/` maps to `./src/` for clean imports
- **NVIDIA Nemotron as default provider** — per CLAUDE.md Section 4
- **Boot sequence placeholder** — minimal 1.5s loading screen; full terminal boot animation deferred to Phase 0.9
- **sessionStorage for boot skip** — prevents re-triggering boot on same session reload

#### Tests Passed:
- [x] All files syntactically valid
- [x] No console.log in any source file
- [x] No hardcoded values that should be configurable
- [x] All TypeScript interfaces defined with strict types
- [x] No `any` types used
- [x] PHANTOM GRID CSS variables match PRD Section 6.2 exactly
- [x] Directory structure matches CLAUDE.md Section 6.1

#### Known Issues:
- Cannot run `npm install` or `tsc --noEmit` in sandbox (npm registry blocked) — user must run locally
- PWA icons (icon-192.png, icon-512.png) not yet created — placeholder favicon.svg only
