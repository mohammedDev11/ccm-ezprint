const mongoose = require("mongoose");

const { Schema } = mongoose;

const printerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    model: { type: String, default: "" },
    serialNumber: { type: String, default: "" },
    location: {
      building: { type: String, default: "" },
      room: { type: String, default: "" },
      floor: { type: Number, default: null },
      coordinates: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
    },
    department: { type: String, default: "" },
    status: {
      current: { type: String, enum: ["Online", "Offline", "Maintenance"], default: "Online" },
      lastCheckedAt: { type: Date, default: null },
      uptime: { type: Number, default: 0 },
      toner: {
        level: { type: Number, default: 100 },
        lowThreshold: { type: Number, default: 20 },
        alertSent: { type: Boolean, default: false },
      },
      paper: {
        level: { type: Number, default: 100 },
        lowThreshold: { type: Number, default: 30 },
        alertSent: { type: Boolean, default: false },
      },
      errorDetails: { type: String, default: "" },
      errorSince: { type: Date, default: null },
    },
    capabilities: {
      supported: { type: [String], default: [] },
      defaultSettings: {
        colorMode: { type: String, default: "B&W" },
        printMode: { type: String, enum: ["Simplex", "Duplex"], default: "Simplex" },
        paperSize: { type: String, default: "" },
        quality: { type: String, default: "" },
      },
    },
    queue: {
      assignedQueueId: { type: Schema.Types.ObjectId, ref: "Queue", default: null },
      queueName: { type: String, default: "" },
      enabled: { type: Boolean, default: true },
      manualReleaseRequired: { type: Boolean, default: true },
      pinRequired: { type: Boolean, default: true },
    },
    costPerPage: { type: Number, default: 0.05 },
    network: {
      ipAddress: { type: String, default: "" },
      macAddress: { type: String, default: "" },
      snmpEnabled: { type: Boolean, default: false },
      snmpVersion: { type: String, default: "" },
    },
    statistics: {
      totalPagesPrinted: { type: Number, default: 0 },
      totalJobsSubmitted: { type: Number, default: 0 },
      totalCost: { type: Number, default: 0 },
      averageCostPerJob: { type: Number, default: 0 },
      lastUsedAt: { type: Date, default: null },
      monthlyPageCount: { type: Number, default: 0 },
      monthlyJobCount: { type: Number, default: 0 },
    },
    device: {
      type: { type: String, enum: ["Physical", "Virtual"], default: "Physical" },
      firmwareVersion: { type: String, default: "" },
      driverId: { type: String, default: "" },
    },
    maintenance: {
      lastServiceDate: { type: Date, default: null },
      nextServiceDue: { type: Date, default: null },
      serviceIntervalDays: { type: Number, default: 0 },
      serviceNotes: { type: String, default: "" },
    },
    notes: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Printer || mongoose.model("Printer", printerSchema);
