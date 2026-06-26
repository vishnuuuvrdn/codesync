function CreateItem({ name, setName, createItem }) {
  return (
    <div className="px-3 py-3 border-b border-zinc-900">
      <input
        placeholder="filename or folder"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && createItem("file")}
        className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-600 text-white text-xs rounded-md px-2.5 py-1.5 outline-none placeholder:text-zinc-600 transition-colors mb-2"
      />
      <div className="flex gap-1.5">
        <button
          onClick={() => createItem("file")}
          className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs rounded-md py-1.5 transition-colors cursor-pointer"
        >
          + File
        </button>
        <button
          onClick={() => createItem("folder")}
          className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs rounded-md py-1.5 transition-colors cursor-pointer"
        >
          + Folder
        </button>
      </div>
    </div>
  );
}

export default CreateItem;
