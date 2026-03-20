

## Final Implementation Plan: Platform IA Restructuring

### Target Tab Structure (7 tabs)

```text
Tab 1: Моя компания     (input only)
Tab 2: Показатели        (derived company analytics)
Tab 3: Cash Flow         (timeline + explainability)
Tab 4: Конкуренты        (input only, minimal charts)
Tab 5: Рынок             (all comparative analytics)
Tab 6: Итоги             (executive summary)
Tab 7: Теория            (game theory, reference — stays separate)
```

---

### Component Action Matrix

| Component | Current Tab | Target Tab | Action | Reason |
|-----------|-------------|------------|--------|--------|
| `ProductsManagement` | Products | Моя компания | **keep** | Core input |
| `SaasProductsManager` | Products | Моя компания | **keep** | Core input |
| `TokenSaasManager` | Products | Моя компания | **keep** | Core input |
| `MarketplaceManager` | Products | Моя компания | **keep** | Core input |
| `RawMaterialsManager` | Products | Моя компания | **keep** | Core input |
| `LogisticsTariffs` | Products | Моя компания | **keep** | Core input |
| `SalesChannelsManager` | Products | Моя компания | **keep** | Core input |
| `ProductMaterialsAllocation` | Products | Моя компания | **keep** | Core input |
| `ProductChannelBreakdown` | Products | Моя компания | **keep** | Core input |
| `ChannelAnalytics` | Products | Моя компания | **keep** | Local channel preview |
| `ServiceDeliveryPipeline` | Products | Моя компания | **keep** | Services input |
| `ProductsCharts` / `ServicesCharts` | Products | Моя компания | **keep** | Local product preview only |
| Inline logistics card (L688-764) | Products | Моя компания | **keep** | Local cost preview |
| `ProductComparison` | Products | **Рынок** | **move** | Comparison = market |
| `DetailedExpensesForm` | Metrics | **Моя компания** | **move** | Input, not analytics |
| `LeadSourcesForm` | Metrics | **Моя компания** | **move** | Marketing input |
| `DutiesAndTaxes` | Metrics | **Моя компания** | **move** | Input |
| `CompanyMetrics` | Metrics | Показатели | **refactor** | Remove embedded input forms; keep as read-mostly metrics display |
| `MetricsCharts` | Metrics | Показатели | **keep** | Derived analytics |
| `ExpensesBreakdownCharts` | Metrics | Показатели | **keep** | Derived analytics |
| `KeyMetricsComparison` | Metrics | Показатели | **keep** | Derived analytics |
| `ROICalculator` | Metrics | Показатели | **keep** | Derived analytics |
| `LTVCalculator` | Metrics | Показатели | **keep** | Derived analytics |
| `SensitivityAnalysis` | Metrics | Показатели | **keep** | Derived analytics |
| `ServiceFlowExplainer` | Metrics | Показатели | **keep** | Services context |
| `MarketingMetrics` | Analytics | **Показатели** | **move** | Derived company metrics |
| `CustomerJourney` | Analytics | **Показатели** | **move** | Funnel = company metrics |
| `CashFlowDiagram` | Analytics | **Показатели** | **move** | Summary cash flow view |
| `CompetitorAnalysis` | Competitors | Конкуренты | **keep** | Input stays |
| `CompetitorCharts` | Competitors | Конкуренты | **keep** | Basic input preview |
| `CompetitorKeyMetricsComparison` | Competitors | **Рынок** | **move** | Heavy comparison → market |
| `CompetitorROICalculator` | Competitors | — | **deprecate** | Duplicates ROICalculator logic |
| `BusinessTypeMetricsComparison` | Competitors | **Рынок** | **move** | Comparison → market |
| `CompetitiveScoreCalculator` | Competitors | **Рынок** | **move** | Scoring → market |
| `QualityComparison` | Competitors | **Рынок** | **move** | Quality comparison → market |
| `ServiceQualityAssessment` | Competitors | **Рынок** | **move** | Quality comparison → market |
| `SWOTAnalysis` | Competitors | **Рынок** | **move** | Analysis → market |
| `MarketOverview` | Market | Рынок | **keep** | Already correct |
| `CompetitiveMap` | Market | Рынок | **keep** | Already correct |
| `CompetitiveRanking` | Market | Рынок | **keep** | Already correct |
| `MetricRelationshipAnalyzer` | Analytics | **Рынок** | **move** | Multi-factor → market |
| `ScenarioSummary` ×3 | Analytics | **Итоги** | **merge** → single `ScenarioComparison` | 3 instances = duplication |
| `ActionPlanManager` | Analytics | **Итоги** | **move** | Summary layer |
| `AIAnalytics` | Analytics | **Итоги** | **move** | Summary layer |
| `MetricHistoryChart` | Analytics | **Итоги** (collapsible) | **move** | Secondary content |
| `MetricForecasting` | Analytics | **Итоги** (collapsible) | **move** | Secondary content |
| Market share IIFE ×5 | Dashboard inline | — | **refactor** → extract `useMarketShares()` hook | Same calc repeated 5× |
| `GameTheoryMatrix` | Game Theory | **Теория** | **keep** | Stays in separate tab |
| `StrategyDictionary` | Game Theory | **Теория** | **keep** | Stays in separate tab |
| `CompetitiveSimulator` | Game Theory | **Теория** | **keep** | Stays in separate tab |

