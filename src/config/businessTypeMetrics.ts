// Configuration for business-type-specific metrics and labels

export type BusinessType = 
  | 'saas' 
  | 'ecommerce' 
  | 'production' 
  | 'services' 
  | 'freemium' 
  | 'sharing' 
  | 'marketplace'
  | 'token_saas';

export interface ProductField {
  key: string;
  label: string;
  labelKey?: string;
  type: 'text' | 'number' | 'select';
  required?: boolean;
  suffix?: string;
  suffixKey?: string;
  options?: { value: string; label: string; labelKey?: string }[];
  min?: number;
  max?: number;
}

export interface MetricField {
  key: string;
  label: string;
  labelKey?: string;
  description?: string;
  descriptionKey?: string;
  suffix?: string;
  suffixKey?: string;
  category: 'revenue' | 'clients' | 'conversion' | 'retention' | 'custom';
  calculatedFrom?: string[]; // If metric is auto-calculated
}

export interface BusinessTypeFeatures {
  hasRawMaterials: boolean;      // Сырьё и комплектующие
  hasLogistics: boolean;         // Логистика и тарифы доставки
  hasSalesChannels: boolean;     // Каналы продаж
  hasPhysicalProducts: boolean;  // Физические продукты (вес, объём)
  hasInventory: boolean;         // Складские остатки
}

export interface BusinessTypeConfig {
  id: BusinessType;
  label: string;
  labelKey?: string;
  description: string;
  descriptionKey?: string;
  icon: string;
  primaryMetrics: string[];
  additionalMetrics: string[];
  labels: {
    revenue?: string;
    clients?: string;
    avgCheck?: string;
    conversion?: string;
    retention?: string;
  };
  productLabel: string;
  productLabelKey?: string;
  productLabelPlural: string;
  productLabelPluralKey?: string;
  productFields: ProductField[];
  metricFields: MetricField[];
  features: BusinessTypeFeatures;
}

const DELIVERY_TYPE_OPTIONS = [
  { value: "courier", label: "Курьер", labelKey: "businessTypeMetrics.delivery_courier" },
  { value: "pickup", label: "Самовывоз", labelKey: "businessTypeMetrics.delivery_pickup" },
  { value: "transport_company", label: "Транспортная компания", labelKey: "businessTypeMetrics.delivery_transport_company" },
  { value: "own_delivery", label: "Своя доставка", labelKey: "businessTypeMetrics.delivery_own_delivery" },
];

