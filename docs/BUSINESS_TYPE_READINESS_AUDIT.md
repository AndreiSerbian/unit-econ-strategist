# Business Type Calculation Readiness Audit

**Date:** 2026-05-13
**Scope:** Read-only audit of the current prototype (post-FIN-v1 / Revenue Source-of-Truth v2).
**Goal:** Recommend the safest business type for the conference paper *"Unit Economics as the Basis of a Company's Financial Model"*.

---

## 1. Executive Summary

> **Recommended for conference demonstration:** **SaaS / Subscription** ✅ READY
>
> **Reason**
> - Strongest data model in the codebase (Product → Plans, `useSaasProducts.ts`).
> - Native cash-flow adapter with explicit churn modelling per period (`saasAdapter`, `adapters.ts:368–442`).
> - Contribution-margin formula now correct (FIN-004); KPI card labels it correctly.
> - CAC / LTV / Payback formulas in `metricsCalculations.ts` map cleanly to SaaS variables.
> - Test case from PRD (price 20, var 5, mkt 600, new 10) reproduces exactly: CAC = 60, LTV = 120, Payback = 4.

> **Second-best:** **E-commerce** ⚠️ PARTIALLY READY — ecommerce adapter handles COGS, channel commissions, logistics-to-client and refunds. Per-order vs per-customer CAC mismatch is the only real risk, easy to control in the demo by using one channel and a constant repeat rate.

> **Do not use as the demo case yet:**
> - **Marketplace** ⚠️ — GMV/take-rate solid, but no buyer-vs-seller CAC and no per-transaction support/payment cost field.
> - **Sharing / Rental** ❌ — adapter and revenue-bridge formulas disagree (see §3).
> - **Production** ⚠️ — reuses the ecommerce adapter; no raw-materials/labour/manufacturing-fixed-cost passthrough into Cash Flow.
> - **Freemium** ⚠️ — reuses the SaaS adapter; no separate free→paid conversion economics.
> - **Token SaaS / AI** ❌ — *no* cash-flow adapter at all; only revenue and API cost are computed.

> **Critical blockers (must mention honestly in the talk if you pick anything other than SaaS):**
> 1. Sharing revenue mismatch (adapter vs Dashboard bridge).
> 2. Token SaaS missing from Cash Flow timeline.
> 3. Production = ecommerce reuse (no manufacturing-specific costs in cash flow).
> 4. Marketplace lacks per-transaction operating cost and dual-CAC.

---

## 2. Business Type Readiness Matrix

| # | Business Type | Status | What works | Main problems | Demo suitability |
|---|---|---|---|---|---|
| 1 | **SaaS / Subscription** | ✅ **READY** | Product → Plans data model; per-period churn in cash flow; subscription + one-time billing types; aggregate KPIs (MRR, contribution margin, paid/free/buyer counts); CAC/LTV/Payback formulas map directly. | `expansionRevenue` and `nrr` fields exist but are not auto-computed from plan upgrades; no cohort retention. | **High** |
| 2 | **E-commerce** | ⚠️ **PARTIALLY READY** | Multi-channel allocations, channel commission %, return-rate %, payment-delay shift, logistics-to-client per unit, COGS per unit. Refunds emitted as their own outflow. | CAC computed per *customer* in `metricsCalculations.ts` while contribution margin is computed per *order* in the adapter — payback per customer needs `purchaseFrequency` to align. Repeat-purchase loop relies on user input, not derived. | **High** if you pin one channel and one repeat-rate. |
| 3 | **Service** | ⚠️ **PARTIALLY READY** | New `computeServiceRevenue` (FIN-008b) handles `fixed_project`, `hourly`, `retainer` consistently across My Company, Metrics, and Cash Flow. `calculateServiceCogs` shared. Break-even from `calculateBreakeven` is correct. | `costMode = 'hourly'` is wired but no UI to enter `loadedHourlyCost`; default stays manual `cost`. Salary/labour double-count detector exists but is not surfaced. Test case reproduces (≈17 jobs). | Medium-High. |
| 4 | **Marketplace** | ⚠️ **PARTIALLY READY** | GMV (computed or override), category × channel split, take-rate override per channel, discount %, return %, payment delay. `marketplaceAdapter` emits platform commission and refunds. | No per-transaction operating cost field (PRD test case requires "Payment/support cost = 3"); CAC is single-sided (no buyer vs seller); GMV displayed as a top-line that can be confused with revenue. | **Low** for demo. |
| 5 | **Sharing / Rental** | ❌ **NOT READY** | `sharingAdapter` exists (revenue = `gmv × utilization% × takeRate%`, plus `maintenanceCost`). | Dashboard revenue bridge uses a *different* formula: `price × utilization% × 720h × qty` (`revenueResolver.ts:62–69`). Asset depreciation, insurance, and break-even-utilisation are absent. Two different revenue numbers will appear in the same project. | **Low**. |
| 6 | **Production / Manufacturing** | ⚠️ **PARTIALLY READY** | Falls back to `ecommerceAdapter`. Raw materials and product-materials allocation hooks exist (`useProject.tsx`). | Cash Flow does **not** consume manufacturing fixed costs, packaging, or BOM-based COGS; manufacturing inventory/storage isn't modelled. Logistics triple-count detector (FIN-007) flags risk. | **Low** for a manufacturing case study. |
| 7 | **Freemium / On-demand** | ⚠️ **PARTIALLY READY** | Reuses `saasAdapter`. Free-tier users tracked separately in KPIs. | No standalone free→paid conversion economics in the adapter; relies on the user manually entering churn and cost-per-free-user. `freeToPayConversion` field exists but is not used in revenue formulas. | **Low**. |
| 8 | **Token SaaS / AI** | ❌ **NOT READY** | `useTokenSaas.calculateScenarioMetrics()` returns `totalPackageRevenue`, `totalApiCost`, `platformProfit`. UI and packages catalog work. | **No `tokenSaasAdapter`** in `cashflow-timeline/adapters.ts` — Cash Flow shows **only fixed expenses**, no AI/API cost or token revenue. Margin overstated as token usage scales because the cost is not propagated to Cash Flow. | **Do not use.** |

