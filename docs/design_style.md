# Kastu — Design Style Guide
**Version:** 1.0 | **Status:** Final | **Date:** 2026-09-28

> Kastu is named after the Kasturi bird — a symbol of a beautiful, flawless voice. Every design decision should evoke that: warmth, elegance, and the quiet confidence of someone finding their voice.

---

## PART 1 — UI Style Guide

---

### 1.1 Color Palette

#### Brand Colors

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-primary` | Kasturi Teal | `#1A8C7A` | CTAs, active states, links |
| `--color-primary-dark` | Deep Teal | `#136B5C` | Button press shadow, hover |
| `--color-primary-light` | Mist Teal | `#E6F5F2` | Teal tint backgrounds, badges |
| `--color-accent` | Kasturi Gold | `#E8A020` | Streaks, highlights, warm accents |
| `--color-accent-dark` | Deep Amber | `#B87D12` | Gold button shadow |
| `--color-accent-light` | Warm Cream | `#FEF3DC` | Gold tint backgrounds |

#### Neutral Scale

| Token | Hex | Usage |
|---|---|---|
| `--color-white` | `#FFFFFF` | Card surfaces (light) |
| `--color-bg-light` | `#FAF8F5` | Page background (light mode) |
| `--color-surface-light` | `#F2EFE9` | Secondary surface (light) |
| `--color-border-light` | `#E0DAD2` | Dividers, card borders (light) |
| `--color-text-primary` | `#1A1A1A` | Body copy (light) |
| `--color-text-secondary` | `#5C5C5C` | Captions, labels (light) |
| `--color-text-muted` | `#8C8C8C` | Placeholder, hints (light) |

#### Dark Mode Scale

| Token | Hex | Usage |
|---|---|---|
| `--color-bg-dark` | `#0D1C19` | Page background (dark) |
| `--color-surface-dark` | `#152420` | Card surface (dark) |
| `--color-surface-dark-2` | `#1C2E2A` | Elevated surface (dark) |
| `--color-border-dark` | `#2A3F3A` | Dividers (dark) |
| `--color-text-primary-dark` | `#F0EDEA` | Body copy (dark) |
| `--color-text-secondary-dark` | `#A0B8B2` | Captions (dark) |
| `--color-text-muted-dark` | `#607A75` | Placeholder (dark) |

#### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#2DBD8F` | Correct answer, pass |
| `--color-success-bg` | `#E6FAF4` | Success card background |
| `--color-error` | `#D95F3B` | Wrong answer, error |
| `--color-error-bg` | `#FDEEE9` | Error card background |
| `--color-warning` | `#F5A623` | Caution, in-progress |
| `--color-warning-bg` | `#FEF6E4` | Warning card background |
| `--color-info` | `#3B82F6` | Info, neutral system message |

#### Gradient Definitions

```css
/* Brand gradient — used on wordmark, hero elements */
--gradient-brand: linear-gradient(135deg, #1A8C7A 0%, #E8A020 100%);

/* Soft hero gradient — page hero backgrounds */
--gradient-hero-light: linear-gradient(160deg, #E6F5F2 0%, #FEF3DC 100%);
--gradient-hero-dark: linear-gradient(160deg, #0D1C19 0%, #1C2314 100%);

/* Voice active glow — mic button when recording */
--gradient-voice: radial-gradient(circle, rgba(26,140,122,0.3) 0%, transparent 70%);
```

---

### 1.2 Typography

#### Font Stack

| Role | Font Family | Weight | Source |
|---|---|---|---|
| Brand wordmark | DM Serif Display | 400 | Google Fonts |
| Display / Hero | Plus Jakarta Sans | 700, 800 | Google Fonts |
| Heading H1–H3 | Plus Jakarta Sans | 600, 700 | Google Fonts |
| Body | Inter | 400, 500 | Google Fonts |
| Caption / Label | Inter | 400, 500 | Google Fonts |
| Numeric / Stat | DM Serif Display | 400 | Google Fonts |

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

--font-display: 'DM Serif Display', Georgia, serif;
--font-sans: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
--font-body: 'Inter', 'Helvetica Neue', sans-serif;
```

#### Type Scale (mobile-first, rem)

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `--text-xs` | 0.75rem / 12px | 1.5 | 400 | Micro labels, badges |
| `--text-sm` | 0.875rem / 14px | 1.5 | 400/500 | Captions, helper text |
| `--text-base` | 1rem / 16px | 1.6 | 400 | Body copy |
| `--text-md` | 1.125rem / 18px | 1.5 | 500 | Emphasized body |
| `--text-lg` | 1.25rem / 20px | 1.4 | 600 | Card titles, H3 |
| `--text-xl` | 1.5rem / 24px | 1.35 | 700 | H2, Section headings |
| `--text-2xl` | 2rem / 32px | 1.25 | 700/800 | H1, Page titles |
| `--text-3xl` | 2.5rem / 40px | 1.2 | 800 | Hero headline |
| `--text-display` | 3rem / 48px | 1.1 | 400 | Brand wordmark, stats |

#### Wordmark Treatment

```
kastu
```

- Font: DM Serif Display, 400
- Case: Lowercase only — always
- Gradient: `--gradient-brand` applied as `background-clip: text`
- Letter-spacing: -0.02em (tight, premium feel)
- Never bold, never all-caps, never in a different font
- Minimum size: 24px; clear space = 1× the cap height on all sides
- On dark backgrounds: same gradient (gold-to-teal direction reverses)

```css
.kastu-wordmark {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 3rem);
  letter-spacing: -0.02em;
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

