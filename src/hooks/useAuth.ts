import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);


  // 1. ADD THIS HELPER FUNCTION INSIDE useAuth
  const getSimpleDeviceInfo = () => {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";

    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";

    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    return {
      browser,
      os,
      device: /Mobi|Android/i.test(ua) ? "mobile" : "desktop",
      raw_ua: ua,
      updated_at: new Date().toISOString()
    };
  };

  // 2. ADD THIS SYNC FUNCTION
  const syncDeviceInfo = async (userId: string) => {
    const info = getSimpleDeviceInfo();
    const { error } = await supabase
      .from("profiles")
      .update({ device_info: info })
      .eq("user_id", userId); // Use 'user_id' to match your schema
    
    if (error) console.error("Error updating device info:", error);
  };

useEffect(() => {
    // 3. UPDATE THE onAuthStateChange LISTENER
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Whenever a user successfully signs in or a session is restored
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        if (currentUser) {
          // REMOVED 'await' here so it doesn't block the UI
          syncDeviceInfo(currentUser.id); 
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  

  const signUp = async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signUp, signIn, signOut };
}
