## Goal

Localize the entire "Metrics" form block (Revenue/Clients/Conversion/Expenses) in `MetricsForm.tsx` to RU/EN/RO. Currently most strings already use `t(...)`, but card titles and field labels coming from `config.labels.*` (revenue, clients, avgCheck) are hardcoded in Russian and never translated, so when the user switches to EN or RO they still see "Выручка / Покупатели / Средний чек (AOV) / MRR / ARPU" etc.

## Scope (visible block)

The 4 cards inside `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">` at line 304 of `src/components/MetricsForm.tsx`:
1. Revenue & income (uses `config.labels.revenue`, `config.labels.avgCheck`)
2. Clients (uses `config.labels.clients`)
3. Conversion & LTV (already fully via `t`)
4. Expenses (already fully via `t`)

## Changes

### 1. `src/config/businessTypeMetrics.ts`
Add `labelKey` siblings on every `labels` object so translations can be resolved, e.g.:

```ts
labels: {
  revenue: 'MRR',
  revenueKey: 'businessTypeMetrics.saas_label_revenue',
  clients: 'Активные подписчики',
  clientsKey: 'businessTypeMetrics.saas_label_clients',
  avgCheck: 'ARPU',
  avgCheckKey: 'businessTypeMetrics.saas_label_avgCheck',
  conversion: 'Trial → Paid конверсия',
  conversionKey: 'businessTypeMetrics.saas_label_conversion',
  retention: 'Retention Rate',
  retentionKey: 'businessTypeMetrics.saas_label_retention',
},
```

Repeat for all 8 business types: `saas`, `ecommerce`, `production`, `services`, `freemium`, `sharing`, `marketplace`, `token_saas`. Update the `BusinessTypeConfig.labels` TS interface to include the optional `*Key` fields.

### 2. `src/i18n/dictionary.ts`
Add a new `businessTypeMetrics.{type}_label_{revenue|clients|avgCheck|conversion|retention}` set in each of the three sections (`ru`, `en`, `ro`). Russian values mirror the existing config strings; English and Romanian use standard equivalents already used in the app's glossary (e.g. SaaS clients → "Active subscribers" / "Abonați activi"; AOV → "Average order value" / "Valoare medie comandă"; Take Rate → "Take Rate" kept as-is, etc.).

### 3. `src/components/MetricsForm.tsx`
Use `resolveI18nText(t, config.labels.revenue, config.labels.revenueKey) || t("metricsForm.revenueAndIncome")` (same helper pattern already used in `ProductsManagement.tsx`) for:
- Card 1 title (line 309) and avgCheck label (line 333)
- Card 2 title (line 354) and total clients label (line 359)

No layout, no logic, no calculation changes.

### 4. Number formatting
Replace the hardcoded `toLocaleString("ru-RU")` for displayed values inside this block with `language`-aware locale (`ru-RU` / `en-US` / `ro-RO`) using the `language` from `useTranslation()`, matching what `MarketingMetrics.tsx` already does. This keeps thousand separators consistent with the chosen UI language.

## Out of scope

- The `productsIntegration` sync card above this block is already fully translated.
- Business-type-specific extra metrics card below (SaaS/E-commerce/etc.) — already uses `t()` keys that exist in all three languages.
- No edits to other forms or charts.
