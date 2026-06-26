function CollaboratorsList({ onlineUsers }) {
  return (
    <div className="px-3 py-3 border-b border-zinc-900">
      <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
        Collaborators
      </h3>
      {onlineUsers.length === 0 ? (
        <p className="text-xs text-zinc-700">No one online</p>
      ) : (
        <div className="flex flex-col gap-1">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-2 py-0.5">
              <div className="relative shrink-0">
                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-semibold text-zinc-300 uppercase">
                  {user.username.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-green-500 ring-1 ring-zinc-950" />
              </div>
              <span className="text-xs text-zinc-300 truncate">
                {user.username}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CollaboratorsList;
