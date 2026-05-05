const mongoose = require("mongoose");
const env = require("../config/env");

const { Schema } = mongoose;

const systemSettingsSchema = new Schema(
  {
    key: {
      type: String,
      default: "global",
      unique: true,
      immutable: true,
      index: true,
    },
    general: {
      systemName: { type: String, default: "EzPrint", trim: true },
      defaultLanguage: { type: String, default: "English", trim: true },
      defaultTheme: {
        type: String,
        enum: ["system", "light", "dark"],
        default: "system",
      },
      supportMessage: { type: String, default: "", trim: true },
    },
    printing: {
      defaultPaperSize: { type: String, default: "A4" },
      defaultColorMode: { type: String, default: "Black & White" },
      defaultSides: { type: String, enum: ["Simplex", "Duplex"], default: "Simplex" },
      pendingJobRetentionHours: { type: Number, default: 24, min: 1, max: 720 },
    },
    fileDrafts: {
      allowedUploadTypes: { type: [String], default: ["PDF"] },
      officeConversionEnabled: { type: Boolean, default: false },
      draftRetentionDays: { type: Number, default: 30, min: 1, max: 365 },
      maxFileSize: { type: String, default: () => env.printUploadLimit },
    },
    notifications: {
      printerIssueNotifications: { type: Boolean, default: true },
      jobFailureNotifications: { type: Boolean, default: true },
      lowQuotaNotifications: { type: Boolean, default: true },
    },
    updatedBy: {
      userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
      username: { type: String, default: "" },
      role: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.SystemSettings ||
  mongoose.model("SystemSettings", systemSettingsSchema);
