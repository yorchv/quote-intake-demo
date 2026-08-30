import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export function Field({ label, children, className }) {
  return <Label className={cn('field', className)}>{label}{children}</Label>;
}

export function Input({ className, ...props }) {
  return <input className={cn('ui-input', className)} {...props} />;
}
