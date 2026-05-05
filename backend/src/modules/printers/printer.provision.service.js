const Printer = require("../../models/Printer");
const Queue = require("../../models/Queue");
const env = require("../../config/env");

const toIdString = (value) => value?.toString?.() || "";

const DEFAULT_CAPABILITIES = ["B&W", "Duplex", "Secure Release", "PDF"];
const LEGACY_DEFAULT_QUEUE_NAMES = ["HP MFP M830 Secure Release Queue"];
const DEFAULT_QUEUE_DESCRIPTION = "Secure-release queue for CCM printers.";

const getDefaultPrinterConfig = () => ({
  ipAddress: env.printDefaultPrinterIp.trim(),
  name: env.printDefaultPrinterName.trim(),
  model: env.printDefaultPrinterModel,
  building: env.printDefaultPrinterBuilding,
  room: env.printDefaultPrinterRoom,
  department: env.printDefaultPrinterDepartment,
  locationCode: env.printDefaultPrinterLocationCode,
  queueName: env.printDefaultQueueName,
  costPerPage: env.printDefaultCostPerPage,
  capabilities: DEFAULT_CAPABILITIES,
  isPrimaryDefault: true,
});

const getAdditionalPrinterConfigs = () =>
  (env.printAdditionalPrinters || []).map((printer, index) => ({
    ipAddress: printer.ipAddress,
    name: printer.name || `Additional Printer ${index + 2}`,
    model: printer.model || printer.name || `Additional Printer ${index + 2}`,
    building: printer.building || env.printDefaultPrinterBuilding,
    room: printer.room || "",
    department: printer.department || env.printDefaultPrinterDepartment,
    locationCode:
      printer.locationCode ||
      [printer.building || env.printDefaultPrinterBuilding, printer.room]
        .filter(Boolean)
        .join("/"),
    serialNumber: printer.serialNumber,
    firmwareVersion: printer.firmwareVersion,
    queueName: printer.queueName || env.printDefaultQueueName,
    costPerPage: Number.isFinite(printer.costPerPage)
      ? printer.costPerPage
      : env.printDefaultCostPerPage,
    capabilities: printer.capabilities?.length
      ? printer.capabilities
      : DEFAULT_CAPABILITIES,
    isPrimaryDefault: false,
  }));

const findExistingPrinter = async ({ ipAddress, name }) => {
  if (ipAddress) {
    const printerByIp = await Printer.findOne({ "network.ipAddress": ipAddress });
    if (printerByIp) {
      return printerByIp;
    }
  }

  if (name) {
    return Printer.findOne({ name });
  }

  return null;
};

const applyPrinterConfig = (printer, config) => {
  printer.name = config.name || env.printDefaultPrinterName;
  printer.model = config.model || config.name || env.printDefaultPrinterModel;
  printer.department = config.department || env.printDefaultPrinterDepartment;
  printer.location = {
    ...printer.location,
    building: config.building || "",
    room: config.room || "",
    floor: printer.location?.floor ?? null,
    coordinates: {
      lat: printer.location?.coordinates?.lat ?? null,
      lng: printer.location?.coordinates?.lng ?? null,
    },
  };
  printer.status = {
    ...printer.status,
    current: "Online",
    lastCheckedAt: new Date(),
    toner: {
      level: printer.status?.toner?.level ?? 100,
      lowThreshold: printer.status?.toner?.lowThreshold ?? 20,
      alertSent: printer.status?.toner?.alertSent ?? false,
    },
    paper: {
      level: printer.status?.paper?.level ?? 100,
      lowThreshold: printer.status?.paper?.lowThreshold ?? 30,
      alertSent: printer.status?.paper?.alertSent ?? false,
    },
    errorDetails: "",
    uptime: printer.status?.uptime ?? 0,
  };
  printer.capabilities = {
    ...printer.capabilities,
    supported: Array.from(
      new Set([
        ...(printer.capabilities?.supported || []),
        ...(config.capabilities || DEFAULT_CAPABILITIES),
      ]),
    ),
    defaultSettings: {
      colorMode: printer.capabilities?.defaultSettings?.colorMode || "B&W",
      printMode: printer.capabilities?.defaultSettings?.printMode || "Simplex",
      paperSize: printer.capabilities?.defaultSettings?.paperSize || "A4",
      quality: printer.capabilities?.defaultSettings?.quality || "Normal",
    },
  };
  printer.costPerPage = Number.isFinite(config.costPerPage)
    ? config.costPerPage
    : env.printDefaultCostPerPage;
  printer.network = {
    ...printer.network,
    ipAddress: config.ipAddress,
  };
  if (config.serialNumber) {
    printer.serialNumber = config.serialNumber;
  }
  if (config.firmwareVersion) {
    printer.device = {
      ...printer.device,
      firmwareVersion: config.firmwareVersion,
    };
  }
  printer.notes = `Provisioned for secure-release web printing at ${
    config.locationCode || "the configured location"
  }.`;
  printer.isActive = true;
};

const upsertPrinter = async (config) => {
  let printer = await findExistingPrinter(config);

  if (!printer) {
    printer = new Printer();
  }

  applyPrinterConfig(printer, config);
  await printer.save();

  return printer;
};

