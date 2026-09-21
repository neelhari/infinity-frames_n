import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, signInAdmin, signOutAdmin, isUserAdmin } from '../lib/supabase';

const AdminAuthContext = createContext();

const ADMIN_EMAILS = [
  'dacnikhil21@gmail.com',
  'infinityframesn@gmail.com',
  'admin@infinityframesn.com',
];

export function AdminAuthProvider({ children }) {
  // Store admin login status in a dedicated localStorage key so it is NEVER
  // overwritten or confused with customer storefront sessions
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem('infinity_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('infinity_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Check admin state on mount and sync if current Supabase session is an admin
  useEffect(() => {
    let active = true;

    const checkAdminSession = async () => {
      try {
        // 1. If already marked as admin in dedicated localStorage, keep it
        if (localStorage.getItem('infinity_admin_auth') === 'true') {
          if (active) {
            setIsAdmin(true);
            setLoading(false);
          }
          return;
        }

        // 2. If logged into Supabase with an owner/admin email, grant admin access automatically
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          const sess = data?.session;
          if (sess?.user) {
            const email = (sess.user.email || '').toLowerCase().trim();
            const isMatch = ADMIN_EMAILS.includes(email) || (await isUserAdmin(sess.user.id, email));
            if (isMatch && active) {
              const u = { email, id: sess.user.id, role: 'admin' };
              setIsAdmin(true);
              setUser(u);
              localStorage.setItem('infinity_admin_auth', 'true');
              localStorage.setItem('infinity_admin_user', JSON.stringify(u));
            }
          }
        }
      } catch (err) {
        console.warn('Admin check warning:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    checkAdminSession();

    return () => {
      active = false;
    };
  }, []);

  const signIn = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Direct Master Admin check (failsafe so owner is never blocked by database issues)
    const isMasterEmail = ADMIN_EMAILS.includes(cleanEmail);
    const isMasterPass =
      cleanPassword === 'Karna@6301' ||
      cleanPassword === 'admin123' ||
      cleanPassword === 'Admin@123';

    if (isMasterEmail && isMasterPass) {
      const adminObj = { email: cleanEmail, role: 'admin' };
      setIsAdmin(true);
      setUser(adminObj);
      localStorage.setItem('infinity_admin_auth', 'true');
      localStorage.setItem('infinity_admin_user', JSON.stringify(adminObj));
      return { success: true };
    }

    // 2. Try Supabase Auth
    try {
      const res = await signInAdmin(cleanEmail, cleanPassword);
      if (res.success && res.data?.user) {
        const uEmail = (res.data.user.email || cleanEmail).toLowerCase().trim();
        const isAllowed = ADMIN_EMAILS.includes(uEmail) || (await isUserAdmin(res.data.user.id, uEmail));

        if (isAllowed) {
          const adminObj = { email: uEmail, id: res.data.user.id, role: 'admin' };
          setIsAdmin(true);
          setUser(adminObj);
          localStorage.setItem('infinity_admin_auth', 'true');
          localStorage.setItem('infinity_admin_user', JSON.stringify(adminObj));
          return { success: true };
        } else {
          return {
            success: false,
            message: 'Access denied: This email is not authorized for the store admin panel.',
          };
        }
      }

      return {
        success: false,
        message: res.message || 'Invalid email or password. Please verify your credentials.',
      };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Failed to sign in. Please try again.',
      };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('infinity_admin_auth');
    localStorage.removeItem('infinity_admin_user');
    setIsAdmin(false);
    setUser(null);
    try {
      await signOutAdmin();
    } catch {
      // ignore
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin,
        session: isAdmin ? { user } : null,
        user,
        loading,
        signIn,
        signOut,
        supabaseConfigured: true,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
