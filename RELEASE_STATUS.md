# TraitBridge release status

Status date: 2 September 2026

## Release decision

**Production deployment completed.** TraitBridge is publicly available at `https://traitbridge.com` and `https://www.traitbridge.com` as a Hostinger Node.js / Next.js application. The remaining items below are operational and legal follow-ups rather than technical deployment blockers.

## Completed

- Read-only Hostinger inventory completed before any write: hosting plan, websites, domain, DNS, DNS history, nameservers, DNSSEC, registrar lock, WHOIS privacy and SSL state.
- Empty PHP/HTML website for `traitbridge.com` deleted after two separate user confirmations; the domain, Supabase project and source code were not affected.
- Node.js / Next.js production deployment completed on 2 September 2026 on the existing Business plan. Hostinger selected Frankfurt as the closest available location to Switzerland, with backups in France.
- The clean source archive excluded `.git`, `.next`, `node_modules` and all `.env*` files. Hostinger detected Next.js, used Node.js 22.x and applied the four documented production variables before the build.
- Hostinger's automatic post-deletion DNS mapping re-inventoried on 26 August: apex A/AAAA records point to Hostinger and `www` aliases the apex. Nameservers are unchanged; no DNS record was edited manually.
- Runtime dependencies pinned and updated; Node.js 22 enforced.
- Production security headers added, including CSP, HSTS, clickjacking protection, MIME sniffing protection, referrer policy and permissions policy.
- Supabase client requires the publishable key and HTTPS in production. RLS, grants, policies, migrations and advisors were checked on project `nhzcvrxhtwdmhjktpcsf`.
- Supabase Auth Site URL is set to `https://traitbridge.com`; exact `/login` callbacks for the apex domain, `www`, localhost and `127.0.0.1` are allow-listed without wildcards.
- Supabase Email Auth, new-user signups and email confirmation are enabled; anonymous sign-ins are disabled. Magic links/OTPs expire after 3600 seconds and use 8 digits.
- Supabase database SSL enforcement is enabled. The user explicitly accepted the brief restart; the project returned to `ACTIVE_HEALTHY` and a post-restart SQL health query succeeded.
- Bilingual privacy notice, Community guidelines, public-content consent, reporting links and non-diagnostic notices added.
- The bilingual imprint/legal notice identifies Marcel Troxler in Bonstetten, Zurich, as a private individual without company, commercial-register or VAT details. The user approved the current wording on 1 September 2026; the draft label and `noindex,nofollow` directive were removed and the page was added to the sitemap.
- Cloudflare Turnstile is integrated into the Magic-Link form using Supabase's documented `captchaToken` flow. The managed production widget `TraitBridge Login` was created for `traitbridge.com` and `www.traitbridge.com` on 1 September 2026; its public site key is configured locally and the matching secret is stored in Supabase Auth rather than the repository.
- The privacy notice now identifies Cloudflare Turnstile and its processing for bot/abuse protection.
- Third-party fonts and tracking removed; canonical, robots, sitemap, Open Graph and no-index rules added.
- Supabase keepalive workflow retained intentionally. It sends three small external read-only Data API requests daily and changes no data. The five most recent scheduled runs checked on 26 August 2026 all completed successfully.
- Hostinger Starter Business Email Trial activated for `traitbridge.com` through 26 August 2027. Automatic renewal was explicitly disabled; Hostinger confirmed the change. The reminder automation is active monthly from 26 April through 26 July 2027.
- `noreply@traitbridge.com` and `privacy@traitbridge.com` were created as separate active Hostinger mailboxes. MX, SPF, three DKIM selectors, DMARC and Autoconfig/Autodiscover records resolve publicly; Hostinger reports the email-domain connection complete.
- Supabase custom SMTP is enabled with Hostinger (`smtp.hostinger.com`, TLS/SSL port 465), sender `TraitBridge <noreply@traitbridge.com>` and a 60-second per-user interval. Auth reloaded the configuration and raised the email limit from the built-in 2/hour to the custom-SMTP 30/hour limit.
- End-to-end SMTP test passed on 26 August 2026: Supabase accepted the OTP/Magic-Link request with HTTP 200 and `privacy@traitbridge.com` received a TraitBridge signup-confirmation message. The temporary, unconfirmed Auth test user had no sessions or application data and was permanently deleted on 27 August 2026; the Hostinger mailbox remains active.

## Post-deployment follow-ups

1. **Controller / provider identity**
   - The user approved `Marcel Troxler, Bonstetten, Zürich, Schweiz` as the publishable controller identity; it is now included in the privacy notice.
   - The user approved the current imprint/provider-page wording and accepted publication without a private street address on 1 September 2026. The page is now indexable. A later legal review remains advisable if the service scope or target markets expand.

