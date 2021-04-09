import pino from 'pino';

export const logger = pino({
   name: "shell",
   level: process.env.LOG_LEVEL || "warn",
   prettyPrint:
      process.env.NODE_ENV !== "production" ||
      process.env.LOG_PRETTY_PRINT === "true",
});