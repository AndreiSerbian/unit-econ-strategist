
# План: Moldova e-commerce dataset → Промты + Загрузка в приложение

Один план, три этапа последовательно. Тестовый рынок: e-commerce электроники в Молдове. 4-й конкурент = **Darwin.md**. Our Company = пустой проект для ручного ввода. data_status (fact/estimate/null) сейчас в UI **не показываем** — храним только `value`, метаданные остаются в JSON-файлах промтов и в комментариях seed-скрипта.

---

## Этап 1. Аудит соответствия датасета схеме приложения

**Цель:** mapping-таблица «поле в JSON датасета → поле в БД/типе приложения», список расхождений и решений.

Что проверяю:
- `public.competitors` — 5 числовых полей: `name, revenue, market_share, pricing, quality, marketing_spend` (quality CHECK 1–20)
- `public.competitor_metrics` — JSONB-поля для расширенных метрик (`avgCheck`, `totalClients`, `newClients`, `returningClients`, `customerLifetimeMonths`, `purchaseFrequency`, `repeatRate`, `leadSources`, `detailedExpenses`, ...)
- Тип `Competitor` и `Metrics` в `src/hooks/useProject.tsx`
- `CompetitorMetrics.tsx` — какие поля реально используются для авторасчёта (AOV, conversion, LTV, CAC, repeat rate)

Артефакт: `/mnt/documents/audit/dataset_to_app_mapping.md` с таблицей вида:

| JSON поле | Куда ложится | Реальный column/key | Преобразование |
|---|---|---|---|
| `annual_revenue_mdl.value` | `competitors.revenue` | `revenue numeric` | as-is |
| `aov_mdl.value` | `competitor_metrics.metrics_jsonb.avgCheck` | JSONB | as-is |
| `orders_per_year.value` | `competitor_metrics.metrics_jsonb.totalClients` | JSONB | proxy (orders ≠ clients, фиксируем) |
| `unique_buyers_per_year.value` | `competitor_metrics.metrics_jsonb.totalClients` | JSONB | альтернативный mapping — выбираем uniqueBuyers |
| `repeat_rate_percent.value` | `competitor_metrics.metrics_jsonb.repeatRate` | JSONB | as-is |
| `gross_margin_percent.value` | нет прямого поля | — | дыра, рекомендация |
| `marketing_cost_monthly_mdl.value × 12` | `competitors.marketing_spend` | `marketing_spend numeric` | annualize |
| `cac_mdl.value` | derived в UI | не хранится | пропускаем (вычислится сам) |
| `roas` | derived | не хранится | пропускаем |
| `market_share_percent.value` | `competitors.market_share` | `market_share numeric` | as-is |
| `quality_score_1_20.value` | `competitors.quality` | `quality numeric (1–20)` | если null — пропустить |
| `pricing` | нет в датасете | `competitors.pricing` | используем `aov_mdl` как proxy |
| `electronics_revenue_share_percent` | нет в схеме | — | дыра |
| `data_status` / `source` / `methodology` | игнорируем (по решению) | — | — |

В отчёте также:
- решение `totalClients` = `unique_buyers_per_year` (а не orders), потому что в `CompetitorMetrics.tsx` AOV считается как `revenue / totalClients`, и при подстановке `orders` AOV исказится
- `pricing` в схеме = «средняя цена», подставляем AOV
- список «дыр» (gross_margin, conversion, cart_abandonment, return_rate) — зафиксированы для будущих расширений, но сейчас не загружаются

---

## Этап 2. Обновление промтов

### 2.1 `01_market_research.md` (перезаписать)

Изменения:
- 4 компании: Our Company + 3 конкурента (PandaShop, Cactus, Darwin) **по умолчанию**, с placeholder-ами `{{COMPETITOR_1..3}}`
- Жёсткое правило: Our Company → все поля `null`, методика «фокус-компания пользователя, ручной ввод»
- Добавить блоки, которых не хватало в первой версии:
  - **Top-3 products** на компанию (name, price MDL, COGS estimate, est. annual sales) — отдельный массив, не категории
  - **Conversion rate** (метод: SimilarWeb visits × оценочный share покупателей)
  - **Cart abandonment** — null или явный benchmark с источником
  - **Return rate** — null если нет данных
  - **Logistics**: customer delivery price + company logistics subsidy раздельно
  - **Contribution margin** отдельно от gross margin
  - **data_confidence**: high / medium / low на каждое значение
