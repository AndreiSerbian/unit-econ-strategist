# Full Translation QA Audit — RU / EN / RO

## 1. Executive Summary

- **Overall localization status: ~70%** (up from ~50% before recent passes)
- **RU status:** 100% functional (default language, no fallback issues)
- **EN status:** ~70% — broken in Theory > Strategy reference, Products forms, Metric Relationship Analyzer
- **RO status:** ~70% — same gaps as EN, mirrors EN dictionary structure
- **Main blockers:**
  1. **`t()` lookup is shallow (2 segments only)** — root cause of `strategies.price-war.name` rendering raw
  2. **`businessTypeMetrics.ts`** — 120 of 124 product/metric field labels have no `labelKey` (hardcoded RU)
  3. **`MetricRelationshipAnalyzer` + sub-components** — none use `useTranslation`
- **Highest-risk components:** `StrategyDictionary.tsx`, `ProductsManagement.tsx`, `MetricRelationshipAnalyzer.tsx`, `businessTypeMetrics.ts` (config)

## 2. Critical Issues (P0)

| Pri | File | Area | Problem | Example | Fix |
|-----|------|------|---------|---------|-----|
| P0 | `src/i18n/LanguageProvider.tsx` | i18n core | `lookup()` does `path.split(".")` and destructures only `[section, key]`, dropping further segments | `t("strategies.price-war.name")` → looks up `strategies["price-war"]` (undefined), `.name` ignored | Make lookup walk the full path OR change strategies dictionary to nested objects |
| P0 | `src/i18n/dictionary.ts` (lines 1765-1810, 3558-…, 5351-…) | strategies section | Keys stored as flat dotted strings `"price-war.name"` instead of nested objects — incompatible with shallow lookup | All 11 strategies × 4 fields × 3 langs = 132 broken keys visible in UI | Either (a) fix lookup to walk arbitrary depth, or (b) restructure section to `{ "price-war": { name, desc, when, risks } }` |

**Recommended:** fix the lookup function (one place, future-proof) AND keep dotted keys working — easiest is to first try full-depth walk on nested objects, then fall back to flat dotted-string lookup. This unbreaks strategies without touching the 132 entries.

## 3. Raw Translation Keys Visible in UI

| File | Visible Key | Cause | Dict Status | Fix |
|------|-------------|-------|-------------|-----|
| `StrategyDictionary.tsx` | `strategies.price-war.name` (and 11 strategies × {name, desc, when, risks}) | Shallow lookup drops `.name` segment | Keys exist as flat `"price-war.name"` strings under `strategies` | Fix lookup (see P0) |

No other raw-key leaks confirmed in audit.

## 4. Mixed-Language Screens

| Screen | File(s) | Languages mixed | Severity | Fix |
|--------|---------|-----------------|----------|-----|
| Strategy reference cards | `StrategyDictionary.tsx` | EN UI labels + raw keys + RU `description` micro-text in impact cells | P0 (raw keys) + P2 (impact descriptions still RU-only by design comment) | Fix P0 first; then add `strategies.<id>.impact.{revenue,cac,ltv,margin}` keys |
| Product forms (per business type) | `ProductsManagement.tsx` consuming `businessTypeMetrics.ts` | EN section title, RU field labels (Название, Цена, Себестоимость, Качество, Логистика, Вес, Объём, Тип доставки) | P1 | Add `labelKey` to all 120 fields in `businessTypeMetrics.ts` + dictionary entries |
| Metrics charts / scenario tables | `MetricsCharts.tsx`, `ScenarioSummary.tsx`, `KeyMetricsComparison.tsx` | Components use `useTranslation` but some chart titles/legend labels still RU | P1 | Audit individual `t()` call sites; add missing dictionary keys |
| Metric Relationship Analyzer | `MetricRelationshipAnalyzer.tsx` + `src/components/metric-analyzer/*.tsx` | Whole UI in RU; metric IDs (revenue, cac, ltv) shown raw | P1 | Add `useTranslation`; metric IDs OK as technical identifiers but should also expose human labels via `metricLabels.<id>` |

## 5. Remaining Hardcoded Russian UI (high-impact only)

| File | Approx count | Examples | Class | Pass |
|------|---:|----------|-------|------|
| `src/config/businessTypeMetrics.ts` | 120 | "Название плана", "Цена подписки", "Себестоимость", "Churn Rate" | Config-driven labels | QA-Fix-2 |
| `src/components/MetricRelationshipAnalyzer.tsx` | ~15 | "Анализ связей метрик", "Обзор", "Проверки", "Гипотезы", "Карта связей метрик", "Недостающие данные" | Page UI | QA-Fix-4 |
| `src/components/metric-analyzer/*.tsx` (6 files) | ~40 | Tab content, table headers, empty states | Page UI | QA-Fix-4 |
| `StrategyDictionary.tsx` impact cell descriptions | 44 (11×4) | "Рост объёма продаж за счёт низких цен" | Strategy impact micro-text (intentionally deferred per source comment) | QA-Fix-3 |

A full `rg "[А-Яа-яЁё]" src/components src/pages src/config` scan should be run after P0/P1 to enumerate the long tail (mostly low-priority toast strings, validation messages).

## 6. Components Missing `useTranslation()`

| File | User-facing text | Action |
|------|------------------|--------|
| `src/components/MetricRelationshipAnalyzer.tsx` | All UI in RU | Add hook, translate |
| `src/components/metric-analyzer/ChecksTable.tsx` | Table headers, status labels | Add hook |
| `src/components/metric-analyzer/CompetitorsComparison.tsx` | Section headers | Add hook |
| `src/components/metric-analyzer/HypothesesCards.tsx` | Card titles, action text | Add hook |
| `src/components/metric-analyzer/MissingDataPanel.tsx` | "Заполните…", "Разблокирует…" | Add hook + interpolation key |
| `src/components/metric-analyzer/RelationshipMap.tsx` | Map node labels | Add hook |

