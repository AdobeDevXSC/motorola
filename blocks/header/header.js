import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

let activeProductsPanel = null;

function closeMegaMenu() {
  const megaMenu = document.querySelector('.mega-menu');
  if (megaMenu) {
    megaMenu.classList.remove('open');
    megaMenu.querySelectorAll('.mega-menu-content').forEach((content) => {
      content.classList.remove('active');
    });
  }
  // Reset nav item states
  document.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((li) => {
    li.setAttribute('aria-expanded', 'false');
  });
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    closeMegaMenu();
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnClickOutside(e) {
  const megaMenu = document.querySelector('.mega-menu');
  const navSections = document.querySelector('.nav-sections');
  if (megaMenu && !megaMenu.contains(e.target) && !navSections.contains(e.target)) {
    closeMegaMenu();
  }
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    document.addEventListener('click', closeOnClickOutside);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    document.removeEventListener('click', closeOnClickOutside);
  }
}

/**
 * Builds the Products mega menu panel with sub-sections
 */
function buildProductsMegaMenu(nav, container) {
  // Find the Products menu div (has h2 "Products")
  const productsDiv = Array.from(nav.querySelectorAll(':scope > div'))
    .find((div) => div.querySelector('h2')?.textContent.trim() === 'Products');
  if (!productsDiv) return;

  // Find sub-section divs (Technologies, Use cases, Radio, Software, Video security, Services)
  const subSectionDivs = {};
  nav.querySelectorAll(':scope > div').forEach((div) => {
    const h3 = div.querySelector('h3');
    if (h3) {
      subSectionDivs[h3.textContent.trim()] = div;
    }
  });

  const content = document.createElement('div');
  content.className = 'mega-menu-content mega-products';
  content.dataset.menu = 'products';

  // Left navigation
  const leftNav = document.createElement('div');
  leftNav.className = 'mega-menu-products-nav';

  // Parse the Products structure
  const productsList = productsDiv.querySelector('ul');
  if (productsList) {
    productsList.querySelectorAll(':scope > li').forEach((li) => {
      const categoryTitle = li.childNodes[0].textContent.trim();
      const subUl = li.querySelector('ul');

      const categoryH3 = document.createElement('h3');
      categoryH3.textContent = categoryTitle;
      leftNav.appendChild(categoryH3);

      if (subUl) {
        const navUl = document.createElement('ul');
        subUl.querySelectorAll(':scope > li').forEach((subLi, index) => {
          const navItem = document.createElement('li');
          const itemText = subLi.textContent.trim();
          const itemLink = subLi.querySelector('a');

          if (itemLink) {
            // It's a link item (like "View all products")
            const link = document.createElement('a');
            link.href = itemLink.href;
            link.textContent = itemLink.textContent;
            navItem.appendChild(link);
          } else {
            // It's a category trigger
            navItem.textContent = itemText;
            navItem.dataset.panel = itemText.toLowerCase().replace(/\s+/g, '-');
            if (index === 0 && categoryTitle === 'Safety & Security Ecosystem') {
              navItem.classList.add('active');
              activeProductsPanel = navItem.dataset.panel;
            }
          }
          navUl.appendChild(navItem);
        });
        leftNav.appendChild(navUl);
      }
    });
  }

  content.appendChild(leftNav);

  // Right content area
  const rightContent = document.createElement('div');
  rightContent.className = 'mega-menu-products-content';

  // Build panels for each sub-section
  Object.entries(subSectionDivs).forEach(([title, div]) => {
    const panel = document.createElement('div');
    panel.className = 'mega-menu-panel';
    panel.dataset.panel = title.toLowerCase().replace(/\s+/g, '-');
    if (panel.dataset.panel === activeProductsPanel) {
      panel.classList.add('active');
    }

    const ul = div.querySelector('ul');
    if (!ul) return;

    const items = ul.querySelectorAll(':scope > li');

    // Check if this is a Technologies/Use cases style panel (first item is intro)
    if (title === 'Technologies' || title === 'Use cases') {
      panel.classList.add('ecosystem-panel');

      // First item is intro
      const introItem = items[0];
      if (introItem) {
        const intro = document.createElement('div');
        intro.className = 'mega-menu-panel-intro';

        const strong = introItem.querySelector('strong');
        if (strong) {
          const h4 = document.createElement('h4');
          h4.textContent = strong.textContent;
          intro.appendChild(h4);
        }

        // Get the text after strong
        const textContent = introItem.textContent.replace(strong?.textContent || '', '').trim();
        const linkEl = introItem.querySelector('a');
        const text = linkEl ? textContent.replace(linkEl.textContent, '').trim() : textContent;

        if (text) {
          const p = document.createElement('p');
          p.textContent = text;
          intro.appendChild(p);
        }

        if (linkEl) {
          const link = document.createElement('a');
          link.href = linkEl.href;
          link.textContent = linkEl.textContent;
          intro.appendChild(link);
        }

        panel.appendChild(intro);
      }

      // Grid for remaining items
      const grid = document.createElement('div');
      grid.className = 'mega-menu-panel-grid';

      Array.from(items).slice(1).forEach((item, index) => {
        const gridItem = document.createElement('div');
        gridItem.className = 'mega-menu-panel-grid-item';

        // Add icon for Technologies (4 items with icons)
        if (title === 'Technologies' && index < 4) {
          const iconMap = {
            0: 'technology-critical-communications.svg',
            1: 'technology-command-center-software.svg',
            2: 'technology-video-security-access-control.svg',
            3: 'technology-managed-support-services.svg',
          };
          const img = document.createElement('img');
          img.src = `/icons/${iconMap[index]}`;
          img.alt = '';
          gridItem.appendChild(img);
        }

        const textDiv = document.createElement('div');
        textDiv.className = 'mega-menu-panel-grid-item-text';

        const strong = item.querySelector('strong');
        const strongEl = document.createElement('strong');
        const linkInStrong = strong?.querySelector('a');

        if (linkInStrong) {
          const a = document.createElement('a');
          a.href = linkInStrong.href;
          a.textContent = linkInStrong.textContent;
          strongEl.appendChild(a);
        } else if (strong) {
          strongEl.textContent = strong.textContent;
        }
        textDiv.appendChild(strongEl);

        // Get description text
        const fullText = item.textContent;
        const strongText = strong?.textContent || '';
        const description = fullText.replace(strongText, '').trim();
        if (description) {
          const span = document.createElement('span');
          span.textContent = description;
          textDiv.appendChild(span);
        }

        gridItem.appendChild(textDiv);
        grid.appendChild(gridItem);
      });

      panel.appendChild(grid);
    } else {
      // Radio, Software, Video security, Services - multi-column layout
      const columns = document.createElement('div');
      columns.className = 'mega-menu-columns';

      items.forEach((item) => {
        const column = document.createElement('div');
        column.className = 'mega-menu-column';

        // Column title
        const titleText = item.childNodes[0].textContent.trim();
        const titleLink = item.querySelector(':scope > a');
        const h4 = document.createElement('h4');

        if (titleLink && titleLink.parentElement === item) {
          const a = document.createElement('a');
          a.href = titleLink.href;
          a.textContent = titleLink.textContent;
          h4.appendChild(a);
        } else {
          h4.textContent = titleText;
        }
        column.appendChild(h4);

        // Column items
        const subUl = item.querySelector('ul');
        if (subUl) {
          const newUl = document.createElement('ul');
          subUl.querySelectorAll(':scope > li').forEach((subLi) => {
            const li = document.createElement('li');
            const link = subLi.querySelector('a');
            if (link) {
              const a = document.createElement('a');
              a.href = link.href;
              a.textContent = link.textContent;
              li.appendChild(a);
            } else {
              li.textContent = subLi.textContent;
            }
            newUl.appendChild(li);
          });
          column.appendChild(newUl);
        }

        columns.appendChild(column);
      });

      panel.appendChild(columns);
    }

    rightContent.appendChild(panel);
  });

  content.appendChild(rightContent);
  container.appendChild(content);

  // Wire up panel switching
  leftNav.querySelectorAll('li[data-panel]').forEach((navItem) => {
    navItem.addEventListener('click', () => {
      leftNav.querySelectorAll('li').forEach((li) => li.classList.remove('active'));
      navItem.classList.add('active');

      rightContent.querySelectorAll('.mega-menu-panel').forEach((p) => p.classList.remove('active'));
      const targetPanel = rightContent.querySelector(`[data-panel="${navItem.dataset.panel}"]`);
      if (targetPanel) {
        targetPanel.classList.add('active');
        activeProductsPanel = navItem.dataset.panel;
      }
    });
  });
}

