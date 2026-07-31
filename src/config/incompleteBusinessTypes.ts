// Financial Safety Guardrails v1 — declarative list of business models whose
// financial integrations are incomplete. Presentation-only metadata: no
// formula, adapter or calculation logic lives here.

import type { BusinessType } from "@/config/businessTypeMetrics";

export const INCOMPLETE_BUSINESS_TYPES: BusinessType[] = [
  "token_saas",
  "sharing",
  "production",
  "marketplace",
];

export function isIncompleteBusinessType(businessType: BusinessType): boolean {
  return INCOMPLETE_BUSINESS_TYPES.includes(businessType);
}
