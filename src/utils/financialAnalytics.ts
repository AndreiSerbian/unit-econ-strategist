// Financial Safety Guardrails v1 — non-financial analytics.
// Emits CustomEvents + console.debug (same pattern as onboardingAnalytics).
// No financial values are computed or modified here.

export type FinancialEventName =
  | "financial_warning_viewed"
  | "revenue_source_selected"
  | "legacy_data_normalized"
  | "incomplete_model_warning_viewed";

const SESSION_KEY = "financial_analytics_seen_v1";

function readSeen(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeSeen(list: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function trackFinancialEvent(
  name: FinancialEventName,
  payload: Record<string, unknown> = {},
) {
  const full = { ...payload, timestamp: new Date().toISOString() };
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent("financial:event", { detail: { name, payload: full } }),
      );
    } catch {
      /* ignore */
    }
  }
  // eslint-disable-next-line no-console
  console.debug("[financial]", name, full);
}

/**
 * Fires the event at most once per (event, projectId) per browser session.
 * Returns true when the event was actually emitted.
 */
export function trackFinancialEventOnce(
  name: FinancialEventName,
  projectId: string | null,
  payload: Record<string, unknown> = {},
): boolean {
  const key = `${name}:${projectId ?? "no-project"}`;
  const seen = readSeen();
  if (seen.includes(key)) return false;
  writeSeen([...seen, key]);
  trackFinancialEvent(name, { ...payload, projectId });
  return true;
}
