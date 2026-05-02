import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { SubjectiveEstimateBadge } from "@/components/ui/subjective-estimate-badge";
import { useTranslation } from "@/i18n/useTranslation";

interface SWOTData {
  id?: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface SWOTAnalysisProps {
  projectId?: string;
  myCompany: { name: string };
  competitors: Array<{ id: string; name: string }>;
}

export const SWOTAnalysis = ({ projectId, myCompany, competitors }: SWOTAnalysisProps) => {
  const { t } = useTranslation();
  const [companySwot, setCompanySwot] = useState<SWOTData>({ strengths: [], weaknesses: [], opportunities: [], threats: [] });
  const [competitorSwots, setCompetitorSwots] = useState<Record<string, SWOTData>>({});
  const [newItems, setNewItems] = useState({
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadSwotData();
    }
  }, [projectId]);

  const loadSwotData = async () => {
    if (!projectId) return;

    const { data, error } = await supabase
      .from('swot_analyses')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      console.error('Error loading SWOT data:', error);
      return;
    }

    if (data) {
      data.forEach((swot: any) => {
        const swotData = {
          id: swot.id,
          strengths: swot.strengths || [],
          weaknesses: swot.weaknesses || [],
          opportunities: swot.opportunities || [],
          threats: swot.threats || [],
        };

        if (swot.entity_type === 'company') {
          setCompanySwot(swotData);
        } else if (swot.entity_id) {
          setCompetitorSwots(prev => ({ ...prev, [swot.entity_id]: swotData }));
        }
      });
    }
  };

  const saveSwot = async (entityType: 'company' | 'competitor', entityId?: string, entityName?: string, swotData?: SWOTData) => {
    if (!projectId) return;

    setIsSaving(true);
    const data = swotData || (entityType === 'company' ? companySwot : competitorSwots[entityId!]);

    try {
      const { error } = await supabase
        .from('swot_analyses')
        .upsert({
          id: data.id,
          project_id: projectId,
          entity_type: entityType,
          entity_id: entityId || null,
          entity_name: entityName || myCompany.name,
          strengths: data.strengths,
          weaknesses: data.weaknesses,
          opportunities: data.opportunities,
          threats: data.threats,
        }, {
          onConflict: 'project_id,entity_type,entity_id'
        });

      if (error) throw error;
      
      toast.success(t("swotAnalysis.saved"));
      await loadSwotData();
    } catch (error) {
      console.error('Error saving SWOT:', error);
      toast.error(t("swotAnalysis.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = (category: keyof typeof newItems, entityType: 'company' | 'competitor', entityId?: string) => {
    const value = newItems[category].trim();
    if (!value) return;

    if (entityType === 'company') {
      setCompanySwot(prev => ({
        ...prev,
        [category]: [...prev[category], value]
      }));
    } else if (entityId) {
      setCompetitorSwots(prev => ({
        ...prev,
        [entityId]: {
          ...(prev[entityId] || { strengths: [], weaknesses: [], opportunities: [], threats: [] }),
          [category]: [...(prev[entityId]?.[category] || []), value]
        }
      }));
    }

    setNewItems(prev => ({ ...prev, [category]: "" }));
  };

  const removeItem = (category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats', index: number, entityType: 'company' | 'competitor', entityId?: string) => {
    if (entityType === 'company') {
      setCompanySwot(prev => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== index)
      }));
    } else if (entityId) {
      setCompetitorSwots(prev => ({
        ...prev,
        [entityId]: {
          ...prev[entityId],
          [category]: (prev[entityId]?.[category] || []).filter((_, i) => i !== index)
        }
      }));
    }
  };

  const renderSWOTSection = (
    title: string,
    category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats',
    items: string[],
    bgColor: string,
    entityType: 'company' | 'competitor',
    entityId?: string
  ) => (
    <Card className={bgColor}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 p-2 bg-background/50 rounded"
            >
              <span className="flex-1 text-sm">{item}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(category, index, entityType, entityId)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder={t("swotAnalysis.addPlaceholder", { category: title.toLowerCase() })}
            value={newItems[category]}
            onChange={(e) => setNewItems(prev => ({ ...prev, [category]: e.target.value }))}
            className="min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addItem(category, entityType, entityId);
              }
            }}
          />
          <Button
            onClick={() => addItem(category, entityType, entityId)}
            size="sm"
            className="self-end"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSWOTMatrix = (swotData: SWOTData, entityType: 'company' | 'competitor', entityId?: string, entityName?: string) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderSWOTSection(t("swotAnalysis.strengths"), "strengths", swotData.strengths, "bg-green-50 dark:bg-green-950/20", entityType, entityId)}
        {renderSWOTSection(t("swotAnalysis.weaknesses"), "weaknesses", swotData.weaknesses, "bg-red-50 dark:bg-red-950/20", entityType, entityId)}
        {renderSWOTSection(t("swotAnalysis.opportunities"), "opportunities", swotData.opportunities, "bg-blue-50 dark:bg-blue-950/20", entityType, entityId)}
        {renderSWOTSection(t("swotAnalysis.threats"), "threats", swotData.threats, "bg-yellow-50 dark:bg-yellow-950/20", entityType, entityId)}
      </div>
      <Button
        onClick={() => saveSwot(entityType, entityId, entityName, swotData)}
        disabled={isSaving}
        className="w-full"
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? t("swotAnalysis.saving") : t("swotAnalysis.save")}
      </Button>
    </div>
  );

  return (
    <Card data-export="swot-analysis">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle>{t("swotAnalysis.title")}</CardTitle>
          <SubjectiveEstimateBadge />
        </div>
        <CardDescription>
          {t("swotAnalysis.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${1 + competitors.length}, minmax(0, 1fr))` }}>
            <TabsTrigger value="company">{t("swotAnalysis.myCompany")}</TabsTrigger>
            {competitors.map(competitor => (
              <TabsTrigger key={competitor.id} value={competitor.id}>
                {competitor.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="company" className="mt-6">
            {renderSWOTMatrix(companySwot, 'company', undefined, myCompany.name)}
          </TabsContent>

          {competitors.map(competitor => (
            <TabsContent key={competitor.id} value={competitor.id} className="mt-6">
              {renderSWOTMatrix(
                competitorSwots[competitor.id] || { strengths: [], weaknesses: [], opportunities: [], threats: [] },
                'competitor',
                competitor.id,
                competitor.name
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};