/**
 * Builds the Industries mega menu panel
 */
function buildIndustriesMegaMenu(nav, container) {
  const industriesDiv = Array.from(nav.querySelectorAll(':scope > div'))
    .find((div) => div.querySelector('h2')?.textContent.trim() === 'Industries');
  if (!industriesDiv) return;

  // Map industry names to icon files
  const industryIcons = {
    Corrections: 'industry-corrections.svg',
    Education: 'industry-education.svg',
    'Fire & EMS': 'industry-fire-ems.svg',
    Healthcare: 'industry-healthcare.svg',
    Hospitality: 'industry-hospitality.svg',
    'Law Enforcement': 'industry-law-enforcement.svg',
    Manufacturing: 'industry-manufacturing.svg',
    Mining: 'industry-mining.svg',
    'U.S. Federal Government': 'industry-us-federal-government.svg',
    Military: 'industry-military.svg',
    'Oil & Gas': 'industry-oil-gas.svg',
    Retail: 'industry-retail.svg',
    'Transportation & Logistics': 'industry-transportation-logistics.svg',
    Utilities: 'industry-utilities.svg',
    Stadiums: 'industry-stadiums.svg',
  };

  const content = document.createElement('div');
  content.className = 'mega-menu-content mega-industries';
  content.dataset.menu = 'industries';

  // Main section (title + grid)
  const main = document.createElement('div');
  main.className = 'mega-menu-industries-main';

  const title = document.createElement('h3');
  title.className = 'mega-menu-industries-title';
  title.textContent = 'Industries';
  main.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'mega-menu-industries-grid';

  // Featured section (sidebar)
  const featured = document.createElement('div');
  featured.className = 'mega-menu-industries-featured';

  const ul = industriesDiv.querySelector('ul');
  if (ul) {
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const link = li.querySelector('a');
      const strong = li.querySelector('strong');

      if (strong) {
        // Featured item with description
        const item = document.createElement('div');
        item.className = 'mega-menu-industries-featured-item';

        const strongEl = document.createElement('strong');
        const linkInStrong = strong.querySelector('a');
        if (linkInStrong) {
          const a = document.createElement('a');
          a.href = linkInStrong.href;
          a.textContent = linkInStrong.textContent;
          strongEl.appendChild(a);
        } else {
          strongEl.textContent = strong.textContent;
        }
        item.appendChild(strongEl);

        const description = li.textContent.replace(strong.textContent, '').trim();
        if (description) {
          const p = document.createElement('p');
          p.textContent = description;
          item.appendChild(p);
        }

        featured.appendChild(item);
      } else if (link) {
        // Industry link with icon
        const a = document.createElement('a');
        a.href = link.href;

        const iconName = industryIcons[link.textContent.trim()];
        if (iconName) {
          const img = document.createElement('img');
          img.src = `/icons/${iconName}`;
          img.alt = '';
          a.appendChild(img);
        }

        const span = document.createElement('span');
        span.textContent = link.textContent;
        a.appendChild(span);

        grid.appendChild(a);
      }
    });
  }

  main.appendChild(grid);
  content.appendChild(main);
  content.appendChild(featured);
  container.appendChild(content);
}

