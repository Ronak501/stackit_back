import mongoose from 'mongoose';
import bcrypt from 'mongoose-bcrypt';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true,bcrypt: true},
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String, enum: ['admin', 'manager', 'staff', 'maintenance'],default: 'staff'},
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  assignedMotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Motel' }],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

// Add bcrypt plugin for password hashing
UserSchema.plugin(bcrypt);

// Method to check if user has access to a specific motel
UserSchema.methods.hasMotelAccess = function(motelId) {
  if (this.role === 'admin') return true;
  return this.assignedMotels.some(m => m.equals(motelId));
};

export default mongoose.model("User", UserSchema);