---

## 3. Formula Validation Table

Source-of-truth file: `src/utils/metricsCalculations.ts` (post-FIN v1).

| Metric | Formula in code | Expected formula | Status | Notes |
|---|---|---|---|---|
| Revenue (SaaS) | `Σ price × subscribers (non-free) + Σ price × buyers (one-time)` (`useSaasProducts.ts:84–105`) | Σ MRR + Σ one-time | ✅ OK | Aggregated via `aggregateKPIs`. |
| Revenue (E-com) | `price × quantity` per allocation, `priceOverride` honoured (`adapters.ts:168–187`) | Price × Quantity | ✅ OK | |
| Revenue (Services) | `computeServiceRevenue` (`services/revenue.ts`) — branches on `billingModel` | Per billing model | ✅ OK | All three sites agree (FIN-008b). |
| Revenue (Sharing) | Dashboard: `price × utilization% × 720h × qty`. Adapter: `gmv × utilization% × takeRate%`. | Single canonical formula | ❌ **Issue** | Two different numbers — see §6. |
| Revenue (Production) | `price × quantity` (ecommerce reuse) | Price × Quantity | ⚠️ Partial | Ignores manufacturing dynamics. |
| Revenue (Token SaaS) | `Σ packages.price × packages.units` (`useTokenSaas.ts:539`) | Σ tokens revenue | ✅ OK in hook, ❌ missing in cash flow |
| Revenue (Marketplace) | `gmv × (1−discount%) × (1−return%) × takeRate%` per category × channel (`adapters.ts:73–79`) | netGMV × takeRate | ✅ OK | |
| Gross / Contribution Margin | `(Revenue − netVariableCosts) / Revenue` (`metricsCalculations.ts:121–125`) | (Revenue − Variable Costs)/Revenue | ✅ OK | Net of taxes (FIN-003). |
| CAC | `getAcquisitionSpend / max(newClients, totalClients)` (`metricsCalculations.ts:135–139`) | Acquisition Spend / New Customers | ✅ OK | Uses `max(aggregateMarketing, detailedMarketing)` + new-client commissions; respects `countsAsAcquisitionCost`. |
| LTV | `avgCheck × frequency × lifetime × CM%` (`:203–211`) | Customer Margin × Lifetime | ✅ OK | Margin-aware (FIN-010). |
| Payback | `CAC / (avgCheck × frequency × CM%)` (`:235–243`) | CAC / Monthly CM per Customer | ✅ OK | FIN-011. |
| Break-even | `fixedTotal / (avgCheck − netVariablePerClient)` (`:148–171`) | Fixed Costs / CM per Unit | ✅ OK | |
| Total Cost | `fixedCosts + variableCosts + marketingCosts` (`:181–183`) | COGS + Var + Fixed | ⚠️ Partial | Aggregates only — ensure COGS is *inside* `variableCosts`. `normalizeMetrics()` enforces this on legacy load (FIN-002/003). |

---

## 4. Data Flow Review

