const app = require("./app");
const connectDb = require("./config/db");
const { createServer } = require("http");
const { initSocket } = require("./socket");
const { clientUrl, port } = require("./config/env");

async function start() {
  try {
    await connectDb();
    const httpServer = createServer(app);
    const io = initSocket(httpServer, clientUrl);
    app.locals.io = io;

    httpServer.listen(port, () => {
      console.log(`API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

start(); // Trigger dev server restart after starting local MongoDB

