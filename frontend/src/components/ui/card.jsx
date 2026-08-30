import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ as: Component = 'article', className, ...props }) {
  return <Component className={cn('panel', className)} {...props} />;
}
