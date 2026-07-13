import terminalService from "../services/terminal.service.js";

const workspaceUsers = {};

const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join-workspace", ({ workspaceId, user }) => {
      socket.join(workspaceId);

      socket.workspaceId = workspaceId;
      socket.user = user;

      if (!workspaceUsers[workspaceId]) {
        workspaceUsers[workspaceId] = [];
      }

      const alreadyExists = workspaceUsers[workspaceId].find(
        (u) => u.id === user.id,
      );

      if (!alreadyExists) {
        workspaceUsers[workspaceId].push(user);
      }

      io.to(workspaceId).emit("online-users", workspaceUsers[workspaceId]);

      console.log(`${user.username} joined ${workspaceId}`);
    });

    socket.on("leave-workspace", (workspaceId) => {
      socket.leave(workspaceId);

      if (!socket.user) return;

      workspaceUsers[workspaceId] = (workspaceUsers[workspaceId] || []).filter(
        (u) => u.id !== socket.user.id,
      );

      io.to(workspaceId).emit("online-users", workspaceUsers[workspaceId]);
    });

    socket.on("file-update", ({ workspaceId, fileId, content }) => {
      socket.to(workspaceId).emit("file-updated", { fileId, content });
    });

    socket.on("cursor-move", ({ workspaceId, fileId, position, user }) => {
      socket.to(workspaceId).emit("receive-cursor-move", {
        fileId,
        position,
        user,
      });
    });

    socket.on("terminal-start", ({ sessionId }) => {
      if (!sessionId) return;
      // Track which terminal sessions belong to this socket
      if (!socket.terminalSessions) socket.terminalSessions = new Set();
      socket.terminalSessions.add(sessionId);

      terminalService.createSession(
        sessionId,
        (data) => socket.emit("terminal-data", { sessionId, data }),
        (code) => socket.emit("terminal-exit", { sessionId, code })
      );
    });

    socket.on("terminal-input", ({ sessionId, data }) => {
      terminalService.write(sessionId, data);
    });

    socket.on("terminal-resize", ({ sessionId, cols, rows }) => {
      terminalService.resize(sessionId, cols, rows);
    });

    socket.on("terminal-kill", ({ sessionId }) => {
      terminalService.killSession(sessionId);
    });

    socket.on("disconnect", () => {
      // Clean up workspace presence
      if (socket.workspaceId && socket.user) {
        workspaceUsers[socket.workspaceId] = (
          workspaceUsers[socket.workspaceId] || []
        ).filter((u) => u.id !== socket.user.id);

        io.to(socket.workspaceId).emit(
          "online-users",
          workspaceUsers[socket.workspaceId]
        );
      }

      // Clean up any terminal sessions owned by this socket
      if (socket.terminalSessions) {
        for (const sessionId of socket.terminalSessions) {
          terminalService.killSession(sessionId);
        }
      }

      console.log(`User Disconnected: ${socket.id}`);
    });
  });
};

export default initializeSocket;
