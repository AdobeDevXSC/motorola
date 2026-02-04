/**
 * Carousel Cards Block
 * Auto-rotating carousel displaying customer story cards
 */

const placeholders = {
  carousel: 'Carousel',
  carouselSlideControls: 'Carousel Slide Controls',
  previousSlide: 'Previous Slide',
  nextSlide: 'Next Slide',
  showSlide: 'Show Slide',
  of: 'of',
};

const AUTO_ROTATE_INTERVAL = 10000;
const PAUSE_ON_INTERACTION = 15000;
const SLIDE_TRANSITION_DELAY = 800;

let slideUpdateTimeout = null;

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-cards');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);

  if (slideUpdateTimeout) {
    clearTimeout(slideUpdateTimeout);
  }

  slideUpdateTimeout = setTimeout(() => {
    block.dataset.activeSlide = slideIndex;

    const slides = block.querySelectorAll('.carousel-cards-slide');
    slides.forEach((aSlide, idx) => {
      aSlide.setAttribute('aria-hidden', idx !== slideIndex);
      aSlide.querySelectorAll('a').forEach((link) => {
        if (idx !== slideIndex) {
          link.setAttribute('tabindex', '-1');
        } else {
          link.removeAttribute('tabindex');
        }
      });
    });

    const indicators = block.querySelectorAll('.carousel-cards-slide-indicator');
    indicators.forEach((indicator, idx) => {
      if (idx !== slideIndex) {
        indicator.querySelector('button').removeAttribute('disabled');
      } else {
        indicator.querySelector('button').setAttribute('disabled', 'true');
      }
    });
  }, SLIDE_TRANSITION_DELAY);
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-cards-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-cards-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function startAutoRotation(block) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  const slides = block.querySelectorAll('.carousel-cards-slide');
  if (slides.length < 2) return null;

  const intervalId = setInterval(() => {
    const currentSlide = parseInt(block.dataset.activeSlide || 0, 10);
    showSlide(block, currentSlide + 1);
  }, AUTO_ROTATE_INTERVAL);

  block.dataset.autoRotateId = intervalId;
  return intervalId;
}

function stopAutoRotation(block) {
  const intervalId = block.dataset.autoRotateId;
  if (intervalId) {
    clearInterval(parseInt(intervalId, 10));
    delete block.dataset.autoRotateId;
  }
}

function pauseAutoRotation(block, duration = PAUSE_ON_INTERACTION) {
  stopAutoRotation(block);

  if (block.dataset.resumeTimeoutId) {
    clearTimeout(parseInt(block.dataset.resumeTimeoutId, 10));
  }

  const timeoutId = setTimeout(() => {
    startAutoRotation(block);
    delete block.dataset.resumeTimeoutId;
  }, duration);

  block.dataset.resumeTimeoutId = timeoutId;
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-cards-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
      pauseAutoRotation(block);
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
    pauseAutoRotation(block);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    pauseAutoRotation(block);
  });

  block.addEventListener('mouseenter', () => {
    stopAutoRotation(block);
  });

  block.addEventListener('mouseleave', () => {
    if (!block.dataset.resumeTimeoutId) {
      startAutoRotation(block);
    }
  });

  block.addEventListener('focusin', () => {
    stopAutoRotation(block);
  });

  block.addEventListener('focusout', (e) => {
    if (!block.contains(e.relatedTarget) && !block.dataset.resumeTimeoutId) {
      startAutoRotation(block);
    }
  });

  let touchStartX = 0;
  block.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoRotation(block);
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
      pauseAutoRotation(block);
    } else {
      startAutoRotation(block);
    }
  }, { passive: true });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });

  block.querySelectorAll('.carousel-cards-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });

  const carouselObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startAutoRotation(block);
      } else {
        stopAutoRotation(block);
      }
    });
  }, { threshold: 0.3 });

  carouselObserver.observe(block);
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

  const container = document.createElement('div');
  container.classList.add('carousel-cards-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-cards-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls);
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-cards-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-cards-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide}"></button>
    `;

    container.append(slideNavButtons);
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
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
