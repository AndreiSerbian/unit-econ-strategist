## Goal

Add small Info-icon tooltips next to key metric labels in three summary components, explaining for each metric: what it is, how it's calculated (matching the actual project code), and where the numbers come from.

No calculation logic, schema, IA, or dependencies change. Existing global `TooltipProvider` in `src/App.tsx` is reused.

## Files to be created

### 1. `src/config/summaryMetricTooltips.ts`

Single source of truth for tooltip content. Exports `SUMMARY_METRIC_TOOLTIPS` (keyed map) and `getSummaryTooltip(key)`. Each entry has `title` (bilingual where applicable: RU + EN + acronym), short `description`, simplified `formula`, and `source` (where in the app the inputs come from).

Keys covered (exactly the metrics the user asked for):

- `cac`, `cpl`, `breakeven`, `profitPerClient`, `profit`, `margin`, `ltv`, `ltvCac`
- `revenue`, `totalClients`, `avgCheck`
- `totalInflow`, `totalOutflow`, `netCashFlow`, `npv`, `payback`

Formulas verified against current code:

- `CAC = (marketing + bonusNewClients) / newClients` — from `calculateCAC` in `metricsCalculations.ts`.
- `CPL = marketing / leads`, `leads = newClients / conversionRate` — from `calculateCPL`.
- `Breakeven = fixedTotal / (avgCheck − variablePerClient)` — from `calculateBreakeven`.
- `Profit = revenue − (fixed + variable + marketing)` — from `calculateProfit`.
- `Margin = profit / revenue × 100%` — from `calculateProfitMargin`.
- `LTV = avgCheck × purchaseFrequency × customerLifetimeMonths` — from `calculateLTV`.
- `NPV = Σ NCFₜ / (1 + r)ᵗ`, `Payback = first period where cumulative NCF ≥ 0` — from `useCashFlowTimeline.ts`.

NPV/payback descriptions are explicitly framed as simplified estimates, not guarantees.

### 2. `src/components/ui/metric-info-tooltip.tsx`

Reusable `MetricInfoTooltip` component:

- Renders a small lucide `Info` icon (w-3 h-3, muted color) inside a `<button>` trigger so it's focusable on mobile.
- Uses existing `Tooltip` / `TooltipTrigger` / `TooltipContent` from `src/components/ui/tooltip.tsx` (global `TooltipProvider` already in `App.tsx`).
- Props: `metricKey?` (auto-loads from config), or explicit `title`/`description`/`formula`/`source`.
- Fail-safe: if no content resolves, returns `null` (won't break rendering).
- Compact content: title (bold), description, formula (mono in muted box), source ("Источник: …").

## Files to be edited (label-only changes, no logic)

### 3. `src/components/KeyMetrics.tsx`

Add `<MetricInfoTooltip metricKey="…" />` next to the label `<p>` for each KPI tile:

- CAC → `cac`
- CPL → `cpl`
- Безубыточность → `breakeven`
- Прибыль → `profitPerClient` (this tile shows profit-per-client; description matches)
- LTV → `ltv`
- LTV/CAC → `ltvCac`

### 4. `src/components/summary/CompanySummaryCard.tsx`

Extend the `kpis` array entries with an optional `tooltipKey` and render the icon next to each label inside the existing `kpis.map(...)` block:

- Выручка → `revenue`
- Прибыль → `profit`
- Маржа → `margin`
- CAC → `cac`
- LTV → `ltv`
- LTV / CAC → `ltvCac`
- Всего клиентов → `totalClients`
- Средний чек → `avgCheck`

### 5. `src/components/summary/CashFlowSummaryCard.tsx`

Extend the `items` array entries with `tooltipKey` and render the icon next to each label:

- Всего притоков → `totalInflow`
- Всего оттоков → `totalOutflow`
- Чистый денежный поток → `netCashFlow`
- NPV → `npv`
- Окупаемость → `payback`

## Constraints honored

- Zero changes to `metricsCalculations.ts`, `useCashFlowTimeline.ts`, types, schema, or tabs.
- No new npm dependencies (uses existing Radix Tooltip + lucide).
- Tooltips added only in the three listed files; SaaS, marketplace, competitor, detailed forms untouched.
- Bilingual titles for CAC, LTV, NPV (and others where natural).
- No threshold claims (e.g. no "LTV/CAC must be ≥ 3").
- Mobile: Radix Tooltip on a focusable `<button>` opens on tap/focus.
- Demo path Моя компания → Показатели → Cash Flow → Итоги → Теория stays intact.

## Post-implementation report

After implementing I will return: changed files, list of metrics that received tooltips, `tsc --noEmit` clean confirmation, confirmation no calculation logic changed, and remaining risks.
