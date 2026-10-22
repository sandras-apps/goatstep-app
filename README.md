# Goatstep

*The stubborn goat's step.* A free habit app (PWA) with Rocco, the mountain goat who trips, patches himself up and keeps climbing.

- What the app does: [docs/brief.md](docs/brief.md)
- How it's built (structure, database): [docs/architecture.md](docs/architecture.md)

---

## Run the app on your computer

You need [Node.js](https://nodejs.org/) (version 20 or newer).

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173. Until Supabase is connected you can look at the screens but not log in.

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Makes the final version for publishing, in `dist/` |
| `npm run preview` | Opens that final version locally to check it |
| `npm run images` | Re-makes the app images and icons after you change something in `assets/rocco/` |

---

## Supabase setup

Do these once. Supabase sometimes renames menu items: if something is not exactly where described, look for the closest name.

### 1. Create the project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. **New project**:
   - Name: `goatstep`
   - Database password: click *Generate*, then save it in your password manager. You won't need it in the app.
   - **Region: choose one in the EU** (e.g. *Central EU (Frankfurt)*). This matters for GDPR and can't be changed later.
   - Plan: Free.
3. Wait a couple of minutes while it starts.

### 2. Connect the app

1. In the project, open **Project Settings → API Keys** (or the **Connect** button at the top).
2. Copy:
   - the **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - the **publishable** key (or the **anon public** key, if that's what you see).
   - ⚠️ Never copy the **secret** / **service_role** key into the app.
3. In this folder, make a copy of `.env.example` called `.env.local` and paste the two values in it.
4. Stop `npm run dev` (Ctrl+C) and start it again.

`.env.local` is ignored by git, so it never ends up on GitHub.

### 3. Create the database table

1. Open **SQL Editor → New query**.
2. Open [supabase/migrations/0001_profiles.sql](supabase/migrations/0001_profiles.sql), copy all of it, paste it, and click **Run**.
3. You should see *"Success. No rows returned"*.

Each new build step adds a new numbered file in `supabase/migrations/`. Run each one once, in order.

### 4. Auth settings

**Authentication → URL Configuration**
- **Site URL**: `http://localhost:5173` for now. When we publish, it becomes `https://sandras-apps.github.io/goatstep-app/`.
- **Redirect URLs**: add both:
  - `http://localhost:5173/**`
  - `https://sandras-apps.github.io/goatstep-app/**`

**Authentication → Sign In / Providers → Email**
- Email provider: **on**
- **Confirm email: on**
- **Minimum password length: 8**
- **Password requirements: letters and digits**

**Authentication → Rate Limits**: leave the defaults. They already slow down repeated login attempts.

### 5. Email templates

**Authentication → Emails → Templates**. For each of the two templates below, set the subject and paste the body from the file (the comment at the top of each file says which is which):

| Template | File |
| --- | --- |
| Confirm signup | [supabase/email-templates/confirm-signup.html](supabase/email-templates/confirm-signup.html) |
| Reset password | [supabase/email-templates/reset-password.html](supabase/email-templates/reset-password.html) |

These templates send people back to the app in their language, and the links also work when opened on a different device than the one used to sign up.

### 6. The "delete account" function

1. Open **Edge Functions → Deploy a new function → Via Editor**.
2. Name it exactly `delete-account`.
3. Replace the example code with all of [supabase/functions/delete-account/index.ts](supabase/functions/delete-account/index.ts).
4. Click **Deploy**. Leave **Verify JWT** turned on: it means only logged-in users can call it.

### 7. Try it

1. `npm run dev`, open http://localhost:5173, create an account **with the same email you used for Supabase**. Until we set up our own email sender, Supabase's built-in one only delivers to the project team's addresses, a few emails per hour.
2. Click the link in the email → you're back in the app with "Email confirmed".
3. Log in → Rocco's welcome screen → *Let's go*.
4. Tab **You**: change the language, export your data, log out, try "Forgot your password?", and finally delete the account.
5. In Supabase, **Table Editor → profiles** shows one row per user; **Authentication → Users** shows the accounts.

### Troubleshooting

- *"Database error saving new user"* when creating a user from the Supabase dashboard: expected. Accounts must be created from the app, because they need the Privacy/Terms acceptance.
- *"We couldn't find your profile"*: the SQL file in step 3 hasn't been run (or was run after you signed up). Delete the user in Authentication → Users and sign up again.

---

## Publishing

Coming in the last build step (GitHub Pages).

## Before the public launch

See the checklist in [docs/architecture.md](docs/architecture.md#6-before-the-public-launch-checklist): backups, custom email sender, legal review.
