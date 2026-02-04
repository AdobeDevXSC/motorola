/**
 * Carousel Cards Block
 * Manual-only carousel with fixed intro panel on left
 */

const placeholders = {
  carousel: 'Carousel',
  carouselSlideControls: 'Carousel Slide Controls',
  previousSlide: 'Previous Slide',
  nextSlide: 'Next Slide',
  showSlide: 'Show Slide',
  of: 'of',
};

// Flag to track programmatic scrolling (prevents IntersectionObserver conflicts)
let isProgrammaticScroll = false;

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-cards-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  // Set flag to prevent IntersectionObserver from interfering
  isProgrammaticScroll = true;

  // Update active slide index
  block.dataset.activeSlide = realSlideIndex;

  // Update indicators immediately
  const indicators = block.querySelectorAll('.carousel-cards-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const btn = indicator.querySelector('button');
    if (idx !== realSlideIndex) {
      btn.removeAttribute('disabled');
    } else {
      btn.setAttribute('disabled', 'true');
    }
  });

  // Update aria-hidden for accessibility
  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== realSlideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== realSlideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  // Scroll to the slide
  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-cards-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });

  // Reset flag after scroll animation completes
  setTimeout(() => {
    isProgrammaticScroll = false;
  }, 500);
}

function updateIndicatorsFromScroll(block, slideIndex) {
  // Only update if this wasn't triggered by programmatic scroll
  if (isProgrammaticScroll) return;

  block.dataset.activeSlide = slideIndex;

  const indicators = block.querySelectorAll('.carousel-cards-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const btn = indicator.querySelector('button');
    if (idx !== slideIndex) {
      btn.removeAttribute('disabled');
    } else {
      btn.setAttribute('disabled', 'true');
    }
  });

  // Update aria-hidden
  const slides = block.querySelectorAll('.carousel-cards-slide');
  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-cards-slide-indicators');
  if (!slideIndicators) return;

  // Dot indicator clicks
  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  // Previous/Next button clicks
  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  // Touch swipe support
  let touchStartX = 0;
  block.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  block.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
      } else {
        showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
      }
    }
  }, { passive: true });

  // IntersectionObserver for manual scroll detection (when user drags/scrolls directly)
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        const slideIndex = parseInt(entry.target.dataset.slideIndex, 10);
        updateIndicatorsFromScroll(block, slideIndex);
      }
    });
  }, { threshold: 0.5 });

  block.querySelectorAll('.carousel-cards-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-cards-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-cards-slide');

  const cols = [...row.children];

  // First column: image
  if (cols[0]) {
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('carousel-cards-slide-image');

    const picture = cols[0].querySelector('picture');
    if (picture) {
      imageWrapper.append(picture.cloneNode(true));
    }

    // Check for video link (Watch video button becomes play overlay)
    const hasVideoLink = row.textContent.toLowerCase().includes('watch video');
    if (hasVideoLink) {
      const playButton = document.createElement('button');
      playButton.classList.add('carousel-cards-play-button');
      playButton.setAttribute('aria-label', 'Play video');
      imageWrapper.append(playButton);
    }

    slide.append(imageWrapper);
  }

  // Second column: content (title, description, links)
  if (cols[1]) {
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('carousel-cards-slide-content');

    // Find and process H3 title
    const h3 = cols[1].querySelector('h3');
    if (h3) {
      const title = document.createElement('h3');
      title.classList.add('carousel-cards-title');
      title.textContent = h3.textContent;
      contentWrapper.append(title);
    } else {
      // Fallback: use strong text as title
      const strongText = cols[1].querySelector('strong');
      if (strongText) {
        const title = document.createElement('h3');
        title.classList.add('carousel-cards-title');
        title.textContent = strongText.textContent;
        contentWrapper.append(title);
      }
    }

    // Find description paragraph (first p without a link or strong)
    const paragraphs = cols[1].querySelectorAll('p');
    paragraphs.forEach((p) => {
      const text = p.textContent.trim();
      // Skip if it's just a link wrapper or empty
      if (text && !p.querySelector('a:only-child') && !p.querySelector('strong:only-child')) {
        // Check if this paragraph doesn't already have a strong tag that we used as title
        if (!p.querySelector('strong') || p.childNodes.length > 1) {
          const desc = document.createElement('p');
          desc.classList.add('carousel-cards-description');
          // Get text content excluding strong tags
          desc.textContent = text.replace(/^[^a-zA-Z]*/, '');
          if (desc.textContent.trim()) {
            contentWrapper.append(desc);
          }
        }
      }
    });

    // Create horizontal divider
    const divider = document.createElement('hr');
    divider.classList.add('carousel-cards-divider');

    // Create links wrapper with left/right containers
    const linksWrapper = document.createElement('div');
    linksWrapper.classList.add('carousel-cards-links');

    const linksLeft = document.createElement('div');
    linksLeft.classList.add('carousel-cards-links-left');

    const linksRight = document.createElement('div');
    linksRight.classList.add('carousel-cards-links-right');

    // Find all links
    const links = cols[1].querySelectorAll('a');
    links.forEach((link) => {
      const linkText = link.textContent.trim().toLowerCase();
      const newLink = document.createElement('a');
      newLink.href = link.href;

      if (linkText.includes('learn more') || linkText.includes('read')) {
        newLink.classList.add('carousel-cards-link-primary');
        newLink.textContent = link.textContent.trim();
        linksLeft.append(newLink);
      } else if (linkText.includes('watch') || linkText.includes('video')) {
        newLink.classList.add('carousel-cards-link-video');
        // Screen reader text in span (visually hidden)
        const span = document.createElement('span');
        span.textContent = link.textContent.trim();
        newLink.append(span);
        linksRight.append(newLink);
      } else if (linkText.includes('download') || linkText.includes('case study')) {
        newLink.classList.add('carousel-cards-link-download');
        // Screen reader text in span (visually hidden)
        const span = document.createElement('span');
        span.textContent = link.textContent.trim();
        newLink.append(span);
        linksRight.append(newLink);
      } else {
        newLink.classList.add('carousel-cards-link-primary');
        newLink.textContent = link.textContent.trim();
        linksLeft.append(newLink);
      }
    });

    // Only add divider and links if there are links
    if (linksLeft.children.length > 0 || linksRight.children.length > 0) {
      contentWrapper.append(divider);
      linksWrapper.append(linksLeft);
      linksWrapper.append(linksRight);
      contentWrapper.append(linksWrapper);
    }

    slide.append(contentWrapper);
  }

  return slide;
}

