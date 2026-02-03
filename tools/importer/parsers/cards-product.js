/**
 * Parser for cards-product block variant
 * Converts product card grids into EDS block table format
 */

export default function parse(element, { document }) {
  const cells = [];

  // Find all card items
  const cards = element.querySelectorAll(
    '.card, [class*="product-card"], [class*="feature-card"], article'
  );

  cards.forEach((card) => {
    // Extract image
    const img = card.querySelector('img');
    let imageCell = '';
    if (img) {
      const image = document.createElement('img');
      image.src = img.src;
      image.alt = img.alt || '';
      imageCell = image;
    }

    // Extract content
    const contentCell = document.createElement('div');

    // Title
    const title = card.querySelector('h2, h3, h4, [class*="title"], [class*="heading"]');
    if (title) {
      const heading = document.createElement('h3');
      heading.innerHTML = `<strong>${title.textContent.trim()}</strong>`;
      contentCell.appendChild(heading);
    }

    // Description
    const desc = card.querySelector('p, [class*="description"], [class*="text"]');
    if (desc && desc !== title) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      contentCell.appendChild(p);
    }

    // CTA link
    const cta = card.querySelector('a');
    if (cta) {
      const link = document.createElement('a');
      link.href = cta.href;
      link.textContent = cta.textContent.trim() || 'Learn more';
      contentCell.appendChild(link);
    }

    if (imageCell || contentCell.children.length > 0) {
      cells.push([imageCell, contentCell]);
    }
  });

  // Create the block if we have content
  if (cells.length > 0) {
    const block = WebImporter.Blocks.createBlock(document, {
      name: 'Cards-Product',
      cells: cells
    });
    element.replaceWith(block);
  }
}