2. **Working contact and moderation channel**
   - Separate active `privacy@traitbridge.com` and `noreply@traitbridge.com` mailboxes are provisioned. Define who monitors the privacy inbox and the response procedure before launch.
   - Ensure reports and data-subject requests have an owner and response procedure.

3. **Production email / Magic Link**
   - Custom SMTP, sender-domain DNS and a same-domain delivery test are complete.
   - Complete an external-provider delivery/spam-folder test after Turnstile is enabled and the public login is deployed.

4. **Remaining Supabase security decisions**
   - Custom SMTP is enabled and its same-domain delivery test passed. Keep the Hostinger mailbox password synchronized with Supabase if it is ever changed.
   - Turnstile CAPTCHA protection is enabled in Supabase Auth with the production widget and secret. Keep the secret out of the repository and rotate it in both Cloudflare and Supabase if exposure is suspected.
   - The Supabase account has no authenticator app configured. Enable account MFA manually.
   - Network restrictions are disabled. Do not enable them until all legitimate administration and deployment source IPs are known.

5. **Data-protection completion**
   - Confirm controller, purposes, retention periods, processors/recipients, destination countries and transfer safeguards for Hostinger and Supabase.
   - Confirm the lawful operating basis for accounts, voluntary public Community profiles and security logs for every target market.
   - Obtain a final legal review if users in jurisdictions beyond Switzerland are actively targeted.

6. **Production secrets and abuse limits**
   - All variables listed in `HOSTINGER_DEPLOYMENT.md` are configured in Hostinger. Continue to keep `.env.local` out of deployment archives.

7. **End-to-end acceptance**
   - Public HTTPS, `www`, security headers, sitemap and representative public routes were verified after deployment.
   - Complete a real Magic-Link delivery test to an external provider and authenticated checks for private results, Community writes/RLS and reports with a designated test account.

## Verification results

- `npm run typecheck`: passed again on 26 August 2026.
- `npm test`: 49/49 passed again on 26 August 2026.
- `npm run build`: passed again on Next.js 16.3.2; all expected routes generated.
- `npm run audit:prod`: 0 known production vulnerabilities on 26 August 2026.
- Final post-imprint verification on 26 August 2026: typecheck passed, 49/49 tests passed, the Next.js 16.3.2 production build generated all 22 static pages including `/imprint`, and the production dependency audit reported 0 vulnerabilities.
- After removing the private-street-address placeholder on 27 August 2026, typecheck and the Next.js production build passed again.
- Turnstile change verification on 26 August 2026: typecheck passed, 49/49 tests passed, Next.js production build passed and production audit reported 0 vulnerabilities.
- Local production smoke test: expected public, legal and SEO routes returned 200 with CSP, HSTS and `nosniff`.
- After approval on 1 September 2026, the imprint builds as an indexable route and is included in the sitemap. Typecheck, all 47 current tests and the production build passed after the change.
- Hostinger production build completed successfully on 2 September 2026: dependencies installed with 0 reported vulnerabilities, TypeScript passed, Next.js 16.3.2 compiled successfully and all 20 routes were generated.
- Public smoke test on 2 September 2026: `/`, `/learn`, `/login`, `/privacy`, `/imprint` and `/test` rendered real application content without 404/500 errors. `/sitemap.xml` returned HTTP 200 with `application/xml`; apex and `www` both returned HTTP 200 over HTTPS.
- Production response headers include CSP, HSTS with subdomains, `nosniff`, `DENY` frame protection, strict-origin referrer policy, permissions policy, COOP and CORP.
- `git diff --check`: no whitespace errors; only Windows line-ending notices.
- `.env.local`: ignored by Git. Variable-name inspection found the legacy anon variable still present locally, but the production client no longer reads it.
- Repository secret-pattern scan found only documented placeholders and no committed Supabase secret/service-role or Turnstile credentials.
- Supabase project: `ACTIVE_HEALTHY`, Frankfurt (`eu-central-1`), PostgreSQL 17.6.1.054.
- Supabase Security Advisor: no critical findings. GraphQL visibility warnings correspond to intentional grants protected by RLS; leaked-password protection is unavailable on the Free plan and is not used by the Magic-Link-only UI.
- Supabase Performance Advisor: only unused-index information on the currently empty production tables; no index was removed.

## Known residual risks

- The CSP still needs inline scripts and styles for the current Next.js Pages Router implementation.
- The production database is empty, so unused-index advisor findings are not yet meaningful.
- The free Supabase project can still be paused; the keepalive reduces the inactivity risk but is not a service guarantee.
- GitHub may disable scheduled workflows after prolonged repository inactivity; periodically verify the keepalive run history.
