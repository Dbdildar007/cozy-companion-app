import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { getDeviceInfo } from "@/utils/deviceInfo";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!supabase.auth.getSession());

useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    // 1. IMMEDIATELY update the UI state so the loading screen disappears
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false); 

    // 2. Run the database logic in the background
    if (event === 'SIGNED_IN' && session?.user) {
      try {
        const myInfo = await getDeviceInfo();
        const newSessionId = typeof crypto.randomUUID === 'function' 
          ? crypto.randomUUID() 
          : Math.random().toString(36).substring(2);

        await supabase.rpc('handle_single_device_login', {
          target_user_id: session.user.id,
          new_session_id: newSessionId,
          new_device_info: myInfo
        });
      } catch (err) {
        console.error("Background sync failed:", err);
      }
    }
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
  
  if (error || !data.user || !data.session) return { data, error };

  // 1. Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_session_id, device_info')
    .eq('user_id', data.user.id)
    .single();

  const myInfo = await getDeviceInfo();

  // 2. Check for conflict
  if (profile?.active_session_id && profile.device_info?.deviceId !== myInfo.deviceId) {
    return { data, error: null, conflict: true, existingDevice: profile.device_info };
  }

  // 3. Generate UUID for the database
  const newSessionId = crypto.randomUUID();

  // 4. Call RPC and WAIT for the result
  const { error: rpcError } = await supabase.rpc('handle_single_device_login', {
    target_user_id: data.user.id,
    new_session_id: newSessionId,
    new_device_info: myInfo
  });

  if (rpcError) {
    console.error("Database update failed:", rpcError.message);
    // Return the error so the user knows the session couldn't be initialized
    return { data, error: rpcError, conflict: false };
  }

  return { data, error: null, conflict: false, sessionId: newSessionId };
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
