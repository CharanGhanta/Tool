import React, { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import PageGuard from '../components/shared/PageGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ExternalLink } from 'lucide-react';

const INTEGRATIONS = [
  {
    name: 'LinkedIn Recruiter',
    description: 'Import candidates directly from LinkedIn',
    category: 'Sourcing',
    status: 'available',
    icon: '💼'
  },
  {
    name: 'Indeed',
    description: 'Post jobs and sync applications',
    category: 'Job Boards',
    status: 'available',
    icon: '🔍'
  },
  {
    name: 'Email (SMTP)',
    description: 'Send automated emails via Gmail/Outlook',
    category: 'Communication',
    status: 'connected',
    icon: '📧'
  },
  {
    name: 'Slack',
    description: 'Get notifications in Slack channels',
    category: 'Communication',
    status: 'available',
    icon: '💬'
  },
  {
    name: 'Zapier',
    description: 'Connect to 5000+ apps via Zapier',
    category: 'Automation',
    status: 'available',
    icon: '⚡'
  },
  {
    name: 'Google Calendar',
    description: 'Sync interview schedules',
    category: 'Productivity',
    status: 'available',
    icon: '📅'
  },
  {
    name: 'ADP / Workday',
    description: 'HRIS integration for onboarding',
    category: 'HR Systems',
    status: 'enterprise',
    icon: '🏢'
  },
  {
    name: 'QuickBooks',
    description: 'Sync invoices and payments',
    category: 'Finance',
    status: 'available',
    icon: '💰'
  },
];

function IntegrationsContent() {
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...new Set(INTEGRATIONS.map(i => i.category))];
  const filtered = filter === 'All' ? INTEGRATIONS : INTEGRATIONS.filter(i => i.category === filter);

  return (
    <div className="space-y-6">
      <PageHeader title="Integrations" subtitle="Connect TechLeadPro with your favorite tools" />

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <Button
            key={cat}
            size="sm"
            variant={filter === cat ? 'default' : 'outline'}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((integration, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{integration.icon}</div>
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">{integration.category}</Badge>
                  </div>
                </div>
                {integration.status === 'connected' && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    <Check className="h-3 w-3 mr-1" /> Connected
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-2">{integration.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant={integration.status === 'connected' ? 'outline' : 'default'}
                size="sm"
                className="w-full gap-2"
                disabled={integration.status === 'enterprise'}
              >
                {integration.status === 'enterprise' ? 'Enterprise Plan' : integration.status === 'connected' ? 'Manage' : 'Connect'}
                {integration.status !== 'enterprise' && <ExternalLink className="h-3 w-3" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Integrations() {
  return (
    <PageGuard page="Settings">
      <IntegrationsContent />
    </PageGuard>
  );
}