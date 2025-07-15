import mongoose from 'mongoose';

const EmployeeScheduleSchema = new mongoose.Schema({
  employeeName: { type: String, required: true, unique: true }, // Custom employee name
  motel: { type: mongoose.Schema.Types.ObjectId, ref: 'Motel', required: [true, 'Motel is required']},
  monday:   { type: String, default: '' },
  tuesday:  { type: String, default: '' },
  wednesday:{ type: String, default: '' },
  thursday: { type: String, default: '' },
  friday:   { type: String, default: '' },
  saturday: { type: String, default: '' },
  sunday:   { type: String, default: '' },
}, { timestamps: true });

// Compound index to ensure unique employee per motel
EmployeeScheduleSchema.index({ employeeName: 1, motel: 1 }, { unique: true });  

export default mongoose.model('EmployeeSchedule', EmployeeScheduleSchema);
