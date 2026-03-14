import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Upload } from "lucide-react";

const STATUSES = ["Applied","Screened","Submitted","Interview","Offer","Hired","Closed"];
const AUTHS = ["US Citizen","Green Card","H1B","OPT","CPT","EAD","TN Visa","Other"];

export default function CandidateForm({ open, onClose, candidate, onSaved }) {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', location: '', skills: [],
    experience_years: '', work_authorization: '', notice_period: '',
    expected_salary: '', current_title: '', current_company: '',
    linkedin_url: '', notes: '', status: 'Applied', vendor_id: '', resume_url: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [vendors, setVendors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (candidate) {
      setForm({ ...form, ...candidate, skills: candidate.skills || [] });
    } else {
      setForm({ full_name:'',email:'',phone:'',location:'',skills:[],experience_years:'',work_authorization:'',notice_period:'',expected_salary:'',current_title:'',current_company:'',linkedin_url:'',notes:'',status:'Applied',vendor_id:'',resume_url:'' });
    }
  }, [candidate, open]);

  useEffect(() => {
    base44.entities.Vendor.list().then(setVendors);
  }, []);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm(f => ({ ...f, skills: [...f.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const removeSkill = (s) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    handleChange('resume_url', file_url);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      ...form,
      experience_years: form.experience_years ? Number(form.experience_years) : undefined,
      expected_salary: form.expected_salary ? Number(form.expected_salary) : undefined,
    };
    if (candidate?.id) {
      await base44.entities.Candidate.update(candidate.id, data);
    } else {
      await base44.entities.Candidate.create(data);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{candidate ? 'Edit Candidate' : 'New Candidate'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input value={form.full_name} onChange={(e) => handleChange('full_name', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => handleChange('location', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Current Title</Label>
            <Input value={form.current_title} onChange={(e) => handleChange('current_title', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Current Company</Label>
            <Input value={form.current_company} onChange={(e) => handleChange('current_company', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Experience (Years)</Label>
            <Input type="number" value={form.experience_years} onChange={(e) => handleChange('experience_years', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Expected Salary</Label>
            <Input type="number" value={form.expected_salary} onChange={(e) => handleChange('expected_salary', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Work Authorization</Label>
            <Select value={form.work_authorization} onValueChange={(v) => handleChange('work_authorization', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{AUTHS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Notice Period</Label>
            <Input value={form.notice_period} onChange={(e) => handleChange('notice_period', e.target.value)} placeholder="e.g. 2 weeks" />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Vendor</Label>
            <Select value={form.vendor_id} onValueChange={(v) => handleChange('vendor_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select vendor..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>LinkedIn URL</Label>
            <Input value={form.linkedin_url} onChange={(e) => handleChange('linkedin_url', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Resume</Label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-slate-50 text-sm">
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : form.resume_url ? 'Replace file' : 'Upload'}
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
              </label>
              {form.resume_url && <a href={form.resume_url} target="_blank" className="text-xs text-blue-600 underline">View</a>}
            </div>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Type skill and press Enter" />
              <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.skills.map(s => (
                <Badge key={s} variant="secondary" className="gap-1">
                  {s}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(s)} />
                </Badge>
              ))}
            </div>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={3} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.full_name || !form.email} className="bg-blue-600 hover:bg-blue-700">
            {saving ? 'Saving...' : candidate ? 'Update' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}