- Каждое поле — объект `{ value, data_status: "fact"|"estimate"|"null", source, methodology }`
- Output в двух форматах: markdown-отчёт + JSON, готовый к Промту №2
- Зафиксировать market basis: `goods_ecommerce_mdl_2024 = 5_417_000_000`, `electronics_share = 36.2%` → market = `1_960_954_000 MDL`, источник AmCham/Datalinie
- Курс: `1 USD = 17.2762 MDL`, источник BNM на 2026-05-03

### 2.2 `02_inputs_vs_research.md` (перезаписать)

Изменения:
- Принимает `RESEARCH_JSON` (с data_status) и `APP_INPUTS_JSON` (без data_status — из приложения)
- Правило сравнения учитывает data_status: расхождение между `fact` и `app_input` важнее, чем между `estimate` и `app_input`
- Выходная таблица: per-company × per-field × `match | minor_diff (<10%) | major_diff (>10%) | missing_in_app | missing_in_research`
- Топ-5 по влиянию на competitive score / market share / unit economics
- Предположения причин расхождений (период, единицы, методика)
- Список полей-дыр (gross_margin, conversion, return_rate), которые есть в research но не в app

### 2.3 `03_app_inputs_schema.json` (новый)

Шаблон APP_INPUTS_JSON, который пользователь экспортирует/копирует из приложения и вставляет в Промт №2. Структура зеркальная RESEARCH_JSON, но без data_status/source/methodology.

### 2.4 `04_dataset_v1.json` (новый)

Финальный JSON по 4 компаниям (Our Company null + Cactus + PandaShop + Bigshop) — без Darwin, чтобы соответствовать существующему датасету пользователя. Darwin добавляется в этап 3 как 4-й конкурент при загрузке (если данных по нему нет — с null-полями и пометкой «требует ручного исследования»).

Решение по Darwin: в JSON-датасете оставляем 3 конкурента (по которым есть числа) + Darwin как `data_status: "null"` строка, чтобы пользователь либо доисследовал, либо отключил.

---

## Этап 3. Seed-загрузка в приложение

### 3.1 Подход: миграция-сидер vs клиентская загрузка

Выбираю **TypeScript-скрипт + миграция SEED**, не клиентскую кнопку. Причины:
- Это разовая операция (демо-данные)
- Пользователь сейчас на `/`, проект уже существует, нужна точечная вставка
- Миграция отрабатывает один раз, идемпотентно

Но есть нюанс: миграция работает на уровне БД и не знает `project_id` пользователя. Поэтому делаю **функцию** `seed_moldova_ecommerce_demo(p_project_id uuid)`, которую можно вызвать из SQL/UI.

### 3.2 Миграция

`supabase/migrations/<ts>_seed_moldova_ecommerce_demo.sql`:

```sql
CREATE OR REPLACE FUNCTION public.seed_moldova_ecommerce_demo(p_project_id uuid)
RETURNS TABLE(competitor_id uuid, name text)
LANGUAGE plpgsql
SECURITY INVOKER  -- работает от имени пользователя, RLS соблюдается
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
  v_name text;
BEGIN
  -- Удаляем предыдущий seed (по специальным name-маркерам), чтобы повторный вызов был идемпотентным
  DELETE FROM competitors
  WHERE project_id = p_project_id
    AND name IN ('Cactus.md', 'PandaShop.md', 'Bigshop.md', 'Darwin.md');

  -- Cactus.md
  INSERT INTO competitors (project_id, name, revenue, market_share, pricing, quality, marketing_spend)
  VALUES (p_project_id, 'Cactus.md', 146847700, 7.49, 3801, 14, 10279339)
  RETURNING id, name INTO v_id, v_name;
  INSERT INTO competitor_metrics (competitor_id, project_id, metrics_jsonb)
  VALUES (v_id, p_project_id, jsonb_build_object(
    'avgCheck', 3801,
    'totalClients', 32197,
    'newClients', 25758,
    'returningClients', 6439,
    'repeatRate', 20,
    'customerLifetimeMonths', 12,
    'purchaseFrequency', 1.2
  ));
  RETURN NEXT;

  -- PandaShop.md
  INSERT INTO competitors (project_id, name, revenue, market_share, pricing, quality, marketing_spend)
  VALUES (p_project_id, 'PandaShop.md', 140060088, 7.14, 2764, 14, 11204807)
  RETURNING id, name INTO v_id, v_name;
  INSERT INTO competitor_metrics (competitor_id, project_id, metrics_jsonb)
  VALUES (v_id, p_project_id, jsonb_build_object(
    'avgCheck', 2764,
    'totalClients', 40536,
    'newClients', 30402,
    'returningClients', 10134,
    'repeatRate', 25,
    'customerLifetimeMonths', 12,
    'purchaseFrequency', 1.25
  ));
  RETURN NEXT;

  -- Bigshop.md
  INSERT INTO competitors (project_id, name, revenue, market_share, pricing, quality, marketing_spend)
  VALUES (p_project_id, 'Bigshop.md', 25982593, 1.32, 3110, 12, 2598259)
  RETURNING id, name INTO v_id, v_name;
  INSERT INTO competitor_metrics (competitor_id, project_id, metrics_jsonb)
  VALUES (v_id, p_project_id, jsonb_build_object(
    'avgCheck', 3110,
    'totalClients', 7081,
    'newClients', 5806,
    'returningClients', 1275,
    'repeatRate', 18,
    'customerLifetimeMonths', 12,
    'purchaseFrequency', 1.18
  ));
  RETURN NEXT;

  -- Darwin.md (4-й конкурент, данных нет — placeholder, пользователь дополнит руками)
  INSERT INTO competitors (project_id, name, revenue, market_share, pricing, quality, marketing_spend)
  VALUES (p_project_id, 'Darwin.md', 0, 0, 0, 10, 0)
  RETURNING id, name INTO v_id, v_name;
  RETURN NEXT;
END;
$$;
```

