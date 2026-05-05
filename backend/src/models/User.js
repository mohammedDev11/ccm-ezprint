const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { Schema } = mongoose;

const USER_ROLES = ["Admin", "SubAdmin", "User"];

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, unique: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    passwordHash: { type: String, required: true, select: false },
    systemRole: { type: String, enum: USER_ROLES, default: "User", index: true },
    userType: { type: String, enum: ["Student", "Faculty", "Staff"], default: "Student" },
    department: { type: String, default: "", trim: true },
    standing: { type: String, default: "Active", trim: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", default: null },
    auth: {
      ssoProvider: { type: String, default: "" },
      externalId: { type: String, default: "", index: true },
      lastLoginAt: { type: Date, default: null },
    },
    printing: {
      enabled: { type: Boolean, default: true },
      restricted: { type: Boolean, default: false },
      quota: {
        remaining: { type: Number, default: 0, min: 0 },
        lastResetAt: { type: Date, default: null },
        resetPeriod: { type: String, default: "" },
        maxAccumulation: { type: Number, default: 0 },
      },
      primaryCardId: { type: String, default: "" },
      printerPinHash: { type: String, default: "", select: false },
      defaultQueueId: { type: Schema.Types.ObjectId, ref: "Queue", default: null },
      pinLoginEnabled: { type: Boolean, default: false },
      failedPinAttempts: { type: Number, default: 0 },
      pinLockedUntil: { type: Date, default: null },
    },
    statistics: {
      totalPagesPrinted: { type: Number, default: 0 },
      totalJobsSubmitted: { type: Number, default: 0 },
      lastActivityAt: { type: Date, default: null },
    },
    preferences: {
      ui: {
        theme: {
          type: String,
          enum: ["system", "light", "dark"],
          default: "system",
        },
        navbarMode: {
          type: String,
          enum: ["left", "right", "bottom", "top"],
          default: "left",
        },
      },
      printing: {
        defaultPaperSize: { type: String, default: "A4" },
        defaultColorMode: { type: String, default: "Black & White" },
        defaultSides: { type: String, enum: ["Simplex", "Duplex"], default: "Simplex" },
        preferredQueueId: { type: Schema.Types.ObjectId, ref: "Queue", default: null },
      },
      drafts: {
        showSavedDrafts: { type: Boolean, default: true },
        autoSaveDrafts: { type: Boolean, default: false },
      },
      notifications: {
        printSuccess: { type: Boolean, default: true },
        printFailure: { type: Boolean, default: true },
        lowQuota: { type: Boolean, default: true },
        quotaUpdates: { type: Boolean, default: true },
      },
    },
    notes: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("role")
  .get(function getRole() {
    return this.systemRole;
  })
  .set(function setRole(value) {
    this.systemRole = value;
  });

userSchema.virtual("restricted")
  .get(function getRestricted() {
    return this.printing?.restricted ?? false;
  })
  .set(function setRestricted(value) {
    if (!this.printing) {
      this.printing = {};
    }

    this.printing.restricted = value;
  });

userSchema.virtual("lastActivity")
  .get(function getLastActivity() {
    return this.statistics?.lastActivityAt ?? null;
  })
  .set(function setLastActivity(value) {
    if (!this.statistics) {
      this.statistics = {};
    }

    this.statistics.lastActivityAt = value;
  });

userSchema.virtual("ssoProvider")
  .get(function getSsoProvider() {
    return this.auth?.ssoProvider ?? "";
  })
  .set(function setSsoProvider(value) {
    if (!this.auth) {
      this.auth = {};
    }

    this.auth.ssoProvider = value;
  });

userSchema.virtual("ssoExternalId")
  .get(function getSsoExternalId() {
    return this.auth?.externalId ?? "";
  })
  .set(function setSsoExternalId(value) {
    if (!this.auth) {
      this.auth = {};
    }

    this.auth.externalId = value;
  });

userSchema.pre("save", function normalizeIdentity(next) {
  if (this.username) {
    this.username = this.username.trim().toLowerCase();
  }

  if (this.email) {
    this.email = this.email.trim().toLowerCase();
  }

  next();
});

userSchema.methods.setPassword = async function setPassword(password) {
  const saltRounds = 10;
  this.passwordHash = await bcrypt.hash(password, saltRounds);
};

userSchema.methods.validatePassword = async function validatePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const quota = this.printing?.quota?.remaining ?? 0;

  return {
    id: this._id.toString(),
    username: this.username,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    role: this.role,
    systemRole: this.systemRole,
    userType: this.userType,
    standing: this.standing,
    department: this.department,
    restricted: this.restricted,
    printing: this.printing,
    quota,
    balance: quota,
    groupId: this.groupId,
    notes: this.notes,
    preferences: this.preferences,
    isActive: this.isActive,
    lastActivity: this.lastActivity,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
module.exports.User = User;
module.exports.USER_ROLES = USER_ROLES;
