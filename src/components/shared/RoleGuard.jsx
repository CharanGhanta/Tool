// Role-based access control definitions
// Access levels: 'full' = read+write, 'readonly' = read only, false = no access

export const ROLE_PERMISSIONS = {
  admin: {
    Dashboard: 'full',
    Candidates: 'full',
    Clients: 'full',
    Vendors: 'full',
    Jobs: 'full',
    Submissions: 'full',
    Interviews: 'full',
    Invoices: 'full',
    Reports: 'full',
    Integrations: 'full',
    Settings: 'full',
  },
  recruiter: {
    Dashboard: 'full',
    Candidates: 'full',
    Clients: 'readonly',
    Jobs: 'readonly',
    Submissions: 'full',
    Interviews: 'full',
    // Hidden: Vendors, Invoices, Reports, Settings
  },
  finance: {
    Dashboard: 'full',
    Invoices: 'full',
    Submissions: 'readonly',
    Reports: 'full',
    // Hidden: Candidates, Clients, Vendors, Jobs, Interviews, Settings
  },
  sales: {
    Dashboard: 'full',
    Clients: 'full',
    Vendors: 'full',
    Jobs: 'full',
    Submissions: 'readonly',
    Candidates: 'readonly',
    // Hidden: Invoices, Reports, Settings
  },
};

export const ALL_NAV_ITEMS = [
  { name: 'Dashboard',     page: 'Dashboard',     icon: 'LayoutDashboard' },
  { name: 'Candidates',    page: 'Candidates',    icon: 'Users' },
  { name: 'Clients',       page: 'Clients',       icon: 'Building2' },
  { name: 'Vendors',       page: 'Vendors',       icon: 'Truck' },
  { name: 'Jobs',          page: 'Jobs',          icon: 'Briefcase' },
  { name: 'Submissions',   page: 'Submissions',   icon: 'Send' },
  { name: 'Interviews',    page: 'Interviews',    icon: 'Calendar' },
  { name: 'Invoices',      page: 'Invoices',      icon: 'FileText' },
  { name: 'Reports',       page: 'Reports',       icon: 'BarChart3' },
  { name: 'Integrations',  page: 'Integrations',  icon: 'Zap' },
  { name: 'Settings',      page: 'Settings',      icon: 'Settings' },
];

export function getNavItems(role) {
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.recruiter;
  return ALL_NAV_ITEMS.filter(item => !!perms[item.page]);
}

export function hasAccess(role, page) {
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.recruiter;
  return !!perms[page];
}

export function canEdit(role, page) {
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.recruiter;
  return perms[page] === 'full';
}

// Component that blocks rendering if no access
export default function RoleGuard({ role, page, children, fallback = null }) {
  if (!hasAccess(role, page)) return fallback;
  return children;
}