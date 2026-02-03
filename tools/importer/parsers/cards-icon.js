/**
 * Parser for cards-icon block variant
 * Converts icon link grids into EDS block table format
 */

export default function parse(element, { document }) {
  const cells = [];

  // Find all icon link items
  const items = element.querySelectorAll(
    'a, [class*="icon-link"], [class*="quick-link"], li'
  );

  items.forEach((item) => {
    // Extract icon image
    const icon = item.querySelector('img, svg, [class*="icon"]');
    let iconCell = '';

    if (icon) {
      if (icon.tagName === 'IMG') {
        const img = document.createElement('img');
        img.src = icon.src;
        img.alt = icon.alt || '';
        iconCell = img;
      } else if (icon.tagName === 'SVG') {
        // Convert SVG to placeholder or skip
        iconCell = '';
      }
    }

    // Extract label text
    const labelText = item.textContent.trim();
    const link = item.tagName === 'A' ? item : item.querySelector('a');

    if (labelText) {
      const labelCell = document.createElement('div');

      if (link) {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = labelText;
        labelCell.appendChild(a);
      } else {
        labelCell.textContent = labelText;
      }

      cells.push([iconCell, labelCell]);
    }
  });

  // Create the block if we have content
  if (cells.length > 0) {
    const block = WebImporter.Blocks.createBlock(document, {
      name: 'Cards-Icon',
      cells: cells
    });
    element.replaceWith(block);
  }
}
