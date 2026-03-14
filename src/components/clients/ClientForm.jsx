import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ClientForm({ open, onClose, client, onSaved }) {
  const [form, setForm] = useState({
    company_name: '', industry: '', contact_name: '', contact_email: '',
    phone: '', billing_terms: 'Net 30', notes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) setForm({ ...form, ...client });
    else setForm({ company_name:'',industry:'',contact_name:'',contact_email:'',phone:'',billing_terms:'Net 30',notes:'' });
  }, [client, open]);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    if (client?.id) await base44.entities.Client.update(client.id, form);
    else await base44.entities.Client.create(form);
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{client ? 'Edit Client' : 'New Client'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1.5">
            <Label>Company Name *</Label>
            <Input value={form.company_name} onChange={(e) => handleChange('company_name', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Industry</Label>
            <Input value={form.industry} onChange={(e) => handleChange('industry', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Contact Name</Label>
            <Input value={form.contact_name} onChange={(e) => handleChange('contact_name', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Contact Email</Label>
            <Input type="email" value={form.contact_email} onChange={(e) => handleChange('contact_email', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Billing Terms</Label>
            <Select value={form.billing_terms} onValueChange={(v) => handleChange('billing_terms', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Net 15">Net 15</SelectItem>
                <SelectItem value="Net 30">Net 30</SelectItem>
                <SelectItem value="Net 45">Net 45</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={3} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.company_name} className="bg-blue-600 hover:bg-blue-700">
            {saving ? 'Saving...' : client ? 'Update' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}