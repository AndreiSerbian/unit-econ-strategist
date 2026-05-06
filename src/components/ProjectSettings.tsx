import { useState } from "react";
import { Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { businessTypes, type BusinessType, getBusinessTypeConfig } from "@/config/businessTypeMetrics";
import { useTranslation } from "@/i18n/useTranslation";
import { toast } from "sonner";

interface ProjectSettingsProps {
  currentBusinessType: BusinessType;
  onBusinessTypeChange: (type: BusinessType) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

const CURRENCY_CODES = ["RUB", "USD", "EUR", "KZT", "BYN", "UAH", "MDL", "RON"] as const;

export const ProjectSettings = ({
  currentBusinessType,
  onBusinessTypeChange,
  currency,
  onCurrencyChange,
}: ProjectSettingsProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<BusinessType>(currentBusinessType);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<string>(currency);

  const currentConfig = getBusinessTypeConfig(currentBusinessType);
  const newConfig = getBusinessTypeConfig(selectedType);

  const handleTypeSelect = (type: BusinessType) => {
    setSelectedType(type);
  };

  const handleCurrencySelect = (next: string) => {
    setPendingCurrency(next);
  };

  const handleSave = () => {
    const currencyChanged = pendingCurrency !== currency;
    const typeChanged = selectedType !== currentBusinessType;

    if (currencyChanged) {
      onCurrencyChange(pendingCurrency);
      // toast emitted by useProject.updateCurrency
    }

    if (typeChanged) {
      setShowWarning(true);
      return;
    }

    if (currencyChanged || !typeChanged) {
      setIsOpen(false);
    }
  };

  const handleConfirmChange = () => {
    onBusinessTypeChange(selectedType);
    // toast emitted by useProject.updateBusinessType
    setShowWarning(false);
    setIsOpen(false);
  };

  const handleCancelChange = () => {
    setShowWarning(false);
    setSelectedType(currentBusinessType);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setSelectedType(currentBusinessType);
      setPendingCurrency(currency);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" title={t("projectSettings.tooltip")}>
            <Settings className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("projectSettings.title")}</DialogTitle>
            <DialogDescription>
              {t("projectSettings.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Business Type Selection */}
            <div className="space-y-3">
              <Label>{t("projectSettings.businessTypeLabel")}</Label>
              <Select value={selectedType} onValueChange={(v) => handleTypeSelect(v as BusinessType)}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span>{newConfig.icon}</span>
                      <span>{t(`businessModels.${selectedType}`)}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <div>
                          <div className="font-medium">{t(`businessModels.${type.id}`)}</div>
                          <div className="text-xs text-muted-foreground">
                            {t(`businessModelsDescription.${type.id}`)}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedType !== currentBusinessType && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-600 dark:text-amber-400">
                      {t("projectSettings.warningTitle")}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      {t("projectSettings.warningBody")}
                    </p>
                  </div>
                </div>
              )}

              {/* Current metrics preview */}
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">
                  {t("projectSettings.keyMetricsForLabel", {
                    type: t(`businessModels.${selectedType}`),
                  })}
                </p>
                <div className="flex flex-wrap gap-1">
                  {newConfig.primaryMetrics.map((metric) => {
                    const key = `keyIndicators.${metric}`;
                    const translated = t(key);
                    return (
                      <span
                        key={metric}
                        className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                      >
                        {translated === key ? metric : translated}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Currency Selection */}
            <div className="space-y-3">
              <Label>{t("projectSettings.currencyLabel")}</Label>
              <Select value={pendingCurrency} onValueChange={handleCurrencySelect}>
                <SelectTrigger>
                  {/* Show only the ISO code in the trigger to avoid duplicated
                      labels like "MDL  L Молдавский лей (MDL)". */}
                  <SelectValue>{pendingCurrency}</SelectValue>
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t("projectSettings.cancel")}
            </Button>
            <Button onClick={handleSave}>
              {t("projectSettings.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Dialog for Business Type Change */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {t("projectSettings.confirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  {t("projectSettings.confirmBody1", {
                    from: currentConfig.label,
                    to: newConfig.label,
                  })}
                </p>
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <p className="font-medium">{t("projectSettings.confirmChangesLabel")}</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>{t("projectSettings.confirmChange1")}</li>
                    <li>
                      {t("projectSettings.confirmChange2", {
                        products: newConfig.productLabelPlural.toLowerCase(),
                      })}
                    </li>
                    <li>{t("projectSettings.confirmChange3")}</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {t("projectSettings.confirmDataSafe")}
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelChange}>
              {t("projectSettings.confirmCancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmChange}>
              {t("projectSettings.confirmAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
