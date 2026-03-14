import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import SubmissionForm from '../components/submissions/SubmissionForm';
import PageGuard from '../components/shared/PageGuard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ['All', 'Submitted', 'Interview Scheduled', 'Offer', 'Placed', 'Rejected', 'Withdrawn'];

function SubmissionsContent({ readOnly }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => base44.entities.Submission.list('-created_date'),
  });

  const filtered = statusFilter === 'All' ? submissions : submissions.filter(s => s.status === statusFilter);

  const columns = [
    { key: 'candidate_name', label: 'Candidate', render: r => <span className="font-semibold text-slate-800">{r.candidate_name}</span> },
    { key: 'job_title', label: 'Job Title' },
    { key: 'client_name', label: 'Client' },
    { key: 'bill_rate', label: 'Bill Rate', render: r => <span>${r.bill_rate || 0}/hr</span> },
    { key: 'pay_rate', label: 'Pay Rate', render: r => <span>${r.pay_rate || 0}/hr</span> },
    { key: 'margin_percentage', label: 'Margin', render: r => {
      const m = r.margin_percentage || 0;
      const color = m < 5 ? 'text-red-600' : m < 10 ? 'text-orange-500' : 'text-emerald-600';
      return <span className={`font-bold ${color}`}>{m.toFixed(1)}%</span>;
    }},
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Submissions"
        subtitle={`${filtered.length} total`}
        actionLabel={readOnly ? null : "New Submission"}
        onAction={readOnly ? null : () => { setEditing(null); setShowForm(true); }}
      >
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </PageHeader>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        searchField="candidate_name"
        onRowClick={readOnly ? undefined : (row) => { setEditing(row); setShowForm(true); }}
      />

      {!readOnly && (
        <SubmissionForm
          open={showForm}
          onClose={() => setShowForm(false)}
          submission={editing}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['submissions'] }); }}
        />
      )}
    </div>
  );
}

export default function Submissions() {
  return (
    <PageGuard page="Submissions">
      {(readOnly) => <SubmissionsContent readOnly={readOnly} />}
    </PageGuard>
  );
}