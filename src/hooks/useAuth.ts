import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!supabase.auth.getSession());

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
      updated_at: new Date().toISOString(),
      last_login: new Date().toLocaleString()
    };
  };

  const syncDeviceInfo = async (userId: string) => {
    const info = getSimpleDeviceInfo();
    const { error } = await (supabase.from("profiles") as any)
      .update({ device_info: info })
      .eq("user_id", userId);
    
    if (error) console.error("Error updating device info:", error);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        syncDeviceInfo(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (event === "SIGNED_IN" && currentUser) {
        syncDeviceInfo(currentUser.id);
      }
      
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

  const signIn = async (email: string, password: string, force = false): Promise<any> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error || !data.user) return { data, error };

    // Fetch the current profile to check for other devices
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('device_info')
      .eq('user_id', data.user.id)
      .single();

    // Logic: If a device is already there and it's not THIS one
    if (profile?.device_info && !force) {
      if (profile.device_info.raw_ua !== navigator.userAgent) {
        await supabase.auth.signOut();
        return { isLimited: true, existingDevice: profile.device_info, error: null };
      }
    }

    return { data, error: null }; 
  };

  const signOut = async () => {
    if (user) {
      await (supabase.from("profiles") as any).update({ device_info: null }).eq("user_id", user.id);
    }
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/auth";
  };

  return { user, session, loading, signUp, signIn, signOut };
}
