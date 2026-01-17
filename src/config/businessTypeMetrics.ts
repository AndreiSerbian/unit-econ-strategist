// Configuration for business-type-specific metrics and labels

export type BusinessType = 
  | 'saas' 
  | 'ecommerce' 
  | 'production' 
  | 'services' 
  | 'freemium' 
  | 'sharing' 
  | 'marketplace';

export interface ProductField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  required?: boolean;
  suffix?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

export interface BusinessTypeConfig {
  id: BusinessType;
  label: string;
  description: string;
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
  productLabelPlural: string;
  productFields: ProductField[];
}

const DELIVERY_TYPE_OPTIONS = [
  { value: "courier", label: "Курьер" },
  { value: "pickup", label: "Самовывоз" },
  { value: "transport_company", label: "Транспортная компания" },
  { value: "own_delivery", label: "Своя доставка" },
];

export const businessTypes: BusinessTypeConfig[] = [
  {
    id: 'saas',
    label: 'SaaS / Подписка',
    description: 'Программное обеспечение как услуга, подписочные модели',
    icon: '💻',
    primaryMetrics: ['MRR', 'ARR', 'Churn Rate', 'ARPU', 'LTV'],
    additionalMetrics: ['Retention Rate', 'Expansion Revenue', 'NRR'],
    labels: {
      revenue: 'MRR (Месячная выручка)',
      clients: 'Активные подписчики',
      avgCheck: 'ARPU (Средний чек)',
      conversion: 'Trial → Paid конверсия',
      retention: 'Retention Rate',
    },
    productLabel: 'Тарифный план',
    productLabelPlural: 'Тарифные планы',
    productFields: [
      { key: 'name', label: 'Название плана', type: 'text', required: true },
      { key: 'price', label: 'Цена подписки', type: 'number', suffix: '/мес' },
      { key: 'quantity', label: 'Подписчики', type: 'number' },
      { key: 'cost', label: 'Себестоимость', type: 'number', suffix: '/мес' },
      { key: 'churnRate', label: 'Churn Rate', type: 'number', suffix: '%', min: 0, max: 100 },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce / Дропшиппинг',
    description: 'Интернет-магазины, дистрибуция, дропшиппинг',
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
    productLabelPlural: 'Продукты',
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
  },
  {
    id: 'production',
    label: 'Производство',
    description: 'Собственное производство товаров',
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
    productLabelPlural: 'Продукты',
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
  },
  {
    id: 'services',
    label: 'Услуги / Консалтинг',
    description: 'Оказание услуг, консультирование, обучение',
    icon: '💼',
    primaryMetrics: ['Часовая ставка', 'Загрузка', 'Проектная маржа'],
    additionalMetrics: ['Utilization Rate', 'Billable Hours', 'Client Retention'],
    labels: {
      revenue: 'Выручка от услуг',
      clients: 'Клиенты/Проекты',
      avgCheck: 'Средний проект',
      conversion: 'Конверсия в договор',
      retention: 'Retention Rate',
    },
    productLabel: 'Услуга',
    productLabelPlural: 'Услуги',
    productFields: [
      { key: 'name', label: 'Название услуги', type: 'text', required: true },
      { key: 'price', label: 'Стоимость', type: 'number' },
      { key: 'cost', label: 'Себестоимость', type: 'number' },
      { key: 'quantity', label: 'Кол-во проектов', type: 'number' },
      { key: 'hourlyRate', label: 'Часовая ставка', type: 'number' },
      { key: 'utilization', label: 'Загрузка', type: 'number', suffix: '%', min: 0, max: 100 },
    ],
  },
  {
    id: 'freemium',
    label: 'Freemium / On-demand',
    description: 'Бесплатная базовая версия с платными функциями',
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
    productLabelPlural: 'Тарифы',
    productFields: [
      { key: 'name', label: 'Название тарифа', type: 'text', required: true },
      { key: 'price', label: 'Цена', type: 'number', suffix: '/мес' },
      { key: 'quantity', label: 'Пользователи', type: 'number' },
      { key: 'cost', label: 'Себестоимость', type: 'number' },
      { key: 'freeToPayConversion', label: 'Free → Paid', type: 'number', suffix: '%', min: 0, max: 100 },
    ],
  },
  {
    id: 'sharing',
    label: 'Sharing Economy',
    description: 'Шеринг, аренда, совместное использование ресурсов',
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
    productLabelPlural: 'Ресурсы',
    productFields: [
      { key: 'name', label: 'Название ресурса', type: 'text', required: true },
      { key: 'price', label: 'Цена аренды', type: 'number', suffix: '/час' },
      { key: 'quantity', label: 'Кол-во единиц', type: 'number' },
      { key: 'cost', label: 'Стоимость содержания', type: 'number', suffix: '/мес' },
      { key: 'utilizationRate', label: 'Загрузка', type: 'number', suffix: '%', min: 0, max: 100 },
      { key: 'takeRate', label: 'Take Rate', type: 'number', suffix: '%', min: 0, max: 100 },
    ],
  },
  {
    id: 'marketplace',
    label: 'Маркетплейс',
    description: 'Платформа для связи покупателей и продавцов',
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
    productLabelPlural: 'Категории',
    productFields: [
      { key: 'name', label: 'Название категории', type: 'text', required: true },
      { key: 'gmv', label: 'GMV', type: 'number' },
      { key: 'quantity', label: 'Кол-во транзакций', type: 'number' },
      { key: 'takeRate', label: 'Take Rate', type: 'number', suffix: '%', min: 0, max: 100 },
      { key: 'avgOrderValue', label: 'Средний чек', type: 'number' },
    ],
  },
];

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
