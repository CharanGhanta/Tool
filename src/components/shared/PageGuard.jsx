import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { hasAccess, canEdit } from './RoleGuard';
import AccessDenied from './AccessDenied';

/**
 * Wraps a page component with role-based access control.
 * Usage: <PageGuard page="Candidates">{(readOnly) => <MyPage readOnly={readOnly} />}</PageGuard>
 */
export default function PageGuard({ page, children }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(user => setRole(user?.role || 'recruiter'))
      .catch(() => setRole('recruiter'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!hasAccess(role, page)) return <AccessDenied />;

  const readOnly = !canEdit(role, page);
  return typeof children === 'function' ? children(readOnly) : children;
}