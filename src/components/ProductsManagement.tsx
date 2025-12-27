import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Package, Calculator, Star } from "lucide-react";
import { toast } from "sonner";
import { LogisticsTariffsData } from "@/hooks/useProject";
import { calculateProductLogisticsCost } from "./LogisticsTariffs";

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  quality?: number;
  logisticsToClientPerUnit?: number;
  weightPerUnit?: number;
  volumePerUnit?: number;
  deliveryType?: 'courier' | 'pickup' | 'transport_company' | 'own_delivery';
}

const DELIVERY_TYPE_OPTIONS = [
  { value: "courier", label: "Курьер" },
  { value: "pickup", label: "Самовывоз" },
  { value: "transport_company", label: "Транспортная компания" },
  { value: "own_delivery", label: "Своя доставка" },
];

interface ProductsManagementProps {
  products: Product[];
  saveProduct: (product: Omit<Product, "id">) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  isAuthenticated: boolean;
  currency: string;
  tariffs?: LogisticsTariffsData;
}



export const ProductsManagement = ({
  products,
  saveProduct,
  deleteProduct,
  updateProduct,
  isAuthenticated,
  currency,
  tariffs,
}: ProductsManagementProps) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    cost: 0,
    quantity: 0,
    quality: 10,
    logisticsToClientPerUnit: 0,
    weightPerUnit: 0,
    volumePerUnit: 0,
    deliveryType: "courier" as Product["deliveryType"],
  });

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      toast.error("Введите название продукта");
      return;
    }

    await saveProduct(newProduct);
    setNewProduct({ name: "", price: 0, cost: 0, quantity: 0, quality: 10, logisticsToClientPerUnit: 0, weightPerUnit: 0, volumePerUnit: 0, deliveryType: "courier" });
  };


  const totalRevenue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const totalCost = products.reduce((sum, p) => sum + p.cost * p.quantity, 0);
  const totalProfit = totalRevenue - totalCost;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Продукты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="product-name">Название</Label>
                <Input
                  id="product-name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="Название продукта"
                />
              </div>
              <div>
                <Label htmlFor="product-price">Цена ({currency})</Label>
                <NumericInput
                  id="product-price"
                  value={newProduct.price}
                  onChange={(value) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      price: value,
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="product-cost">Себестоимость ({currency})</Label>
                <NumericInput
                  id="product-cost"
                  value={newProduct.cost}
                  onChange={(value) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      cost: value,
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="product-quantity">Количество</Label>
                <NumericInput
                  id="product-quantity"
                  value={newProduct.quantity}
                  onChange={(value) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      quantity: Math.max(0, Math.round(value)),
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="product-quality" className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  Качество (1-20)
                </Label>
                <NumericInput
                  id="product-quality"
                  value={newProduct.quality}
                  onChange={(value) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      quality: Math.min(20, Math.max(1, Math.round(value))),
                    }))
                  }
                  placeholder="10"
                />
              </div>
            </div>

            {/* Row 2: Logistics fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="product-logistics">Логистика до клиента ({currency})</Label>
                <NumericInput
                  id="product-logistics"
                  value={newProduct.logisticsToClientPerUnit}
                  onChange={(value) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      logisticsToClientPerUnit: value,
                    }))
                  }
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground mt-1">за 1 шт.</p>
              </div>
              <div>
                <Label htmlFor="product-weight">Вес (кг)</Label>
                <NumericInput
                  id="product-weight"
                  value={newProduct.weightPerUnit}
                  onChange={(value) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      weightPerUnit: value,
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="product-volume">Объём (м³)</Label>
                <NumericInput
                  id="product-volume"
                  value={newProduct.volumePerUnit}
                  onChange={(value) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      volumePerUnit: value,
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="product-delivery">Тип доставки</Label>
                <Select
                  value={newProduct.deliveryType}
                  onValueChange={(v) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      deliveryType: v as Product["deliveryType"],
                    }))
                  }
                >
                  <SelectTrigger id="product-delivery">
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button
              onClick={handleAddProduct}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить продукт
            </Button>
          </div>
        </CardContent>
      </Card>

      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Список продуктов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <Label>Название</Label>
                        <Input
                          value={product.name}
                          onChange={(e) =>
                            updateProduct(product.id, { name: e.target.value })
                          }
                          placeholder="Название продукта"
                        />
                      </div>
                      <div>
                        <Label>Цена ({currency})</Label>
                        <NumericInput
                          value={product.price ?? 0}
                          onChange={(value) =>
                            updateProduct(product.id, {
                              price: value,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Себестоимость ({currency})</Label>
                        <NumericInput
                          value={product.cost ?? 0}
                          onChange={(value) =>
                            updateProduct(product.id, {
                              cost: value,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Количество</Label>
                        <NumericInput
                          value={product.quantity ?? 0}
                          onChange={(value) =>
                            updateProduct(product.id, {
                              quantity: Math.max(0, Math.round(value)),
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          Качество
                        </Label>
                        <NumericInput
                          value={product.quality ?? 10}
                          onChange={(value) =>
                            updateProduct(product.id, {
                              quality: Math.min(20, Math.max(1, Math.round(value))),
                            })
                          }
                          placeholder="10"
                        />
                      </div>
                    </div>

                    {/* Row 2: Logistics fields */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Логистика ({currency})</Label>
                        <NumericInput
                          value={product.logisticsToClientPerUnit ?? 0}
                          onChange={(value) =>
                            updateProduct(product.id, {
                              logisticsToClientPerUnit: value,
                            })
                          }
                          placeholder="0"
                        />
                        <p className="text-xs text-muted-foreground">за 1 шт.</p>
                      </div>
                      <div>
                        <Label>Вес (кг)</Label>
                        <NumericInput
                          value={product.weightPerUnit ?? 0}
                          onChange={(value) =>
                            updateProduct(product.id, {
                              weightPerUnit: value,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Объём (м³)</Label>
                        <NumericInput
                          value={product.volumePerUnit ?? 0}
                          onChange={(value) =>
                            updateProduct(product.id, {
                              volumePerUnit: value,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Тип доставки</Label>
                        <Select
                          value={product.deliveryType || "courier"}
                          onValueChange={(v) =>
                            updateProduct(product.id, {
                              deliveryType: v as Product["deliveryType"],
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DELIVERY_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProduct(product.id)}
                    className="ml-4"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg">
              <h3 className="font-semibold mb-3">Итоговые показатели</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Выручка от продуктов</p>
                  <p className="text-xl font-bold text-primary font-mono">
                    {totalRevenue.toLocaleString("ru-RU")} {currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Себестоимость</p>
                  <p className="text-xl font-bold text-destructive font-mono">
                    {totalCost.toLocaleString("ru-RU")} {currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Прибыль</p>
                  <p
                    className={`text-xl font-bold font-mono ${
                      totalProfit >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {totalProfit.toLocaleString("ru-RU")} {currency}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
