# Word Heist — Design System

Design read: an immersive narrative web game (noir-heist vocabulary trainer) for B1-C1
adult English learners. 1940s detective office meets modern cyber-heist. Built on
Tailwind v4 utilities + CSS custom-property tokens + Motion (`motion/react`).

Dials: `DESIGN_VARIANCE 6` / `MOTION_INTENSITY 6` / `VISUAL_DENSITY 4` (marketing-style
screens) stepping to `~5` on the live heist HUD, which has to hold a timer, strike
indicators and a score readout at once without feeling sparse or cluttered.

## Vault tiers

Vaults have a `tier`: `"core"` (the 5 noir B2/C1 vaults — the main game, sequentially
unlocked, feeds the Leaderboard) or `"training"` (beginner vocabulary extracted from
`docs/toefl-primary-vocab.md`, always unlocked, excluded from reputation). Training
vaults use the same components and mechanics as core vaults — same challenge types,
timer, strikes, case-file reveal — just rendered in their own "Training Files" section
on `/vaults`, below a hairline divider, never interleaved with the core board. Keeping
them mechanically identical but visually and structurally separate protects the B2/C1
brief (no "baby words" in the main game) without throwing away a second, genuinely
useful difficulty tier.

The page has **one theme**: dark. This is a deliberate brand decision, not an
oversight — the noir aesthetic is the product. There is no light-mode variant.

## Color tokens

All colors live as CSS custom properties in `app/globals.css`, never hardcoded in
components. One accent (brass) is used for every "this is interactive / this is the
prize" moment across the whole app — no second accent color is introduced anywhere.

| token | value | use |
|---|---|---|
| `--bg` | `#0E0B08` | page background (near-black warm charcoal, never pure black) |
| `--bg-elevated` | `#17130E` | panels, cards, the HUD strip |
| `--bg-elevated-2` | `#1F1A12` | nested surfaces (chips, inputs) |
| `--accent-brass` | `#C9A24B` | the one accent — CTAs, streak, score, highlights |
| `--accent-brass-dim` | `#8A6F35` | brass at rest / borders / disabled brass |
| `--danger` | `#8B1E1E` | strikes, wrong-answer vignette, alarm state |
| `--success` | `#7A8B4A` | correct-answer confirmation only |
| `--text-100` | `#EDE4D3` | primary text |
| `--text-72` | `#EDE4D3` @ 72% | secondary text |
| `--text-48` | `#EDE4D3` @ 48% | tertiary / meta text |
| `--text-28` | `#EDE4D3` @ 28% | disabled / placeholder text |
| `--border-hairline` | brass @ 14% | dividers, panel borders |

## Typography

- **Display — Fraunces** (variable, explicitly brand-named in the brief): scene
  titles, vault names, the score. Used sparingly. Never for body copy or UI chrome.
- **Body/UI — Geist**: everything else — nav, buttons, descriptions, labels.
- **Mono — JetBrains Mono**: IPA transcriptions, the fuse-timer digits, the safe-
  combination input, reputation numbers on the leaderboard.

Scale (real hierarchy, not one size everywhere):

| role | classes |
|---|---|
| Display 1 (vault/scene title) | `font-display text-5xl md:text-7xl tracking-tight leading-none` |
| Display 2 (score) | `font-display text-4xl md:text-5xl tracking-tight` |
| H1 | `font-display text-3xl leading-tight` |
| H2 | `font-sans text-xl font-semibold` |
| Body | `font-sans text-base leading-relaxed text-[var(--text-72)]` |
| Meta | `font-sans text-sm text-[var(--text-48)]` |
| Mono readout | `font-mono text-lg tracking-wide` |

Italic emphasis inside display headlines always reserves descender clearance
(`leading-[1.1]` minimum + `pb-1`) — never `leading-none` on an italic word with a
descender.

## Shape

One radius system: sharp, 0-2px, everywhere — panels, cards, buttons, inputs. The
only circular elements are literal objects the metaphor calls for: the wax-seal
streak stamp and the audio-safe play button. No `rounded-3xl`, no pill buttons.

## Motion

| moment | spec |
|---|---|
| Page transition | film-grain fade, ~400ms, `cubic-bezier(0.4,0,0.2,1)` |
| Correct answer | brass highlight sweep, ~300ms (tumbler-click sound, off by default) |
| Wrong answer | 120ms screen shake + red vignette pulse (~400ms fade) |
| Timer | **burning fuse** (committed over the clock — fits the heist metaphor, stays legible under time pressure) |
| Answer card hover | lift 4px, rotate up to 1deg, brass-tinted shadow |
| Case file reveal | manila folder unfolds from a closed/stamped state |
| Streak | wax-seal stamps spring into a corner, growing per streak tier |

Every animation is motivated (hierarchy, feedback, or state transition) — nothing
loops "for show." Everything collapses to instant/static under
`prefers-reduced-motion`. `useState` is never used for continuous pointer/scroll
values; Motion's `useMotionValue`/`useTransform` handle those.

## Screens

- **Landing (`/`)** — asymmetric 60/40 split. Left: Fraunces wordmark, one-line noir
  subhead, a corkboard-tag handle input, single brass CTA. Right: a moody vault/desk
  image with subtle parallax. No trust strip, no version badge, single nav line.
- **Vault selector (`/vaults`)** — case-board bento: the first unlocked vault is a
  larger featured folder tile, the rest are smaller; locked vaults are desaturated
  with a padlock glyph. Hover lifts the folder like picking it up off the board.
- **Heist (`/heist/[vaultId]`)** — HUD strip: fuse timer, 3 strike indicators, mono
  score + multiplier. Below, one of three challenge layouts on a single consistent
  dark panel (2x2 answer grid / cloze sentence + word chips / mono safe-combination
  input).
- **Case file (`/case-file/[runId]`)** — folder unfolds into a two-page spread
  (stacked on mobile): left page is the 80-word micro-story with vocab words picked
  out in brass; right page recaps each word with IPA and definition. One CTA
  ("Next vault").
- **Leaderboard (`/leaderboard`)** — top 3 as an asymmetric podium bento; ranks 4-20
  as a grouped mono-numeral list in chunks of 5, not a bordered row-per-item table.

## Icons

Phosphor Icons (`@phosphor-icons/react`) for all UI glyphs (lock, play, check, mic).
The wax seal and vault-bolt are the only hand-drawn marks — justified as signature
brand geometry, not generic UI icons.
