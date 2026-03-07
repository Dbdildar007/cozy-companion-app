import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { getDeviceInfo } from "@/utils/deviceInfo";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!supabase.auth.getSession());



useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    // ... inside your useEffect
const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
  setSession(session);
  setUser(session?.user ?? null);
  setLoading(false);

  if (event === 'SIGNED_IN' && session?.user) {
    const myInfo = await getDeviceInfo();

    console.log("info",myInfo);

    const channel = supabase
      .channel(`session_guard_${session.user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${session.user.id}`
      }, (payload) => {
        // --- ADD THE CODE HERE ---
        const dbDeviceId = payload.new.device_info?.deviceId;

        // If the device ID in the DB is now different from this browser's local ID
        if (dbDeviceId && dbDeviceId !== myInfo.deviceId) {
          supabase.auth.signOut();
          alert("Logged out: You signed in on another device.");
        }
        // -------------------------
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
});
    return () => {
      subscription.unsubscribe();
    };
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('active_session_id, device_info')
    .eq('user_id', data.user.id)
    .single();

  const myInfo = await getDeviceInfo();

  if (profile?.active_session_id && profile.device_info?.deviceId !== myInfo.deviceId) {
    return { data, error: null, conflict: true, existingDevice: profile.device_info };
  }

  const newSessionId = crypto.randomUUID();

  // Add error handling to the RPC call to see if it's failing
  const { error: rpcError } = await supabase.rpc('handle_single_device_login', {
    target_user_id: data.user.id,
    new_session_id: newSessionId,
    new_device_info: myInfo
  });
console.log("errr",rpcError);
  if (rpcError) {
    console.error("RPC failed:", rpcError.message);
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
