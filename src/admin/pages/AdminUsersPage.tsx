import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AdminUser } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const [users] = useState<AdminUser[]>([
    {
      id: 'usr-1',
      email: 'putimach324@gmail.com',
      full_name: 'Shakhwat Hossain Rasel',
      role: 'owner',
      created_at: '2026-08-20'
    },
    {
      id: 'usr-2',
      email: 'admin@womencurator.com',
      full_name: 'Women Curator Manager',
      role: 'admin',
      created_at: '2026-08-20'
    }
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3 h-3" />
          <span>Security & Permissions</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
          Admin Team & Access Roles
        </h1>
        <p className="text-xs text-curator-muted font-sans mt-0.5">
          Role-based authorization enforced through Supabase Auth & PostgreSQL policies.
        </p>
      </div>

      <div className="bg-white rounded-[2rem] border border-curator-border shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF5EE]/70 border-b border-curator-border font-mono text-[10px] uppercase text-curator-muted">
            <tr>
              <th className="py-4 px-6">Admin User</th>
              <th className="py-4 px-4">Role</th>
              <th className="py-4 px-4">Permissions</th>
              <th className="py-4 px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-curator-border/60">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-curator-surface-peach/30">
                <td className="py-4 px-6">
                  <div className="font-bold text-curator-charcoal">{u.full_name}</div>
                  <div className="text-[11px] text-curator-muted font-mono">{u.email}</div>
                </td>
                <td className="py-4 px-4">
                  <span className="px-2.5 py-1 rounded-full bg-curator-coral text-white text-[10px] font-bold uppercase font-mono">
                    {u.role}
                  </span>
                </td>
                <td className="py-4 px-4 text-xs text-curator-muted">
                  {u.role === 'owner' ? 'Full Storefront & Database Access' : 'Products, Orders, and CMS Content'}
                </td>
                <td className="py-4 px-6 text-right font-mono text-emerald-700 font-bold text-xs">
                  Active
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
