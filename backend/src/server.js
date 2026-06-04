const app = require("./app");
const connectDb = require("./config/db");
const { createServer } = require("http");
const { initSocket } = require("./socket");
const { clientUrl, port } = require("./config/env");

async function start() {
  try {
    await connectDb();
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed during startup:", error.message);
    console.log("Starting server anyway (database features may be unavailable)...");
  }

  try {
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

start();