/**
 * Extract intro content from preceding siblings in the section
 * Returns the intro panel element if content found, null otherwise
 */
function createIntroPanel(block) {
  // Get the wrapper div that contains the carousel-cards block
  const wrapper = block.closest('.carousel-cards-wrapper');
  if (!wrapper) return null;

  // Get the section containing the wrapper
  const section = wrapper.closest('.section');
  if (!section) return null;

  // Find the default-content-wrapper that precedes the carousel-cards-wrapper
  const defaultContentWrapper = section.querySelector('.default-content-wrapper');
  if (!defaultContentWrapper) return null;

  // Check if there's meaningful content (h2, paragraphs)
  const h2 = defaultContentWrapper.querySelector('h2');
  const paragraphs = defaultContentWrapper.querySelectorAll('p');

  if (!h2 && paragraphs.length === 0) return null;

  // Create intro panel
  const introPanel = document.createElement('div');
  introPanel.classList.add('carousel-cards-intro');

  // Clone the content
  if (h2) {
    const heading = document.createElement('h2');
    heading.classList.add('carousel-cards-intro-heading');
    heading.textContent = h2.textContent;
    introPanel.append(heading);
  }

  paragraphs.forEach((p) => {
    const clonedP = p.cloneNode(true);
    // Check if it's a CTA (has strong > a)
    const strongLink = clonedP.querySelector('strong a');
    if (strongLink) {
      clonedP.classList.add('carousel-cards-intro-cta');
    } else {
      clonedP.classList.add('carousel-cards-intro-description');
    }
    introPanel.append(clonedP);
  });

  // Hide the original default content (we've moved it into the carousel)
  defaultContentWrapper.style.display = 'none';

  return introPanel;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-cards-${carouselId}`);

  // Filter out title row (contains only H2)
  const allRows = [...block.querySelectorAll(':scope > div')];
  const rows = allRows.filter((row) => {
    const h2 = row.querySelector('h2');
    // Skip row if it only contains an H2 (title row)
    if (h2 && row.children.length === 1 && row.children[0].tagName === 'H2') {
      return false;
    }
    // Also skip if row has only one child div containing just H2
    if (row.children.length === 1) {
      const firstChild = row.children[0];
      if (firstChild.querySelector('h2') && !firstChild.querySelector('picture, img')) {
        return false;
      }
    }
    return true;
  });

  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel);

  // Create intro panel from preceding default content
  const introPanel = createIntroPanel(block);

  // Create main layout container
  const mainLayout = document.createElement('div');
  mainLayout.classList.add('carousel-cards-layout');

  // Add intro panel if it exists
  if (introPanel) {
    mainLayout.append(introPanel);
    block.classList.add('has-intro');
  }

  // Create carousel track container
  const carouselTrack = document.createElement('div');
  carouselTrack.classList.add('carousel-cards-track');

  const container = document.createElement('div');
  container.classList.add('carousel-cards-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-cards-slides');

  let slideIndicators;
  let navigationWrapper;
  if (!isSingleSlide) {
    // Create navigation wrapper (arrows + dots inline)
    navigationWrapper = document.createElement('div');
    navigationWrapper.classList.add('carousel-cards-navigation-wrapper');

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.classList.add('slide-prev');
    prevButton.setAttribute('aria-label', placeholders.previousSlide);
    navigationWrapper.append(prevButton);

    // Slide indicators nav
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls);
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-cards-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    navigationWrapper.append(slideIndicatorsNav);

    // Next button
    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.classList.add('slide-next');
    nextButton.setAttribute('aria-label', placeholders.nextSlide);
    navigationWrapper.append(nextButton);
  }

  // Remove title rows (filtered out earlier)
  allRows.filter((row) => !rows.includes(row)).forEach((row) => row.remove());

  let slideIdx = 0;
  rows.forEach((row) => {
    const slide = createSlide(row, slideIdx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-cards-slide-indicator');
      indicator.dataset.targetSlide = slideIdx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide} ${slideIdx + 1} ${placeholders.of} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
    slideIdx += 1;
  });

  container.append(slidesWrapper);
  carouselTrack.append(container);

  mainLayout.append(carouselTrack);
  block.prepend(mainLayout);

  // Add navigation wrapper after layout (at block level for page-centered alignment)
  if (navigationWrapper) {
    block.append(navigationWrapper);
  }

  // Set first indicator as active on load
  if (!isSingleSlide) {
    block.dataset.activeSlide = 0;
    const firstIndicator = block.querySelector('.carousel-cards-slide-indicator button');
    if (firstIndicator) {
      firstIndicator.setAttribute('disabled', 'true');
    }
    bindEvents(block);
  }
}
