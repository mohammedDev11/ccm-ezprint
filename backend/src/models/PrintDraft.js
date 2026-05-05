const mongoose = require("mongoose");

const { Schema } = mongoose;

const printDraftFileSchema = new Schema(
  {
    originalFileName: { type: String, default: "" },
    fileName: { type: String, default: "" },
    fileType: { type: String, default: "application/pdf" },
    fileSize: { type: Number, default: 0 },
    pages: { type: Number, default: 1 },
    storagePath: { type: String, default: "" },
    storedFileName: { type: String, default: "" },
    storedAt: { type: Date, default: null },
    checksumSha256: { type: String, default: "" },
  },
  { _id: true },
);

const printDraftSchema = new Schema(
  {
    user: {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
      username: { type: String, default: "" },
      department: { type: String, default: "" },
    },
    name: { type: String, default: "Untitled draft", trim: true },
    source: {
      createdFrom: {
        type: String,
        enum: ["print-page", "pending-job"],
        default: "print-page",
      },
      clientType: { type: String, default: "Web Print Draft" },
    },
    settings: {
      queueId: { type: Schema.Types.ObjectId, ref: "Queue", default: null },
      queueName: { type: String, default: "" },
      documentName: { type: String, default: "" },
      copies: { type: Number, default: 1 },
      colorMode: { type: String, default: "Black & White" },
      mode: { type: String, enum: ["Simplex", "Duplex"], default: "Simplex" },
      paperSize: { type: String, default: "A4" },
      quality: { type: String, default: "Normal" },
    },
    files: { type: [printDraftFileSchema], default: [] },
  },
  { timestamps: true },
);

printDraftSchema.index({ "user.userId": 1, updatedAt: -1 });

module.exports =
  mongoose.models.PrintDraft || mongoose.model("PrintDraft", printDraftSchema);
