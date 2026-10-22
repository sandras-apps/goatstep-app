<!-- Decides which screen to show:
     checking login → loading | reset-password link → new password | old email link → link expired
     | logged out → login screens | first visit → onboarding
     | otherwise → app screens with the bottom menu -->
<script>
  import { onMount } from 'svelte';
  import { route, matchRoute } from './lib/router.js';
  import { session, profile, recoveryMode, linkResult, initAuth } from './lib/auth.js';
  import { t } from './i18n/index.js';

  import BottomNav from './components/BottomNav.svelte';
  import Rocco from './components/Rocco.svelte';
  import Login from './screens/Login.svelte';
  import Signup from './screens/Signup.svelte';
  import ForgotPassword from './screens/ForgotPassword.svelte';
  import ResetPassword from './screens/ResetPassword.svelte';
  import LinkExpired from './screens/LinkExpired.svelte';
  import Onboarding from './screens/Onboarding.svelte';
  import Today from './screens/Today.svelte';
  import Habits from './screens/Habits.svelte';
  import HabitEditor from './screens/HabitEditor.svelte';
  import GoalEditor from './screens/GoalEditor.svelte';
  import Dreams from './screens/Dreams.svelte';
  import You from './screens/You.svelte';
  import Legal from './screens/Legal.svelte';

  const legalScreens = { '/privacy': Legal, '/terms': Legal, '/cookies': Legal };
  const loggedOutScreens = { '/login': Login, '/signup': Signup, '/forgot': ForgotPassword, ...legalScreens };
  // Order matters: '/habit/new' must come before '/habit/:id'.
  const appScreens = {
    '/today': Today,
    '/habits': Habits,
    '/habit/new': HabitEditor,
    '/habit/:id': HabitEditor,
    '/goal/new': GoalEditor,
    '/goal/:id': GoalEditor,
    '/dreams': Dreams,
    '/you': You,
    '/forgot': ForgotPassword,
    ...legalScreens
  };

  let LoggedOutScreen = $derived(loggedOutScreens[$route] ?? Login);
  let appMatch = $derived(matchRoute($route, Object.keys(appScreens)));
  let AppScreen = $derived(appScreens[appMatch?.pattern] ?? Today);

  onMount(initAuth);
</script>

{#if $session === undefined || ($session && $profile === undefined && !$recoveryMode)}
  <div class="loading" aria-live="polite">
    <Rocco name="rocco-base" width={140} />
    <p>{$t('common.loading')}</p>
  </div>
{:else if $recoveryMode}
  <ResetPassword />
{:else if $linkResult === 'expired'}
  <LinkExpired />
{:else if !$session}
  <LoggedOutScreen />
{:else if $profile === null}
  <main class="screen"><p class="error" role="alert">{$t('setup.profileMissing')}</p></main>
{:else if !$profile.onboarding_done}
  <Onboarding />
{:else}
  <main>
    <!-- A new copy of the screen for every address, so e.g. two habit editors never share old values. -->
    {#key $route}
      <AppScreen params={appMatch?.params ?? {}} />
    {/key}
  </main>
  <BottomNav />
{/if}

<style>
  .loading {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--color-ink-soft);
  }
</style>
