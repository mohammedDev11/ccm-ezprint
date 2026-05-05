const mongoose = require("mongoose");

const { Schema } = mongoose;

const quotaTransactionSchema = new Schema(
  {
    user: {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
      username: { type: String, default: "" },
      department: { type: String, default: "" },
    },
    transaction: {
      type: {
        type: String,
        required: true,
        enum: [
          "Print Deduction",
          "Refund",
          "Credit Addition",
          "Adjustment",
          "Manual Override",
          "Group Allocation",
        ],
        index: true,
      },
      amount: { type: Number, required: true },
      reason: { type: String, default: "" },
    },
    quota: {
      amountBefore: { type: Number, default: 0 },
      amountAfter: { type: Number, required: true, min: 0 },
      changed: { type: Number, default: 0 },
    },
    reference: {
      jobId: { type: Schema.Types.ObjectId, ref: "PrintJob", default: null },
      jobIdString: { type: String, default: "" },
      groupId: { type: Schema.Types.ObjectId, ref: "Group", default: null },
      linkedTransactionId: { type: Schema.Types.ObjectId, ref: "QuotaTransaction", default: null },
    },
    metadata: {
      method: { type: String, default: "System" },
      performedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
      performedByUsername: { type: String, default: "" },
      ipAddress: { type: String, default: "" },
      notes: { type: String, default: "" },
      comment: { type: String, default: "" },
    },
    approval: {
      required: { type: Boolean, default: false },
      approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
      approvedAt: { type: Date, default: null },
      status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Approved" },
    },
  },
  { timestamps: true },
);

quotaTransactionSchema.index({ "user.userId": 1, createdAt: -1 });

module.exports =
  mongoose.models.QuotaTransaction ||
  mongoose.model("QuotaTransaction", quotaTransactionSchema);
