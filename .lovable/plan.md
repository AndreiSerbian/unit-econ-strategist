# Multilingual Onboarding — Gap Fixes

## Current state (verified)

The onboarding (`src/components/OnboardingFlow.tsx`, mounted from `Dashboard.tsx`) is **already fully wired into the i18n system**: all titles, descriptions, bullets, buttons (`Back`, `Next`, `Start`, `Skip`, progress) read from `onboarding.*` keys that already exist in RU, EN, and RO inside `src/i18n/dictionary.ts` (lines 716, 2612, 4505). No hardcoded Russian remains in the onboarding component. The global header `LanguageSwitcher` already changes onboarding text live via `LanguageProvider` (priority: user-selected → localStorage → DEFAULT_LANGUAGE = `ru`).

So this task is **not** "translate onboarding" — it's closing three concrete gaps the spec calls for.

## Gaps to fix

### 1. Language selector inside the onboarding (Welcome step)
- Add a `LanguageSwitcher` (reuse existing component) on step 0 (`welcome`), placed under the welcome icon/title block.
- Selecting a language calls `setLanguage(...)` from the existing context (no new state system) and immediately re-renders all step text.
- Fires `onboarding_language_selected` analytics event with `source: "onboarding_selector"`.

### 2. Browser-language detection on first visit
Update `src/i18n/LanguageProvider.tsx` `readStoredLanguage()`:
- If `localStorage[LANGUAGE_STORAGE_KEY]` is **set**, use it (respects user choice — never override).
- If **unset**, read `navigator.language` / `navigator.languages`. Map prefix → `ru` | `en` | `ro`. Anything else → existing `DEFAULT_LANGUAGE` fallback.
- Do **not** persist the detected language until the user explicitly picks one (so the global default-language behavior elsewhere isn't affected).
- Emit `onboarding_language_selected` with `source: "browser"` once on first onboarding mount when detection occurred.

### 3. Lightweight analytics event handler
Create `src/utils/onboardingAnalytics.ts` exporting a single `trackOnboardingEvent(name, payload)` that:
- Builds the standard payload `{ language, step, totalSteps, completionPercentage, timestamp }` (or the language-selected variant).
- Currently logs via `console.debug` and dispatches `window.dispatchEvent(new CustomEvent("onboarding:event", { detail }))` so a real analytics layer can subscribe later.
- No external SDK, no Supabase writes.

Wire calls inside `OnboardingFlow.tsx`:
- mount → `onboarding_started`
- `nextStep` (non-final) → `onboarding_step_completed`
- `nextStep` (final) → `onboarding_finished`
- skip link / Skip button → `onboarding_skipped`
- language change inside onboarding → `onboarding_language_selected`

## Files to change

- `src/components/OnboardingFlow.tsx` — add `LanguageSwitcher` on welcome step; add analytics calls; on first selection, persist via existing `setLanguage`.
- `src/i18n/LanguageProvider.tsx` — extend `readStoredLanguage()` with `navigator.language` detection (only when nothing stored).
- `src/utils/onboardingAnalytics.ts` — new file, ~30 lines.
- `src/i18n/dictionary.ts` — add 1 string per locale: `onboarding.languageSelectorTitle` ("Choose your language" / "Выберите язык" / "Alege limba"). All other keys already exist.

## Out of scope (confirmed)

- No redesign, no new modal wrapper (current full-screen flow preserved).
- No changes to checklist, Dashboard tabs, business logic, persistence keys, or Supabase schema.
- No new global language system — reuse `LanguageProvider`.

## Acceptance

- Switching language via the new in-onboarding selector or the global header updates all step text instantly.
- Fresh browser (no `unitEconomicsLanguage` in localStorage) with `navigator.language = "ro-RO"` opens onboarding in Romanian; with `en-US` → English; otherwise → Russian.
- A user-selected language is never overridden by browser detection on later visits.
- All five `onboarding_*` events fire and are visible in console / `window` event listener with the documented payload shape.
- Romanian text doesn't overflow on 375px viewport (current layout already wraps; selector added inline won't change this).
