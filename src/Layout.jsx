import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { getNavItems } from './components/shared/RoleGuard';
import {
  LayoutDashboard, Users, Building2, Truck, Briefcase, Send, Calendar,
  FileText, BarChart3, Settings, LogOut, Menu, Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ICONS = {
  LayoutDashboard, Users, Building2, Truck, Briefcase, Send, Calendar,
  FileText, BarChart3, Settings, Zap
};

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const role = user?.role || 'recruiter';
  const navItems = getNavItems(role);

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    recruiter: 'bg-blue-100 text-blue-700',
    finance: 'bg-emerald-100 text-emerald-700',
    sales: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-slate-700/50">
          <h1 className="text-lg font-bold text-white tracking-tight">
            <span className="text-blue-400">Tech</span>LeadPro
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Staffing ATS / CRM</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = ICONS[item.icon];
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.full_name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{user?.full_name || 'User'}</p>
              <Badge className={`text-[10px] px-1.5 py-0 ${roleColors[role] || roleColors.recruiter}`}>
                {role}
              </Badge>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-medium text-slate-700 text-sm">{currentPageName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 hidden sm:block">{user?.full_name}</span>
            <Badge className={`${roleColors[role] || roleColors.recruiter} text-xs`}>{role}</Badge>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500" onClick={() => base44.auth.logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}