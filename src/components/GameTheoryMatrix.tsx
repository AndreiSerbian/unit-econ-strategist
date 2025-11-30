import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, TrendingDown } from "lucide-react";

export const GameTheoryMatrix = () => {
  // Пример матрицы теории игр (Дилемма заключенного применительно к бизнесу)
  const strategies = {
    ours: ["Снизить цену", "Сохранить цену", "Повысить качество"],
    competitors: ["Снизить цену", "Сохранить цену", "Повысить качество"],
  };

  // Примерные выплаты (прибыль) для каждой комбинации стратегий
  const payoffMatrix = [
    [
      { us: 3, them: 3 }, // Оба снижают цену
      { us: 7, them: 1 }, // Мы снижаем, они сохраняют
      { us: 5, them: 4 }, // Мы снижаем, они повышают качество
    ],
    [
      { us: 1, them: 7 }, // Мы сохраняем, они снижают
      { us: 5, them: 5 }, // Оба сохраняют (равновесие Нэша)
      { us: 4, them: 6 }, // Мы сохраняем, они повышают качество
    ],
    [
      { us: 4, them: 5 }, // Мы повышаем качество, они снижают цену
      { us: 6, them: 4 }, // Мы повышаем качество, они сохраняют
      { us: 8, them: 8 }, // Оба повышают качество (оптимум Парето)
    ],
  ];

  const findNashEquilibrium = () => {
    // Упрощенная логика поиска равновесия Нэша
    return { row: 1, col: 1 }; // В данном примере - "Оба сохраняют цену"
  };

  const nashEq = findNashEquilibrium();

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-info/5 to-primary/5">
        <CardHeader>
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-info mt-1" />
            <div>
              <CardTitle>Матрица выплат</CardTitle>
              <CardDescription className="mt-2">
                Анализ стратегических взаимодействий. Первое число - ваша прибыль, второе - прибыль конкурента.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-border p-4 bg-muted/50"></th>
                  {strategies.competitors.map((strategy, idx) => (
                    <th key={idx} className="border border-border p-4 bg-secondary/10 font-semibold text-sm">
                      Конкурент: {strategy}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {strategies.ours.map((ourStrategy, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="border border-border p-4 bg-primary/10 font-semibold text-sm">
                      Вы: {ourStrategy}
                    </td>
                    {strategies.competitors.map((_, colIdx) => {
                      const payoff = payoffMatrix[rowIdx][colIdx];
                      const isNash = rowIdx === nashEq.row && colIdx === nashEq.col;
                      const isOptimal = payoff.us >= 7 && payoff.them >= 7;
                      
                      return (
                        <td
                          key={colIdx}
                          className={`border border-border p-4 text-center relative ${
                            isNash ? "bg-info/10" : isOptimal ? "bg-success/10" : ""
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="text-lg font-bold font-mono">
                              <span className="text-primary">{payoff.us}</span>
                              {" / "}
                              <span className="text-secondary">{payoff.them}</span>
                            </div>
                            {isNash && (
                              <Badge variant="outline" className="text-xs bg-info/20 border-info">
                                Равновесие Нэша
                              </Badge>
                            )}
                            {isOptimal && (
                              <Badge variant="outline" className="text-xs bg-success/20 border-success">
                                Оптимум Парето
                              </Badge>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Доминирующая стратегия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Анализ показывает оптимальный выбор:
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-success/10 rounded-lg">
                <p className="font-semibold text-success">Повышение качества</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Наилучший долгосрочный результат при взаимодействии с конкурентами
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-destructive" />
              Риски
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Потенциальные угрозы:
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <p className="font-semibold text-destructive">Ценовая война</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Взаимное снижение цен приводит к минимальной прибыли для обеих сторон
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ключевые концепции</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Badge variant="outline" className="bg-info/20 border-info">Равновесие Нэша</Badge>
            </h4>
            <p className="text-sm text-muted-foreground">
              Ситуация, в которой ни один игрок не может улучшить свой результат, изменив только свою стратегию.
              В данном случае - обе стороны сохраняют цены.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Badge variant="outline" className="bg-success/20 border-success">Оптимум Парето</Badge>
            </h4>
            <p className="text-sm text-muted-foreground">
              Состояние, при котором невозможно улучшить положение одного игрока без ухудшения положения другого.
              Достигается при взаимном повышении качества.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
