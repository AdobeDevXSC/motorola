# Project Memory - Motorola Solutions Migration

## Project Overview
Migrating Motorola Solutions homepage (https://www.motorolasolutions.com/en_us.html) to Adobe Edge Delivery Services.

## Key Files
- **Main content**: `/workspace/content/en-us.html`
- **Global styles**: `/workspace/styles/styles.css`
- **Carousel block**: `/workspace/blocks/carousel/` (unified block with variants)

---

## Custom Block Patterns

### carousel (Unified Carousel with Variants)
A single unified carousel block supporting multiple variants via the EDS variant pattern.

**Variants:**
| HTML Class | CSS Class | Purpose |
|------------|-----------|---------|
| `carousel hero` | `.carousel.hero` | Full-width hero with auto-rotation |
| `carousel stories` | `.carousel.stories` | Customer stories with intro panel |
| `carousel wide` | `.carousel.wide` | Large square cards with glass-effect footer |
| `carousel` | `.carousel` | Simple card carousel (default) |

---

#### Hero Variant (`carousel hero`)
Full-width hero slides with background images, dark overlay, white text, and auto-rotation.

**Features:**
- Auto-rotation (10s interval, pauses on interaction for 15s)
- Respects `prefers-reduced-motion` preference
- Pauses on hover, focus, or touch
- Navigation arrows on sides of carousel
- Indicators at bottom center inside carousel
- Full-width slides (500-700px min-height responsive)

**Structure:**
```
.carousel.hero
  └── .carousel-slides-container
      ├── .carousel-navigation-buttons (absolute, sides)
      │   ├── .slide-prev
      │   └── .slide-next
      └── .carousel-slides
          └── .carousel-slide (100% width)
              ├── .carousel-slide-image (background with overlay)
              └── .carousel-slide-content (white text overlay)
  └── nav > .carousel-slide-indicators (absolute, bottom center)
```

**Key CSS:**
- Full-width: `flex: 0 0 100%`
- Dark gradient overlay: `linear-gradient(to right, rgba(0,0,0,0.7) 0%, ...)`
- White/inverted text and buttons
- Navigation on sides: `position: absolute; top: 50%; left/right: 25px`

**Used for:** Hero carousel at top of page

---

#### Stories Variant (`carousel stories`)
Card carousel with an optional intro panel that appears as a "first card" on the left.

**Structure (with intro):**
```
.carousel.stories.has-intro
  └── .carousel-layout (flex row)
      ├── .carousel-intro (fixed 330px width)
      │   ├── .carousel-intro-heading (h2)
      │   ├── .carousel-intro-description (p)
      │   └── .carousel-intro-cta (button)
      └── .carousel-track (flex: 1)
          └── .carousel-slides (horizontal scroll)
              └── .carousel-slide (330px cards)
```

**Key CSS:**
- Intro panel: `flex: 0 0 330px` with left padding (80px mobile, 140px desktop)
- Use `scroll-padding-left: 50px` for first card shadow visibility

**How it works:**
- JS detects preceding default content (h2, paragraphs) in the section
- Creates intro panel from that content and hides the original
- Adds `has-intro` class to enable full-width edge-to-edge layout

**Used for:** "A shared vision of safety and security" section

---

#### Wide Variant (`carousel wide`)
Large square cards with full-bleed images and glass-effect footer overlay. Based on Motorola Solutions' Featured News carousel style.

**Structure:**
```
.carousel.wide
  └── .carousel-layout
      └── .carousel-track
          └── .carousel-slides (horizontal scroll)
              └── .carousel-slide (600px cards, 1:1 aspect)
                  └── .carousel-slide-image (square, contains footer)
                      ├── picture > img (full-bleed)
                      └── .carousel-slide-footer (absolute, bottom)
                          └── .carousel-slide-footer-wrapper (glass effect)
                              ├── .carousel-slide-description
                              └── .carousel-slide-cta (white button)
  └── .carousel-navigation-wrapper (below carousel)
```

**Key CSS:**
- Cards: `flex: 0 0 600px` (larger than default 330px)
- Square aspect ratio: `aspect-ratio: 1 / 1`
- Glass effect: `background: rgba(0,0,0,0.4); backdrop-filter: blur(15px)`
- Description: 19px font, white text
- CTA button: white background, black text, `8px 20px` padding

**Used for:** "Featured news" section

---

#### Default Variant (`carousel`)
Simple horizontal scrolling card carousel without intro panel.

**Structure:**
```
.carousel
  └── .carousel-layout
      └── .carousel-track
          └── .carousel-slides (horizontal scroll)
              └── .carousel-slide (330px cards)
  └── .carousel-navigation-wrapper (below carousel)
```

**Used for:** General card carousels

---

### cards-icon Block
Icon cards with SVG icons for navigation/explore sections.

**Files:**
- Icons stored in `/workspace/icons/` as SVG files
- `icon-about.svg` - Briefcase icon
- `icon-newsroom.svg` - Document list icon
- `icon-investors.svg` - Handshake icon
- `icon-careers.svg` - Person icon
- `icon-shop.svg` - Laptop/screen icon

**Icon Style:**
- 48x48px viewBox
- Dark background: `#1a1a1a`
- Cyan line-art strokes: `#00b8e6`
- Stroke width: 1.5px
- No fills (outline style)

**Usage in HTML:**
```html
<div class="cards-icon">
  <div>
    <div><img src="/icons/icon-about.svg" alt="" width="48" height="48"></div>
    <div><p><a href="/en_us/about.html">About Us</a></p></div>
  </div>
  <!-- more cards... -->
</div>
```

**Used for:** "Explore Motorola Solutions" section

---

### image-right Section Style
A custom section style for layouts with text on the left and an image extending from viewport center to right edge.

**Usage in HTML:**
```html
<div>
  <h2>Heading text</h2>
  <p><strong><a href="...">CTA Button</a></strong></p>
  <p><picture>...</picture></p>
  <div class="section-metadata">
    <div><div>Style</div><div>image-right</div></div>
  </div>
</div>
```

**Key CSS (in styles.css):**
```css
/* Image - starts at viewport center, extends 50vw to right edge */
main .section.image-right .default-content-wrapper picture {
  display: block;
  position: relative;
  width: 50vw;
  margin-top: var(--spacing-l);
  left: calc(50vw - 50%);  /* Position left edge at viewport center */
}
```

**How it works:**
- `width: 50vw` makes image exactly half the viewport width
- `left: calc(50vw - 50%)` positions the image's left edge at viewport center
  - `50vw` = distance from container edge to viewport center
  - `-50%` = offset by half the container width (since we're in a centered container)
- Result: image spans from viewport center to right edge regardless of container width

**Used for:** "See what safer can do for your industry" section

---

## Current State (as of last session)

### Completed
1. **Unified carousel block** with four variants:
   - `carousel hero` - Full-width hero with auto-rotation, 4 slides
   - `carousel stories` - Customer stories with intro panel
   - `carousel wide` - Large square cards with glass-effect footer (Featured News)
   - `carousel` - Default card carousel
2. "See what safer can do for your industry" converted to default content with image-right style
3. Highlight section text color darkened to rgba(0, 0, 0, 0.95)
4. Carousel intro description font size increased to 18px
5. First card shadow visibility fixed with scroll-padding-left
6. Stories variant left padding reduced to 30px, track margin -30px
7. Image-right section image now extends from center to right viewport edge (50vw width, left edge at viewport center)
8. Deleted old `carousel-hero`, `carousel-stories`, and `carousel-cards` folders
9. **cards-icon block** updated with custom SVG icons stored in `/workspace/icons/`
10. **Featured news images** downloaded and stored locally in `/workspace/content/images/`
11. Featured news carousel items reordered: Assist Suites → MANET Radio → Avigilon → RealReal → Android 911

### Local Assets
**Featured News Images** (in `/workspace/content/images/`):
- `news-assist-suites.jpg` - New Assist Suites for command centers
- `news-manet-radio.jpg` - MANET radio with Silvus Technologies
- `news-avigilon-alerts.png` - Avigilon Alta Aware alerts
- `news-the-realreal.png` - The RealReal case study
- `news-android-911.jpg` - Android 911 features

**Icon SVGs** (in `/workspace/icons/`):
- `icon-about.svg`, `icon-newsroom.svg`, `icon-investors.svg`, `icon-careers.svg`, `icon-shop.svg`

### Known Issues / Remaining Work
- None currently identified

### Section Order in en-us.html
1. **carousel hero** (4 slides, auto-rotation)
2. "Solving for safer" default content with video thumbnail
3. "Our ecosystem..." highlight section
4. "Technology that's exponentially more powerful" with accordion + cards-portfolio
5. Partner logos (columns-logos marquee)
6. **carousel stories** - "A shared vision of safety and security"
7. "See what safer can do for your industry" (image-right section style)
8. **carousel wide** - "Featured news" (large square cards with glass footer)
9. "Explore Motorola Solutions" cards-icon
10. Metadata block

---

## Scroll Snap Fix Pattern
When using `scroll-snap-type: x mandatory` with padding, the first snapped element may cut off shadows/content on the left edge.

**Solution:** Add `scroll-padding-left` equal to the left padding:
```css
.carousel.stories.has-intro .carousel-slides {
  padding-left: 30px;
  scroll-padding-left: 30px;  /* Matches padding */
}
```

This makes scroll snap respect the padding offset so the first card displays with full shadow visibility.

**Note:** Also set a negative margin on the parent track to extend content to the right edge:
```css
.carousel.stories.has-intro .carousel-track {
  margin-right: -30px;
}
```
