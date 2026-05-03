# Pass 2C Cleanup — ROICalculator locale + CompetitiveScoreCalculator comments

Маленькая зачистка перед продолжением 2C-3. Только два файла, без логических изменений.

## Изменения

### 1. `src/components/ROICalculator.tsx` — заменить хардкод `'ru-RU'` на `numLocale`

Переменная `numLocale` уже объявлена (строка 80):
```ts
const numLocale = language === "ru" ? "ru-RU" : language === "ro" ? "ro-RO" : "en-US";
```

Заменить 7 вхождений `'ru-RU'` на `numLocale` в `toLocaleString`:

| Строка | Контекст |
|---:|---|
| 264 | Карточка сценария — `item.totalProfit` (Прибыль за период) |
| 449 | Таблица сравнения — текущий, totalProfit |
| 452 | Таблица сравнения — сценарий A, totalProfit |
| 455 | Таблица сравнения — сценарий B, totalProfit |
| 461 | Таблица сравнения — текущий, monthlyProfit |
| 464 | Таблица сравнения — сценарий A, monthlyProfit |
| 467 | Таблица сравнения — сценарий B, monthlyProfit |

Опции форматирования (`{ maximumFractionDigits: 0 }`) сохранить без изменений. Никаких других правок: формулы, dataKey, state, props не трогаем.

### 2. `src/components/CompetitiveScoreCalculator.tsx` — перевод 7 русских комментариев

Только комментарии, код не меняется:

| Строка | Было | Станет |
|---:|---|---|
| 65 | `// Находим min/max для нормализации` | `// Find min/max for normalization` |
| 80 | `// Рассчитываем интегральный показатель для каждой компании` | `// Calculate integral score for each company` |
| 82 | `// Нормализуем значения (0-100)` | `// Normalize values (0-100)` |
| 84 | `// Для цены - чем ниже, тем лучше (инвертируем)` | `// For price - lower is better (invert)` |
| 89 | `// Взвешенная сумма` | `// Weighted sum` |
| 114 | `// Сортируем по убыванию интегрального показателя` | `// Sort by descending integral score` |
| 121 | `// Данные для радарной диаграммы (сравнение топ-3 компаний)` | `// Data for radar chart (top-3 companies comparison)` |

## Что НЕ меняется

- Формулы, scoring logic, нормализация, веса.
- Recharts `dataKey`, `name`, цвета.
- Внутренние ключи объектов (`quality`, `pricing`, `marketing`, `marketShare`, `score`, `rawData`).
- Supabase схема, маршруты, формат сохранённых данных.
- Структура 7 вкладок дашборда.
- Любые другие файлы (включая `dictionary.ts` — новых ключей не добавляем).

## Верификация после применения

- `rg -n "'ru-RU'" src/components/ROICalculator.tsx` → должно остаться **только 1** вхождение в строке 80 (внутри определения `numLocale`).
- `rg -n '[А-Яа-яЁё]' src/components/CompetitiveScoreCalculator.tsx` → **0** совпадений.
- Build проверяется автоматически харнессом.

После одобрения сразу применю обе правки в одном проходе и отчитаюсь. Затем готов перейти к Prompt 2 (CompetitorAnalysis.tsx) отдельным сообщением.
