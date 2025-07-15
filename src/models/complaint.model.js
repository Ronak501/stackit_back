import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  motel: { type: mongoose.Schema.Types.ObjectId, ref: 'Motel',required: true },
  description: { type: String, required: true },
  customer: { type: String, required: true },
  user: { type: String, required: true },
  number:{type: String, required: true},
  date: { type: Date, default: Date.now },
  status: {type: String,enum: ['New', 'Under Review', 'Resolved', 'Dismissed'],default: 'New'},
  resolution: {type: String}
}, { timestamps: true });

export default mongoose.model("Complaint", ComplaintSchema);
