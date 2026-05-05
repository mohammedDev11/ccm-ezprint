const app = require("./app");
const env = require("./config/env");
const { connectDatabase } = require("./config/db");
const { ensureDefaultPrinterSetup } = require("./modules/printers/printer.provision.service");
const { ensureLocalDemoPasswords } = require("./seeds/localDemoPasswords");

const getMongoConnectionSummary = () => {
  const uri = env.mongoUri || "";
  const scheme = uri.startsWith("mongodb+srv://")
    ? "mongodb+srv"
    : uri.startsWith("mongodb://")
      ? "mongodb"
      : "unknown";
  const host = uri
    .replace(/^mongodb(\+srv)?:\/\//, "")
    .split("/")[0]
    .split("@")
    .pop();

  return {
    scheme,
    host: host || "not configured",
    dbName: env.mongoDbName,
  };
};

const logStartupError = (error) => {
  console.error("Failed to start server:", error.message);

  if (
    ["ETIMEOUT", "ENOTFOUND", "ECONNREFUSED"].includes(error.code) ||
    /query(Txt|Srv|getaddrinfo)/i.test(error.message || "")
  ) {
    const mongo = getMongoConnectionSummary();

    console.error("MongoDB connection diagnostic:", {
      code: error.code || "unknown",
      scheme: mongo.scheme,
      host: mongo.host,
      dbName: mongo.dbName,
      hint:
        "MongoDB Atlas DNS/connectivity failed before the app started. Check internet/DNS/VPN/Atlas network access for the configured MongoDB host.",
    });
  }
};

const startServer = async () => {
  try {
    const connection = await connectDatabase();
    console.log(`MongoDB connected: ${connection.name}`);
    await ensureDefaultPrinterSetup();
    await ensureLocalDemoPasswords();

    app.listen(env.port, () => {
      console.log(
        `Alpha Queue API listening on port ${env.port} in ${env.nodeEnv} mode`
      );
    });
  } catch (error) {
    logStartupError(error);
    process.exit(1);
  }
};

startServer();
