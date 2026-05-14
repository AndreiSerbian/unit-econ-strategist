# Localize the Products block to RU / EN / RO

## Problem

In the selected card (`ProductsManagement.tsx` for E-commerce) the title `Products` and the `Add product` button already switch language correctly, but the field labels stay in Russian: **Название, Цена, Себестоимость, Количество, Качество, Логистика до клиента (за 1 шт.), Вес (кг), Объём (м³), Тип доставки**.

Reason: in `src/config/businessTypeMetrics.ts` the `productFields` for most business types only have a hard-coded `label` (Russian) and a free-text `suffix` — no `labelKey` / `suffixKey`. `resolveI18nText` therefore falls back to the Russian string regardless of the active language.

## Scope

Pure i18n / presentation work. No business logic, no data model, no calculation changes.

Cover **all** business types so every Products card is fully trilingual, not only E-commerce:
- saas, ecommerce, production, services, freemium, sharing, marketplace, token_saas

## Changes

### 1. `src/config/businessTypeMetrics.ts`
- Add `labelKey` to every entry in `productFields[]` that currently lacks one.
  - Naming convention: `businessTypeMetrics.field_<key>` for shared keys (`name`, `price`, `cost`, `quantity`), and `businessTypeMetrics.<type>_field_<key>` when the wording differs per type (e.g. production `quantity` = "Объём производства", services `price` = "Стоимость услуги", etc.).
- Replace the free-text `suffix` with a new optional `suffixKey?: string` on the `ProductField` type, and populate it for: `за 1 шт.`, `кг`, `м³`, `%`, `ч/нед`, etc. Keep `suffix` as a fallback so any field that doesn't define `suffixKey` still renders.
- Update the `ProductField` TypeScript interface accordingly.

### 2. `src/components/ProductsManagement.tsx`
- In `renderField` (number branch, line ~223), prefer `resolveI18nText(t, field.suffix, field.suffixKey)` over the raw `field.suffix` when rendering the parenthetical unit.
- No other component changes needed — title, button and delivery options already go through `resolveI18nText`.

### 3. `src/i18n/dictionary.ts`
For each of the three language blocks (`ru`, `en`, `ro`), inside the existing `businessTypeMetrics: { ... }` object, add the new keys. Concretely:

Shared field labels:
- `field_name`         → Название / Name / Denumire
- `field_price`        → Цена / Price / Preț
- `field_cost`         → Себестоимость / Cost / Cost
- `field_quantity`     → Количество / Quantity / Cantitate
- `field_quality`      → Качество / Quality / Calitate
- `field_logisticsToClientPerUnit` → Логистика до клиента / Logistics to customer / Logistică către client
- `field_weightPerUnit` → Вес / Weight / Greutate
- `field_volumePerUnit` → Объём / Volume / Volum
- `field_deliveryType` → Тип доставки / Delivery type / Tip de livrare
- `field_defectRate`   → Процент брака / Defect rate / Rata defectelor

Type-specific overrides where wording differs (e.g. `production_field_quantity` = Объём производства / Production volume / Volum de producție; `services_field_price`, `services_field_cost`, SaaS plan fields, marketplace fields, token-saas fields, sharing fields, etc.).

Suffix keys:
- `suffix_per_unit`    → за 1 шт. / per unit / pe unitate
- `suffix_kg`          → кг / kg / kg
- `suffix_m3`          → м³ / m³ / m³
- `suffix_percent`     → % / % / %
- `suffix_hours_week`  → ч/нед / h/wk / h/săpt

## Out of scope
- No changes to the dynamic currency suffix `(USD)` — it already comes from the project setting and is not language-dependent.
- No edits to `ServicesProductCard` (it already uses its own translated strings).
- No new languages, no new fields, no formula or layout changes.

## Verification
- Switch the language toggle between RU / EN / RO on the Моя компания → Products card for each business type and confirm: title, every field label, every parenthetical unit, the delivery dropdown options, and the Add button update.
- Build passes (no TS errors from the new optional `suffixKey`).
