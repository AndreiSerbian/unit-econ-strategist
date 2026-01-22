/**
 * Adapter to map useProject data to analyzer format
 */

import type { Metrics, Competitor } from '@/hooks/useProject';
import type { BusinessType } from '@/config/businessTypeMetrics';
import { analyzeMetrics, type AnalysisResult } from './metricAnalysis';

export interface ProjectAnalysisInput {
  currentMetrics: Metrics;
  scenarioA?: Metrics;
  scenarioB?: Metrics;
  competitors: Competitor[];
  businessType: BusinessType;
}

export interface MultiScenarioAnalysis {
  current: AnalysisResult;
  scenarioA?: AnalysisResult;
  scenarioB?: AnalysisResult;
}

/**
 * Analyze current metrics and optionally scenarios
 */
export function analyzeProject(input: ProjectAnalysisInput): MultiScenarioAnalysis {
  const { currentMetrics, scenarioA, scenarioB, competitors, businessType } = input;
  
  const current = analyzeMetrics(currentMetrics, competitors, businessType);
  
  const result: MultiScenarioAnalysis = { current };
  
  if (scenarioA) {
    result.scenarioA = analyzeMetrics(scenarioA, competitors, businessType);
  }
  
  if (scenarioB) {
    result.scenarioB = analyzeMetrics(scenarioB, competitors, businessType);
  }
  
  return result;
}

/**
 * Get the most critical issues across all scenarios
 */
export function getMostCriticalIssues(analysis: MultiScenarioAnalysis): {
  scenario: 'current' | 'scenarioA' | 'scenarioB';
  issues: AnalysisResult['checks'];
}[] {
  const results: {
    scenario: 'current' | 'scenarioA' | 'scenarioB';
    issues: AnalysisResult['checks'];
  }[] = [];
  
  const currentCritical = analysis.current.checks.filter(c => c.status === 'contradiction');
  if (currentCritical.length > 0) {
    results.push({ scenario: 'current', issues: currentCritical });
  }
  
  if (analysis.scenarioA) {
    const aCritical = analysis.scenarioA.checks.filter(c => c.status === 'contradiction');
    if (aCritical.length > 0) {
      results.push({ scenario: 'scenarioA', issues: aCritical });
    }
  }
  
  if (analysis.scenarioB) {
    const bCritical = analysis.scenarioB.checks.filter(c => c.status === 'contradiction');
    if (bCritical.length > 0) {
      results.push({ scenario: 'scenarioB', issues: bCritical });
    }
  }
  
  return results;
}

/**
 * Aggregate missing data across scenarios
 */
export function getAggregateMissingData(analysis: MultiScenarioAnalysis): string[] {
  const missing = new Set<string>();
  
  const addMissing = (checks: AnalysisResult['checks']) => {
    for (const check of checks) {
      if (check.status === 'missing' && check.neededMetricsMissing) {
        for (const m of check.neededMetricsMissing) {
          missing.add(m);
        }
      }
    }
  };
  
  addMissing(analysis.current.checks);
  if (analysis.scenarioA) addMissing(analysis.scenarioA.checks);
  if (analysis.scenarioB) addMissing(analysis.scenarioB.checks);
  
  return Array.from(missing);
}
