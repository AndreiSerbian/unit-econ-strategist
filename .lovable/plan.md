
# Localization fixes for English & Romanian (PRD implementation)

## Goal
Eliminate every Russian string that leaks into EN/RO mode across the app. Russian must appear only when RU is selected. Plus: fix dropdown hover invisibility, duplicated currency labels (`MDL MDL`), missing business‑type translations, untranslated key‑indicator phrases, settings toasts, and the login page.

No business logic, formulas, schema, auth, or layout changes — strings + tiny CSS only.

---

## Approach

The i18n system is already in place (`src/i18n/dictionary.ts`, `useTranslation` hook). All three languages live in one dictionary file with sections (`en`, `ru`, `ro`). The fixes are mechanical:

1. Add missing translation keys to `dictionary.ts` (en/ru/ro in lockstep).
2. Replace hardcoded Russian JSX strings with `t("section.key")` calls in the offending components.
3. One global CSS fix for dropdown hover.
4. One‑line fix for duplicated currency rendering.
5. Map `BusinessType` ids to translation keys end‑to‑end (selector, settings, key‑indicators phrase).

---

## Files to change (and what)

### 1. `src/i18n/dictionary.ts` — add new keys (en/ru/ro)
New / completed sections:
- `dashboard.keyBusinessMetricsTitle`, `dashboard.keyBusinessMetricsHint`, `dashboard.logisticsStructure`, `dashboard.logisticsStructureHint`, `dashboard.totalLogistics`, `dashboard.materialsToProduction`, `dashboard.productsToCustomer`, `dashboard.manualWarehouseDelivery`, `dashboard.shareInRevenue`, `dashboard.justNow`, `dashboard.minutesAgo`, `dashboard.hoursAgo`.
- `logistics.tariffsTitle`, `logistics.materialsHeader`, `logistics.productsHeader`, `logistics.baseLabel`, `logistics.unitPerPt` (`per 1 pt` / `per 1 unitate` / `за 1 ед.`), `logistics.formulaMaterials`, `logistics.formulaProducts`, `logistics.tooltip`, `logistics.deliveryTypes.*` (courier, pickup, transport_company, own_delivery).
- `scenarioComparison.title`, `.subtitle`, `.empty`, `.metric`, `.revenue`, `.profit`, `.margin`, `.breakeven`, `.summaryLabel`, `.summaryPlaceholder`, `.auto`, `.toastNoProject`, `.toastSaved`, `.toastSaveError`, `.toastGenerated`, `.recs.negativeMargin`, `.recs.lowMargin`, `.recs.greatMargin`, `.recs.highCac`, `.recs.belowBE`, `.recs.aboveBE`, `.recs.atBE`.
- `competitors.*` and `market.*` — full coverage for every visible label currently hardcoded (titles, card labels, empty states, chart legends, table headers, badges, recommendations).
- `theory.*` — every container except the existing Glossary (which stays as-is).
- `settings.toasts.settingsUpdated`, `.languageChanged`, `.currencyChanged`, `.businessTypeChanged`.
- `auth.*` — page title, email/password labels, sign in / create account / forgot password, validation, invalid credentials, “Sign in to export”.
- `businessModels` & `businessModelsDescription` — verify all 8 ids (saas, ecommerce, production, services, freemium, sharing, marketplace, token_saas) exist in en/ru/ro with the labels from the PRD.
- `keyIndicators.<metricKey>` namespace for the metric chips (Себестоимость, Мощности, Утилизация, Маржа, Выручка, Расходы, Прибыль, Клиенты, Конверсия, Удержание, Отток, Средний чек, CAC, CPL, LTV, Payback) → en/ro per PRD table.

### 2. `src/components/Dashboard.tsx`
- Replace all 37 hardcoded Russian strings (lines around 227–229, 640–716, etc.) with `t(...)` calls using the `dashboard.*` keys above.
- Container header `Основные показатели бизнеса` → `t("dashboard.keyBusinessMetricsTitle")`.

### 3. `src/components/ScenarioComparison.tsx`
- Wire `useTranslation`, replace 24 hardcoded strings (titles, table headers, toasts, recommendation strings — use template substitution for `{count}` in BE recs).

### 4. `src/components/LogisticsTariffs.tsx`
- Replace section titles, labels, formula text, delivery type map, and `База ({currency})` → use `t("logistics.baseLabel", { currency })`.
- `за единицу` → `t("logistics.unitPerPt")`.

### 5. `src/components/CompetitorAnalysis.tsx` (+ `CompetitorMetrics.tsx`, `CompetitorCharts.tsx`, `CompetitiveMap.tsx`, `CompetitiveRanking.tsx`, `CompetitorKeyMetricsComparison.tsx`)
- Replace all remaining Russian strings with `t("competitors.*")`. Tab title, card field labels, comparison labels, chart legends/tooltips, empty states.

