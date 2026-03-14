import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function JobForm({ open, onClose, job, onSaved }) {
  const [form, setForm] = useState({
    title: '', client_id: '', client_name: '', location: '',
    work_type: 'Remote', bill_rate: '', required_skills: [],
    priority: 'Medium', status: 'Open'
  });
  const [clients, setClients] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (job) setForm({ ...form, ...job, required_skills: job.required_skills || [] });
    else setForm({ title:'',client_id:'',client_name:'',location:'',work_type:'Remote',bill_rate:'',required_skills:[],priority:'Medium',status:'Open' });
  }, [job, open]);

  useEffect(() => { base44.entities.Client.list().then(setClients); }, []);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleClientChange = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    setForm(f => ({ ...f, client_id: clientId, client_name: client?.company_name || '' }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.required_skills.includes(skillInput.trim())) {
      setForm(f => ({ ...f, required_skills: [...f.required_skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, bill_rate: form.bill_rate ? Number(form.bill_rate) : undefined };
    if (job?.id) await base44.entities.Job.update(job.id, data);
    else await base44.entities.Job.create(data);
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{job ? 'Edit Job' : 'New Job'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="col-span-2 space-y-1.5">
            <Label>Job Title *</Label>
            <Input value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Client *</Label>
            <Select value={form.client_id} onValueChange={handleClientChange}>
              <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
              <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => handleChange('location', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Work Type</Label>
            <Select value={form.work_type} onValueChange={(v) => handleChange('work_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="Onsite">Onsite</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Bill Rate ($/hr)</Label>
            <Input type="number" value={form.bill_rate} onChange={(e) => handleChange('bill_rate', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => handleChange('priority', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Required Skills</Label>
            <div className="flex gap-2">
              <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key==='Enter' && (e.preventDefault(), addSkill())} placeholder="Type skill and Enter" />
              <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.required_skills.map(s => (
                <Badge key={s} variant="secondary" className="gap-1">{s}<X className="h-3 w-3 cursor-pointer" onClick={() => setForm(f => ({...f, required_skills: f.required_skills.filter(x => x !== s)}))} /></Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.title || !form.client_id} className="bg-blue-600 hover:bg-blue-700">{saving ? 'Saving...' : job ? 'Update' : 'Create'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}