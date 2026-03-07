import { motion } from "framer-motion";
import { User, Settings, LogOut, ChevronRight, Heart, Clock, Star, Users, Copy, KeyRound, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useRatings } from "@/hooks/useRatings";
import { useWatchProgress } from "@/hooks/useWatchProgress";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { watchlist } = useWatchlist();
  const { ratings } = useRatings();
  const { getContinueWatching } = useWatchProgress();

const [profile, setProfile] = useState<{ display_name: string; unique_id: string } | null>(() => {
  // This runs instantly on page load
  const saved = localStorage.getItem('user_profile');
  return saved ? JSON.parse(saved) : null;
});

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!user) {
      setProfile(null);
      localStorage.removeItem('user_profile');
      return;
    }

    // 1. Initial Fetch
    supabase
      .from("profiles")
      .select("display_name, unique_id")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          localStorage.setItem('user_profile', JSON.stringify(data));
        }
      });

    // 2. Realtime Listener (The "Ghost Fix")
    const channel = supabase
      .channel(`profile-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // If device_info changed to something else, wipe the UI
          const newDevice = payload.new.device_info;
          if (newDevice && newDevice.raw_ua !== navigator.userAgent) {
            setProfile(null);
            localStorage.clear();
            sessionStorage.clear();
            localStorage.removeItem('user_profile');
            window.location.href = "/auth?reason=session_expired";
            // Optional: toast.error("Logged out from another device");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const historyCount = getContinueWatching().length;
  const ratingsCount = Object.keys(ratings).length;

  const menuItems = [
    { icon: Heart, label: "My Watchlist", count: String(watchlist.length), action: () => navigate("/watchlist") },
    { icon: Clock, label: "Watch History", count: String(historyCount), action: () => navigate("/watch-history") },
    { icon: Star, label: "My Ratings", count: String(ratingsCount), action: () => navigate("/my-ratings") },
    { icon: Users, label: "Friends", count: null, action: () => navigate("/friends") },
    { icon: Settings, label: "Settings", count: null, action: () => navigate("/settings") },
  ];

const handleSignOut = async () => {
    // 1. Run the base sign out logic (clears Supabase session)
    await signOut();
    
    // 2. Wipe ALL local storage (including 'user_profile' and movie caches)
    localStorage.clear();
    sessionStorage.clear();
    
    toast.success("Signed out successfully");

    // 3. FORCE a full page reload to the auth page.
    // This is the "Magic Fix" that kills all "Ghost" data in React state.
    navigate("/auth");
  };

  const copyUniqueId = () => {
    if (profile?.unique_id) {
      navigator.clipboard.writeText(profile.unique_id);
      toast.success("ID copied to clipboard!");
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (newPassword.length < 6) { setPasswordError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match."); return; }
    setChangePasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangePasswordLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password changed successfully!");
      setShowChangePassword(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pt-6 md:pt-24 px-4 md:px-12 pb-24"
    >
      {/* Profile header */}
      <div className="flex items-center gap-5 mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display tracking-wider text-foreground">
            {profile?.display_name?.toUpperCase() || (user ? "USER" : "GUEST")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user ? "Premium Member" : "Sign in for full access"}
          </p>
        </div>
      </div>

      {/* Unique ID card */}
      {profile?.unique_id && (
        <button
          onClick={copyUniqueId}
          className="w-full flex items-center gap-3 p-4 rounded-lg bg-secondary mb-6 hover:bg-secondary/80 transition-colors"
        >
          <div className="flex-1 text-left">
            <p className="text-xs text-muted-foreground mb-0.5">Your Unique ID</p>
            <p className="text-sm font-mono text-primary font-semibold">{profile.unique_id}</p>
          </div>
          <Copy className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      {!user && (
        <button
          onClick={() => navigate("/auth")}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold text-sm transition-colors mb-6"
        >
          Sign In / Create Account
        </button>
      )}

      {/* Menu items */}
      <div className="space-y-2 mb-4">
        {menuItems.map(({ icon: Icon, label, count, action }) => (
          <button
            key={label}
            onClick={action}
            className="w-full flex items-center gap-4 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Icon className="w-5 h-5 text-primary" />
            <span className="flex-1 text-left text-sm font-medium text-foreground">{label}</span>
            {count && count !== "0" && (
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">{count}</span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Change Password */}
      {user && (
        <div className="mb-6">
          {!showChangePassword ? (
            <button
              onClick={() => setShowChangePassword(true)}
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <KeyRound className="w-5 h-5 text-primary" />
              <span className="flex-1 text-left text-sm font-medium text-foreground">Change Password</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-secondary rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); }}
                  placeholder="New password (min 6 chars)"
                  className="w-full bg-background text-foreground placeholder:text-muted-foreground rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showNewPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }}
                  placeholder="Confirm new password"
                  className="w-full bg-background text-foreground placeholder:text-muted-foreground rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border"
                />
              </div>
              {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleChangePassword}
                  disabled={changePasswordLoading}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {changePasswordLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Updating...</> : "Update Password"}
                </button>
                <button
                  onClick={() => { setShowChangePassword(false); setPasswordError(""); setNewPassword(""); setConfirmPassword(""); }}
                  className="px-4 py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {user && (
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      )}
    </motion.div>
  );
}
