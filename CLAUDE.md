# Project Memory - Motorola Solutions Migration

Migrating Motorola Solutions homepage (https://www.motorolasolutions.com/en_us.html) to Adobe Edge Delivery Services.

## Key Files

- **Content**: `/content/en-us.html`
- **Global styles**: `/styles/styles.css`
- **Blocks**: `/blocks/` (carousel, accordion, cards-portfolio, cards-icon, columns-logos, header, footer, fragment)
- **Icons**: `/icons/` (custom SVG icons)
- **Images**: `/content/images/` (local assets)

---

## Design Tokens

Defined in `/styles/styles.css` - reference these variable names, don't hardcode values.

| Category | Variables |
|----------|-----------|
| **Text** | `--text-color`, `--text-color-secondary`, `--text-color-inverse`, `--color-text-muted` |
| **Brand** | `--color-brand-primary` (#005EB8), `--link-color`, `--color-hero-indicator-active` |
| **Backgrounds** | `--background-color`, `--background-color-light`, `--background-color-dark`, `--background-color-black`, `--color-surface-white` |
| **Borders** | `--color-border-light`, `--color-border-dark` |
| **Indicators** | `--color-indicator-inactive`, `--color-indicator-hover` |
| **Spacing** | `--spacing-xxs` through `--spacing-xxxl` (4px to 64px scale) |
| **Typography** | `--body-font-family`, `--heading-font-family` (Roboto), `--heading-font-weight` (400), `--body-font-size-*` |
| **Shadows** | `--shadow-card`, `--shadow-card-elevated` |
| **Transitions** | `--transition-fast`, `--transition-base`, `--transition-slow` |

---

## CSS Guidelines

1. **Never use `!important`** - increase selector specificity instead
2. **Use CSS custom properties** - reference design tokens, override at block level when needed
3. **Edge-to-edge blocks** - use `:has()` selector on wrapper: `main > div:has(.block-name)`
4. **Specificity order in styles.css** - section-specific styles (like `image-full-width`) must come BEFORE template styles (like `template-home`) to maintain proper cascade
5. **Visually hidden text** - use `clip-path: inset(50%)` instead of deprecated `clip: rect()`
6. **Backdrop filter** - always include both `-webkit-backdrop-filter` and `backdrop-filter`

---

## Lint Rules

- **no-descending-specificity**: For complex block CSS with variant overrides, add `/* stylelint-disable no-descending-specificity */` at the top of the file
- **declaration-block-no-duplicate-properties**: Never duplicate CSS properties (except vendor prefixes like `-webkit-`)
- **property-no-deprecated**: Use modern equivalents (`clip-path` not `clip`)

---

## EDS Authoring Patterns

- **Link → Button**: Link alone in its own paragraph becomes a button
- **Link stays link**: Link inline with other text stays a link
- **Section metadata**: Use `section-metadata` block to apply styles like `highlight`, `dark`, `image-full-width`
- **Page templates**: Add `Template: template-home` to page metadata for centered default content

---

## Template: template-home

Centers default content (text, headings, buttons, images) on homepage.

**Exception**: Sections containing `.carousel.stories` are NOT centered - they keep left-aligned text for the intro panel.

CSS selector pattern:
```css
body.template-home main > .section:not(:has(.carousel.stories)) .default-content-wrapper {
  text-align: center;
}
```

---

## Custom Blocks

### carousel (Unified with Variants)

| Variant | Class | Purpose |
|---------|-------|---------|
| Hero | `.carousel.hero` | Full-width hero with auto-rotation (10s), dark overlay, white text |
| Stories | `.carousel.stories` | Cards with optional intro panel from preceding content |
| Wide | `.carousel.wide` | Large centered cards (920px), 50% opacity on inactive, infinite loop |
| Default | `.carousel` | Simple horizontal scrolling cards (330px) |

**Wide variant specifics**:
- No padding-top (`padding: 0 0 var(--spacing-xl)`)
- Navigation below slides with double margin (`margin-bottom: calc(2 * var(--spacing-xl))`)
- Centered active slide, edge-to-edge, cloned slides for seamless infinite scroll

### accordion + cards-portfolio

Used together in `homepage-portfolio` section. Accordion controls which cards-portfolio group is visible via `data-title`/`data-category` matching.

### cards-icon

Icon cards using custom SVGs from `/icons/`. Dark background (#1a1a1a), cyan strokes (#00b8e6).

### image-full-width (Section Style)

Centered text content with full viewport-width image below.

**Key CSS pattern** for breaking out of centered container:
```css
main .section.image-full-width .default-content-wrapper p:has(picture) {
  align-self: stretch;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  max-width: unset;
}
```

This works at all viewport sizes by calculating the offset from the centered container.

---

## Page Structure (en-us.html)

1. carousel hero (4 slides)
2. "Solving for safer" default content
3. Highlight section
4. Accordion + cards-portfolio (homepage-portfolio section)
5. Partner logos (columns-logos)
6. carousel stories - "A shared vision..."
7. image-full-width section - "See what safer can do..."
8. carousel wide - "Featured news"
9. cards-icon - "Explore Motorola Solutions"
10. Metadata

---

## Local Assets

**Images** (`/content/images/`): news-assist-suites.jpg, news-manet-radio.jpg, news-avigilon-alerts.png, news-the-realreal.png, news-android-911.jpg

**Icons** (`/icons/`): icon-about.svg, icon-newsroom.svg, icon-investors.svg, icon-careers.svg, icon-shop.svg

---

## CSS Style Guide

### Color Syntax
Always use CSS Color Level 4 syntax:
```css
/* ✓ Correct */
color: rgb(0 0 0 / 95%);
background: rgb(255 255 255 / 50%);

/* ✗ Avoid */
color: rgba(0, 0, 0, 0.95);
background: rgba(255, 255, 255, 0.5);
```

### CSS Variables Usage
1. **Always use tokens** for: colors, spacing, typography, shadows, transitions
2. **Define new tokens** only if a value is used 2+ times across different files
3. **Keep hardcoded** intentional design dimensions (specific widths like 330px, 920px, icon sizes)

### Comment Format
Use consistent section headers:
```css
/* ===== SECTION NAME ===== */
```

### Block CSS Scoping
- Scope all styles to the block class: `.my-block .child-element`
- Avoid external context selectors unless necessary (e.g., `.section.dark .my-block`)
- Use `:has()` on wrapper for edge-to-edge blocks: `main > div:has(.my-block)`

### Font Family
Always use the variable, never hardcode:
```css
/* ✓ Correct */
font-family: var(--body-font-family);

/* ✗ Avoid */
font-family: Roboto, sans-serif;
```

---

## JavaScript Style Guide

### Block Module Pattern
Export only the default decorate function:
```javascript
// ✓ Correct
export default function decorate(block) { ... }

// ✗ Avoid - unless function is imported elsewhere
export function showSlide() { ... }
```

### DOM Manipulation
1. Use `document.createElement()` for structural elements
2. `innerHTML = ''` is acceptable for clearing containers
3. `innerHTML` with template literals is acceptable for:
   - Fully controlled static content (no user input)
   - Simple markup that would be verbose with createElement
4. Always scope queries to `block`: `block.querySelector('.child')`

### Accessibility
Always include ARIA attributes on interactive elements:
- `aria-label` on buttons without visible text
- `aria-hidden` on decorative elements
- `aria-expanded` on toggleable sections

---

## Reminders

1. Always read files before editing
2. Test in preview at localhost:3000
3. Check hover states - many elements have specific behaviors
4. Follow existing patterns in the codebase
5. Update this file when learning new project-specific patterns
6. Screenshots go in `/tmp` folder only, NEVER at project root
