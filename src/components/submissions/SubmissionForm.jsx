import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, TrendingUp, DollarSign } from "lucide-react";

const STATUSES = ["Submitted", "Interview Scheduled", "Offer", "Placed", "Rejected", "Withdrawn"];

function ConfirmCriticalMarginDialog({ open, onConfirm, onCancel, margin }) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Critical Margin Warning
          </DialogTitle>
        </DialogHeader>
        <div className="py-3">
          <p className="text-sm text-slate-700">
            The margin on this submission is <span className="font-bold text-red-600">{margin.toFixed(2)}%</span>, which is below the critical threshold of 5%.
          </p>
          <p className="text-sm text-slate-500 mt-2">Are you sure you want to save this submission with such a low margin?</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={onConfirm}>Save Anyway</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SubmissionForm({ open, onClose, submission, onSaved }) {
  const [form, setForm] = useState({
    candidate_id: '', candidate_name: '', job_id: '', job_title: '',
    client_id: '', client_name: '', bill_rate: '', pay_rate: '',
    margin_percentage: 0, status: 'Submitted'
  });
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showCriticalConfirm, setShowCriticalConfirm] = useState(false);

  useEffect(() => {
    if (submission) setForm({ ...form, ...submission });
    else setForm({ candidate_id: '', candidate_name: '', job_id: '', job_title: '', client_id: '', client_name: '', bill_rate: '', pay_rate: '', margin_percentage: 0, status: 'Submitted' });
  }, [submission, open]);

  useEffect(() => {
    base44.entities.Candidate.list().then(setCandidates);
    base44.entities.Job.list().then(setJobs);
  }, []);

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };
    if (field === 'bill_rate' || field === 'pay_rate') {
      const br = Number(field === 'bill_rate' ? value : updated.bill_rate) || 0;
      const pr = Number(field === 'pay_rate' ? value : updated.pay_rate) || 0;
      updated.margin_percentage = br > 0 ? Math.round(((br - pr) / br) * 10000) / 100 : 0;
    }
    setForm(updated);
  };

  const handleCandidateChange = (id) => {
    const c = candidates.find(x => x.id === id);
    setForm(f => ({ ...f, candidate_id: id, candidate_name: c?.full_name || '' }));
  };

  const handleJobChange = (id) => {
    const j = jobs.find(x => x.id === id);
    setForm(f => {
      const newBillRate = j?.bill_rate || f.bill_rate;
      const pr = Number(f.pay_rate) || 0;
      const br = Number(newBillRate) || 0;
      const margin = br > 0 ? Math.round(((br - pr) / br) * 10000) / 100 : 0;
      return { ...f, job_id: id, job_title: j?.title || '', client_id: j?.client_id || '', client_name: j?.client_name || '', bill_rate: newBillRate, margin_percentage: margin };
    });
  };

  const doSave = async () => {
    setSaving(true);
    const data = { ...form, bill_rate: Number(form.bill_rate) || 0, pay_rate: Number(form.pay_rate) || 0 };
    if (submission?.id) await base44.entities.Submission.update(submission.id, data);
    else await base44.entities.Submission.create(data);
    setSaving(false);
    setShowCriticalConfirm(false);
    onSaved();
  };

  const handleSave = () => {
    if (margin < 5 && margin >= 0) {
      setShowCriticalConfirm(true);
    } else {
      doSave();
    }
  };

  const br = Number(form.bill_rate) || 0;
  const pr = Number(form.pay_rate) || 0;
  const margin = br > 0 ? ((br - pr) / br) * 100 : 0;
  const grossProfitWeekly = (br - pr) * 40;

  const marginColor = margin < 5 ? 'text-red-600' : margin < 10 ? 'text-orange-500' : 'text-emerald-600';
  const marginBg = margin < 5 ? 'bg-red-50 border border-red-200' : margin < 10 ? 'bg-orange-50 border border-orange-200' : 'bg-emerald-50 border border-emerald-200';

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{submission ? 'Edit Submission' : 'New Submission'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-1.5">
              <Label>Candidate *</Label>
              <Select value={form.candidate_id} onValueChange={handleCandidateChange}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{candidates.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Job *</Label>
              <Select value={form.job_id} onValueChange={handleJobChange}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.title} — {j.client_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Bill Rate ($/hr)</Label>
              <Input type="number" value={form.bill_rate} onChange={(e) => handleChange('bill_rate', e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Pay Rate ($/hr)</Label>
              <Input type="number" value={form.pay_rate} onChange={(e) => handleChange('pay_rate', e.target.value)} placeholder="0.00" />
            </div>

            {/* Live Margin & GP Panel */}
            {br > 0 && (
              <div className={`col-span-2 rounded-lg p-3 ${marginBg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-4 w-4 ${marginColor}`} />
                    <span className="text-sm font-medium text-slate-700">Margin</span>
                  </div>
                  <span className={`text-xl font-bold ${marginColor}`}>{margin.toFixed(2)}%</span>
                </div>

                {margin < 5 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Critical Margin — confirmation required to save
                  </div>
                )}
                {margin >= 5 && margin < 10 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-orange-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Low Margin — consider negotiating rates
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">Gross Profit / Week <span className="text-xs text-slate-400">(40 hrs)</span></span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">${grossProfitWeekly.toFixed(0)}</span>
                </div>
              </div>
            )}

            <div className="col-span-2 space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.candidate_id || !form.job_id}
              className={margin < 5 && br > 0 ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
            >
              {saving ? 'Saving...' : submission ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmCriticalMarginDialog
        open={showCriticalConfirm}
        margin={margin}
        onConfirm={doSave}
        onCancel={() => setShowCriticalConfirm(false)}
      />
    </>
  );
}