import React from 'react';
import { ShieldOff } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4">
      <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <ShieldOff className="h-8 w-8 text-red-400" />
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Denied</h2>
      <p className="text-slate-500 text-sm max-w-xs">
        You don't have permission to view this page. Contact your administrator if you think this is a mistake.
      </p>
    </div>
  );
}