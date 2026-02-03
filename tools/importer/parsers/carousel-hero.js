/**
 * Parser for carousel-hero block variant
 * Converts hero carousel sections into EDS block table format
 */

export default function parse(element, { document }) {
  const cells = [];

  // Find all carousel slides
  const slides = element.querySelectorAll('.slick-slide:not(.slick-cloned), [class*="slide"]');

  slides.forEach((slide) => {
    // Extract background image
    const bgImage = slide.querySelector('img, [style*="background-image"]');
    let imageCell = '';

    if (bgImage) {
      if (bgImage.tagName === 'IMG') {
        imageCell = bgImage.cloneNode(true);
      } else {
        const style = bgImage.getAttribute('style') || '';
        const urlMatch = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
        if (urlMatch) {
          const img = document.createElement('img');
          img.src = urlMatch[1];
          imageCell = img;
        }
      }
    }

    // Extract content (heading, description, CTA)
    const contentCell = document.createElement('div');

    const heading = slide.querySelector('h1, h2, h3, [class*="title"], [class*="heading"]');
    if (heading) {
      const h2 = document.createElement('h2');
      h2.textContent = heading.textContent.trim();
      contentCell.appendChild(h2);
    }

    const description = slide.querySelector('p, [class*="description"], [class*="text"]');
    if (description && description !== heading) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      contentCell.appendChild(p);
    }

    const cta = slide.querySelector('a.btn, a[class*="cta"], a[class*="button"]');
    if (cta) {
      const link = document.createElement('a');
      link.href = cta.href;
      link.textContent = cta.textContent.trim();
      contentCell.appendChild(link);
    }

    if (imageCell || contentCell.children.length > 0) {
      cells.push([imageCell || '', contentCell]);
    }
  });

  // Create the block if we have content
  if (cells.length > 0) {
    const block = WebImporter.Blocks.createBlock(document, {
      name: 'Carousel-Hero',
      cells: cells
    });
    element.replaceWith(block);
  }
}
