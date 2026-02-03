/**
 * Carousel Hero Block
 * Auto-rotating hero carousel with navigation controls
 */

// Default placeholder values for accessibility labels
const placeholders = {
  carousel: 'Carousel',
  carouselSlideControls: 'Carousel Slide Controls',
  previousSlide: 'Previous Slide',
  nextSlide: 'Next Slide',
  showSlide: 'Show Slide',
  of: 'of',
};

// Auto-rotation settings
const AUTO_ROTATE_INTERVAL = 5000; // 5 seconds between slides
const PAUSE_ON_INTERACTION = 10000; // Pause for 10 seconds after user interaction

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-hero');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-hero-slide');

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

  const indicators = block.querySelectorAll('.carousel-hero-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-hero-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-hero-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

/**
 * Start auto-rotation for the carousel
 */
function startAutoRotation(block) {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  const slides = block.querySelectorAll('.carousel-hero-slide');
  if (slides.length < 2) return null;

  const intervalId = setInterval(() => {
    const currentSlide = parseInt(block.dataset.activeSlide || 0, 10);
    showSlide(block, currentSlide + 1);
  }, AUTO_ROTATE_INTERVAL);

  block.dataset.autoRotateId = intervalId;
  return intervalId;
}

/**
 * Stop auto-rotation
 */
function stopAutoRotation(block) {
  const intervalId = block.dataset.autoRotateId;
  if (intervalId) {
    clearInterval(parseInt(intervalId, 10));
    delete block.dataset.autoRotateId;
  }
}

/**
 * Pause auto-rotation temporarily (e.g., after user interaction)
 */
function pauseAutoRotation(block, duration = PAUSE_ON_INTERACTION) {
  stopAutoRotation(block);

  // Clear any existing resume timeout
  if (block.dataset.resumeTimeoutId) {
    clearTimeout(parseInt(block.dataset.resumeTimeoutId, 10));
  }

  // Resume after duration
  const timeoutId = setTimeout(() => {
    startAutoRotation(block);
    delete block.dataset.resumeTimeoutId;
  }, duration);

  block.dataset.resumeTimeoutId = timeoutId;
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-hero-slide-indicators');
  if (!slideIndicators) return;

  // Slide indicator clicks
  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
      pauseAutoRotation(block);
    });
  });

  // Previous/Next button clicks
  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
    pauseAutoRotation(block);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    pauseAutoRotation(block);
  });

  // Pause on hover
  block.addEventListener('mouseenter', () => {
    stopAutoRotation(block);
  });

  block.addEventListener('mouseleave', () => {
    // Only restart if not paused due to interaction
    if (!block.dataset.resumeTimeoutId) {
      startAutoRotation(block);
    }
  });

  // Pause on focus (keyboard navigation)
  block.addEventListener('focusin', () => {
    stopAutoRotation(block);
  });

  block.addEventListener('focusout', (e) => {
    // Only restart if focus moved outside the carousel
    if (!block.contains(e.relatedTarget) && !block.dataset.resumeTimeoutId) {
      startAutoRotation(block);
    }
  });

  // Touch events for mobile
  let touchStartX = 0;
  block.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoRotation(block);
  }, { passive: true });

  block.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Swipe threshold of 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - next slide
        showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
      } else {
        // Swipe right - previous slide
        showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
      }
      pauseAutoRotation(block);
    } else {
      // No significant swipe, restart rotation
      startAutoRotation(block);
    }
  }, { passive: true });

  // Observe slide visibility
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });

  block.querySelectorAll('.carousel-hero-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });

  // Start auto-rotation when carousel is visible
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
  slide.setAttribute('id', `carousel-hero-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-hero-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-hero-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-hero-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel);

  const container = document.createElement('div');
  container.classList.add('carousel-hero-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-hero-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls);
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-hero-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-hero-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide}"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-hero-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide} ${idx + 1} ${placeholders.of} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
