import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!supabase.auth.getSession());


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
  // 1. Immediately check for an existing session (Fastest)
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false); // UI shows up immediately here
    
    if (session?.user) {
      syncDeviceInfo(session.user.id);
    }
  });

  // 2. Listen for future changes (Login/Logout)
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    setSession(session);
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    
    if (event === "SIGNED_IN" && currentUser) {
      syncDeviceInfo(currentUser.id);
    }
    
    // Safety check to ensure loading is off
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
