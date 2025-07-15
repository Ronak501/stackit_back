import mongoose from 'mongoose';

const LeaveApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User',required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  workDate: { type: Date, required: true },
  motel: {type: String, required: true}, // Assuming motel is a string, adjust if it's a reference to another model
  leaveType: { type: String, enum: ['Sick', 'Vacation', 'Personal', 'Emergency', 'Other'],required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'],default: 'Pending'},
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalDate: { type: Date },
  rejectionReason: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Create indexes for efficient searching
LeaveApplicationSchema.index({ user: 1 });
LeaveApplicationSchema.index({ status: 1 });
LeaveApplicationSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model("LeaveApplication", LeaveApplicationSchema);
