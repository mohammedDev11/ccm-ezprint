const mongoose = require("mongoose");

const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    actor: {
      userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
      username: { type: String, default: "" },
      role: { type: String, default: "" },
      ipAddress: { type: String, default: "" },
      userAgent: { type: String, default: "" },
    },
    action: {
      name: { type: String, default: "" },
      category: {
        type: String,
        enum: ["User", "Printer", "Queue", "Job", "Quota", "Group", "Security", "System"],
        index: true,
      },
      details: { type: String, default: "" },
    },
    resource: {
      type: { type: String, default: "" },
      id: { type: Schema.Types.ObjectId, default: null },
      name: { type: String, default: "" },
      changes: { type: Schema.Types.Mixed, default: {} },
    },
    outcome: {
      success: { type: Boolean, default: true },
      statusCode: { type: Number, default: 200 },
      errorMessage: { type: String, default: "" },
    },
    performedAt: { type: Date, default: Date.now, index: true },
    duration: { type: Number, default: 0 },
  },
  { timestamps: true },
);

auditLogSchema.index({ "actor.userId": 1, performedAt: -1 });
auditLogSchema.index({ "action.category": 1, performedAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

module.exports = AuditLog;
module.exports.AuditLog = AuditLog;
