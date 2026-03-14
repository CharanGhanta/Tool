import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import JobForm from '../components/jobs/JobForm';
import PageGuard from '../components/shared/PageGuard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const STATUSES = ['All', 'Open', 'Closed', 'On Hold'];

function JobsContent({ readOnly }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.list('-created_date'),
  });

  const filtered = statusFilter === 'All' ? jobs : jobs.filter(j => j.status === statusFilter);

  const columns = [
    { key: 'title', label: 'Job Title', render: r => <span className="font-semibold text-slate-800">{r.title}</span> },
    { key: 'client_name', label: 'Client' },
    { key: 'location', label: 'Location' },
    { key: 'work_type', label: 'Work Type' },
    { key: 'bill_rate', label: 'Bill Rate', render: r => <span>${r.bill_rate || 0}/hr</span> },
    { key: 'required_skills', label: 'Skills', render: r => (
      <div className="flex flex-wrap gap-1">
        {(r.required_skills || []).slice(0, 3).map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
      </div>
    )},
    { key: 'priority', label: 'Priority', render: r => <StatusBadge status={r.priority} /> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Jobs"
        subtitle={`${filtered.length} open positions`}
        actionLabel={readOnly ? null : "Add Job"}
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
        searchField="title"
        onRowClick={readOnly ? undefined : (row) => { setEditing(row); setShowForm(true); }}
      />

      {!readOnly && (
        <JobForm
          open={showForm}
          onClose={() => setShowForm(false)}
          job={editing}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['jobs'] }); }}
        />
      )}
    </div>
  );
}

export default function Jobs() {
  return (
    <PageGuard page="Jobs">
      {(readOnly) => <JobsContent readOnly={readOnly} />}
    </PageGuard>
  );
}