/* ===== Mobile Nav Drawer ===== */
const hamburger = document.getElementById('hamburger');
const navDrawer = document.getElementById('navDrawer');
const drawerLinks = document.querySelectorAll('.drawer-link');

function toggleDrawer(forceClose) {
  const willClose = forceClose ?? navDrawer.style.display === 'block';
  if (willClose) {
    navDrawer.style.display = 'none';
    navDrawer.hidden = true;
    hamburger?.setAttribute('aria-expanded', 'false');
  } else {
    navDrawer.style.display = 'block';
    navDrawer.hidden = false;
    hamburger?.setAttribute('aria-expanded', 'true');
  }
}

hamburger?.addEventListener('click', () => toggleDrawer());
drawerLinks.forEach((a) => a.addEventListener('click', () => toggleDrawer(true)));

/* Close drawer on ESC */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') toggleDrawer(true);
});

/* ===== Footer Year ===== */
document.getElementById('year').textContent = new Date().getFullYear();

/* ===== Sticky Header Shadow on Scroll ===== */
const header = document.querySelector('.header');
const setShadow = () => {
  header.style.boxShadow = window.scrollY > 4 ? '0 6px 18px rgba(0,0,0,.06)' : 'none';
};
setShadow();
window.addEventListener('scroll', setShadow);

/* ===== Smooth anchor scrolling fix for sticky header ===== */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const smoothScrollLinks = Array.from(document.querySelectorAll('a[href*="#"]')).filter((link) => {
  const href = link.getAttribute('href') || '';
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  const [pathPart, hash] = href.split('#');
  if (!hash) return false;
  const normalizedPath = (pathPart || '').replace(/^\.\//, '');
  return !normalizedPath || normalizedPath === currentPage;
});

smoothScrollLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href') || '';
    const [pathPart, hash] = href.split('#');
    if (!hash) return;
    const target = document.getElementById(hash);
    if (!target) return;

    e.preventDefault();
    const headerOffset = (header?.offsetHeight || 0) + 8;
    const y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
    const normalizedPath = (pathPart || '').replace(/^\.\//, '');
    const newUrl = normalizedPath ? `${normalizedPath}#${hash}` : `#${hash}`;
    history.replaceState(null, '', newUrl);
  });
});

/* ===== Hero Gallery Auto-Slider ===== */
const galleryTrack = document.querySelector('[data-gallery-track]') || document.querySelector('.gallery-track');
const galleryIndicators = document.querySelector('.gallery-indicators');
const galleryEmpty = document.querySelector('[data-gallery-empty]');
const galleryControls = document.querySelector('[data-gallery-controls]');
const galleryPrevButton = document.querySelector('[data-gallery-prev]');
const galleryNextButton = document.querySelector('[data-gallery-next]');
const gallerySectionsRoot = document.querySelector('[data-gallery-sections]');

let gallerySlides = [];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let galleryIndex = 0;
let galleryTimer;
let galleryDragStartX = 0;
let galleryDragDeltaX = 0;
let galleryDragging = false;

const updateGalleryTransform = () => {
  if (!galleryTrack) return;
  const dragOffset = galleryDragging && galleryTrack.clientWidth
    ? (galleryDragDeltaX / galleryTrack.clientWidth) * 100
    : 0;
  const offset = -(galleryIndex * 100) + dragOffset;
  galleryTrack.style.transform = `translateX(${offset}%)`;
};

const updateIndicators = () => {
  if (!galleryIndicators) return;
  const dots = Array.from(galleryIndicators.children);
  dots.forEach((dot, idx) => {
    dot.setAttribute('aria-current', idx === galleryIndex ? 'true' : 'false');
  });
};

const restartGalleryTimer = () => {
  clearInterval(galleryTimer);
  if (prefersReducedMotion.matches || gallerySlides.length < 2) return;
  galleryTimer = setInterval(() => {
    setGallerySlide(galleryIndex + 1);
  }, 30000);
};

const setGallerySlide = (index, userInitiated = false) => {
  if (!galleryTrack || !gallerySlides.length) return;
  galleryIndex = (index + gallerySlides.length) % gallerySlides.length;
  galleryDragging = false;
  galleryDragDeltaX = 0;
  galleryTrack.style.transition = '';
  updateGalleryTransform();
  updateIndicators();
  if (userInitiated) restartGalleryTimer();
};

const handlePrevClick = () => setGallerySlide(galleryIndex - 1, true);
const handleNextClick = () => setGallerySlide(galleryIndex + 1, true);

