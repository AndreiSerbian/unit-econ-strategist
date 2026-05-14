# Localize ProductsCharts to RU / EN / RO

The selected block (and the rest of `src/components/ProductsCharts.tsx`) renders all titles, descriptions, axis legends, tooltip rows and the marginality table with hard-coded Russian strings. Switch language → text stays Russian.

## Changes

### `src/components/ProductsCharts.tsx`
- Import `useTranslation` and call `const { t } = useTranslation()`.
- Replace every hard-coded Russian string with `t("productsCharts.<key>")`:
  - Card titles & descriptions: `Прибыльность продуктов`, `Выручка, себестоимость и прибыль…`, `Сравнительный анализ продуктов`, `Детальное сравнение цен…`, `Ценообразование`, `Сравнение цен и себестоимости`, `Объёмы продаж`, `Количество проданных единиц`, `Структура выручки`, `Распределение выручки по продуктам`, `Доля в общей прибыли`, `Вклад каждого продукта в прибыль`, `Маржинальность продуктов`, `Процент прибыли от выручки`.
  - Bar legend names (`name="…"`): `Выручка`, `Себестоимость`, `Прибыль`.
  - Bar `dataKey` strings used as legend labels (`цена`, `себестоимость`, `количество`, `выручка`): keep the dataKey English-stable (e.g. `price`, `cost`, `quantity`, `revenue`) and pass localized `name` props to `<Bar>`. Update the matching object keys in `avgPriceData` / `salesVolumeData` and the `CustomTooltip` `dataKey` checks accordingly.
  - Tooltip strings: `Выручка:`, `Прибыль:`, `Доля:`, `ед.`, `Общая выручка:`, `Общая прибыль:`, `маржа`.

### `src/i18n/dictionary.ts`
Add a new `productsCharts: { … }` block in each of the three language sections (`ru`, `en`, `ro`) with the keys above. Suggested EN/RO equivalents:

| key | RU | EN | RO |
|---|---|---|---|
| profitabilityTitle | Прибыльность продуктов | Product profitability | Profitabilitatea produselor |
| profitabilityDesc | Выручка, себестоимость и прибыль по каждому продукту | Revenue, cost and profit per product | Venit, cost și profit pe fiecare produs |
| comparisonTitle | Сравнительный анализ продуктов | Product comparison | Analiză comparativă |
| comparisonDesc | Детальное сравнение цен, объёмов и каналов продаж | Detailed comparison of prices, volumes and channels | Comparație detaliată: prețuri, volume, canale |
| pricingTitle | Ценообразование | Pricing | Stabilire preț |
| pricingDesc | Сравнение цен и себестоимости | Price vs cost comparison | Compararea prețului și costului |
| salesVolumeTitle | Объёмы продаж | Sales volume | Volume de vânzări |
| salesVolumeDesc | Количество проданных единиц | Units sold | Unități vândute |
| revenueStructureTitle | Структура выручки | Revenue structure | Structura veniturilor |
| revenueStructureDesc | Распределение выручки по продуктам | Revenue distribution by product | Distribuția veniturilor pe produse |
| profitShareTitle | Доля в общей прибыли | Share of total profit | Pondere în profit total |
| profitShareDesc | Вклад каждого продукта в прибыль | Each product's contribution to profit | Contribuția fiecărui produs la profit |
| marginTitle | Маржинальность продуктов | Product margins | Marja produselor |
| marginDesc | Процент прибыли от выручки | Profit as % of revenue | Profit ca % din venituri |
| revenue | Выручка | Revenue | Venituri |
| cost | Себестоимость | Cost | Cost |
| profit | Прибыль | Profit | Profit |
| price | Цена | Price | Preț |
| quantity | Количество | Quantity | Cantitate |
| share | Доля | Share | Pondere |
| units | ед. | units | unități |
| totalRevenue | Общая выручка: | Total revenue: | Venit total: |
| totalProfit | Общая прибыль: | Total profit: | Profit total: |
| margin | маржа | margin | marjă |
| revenueLabel | Выручка: | Revenue: | Venituri: |
| profitLabel | Прибыль: | Profit: | Profit: |

## Out of scope
- No layout, chart-type, color, or calculation changes.
- No edits to other chart components.
- Number formatting stays `toLocaleString("ru-RU")` for now (separate concern).
