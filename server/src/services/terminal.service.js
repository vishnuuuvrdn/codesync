import { spawn } from "child_process";
import { randomUUID } from "crypto";

class TerminalService {
  constructor() {
    this.sessions = new Map();
  }

  createSession(sessionId, onData, onExit) {
    // Kill any existing session with the same ID before creating a new one
    if (this.sessions.has(sessionId)) {
      this.killSession(sessionId);
    }

    // Use a server-generated UUID suffix to guarantee uniqueness even if
    // multiple clients generate identical sessionIds at the same millisecond.
    const containerName = `codesync-term-${sessionId.replace(/[^a-zA-Z0-9-]/g, "-")}-${randomUUID().slice(0, 8)}`;

    const dockerArgs = [
      "run",
      "--rm",
      "-i",
      "--name", containerName,
      "--memory=128m",
      "--cpus=0.5",
      "--network=none",  // No outbound network access for security
      "ubuntu:22.04",
      "bash",
      "--login",
    ];

    const child = spawn("docker", dockerArgs, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, TERM: "xterm-256color" },
    });

    child.stdout.on("data", (data) => {
      try {
        onData(data.toString("utf8"));
      } catch {}
    });

    child.stderr.on("data", (data) => {
      try {
        onData(data.toString("utf8"));
      } catch {}
    });

    child.on("error", (err) => {
      onData(`\r\n[Terminal error: ${err.message}]\r\n`);
    });

    child.on("exit", (code, signal) => {
      this.sessions.delete(sessionId);
      if (onExit) onExit(code, signal);
    });

    this.sessions.set(sessionId, { child, containerName });
  }

  write(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (session?.child?.stdin?.writable) {
      try {
        session.child.stdin.write(data);
      } catch (err) {
        console.error(`Terminal write error [${sessionId}]:`, err.message);
      }
    }
  }

  resize(sessionId, cols, rows) {
    // Resize via docker exec + stty (requires stty in container)
    const session = this.sessions.get(sessionId);
    if (!session) return;

    try {
      spawn("docker", [
        "exec",
        session.containerName,
        "stty",
        `cols ${cols}`,
        `rows ${rows}`,
      ], { stdio: "ignore" });
    } catch {
      // Ignore resize errors — non-critical
    }
  }

  killSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    try {
      spawn("docker", ["rm", "-f", session.containerName], { stdio: "ignore" });
    } catch {}

    try {
      session.child.kill("SIGTERM");
    } catch {}

    this.sessions.delete(sessionId);
  }

  // Cleanup all sessions — for use on server shutdown
  killAll() {
    for (const sessionId of this.sessions.keys()) {
      this.killSession(sessionId);
    }
  }
}

export default new TerminalService();
