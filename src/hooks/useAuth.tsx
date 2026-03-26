import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "driver" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole;
  isAdmin: boolean;
  isDriver: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  role: null,
  isAdmin: false,
  isDriver: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole>(null);

  useEffect(() => {
    // Helper to fetch role — used by both paths
    const fetchRole = async (userId: string) => {
      try {
        console.log("Fetching role for user:", userId);
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle(); // Use maybeSingle to avoid errors if no role is found

        if (error) {
          console.error("Error fetching user role:", error.message);
          setRole(null);
          return;
        }

        if (data) {
          console.log("Role found:", data.role);
          setRole((data.role as AppRole) ?? null);
        } else {
          console.log("No role found for user, treating as passenger");
          setRole(null);
        }
      } catch (err) {
        console.error("Unexpected error fetching user role:", err);
        setRole(null);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, sessionData) => {
        setSession(sessionData);
        setUser(sessionData?.user ?? null);

        if (sessionData?.user) {
          setLoading(true); // Ensure loading is true while fetching role
          // Use setTimeout to avoid blocking the auth callback
          setTimeout(() => {
            fetchRole(sessionData.user.id).then(() => setLoading(false));
          }, 0);
        } else {
          setRole(null);
          setLoading(false);
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (existingSession?.user) {
        setSession(existingSession);
        setUser(existingSession.user);
        fetchRole(existingSession.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        isAdmin: role === "admin",
        isDriver: role === "driver",
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
