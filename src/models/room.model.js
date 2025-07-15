import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  motel: { type: mongoose.Schema.Types.ObjectId, ref: 'Motel',required: true },
  number: { type: String, required: true },
  dateUpdated: { type: Date, default: Date.now },
  price: { type: Number },
  dnr: { type: Boolean, default: false },
  county: { type: mongoose.Schema.Types.ObjectId, ref: 'County' }
}, { timestamps: true });

// Compound index to ensure room numbers are unique per motel
RoomSchema.index({ motel: 1, number: 1 }, { unique: true });

export default mongoose.model("Room", RoomSchema);
