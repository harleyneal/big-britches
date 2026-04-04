"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile, Tenant, AuthUser, UserRole } from "./types";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function fetchUserData(authUser: User) {
    // Fetch profile and tenant in parallel
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (!profile) {
      setUser(null);
      setLoading(false);
      return;
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", profile.tenant_id)
      .single();

    if (!tenant) {
      setUser(null);
      setLoading(false);
      return;
    }

    setUser({
      id: authUser.id,
      email: authUser.email || "",
      profile: profile as UserProfile,
      tenant: tenant as Tenant,
    });
    setLoading(false);
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        fetchUserData(authUser);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/auth/login";
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useRequireRole(...roles: UserRole[]) {
  const { user, loading } = useAuth();
  const hasRole = user ? roles.includes(user.profile.role) : false;
  return { user, loading, hasRole };
}
