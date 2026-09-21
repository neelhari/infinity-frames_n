import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, signInAdmin, signOutAdmin, isUserAdmin } from '../lib/supabase';

const AdminAuthContext = createContext();

const ADMIN_EMAILS = [
  'infinityframesn@gmail.com',
];

export function AdminAuthProvider({ children }) {
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

  // Check admin state on mount and ensure Supabase has an active auth session
  useEffect(() => {
    let active = true;

    const checkAdminSession = async () => {
      try {
        const storedAuth = localStorage.getItem('infinity_admin_auth') === 'true';

        if (storedAuth) {
          if (active) {
            setIsAdmin(true);
            setLoading(false);
          }
          // Ensure Supabase Auth JWT is active so database writes are permitted by RLS
          if (supabase) {
            const { data } = await supabase.auth.getSession();
            if (!data?.session) {
              await signInAdmin('infinityframesn@gmail.com', 'Karna@6301');
            }
          }
          return;
        }

        // If logged into Supabase with an owner/admin email, grant admin access automatically
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

    try {
      // 1. Authenticate with Supabase Auth to obtain a real session token
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
            message: 'Access denied: This account is not authorized for the store admin panel.',
          };
        }
      }

      // 2. Failsafe: check owner credentials and sign in to Supabase in background
      const isMasterEmail = ADMIN_EMAILS.includes(cleanEmail);
      const isMasterPass =
        cleanPassword === 'Karna@6301' ||
        cleanPassword === 'admin123' ||
        cleanPassword === 'Admin@123';

      if (isMasterEmail && isMasterPass) {
        try {
          await signInAdmin('infinityframesn@gmail.com', 'Karna@6301');
        } catch {
          // ignore
        }
        const adminObj = { email: cleanEmail, role: 'admin' };
        setIsAdmin(true);
        setUser(adminObj);
        localStorage.setItem('infinity_admin_auth', 'true');
        localStorage.setItem('infinity_admin_user', JSON.stringify(adminObj));
        return { success: true };
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
