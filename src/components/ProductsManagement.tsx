import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
}

interface ProductsManagementProps {
  products: Product[];
  saveProduct: (product: Omit<Product, "id">) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  isAuthenticated: boolean;
  currency: string;
}

export const ProductsManagement = ({
  products,
  saveProduct,
  deleteProduct,
  isAuthenticated,
  currency,
}: ProductsManagementProps) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    cost: 0,
    quantity: 0,
  });

  const handleAddProduct = async () => {
    if (!isAuthenticated) {
      toast.error("Войдите для добавления продуктов");
      return;
    }

    if (!newProduct.name.trim()) {
      toast.error("Введите название продукта");
      return;
    }

    await saveProduct(newProduct);
    setNewProduct({ name: "", price: 0, cost: 0, quantity: 0 });
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
            <Button
              onClick={handleAddProduct}
              disabled={!isAuthenticated}
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
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <p className="font-medium">{product.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Цена</p>
                      <p className="font-mono">
                        {product.price.toLocaleString("ru-RU")} {currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Себестоимость</p>
                      <p className="font-mono">
                        {product.cost.toLocaleString("ru-RU")} {currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Количество</p>
                      <p className="font-mono">{product.quantity}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProduct(product.id)}
                    disabled={!isAuthenticated}
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
