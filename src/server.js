import app from "./app.js";
import logger from "./logger.js";
import config from "./config.js";

const PORT = config.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT} in ${app.get("env")} mode`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Close server & exit process
  server.close(() => process.exit(1));
});