galleryPrevButton?.addEventListener('click', handlePrevClick);
galleryNextButton?.addEventListener('click', handleNextClick);

const startGalleryDrag = (event) => {
  if (!galleryTrack || gallerySlides.length < 1) return;
  galleryDragging = true;
  galleryTrack.style.transition = 'none';
  const point = event.touches ? event.touches[0] : event;
  galleryDragStartX = point.clientX;
  galleryDragDeltaX = 0;
  clearInterval(galleryTimer);
};

const moveGalleryDrag = (event) => {
  if (!galleryDragging || !galleryTrack) return;
  const point = event.touches ? event.touches[0] : event;
  galleryDragDeltaX = point.clientX - galleryDragStartX;
  updateGalleryTransform();
};

const endGalleryDrag = () => {
  if (!galleryDragging || !galleryTrack) return;
  const threshold = Math.min(80, galleryTrack.clientWidth * 0.15);
  const shouldAdvance = Math.abs(galleryDragDeltaX) > threshold;
  const direction = galleryDragDeltaX < 0 ? 1 : -1;
  galleryDragging = false;
  galleryTrack.style.transition = '';
  if (shouldAdvance) {
    setGallerySlide(galleryIndex + direction, true);
  } else {
    galleryDragDeltaX = 0;
    updateGalleryTransform();
    restartGalleryTimer();
  }
};

galleryTrack?.addEventListener('pointerdown', (event) => {
  galleryTrack.setPointerCapture?.(event.pointerId);
  startGalleryDrag(event);
});
galleryTrack?.addEventListener('pointermove', moveGalleryDrag);
galleryTrack?.addEventListener('pointerup', (event) => {
  galleryTrack.releasePointerCapture?.(event.pointerId);
  endGalleryDrag();
});
galleryTrack?.addEventListener('pointercancel', endGalleryDrag);
galleryTrack?.addEventListener('pointerleave', (event) => {
  if (galleryDragging) {
    galleryTrack.releasePointerCapture?.(event.pointerId);
    endGalleryDrag();
  }
});

if (!window.PointerEvent) {
  galleryTrack?.addEventListener('touchstart', startGalleryDrag, { passive: true });
  galleryTrack?.addEventListener('touchmove', moveGalleryDrag, { passive: true });
  galleryTrack?.addEventListener('touchend', endGalleryDrag);
  galleryTrack?.addEventListener('touchcancel', endGalleryDrag);
}

const renderHeroGallery = (images) => {
  if (!galleryTrack) return;

  galleryTrack.innerHTML = '';

  if (!Array.isArray(images) || !images.length) {
    gallerySlides = [];
    if (galleryEmpty) {
      galleryEmpty.hidden = false;
      galleryEmpty.removeAttribute('hidden');
    }
    if (galleryIndicators) {
      galleryIndicators.innerHTML = '';
      galleryIndicators.setAttribute('hidden', '');
    }
    galleryControls?.setAttribute('hidden', '');
    updateGalleryTransform();
    return;
  }

  images.forEach((photo, idx) => {
    const figure = document.createElement('figure');
    figure.className = 'gallery-slide';

    const img = document.createElement('img');
    img.src = photo.imageUrl || photo.thumbnailUrl;
    img.loading = idx === 0 ? 'eager' : 'lazy';
    img.alt = photo.alt || photo.title || `Learners PU College gallery image ${idx + 1}`;
    figure.appendChild(img);

    const captionText = photo.caption || photo.title;
    if (captionText) {
      const caption = document.createElement('figcaption');
      caption.textContent = captionText;
      figure.appendChild(caption);
    }

    galleryTrack.appendChild(figure);
  });

  gallerySlides = Array.from(galleryTrack.children);
  galleryEmpty?.setAttribute('hidden', '');

  if (galleryIndicators) {
    galleryIndicators.innerHTML = '';
    if (gallerySlides.length < 2) {
      galleryIndicators.setAttribute('hidden', '');
    } else {
      galleryIndicators.removeAttribute('hidden');
      gallerySlides.forEach((_, idx) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', `Show gallery image ${idx + 1}`);
        button.addEventListener('click', () => setGallerySlide(idx, true));
        galleryIndicators.appendChild(button);
      });
    }
  }

  if (galleryControls) {
    if (gallerySlides.length < 2) {
      galleryControls.setAttribute('hidden', '');
    } else {
      galleryControls.removeAttribute('hidden');
    }
  }

  setGallerySlide(0);
  restartGalleryTimer();
};

