# Архитектура проекта

## Обзор

Приложение "Стратегический Анализ" построено по архитектуре Single Page Application (SPA) с использованием современного стека технологий React + TypeScript + Supabase.

## Архитектурные принципы

### 1. Разделение ответственности
- **Компоненты** - отвечают только за UI и взаимодействие с пользователем
- **Hooks** - управление состоянием и бизнес-логикой
- **Utils** - чистые функции для расчетов и преобразований
- **Integrations** - взаимодействие с внешними сервисами

### 2. Однонаправленный поток данных
```
User Action → Component → Hook → Supabase → Hook → Component → UI Update
```

### 3. Composition over Inheritance
Используем композицию компонентов вместо наследования:
```tsx
<Dashboard>
  <CompanyMetrics />
  <CompetitorAnalysis />
  <MetricsCharts />
</Dashboard>
```

## Слои приложения

### Presentation Layer (UI)
**Расположение**: `src/components/`, `src/pages/`

Отвечает за:
- Отображение данных
- Обработка пользовательского ввода
- Навигация
- Анимации и transitions

**Технологии**:
- React компоненты
- TailwindCSS
- Shadcn/ui
- Framer Motion

### Business Logic Layer
**Расположение**: `src/hooks/`, `src/utils/`

Отвечает за:
- Управление состоянием приложения
- Бизнес-правила и расчеты
- Валидация данных
- Синхронизация с backend

**Ключевые хуки**:
- `useAuth` - аутентификация
- `useProject` - управление проектом и данными
- `useToast` - уведомления

### Data Layer
**Расположение**: `src/integrations/supabase/`

Отвечает за:
- Взаимодействие с Supabase
- Управление сессией
- Real-time подписки
- Типы данных из БД

## Архитектура компонентов

### Атомарные компоненты (Atoms)
Базовые UI элементы из `src/components/ui/`:
- Button
- Input
- Card
- Badge
- etc.

### Молекулярные компоненты (Molecules)
Простые комбинации атомов:
- FormField (Label + Input + Error)
- MetricCard (Card + Icon + Value)

### Организмы (Organisms)
Сложные секции интерфейса:
- CompanyMetrics
- CompetitorAnalysis
- MetricsCharts
- SWOTAnalysis

### Страницы (Pages)
Полные экраны:
- Index (Dashboard)
- Auth
- NotFound

## Управление состоянием

### Локальное состояние
Используем `useState` для компонентного состояния:
```tsx
const [isOpen, setIsOpen] = useState(false);
```

### Глобальное состояние
Управляется через custom hooks с React Context:
```tsx
const { user, signIn, signOut } = useAuth();
const { currentMetrics, saveScenario } = useProject();
```

### Серверное состояние
Управляется через Supabase Realtime и React Query:
```tsx
const { data, isLoading } = useQuery(['projects'], fetchProjects);
```

## База данных

### Структура
```
┌─────────────┐
│  projects   │──┐
└─────────────┘  │
                 ├──> scenarios
                 ├──> competitors ──> products
                 ├──> products
                 ├──> swot_analyses
                 ├──> scenario_summaries
                 ├──> metric_history
                 └──> action_plans

┌─────────────────┐
│ business_tools  │──> expense_tools
└─────────────────┘
```

### Row Level Security (RLS)
Все таблицы защищены RLS политиками:
```sql
-- Пример политики
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);
```

### Миграции
Миграции находятся в `supabase/migrations/` и применяются автоматически.

## Паттерны проектирования

### 1. Container/Presenter Pattern
```tsx
// Container (logic)
const CompanyMetricsContainer = () => {
  const { metrics, updateMetrics } = useProject();
  return <CompanyMetrics metrics={metrics} onUpdate={updateMetrics} />;
};

// Presenter (UI)
const CompanyMetrics = ({ metrics, onUpdate }) => {
  return <div>{/* UI only */}</div>;
};
```

### 2. Compound Components
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### 3. Render Props (в чартах)
```tsx
<Tooltip content={({ payload }) => <CustomTooltip data={payload} />} />
```

