import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert, LogOut } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function ProtectedAdminRoute({ children }) {
  const { loading, session, isAdmin, user, signOut, supabaseConfigured } = useAdminAuth();
  const location = useLocation();

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4">
        <div className="max-w-md text-center space-y-3 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
          <h1 className="font-serif text-xl font-bold text-[#6B1518]">Supabase Not Configured</h1>
          <p className="text-xs text-gray-500">
            VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing from .env. The admin panel cannot
            authenticate or load data until this is fixed.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-6 h-6 animate-spin text-[#6B1518]" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4">
        <div className="max-w-md text-center space-y-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <ShieldAlert className="w-10 h-10 text-[#6B1518] mx-auto" />
          <div className="space-y-1.5">
            <h1 className="font-serif text-xl font-bold text-[#6B1518]">Access Restricted</h1>
            <p className="text-xs text-gray-500">
              You're signed in as <strong className="text-gray-800">{user?.email}</strong>, but this account is
              not authorized as a store admin. Ask the store owner to add your account to the{' '}
              <code className="bg-gray-100 px-1 py-0.5 rounded">admin_users</code> table in Supabase.
            </p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#6B1518] bg-[#F8F0F0] hover:bg-[#EADEDF] px-4 py-2.5 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return children;
}
