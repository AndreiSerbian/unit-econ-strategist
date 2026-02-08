/**
 * Validation utilities for metrics and form inputs
 * Provides guardrails against silent wrong data
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  severity?: 'error' | 'warning' | 'info';
}

// ============================================================
// PERCENT FIELD VALIDATION
// ============================================================

export function validatePercent(value: number | null | undefined, fieldName: string): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: true }; // Null is allowed for optional fields
  }
  
  if (value < 0) {
    return { 
      isValid: false, 
      message: `${fieldName}: значение не может быть отрицательным`,
      severity: 'error'
    };
  }
  
  if (value > 100) {
    return { 
      isValid: false, 
      message: `${fieldName}: значение не может превышать 100%`,
      severity: 'error'
    };
  }
  
  return { isValid: true };
}

// ============================================================
// NON-NEGATIVE FIELD VALIDATION
// ============================================================

export function validateNonNegative(value: number | null | undefined, fieldName: string): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: true };
  }
  
  if (value < 0) {
    return { 
      isValid: false, 
      message: `${fieldName}: значение не может быть отрицательным`,
      severity: 'error'
    };
  }
  
  return { isValid: true };
}

// ============================================================
// BUSINESS RULE VALIDATIONS
// ============================================================

/**
 * Check if channel share percentages sum to more than 100%
 */
export function validateChannelShareSum(shares: number[]): ValidationResult {
  const total = shares.reduce((sum, s) => sum + (s || 0), 0);
  
  if (total > 100) {
    return {
      isValid: false,
      message: `Сумма долей каналов (${total.toFixed(1)}%) превышает 100%`,
      severity: 'warning'
    };
  }
  
  return { isValid: true };
}

/**
 * Check GMV override mismatch
 */
export function validateGmvMismatch(
  gmvOverride: number | null | undefined,
  gmvComputed: number,
  thresholdPercent: number = 10
): ValidationResult {
  if (!gmvOverride || gmvComputed === 0) {
    return { isValid: true };
  }
  
  const mismatchPercent = Math.abs(gmvOverride - gmvComputed) / gmvComputed * 100;
  
  if (mismatchPercent > thresholdPercent) {
    return {
      isValid: false,
      message: `GMV отличается от расчётного на ${mismatchPercent.toFixed(1)}%`,
      severity: 'warning'
    };
  }
  
  return { isValid: true };
}

/**
 * Check services capacity/overload
 */
export function validateServicesCapacity(
  projectsCount: number,
  hoursPerWeek: number,
  weeksInPeriod: number,
  billablePercent: number,
  allocationPercent: number,
  estimatedHoursPerProject: number
): ValidationResult {
  if (estimatedHoursPerProject === 0) {
    return { isValid: true }; // Can't calculate capacity
  }
  
  const availableHours = hoursPerWeek * weeksInPeriod * (allocationPercent / 100);
  const billableHours = availableHours * (billablePercent / 100);
  const capacityProjects = billableHours / estimatedHoursPerProject;
  
  if (projectsCount > capacityProjects) {
    return {
      isValid: false,
      message: `Перегрузка: ${projectsCount} проектов > ёмкость ${capacityProjects.toFixed(1)}`,
      severity: 'warning'
    };
  }
  
  return { isValid: true };
}

/**
 * Check SaaS churn vs lifetime consistency
 */
export function validateChurnLifetimeConsistency(
  churnRatePercent: number | null | undefined,
  customerLifetimeMonths: number | null | undefined
): ValidationResult {
  if (!churnRatePercent || !customerLifetimeMonths || churnRatePercent === 0) {
    return { isValid: true };
  }
  
  const expectedLifetime = 100 / churnRatePercent;
  const diff = Math.abs(expectedLifetime - customerLifetimeMonths) / expectedLifetime;
  
  if (diff > 0.3) {
    return {
      isValid: false,
      message: `Churn ${churnRatePercent}% → ожидаемый lifetime ~${expectedLifetime.toFixed(0)} мес, указано ${customerLifetimeMonths}`,
      severity: 'warning'
    };
  }
  
  return { isValid: true };
}

/**
 * Check profit margin is positive
 */
export function validateProfitMargin(
  revenue: number,
  totalCosts: number
): ValidationResult {
  if (revenue === 0) {
    return { isValid: true };
  }
  
  const profit = revenue - totalCosts;
  const margin = (profit / revenue) * 100;
  
  if (margin < 0) {
    return {
      isValid: false,
      message: `Отрицательная маржа (${margin.toFixed(1)}%) — убыточная модель`,
      severity: 'error'
    };
  }
  
  if (margin < 5) {
    return {
      isValid: true,
      message: `Низкая маржа (${margin.toFixed(1)}%) — риск убыточности`,
      severity: 'warning'
    };
  }
  
  return { isValid: true };
}

/**
 * Check free plan has zero price
 */
export function validateFreePlanPrice(
  isFreePlan: boolean,
  price: number
): ValidationResult {
  if (isFreePlan && price > 0) {
    return {
      isValid: false,
      message: 'Бесплатный план не может иметь цену > 0',
      severity: 'error'
    };
  }
  
  return { isValid: true };
}

// ============================================================
// AGGREGATE VALIDATION
// ============================================================

export interface FieldValidation {
  field: string;
  value: number | null | undefined;
  type: 'percent' | 'non_negative' | 'positive';
}

export function validateFields(fields: FieldValidation[]): ValidationResult[] {
  return fields.map(({ field, value, type }) => {
    switch (type) {
      case 'percent':
        return validatePercent(value, field);
      case 'non_negative':
        return validateNonNegative(value, field);
      case 'positive':
        if (value !== null && value !== undefined && value <= 0) {
          return { isValid: false, message: `${field}: должно быть положительным`, severity: 'error' as const };
        }
        return { isValid: true };
      default:
        return { isValid: true };
    }
  });
}

// ============================================================
// SAFE DIVISION
// ============================================================

export function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
  if (denominator === 0) {
    return fallback;
  }
  return numerator / denominator;
}

export function safeDivideWithReason(
  numerator: number, 
  denominator: number
): { value: number | null; reason?: string } {
  if (denominator === 0) {
    return { value: null, reason: 'Деление на ноль' };
  }
  return { value: numerator / denominator };
}
