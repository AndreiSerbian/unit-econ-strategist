import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Package, Star, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LogisticsTariffsData } from "@/hooks/useProject";
import { 
  BusinessType, 
  getBusinessTypeConfig, 
  getProductLabel,
  ProductField 
} from "@/config/businessTypeMetrics";
import { ServicesProductCard, ServiceProduct } from "@/components/services";

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
  defectRate?: number | null;
  // SaaS / Freemium specific
  churnRate?: number | null;
  freeToPayConversion?: number | null;
  newSubscribers?: number | null;
  // Services specific (v1 legacy)
  hourlyRate?: number | null;
  utilization?: number | null;
  hoursPerWeek?: number | null;
  // Services v2 fields
  billingModel?: 'fixed_project' | 'hourly' | 'retainer';
  planningPeriod?: 'week' | 'month' | 'quarter' | 'year';
  estimatedHoursPerProject?: number | null;
  plannedBillableHoursPerPeriod?: number | null;
  billablePercent?: number | null;
  allocationPercent?: number | null;
  retainerFee?: number | null;
  clientsCount?: number | null;
  // Sharing Economy specific
  utilizationRate?: number | null;
  takeRate?: number | null;
  // Marketplace specific
  gmv?: number | null;
  avgOrderValue?: number | null;
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
      return { ...base, churnRate: 5, freeToPayConversion: 3, newSubscribers: null };
    case 'ecommerce':
    case 'production':
      return { ...base, quality: 10, weightPerUnit: 0, volumePerUnit: 0, deliveryType: 'courier' as const, logisticsToClientPerUnit: 0, defectRate: 0 };
    case 'services':
      return { 
        ...base, 
        hourlyRate: 0, 
        hoursPerWeek: 40,
        utilization: 100,
        // Services v2 defaults
        billingModel: 'fixed_project' as const,
        planningPeriod: 'month' as const,
        billablePercent: 100,
        allocationPercent: 100,
        estimatedHoursPerProject: null,
        plannedBillableHoursPerPeriod: null,
        retainerFee: null,
        clientsCount: 0,
      };
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

  // Helper для расчёта utilization для услуги (упрощённый вариант)
  const getServiceUtilizationInfo = (product: Product) => {
    const rate = product.utilization ?? 0;
    const hours = product.hoursPerWeek ?? 40;
    const billable = (hours * rate) / 100;
    
    let status = 'Низкая';
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'destructive';
    
    if (rate >= 85) {
      status = 'Отличная';
      variant = 'default';
    } else if (rate >= 70) {
      status = 'Хорошая';
      variant = 'default';
    } else if (rate >= 60) {
      status = 'Нормальная';
      variant = 'secondary';
    }
    
    return { billable, rate, status, variant, hours };
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
        // Fields that can be null (business-type specific)
        const nullableFields = [
          'hourlyRate', 'hoursPerWeek', 'utilization',
          'churnRate', 'freeToPayConversion',
          'utilizationRate', 'takeRate', 'gmv', 'avgOrderValue',
          'defectRate'
        ];
        const allowNull = nullableFields.includes(field.key);
        
        return (
          <div key={field.key}>
            <Label htmlFor={fieldId} className="flex items-center gap-1">
              {field.key === 'quality' && <Star className="w-3 h-3 text-warning" />}
              {field.label}
              {field.suffix && ` (${field.suffix})`}
              {!field.suffix && field.key !== 'name' && field.key !== 'quantity' && 
               !field.key.includes('Rate') && !field.key.includes('utilization') && 
               !field.key.includes('conversion') && ` (${currency})`}
            </Label>
            <NumericInput
              id={fieldId}
              value={value ?? (allowNull ? null : 0)}
              allowNull={allowNull}
              onChange={(v) => {
                let newValue = v;
                if (newValue !== null) {
                  if (field.min !== undefined) newValue = Math.max(field.min, newValue);
                  if (field.max !== undefined) newValue = Math.min(field.max, newValue);
                }
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
          let totalHours = 0;
          let totalBillable = 0;
          
          products.forEach(p => {
            const hours = p.hoursPerWeek ?? 40;
            const util = p.utilization ?? 0;
            totalHours += hours;
            totalBillable += (hours * util) / 100;
          });
          
          const avgUtil = totalHours > 0 ? (totalBillable / totalHours) * 100 : 0;
          
          // Цветовой индикатор
          let utilColor = 'text-destructive';
          let utilStatus = 'Низкая';
          if (avgUtil >= 85) {
            utilColor = 'text-success';
            utilStatus = 'Отличная';
          } else if (avgUtil >= 70) {
            utilColor = 'text-success';
            utilStatus = 'Хорошая';
          } else if (avgUtil >= 60) {
            utilColor = 'text-warning';
            utilStatus = 'Нормальная';
          }
          
          metrics.push(
            { label: 'Часов/нед', value: `${totalHours.toFixed(0)} ч` },
            { label: 'Billable', value: `${totalBillable.toFixed(0)} ч` },
            { label: 'Загрузка', value: `${avgUtil.toFixed(0)}% (${utilStatus})`, color: utilColor }
          );
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
              <div key={rowIndex} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                {row.map((field) => {
                  // First field (name) gets 2 columns on md+
                  const isNameField = field.key === 'name';
                  return (
                    <div key={field.key} className={isNameField ? 'col-span-2 md:col-span-2' : ''}>
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
              {products.map((product) => {
                // Use ServicesProductCard for services business type
                if (businessType === 'services') {
                  return (
                    <ServicesProductCard
                      key={product.id}
                      product={product as ServiceProduct}
                      onUpdate={(productId, updates) => updateProduct(productId, updates)}
                      onDelete={deleteProduct}
                      currency={currency}
                    />
                  );
                }
                
                // Default rendering for other business types
                const serviceUtil = null; // Services now uses dedicated component
                
                return (
                  <div
                    key={product.id}
                    className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h4 className="font-medium text-sm sm:text-base truncate">{product.name || 'Без названия'}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProduct(product.id)}
                        className="shrink-0 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {fieldRows.map((row, rowIndex) => (
                        <div key={rowIndex} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                          {row.map((field) => {
                            const isNameField = field.key === 'name';
                            return (
                              <div key={field.key} className={isNameField ? 'col-span-2 md:col-span-2' : ''}>
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
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-3 sm:p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg">
              <h3 className="font-semibold mb-3 text-sm sm:text-base">Итоговые показатели</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Additional metrics specific to business type */}
                {additionalMetrics.map((metric, idx) => (
                  <div key={idx}>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{metric.label}</p>
                    <p className={`text-base sm:text-xl font-bold font-mono ${metric.color || 'text-primary'}`}>
                      {metric.value}
                    </p>
                  </div>
                ))}
                
                {/* Standard revenue/cost/profit for all types */}
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {businessType === 'saas' || businessType === 'freemium' ? 'Выручка (MRR)' : 'Выручка'}
                  </p>
                  <p className="text-base sm:text-xl font-bold text-primary font-mono">
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
