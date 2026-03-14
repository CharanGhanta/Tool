import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../components/shared/PageHeader';
import PageGuard from '../components/shared/PageGuard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function ReportsContent() {
  const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => base44.entities.Invoice.list() });
  const { data: submissions = [] } = useQuery({ queryKey: ['submissions'], queryFn: () => base44.entities.Submission.list() });
  const { data: candidates = [] } = useQuery({ queryKey: ['candidates'], queryFn: () => base44.entities.Candidate.list() });

  // Monthly revenue last 6 months
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const revenue = invoices
      .filter(inv => inv.status === 'Paid' && inv.created_date && new Date(inv.created_date) >= start && new Date(inv.created_date) <= end)
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    return { month: format(date, 'MMM'), revenue };
  });

  // Submission status breakdown
  const statusCounts = submissions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Pipeline funnel
  const totalCandidates = candidates.length;
  const totalSubmissions = submissions.length;
  const interviews = submissions.filter(s => s.status === 'Interview Scheduled').length;
  const offers = submissions.filter(s => s.status === 'Offer').length;
  const placed = submissions.filter(s => s.status === 'Placed').length;

  const funnelData = [
    { stage: 'Candidates', count: totalCandidates },
    { stage: 'Submitted', count: totalSubmissions },
    { stage: 'Interviews', count: interviews },
    { stage: 'Offers', count: offers },
    { stage: 'Placed', count: placed },
  ];

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (i.total_amount || 0), 0);
  const outstanding = invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + (i.balance || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Finance & recruitment analytics" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'text-emerald-600' },
          { label: 'Outstanding', value: `$${outstanding.toLocaleString()}`, color: 'text-red-600' },
          { label: 'Total Placements', value: placed, color: 'text-blue-600' },
          { label: 'Conversion Rate', value: totalSubmissions > 0 ? `${((placed / totalSubmissions) * 100).toFixed(1)}%` : '0%', color: 'text-purple-600' },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="pt-4">
              <p className="text-xs text-slate-500">{kpi.label}</p>
              <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold">Monthly Revenue (6 months)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold">Submission Pipeline</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <PageGuard page="Reports">
      <ReportsContent />
    </PageGuard>
  );
}