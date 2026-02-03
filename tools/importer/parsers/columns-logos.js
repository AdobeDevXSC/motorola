/**
 * Parser for columns-logos block variant
 * Converts logo row displays into EDS block table format
 */

export default function parse(element, { document }) {
  const cells = [];
  const row = [];

  // Find all logo images
  const logos = element.querySelectorAll('img');

  logos.forEach((logo) => {
    if (logo.src && !logo.src.includes('data:image/svg+xml')) {
      const img = document.createElement('img');
      img.src = logo.src;
      img.alt = logo.alt || 'Partner logo';
      row.push(img);
    }
  });

  // If we found logos, create a single row with all logos
  if (row.length > 0) {
    cells.push(row);

    const block = WebImporter.Blocks.createBlock(document, {
      name: 'Columns-Logos',
      cells: cells
    });
    element.replaceWith(block);
  }
}
