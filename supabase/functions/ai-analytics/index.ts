import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { metrics, competitors, products, analysisType } = await req.json();
    
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const systemPrompt = `Ты - эксперт по финансовому анализу и юнит-экономике. 
Анализируй данные на русском языке. Давай конкретные, практичные рекомендации.
Используй числа и проценты для обоснования выводов.
Формат ответа: структурированный текст с заголовками и пунктами.`;

    let userPrompt = '';
    
    switch (analysisType) {
      case 'strategic':
        userPrompt = `Проанализируй финансовые метрики компании и дай стратегические рекомендации:

Метрики компании:
- Выручка: ${metrics?.revenue || 0}
- Прибыль: ${metrics?.profit || 0}
- Маржа: ${metrics?.profitMargin || 0}%
- CAC: ${metrics?.cac || 0}
- LTV: ${metrics?.ltv || 0}
- LTV/CAC: ${metrics?.ltvCacRatio || 0}
- Точка безубыточности: ${metrics?.breakEvenPoint || 0}
- Конверсия: ${metrics?.conversionRate || 0}%

Дай 5-7 конкретных рекомендаций по улучшению показателей с приоритетами (высокий/средний/низкий).`;
        break;
        
      case 'competitor':
        userPrompt = `Проанализируй конкурентную среду:

Наша компания:
- Выручка: ${metrics?.revenue || 0}
- Маржа: ${metrics?.profitMargin || 0}%
- CAC: ${metrics?.cac || 0}
- LTV: ${metrics?.ltv || 0}

Конкуренты:
${competitors?.map((c: any, i: number) => `
${i + 1}. ${c.name}:
   - Выручка: ${c.revenue || 0}
   - Доля рынка: ${c.marketShare || 0}%
   - Качество: ${c.quality || 0}/10
`).join('') || 'Данные о конкурентах отсутствуют'}

Определи конкурентные преимущества и слабости. Предложи стратегию позиционирования.`;
        break;
        
      case 'forecast':
        userPrompt = `На основе текущих метрик спрогнозируй развитие бизнеса:

Текущие показатели:
- Выручка: ${metrics?.revenue || 0}
- Клиенты: ${metrics?.totalClients || 0}
- Средний чек: ${metrics?.avgCheck || 0}
- CAC: ${metrics?.cac || 0}
- Маржа: ${metrics?.profitMargin || 0}%
- Маркетинговые расходы: ${metrics?.marketingCosts || 0}

Спрогнозируй на 3, 6 и 12 месяцев:
1. Рост выручки при текущей динамике
2. Необходимый маркетинговый бюджет для роста на 50%
3. Риски и возможности
4. Ключевые метрики для мониторинга`;
        break;
        
      case 'products':
        userPrompt = `Проанализируй продуктовый портфель:

Продукты:
${products?.map((p: any, i: number) => `
${i + 1}. ${p.name}:
   - Цена: ${p.price || 0}
   - Себестоимость: ${p.cost || 0}
   - Количество: ${p.quantity || 0}
   - Маржа: ${p.price && p.cost ? Math.round((p.price - p.cost) / p.price * 100) : 0}%
`).join('') || 'Продукты не добавлены'}

Определи:
1. Самые прибыльные продукты
2. Продукты с низкой маржой (кандидаты на оптимизацию)
3. Рекомендации по ценообразованию
4. Предложения по расширению ассортимента`;
        break;
        
      default:
        userPrompt = `Проведи общий анализ бизнес-метрик: ${JSON.stringify(metrics)}`;
    }

    console.log('Calling Claude API with analysis type:', analysisType);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.content[0]?.text || 'Не удалось получить анализ';

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({ analysis: analysisText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-analytics function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
