const mongoose = require("mongoose");

const { Schema } = mongoose;

const groupSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    groupType: { type: String, enum: ["Department", "Faculty", "Custom", "All Users"], default: "Custom" },
    members: {
      userIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
      count: { type: Number, default: 0 },
      departments: { type: [String], default: [] },
      userTypes: { type: [String], default: [] },
    },
    quota: {
      initialCredit: { type: Number, default: 0 },
      perUserAllocation: { type: Number, default: 0 },
      resetPeriod: { type: String, enum: ["Monthly", "Semester", "Annual", "None"], default: "None" },
      lastResetDate: { type: Date, default: null },
      scheduleAmount: { type: Number, default: 0 },
      scheduleFrequency: { type: String, default: "" },
    },
    access: {
      restricted: { type: Boolean, default: false },
      selectedByDefault: { type: Boolean, default: false },
      enabled: { type: Boolean, default: true },
      requiresApproval: { type: Boolean, default: false },
    },
    permissions: {
      canUpload: { type: Boolean, default: true },
      canRelease: { type: Boolean, default: true },
      allowedQueues: [{ type: Schema.Types.ObjectId, ref: "Queue" }],
      costLimit: { type: Number, default: 0 },
    },
    administration: {
      ownerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
      managers: [{ type: Schema.Types.ObjectId, ref: "User" }],
      createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    },
    statistics: {
      totalPagesAllocated: { type: Number, default: 0 },
      totalPagesPrinted: { type: Number, default: 0 },
      totalJobsSubmitted: { type: Number, default: 0 },
      totalCost: { type: Number, default: 0 },
      monthlyPageCount: { type: Number, default: 0 },
      monthlyJobCount: { type: Number, default: 0 },
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Group || mongoose.model("Group", groupSchema);
