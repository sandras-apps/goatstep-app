# Goatstep — Architecture

How the app is built and why. Read together with [brief.md](brief.md).
Approved on 2026-10-22.

---

## 1. Stack

| Piece | Choice | Why |
| --- | --- | --- |
| UI | **Svelte 5** | Closest to plain HTML/CSS/JS: one file per screen, little boilerplate, small and fast output. |
| Build tool | **Vite** | Runs the app locally while we work and packs it for publishing. |
| Language | **JavaScript** (no TypeScript) | One less thing to learn. |
| Backend | **Supabase** (EU region) | Auth, Postgres database, file storage, small server functions. |
| PWA | `vite-plugin-pwa` | Makes the app installable and work offline for the shell. |
| Translations | Our own tiny helper + `en.json` / `it.json` | No library to learn; add `es.json` for Spanish later. |
| Fonts | Fraunces + Manrope, **self-hosted** (`@fontsource`) | Loading them from Google's servers would send every visitor's IP to Google (a GDPR problem in the EU). |
| Hosting | **GitHub Pages** (public repo) | Free. Page addresses look like `/#/today` so refreshes never give a 404. |

Only the **public** Supabase key (anon / publishable) is ever in the frontend. It is safe because Row Level Security decides what each user can see. Anything needing the secret key runs in a Supabase Edge Function.

## 2. Project structure

```
goatstep-app/
├── docs/                       brief, architecture (this file)
├── assets/rocco/               original Rocco images (never edited by code)
├── scripts/optimize-images.mjs makes small .webp copies + app icons from assets/rocco
├── public/
│   ├── rocco/                  optimised images used by the app (generated)
│   └── icons/                  app icons for install (generated)
├── src/
│   ├── main.js, App.svelte     entry point, picks the screen, bottom menu
│   ├── screens/                one file per screen
│   ├── components/             reusable pieces (BottomNav, Rocco, …)
│   ├── lib/
│   │   ├── supabase.js         the one connection to Supabase
│   │   ├── auth.js             who is logged in, their profile
│   │   ├── router.js           tiny hash router (#/today, #/you…)
│   │   └── api/                all database calls, grouped by topic
│   ├── i18n/                   en.json, it.json + helper
│   └── styles/                 colours, fonts, base styles
├── supabase/
│   ├── migrations/             the database as numbered SQL files, run in order
│   ├── functions/              Edge Functions (server code)
│   └── email-templates/        texts of the auth emails, to paste in Supabase
└── README.md                   how to run, set up Supabase, publish
```

## 3. Product rules that shape the code

- **Passwords**: at least 8 characters, with a lowercase letter, an uppercase letter, a digit and a symbol. Supabase enforces it on the server; the app shows the same rules before typing and checks them in the form (`PASSWORD_RULES` in `src/lib/config.js`). The two must always match.

- **Recommend, never block.** There are no limits on categories or habits and no database rule that refuses a habit. The only hard limits are technical: 10 MB per file, 25 MB of files per user.
- **Warnings are computed in the app, never stored as rules**, and can always be dismissed:
  - more than 3 `in_progress` habits created in the last 14 days (paused and archived ones excluded);
  - the day's planned minutes of `in_progress` habits getting heavy (starting threshold: 60 minutes, one constant in the code).
  - `already_mine` habits never count.
- **Check-in tone:** went well → celebrate only, at most one quiet line about room for something new. Hard → normalise and offer to pause bonus habits.
- **Forbidden words** anywhere in the app: failed, missed, behind, streak lost (and their Italian versions).

## 4. Database schema

Every table has Row Level Security on, with the rule "you can only see and change rows where `user_id` is you". Every table is linked to the user's account with `on delete cascade`, so deleting the account deletes all their rows automatically.

Each migration file adds the tables for one build step, so you can see the database grow with the app.

**Privileges.** The Supabase project has *Automatically expose new tables* **off** and *Enable automatic RLS* **on**, so a new table is invisible to the app until a migration grants access. Every migration therefore:
- enables RLS explicitly and adds its own policies;
- grants to `authenticated` only the exact privileges the app needs (e.g. `select`, `insert`, `update` on specific columns, `delete`);
- grants **nothing to `anon`** (logged-out visitors never read or write data);
- revokes `execute` from `public`, `anon` and `authenticated` on internal functions (triggers, `security definer` helpers).

### profiles — one row per user (step 1)
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | same id as the login account |
| `display_name` | text | optional |
| `language` | text | `en` / `it` |
| `timezone` | text | e.g. `Europe/Rome`, needed for reminders and "today" |
| `onboarding_done` | boolean | welcome screen seen |
| `terms_accepted_at` | timestamptz | when Privacy + Terms were accepted at sign-up |
| `terms_version` | text | which version was accepted |

Created automatically by a database trigger when someone signs up. Sign-up is refused if the terms were not accepted.

### categories — goals that group habits (step 2)
| Column | Type | Notes |
| --- | --- | --- |
| `id`, `user_id` | uuid | |
| `name`, `icon`, `color` | text | colour chosen by the user (not mint or butter yellow) |
| `why` | text | the user's reason |
| `position` | int | order on screen |
| `archived_at` | timestamptz | archived, not deleted |
| `created_at` | timestamptz | |