**Totals: 1 deprecated, 1 merged (3→1), 1 refactored (CompanyMetrics), 1 extracted (useMarketShares), 14 moved, rest kept.**

---

### Marketing Linkage Model

#### Cost Taxonomy

```text
MARKETING COSTS (total)
├── Channel-Level Costs (per lead source)
│   ├── Paid: ad spend per source (trafficPurchase allocated)
│   ├── Organic: SEO budget, content cost (new optional indirectCost field)
│   └── Referral: referral program cost
│
├── Shared Marketing Overhead
│   ├── marketingSalary (from fixedCosts)
│   ├── CRM tools (from variableCosts.marketing.crmCosts)
│   ├── Contractors/agencies (contractorsPayment)
│   └── Custom marketing categories
│
└── Sales Costs (NOT marketing — excluded from CAC numerator by default)
    ├── bonusNewClients, bonusOldClients
    └── Sales payroll custom categories
```

#### CAC Distinction

| Metric | Formula | Costs Included |
|--------|---------|----------------|
| **Channel CAC** | channel spend / new clients from channel | Only that channel's direct spend |
| **Blended CAC** | (all channel costs + shared overhead) / total new clients | Channel + overhead, no sales |
| **Fully-loaded CAC** | (all marketing + sales costs) / total new clients | Everything including salaries & bonuses |

Implementation: `MarketingMetrics` component will display all three CAC variants. The `CustomerJourney` component will show cost-per-stage by connecting `leadSources` cost data to funnel stages.

Organic channels: each lead source gets an optional `indirectCost` number field (SEO/content/tools). Stored in existing `leadSources` array within metrics — no DB migration needed.

Salary allocation: `marketingSalary` is treated as shared overhead for blended/fully-loaded CAC. It does NOT inflate per-channel CPL.

---

### Scoring Hierarchy

```text
Layer 1: Product/Service Score (1–20)
├── Source: MANUAL (products.quality slider)
├── Services: optional 6-subfactor → composite (ServiceQualityAssessment)
├── Nature: SUBJECTIVE
├── Shown: Моя компания → product card

Layer 2: Company Score (1–20)
├── Source: AGGREGATED (weighted avg of product scores)
│   Weight = product revenue share (price × quantity / total revenue)
├── Override: user can set manually
├── Explainability: show "auto" vs "manual" badge
│   If auto: show "Рассчитано из N продуктов, веса по доле выручки"
│   List: Product A (score X, weight Y%), Product B (score X, weight Y%)
├── Stored: scenarios.business_metrics.companyQuality (JSONB)
├── Shown: Показатели → header card

Layer 3: Competitor Score (1–20)
├── Source: MANUAL (expert estimate)
├── Nature: SUBJECTIVE — labeled "экспертная оценка"
├── Shown: Конкуренты → competitor card

Layer 4: Market Comparison
├── Source: COMPUTED from Layers 1-3
├── Shown: Рынок → CompetitiveRanking, CompetitiveMap, unified quality charts
```

---

### Cash Flow Business Logic

#### Data Sources

| Inflows | Derived From | Auto/Manual |
|---------|-------------|-------------|
| Product revenue | products (price × qty) | **Auto** via adapter |
| SaaS MRR | saas_plans (subs × price) | **Auto** via adapter |
| Marketplace commission | categories (GMV × take_rate) | **Auto** via adapter |
| Token package sales | packages (sales × price) | **Auto** via adapter |
| Custom income | user-defined lines | **Manual** |

| Outflows | Derived From | Auto/Manual |
|----------|-------------|-------------|
| Salaries | detailedExpenses.fixedCosts.salary* | **Auto** |
| Rent | officeRent + warehouseRent | **Auto** |
| Marketing | marketingCosts | **Auto** |
| Taxes | detailedExpenses.taxes | **Auto** |
| Custom expenses | user-defined lines | **Manual** |

#### Scenario Effect
Each scenario creates a separate `cashflow_timeline`. Adapters pull from the active scenario's metrics.

#### Cash Flow ≠ Profit
Profit = accrual basis, single period. Cash Flow = cash basis over time (payment delays, upfront investments, working capital).

#### Decision Questions

| Question | Answer Location | Metric |
|----------|----------------|--------|
| Сколько заработаю? | Last period cumulative | Cumulative net cash flow |
| Когда окуплюсь? | Row turning positive | Payback period |
| Где кассовый разрыв? | Negative net flow periods | Min cumulative position |

#### Summary Driver Logic (for Итоги tab)

The `CashFlowSummaryCard` will show:
- **Top inflow source**: line with highest total amount across periods
- **Top outflow category**: line with highest total outflow
- **Weakest period**: period index with lowest net cash flow
- **Payback driver**: which inflow category contributes most to turning cumulative positive

