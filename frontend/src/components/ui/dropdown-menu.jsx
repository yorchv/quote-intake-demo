import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export function DropdownMenuContent({ className, ...props }) {
  return <DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content className={cn('ui-dropdown-content', className)} sideOffset={6} {...props} /></DropdownMenuPrimitive.Portal>;
}

export function DropdownMenuItem({ className, ...props }) {
  return <DropdownMenuPrimitive.Item className={cn('ui-dropdown-item', className)} {...props} />;
}

export function DropdownMenuCheckboxItem({ className, children, checked, ...props }) {
  return <DropdownMenuPrimitive.CheckboxItem className={cn('ui-dropdown-item', className)} checked={checked} {...props}><span className="ui-dropdown-check">{checked && <Check size={14} />}</span>{children}</DropdownMenuPrimitive.CheckboxItem>;
}

export function DropdownMenuSubTrigger({ className, children, ...props }) {
  return <DropdownMenuPrimitive.SubTrigger className={cn('ui-dropdown-item', className)} {...props}>{children}<ChevronRight size={14} /></DropdownMenuPrimitive.SubTrigger>;
}

export function DropdownMenuSubContent({ className, ...props }) {
  return <DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.SubContent className={cn('ui-dropdown-content', className)} {...props} /></DropdownMenuPrimitive.Portal>;
}

export const DropdownMenuSeparator = (props) => <DropdownMenuPrimitive.Separator className="ui-dropdown-separator" {...props} />;
export const DropdownMenuLabel = (props) => <DropdownMenuPrimitive.Label className="ui-dropdown-label" {...props} />;