| Type | Input UI | Storage | Calculator | Display | In Summary? |
|---|---|---|---|---|---|
| SaaS | `SaasProductsManager` + `PlanRow` | `saas_products`, `saas_plans` | `useSaasProducts.calculateProductKPIs` + `saasAdapter` | `SaasKpiCards`, Cash Flow grid, Dashboard bridge | ✅ via revenue resolver |
| E-com | `ProductsManagement`, `SalesChannelsManager`, `ProductChannelBreakdown` | `products`, `sales_channels`, `product_channel_allocations` | `ecommerceAdapter`, `metricsCalculations` | Charts, Cash Flow | ✅ |
| Services | `ServicesProductCard` + delivery/quality components | `products` + `products_services` | `computeServiceRevenue`, `calculateServiceCogs`, `servicesAdapter` | Cash Flow, KPIs | ✅ |
| Marketplace | `MarketplaceManager`, `CategoryCard` | `marketplace_categories`, `marketplace_channels`, `marketplace_category_channel_stats` | `useMarketplace.totals`, `marketplaceAdapter` | Cash Flow, Dashboard bridge | ✅ |
| Sharing | `ProductsManagement` (generic) | `products` + `products_sharing` | Dashboard bridge **OR** `sharingAdapter` | Cash Flow, Dashboard | ⚠️ inconsistent |
| Production | `ProductsManagement` + `RawMaterialsManager` + `ProductMaterialsAllocation` + `LogisticsTariffs` | `products`, `raw_materials`, `product_materials`, `logistics_tariffs` | `ecommerceAdapter` (reuse) | Cash Flow, Dashboard | ⚠️ partial — BOM not in adapter |
| Freemium | `ProductsManagement` (generic) | `products` | `saasAdapter` (reuse) | Cash Flow, Dashboard | ⚠️ partial |
| Token SaaS | `TokenSaasManager`, `TokenPackagesManager`, `OperationsCatalog`, `UsageForecastManager` | `token_*` tables | `useTokenSaas.calculateScenarioMetrics` | Token dashboards, Dashboard revenue bridge | ❌ **not in Cash Flow** |

---

## 5. UI/UX Review

- **Business type label is clear** in the onboarding flow and ProjectSettings.
- **Selected unit is implicit** — no "1 paying subscriber / 1 order / 1 project" indicator in the main dashboard. For a conference talk, a single header *"Unit = 1 paying subscriber"* would help.
- **MetricsForm hides/shows fields per business type** correctly.
- **SaaS KPI card** now reads "Contribution Margin" (RU/EN/RO).
- **Cash Flow grid** for Token SaaS appears *empty of inflow lines* — confusing, because revenue *is* shown elsewhere. This will be visible on stage.
- **Marketplace** displays GMV alongside platform revenue; the difference should be explained verbally.
- **Sharing** product card shows utilization %, but the resulting revenue depends on which screen you look at — risk of contradictory numbers in front of an audience.

---

## 6. Cash Flow & Scenario Readiness

| Type | Cash Flow adapter | Scenario A/B parity | Verdict |
|---|---|---|---|
| SaaS | `saasAdapter` (subscription churn iteration, one-time, variable-cost-per-subscriber). Period-by-period. | Yes (`scenarioA`/`scenarioB` share metric shape). | ✅ |
| E-commerce | `ecommerceAdapter` (rev, COGS, logistics, fees, refunds, payment-delay shift). | Yes. | ✅ |
| Services | `servicesAdapter` (post-FIN-008b helpers). | Yes. | ✅ |
| Marketplace | `marketplaceAdapter` (commission + refunds; no per-tx ops cost). | Yes. | ⚠️ |
| Sharing | `sharingAdapter` exists, **but Dashboard revenue bridge uses a different formula**. Numbers will not match. | Same divergence on both scenarios. | ❌ |
| Production | Reuses `ecommerceAdapter`. No manufacturing-fixed-costs pipe. | Yes. | ⚠️ |
| Freemium | Reuses `saasAdapter`. | Yes. | ⚠️ |
| Token SaaS | **No adapter** — only `expensesAdapter` runs. | n/a | ❌ |

Common `expensesAdapter` (`adapters.ts:518–574`) emits ФОТ / Аренда / Маркетинг (variable line per FIN-002) / Прочие / Налоги. Confirmed correct.

---

## 7. PRD Test-case Replay

All four PRD test cases were re-run on paper against the actual code paths.

### 7.1 SaaS — ✅ Pass
Inputs: `price=20`, `var/user=5`, `marketing=600`, `new=10`, `lifetime=8 mo`.
- `getAcquisitionSpend` = 600 (no detailed marketing override).
- CAC = 600 / 10 = **60** ✅
- CM% = (20 − 5)/20 = 75 %.
- LTV = 20 × 1 × 8 × 0.75 = **120** ✅
- Payback = 60 / (20 × 1 × 0.75) = **4 months** ✅

### 7.2 E-commerce — ✅ Pass on per-order math
Inputs: `AOV=100`, `COGS=60`, `delivery=8`, `payfee=2`, `marketing=500`, `new=25`.
- Variable per order in adapter = 60 + 8 + 2 = 70. CM/order = **30** ✅
- CAC = 500 / 25 = **20** ✅
- Payback per customer needs `purchaseFrequency` (PRD says "depends on repeat purchases"). Code correctly returns `Infinity` if frequency is 0.

