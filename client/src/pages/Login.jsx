import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      setCurrentUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        "Invalid email or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-10">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <rect width="22" height="22" rx="6" fill="white" />
            <path d="M6 8l5-3 5 3-5 3-5-3z" fill="black" opacity="0.9" />
            <path d="M16 8v5l-5 3V11l5-3z" fill="black" opacity="0.4" />
            <path d="M6 8v5l5 3V11L6 8z" fill="black" opacity="0.65" />
          </svg>
          <span className="text-white text-sm font-medium tracking-tight">
            codesync
          </span>
        </div>

        <h1 className="text-white text-[22px] font-semibold tracking-tight mb-1">
          Welcome back
        </h1>
        <p className="text-zinc-500 text-sm mb-8">Sign in to continue.</p>

        {error && (
          <div className="text-zinc-300 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-zinc-400 text-[13px]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
              className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 text-white text-sm rounded-lg px-3 py-2.5 outline-none placeholder:text-zinc-600 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-zinc-400 text-[13px]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 text-white text-sm rounded-lg px-3 py-2.5 outline-none placeholder:text-zinc-600 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-white hover:bg-zinc-100 disabled:opacity-40 text-black text-sm font-medium rounded-lg py-2.5 transition-colors cursor-pointer"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-zinc-600 text-sm">
          No account?{" "}
          <Link
            to="/register"
            className="text-zinc-300 hover:text-white transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
