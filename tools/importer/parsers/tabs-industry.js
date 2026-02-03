/**
 * Parser for tabs-industry block variant
 * Converts tabbed content sections into EDS block table format
 */

export default function parse(element, { document }) {
  const cells = [];

  // Find tab buttons/labels
  const tabButtons = element.querySelectorAll(
    '[role="tab"], .tab-button, [class*="tab-label"], button[id^="tab-"]'
  );

  // Find tab panels
  const tabPanels = element.querySelectorAll(
    '[role="tabpanel"], .tab-panel, .tab-content, [id^="panel-"]'
  );

  // Match tabs with panels
  tabButtons.forEach((tab, index) => {
    const tabLabel = tab.textContent.trim();
    const panel = tabPanels[index];

    if (tabLabel && panel) {
      // Create content cell from panel
      const contentCell = document.createElement('div');

      // Extract panel content
      const panelHeading = panel.querySelector('h2, h3, h4, [class*="title"]');
      if (panelHeading) {
        const h3 = document.createElement('h3');
        h3.textContent = panelHeading.textContent.trim();
        contentCell.appendChild(h3);
      }

      const panelText = panel.querySelector('p, [class*="description"]');
      if (panelText) {
        const p = document.createElement('p');
        p.textContent = panelText.textContent.trim();
        contentCell.appendChild(p);
      }

      // Extract links from panel
      const links = panel.querySelectorAll('a');
      links.forEach((link) => {
        if (link.textContent.trim()) {
          const a = document.createElement('a');
          a.href = link.href;
          a.textContent = link.textContent.trim();
          contentCell.appendChild(a);
          contentCell.appendChild(document.createElement('br'));
        }
      });

      cells.push([tabLabel, contentCell]);
    }
  });

  // Create the block if we have content
  if (cells.length > 0) {
    const block = WebImporter.Blocks.createBlock(document, {
      name: 'Tabs-Industry',
      cells: cells
    });
    element.replaceWith(block);
  }
}
