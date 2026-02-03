# Motorola Solutions - Migration Guidelines

> **Self-Reminder**: Always update this file when discovering new patterns, receiving corrections from the user, or establishing project-specific conventions. This ensures continuity across sessions.

## CSS Best Practices

### Never Use `!important`
- Always use proper CSS specificity instead of `!important` declarations
- If styles aren't applying, increase selector specificity (e.g., `main > div:has(.block-name)`)
- The codebase should remain maintainable without override hacks

### Use CSS Custom Properties
- Define reusable values as CSS variables in `styles/styles.css`
- Reference variables throughout block CSS for consistency
- Override variables at the block level when needed, not global values

## Design Tokens

### Colors
```css
/* Text Colors */
--text-color: rgba(0, 0, 0, 0.95);
--text-color-secondary: rgba(0, 0, 0, 0.6);
--text-color-inverse: rgba(255, 255, 255, 0.95);
--text-color-inverse-secondary: rgba(255, 255, 255, 0.6);

/* Brand Colors */
--color-brand-primary: #005EB8;  /* Motorola Blue */
--link-color: #005EB8;

/* Background Colors */
--background-color: #ffffff;
--background-color-light: #f5f5f5;
--background-color-dark: #343434;
--background-color-black: #191919;
```

### Typography
```css
/* Font Family */
--body-font-family: roboto, roboto-fallback, sans-serif;
--heading-font-family: roboto, roboto-fallback, sans-serif;

/* Heading font-weight is 400 (lighter than typical) */
--heading-font-weight: 400;
```

### Spacing Scale
```css
--spacing-xxs: 4px;
--spacing-xs: 8px;
--spacing-s: 12px;
--spacing-m: 16px;
--spacing-l: 24px;
--spacing-xl: 32px;
--spacing-xxl: 48px;
--spacing-xxxl: 64px;
```

## Section Styles

### Highlight Section
- Background color: `rgb(250, 250, 248)` (off-white/cream)
- Use with section metadata in markdown:
```markdown
+---------------+---------------+
| **Section Metadata**          |
+---------------+---------------+
| Style         | highlight     |
+---------------+---------------+
```

### Dark Section
- Background: `--background-color-dark` (#343434)
- Text automatically inverts to white

### Black Section
- Background: `--background-color-black` (#191919)
- Even darker variant for emphasis

## Button Styling

### Default Buttons (Light Backgrounds)
```css
/* Base state */
background: transparent;
color: rgba(0, 0, 0, 0.95);
border: 1px solid rgba(0, 0, 0, 0.4);
border-radius: 3rem;  /* Pill shape */

/* Hover state - inverts */
background: rgba(0, 0, 0, 0.95);
color: hsla(0, 0%, 100%, 0.95);
border-color: rgba(0, 0, 0, 0.95);
```

### Inverted Buttons (Dark Backgrounds)
```css
/* Base state */
background-color: rgba(255, 255, 255, 0.95);
color: #1a1a1a;
border: 2px solid rgba(255, 255, 255, 0.95);

/* Hover state */
background-color: hsla(0, 0%, 74.1%, 0.9625);
border-color: hsla(0, 0%, 74.1%, 0.9625);
color: #000;
```

## EDS Authoring Tricks

### Links vs Buttons
- **Link becomes a button**: When a link is alone in its own paragraph
- **Link stays a link**: When inline with other text

Example - Button:
```markdown
[Learn more](https://example.com)
```

Example - Inline link:
```markdown
Our ecosystem helps strengthen safety everywhere. [Learn more](https://example.com)
```

### Edge-to-Edge Blocks
To make a block span full width (no container padding):
```css
main > div:has(.block-name),
main > .section > div:has(.block-name),
main div.block-name-wrapper {
  max-width: 100%;
  padding: 0;
  margin: 0;
}
```

## Block-Specific Patterns

### Carousel Hero
- Full-width with dark gradient overlay
- Overlay gradient: `linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)`
- Content text uses `--text-color-inverse` (0.95 opacity, not 0.6)
- CTA buttons use inverted style (white on dark)
- Slide indicators: white dots, active indicator uses `#00a3e0` (Motorola cyan)
- Navigation arrows: white chevrons, 24-28px size

### Video Thumbnails
- When displaying video content, use the `poster` attribute to show the video thumbnail image
- Brightcove video thumbnails follow pattern: `https://cf-images.us-east-1.prod.boltdns.net/v1/jit/{accountId}/{videoId}/main/1280x720/{timestamp}/match/image.jpg`

## Common Patterns

### Dark Overlay on Images
```css
.element::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.1) 100%
  );
}
```

### Responsive Content Width
```css
/* Mobile */
max-width: 500px;
margin-left: 80px;

/* Tablet (768px+) */
max-width: 55%;
margin-left: 120px;

/* Desktop (1024px+) */
max-width: 60%;
margin-left: 140px;
```

## File Structure

- Global styles: `/styles/styles.css`
- Block CSS: `/blocks/{blockname}/{blockname}.css`
- Block JS: `/blocks/{blockname}/{blockname}.js`
- Content: `/content/{pagename}.md` and `/content/{pagename}.html`
- Images: `/content/images/`

## Reminders

1. **Always read files before editing** - understand existing code structure
2. **Test in preview** - verify changes at localhost:3000
3. **Check hover states** - many elements have specific hover behaviors
4. **Respect existing patterns** - follow established conventions in the codebase
5. **Update this file** - when learning new project-specific patterns or receiving corrections
