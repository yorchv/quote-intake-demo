import { Clock3, UserRound } from 'lucide-react';
import { ReadinessStitch, type ReadinessCriterion } from './readiness-stitch';
import { RouteStatePanel } from './route-state-panel';

export interface DecisionItem {
  actor: string;
  evidence: string;
  id: string;
  label: string;
  time: string;
  valid: boolean;
}

interface DecisionSeamProps {
  blockedMessage?: string;
  criteria: ReadinessCriterion[];
  decisions: DecisionItem[];
}

export function DecisionSeam({ blockedMessage, criteria, decisions }: DecisionSeamProps) {
  return (
    <aside className="decision-seam" data-experience-panel="decision_seam_panel" aria-labelledby="decision-title">
      <header><span className="eyebrow">Stitched decision trail</span><h2 id="decision-title">Decisions and readiness</h2><p>Each state names who decided, what evidence supports it, and whether it is still current.</p></header>
      {blockedMessage ? <RouteStatePanel state="blocked" title="Decision stopped" message={blockedMessage} /> : null}
      <ReadinessStitch criteria={criteria} />
      <div className="decision-timeline">
        {decisions.map((decision) => <article className="decision-event" key={decision.id}><span className="seam-node" aria-hidden="true" /><div><div className="decision-title-row"><strong>{decision.label}</strong><span>{decision.valid ? 'Current' : 'Superseded'}</span></div><p>{decision.evidence}</p><footer><span><UserRound aria-hidden="true" size={13} />{decision.actor}</span><span><Clock3 aria-hidden="true" size={13} />{decision.time}</span></footer></div></article>)}
        {decisions.length === 0 ? <RouteStatePanel state="empty" title="No decision recorded" message="Complete the request facts before recording the accountable qualification path." /> : null}
      </div>
    </aside>
  );
}
