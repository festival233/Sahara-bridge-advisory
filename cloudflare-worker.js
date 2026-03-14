import { EmailMessage } from "cloudflare:email";

/**
 * Sahara Bridge Advisory - Contact Form Worker
 *
 * Cloudflare setup:
 * 1) Deploy this file as your Worker entrypoint.
 * 2) Add environment variable CONTACT_RECIPIENT (optional).
 *    Defaults to saharabridgeadvisory@gmail.com.
 * 3) Create a send_email binding in wrangler.toml:
 *
 * [[send_email]]
 * name = "CONTACT_EMAIL"
 * destination_address = "saharabridgeadvisory@gmail.com"
 *
 * 4) Point assets/js/config.js -> cloudflareWorkerEndpoint to your Worker URL.
 */

const ALLOWED_ORIGINS = [
  'https://saharabridgeadvisory.com',
  'https://www.saharabridgeadvisory.com',
  'http://localhost:8788',
  'http://127.0.0.1:8788'
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON payload' }, 400, corsHeaders);
    }

    const fields = sanitizeFields(data);
    const missing = ['name', 'email', 'service', 'message'].filter((key) => !fields[key]);

    if (missing.length) {
      return jsonResponse({ error: 'Missing required fields', missing }, 400, corsHeaders);
    }

    if (!isValidEmail(fields.email)) {
      return jsonResponse({ error: 'Invalid email address' }, 400, corsHeaders);
    }

    if (fields.website) {
      return jsonResponse({ success: true }, 200, corsHeaders);
    }

    const recipient = env.CONTACT_RECIPIENT || 'saharabridgeadvisory@gmail.com';
    const subject = `New Sahara Bridge Advisory inquiry: ${fields.service}`;

    const textBody = [
      `Name: ${fields.name}`,
      `Email: ${fields.email}`,
      `Company: ${fields.company || '-'}`,
      `Phone / WhatsApp: ${fields.phone || '-'}`,
      `Service: ${fields.service}`,
      `Budget: ${fields.budget || '-'}`,
      `Markets: ${fields.markets || '-'}`,
      '',
      'Message:',
      fields.message
    ].join('\n');

    const htmlBody = `
      <h2>New Sahara Bridge Advisory inquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(fields.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(fields.email)}</p>
      <p><strong>Company:</strong> ${escapeHtml(fields.company || '-')}</p>
      <p><strong>Phone / WhatsApp:</strong> ${escapeHtml(fields.phone || '-')}</p>
      <p><strong>Service:</strong> ${escapeHtml(fields.service)}</p>
      <p><strong>Budget:</strong> ${escapeHtml(fields.budget || '-')}</p>
      <p><strong>Markets:</strong> ${escapeHtml(fields.markets || '-')}</p>
      <hr />
      <p><strong>Message</strong></p>
      <p>${escapeHtml(fields.message).replace(/\n/g, '<br />')}</p>
    `;

    try {
      const message = new EmailMessage(
        recipient,
        recipient,
        [
          `To: ${recipient}`,
          `From: Sahara Bridge Advisory <${recipient}>`,
          `Reply-To: ${fields.name} <${fields.email}>`,
          `Subject: ${subject}`,
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=UTF-8',
          '',
          htmlBody,
          '',
          '----',
          'Plain text copy:',
          textBody
        ].join('\n')
      );

      await env.CONTACT_EMAIL.send(message);
      return jsonResponse({ success: true }, 200, corsHeaders);
    } catch (error) {
      return jsonResponse(
        { error: 'Could not send email', details: String(error?.message || error) },
        500,
        corsHeaders
      );
    }
  }
};

function sanitizeFields(payload = {}) {
  return {
    name: clean(payload.name),
    email: clean(payload.email),
    company: clean(payload.company),
    phone: clean(payload.phone),
    service: clean(payload.service),
    budget: clean(payload.budget),
    markets: clean(payload.markets),
    message: clean(payload.message),
    website: clean(payload.website)
  };
}

function clean(value) {
  return String(value || '').trim().slice(0, 5000);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers
    }
  });
}
