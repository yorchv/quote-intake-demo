import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Select({ className, options = [], value, onChange, onValueChange, placeholder = 'Select option', ...props }) {
  const handleValueChange = (next) => {
    onValueChange?.(next);
    onChange?.({ target: { value: next } });
  };
  return (
    <SelectPrimitive.Root value={value} onValueChange={handleValueChange} {...props}>
      <SelectPrimitive.Trigger className={cn('ui-input ui-select-trigger', className)} aria-label={placeholder}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild><ChevronDown size={16} /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="ui-select-content" position="popper">
          <SelectPrimitive.Viewport className="ui-select-viewport">
            {options.map((option) => {
              const item = typeof option === 'string' ? { value: option, label: option } : option;
              return (
                <SelectPrimitive.Item className="ui-select-item" key={item.value} value={item.value}>
                  <SelectPrimitive.ItemText>{item.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="ui-select-indicator"><Check size={14} /></SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              );
            })}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
