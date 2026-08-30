import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, children, ...props }) {
  return (
    <DialogPortal>
      <DialogPrimitive.Overlay className="ui-dialog-overlay" />
      <DialogPrimitive.Content className={cn('ui-dialog-content', className)} {...props}>
        {children}
        <DialogPrimitive.Close className="ui-dialog-close" aria-label="Close"><X size={16} /></DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('ui-dialog-header', className)} {...props} />;
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
