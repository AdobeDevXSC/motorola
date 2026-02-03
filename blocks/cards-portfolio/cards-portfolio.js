/**
 * Cards Portfolio Block
 * Product cards displayed below accordion in homepage-portfolio section
 * Visibility controlled by accordion item selection (matched by title)
 */

export default function decorate(block) {
  const rows = [...block.children];

  // Find the title (h2) for matching with accordion
  let title = '';
  const h2 = block.querySelector('h2');
  if (h2) {
    title = h2.textContent.trim();
    block.dataset.category = title;
  }

  // Create card grid
  const grid = document.createElement('div');
  grid.classList.add('cards-portfolio-grid');

  // Process each row as a card (skip h2 row)
  rows.forEach((row) => {
    // Skip if this row contains the h2
    if (row.querySelector('h2')) {
      return;
    }

    const cols = [...row.children];
    if (cols.length === 0) return;

    const card = document.createElement('div');
    card.classList.add('cards-portfolio-card');

    // Find image
    const pic = row.querySelector('picture');
    if (pic) {
      card.append(pic.cloneNode(true));
    }

    // Create content wrapper
    const content = document.createElement('div');
    content.classList.add('cards-portfolio-card-content');

    // Find title (p without link)
    const paragraphs = row.querySelectorAll('p');
    paragraphs.forEach((p) => {
      if (!p.querySelector('a') && p.textContent.trim()) {
        const cardTitle = document.createElement('p');
        cardTitle.classList.add('cards-portfolio-card-title');
        cardTitle.textContent = p.textContent.trim();
        content.append(cardTitle);
      }
    });

    // Find link
    const link = row.querySelector('a');
    if (link) {
      const cardLink = document.createElement('a');
      cardLink.classList.add('cards-portfolio-card-link');
      cardLink.href = link.href;
      cardLink.textContent = 'Learn more';
      content.append(cardLink);
    }

    card.append(content);
    grid.append(card);
  });

  // Clear block and rebuild
  block.innerHTML = '';

  // Keep h2 for reference (hidden via CSS)
  if (h2) {
    block.append(h2);
  }

  block.append(grid);

  // Check if first cards-portfolio in section (should be active by default)
  const section = block.closest('.section');
  if (section) {
    const allCardsPortfolio = section.querySelectorAll('.cards-portfolio');
    if (allCardsPortfolio.length > 0 && allCardsPortfolio[0] === block) {
      block.classList.add('active');
    }
  }
}
