import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Moon, Sun, Bell, Shield, HelpCircle, Info, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function PrivacyPolicyContent() {
  return (
    <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
      <h3 className="text-lg font-display tracking-wide text-foreground">PRIVACY POLICY</h3>
      <p className="text-xs text-muted-foreground">Last updated: March 2026</p>
      <p>CineStream ("we", "us", or "our") is committed to protecting your privacy. This policy describes how we collect, use, and share information.</p>
      <h4 className="font-semibold text-foreground">1. Information We Collect</h4>
      <p>We collect information you provide directly, such as your name, email, and profile data when you create an account. We also collect usage data including watch history, ratings, and preferences to improve your experience.</p>
      <h4 className="font-semibold text-foreground">2. How We Use Your Information</h4>
      <p>We use your information to provide and personalize our streaming service, send notifications about new content, and improve our recommendations. We do not sell your personal information to third parties.</p>
      <h4 className="font-semibold text-foreground">3. Data Security</h4>
      <p>We implement industry-standard security measures to protect your data. All data is encrypted in transit and at rest. Access to personal information is restricted to authorized personnel only.</p>
      <h4 className="font-semibold text-foreground">4. Your Rights</h4>
      <p>You have the right to access, update, or delete your personal information at any time through your account settings. You can also request a copy of all data we hold about you.</p>
      <h4 className="font-semibold text-foreground">5. Contact Us</h4>
      <p>If you have questions about this policy, please contact us at privacy@cinestream.app</p>
    </div>
  );
}

function HelpSupportContent() {
  return (
    <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
      <h3 className="text-lg font-display tracking-wide text-foreground">HELP & SUPPORT</h3>
      <h4 className="font-semibold text-foreground">Frequently Asked Questions</h4>
      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="font-medium text-foreground mb-1">How do I add movies to my watchlist?</p>
          <p className="text-xs text-muted-foreground">Click the "+" or "My List" button on any movie or series card. You can access your list from your profile page.</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="font-medium text-foreground mb-1">How does autoplay work for series?</p>
          <p className="text-xs text-muted-foreground">When an episode ends, the next episode will automatically start after a 5-second countdown. You can cancel or skip manually.</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="font-medium text-foreground mb-1">Can I watch with friends?</p>
          <p className="text-xs text-muted-foreground">Yes! Use the Watch Party feature to invite friends and watch together in sync. Go to the Friends page to start a watch party.</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="font-medium text-foreground mb-1">Why is a video not available?</p>
          <p className="text-xs text-muted-foreground">Some content may not have a video link uploaded yet. You'll see a "Video not available" message. Please check back later.</p>
        </div>
      </div>
      <h4 className="font-semibold text-foreground mt-4">Contact Support</h4>
      <p>Email: support@cinestream.app</p>
      <p>Response time: Within 24 hours</p>
    </div>
  );
}

function AppVersionContent() {
  return (
    <div className="space-y-4 text-sm text-foreground/80">
      <h3 className="text-lg font-display tracking-wide text-foreground">APP VERSION</h3>
      <div className="space-y-3">
        <div className="flex justify-between p-3 rounded-lg bg-secondary/50">
          <span className="text-foreground font-medium">Version</span>
          <span className="text-muted-foreground">1.0.0</span>
        </div>
        <div className="flex justify-between p-3 rounded-lg bg-secondary/50">
          <span className="text-foreground font-medium">Build</span>
          <span className="text-muted-foreground">2026.03.03</span>
        </div>
        <div className="flex justify-between p-3 rounded-lg bg-secondary/50">
          <span className="text-foreground font-medium">Platform</span>
          <span className="text-muted-foreground">Web (React)</span>
        </div>
        <div className="flex justify-between p-3 rounded-lg bg-secondary/50">
          <span className="text-foreground font-medium">Backend</span>
          <span className="text-muted-foreground">Lovable Cloud</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4">© 2026 CineStream. All rights reserved.</p>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return !document.documentElement.classList.contains('light');
  });
  const [notifications, setNotifications] = useState(true);
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  const sections = [
    {
      title: "Preferences",
      items: [
        {
          icon: darkMode ? Moon : Sun,
          label: "Dark Mode",
          toggle: true,
          value: darkMode,
          onChange: () => setDarkMode(!darkMode),
        },
        {
          icon: Bell,
          label: "Push Notifications",
          toggle: true,
          value: notifications,
          onChange: () => setNotifications(!notifications),
        },
      ],
    },
    {
      title: "About",
      items: [
        { icon: Shield, label: "Privacy Policy", action: () => setOpenPanel('privacy') },
        { icon: HelpCircle, label: "Help & Support", action: () => setOpenPanel('help') },
        { icon: Info, label: "App Version", action: () => setOpenPanel('version'), subtitle: "1.0.0" },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pt-6 md:pt-24 px-4 md:px-12 pb-24"
    >
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/profile")} className="p-2 rounded-full hover:bg-secondary transition-colors">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-display tracking-wider text-foreground">SETTINGS</h1>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">{section.title}</h2>
          <div className="space-y-2">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={'action' in item ? item.action : 'onChange' in item ? item.onChange : undefined}
                  className="w-full flex items-center gap-4 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
                  {'subtitle' in item && item.subtitle && (
                    <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                  )}
                  {'toggle' in item && item.toggle && (
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${item.value ? 'bg-primary' : 'bg-muted'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${item.value ? 'left-5 bg-primary-foreground' : 'left-1 bg-foreground/60'}`} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Slide-in panels for Privacy, Help, Version */}
      <AnimatePresence>
        {openPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => setOpenPanel(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full md:w-[420px] bg-card border-l border-border overflow-y-auto p-6"
            >
              <button
                onClick={() => setOpenPanel(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
              <div className="mt-8">
                {openPanel === 'privacy' && <PrivacyPolicyContent />}
                {openPanel === 'help' && <HelpSupportContent />}
                {openPanel === 'version' && <AppVersionContent />}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
