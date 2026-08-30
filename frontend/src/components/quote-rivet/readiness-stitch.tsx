import { AlertTriangle, CheckCircle2, CircleDashed, Link2 } from 'lucide-react';

export interface ReadinessCriterion {
  evidenceLabel: string;
  label: string;
  result: 'passed' | 'blocked' | 'not_reviewed';
  reviewer: string;
}

interface ReadinessStitchProps {
  criteria: ReadinessCriterion[];
}

const resultIcons = { passed: CheckCircle2, blocked: AlertTriangle, not_reviewed: CircleDashed };

export function ReadinessStitch({ criteria }: ReadinessStitchProps) {
  return (
    <div className="readiness-stitch" aria-label="Quote-readiness criteria">
      {criteria.map((criterion) => {
        const Icon = resultIcons[criterion.result];
        const resultLabel = criterion.result === 'not_reviewed' ? 'Not reviewed' : criterion.result === 'passed' ? 'Passed' : 'Blocked';
        return <div className={`criterion criterion-${criterion.result}`} key={criterion.label}><span className="criterion-node"><Icon aria-hidden="true" size={17} /></span><div><strong>{criterion.label}</strong><span><Link2 aria-hidden="true" size={13} />{criterion.evidenceLabel}</span></div><div className="criterion-result"><b>{resultLabel}</b><small>{criterion.reviewer}</small></div></div>;
      })}
    </div>
  );
}