*Later:* a nullable `dream_id` column will link each category to a dream when the Dreams section arrives. Nothing needs to change now for that.

### habits — one routine (step 2)
| Column | Type | Notes |
| --- | --- | --- |
| `id`, `user_id` | uuid | |
| `category_id` | uuid, nullable | if the category is removed, the habit stays (category becomes empty) |
| `kind` | text | `already_mine` / `in_progress` |
| `priority` | text | `essential` (every day, shown first) / `bonus` (fine to skip at the beginning) |
| `name`, `icon`, `color` | text | |
| `why` | text | |
| `minimal_version` | text | e.g. "2 pages instead of 15" |
| `days` | smallint[] | 1 = Monday … 7 = Sunday |
| `minutes` | int, nullable | planned time; if the habit has steps, their total is used |
| `reminder_time` | time, nullable | |
| `position` | int | |
| `graduated_at` | timestamptz | when it moved from "in progress" to "already mine" |
| `paused_at` | timestamptz | paused: hidden from Today and calendar, history and materials kept |
| `archived_at` | timestamptz | |
| `created_at` | timestamptz | |

### habit_steps — timed sequence inside a habit (step 5, library)
`id`, `user_id`, `habit_id`, `position`, `title`, `minutes`, `prompt` (e.g. the writing prompt).

### habit_logs — "I did this on this day" (step 3, Today)
`id`, `user_id`, `habit_id`, `log_date` (date), `status` (`done` / `minimal`), `created_at`. One row per habit per day. A "minimal version" day counts as a win. The calendar counts rows per month: no streaks.

### items — everything in a routine's chat and library (steps 5–6)
| Column | Type | Notes |
| --- | --- | --- |
| `id`, `user_id`, `habit_id` | uuid | |
| `kind` | text | `text` / `link` / `pdf` / `image` → decides which library view shows it |
| `body` | text | message or note text |
| `url`, `link_title`, `link_image` | text | for links (preview fetched by an Edge Function) |
| `file_path`, `file_name`, `mime_type` | text | for files in Storage |
| `size_bytes` | bigint | used for the 25 MB quota |
| `is_favorite`, `is_pinned` | boolean | at most one pinned item per habit per kind |
| `archived_at` | timestamptz | old versions go to Archive |
| `replaces_item_id` | uuid | "this is the new version of …" |
| `created_at` | timestamptz | chat order |

### checkins — every 2 weeks (step 7)
`id`, `user_id`, `feeling`, `keeping_up`, `energy` (the 3 answers, 1–3 each), `outcome` (`went_well` / `lightened` / `steady`), `created_at`. The next check-in is due 14 days after the last one.

### push_subscriptions — devices that receive reminders (step 5)
`id`, `user_id`, `endpoint`, `p256dh`, `auth`, `created_at`.

### Storage
Private bucket `materials`. Path: `{user_id}/{habit_id}/{random-id}-{file name}`. A storage rule only lets you touch your own `{user_id}/` folder. Files are shown through signed links that expire after a few minutes. Bucket limit 10 MB per file; a database check keeps each user under 25 MB in total.

## 5. Server functions (Supabase Edge Functions)

| Function | Step | What it does |
| --- | --- | --- |
| `delete-account` | 1 | Deletes the user's files, then their login account (rows go with it). |
| `link-preview` | 5 | Fetches a link's title and image for the square preview. |
| `send-reminders` | 5 | Run every few minutes by a scheduled job; sends due push notifications. |

## 6. Before the public launch (checklist)

### Privacy and legal
- [ ] **Privacy Policy** (EN + IT), final version, reviewed by a professional or a service like iubenda.
- [ ] **Terms of Service** (EN + IT), final version, reviewed the same way.
- [ ] **Cookie Policy** (EN + IT), final version, reviewed the same way.
- [ ] **Cookie banner**: informative only, because the app uses only technical cookies/storage (login session, language). No marketing consent needed as long as there are no trackers or third-party analytics.
- [ ] Bump `TERMS_VERSION` in `src/lib/config.js` when the final texts replace the drafts.
- [ ] *(Later)* **Data export in a human-readable format** too (e.g. a simple HTML or PDF page), next to the current JSON file.

### Security and operations
- [ ] **Database backups**: the Supabase free plan has none. Decide: paid plan, or a scheduled export.
- [ ] Free projects are **paused after ~1 week without activity**.
- [ ] **Custom SMTP** for auth emails: the built-in sender only reaches the project team, a few emails per hour, and its templates can't be edited.
  1. Create a free account with an email provider such as **Resend** or **Brevo** and verify a sending domain.
  2. Supabase → Authentication → Emails → **SMTP Settings**: enter the provider's SMTP details.
  3. Paste our EN/IT templates from `supabase/email-templates/` (subjects in README §5).
  4. Test sign-up and reset password again. The app handles both link styles: Supabase's default `{{ .ConfirmationURL }}` and our `token_hash` links.
- [ ] Supabase Auth: Site URL set to the GitHub Pages address.
