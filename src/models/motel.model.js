import mongoose from 'mongoose';

const MotelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true},
  address: { type: String},
  contactNumber: { type: String},
  email: { type: String},
  active: { type: Boolean, default: true}
}, { timestamps: true });

export default mongoose.model("Motel", MotelSchema);
    