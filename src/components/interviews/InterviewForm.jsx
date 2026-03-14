import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function InterviewForm({ open, onClose, interview, onSaved }) {
  const [form, setForm] = useState({
    submission_id: '', candidate_name: '', client_name: '', job_title: '',
    round_number: 1, scheduled_date: '', mode: 'Video',
    interviewer_name: '', feedback_notes: '', result: 'Pending'
  });
  const [submissions, setSubmissions] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (interview) setForm({ ...form, ...interview, scheduled_date: interview.scheduled_date ? interview.scheduled_date.slice(0, 16) : '' });
    else setForm({ submission_id:'',candidate_name:'',client_name:'',job_title:'',round_number:1,scheduled_date:'',mode:'Video',interviewer_name:'',feedback_notes:'',result:'Pending' });
  }, [interview, open]);

  useEffect(() => { base44.entities.Submission.list().then(setSubmissions); }, []);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmissionChange = (id) => {
    const s = submissions.find(x => x.id === id);
    setForm(f => ({ ...f, submission_id: id, candidate_name: s?.candidate_name || '', client_name: s?.client_name || '', job_title: s?.job_title || '' }));
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, round_number: Number(form.round_number) };
    if (interview?.id) await base44.entities.Interview.update(interview.id, data);
    else await base44.entities.Interview.create(data);
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{interview ? 'Edit Interview' : 'Schedule Interview'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="col-span-2 space-y-1.5">
            <Label>Submission *</Label>
            <Select value={form.submission_id} onValueChange={handleSubmissionChange}>
              <SelectTrigger><SelectValue placeholder="Select submission..." /></SelectTrigger>
              <SelectContent>{submissions.map(s => <SelectItem key={s.id} value={s.id}>{s.candidate_name} — {s.job_title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Round #</Label>
            <Input type="number" min="1" value={form.round_number} onChange={(e) => handleChange('round_number', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Mode</Label>
            <Select value={form.mode} onValueChange={(v) => handleChange('mode', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Phone">Phone</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
                <SelectItem value="Onsite">Onsite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Date & Time *</Label>
            <Input type="datetime-local" value={form.scheduled_date} onChange={(e) => handleChange('scheduled_date', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Interviewer</Label>
            <Input value={form.interviewer_name} onChange={(e) => handleChange('interviewer_name', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Result</Label>
            <Select value={form.result} onValueChange={(v) => handleChange('result', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Pass">Pass</SelectItem>
                <SelectItem value="Fail">Fail</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Feedback Notes</Label>
            <Textarea value={form.feedback_notes} onChange={(e) => handleChange('feedback_notes', e.target.value)} rows={3} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.submission_id || !form.scheduled_date} className="bg-blue-600 hover:bg-blue-700">{saving ? 'Saving...' : interview ? 'Update' : 'Schedule'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}