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
| `npm test` | Runs the automatic checks (e.g. the gentle-warning rules) |

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

### 3. Create the database tables

For each file below, in order, **once**:
1. Open **SQL Editor → New query**.
2. Open the file, copy all of it, paste it, and click **Run**.
3. You should see *"Success. No rows returned"*.

| File | Build step |
| --- | --- |
| [supabase/migrations/0001_profiles.sql](supabase/migrations/0001_profiles.sql) | 1 · account |
| [supabase/migrations/0002_categories_habits.sql](supabase/migrations/0002_categories_habits.sql) | 2 · goals and habits |
| [supabase/migrations/0003_habits_use_goal_color.sql](supabase/migrations/0003_habits_use_goal_color.sql) | 2 · habits take their goal's colour |

Each new build step adds a new numbered file here.

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
- **Password requirements: Lowercase, uppercase letters, digits and symbols**

The app shows and checks the same rules before sending the form (`PASSWORD_RULES` in [src/lib/config.js](src/lib/config.js)). If you change these settings in Supabase, change that list and the `password` texts in `src/i18n/` too.

**Authentication → Rate Limits**: leave the defaults. They already slow down repeated login attempts.

### 5. Email templates (later, before launch)

⏭️ **Skip this for now.** Supabase only lets you edit templates once a custom email sender (SMTP) is set up. Until then it sends its default English emails, and the app understands their links too. See the pre-launch checklist in [docs/architecture.md](docs/architecture.md#6-before-the-public-launch-checklist).

When custom SMTP is ready: **Authentication → Emails → Templates**. For each template: open it, set the **Subject**, replace the whole **Message body** with the whole file, click **Save changes**.

| Template | Subject | Message body |
| --- | --- | --- |
| Confirm signup | `Confirm your Goatstep email · Conferma la tua email Goatstep` | [supabase/email-templates/confirm-signup.html](supabase/email-templates/confirm-signup.html) |
| Reset Password | `Reset your Goatstep password · Reimposta la password di Goatstep` | [supabase/email-templates/reset-password.html](supabase/email-templates/reset-password.html) |

These templates send people back to the app in their language, and the links also work when opened on a different device than the one used to sign up.

### 6. The "delete account" function

1. Open **Edge Functions → Deploy a new function → Via Editor**.
2. Replace all the example code with all of [supabase/functions/delete-account/index.ts](supabase/functions/delete-account/index.ts).
3. Name it exactly `delete-account`.
4. Click **Deploy function**.

The function checks by itself who is calling, so it is safe whether **Verify JWT** is on or off. Leave it on; if deleting fails with *"Invalid JWT"*, turn it off in the function's **Details** page.

### 7. Test checklists

#### Step 1 · Account

Run `npm run dev` and open http://localhost:5173. Use **the email of your Supabase account**: until we set up our own email sender, Supabase's built-in one only delivers to the project team, a few emails per hour.

- [ ] **Sign up**: the password rules are visible before typing and get a tick one by one; *Create my account* stays disabled until the Privacy/Terms box is ticked; then "Check your inbox".
- [ ] **Confirm email**: the email arrives (Supabase's default English text for now); the link brings you back to the app, already logged in, on Rocco's welcome screen → *Let's go* → Today, with the bottom menu.
- [ ] **Old link**: click the same confirmation link again → the login screen says the link has expired or was already used.
- [ ] **Log in**: log out, then log in with your email and password → Today.
- [ ] **Supabase check**: **Table Editor → profiles** has one row with `terms_accepted_at` filled in.
- [ ] **Language**: tab *You* → switch to Italiano → the app changes language; reload: it stays.
- [ ] **Export**: *Export my data* downloads a `goatstep-export-….json` file with your profile.
- [ ] **Log out**: back to the login screen.
- [ ] **Forgot password**: *Forgot your password?* → email arrives → link opens *Choose a new password* → save → you're in. Log out and log in with the new password.
- [ ] **Wrong password**: a kind message, not an error code.
- [ ] **Delete account**: tab *You* → *Delete my account* → tick the box → *Delete everything* → back to sign up. In Supabase, the user is gone from **Authentication → Users** and the row is gone from **profiles**.

#### Step 2 · Goals and habits

Run `0002_categories_habits.sql` and `0003_habits_use_goal_color.sql` first (section 3). To see the onboarding again: use a **new account**, or in Supabase **Table Editor → profiles** set `onboarding_done` to `false` and reload the app.

**Onboarding**
- [ ] Screen 1: Rocco's welcome → *Let's go*. The three progress dashes at the top fill in mint.
- [ ] Screen 2: *Yes, a few* → the add form has name, **Goal**, **How often** (*Specific days* / *Times a week*) and minutes.
  - Add a routine with the goal *+ New goal…* → type "Become a singer" → *Add this routine*. It appears under *Added so far* with its goal and the *mine* label.
  - Add a second routine: the goal picker now offers "Become a singer" under *Your goals*.
  - Also try *Not really*: it goes straight to screen 3.
- [ ] Screen 3: add new habits, each with its goal: one from **Ideas** (e.g. *Get stronger*), one *+ New goal…*, one with no goal. Each can be *Specific days* or *Times a week* (e.g. 3 to 5), with minutes.
- [ ] After the 4th new habit, a gentle note with a small Rocco appears (nothing is blocked).
- [ ] *Let's start* → the "That's a lot of new things" panel (small Rocco) with an Essential / Bonus switch for each habit → *Done* → Habits tab.
- [ ] *I'll do it later* (shown while nothing has been added on screen 3) also works.

**Habits tab**
- [ ] Each goal card has a soft coloured left edge and a faint tint; its habit icons are in the goal's colour.
- [ ] "Already mine" habits sit in their goal with a small *mine* label, mixed with the others (never in a separate group).
- [ ] Habits without a goal are at the bottom under **Other habits**, in a neutral grey-blue.
- [ ] Essential habits have a tinted icon tile and a bolder name; bonus ones a plain tile and the *bonus* label.
- [ ] *+ New goal*: it starts with a colour your other goals don't use yet. Name, why, colour and icon → *Save* → a new card.
- [ ] *Edit* on a goal → change the colour → all its habit icons change colour. *Delete this goal* → its habits move to *Other habits*.

**Habit editor**
- [ ] No colour choice for habits: only icons, drawn in the goal's colour ("The colour comes from the goal"). Change the goal → the icons change colour.
- [ ] **Goal** picker: your goals, *Ideas*, *+ New goal…* (type a name) and *No goal (Other habits)*.
- [ ] **Type** (*New habit* / *Already mine*) and **Priority** (*Essential* / *Bonus*) are switches, with a short explanation under them. Tapping the option that's already selected flips to the other one.
- [ ] **How often** is the same as in the onboarding: *Specific days* (at least one day stays on; the list shows e.g. "Mon, Wed, Fri" or "Monday to Friday") or *Times a week* (3 to 5 → "3–5 times a week"; 3 to 3 → "3 times a week"). Tapping the selected option flips this switch too.
- [ ] Minutes, why and minimal version are saved (open the habit again to check).
- [ ] *Pause this habit* → it moves to *Paused* at the bottom of the Habits tab → *Resume* brings it back.
- [ ] *It's part of me now* → the habit gets the *mine* label and stays in its goal.
- [ ] *Delete this habit* → the confirmation offers *Pause it instead* first; *Delete for good* removes it.

**Gentle warnings** (only new, essential, not paused habits count; both show a small Rocco)
- [ ] Add a 4th new essential habit → the essentials panel appears; the habit is already saved. In the panel, tapping the selected option flips it. Bonus or "Already mine" habits never trigger it.
- [ ] Fixed-day habits of 40 + 30 min **every day** → "Every day looks full (70 min)."
- [ ] 40 min every day + 30 min Monday to Friday → "Some days look full: Monday to Friday (70 min)."
- [ ] *Got it* hides the note; change the minutes → it can come back.
- [ ] Flexible habits adding up to more than 5 hours a week (e.g. 5 times a week × 70 min) → the note mentions the weekly hours.

**Other**
- [ ] Everything also in Italian (*You* → Italiano), e.g. "Altre abitudini", "Ogni giorno sembra pieno (70 min)."
- [ ] *Export my data* → the JSON file also contains `categories` and `habits`.
- [ ] Supabase **Table Editor**: `categories` and `habits` show your rows; `habits` has no `color` column any more.

### Troubleshooting

- *"Database error saving new user"* when creating a user from the Supabase dashboard: expected. Accounts must be created from the app, because they need the Privacy/Terms acceptance.
- *"We couldn't find your profile"*: the SQL file in step 3 hasn't been run (or was run after you signed up). Delete the user in Authentication → Users and sign up again.
- *"Something went wrong on our side"* on the Habits tab: check that `0002_categories_habits.sql` and `0003_habits_use_goal_color.sql` have been run.

---

## Publishing

Coming in the last build step (GitHub Pages).

## Before the public launch

See the checklist in [docs/architecture.md](docs/architecture.md#6-before-the-public-launch-checklist): backups, custom email sender, legal review.
