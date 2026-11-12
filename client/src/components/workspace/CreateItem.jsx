function CreateItem({ name, setName, createItem }) {
  return (
    <div className="px-6 py-3 min-w-0">
      <input
        placeholder="Enter filename..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && createItem("file")}
        className="w-full min-w-0 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 text-zinc-300 text-sm rounded-lg px-3 py-1.5 outline-none placeholder:text-zinc-600 transition-colors mb-2"
      />
      <div className="flex gap-2 min-w-0">
        <button
          onClick={() => createItem("file")}
          className="flex-1 min-w-0 truncate text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-medium rounded-lg py-1.5 transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
        >
          + File
        </button>
        <button
          onClick={() => createItem("folder")}
          className="flex-1 min-w-0 truncate text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-medium rounded-lg py-1.5 transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
        >
          + Folder
        </button>
      </div>
    </div>
  );
}

export default CreateItem;
