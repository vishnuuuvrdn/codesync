import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Dashboard() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get("/workspaces");
      setWorkspaces(res.data.workspaces);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const createWorkspace = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await api.post("/workspaces", { name });
      setName("");
      fetchWorkspaces();
    } catch (error) {
      console.log(error);
    } finally {
      setCreating(false);
    }
  };

  const joinWorkspace = async () => {
    if (!inviteCode.trim()) return;
    setJoining(true);
    setError("");
    try {
      const res = await api.post(`/invites/${inviteCode.trim()}/join`);
      navigate(`/workspace/${res.data.workspace._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join workspace");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-black">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-white text-lg font-semibold tracking-tight mb-7">
          Workspaces
        </h1>

        {error && (
          <div className="mb-6 text-sm text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 mb-10">
          {/* Create */}
          <div>
            <h2 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3">Create New</h2>
            <div className="flex gap-2">
              <input
            placeholder="New workspace name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createWorkspace()}
            className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 text-white text-sm rounded-lg px-3 py-2 outline-none placeholder:text-zinc-600 transition-colors"
          />
          <button
            onClick={createWorkspace}
            disabled={creating || !name.trim()}
            className="bg-white hover:bg-zinc-100 disabled:opacity-40 text-black text-sm font-medium rounded-lg px-4 py-2 transition-colors cursor-pointer whitespace-nowrap"
          >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </div>

        {/* Join */}
        <div>
          <h2 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3">Join with Code</h2>
          <div className="flex gap-2">
            <input
              placeholder="e.g. J7KQ4P2A"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinWorkspace()}
              className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 text-white text-sm rounded-lg px-3 py-2 outline-none placeholder:text-zinc-600 transition-colors uppercase"
            />
            <button
              onClick={joinWorkspace}
              disabled={joining || !inviteCode.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              {joining ? "Joining…" : "Join"}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <h2 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3">Your Workspaces</h2>
        {workspaces.length === 0 ? (
          <p className="text-zinc-700 text-sm py-10 text-center">
            No workspaces yet.
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {workspaces.map((workspace) => (
              <div
                key={workspace._id}
                onClick={() => navigate(`/workspace/${workspace._id}`)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900 cursor-pointer group transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-zinc-700 group-hover:text-zinc-400 shrink-0 transition-colors"
                >
                  <path
                    d="M1.5 3.5A1 1 0 012.5 2.5h3l1.5 2h6a1 1 0 011 1v7a1 1 0 01-1 1h-11a1 1 0 01-1-1v-9z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-zinc-400 text-sm group-hover:text-white transition-colors flex-1">
                  {workspace.name}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-zinc-800 group-hover:text-zinc-600 transition-colors"
                >
                  <path
                    d="M6 3l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