const buildUniqueAssignedIds = (...printerGroups) => {
  const seen = new Set();
  const assigned = [];

  printerGroups.flat().forEach((printer) => {
    const id = printer?._id || printer;
    const idString = toIdString(id);

    if (!idString || seen.has(idString)) {
      return;
    }

    seen.add(idString);
    assigned.push(id);
  });

  return assigned;
};

const updatePrinterQueueLink = async (printer, queue) => {
  if (!printer || !queue) {
    return;
  }

  if (
    toIdString(printer.queue?.assignedQueueId) === toIdString(queue._id) &&
    printer.queue?.queueName === queue.name
  ) {
    return;
  }

  printer.queue = {
    ...printer.queue,
    assignedQueueId: queue._id,
    queueName: queue.name,
    enabled: true,
    manualReleaseRequired: true,
    pinRequired: false,
  };
  await printer.save();
};

const findQueueForConfig = async (config) => {
  const queue = await Queue.findOne({ name: config.queueName });

  if (queue) {
    return queue;
  }

  const canUseLegacyDefaultQueue =
    config.isPrimaryDefault || config.queueName === env.printDefaultQueueName;

  if (!canUseLegacyDefaultQueue) {
    return null;
  }

  return Queue.findOne({
    name: { $in: LEGACY_DEFAULT_QUEUE_NAMES },
  });
};

const upsertQueueForPrinter = async ({ config, printer, defaultPrinter }) => {
  let queue = await findQueueForConfig(config);

  if (!queue) {
    queue = new Queue();
  }

  const existingAssigned = queue.printers?.assigned || [];
  const shouldKeepDefault =
    config.queueName === env.printDefaultQueueName || config.isPrimaryDefault;
  const defaultPrinterId =
    shouldKeepDefault && defaultPrinter?._id
      ? defaultPrinter._id
      : queue.printers?.default || printer._id;
  const assigned = buildUniqueAssignedIds(
    shouldKeepDefault && defaultPrinter ? [defaultPrinter] : [],
    existingAssigned,
    [printer],
  );
  const assignedPrinters = await Printer.find({ _id: { $in: assigned } });

  queue.name = config.queueName;
  queue.description =
    config.queueName === env.printDefaultQueueName
      ? DEFAULT_QUEUE_DESCRIPTION
      : queue.description || `Secure-release queue for ${config.name || printer.name}.`;
  queue.type = "Secure Release Queue";
  queue.status = {
    ...queue.status,
    current: "Active",
    pausedAt: null,
    pauseReason: "",
  };
  queue.printers = {
    ...queue.printers,
    assigned,
    default: defaultPrinterId,
    totalAssigned: assigned.length,
    onlineCount: assignedPrinters.filter(
      (assignedPrinter) => assignedPrinter.status?.current === "Online",
    ).length,
  };
  queue.access = {
    ...queue.access,
    allowedRoles: ["User", "SubAdmin", "Admin"],
    allowedGroups: queue.access?.allowedGroups || [],
    allowedDepartments: queue.access?.allowedDepartments || [],
    restrictedUsers: queue.access?.restrictedUsers || [],
    requiresApproval: false,
    approverIds: [],
  };
  queue.security = {
    ...queue.security,
    secureRelease: true,
    manualReleaseRequired: true,
    allowReleaseAllJobs: true,
    requirePrinterAuthentication: false,
    releaseMethod: "PIN",
  };
  queue.jobManagement = {
    ...queue.jobManagement,
    retentionHours: queue.jobManagement?.retentionHours || 24,
    autoDeleteExpired: true,
    maxConcurrentJobs: queue.jobManagement?.maxConcurrentJobs || 0,
    jobQueueTimeout: queue.jobManagement?.jobQueueTimeout || 0,
  };
  queue.notifications = {
    ...queue.notifications,
    enabled: false,
  };
  queue.isActive = true;

  await queue.save();
  await Promise.all(
    assignedPrinters.map((assignedPrinter) => updatePrinterQueueLink(assignedPrinter, queue)),
  );

  return queue;
};

const ensureDefaultPrinterSetup = async () => {
  const defaultConfig = getDefaultPrinterConfig();

  if (!defaultConfig.ipAddress) {
    return {
      printer: null,
      queue: null,
      additionalPrinters: [],
    };
  }

  const printer = await upsertPrinter(defaultConfig);
  const queue = await upsertQueueForPrinter({
    config: defaultConfig,
    printer,
    defaultPrinter: printer,
  });
  const additionalPrinters = [];

  for (const config of getAdditionalPrinterConfigs()) {
    if (!config.ipAddress) {
      continue;
    }

    const additionalPrinter = await upsertPrinter(config);
    await upsertQueueForPrinter({
      config,
      printer: additionalPrinter,
      defaultPrinter: printer,
    });
    additionalPrinters.push(additionalPrinter);
  }

  return {
    printer,
    queue,
    additionalPrinters,
  };
};

module.exports = {
  ensureDefaultPrinterSetup,
};
