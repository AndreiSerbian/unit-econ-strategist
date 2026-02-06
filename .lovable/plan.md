
# План: API-Тарифы в стиле логистики и маркетинга

## Контекст

Пользователь хочет таблицу с API-тарифами (текстовые LLM + генерация изображений) в том же визуальном стиле, что и существующие компоненты `LogisticsTariffsV2Manager` и `SalesChannelsV2Manager`. Эти компоненты используют:
- Card с Header + Description
- Форму добавления с Tooltips
- Inline-редактирование в списке
- Автоматический расчёт производных метрик

## Что будет сделано

### 1. Новый компонент `ApiPricingTable.tsx`

Создадим справочник API-тарифов в стиле distribution-v2:

**Структура:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 API Тарифы (Эталон)                                      │
│ Справочные цены провайдеров. 1 IT = $0.001                  │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Tabs ─────────────────────────────────────────────────┐  │
│ │ 💬 Текстовые LLM  │  🎨 Генерация изображений          │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                             │
│ [Text Tab]                                                  │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Провайдер │ Модель │ Режим │ $/1M in │ $/1M out │     │   │
│ │           │        │       │ Cached  │ Cost/Call │ IT │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ OpenAI    │gpt-4o-m│ Batch │ $0.15   │ $0.60     │    │   │
│ │           │        │       │ $0.075  │ $0.000285 │0.43│   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ [Image Tab]                                                 │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Провайдер │ Модель  │ Вариант   │ $/Image │ Class│ IT │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ OpenAI    │ DALL·E 3│ Std 1024² │ $0.040  │ img  │ 80 │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Ключевые поля:**
- Текстовые: Провайдер, Модель, Режим (Batch/Standard), $/1M input, $/1M cached, $/1M output, **Cost/Call** (300in+400out), **IT Cost**
- Изображения: Провайдер, Модель, Вариант, $/Image, Class (image/premium), **IT Cost**

### 2. Формулы расчёта (согласно вашим константам)

```
TEXT CALL:
api_cost = (300/1e6)*price_in + (400/1e6)*price_out
user_price = api_cost × 1.5 (text markup)
it_cost = user_price / 0.001

IMAGE CALL:
api_cost = price_per_image
user_price = api_cost × 2.0 (or 2.2 for premium)
it_cost = user_price / 0.001
```

### 3. Интеграция в TokenSaasManager

Добавим новую вкладку "API Тарифы" (между Dashboard и Настройки):

```tsx
<TabsTrigger value="api_pricing">
  <Calculator className="w-4 h-4" />
  <span>API Тарифы</span>
</TabsTrigger>

<TabsContent value="api_pricing">
  <ApiPricingTable 
    itValueUsd={0.001}
    markups={{ text: 1.5, image: 2.0, image_premium: 2.2 }}
  />
</TabsContent>
```

### 4. Данные (Single Source of Truth)

Компонент будет использовать JSON-константы напрямую:

```typescript
const TEXT_MODELS = [
  { provider: "OpenAI", model: "gpt-4o-mini", mode: "Batch", priceIn1m: 0.15, priceCachedIn1m: 0.075, priceOut1m: 0.60 },
  { provider: "OpenAI", model: "gpt-4o-mini", mode: "Standard", priceIn1m: 0.30, priceCachedIn1m: 0.15, priceOut1m: 1.20 },
  // ... все модели из вашей таблицы
];

const IMAGE_MODELS = [
  { provider: "OpenAI", model: "DALL·E 3", variant: "Standard 1024×1024", pricePerImage: 0.04, class: "image" },
  // ... все модели
];
```

### 5. Визуальный стиль (как в distribution-v2)

- **Card** с градиентом `from-primary/5 to-accent/5`
- **Tooltips** на ключевых полях (Cost/Call, IT Cost)
- **Badge** для режима (Batch/Standard) и класса (image/premium)
- **Цветовое кодирование**: 
  - API Cost в нейтральном цвете
  - User Price в `text-primary`
  - IT Cost в `font-bold`
  - Margin в `text-accent`
- **Mobile-first**: На мобильных — карточки вместо таблицы

### 6. Пример итоговой таблицы (Text Models)

| Провайдер | Модель | Режим | $/1M in | Cached | $/1M out | Cost/Call | User Price | IT |
|:---|:---|:---:|---:|---:|---:|---:|---:|---:|
| OpenAI | gpt-4o-mini | Batch | $0.15 | $0.075 | $0.60 | $0.000285 | $0.000428 | **0.43** |
| OpenAI | gpt-4o-mini | Standard | $0.30 | $0.15 | $1.20 | $0.000570 | $0.000855 | **0.86** |
| OpenAI | gpt-4o | Batch | $2.50 | $1.25 | $10.00 | $0.004750 | $0.007125 | **7.13** |
| Google | Gemini 2.5 Flash-Lite | Batch | $0.05 | — | $0.20 | $0.000095 | $0.000143 | **0.14** |

---

## Файлы для создания/изменения

| Файл | Действие |
|:---|:---|
| `src/components/token-saas/ApiPricingTable.tsx` | **Создать** — основной компонент |
| `src/components/token-saas/TokenSaasManager.tsx` | **Изменить** — добавить вкладку |
| `src/components/token-saas/index.ts` | **Изменить** — экспорт нового компонента |

## Технические детали

### Константы в компоненте

```typescript
const IT_VALUE_USD = 0.001;
const MARKUP_TEXT = 1.5;
const MARKUP_IMAGE = 2.0;
const MARKUP_IMAGE_PREMIUM = 2.2;
const DEFAULT_IN_TOKENS = 300;
const DEFAULT_OUT_TOKENS = 400;
```

### Функции расчёта

```typescript
function calculateTextCallCost(priceIn1m: number, priceOut1m: number): number {
  return (DEFAULT_IN_TOKENS / 1_000_000) * priceIn1m + 
         (DEFAULT_OUT_TOKENS / 1_000_000) * priceOut1m;
}

function calculateItCost(apiCost: number, markup: number): number {
  return (apiCost * markup) / IT_VALUE_USD;
}
```

## Ожидаемый результат

Пользователь получит:
1. **Эталонную таблицу** всех API-тарифов в одном месте
2. **Автоматический расчёт** IT-стоимости для типового вызова (300/400 токенов)
3. **Визуальное сравнение** моделей по стоимости
4. **Интерфейс в стиле** существующих компонентов логистики/маркетинга
