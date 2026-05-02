import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Users, Package, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/useTranslation';

interface Metrics {
  revenue: number;
  profit: number;
  profitMargin: number;
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  breakEvenPoint: number;
  conversionRate: number;
  totalClients: number;
  avgCheck: number;
  marketingCosts: number;
}

interface Competitor {
  id: string;
  name: string;
  revenue: number;
  marketShare: number;
  quality: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
}

interface AIAnalyticsProps {
  metrics: Metrics;
  competitors: Competitor[];
  products: Product[];
}

const AIAnalytics: React.FC<AIAnalyticsProps> = ({ metrics, competitors, products }) => {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState('strategic');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, string>>({});

  const runAnalysis = async (type: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-analytics', {
        body: {
          metrics,
          competitors,
          products,
          analysisType: type,
          language,
        },
      });

      if (error) throw error;

      setAnalysis(prev => ({ ...prev, [type]: data.analysis }));
      toast.success(t('aiSummary.success'));
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(t('aiSummary.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const analysisTypes = [
    { id: 'strategic', label: t('aiSummary.types_strategic'), icon: Brain, description: t('aiSummary.types_strategic_desc') },
    { id: 'competitor', label: t('aiSummary.types_competitor'), icon: Users, description: t('aiSummary.types_competitor_desc') },
    { id: 'forecast', label: t('aiSummary.types_forecast'), icon: TrendingUp, description: t('aiSummary.types_forecast_desc') },
    { id: 'products', label: t('aiSummary.types_products'), icon: Package, description: t('aiSummary.types_products_desc') },
  ];

  const formatAnalysis = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('###') || line.startsWith('**')) {
        return <h4 key={i} className="font-semibold text-foreground mt-4 mb-2">{line.replace(/[#*]/g, '')}</h4>;
      }
      if (line.startsWith('-') || line.startsWith('•')) {
        return <li key={i} className="ml-4 text-muted-foreground">{line.substring(1).trim()}</li>;
      }
      if (line.match(/^\d+\./)) {
        return <li key={i} className="ml-4 text-muted-foreground list-decimal">{line.substring(line.indexOf('.') + 1).trim()}</li>;
      }
      if (line.trim()) {
        return <p key={i} className="text-muted-foreground mb-2">{line}</p>;
      }
      return null;
    });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          {t('aiSummary.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
            {analysisTypes.map(type => (
              <TabsTrigger key={type.id} value={type.id} className="text-xs md:text-sm">
                <type.icon className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">{type.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {analysisTypes.map(type => (
            <TabsContent key={type.id} value={type.id} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">{type.description}</p>
                <Button 
                  onClick={() => runAnalysis(type.id)} 
                  disabled={isLoading}
                  size="sm"
                  className="shrink-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('aiSummary.running')}
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      {t('aiSummary.run')}
                    </>
                  )}
                </Button>
              </div>

              {analysis[type.id] ? (
                <div className="bg-muted/50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    {formatAnalysis(analysis[type.id])}
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-8 text-center">
                  <type.icon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    {t('aiSummary.empty')}
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIAnalytics;
