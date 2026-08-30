import * as React from 'react';
import { FormProvider, useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export function Form({ form, className, children, ...props }) {
  const node = <form className={cn('ui-form', className)} {...props}>{children}</form>;
  return form ? <FormProvider {...form}>{node}</FormProvider> : node;
}

export const HookFormProvider = FormProvider;

export function FormItem({ className, ...props }) {
  return <div className={cn('form-item', className)} {...props} />;
}

export function FormLabel({ className, ...props }) {
  return <Label className={className} {...props} />;
}

export function FormControl({ className, ...props }) {
  return <div className={cn('form-control', className)} {...props} />;
}

export function FormDescription({ className, ...props }) {
  return <p className={cn('form-description', className)} {...props} />;
}

export function FormMessage({ className, name, children, ...props }) {
  const context = useFormContext();
  const message = name ? context?.formState?.errors?.[name]?.message : undefined;
  if (!message && !children) return null;
  return <p className={cn('form-message', className)} {...props}>{children || String(message)}</p>;
}
