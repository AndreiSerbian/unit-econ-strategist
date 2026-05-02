export type Language = "ru" | "en" | "ro";

export const SUPPORTED_LANGUAGES: Language[] = ["ru", "en", "ro"];
export const DEFAULT_LANGUAGE: Language = "ru";
export const LANGUAGE_STORAGE_KEY = "unitEconomicsLanguage";

export const LANGUAGE_LABELS: Record<Language, string> = {
  ru: "RU",
  en: "EN",
  ro: "RO",
};
