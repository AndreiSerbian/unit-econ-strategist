import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardList, Plus, CheckCircle2, Circle, Clock, Trash2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/useTranslation";

interface ActionPlan {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  impact_score: number | null;
  status: string;
  due_date: string | null;
  related_metric: string | null;
}

interface ActionPlanManagerProps {
  projectId?: string;
  currentMetrics?: {
    profitMargin: number;
    cac: number;
    breakEven: number;
  };
}

export const ActionPlanManager = ({ projectId, currentMetrics }: ActionPlanManagerProps) => {
  const { t, language } = useTranslation();
  const dateLocale = language === "ru" ? "ru-RU" : language === "ro" ? "ro-RO" : "en-US";
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    due_date: "",
    related_metric: ""
  });

  useEffect(() => {
    if (projectId) {
      loadPlans();
    }
  }, [projectId]);

  const loadPlans = async () => {
    if (!projectId) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('action_plans')
      .select('*')
      .eq('project_id', projectId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading plans:', error);
    } else if (data) {
      setPlans(data);
    }
    setIsLoading(false);
  };

  const addPlan = async () => {
    if (!projectId || !newPlan.title.trim()) {
      toast.error(t("actionPlan.toastFillTitle"));
      return;
    }

    const { error } = await supabase
      .from('action_plans')
      .insert({
        project_id: projectId,
        title: newPlan.title,
        description: newPlan.description || null,
        priority: newPlan.priority,
        status: newPlan.status,
        due_date: newPlan.due_date || null,
        related_metric: newPlan.related_metric || null
      });

    if (error) {
      console.error('Error adding plan:', error);
      toast.error(t("actionPlan.toastAddError"));
      return;
    }

    toast.success(t("actionPlan.toastAdded"));
    setIsDialogOpen(false);
    setNewPlan({
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      due_date: "",
      related_metric: ""
    });
    loadPlans();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('action_plans')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      toast.error(t("actionPlan.toastUpdateError"));
      return;
    }

    toast.success(t("actionPlan.toastStatusUpdated"));
    loadPlans();
  };

  const deletePlan = async (id: string) => {
    const { error } = await supabase
      .from('action_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting plan:', error);
      toast.error(t("actionPlan.toastDeleteError"));
      return;
    }

    toast.success(t("actionPlan.toastDeleted"));
    loadPlans();
  };

  const generateRecommendedActions = () => {
    if (!currentMetrics) return;

    const recommendations: typeof newPlan[] = [];

    if (currentMetrics.profitMargin < 10) {
      recommendations.push({
        title: t("actionPlan.recOptVarTitle"),
        description: t("actionPlan.recOptVarDesc"),
        priority: "high",
        status: "pending",
        due_date: "",
        related_metric: "profit_margin"
      });
    }

    if (currentMetrics.cac > 1000) {
      recommendations.push({
        title: t("actionPlan.recOptMarketingTitle"),
        description: t("actionPlan.recOptMarketingDesc"),
        priority: "high",
        status: "pending",
        due_date: "",
        related_metric: "cac"
      });
    }

    if (currentMetrics.breakEven < 0) {
      recommendations.push({
        title: t("actionPlan.recIncreaseAOVTitle"),
        description: t("actionPlan.recIncreaseAOVDesc"),
        priority: "high",
        status: "pending",
        due_date: "",
        related_metric: "revenue"
      });
    }

    return recommendations;
  };

  const addGeneratedActions = async () => {
    const recommendations = generateRecommendedActions();
    if (!recommendations || recommendations.length === 0) {
      toast.info(t("actionPlan.toastNoRecommendations"));
      return;
    }

    if (!projectId) return;

    const { error } = await supabase
      .from('action_plans')
      .insert(
        recommendations.map(rec => ({
          project_id: projectId,
          ...rec
        }))
      );

    if (error) {
      console.error('Error adding generated actions:', error);
      toast.error(t("actionPlan.toastAddError"));
      return;
    }

    toast.success(t("actionPlan.toastRecommendationsAdded", { count: recommendations.length }));
    loadPlans();
  };

  const priorityColors = {
    high: "destructive",
    medium: "default",
    low: "secondary"
  } as const;

  const statusIcons = {
    pending: <Circle className="h-4 w-4" />,
    in_progress: <Clock className="h-4 w-4" />,
    completed: <CheckCircle2 className="h-4 w-4" />
  };

  const priorityLabel = (p: string) =>
    p === "high"
      ? t("actionPlan.priorityHigh")
      : p === "medium"
      ? t("actionPlan.priorityMedium")
      : t("actionPlan.priorityLow");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              {t("actionPlan.title")}
            </CardTitle>
            <CardDescription>
              {t("actionPlan.description")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {currentMetrics && (
              <Button
                variant="outline"
                size="sm"
                onClick={addGeneratedActions}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {t("actionPlan.generate")}
              </Button>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("actionPlan.add")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("actionPlan.dialogTitle")}</DialogTitle>
                  <DialogDescription>
                    {t("actionPlan.dialogDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t("actionPlan.nameLabel")}</Label>
                    <Input
                      id="title"
                      value={newPlan.title}
                      onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                      placeholder={t("actionPlan.namePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">{t("actionPlan.descriptionLabel")}</Label>
                    <Textarea
                      id="description"
                      value={newPlan.description}
                      onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                      placeholder={t("actionPlan.descriptionPlaceholder")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("actionPlan.priorityLabel")}</Label>
                      <Select value={newPlan.priority} onValueChange={(v) => setNewPlan({...newPlan, priority: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">{t("actionPlan.priorityHigh")}</SelectItem>
                          <SelectItem value="medium">{t("actionPlan.priorityMedium")}</SelectItem>
                          <SelectItem value="low">{t("actionPlan.priorityLow")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="due_date">{t("actionPlan.dueDateLabel")}</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={newPlan.due_date}
                        onChange={(e) => setNewPlan({...newPlan, due_date: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t("actionPlan.cancel")}
                  </Button>
                  <Button onClick={addPlan}>{t("actionPlan.add")}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">{t("actionPlan.loading")}</p>
        ) : plans.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t("actionPlan.empty")}
          </p>
        ) : (
          <div className="space-y-3">
            {plans.map(plan => (
              <div
                key={plan.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={priorityColors[plan.priority as keyof typeof priorityColors]}>
                        {priorityLabel(plan.priority)}
                      </Badge>
                      <h4 className="font-medium">{plan.title}</h4>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {plan.description}
                      </p>
                    )}
                    {plan.due_date && (
                      <p className="text-xs text-muted-foreground">
                        {t("actionPlan.dueLabel")} {new Date(plan.due_date).toLocaleDateString(dateLocale)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={plan.status}
                      onValueChange={(v) => updateStatus(plan.id, v)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <div className="flex items-center gap-2">
                          {statusIcons[plan.status as keyof typeof statusIcons]}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t("actionPlan.statusPending")}</SelectItem>
                        <SelectItem value="in_progress">{t("actionPlan.statusInProgress")}</SelectItem>
                        <SelectItem value="completed">{t("actionPlan.statusCompleted")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePlan(plan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