### 6. `src/components/MarketOverview.tsx`
- Replace 51 Russian strings with `t("market.*")` (TAM/SAM/SOM explanations, segment labels, risk labels, recommendations, chart legends).

### 7. `src/components/theory/*` (and `src/components/StrategyDictionary.tsx`, `src/components/GameTheoryMatrix.tsx`)
- Wire `useTranslation`, route every container's text through `t("theory.*")`. **Keep Metrics Glossary unchanged** (it already works via `glossary.ts`).

### 8. `src/components/ProjectSettings.tsx`
- Toast on save → `toast.success(t("settings.toasts.settingsUpdated"))`.
- After currency change → `t("settings.toasts.currencyChanged")`.
- After business‑type change → `t("settings.toasts.businessTypeChanged")`.
- Business type Select renders `newConfig.label` directly — switch to `t(\`businessModels.${selectedType}\`)` and same for description.
- The "Key metrics for {type}" preview already uses `keyMetricsForLabel`, but `{type}` is interpolated with the raw `newConfig.label`. Switch to translated label, and render each metric chip via `t(\`keyIndicators.${metric}\`)` with fallback to the raw key.

### 9. `src/components/BusinessTypeSelector.tsx`
- Already uses `t("businessModels.*")` — verify all ids are in dictionary; no code change unless ids missing.

### 10. `src/components/CurrencySelector.tsx`
- Currency dropdown options are hardcoded in Russian (`"₽ Рубль (RUB)"` etc.) — pull from `t("currencies.*")` (these keys already exist per `ProjectSettings.tsx`).

### 11. Currency duplication fix
- Search every render of `{value} {currency}` where `value` was already passed through a formatter that includes the currency symbol. Audit: `Dashboard.tsx`, `KeyMetrics.tsx`, `LogisticsTariffs.tsx`, `ProductsManagement.tsx`, all `*Charts.tsx`, `metric-validation-badge.tsx`. Standard rule: always use `formatCurrency(value, currency)` from `src/utils/metricsCalculations.ts` (or add a single helper in `src/lib/utils.ts` if missing) — never concatenate `${value} ${currency}` after already‑formatted output.
- For Settings currency dropdown specifically: ensure the `SelectValue` shows `t(\`currencies.${currency}\`)` once, not `currency + " " + label`.

### 12. `src/pages/Auth.tsx`
- Wire `useTranslation` and replace every visible string + every `toast.success/error` literal with `t("auth.*")`. Tabs ("Вход"/"Регистрация"), labels, placeholders, button states, success/error toasts, password hint.
- "Sign in to export" lives in `ExportDialog.tsx` (or wherever the prompt is rendered) — translate via `t("auth.signInToExport")`; redirect already navigates to `/auth`.

### 13. Dropdown hover CSS fix
- Add to `src/index.css` (or the shadcn select item styles in `components/ui/select.tsx`):
  ```css
  [data-radix-select-item][data-highlighted],
  [data-radix-dropdown-menu-item][data-highlighted] {
    color: hsl(var(--accent-foreground));
    background-color: hsl(var(--accent));
  }
  ```
  This fixes invisible text on hover globally for Radix-based selects/dropdowns (covers logistics tariffs and any others).

### 14. i18n fallback chain
- `src/i18n/LanguageProvider.tsx` already falls back: selected → `DEFAULT_LANGUAGE` (`ru`) → key. Per PRD, EN/RO should NOT fall back to RU. Change `lookup` order to: selected → `en` → key. Russian remains fully covered because we add all keys to `ru` too.

---

## QA plan (executed after implementation)

For each language (EN, RO, RU):
1. Open every tab listed in the PRD §9.
2. Visually scan for Cyrillic in EN/RO (regex `/[А-Яа-яЁё]/` against rendered DOM via session replay sample).
3. Open every dropdown — confirm hover keeps text legible.
4. Switch business type & currency in Settings — confirm toast text and key-indicator chips translate.
5. Trigger sign-in-to-export, login validation errors — confirm translated.
6. Check no `MDL MDL` / `RON RON` anywhere.

---

## Out of scope (per PRD)
- Unit economics formulas, scenario calc, DB schema, auth logic, export logic (except labels), visual layout (except dropdown contrast).

---

## Risk & mitigation
- Large surface area (~200+ string replacements across ~20 files). Mitigated by doing it in one pass with the dictionary additions and `useTranslation` wiring done first, then mechanical string replacement file by file.
- Removing RU fallback could expose any missed key as a raw `section.key` string in EN/RO. Mitigated by adding every needed key in all three languages in step 1, before flipping the fallback.
