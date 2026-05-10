const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const apiRoutes = require("./routes");

const app = express();
const allowedOrigins = (
  process.env.CLIENT_ORIGIN || "http://localhost:3000,http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

console.log("Allowed CORS origins:", allowedOrigins);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use("/api/v1", apiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || "Internal server error";

  if (env.nodeEnv !== "production") {
    console.error(error);
  }

  res.status(status).json({
    success: false,
    message,
  });
});

module.exports = app;
