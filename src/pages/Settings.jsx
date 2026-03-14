import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '../components/shared/PageHeader';
import PageGuard from '../components/shared/PageGuard';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

function SettingsContent() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser);
    base44.entities.User.list().then(setUsers);
  }, []);

  const handleUpdateRole = async (userId, role) => {
    await base44.entities.User.update(userId, { role });
    base44.entities.User.list().then(setUsers);
    toast.success('Role updated');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Settings" subtitle="Manage users and system configuration" />

      <Card>
        <CardHeader><CardTitle className="text-base">User Management</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{u.full_name || u.email}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <Select value={u.role || 'recruiter'} onValueChange={(role) => handleUpdateRole(u.id, role)}>
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Settings() {
  return (
    <PageGuard page="Settings">
      <SettingsContent />
    </PageGuard>
  );
}