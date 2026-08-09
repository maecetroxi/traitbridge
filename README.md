# TraitBridge

TraitBridge is a bilingual Next.js web app for Big Five self-reflection, practical learning content, AI-supported questions and an open community. Test, Community and Learn are independent entry points; visitors do not need to complete them in a fixed order.

## What is included

- IPIP-NEO-120 assessment in English and German
- Embedded ten-item quick orientation in English and German
- Ten questionnaire stages with actual-answer progress, local autosave, resume and restart
- Local results for visitors and Supabase-backed results for registered users
- Public Community reading with questions, experiences, search, categories and sorting
- Public three-band OCEAN profiles for contributors; exact scores and email addresses stay private
- Direct question routes at `/community/[id]`
- Email magic-link sign-in for writing Community content
- Eleven bilingual, situation-based learning topics at `/learn/[slug]`
- Editorial book suggestions with “might feel familiar” and “might widen my view” modes
- Big Five Compass with concise OpenAI responses
- Neutral profile interpretation that presents possible benefits and friction equally

## Main routes

| Route | Purpose | Sign-in |
| --- | --- | --- |
| `/` | Equal overview of all entry points and valid saved work | No |
| `/test` | Assessment context, data use and scientific background | No |
| `/test/full` | Staged IPIP-NEO-120 questionnaire | No |
| `/results` | Locally stored result | No |
| `/profile` | Latest Supabase result with local fallback | Yes |
| `/community` | Searchable feed for questions and experiences | Read: no; write: account + test |
| `/community/[id]` | Direct post and perspective view | Read: no; answer: account + test |
| `/learn` | Practical learning topic overview | No |
| `/learn/[slug]` | Structured topic with evidence notes and sources | No |
| `/learn/books` | Editorial book suggestions | No |
| `/tools/personality-guide` | Big Five Compass | No |

## Technology

- Next.js Pages Router
- React and TypeScript
- `@bigfive-org/questions`, `@bigfive-org/score`, `@bigfive-org/results`
- Supabase Auth and Postgres
- OpenAI Responses API

No client-side OpenAI key is used. Community email addresses are never queried or rendered.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   # Temporary compatibility fallback only:
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=your-legacy-anon-key
   OPENAI_API_KEY=your-server-side-openai-key
   # Optional; defaults to gpt-4.1-mini
   OPENAI_MODEL=gpt-4.1-mini
   ```

3. Apply the Supabase migrations in numeric order. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

4. Start the app:

   ```bash
   npm run dev
   ```

## Commands

```bash
npm test
npm run build
npm run dev
npm start
```

The tests cover stored profile validation, AI request/response validation, book matching, test-draft stages and persistence, Community filtering/sorting, and learning-content structure/source resolution.

## Supabase keepalive

The GitHub Actions workflow `.github/workflows/supabase-keepalive.yml` performs one read-only Data API request at `05:17`, `13:17`, and `21:17` UTC. Configure the repository secrets `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`; never commit either value.

Scheduled workflows run from the default branch. GitHub can disable schedules in a public repository after 60 days without repository activity, so check the Actions page after longer maintenance breaks. Regular activity reduces the chance of a free Supabase project being paused, but only a paid plan guarantees that it remains available.

## Data and trust boundaries

- An unfinished test is versioned and stored per language in `localStorage`.
- A visitor’s completed result remains in `localStorage`.
- For a permanent signed-in user, the completed result is also sent to Supabase.
- Community content is publicly readable. Writing requires a permanent account, a short or full test result, and consent to a public three-band OCEAN profile.
- Compass questions are sent to the server-side OpenAI route with `store: false`; TraitBridge does not persist questions or responses.
- The assessment is a self-reflection tool, not a clinical diagnosis.
- Learning exercises and book matches are clearly separated from scientific evidence.

## Content quality

Learning sources are kept in `lib/learning-content.ts` and shown on each topic route. Editorial gaps and requested subject-matter review are tracked in [docs/LEARNING_CONTENT_GAPS.md](docs/LEARNING_CONTENT_GAPS.md). Book covers and excerpts are not included.

## Key project areas

```text
components/test/            Staged questionnaire UI
lib/test-draft.ts           Versioned, language-specific draft logic
lib/community.ts            Community categories, filtering and sorting
lib/learning-content.ts     Bilingual topics and verified source registry
lib/profile-content.ts      Neutral contextual profile interpretation
pages/community/[id].tsx    Direct Community detail route
pages/learn/[slug].tsx      Learning topic route
supabase/migrations/        Database schema and RLS changes
tests/                      Pure-logic tests
```
