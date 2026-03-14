import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import InvoiceForm from '../components/invoices/InvoiceForm';
import PaymentDialog from '../components/invoices/PaymentDialog';
import PageGuard from '../components/shared/PageGuard';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { CreditCard } from 'lucide-react';

const STATUSES = ['All', 'Draft', 'Sent', 'Paid', 'Overdue'];

function InvoicesContent({ readOnly }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date'),
  });

  const filtered = statusFilter === 'All' ? invoices : invoices.filter(i => i.status === statusFilter);

  const columns = [
    { key: 'invoice_number', label: 'Invoice #', render: r => <span className="font-mono font-semibold text-slate-800">{r.invoice_number || '—'}</span> },
    { key: 'client_name', label: 'Client' },
    { key: 'candidate_name', label: 'Candidate' },
    { key: 'period_start', label: 'Period', render: r => r.period_start ? `${format(new Date(r.period_start), 'MMM d')} – ${r.period_end ? format(new Date(r.period_end), 'MMM d') : ''}` : '—' },
    { key: 'total_amount', label: 'Amount', render: r => <span className="font-semibold">${(r.total_amount || 0).toLocaleString()}</span> },
    { key: 'balance', label: 'Balance', render: r => <span className={r.balance > 0 ? 'text-red-600 font-medium' : 'text-emerald-600 font-medium'}>${(r.balance || 0).toLocaleString()}</span> },
    { key: 'due_date', label: 'Due', render: r => r.due_date ? format(new Date(r.due_date), 'MMM d, yyyy') : '—' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', render: r => !readOnly && r.status !== 'Paid' ? (
      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={e => { e.stopPropagation(); setPayingInvoice(r); }}>
        <CreditCard className="h-3 w-3" /> Pay
      </Button>
    ) : null },
  ];

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${filtered.length} total`}
        actionLabel={readOnly ? null : "New Invoice"}
        onAction={readOnly ? null : () => { setEditing(null); setShowForm(true); }}
      >
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </PageHeader>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        searchField="client_name"
        onRowClick={readOnly ? undefined : (row) => { setEditing(row); setShowForm(true); }}
      />

      {!readOnly && (
        <>
          <InvoiceForm
            open={showForm}
            onClose={() => setShowForm(false)}
            invoice={editing}
            onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['invoices'] }); }}
          />
          <PaymentDialog
            open={!!payingInvoice}
            onClose={() => setPayingInvoice(null)}
            invoice={payingInvoice}
            onSaved={() => { setPayingInvoice(null); queryClient.invalidateQueries({ queryKey: ['invoices'] }); }}
          />
        </>
      )}
    </div>
  );
}

export default function Invoices() {
  return (
    <PageGuard page="Invoices">
      {(readOnly) => <InvoicesContent readOnly={readOnly} />}
    </PageGuard>
  );
}