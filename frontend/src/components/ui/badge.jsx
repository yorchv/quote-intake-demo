import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('pill', {
  variants: {
    tone: {
      default: '',
      blocked: 'blocked',
      review: 'review',
      ready: 'ready',
      active: 'active',
      completed: 'completed',
      open: 'open'
    }
  },
  defaultVariants: {
    tone: 'default'
  }
});

export function Badge({ className, tone = 'default', ...props }) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
