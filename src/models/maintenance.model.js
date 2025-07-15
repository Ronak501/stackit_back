// import mongoose from 'mongoose';

// const MaintenanceSchema = new mongoose.Schema({
//   motel: { type: mongoose.Schema.Types.ObjectId, ref: 'Motel', required: true },
//   type: { type: String, required: true },
//   description: { type: String, required: true },
//   date: { type: Date, default: Date.now },
//   status: {type: String,enum: ['Pending', 'In Progress', 'Completed'],default: 'Pending'},
//   completedDate: {type: Date}
// }, { timestamps: true });

// export default mongoose.model("Maintenance", MaintenanceSchema);

import mongoose from 'mongoose';

const MaintenanceSchema = new mongoose.Schema({
  motel: { type: mongoose.Schema.Types.ObjectId, ref: 'Motel', required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  user: { type: String, required: true },
  number:{type: Number, required: true},
  date: { type: Date, default: Date.now },
  status: {type: String,enum: ['pending', 'inprogress', 'completed'],default: 'pending'},
  completedDate: {type: Date}
}, { timestamps: true });

export default mongoose.model("Maintenance", MaintenanceSchema);