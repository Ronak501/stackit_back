// import mongoose from 'mongoose';

// const AnnualInspectionSchema = new mongoose.Schema({
//   motel: { type: mongoose.Schema.Types.ObjectId, ref: 'Motel',required: true },
//   date: { type: Date, required: true },
//   findings: { type: String },
//   inspector: {type: String},
//   status: {type: String,enum: ['Scheduled', 'Completed', 'Failed', 'Passed'],default: 'Scheduled'},
//   followUpRequired: {type: Boolean,default: false},
//   followUpDate: {type: Date}
// }, { timestamps: true });


// export default mongoose.model("AnnualInspection", AnnualInspectionSchema);

import mongoose from 'mongoose';

const AnnualInspectionSchema = new mongoose.Schema(
  {
    motel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Motel",
      required: true,
    },
    date: { type: Date, required: true },
    type: { type: String },
    inspector: { type: String },
    authority: { type: String },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Tentative", "Cancelled"],
      default: "Scheduled",
    },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },
  },
  { timestamps: true }
);


export default mongoose.model("AnnualInspection", AnnualInspectionSchema);