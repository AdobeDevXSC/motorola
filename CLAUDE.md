# Project Memory - Motorola Solutions Migration

Migrating Motorola Solutions homepage (https://www.motorolasolutions.com/en_us.html) to Adobe Edge Delivery Services.

## Key Files

- **Content**: `/content/en-us.html`
- **Global styles**: `/styles/styles.css`
- **Blocks**: `/blocks/` (carousel, accordion, cards-portfolio, cards-icon, columns-logos)
- **Icons**: `/icons/` (custom SVG icons)
- **Images**: `/content/images/` (local assets)

---

## Design Tokens

Defined in `/styles/styles.css` - reference these variable names, don't hardcode values.

| Category | Variables |
|----------|-----------|
| **Text** | `--text-color`, `--text-color-secondary`, `--text-color-inverse` |
| **Brand** | `--color-brand-primary` (#005EB8), `--link-color` |
| **Backgrounds** | `--background-color`, `--background-color-light`, `--background-color-dark`, `--background-color-black` |
| **Spacing** | `--spacing-xxs` through `--spacing-xxxl` (4px to 64px scale) |
| **Typography** | `--body-font-family`, `--heading-font-family` (Roboto), `--heading-font-weight` (400) |

---

## CSS Guidelines

1. **Never use `!important`** - increase selector specificity instead
2. **Use CSS custom properties** - reference design tokens, override at block level when needed
3. **Edge-to-edge blocks** - use `:has()` selector on wrapper: `main > div:has(.block-name)`

---

## EDS Authoring Patterns

- **Link → Button**: Link alone in its own paragraph becomes a button
- **Link stays link**: Link inline with other text stays a link
- **Section metadata**: Use `section-metadata` block to apply styles like `highlight`, `dark`, `image-right`
- **Page templates**: Add `Template: homepage` to page metadata for centered default content

---

## Custom Blocks

### carousel (Unified with Variants)

| Variant | Class | Purpose |
|---------|-------|---------|
| Hero | `.carousel.hero` | Full-width hero with auto-rotation (10s), dark overlay, white text |
| Stories | `.carousel.stories` | Cards with optional intro panel from preceding content |
| Wide | `.carousel.wide` | Large centered cards (920px), 50% opacity on inactive, infinite loop |
| Default | `.carousel` | Simple horizontal scrolling cards (330px) |

**Wide variant features**: Centered active slide, edge-to-edge, cloned slides for seamless infinite scroll.

### accordion + cards-portfolio

Used together in `homepage-portfolio` section. Accordion controls which cards-portfolio group is visible via `data-title`/`data-category` matching.

### cards-icon

Icon cards using custom SVGs from `/icons/`. Dark background (#1a1a1a), cyan strokes (#00b8e6).

### image-right (Section Style)

Text left, image extends from viewport center to right edge. Uses `width: 50vw` with negative margin trick.

---

## Page Structure (en-us.html)

1. carousel hero (4 slides)
2. "Solving for safer" default content
3. Highlight section
4. Accordion + cards-portfolio (homepage-portfolio section)
5. Partner logos (columns-logos)
6. carousel stories - "A shared vision..."
7. image-right section - "See what safer can do..."
8. carousel wide - "Featured news"
9. cards-icon - "Explore Motorola Solutions"
10. Metadata

---

## Local Assets

**Images** (`/content/images/`): news-assist-suites.jpg, news-manet-radio.jpg, news-avigilon-alerts.png, news-the-realreal.png, news-android-911.jpg

**Icons** (`/icons/`): icon-about.svg, icon-newsroom.svg, icon-investors.svg, icon-careers.svg, icon-shop.svg

---

## Reminders

1. Always read files before editing
2. Test in preview at localhost:3000
3. Check hover states - many elements have specific behaviors
4. Follow existing patterns in the codebase
5. Update this file when learning new project-specific patterns
