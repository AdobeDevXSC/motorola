/**
 * Parser for columns-portfolio block variant
 * Converts side-by-side content layouts into EDS block table format
 */

export default function parse(element, { document }) {
  const cells = [];

  // Find column containers
  const columns = element.querySelectorAll(
    '.col, [class*="column"], [class*="col-md"], [class*="col-lg"]'
  );

  if (columns.length >= 2) {
    const row = [];

    columns.forEach((column) => {
      const cellContent = document.createElement('div');

      // Extract headings
      const headings = column.querySelectorAll('h1, h2, h3, h4');
      headings.forEach((h) => {
        const heading = document.createElement(h.tagName.toLowerCase());
        heading.textContent = h.textContent.trim();
        cellContent.appendChild(heading);
      });

      // Extract paragraphs
      const paragraphs = column.querySelectorAll('p');
      paragraphs.forEach((p) => {
        if (p.textContent.trim()) {
          const para = document.createElement('p');
          para.textContent = p.textContent.trim();
          cellContent.appendChild(para);
        }
      });

      // Extract images
      const images = column.querySelectorAll('img');
      images.forEach((img) => {
        const image = document.createElement('img');
        image.src = img.src;
        image.alt = img.alt || '';
        cellContent.appendChild(image);
      });

      // Extract links/CTAs
      const links = column.querySelectorAll('a');
      links.forEach((link) => {
        if (link.textContent.trim()) {
          const a = document.createElement('a');
          a.href = link.href;
          a.textContent = link.textContent.trim();
          cellContent.appendChild(a);
        }
      });

      row.push(cellContent);
    });

    if (row.length > 0) {
      cells.push(row);
    }
  }

  // Create the block if we have content
  if (cells.length > 0) {
    const block = WebImporter.Blocks.createBlock(document, {
      name: 'Columns-Portfolio',
      cells: cells
    });
    element.replaceWith(block);
  }
}
