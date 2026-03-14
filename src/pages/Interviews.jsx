import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import InterviewForm from '../components/interviews/InterviewForm';
import PageGuard from '../components/shared/PageGuard';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RESULTS = ['All', 'Pending', 'Pass', 'Fail', 'On Hold'];

function InterviewsContent({ readOnly }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('All');
  const queryClient = useQueryClient();

  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => base44.entities.Interview.list('-scheduled_date'),
  });

  const filtered = filter === 'All' ? interviews : interviews.filter(i => i.result === filter);

  const columns = [
    { key: 'candidate_name', label: 'Candidate', render: r => <span className="font-semibold text-slate-800">{r.candidate_name}</span> },
    { key: 'client_name', label: 'Client' },
    { key: 'job_title', label: 'Job Title' },
    { key: 'round_number', label: 'Round', render: r => <span>Round {r.round_number || 1}</span> },
    { key: 'mode', label: 'Mode' },
    { key: 'scheduled_date', label: 'Scheduled', render: r => r.scheduled_date ? format(new Date(r.scheduled_date), 'MMM d, yyyy h:mm a') : '—' },
    { key: 'interviewer_name', label: 'Interviewer' },
    { key: 'result', label: 'Result', render: r => <StatusBadge status={r.result} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Interviews"
        subtitle={`${filtered.length} total`}
        actionLabel={readOnly ? null : "Schedule Interview"}
        onAction={readOnly ? null : () => { setEditing(null); setShowForm(true); }}
      >
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>{RESULTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
        <InterviewForm
          open={showForm}
          onClose={() => setShowForm(false)}
          interview={editing}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['interviews'] }); }}
        />
      )}
    </div>
  );
}

export default function Interviews() {
  return (
    <PageGuard page="Interviews">
      {(readOnly) => <InterviewsContent readOnly={readOnly} />}
    </PageGuard>
  );
}