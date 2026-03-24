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

const GOOGLE_TRANSLATE_COOKIE_TTL = 31536000;

const setGoogleTranslateCookie = (langCode) => {
  document.cookie = `googtrans=/en/${langCode}; path=/; max-age=${GOOGLE_TRANSLATE_COOKIE_TTL}`;
  document.cookie = `googtrans=/en/${langCode}; domain=${location.hostname}; path=/; max-age=${GOOGLE_TRANSLATE_COOKIE_TTL}`;
};

const clearGoogleTranslateCookie = () => {
  document.cookie = 'googtrans=; path=/; max-age=0';
  document.cookie = `googtrans=; domain=${location.hostname}; path=/; max-age=0`;
};

const getCurrentLanguage = () => {
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith('googtrans='));

  if (!cookie) return 'en';
  const value = decodeURIComponent(cookie.split('=')[1] || '');
  const parts = value.split('/');
  return parts[2] || 'en';
};

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' }
];

document.querySelectorAll('.lang-chip').forEach((chip) => {
  const select = document.createElement('select');
  select.className = 'lang-chip lang-select';
  select.setAttribute('aria-label', 'Select site language');

  languageOptions.forEach((optionData) => {
    const option = document.createElement('option');
    option.value = optionData.value;
    option.textContent = optionData.label;
    select.appendChild(option);
  });

  const currentLanguage = getCurrentLanguage();
  select.value = languageOptions.some((item) => item.value === currentLanguage) ? currentLanguage : 'en';

  select.addEventListener('change', (event) => {
    const nextLanguage = event.target.value;
    if (nextLanguage === 'en') {
      clearGoogleTranslateCookie();
    } else {
      setGoogleTranslateCookie(nextLanguage);
    }
    location.reload();
  });

  chip.replaceWith(select);
});
