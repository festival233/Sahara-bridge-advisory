const intakeForm = document.querySelector('[data-intake-form]');
const intakeStatus = document.querySelector('[data-intake-status]');
if (intakeForm && intakeStatus) {
  intakeForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const config = window.SaharaBridgeConfig || {};
    const fd = new FormData(intakeForm);
    const data = Object.fromEntries(fd.entries());
    const needs = fd.getAll('needs').join(', ');
    if (!data.name || !data.email || !data.service || !data.message) {
      intakeStatus.textContent = 'Please complete the required fields first.';
      intakeStatus.className = 'form-status error';
      return;
    }
    const payload = { ...data, needs };
    if (config.formEndpoint) {
      try {
        const response = await fetch(config.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Request failed');
        intakeForm.reset();
        intakeStatus.textContent = 'Your intake has been sent successfully.';
        intakeStatus.className = 'form-status success';
        return;
      } catch (error) {
        intakeStatus.textContent = 'The endpoint rejected the intake. Update assets/js/config.js or send via email.';
        intakeStatus.className = 'form-status error';
      }
    }
    const subject = encodeURIComponent(`Sahara Bridge Intake - ${data.service}`);
    const body = encodeURIComponent(`Name: ${data.name}
Company: ${data.company || ''}
Email: ${data.email}
Phone: ${data.phone || ''}
Service: ${data.service}
Sector: ${data.sector || ''}
Countries: ${data.markets || ''}
Timeline: ${data.timeline || ''}
Budget: ${data.budget || ''}
Language: ${data.language || ''}
Counterparty: ${data.counterparty || ''}
Needs: ${needs || ''}
Documents: ${data.documents || ''}

Mandate summary:
${data.message}`);
    window.location.href = `mailto:${config.companyEmail || 'hello@saharabridgeadvisory.com'}?subject=${subject}&body=${body}`;
    intakeStatus.textContent = 'Opening your email client with the intake summary.';
    intakeStatus.className = 'form-status success';
  });
}
