

## Core Data Integrity & Revenue Sync Stabilization

### Summary

Three critical fixes to make the platform reliable across all 8 business types: (1) persist business-type metrics in scenarios, (2) fix bulk-save to write product subtypes, (3) bridge SaaS/Marketplace/Token-SaaS revenue into global metrics.

---

### Phase 1: Scenario Persistence (JSONB approach)

**Problem**: `saveAllToCloud` and `saveScenario` only write 9 base columns to `scenarios`. Business-type fields (`customerLifetimeMonths`, `purchaseFrequency`, `nrr`, `repeatRate`, `utilizationRate`, `takeRate`, `freeToPayConversion`, `expansionRevenue`, `marketShare`, `quality`) exist in local state but are lost on reload.

**Solution**: Add a `business_metrics` JSONB column to the `scenarios` table. This avoids wide schema changes and is backward-compatible (NULL for old rows).

**Migration**:
```sql
ALTER TABLE scenarios ADD COLUMN business_metrics jsonb DEFAULT '{}'::jsonb;
```

**Code changes in `src/hooks/useProject.tsx`**:

1. **Save path** (~line 539 and ~line 1110): Add `business_metrics` to the upsert payload:
```typescript
business_metrics: {
  customerLifetimeMonths: scenario.data.customerLifetimeMonths,
  purchaseFrequency: scenario.data.purchaseFrequency,
  nrr: scenario.data.nrr,
  repeatRate: scenario.data.repeatRate,
  utilizationRate: scenario.data.utilizationRate,
  takeRate: scenario.data.takeRate,
  freeToPayConversion: scenario.data.freeToPayConversion,
  expansionRevenue: scenario.data.expansionRevenue,
  marketShare: scenario.data.marketShare,
  quality: scenario.data.quality,
  ltv: scenario.data.ltv,
  churnRate: scenario.data.churnRate,
  retentionRate: scenario.data.retentionRate,
  paybackMonths: scenario.data.paybackMonths,
  totalLeads: scenario.data.totalLeads,
}
```

2. **Load path** (~line 854): After building the base `metrics` object, merge `business_metrics`:
```typescript
const bm = (scenario as any).business_metrics || {};
metrics.customerLifetimeMonths = bm.customerLifetimeMonths;
metrics.purchaseFrequency = bm.purchaseFrequency;
// ... all fields
```

---

### Phase 2: Product Subtype Persistence in saveAllToCloud

**Problem**: `saveAllToCloud` (lines 632-646) only writes base product fields. `saveProduct` and `updateProduct` already correctly write subtypes. Bulk save skips them entirely.

**Solution**: After the base product upsert loop in `saveAllToCloud`, add subtype upsert logic mirroring what `saveProduct` already does:

```typescript
// Inside the products loop in saveAllToCloud, after base upsert:
if (businessType === 'services') {
  await supabase.from("products_services" as any).upsert({
    product_id: product.id,
    hourly_rate: product.hourlyRate,
    // ... all services fields
  }, { onConflict: 'product_id' });
} else if (businessType === 'saas' || businessType === 'freemium') {
  // ... saas fields
} // ... marketplace, sharing, production
```

**File**: `src/hooks/useProject.tsx` (~lines 632-646)

---

### Phase 3: Revenue Bridge

**Problem**: SaaS (`useSaasProducts`), Marketplace (`useMarketplace`), and Token SaaS (`useTokenSaas`) compute revenue/KPIs locally but never update `currentMetrics.revenue`.

**Solution**: Add a callback prop pattern where the Dashboard passes a revenue sync callback to each specialized manager. When their data changes, they push their computed revenue up.

**Implementation approach**:

1. **In `Dashboard.tsx`**: Create a `useEffect` that watches SaaS/Marketplace/Token data and updates `currentMetrics`:

```typescript
// SaaS revenue bridge
const { aggregateKPIs } = useSaasProducts(projectId || '');

useEffect(() => {
  if (businessType === 'saas' && aggregateKPIs.mrr > 0) {
    setCurrentMetrics(prev => ({
      ...prev,
      revenue: aggregateKPIs.totalRevenue,
    }));
  }
}, [businessType, aggregateKPIs.totalRevenue]);
```

2. **Similarly for Marketplace**: Use `useMarketplace` hook's computed GMV/platform-revenue.

3. **For Token SaaS**: Use `useTokenSaas` hook's package revenue calculations.

**Files**: `src/components/Dashboard.tsx`

**Guard**: Only sync when the business type matches, so E-commerce/Production/Services revenue (from products) is not overwritten.

---

### Phase 4: Source-of-Truth Clarification

Add inline documentation comments in `useProject.tsx` defining ownership:

```text
Revenue source of truth:
- E-commerce, Production, Sharing, Freemium: products table (price × quantity)
- Services: products_services subtype (billing model calculation)
- SaaS: saas_products + saas_plans (MRR aggregation)
- Marketplace: marketplace_categories (GMV × take_rate)
- Token SaaS: token_packages (package sales × price)
```

---

### Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/` | New migration: add `business_metrics` JSONB to `scenarios` |
| `src/hooks/useProject.tsx` | Save/load business_metrics; add subtype upserts to saveAllToCloud |
| `src/components/Dashboard.tsx` | Revenue bridge useEffects for SaaS, Marketplace, Token SaaS |

---

### Migration Safety

- `business_metrics` column defaults to `'{}'::jsonb` — old rows get empty object, no data corruption
- Subtype upserts use `ON CONFLICT product_id` — safe for existing and new products
- Revenue bridge only activates for matching business type — no regression for working types

---

### Verification Checklist

For each business type, after implementation:

1. **E-commerce**: Create product → save → reload → verify revenue on dashboard
2. **Services**: Create service product → verify subtype fields persist after reload
3. **SaaS**: Create SaaS product + plans → verify MRR appears in dashboard revenue
4. **Marketplace**: Create categories → verify GMV/take-rate revenue in dashboard
5. **Token SaaS**: Configure packages → verify revenue in dashboard
6. **Production**: Create product with defect_rate → verify persists after reload
7. **Sharing**: Create product with utilization_rate → verify persists after reload
8. **Freemium**: Verify existing flow unchanged
9. **Cross-cutting**: Enter customerLifetimeMonths, purchaseFrequency → save → reload → verify LTV calculator still works
10. **Auto-save**: Verify debounced auto-save writes same data as manual save

