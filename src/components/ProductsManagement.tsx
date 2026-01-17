import { useState, useMemo } from "react";
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
import { Plus, Trash2, Package, Star } from "lucide-react";
import { toast } from "sonner";
import { LogisticsTariffsData } from "@/hooks/useProject";
import { 
  BusinessType, 
  getBusinessTypeConfig, 
  getProductLabel,
  ProductField 
} from "@/config/businessTypeMetrics";

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  // E-commerce / Production specific
  quality?: number;
  logisticsToClientPerUnit?: number;
  weightPerUnit?: number;
  volumePerUnit?: number;
  deliveryType?: 'courier' | 'pickup' | 'transport_company' | 'own_delivery';
  defectRate?: number;
  // SaaS / Freemium specific
  churnRate?: number;
  freeToPayConversion?: number;
  // Services specific
  hourlyRate?: number;
  utilization?: number;
  // Sharing Economy specific
  utilizationRate?: number;
  takeRate?: number;
  // Marketplace specific
  gmv?: number;
  avgOrderValue?: number;
  // Generic
  [key: string]: any;
}

interface ProductsManagementProps {
  products: Product[];
  saveProduct: (product: Omit<Product, "id">) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  isAuthenticated: boolean;
  currency: string;
  tariffs?: LogisticsTariffsData;
  businessType: BusinessType;
}

const getDefaultProductValues = (businessType: BusinessType): Omit<Product, 'id'> => {
  const base = {
    name: "",
    price: 0,
    cost: 0,
    quantity: 0,
  };

  switch (businessType) {
    case 'saas':
    case 'freemium':
      return { ...base, churnRate: 5, freeToPayConversion: 3 };
    case 'ecommerce':
    case 'production':
      return { ...base, quality: 10, weightPerUnit: 0, volumePerUnit: 0, deliveryType: 'courier' as const, logisticsToClientPerUnit: 0, defectRate: 0 };
    case 'services':
      return { ...base, hourlyRate: 0, utilization: 80 };
    case 'sharing':
      return { ...base, utilizationRate: 60, takeRate: 15 };
    case 'marketplace':
      return { ...base, gmv: 0, takeRate: 10, avgOrderValue: 0 };
    default:
      return base;
  }
};

