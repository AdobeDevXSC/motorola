/**
 * Accordion Block - Expandable content sections
 * Features:
 * - First item open by default
 * - Only one item open at a time
 * - In homepage-portfolio section: Two-column layout with dynamic image switching
 * - In homepage-portfolio section: Toggle corresponding cards-portfolio blocks
 * - Default: Simple accordion without image column
 */

export default function decorate(block) {
  const rows = [...block.children];

  // Check if accordion is in a homepage-portfolio section
  const section = block.closest('.section');
  const isPortfolioLayout = section && section.classList.contains('homepage-portfolio');

  // Create wrapper structure
  const wrapper = document.createElement('div');
  wrapper.classList.add('accordion-wrapper');

  // Left column: accordion items
  const accordionColumn = document.createElement('div');
  accordionColumn.classList.add('accordion-column');

  // Right column: images (only for portfolio layout)
  let imageColumn = null;
  if (isPortfolioLayout) {
    imageColumn = document.createElement('div');
    imageColumn.classList.add('accordion-image-column');
  }

  // Store titles for cards-portfolio matching
  const itemTitles = [];

  // Process each row into accordion items
  const accordionItems = rows.map((row, index) => {
    const cols = [...row.children];
    const item = document.createElement('div');
    item.classList.add('accordion-item');
    item.dataset.index = index;

    // Find content and image columns
    let contentCol = null;
    let imageCol = null;

    cols.forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        imageCol = col;
      } else {
        contentCol = col;
      }
    });

    // Parse content from content column
    if (contentCol) {
      const paragraphs = [...contentCol.querySelectorAll('p')];
      const h3El = contentCol.querySelector('h3');
      const strongEl = contentCol.querySelector('strong');
      const linkEl = contentCol.querySelector('a');

      // Get title from H3, first strong text, or first paragraph
      let title = '';
      let subtitle = '';
      let description = '';

      if (h3El) {
        // Prefer H3 as title
        title = h3El.textContent;
      } else if (strongEl && !strongEl.querySelector('a')) {
        title = strongEl.textContent;
        // Remove the title element from further processing
        const titleParagraph = strongEl.closest('p');
        if (titleParagraph) {
          paragraphs.splice(paragraphs.indexOf(titleParagraph), 1);
        }
      } else if (paragraphs.length > 0) {
        const firstP = paragraphs[0];
        const firstStrong = firstP.querySelector('strong');
        if (firstStrong && !firstStrong.querySelector('a')) {
          title = firstStrong.textContent;
          paragraphs.shift();
        } else {
          title = firstP.textContent;
          paragraphs.shift();
        }
      }

      // Next strong is subtitle, rest is description
      paragraphs.forEach((p) => {
        const pStrong = p.querySelector('strong');
        if (pStrong && !pStrong.querySelector('a') && !subtitle) {
          subtitle = pStrong.textContent;
        } else if (!p.querySelector('a')) {
          if (description) description += ' ';
          description += p.textContent;
        }
      });

      // Create accordion header
      const header = document.createElement('div');
      header.classList.add('accordion-header');

      const titleEl = document.createElement('h3');
      titleEl.classList.add('accordion-title');
      titleEl.textContent = title;

      // Store title for cards-portfolio matching
      itemTitles[index] = title;
      item.dataset.title = title;

      const iconEl = document.createElement('span');
      iconEl.classList.add('accordion-icon');

      header.append(titleEl, iconEl);

      // Create accordion content
      const content = document.createElement('div');
      content.classList.add('accordion-content');

      const contentInner = document.createElement('div');
      contentInner.classList.add('accordion-content-inner');

      if (subtitle) {
        const subtitleEl = document.createElement('p');
        subtitleEl.classList.add('accordion-subtitle');
        subtitleEl.textContent = subtitle;
        contentInner.append(subtitleEl);
      }

      if (description) {
        const descEl = document.createElement('p');
        descEl.classList.add('accordion-description');
        descEl.textContent = description;
        contentInner.append(descEl);
      }

      if (linkEl) {
        const link = document.createElement('a');
        link.classList.add('accordion-link');
        link.href = linkEl.href;
        link.textContent = linkEl.textContent;
        contentInner.append(link);
      }

      content.append(contentInner);
      item.append(header, content);
    }

    // Extract image for portfolio layout only
    if (isPortfolioLayout && imageCol && imageColumn) {
      const pic = imageCol.querySelector('picture');
      if (pic) {
        const imageWrapper = document.createElement('div');
        imageWrapper.classList.add('accordion-image');
        imageWrapper.dataset.index = index;
        imageWrapper.append(pic.cloneNode(true));

        // First image is visible by default
        if (index === 0) {
          imageWrapper.classList.add('active');
        }

        imageColumn.append(imageWrapper);
      }
    }

    // First item expanded by default
    if (index === 0) {
      item.classList.add('expanded');
    }

    return item;
  });

  // Add accordion items to column
  accordionItems.forEach((item) => accordionColumn.append(item));

  // Build the wrapper structure
  wrapper.append(accordionColumn);
  if (isPortfolioLayout && imageColumn) {
    wrapper.append(imageColumn);
  }

  // Clear block and add the wrapper
  block.innerHTML = '';
  block.append(wrapper);

  // Helper function to show corresponding cards-portfolio block
  const showCardsPortfolio = (title) => {
    if (!section) return;

    // Find all cards-portfolio blocks in this section
    const cardsBlocks = section.querySelectorAll('.cards-portfolio');
    cardsBlocks.forEach((cardsBlock) => {
      const cardsTitle = cardsBlock.dataset.category || '';
      if (cardsTitle === title) {
        cardsBlock.classList.add('active');
      } else {
        cardsBlock.classList.remove('active');
      }
    });
  };

  // Initialize cards-portfolio visibility for first item
  if (isPortfolioLayout && itemTitles[0]) {
    // Delay to ensure cards-portfolio blocks are decorated
    setTimeout(() => showCardsPortfolio(itemTitles[0]), 100);
  }

  // Add click handlers for accordion behavior
  block.querySelectorAll('.accordion-header').forEach((header) => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isExpanded = item.classList.contains('expanded');
      const itemIndex = item.dataset.index;
      const itemTitle = item.dataset.title;

      // Close all items (only one open at a time)
      block.querySelectorAll('.accordion-item').forEach((i) => {
        i.classList.remove('expanded');
      });

      // Toggle clicked item (open if it was closed)
      if (!isExpanded) {
        item.classList.add('expanded');

        // Show corresponding image (portfolio layout only)
        if (isPortfolioLayout) {
          // Hide all images
          block.querySelectorAll('.accordion-image').forEach((img) => {
            img.classList.remove('active');
          });

          const correspondingImage = block.querySelector(`.accordion-image[data-index="${itemIndex}"]`);
          if (correspondingImage) {
            correspondingImage.classList.add('active');
          }

          // Show corresponding cards-portfolio block
          showCardsPortfolio(itemTitle);
        }
      }
    });
  });
}
