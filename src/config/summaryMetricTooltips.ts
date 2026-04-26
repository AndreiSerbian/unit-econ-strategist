/**
 * Tooltips for key summary metrics shown in:
 *  - KeyMetrics
 *  - CompanySummaryCard
 *  - CashFlowSummaryCard
 *
 * Content is intentionally short, conference-safe, and matches the
 * actual calculations in src/utils/metricsCalculations.ts and
 * src/hooks/useCashFlowTimeline.ts. No thresholds are presented as
 * universal financial truths.
 */

export interface SummaryMetricTooltip {
  /** Bilingual title shown at the top of the tooltip */
  title: string;
  /** One-sentence plain-language description */
  description: string;
  /** Simplified formula matching the actual project logic */
  formula?: string;
  /** Where the underlying numbers come from in this project */
  source: string;
}

export const SUMMARY_METRIC_TOOLTIPS: Record<string, SummaryMetricTooltip> = {
  // ============ Unit economics ============
  cac: {
    title: "CAC · Customer Acquisition Cost · Стоимость привлечения клиента",
    description:
      "Сколько в среднем стоит привлечь одного нового клиента.",
    formula:
      "CAC = (маркетинг + бонусы за новых клиентов) / новые клиенты",
    source:
      "«Моя компания» → Расходы (маркетинг и бонусы продаж) и количество новых клиентов.",
  },
  cpl: {
    title: "CPL · Cost Per Lead · Стоимость лида",
    description:
      "Средняя стоимость одного лида до конверсии в клиента.",
    formula:
      "CPL = маркетинг / лиды,  где лиды ≈ новые клиенты / конверсия",
    source:
      "Маркетинговые расходы и конверсия из вкладки «Моя компания».",
  },
  breakeven: {
    title: "Точка безубыточности · Break-even",
    description:
      "Сколько клиентов нужно, чтобы выручка покрыла постоянные расходы.",
    formula:
      "Безубыточность = постоянные расходы / (средний чек − переменные на клиента)",
    source:
      "Постоянные и переменные расходы + средний чек из «Моя компания».",
  },
  profitPerClient: {
    title: "Прибыль на клиента",
    description:
      "Среднее, что остаётся после всех расходов в расчёте на одного клиента.",
    formula:
      "Прибыль на клиента = (выручка − все расходы) / всего клиентов",
    source:
      "Выручка, расходы и количество клиентов из вкладки «Моя компания».",
  },
  profit: {
    title: "Прибыль · Net Profit",
    description:
      "Что остаётся от выручки после всех расходов в текущем сценарии.",
    formula: "Прибыль = выручка − (постоянные + переменные + маркетинг)",
    source: "Выручка и блоки расходов из вкладки «Моя компания».",
  },
  margin: {
    title: "Маржа · Profit Margin",
    description: "Доля прибыли в выручке.",
    formula: "Маржа = прибыль / выручка × 100%",
    source: "Считается из выручки и расходов текущего сценария.",
  },
  ltv: {
    title: "LTV · Lifetime Value · Пожизненная ценность клиента",
    description:
      "Сколько в среднем приносит клиент за всё время сотрудничества.",
    formula:
      "LTV = средний чек × частота покупок × срок жизни клиента (мес.)",
    source:
      "Средний чек, частота покупок и срок жизни клиента из «Моя компания».",
  },
  ltvCac: {
    title: "LTV / CAC",
    description:
      "Во сколько раз ценность клиента превышает стоимость его привлечения.",
    formula: "LTV / CAC",
    source: "Рассчитывается из LTV и CAC этого же сценария.",
  },

  // ============ Company summary ============
  revenue: {
    title: "Выручка · Revenue",
    description: "Сумма всех доходов в текущем сценарии за выбранный период.",
    formula: "Выручка ≈ продажи продуктов / планов / услуг",
    source:
      "Собирается из продуктов, планов или услуг во вкладке «Моя компания».",
  },
  totalClients: {
    title: "Всего клиентов",
    description: "Суммарное количество клиентов в сценарии.",
    formula: "Всего = новые + возвращающиеся",
    source: "Введённые значения и/или расчёт по источникам лидов.",
  },
  avgCheck: {
    title: "Средний чек · Average Check",
    description: "Средняя сумма одной покупки.",
    formula: "Средний чек = выручка / количество транзакций",
    source: "Введённое значение или расчёт из продуктов и продаж.",
  },

  // ============ Cash flow ============
  totalInflow: {
    title: "Всего притоков · Total Inflows",
    description: "Сумма поступлений денег по всем периодам таймлайна.",
    formula: "Σ поступлений по всем периодам",
    source:
      "Строки таймлайна на вкладке «Cash Flow» (выручка, инвестиции и т.п.).",
  },
  totalOutflow: {
    title: "Всего оттоков · Total Outflows",
    description: "Сумма расходов денег по всем периодам таймлайна.",
    formula: "Σ выплат по всем периодам",
    source:
      "Строки таймлайна на вкладке «Cash Flow» (расходы, налоги, закупки).",
  },
  netCashFlow: {
    title: "Чистый денежный поток · Net Cash Flow",
    description: "Разница между всеми поступлениями и всеми выплатами.",
    formula: "NCF = Σ притоков − Σ оттоков",
    source: "Считается из строк таймлайна «Cash Flow».",
  },
  npv: {
    title: "NPV · Net Present Value · Чистая приведённая стоимость",
    description:
      "Сумма будущих чистых потоков, приведённых к сегодняшнему дню по выбранной ставке дисконтирования. Это упрощённая оценка, а не гарантия результата.",
    formula:
      "NPV = Σ NCFₜ / (1 + r)ᵗ,  r — периодическая ставка из настроек",
    source:
      "Чистые потоки по периодам и «Ставка дисконтирования» в настройках Cash Flow.",
  },
  payback: {
    title: "Окупаемость · Payback Period",
    description:
      "Период, в котором накопленный денежный поток впервые становится неотрицательным. Указывается в единицах планирования.",
    formula: "Первый период, где Σ NCF ≥ 0",
    source: "Накопленный поток по периодам таймлайна Cash Flow.",
  },
};

export function getSummaryTooltip(
  key: string
): SummaryMetricTooltip | undefined {
  return SUMMARY_METRIC_TOOLTIPS[key];
}
