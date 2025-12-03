import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  salesChannels: string[];
}

interface ProductsManagementProps {
  products: Product[];
  saveProduct: (product: Omit<Product, "id">) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  isAuthenticated: boolean;
  currency: string;
}

const SALES_CHANNELS = ["Онлайн", "Розница", "Дистрибьюторы", "B2B"];

export const ProductsManagement = ({
  products,
  saveProduct,
  deleteProduct,
  updateProduct,
  isAuthenticated,
  currency,
}: ProductsManagementProps) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    cost: 0,
    quantity: 0,
    salesChannels: [] as string[],
  });

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      toast.error("Введите название продукта");
      return;
    }

    await saveProduct(newProduct);
    setNewProduct({ name: "", price: 0, cost: 0, quantity: 0, salesChannels: [] });
  };

  const toggleChannel = (channel: string) => {
    setNewProduct((prev) => ({
      ...prev,
      salesChannels: prev.salesChannels.includes(channel)
        ? prev.salesChannels.filter((c) => c !== channel)
        : [...prev.salesChannels, channel],
    }));
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <Input
                  id="product-price"
                  type="number"
                  value={newProduct.price || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="product-cost">Себестоимость ({currency})</Label>
                <Input
                  id="product-cost"
                  type="number"
                  value={newProduct.cost || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      cost: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="product-quantity">Количество</Label>
                <Input
                  id="product-quantity"
                  type="number"
                  value={newProduct.quantity || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Каналы продаж</Label>
              <div className="flex flex-wrap gap-3">
                {SALES_CHANNELS.map((channel) => (
                  <div key={channel} className="flex items-center space-x-2">
                    <Checkbox
                      id={`new-product-${channel}`}
                      checked={newProduct.salesChannels.includes(channel)}
                      onCheckedChange={() => toggleChannel(channel)}
                    />
                    <label
                      htmlFor={`new-product-${channel}`}
                      className="text-sm cursor-pointer"
                    >
                      {channel}
                    </label>
                  </div>
                ))}
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
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                        <Input
                          type="number"
                          value={product.price || 0}
                          onChange={(e) =>
                            updateProduct(product.id, {
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Себестоимость ({currency})</Label>
                        <Input
                          type="number"
                          value={product.cost || 0}
                          onChange={(e) =>
                            updateProduct(product.id, {
                              cost: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Количество</Label>
                        <Input
                          type="number"
                          value={product.quantity || 0}
                          onChange={(e) =>
                            updateProduct(product.id, {
                              quantity: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Каналы продаж</Label>
                      <div className="flex flex-wrap gap-3">
                        {SALES_CHANNELS.map((channel) => {
                          const checked = product.salesChannels.includes(channel);
                          return (
                            <div
                              key={channel}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`${product.id}-${channel}`}
                                checked={checked}
                                onCheckedChange={() => {
                                  const nextChannels = checked
                                    ? product.salesChannels.filter((c) => c !== channel)
                                    : [...product.salesChannels, channel];
                                  updateProduct(product.id, {
                                    salesChannels: nextChannels,
                                  });
                                }}
                              />
                              <label
                                htmlFor={`${product.id}-${channel}`}
                                className="text-sm cursor-pointer"
                              >
                                {channel}
                              </label>
                            </div>
                          );
                        })}
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
