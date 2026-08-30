import { ArrowRight, LockKeyhole, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NextMoveDockProps {
  accountablePerson: string;
  blockedReason?: string;
  busy: boolean;
  commandLabel: string;
  onExecute: () => void;
  successMessage?: string;
}

export function NextMoveDock({ accountablePerson, blockedReason, busy, commandLabel, onExecute, successMessage }: NextMoveDockProps) {
  return (
    <section className="next-move-dock" data-experience-panel="next_move_dock_panel" aria-labelledby="next-move-title">
      <div className="dock-copy">
        <span className="eyebrow">One guarded next move</span>
        <h2 id="next-move-title">{commandLabel}</h2>
        {blockedReason ? <p className="dock-guard"><LockKeyhole aria-hidden="true" size={16} />{blockedReason}</p> : <p><UserRound aria-hidden="true" size={16} />After this step, {accountablePerson} owns the next review.</p>}
        {successMessage ? <p className="dock-success" role="status">{successMessage}</p> : null}
      </div>
      <Button variant="primary" disabled={Boolean(blockedReason) || busy} onClick={onExecute}>{busy ? 'Recording…' : commandLabel}<ArrowRight aria-hidden="true" size={18} /></Button>
    </section>
  );
}
