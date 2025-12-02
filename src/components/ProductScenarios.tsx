import { useMemo, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Package, TrendingUp } from "lucide-react";
import { Product } from "./ProductsManagement";

interface ProductScenarioDelta {
  quantityDelta: number; // %
  costDelta: number; // %
  priceDelta: number; // %
}

interface ProductScenarioState {
  scenarioA: Record<string, ProductScenarioDelta>;
  scenarioB: Record<string, ProductScenarioDelta>;
}

interface ProductScenariosProps {
  products: Product[];
  currency: string;
}

const createInitialState = (products: Product[]): ProductScenarioState => {
  const base: Record<string, ProductScenarioDelta> = {};
  products.forEach((p) => {
    base[p.id] = { quantityDelta: 0, costDelta: 0, priceDelta: 0 };
  });
  return { scenarioA: { ...base }, scenarioB: { ...base } };
};

export const ProductScenarios = ({ products, currency }: ProductScenariosProps) => {
  const [state, setState] = useState<ProductScenarioState>(() => createInitialState(products));

  // Сбрасываем сценарные корректировки при изменении списка продуктов,
  // чтобы избежать рассинхронизации
  useEffect(() => {
    setState(createInitialState(products));
  }, [products]);

  const handleDeltaChange = (
    scenario: "scenarioA" | "scenarioB",
    productId: string,
    field: keyof ProductScenarioDelta,
    value: number
  ) => {
    setState((prev) => ({
      ...prev,
      [scenario]: {
        ...prev[scenario],
        [productId]: {
          ...(prev[scenario][productId] || { quantityDelta: 0, costDelta: 0, priceDelta: 0 }),
          [field]: value,
        },
      },
    }));
  };

  const calculateScenarioTotals = (scenario: "scenarioA" | "scenarioB") => {
    let revenue = 0;
    let cost = 0;

    products.forEach((p) => {
      const deltas = state[scenario][p.id] || { quantityDelta: 0, costDelta: 0, priceDelta: 0 };

      const quantity = p.quantity * (1 + deltas.quantityDelta / 100);
      const price = p.price * (1 + deltas.priceDelta / 100);
      const unitCost = p.cost * (1 + deltas.costDelta / 100);

      revenue += price * quantity;
      cost += unitCost * quantity;
    });

    return { revenue, cost, profit: revenue - cost };
  };

  const baseTotals = useMemo(() => {
    const revenue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const cost = products.reduce((sum, p) => sum + p.cost * p.quantity, 0);
    return { revenue, cost, profit: revenue - cost };
  }, [products]);

  const scenarioATotals = useMemo(
    () => calculateScenarioTotals("scenarioA"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, products]
  );
  const scenarioBTotals = useMemo(
    () => calculateScenarioTotals("scenarioB"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, products]
  );

  if (products.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          Сценарии A и B для продуктового портфеля
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Смоделируйте, как изменение объёма продаж, себестоимости или цены по каждому продукту
          повлияет на выручку и прибыль в сценариях A и B.
        </p>

        <div className="space-y-4">
          {products.map((product) => {
            const a = state.scenarioA[product.id] || { quantityDelta: 0, costDelta: 0, priceDelta: 0 };
            const b = state.scenarioB[product.id] || { quantityDelta: 0, costDelta: 0, priceDelta: 0 };

            const baseRevenue = product.price * product.quantity;
            const baseCost = product.cost * product.quantity;
            const baseProfit = baseRevenue - baseCost;

            const quantityA = product.quantity * (1 + a.quantityDelta / 100);
            const priceA = product.price * (1 + a.priceDelta / 100);
            const costA = product.cost * (1 + a.costDelta / 100);
            const revenueA = priceA * quantityA;
            const totalCostA = costA * quantityA;
            const profitA = revenueA - totalCostA;

            const quantityB = product.quantity * (1 + b.quantityDelta / 100);
            const priceB = product.price * (1 + b.priceDelta / 100);
            const costB = product.cost * (1 + b.costDelta / 100);
            const revenueB = priceB * quantityB;
            const totalCostB = costB * quantityB;
            const profitB = revenueB - totalCostB;

            return (
              <div
                key={product.id}
                className="border rounded-lg p-4 space-y-3 bg-muted/30"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <p className="font-medium">{product.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    База: {baseRevenue.toLocaleString("ru-RU")} {currency} выручки,
                    прибыль {baseProfit.toLocaleString("ru-RU")} {currency}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Сценарий A</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <Label className="text-xs">Объём, %</Label>
                        <Input
                          type="number"
                          value={a.quantityDelta}
                          onChange={(e) =>
                            handleDeltaChange(
                              "scenarioA",
                              product.id,
                              "quantityDelta",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Себест., %</Label>
                        <Input
                          type="number"
                          value={a.costDelta}
                          onChange={(e) =>
                            handleDeltaChange(
                              "scenarioA",
                              product.id,
                              "costDelta",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Цена, %</Label>
                        <Input
                          type="number"
                          value={a.priceDelta}
                          onChange={(e) =>
                            handleDeltaChange(
                              "scenarioA",
                              product.id,
                              "priceDelta",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Выручка: {revenueA.toLocaleString("ru-RU")} {currency}, прибыль {" "}
                      <span className={profitA >= 0 ? "text-success" : "text-destructive"}>
                        {profitA.toLocaleString("ru-RU")} {currency}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Сценарий B</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <Label className="text-xs">Объём, %</Label>
                        <Input
                          type="number"
                          value={b.quantityDelta}
                          onChange={(e) =>
                            handleDeltaChange(
                              "scenarioB",
                              product.id,
                              "quantityDelta",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Себест., %</Label>
                        <Input
                          type="number"
                          value={b.costDelta}
                          onChange={(e) =>
                            handleDeltaChange(
                              "scenarioB",
                              product.id,
                              "costDelta",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Цена, %</Label>
                        <Input
                          type="number"
                          value={b.priceDelta}
                          onChange={(e) =>
                            handleDeltaChange(
                              "scenarioB",
                              product.id,
                              "priceDelta",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Выручка: {revenueB.toLocaleString("ru-RU")} {currency}, прибыль {" "}
                      <span className={profitB >= 0 ? "text-success" : "text-destructive"}>
                        {profitB.toLocaleString("ru-RU")} {currency}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-muted-foreground">Сравнение</p>
                    <p>
                      A vs база: {((revenueA / (baseRevenue || 1) - 1) * 100).toFixed(1)}% выручки,
                      {" "}
                      {((profitA / (baseProfit || 1) - 1) * 100).toFixed(1)}% прибыли
                    </p>
                    <p>
                      B vs база: {((revenueB / (baseRevenue || 1) - 1) * 100).toFixed(1)}% выручки,
                      {" "}
                      {((profitB / (baseProfit || 1) - 1) * 100).toFixed(1)}% прибыли
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Итоги по портфелю
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">База</p>
              <p>Выручка: {baseTotals.revenue.toLocaleString("ru-RU")} {currency}</p>
              <p>
                Прибыль:{" "}
                <span className={baseTotals.profit >= 0 ? "text-success" : "text-destructive"}>
                  {baseTotals.profit.toLocaleString("ru-RU")} {currency}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Сценарий A</p>
              <p>Выручка: {scenarioATotals.revenue.toLocaleString("ru-RU")} {currency}</p>
              <p>
                Прибыль:{" "}
                <span className={scenarioATotals.profit >= 0 ? "text-success" : "text-destructive"}>
                  {scenarioATotals.profit.toLocaleString("ru-RU")} {currency}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Сценарий B</p>
              <p>Выручка: {scenarioBTotals.revenue.toLocaleString("ru-RU")} {currency}</p>
              <p>
                Прибыль:{" "}
                <span className={scenarioBTotals.profit >= 0 ? "text-success" : "text-destructive"}>
                  {scenarioBTotals.profit.toLocaleString("ru-RU")} {currency}
                </span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
