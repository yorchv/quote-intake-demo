import { FileText, Link2, Save, UserRound } from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface RequestDraft {
  contact_name: string;
  contact_email: string;
  service_location: string;
  requested_work: string;
  source_channel: string;
}

interface RequestSpineProps {
  accountablePerson: string;
  draft: RequestDraft;
  missingFacts: string[];
  onChange: (field: keyof RequestDraft, value: string) => void;
  onSave: () => void;
  requestId: string;
  revision: number;
  saveState: 'idle' | 'saving' | 'saved' | 'error';
  stateLabel: string;
}

export function RequestSpine({ accountablePerson, draft, missingFacts, onChange, onSave, requestId, revision, saveState, stateLabel }: RequestSpineProps) {
  const saveLabel = saveState === 'saving' ? 'Saving' : saveState === 'saved' ? `Saved, revision ${revision}` : saveState === 'error' ? 'Save failed' : `Revision ${revision}`;
  return (
    <section className="request-spine" data-experience-panel="request_spine_panel" aria-labelledby="request-spine-title">
      <span className="spine-line" aria-hidden="true" />
      <header className="spine-header">
        <div className="folio"><FileText aria-hidden="true" size={18} />Request {requestId}</div>
        <span className="state-label">{stateLabel}</span>
      </header>
      <div className="spine-intro">
        <div><span className="eyebrow">Retained source</span><strong><Link2 aria-hidden="true" size={16} />{draft.source_channel || 'Not recorded'}</strong></div>
        <div><span className="eyebrow">Accountable person</span><strong><UserRound aria-hidden="true" size={16} />{accountablePerson}</strong></div>
      </div>
      <div className="spine-edit-header">
        <div><h2 id="request-spine-title">Source request</h2><p>Correct the saved facts without losing the original request or its history.</p></div>
        <span className={`save-state save-state-${saveState}`}><Save aria-hidden="true" size={15} />{saveLabel}</span>
      </div>
      <div className="request-fields">
        <Field label="Requester name"><Input value={draft.contact_name} onBlur={onSave} onChange={(event) => onChange('contact_name', event.target.value)} /></Field>
        <Field label="Requester email"><Input type="email" value={draft.contact_email} onBlur={onSave} onChange={(event) => onChange('contact_email', event.target.value)} /></Field>
        <Field label="Service address"><Input value={draft.service_location} onBlur={onSave} onChange={(event) => onChange('service_location', event.target.value)} /></Field>
        <Field label="Request source"><Input value={draft.source_channel} onBlur={onSave} onChange={(event) => onChange('source_channel', event.target.value)} /></Field>
        <Field className="request-work-field" label="Requested work"><Textarea value={draft.requested_work} onBlur={onSave} onChange={(event) => onChange('requested_work', event.target.value)} /></Field>
      </div>
      <div className="missing-facts" aria-live="polite">
        <strong>{missingFacts.length ? `${missingFacts.length} details still needed` : 'Minimum request details complete'}</strong>
        {missingFacts.length ? <ul>{missingFacts.map((fact) => <li key={fact}>{fact}</li>)}</ul> : <p>The source, contact, location, and requested work are ready for review.</p>}
      </div>
    </section>
  );
}
