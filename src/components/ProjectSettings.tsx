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

interface ProjectSettingsProps {
  currentBusinessType: BusinessType;
  onBusinessTypeChange: (type: BusinessType) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

export const ProjectSettings = ({
  currentBusinessType,
  onBusinessTypeChange,
  currency,
  onCurrencyChange,
}: ProjectSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<BusinessType>(currentBusinessType);
  const [showWarning, setShowWarning] = useState(false);

  const currentConfig = getBusinessTypeConfig(currentBusinessType);
  const newConfig = getBusinessTypeConfig(selectedType);

  const handleTypeSelect = (type: BusinessType) => {
    setSelectedType(type);
  };

  const handleSave = () => {
    if (selectedType !== currentBusinessType) {
      setShowWarning(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleConfirmChange = () => {
    onBusinessTypeChange(selectedType);
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
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" title="Настройки проекта">
            <Settings className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Настройки проекта</DialogTitle>
            <DialogDescription>
              Настройте параметры вашего проекта
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Business Type Selection */}
            <div className="space-y-3">
              <Label>Тип бизнеса</Label>
              <Select value={selectedType} onValueChange={(v) => handleTypeSelect(v as BusinessType)}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span>{newConfig.icon}</span>
                      <span>{newConfig.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
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
                      Внимание: смена типа бизнеса
                    </p>
                    <p className="text-muted-foreground mt-1">
                      При смене типа бизнеса некоторые метрики и настройки могут стать нерелевантными. 
                      Данные сохранятся, но их интерпретация изменится.
                    </p>
                  </div>
                </div>
              )}

              {/* Current metrics preview */}
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Ключевые метрики для {newConfig.label}:</p>
                <div className="flex flex-wrap gap-1">
                  {newConfig.primaryMetrics.map((metric) => (
                    <span 
                      key={metric} 
                      className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Currency Selection */}
            <div className="space-y-3">
              <Label>Валюта</Label>
              <Select value={currency} onValueChange={onCurrencyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUB">₽ Рубль (RUB)</SelectItem>
                  <SelectItem value="USD">$ Доллар (USD)</SelectItem>
                  <SelectItem value="EUR">€ Евро (EUR)</SelectItem>
                  <SelectItem value="KZT">₸ Тенге (KZT)</SelectItem>
                  <SelectItem value="BYN">Br Белорусский рубль (BYN)</SelectItem>
                  <SelectItem value="UAH">₴ Гривна (UAH)</SelectItem>
                  <SelectItem value="MDL">L Молдавский лей (MDL)</SelectItem>
                  <SelectItem value="RON">lei Румынский лей (RON)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              Сохранить
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
              Подтвердите смену типа бизнеса
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Вы меняете тип бизнеса с <strong>"{currentConfig.label}"</strong> на <strong>"{newConfig.label}"</strong>.
                </p>
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <p className="font-medium">Что изменится:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Названия метрик и их интерпретация</li>
                    <li>Поля в формах для {newConfig.productLabelPlural.toLowerCase()}</li>
                    <li>Рекомендации и аналитика будут адаптированы</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    ✓ Ваши данные (показатели, продукты, конкуренты) <strong>не будут удалены</strong>
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelChange}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmChange}>
              Да, сменить тип
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
