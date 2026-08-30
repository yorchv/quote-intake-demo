import { FileLock2, Link2, UserCheck } from 'lucide-react';

interface HandoffReceiptProps {
  evidenceRefs: string[];
  packageVersion: number;
  recipient: string;
  status: string;
}

export function HandoffReceipt({ evidenceRefs, packageVersion, recipient, status }: HandoffReceiptProps) {
  return (
    <section className="handoff-receipt" aria-labelledby="handoff-title">
      <header><FileLock2 aria-hidden="true" size={21} /><div><span className="eyebrow">Immutable receipt</span><h3 id="handoff-title">Handoff package, version {packageVersion}</h3></div><span className="state-label">{status}</span></header>
      <div className="receipt-grid"><span><UserCheck aria-hidden="true" size={16} /><small>Recipient</small><strong>{recipient}</strong></span><span><Link2 aria-hidden="true" size={16} /><small>Evidence references</small><strong>{evidenceRefs.length}</strong></span></div>
      <p>A quote-ready package records transfer and receipt only. It does not mean a quote was issued or accepted.</p>
    </section>
  );
}