(Full audit of remaining ~140 components in `src/components` deferred to QA-Fix-5; spot-checks suggest the major surfaces already have the hook.)

## 7. Dictionary Gaps (P0 + P1 immediate needs)

| Section | Missing key | RU | EN | RO |
|---------|-------------|----|----|----|
| `strategies` | (functional, but lookup broken — see P0) | ✓ | ✓ | ✓ |
| `businessTypeMetrics` | `field_name`, `field_price`, `field_cost`, `field_quantity`, `field_quality`, `field_logistics_to_client`, `field_weight`, `field_volume`, `field_delivery_type`, `field_churn_rate`, `field_mrr`, … (~120 keys) | needed | needed | needed |
| `metricAnalyzer` | `title`, `tabOverview`, `tabChecks`, `tabCompetitors`, `tabHypotheses`, `relationshipMap`, `missingData`, `unlocksChecks` (with `{count}`) | needed | needed | needed |
| `metricLabels` (new section) | `revenue`, `avgCheck`, `conversionRate`, `totalClients`, `totalLeads`, `profitMargin`, `cac`, `repeatRate`, `ltv`, `purchaseFrequency` | needed | needed | needed |

## 8. Chart/Table Localization Issues

| File | Issue | dataKey risk? | Fix |
|------|-------|---------------|-----|
| `MetricsCharts.tsx` | "CAC и CPL по сценариям", "Сценарий A/B" still appear | No (titles, not dataKeys) | Add chart title keys |
| `ScenarioSummary.tsx` | "Точка безубыточности и прибыльность", "Сравнительная таблица показателей" | No (titles + headers) | Add keys |
| `KeyMetricsComparison.tsx` | "Показатель", "Точка безубыточности", "Прибыль на оплату", "Маржа прибыли" | No (display labels) | Add keys |

**No internal `dataKey` should be changed** — only display strings.

## 9. Config-Driven Localization Issues

| Config | Issue | Consumer | Fix |
|--------|-------|----------|-----|
| `src/config/businessTypeMetrics.ts` | 120/124 `label` entries lack `labelKey` | `ProductsManagement.tsx`, dashboard tabs | Add `labelKey` to every `label`; consumer should prefer `t(labelKey) ?? label` |
| `src/config/metricTooltips.ts` | (verify) likely RU-only | `MetricInfoTooltip` | Audit + add language-aware lookup |
| `src/config/summaryMetricTooltips.ts` | RU-only tooltips, hardcoded "Источник:" prefix in `metric-info-tooltip.tsx` | Summary cards | Translate; make "Источник" a t() key |

## 10. Safe Fix Plan

### Pass QA-Fix-1: Critical broken lookup (P0, ~15 min, safest)
- Edit `src/i18n/LanguageProvider.tsx`:
  - Replace `lookup()` with a function that walks the full dotted path through nested objects, then **also** tries the flat dotted-key lookup at section level (so existing `"price-war.name"` flat keys keep working).
- **Result:** all 132 strategy strings render correctly in RU/EN/RO with zero dictionary edits.
- No formula/data/schema changes.

### Pass QA-Fix-2: Product forms via `businessTypeMetrics.ts` (P1)
- Add `labelKey` to every field/metric entry in `businessTypeMetrics.ts` (~120 entries).
- Add corresponding `businessTypeMetrics.field_*` keys in RU/EN/RO.
- Verify `ProductsManagement.tsx` and any other consumer uses `t(labelKey) ?? label`.
- No data-shape changes (`label` stays as RU fallback).

### Pass QA-Fix-3: Strategy impact descriptions (P2)
- Add `strategies.<id>.impact.{revenue,cac,ltv,margin}` keys for all 11 strategies × 3 langs.
- Update `StrategyDictionary.tsx` to read description via `t()` instead of inline RU `description` field.

### Pass QA-Fix-4: Metric Relationship Analyzer (P1)
- Add `useTranslation` to `MetricRelationshipAnalyzer.tsx` and 6 files in `src/components/metric-analyzer/`.
- Add `metricAnalyzer.*` and `metricLabels.*` dictionary sections in RU/EN/RO.
- Keep internal metric IDs unchanged in code; only display label is localized.

### Pass QA-Fix-5: Long tail (P2/P3)
- Scan `rg "[А-Яа-яЁё]" src/components src/pages` and triage: toasts, validation messages, tooltips, empty states.
- Localize `summaryMetricTooltips.ts` and `metric-info-tooltip.tsx` ("Источник:" hardcoded).

## 11. Do Not Change

Audit confirms no changes are needed to: financial formulas, unit-economics calculations, Cash Flow logic, competitor/market scoring, scenario logic, data aggregation, chart `dataKey` strings, Supabase schema/tables, edge function payloads, route paths, internal calculation keys, competitor/market object keys, scenario internal IDs, business-model internal IDs, saved project data format, or the 7-tab dashboard structure.

## Build Verification

`npm run build`: **not run** — this is an audit-only pass with no code changes. Build verification will run automatically when you approve QA-Fix-1.

---

**Recommended next action:** approve **QA-Fix-1 only** first (15-min, single-file change in `LanguageProvider.tsx`) — this immediately resolves the most visible critical bug (raw `strategies.*` keys in UI) without touching any other code. Then triage QA-Fix-2…5 in priority order.
