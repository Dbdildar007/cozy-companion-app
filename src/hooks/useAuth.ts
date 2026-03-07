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
      updated_at: new Date().toISOString(),
      last_login: new Date().toLocaleString()
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
const signIn = async (email: string, password: string, force = false) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error || !data.user) return { data, error };

  // 1. Check if an active session already exists in the DB
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_session_id')
    .eq('user_id', data.user.id)
    .single();

  // 2. If a session exists and we aren't "forcing" a login, block it
  if (profile?.active_session_id && !force) {
    await supabase.auth.signOut(); // Terminate the temporary session
    return { 
      data: null, 
      error: { message: "ALREADY_LOGGED_IN" } 
    };
  }

  // 3. If we are forcing (or it's a fresh login), generate a NEW ID
  const newSessionId = crypto.randomUUID();
  
  // Save to local browser storage so this device knows its ID
  localStorage.setItem("current_session_id", newSessionId);

  // Update DB: This change will be broadcast to Device 1
  await supabase
    .from('profiles')
    .update({ 
      active_session_id: newSessionId,
      device_info: { raw_ua: navigator.userAgent, last_login: new Date().toISOString() } 
    })
    .eq('user_id', data.user.id);

  return { data, error: null };
};
 

 const signOut = async () => {
  if (user) {
    // Clear device_info so the slot is free
    await supabase.from("profiles").update({ device_info: null }).eq("user_id", user.id);
  }
  await supabase.auth.signOut();
};

  return { user, session, loading, signUp, signIn, signOut };
}