Важные нюансы:
- `quality` хранится 1–20, в датасете нет — ставлю 14 (PandaShop/Cactus как «средне-сильные»), 12 (Bigshop), 10 (Darwin без данных). Это **expert estimate**, в комментарии миграции зафиксировано.
- `pricing` = AOV (по решению из аудита)
- `marketing_spend` = annualized из `marketing_cost_monthly_mdl × 12`
- Our Company **не создаётся** — это сам проект пользователя, его метрики идут в `metrics`, а не в `competitors`
- `SECURITY INVOKER` + проверка через RLS: вызвавший пользователь должен быть владельцем `p_project_id`

### 3.3 Вызов функции

Не добавляю UI-кнопку (пользователь сказал «не показывать в UI»). Вместо этого после применения миграции выполняю:

```sql
SELECT * FROM public.seed_moldova_ecommerce_demo('<current_project_id>');
```

Чтобы получить `current_project_id`, перед вызовом SELECT-ом смотрю в `projects` последний проект пользователя. После загрузки пользователь увидит конкурентов на табе «Конкуренты».

### 3.4 Откат

Идемпотентность встроена в саму функцию (`DELETE` перед `INSERT` по name-маркерам). Чтобы полностью убрать seed: `DELETE FROM competitors WHERE project_id = '<id>' AND name IN ('Cactus.md','PandaShop.md','Bigshop.md','Darwin.md');`

---

## Что НЕ меняется

- Схема БД: только новая функция, никаких новых колонок
- 7 табов дашборда, формулы scoring, dataKey-и графиков
- UI-компоненты (никаких бейджей data_status, никаких новых кнопок)
- i18n словари
- Типы `Competitor` / `Metrics` в TypeScript
- `src/integrations/supabase/*` (типы автогенерируются после миграции)

---

## Артефакты на выходе

1. `/mnt/documents/audit/dataset_to_app_mapping.md` — таблица соответствия + дыры
2. `/mnt/documents/prompts/01_market_research.md` — обновлённый Промт №1
3. `/mnt/documents/prompts/02_inputs_vs_research.md` — обновлённый Промт №2
4. `/mnt/documents/prompts/03_app_inputs_schema.json` — пустой шаблон APP_INPUTS_JSON
5. `/mnt/documents/prompts/04_dataset_v1.json` — финальный JSON по 4 компаниям
6. `supabase/migrations/<ts>_seed_moldova_ecommerce_demo.sql` — функция seed
7. Финальное сообщение со списком артефактов и SQL-командой `SELECT seed_moldova_ecommerce_demo('<id>')`

---

## Порядок исполнения после approve

1. Этап 1: аудит → файл mapping
2. Этап 2: 4 файла промтов/датасета
3. Этап 3: миграция → автоприменится → выполню SELECT для seed на актуальный `project_id`
4. Финальное сообщение

Если на этапе 1 обнаружу критическое расхождение (например, что `totalClients` нельзя подменять `unique_buyers_per_year` без побочных эффектов в `KeyMetrics`), остановлюсь и спрошу до начала этапа 3.