export const businessTypes: BusinessTypeConfig[] = [
  {
    id: 'saas',
    label: 'SaaS / Подписка',
    labelKey: 'businessTypeMetrics.saas_label',
    description: 'Программное обеспечение как услуга, подписочные модели',
    descriptionKey: 'businessTypeMetrics.saas_description',
    icon: '💻',
    primaryMetrics: ['MRR', 'ARR', 'Churn Rate', 'ARPU', 'LTV'],
    additionalMetrics: ['Retention Rate', 'Expansion Revenue', 'NRR'],
    labels: {
      revenue: 'MRR',
      clients: 'Активные подписчики',
      avgCheck: 'ARPU',
      conversion: 'Trial → Paid конверсия',
      retention: 'Retention Rate',
    },
    productLabel: 'Тарифный план',
    productLabelKey: 'businessTypeMetrics.saas_productLabel',
    productLabelPlural: 'Тарифные планы',
    productLabelPluralKey: 'businessTypeMetrics.saas_productLabelPlural',
    productFields: [
      { key: 'name', label: 'Название плана', labelKey: 'businessTypeMetrics.saas_field_name', type: 'text', required: true },
      { key: 'price', label: 'Цена подписки', labelKey: 'businessTypeMetrics.saas_field_price', type: 'number', suffix: '/мес', suffixKey: 'businessTypeMetrics.suffix_per_month' },
      { key: 'quantity', label: 'Подписчики', labelKey: 'businessTypeMetrics.saas_field_quantity', type: 'number' },
      { key: 'newSubscribers', label: 'Новые подп.', labelKey: 'businessTypeMetrics.field_newSubscribers', type: 'number', suffix: '/мес', suffixKey: 'businessTypeMetrics.suffix_per_month' },
      { key: 'cost', label: 'Себестоимость', labelKey: 'businessTypeMetrics.field_cost', type: 'number', suffix: '/мес', suffixKey: 'businessTypeMetrics.suffix_per_month' },
      { key: 'churnRate', label: 'Churn Rate', labelKey: 'businessTypeMetrics.field_churnRate', type: 'number', suffix: '%', suffixKey: 'businessTypeMetrics.suffix_percent', min: 0, max: 100 },
    ],
    metricFields: [
      { key: 'mrr', label: 'MRR', description: 'Месячная регулярная выручка', category: 'revenue', calculatedFrom: ['products'] },
      { key: 'arr', label: 'ARR', description: 'Годовая регулярная выручка (MRR × 12)', category: 'revenue', calculatedFrom: ['mrr'] },
      { key: 'churnRate', label: 'Churn Rate', description: 'Процент оттока подписчиков в месяц', suffix: '%', category: 'retention' },
      { key: 'retentionRate', label: 'Retention Rate', description: 'Процент удержания подписчиков', suffix: '%', category: 'retention', calculatedFrom: ['churnRate'] },
      { key: 'arpu', label: 'ARPU', description: 'Средний доход на пользователя', category: 'revenue', calculatedFrom: ['mrr', 'totalClients'] },
      { key: 'trialConversion', label: 'Trial → Paid', description: 'Конверсия из пробного периода', suffix: '%', category: 'conversion' },
      { key: 'expansionRevenue', label: 'Expansion Revenue', description: 'Допродажи и апгрейды', category: 'revenue' },
      { key: 'nrr', label: 'NRR', description: 'Net Revenue Retention — чистое удержание выручки', suffix: '%', category: 'retention' },
    ],
    features: {
      hasRawMaterials: false,
      hasLogistics: false,
      hasSalesChannels: true,
      hasPhysicalProducts: false,
      hasInventory: false,
    },
  },
  {
    id: 'ecommerce',
    label: 'E-commerce / Дропшиппинг',
    labelKey: 'businessTypeMetrics.ecommerce_label',
    description: 'Интернет-магазины, дистрибуция, дропшиппинг',
    descriptionKey: 'businessTypeMetrics.ecommerce_description',
    icon: '🛒',
    primaryMetrics: ['AOV', 'Repeat Rate', 'Cart Abandonment', 'Маржа'],
    additionalMetrics: ['ROAS', 'CPA', 'GMV'],
    labels: {
      revenue: 'Выручка',
      clients: 'Покупатели',
      avgCheck: 'Средний чек (AOV)',
      conversion: 'Конверсия в покупку',
      retention: 'Repeat Rate',
    },
    productLabel: 'Продукт',
    productLabelKey: 'businessTypeMetrics.ecommerce_productLabel',
    productLabelPlural: 'Продукты',
    productLabelPluralKey: 'businessTypeMetrics.ecommerce_productLabelPlural',
    productFields: [
      { key: 'name', label: 'Название', type: 'text', required: true },
      { key: 'price', label: 'Цена', type: 'number' },
      { key: 'cost', label: 'Себестоимость', type: 'number' },
      { key: 'quantity', label: 'Количество', type: 'number' },
      { key: 'quality', label: 'Качество', type: 'number', min: 1, max: 20 },
      { key: 'logisticsToClientPerUnit', label: 'Логистика до клиента', type: 'number', suffix: 'за 1 шт.' },
      { key: 'weightPerUnit', label: 'Вес', type: 'number', suffix: 'кг' },
      { key: 'volumePerUnit', label: 'Объём', type: 'number', suffix: 'м³' },
      { key: 'deliveryType', label: 'Тип доставки', type: 'select', options: DELIVERY_TYPE_OPTIONS },
    ],
    metricFields: [
      { key: 'aov', label: 'AOV', description: 'Average Order Value — средний чек', category: 'revenue', calculatedFrom: ['revenue', 'totalClients'] },
      { key: 'repeatRate', label: 'Repeat Rate', description: 'Доля повторных покупателей', suffix: '%', category: 'retention' },
      { key: 'cartAbandonment', label: 'Cart Abandonment', description: 'Процент брошенных корзин', suffix: '%', category: 'conversion' },
      { key: 'roas', label: 'ROAS', description: 'Return on Ad Spend', category: 'custom', calculatedFrom: ['revenue', 'marketingCosts'] },
      { key: 'cpa', label: 'CPA', description: 'Cost Per Acquisition', category: 'custom', calculatedFrom: ['marketingCosts', 'newClients'] },
      { key: 'gmv', label: 'GMV', description: 'Gross Merchandise Value', category: 'revenue' },
      { key: 'ordersPerCustomer', label: 'Заказов на клиента', description: 'Среднее кол-во заказов на клиента', category: 'retention' },
    ],
    features: {
      hasRawMaterials: true,
      hasLogistics: true,
      hasSalesChannels: true,
      hasPhysicalProducts: true,
      hasInventory: true,
    },
  },
  {
    id: 'production',
    label: 'Производство',
    labelKey: 'businessTypeMetrics.production_label',
    description: 'Собственное производство товаров',
    descriptionKey: 'businessTypeMetrics.production_description',
    icon: '🏭',
    primaryMetrics: ['Себестоимость', 'Мощности', 'Утилизация', 'Маржа'],
    additionalMetrics: ['Оборачиваемость', 'Брак %', 'OEE'],
    labels: {
      revenue: 'Выручка от продаж',
      clients: 'Клиенты/Заказы',
      avgCheck: 'Средний заказ',
      conversion: 'Конверсия',
      retention: 'Повторные заказы',
    },
    productLabel: 'Продукт',
    productLabelKey: 'businessTypeMetrics.production_productLabel',
    productLabelPlural: 'Продукты',
    productLabelPluralKey: 'businessTypeMetrics.production_productLabelPlural',
    productFields: [
      { key: 'name', label: 'Название', type: 'text', required: true },
      { key: 'price', label: 'Цена', type: 'number' },
      { key: 'cost', label: 'Себестоимость', type: 'number' },
      { key: 'quantity', label: 'Объём производства', type: 'number' },
      { key: 'quality', label: 'Качество', type: 'number', min: 1, max: 20 },
      { key: 'defectRate', label: 'Процент брака', type: 'number', suffix: '%', min: 0, max: 100 },
      { key: 'logisticsToClientPerUnit', label: 'Логистика до клиента', type: 'number', suffix: 'за 1 шт.' },
      { key: 'weightPerUnit', label: 'Вес', type: 'number', suffix: 'кг' },
      { key: 'volumePerUnit', label: 'Объём', type: 'number', suffix: 'м³' },
      { key: 'deliveryType', label: 'Тип доставки', type: 'select', options: DELIVERY_TYPE_OPTIONS },
    ],
    metricFields: [
      { key: 'productionCapacity', label: 'Мощности', description: 'Производственная мощность в месяц', category: 'custom' },
      { key: 'utilization', label: 'Утилизация', description: 'Загрузка производственных мощностей', suffix: '%', category: 'custom' },
      { key: 'defectRate', label: 'Брак', description: 'Процент бракованной продукции', suffix: '%', category: 'custom' },
      { key: 'oee', label: 'OEE', description: 'Overall Equipment Effectiveness', suffix: '%', category: 'custom' },
      { key: 'inventoryTurnover', label: 'Оборачиваемость', description: 'Оборачиваемость запасов', category: 'custom' },
      { key: 'grossMargin', label: 'Маржа', description: 'Валовая маржа', suffix: '%', category: 'revenue', calculatedFrom: ['revenue', 'variableCosts'] },
    ],
    features: {
      hasRawMaterials: true,
      hasLogistics: true,
      hasSalesChannels: true,
      hasPhysicalProducts: true,
      hasInventory: true,
    },
  },
  {
    id: 'services',
    label: 'Услуги / Консалтинг',
    labelKey: 'businessTypeMetrics.services_label',
    description: 'Оказание услуг, консультирование, обучение',
    descriptionKey: 'businessTypeMetrics.services_description',
    icon: '💼',
    primaryMetrics: ['Часовая ставка', 'Загрузка', 'Проектная маржа'],
    additionalMetrics: ['Загрузка (%)', 'Оплачиваемые часы', 'Удержание клиентов'],
    labels: {
      revenue: 'Выручка от услуг',
      clients: 'Клиенты/Проекты',
      avgCheck: 'Средний проект',
      conversion: 'Конверсия в договор',
      retention: 'Удержание клиентов',
    },
    productLabel: 'Услуга',
    productLabelKey: 'businessTypeMetrics.services_productLabel',
    productLabelPlural: 'Услуги',
    productLabelPluralKey: 'businessTypeMetrics.services_productLabelPlural',
    // Services v2: minimal fields for add form, full editing in ServicesProductCard
    productFields: [
      { key: 'name', label: 'Название услуги', type: 'text', required: true },
      { key: 'billingModel', label: 'Модель оплаты', type: 'select', options: [
        { value: 'fixed_project', label: 'Фиксированный проект' },
        { value: 'hourly', label: 'Почасовая оплата' },
        { value: 'retainer', label: 'Абонентское сопровождение' },
      ]},
      { key: 'planningPeriod', label: 'Период', type: 'select', options: [
        { value: 'week', label: 'Неделя' },
        { value: 'month', label: 'Месяц' },
        { value: 'quarter', label: 'Квартал' },
        { value: 'year', label: 'Год' },
      ]},
      { key: 'price', label: 'Цена проекта', type: 'number' },
      { key: 'hoursPerWeek', label: 'Часов/нед', type: 'number', suffix: 'ч', min: 0, max: 168 },
      { key: 'billablePercent', label: 'Оплачиваемое время %', type: 'number', suffix: '%', min: 0, max: 100 },
    ],
    metricFields: [
      { key: 'hourlyRate', label: 'Часовая ставка', description: 'Средняя ставка за час работы', category: 'revenue' },
      { key: 'utilizationRate', label: 'Загрузка (%)', description: 'Процент оплачиваемого времени', suffix: '%', category: 'custom' },
      { key: 'billableHours', label: 'Оплачиваемые часы', description: 'Оплачиваемые часы в месяц', category: 'custom' },
      { key: 'projectMargin', label: 'Проектная маржа', description: 'Средняя маржа на проект', suffix: '%', category: 'revenue' },
      { key: 'clientRetention', label: 'Удержание клиентов', description: 'Процент возвращающихся клиентов', suffix: '%', category: 'retention' },
      { key: 'avgProjectValue', label: 'Средний проект', description: 'Средняя стоимость проекта', category: 'revenue', calculatedFrom: ['revenue', 'totalClients'] },
    ],
    features: {
      hasRawMaterials: false,
      hasLogistics: false,
      hasSalesChannels: false,
      hasPhysicalProducts: false,
      hasInventory: false,
    },
  },
  {
    id: 'freemium',
    label: 'Freemium / On-demand',
    labelKey: 'businessTypeMetrics.freemium_label',
    description: 'Бесплатная базовая версия с платными функциями',
    descriptionKey: 'businessTypeMetrics.freemium_description',
    icon: '🎁',
    primaryMetrics: ['Free → Paid конверсия', 'ARPU', 'LTV'],
    additionalMetrics: ['DAU/MAU', 'Activation Rate', 'Feature Adoption'],
    labels: {
      revenue: 'Выручка от Premium',
      clients: 'Платящие пользователи',
      avgCheck: 'ARPU',
      conversion: 'Free → Paid',
      retention: 'Retention Rate',
    },
    productLabel: 'Тариф',
    productLabelKey: 'businessTypeMetrics.freemium_productLabel',
    productLabelPlural: 'Тарифы',
    productLabelPluralKey: 'businessTypeMetrics.freemium_productLabelPlural',
    productFields: [
      { key: 'name', label: 'Название тарифа', type: 'text', required: true },
      { key: 'price', label: 'Цена', type: 'number', suffix: '/мес' },
      { key: 'quantity', label: 'Пользователи', type: 'number' },
      { key: 'cost', label: 'Себестоимость', type: 'number' },
      { key: 'freeToPayConversion', label: 'Free → Paid', type: 'number', suffix: '%', min: 0, max: 100 },
    ],
    metricFields: [
      { key: 'freeUsers', label: 'Бесплатные пользователи', description: 'Количество пользователей на Free плане', category: 'clients' },
      { key: 'paidUsers', label: 'Платящие пользователи', description: 'Количество пользователей на платном плане', category: 'clients' },
      { key: 'freeToPayConversion', label: 'Free → Paid', description: 'Конверсия из бесплатного в платный', suffix: '%', category: 'conversion' },
      { key: 'arpu', label: 'ARPU', description: 'Средний доход на пользователя', category: 'revenue', calculatedFrom: ['revenue', 'paidUsers'] },
      { key: 'dauMau', label: 'DAU/MAU', description: 'Отношение дневных к месячным пользователям', suffix: '%', category: 'retention' },
      { key: 'activationRate', label: 'Activation Rate', description: 'Процент активированных пользователей', suffix: '%', category: 'conversion' },
    ],
    features: {
      hasRawMaterials: false,
      hasLogistics: false,
      hasSalesChannels: true,
      hasPhysicalProducts: false,
      hasInventory: false,
    },
  },
  {
    id: 'sharing',
    label: 'Sharing Economy',
    labelKey: 'businessTypeMetrics.sharing_label',
    description: 'Шеринг, аренда, совместное использование ресурсов',
    descriptionKey: 'businessTypeMetrics.sharing_description',
    icon: '🔄',
    primaryMetrics: ['Utilization Rate', 'Take Rate', 'GMV'],
    additionalMetrics: ['Supply/Demand Balance', 'Time to First Booking'],
    labels: {
      revenue: 'Комиссионный доход',
      clients: 'Активные пользователи',
      avgCheck: 'Средняя транзакция',
      conversion: 'Конверсия в бронь',
      retention: 'Repeat Usage',
    },
    productLabel: 'Ресурс',
    productLabelKey: 'businessTypeMetrics.sharing_productLabel',
    productLabelPlural: 'Ресурсы',
    productLabelPluralKey: 'businessTypeMetrics.sharing_productLabelPlural',
    productFields: [
      { key: 'name', label: 'Название ресурса', type: 'text', required: true },
      { key: 'price', label: 'Цена аренды', type: 'number', suffix: '/час' },
      { key: 'quantity', label: 'Кол-во единиц', type: 'number' },
      { key: 'cost', label: 'Стоимость содержания', type: 'number', suffix: '/мес' },
      { key: 'utilizationRate', label: 'Загрузка', type: 'number', suffix: '%', min: 0, max: 100 },
      { key: 'takeRate', label: 'Take Rate', type: 'number', suffix: '%', min: 0, max: 100 },
    ],
    metricFields: [
      { key: 'gmv', label: 'GMV', description: 'Gross Merchandise Value — объём транзакций', category: 'revenue' },
      { key: 'takeRate', label: 'Take Rate', description: 'Процент комиссии платформы', suffix: '%', category: 'revenue' },
      { key: 'utilizationRate', label: 'Utilization Rate', description: 'Загрузка ресурсов', suffix: '%', category: 'custom' },
      { key: 'avgBookingValue', label: 'Средняя бронь', description: 'Средняя стоимость бронирования', category: 'revenue' },
      { key: 'repeatUsage', label: 'Repeat Usage', description: 'Доля повторных бронирований', suffix: '%', category: 'retention' },
      { key: 'supplyDemandBalance', label: 'Supply/Demand', description: 'Баланс спроса и предложения', suffix: '%', category: 'custom' },
    ],
    features: {
      hasRawMaterials: false,
      hasLogistics: true,
      hasSalesChannels: true,
      hasPhysicalProducts: false,
      hasInventory: true,
    },
  },
  {
    id: 'marketplace',
    label: 'Маркетплейс',
    labelKey: 'businessTypeMetrics.marketplace_label',
    description: 'Платформа для связи покупателей и продавцов',
    descriptionKey: 'businessTypeMetrics.marketplace_description',
    icon: '🏪',
    primaryMetrics: ['GMV', 'Take Rate', 'Liquidity'],
    additionalMetrics: ['Seller Acquisition', 'Buyer Acquisition', 'AOV'],
    labels: {
      revenue: 'Комиссия (Take Rate)',
      clients: 'Активные покупатели',
      avgCheck: 'Средний заказ',
      conversion: 'Конверсия',
      retention: 'Retention',
    },
    productLabel: 'Категория',
    productLabelKey: 'businessTypeMetrics.marketplace_productLabel',
    productLabelPlural: 'Категории',
    productLabelPluralKey: 'businessTypeMetrics.marketplace_productLabelPlural',
    productFields: [
      { key: 'name', label: 'Название категории', type: 'text', required: true },
      { key: 'gmv', label: 'GMV', type: 'number' },
      { key: 'quantity', label: 'Кол-во транзакций', type: 'number' },
      { key: 'takeRate', label: 'Take Rate', type: 'number', suffix: '%', min: 0, max: 100 },
      { key: 'avgOrderValue', label: 'Средний чек', type: 'number' },
    ],
    metricFields: [
      { key: 'gmv', label: 'GMV', description: 'Gross Merchandise Value — общий объём продаж', category: 'revenue' },
      { key: 'takeRate', label: 'Take Rate', description: 'Комиссия платформы', suffix: '%', category: 'revenue' },
      { key: 'liquidity', label: 'Liquidity', description: 'Процент успешных транзакций', suffix: '%', category: 'custom' },
      { key: 'activeSellers', label: 'Активные продавцы', description: 'Количество активных продавцов', category: 'clients' },
      { key: 'activeBuyers', label: 'Активные покупатели', description: 'Количество активных покупателей', category: 'clients' },
      { key: 'aov', label: 'AOV', description: 'Средний чек заказа', category: 'revenue', calculatedFrom: ['gmv', 'totalTransactions'] },
    ],
    features: {
      hasRawMaterials: false,
      hasLogistics: true,
      hasSalesChannels: true,
      hasPhysicalProducts: false,
      hasInventory: false,
    },
  },
  {
    id: 'token_saas',
    label: 'Token SaaS',
    labelKey: 'businessTypeMetrics.token_saas_label',
    description: 'Платформа с токен-экономикой (API, AI, кредиты)',
    descriptionKey: 'businessTypeMetrics.token_saas_description',
    icon: '🪙',
    primaryMetrics: ['IT Price', 'Package Revenue', 'API Margin', 'IT Utilization'],
    additionalMetrics: ['Platform Profit', 'Avg IT Cost', 'Markup %'],
    labels: {
      revenue: 'Выручка от пакетов',
      clients: 'Покупатели пакетов',
      avgCheck: 'Средний пакет',
      conversion: 'Конверсия в покупку',
      retention: 'Повторные покупки',
    },
    productLabel: 'Пакет токенов',
    productLabelKey: 'businessTypeMetrics.token_saas_productLabel',
    productLabelPlural: 'Пакеты токенов',
    productLabelPluralKey: 'businessTypeMetrics.token_saas_productLabelPlural',
    productFields: [
      // Token SaaS uses custom UI, minimal fields for compatibility
      { key: 'name', label: 'Название пакета', type: 'text', required: true },
      { key: 'price', label: 'Цена пакета ($)', type: 'number' },
      { key: 'quantity', label: 'Ожидаемые продажи', type: 'number' },
    ],
    metricFields: [
      { key: 'itValueUsd', label: 'IT Value', description: 'Стоимость 1 Internal Token в USD', category: 'custom' },
      { key: 'packageRevenue', label: 'Package Revenue', description: 'Выручка от продаж пакетов', category: 'revenue' },
      { key: 'apiCosts', label: 'API Costs', description: 'Затраты на API-вызовы', category: 'custom' },
      { key: 'platformProfit', label: 'Platform Profit', description: 'Прибыль платформы', category: 'revenue' },
      { key: 'itUtilization', label: 'IT Utilization', description: 'Процент использования проданных токенов', suffix: '%', category: 'retention' },
      { key: 'avgMarkup', label: 'Avg Markup', description: 'Средняя наценка на операции', suffix: '%', category: 'custom' },
    ],
    features: {
      hasRawMaterials: false,
      hasLogistics: false,
      hasSalesChannels: false,
      hasPhysicalProducts: false,
      hasInventory: false,
    },
  },
];

