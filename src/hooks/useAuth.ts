import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { getDeviceInfo } from "@/utils/deviceInfo";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const deviceSyncedRef = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN' && session?.user && !deviceSyncedRef.current) {
        deviceSyncedRef.current = true;
        const myInfo = await getDeviceInfo();

        // Sync device info on sign in
        await (supabase.rpc as any)('handle_single_device_login', {
          target_user_id: session.user.id,
          new_session_id: crypto.randomUUID(),
          new_device_info: myInfo
        });

        // Watch for device changes (another device logging in)
        const channel = supabase
          .channel(`session_guard_${session.user.id}`)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${session.user.id}`
          }, (payload: any) => {
            const dbDeviceId = payload.new.device_info?.deviceId;
            if (dbDeviceId && dbDeviceId !== myInfo.deviceId) {
              supabase.auth.signOut();
              alert("Logged out: You signed in on another device.");
            }
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }

      if (event === 'SIGNED_OUT') {
        deviceSyncedRef.current = false;
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

    if (error || !data.user || !data.session) return { data, error, conflict: false, existingDevice: null };

    // Fetch profile to check for existing device
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('active_session_id, device_info')
      .eq('user_id', data.user.id)
      .single();

    const myInfo = await getDeviceInfo();

    // Check for device conflict
    if (profile?.active_session_id && profile.device_info?.deviceId && profile.device_info.deviceId !== myInfo.deviceId) {
      return { data, error: null, conflict: true, existingDevice: profile.device_info };
    }

    // No conflict - update device info
    const newSessionId = crypto.randomUUID();
    await (supabase.rpc as any)('handle_single_device_login', {
      target_user_id: data.user.id,
      new_session_id: newSessionId,
      new_device_info: myInfo
    });

    return { data, error: null, conflict: false, existingDevice: null };
  };

  const signOut = async () => {
    if (user) {
      await (supabase.from("profiles") as any).update({ device_info: null, active_session_id: null }).eq("user_id", user.id);
    }
    await supabase.auth.signOut();
  };

  return { user, session, loading, signUp, signIn, signOut };
}
