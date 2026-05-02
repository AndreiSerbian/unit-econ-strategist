import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  type Language,
} from "./types";
import { dictionary } from "./dictionary";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  try {
    const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (raw && (SUPPORTED_LANGUAGES as string[]).includes(raw)) {
      return raw as Language;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_LANGUAGE;
}

function lookup(lang: Language, path: string): string | undefined {
  const [section, key] = path.split(".");
  if (!section || !key) return undefined;
  const sec = dictionary[lang]?.[section];
  if (!sec) return undefined;
  return sec[key];
}

function applyVars(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_m, name) =>
    vars[name] !== undefined ? String(vars[name]) : `{${name}}`
  );
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() =>
    readStoredLanguage()
  );

  const setLanguage = useCallback((lang: Language) => {
    if (!(SUPPORTED_LANGUAGES as string[]).includes(lang)) return;
    setLanguageState(lang);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => {
      const direct = lookup(language, path);
      if (direct !== undefined) return applyVars(direct, vars);
      const fallback = lookup(DEFAULT_LANGUAGE, path);
      if (fallback !== undefined) return applyVars(fallback, vars);
      return path;
    },
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return ctx;
}
