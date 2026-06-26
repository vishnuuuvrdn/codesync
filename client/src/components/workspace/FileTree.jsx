function FileTree({ files, activeFile, onOpenFile }) {
  return (
    <div className="flex-1 overflow-y-auto py-2">
      {files.length === 0 ? (
        <p className="text-zinc-700 text-xs px-4 py-3">No files yet.</p>
      ) : (
        files.map((file) => (
          <div
            key={file._id}
            onClick={() => onOpenFile(file)}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs cursor-pointer transition-colors
              ${activeFile?._id === file._id ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"}
              ${file.type === "folder" ? "cursor-default" : ""}
            `}
          >
            {file.type === "folder" ? (
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0 text-zinc-600"
              >
                <path
                  d="M1.5 3.5A1 1 0 012.5 2.5h3l1.5 2h6a1 1 0 011 1v7a1 1 0 01-1 1h-11a1 1 0 01-1-1v-9z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0 text-zinc-600"
              >
                <path
                  d="M4 2h5.5L12 4.5V14H4V2z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 2v3h3"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span className="truncate">{file.name}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default FileTree;
