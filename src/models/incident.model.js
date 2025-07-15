import mongoose from 'mongoose';

const IncidentSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room',required: true },
  type: { type: String, enum: ['Police', 'Fire', 'Robbery', 'Other'],required: true },
  user: { type: String, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String },
  status: {type: String,enum: ['Open', 'Closed'],default: 'Open'}
}, { timestamps: true });

export default mongoose.model("Incident", IncidentSchema);
