# Sahara Bridge Advisory - V4

Static multi-page consulting site for GitHub + Cloudflare Pages.

## New in V4
- Arabic landing page (`/ar/index.html`)
- Insights page with downloadable briefs
- Structured client intake page
- Downloadable lead magnet files in `/docs`
- Updated navigation and sitemap
- WhatsApp and LinkedIn quick actions
- Contact form wired for Cloudflare Worker submission

## Cloudflare Worker → Gmail form setup
1. Deploy `cloudflare-worker.js` as a Cloudflare Worker.
2. Add a `send_email` binding named `CONTACT_EMAIL` and set destination to `saharabridgeadvisory@gmail.com`.
3. Optionally set environment variable `CONTACT_RECIPIENT` (defaults to `saharabridgeadvisory@gmail.com`).
4. Set `cloudflareWorkerEndpoint` in `assets/js/config.js` to your worker URL.

Advantages:
- Unlimited submissions (within Cloudflare limits)
- No third-party branding
- Better security with server-side handling and validation

## Deployment
Upload the folder to GitHub and connect the repo to Cloudflare Pages.
