/**
 * Metric tooltips configuration
 * Provides disambiguation for commonly confused metrics
 */

export interface MetricTooltipConfig {
  key: string;
  label: string;
  labelEN?: string;
  description: string;
  formula?: string;
  unit?: string;
  timeMeaning?: string;
  range?: string;
  disambiguation?: string;
}

export const METRIC_TOOLTIPS: Record<string, MetricTooltipConfig> = {
  // ============================================================
  // MARKETPLACE / PLATFORM METRICS
  // ============================================================
  takeRatePercent: {
    key: 'takeRatePercent',
    label: 'Take Rate',
    labelEN: 'Take Rate',
    description: 'Комиссия ПЛАТФОРМЫ с продавцов/владельцев. Это доход маркетплейса.',
    formula: 'Platform Revenue = GMV × Take Rate',
    unit: '%',
    timeMeaning: 'От каждой транзакции',
    range: '5-25%',
    disambiguation: 'НЕ путать с commissionPercent (комиссия канала продаж)',
  },

  // ============================================================
  // SALES CHANNEL METRICS
  // ============================================================
  commissionPercent: {
    key: 'commissionPercent',
    label: 'Комиссия канала',
    labelEN: 'Channel Commission',
    description: 'Комиссия, которую КАНАЛ ПРОДАЖ берёт с вас за продажу через него.',
    formula: 'Net Revenue = Gross × (1 - Commission%)',
    unit: '%',
    timeMeaning: 'От каждой продажи',
    range: '0-30%',
    disambiguation: 'НЕ путать с takeRate (ваша комиссия как платформы)',
  },

  discountPercent: {
    key: 'discountPercent',
    label: 'Скидка канала',
    labelEN: 'Channel Discount',
    description: 'Скидка, применяемая в этом канале продаж.',
    formula: 'Net = Gross × (1 - Discount%)',
    unit: '%',
    range: '0-50%',
  },

  returnRatePercent: {
    key: 'returnRatePercent',
    label: 'Процент возвратов',
    labelEN: 'Return Rate',
    description: 'Для физ. товаров: % возвратов. Для SaaS: % refunds/chargebacks (НЕ churn!).',
    unit: '%',
    range: '0-20%',
    disambiguation: 'Для SaaS это refunds, НЕ отток подписчиков',
  },

  paymentDelayDays: {
    key: 'paymentDelayDays',
    label: 'Задержка оплаты',
    labelEN: 'Payment Delay',
    description: 'Через сколько дней канал перечисляет деньги. Влияет на cash flow.',
    unit: 'дней',
    range: '0-90',
    disambiguation: 'Используется в Cash Flow Timeline для сдвига притоков',
  },

  // ============================================================
  // SAAS / SUBSCRIPTION METRICS
  // ============================================================
  churnRate: {
    key: 'churnRate',
    label: 'Churn Rate',
    labelEN: 'Churn Rate',
    description: 'Процент подписчиков, которые отменяют подписку в месяц.',
    formula: 'Lifetime ≈ 1 / Churn',
    unit: '%/месяц',
    range: '1-10%',
    disambiguation: 'Это НЕ возвраты (returnRate), а отток подписчиков',
  },

  costPerSubscriberPerMonth: {
    key: 'costPerSubscriberPerMonth',
    label: 'Себестоимость/подписчика',
    labelEN: 'Cost per Subscriber',
    description: 'Переменные расходы на обслуживание одного подписчика в месяц.',
    formula: 'Total Variable Cost = Σ(subscribers × cost)',
    unit: 'EUR/месяц',
    disambiguation: 'Включает бесплатных пользователей!',
  },

  isFreePlan: {
    key: 'isFreePlan',
    label: 'Бесплатный план',
    labelEN: 'Free Plan',
    description: 'Если включено: цена = 0, но себестоимость учитывается.',
    disambiguation: 'Free tier даёт расходы без дохода (freemium модель)',
  },

  // ============================================================
  // LOGISTICS METRICS
  // ============================================================
  logisticsToClientPerUnit: {
    key: 'logisticsToClientPerUnit',
    label: 'Логистика до клиента',
    labelEN: 'Last-mile Delivery',
    description: 'Стоимость доставки одной единицы товара до клиента.',
    unit: 'Валюта/шт',
    disambiguation: 'Не дублируйте с logistics в каналах продаж',
  },

  baseRate: {
    key: 'baseRate',
    label: 'Базовая ставка',
    labelEN: 'Base Rate',
    description: 'Фиксированная часть тарифа. Может быть за отправку или за единицу.',
    unit: 'Валюта',
    disambiguation: 'Проверьте pricing_model: sum (суммируется) или max (берётся максимум)',
  },

  // ============================================================
  // GMV / REVENUE METRICS
  // ============================================================
  gmvComputed: {
    key: 'gmvComputed',
    label: 'GMV (расчётный)',
    labelEN: 'Computed GMV',
    description: 'Автоматически рассчитанный GMV.',
    formula: 'GMV = Transactions × Avg Check',
  },

  gmvOverride: {
    key: 'gmvOverride',
    label: 'GMV (ручной)',
    labelEN: 'Override GMV',
    description: 'Ручное значение GMV. Если указано, используется вместо расчётного.',
    disambiguation: 'Отклонение >10% показывает предупреждение',
  },

  // ============================================================
  // SERVICES METRICS
  // ============================================================
  billablePercent: {
    key: 'billablePercent',
    label: 'Billable %',
    labelEN: 'Billable Percentage',
    description: 'Какой % рабочего времени оплачивается клиентами.',
    formula: 'Billable Hours = Available × Billable%',
    unit: '%',
    range: '60-90%',
  },

  allocationPercent: {
    key: 'allocationPercent',
    label: 'Загрузка',
    labelEN: 'Allocation',
    description: 'Какой % времени сотрудник выделен на эту услугу.',
    unit: '%',
    range: '0-100%',
  },

  estimatedHoursPerProject: {
    key: 'estimatedHoursPerProject',
    label: 'Часов/проект',
    labelEN: 'Hours per Project',
    description: 'Ожидаемое количество часов на один проект.',
    unit: 'часов',
  },
};

/**
 * Get tooltip config for a metric key
 */
export function getMetricTooltip(key: string): MetricTooltipConfig | undefined {
  return METRIC_TOOLTIPS[key];
}

/**
 * Check if two metrics might be confused
 */
export function getDisambiguation(key: string): string | undefined {
  return METRIC_TOOLTIPS[key]?.disambiguation;
}
