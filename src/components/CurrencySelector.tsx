import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface CurrencySelectorProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
  isAuthenticated: boolean;
}

export const CurrencySelector = ({
  currency,
  onCurrencyChange,
  isAuthenticated,
}: CurrencySelectorProps) => {
  const currencies = [
    { value: "RUB", label: "₽ Российский рубль" },
    { value: "USD", label: "$ Доллар США" },
    { value: "EUR", label: "€ Евро" },
    { value: "MDL", label: "L Молдавский лей" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Валюта
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="currency">Выберите валюту</Label>
          <Select
            value={currency}
            onValueChange={onCurrencyChange}
            disabled={!isAuthenticated}
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder="Выберите валюту" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr.value} value={curr.value}>
                  {curr.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isAuthenticated && (
            <p className="text-xs text-muted-foreground">
              Войдите для изменения валюты
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
