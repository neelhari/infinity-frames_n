import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  supabase,
  signUpCustomer,
  signInCustomer,
  sendPasswordResetEmailToSupabase,
  updateCustomerPasswordInSupabase,
} from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('infinity_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('infinity_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('infinity_user');
    }
  }, [user]);

  // Listen to Supabase Auth State Changes
  useEffect(() => {
    if (!supabase) return;
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery mode active via Supabase auth link.');
      } else if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          let existingAddresses = [];
          try {
            const saved = localStorage.getItem('infinity_user');
            const parsed = saved ? JSON.parse(saved) : null;
            if (parsed?.addresses && Array.isArray(parsed.addresses)) {
              existingAddresses = parsed.addresses;
            }
          } catch {}

          if (profile?.addresses && Array.isArray(profile.addresses) && profile.addresses.length > 0) {
            existingAddresses = profile.addresses;
          }

          const hydrated = {
            id: session.user.id,
            name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            email: session.user.email,
            phone: profile?.phone || session.user.user_metadata?.phone || '',
            addresses: existingAddresses,
          };
          setUser(hydrated);
        } catch (e) {
          console.warn('Profile fetch error:', e);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 1. Sign Up / Create Account via real Supabase Auth
  const signup = async ({ name, email, password, phone = '' }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

    if (!cleanEmail || !name || !password) {
      return { success: false, error: 'Name, Email, and Password are required.' };
    }

    const supaRes = await signUpCustomer({
      email: cleanEmail,
      password,
      name: name.trim(),
      phone: cleanPhone,
    });

    if (!supaRes.success) {
      if (supaRes.message && (supaRes.message.includes('already') || supaRes.message.includes('registered'))) {
        return { success: false, error: 'An account with this email address already exists. Please Log In.' };
      }
      return { success: false, error: supaRes.message || 'Failed to create account.' };
    }

    const newUser = {
      id: supaRes.data?.user?.id || `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      addresses: [],
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    return { success: true, user: newUser };
  };

  // 2. Login with Email & Password via real Supabase Auth
  const login = async ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both Email and Password.' };
    }

    const supaRes = await signInCustomer({ email: cleanEmail, password });
    if (!supaRes.success || !supaRes.data?.user) {
      const msg = supaRes.message || '';
      if (msg.includes('Invalid login credentials')) {
        return { success: false, error: 'Invalid email or password. Please check and try again.' };
      }
      return { success: false, error: msg || 'Login failed. Please check your credentials.' };
    }

    let existingAddresses = [];
    try {
      const saved = localStorage.getItem('infinity_user');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed?.addresses && Array.isArray(parsed.addresses)) {
        existingAddresses = parsed.addresses;
      }
    } catch {}

    const u = supaRes.data.user;
    const loggedUser = {
      id: u.id,
      name: u.user_metadata?.full_name || cleanEmail.split('@')[0],
      email: u.email,
      phone: u.user_metadata?.phone || '',
      addresses: existingAddresses,
    };
    setUser(loggedUser);
    return { success: true, user: loggedUser };
  };

  // 3. Send Password Reset Email
  const sendPasswordResetEmail = async (email) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    try {
      const supaRes = await sendPasswordResetEmailToSupabase(cleanEmail);
      if (!supaRes.success) {
        return {
          success: false,
          error: supaRes.message || 'Failed to send reset link via Supabase.',
        };
      }

      return {
        success: true,
        email: cleanEmail,
        message: `Password reset link sent to ${cleanEmail}`,
      };
    } catch (e) {
      return {
        success: false,
        error: e.message || 'Error communicating with Supabase auth service.',
      };
    }
  };

  // 4. Update Password
  const updatePassword = async (newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      const supaRes = await updateCustomerPasswordInSupabase(newPassword);
      if (!supaRes.success) {
        return { success: false, error: supaRes.message || 'Failed to update password.' };
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // 5. Update Profile
  const updateProfile = (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      return updated;
    });
  };

  // 6. Add Address (Saves to user profile and localStorage, syncing to Account page)
  const addAddress = (address) => {
    let createdAddr = null;
    setUser((prev) => {
      const baseUser = prev || {
        id: `usr_${Date.now()}`,
        name: address.name || 'Customer',
        phone: address.phone || '',
        email: address.email || '',
        addresses: [],
      };
      createdAddr = {
        ...address,
        id: address.id || `addr_${Date.now()}`,
        isDefault: (baseUser.addresses || []).length === 0,
      };
      const newAddresses = [...(baseUser.addresses || []), createdAddr];
      const updated = { ...baseUser, addresses: newAddresses };
      try {
        localStorage.setItem('infinity_user', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      return updated;
    });
    return createdAddr;
  };

  // 7. Remove Address
  const removeAddress = (addressId) => {
    setUser((prev) => {
      if (!prev) return null;
      const updatedAddresses = (prev.addresses || []).filter((a) => a.id !== addressId);
      const updated = { ...prev, addresses: updatedAddresses };
      try {
        localStorage.setItem('infinity_user', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      return updated;
    });
  };

  // 8. Logout
  const logout = async () => {
    setUser(null);
    localStorage.removeItem('infinity_user');
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Supabase signout notice:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signup,
        login,
        sendPasswordResetEmail,
        updatePassword,
        updateProfile,
        addAddress,
        removeAddress,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
