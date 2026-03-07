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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // --- START HOTSTAR KILL-SWITCH LOGIC ---
      if (event === 'SIGNED_IN' && session?.user) {
        const myInfo = await getDeviceInfo();

        // Subscribe to the profile row for the logged-in user
        const channel = supabase
          .channel(`session_guard_${session.user.id}`)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${session.user.id}`
          }, (payload) => {
            const dbSessionId = payload.new.active_session_id;
            const dbDeviceId = payload.new.device_info?.deviceId;

            // If the DB session ID changed AND it's not this device's ID, force logout
            if (dbSessionId && dbSessionId !== session.access_token && dbDeviceId !== myInfo.deviceId) {
              supabase.auth.signOut();
              // You can use your project's toast or a simple alert
              alert("You have been logged out because you signed in on another device.");
            }
          })
          .subscribe();

        // Cleanup the channel if the user logs out or component unmounts
        return () => {
          supabase.removeChannel(channel);
        };
      }
      // --- END HOTSTAR KILL-SWITCH LOGIC ---
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
    // 1. First, just do the auth check
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error || !data.user || !data.session) return { data, error };

    // 2. Fetch profile to check if someone else is already in
    const { data: profile } = await supabase
      .from('profiles')
      .select('active_session_id, device_info')
      .eq('user_id', data.user.id)
      .single();

    const myInfo = await getDeviceInfo();

    // 3. If there's an active session on a DIFFERENT device
    if (profile?.active_session_id && profile.device_info?.deviceId !== myInfo.deviceId) {
      // We return a custom flag so the UI knows to show the Modal
      return { 
        data, 
        error: null, 
        conflict: true, 
        existingDevice: profile.device_info 
      };
    }

    // 4. No conflict? Update the DB immediately
    await supabase.rpc('handle_single_device_login', {
      target_user_id: data.user.id,
      new_session_id: data.session.access_token,
      new_device_info: myInfo
    });

    return { data, error: null, conflict: false };
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
