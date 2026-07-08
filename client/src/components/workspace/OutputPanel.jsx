function OutputPanel({ output, isExecuting }) {
  const hasError =
    output &&
    (output.includes("Error") ||
      output.includes("Exception") ||
      output.includes("ReferenceError") ||
      output.includes("SyntaxError"));

  return (
    <div className="h-52 border-t border-zinc-800 bg-zinc-950 flex flex-col">
      <div className="h-10 px-4 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-sm text-zinc-300 font-medium">Terminal</span>

        {isExecuting && (
          <span className="text-yellow-400 text-xs animate-pulse">
            Running...
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {!output ? (
          <span className="text-zinc-500">Click Run to execute your code.</span>
        ) : (
          <pre
            className={`whitespace-pre-wrap ${
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
