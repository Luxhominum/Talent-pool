# Design Specification Document: PGE Talent Pool

## 1. Visual Identity & Design Philosophy

**PGE Talent Pool** adheres to an **Editorial Swiss Modernist** design system. It eschews generic gradient-heavy AI defaults in favor of ultra-clean typography, structured grid rhythm, high-contrast monochrome bases, and subtle pastel semantic accents.

---

## 2. Design System Tokens

### 2.1 Typography Palette
- **UI & System Font**: `'Geist'`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
  - Body Text: `13px` / `14px` (`font-weight: 400`, `line-height: 1.5`)
  - Subtitles & Labels: `12px` / `13px` (`font-weight: 500`)
  - Headings: `16px` / `18px` (`font-weight: 600`, `letter-spacing: -0.01em`)
- **Editorial Headline**: `'Newsreader'`, `Georgia`, `serif`
  - Hero Heading: `32px` (`font-weight: 400`, `letter-spacing: -0.02em`)
  - Italic Accent: `font-style: italic`, `color: #374151`
- **Metadata & Technical Mono**: `'Geist Mono'`, `monospace`
  - Candidate ID (`PGE-001`), Section Labels, Badges: `10px` / `11px` (`font-weight: 500`, `letter-spacing: 0.05em`)

### 2.2 Color Tokens

| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| `var(--bg-canvas)` | `#FBFBFA` | Page global background |
| `var(--bg-surface)` | `#FFFFFF` | Cards, table container, drawer background |
| `var(--bg-subtle)` | `#F4F4F2` | Inputs, dropdowns, table headers |
| `var(--border-light)` | `#E8E8E4` | Card borders, section dividers |
| `var(--border-focus)` | `#111827` | Input focus outline |
| `var(--text-primary)` | `#111827` | Primary headers and candidate names |
| `var(--text-secondary)`| `#4B5563` | Roles, metadata labels |
| `var(--text-muted)` | `#9CA3AF` | Candidate IDs, placehoder text |

### 2.3 Stage Pill Accents (Semantic Pastels)

| Stage | Background | Text Color |
| :--- | :--- | :--- |
| **Prospect** | `#E8F0FE` | `#1967D2` |
| **Screening** | `#FEF7E0` | `#B06000` |
| **Interviewed** | `#F3E8FD` | `#7627BB` |
| **Shortlisted** | `#D1FAE5` | `#065F46` |
| **Offered** | `#FEF3C7` | `#92400E` |
| **Hired** | `#E6F4EA` | `#137333` |
| **Archived** | `#F3F4F6` | `#6B7280` |

---

## 3. Layout Architecture

### 3.1 Grid & Spacing System
- **Max Container Width**: `1400px` centered (`padding: 24px 32px 80px`).
- **Bento Grid Layout**: `grid-template-columns: repeat(auto-fill, minmax(360px, 1fr))`, `gap: 16px`.
- **Metrics Bar**: 4-column equal grid (`gap: 16px`).
- **Kanban Board**: 7-column horizontal overflow grid (`minmax(200px, 1fr)`, `gap: 12px`).

### 3.2 Component Specifications

#### Candidate Bento Card:
```css
.talent-card {
  background: #FFFFFF;
  border: 1px solid #E8E8E4;
  border-radius: 10px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.talent-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.04);
}
```

#### Slide-over Candidate Drawer:
```css
.drawer {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: 560px; max-width: 95vw;
  background: #FFFFFF;
  z-index: 1001;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
}
.drawer.open { transform: translateX(0); }
```

---

## 4. Micro-Interactions & Animation Standards

- **State Transitions**: `cubic-bezier(0.16, 1, 0.3, 1)` for spring-like smooth drawer entry.
- **Center Toast Banner**:
  - Enters from top center: `translateY(-12px) scale(0.95)` ➔ `translateY(0) scale(1)` (`0.25s`).
  - Auto-dismisses cleanly after 3 seconds.
- **1-Click Communication Badges**:
  - WhatsApp: `💬 +628...` (Opens `https://wa.me/...` directly in new tab).
  - CV: `📄 CV ↗` (Opens Google Drive document).
  - Portfolio: `🎨 Porto (N) ↗` (Opens multi-file portfolio viewer or primary link).
