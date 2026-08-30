import { Camera, FileCheck2, Ruler, StickyNote } from 'lucide-react';
import { RouteStatePanel } from './route-state-panel';

export interface EvidenceItem {
  id: string;
  kind: 'photo' | 'measurement' | 'note';
  label: string;
  status: string;
  version: number;
}

interface EvidenceRailProps {
  evidence: EvidenceItem[];
  errorMessage?: string;
}

const evidenceIcons = { photo: Camera, measurement: Ruler, note: StickyNote };

export function EvidenceRail({ evidence, errorMessage }: EvidenceRailProps) {
  return (
    <aside className="evidence-rail" data-experience-panel="evidence_rail_panel" aria-labelledby="evidence-title">
      <header><span className="rail-clip" aria-hidden="true" /><div><span className="eyebrow">Clipped to this request</span><h2 id="evidence-title">Evidence and field facts</h2></div><span className="evidence-count">{evidence.length}</span></header>
      {errorMessage ? <RouteStatePanel state="error" title="Evidence was not saved" message={errorMessage} /> : null}
      {!errorMessage && evidence.length === 0 ? <RouteStatePanel state="empty" title="No evidence retained yet" message="Add the current note, photo, or measurement before it supports a decision." /> : null}
      <div className="evidence-stack">
        {evidence.map((item) => {
          const Icon = evidenceIcons[item.kind];
          return <article className="evidence-slip" key={item.id}><Icon aria-hidden="true" size={19} /><div><strong>{item.label}</strong><span>Version {item.version} · {item.status}</span></div><FileCheck2 aria-label="Retained evidence" size={16} /></article>;
        })}
      </div>
    </aside>
  );
}
