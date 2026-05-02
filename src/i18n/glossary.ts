import type { Language } from "./types";

export interface GlossaryEntry {
  /** Internal stable key (do NOT translate). */
  key: string;
  /** Abbreviation shown as-is across all languages. */
  abbreviation: string;
  ru: { term: string; definition: string };
  en: { term: string; definition: string };
  ro: { term: string; definition: string };
}

export const glossary: GlossaryEntry[] = [
  {
    key: "cac",
    abbreviation: "CAC",
    ru: {
      term: "Стоимость привлечения клиента",
      definition:
        "Сколько в среднем стоит привлечь одного нового платящего клиента: маркетинг и продажи, делённые на число новых клиентов.",
    },
    en: {
      term: "Customer Acquisition Cost",
      definition:
        "The average cost of acquiring one paying customer: marketing and sales spend divided by the number of new customers.",
    },
    ro: {
      term: "Costul de achiziție a clientului",
      definition:
        "Costul mediu de atragere a unui client plătitor: cheltuielile de marketing și vânzări împărțite la numărul clienților noi.",
    },
  },
  {
    key: "ltv",
    abbreviation: "LTV",
    ru: {
      term: "Пожизненная ценность клиента",
      definition:
        "Сколько денег приносит клиент за всё время взаимодействия с бизнесом.",
    },
    en: {
      term: "Lifetime Value",
      definition:
        "The total revenue a customer brings during the full relationship with the business.",
    },
    ro: {
      term: "Valoarea clientului pe durata relației",
      definition:
        "Veniturile totale aduse de un client pe toată durata relației cu afacerea.",
    },
  },
  {
    key: "ltv_cac",
    abbreviation: "LTV / CAC",
    ru: {
      term: "Соотношение LTV к CAC",
      definition:
        "Во сколько раз ценность клиента превышает стоимость его привлечения. Базовый ориентир — около 3.",
    },
    en: {
      term: "LTV to CAC Ratio",
      definition:
        "How many times the customer value exceeds the cost of acquisition. A common benchmark is about 3.",
    },
    ro: {
      term: "Raport LTV la CAC",
      definition:
        "De câte ori valoarea clientului depășește costul de achiziție. Reper uzual — aproximativ 3.",
    },
  },
  {
    key: "payback",
    abbreviation: "Payback",
    ru: {
      term: "Срок окупаемости",
      definition:
        "Время, за которое клиент окупает затраты на своё привлечение.",
    },
    en: {
      term: "Payback Period",
      definition:
        "The time it takes a customer to repay the cost of their acquisition.",
    },
    ro: {
      term: "Perioada de recuperare",
      definition:
        "Timpul necesar ca un client să acopere costul de achiziție.",
    },
  },
  {
    key: "break_even",
    abbreviation: "Break-even",
    ru: {
      term: "Точка безубыточности",
      definition:
        "Уровень продаж, при котором выручка покрывает все расходы и прибыль равна нулю.",
    },
    en: {
      term: "Break-even Point",
      definition:
        "The sales level at which revenue covers all costs and profit equals zero.",
    },
    ro: {
      term: "Punct de break-even",
      definition:
        "Nivelul de vânzări la care veniturile acoperă toate costurile, iar profitul este zero.",
    },
  },
  {
    key: "churn",
    abbreviation: "Churn",
    ru: {
      term: "Отток клиентов",
      definition:
        "Доля клиентов, которые перестали пользоваться продуктом за период.",
    },
    en: {
      term: "Churn Rate",
      definition:
        "The share of customers who stopped using the product during a period.",
    },
    ro: {
      term: "Rata de abandon",
      definition:
        "Procentul clienților care au încetat să folosească produsul într-o perioadă.",
    },
  },
  {
    key: "retention",
    abbreviation: "Retention",
    ru: {
      term: "Удержание клиентов",
      definition:
        "Доля клиентов, оставшихся с продуктом за период. Обратная сторона churn.",
    },
    en: {
      term: "Retention Rate",
      definition:
        "The share of customers who stayed with the product during a period. The opposite of churn.",
    },
    ro: {
      term: "Rata de retenție",
      definition:
        "Procentul clienților care au rămas cu produsul într-o perioadă. Opusul abandonului.",
    },
  },
  {
    key: "aov",
    abbreviation: "AOV",
    ru: {
      term: "Средний чек",
      definition: "Средняя сумма одной покупки или заказа.",
    },
    en: {
      term: "Average Order Value",
      definition: "The average value of a single order.",
    },
    ro: {
      term: "Valoarea medie a comenzii",
      definition: "Valoarea medie a unei singure comenzi.",
    },
  },
  {
    key: "arpu",
    abbreviation: "ARPU",
    ru: {
      term: "Средняя выручка на пользователя",
      definition:
        "Средняя выручка, которую приносит один пользователь за период.",
    },
    en: {
      term: "Average Revenue Per User",
      definition: "The average revenue generated per user during a period.",
    },
    ro: {
      term: "Venit mediu per utilizator",
      definition:
        "Venitul mediu generat de un utilizator într-o perioadă.",
    },
  },
  {
    key: "mrr",
    abbreviation: "MRR",
    ru: {
      term: "Ежемесячная повторяющаяся выручка",
      definition:
        "Стабильная подписочная выручка за месяц без разовых платежей.",
    },
    en: {
      term: "Monthly Recurring Revenue",
      definition:
        "Stable monthly subscription revenue, excluding one-off payments.",
    },
    ro: {
      term: "Venit lunar recurent",
      definition:
        "Venitul lunar stabil din abonamente, fără plățile unice.",
    },
  },
  {
    key: "arr",
    abbreviation: "ARR",
    ru: {
      term: "Годовая повторяющаяся выручка",
      definition: "Годовой аналог MRR: MRR × 12.",
    },
    en: {
      term: "Annual Recurring Revenue",
      definition: "The annual equivalent of MRR: MRR × 12.",
    },
    ro: {
      term: "Venit anual recurent",
      definition: "Echivalentul anual al MRR: MRR × 12.",
    },
  },
  {
    key: "roi",
    abbreviation: "ROI",
    ru: {
      term: "Возврат на инвестиции",
      definition:
        "Отношение прибыли от инвестиции к её стоимости, в процентах.",
    },
    en: {
      term: "Return on Investment",
      definition:
        "The ratio of profit from an investment to its cost, in percent.",
    },
    ro: {
      term: "Rentabilitatea investiției",
      definition:
        "Raportul dintre profitul investiției și costul acesteia, în procente.",
    },
  },
  {
    key: "romi",
    abbreviation: "ROMI",
    ru: {
      term: "Возврат на маркетинговые инвестиции",
      definition:
        "ROI, рассчитанный отдельно по маркетинговым расходам.",
    },
    en: {
      term: "Return on Marketing Investment",
      definition: "ROI computed specifically for marketing spend.",
    },
    ro: {
      term: "Rentabilitatea investiției în marketing",
      definition:
        "ROI calculat separat pentru cheltuielile de marketing.",
    },
  },
  {
    key: "roas",
    abbreviation: "ROAS",
    ru: {
      term: "Возврат на расходы на рекламу",
      definition:
        "Выручка, полученная на каждую денежную единицу расходов на рекламу.",
    },
    en: {
      term: "Return on Ad Spend",
      definition:
        "Revenue generated per unit of currency spent on advertising.",
    },
    ro: {
      term: "Rentabilitatea cheltuielilor publicitare",
      definition:
        "Veniturile generate pentru fiecare unitate de cheltuieli publicitare.",
    },
  },
  {
    key: "cogs",
    abbreviation: "COGS",
    ru: {
      term: "Себестоимость проданных товаров",
      definition:
        "Прямые расходы, связанные с производством или закупкой проданных товаров.",
    },
    en: {
      term: "Cost of Goods Sold",
      definition:
        "Direct costs associated with producing or purchasing the goods sold.",
    },
    ro: {
      term: "Costul bunurilor vândute",
      definition:
        "Costurile directe legate de producția sau achiziția bunurilor vândute.",
    },
  },
  {
    key: "gross_margin",
    abbreviation: "Gross Margin",
    ru: {
      term: "Валовая маржа",
      definition:
        "Доля валовой прибыли в выручке: (Выручка − COGS) / Выручка.",
    },
    en: {
      term: "Gross Margin",
      definition:
        "Gross profit as a share of revenue: (Revenue − COGS) / Revenue.",
    },
    ro: {
      term: "Marjă brută",
      definition:
        "Profitul brut ca pondere din venituri: (Venituri − COGS) / Venituri.",
    },
  },
  {
    key: "contribution_margin",
    abbreviation: "Contribution Margin",
    ru: {
      term: "Маржинальная прибыль",
      definition:
        "Выручка минус все переменные расходы. Показывает, сколько остаётся на покрытие постоянных расходов.",
    },
    en: {
      term: "Contribution Margin",
      definition:
        "Revenue minus all variable costs. Shows how much is left to cover fixed costs.",
    },
    ro: {
      term: "Marjă de contribuție",
      definition:
        "Veniturile minus toate costurile variabile. Arată cât rămâne pentru acoperirea costurilor fixe.",
    },
  },
];

export function getGlossaryFor(language: Language) {
  return glossary.map((entry) => ({
    key: entry.key,
    abbreviation: entry.abbreviation,
    term: entry[language].term,
    definition: entry[language].definition,
  }));
}