/**
 * Resolve i18n text from an optional translation key with a Russian fallback.
 * Use in components that read user-facing labels from this config.
 */
export const resolveI18nText = (
  t: (key: string, vars?: Record<string, string | number>) => string,
  fallback?: string,
  key?: string
): string => {
  if (key) {
    const translated = t(key);
    // t() returns the path itself if the key is missing → fall back to RU.
    if (translated && translated !== key) return translated;
  }
  return fallback ?? "";
};

export const getProductLabelKey = (type: BusinessType, plural = false): string | undefined => {
  const config = getBusinessTypeConfig(type);
  return plural ? config.productLabelPluralKey : config.productLabelKey;
};

export const getBusinessTypeConfig = (type: BusinessType): BusinessTypeConfig => {
  return businessTypes.find(bt => bt.id === type) || businessTypes[1]; // default to ecommerce
};

export const getMetricLabel = (type: BusinessType, metric: keyof BusinessTypeConfig['labels']): string => {
  const config = getBusinessTypeConfig(type);
  return config.labels[metric] || metric;
};

export const getProductFields = (type: BusinessType): ProductField[] => {
  const config = getBusinessTypeConfig(type);
  return config.productFields;
};

export const getProductLabel = (type: BusinessType, plural = false): string => {
  const config = getBusinessTypeConfig(type);
  return plural ? config.productLabelPlural : config.productLabel;
};

export const getMetricFields = (type: BusinessType): MetricField[] => {
  const config = getBusinessTypeConfig(type);
  return config.metricFields;
};

export const getBusinessFeatures = (type: BusinessType): BusinessTypeFeatures => {
  const config = getBusinessTypeConfig(type);
  return config.features;
};
