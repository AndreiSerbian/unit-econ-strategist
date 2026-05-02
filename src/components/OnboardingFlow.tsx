import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  BarChart3,
  Users,
  Map,
  TrendingUp,
  Brain,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Rocket,
  Building2,
} from "lucide-react";
import { BusinessTypeSelector } from "./BusinessTypeSelector";
import { businessTypes, type BusinessType } from "@/config/businessTypeMetrics";
import { useTranslation } from "@/i18n/useTranslation";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  component?: React.ReactNode;
}

interface OnboardingFlowProps {
  onComplete: (businessType: BusinessType) => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType>("ecommerce");

  const steps: OnboardingStep[] = useMemo(
    () => [
      {
        id: "welcome",
        title: t("onboarding.welcomeTitle"),
        description: t("onboarding.welcomeDesc"),
        icon: <Rocket className="w-12 h-12 text-primary" />,
        details: [
          t("onboarding.welcomeBullet1"),
          t("onboarding.welcomeBullet2"),
          t("onboarding.welcomeBullet3"),
          t("onboarding.welcomeBullet4"),
        ],
      },
      {
        id: "business-type",
        title: t("onboarding.businessTypeTitle"),
        description: t("onboarding.businessTypeDesc"),
        icon: <Building2 className="w-12 h-12 text-primary" />,
        details: [],
        component: (
          <BusinessTypeSelector
            selectedType={selectedBusinessType}
            onChange={setSelectedBusinessType}
          />
        ),
      },
      {
        id: "products",
        title: t("onboarding.productsTitle"),
        description: t("onboarding.productsDesc"),
        icon: <Package className="w-12 h-12 text-primary" />,
        details: [
          t("onboarding.productsBullet1"),
          t("onboarding.productsBullet2"),
          t("onboarding.productsBullet3"),
          t("onboarding.productsBullet4"),
        ],
      },
      {
        id: "metrics",
        title: t("onboarding.metricsTitle"),
        description: t("onboarding.metricsDesc"),
        icon: <BarChart3 className="w-12 h-12 text-primary" />,
        details: [
          t("onboarding.metricsBullet1"),
          t("onboarding.metricsBullet2"),
          t("onboarding.metricsBullet3"),
          t("onboarding.metricsBullet4"),
        ],
      },
      {
        id: "competitors",
        title: t("onboarding.competitorsTitle"),
        description: t("onboarding.competitorsDesc"),
        icon: <Users className="w-12 h-12 text-primary" />,
        details: [
          t("onboarding.competitorsBullet1"),
          t("onboarding.competitorsBullet2"),
          t("onboarding.competitorsBullet3"),
          t("onboarding.competitorsBullet4"),
        ],
      },
      {
        id: "market",
        title: t("onboarding.marketTitle"),
        description: t("onboarding.marketDesc"),
        icon: <Map className="w-12 h-12 text-primary" />,
        details: [
          t("onboarding.marketBullet1"),
          t("onboarding.marketBullet2"),
          t("onboarding.marketBullet3"),
          t("onboarding.marketBullet4"),
        ],
      },
      {
        id: "analytics",
        title: t("onboarding.analyticsTitle"),
        description: t("onboarding.analyticsDesc"),
        icon: <TrendingUp className="w-12 h-12 text-primary" />,
        details: [
          t("onboarding.analyticsBullet1"),
          t("onboarding.analyticsBullet2"),
          t("onboarding.analyticsBullet3"),
          t("onboarding.analyticsBullet4"),
        ],
      },
      {
        id: "theory",
        title: t("onboarding.theoryTitle"),
        description: t("onboarding.theoryDesc"),
        icon: <Brain className="w-12 h-12 text-primary" />,
        details: [
          t("onboarding.theoryBullet1"),
          t("onboarding.theoryBullet2"),
          t("onboarding.theoryBullet3"),
          t("onboarding.theoryBullet4"),
        ],
      },
    ],
    [t, selectedBusinessType]
  );

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(selectedBusinessType);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const selectedBusinessConfig = businessTypes.find((bt) => bt.id === selectedBusinessType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <Card className="shadow-2xl border-primary/20">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "w-8 bg-primary"
                      : index < currentStep
                      ? "w-2 bg-primary/60"
                      : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-primary/10">{step.icon}</div>
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl mb-2">{step.title}</CardTitle>
                    <CardDescription className="text-base sm:text-lg">
                      {step.description}
                    </CardDescription>
                  </div>
                </div>

                {step.component ? (
                  <div className="pt-4">
                    {step.component}
                    {step.id === "business-type" && selectedBusinessConfig && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20"
                      >
                        <p className="text-sm font-medium mb-2">
                          {t("onboarding.selectedLabel")} {selectedBusinessConfig.icon}{" "}
                          {selectedBusinessConfig.label}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {t("onboarding.keyMetricsForType")}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {selectedBusinessConfig.primaryMetrics.map((metric, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary"
                            >
                              {metric}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 pt-4">
                    {step.details.map((detail, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm sm:text-base">{detail}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t("onboarding.back")}</span>
              </Button>

              <span className="text-sm text-muted-foreground">
                {t("onboarding.progress", { current: currentStep + 1, total: steps.length })}
              </span>

              <Button onClick={nextStep} className="gap-2">
                <span className="hidden sm:inline">
                  {currentStep === steps.length - 1
                    ? t("onboarding.startWork")
                    : t("onboarding.next")}
                </span>
                <span className="sm:hidden">
                  {currentStep === steps.length - 1
                    ? t("onboarding.start")
                    : t("onboarding.next")}
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {currentStep === 0 && (
              <div className="text-center mt-4">
                <Button
                  variant="link"
                  onClick={() => onComplete("ecommerce")}
                  className="text-muted-foreground"
                >
                  {t("onboarding.skip")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
