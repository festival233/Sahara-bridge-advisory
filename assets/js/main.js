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
const GOOGLE_TRANSLATE_INIT_RETRIES = 30;
const GOOGLE_TRANSLATE_INIT_DELAY = 150;
const GOOGLE_TRANSLATE_APPLY_RETRIES = 20;
const GOOGLE_TRANSLATE_APPLY_DELAY = 200;
const GOOGLE_TRANSLATE_RETRY_ON_FAIL = 3;
let googleTranslateInitPromise;

const setGoogleTranslateCookie = (langCode) => {
  document.cookie = `googtrans=/en/${langCode}; path=/; max-age=${GOOGLE_TRANSLATE_COOKIE_TTL}`;
  document.cookie = `googtrans=/en/${langCode}; domain=${location.hostname}; path=/; max-age=${GOOGLE_TRANSLATE_COOKIE_TTL}`;
};

const clearGoogleTranslateCookie = () => {
  document.cookie = 'googtrans=; path=/; max-age=0';
  document.cookie = `googtrans=; domain=${location.hostname}; path=/; max-age=0`;
};

const ensureGoogleTranslateLoaded = () => {
  if (window.google?.translate?.TranslateElement) return Promise.resolve();
  if (googleTranslateInitPromise) return googleTranslateInitPromise;

  googleTranslateInitPromise = new Promise((resolve, reject) => {
    let attempts = 0;

    const checkReady = () => {
      if (window.google?.translate?.TranslateElement) {
        if (!document.getElementById('google_translate_element')) {
          const container = document.createElement('div');
          container.id = 'google_translate_element';
          container.style.display = 'none';
          document.body.appendChild(container);
        }

        if (!window.__saharaTranslateElementCreated) {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            autoDisplay: false
          }, 'google_translate_element');
          window.__saharaTranslateElementCreated = true;
        }

        resolve();
        return;
      }

      attempts += 1;
      if (attempts >= GOOGLE_TRANSLATE_INIT_RETRIES) {
        reject(new Error('Google Translate failed to initialize.'));
        return;
      }
      setTimeout(checkReady, GOOGLE_TRANSLATE_INIT_DELAY);
    };

    window.googleTranslateElementInit = checkReady;

    if (!document.querySelector('script[data-google-translate-script]')) {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.defer = true;
      script.dataset.googleTranslateScript = 'true';
      script.onerror = () => reject(new Error('Unable to load Google Translate script.'));
      document.head.appendChild(script);
    }

    checkReady();
  });

  return googleTranslateInitPromise;
};

const waitForTranslateCombo = () => new Promise((resolve, reject) => {
  let attempts = 0;

  const checkCombo = () => {
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      resolve(combo);
      return;
    }

    attempts += 1;
    if (attempts >= GOOGLE_TRANSLATE_APPLY_RETRIES) {
      reject(new Error('Google Translate control not ready.'));
      return;
    }

    setTimeout(checkCombo, GOOGLE_TRANSLATE_APPLY_DELAY);
  };

  checkCombo();
});

const applyLanguage = async (langCode, retryCount = 0) => {
  if (langCode === 'en') {
    clearGoogleTranslateCookie();
    location.reload();
    return;
  }

  setGoogleTranslateCookie(langCode);

  try {
    await ensureGoogleTranslateLoaded();
    const combo = await waitForTranslateCombo();

    if (combo.value !== langCode) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change'));
    }
  } catch (error) {
    if (retryCount < GOOGLE_TRANSLATE_RETRY_ON_FAIL) {
      setTimeout(() => {
        applyLanguage(langCode, retryCount + 1);
      }, 500 * (retryCount + 1));
      return;
    }

    location.reload();
  }
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
  select.setAttribute('data-language-select', 'true');

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
    applyLanguage(nextLanguage);
  });
  select.addEventListener('input', (event) => {
    const nextLanguage = event.target.value;
    applyLanguage(nextLanguage);
  });
  ['touchstart', 'pointerdown', 'click'].forEach((eventName) => {
    select.addEventListener(eventName, () => {
      if (typeof select.showPicker === 'function') {
        select.showPicker();
      }
    }, { passive: true });
  });

  chip.replaceWith(select);
});

const languageFromCookie = getCurrentLanguage();
if (languageFromCookie !== 'en') {
  applyLanguage(languageFromCookie);
}
