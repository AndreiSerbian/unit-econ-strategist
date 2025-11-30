# Руководство разработчика

## Введение

Это руководство поможет вам начать разработку и внести вклад в проект "Стратегический Анализ".

## Требования к окружению

### Обязательные
- **Node.js**: 18.x или выше
- **npm**: 9.x или выше (или yarn/pnpm/bun)
- **Git**: Для контроля версий

### Рекомендуемые
- **VS Code** с расширениями:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)
- **Supabase CLI** для работы с миграциями

## Первоначальная настройка

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-username/strategic-analysis.git
cd strategic-analysis
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Создайте файл `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### 4. Настройка Supabase (локально)

```bash
# Установка Supabase CLI
npm install -g supabase

# Инициализация
supabase init

# Запуск локального Supabase
supabase start

# Применение миграций
supabase db push
```

### 5. Запуск dev-сервера

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:8080`

## Структура проекта

```
strategic-analysis/
├── src/
│   ├── components/          # React компоненты
│   │   ├── ui/             # Базовые UI компоненты (shadcn)
│   │   ├── Dashboard.tsx   # Главный дашборд
│   │   ├── CompanyMetrics.tsx
│   │   └── ...
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth.tsx
│   │   ├── useProject.tsx
│   │   └── ...
│   ├── integrations/       # Внешние интеграции
│   │   └── supabase/
│   ├── pages/              # Страницы
│   │   ├── Index.tsx
│   │   ├── Auth.tsx
│   │   └── NotFound.tsx
│   ├── utils/              # Утилиты
│   │   ├── metricsCalculations.ts
│   │   └── utils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/                 # Статические файлы
├── supabase/              # Supabase конфигурация
│   ├── migrations/        # Миграции БД
│   └── config.toml
├── docs/                  # Документация
├── .env.example           # Пример env файла
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

## Стек технологий

### Frontend
- **React 18**: UI библиотека
- **TypeScript**: Типизация
- **Vite**: Сборщик и dev-сервер
- **TailwindCSS**: Утилитарный CSS
- **Shadcn/ui**: Компоненты
- **Framer Motion**: Анимации

### State Management
- **React Hooks**: useState, useEffect
- **React Query**: Серверное состояние
- **Context API**: Глобальное состояние

### Backend
- **Supabase**: BaaS
- **PostgreSQL**: База данных

### Инструменты
- **ESLint**: Линтер
- **TypeScript**: Статическая типизация
- **Prettier**: Форматирование (опционально)

## Соглашения по коду

### TypeScript

#### Типизация
```tsx
// ✅ Хорошо - явные типы для props
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button = ({ onClick, children, variant = 'primary' }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>;
};

// ❌ Плохо - any типы
const Button = ({ onClick, children }: any) => {
  return <button onClick={onClick}>{children}</button>;
};
```

#### Интерфейсы vs Types
```tsx
// Используйте interface для объектов
interface User {
  id: string;
  name: string;
}

// Используйте type для unions, intersections
type Status = 'pending' | 'active' | 'completed';
type UserWithStatus = User & { status: Status };
```

### React

#### Функциональные компоненты
```tsx
// ✅ Хорошо - стрелочная функция с типами
export const MyComponent = ({ title }: { title: string }) => {
  return <h1>{title}</h1>;
};

// ❌ Плохо - обычная функция
export function MyComponent(props) {
  return <h1>{props.title}</h1>;
}
```

#### Hooks
```tsx
// ✅ Хорошо - хуки в начале компонента
const MyComponent = () => {
  const [state, setState] = useState(0);
  const value = useMemo(() => expensiveCalc(state), [state]);
  
  return <div>{value}</div>;
};

// ❌ Плохо - условные хуки
const MyComponent = ({ showFeature }) => {
  if (showFeature) {
    const [state, setState] = useState(0); // Ошибка!
  }
  return <div>Content</div>;
};
```

#### Именование
```tsx
// Компоненты - PascalCase
const UserProfile = () => { ... };

// Функции и переменные - camelCase
const calculateTotal = () => { ... };
const userCount = 10;

// Константы - UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';

// Приватные функции - _camelCase (опционально)
const _internalHelper = () => { ... };
```

### CSS / TailwindCSS

#### Семантические токены
```tsx
// ✅ Хорошо - использование токенов
<div className="bg-background text-foreground border-border">
  <h1 className="text-primary">Title</h1>
</div>

// ❌ Плохо - хардкод цветов
<div className="bg-white text-black border-gray-200">
  <h1 className="text-blue-500">Title</h1>