/**
 * Builds the About us mega menu panel
 */
function buildAboutMegaMenu(nav, container) {
  const aboutDiv = Array.from(nav.querySelectorAll(':scope > div'))
    .find((div) => div.querySelector('h2')?.textContent.trim() === 'About us');
  if (!aboutDiv) return;

  // Map social network names to icon files
  const socialIcons = {
    LinkedIn: 'social-linkedin.svg',
    Facebook: 'social-facebook.svg',
    X: 'social-x.svg',
    Instagram: 'social-instagram.svg',
    YouTube: 'social-youtube.svg',
  };

  const content = document.createElement('div');
  content.className = 'mega-menu-content mega-about';
  content.dataset.menu = 'about-us';

  const ul = aboutDiv.querySelector('ul');
  if (ul) {
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const column = document.createElement('div');
      column.className = 'mega-menu-about-column';

      const title = li.childNodes[0].textContent.trim();
      const isSocialColumn = title.toLowerCase().includes('social');

      if (isSocialColumn) {
        column.classList.add('social');
      }

      const h4 = document.createElement('h4');
      h4.textContent = title;
      column.appendChild(h4);

      const subUl = li.querySelector('ul');
      if (subUl) {
        const newUl = document.createElement('ul');
        subUl.querySelectorAll(':scope > li').forEach((subLi) => {
          const newLi = document.createElement('li');
          const link = subLi.querySelector('a');
          if (link) {
            const a = document.createElement('a');
            a.href = link.href;

            // Add social icon if this is the social column
            if (isSocialColumn) {
              const iconName = socialIcons[link.textContent.trim()];
              if (iconName) {
                const img = document.createElement('img');
                img.src = `/icons/${iconName}`;
                img.alt = '';
                a.appendChild(img);
              }
            }

            const span = document.createElement('span');
            span.textContent = link.textContent;
            a.appendChild(span);

            newLi.appendChild(a);
          } else {
            newLi.textContent = subLi.textContent;
          }
          newUl.appendChild(newLi);
        });
        column.appendChild(newUl);
      }

      content.appendChild(column);
    });

    // Add empty fourth column for spacing
    const emptyColumn = document.createElement('div');
    emptyColumn.className = 'mega-menu-about-column';
    content.appendChild(emptyColumn);
  }

  container.appendChild(content);
}

