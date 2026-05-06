## Final localization & UX cleanup

One pass, no checkpoints. Adds keys to ru/en/ro, replaces hardcoded RU strings with `t(...)`, removes duplicate toasts, and fixes the Theory simulation grid.

### 1. My Company tab

**`src/components/saas-products/SaasKpiCards.tsx`** and `SaasProductsManager.tsx`, `SaasProductCard.tsx`, `PlanRow.tsx`
- Replace hardcoded labels (`MRR подписок`, `Активные подписчики`, `ARPU`, `Месячная выручка`, `Средний чек`, plan field labels) with `t("saas.*")`.
- Fix mixed strings `MRR (Месячная выручка)` and `ARPU (Средний чек)` → use single key per language; in EN/RO drop the parenthetical or translate it.

**`src/components/ProductsManagement.tsx`**
- Replace remaining hardcoded headings, buttons, empty states, badges (`Покупатели`, `Выручка`, `Активные подписчики`, etc.) with `t("products.*")`.
- Audit child cards (`services/ServicesProductCard.tsx`, `marketplace/CategoryCard.tsx`, `token-saas/*`) for any RU labels surfaced in My Company view.

**`src/config/businessTypeMetrics.ts`**
- All `label:` / `description:` / option labels for SaaS, E-commerce, Production, Services, Freemium, Sharing, Marketplace currently hardcoded RU. Add `labelKey`/`descriptionKey` everywhere they're missing and resolve via `t()` at render sites (`BusinessTypeSelector.tsx`, `BusinessTypeMetricsComparison.tsx`, `CompanyMetrics.tsx`).
- Stable IDs (`saas`, `ecommerce`, etc.) stay as-is.

### 2. Competitors & Market

**`src/components/CompetitorCharts.tsx`** — titles (`Выручка по продуктам`, `Сравнение выручки и маркетинговых расходов`), legends (`выручка`, `маркетинг`), tooltips, empty states → `t("competitorCharts.*")`. Keep `dataKey` literal, only translate `name`.

**`src/components/CompetitorAnalysis.tsx`** — section titles `Финансовые показатели конкурентов`, `Сравнение по ключевым показателям` → `t("competitorAnalysis.*")`.

**`src/components/MarketOverview.tsx`** — `Доля рынка`, `Распределение рыночных долей`, `Многофакторный анализ` → `t("market.*")`. Improve multifactor chart label readability: shorter localized labels + `tick={{ fontSize: 11 }}` and increased radius padding.

**`src/components/CompetitiveMap.tsx` / `CompetitorMetrics.tsx` / `BusinessTypeMetricsComparison.tsx`** — sweep remaining RU strings.

### 3. Theory tab

**`src/components/GameTheoryMatrix.tsx`**
- Wrap the 4 simulation buttons in `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3`.
- Localize button labels and matrix cell descriptions.

**`src/components/StrategyDictionary.tsx`**
- Move strategy data (title, description, risks, impact, category, section headings) into structured dictionary entries: `strategies.<id>.title`, `.description`, `.risks`, `.impact`, `.category`. Code references stable `id` only.
- Render via `t()` lookup; fallback to RU if key missing.

### 4. Settings

**`src/components/ProjectSettings.tsx`** and `CurrencySelector.tsx`
- Find duplicate `toast(...)` calls (one Russian literal + one `t("system.toasts.settingsChange")`). Remove the literal RU one. Same audit in `CompetitorAnalysis.tsx` for currency/competitor action toasts.
- Localize Services/Freemium key metric badges (driven by businessType config fix in §1).

### 5. Dictionary additions (`src/i18n/dictionary.ts`)

New namespaces (ru/en/ro):
- `saas.*` (mrr, arpu, activeSubscribers, monthlyRevenue, avgCheck, plan field labels)
- `products.*` (extend existing)
- `businessTypeMetrics.*` extensions for every option/field label currently hardcoded
- `competitorCharts.*` (revenueByProducts, revenueVsMarketing, legendRevenue, legendMarketing, …)
- `competitorAnalysis.financialMetrics`, `keyMetricsComparison`
- `market.share`, `market.shareDistribution`, `market.multifactor`
- `theory.simulation.*` (button labels)
- `strategies.<id>.{title,description,risks,impact,category}` for each strategy in `StrategyDictionary`

### 6. QA

- Manual switch RU → EN → RO on each tab; confirm no Cyrillic in EN/RO except user-entered names.
- Trigger settings save, currency change, competitor add → exactly one toast in active language.
- Verify Theory grid at 375 / 768 / 1280 viewports.

### Out of scope
No changes to calculations, schema, or stored IDs. User-entered strings (company/competitor/product names) untouched.

### Files to edit
`src/i18n/dictionary.ts`, `src/config/businessTypeMetrics.ts`, `src/components/saas-products/{SaasKpiCards,SaasProductsManager,SaasProductCard,PlanRow}.tsx`, `src/components/ProductsManagement.tsx`, `src/components/BusinessTypeSelector.tsx`, `src/components/BusinessTypeMetricsComparison.tsx`, `src/components/CompanyMetrics.tsx`, `src/components/CompetitorCharts.tsx`, `src/components/CompetitorAnalysis.tsx`, `src/components/CompetitorMetrics.tsx`, `src/components/CompetitiveMap.tsx`, `src/components/MarketOverview.tsx`, `src/components/GameTheoryMatrix.tsx`, `src/components/StrategyDictionary.tsx`, `src/components/ProjectSettings.tsx`, `src/components/CurrencySelector.tsx`.
