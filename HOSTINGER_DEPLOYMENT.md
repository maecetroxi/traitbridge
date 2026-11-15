# TraitBridge production deployment on Hostinger

## Read-only inventory (24 August 2026)

- Hosting plan: Business, active until 23 August 2027.
- Existing websites on the plan: none.
- Domain: `traitbridge.com`, active until 23 August 2027 with automatic renewal enabled.
- Registrar lock and WHOIS privacy: enabled.
- Nameservers: `ns1.dns-parking.com`, `ns2.dns-parking.com`.
- DNS records: `A @ -> 2.57.91.91` (TTL 50) and `CNAME www -> traitbridge.com` (TTL 300).
- Redirects and subdomains: none.
- DNSSEC: no active DS record was shown.
- SSL: shown as active, although the current IP did not accept an HTTPS connection during verification.
- DNS history contains recoverable snapshots from 23 August, 23 November and 10 December 2025.

No Hostinger website, nameserver or DNS setting was changed during this inventory.

## Website transition and production deployment

The Hostinger inventory later showed that `traitbridge.com` was still represented by an empty PHP/HTML website rather than a deployed Node.js application. It used 0 GB and contained no visible TraitBridge content or configured mailbox. After two separate user confirmations, that empty PHP/HTML website was permanently deleted on 25 August 2026. The domain registration, Supabase project and local/GitHub source were not deleted.

On 2 September 2026, an interrupted onboarding attempt created another empty standard website placeholder. After a separate, explicit confirmation, only that empty website resource was removed; the optional deletion of domain email and mailboxes remained disabled. The domain registration and Business plan were not removed.

TraitBridge was then created successfully as a Node.js web app on the existing Business plan. Hostinger selected **Germany, Frankfurt** as the closest available location to Switzerland; backups are shown as stored in France. The source archive was uploaded with `.git`, `.next`, `node_modules` and every `.env*` file excluded. Hostinger detected Next.js, selected Node.js 22.x and completed the production build successfully.

Hostinger changed the DNS mapping automatically again when the empty website was removed. No DNS record was edited manually. The current zone was re-inventoried read-only on 26 August 2026 and contains:

- `A @ -> 46.202.158.88` (TTL 1800)
- `AAAA @ -> 2a02:4780:3f:1916:0:398f:a0b8:2` (TTL 1800)
- `CNAME www -> traitbridge.com` (TTL 300)

The nameservers remain `ns1.dns-parking.com` and `ns2.dns-parking.com`. After deployment, both the apex and `www` names returned the live application over HTTPS with HTTP 200. The original DNS state and Hostinger DNS-history snapshots remain the rollback reference; do not reset or restore them without inspecting and confirming the exact target state.

## Application runtime

- Node.js: 22.x (enforced by `package.json`).
- Install: `npm ci`.
- Build: `npm run build`.
- Start: `npm start`.
- Application type: Node.js / Next.js Pages Router, not a static HTML export.

These environment variables are configured in Hostinger. Never upload `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://traitbridge.com
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<cloudflare-turnstile-site-key>
```

## Deployment record

Deployment completed on 2 September 2026 after the required account and write confirmation. Hostinger reported:

- dependency installation completed with 0 reported vulnerabilities;
- TypeScript and the Next.js production build completed successfully;
- all expected static and dynamic routes were generated;
- deployment status: completed.

Post-deployment verification confirmed real application content on the apex domain, the `www` hostname, representative application/legal routes and the XML sitemap. Production security headers are present. A real external-recipient Magic-Link acceptance test remains a deliberate manual follow-up because it sends an email and creates or updates authentication state.

Never delete or reset the current DNS zone. If a rollback is required, inspect the snapshot contents and confirm the exact snapshot before restoring it.
