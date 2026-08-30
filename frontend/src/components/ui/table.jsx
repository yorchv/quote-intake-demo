import * as React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, ...props }) {
  return <div className="ui-table-wrap"><table className={cn('ui-table', className)} {...props} /></div>;
}

export const TableHeader = ({ className, ...props }) => <thead className={cn('ui-table-header', className)} {...props} />;
export const TableBody = ({ className, ...props }) => <tbody className={cn('ui-table-body', className)} {...props} />;
export const TableFooter = ({ className, ...props }) => <tfoot className={cn('ui-table-footer', className)} {...props} />;
export const TableRow = ({ className, ...props }) => <tr className={cn('ui-table-row', className)} {...props} />;
export const TableHead = ({ className, ...props }) => <th className={cn('ui-table-head', className)} {...props} />;
export const TableCell = ({ className, ...props }) => <td className={cn('ui-table-cell', className)} {...props} />;
export const TableCaption = ({ className, ...props }) => <caption className={cn('ui-table-caption', className)} {...props} />;