/**
 * Builds the primary tools (Search, Support, Cart) with icons added programmatically
 */
function buildPrimaryTools(toolsDiv) {
  const primaryTools = document.createElement('div');
  primaryTools.className = 'nav-primary-tools';

  const ul = document.createElement('ul');

  // Icon mapping for tools
  const iconMap = {
    Search: 'header-search.svg',
    Support: 'header-support.svg',
    Cart: 'header-cart.svg',
    'Sign In': 'header-user.svg',
  };

  const toolsList = toolsDiv.querySelector('ul');
  if (toolsList) {
    toolsList.querySelectorAll(':scope > li').forEach((li) => {
      const link = li.querySelector('a');
      const text = link ? link.textContent.trim() : li.textContent.trim();

      if (text === 'Search') {
        // Build search form programmatically
        const searchLi = document.createElement('li');
        const searchForm = document.createElement('form');
        searchForm.className = 'search-form';
        searchForm.action = '/search';
        searchForm.method = 'get';

        const searchInput = document.createElement('input');
        searchInput.type = 'search';
        searchInput.name = 'q';
        searchInput.placeholder = text; // Use the text for translation
        searchInput.autocomplete = 'off';

        const searchButton = document.createElement('button');
        searchButton.type = 'submit';
        searchButton.setAttribute('aria-label', text);

        const searchIcon = document.createElement('img');
        searchIcon.src = `/icons/${iconMap.Search}`;
        searchIcon.alt = '';
        searchButton.appendChild(searchIcon);

        searchForm.appendChild(searchInput);
        searchForm.appendChild(searchButton);
        searchLi.appendChild(searchForm);
        ul.appendChild(searchLi);
      } else {
        // Regular tool item with icon
        const newLi = document.createElement('li');
        const a = document.createElement('a');
        a.href = link ? link.href : '#';

        // Add icon
        const iconName = iconMap[text];
        if (iconName) {
          const icon = document.createElement('img');
          icon.src = `/icons/${iconName}`;
          icon.alt = '';
          a.appendChild(icon);
        }

        // Add text
        const span = document.createElement('span');
        span.textContent = text;
        a.appendChild(span);

        newLi.appendChild(a);
        ul.appendChild(newLi);
      }
    });
  }

  primaryTools.appendChild(ul);
  return primaryTools;
}

/**
 * Builds the nav sections (Sign In, Products, Industries, About us) and tools (Contact sales)
 */