</div>
```

#### Группировка классов
```tsx
// ✅ Хорошо - логическая группировка
<button className="
  px-4 py-2 
  bg-primary text-primary-foreground 
  rounded-lg 
  hover:bg-primary/90 
  transition-colors
">
  Click me
</button>

// ❌ Плохо - хаотичный порядок
<button className="hover:bg-primary/90 px-4 text-primary-foreground py-2 bg-primary transition-colors rounded-lg">
  Click me
</button>
```

### Комментарии

```tsx
/**
 * Рассчитывает CAC (Customer Acquisition Cost)
 * @param metrics - метрики компании
 * @returns стоимость привлечения клиента
 */
export const calculateCAC = (metrics: Metrics): number => {
  if (metrics.newClients === 0) return 0;
  
  // Суммируем маркетинговые расходы
  const marketing = metrics.marketingCosts;
  
  // Суммируем бонусы отдела продаж
  const salesCosts = metrics.salesPayroll;
  
  return (marketing + salesCosts) / metrics.newClients;
};
```

## Git Workflow

### Ветки

```bash
main              # Production-ready код
├── develop       # Development ветка
    ├── feature/xxx  # Новые фичи
    ├── fix/xxx      # Исправления багов
    └── refactor/xxx # Рефакторинг
```

### Commit Messages

Следуем [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Типы
feat:     # Новая фича
fix:      # Исправление бага
docs:     # Изменения в документации
style:    # Форматирование, отсутствуют изменения в коде
refactor: # Рефакторинг без изменения функциональности
perf:     # Оптимизация производительности
test:     # Добавление тестов
chore:    # Изменения в build процессе или зависимостях

# Примеры
git commit -m "feat: add metric history chart"
git commit -m "fix: correct CAC calculation for edge cases"
git commit -m "docs: update README with new features"
git commit -m "refactor: extract metrics calculations to utils"
```

### Pull Request Process

1. Создайте feature ветку
```bash
git checkout -b feature/metric-forecasting
```

2. Сделайте изменения и commit'ы
```bash
git add .
git commit -m "feat: add linear regression forecasting"
```

3. Push в remote
```bash
git push origin feature/metric-forecasting
```

4. Создайте Pull Request на GitHub
5. Дождитесь code review
6. После одобрения - merge в develop

## Работа с Supabase

### Создание миграции

```bash
# Создать новую миграцию
supabase migration new add_metric_history_table

# Отредактируйте файл в supabase/migrations/
# Примените миграцию
supabase db push
```

### Пример миграции

```sql
-- supabase/migrations/20231201000000_add_metric_history.sql

-- Создание таблицы
CREATE TABLE public.metric_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  revenue NUMERIC,
  profit NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включение RLS
ALTER TABLE public.metric_history ENABLE ROW LEVEL SECURITY;

-- Политики
CREATE POLICY "Users can view their metric history"
  ON public.metric_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = metric_history.project_id
    AND projects.user_id = auth.uid()
  ));

-- Индексы
CREATE INDEX idx_metric_history_project_id 
  ON public.metric_history(project_id);
CREATE INDEX idx_metric_history_date 
  ON public.metric_history(snapshot_date DESC);
```

### Работа с данными

```tsx
// Чтение данных
const { data, error } = await supabase
  .from('metric_history')
  .select('*')
  .eq('project_id', projectId)
  .order('snapshot_date', { ascending: false });

// Вставка данных
const { error } = await supabase
  .from('metric_history')
  .insert({
    project_id: projectId,
    revenue: 100000,
    profit: 25000
  });

// Обновление данных
const { error } = await supabase
  .from('metric_history')
  .update({ revenue: 120000 })
  .eq('id', recordId);

// Удаление данных
const { error } = await supabase
  .from('metric_history')
  .delete()
  .eq('id', recordId);
```

## Создание нового компонента

### 1. Создайте файл

```bash
touch src/components/MyNewComponent.tsx
```

### 2. Напишите компонент

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface MyNewComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyNewComponent = ({ title, onAction }: MyNewComponentProps) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
    onAction?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <button 
          onClick={handleClick}
          className={isActive ? "bg-primary" : "bg-secondary"}
        >
          Toggle
        </button>
      </CardContent>
    </Card>
  );
};
```

### 3. Используйте в родительском компоненте

```tsx
import { MyNewComponent } from "@/components/MyNewComponent";

const ParentComponent = () => {
  return (
    <div>
      <MyNewComponent 
        title="My Feature" 
        onAction={() => console.log("Action triggered")}
      />
    </div>
  );
};
```

## Создание custom hook

```tsx
// src/hooks/useMetricHistory.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MetricSnapshot {
  id: string;
  revenue: number;
  profit: number;
  snapshot_date: string;
}

