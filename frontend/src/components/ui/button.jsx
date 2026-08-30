import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva('ui-button', {
  variants: {
    variant: {
      default: '',
      primary: 'primary',
      subtle: 'subtle',
      danger: 'danger'
    },
    state: {
      active: 'active',
      idle: ''
    }
  },
  defaultVariants: {
    variant: 'default',
    state: 'idle'
  }
});

export function Button({ className, variant, state, asChild = false, type = 'button', ...props }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp type={asChild ? undefined : type} className={cn(buttonVariants({ variant, state }), className)} {...props} />;
}
