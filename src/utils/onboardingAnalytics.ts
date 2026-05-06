import type { Language } from "@/i18n/types";

export type OnboardingEventName =
  | "onboarding_started"
  | "onboarding_step_completed"
  | "onboarding_skipped"
  | "onboarding_finished"
  | "onboarding_language_selected";

interface BasePayload {
  language: Language;
  step: number;
  totalSteps: number;
  completionPercentage: number;
  timestamp: string;
}

interface LanguageSelectedExtras {
  previousLanguage?: Language;
  selectedLanguage?: Language;
  source?: "onboarding_selector" | "browser" | "website_language_state";
}

export type OnboardingEventPayload = BasePayload & LanguageSelectedExtras;

export function trackOnboardingEvent(
  name: OnboardingEventName,
  partial: Partial<OnboardingEventPayload> & {
    language: Language;
    step: number;
    totalSteps: number;
  }
) {
  const payload: OnboardingEventPayload = {
    completionPercentage: Math.round(
      ((partial.step + 1) / Math.max(1, partial.totalSteps)) * 100
    ),
    timestamp: new Date().toISOString(),
    ...partial,
  };
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent("onboarding:event", { detail: { name, payload } })
      );
    } catch {
      /* ignore */
    }
  }
  // eslint-disable-next-line no-console
  console.debug("[onboarding]", name, payload);
}
