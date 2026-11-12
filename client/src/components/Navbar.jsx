import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, setCurrentUser } = useAuth();

  const isWorkspace = location.pathname.startsWith("/workspace");

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <div className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-zinc-900 bg-[#18181b] select-none">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 cursor-pointer"
      >
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
          <rect width="22" height="22" rx="5" fill="white" />
          <path d="M6 8l5-3 5 3-5 3-5-3z" fill="black" opacity="0.9" />
          <path d="M16 8v5l-5 3V11l5-3z" fill="black" opacity="0.4" />
          <path d="M6 8v5l5 3V11L6 8z" fill="black" opacity="0.65" />
        </svg>
        <span className="text-zinc-300 text-sm font-medium tracking-tight">codesync</span>
      </button>

      <div className="flex items-center gap-4">
        {currentUser && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-zinc-400 text-xs hidden sm:block">{currentUser.username}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
