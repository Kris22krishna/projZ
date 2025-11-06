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

/* ===== Optional: switch hero background to another reference image ===== */
/*
document.querySelector('.hero-media').style.backgroundImage =
  "linear-gradient(rgba(255,255,255,.85),rgba(255,255,255,.9)),url('assets/reference_2.png')";
*/