### 1.3 Spacing & Grid

#### Spacing Scale (8pt base)

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
```

#### Layout Grid

| Breakpoint | Name | Columns | Margin | Gutter |
|---|---|---|---|---|
| 0–639px | Mobile | 4 | 16px | 8px |
| 640–1023px | Tablet | 8 | 24px | 16px |
| 1024–1279px | Laptop | 12 | 32px | 24px |
| 1280px+ | Desktop | 12 | auto | 24px |

Max content width: **1200px**, centered.

---

### 1.4 Border Radius

```css
--radius-sm:   8px;   /* Badges, chips, small tags */
--radius-md:   12px;  /* Inputs, buttons */
--radius-lg:   16px;  /* Cards, panels */
--radius-xl:   20px;  /* Session cards, feature blocks */
--radius-full: 9999px; /* Pills, avatars, mic button */
```

---

### 1.5 Elevation & Shadow

```css
/* Duolingo-style solid press shadow — direction: bottom */
--shadow-press-teal:  0 4px 0 0 var(--color-primary-dark);
--shadow-press-gold:  0 4px 0 0 var(--color-accent-dark);
--shadow-press-gray:  0 4px 0 0 #C8C0B4;

/* Soft ambient shadows */
--shadow-xs: 0 1px 3px rgba(0,0,0,0.08);
--shadow-sm: 0 2px 8px rgba(0,0,0,0.10);
--shadow-md: 0 4px 16px rgba(0,0,0,0.12);
--shadow-lg: 0 8px 32px rgba(0,0,0,0.14);

/* Glow — voice active state */
--shadow-voice-glow: 0 0 0 12px rgba(26,140,122,0.15),
                     0 0 0 24px rgba(26,140,122,0.08);
```

---

### 1.6 Button Styles

#### Primary Button (Teal — main CTA)

```css
.btn-primary {
  background: var(--color-primary);
  color: #ffffff;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 600;
  padding: 14px 28px;
  border-radius: var(--radius-md);
  border: none;
  box-shadow: var(--shadow-press-teal);
  min-height: 48px;
  transition: transform 80ms ease, box-shadow 80ms ease;
}

.btn-primary:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 0 var(--color-primary-dark);
}

.btn-primary:hover {
  background: #1E9E8A;
}
```

#### Secondary Button (Outlined)

```css
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  font-weight: 600;
  padding: 12px 26px;
  border-radius: var(--radius-md);
  min-height: 48px;
  box-shadow: var(--shadow-press-teal);
  transition: transform 80ms ease, box-shadow 80ms ease;
}

.btn-secondary:active {
  transform: translateY(3px);
  box-shadow: none;
}
```

#### Accent Button (Gold — streaks, rewards)

```css
.btn-accent {
  background: var(--color-accent);
  color: #1A1A1A;
  font-weight: 700;
  padding: 14px 28px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-press-gold);
  min-height: 48px;
}

.btn-accent:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 0 var(--color-accent-dark);
}
```

#### Danger Button

```css
.btn-danger {
  background: var(--color-error);
  color: #ffffff;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 0 0 #A8432A;
  min-height: 48px;
}
```

#### Mic Button (Voice CTA — signature element)

```css
.btn-mic {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: #fff;
  border: none;
  box-shadow: var(--shadow-press-teal), var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 80ms ease, box-shadow 200ms ease;
}

.btn-mic.recording {
  background: var(--color-error);
  box-shadow: 0 4px 0 0 #A8432A, var(--shadow-voice-glow);
  animation: pulse-ring 1.5s ease-out infinite;
}

