import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

export default function HistoryPanel({ fileId, onClose, onRestore }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [fileId]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/history/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data.history);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (historyId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/history/restore/${historyId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onRestore) {
        onRestore(res.data.file.content);
      }
      fetchHistory(); // Refresh to show the backup
    } catch (err) {
      console.error("Failed to restore version", err);
    }
  };

  const handleDelete = async (historyId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/history/${historyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHistory(); // Refresh list
    } catch (err) {
      console.error("Failed to delete history", err);
    }
  };

  return (
    <div className="w-80 flex flex-col border-l border-zinc-900 bg-zinc-950 h-full text-zinc-300 font-sans">
      <div className="h-9 shrink-0 flex items-center justify-between px-4 border-b border-zinc-900">
        <span className="text-zinc-200 text-xs font-medium uppercase tracking-wider">Version History</span>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {loading ? (
          <div className="text-zinc-500 text-xs text-center mt-4">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="text-zinc-500 text-xs text-center mt-4">No history found for this file.</div>
        ) : (
          history.map((record) => (
            <div key={record._id} className="bg-zinc-900 p-3 rounded border border-zinc-800 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-zinc-200">{record.summary}</span>
                <span className="text-[10px] text-zinc-500">
                  {formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}
                </span>
              </div>
              {record.savedBy && (
                <div className="text-[10px] text-zinc-400">
                  By: {record.savedBy.username || "Unknown"}
                </div>
              )}
              <div className="flex gap-2 mt-1">
                <button 
                  onClick={() => handleRestore(record._id)}
                  className="px-2 py-1 bg-accent text-white rounded text-[10px] font-medium hover:bg-accent-hover transition-colors"
                >
                  Restore
                </button>
                <button 
                  onClick={() => handleDelete(record._id)}
                  className="px-2 py-1 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded text-[10px] font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
