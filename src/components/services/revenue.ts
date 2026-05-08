// FIN-008b — Single source of truth for service revenue.
// Used by Dashboard revenue bridge, Cash Flow services adapter, and
// ServicesProductCard so all three agree on the same number.

import type { ServiceProduct, BillingModel } from "./types";

export interface ServiceRevenueLikeInput {
  price?: number | null;
  quantity?: number | null;
  billingModel?: BillingModel;
  hourlyRate?: number | null;
  estimatedHoursPerProject?: number | null;
  plannedBillableHoursPerPeriod?: number | null;
  billablePercent?: number | null;
  retainerFee?: number | null;
  clientsCount?: number | null;
}

export function computeServiceRevenue(service: ServiceRevenueLikeInput): number {
  const qty = service.quantity ?? 0;
  const billing: BillingModel = service.billingModel ?? "fixed_project";

  switch (billing) {
    case "hourly": {
      const rate = service.hourlyRate ?? 0;
      const hoursPerProject = service.estimatedHoursPerProject ?? 0;
      const billable = (service.billablePercent ?? 100) / 100;
      // If user supplied an explicit planned hours-per-period bucket, prefer it
      // (mirrors ServicesProductCard logic).
      if (
        service.plannedBillableHoursPerPeriod &&
        service.plannedBillableHoursPerPeriod > 0
      ) {
        return rate * service.plannedBillableHoursPerPeriod;
      }
      return rate * hoursPerProject * qty * billable;
    }
    case "retainer": {
      const fee = service.retainerFee ?? 0;
      const clients = service.clientsCount ?? 0;
      return fee * clients;
    }
    case "fixed_project":
    default:
      return (service.price ?? 0) * qty;
  }
}

export function computeServicesTotalRevenue(services: ServiceProduct[] | any[]): number {
  return (services || []).reduce(
    (sum, s) => sum + computeServiceRevenue(s as ServiceRevenueLikeInput),
    0,
  );
}
