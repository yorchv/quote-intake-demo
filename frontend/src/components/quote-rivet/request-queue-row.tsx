import { ArrowRight, Clock3, FileText } from 'lucide-react';

interface RequestQueueRowProps {
  active: boolean;
  accountablePerson: string;
  requestId: string;
  source: string;
  stateLabel: string;
  waitingLabel: string;
  onOpen: () => void;
}

export function RequestQueueRow({ active, accountablePerson, requestId, source, stateLabel, waitingLabel, onOpen }: RequestQueueRowProps) {
  return (
    <button className={`request-queue-row${active ? ' is-active' : ''}`} onClick={onOpen} type="button">
      <FileText aria-hidden="true" size={18} />
      <span className="queue-request-id">{requestId}</span>
      <span><small>Source</small>{source}</span>
      <span><small>State</small>{stateLabel}</span>
      <span><small>Accountable</small>{accountablePerson}</span>
      <span className="queue-age"><Clock3 aria-hidden="true" size={14} />{waitingLabel}</span>
      <ArrowRight aria-hidden="true" size={18} />
    </button>
  );
}
