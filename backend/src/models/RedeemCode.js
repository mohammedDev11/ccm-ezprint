const mongoose = require("mongoose");

const { Schema } = mongoose;

const REDEEM_CODE_STATUSES = ["unused", "redeemed", "expired", "disabled"];

const redeemCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    quotaAmount: { type: Number, required: true, min: 0.01 },
    status: {
      type: String,
      enum: REDEEM_CODE_STATUSES,
      default: "unused",
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    redeemedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    redeemedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null, index: true },
    note: { type: String, default: "", trim: true },
    targetUser: { type: Schema.Types.ObjectId, ref: "User", default: null },
    targetGroup: { type: Schema.Types.ObjectId, ref: "Group", default: null },
  },
  { timestamps: true },
);

redeemCodeSchema.index({ status: 1, createdAt: -1 });
redeemCodeSchema.index({ redeemedBy: 1, redeemedAt: -1 });
redeemCodeSchema.index({ targetUser: 1, status: 1 });
redeemCodeSchema.index({ targetGroup: 1, status: 1 });

redeemCodeSchema.pre("save", function normalizeCode(next) {
  if (this.code) {
    this.code = String(this.code).replace(/[\s-]/g, "").trim().toUpperCase();
  }

  next();
});

const RedeemCode =
  mongoose.models.RedeemCode || mongoose.model("RedeemCode", redeemCodeSchema);

module.exports = RedeemCode;
module.exports.RedeemCode = RedeemCode;
module.exports.REDEEM_CODE_STATUSES = REDEEM_CODE_STATUSES;
