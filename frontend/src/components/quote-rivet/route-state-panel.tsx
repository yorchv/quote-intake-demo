import { AlertTriangle, CheckCircle2, Info, LoaderCircle, ShieldAlert } from 'lucide-react';

type RouteState = 'loading' | 'empty' | 'error' | 'blocked' | 'completed';

interface RouteStatePanelProps {
  state: RouteState;
  title: string;
  message: string;
}

const icons = {
  loading: LoaderCircle,
  empty: Info,
  error: AlertTriangle,
  blocked: ShieldAlert,
  completed: CheckCircle2
};

export function RouteStatePanel({ state, title, message }: RouteStatePanelProps) {
  const Icon = icons[state];
  return (
    <div className={`route-state route-state-${state}`} role={state === 'error' ? 'alert' : 'status'}>
      <Icon aria-hidden="true" size={19} />
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}
