// backend/models/Expense.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ParticipantSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  share: { type: Number, min: 0 }
}, { _id: false });

const ExpenseSchema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  amount: { type: Number, required: true, min: 0 },
  paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  category: { type: String, trim: true, maxlength: 100, default: 'General' },
  splitType: { type: String, enum: ['EQUAL','PERCENTAGE','CUSTOM'], required: true },
  participants: { type: [ParticipantSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },
  notes: { type: String, trim: true, maxlength: 1000 }
}, {
  timestamps: true
});

/**
 * validate participant's shares sum rule depending on splitType.
 * - For PERCENTAGE: sum of shares should be roughly 100
 * - For CUSTOM: sum of shares should be roughly equal to amount
 * - For EQUAL: shares may be ignored or set equal on server side
 */

ExpenseSchema.pre('validate', function (next) {
  try {
    const totalParticipants = this.participants?.length || 0;
    if (this.splitType === 'PERCENTAGE') {
      const sumPct = this.participants.reduce((s, p) => s + (p.share || 0), 0);
      if (Math.abs(sumPct - 100) > 0.001) {
        return next(new Error('For PERCENTAGE split, participants share must sum to 100.'));
      }
    } else if (this.splitType === 'CUSTOM') {
      const sumAmt = this.participants.reduce((s, p) => s + (p.share || 0), 0);
      // allow tiny floating difference
      if (Math.abs(sumAmt - this.amount) > 0.01) {
        return next(new Error('For CUSTOM split, participant shares must sum to expense amount.'));
      }
    } else {
      // EQUAL: ensure shares present or allow server to compute later
      if (!this.participants || totalParticipants === 0) {
        return next(new Error('At least one participant is required.'));
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

ExpenseSchema.index({ groupId: 1, date: -1 });
ExpenseSchema.index({ paidBy: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);