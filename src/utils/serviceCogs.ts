// Service COGS contract (FIN-005 / FIN-006)
// -----------------------------------------------------------------------------
// This module formalises how a service's direct cost should be derived.
// It does NOT yet rewrite existing flows — it only provides a single helper
// that callers can opt into and a clear data shape so the next pass can
// migrate ServicesProductCard / servicesAdapter without ambiguity.
//
// Two modes are supported:
//   - "manual"  — user-typed `cost` per project (current behaviour everywhere).
//   - "hourly"  — derived from estimatedHoursPerProject × loadedHourlyCost.
//
// Salary double-counting risk:
//   When mode === "hourly", the staff salary that produced loadedHourlyCost
//   should be netted out of fixedCosts.salary*. This module exposes
//   `getSalaryDoubleCountWarning` which the UI / audit can surface, but it
//   never silently mutates fixed costs.

export type ServiceCostMode = 'manual' | 'hourly';

export interface ServiceCogsInput {
  costMode?: ServiceCostMode;
  manualCostPerProject?: number | null;
  estimatedHoursPerProject?: number | null;
  /** Fully loaded labour rate (salary + taxes + overhead allocation). */
  loadedHourlyCost?: number | null;
  subcontractorCostPerProject?: number | null;
  projectMaterialsPerProject?: number | null;
  projectLogisticsPerProject?: number | null;
  quantity: number;
}

export interface ServiceCogsResult {
  costPerProject: number;
  totalCost: number;
  modeUsed: ServiceCostMode;
  warnings: string[];
}

export function calculateServiceCogs(input: ServiceCogsInput): ServiceCogsResult {
  const warnings: string[] = [];
  const mode: ServiceCostMode = input.costMode ?? 'manual';

  let costPerProject = 0;

  if (mode === 'hourly') {
    const hours = input.estimatedHoursPerProject ?? 0;
    const rate = input.loadedHourlyCost ?? 0;
    if (hours <= 0 || rate <= 0) {
      warnings.push(
        'Service in "hourly" cost mode but estimatedHoursPerProject or loadedHourlyCost is missing.',
      );
    }
    costPerProject =
      hours * rate +
      (input.subcontractorCostPerProject ?? 0) +
      (input.projectMaterialsPerProject ?? 0) +
      (input.projectLogisticsPerProject ?? 0);
  } else {
    costPerProject = input.manualCostPerProject ?? 0;
  }

  return {
    costPerProject,
    totalCost: costPerProject * (input.quantity || 0),
    modeUsed: mode,
    warnings,
  };
}

/**
 * Heuristic salary double-count check.
 * Returns a warning string when the user has both:
 *   - a service whose direct labour appears inside `manualCostPerProject` /
 *     hourly-derived COGS, and
 *   - non-zero `productionSalary` / service-related salary buckets at the
 *     company level.
 *
 * The caller decides whether to surface this in the UI; this helper does
 * not mutate fixed-cost aggregates.
 */
export function getSalaryDoubleCountWarning(opts: {
  hasServiceDirectLabour: boolean;
  productionSalary: number;
  managementSalary: number;
}): string | null {
  if (!opts.hasServiceDirectLabour) return null;
  if (opts.productionSalary > 0) {
    return 'Direct service labour may be counted both in service COGS and in fixedCosts.productionSalary.';
  }
  return null;
}
