const { Schema, model } = require('mongoose');

const auditLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    ts: {
      type: Date,
      default: Date.now,
    },
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    versionKey: false,
  }
);

auditLogSchema.index({ action: 1, ts: 1 });

module.exports = model('AuditLog', auditLogSchema);