const renderGalleryCollections = (images, collections) => {
  if (!gallerySectionsRoot) return;
  const imageMap = new Map(images.map((item) => [item.id, item]));
  gallerySectionsRoot.innerHTML = '';

  if (!Array.isArray(collections) || !collections.length) {
    const fallback = document.createElement('p');
    fallback.className = 'gallery-empty';
    fallback.textContent = images.length
      ? 'We are organising the gallery sections — please check back shortly.'
      : 'Gallery updates coming soon.';
    gallerySectionsRoot.appendChild(fallback);
    return;
  }

  collections.forEach((collection) => {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'gallery-section';
    if (collection.slug) {
      sectionEl.id = collection.slug;
    }

    const headerEl = document.createElement('header');
    headerEl.className = 'gallery-section-header';

    const titleEl = document.createElement('h2');
    titleEl.textContent = collection.title || 'Gallery Collection';
    headerEl.appendChild(titleEl);

    if (collection.description) {
      const descriptionEl = document.createElement('p');
      descriptionEl.className = 'gallery-section-description';
      descriptionEl.textContent = collection.description;
      headerEl.appendChild(descriptionEl);
    }

    sectionEl.appendChild(headerEl);

    let ids = Array.isArray(collection.imageIds) ? collection.imageIds : [];
    if (!ids.length && Array.isArray(collection.tags) && collection.tags.length) {
      const lowerTags = collection.tags.map((tag) => tag.toLowerCase());
      ids = images
        .filter((image) => {
          const imageTags = Array.isArray(image.tags) ? image.tags.map((tag) => tag.toLowerCase()) : [];
          return lowerTags.some((tag) => imageTags.includes(tag));
        })
        .map((image) => image.id);
    }

    if (!ids.length) {
      ids = images.map((image) => image.id);
    }

    const gridEl = document.createElement('div');
    gridEl.className = 'gallery-section-grid';

    ids.forEach((id, idx) => {
      const image = imageMap.get(id);
      if (!image) return;

      const figure = document.createElement('figure');
      figure.className = 'gallery-item';

      const link = document.createElement('a');
      link.className = 'gallery-item-link';
      link.href = image.driveUrl || image.imageUrl || '#';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      const img = document.createElement('img');
      img.src = image.thumbnailUrl || image.imageUrl;
      img.loading = idx < 4 ? 'eager' : 'lazy';
      img.alt = image.alt || image.title || `Learners PU College gallery image ${idx + 1}`;
      link.appendChild(img);

      figure.appendChild(link);

      if (image.title) {
        const caption = document.createElement('figcaption');
        caption.textContent = image.title;
        figure.appendChild(caption);
      }

      if (image.caption && image.caption !== image.title) {
        const detail = document.createElement('p');
        detail.className = 'gallery-item-caption';
        detail.textContent = image.caption;
        figure.appendChild(detail);
      }

      gridEl.appendChild(figure);
    });

    if (gridEl.children.length) {
      sectionEl.appendChild(gridEl);
    } else {
      const placeholder = document.createElement('p');
      placeholder.className = 'gallery-coming-soon';
      placeholder.textContent = collection.comingSoonMessage || 'Photos coming soon.';
      sectionEl.appendChild(placeholder);
    }

    gallerySectionsRoot.appendChild(sectionEl);
  });
};

const loadGalleryData = async () => {
  try {
    const response = await fetch('assets/gallery-data.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const payload = await response.json();
    if (Array.isArray(payload)) {
      return { images: payload, collections: [] };
    }
    const { images = [], collections = [] } = payload || {};
    return { images, collections };
  } catch (error) {
    console.error('Failed to load gallery data', error);
    return { images: [], collections: [] };
  }
};

const initGallery = async () => {
  const { images, collections } = await loadGalleryData();
  renderHeroGallery(images);
  renderGalleryCollections(images, collections);
};

initGallery();

prefersReducedMotion.addEventListener('change', () => {
  if (prefersReducedMotion.matches) {
    clearInterval(galleryTimer);
  } else {
    restartGalleryTimer();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(galleryTimer);
  } else {
    restartGalleryTimer();
  }
});

window.addEventListener('resize', () => {
  gallerySlides = galleryTrack ? Array.from(galleryTrack.children) : [];
  updateGalleryTransform();
});
