import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PaymentDialog({ open, onClose, invoice, onSaved }) {
  const [form, setForm] = useState({ amount: '', payment_date: new Date().toISOString().split('T')[0], method: 'ACH', notes: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const amount = Number(form.amount) || 0;
    await base44.entities.Payment.create({
      invoice_id: invoice.id,
      amount,
      payment_date: form.payment_date,
      method: form.method,
      notes: form.notes
    });
    
    const newPaid = (invoice.amount_paid || 0) + amount;
    const newBalance = (invoice.total_amount || 0) - newPaid;
    const newStatus = newBalance <= 0 ? 'Paid' : invoice.status;
    await base44.entities.Invoice.update(invoice.id, {
      amount_paid: newPaid,
      balance: newBalance,
      status: newStatus
    });
    
    setSaving(false);
    onSaved();
  };

  const balance = (invoice?.total_amount || 0) - (invoice?.amount_paid || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
        <div className="p-3 bg-slate-50 rounded-lg mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Invoice</span>
            <span className="font-semibold">{invoice?.invoice_number}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-500">Balance Due</span>
            <span className="font-bold text-red-600">${balance.toLocaleString()}</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Amount *</Label>
            <Input type="number" max={balance} value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={form.payment_date} onChange={(e) => setForm(f => ({ ...f, payment_date: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Method</Label>
            <Select value={form.method} onValueChange={(v) => setForm(f => ({ ...f, method: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACH">ACH</SelectItem>
                <SelectItem value="Wire">Wire</SelectItem>
                <SelectItem value="Check">Check</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Input value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.amount} className="bg-emerald-600 hover:bg-emerald-700">{saving ? 'Saving...' : 'Record Payment'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}