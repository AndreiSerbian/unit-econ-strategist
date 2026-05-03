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
import { useTranslation } from "@/i18n/useTranslation";

interface CurrencySelectorProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
  isAuthenticated: boolean;
}

const CURRENCY_CODES = ["RUB", "USD", "EUR", "KZT", "BYN", "UAH", "MDL", "RON"] as const;

export const CurrencySelector = ({
  currency,
  onCurrencyChange,
}: CurrencySelectorProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          {t("projectSettings.currencyLabel")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="currency">{t("projectSettings.currencyLabel")}</Label>
          <Select value={currency} onValueChange={onCurrencyChange}>
            <SelectTrigger id="currency">
              {/* Show only the short ISO code on the trigger to avoid
                  visual duplication like "MDL  L Молдавский лей (MDL)". */}
              <SelectValue placeholder={t("projectSettings.currencyLabel")}>
                {currency}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_CODES.map((code) => (
                <SelectItem key={code} value={code}>
                  {t(`currencies.${code}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
