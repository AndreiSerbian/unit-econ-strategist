import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

interface ExportDialogProps {
  data: any;
  projectName?: string;
}

export const ExportDialog = ({ data, projectName = "Анализ" }: ExportDialogProps) => {
  const exportToJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Данные экспортированы в JSON");
  };

  const exportToCSV = () => {
    const scenarios = data.scenarios || {};
    const competitors = data.competitors || [];
    
    let csv = "Тип,Сценарий,Выручка,Клиенты,Новые клиенты,Повторные клиенты,Постоянные расходы,Переменные расходы,Маркетинг\n";
    
    Object.entries(scenarios).forEach(([type, metrics]: [string, any]) => {
      csv += `Сценарий,${type},${metrics.revenue},${metrics.totalClients},${metrics.newClients},${metrics.returningClients},${metrics.fixedCosts},${metrics.variableCosts},${metrics.marketingCosts}\n`;
    });
    
    csv += "\nКонкурент,Выручка,Доля рынка,Цена,Качество,Маркетинг\n";
    competitors.forEach((c: any) => {
      csv += `${c.name},${c.revenue},${c.marketShare},${c.pricing},${c.quality},${c.marketingSpend}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Данные экспортированы в CSV");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="whitespace-nowrap">
          <Download className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Экспорт</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Экспорт данных</DialogTitle>
          <DialogDescription>
            Выберите формат для экспорта данных анализа
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Button onClick={exportToJSON} className="w-full justify-start" variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Экспорт в JSON
          </Button>
          <Button onClick={exportToCSV} className="w-full justify-start" variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Экспорт в CSV (Excel)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
