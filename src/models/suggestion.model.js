import mongoose from 'mongoose';

const SuggestionSchema = new mongoose.Schema({
  motel: { type: mongoose.Schema.Types.ObjectId, ref: 'Motel',required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  user: { type: String, required: true },
  number:{type: String, required: true},
  status: { type: String,enum: ['New', 'Under Review', 'Implemented', 'Rejected'],default: 'New'},
  implementationDetails: { type: String}
}, { timestamps: true });

export default mongoose.model("Suggestion", SuggestionSchema);
