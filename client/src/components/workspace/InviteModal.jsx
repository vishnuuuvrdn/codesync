import { useState } from "react";
import api from "../../api/axios";

function InviteModal({ workspaceId, onClose }) {
  const [maxUses, setMaxUses] = useState(0); // 0 = unlimited
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [inviteCode, setInviteCode] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generateInvite = async () => {
    setGenerating(true);
    setError("");
    setCopied(false);
    try {
      const res = await api.post("/invites", {
        workspaceId,
        maxUses: Number(maxUses),
        expiresInHours: Number(expiresInHours),
      });
      setInviteCode(res.data.invite.inviteCode);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate invite");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-[400px] shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-semibold tracking-tight">Generate Invite</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 text-xs text-red-400 bg-red-950/30 border border-red-900/50 p-2 rounded">
            {error}
          </div>
        )}

        {!inviteCode ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Expires in</label>
              <select
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white rounded-md px-3 py-2 outline-none focus:border-zinc-600 transition-colors"
              >
                <option value={1}>1 hour</option>
                <option value={24}>1 day</option>
                <option value={168}>7 days</option>
                <option value={0}>Never expire</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Max users</label>
              <select
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white rounded-md px-3 py-2 outline-none focus:border-zinc-600 transition-colors"
              >
                <option value={0}>Unlimited</option>
                <option value={1}>1 user</option>
                <option value={5}>5 users</option>
                <option value={10}>10 users</option>
              </select>
            </div>

            <button
              onClick={generateInvite}
              disabled={generating}
              className="mt-2 w-full bg-white hover:bg-zinc-200 text-black font-medium text-sm rounded-md py-2 transition-colors disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Link"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-300 mb-1">
              Share this code with collaborators to invite them to this workspace.
            </p>
            <div className="flex items-center justify-center p-4 bg-zinc-950 border border-zinc-800 rounded-md">
              <span className="text-2xl font-mono tracking-widest font-semibold text-white">
                {inviteCode}
              </span>
            </div>
            <button
              onClick={copyToClipboard}
              className={`w-full font-medium text-sm rounded-md py-2 transition-colors flex items-center justify-center gap-2 ${
                copied
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-white text-black hover:bg-zinc-200"
              }`}
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copy Code
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InviteModal;
