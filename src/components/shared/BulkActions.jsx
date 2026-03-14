import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Trash2, Mail, Tag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BulkActions({ selected, onExport, onDelete, onEmail, onUpdateStatus, statusOptions }) {
  return selected.length > 0 ? (
    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
      <span className="text-sm font-medium text-blue-900">{selected.length} selected</span>
      <div className="flex gap-1 ml-auto">
        {onExport && (
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => onExport(selected)}>
            <Download className="h-3 w-3" /> Export
          </Button>
        )}
        {onEmail && (
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => onEmail(selected)}>
            <Mail className="h-3 w-3" /> Email
          </Button>
        )}
        {onUpdateStatus && statusOptions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <Tag className="h-3 w-3" /> Update Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {statusOptions.map(status => (
                <DropdownMenuItem key={status} onClick={() => onUpdateStatus(selected, status)}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {onDelete && (
          <Button size="sm" variant="outline" className="h-8 gap-1 text-red-600 hover:text-red-700" onClick={() => onDelete(selected)}>
            <Trash2 className="h-3 w-3" /> Delete
          </Button>
        )}
      </div>
    </div>
  ) : null;
}

export function SelectableRow({ selected, onSelect, children }) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox checked={selected} onCheckedChange={onSelect} />
      <div className="flex-1">{children}</div>
    </div>
  );
}