@keyframes pulse-ring {
  0%   { box-shadow: 0 4px 0 #A8432A, 0 0 0 0 rgba(26,140,122,0.4); }
  70%  { box-shadow: 0 4px 0 #A8432A, 0 0 0 20px rgba(26,140,122,0); }
  100% { box-shadow: 0 4px 0 #A8432A, 0 0 0 0 rgba(26,140,122,0); }
}
```

---

### 1.7 Card Styles

#### Standard Card (Duolingo-style with bottom border)

```css
.card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border-light);
  border-bottom: 4px solid var(--color-border-light);
  padding: var(--space-6);
  box-shadow: var(--shadow-xs);
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

/* Teal accent card — active session */
.card-teal {
  border-color: var(--color-primary);
  border-bottom-color: var(--color-primary-dark);
}

/* Gold accent card — streaks / achievements */
.card-gold {
  border-color: var(--color-accent);
  border-bottom-color: var(--color-accent-dark);
  background: var(--color-accent-light);
}

/* Dark mode */
.dark .card {
  background: var(--color-surface-dark);
  border-color: var(--color-border-dark);
  border-bottom-color: #1E3530;
}
```

#### Glassmorphism Card — Voice Session Overlay

```css
.card-glass {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.dark .card-glass {
  background: rgba(21, 36, 32, 0.7);
  border-color: rgba(255,255,255,0.08);
}
```

---

### 1.8 Form Elements

```css
.input {
  width: 100%;
  padding: 14px 16px;
  font-family: var(--font-body);
  font-size: var(--text-base);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border-light);
  border-bottom: 3px solid var(--color-border-light);
  background: var(--color-white);
  transition: border-color 150ms ease, box-shadow 150ms ease;
  min-height: 48px;
  outline: none;
}

.input:focus {
  border-color: var(--color-primary);
  border-bottom-color: var(--color-primary-dark);
  box-shadow: 0 0 0 3px rgba(26,140,122,0.15);
}

.input.error {
  border-color: var(--color-error);
  border-bottom-color: #A8432A;
}

.dark .input {
  background: var(--color-surface-dark);
  border-color: var(--color-border-dark);
  color: var(--color-text-primary-dark);
}
```

---

### 1.9 Iconography

- **Library:** Lucide Icons (matches 21st.dev / shadcn ecosystem)
- **Style:** Rounded stroke, 1.5–2px stroke width
- **Sizes:** 16px (inline), 20px (button), 24px (nav), 32px (feature), 48px (empty states)
- **Color:** Inherit from parent text color; accent icons use `--color-primary` or `--color-accent`
- **Never:** Mix filled and stroke icons in the same view

#### Key App Icons

| Context | Icon (Lucide) | Color |
|---|---|---|
| Mic recording | `Mic`, `MicOff` | Primary / Error |
| Grammar correction | `SpellCheck`, `CheckCircle` | Success |
| Session / Topic | `MessageCircle` | Primary |
| Progress / Streak | `Flame`, `TrendingUp` | Accent Gold |
| Settings | `Settings2` | Muted |
| Auth | `Mail`, `Lock`, `User` | Text secondary |
| Volume / TTS | `Volume2`, `VolumeX` | Primary |

---

### 1.10 Motion & Animation

```css
/* Timing functions */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Duolingo bounce */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out:    cubic-bezier(0, 0, 0.2, 1);

/* Duration tokens */
--duration-fast:   80ms;
--duration-base:  150ms;
--duration-slow:  300ms;
--duration-xslow: 500ms;
```

#### Signature Animations

```css
/* Success bounce — on correct grammar / session complete */
@keyframes bounce-in {
  0%   { transform: scale(0.8); opacity: 0; }
  60%  { transform: scale(1.1); }
  80%  { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
}

/* Error wiggle — on wrong input */
@keyframes wiggle {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}

/* Grammar card slide-in from right */
@keyframes slide-in-right {
  from { transform: translateX(20px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

/* Audio waveform bars — during playback */
@keyframes wave-bar {
  0%, 100% { height: 4px; }
  50%       { height: 20px; }
}
```

---

## PART 2 — UI/UX Design Specification

---

### 2.1 Layout System

All screens use a single-column mobile-first layout, expanding to a centered two-column layout on desktop where appropriate (e.g., session screen with conversation on left, grammar cards on right).

```
Mobile (< 640px)          Desktop (>= 1024px)
┌──────────────────┐      ┌──────────┬──────────┐
│   Top Nav / Bar  │      │   Nav    │          │
├──────────────────┤      │  Sidebar │  Content  │
│                  │      │          │          │
│    Content       │      │          │          │
│                  │      └──────────┴──────────┘
├──────────────────┤
│   Bottom Nav     │
└──────────────────┘
```

---

### 2.2 Navigation

#### Mobile — Bottom Navigation Bar

```
┌─────────────────────────────────────────┐
│  🏠 Home   🎤 Practice  📊 Progress  👤 Profile │
└─────────────────────────────────────────┘
```

- Height: 64px + safe area inset
- Background: `--color-bg-light` / `--color-bg-dark` with `backdrop-filter: blur`
- Active tab: `--color-primary`, filled icon, label visible
- Inactive: `--color-text-muted`, stroke icon, no label
- Border top: 1px `--color-border-light`

#### Desktop — Left Sidebar (collapsed on tablet)

- Width: 240px (expanded), 64px (icon only, tablet)
- Brand wordmark at top
- Nav items with icon + label
- Bottom: user avatar + settings

---

### 2.3 Screen Specifications

#### Screen 1 — Auth (Register / Login)

```
┌──────────────────────────────┐
│                              │
│       kastu  (wordmark)      │
│  Speak freely. Sound         │
│  brilliant.                  │
│                              │
│  ┌────────────────────────┐  │
│  │  Email                 │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  Password              │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │   Continue  →          │  │  ← Primary btn, full width
│  └────────────────────────┘  │
│                              │
│  Already have an account?    │
│  Sign in                     │  ← Text link, primary color
│                              │
└──────────────────────────────┘
```

- Background: `--gradient-hero-light` / `--gradient-hero-dark`
- Card: White, `--radius-xl`, `--shadow-md`, bottom border teal
- Logo area: centered, 48px padding top

---

#### Screen 2 — Dashboard (Topic Selection)

```
┌──────────────────────────────┐
│  kastu          🔥 5    👤   │  ← Nav bar with streak
├──────────────────────────────┤
│  Good morning, Billy 👋      │
│  What do you want to         │
│  practice today?             │
├──────────────────────────────┤
│  ┌──────────┐ ┌──────────┐  │
│  │ 💼        │ │ 🌍        │  │
│  │ Interview │ │ Travel   │  │
│  │  Practice │ │          │  │
│  └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐  │
│  │ 📰        │ │ 🎓        │  │
│  │ Current   │ │ Academic │  │
│  │ Events    │ │          │  │
│  └──────────┘ └──────────┘  │
├──────────────────────────────┤
│  Your recent sessions  →     │
│  ┌──────────────────────┐   │
│  │ Technology  · 8 min  │   │
│  │ ████████░░  Good     │   │
│  └──────────────────────┘   │
└──────────────────────────────┘
```

- Topic cards: 2-column grid, `--radius-xl`, emoji icon, 2px bottom border in primary color
- Streak badge: gold pill, DM Serif Display number, flame icon
- Recent session cards: progress bar with teal fill, session metadata

---

#### Screen 3 — Voice Session (Core Screen)

```
┌──────────────────────────────┐
│  ← Technology  |  ✕ End     │
├──────────────────────────────┤
│                              │
│  ┌──────────────────────┐   │
│  │ 🤖 Agent              │   │  ← Glassmorphism card
│  │                       │   │
│  │ "Tell me about a      │   │
│  │  time you had to      │   │
│  │  explain something    │   │
│  │  complex."            │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │ 🎤 You                │   │
│  │ I am go to the…       │   │  ← Live transcript
│  └──────────────────────┘   │
│                              │
│ ┌────────────────────────┐  │
│ │ ⚠️ Grammar Suggestion  ✕ │  │  ← Correction card (slide-in)
│ │ ~~I am go~~ →           │  │
│ │  I am going             │  │
│ │ Use present continuous  │  │
│ └────────────────────────┘  │
│                              │
│          ┌──────┐            │
│          │  🎤  │            │  ← Mic button (80px, pulsing)
│          └──────┘            │
│     Tap to speak             │
└──────────────────────────────┘
```

- Desktop: Agent chat left column, grammar cards right column
- Audio waveform visualiser: animated bars below mic button when agent is speaking
- Grammar card: `--color-error-bg` border-left 3px error color, slide from right
- Original phrase: `text-decoration: line-through`, muted color
- Corrected phrase: bold, success color

---

#### Screen 4 — Session End / Summary

```
┌──────────────────────────────┐
│          🎉                   │
│   Great session, Billy!      │
│                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ 12   │ │  3   │ │  8   │ │
│  │ mins │ │errs  │ │turns │ │
│  └──────┘ └──────┘ └──────┘ │
│                              │
│  Grammar patterns today      │
│  ┌──────────────────────┐   │
│  │ verb_form      ████░ │   │
│  │ articles       ██░░░ │   │
│  │ prepositions   █░░░░ │   │
│  └──────────────────────┘   │
│                              │
│  ┌────────────────────────┐ │
│  │  Practice Again  🎤    │ │
│  └────────────────────────┘ │
│  Back to Dashboard           │
└──────────────────────────────┘
```

- Stats row: 3 cards, DM Serif Display numbers (large), Plus Jakarta Sans labels
- Progress bars: teal fill, rounded caps, animated on mount
- CTA: Primary button full-width

---

### 2.4 Grammar Correction Card — Detailed Spec

```
┌─────────────────────────────────────────┐
│ ⚠️  Grammar Suggestion              [✕] │
├─────────────────────────────────────────┤
│                                         │
│  ~~I am go to the market~~              │  ← Strikethrough, muted
│       ↓                                 │
│  I am going to the market               │  ← Bold, success green
│                                         │
│  Use present continuous 'going'         │
│  after 'am'.                            │  ← Explanation, text-sm
│                                         │
└─────────────────────────────────────────┘
```

- Appear: `slide-in-right` 300ms `--ease-spring`
- Dismiss: fade-out 150ms on ✕ tap
- Auto-dismiss: after 8s if not dismissed
- On mobile: bottom sheet, slides up
- On desktop: fixed right panel, stacked if multiple
- Never overlaps mic button

---

### 2.5 Interactive States

| Element | Default | Hover | Active/Press | Focus | Disabled |
|---|---|---|---|---|---|
| Primary btn | Teal fill | Darker teal | translateY(3px) + shadow shrink | 3px outline | 40% opacity |
| Card | Normal shadow | translateY(-2px) | translateY(0) | outline primary | — |
| Input | Gray border | Gray border | Primary border | Primary border + glow | 40% opacity |
| Mic btn | Teal | Scale(1.05) | Scale(0.95) | Glow ring | Gray |
| Nav item | Muted | Primary tint bg | Scale(0.97) | Underline | — |

---

### 2.6 Loading States

```css
/* Skeleton shimmer */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface-light) 25%,
    var(--color-border-light)  50%,
    var(--color-surface-light) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: var(--radius-sm);
}
```

- Voice response loading: 3-dot animated waveform in agent bubble
- STT processing: transcript area shows shimmer skeleton
- Auth loading: button spinner replaces label, disabled state

---

### 2.7 Empty States

- Illustration style: Minimal line art, single color (primary teal), gentle motion (Lottie or CSS)
- Copy: Friendly, action-oriented — "No sessions yet. Say hello to get started. 🎤"
- Always include a primary CTA button

---

## PART 3 — Brand Guidelines

---

### 3.1 Brand Identity

| Attribute | Value |
|---|---|
| Name | kastu |
| Always lowercase | Yes — even at sentence start, in headings, everywhere |
| Tagline | Speak freely. Sound brilliant. |
| Category | AI-powered English speaking coach |
| Market | India-first, non-native English speakers |
| Personality | Encouraging, patient, intelligent, warm |

---

### 3.2 Brand Personality & Voice

#### The Four Traits

**1. Encouraging Coach (not a judge)**
- Never says "wrong." Says "here's a better way."
- Celebrates attempts, not just perfection.
- Copy: "Great try! Here's a small tweak." not "Error detected."

**2. Warm & Human (not robotic)**
- Uses contractions: "you're", "let's", "it's"
- Addresses user by name wherever possible
- Avoids jargon: "speaking score" not "fluency index"

**3. Quietly Confident (not boastful)**
- Never oversells. Shows results.
- Progress is shown through data, not marketing claims.

**4. India-aware (not generic global)**
- Understands Indian English patterns (verb-form errors, article omissions)
- Culturally relevant topic suggestions (interviews, presentations, daily conversations)
- Date/time formats: DD/MM/YYYY; currency: ₹ where relevant

---

### 3.3 Voice & Tone Matrix

| Situation | Tone | Example Copy |
|---|---|---|
| Onboarding | Warm, welcoming | "Let's find your voice together." |
| Grammar correction | Gentle, instructive | "Almost! Try saying it this way." |
| Session complete | Celebratory | "That was a great session! You're getting better." |
| Error / failure | Calm, reassuring | "Something went wrong. Let's try again." |
| Streak / milestone | Excited, fun | "🔥 5-day streak! You're on fire!" |
| Auth / system | Neutral, clear | "Enter your email to get started." |

---

### 3.4 Writing Rules

- ✅ Short sentences. One idea per sentence.
- ✅ Active voice always.
- ✅ Second person: "you", "your" — not "the user"
- ✅ Positive framing: "Speak more clearly" not "Don't mumble"
- ❌ Never use: "Error", "Failed", "Invalid" as standalone copy
- ❌ Never use: exclamation marks more than once per screen
- ❌ Never use: passive voice in CTAs

---

### 3.5 Wordmark Rules

| Rule | Spec |
|---|---|
| Spelling | `kastu` — always lowercase |
| Font | DM Serif Display, 400 weight only |
| Color | Brand gradient or solid `--color-primary` |
| On dark bg | Brand gradient (reversed) or white |
| Minimum size | 24px rendered |
| Clear space | 1× cap height on all four sides |
| Never | Bold, italic, all-caps, different font, outlined/stroked |
| Never | On a busy photographic background without a overlay |

---

### 3.6 Logo Direction Brief

*(For a designer to execute — no logo asset yet)*

**Concept:** The wordmark `kastu` is the primary logo. An optional brandmark (symbol) should:
- Draw from the Kasturi bird silhouette — a single fluid stroke suggesting a bird in mid-call (beak open, wings slightly raised), minimised to 2–3 bezier curves
- Work as a standalone app icon at 16×16 to 512×512
- Use only `--color-primary` (teal) as a monochrome mark; full-color version uses `--gradient-brand`
- Pair to the left of the wordmark at desktop, above at mobile

---

### 3.7 Color Usage Rules

| Rule | Detail |
|---|---|
| Primary teal | CTAs, active UI, key interactions — not decoration |
| Gold accent | Streaks, rewards, achievements only — never primary CTA |
| Error terracotta | Errors and destructive actions only |
| Gradient | Hero sections, wordmark — not on body text or buttons |
| Dark bg | `#0D1C19` — not pure black; warmth is intentional |
| Light bg | `#FAF8F5` — not pure white; softness is intentional |

---

### 3.8 Photography & Illustration Direction

*(V1 and beyond — no photography in Day 1 scope)*

- **Photography:** Warm, natural light. Indian faces, diverse. Candid expression (not posed corporate). Always people speaking, communicating.
- **Illustration:** Flat, minimal, single-line weight. Teal + gold palette. No clip-art gradients.
- **No stock photo clichés:** No floating speech bubbles on blue backgrounds, no generic "AI brain" visuals.

---

### 3.9 Accessibility Standards

| Standard | Requirement |
|---|---|
| Color contrast | WCAG AA minimum — 4.5:1 body text, 3:1 large text |
| Primary teal on white | 4.7:1 ✅ |
| Gold accent on dark | Test per use — adjust shade if < 3:1 |
| Focus indicators | 3px solid `--color-primary`, 2px offset — always visible |
| Tap targets | 48px minimum height and width |
| Reduced motion | Respect `prefers-reduced-motion` — disable bounce/pulse animations |
| Screen reader | All icon-only buttons must have `aria-label` |
| Font size | Minimum 14px body, 12px caption — no smaller |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 3.10 Dark Mode Implementation

```css
:root {
  color-scheme: light dark;
}

/* Light (default) */
:root, [data-theme="light"] {
  --color-bg:      #FAF8F5;
  --color-surface: #FFFFFF;
  --color-border:  #E0DAD2;
  --color-text:    #1A1A1A;
  --color-text-2:  #5C5C5C;
}

/* Dark */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg:      #0D1C19;
    --color-surface: #152420;
    --color-border:  #2A3F3A;
    --color-text:    #F0EDEA;
    --color-text-2:  #A0B8B2;
  }
}

[data-theme="dark"] {
  --color-bg:      #0D1C19;
  --color-surface: #152420;
  --color-border:  #2A3F3A;
  --color-text:    #F0EDEA;
  --color-text-2:  #A0B8B2;
}
```

User toggle stored in `localStorage` as `kastu-theme`. Defaults to system preference.

---

*End of Kastu Design Style Guide v1.0*

---

# PART 4 — Voice Session Interaction Specification

This section extends the core Voice Session screen with explicit real-time interaction behavior. It preserves the visual language, colors, typography, spacing, motion tokens, accessibility requirements, and grammar-card rules defined above.

## 4.1 Voice Interaction State Machine

The voice session uses explicit states so visual feedback always communicates what the system is doing.

```text
IDLE
  ↓
USER_RECORDING
  ├─ live user waveform
  ├─ live rolling transcript
  └─ recording mic state
       ↓
POSSIBLE_SILENCE
  ├─ waveform settles
  ├─ silence countdown
  └─ user can continue speaking
       ↓
STT_PROCESSING
  └─ transcript processing feedback
       ↓
AGENT_THINKING
  └─ subtle animated thinking indicator
       ↓
AGENT_SPEAKING
  ├─ agent TTS waveform
  ├─ agent/avatar pulse
  └─ final agent transcript
       ↓
IDLE
```

### State rules

- Only one primary voice state is active at a time.
- Visual transitions must be immediate enough to feel conversational.
- Do not use large loading screens during a voice session.
- The current state should remain understandable without relying on color alone.
- Respect `prefers-reduced-motion`.

---

## 4.2 Agent Speaking Visualization

When the agent's TTS audio is playing, the interface must visibly communicate that the agent is speaking.

### Primary visualization

Use a compact modern waveform centered beneath the agent response.

```text
       ▂ ▅ █ ▆ ▃ ▅ █ ▅ ▂
         ▅ █ █ ▆ ▅ █ ▅
       ▂ ▆ █ ▅ ▃ ▅ █ ▆ ▂
```

### Behavior

- Bars respond continuously to the TTS playback amplitude where audio-level data is available.
- If real amplitude data is unavailable, use a lightweight procedural waveform.
- Use 5–13 bars depending on available width.
- Bar heights should vary continuously rather than all pulsing identically.
- Use rounded bar ends.
- Primary color: `--color-primary`.
- Active/high-amplitude portions may subtly transition toward `--color-accent`.
- Animation must stop when TTS stops.
- On pause, freeze or settle the waveform instead of continuing to animate.
- The waveform must never dominate the agent's message content.

### Avatar pulse

If an agent avatar is present:

- Apply a subtle scale/glow pulse synchronized loosely with speech activity.
- Normal scale: `1`.
- Speaking scale: approximately `1.02–1.05`.
- Avoid aggressive continuous bouncing.
- The avatar pulse and waveform should feel like one system.

### Existing animation relationship

The existing `wave-bar` animation remains the fallback visual language for simple playback indicators.

---

## 4.3 User Speech Waveform

The user waveform is the primary real-time attention signal while the microphone is active.

The existing pulsing recording mic remains the primary voice control; the waveform provides richer live feedback around it.

### Visual direction

Use a modern reactive waveform rather than a static equalizer.

```text
        ▁ ▂ ▅ █ ▆ ▃ ▅ █ ▆ ▂ ▁
      ▁ ▃ ▆ █ ▅ ▂ ▅ █ ▆ ▃ ▁
        ▂ ▅ █ ▆ ▃ ▆ █ ▅ ▂
```

### Behavior

- React to microphone input amplitude.
- Use approximately 21–41 small bars/dots depending on viewport width.
- Central bars may be slightly larger than peripheral bars.
- Apply smoothing so the waveform does not jitter.
- Use short rise/fall transitions rather than hard jumps.
- Quiet speech produces smaller bars.
- Louder speech produces larger bars.
- During active speech, the waveform should attract attention without becoming visually noisy.
- Primary color: `--color-primary`.
- A subtle teal glow may surround the active waveform.
- The waveform disappears or settles when recording ends.

### Attention behavior

At the start of recording:

1. Mic button activates.
2. Voice glow appears.
3. Waveform expands into view.
4. Live transcript begins updating.

This creates an immediate visual confirmation that the system is listening.

---

## 4.4 Microphone Recording State

The existing `.btn-mic.recording` state remains the source of truth for recording.

During recording:

- Mic background: `--color-error`.
- Existing pulse-ring animation remains available.
- User waveform appears above or around the mic without covering the button.
- Live transcript remains visible.
- The interface should not display a generic "Loading" state while the microphone is actively listening.

### Recording hierarchy

```text
Live transcript
      ↓
User waveform
      ↓
Mic button
      ↓
Tap / stop instruction
```

The waveform should remain visually subordinate to the transcript and microphone control.

---

## 4.5 VAD / Silence Detection Feedback

Voice Activity Detection (VAD) determines when the user's utterance appears to have ended.

VAD feedback must not make the user feel rushed.

### Silence state

When speech stops:

```text
Speaking
  ↓
Short silence
  ↓
"Listening…" + subtle countdown
  ↓
Utterance end
```

Use a short visual countdown rather than an abrupt cut-off.

### Recommended behavior

- Begin silence detection only after meaningful speech has been detected.
- Use a configurable silence threshold controlled by the voice engine.
- Show a subtle progress ring or horizontal countdown near the waveform.
- Do not display a large numeric timer.
- If the user resumes speaking, immediately cancel the countdown.
- The countdown must reset whenever speech activity returns.

### Example

```text
        ▁ ▂ ▅ █ ▆ ▃ ▅ █ ▆ ▂ ▁
                 ◯
             Listening…
```

### UX principle

The countdown communicates:

> "I think you're finished — but I'm still giving you a moment."

It must never communicate:

> "You are running out of time."

---

## 4.6 Live Transcript

The user transcript is a rolling live transcript during active speech.

### Live state

```text
You

I am go to the market and then I...
```

### Rules

- Update incrementally as STT hypotheses arrive.
- The current unfinished phrase may use slightly muted text.
- Finalized words transition to normal text.
- Do not repeatedly animate the entire transcript.
- Keep the transcript anchored to the latest spoken content.
- If the transcript exceeds the visible region, automatically scroll to the latest line.
- Avoid layout jumps when individual words are corrected by STT.

### Finalization

When the utterance ends:

1. Freeze the final transcript.
2. Remove temporary STT styling.
3. Begin STT/LLM processing.
4. Preserve the user's message as a normal conversation bubble.

---

## 4.7 Agent Thinking State

The interval between finalized user speech and the start of agent TTS is an explicit system state.

### Visual treatment

Inside the agent bubble:

```text
Agent

● ● ●
```

The dots should animate with a restrained waveform-like rhythm.

### Rules

- Do not display a full-page spinner.
- Keep the agent bubble visible.
- Use the existing `3-dot animated waveform` loading concept.
- Maintain the agent identity/avatar while thinking.
- When the response becomes available, smoothly transition from thinking indicator to response text.
- If generation takes longer than expected, continue the subtle indicator rather than changing the interface to an error-like state.

---

## 4.8 Conversation Bubble Design

### Agent message

Use the existing glassmorphism treatment.

- `card-glass`
- Agent avatar/icon
- Agent label
- Response text
- TTS waveform while speaking
- Optional replay/volume control

```text
┌──────────────────────────────────┐
│ 🤖 Agent                         │
│                                  │
│ Tell me about a difficult       │
│ problem you solved.             │
│                                  │
│     ▂ ▅ █ ▆ ▃ ▅ █ ▆ ▂           │
└──────────────────────────────────┘
```

### User message

User messages should visually contrast with the agent while remaining within the same design system.

- Use a standard card/surface treatment rather than glassmorphism.
- Keep user messages visually simpler.
- Include microphone/live-transcript context only while actively recording.
- Finalized user messages should feel stable and complete.

```text
┌──────────────────────────────────┐
│ 🎤 You                           │
│                                  │
│ I worked on a difficult project.│
└──────────────────────────────────┘
```

### Conversation hierarchy

- Agent: glass / elevated / conversational.
- User: solid / grounded / conversational.
- Grammar feedback: semantic correction surface.
- System state: subtle, never dominant.

---

## 4.9 Grammar Suggestion Behavior During Speech

Grammar suggestions should **not interrupt active speech**.

### While user is speaking

Do not immediately display a full grammar correction card.

Instead:

- Keep the live transcript unobstructed.
- Continue listening.
- Allow grammar detection to collect the utterance context.
- If useful, show only a subtle non-blocking indicator.

### After the utterance

Once the user finishes:

1. Finalize transcript.
2. Analyze grammar.
3. Create correction cards.
4. Queue them for presentation.
5. Begin or continue the agent response.

This prevents the UI from visually fighting the user's speech.

### Priority

```text
User speech
    ↓
Live transcript
    ↓
VAD
    ↓
Grammar analysis
    ↓
Grammar suggestion
```

Grammar feedback is secondary to conversational flow.

---

## 4.10 Grammar Card Queue & Stacking

The existing grammar-card behavior is extended into an explicit queue.

### Desktop

Grammar cards appear in the fixed right-side panel.

```text
┌─────────────────────────┐
│ Grammar Suggestion   ✕  │
│ ~~I am go~~             │
│ I am going              │
└─────────────────────────┘
┌─────────────────────────┐
│ Grammar Suggestion   ✕  │
│ ~~He go~~               │
│ He goes                 │
└─────────────────────────┘
```

### Queue rules

- New cards enter the queue in detection order.
- Maximum visible stack should remain compact.
- Older cards remain accessible without covering newer cards.
- Cards may auto-dismiss after the existing 8-second duration.
- Dismissal removes only that card.
- If several cards arrive simultaneously, stagger their entrance by a small interval rather than animating all cards at once.
- Never cover the mic button.
- Never cover the active user waveform.
- Never obscure the primary agent response.

### Mobile

Use the existing bottom-sheet direction.

When multiple corrections exist:

- Present the newest/highest-priority correction first.
- Remaining corrections remain queued.
- Swiping/dismissing one reveals the next.
- Avoid creating a tall stack that consumes the entire viewport.

---

## 4.11 Grammar Card Priority

When multiple corrections are detected, prioritize:

1. Meaning-changing grammar issue.
2. Repeated grammar pattern.
3. High-confidence correction.
4. Minor grammar/style issue.

Do not overwhelm the learner with every detected issue.

The system should favor a small number of useful corrections over exhaustive annotation.

---

## 4.12 Voice Session Layout

### Mobile

```text
┌──────────────────────────────┐
│ ← Topic              ✕ End   │
├──────────────────────────────┤
│                              │
│       Agent bubble           │
│       Agent waveform         │
│                              │
│       User bubble            │
│       Live transcript        │
│                              │
│       Grammar feedback       │
│                              │
│        user waveform         │
│            🎤                │
│        Tap to speak          │
├──────────────────────────────┤
│        Bottom navigation     │
└──────────────────────────────┘
```

### Desktop

```text
┌────────────┬─────────────────────────────┬─────────────────┐
│            │                             │                 │
│ Navigation │       Conversation          │ Grammar         │
│            │                             │ Suggestions     │
│            │       Agent bubble          │                 │
│            │       User bubble           │                 │
│            │                             │                 │
│            │       User waveform         │                 │
│            │           🎤                │                 │
│            │                             │                 │
└────────────┴─────────────────────────────┴─────────────────┘
```

Grammar feedback remains separated from the primary conversational flow.

---

## 4.13 Motion Rules for Voice UI

Voice interaction uses the existing timing tokens:

- Fast: `80ms`
- Base: `150ms`
- Slow: `300ms`
- XSlow: `500ms`

### Recommended motion

| Interaction | Motion |
|---|---|
| Mic activation | 150ms scale + glow |
| User waveform appearance | 150–300ms ease-out |
| Waveform amplitude | continuous, smoothed |
| VAD countdown | continuous progress |
| Thinking indicator | subtle repeating pulse |
| Agent waveform | continuous audio-reactive motion |
| Grammar card entrance | 300ms spring |
| Grammar card dismissal | 150ms fade |
| Transcript updates | no large movement |
| State transition | 150–300ms |

Avoid combining multiple large animations at the same time.

---

## 4.14 Voice Interaction Accessibility

Voice feedback must not depend exclusively on animation or color.

Provide equivalent state information through:

- Accessible labels.
- Screen-reader status announcements where appropriate.
- Text state such as "Listening", "Thinking", or "Speaking".
- Visible focus indicators.
- Minimum 48px interactive targets.

When `prefers-reduced-motion: reduce` is enabled:

- Disable waveform pulsing.
- Disable avatar scaling.
- Disable continuous decorative pulse animations.
- Replace animated thinking indicators with a static indicator.
- Keep transcript and textual state feedback fully available.

---

## 4.15 Voice State Copy

Use short, human language consistent with the brand voice.

| State | Suggested copy |
|---|---|
| Idle | `Tap to speak` |
| Recording | `Listening…` |
| Possible silence | `Still listening…` |
| STT processing | `Transcribing…` |
| Agent thinking | `Thinking…` |
| Agent speaking | `Speaking` |
| Finished | `Tap to speak` |

Avoid technical labels such as:

- `VAD active`
- `STT processing`
- `LLM inference`
- `Audio buffer`
- `Error detected`

These are implementation concepts, not user-facing language.

---

## 4.16 Voice Session UX Principles

1. **Speech is the primary interaction.** Visual feedback supports speech rather than competing with it.
2. **The waveform confirms responsiveness.** The user should immediately see that the microphone is receiving speech.
3. **Silence detection should feel forgiving.** Never make users feel rushed.
4. **Thinking should feel intentional.** A short processing state is preferable to unexplained silence.
5. **Agent speech should feel alive.** Waveform and avatar motion establish that audio is actively playing.
6. **Grammar feedback should be non-disruptive.** Never interrupt active speech with a correction card.
7. **Feedback should queue cleanly.** Multiple corrections must not create visual clutter.
8. **Transcript should remain trustworthy.** Live text may change; finalized text should remain stable.
9. **One primary animation at a time.** Avoid visual competition between waveform, cards, and controls.
10. **Conversation continuity takes priority.** The user should always understand who is speaking, who is listening, and what happens next.

---

## 4.17 Implementation-Level Event Mapping

The UI should respond to the following conceptual events:

```text
voice.session.started
voice.user.recording_started
voice.user.speech_detected
voice.user.transcript_partial
voice.user.transcript_final
voice.user.silence_started
voice.user.silence_cancelled
voice.user.recording_ended
voice.stt.processing
voice.agent.thinking_started
voice.agent.response_ready
voice.agent.tts_started
voice.agent.tts_progress
voice.agent.tts_paused
voice.agent.tts_ended
grammar.suggestion_created
grammar.suggestion_queued
grammar.suggestion_dismissed
voice.session.ended
```

The visual layer should derive its state from these events rather than independently guessing the current voice state.

---

## 4.18 Voice Session Acceptance Criteria

A voice-session implementation following this guide should satisfy all of the following:

- The user can immediately distinguish listening, thinking, and speaking states.
- The user sees live microphone activity while speaking.
- The user sees live transcript updates during speech.
- Silence produces a subtle, reversible countdown.
- Resuming speech cancels the silence countdown.
- Agent TTS produces visible waveform activity.
- Agent/avatar activity stops when TTS stops.
- Grammar cards do not interrupt active speech.
- Multiple grammar suggestions queue or stack without covering the mic.
- Conversation bubbles clearly distinguish agent and user.
- Finalized transcripts remain visually stable.
- Reduced-motion users receive equivalent non-animated feedback.
- No voice-state animation obscures primary content or controls.
