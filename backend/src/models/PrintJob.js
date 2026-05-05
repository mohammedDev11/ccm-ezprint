const mongoose = require("mongoose");

const { Schema } = mongoose;

const printJobDocumentSchema = new Schema(
  {
    fileName: { type: String, default: "" },
    fileType: { type: String, default: "pdf" },
    fileSize: { type: Number, default: 0 },
    pages: { type: Number, default: 1, min: 1 },
    originalFileName: { type: String, default: "" },
    storagePath: { type: String, default: "" },
    storedFileName: { type: String, default: "" },
    storedAt: { type: Date, default: null },
    checksumSha256: { type: String, default: "" },
  },
  { _id: true },
);

const printJobSchema = new Schema(
  {
    jobId: { type: String, required: true, unique: true, trim: true },
    documentName: { type: String, default: "" },
    user: {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
      username: { type: String, default: "" },
      department: { type: String, default: "" },
    },
    printer: {
      printerId: { type: Schema.Types.ObjectId, ref: "Printer", default: null, index: true },
      printerName: { type: String, default: "" },
      queueId: { type: Schema.Types.ObjectId, ref: "Queue", default: null, index: true },
      queueName: { type: String, default: "" },
    },
    document: {
      fileName: { type: String, default: "" },
      fileType: { type: String, default: "pdf" },
      fileSize: { type: Number, default: 0 },
      pages: { type: Number, required: true, min: 1 },
      fileCount: { type: Number, default: 1 },
      originalFileName: { type: String, default: "" },
      storagePath: { type: String, default: "" },
      storedFileName: { type: String, default: "" },
      storedAt: { type: Date, default: null },
      checksumSha256: { type: String, default: "" },
    },
    documents: { type: [printJobDocumentSchema], default: [] },
    printSettings: {
      colorMode: { type: String, default: "B&W" },
      mode: { type: String, enum: ["Simplex", "Duplex"], default: "Simplex" },
      paperSize: { type: String, default: "A4" },
      quality: { type: String, default: "" },
      copies: { type: Number, default: 1 },
      attributes: { type: [String], default: [] },
      options: { type: [String], default: [] },
    },
    source: {
      clientType: { type: String, default: "Web Upload" },
      sourceIp: { type: String, default: "" },
      userAgent: { type: String, default: "" },
    },
    status: {
      current: {
        type: String,
        enum: ["Pending Release", "Printed", "Refunded", "Failed", "Cancelled", "Held"],
        default: "Pending Release",
        index: true,
      },
      submittedAt: { type: Date, default: Date.now },
      printedAt: { type: Date, default: null },
      cancelledAt: { type: Date, default: null },
      releasedAt: { type: Date, default: null },
      dispatchedAt: { type: Date, default: null },
      readinessPercent: { type: Number, min: 0, max: 100, default: 0 },
    },
    cost: {
      costPerPage: { type: Number, default: 0 },
      totalCost: { type: Number, required: true, min: 0 },
      quotaDeducted: { type: Boolean, default: false },
      refundedAmount: { type: Number, default: 0 },
      refundedAt: { type: Date, default: null },
    },
    release: {
      method: { type: String, enum: ["PIN", "Card", "Manual", "Biometric"], default: "PIN" },
      pinHash: { type: String, default: "" },
      cardId: { type: String, default: "" },
      releaseCode: { type: String, default: "" },
      releaseCodeExpiry: { type: Date, default: null },
      maxReleaseAttempts: { type: Number, default: 0 },
      failedReleaseAttempts: { type: Number, default: 0 },
    },
    dispatch: {
      method: { type: String, default: "" },
      targetHost: { type: String, default: "" },
      targetPort: { type: Number, default: 0 },
      destinationName: { type: String, default: "" },
      attempts: { type: Number, default: 0 },
      lastAttemptAt: { type: Date, default: null },
      lastSuccessfulAt: { type: Date, default: null },
      bytesSent: { type: Number, default: 0 },
      jobReference: { type: String, default: "" },
    },
    notes: { type: String, default: "" },
    errorMessage: { type: String, default: "" },
  },
  { timestamps: true },
);

printJobSchema.index({ "user.userId": 1, "status.current": 1 });
printJobSchema.index({ "printer.printerId": 1, "status.submittedAt": -1 });

module.exports = mongoose.models.PrintJob || mongoose.model("PrintJob", printJobSchema);
