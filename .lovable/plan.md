# Financial Safety Guardrails v1

Surface existing diagnostics, make the revenue source explicit, normalize every scenario load path, and label incomplete business models. No financial formula is touched.

## 1. Financial warnings panel

New `src/components/financial/FinancialWarningsPanel.tsx`.

- Renders the output of `detectFinancialWarnings` (already computed in `Dashboard.tsx` but currently discarded via `void financialWarnings`).
- Each warning row shows: affected metric, reason, severity badge (Info / Warning / Critical), recommended action.
- Severity + metric + action come from a small static map keyed by the existing warning codes (`SERVICE_LABOR_DOUBLE_COUNT_RISK`, `LOGISTICS_DOUBLE_OR_TRIPLE_COUNT_RISK`) — `financialWarnings.ts` itself is not modified.
- Mounted at the top of the Summary tab and the top of the Cash Flow tab, before results.
- Fires `financial_warning_viewed` once per mount when warnings exist.

## 2. Explicit revenue source selector

New `src/components/financial/RevenueSourceSelector.tsx` (radio group: "Automatic — calculated from products" / "Manual — entered by the user").

- Placed in the revenue card of `MetricsForm.tsx`.
- Writes `revenueSource` and, in manual mode, `manualRevenueOverride` through the existing metric update path.
- `Dashboard.tsx` revenue effect: only the guard changes — auto-write applies solely when `currentMetrics.revenueSource === 'auto'` (no more legacy fallback into auto), so manual never flips silently. `resolveRevenue` itself is unchanged.
- A small `RevenueSourceBadge` shows the active source next to revenue totals in Metrics, Cash Flow summary, and Summary cards.
- Fires `revenue_source_selected` on change.

## 3. Normalize all scenario load paths

`src/hooks/useProject.tsx`:

- Cloud load already normalizes; add `normalizeMetrics` to `restoreFromLocalStorage` for `currentMetrics`, `scenarioA`, `scenarioB`, and to any scenario duplication/import path.
- Compare normalized vs raw aggregates; if they differ, show a non-blocking sonner notice ("Legacy data was normalized") and fire `legacy_data_normalized`. Valid values are left untouched by `normalizeMetrics` by construction.

## 4. Incomplete business-type warning

New `src/components/financial/IncompleteModelNotice.tsx`, shown for `token_saas`, `sharing`, `production`, `marketplace`:

"This business model contains incomplete financial integrations. Results are preliminary and should not be used for final financial decisions."

- Rendered on My Company, Metrics, Cash Flow, and Summary tabs.
- Fires `incomplete_model_warning_viewed`.
- For those types, result headings/badges use "Preliminary estimate" / "Requires financial validation"; any wording implying validated / production-ready / safe to scale / investment-ready is replaced. No formulas change.

## 5. Orphaned module protection

`src/components/distribution-v2/*` and `src/components/token-economics/*` are already not imported by any route or tab (verified). To make that explicit and prevent accidental exposure:

- Add an `INTERNAL — inactive module, not part of the user flow` header comment to both `index.ts` files and a short `docs/INACTIVE_MODULES.md` note.
- No files deleted, no database records touched.

## 6. Analytics

New `src/utils/financialAnalytics.ts` following the existing `onboardingAnalytics.ts` pattern (CustomEvent + console.debug) for the four events.

## 7. i18n

All new strings added to `src/i18n/dictionary.ts` in RU / EN / RO.

## Verification before completion

- Diff review confirming `metricsCalculations.ts`, `revenueResolver.ts` (calculation part), `normalizeMetrics.ts`, `financialWarnings.ts`, and all adapters are unchanged in formula logic.
- Manual pass: manual revenue stays manual after product edits; warnings visible; incomplete-type notice appears for the four types; SaaS numbers identical to before.
