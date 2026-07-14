function OutputPanel({ output, isExecuting }) {
  const hasError =
    output &&
    (output.includes("Error") ||
      output.includes("Exception") ||
      output.includes("Traceback") ||
      output.includes("error:") ||
      output.includes("fatal:"));

  return (
    <div className="h-full flex flex-col bg-black relative">
      {isExecuting && (
        <div className="absolute top-2 right-4 text-yellow-400 text-xs animate-pulse">Running…</div>
      )}

      <div className="flex-1 overflow-auto p-4 font-mono text-xs min-h-0">
        {!output ? (
          <span className="text-zinc-600">Click ▶ Run to execute your code.</span>
        ) : (
          <pre
            className={`whitespace-pre-wrap break-words leading-relaxed ${
              hasError ? "text-[#f14c4c]" : "text-[#d4d4d4]"
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
