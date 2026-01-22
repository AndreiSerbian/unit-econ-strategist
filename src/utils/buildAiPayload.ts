/**
 * Build compact AI payload for narrative generation
 * Ensures payload stays under 1.5KB
 */

import type { AnalysisResult } from './metricAnalysis';

const MAX_MESSAGE_LENGTH = 100;
const MAX_INSIGHT_LENGTH = 80;
const MAX_ISSUES = 5;
const MAX_GAPS = 3;

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

export interface AiAnalysisPayload {
  businessType: string;
  summary: {
    totalChecks: number;
    okCount: number;
    warningCount: number;
    contradictionCount: number;
    missingCount: number;
  };
  topIssues: Array<{
    relationshipId: string;
    status: string;
    message: string;
  }>;
  competitorGaps: Array<{
    metric: string;
    gap: number;
    insight: string;
  }>;
  hypothesesCount: number;
}

export function buildAiPayload(analysisResult: AnalysisResult): AiAnalysisPayload {
  const topIssues = analysisResult.checks
    .filter(c => c.status !== 'ok')
    .slice(0, MAX_ISSUES)
    .map(c => ({
      relationshipId: c.relationshipId,
      status: c.status,
      message: truncate(c.message, MAX_MESSAGE_LENGTH)
    }));

  const competitorGaps = analysisResult.comparisons
    .filter(c => c.gap !== null && Math.abs(c.gap) > 20)
    .slice(0, MAX_GAPS)
    .map(c => ({
      metric: c.metricKey,
      gap: Math.round(c.gap!),
      insight: truncate(c.insight, MAX_INSIGHT_LENGTH)
    }));

  return {
    businessType: analysisResult.businessType,
    summary: analysisResult.summary,
    topIssues,
    competitorGaps,
    hypothesesCount: analysisResult.hypotheses.length
  };
}

export function buildAiPrompt(payload: AiAnalysisPayload): string {
  const issuesList = payload.topIssues.length > 0
    ? payload.topIssues.map(i => `• [${i.status}] ${i.message}`).join('\n')
    : '• Критических проблем не обнаружено';

  const gapsList = payload.competitorGaps.length > 0
    ? payload.competitorGaps.map(g => `• ${g.metric}: ${g.gap > 0 ? '+' : ''}${g.gap}% — ${g.insight}`).join('\n')
    : '• Нет значимых отклонений от конкурентов';

  return `Ты — стратегический аналитик. НЕ делай расчётов — они уже сделаны.

Тип бизнеса: ${payload.businessType}

Результаты проверок:
- Всего связок: ${payload.summary.totalChecks}
- В норме: ${payload.summary.okCount}
- Предупреждения: ${payload.summary.warningCount}
- Противоречия: ${payload.summary.contradictionCount}
- Нет данных: ${payload.summary.missingCount}

Топ-проблемы:
${issuesList}

Отставание от конкурентов:
${gapsList}

Задача:
1. Объясни ключевые риски простым языком (2-3 предложения)
2. Выдели главную возможность для роста
3. Укажи, что критично исправить первым

НЕ предлагай универсальные советы. Только конкретика по найденным проблемам.`;
}
