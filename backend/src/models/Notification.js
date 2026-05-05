const mongoose = require("mongoose");

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    title: { type: String, default: "" },
    message: { type: String, default: "" },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: [
        "printer_offline",
        "printer_online",
        "toner_low",
        "paper_low",
        "job_printed",
        "job_failed",
        "job_refunded",
        "device_error",
        "queue_warning",
        "maintenance_reminder",
        "system_warning",
        "security_alert",
      ],
      index: true,
    },
    source: {
      type: String,
      enum: ["Printer", "Device", "Queue", "System", "Report Scheduler", "Admin"],
      index: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "error", "critical"],
      default: "info",
    },
    targetAudience: {
      roles: { type: [String], default: ["Admin"] },
      specificUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
      departments: { type: [String], default: [] },
      groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
    },
    relatedTo: {
      printerId: { type: Schema.Types.ObjectId, ref: "Printer", default: null },
      printerName: { type: String, default: "" },
      jobId: { type: Schema.Types.ObjectId, ref: "PrintJob", default: null },
      userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
      queueId: { type: Schema.Types.ObjectId, ref: "Queue", default: null },
    },
    details: {
      errorCode: { type: String, default: "" },
      errorMessage: { type: String, default: "" },
      actionRequired: { type: Boolean, default: false },
      suggestedAction: { type: String, default: "" },
      affectedDevice: { type: String, default: "" },
    },
    status: {
      current: {
        type: String,
        enum: ["unread", "read", "resolved", "dismissed", "archived"],
        default: "unread",
        index: true,
      },
      readAt: { type: Date, default: null },
      resolvedAt: { type: Date, default: null },
      dismissedAt: { type: Date, default: null },
    },
    delivery: {
      inApp: { type: Boolean, default: true },
      emailSent: { type: Boolean, default: false },
      emailSentAt: { type: Date, default: null },
      smsSent: { type: Boolean, default: false },
      smsSentAt: { type: Date, default: null },
      pushSent: { type: Boolean, default: false },
      pushSentAt: { type: Date, default: null },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ "status.current": 1, createdAt: -1 });

module.exports =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
