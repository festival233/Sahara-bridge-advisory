const form = document.querySelector('[data-contact-form]');
const statusEl = document.querySelector('[data-form-status]');

if (form && statusEl) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const config = window.SaharaBridgeConfig || {};
    const data = Object.fromEntries(new FormData(form).entries());
    const required = ['name', 'email', 'service', 'message'];
    const missing = required.filter((key) => !String(data[key] || '').trim());

    if (missing.length) {
      statusEl.textContent = 'Please complete all required fields before sending.';
      statusEl.className = 'form-status error';
      return;
    }

    if (config.formEndpoint) {
      try {
        const response = await fetch(config.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Request failed');
        form.reset();
        statusEl.textContent = 'Your inquiry has been sent. Sahara Bridge Advisory will respond shortly.';
        statusEl.className = 'form-status success';
      } catch (error) {
        statusEl.textContent = 'Your form endpoint rejected the request. Update assets/js/config.js or use email / WhatsApp below.';
        statusEl.className = 'form-status error';
      }
      return;
    }

    const subject = encodeURIComponent(`Sahara Bridge Inquiry — ${data.service}`);
    const body = encodeURIComponent(
      `Name: ${data.name}\nCompany: ${data.company || ''}\nEmail: ${data.email}\nPhone: ${data.phone || ''}\nService: ${data.service}\nBudget: ${data.budget || ''}\nMarkets: ${data.markets || ''}\n\nMessage:\n${data.message}`
    );
    window.location.href = `mailto:${config.companyEmail || 'hello@saharabridgeadvisory.com'}?subject=${subject}&body=${body}`;
    statusEl.textContent = 'Opening your email client now. For direct outreach, use the WhatsApp and booking links.';
    statusEl.className = 'form-status success';
  });
}
