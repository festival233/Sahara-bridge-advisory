const menuToggle = document.querySelector('[data-menu-toggle]');
const navLinks = document.querySelector('[data-nav-links]');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
}

document.querySelectorAll('.accordion-button').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.accordion-item');
    item.classList.toggle('open');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

document.querySelectorAll('[data-count]').forEach((el) => {
  const target = Number(el.dataset.count || 0);
  const suffix = el.dataset.suffix || '';
  let done = false;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || done) return;
      done = true;
      let current = 0;
      const duration = 1500;
      const step = Math.max(1, Math.ceil(target / (duration / 16)));
      const tick = () => {
        current = Math.min(target, current + step);
        el.textContent = current.toLocaleString() + suffix;
        if (current < target) requestAnimationFrame(tick);
      };
      tick();
    });
  }, { threshold: 0.5 });

  countObserver.observe(el);
});

const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('[data-nav]').forEach((link) => {
  const href = link.getAttribute('href');
  if (href === currentPage) link.classList.add('active');
  if ((currentPage === '' || currentPage === 'index.html') && href === 'index.html') link.classList.add('active');
});

const config = window.SaharaBridgeConfig || {};
document.querySelectorAll('[data-whatsapp-link]').forEach((el) => {
  if (config.whatsappLink) el.setAttribute('href', config.whatsappLink);
});
document.querySelectorAll('[data-linkedin-link]').forEach((el) => {
  if (config.linkedIn) el.setAttribute('href', config.linkedIn);
});
document.querySelectorAll('[data-calendly-link]').forEach((el) => {
  if (config.calendlyLink) el.setAttribute('href', config.calendlyLink);
});
document.querySelectorAll('[data-company-email]').forEach((el) => {
  if (config.companyEmail) {
    el.textContent = config.companyEmail;
    el.setAttribute('href', `mailto:${config.companyEmail}`);
  }
});
