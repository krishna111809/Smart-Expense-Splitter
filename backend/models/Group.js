const mongoose = require('mongoose');
const { Schema } = mongoose;

const MemberSubSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  displayName: { type: String, required: true, trim: true },
  role: { type: String, enum: ['owner','admin','member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const GroupSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 500 },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: { type: [MemberSubSchema], default: [] },
  currency: { type: String, default: 'INR', trim: true },
  isPublic: { type: Boolean, default: false } // optionally allow public groups
}, {
  timestamps: true
});

// quick index to find groups by owner or member
GroupSchema.index({ owner: 1 });
GroupSchema.index({ 'members.userId': 1 });

module.exports = mongoose.model('Group', GroupSchema);