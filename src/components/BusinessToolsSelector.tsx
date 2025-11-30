import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wrench, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BusinessTool {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

interface BusinessToolsSelectorProps {
  projectId?: string;
  scenarioType: string;
  expenseCategory: string;
  categoryLabel: string;
}

export const BusinessToolsSelector = ({ 
  projectId, 
  scenarioType, 
  expenseCategory,
  categoryLabel 
}: BusinessToolsSelectorProps) => {
  const [allTools, setAllTools] = useState<BusinessTool[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadSelectedTools();
    }
  }, [projectId, scenarioType, expenseCategory]);

  const loadTools = async () => {
    const { data, error } = await supabase
      .from('business_tools')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.error('Error loading tools:', error);
      return;
    }

    if (data) {
      setAllTools(data);
    }
  };

  const loadSelectedTools = async () => {
    if (!projectId) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('expense_tools')
      .select('tool_id')
      .eq('project_id', projectId)
      .eq('scenario_type', scenarioType)
      .eq('expense_category', expenseCategory);

    if (error) {
      console.error('Error loading selected tools:', error);
    } else if (data) {
      setSelectedTools(data.map(item => item.tool_id));
    }
    setIsLoading(false);
  };

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const saveTools = async () => {
    if (!projectId) {
      toast.error("Проект не выбран");
      return;
    }

    setIsSaving(true);
    try {
      // Delete existing tools for this category
      await supabase
        .from('expense_tools')
        .delete()
        .eq('project_id', projectId)
        .eq('scenario_type', scenarioType)
        .eq('expense_category', expenseCategory);

      // Insert selected tools
      if (selectedTools.length > 0) {
        const { error } = await supabase
          .from('expense_tools')
          .insert(
            selectedTools.map(toolId => ({
              project_id: projectId,
              scenario_type: scenarioType,
              expense_category: expenseCategory,
              tool_id: toolId
            }))
          );

        if (error) throw error;
      }

      toast.success("Инструменты сохранены");
    } catch (error) {
      console.error('Error saving tools:', error);
      toast.error("Ошибка при сохранении инструментов");
    } finally {
      setIsSaving(false);
    }
  };

  const groupedTools = allTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, BusinessTool[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Инструменты оптимизации
        </CardTitle>
        <CardDescription>
          Выберите инструменты для категории: {categoryLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[400px] pr-4">
          {Object.entries(groupedTools).map(([category, tools]) => (
            <div key={category} className="mb-6">
              <h4 className="font-semibold mb-3 text-sm text-muted-foreground">{category}</h4>
              <div className="space-y-3">
                {tools.map(tool => (
                  <div key={tool.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <Checkbox
                      id={tool.id}
                      checked={selectedTools.includes(tool.id)}
                      onCheckedChange={() => toggleTool(tool.id)}
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={tool.id}
                        className="font-medium cursor-pointer"
                      >
                        {tool.name}
                      </Label>
                      {tool.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {tool.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Выбрано: {selectedTools.length}
          </Badge>
          {selectedTools.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTools([])}
            >
              <X className="h-4 w-4 mr-1" />
              Очистить
            </Button>
          )}
        </div>

        <Button
          onClick={saveTools}
          disabled={isSaving || !projectId}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Сохранение..." : "Сохранить инструменты"}
        </Button>
      </CardContent>
    </Card>
  );
};
