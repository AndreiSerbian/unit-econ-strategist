
# Pass 2B — Implementation Plan (approved scope)

Scope is exactly the 14 files listed in the user's prompt. RU stays as fallback everywhere. No formula, schema, route, or internal-key changes.

## Files to modify

1. `src/i18n/dictionary.ts` — extend with new sections (RU/EN/RO).
2. `src/config/businessTypeMetrics.ts` — add optional `*Key` fields, keep RU as fallback.
3. `src/components/ProductsManagement.tsx` — translate productLabel, field labels, field descriptions, delivery options via `*Key`.
4. `src/components/MetricsForm.tsx` — only the spots reading `metricFields` `label/description` from config → use `*Key` if present.
5. `src/components/DetailedExpensesForm.tsx` — only spots reading config text (none currently consume metricFields visibly; verify and skip if none).
6. `src/components/KeyMetrics.tsx` — t() title + 4–6 hint strings + breakeven suffix.
7. `src/components/SalesFunnel.tsx` — title, stage names, conversion text, CPL/CAC labels, source type labels, "лидов" suffix, sources title.
8. `src/components/AIAnalytics.tsx` — already mostly localized; nothing left except `console.error` (kept as English log).
9. `src/components/ExportDialog.tsx` — translate CSV header rows + competitor expense category strings.
10. `src/components/CompanyMetrics.tsx` — TabsTrigger labels (Текущий / Сценарий A / Сценарий B).
11. `src/components/ScenarioSummary.tsx` — full t() for visible UI + recommendation generator strings + toasts.
12. `src/components/MetricsCharts.tsx` — translate visible card titles/descriptions, scenario `name` field on chart data, costs breakdown `name`. Add `name=` props on `<Bar/>`/`<Line/>` so legend/tooltip show translated text. **Keep Cyrillic `dataKey`s untouched** (they are series identifiers in JSX). Pie labels render from `entry.name` which we translate at data construction.
13. `src/components/summary/CompanySummaryCard.tsx` — t() for description, all 8 KPI labels, "Недостаточно данных" fallback.
14. `src/components/summary/CashFlowSummaryCard.tsx` — t() for description, all metric labels, payback pluralization (3 forms via t), top-inflow/outflow/weakest-period labels, loading state.
15. `src/components/summary/RecommendationSummaryCard.tsx` — t() for descriptions, recommendation tags/texts.
16. `src/components/summary/RiskSummaryCard.tsx` — t() for descriptions, all risk text variants, no-risks state.
17. `src/components/summary/SummarySection.tsx` — no visible RU strings to change; structure stays.

## Dictionary sections (RU/EN/RO symmetrical)

New / extended sections:

- `summary` (extended ~60 keys): company KPI labels, cashflow labels, risk texts, recommendation tags + texts, scenario summary UI, payback period plural forms.
- `keyMetrics` (~10): titles, hints.
- `salesFunnel` (~12): stages, source types, labels.
- `charts` (~14): chart titles/descriptions, legend captions, scenario column names.
- `scenarios` (3): tab labels.
- `exportDialog` (extended ~40): CSV header columns + competitor expense category items.
- `businessTypeMetrics` (~36): per-business-type label/description/productLabel/productLabelPlural + delivery options.

Estimated ~175 new keys × 3 languages = ~525 entries.

## businessTypeMetrics.ts changes

Add optional fields to existing interfaces (no removal):
```ts
labelKey?: string;
descriptionKey?: string;
productLabelKey?: string;
productLabelPluralKey?: string;
```

For each `BusinessTypeConfig` entry, add the 4 keys (e.g. `labelKey: 'businessTypeMetrics.saas_label'`).

For `DELIVERY_TYPE_OPTIONS`, add `labelKey: 'businessTypeMetrics.delivery_courier'` etc.

Add helper:
```ts
export const getProductLabelKey = (type: BusinessType, plural = false) => {
  const c = getBusinessTypeConfig(type);
  return plural ? c.productLabelPluralKey : c.productLabelKey;
};
```

Field-level `*Key` for individual `productFields`/`metricFields` is NOT added in this pass — they would require adding ~120 dictionary keys × 3 languages just for field labels and risk over-running. **ProductsManagement.tsx's field-level labels are translated via a small mapping inside the component** keyed by `field.key` (limited to common keys: `name/price/cost/quantity/quality/...`) using existing `forms.*` / `common.*` / `metricsForm.*` keys. Where no mapping exists, fall back to original Russian `field.label` → preserves RU UI.

This trade-off is documented in the final report.

## MetricsCharts approach

- Keep all `dataKey="выручка"` etc. (they are stable JSX identifiers and chart data keys — out of scope).
- Add `name={t("charts.legendRevenue")}` to each `<Bar />` / `<Line />` so legend/tooltip render translated strings while internal keys stay Cyrillic.
- Translate `data[].name` (scenario column label) at render time using `t("charts.scenarioCurrent" | "scenarioA" | "scenarioB")`.
- Translate Pie `costsBreakdownData[].name` similarly.
- Card titles/descriptions translated via t().

## ExportDialog

- All hardcoded CSV header row strings, competitor expense category strings ("Постоянные", "Переменные - Маркетинг", "ЗП по старым клиентам", etc.) → `t("exportDialog.csv*")`.
- Numerical values, dataKeys, file format, currency logic untouched.

## ScenarioSummary special case

The string `"Резюме сохранено"`, generator outputs (`"⚠️ Отрицательная маржа..."`, etc.), placeholders, button labels — all translated via `summary.*` keys.

## Mobile safety

Only minor utility classes if EN/RO overflow: `text-sm`, `truncate`, `whitespace-normal`, `min-w-0`. No layout redesign.

## What is NOT touched

- Financial formulas, calc utilities (`metricsCalculations.ts` not edited).
- Cash Flow internal logic, hooks.
- Supabase schema / queries / column names.
- Edge Function (`ai-analytics`) payload, model, prompt structure (only the existing `language` field passed in).
- Routes, internal IDs, scenario/business model keys, chart `dataKey`s, saved data format, 7-tab structure.
- Forecasting / SWOT / ROI / LTV / Sensitivity / Onboarding / GameTheory / Market / Competitor deep UI / ProjectSettings / MarketingMetrics / Theory texts.

## Acceptance

- Switching RU/EN/RO updates: KeyMetrics labels, SalesFunnel labels, Summary cards, ExportDialog (incl. CSV headers), Charts legend/tooltips/titles, ScenarioSummary, CompanyMetrics tab labels, Product business-model labels (via `*Key`).
- `getProductLabel()` / `getBusinessTypeConfig()` continue to work for any code not yet upgraded — RU fallback intact.
- No data reset on language change. Active tab preserved. Build passes.

## Final report after implementation

Files modified, dictionary sections + key counts, fully vs partially localized, remaining hardcoded RU per file (most importantly: per-field labels inside `businessTypeMetrics.ts` `productFields[].label`/`metricFields[].label` for fields with no mapping match), `businessTypeMetrics.ts` compatibility status, mobile risks, build status, and proposed Pass 2C scope.