export const useMetricHistory = (projectId?: string) => {
  const [history, setHistory] = useState<MetricSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) return;
    loadHistory();
  }, [projectId]);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('metric_history')
        .select('*')
        .eq('project_id', projectId)
        .order('snapshot_date', { ascending: true });

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSnapshot = async (metrics: Omit<MetricSnapshot, 'id' | 'snapshot_date'>) => {
    if (!projectId) return;

    const { error } = await supabase
      .from('metric_history')
      .insert({
        project_id: projectId,
        ...metrics
      });

    if (error) throw error;
    await loadHistory();
  };

  return {
    history,
    isLoading,
    error,
    loadHistory,
    saveSnapshot
  };
};
```

## Тестирование

### Unit тесты (Vitest)

```tsx
// src/utils/__tests__/metricsCalculations.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCAC } from '../metricsCalculations';

describe('calculateCAC', () => {
  it('should calculate CAC correctly', () => {
    const metrics = {
      marketingCosts: 10000,
      salesPayroll: 5000,
      newClients: 50,
      // ... other required fields
    };

    const result = calculateCAC(metrics);
    expect(result).toBe(300); // (10000 + 5000) / 50
  });

  it('should return 0 when no new clients', () => {
    const metrics = {
      marketingCosts: 10000,
      salesPayroll: 5000,
      newClients: 0,
      // ... other required fields
    };

    const result = calculateCAC(metrics);
    expect(result).toBe(0);
  });
});
```

### Запуск тестов

```bash
# Все тесты
npm run test

# С покрытием
npm run test:coverage

# Watch mode
npm run test:watch
```

## Отладка

### React DevTools
1. Установите [React DevTools](https://react.dev/learn/react-developer-tools)
2. Откройте в Chrome DevTools
3. Инспектируйте компоненты и props

### Console Logging
```tsx
// Логирование с контекстом
console.log('[MyComponent] Current state:', state);

// Логирование только в dev
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}

// Grouping logs
console.group('Calculation steps');
console.log('Step 1:', value1);
console.log('Step 2:', value2);
console.groupEnd();
```

### Debugging Hooks
```tsx
useEffect(() => {
  console.log('Effect triggered');
  console.log('Dependencies:', { projectId, userId });
  
  // ... rest of effect
  
  return () => {
    console.log('Cleanup');
  };
}, [projectId, userId]);
```

## Оптимизация производительности

### useMemo для тяжелых вычислений
```tsx
const MyComponent = ({ data }: { data: number[] }) => {
  // ✅ Кешируем результат
  const expensiveResult = useMemo(() => {
    return data.reduce((sum, val) => sum + val, 0);
  }, [data]);

  return <div>{expensiveResult}</div>;
};
```

### useCallback для функций
```tsx
const MyComponent = () => {
  const [count, setCount] = useState(0);

  // ✅ Кешируем функцию
  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return <ChildComponent onIncrement={increment} />;
};
```

### React.memo для компонентов
```tsx
// ✅ Мемоизация компонента
export const ExpensiveComponent = React.memo(
  ({ data }: { data: Data }) => {
    return <div>{/* expensive render */}</div>;
  }
);
```

## Сборка для production

```bash
# Сборка
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint
```

## Troubleshooting

### Частые проблемы

**Проблема**: `Module not found`
```bash
# Решение: очистить node_modules и переустановить
rm -rf node_modules package-lock.json
npm install
```

**Проблема**: Supabase connection errors
```bash
# Проверьте .env файл
# Убедитесь что Supabase URL и ключи корректны
# Проверьте RLS политики
```

**Проблема**: TypeScript errors
```bash
# Перезапустите TypeScript сервер в VS Code
# Command Palette -> TypeScript: Restart TS Server
```

**Проблема**: Стили не применяются
```bash
# Проверьте tailwind.config.ts content paths
# Убедитесь что классы написаны корректно
# Перезапустите dev server
```

## Дополнительные ресурсы

- [React документация](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS документация](https://tailwindcss.com/docs)
- [Supabase документация](https://supabase.com/docs)
- [Vite документация](https://vitejs.dev)
- [Shadcn/ui](https://ui.shadcn.com)

## Контакты

- **Maintainer**: @your-github-username
- **Email**: dev@example.com
- **Slack**: #strategic-analysis-dev
- **Issues**: [GitHub Issues](https://github.com/your-username/strategic-analysis/issues)
