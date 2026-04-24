# Conference Readiness Implementation

Scope: stability + clarity polish only. No DB migrations, no IA changes, no new business types, no deep refactor.

## 1. Cash Flow edit-line stub — disable safely

**`src/components/cashflow-timeline/CashFlowTimelineManager.tsx`**
- Remove `handleEditLine` `console.log` stub.
- Stop passing `onEditLine` to `CashFlowGrid` (or pass a no-op).

**`src/components/cashflow-timeline/CashFlowGrid.tsx`**
- Make `onEditLine` prop optional.
- Wrap the Pencil edit button in a `Tooltip`, set `disabled`, tooltip text:
  *«Редактирование строк Cash Flow будет доступно в будущей версии.»*
- Keep inline cell editing (`EditableCell`) and the delete button untouched.

## 2. Subjective Estimate Badge

**New: `src/components/ui/subjective-estimate-badge.tsx`**
- Small neutral `Badge variant="outline"` with `Info` icon + text «Субъективная экспертная оценка».
- Wrapped in Tooltip with text: *«Этот результат основан на введённых пользователем предположениях или экспертной оценке, а не на проверенных внешних рыночных данных.»*
- Reusable, no props beyond optional `className`.

**Mount points (header-level only, in `Dashboard.tsx`):**
- Конкуренты tab — next to "Анализ конкурентов" CardTitle.
- Рынок tab — at top of the tab content (single banner above MarketOverview), covering: MarketOverview, CompetitiveMap, CompetitiveRanking, CompetitiveScoreCalculator, QualityComparison/ServiceQualityAssessment, SWOTAnalysis, BusinessTypeMetricsComparison.
- Do NOT add to: KeyMetrics, MarketingMetrics, ROI/LTV calculators, ScenarioComparison, Cash Flow, summary cards.

## 3. Startup Checklist

**New: `src/components/StartupChecklist.tsx`**
- Collapsible card titled «Что заполнить сначала».
- Manual checkboxes (informational only, no completion detection).
- State persisted in `localStorage` per project: `startup-checklist:{projectId}` (checked items + dismissed flag).
- Dismiss button + a "Показать чеклист" button to reopen.
- Steps adapted by `businessType`:
  - SaaS: добавить SaaS-продукт и тарифы → расходы → источники лидов → проверить показатели → сравнить сценарии → открыть «Итоги».
  - E-commerce / Production: добавить товары → сырьё/логистику (если есть) → расходы → источники лидов → показатели → сценарии → итоги.
  - Services: добавить услуги и модели биллинга → расходы → источники лидов → качество услуг → показатели → сценарии → итоги.
  - Marketplace: добавить категории → источники лидов → расходы → показатели → сценарии → итоги.
  - Default: общий 6-шаговый список.

**Mount in `Dashboard.tsx`:**
- Inside `TabsContent value="company"` at the top (not above tabs), so it doesn't distract from other tabs.

## 4. Executive Summary Cards (Итоги tab)

All cards live in **`src/components/summary/`** as small, stable, read-only components reusing existing utilities.

**`CompanySummaryCard.tsx`**
- Props: `metrics`, `currency`.
- Reuses `calculateProfit`, `calculateProfitMargin`, `calculateCAC`, `calculateLTV`, `calculateLTVCACRatio`.
- KPI grid: Revenue, Profit, Margin %, CAC, LTV, LTV/CAC, Total clients, Avg check.
- Each KPI shows «Недостаточно данных» if value is 0/NaN/Infinity AND `metrics.detailedExpenses` is missing.
- If partial data: render the KPIs that are computable, label others.

**`CashFlowSummaryCard.tsx`**
- Props: `projectId`, `currency`.
- Uses `useCashFlowTimeline({ projectId })` and calls `fetchTimeline('current')` once on mount (single fetch, no loops).
- Renders only `summary` data (NPV, total inflow, total outflow, net CF, payback period in periods).
- Driver logic computed locally from `allLinesWithValues`: top inflow line, top outflow line, weakest period (min `netCashFlow`).
- If no timeline / all zero → «Недостаточно данных. Перейдите на вкладку Cash Flow и заполните данные.»
- IMPORTANT: this hook instance is independent of the Cash Flow tab's hook instance (separate state). Single `useEffect` with `[projectId]` deps avoids duplicate-fetch loops.

**`RiskSummaryCard.tsx`**
- Props: `metrics`, `cashflowSummary` (optional, passed from parent), `currency`.
- Rule-based risks (each rendered only when triggered):
  - LTV/CAC < 1 → «Высокий риск: CAC превышает LTV».
  - LTV/CAC ≥ 1 && < 3 → «Внимание: LTV/CAC ниже целевого 3:1».
  - Profit margin < 0 → «Бизнес работает в убыток».
  - Profit margin ≥ 0 && < 10 → «Низкая маржа».
  - Cash flow NPV < 0 → «Отрицательный NPV проекта».
  - Cash flow has weakest period < 0 → «Кассовый разрыв в периоде N».
  - newClients == 0 && totalClients > 0 → «Нет новых клиентов — рост остановлен».
