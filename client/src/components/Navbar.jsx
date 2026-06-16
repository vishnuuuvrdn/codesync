import { useNavigate, useLocation, href } from "react-router-dom";
import api from "../api/axios";
import logo from "../assets/logo.svg";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isWorkspace = location.pathname.startsWith("/workspace");

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    navigate("/login");
  };

  return (
    <div className="h-11 shrink-0 flex items-center justify-between px-5 border-b border-zinc-900 bg-zinc-950">
      <div
        onClick={() => navigate("/dashboard")}
      >
        <img src={logo} alt="codesync" className="h-7"/>
      </div>

      <div className="flex items-center gap-4">
        {isWorkspace && (
          <span className="text-zinc-700 text-xs">workspace</span>
        )}
        <button
          onClick={handleLogout}
          className="text-zinc-600 hover:text-white text-sm transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default Navbar;
