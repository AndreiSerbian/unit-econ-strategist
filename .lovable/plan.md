## Pass 2C-1 — Onboarding & Settings localization

Scope: 4 components + dictionary. Strict UI-only changes. No formulas, no schema, no internal IDs touched.

### Files to modify

- `src/i18n/dictionary.ts` — add RU/EN/RO sections
- `src/components/OnboardingFlow.tsx`
- `src/components/StartupChecklist.tsx`
- `src/components/ActionPlanManager.tsx`
- `src/components/ProjectSettings.tsx`

### Dictionary additions (~110 keys × 3 langs)

**`onboarding`** (~25 keys)
- `progress` (e.g. "{current} / {total}"), `back`, `next`, `start`, `startWork`, `skip`
- `selectedLabel` ("Выбрано:" / "Selected:" / "Selectat:")
- `keyMetricsForType`
- Step titles + descriptions × 8 (welcome, businessType, products, metrics, competitors, market, analytics, theory)
- Welcome bullets (4), products bullets (4), metrics bullets (4), competitors bullets (4), market bullets (4), analytics bullets (4), theory bullets (4) — stored as arrays via numbered keys (`welcomeBullet1`…`welcomeBullet4`, etc.)

**`startupChecklist`** (~30 keys)
- `title`, `description`, `progress` ("{done}/{total}"), `dismiss`, `show`, `showFull`
- Default steps (6): `defaultProducts`, `defaultExpenses`, `defaultLeads`, `defaultMetrics`, `defaultScenarios`, `defaultSummary`
- SaaS steps (6): `saasProducts`, `saasExpenses`, `saasLeads`, `saasMetrics`, `saasScenarios`, `saasSummary`
- Ecommerce (6): `ecommerceProducts`, `ecommerceLogistics`, `ecommerceExpenses`, `ecommerceLeads`, `ecommerceMetrics`, `ecommerceScenarios`
- Production (6), Services (6), Marketplace (5) — same pattern

**`actionPlan`** (~30 keys)
- `title`, `description`, `generate`, `add`, `cancel`, `loading`, `empty`
- `dialogTitle`, `dialogDescription`, `nameLabel`, `namePlaceholder`, `descriptionLabel`, `descriptionPlaceholder`, `priorityLabel`, `dueDateLabel`
- `priorityHigh`, `priorityMedium`, `priorityLow`
- `statusPending`, `statusInProgress`, `statusCompleted`
- `dueLabel` ("Срок:")
- Toasts: `toastFillTitle`, `toastAddError`, `toastAdded`, `toastUpdateError`, `toastStatusUpdated`, `toastDeleteError`, `toastDeleted`, `toastNoRecommendations`, `toastRecommendationsAdded` (with `{count}` var)
- Recommendation seeds: `recOptVarTitle`, `recOptVarDesc`, `recOptMarketingTitle`, `recOptMarketingDesc`, `recIncreaseAOVTitle`, `recIncreaseAOVDesc`

**`projectSettings`** (~25 keys)
- `title`, `description`, `tooltip` ("Настройки проекта")
- `businessTypeLabel`, `currencyLabel`
- `warningTitle`, `warningBody`
- `keyMetricsForLabel`
- `cancel`, `save`, `confirmTitle`, `confirmBody1` (with `{from}`,`{to}`), `confirmChangesLabel`, `confirmChange1`, `confirmChange2` (with `{products}`), `confirmChange3`, `confirmDataSafe`, `confirmCancel`, `confirmAction`

**`currencies`** (8 keys: `RUB`, `USD`, `EUR`, `KZT`, `BYN`, `UAH`, `MDL`, `RON`) — translated descriptive labels; codes themselves stay unchanged.

### Implementation notes

- All components import `useTranslation` from `@/i18n/useTranslation` (existing pattern).
- Use `t("section.key", { var })` for interpolation (LanguageProvider already supports `{var}` substitution).
- **Internal IDs preserved**: `value="high"`, `value="pending"`, business model IDs, currency codes, language codes, `related_metric` keys, step `id`s, localStorage key `startup-checklist:*`, Supabase column names.
- **OnboardingFlow**: rebuild `steps` array inside component using `t()`; bullet arrays via `[t("onboarding.welcomeBullet1"), …]`.
- **StartupChecklist**: replace step `label` with translated value via `labelKey` lookup; keep `id` unchanged so persisted progress still maps. Add `aria-label` translation for dismiss button.
- **ActionPlanManager**: translate priority/status display only; keep raw values in DB. Recommendation seeds use translated title/description but stored values for `priority`, `status`, `related_metric` stay literal.
- **ProjectSettings**: translate currency dropdown labels via `currencies.*`; the symbol prefix stays. Translate `productLabelPlural.toLowerCase()` interpolation by passing the already-resolved label.

### Mobile safety

- Onboarding buttons already have `hidden sm:inline` — translations fit.
- ActionPlan dialog uses `grid-cols-2` — RO labels short enough; add `truncate` only if needed.
- ProjectSettings dialog `sm:max-w-[500px]` accommodates longer EN/RO.

### Out of scope (for Pass 2C-2+)

Cash Flow, Competitors, Market, ROI/LTV/Sensitivity calculators, MetricForecasting, MarketingMetrics, SWOT, GameTheory, StrategyDictionary, CompetitiveSimulator, tooltip configs.

### Acceptance

- All 4 components render in RU/EN/RO with no hardcoded user-facing Cyrillic.
- Language switch does not reset onboarding step, checklist progress (localStorage), action plans (Supabase), or project settings.
- Currency codes (RUB/USD/EUR/KZT/BYN/UAH/MDL/RON), language codes (ru/en/ro), business model IDs, action plan priority/status raw values unchanged.
- Dictionary keys symmetrical across 3 languages.
- 7-tab dashboard structure, formulas, Supabase schema, routes untouched.

### Final report will include

Files modified, dictionary sections added, key count, per-component status, remaining RU text (if any), mobile risks, build status, safety confirmation, suggested Pass 2C-2 scope (likely: ROICalculator, LTVCalculator, SensitivityAnalysis, MarketingMetrics).