- If no risks triggered → «Существенных рисков по введённым данным не обнаружено».
- If no metrics → «Недостаточно данных».

**`RecommendationSummaryCard.tsx`**
- Props: `metrics`, `cashflowSummary` (optional), `currency`.
- Rule-based recommendations mirroring risks:
  - LTV/CAC < 3 → «Снизить CAC или увеличить LTV (повысить retention/avg check)».
  - Profit margin < 10 → «Пересмотреть структуру переменных расходов».
  - NPV < 0 → «Пересмотреть допущения сценария или горизонт планирования».
  - newClients == 0 → «Активизировать каналы привлечения, проверить конверсию».
  - Conversion rate < 1 → «Низкая конверсия — улучшить воронку».
  - Always (if data is present): «Сравните оптимистичный/пессимистичный сценарий ниже».
- Each recommendation tied to a visible metric (label shown).
- «Недостаточно данных» if no metrics.

**Mount in `Dashboard.tsx` Итоги tab:**
- Order: CompanySummaryCard → CashFlowSummaryCard → RiskSummaryCard → RecommendationSummaryCard → existing ScenarioComparison → ActionPlanManager → AIAnalytics → collapsible (history/forecast).
- Pass `cashflowSummary` from CashFlowSummaryCard down via lifted state in Dashboard? No — to keep coupling minimal, RiskSummaryCard and RecommendationSummaryCard each call `useCashFlowTimeline` independently for the `current` scenario. To avoid 3× fetches, instead **lift one shared call**: create a tiny inline component grouping the three cards, or have CashFlowSummaryCard fetch and pass `summary` to siblings via a wrapper. **Decision:** add a `SummarySection` wrapper component in `src/components/summary/SummarySection.tsx` that owns the single `useCashFlowTimeline` call and renders all four cards, passing `summary` + `weakestPeriod` to Risk + Recommendation cards.

So the actual mount becomes a single `<SummarySection metrics={currentMetrics} projectId={projectId} currency={currency} />` block before ScenarioComparison.

## 5. Demo Data — manual template only

**New: `docs/CONFERENCE_DEMO_DATA.md`**
Realistic sample data for E-commerce and SaaS (one of each), enough to populate the demo path:
- Project setup (name, business type, currency).
- 2–3 products (E-comm) with name/price/cost/quantity/quality.
- 2 SaaS plans with name/price/subscribers/churn.
- Detailed expenses: fixed (rent, salaries) + variable marketing (traffic) + sales bonuses.
- Lead sources: 1 paid (cost, leads, conversion) + 1 organic (with `indirectCost`).
- 1 competitor with revenue/marketShare/quality.
- Cash Flow: defaults are auto-generated; just open the tab.
- Suggested narrative for the demo.

No seed button, no DB scripts.

## 6. Files changed

**New (6):**
- `src/components/ui/subjective-estimate-badge.tsx`
- `src/components/StartupChecklist.tsx`
- `src/components/summary/CompanySummaryCard.tsx`
- `src/components/summary/CashFlowSummaryCard.tsx`
- `src/components/summary/RiskSummaryCard.tsx`
- `src/components/summary/RecommendationSummaryCard.tsx`
- `src/components/summary/SummarySection.tsx`
- `docs/CONFERENCE_DEMO_DATA.md`

**Edited (3):**
- `src/components/cashflow-timeline/CashFlowTimelineManager.tsx` — remove stub, drop onEditLine handler.
- `src/components/cashflow-timeline/CashFlowGrid.tsx` — disable edit button + tooltip.
- `src/components/Dashboard.tsx` — mount StartupChecklist in Моя компания tab, mount badge banners in Конкуренты + Рынок, replace top of Итоги tab with `<SummarySection />`.

## 7. Constraints respected

- ✅ No DB migrations, no schema changes, no IA changes, no new business types.
- ✅ No deep Dashboard refactor (only adds + 2 banner spots + summary mount).
- ✅ Causal architecture preserved (cards consume existing metrics & cash flow hook only).
- ✅ AI Analytics remains optional / unchanged.
- ✅ Badge not applied to internal computed metrics (CAC/LTV/margin/revenue/profit/cash flow/scenario comparison).
- ✅ CashFlowSummaryCard fetches once via lifted hook in `SummarySection` — no duplicate fetches across the 4 cards.
- ✅ Cash Flow tab state untouched; Итоги has its own hook instance.

## 8. Out of scope (per user)

- Full Cash Flow edit dialog.
- MarketPositionCard.
- Demo seed button / dev mode.
- Deep refactor of CompanyMetrics input/display split (Phase 1B already done).
