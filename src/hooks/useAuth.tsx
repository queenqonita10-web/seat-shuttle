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
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, sessionData) => {
        setSession(sessionData);
        setUser(sessionData?.user ?? null);

        if (sessionData?.user) {
          try {
            // Fetch user role from database
            const { data, error } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", sessionData.user.id)
              .single();
            
            if (error) {
              // User might not have a role assigned yet, which is OK
              console.warn("Failed to fetch user role:", error.message);
              setRole(null);
            } else {
              setRole((data.role as AppRole) ?? null);
            }
          } catch (err) {
            console.error("Unexpected error fetching role:", err);
            setRole(null);
          }
        } else {
          // User logged out
          setRole(null);
        }
        
        // Always set loading to false once session is determined
        setLoading(false);
      }
    );

    // Check for existing session (handles page reload)
    const checkSession = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }

        if (existingSession?.user) {
          setSession(existingSession);
          setUser(existingSession.user);
          
          // Fetch role for existing session
          try {
            const { data, error: roleError } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", existingSession.user.id)
              .single();
            
            if (!roleError && data) {
              setRole((data.role as AppRole) ?? null);
            }
          } catch (err) {
            console.error("Error fetching role for existing session:", err);
          }
        } else {
          setSession(null);
          setUser(null);
          setRole(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();

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
