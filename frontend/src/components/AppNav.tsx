import { Link, useNavigate } from "react-router-dom";
import { useSession } from "../lib/SessionContext";

export function AppNav() {
  const { profileId, username, signOut } = useSession();
  const navigate = useNavigate();
  if (!profileId) return null;

  return (
    <nav className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
      <div className="flex gap-4">
        <Link to="/" className="font-medium text-indigo-700 hover:underline" data-testid="nav-landing-link">
          Home
        </Link>
        <Link to="/profile" className="font-medium text-indigo-700 hover:underline" data-testid="nav-profile-link">
          Profile
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500" data-testid="nav-username">
          {username}
        </span>
        <button
          type="button"
          data-testid="nav-signout-button"
          onClick={() => {
            signOut();
            navigate("/login");
          }}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
