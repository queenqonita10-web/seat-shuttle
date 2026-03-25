import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

/**
 * Monitors session validity and redirects to login if expired
 * - Checks session every 5 minutes
 * - Re-validates when tab regains focus (user was idle)
 * - Shows error toast and redirects if session is invalid
 */
export function useSessionValidation() {
  const { user, session } = useAuth();
  const warningShownRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session || !user) {
      warningShownRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    /**
     * Validates current session with Supabase
     * Returns true if session is still valid, false if expired
     */
    const validateSession = async (): Promise<boolean> => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn("Session validation error:", error.message);
          return false;
        }

        if (!data.session) {
          console.warn("Session is no longer valid");
          return false;
        }

        return true;
      } catch (err) {
        console.error("Unexpected error during session validation:", err);
        return false;
      }
    };

    /**
     * Handles scenario where session has expired
     */
    const handleSessionExpired = () => {
      console.warn("Session expired - redirecting to login");
      
      if (!warningShownRef.current) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        warningShownRef.current = true;
        
        // Redirect to auth page after short delay
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1500);
      }
    };

    // Check session validity every 5 minutes
    intervalRef.current = setInterval(async () => {
      const isValid = await validateSession();
      if (!isValid) {
        handleSessionExpired();
      }
    }, 5 * 60 * 1000); // 5 minutes

    /**
     * Re-validate session when tab regains focus
     * User might have been idle while session expired
     */
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        console.log("Tab regained focus - validating session");
        const isValid = await validateSession();
        if (!isValid) {
          handleSessionExpired();
        }
      }
    };

    /**
     * Re-validate session when window regains focus
     * Alternative to visibilitychange for when app is focused
     */
    const handleWindowFocus = async () => {
      console.log("Window regained focus - validating session");
      const isValid = await validateSession();
      if (!isValid) {
        handleSessionExpired();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [session, user]);

  return null;
}
