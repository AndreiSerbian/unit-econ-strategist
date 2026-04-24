## Two micro-fixes for conference demo

### 1. Russian pluralization for payback period

**File:** `src/components/summary/CashFlowSummaryCard.tsx`

Add a small local helper above the component:

```ts
const pluralizePeriod = (n: number) => {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return "периодов";
  if (last === 1) return "период";
  if (last >= 2 && last <= 4) return "периода";
  return "периодов";
};
```

Replace line 81:
```ts
? `${summary!.paybackPeriod + 1} периодов`
```
with:
```ts
? `${summary!.paybackPeriod + 1} ${pluralizePeriod(summary!.paybackPeriod + 1)}`
```

Result: `1 период`, `2 периода`, `5 периодов`, `21 период`, `25 периодов`.

### 2. SubjectiveEstimateBadge in SWOTAnalysis

**File:** `src/components/SWOTAnalysis.tsx`

- Add import: `import { SubjectiveEstimateBadge } from "@/components/ui/subjective-estimate-badge";`
- Modify the `CardHeader` (lines 228–233) so the title row contains the badge:

```tsx
<CardHeader>
  <div className="flex items-center justify-between gap-2 flex-wrap">
    <CardTitle>SWOT Анализ</CardTitle>
    <SubjectiveEstimateBadge />
  </div>
  <CardDescription>
    Анализ сильных и слабых сторон, возможностей и угроз
  </CardDescription>
</CardHeader>
```

Badge appears at header level only — no changes to the four quadrant cards, no changes to internal calculated metrics.

### Constraints respected
- No DB migrations, no schema changes, no new features, no IA changes.
- Two files touched, ~10 lines total.
- Conference demo path `Моя компания → Показатели → Cash Flow → Итоги → Теория` remains intact (only the payback label inside Итоги improves; SWOT lives in a separate area).

### Post-implementation deliverables
1. Changed files list.
2. `tsc --noEmit` clean confirmation.
3. Confirmation that the demo path is still safe.