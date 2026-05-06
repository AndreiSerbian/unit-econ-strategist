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

function detectBrowserLanguage(): Language | null {
  if (typeof navigator === "undefined") return null;
  const candidates: string[] = [];
  if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);
  if (navigator.language) candidates.push(navigator.language);
  for (const raw of candidates) {
    const prefix = raw.toLowerCase().split("-")[0];
    if ((SUPPORTED_LANGUAGES as string[]).includes(prefix)) {
      return prefix as Language;
    }
  }
  return null;
}

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
  // No explicit user choice yet — try browser language detection (do not persist).
  const detected = detectBrowserLanguage();
  if (detected) return detected;
  return DEFAULT_LANGUAGE;
}

function lookup(lang: Language, path: string): string | undefined {
  const segments = path.split(".");
  if (segments.length < 2) return undefined;
  const root = dictionary[lang];
  if (!root) return undefined;

  // Strategy 1: full nested walk through arbitrary depth.
  // Works for both 2-level (`section.key`) and deeper (`section.a.b.c`) paths.
  let nested: any = root;
  for (const seg of segments) {
    if (nested == null || typeof nested !== "object") {
      nested = undefined;
      break;
    }
    nested = nested[seg];
  }
  if (typeof nested === "string") return nested;

  // Strategy 2: flat dotted-key fallback inside section.
  // Supports dictionaries that store keys like `strategies["price-war.name"]`
  // — the section is the first segment and the rest is the literal key.
  const [section, ...rest] = segments;
  const sec = root[section] as Record<string, unknown> | undefined;
  if (sec && rest.length > 0) {
    const flatKey = rest.join(".");
    const flat = sec[flatKey];
    if (typeof flat === "string") return flat;
  }

  return undefined;
}

// Mutable holder for the currently active language so non-React code (hooks, utils)
// can produce localized strings (e.g. toast messages).
let _currentLanguage: Language = DEFAULT_LANGUAGE;

export function getActiveLanguage(): Language {
  return _currentLanguage;
}

/**
 * Static translator usable outside React. Falls back EN → RU → key.
 * Prefer the `t` from useTranslation() inside components.
 */
export function translate(
  path: string,
  vars?: Record<string, string | number>
): string {
  const lang = _currentLanguage;
  const direct = lookup(lang, path);
  if (direct !== undefined) return applyVars(direct, vars);
  const en = lookup("en", path);
  if (en !== undefined) return applyVars(en, vars);
  const ru = lookup(DEFAULT_LANGUAGE, path);
  if (ru !== undefined) return applyVars(ru, vars);
  return path;
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
      // Fallback chain: selected -> English -> key.
      // We deliberately do NOT fall back to Russian so that EN/RO never
      // silently render Cyrillic when a key is missing.
      const englishFallback = lookup("en", path);
      if (englishFallback !== undefined) return applyVars(englishFallback, vars);
      // Final fallback to default (RU) only if English also missing.
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
