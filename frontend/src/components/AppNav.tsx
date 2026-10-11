import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, LogOut, User } from "lucide-react";
import { useSession } from "../lib/SessionContext";
import { cn } from "../lib/cn";

export function AppNav() {
  const { profileId, username, signOut } = useSession();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (!profileId) return null;

  const link = (to: string, label: string) => (
    <Link
      to={to}
      data-testid={`nav-${label.toLowerCase()}-link`}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition",
        pathname === to ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100",
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <Compass className="h-5 w-5" aria-hidden="true" />
          </span>
          CareerPath
        </Link>

        <div className="flex items-center gap-1">
          {link("/", "Home")}
          {link("/profile", "Profile")}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 text-sm text-slate-600 sm:flex" data-testid="nav-username">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-500">
              <User className="h-4 w-4" aria-hidden="true" />
            </span>
            {username}
          </span>
          <button
            type="button"
            data-testid="nav-signout-button"
            onClick={() => {
              signOut();
              navigate("/login");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </nav>
    </header>
  );
}
