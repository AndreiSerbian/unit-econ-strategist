

## Fix: Use DB-computed fields in Token-SaaS calculations

### Problem
The `operations_catalog` table already has `user_price_usd`, `it_cost`, and `margin_usd` columns (populated by the `generate_token_operations` DB function), but:
1. The `OperationCatalogItem` TypeScript type does not include these fields
2. `calculateOperationMetrics` ignores them and recalculates from `base_it_cost` (which is often NULL), producing wrong results (e.g. 100% margin)

### Changes

#### 1. Update `OperationCatalogItem` type
**File:** `src/components/token-saas/types.ts`

Add three fields to the interface:
- `user_price_usd: number` (default 0 in DB)
- `it_cost: number` (default 0 in DB)
- `margin_usd: number` (default 0 in DB)
- Also add `default_in_tok` and `default_out_tok` (both exist in DB)

#### 2. Fix `calculateOperationMetrics` to prefer DB values
**File:** `src/hooks/useTokenSaas.ts`

Update the function (line ~509) to use DB-computed values when available, falling back to local recalculation only when they are zero/null:

```text
Before:
  userPriceUsd = op.api_cost_usd * op.markup_multiplier
  itCost = op.base_it_cost  (often NULL)

After:
  userPriceUsd = op.user_price_usd || (op.api_cost_usd * op.markup_multiplier)
  itCost = op.it_cost || (itValueUsd > 0 ? userPriceUsd / itValueUsd : 0)
  marginUsd = op.margin_usd || (userPriceUsd - op.api_cost_usd)
```

The `calculateOperationMetrics` callback will also need `itValueUsd` in its dependency array.

#### 3. Update `OperationsCatalog` UI component
**File:** `src/components/token-saas/OperationsCatalog.tsx`

No structural changes needed -- it already calls `calculateMetrics(op)` from the parent. Once the hook returns correct values, the UI will display them correctly.

### Technical Details

| File | Change |
|------|--------|
| `src/components/token-saas/types.ts` | Add `user_price_usd`, `it_cost`, `margin_usd`, `default_in_tok`, `default_out_tok` to `OperationCatalogItem` |
| `src/hooks/useTokenSaas.ts` | Rewrite `calculateOperationMetrics` (~line 509) to prefer DB fields; add `itValueUsd` to deps |

Two files modified, no new files, no DB migration needed.
