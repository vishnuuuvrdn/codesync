function OutputPanel({ output, isExecuting }) {
  const hasError =
    output &&
    (output.includes("Error") ||
      output.includes("Exception") ||
      output.includes("Traceback") ||
      output.includes("error:") ||
      output.includes("fatal:"));

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <div className="h-8 px-4 border-b border-zinc-900 flex items-center justify-between shrink-0">
        <span className="text-xs text-zinc-400 font-medium">Output</span>
        {isExecuting && (
          <span className="text-yellow-400 text-xs animate-pulse">Running…</span>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-xs min-h-0">
        {!output ? (
          <span className="text-zinc-600">Click ▶ Run to execute your code.</span>
        ) : (
          <pre
            className={`whitespace-pre-wrap break-words leading-relaxed ${
              hasError ? "text-red-400" : "text-green-400"
            }`}
          >
            {output}
          </pre>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;
