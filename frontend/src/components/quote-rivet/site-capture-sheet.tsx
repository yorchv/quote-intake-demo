import { ClipboardPen, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SiteCaptureSheetProps {
  disabled: boolean;
  note: string;
  onChange: (value: string) => void;
  onSaveEvidence: () => void;
}

export function SiteCaptureSheet({ disabled, note, onChange, onSaveEvidence }: SiteCaptureSheetProps) {
  return (
    <section className="site-capture-sheet" aria-labelledby="site-capture-title">
      <div><span className="eyebrow"><MapPin aria-hidden="true" size={14} />Current field record</span><h3 id="site-capture-title">Add a scope note</h3><p>Record only what was observed or supplied. Name any limit or unanswered question.</p></div>
      <Field label="Observation or measurement"><Textarea value={note} onChange={(event) => onChange(event.target.value)} placeholder="Example: access point, measured dimension, visible condition, or unresolved question" /></Field>
      <Button variant="primary" disabled={disabled || note.trim().length < 8} onClick={onSaveEvidence}><ClipboardPen aria-hidden="true" size={17} />Save evidence note</Button>
    </section>
  );
}