### 7.3 Service — ✅ Pass
Inputs: `price=150`, materials/labour/transport summed in `cost = 90`, `fixed=1000`.
- CM/job = 150 − 90 = **60** ✅
- Break-even = 1000 / 60 = **16.67 → 17 jobs** ✅
- (Labour is captured only if user puts it inside `cost`; the new `calculateServiceCogs` hourly mode is wired but not yet UI-exposed.)

### 7.4 Marketplace — ⚠️ Partial
Inputs: `gmv=100`, `take=15 %`, `platform_rev=15`, `payment/support=3`.
- `marketplaceAdapter` returns commission line = **15** ✅
- No field for the **3** support cost — would have to enter it manually as a fixed/other expense.

---

## 8. Conference Demo Recommendation

> **Recommended business type:** **SaaS / Subscription**
>
> **Recommended practical case:** A small Moldovan B2B SaaS (e.g. a local accounting helper, school CRM, or HoReCa POS) with **one paid plan** and a **free trial**.
>
> **Recommended unit:** *1 paying subscriber per month*.
>
> **Recommended metrics to show:** MRR, ARPU, CAC, Contribution Margin, LTV, Payback Period, Churn → Customer Lifetime, Cash Flow with churn over 12 months, Break-even subscribers.
>
> **Benchmark logic:** Use 2–3 competitors in the Competitors tab with realistic Moldovan price points; the Competitive Score and Market Share helpers are already wired.
>
> **Slide outline (suggested):**
> 1. Why unit economics — 1 slide.
> 2. The unit for SaaS = 1 paying subscriber.
> 3. Live model: enter price 20 €, var 5 €, marketing 600 €, 10 new users.
> 4. CAC, CM %, LTV, Payback — derived live.
> 5. Cash flow over 12 months with 5 % churn.
> 6. Scenario A vs Scenario B (price ↑, churn ↓).
> 7. Limitations / honest risks.
>
> **Risks to mention honestly:**
> - LTV uses a simple lifetime, not a cohort retention curve.
> - Expansion revenue and NRR are present as fields but are not yet auto-computed.
> - Cash Flow assumes uniform marketing across periods (no seasonality).

---

## 9. Critical Fixes Before Demo

| Priority | ID | Fix |
|---|---|---|
| **Critical** | DEMO-1 | If you intend to show **Sharing**: unify the formula between `revenueResolver.ts` and `sharingAdapter` so My Company and Cash Flow agree. |
| **Critical** | DEMO-2 | If you intend to show **Token SaaS**: add a `tokenSaasAdapter` so revenue and API cost flow into Cash Flow. |
| High | DEMO-3 | Surface the financial warnings (`SERVICE_LABOR_DOUBLE_COUNT_RISK`, `LOGISTICS_DOUBLE_OR_TRIPLE_COUNT_RISK`) as an Audit panel. Currently computed but invisible. |
| High | DEMO-4 | Add a small "Unit = …" badge to the dashboard header per business type. |
| Medium | DEMO-5 | Marketplace: add a `supportCostPerTransaction` field on category. |
| Medium | DEMO-6 | Production: pipe BOM cost (raw materials × allocation) into `ecommerceAdapter` reuse, or split a `productionAdapter`. |
| Low | DEMO-7 | Add UI for `revenueSource` toggle (data layer already exists). |
| Low | DEMO-8 | SaaS: auto-compute `expansionRevenue` and `nrr` from plan upgrades. |

None of these are required if the demo is **SaaS only**.

---

## 10. Appendix — Files Inspected

- `src/config/businessTypeMetrics.ts` — 8 business types confirmed.
- `src/hooks/useSaasProducts.ts` (lines 60–170) — KPI math.
- `src/hooks/useMarketplace.ts` (lines 354–392) — totals.
- `src/hooks/useTokenSaas.ts` (lines 519–580) — scenario metrics.
- `src/components/cashflow-timeline/adapters.ts` (full) — adapter surface area.
- `src/components/cashflow-timeline/CashFlowTimelineManager.tsx` (lines 80–130) — adapter dispatch (production reuses ecommerce, freemium reuses saas, **no token branch**).
- `src/utils/metricsCalculations.ts` (full) — CAC / LTV / Payback / Break-even / Margin.
- `src/utils/revenueResolver.ts` — Sharing formula divergence vs adapter.
- `src/utils/normalizeMetrics.ts` — legacy load normalisation.
- `src/utils/financialWarnings.ts` — diagnostic detectors (computed, not surfaced).
- `src/components/services/revenue.ts` + `services/ServicesProductCard.tsx` — billing-model-aware revenue.
- `src/components/saas-products/SaasKpiCards.tsx` — contribution margin label.

**No source files were modified.** This document is the sole deliverable.
