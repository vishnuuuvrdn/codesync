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

    socket.on("file-change", ({ workspaceId, fileId, content }) => {
      socket.to(workspaceId).emit("receive-file-change", {
        fileId,
        content,
      });
    });

    socket.on("disconnect", () => {
      if (socket.workspaceId && socket.user) {
        workspaceUsers[socket.workspaceId] = (
          workspaceUsers[socket.workspaceId] || []
        ).filter((u) => u.id !== socket.user.id);

        io.to(socket.workspaceId).emit(
          "online-users",
          workspaceUsers[socket.workspaceId],
        );
      }

      console.log(`User Disconnected: ${socket.id}`);
    });
  });
};

export default initializeSocket;
