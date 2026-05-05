const mongoose = require("mongoose");

const { Schema } = mongoose;

const SHARED_ACCOUNT_STATUSES = ["active", "review", "archived"];
const LINKED_ACCOUNT_STATUSES = ["active", "inactive", "suspended"];

const linkedAccountSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    username: { type: String, required: true, trim: true },
    identifier: { type: String, default: "", trim: true },
    department: { type: String, default: "", trim: true },
    role: { type: String, default: "", trim: true },
    status: { type: String, enum: LINKED_ACCOUNT_STATUSES, default: "active" },
    balance: { type: Number, default: 0 },
    pages: { type: Number, default: 0 },
    jobs: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: null },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const sharedAccountSchema = new Schema(
  {
    primaryAccount: {
      userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
      username: { type: String, required: true, trim: true },
    },
    linkedAccounts: { type: [linkedAccountSchema], default: [] },
    linkedRoles: { type: [String], default: [] },
    department: { type: String, default: "", trim: true },
    status: { type: String, enum: SHARED_ACCOUNT_STATUSES, default: "active", index: true },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

sharedAccountSchema.index({ "primaryAccount.username": 1 }, { unique: true });

const SharedAccount =
  mongoose.models.SharedAccount || mongoose.model("SharedAccount", sharedAccountSchema);

module.exports = SharedAccount;
module.exports.SharedAccount = SharedAccount;
module.exports.SHARED_ACCOUNT_STATUSES = SHARED_ACCOUNT_STATUSES;
module.exports.LINKED_ACCOUNT_STATUSES = LINKED_ACCOUNT_STATUSES;
