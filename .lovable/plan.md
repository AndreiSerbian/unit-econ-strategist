

## Services UX & Financial Logic Improvement Plan

### Scope Summary

Improve the "Услуги" (Services) business type flow: rename confusing fields, localize English terms, add structured quality assessment, create a service delivery pipeline block, improve billing model UX, and add services-adapted charts.

---

### Phase 1: Rename Fields & Localize

**Files to change:**

| File | Change |
|------|--------|
| `src/components/DetailedExpensesForm.tsx` | Rename "Кураторы" → "Выплаты исполнителям" with updated tooltip: "Переменные выплаты специалистам или подрядчикам, которые напрямую зависят от количества клиентов, объёма работ или числа оказанных услуг." |
| `src/components/ExportDialog.tsx` | Same rename in CSV export labels |
| `src/components/ExpensesBreakdownCharts.tsx` | Same rename in chart data labels |
| `src/components/CompetitorExpensesCharts.tsx` | Same rename |
| `src/components/services/ServicesProductCard.tsx` | Replace "Ретейнер" → "Абонентское сопровождение", "Allocation %" → "Доля мощности %", "Billable %" → "Оплачиваемое время %", "Billable/нед" → "Оплач. часов/нед", "Billable/мес" → "Оплач. часов/мес" |
| `src/components/services/types.ts` | Update `BILLING_MODEL_OPTIONS` label: `retainer` → "Абонентское сопровождение" |
| `src/config/businessTypeMetrics.ts` | Update services `productFields` labels: "Billable %" → "Оплачиваемое время %"; update `metricFields` labels: "Utilization" → "Загрузка (%)", "Billable Hours" → "Оплачиваемые часы", "Client Retention" → "Удержание клиентов"; billing model options: "Ретейнер" → "Абонентское сопровождение" |

**Data field keys remain unchanged** — only display labels and tooltips change. No DB migration needed.

---

### Phase 2: Quality Assessment Block for Services

**Problem:** Current `QualityComparison` uses a single 1-20 numeric score per product/competitor. For services, this is too opaque.

**Solution:** Create a new `ServiceQualityAssessment` component that:
- Presents 6 subfactors: Качество результата, Скорость выполнения, Надёжность, Коммуникация, Поддержка, Экспертность
- Each rated 1-5 (simple star/slider)
- Computes an average composite score (mapped to the existing 1-20 `quality` scale for backward compatibility)
- Shows a disclaimer badge: "Оценочный показатель — используйте для гипотезы, а не как объективный факт"
- Allows rating both "Моя компания" (via products) and competitors
- Falls back to the existing single-score for non-services business types

**Files:**

| File | Change |
|------|--------|
| `src/components/services/ServiceQualityAssessment.tsx` | **New file.** Component with subfactor sliders, composite score, hypothesis disclaimer |
| `src/components/QualityComparison.tsx` | Add conditional: if `businessType === 'services'`, render `ServiceQualityAssessment` instead of the generic radar chart with hardcoded categories |
| `src/components/Dashboard.tsx` | Pass `businessType` prop to `QualityComparison` |

**Data storage:** Subfactor scores stored as JSON within `quality` field or a new `quality_factors` JSONB on the product. Since services products already use `products_services` subtype table, add a `quality_factors jsonb` column there via migration. Competitor subfactors stored in existing `competitors` table's quality field (remain as composite number for now — subfactors optional enhancement).

---

### Phase 3: Service Delivery Pipeline ("Структура оказания услуги")

**Problem:** The "Структура логистики" block (physical logistics) doesn't render for services (`hasLogistics: false`). Services need their own process pipeline.

**Solution:** Create a `ServiceDeliveryPipeline` component showing 4 stages:
1. Лид → Продажа
2. Продажа → Выполнение
3. Выполнение → Поддержка
4. Поддержка → Сопровождение

Each stage allows:
- Cost per stage (number)
- Time per stage (hours/days)
- Toggle include/exclude from calculations
- Optional comment

Header text: "Структура оказания услуги — помогает разложить процесс работы по этапам: от привлечения клиента до выполнения и дальнейшего сопровождения."

**Files:**

| File | Change |
|------|--------|
| `src/components/services/ServiceDeliveryPipeline.tsx` | **New file.** Visual pipeline with stage cards, cost/time inputs, toggle, arrow connectors |
| `src/components/Dashboard.tsx` | Render `ServiceDeliveryPipeline` in Products tab when `businessType === 'services'` (after ProductsManagement, before charts) |

