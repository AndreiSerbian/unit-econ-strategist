import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { businessTypes, type BusinessType } from "@/config/businessTypeMetrics";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface BusinessTypeSelectorProps {
  selectedType: BusinessType;
  onChange: (type: BusinessType) => void;
}

export const BusinessTypeSelector = memo(({
  selectedType,
  onChange,
}: BusinessTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {businessTypes.map((bt, index) => {
        const isSelected = bt.id === selectedType;
        
        return (
          <motion.div
            key={bt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onChange(bt.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{bt.icon}</span>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-1">{bt.label}</h3>
                <p className="text-xs text-muted-foreground mb-3">{bt.description}</p>
                <div className="flex flex-wrap gap-1">
                  {bt.primaryMetrics.slice(0, 3).map((metric, idx) => (
                    <span 
                      key={idx}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
});

BusinessTypeSelector.displayName = "BusinessTypeSelector";