### 4. Higher-Order Components
```tsx
const AnimatedCard = ({ children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    {children}
  </motion.div>
);
```

## Потоки данных

### Создание проекта
```
User clicks "Create" 
  → useProject.createProject()
  → supabase.from('projects').insert()
  → Returns new project ID
  → Updates local state
  → Navigates to project
```

### Сохранение метрик
```
User edits metrics
  → Local state updates (controlled input)
  → User clicks "Save"
  → useProject.saveScenario()
  → Validates data
  → supabase.from('scenarios').upsert()
  → Shows toast notification
  → Refetches related data
```

### Real-time обновления
```
User A updates project
  → Supabase triggers change event
  → User B's subscription receives event
  → React Query invalidates cache
  → Component re-renders with new data
```

## Производительность

### 1. Code Splitting
```tsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

### 2. Memoization
```tsx
const expensiveCalculation = useMemo(
  () => calculateMetrics(data),
  [data]
);
```

### 3. Virtualization
Для больших списков используем виртуализацию:
```tsx
<ScrollArea className="h-[400px]">
  {/* Only visible items rendered */}
</ScrollArea>
```

### 4. Оптимизация изображений
- Lazy loading изображений
- Оптимизированные форматы (WebP)
- Responsive images

## Безопасность

### 1. Authentication
- JWT токены в httpOnly cookies
- Автоматическое обновление токенов
- Защита от CSRF

### 2. Authorization
- RLS политики на уровне БД
- Проверка прав доступа в компонентах
- Защищенные маршруты

### 3. Input Validation
```tsx
const schema = z.object({
  revenue: z.number().positive(),
  clients: z.number().int().positive(),
});
```

### 4. XSS Protection
- Sanitization пользовательского ввода
- Безопасный рендеринг HTML
- Content Security Policy

## Масштабирование

### Горизонтальное
- Stateless компоненты
- CDN для статических ресурсов
- Load balancing

### Вертикальное
- Оптимизация запросов к БД
- Индексы на часто используемых полях
- Connection pooling

### Кеширование
- Browser cache (Service Worker)
- React Query cache
- Supabase cache

## Мониторинг и логирование

### Error Boundaries
```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

### Логирование
- Console.log в dev режиме
- Structured logging в production
- Error tracking (например, Sentry)

### Метрики
- Web Vitals (LCP, FID, CLS)
- Custom metrics
- User behavior analytics

## Тестирование

### Unit Tests
```tsx
describe('calculateCAC', () => {
  it('should calculate CAC correctly', () => {
    const result = calculateCAC(metrics);
    expect(result).toBe(1000);
  });
});
```

### Integration Tests
```tsx
test('saves scenario to database', async () => {
  const { saveScenario } = renderHook(() => useProject());
  await saveScenario(data);
  expect(mockSupabase.insert).toHaveBeenCalled();
});
```

### E2E Tests
```tsx
test('user can create and save project', async () => {
  await page.goto('/');
  await page.click('[data-testid="create-project"]');
  await page.fill('[name="name"]', 'Test Project');
  await page.click('[type="submit"]');
  expect(await page.textContent('h1')).toBe('Test Project');
});
```

## Deployment

### CI/CD Pipeline
```yaml
1. Code push to GitHub
2. Run linter (ESLint)
3. Run type check (TypeScript)
4. Run tests
5. Build production bundle
6. Deploy to Lovable/Vercel/Netlify
7. Run smoke tests
```

### Environment Variables
- Development: `.env.local`
- Staging: `.env.staging`
- Production: `.env.production`

## Будущие улучшения

1. **Offline-first архитектура**
   - Service Workers
   - IndexedDB для локального хранения
   - Sync при появлении сети

2. **Микрофронтенды**
   - Разделение на независимые модули
   - Module Federation

3. **GraphQL**
   - Переход с REST на GraphQL
   - Более гибкие запросы

4. **Real-time коллаборация**
   - Одновременная работа нескольких пользователей
   - Operational Transformation

5. **AI/ML интеграция**
   - Умные рекомендации
   - Автоматическое заполнение данных
   - Прогнозирование на основе ML моделей
