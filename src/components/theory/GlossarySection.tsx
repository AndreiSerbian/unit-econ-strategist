import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { getGlossaryFor, useTranslation } from "@/i18n/useTranslation";

export const GlossarySection = memo(() => {
  const { language, t } = useTranslation();
  const entries = getGlossaryFor(language);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="w-4 h-4 text-primary" />
          {t("glossary.title")}
        </CardTitle>
        <CardDescription>{t("glossary.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {entries.map((e) => (
            <div
              key={e.key}
              className="rounded-md border border-border bg-muted/20 p-3"
            >
              <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  {e.abbreviation}
                </span>
                <span className="text-sm font-semibold">{e.term}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {e.definition}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

GlossarySection.displayName = "GlossarySection";
