# Metrics & Formulas Audit v1.0

> Generated: 2026-02-08
> Status: **COMPLETE AUDIT**

---

## Table of Contents

1. [Metric Dictionary](#1-metric-dictionary)
2. [Formula Map](#2-formula-map)
3. [Linking Diagram](#3-linking-diagram)
4. [Issues Found](#4-issues-found)
5. [Validation Rules](#5-validation-rules)
6. [Test Scenarios](#6-test-scenarios)

---

## 1. Metric Dictionary

### 1.1 Core Metrics (All Business Types)

| metric_key | Label (RU) | Entity/Table | Unit | Time Meaning | Range | Type | Default | Dependencies | Used In |
|------------|------------|--------------|------|--------------|-------|------|---------|--------------|---------|
| `revenue` | Выручка | scenarios | Currency | per period | ≥0 | INPUT | 0 | — | profit, margin, ROAS, AOV |
| `totalClients` | Всего клиентов | scenarios | count | per period | ≥0 | INPUT | 0 | — | avgCheck, CAC fallback |
| `newClients` | Новые клиенты | scenarios | count | per period | ≥0 | INPUT | 0 | — | CAC, conversion |
| `returningClients` | Повторные | scenarios | count | per period | ≥0 | INPUT | 0 | — | repeatRate |
| `conversionRate` | Конверсия | scenarios | % | per period | 0-100 | INPUT | 0 | totalLeads | funnel |
| `avgCheck` | Средний чек | scenarios | Currency | per transaction | ≥0 | INPUT | 0 | — | revenue formula, LTV |
| `fixedCosts` | Постоянные расходы | scenarios | Currency | per period | ≥0 | INPUT | 0 | — | profit, breakeven |
| `variableCosts` | Переменные расходы | scenarios | Currency | per period | ≥0 | INPUT | 0 | — | profit, margin |
| `marketingCosts` | Маркетинг | scenarios | Currency | per period | ≥0 | INPUT | 0 | — | CAC, CPL |
| `customerLifetimeMonths` | Lifetime | scenarios | months | total | ≥0 | INPUT | null | churnRate | LTV |
| `purchaseFrequency` | Частота покупок | scenarios | count/month | monthly | ≥0 | INPUT | null | — | LTV |
| `ltv` | LTV | scenarios | Currency | total | ≥0 | DERIVED* | null | avgCheck, frequency, lifetime | LTV/CAC |
| `totalLeads` | Лидов | scenarios | count | per period | ≥0 | INPUT | null | — | CPL, conversion |

### 1.2 SaaS-Specific Metrics (saas, freemium, token_saas)

| metric_key | Label | Entity/Table | Unit | Time | Range | Type | Default | Dependencies | Used In |
|------------|-------|--------------|------|------|-------|------|---------|--------------|---------|
| `churnRate` | Churn Rate | scenarios / saas_plans | % | per month | 0-100 | INPUT | null | — | lifetime, NRR |
| `nrr` | Net Revenue Retention | scenarios | % | per month | ≥0 | DERIVED | null | churn, expansion | health |
| `expansionRevenue` | Expansion | scenarios | Currency | per period | ≥0 | INPUT | null | — | NRR |
| `retentionRate` | Retention | scenarios | % | per month | 0-100 | DERIVED | null | churnRate | — |

### 1.3 SaaS Products Module (NEW)

| metric_key | Label | Entity/Table | Unit | Time | Range | Type | Default | Dependencies | Used In |
|------------|-------|--------------|------|------|-------|------|---------|--------------|---------|
| `price_eur` | Цена | saas_plans | EUR | per month (sub) / one-time | ≥0 | INPUT | 0 | — | MRR, revenue |
| `subscribers` | Подписчики / Покупатели | saas_plans | count | snapshot | ≥0 | INPUT | 0 | — | MRR, costs |
| `new_subscribers_per_period` | Новые подп. | saas_plans | count | per period | ≥0 | INPUT | 0 | — | growth, churn model |
| `cost_per_subscriber_per_month_eur` | Себест./подп. | saas_plans | EUR | per month | ≥0 | INPUT | 0 | — | variable costs |
| `is_free_plan` | Бесплатный | saas_plans | boolean | — | — | INPUT | false | — | MRR exclusion |
| `billing_type` | Тип оплаты | saas_plans | enum | — | sub/one_time | INPUT | subscription | — | revenue calc |
| `cost_per_buyer_eur` | Себест./покупателя | saas_plans | EUR | per purchase | ≥0 | INPUT | null | — | one-time costs |

**Computed (per product):**

| metric_key | Formula | Unit |
|------------|---------|------|
| `subscriptionMRR` | Σ(price × subscribers) where !is_free_plan && billing_type=subscription | EUR/month |
| `oneTimeRevenue` | Σ(price × buyers) where billing_type=one_time | EUR/period |
| `totalVariableCost` | Σ(subscribers × cost_per_sub) + Σ(buyers × cost_per_buyer) | EUR/period |
| `grossProfit` | totalRevenue - totalVariableCost | EUR/period |
| `grossMarginPercent` | grossProfit / totalRevenue × 100 | % |

### 1.4 Marketplace Metrics

| metric_key | Label | Entity/Table | Unit | Time | Range | Type | Default | Dependencies | Used In |
|------------|-------|--------------|------|------|-------|------|---------|--------------|---------|
| `transactionsCount` | Транзакций | marketplace_categories | count | per period | ≥0 | INPUT | 0 | — | GMV |
| `avgCheck` | Ср. чек | marketplace_categories | Currency | per tx | ≥0 | INPUT | 0 | — | GMV |
| `gmvComputed` | GMV (расч.) | marketplace_categories | Currency | per period | — | COMPUTED | — | tx × avgCheck | — |
| `gmvOverride` | GMV (ручной) | marketplace_categories | Currency | per period | ≥0 | INPUT | null | — | takes priority |
| `takeRatePercent` | Take Rate | marketplace_categories | % | — | 0-100 | INPUT | 10 | — | revenue |
| `sharePercent` | Доля канала | category_channel_stats | % | — | 0-100 | INPUT | null | — | channel allocation |
| `transactionsPerPeriod` | Транзакций (канал) | category_channel_stats | count | per period | ≥0 | INPUT | null | — | alternative to share% |

**Computed (per category-channel):**

| metric_key | Formula |
|------------|---------|
| `txChannel` | transactionsPerPeriod ?? (transactionsCount × sharePercent / 100) |
| `gmvChannel` | (gmvUsed / transactionsCount) × txChannel |
| `netGmvChannel` | gmvChannel × (1 - discount%) × (1 - return%) |
| `platformRevenue` | netGmvChannel × (effectiveTakeRate / 100) |

### 1.5 Sales Channels

| metric_key | Label | Entity/Table | Unit | Range | Type | Default | Used In |
|------------|-------|--------------|------|-------|------|---------|---------|
| `commissionPercent` | Комиссия | sales_channels | % | 0-100 | INPUT | 0 | net revenue |
| `discountPercent` | Скидка | sales_channels | % | 0-100 | INPUT | 0 | net GMV |
| `returnRatePercent` | Возвраты | sales_channels | % | 0-100 | INPUT | 0 | net revenue |
| `paymentDelayDays` | Задержка оплаты | sales_channels | days | ≥0 | INPUT | 0 | cashflow timeline |
| `fulfillmentCostPerUnit` | Фулфилмент | sales_channels | Currency | ≥0 | INPUT | 0 | logistics |
| `logisticsCostPerUnit` | Логистика | sales_channels | Currency | ≥0 | INPUT | 0 | COGS |

### 1.6 Products & Logistics (E-commerce, Production)

| metric_key | Label | Entity/Table | Unit | Range | Type | Default |
|------------|-------|--------------|------|-------|------|---------|
| `price` | Цена | products | Currency | ≥0 | INPUT | 0 |
| `cost` | Себестоимость | products | Currency | ≥0 | INPUT | 0 |
| `quantity` | Количество | products | count | ≥0 | INPUT | 0 |
| `weightPerUnit` | Вес | products | kg | ≥0 | INPUT | null |
| `volumePerUnit` | Объём | products | m³ | ≥0 | INPUT | null |
| `logisticsToClientPerUnit` | Логистика/шт | products | Currency | ≥0 | INPUT | null |
| `deliveryType` | Тип доставки | products | enum | — | INPUT | null |
| `defectRate` | Брак | products_production | % | 0-100 | INPUT | null |

### 1.7 Raw Materials & Logistics Tariffs

| metric_key | Label | Entity/Table | Unit | Range | Type |
|------------|-------|--------------|------|-------|------|
| `pricePerUnit` | Цена/ед | raw_materials | Currency | ≥0 | INPUT |
| `weight` | Вес/ед | raw_materials | kg | ≥0 | INPUT |
| `volume` | Объём/ед | raw_materials | m³ | ≥0 | INPUT |
| `distance` | Дистанция | raw_materials | km | ≥0 | INPUT |
| `transportType` | Транспорт | raw_materials | enum | — | INPUT |
| `quantityPerUnit` | Расход/ед продукта | product_materials | units | ≥0 | INPUT |
| `perKgKm` | Тариф/кг·км | logistics_tariffs | Currency | ≥0 | INPUT |
| `perM3Km` | Тариф/м³·км | logistics_tariffs | Currency | ≥0 | INPUT |
| `baseRate` | Базовая ставка | logistics_tariffs | Currency | ≥0 | INPUT |

### 1.8 Services Metrics

| metric_key | Label | Entity/Table | Unit | Range | Type | Dependencies |
|------------|-------|--------------|------|-------|------|--------------|
| `billingModel` | Модель оплаты | products_services | enum | fixed/hourly/retainer | INPUT | — |
| `hourlyRate` | Ставка/час | products_services | Currency | ≥0 | INPUT | — |
| `estimatedHoursPerProject` | Часов/проект | products_services | hours | ≥0 | INPUT | — |
| `plannedBillableHoursPerPeriod` | План часов | products_services | hours | ≥0 | INPUT | — |
| `billablePercent` | Billable % | products_services | % | 0-100 | INPUT | — |
| `allocationPercent` | Загрузка % | products_services | % | 0-100 | INPUT | — |
| `retainerFee` | Ретейнер | products_services | Currency | ≥0 | INPUT | — |
| `clientsCount` | Клиентов | products_services | count | ≥0 | INPUT | — |

### 1.9 Cashflow Timeline

| metric_key | Label | Entity/Table | Unit | Type |
|------------|-------|--------------|------|------|
| `horizonPeriods` | Горизонт | cashflow_timelines | periods | INPUT |
| `discountRateAnnual` | Ставка дисконта | cashflow_timelines | % | INPUT |
| `planningPeriod` | Период | cashflow_timelines | enum | INPUT |
| `amount` | Сумма | cashflow_points | Currency | INPUT |
| `periodIndex` | Номер периода | cashflow_points | index (0-based) | INPUT |

---

## 2. Formula Map

### 2.1 Universal Derived Metrics

```
CAC = marketingCosts / newClients
    (fallback: marketingCosts / totalClients if newClients missing)

CPL = marketingCosts / totalLeads

Profit = revenue - fixedCosts - variableCosts - marketingCosts

ProfitMargin% = (Profit / revenue) × 100

Breakeven = fixedCosts / (avgCheck - variableCosts/totalClients)

LTV = avgCheck × purchaseFrequency × customerLifetimeMonths

LTV/CAC = LTV / CAC

PaybackPeriod = CAC / (avgCheck × purchaseFrequency × marginRate)
```

### 2.2 SaaS Formulas

```
MRR = Σ(price_eur × subscribers) for subscription plans where !is_free_plan

ARR = MRR × 12

NRR = (100 - churnRate) + (expansionRevenue / MRR × 100)

RetentionRate = 100 - churnRate

CustomerLifetime ≈ 1 / (churnRate / 100)

VariableCost_SaaS = Σ(subscribers × cost_per_subscriber_per_month_eur)
    // IMPORTANT: Includes free plan users

OneTimeRevenue = Σ(price × buyers) for one_time plans

TotalRevenue_SaaS = MRR + OneTimeRevenue

GrossProfit_SaaS = TotalRevenue - VariableCost
```

### 2.3 Marketplace Formulas

```
GMV_computed = transactionsCount × avgCheck

GMV_used = gmvOverride ?? GMV_computed

// Per channel:
txChannel = transactionsPerPeriod ?? (transactionsCount × sharePercent / 100)

avgCheckForChannel = GMV_used / transactionsCount

gmvChannel = avgCheckForChannel × txChannel

netGmvChannel = gmvChannel × (1 - discountPercent/100) × (1 - returnRatePercent/100)

effectiveTakeRate = takeRateOverridePercent ?? takeRatePercent

platformRevenue = netGmvChannel × (effectiveTakeRate / 100)

// Aggregated:
TotalPlatformRevenue = Σ(platformRevenue) across all category-channels
```

### 2.4 E-commerce/Production Formulas

```
ProductRevenue = price × quantity

ProductCOGS = cost × quantity

ProductLogistics = logisticsToClientPerUnit × quantity

NetRevenue = ProductRevenue × (1 - commission%) × (1 - return%) × (1 - discount%)

// If allocated to channels:
NetRevenuePerChannel = Σ(allocatedQty × price × channelMultipliers)

// Logistics cost from tariffs:
LogisticsCost = (weight × distance × perKgKm) + (volume × distance × perM3Km) + baseRate
    // baseRate: per shipment if pricing_model='sum', max of individual if 'max'

// From materials:
MaterialCostPerUnit = Σ(quantityPerUnit × pricePerUnit)

ProductCostFromMaterials = Σ(MaterialCostPerUnit × productQuantity)
```

### 2.5 Services Formulas

```
// Fixed project:
Revenue_fixed = price × quantity

// Hourly:
Revenue_hourly = hourlyRate × estimatedHoursPerProject × quantity

// Retainer:
Revenue_retainer = retainerFee × clientsCount

// Capacity check:
AvailableHours = hoursPerWeek × weeksInPeriod × (allocationPercent / 100)
BillableHours = AvailableHours × (billablePercent / 100)
Capacity = BillableHours / estimatedHoursPerProject

WARNING: quantity > Capacity → overload
```

### 2.6 Cashflow Timeline Formulas

```
// Period rate from annual:
periodRate = (1 + discountRateAnnual / 100)^(1/periodsPerYear) - 1

// Present value:
PV_t = netCashFlow_t / (1 + periodRate)^t

NPV = Σ(PV_t) for t = 0..horizon-1

// Cumulative:
CumulativeCF_t = Σ(netCashFlow_i) for i = 0..t

// Payment delay shift:
periodShift = floor(paymentDelayDays / daysInPeriod)
// Inflows shifted forward by periodShift
```

---

## 3. Linking Diagram

```
                                    ┌─────────────────────┐
                                    │   projects          │
                                    │   - id              │
                                    │   - business_type   │
                                    │   - currency        │
                                    │   - planning_period │
                                    └─────────┬───────────┘
                                              │
        ┌─────────────────┬───────────────────┼───────────────────┬─────────────────┐
        ▼                 ▼                   ▼                   ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐
│   scenarios   │ │  competitors  │ │    products     │ │  raw_materials  │ │sales_channels│
│   (metrics)   │ │               │ │                 │ │                 │ │              │
└───────┬───────┘ └───────────────┘ └────────┬────────┘ └────────┬────────┘ └──────┬───────┘
        │                                     │                   │                 │
        │                           ┌─────────┴─────────┐         │                 │
        │                           ▼                   ▼         ▼                 ▼
        │                    ┌────────────┐    ┌────────────┐ ┌────────────┐ ┌────────────────┐
        │                    │products_   │    │products_   │ │product_    │ │category_channel│
        │                    │saas        │    │services    │ │materials   │ │_stats          │
        │                    └────────────┘    └────────────┘ └────────────┘ └────────────────┘
        │
        ▼
┌───────────────────┐
│ SaaS PRODUCTS     │
│ ┌───────────────┐ │
│ │ saas_products │─┼──▶ saas_plans (1:N)
│ └───────────────┘ │    - billing_type
│                   │    - price_eur
│                   │    - subscribers
│                   │    - cost_per_sub
│                   │    - is_free_plan
└───────────────────┘

┌───────────────────┐
│ MARKETPLACE       │
│ ┌──────────────┐  │
│ │marketplace_  │──┼──▶ category_channel_stats (1:N)
│ │categories    │  │    - sharePercent
│ └──────────────┘  │    - takeRateOverride
└───────────────────┘

┌───────────────────┐
│ CASHFLOW TIMELINE │
│ ┌───────────────┐ │
│ │cashflow_      │─┼──▶ cashflow_lines (1:N) ──▶ cashflow_points (1:N)
│ │timelines      │ │
│ └───────────────┘ │
└───────────────────┘
```

---

## 4. Issues Found

### 4.1 CRITICAL Issues

| ID | Issue | Affected | Severity | Fix |
|----|-------|----------|----------|-----|
| C1 | **takeRate vs commission ambiguity**: Marketplace uses `takeRatePercent` (platform cut), Sales Channels use `commissionPercent` (channel fee). Different semantics but similar names. | Marketplace, Channels | CRITICAL | Document clearly; add tooltips |
| C2 | **Logistics double-counting risk**: `logisticsToClientPerUnit` on product + channel `logisticsCostPerUnit` could duplicate | E-commerce | CRITICAL | Choose one source; disable the other when set |
| C3 | **GMV override no warning**: If gmvOverride differs >10% from computed, user not warned | Marketplace | HIGH | Already implemented in StatusBadge ✓ |

### 4.2 HIGH Issues

| ID | Issue | Affected | Severity | Fix |
|----|-------|----------|----------|-----|
| H1 | **Channel share% can exceed 100%**: No validation | Marketplace | HIGH | Add warning in UI |
| H2 | **Free plan with non-zero price**: UI allows setting is_free_plan=true while price>0 | SaaS | HIGH | Already enforced in hook ✓ |
| H3 | **Services capacity warning missing**: No alert when projects > capacity | Services | HIGH | Add overload warning |
| H4 | **Logistics baseRate semantics unclear**: Is it per shipment or per unit? | Logistics | HIGH | Document pricing_model |

### 4.3 MEDIUM Issues

| ID | Issue | Affected | Severity | Fix |
|----|-------|----------|----------|-----|
| M1 | **Missing planning_period consistency**: Some modules use local period, should inherit global | Various | MEDIUM | Use project.planning_period as default |
| M2 | **churnRate stored twice**: In scenarios.churnRate AND saas_plans.churn_rate_percent | SaaS | MEDIUM | Prefer saas_plans for product-level, scenarios for aggregate |
| M3 | **Percent fields allow >100**: No DB constraint | Various | MEDIUM | Add CHECK constraints |

### 4.4 LOW Issues

| ID | Issue | Affected | Severity | Fix |
|----|-------|----------|----------|-----|
| L1 | **Derived metrics stored redundantly**: ltv, retentionRate stored but also calculated | scenarios | LOW | Document as "cached" values |
| L2 | **paymentDelayDays only used in timeline**: Not visible impact elsewhere | Channels | LOW | OK by design |

---

## 5. Validation Rules

### 5.1 Percent Fields (0-100)

Apply to: `conversionRate`, `churnRate`, `returnRatePercent`, `commissionPercent`, 
`discountPercent`, `takeRatePercent`, `sharePercent`, `billablePercent`, 
`allocationPercent`, `utilizationRate`, `defectRate`

```typescript
// UI validation
const isValidPercent = (value: number) => value >= 0 && value <= 100;

// Warning message
if (!isValidPercent(value)) {
  return "Процент должен быть от 0 до 100";
}
```

### 5.2 Non-negative Fields

Apply to: `price`, `cost`, `quantity`, `subscribers`, `revenue`, costs, weights, 
volumes, distances, hours, days

```typescript
const isNonNegative = (value: number) => value >= 0;
```

### 5.3 Division Guards

All derived metric calculations already include:
- `if (divisor === 0) return { missing: true, reason: 'Division by zero' }`

### 5.4 Business Rule Warnings

```typescript
// Share% sum > 100%
const totalShare = channelStats.reduce((sum, cs) => sum + (cs.sharePercent ?? 0), 0);
if (totalShare > 100) {
  showWarning("Сумма долей каналов превышает 100%");
}

// GMV mismatch (already implemented)
if (gmvOverride && Math.abs(gmvOverride - gmvComputed) / gmvComputed > 0.1) {
  showWarning("GMV отличается от расчётного более чем на 10%");
}

// Services overload
if (projectsCount > capacityProjects) {
  showWarning("Превышена ёмкость по проектам");
}

// Negative margin
if (profitMargin < 0) {
  showCritical("Отрицательная маржа — убыточная модель");
}

// SaaS churn vs lifetime mismatch
const expectedLifetime = 100 / churnRate;
if (Math.abs(expectedLifetime - customerLifetimeMonths) / expectedLifetime > 0.3) {
  showWarning("Churn и Lifetime не согласованы");
}
```

---

## 6. Test Scenarios

### 6.1 SaaS Product Tests

```javascript
// Scenario: Free plan + paid plan + one-time
const testSaasProduct = {
  name: "Test SaaS",
  plans: [
    { name: "Free", billing_type: "subscription", price_eur: 0, subscribers: 1000, 
      cost_per_subscriber: 0.5, is_free_plan: true },
    { name: "Pro", billing_type: "subscription", price_eur: 29, subscribers: 200, 
      cost_per_subscriber: 2, is_free_plan: false },
    { name: "Lifetime", billing_type: "one_time", price_eur: 299, subscribers: 50, 
      cost_per_buyer: 10, is_free_plan: false },
  ]
};

// Expected results:
// MRR = 0 + (29 × 200) = 5,800 EUR
// OneTimeRevenue = 299 × 50 = 14,950 EUR
// TotalRevenue = 5,800 + 14,950 = 20,750 EUR
// VariableCost = (1000 × 0.5) + (200 × 2) + (50 × 10) = 500 + 400 + 500 = 1,400 EUR
// GrossProfit = 20,750 - 1,400 = 19,350 EUR
// GrossMargin = 93.3%
```

### 6.2 Marketplace Tests

```javascript
// Scenario: Category with channel mix
const testCategory = {
  name: "Electronics",
  transactionsCount: 1000,
  avgCheck: 150,
  takeRatePercent: 12,
  gmvOverride: null, // Use computed
};

const testChannels = [
  { name: "Website", discountPercent: 0, returnRatePercent: 5, sharePercent: 60 },
  { name: "App", discountPercent: 5, returnRatePercent: 3, sharePercent: 40 },
];

// Expected results:
// GMV_computed = 1000 × 150 = 150,000
// 
// Website channel:
//   txChannel = 1000 × 0.6 = 600
//   gmvChannel = 150 × 600 = 90,000
//   netGmv = 90,000 × 0.95 = 85,500
//   platformRevenue = 85,500 × 0.12 = 10,260
//
// App channel:
//   txChannel = 1000 × 0.4 = 400
//   gmvChannel = 150 × 400 = 60,000
//   netGmv = 60,000 × 0.95 × 0.97 = 55,290
//   platformRevenue = 55,290 × 0.12 = 6,635
//
// Total platform revenue = 10,260 + 6,635 = 16,895
```

### 6.3 E-commerce Logistics Tests

```javascript
// Scenario: Product with weight-based logistics
const testProduct = {
  name: "Widget",
  price: 100,
  cost: 40,
  quantity: 500,
  weightPerUnit: 2, // kg
  volumePerUnit: 0.01, // m³
  deliveryType: "courier",
};

const testTariffs = {
  courier: { perKg: 10, perM3: 200, baseRate: 50 },
};

// Expected results:
// Per unit logistics = max(2 × 10, 0.01 × 200) + 50 = max(20, 2) + 50 = 70
// Total logistics = 70 × 500 = 35,000
// Revenue = 100 × 500 = 50,000
// COGS = 40 × 500 = 20,000
// Gross profit = 50,000 - 20,000 - 35,000 = -5,000 (LOSS)
```

### 6.4 Services Overload Test

```javascript
const testService = {
  name: "Consulting",
  billingModel: "fixed_project",
  price: 50000,
  quantity: 8, // projects in period
  estimatedHoursPerProject: 40,
  hoursPerWeek: 40,
  billablePercent: 80,
  allocationPercent: 100,
  planningPeriod: "month",
};

// Expected results:
// Available hours = 40 × 4 weeks × 1.0 = 160 hours/month
// Billable hours = 160 × 0.8 = 128 hours/month
// Capacity = 128 / 40 = 3.2 projects
// quantity (8) > capacity (3.2) → OVERLOAD WARNING
```

### 6.5 Cashflow Timeline Tests

```javascript
const testTimeline = {
  horizonPeriods: 12,
  discountRateAnnual: 10,
  planningPeriod: "month",
};

const testInflows = [
  { name: "Revenue", values: [10000, 10500, 11000, ...] }, // Growing
];

const testOutflows = [
  { name: "Costs", values: [8000, 8000, 8000, ...] }, // Flat
];

// Expected:
// Period rate = (1 + 0.1)^(1/12) - 1 = 0.00797 ≈ 0.8%/month
// Net CF period 0 = 10000 - 8000 = 2000
// PV period 0 = 2000 / 1.00797^0 = 2000
// Net CF period 11 = ~13500 - 8000 = 5500
// PV period 11 = 5500 / 1.00797^11 ≈ 5039
// NPV = Σ(PV_t)
```

### 6.6 Edge Cases

1. **Zero volume marketplace**: transactionsCount = 0 → GMV = 0, no division error
2. **100% return rate**: All revenue refunded → netGmv = 0
3. **Missing channel mix**: No category_channel_stats → hasEnoughData = false
4. **Switching delivery type**: Recalculates logistics correctly
5. **Changing period**: Recalculates all period-dependent values

---

## Appendix: Remaining TODOs

1. [ ] Add tooltips for ambiguous metrics (takeRate vs commission)
2. [ ] Implement channel share% > 100% warning UI
3. [ ] Add services capacity/overload warning
4. [ ] Document logistics baseRate semantics (per shipment vs per unit)
5. [ ] Create automated test suite for formulas
6. [ ] Add "Not enough data" badges to all computed metric cards