export const ProductsManagement = ({
  products,
  saveProduct,
  deleteProduct,
  updateProduct,
  isAuthenticated,
  currency,
  tariffs,
  businessType,
}: ProductsManagementProps) => {
  const config = useMemo(() => getBusinessTypeConfig(businessType), [businessType]);
  const fields = config.productFields;
  const productLabel = getProductLabel(businessType);
  const productLabelPlural = getProductLabel(businessType, true);

  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>(() => 
    getDefaultProductValues(businessType)
  );

  // Reset form when business type changes
  useMemo(() => {
    setNewProduct(getDefaultProductValues(businessType));
  }, [businessType]);

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      toast.error(`Введите название ${productLabel.toLowerCase()}а`);
      return;
    }

    await saveProduct(newProduct);
    setNewProduct(getDefaultProductValues(businessType));
  };

  const handleFieldChange = (key: string, value: any) => {
    setNewProduct(prev => ({ ...prev, [key]: value }));
  };

  const handleProductFieldChange = (productId: string, key: string, value: any) => {
    updateProduct(productId, { [key]: value });
  };

  const renderField = (
    field: ProductField, 
    value: any, 
    onChange: (key: string, value: any) => void,
    idPrefix: string
  ) => {
    const fieldId = `${idPrefix}-${field.key}`;
    
    switch (field.type) {
      case 'text':
        return (
          <div key={field.key}>
            <Label htmlFor={fieldId}>{field.label}</Label>
            <Input
              id={fieldId}
              value={value ?? ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.label}
            />
          </div>
        );
      
      case 'number':
        return (
          <div key={field.key}>
            <Label htmlFor={fieldId} className="flex items-center gap-1">
              {field.key === 'quality' && <Star className="w-3 h-3 text-yellow-500" />}
              {field.label}
              {field.suffix && ` (${field.suffix})`}
              {!field.suffix && field.key !== 'name' && field.key !== 'quantity' && 
               !field.key.includes('Rate') && !field.key.includes('utilization') && 
               !field.key.includes('conversion') && ` (${currency})`}
            </Label>
            <NumericInput
              id={fieldId}
              value={value ?? 0}
              onChange={(v) => {
                let newValue = v;
                if (field.min !== undefined) newValue = Math.max(field.min, newValue);
                if (field.max !== undefined) newValue = Math.min(field.max, newValue);
                onChange(field.key, newValue);
              }}
              placeholder="0"
            />
          </div>
        );
      
      case 'select':
        return (
          <div key={field.key}>
            <Label htmlFor={fieldId}>{field.label}</Label>
            <Select
              value={value ?? field.options?.[0]?.value ?? ''}
              onValueChange={(v) => onChange(field.key, v)}
            >
              <SelectTrigger id={fieldId}>
                <SelectValue placeholder={`Выберите ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Calculate totals based on business type
  const { totalRevenue, totalCost, totalProfit, additionalMetrics } = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    const metrics: { label: string; value: string; color?: string }[] = [];

    switch (businessType) {
      case 'saas':
      case 'freemium':
        revenue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        cost = products.reduce((sum, p) => sum + p.cost * p.quantity, 0);
        metrics.push(
          { label: 'MRR', value: `${revenue.toLocaleString("ru-RU")} ${currency}` },
          { label: 'ARR', value: `${(revenue * 12).toLocaleString("ru-RU")} ${currency}` },
        );
        if (products.length > 0) {
          const avgChurn = products.reduce((sum, p) => sum + (p.churnRate ?? 0), 0) / products.length;
          metrics.push({ label: 'Avg Churn', value: `${avgChurn.toFixed(1)}%` });
        }
        break;

      case 'services':
        revenue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        cost = products.reduce((sum, p) => sum + p.cost * p.quantity, 0);
        if (products.length > 0) {
          const avgUtil = products.reduce((sum, p) => sum + (p.utilization ?? 0), 0) / products.length;
          metrics.push({ label: 'Средняя загрузка', value: `${avgUtil.toFixed(0)}%` });
        }
        break;

      case 'marketplace':
        const totalGMV = products.reduce((sum, p) => sum + (p.gmv ?? 0), 0);
        const avgTakeRate = products.length > 0 
          ? products.reduce((sum, p) => sum + (p.takeRate ?? 0), 0) / products.length 
          : 0;
        revenue = totalGMV * (avgTakeRate / 100);
        cost = products.reduce((sum, p) => sum + p.cost * p.quantity, 0);
        metrics.push(
          { label: 'GMV', value: `${totalGMV.toLocaleString("ru-RU")} ${currency}` },
          { label: 'Avg Take Rate', value: `${avgTakeRate.toFixed(1)}%` },
        );
        break;

      case 'sharing':
        revenue = products.reduce((sum, p) => {
          const hourlyRevenue = p.price * (p.utilizationRate ?? 0) / 100 * 720; // ~hours/month
          return sum + hourlyRevenue * p.quantity;
        }, 0);
        cost = products.reduce((sum, p) => sum + p.cost * p.quantity, 0);
        if (products.length > 0) {
          const avgUtil = products.reduce((sum, p) => sum + (p.utilizationRate ?? 0), 0) / products.length;
          metrics.push({ label: 'Средняя загрузка', value: `${avgUtil.toFixed(0)}%` });
        }
        break;

      default: // ecommerce, production
        revenue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        cost = products.reduce((sum, p) => sum + p.cost * p.quantity, 0);
        break;
    }

    return {
      totalRevenue: revenue,
      totalCost: cost,
      totalProfit: revenue - cost,
      additionalMetrics: metrics,
    };
  }, [products, businessType, currency]);

  // Group fields into rows for better layout
  const fieldRows = useMemo(() => {
    const rows: ProductField[][] = [];
    const fieldsPerRow = 6;
    
    for (let i = 0; i < fields.length; i += fieldsPerRow) {
      rows.push(fields.slice(i, i + fieldsPerRow));
    }
    
    return rows;
  }, [fields]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {productLabelPlural}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fieldRows.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {row.map((field) => {
                  // First field (name) gets 2 columns
                  const isNameField = field.key === 'name';
                  return (
                    <div key={field.key} className={isNameField ? 'md:col-span-2' : ''}>
                      {renderField(field, newProduct[field.key], handleFieldChange, 'new')}
                    </div>
                  );
                })}
              </div>
            ))}
            
            <Button onClick={handleAddProduct} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Добавить {productLabel.toLowerCase()}
            </Button>
          </div>
        </CardContent>
      </Card>

      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Список {productLabelPlural.toLowerCase()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-3">
                    {fieldRows.map((row, rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        {row.map((field) => {
                          const isNameField = field.key === 'name';
                          return (
                            <div key={field.key} className={isNameField ? 'md:col-span-2' : ''}>
                              {renderField(
                                field, 
                                product[field.key], 
                                (key, value) => handleProductFieldChange(product.id, key, value),
                                product.id
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
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
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Additional metrics specific to business type */}
                {additionalMetrics.map((metric, idx) => (
                  <div key={idx}>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className={`text-xl font-bold font-mono ${metric.color || 'text-primary'}`}>
                      {metric.value}
                    </p>
                  </div>
                ))}
                
                {/* Standard revenue/cost/profit for all types */}
                <div>
                  <p className="text-sm text-muted-foreground">
                    {businessType === 'saas' || businessType === 'freemium' ? 'Выручка (MRR)' : 'Выручка'}
                  </p>
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
