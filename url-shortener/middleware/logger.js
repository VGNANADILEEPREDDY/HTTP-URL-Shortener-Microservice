// Custom Logging Middleware (not console.log)
import fs from "fs";
import path from "path";

const logFile = path.join(process.cwd(), "requests.log");

export const loggerMiddleware = (req, res, next) => {
  const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} Body: ${JSON.stringify(req.body)}\n`;
  fs.appendFileSync(logFile, logEntry); // persist logs to file
  next();
};
