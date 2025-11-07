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
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    const headerOffset = document.querySelector('.header').offsetHeight + 8;
    const y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
    history.replaceState(null, '', id);
  });
});

/* ===== Hero Gallery Auto-Slider ===== */
const galleryTrack = document.querySelector('.gallery-track');
const gallerySlides = galleryTrack ? Array.from(galleryTrack.children) : [];
const galleryIndicators = document.querySelector('.gallery-indicators');
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

if (galleryTrack && gallerySlides.length) {
  if (galleryIndicators) {
    galleryIndicators.innerHTML = '';
    gallerySlides.forEach((_, idx) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Show gallery image ${idx + 1}`);
      button.addEventListener('click', () => setGallerySlide(idx, true));
      galleryIndicators.appendChild(button);
    });
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

  window.addEventListener('resize', updateGalleryTransform);
}
