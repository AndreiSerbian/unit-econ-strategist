# Business Type Calculation Readiness Audit — Plan

Read-only audit. Single deliverable: `docs/BUSINESS_TYPE_READINESS_AUDIT.md`. No UI changes, no formula rewrites, no DB changes.

## Approach

1. **Inventory business types** from `src/config/businessTypeMetrics.ts` and the `BusinessType` enum used across `Dashboard.tsx`, `useProject.tsx`, and the cash-flow adapters. Compare against the PRD's seven canonical types (SaaS, E-commerce, Service, Marketplace, Sharing, Production, Token SaaS) plus any others present (e.g. Freemium).

2. **Per-type evidence pass** — for each type, read the canonical files (no edits):
   - SaaS: `hooks/useSaasProducts.ts`, `components/saas-products/*`, adapter in `cashflow-timeline/adapters.ts`.
   - E-commerce / Production / Sharing / Freemium: `components/ProductsManagement.tsx`, `cashflow-timeline/adapters.ts`, `Dashboard.tsx` revenue bridge.
   - Service: `components/services/*`, `utils/serviceCogs.ts`, `components/services/revenue.ts`.
   - Marketplace: `components/marketplace/*`, `hooks/useMarketplace.ts`.
   - Token SaaS: `hooks/useTokenSaas.ts`, `components/token-saas/*`.
   - Cross-cutting: `utils/metricsCalculations.ts`, `utils/revenueResolver.ts`, `utils/normalizeMetrics.ts`, `utils/financialWarnings.ts`.

3. **Evaluate against PRD criteria** (input completeness, formula correctness, type-specific logic, data flow, UI clarity, scenario readiness, cash-flow readiness, summary/recommendation readiness).

4. **Run the PRD test cases on paper** (no test harness, no code changes): substitute the example values into the formulas the code actually uses and compare against the PRD's expected outputs. Discrepancies become risks.

5. **Assign status** per type — READY / PARTIALLY READY / NOT READY / UNKNOWN — using the PRD's definitions. Where the code is too tangled to confirm, mark UNKNOWN rather than guess.

## Report sections (`docs/BUSINESS_TYPE_READINESS_AUDIT.md`)

1. Executive Summary — recommended type for the conference, second-best, do-not-use, critical blockers.
2. Business Type Readiness Matrix — table with Status, What Works, Main Problems, Demo Suitability per type.
3. Formula Validation Table — Revenue, Gross Margin, Contribution Margin, CAC, LTV, Payback, Break-even; columns: Formula Found / Expected / Status / Notes (with file:line refs).
4. Data Flow Review — per type: input → store → calculator → display → persistence → summary.
5. UI/UX Issues — labels, missing explanations, misleading outputs.
6. Cash Flow & Scenario Readiness — per type, separately.
7. Test-case Replay — PRD's SaaS / E-commerce / Service / Marketplace examples, computed values, pass/fail vs PRD expectations.
8. Conference Demo Recommendation — practical case, unit, metrics to show, benchmark logic, slide outline, honest risks.
9. Critical Fixes Before Demo — Critical / High / Medium / Low priority list, each with FIN ID where applicable.
10. Appendix — file/function index used as evidence.

## Status badge convention

`READY` ✅ · `PARTIALLY READY` ⚠️ · `NOT READY` ❌ · `UNKNOWN` ❓

## Output & non-goals

- Single new file: `docs/BUSINESS_TYPE_READINESS_AUDIT.md`.
- Short summary in chat (matrix + recommendation only) when finished.
- No source/UI/i18n/DB edits. No silent formula fixes. No new business logic. UNKNOWN over guessing.