---

### Summary Tab (Итоги) — Executive Design

```text
Tab 6: Итоги
├── CompanySummaryCard (NEW)
│   Revenue, profit, margin, avg check, total clients — KPI row, no charts
│
├── MarketPositionCard (NEW)
│   Company score vs avg competitor, market share, rank — KPI row
│
├── CashFlowSummaryCard (NEW)
│   NPV, payback, min cash, risk indicator (green/yellow/red)
│   + top inflow source, top outflow, weakest period, payback driver
│
├── RisksSummaryCard (NEW)
│   Top 3-5 risks from SWOT threats + negative CF + high CAC/LTV ratio
│
├── RecommendationsCard (NEW)
│   Top 3-5 actions from metric analysis checks
│
├── ActionPlanManager (MOVED)
│
├── AIAnalytics (MOVED)
│
└── [Collapsible: Дополнительно]
    ├── ScenarioComparison (MERGED from 3× ScenarioSummary)
    ├── MetricHistoryChart (MOVED)
    └── MetricForecasting (MOVED)
```

NOT in Итоги: no raw forms, no detailed charts, no competitive maps.

---

### Business-Priority Implementation Roadmap

#### Phase 1A: IA Cleanup Only (tab restructure, no logic changes)

1. Rename tabs in `Dashboard.tsx`: Products → Моя компания, remove Analytics tab, keep Theory separate
2. Move `DetailedExpensesForm`, `LeadSourcesForm`, `DutiesAndTaxes` into Моя компания
3. Move `MarketingMetrics`, `CustomerJourney`, `CashFlowDiagram` into Показатели
4. Move comparison components from Конкуренты to Рынок: `CompetitorKeyMetricsComparison`, `BusinessTypeMetricsComparison`, `CompetitiveScoreCalculator`, `QualityComparison`/`ServiceQualityAssessment`, `SWOTAnalysis`
5. Move `ProductComparison` from Products to Рынок
6. Move `MetricRelationshipAnalyzer` from Analytics to Рынок
7. Move `ScenarioSummary` ×3, `ActionPlanManager`, `AIAnalytics`, `MetricHistoryChart`, `MetricForecasting` into new Итоги tab
8. Keep `GameTheoryMatrix`, `StrategyDictionary`, `CompetitiveSimulator` in Теория tab

**Impact: Fixes user confusion about where to input vs where to analyze. Pure JSX reordering in Dashboard.tsx.**

#### Phase 1B: Deduplication Cleanup

1. Extract `useMarketShares(revenue, competitors)` hook — replaces 5 identical IIFEs
2. Remove `CompetitorROICalculator` from rendering (deprecated — `ROICalculator` covers this)
3. Merge 3× `ScenarioSummary` into single `ScenarioComparison` component showing all 3 scenarios side-by-side
4. Refactor `CompanyMetrics` — remove embedded input forms that were moved to Моя компания

**Impact: Eliminates duplicate logic, reduces Dashboard.tsx by ~150 lines.**

#### Phase 2: Summary Layer

1. Create `CompanySummaryCard` — KPI row from currentMetrics
2. Create `MarketPositionCard` — company score, market share, competitive rank
3. Create `CashFlowSummaryCard` — NPV, payback, risk indicator + driver logic (top inflow/outflow, weakest period)
4. Create `RisksSummaryCard` — derived from SWOT + metrics checks
5. Create `RecommendationsCard` — derived from metric analysis
6. Wire collapsible section for MetricHistoryChart + MetricForecasting

#### Phase 3: Marketing & Scoring

1. Add `indirectCost` field to organic lead sources
2. Display channel CAC / blended CAC / fully-loaded CAC in `MarketingMetrics`
3. Add company-level quality aggregate with explainability (auto/manual badge, product weights)
4. Connect `CustomerJourney` to cost-per-stage from lead sources

#### Phase 4: Cash Flow Explainability

1. Add `CashFlowExplainer` card at top of Cash Flow tab
2. Add data source badges to timeline lines ("из продуктов", "вручную")
3. Highlight payback period in green, negative periods in red

---

### Files Changed Per Phase

| Phase | Files |
|-------|-------|
| 1A | `Dashboard.tsx` (major restructure) |
| 1B | `Dashboard.tsx`, new `useMarketShares.ts` hook, new `ScenarioComparison.tsx`, edit `CompanyMetrics.tsx` |
| 2 | New: `CompanySummaryCard.tsx`, `MarketPositionCard.tsx`, `CashFlowSummaryCard.tsx`, `RisksSummaryCard.tsx`, `RecommendationsCard.tsx`. Edit: `Dashboard.tsx` |
| 3 | Edit: `MarketingMetrics.tsx`, `CustomerJourney.tsx`, `LeadSourcesForm.tsx`. New: company quality card in `CompanyMetrics.tsx` |
| 4 | New: `CashFlowExplainer.tsx`. Edit: `CashFlowTimelineManager.tsx`, `CashFlowGrid.tsx` |

No DB migrations required for any phase.