**Data storage:** Pipeline data stored as part of project state. Since it's project-level (not per-product), store in `scenarios.business_metrics` JSONB under a `servicePipeline` key. No new table needed.

---

### Phase 4: Billing Model UX Improvements

The existing `ServicesProductCard` already handles 3 billing models well. Changes needed:

| File | Change |
|------|--------|
| `src/components/services/ServicesProductCard.tsx` | 1. Rename "Клиентов на ретейнере" → "Клиентов на сопровождении". 2. Rename "Абонплата" → "Стоимость сопровождения/мес". 3. Add tooltip to planning period: "Период планирования влияет на расчёт выручки, количества часов и итоговых показателей услуги". 4. For retainer model, add "Включено часов" field. 5. For fixed_project, rename tooltip "capacity" → "пропускная способность" |
| `src/components/ProductsManagement.tsx` | Ensure the "add service" form also uses Russian billing model labels |

---

### Phase 5: Service-Specific Charts & Analytics

**Problem:** `ProductsCharts` uses generic price×quantity revenue calculation which doesn't reflect services billing models.

**Solution:**

| File | Change |
|------|--------|
| `src/components/services/ServicesCharts.tsx` | **New file.** Charts adapted for services: (1) Revenue/Cost/Profit by service, (2) Price vs Cost per service, (3) Effective hourly rate comparison, (4) Profitability by billing model, (5) Services comparison. Shows "Недостаточно данных" message when data missing. |
| `src/components/Dashboard.tsx` | When `businessType === 'services'`, render `ServicesCharts` instead of generic `ProductsCharts` |

Revenue calculation in charts must use the same `calculateMetrics` logic from `ServicesProductCard` (extract to shared util).

---

### Phase 6: Service Flow Explainer & Metrics Origin

Add a small explainer card in the Metrics tab for services:

```text
Услуга → Выручка → Себестоимость выполнения → Общие расходы → Прибыль → Юнит-экономика
```

| File | Change |
|------|--------|
| `src/components/services/ServiceFlowExplainer.tsx` | **New file.** Mini visual flow showing how service data feeds into overall analytics |
| `src/components/CompanyMetrics.tsx` | When `businessType === 'services'`, show origin badges next to synced values: "из услуг", "введено вручную" |
| `src/components/Dashboard.tsx` | Render `ServiceFlowExplainer` at top of Metrics tab for services |

---

### Migration

One migration for quality subfactors:

```sql
ALTER TABLE products_services ADD COLUMN IF NOT EXISTS quality_factors jsonb DEFAULT NULL;
```

---

### Files Summary

| Action | File |
|--------|------|
| Edit | `src/components/DetailedExpensesForm.tsx` |
| Edit | `src/components/ExportDialog.tsx` |
| Edit | `src/components/ExpensesBreakdownCharts.tsx` |
| Edit | `src/components/CompetitorExpensesCharts.tsx` |
| Edit | `src/components/services/ServicesProductCard.tsx` |
| Edit | `src/components/services/types.ts` |
| Edit | `src/config/businessTypeMetrics.ts` |
| Edit | `src/components/QualityComparison.tsx` |
| Edit | `src/components/ProductsManagement.tsx` |
| Edit | `src/components/CompanyMetrics.tsx` |
| Edit | `src/components/Dashboard.tsx` |
| Create | `src/components/services/ServiceQualityAssessment.tsx` |
| Create | `src/components/services/ServiceDeliveryPipeline.tsx` |
| Create | `src/components/services/ServicesCharts.tsx` |
| Create | `src/components/services/ServiceFlowExplainer.tsx` |
| Migration | Add `quality_factors` JSONB to `products_services` |

---

### What Is NOT Changed

- Tax block — preserved as-is
- DB product/scenario persistence logic — no changes to `useProject.tsx` save/load
- Other business types — zero regression risk
- Competitor module structure — unchanged
- Cash flow logic — unchanged

---

### Verification Checklist

1. Create a services project → verify all field labels are in Russian
2. Verify "Кураторы" renamed to "Выплаты исполнителям" in expenses form
3. Add service with each billing model → verify correct fields appear
4. Verify "Абонентское сопровождение" label everywhere (not "Ретейнер")
5. Verify service delivery pipeline renders with 4 stages
6. Verify quality assessment shows subfactors for services
7. Verify services-specific charts render (or show "Недостаточно данных")
8. Verify service flow explainer appears in Metrics tab
9. Verify E-commerce/SaaS/Production types are unaffected
10. Save → reload → verify all services data persists

