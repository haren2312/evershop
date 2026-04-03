import { Badge } from '@components/common/ui/Badge.js';
import { TableCell } from '@components/common/ui/Table.js';
import React from 'react';

export interface StatusProps {
  status: number;
}
export function Status({ status }: StatusProps) {
  return (
    <TableCell>
      <div>
        {status === 0 && <Badge variant="destructive">Inactive</Badge>}
        {status === 1 && <Badge variant="success">Active</Badge>}
      </div>
    </TableCell>
  );
}
