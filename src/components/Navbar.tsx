import { Link, useLocation } from "react-router-dom";
import { Film, Tv, Home, Search } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/series", label: "Series", icon: Tv },
    { to: "/movies", label: "Movies", icon: Film },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background/95 to-background/0 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Film className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              CineStream
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === to
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
