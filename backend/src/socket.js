const { Server } = require("socket.io");

function initSocket(httpServer, clientUrl) {
  const io = new Server(httpServer, {
    cors: {
      origin: clientUrl,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("register-user", (userId) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
    });
  });

  return io;
}

module.exports = { initSocket };
