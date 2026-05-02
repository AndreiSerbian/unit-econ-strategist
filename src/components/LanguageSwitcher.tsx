import { memo } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  useTranslation,
  type Language,
} from "@/i18n/useTranslation";

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher = memo(({ className }: LanguageSwitcherProps) => {
  const { language, setLanguage, t } = useTranslation();

  return (
    <ToggleGroup
      type="single"
      value={language}
      onValueChange={(val) => {
        if (val && (SUPPORTED_LANGUAGES as string[]).includes(val)) {
          setLanguage(val as Language);
        }
      }}
      aria-label={t("languageSwitcher.aria")}
      className={
        "border border-border rounded-md bg-background/50 " + (className ?? "")
      }
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <ToggleGroupItem
          key={lang}
          value={lang}
          aria-label={t(`languageSwitcher.${lang}`)}
          className="h-7 px-2 text-[11px] font-semibold data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {LANGUAGE_LABELS[lang]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
});

LanguageSwitcher.displayName = "LanguageSwitcher";
