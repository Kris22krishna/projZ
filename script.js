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
const galleryData = Array.isArray(window.GALLERY_IMAGES) ? window.GALLERY_IMAGES : [];
if (galleryTrack && galleryData.length) {
  galleryTrack.innerHTML = '';
  galleryData.forEach((photo, idx) => {
    const figure = document.createElement('figure');
    figure.className = 'gallery-slide';

    const img = document.createElement('img');
    img.src = photo.imageUrl || photo.thumbnailUrl;
    img.loading = 'lazy';
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
  galleryEmpty?.setAttribute('hidden', '');
} else if (galleryEmpty) {
  galleryEmpty.hidden = false;
}

let gallerySlides = galleryTrack ? Array.from(galleryTrack.children) : [];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let galleryIndex = 0;
let galleryTimer;

const updateGalleryTransform = () => {
  if (!galleryTrack) return;
  galleryTrack.style.transform = `translateX(-${galleryIndex * 100}%)`;
};

const updateIndicators = () => {
  if (!galleryIndicators) return;
  const dots = Array.from(galleryIndicators.children);
  dots.forEach((dot, idx) => {
    dot.setAttribute('aria-current', idx === galleryIndex ? 'true' : 'false');
  });
};

const setGallerySlide = (index, userInitiated = false) => {
  if (!galleryTrack || !gallerySlides.length) return;
  galleryIndex = (index + gallerySlides.length) % gallerySlides.length;
  updateGalleryTransform();
  updateIndicators();
  if (userInitiated) restartGalleryTimer();
};

const restartGalleryTimer = () => {
  clearInterval(galleryTimer);
  if (prefersReducedMotion.matches || gallerySlides.length < 2) return;
  galleryTimer = setInterval(() => {
    setGallerySlide(galleryIndex + 1);
  }, 30000);
};

if (galleryIndicators && !gallerySlides.length) {
  galleryIndicators.innerHTML = '';
  galleryIndicators.setAttribute('hidden', '');
}

if (galleryTrack && gallerySlides.length) {
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

  setGallerySlide(0);
  restartGalleryTimer();

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
    gallerySlides = Array.from(galleryTrack.children);
    updateGalleryTransform();
  });
}

/* ===== Gallery Collections Builder ===== */
const gallerySectionsRoot = document.querySelector('[data-gallery-sections]');
if (gallerySectionsRoot) {
  const collections = Array.isArray(window.GALLERY_COLLECTIONS) ? window.GALLERY_COLLECTIONS : [];
  const imageMap = new Map(galleryData.map((item) => [item.id, item]));
  gallerySectionsRoot.innerHTML = '';

  if (!collections.length) {
    const fallback = document.createElement('p');
    fallback.className = 'gallery-empty';
    fallback.textContent = 'Gallery updates coming soon.';
    gallerySectionsRoot.appendChild(fallback);
  } else {
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

      const ids = Array.isArray(collection.imageIds) ? collection.imageIds : [];
      if (ids.length) {
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
          img.loading = 'lazy';
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
      } else {
        const placeholder = document.createElement('p');
        placeholder.className = 'gallery-coming-soon';
        placeholder.textContent = collection.comingSoonMessage || 'Photos coming soon.';
        sectionEl.appendChild(placeholder);
      }

      gallerySectionsRoot.appendChild(sectionEl);
    });
  }
}
