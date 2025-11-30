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
    
    let csv = "Тип,Сценарий,Выручка,Клиенты,Новые клиенты,Повторные клиенты,Конверсия,Средний чек,Постоянные расходы,Переменные расходы,Маркетинг,CAC,CPL,Точка безубыточности,Прибыль на платеж,Маржа прибыли\n";
    
    // Экспорт сценариев с детальными метриками
    Object.entries(scenarios).forEach(([type, metrics]: [string, any]) => {
      const cac = metrics.newClients > 0 ? metrics.marketingCosts / metrics.newClients : 0;
      const cpl = metrics.totalClients > 0 ? metrics.marketingCosts / metrics.totalClients : 0;
      const totalCosts = metrics.fixedCosts + metrics.variableCosts + metrics.marketingCosts;
      const profit = metrics.revenue - totalCosts;
      const profitMargin = metrics.revenue > 0 ? (profit / metrics.revenue) * 100 : 0;
      const breakEven = metrics.avgCheck > 0 ? totalCosts / metrics.avgCheck : 0;
      const profitPerPayment = metrics.totalClients > 0 ? profit / metrics.totalClients : 0;
      
      csv += `Сценарий,${type},${metrics.revenue},${metrics.totalClients},${metrics.newClients},${metrics.returningClients},${metrics.conversionRate}%,${metrics.avgCheck},${metrics.fixedCosts},${metrics.variableCosts},${metrics.marketingCosts},${cac.toFixed(2)},${cpl.toFixed(2)},${breakEven.toFixed(0)},${profitPerPayment.toFixed(2)},${profitMargin.toFixed(2)}%\n`;
    });
    
    // Экспорт конкурентов с детальными метриками
    csv += "\nКонкурент,Выручка,Доля рынка,Цена,Качество,Маркетинг,Клиенты,Новые клиенты,Повторные клиенты,Конверсия,Средний чек,Постоянные расходы,Переменные расходы,CAC,CPL,Точка безубыточности,Прибыль на платеж,Маржа прибыли\n";
    competitors.forEach((c: any) => {
      const totalClients = c.totalClients || 0;
      const newClients = c.newClients || 0;
      const returningClients = c.returningClients || 0;
      const conversionRate = c.conversionRate || 0;
      const avgCheck = c.avgCheck || 0;
      const fixedCosts = c.fixedCosts || 0;
      const variableCosts = c.variableCosts || 0;
      const marketingSpend = c.marketingSpend || 0;
      
      const cac = newClients > 0 ? marketingSpend / newClients : 0;
      const cpl = totalClients > 0 ? marketingSpend / totalClients : 0;
      const totalCosts = fixedCosts + variableCosts + marketingSpend;
      const profit = c.revenue - totalCosts;
      const profitMargin = c.revenue > 0 ? (profit / c.revenue) * 100 : 0;
      const breakEven = avgCheck > 0 ? totalCosts / avgCheck : 0;
      const profitPerPayment = totalClients > 0 ? profit / totalClients : 0;
      
      csv += `${c.name},${c.revenue},${c.marketShare},${c.pricing},${c.quality},${marketingSpend},${totalClients},${newClients},${returningClients},${conversionRate}%,${avgCheck},${fixedCosts},${variableCosts},${cac.toFixed(2)},${cpl.toFixed(2)},${breakEven.toFixed(0)},${profitPerPayment.toFixed(2)},${profitMargin.toFixed(2)}%\n`;
    });

    // Экспорт детальных расходов конкурентов
    const competitorsWithDetails = competitors.filter((c: any) => c.detailedExpenses);
    if (competitorsWithDetails.length > 0) {
      csv += "\n\nДетальные расходы конкурентов\n";
      csv += "Конкурент,Категория,Статья расходов,Сумма\n";
      
      competitorsWithDetails.forEach((c: any) => {
        const de = c.detailedExpenses;
        
        csv += `${c.name},Постоянные,ЗП по старым клиентам,${de.fixedCosts.salaryOldClients}\n`;
        csv += `${c.name},Постоянные,ЗП по новым клиентам,${de.fixedCosts.salaryNewClients}\n`;
        csv += `${c.name},Постоянные,Оклад руководства,${de.fixedCosts.managementSalary}\n`;
        csv += `${c.name},Постоянные,Оклад маркетинга,${de.fixedCosts.marketingSalary}\n`;
        csv += `${c.name},Постоянные,Оклад производства,${de.fixedCosts.productionSalary}\n`;
        csv += `${c.name},Постоянные,Аренда офиса,${de.fixedCosts.officeRent}\n`;
        csv += `${c.name},Постоянные,Аренда склада,${de.fixedCosts.warehouseRent}\n`;
        csv += `${c.name},Переменные - Маркетинг,Закупка трафика,${de.variableCosts.marketing.trafficPurchase}\n`;
        csv += `${c.name},Переменные - Маркетинг,Оплата подрядчикам,${de.variableCosts.marketing.contractorsPayment}\n`;
        csv += `${c.name},Переменные - Маркетинг,CRM расходы,${de.variableCosts.marketing.crmCosts}\n`;
        csv += `${c.name},Переменные - ФОТ продаж,Бонусы по старым клиентам,${de.variableCosts.salesPayroll.bonusOldClients}\n`;
        csv += `${c.name},Переменные - ФОТ продаж,Бонусы по новым клиентам,${de.variableCosts.salesPayroll.bonusNewClients}\n`;
        csv += `${c.name},Переменные - Исполнение,Материалы,${de.variableCosts.production.materials}\n`;
        csv += `${c.name},Переменные - Исполнение,Кураторы,${de.variableCosts.production.curators}\n`;
        csv += `${c.name},Переменные - Исполнение,Логистика,${de.variableCosts.production.logistics}\n`;
        csv += `${c.name},Налоги,Налоги,${de.taxes}\n`;
      });
    }

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