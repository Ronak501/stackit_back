import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room',required: true },
  name: { type: String, required: true },
  // fileUrl: { type: String },
  category: { type: String },
  driveId: { type: String, required: true }, // Store Google Drive file ID
  category: {type: String},
  url: { type: String, required: true }, // Store public URL
  webViewLink: { type: String },
  webContentLink: { type: String },
  uploadDate: { type: Date, default: Date.now },
  mimeType: { type: String }
}, { timestamps: true });

export default mongoose.model("Document", DocumentSchema);