function buildNavSectionsAndTools(sectionsDiv) {
  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';

  const navTools = document.createElement('div');
  navTools.className = 'nav-tools';

  const wrapper = document.createElement('div');
  wrapper.className = 'default-content-wrapper';

  const ul = document.createElement('ul');

  const sectionsList = sectionsDiv.querySelector('ul');
  if (sectionsList) {
    sectionsList.querySelectorAll(':scope > li').forEach((li) => {
      const text = li.textContent.trim();

      const newLi = document.createElement('li');
      // Products, Industries, About us - just text, will be wired to mega menu
      newLi.textContent = text;

      ul.appendChild(newLi);
    });
  }

  wrapper.appendChild(ul);
  navSections.appendChild(wrapper);

  // Contact sales button
  const contactP = sectionsDiv.querySelector('p');
  if (contactP) {
    const contactLink = contactP.querySelector('a');
    if (contactLink) {
      const toolsUl = document.createElement('ul');
      const toolsLi = document.createElement('li');
      const a = document.createElement('a');
      a.href = contactLink.href;
      a.textContent = contactLink.textContent;
      toolsLi.appendChild(a);
      toolsUl.appendChild(toolsLi);
      navTools.appendChild(toolsUl);
    }
  }

  return { navSections, navTools };
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Find sections by h2 headings
  const allDivs = Array.from(nav.querySelectorAll(':scope > div'));

  // First div is brand (logo)
  const brandDiv = allDivs[0];
  if (brandDiv) {
    brandDiv.className = 'nav-brand';
    const brandLink = brandDiv.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      brandLink.closest('.button-container').className = '';
    }
  }

  // Find Tools and Sections divs by h2
  let toolsDiv = null;
  let sectionsDiv = null;

  allDivs.forEach((div) => {
    const h2 = div.querySelector('h2');
    if (h2) {
      const heading = h2.textContent.trim();
      if (heading === 'Tools') {
        toolsDiv = div;
      } else if (heading === 'Sections') {
        sectionsDiv = div;
      }
    }
  });

  // Build primary tools (Search, Support, Cart)
  let navPrimaryTools = null;
  if (toolsDiv) {
    navPrimaryTools = buildPrimaryTools(toolsDiv);
    // Remove original div
    toolsDiv.remove();
  }

  // Build nav sections (Sign In, Products, Industries, About us) and tools (Contact sales)
  let navSections = null;
  let navTools = null;
  if (sectionsDiv) {
    const result = buildNavSectionsAndTools(sectionsDiv);
    navSections = result.navSections;
    navTools = result.navTools;
    // Remove original div
    sectionsDiv.remove();
  }

  // Insert built elements after brand
  if (navPrimaryTools) {
    brandDiv.after(navPrimaryTools);
  }
  if (navSections && navPrimaryTools) {
    navPrimaryTools.after(navSections);
  }
  if (navTools && navSections) {
    navSections.after(navTools);
  }

  // Build mega menu container
  const megaMenu = document.createElement('div');
  megaMenu.className = 'mega-menu';

  buildProductsMegaMenu(nav, megaMenu);
  buildIndustriesMegaMenu(nav, megaMenu);
  buildAboutMegaMenu(nav, megaMenu);

  // Wire up nav section clicks to mega menu
  if (navSections) {
    const menuMap = {
      Products: 'products',
      Industries: 'industries',
      'About us': 'about-us',
    };

    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      const menuName = navSection.textContent.trim();
      const menuKey = menuMap[menuName];

      navSection.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isDesktop.matches) return;

        const isExpanded = navSection.getAttribute('aria-expanded') === 'true';

        // Close all sections first
        navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((li) => {
          li.setAttribute('aria-expanded', 'false');
        });

        if (isExpanded) {
          // Close the mega menu
          closeMegaMenu();
        } else {
          // Open the appropriate mega menu
          navSection.setAttribute('aria-expanded', 'true');

          megaMenu.querySelectorAll('.mega-menu-content').forEach((content) => {
            content.classList.remove('active');
          });

          const targetContent = megaMenu.querySelector(`[data-menu="${menuKey}"]`);
          if (targetContent) {
            targetContent.classList.add('active');
            megaMenu.classList.add('open');
          }
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, navSections, isDesktop.matches);
    closeMegaMenu();
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  navWrapper.append(megaMenu);
  block.append(navWrapper);
}
