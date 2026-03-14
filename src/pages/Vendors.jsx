import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import VendorForm from '../components/vendors/VendorForm';
import PageGuard from '../components/shared/PageGuard';

function VendorsContent({ readOnly }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-created_date'),
  });

  const columns = [
    { key: 'name', label: 'Vendor Name', render: r => <span className="font-semibold text-slate-800">{r.name}</span> },
    { key: 'contact_email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'commission_percentage', label: 'Commission', render: r => <span>{r.commission_percentage != null ? `${r.commission_percentage}%` : '—'}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle={`${vendors.length} total`}
        actionLabel={readOnly ? null : "Add Vendor"}
        onAction={readOnly ? null : () => { setEditing(null); setShowForm(true); }}
      />

      <DataTable
        columns={columns}
        data={vendors}
        isLoading={isLoading}
        searchField="name"
        onRowClick={readOnly ? undefined : (row) => { setEditing(row); setShowForm(true); }}
      />

      {!readOnly && (
        <VendorForm
          open={showForm}
          onClose={() => setShowForm(false)}
          vendor={editing}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['vendors'] }); }}
        />
      )}
    </div>
  );
}

export default function Vendors() {
  return (
    <PageGuard page="Vendors">
      {(readOnly) => <VendorsContent readOnly={readOnly} />}
    </PageGuard>
  );
}