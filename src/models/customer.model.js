import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },
  date: { type: Date, default: Date.now },
  time: { type: String },
  countyName: { type: String },
  property: { type: String },
  isBlacklisted: { type: Boolean, default: false },
  blacklistReason: { type: String },
  blacklistedDate: { type: Date },
  blacklistedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

CustomerSchema.index({ firstName: 'text', lastName: 'text', email: 'text', phone: 'text', idNumber: 'text' });
CustomerSchema.index({ isBlacklisted: 1 });
CustomerSchema.index({ 'address.state': 1 });

export default mongoose.model("Customer", CustomerSchema);
