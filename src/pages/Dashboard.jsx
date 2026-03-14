import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../components/shared/PageHeader';
import KPICard from '../components/shared/KPICard';
import PageGuard from '../components/shared/PageGuard';
import AdvancedMetrics from '../components/analytics/AdvancedMetrics';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Building2, Briefcase, Send, DollarSign, TrendingUp } from 'lucide-react';

function DashboardContent() {
  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => base44.entities.Candidate.list(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.list(),
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => base44.entities.Submission.list(),
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list(),
  });

  const openJobs = jobs.filter(j => j.status === 'Open').length;
  const activeSubmissions = submissions.filter(s => ['Submitted', 'Interview Scheduled', 'Offer'].includes(s.status)).length;
  const placements = submissions.filter(s => s.status === 'Placed').length;
  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (i.total_amount || 0), 0);
  const outstanding = invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + (i.balance || 0), 0);
  const avgMargin = submissions.length > 0 
    ? submissions.reduce((sum, s) => sum + (s.margin_percentage || 0), 0) / submissions.length 
    : 0;

  const statusData = ['Submitted', 'Interview Scheduled', 'Offer', 'Placed', 'Rejected'].map(status => ({
    status,
    count: submissions.filter(s => s.status === status).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="AI-powered staffing intelligence" />

      <AdvancedMetrics 
        candidates={candidates}
        submissions={submissions}
        jobs={jobs}
        invoices={invoices}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard title="Candidates" value={candidates.length} icon={Users} color="blue" />
        <KPICard title="Active Clients" value={clients.length} icon={Building2} color="emerald" />
        <KPICard title="Open Jobs" value={openJobs} icon={Briefcase} color="purple" />
        <KPICard title="Active Submissions" value={activeSubmissions} icon={Send} color="orange" />
        <KPICard title="Placements" value={placements} icon={TrendingUp} color="green" />
        <KPICard title="Revenue (Paid)" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Submission Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Finance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Revenue (Paid)</p>
              <p className="text-2xl font-bold text-emerald-600">${totalRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Outstanding Balance</p>
              <p className="text-2xl font-bold text-red-600">${outstanding.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Avg. Margin</p>
              <p className="text-2xl font-bold text-blue-600">{avgMargin.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <PageGuard page="Dashboard">
      <DashboardContent />
    </PageGuard>
  );
}