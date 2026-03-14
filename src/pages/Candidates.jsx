import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import CandidateForm from '../components/candidates/CandidateForm';
import PageGuard from '../components/shared/PageGuard';
import BulkActions from '../components/shared/BulkActions';
import ExportDialog from '../components/shared/ExportDialog';
import AIAssistant from '../components/shared/AIAssistant';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['All', 'Applied', 'Screened', 'Submitted', 'Interview', 'Offer', 'Hired', 'Closed'];

function CandidatesContent({ readOnly }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [showExport, setShowExport] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => base44.entities.Candidate.list('-created_date'),
  });

  const filtered = statusFilter === 'All' ? candidates : candidates.filter(c => c.status === statusFilter);

  const handleBulkStatusUpdate = async (ids, status) => {
    try {
      await Promise.all(ids.map(id => {
        const candidate = candidates.find(c => c.id === id);
        return base44.entities.Candidate.update(id, { ...candidate, status });
      }));
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      setSelected([]);
      toast.success(`Updated ${ids.length} candidates`);
    } catch (error) {
      toast.error('Bulk update failed');
    }
  };

  const handleBulkEmail = async (ids) => {
    const emails = ids.map(id => candidates.find(c => c.id === id)?.email).filter(Boolean);
    toast.success(`Email draft opened for ${emails.length} candidates`);
    // In production, integrate with email service
  };

  const columns = [
    { key: 'full_name', label: 'Name', render: r => <span className="font-semibold text-slate-800">{r.full_name}</span> },
    { key: 'current_title', label: 'Title', render: r => <span className="text-slate-600">{r.current_title || '—'}</span> },
    { key: 'location', label: 'Location' },
    { key: 'experience_years', label: 'Exp', render: r => <span>{r.experience_years ? `${r.experience_years} yrs` : '—'}</span> },
    { key: 'skills', label: 'Skills', render: r => (
      <div className="flex flex-wrap gap-1">
        {(r.skills || []).slice(0, 3).map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
        {(r.skills || []).length > 3 && <Badge variant="outline" className="text-xs">+{r.skills.length - 3}</Badge>}
      </div>
    )},
    { key: 'work_authorization', label: 'Auth' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Candidates"
        subtitle={`${filtered.length} total`}
        actionLabel={readOnly ? null : "Add Candidate"}
        onAction={readOnly ? null : () => { setEditing(null); setShowForm(true); }}
      >
        <Button size="sm" variant="outline" onClick={() => setShowAI(!showAI)} className="gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" /> AI Assistant
        </Button>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </PageHeader>

      {showAI && (
        <div className="mb-4">
          <AIAssistant 
            context={{ candidates: filtered.slice(0, 10), jobs: [] }}
            onResult={(r) => toast.info('AI suggestion ready')}
          />
        </div>
      )}

      {!readOnly && (
        <div className="mb-4">
          <BulkActions
            selected={selected}
            onExport={() => setShowExport(true)}
            onEmail={handleBulkEmail}
            onUpdateStatus={handleBulkStatusUpdate}
            statusOptions={STATUSES.filter(s => s !== 'All')}
          />
        </div>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        searchField="full_name"
        onRowClick={readOnly ? undefined : (row) => { setEditing(row); setShowForm(true); }}
      />

      {!readOnly && (
        <>
          <CandidateForm
            open={showForm}
            onClose={() => setShowForm(false)}
            candidate={editing}
            onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['candidates'] }); }}
          />
          <ExportDialog
            open={showExport}
            onClose={() => setShowExport(false)}
            data={selected.map(id => candidates.find(c => c.id === id)).filter(Boolean)}
            filename="candidates_export"
          />
        </>
      )}
    </div>
  );
}

export default function Candidates() {
  return (
    <PageGuard page="Candidates">
      {(readOnly) => <CandidatesContent readOnly={readOnly} />}
    </PageGuard>
  );
}