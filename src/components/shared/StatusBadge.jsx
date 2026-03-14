import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  'Applied': 'bg-slate-100 text-slate-700 border-slate-200',
  'Screened': 'bg-blue-50 text-blue-700 border-blue-200',
  'Submitted': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Interview': 'bg-purple-50 text-purple-700 border-purple-200',
  'Interview Scheduled': 'bg-purple-50 text-purple-700 border-purple-200',
  'Offer': 'bg-amber-50 text-amber-700 border-amber-200',
  'Hired': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Placed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Closed': 'bg-gray-100 text-gray-600 border-gray-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
  'Withdrawn': 'bg-orange-50 text-orange-700 border-orange-200',
  'Open': 'bg-green-50 text-green-700 border-green-200',
  'On Hold': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Draft': 'bg-slate-100 text-slate-600 border-slate-200',
  'Sent': 'bg-blue-50 text-blue-700 border-blue-200',
  'Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Overdue': 'bg-red-50 text-red-700 border-red-200',
  'Pass': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Fail': 'bg-red-50 text-red-700 border-red-200',
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Low': 'bg-slate-100 text-slate-600',
  'Medium': 'bg-blue-50 text-blue-700',
  'High': 'bg-orange-50 text-orange-700',
  'Urgent': 'bg-red-50 text-red-700',
};

export default function StatusBadge({ status, className }) {
  const colors = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  return (
    <Badge variant="outline" className={cn("font-medium text-xs border", colors, className)}>
      {status}
    </Badge>
  );
}