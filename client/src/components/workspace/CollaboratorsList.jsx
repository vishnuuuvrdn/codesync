function CollaboratorsList({ onlineUsers, onInviteClick }) {
  return (
    <div className="px-6 py-4 min-w-0">
      <div className="flex items-center justify-between mb-2 group">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1 cursor-default">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="rotate-90 text-zinc-500">
            <path d="M5.5 3L10.5 8L5.5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Collaborators
        </h3>
        <button
          onClick={onInviteClick}
          className="text-[10px] font-semibold text-zinc-400 hover:text-white px-2 py-0.5 rounded-md bg-zinc-800/50 hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100"
          title="Invite"
        >
          + Invite
        </button>
      </div>
      {onlineUsers.length === 0 ? (
        <p className="text-xs text-zinc-700">No one online</p>
      ) : (
        <div className="flex flex-col gap-1 min-w-0">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-2 py-0.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-semibold text-zinc-300 uppercase">
                  {user.username.charAt(0)}
                </div>
                <span className={`absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full ring-1 ring-zinc-950 ${
                  user.status === 'typing' ? 'bg-blue-500 animate-pulse' :
                  user.status === 'idle' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
              </div>
              <span className="text-xs text-zinc-300 truncate flex-1 min-w-0">
                {user.username}
              </span>
              {user.status === 'typing' && (
                <span className="text-[9px] text-zinc-500 italic shrink-0">typing...</span>
              )}
              {user.status === 'idle' && (
                <span className="text-[9px] text-zinc-600 italic shrink-0">idle</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CollaboratorsList;
