const mongoose = require("mongoose");

const { Schema } = mongoose;

const queueSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["Secure Release Queue", "Direct Print", "Managed Queue"], default: "Managed Queue" },
    status: {
      current: { type: String, enum: ["Active", "Paused", "Maintenance"], default: "Active", index: true },
      pausedAt: { type: Date, default: null },
      pauseReason: { type: String, default: "" },
    },
    printers: {
      assigned: [{ type: Schema.Types.ObjectId, ref: "Printer" }],
      default: { type: Schema.Types.ObjectId, ref: "Printer", default: null },
      totalAssigned: { type: Number, default: 0 },
      onlineCount: { type: Number, default: 0 },
    },
    access: {
      allowedRoles: { type: [String], default: ["User", "SubAdmin", "Admin"] },
      allowedGroups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
      allowedDepartments: { type: [String], default: [] },
      restrictedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
      requiresApproval: { type: Boolean, default: false },
      approverIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    security: {
      secureRelease: { type: Boolean, default: true },
      manualReleaseRequired: { type: Boolean, default: true },
      allowReleaseAllJobs: { type: Boolean, default: false },
      requirePrinterAuthentication: { type: Boolean, default: true },
      releaseMethod: { type: String, enum: ["PIN", "Card", "Biometric", "Manual"], default: "PIN" },
    },
    jobManagement: {
      retentionHours: { type: Number, default: 24 },
      autoDeleteExpired: { type: Boolean, default: true },
      maxConcurrentJobs: { type: Number, default: 0 },
      jobQueueTimeout: { type: Number, default: 0 },
    },
    statistics: {
      totalJobs: { type: Number, default: 0 },
      pendingJobs: { type: Number, default: 0 },
      printedToday: { type: Number, default: 0 },
      printedThisMonth: { type: Number, default: 0 },
      averageWaitTime: { type: Number, default: 0 },
      totalPagesPrinted: { type: Number, default: 0 },
    },
    notifications: {
      enabled: { type: Boolean, default: false },
      alertOnPendingJobs: { type: Boolean, default: false },
      alertThreshold: { type: Number, default: 0 },
      emailNotifications: { type: Boolean, default: false },
      emailRecipients: { type: [String], default: [] },
    },
    notes: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Queue || mongoose.model("Queue", queueSchema);
