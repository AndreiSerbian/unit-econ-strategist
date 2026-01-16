// Configuration for business-type-specific metrics and labels

export type BusinessType = 
  | 'saas' 
  | 'ecommerce' 
  | 'production' 
  | 'services' 
  | 'freemium' 
  | 'sharing' 
  | 'marketplace';

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
}

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
  },
];

export const getBusinessTypeConfig = (type: BusinessType): BusinessTypeConfig => {
  return businessTypes.find(bt => bt.id === type) || businessTypes[1]; // default to ecommerce
};

export const getMetricLabel = (type: BusinessType, metric: keyof BusinessTypeConfig['labels']): string => {
  const config = getBusinessTypeConfig(type);
  return config.labels[metric] || metric;
};
