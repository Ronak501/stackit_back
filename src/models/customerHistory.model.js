import mongoose from 'mongoose';

const CustomerHistorySchema = new mongoose.Schema({
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer',
    required: true 
  },
  room: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room',
    required: true 
  },
  motel: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Motel',
    required: true 
  },
  checkInDate: { 
    type: Date, 
    required: true 
  },
  checkOutDate: { 
    type: Date, 
    required: true 
  },
  documents: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Document' 
  }],
  paymentAmount: { 
    type: Number 
  },
  paymentMethod: { 
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Online Transfer', 'Other'],
  },
  notes: { 
    type: String 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }
}, { 
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Add indexes for better query performance
CustomerHistorySchema.index({ customer: 1, checkInDate: -1 });
CustomerHistorySchema.index({ room: 1, checkInDate: -1 });
CustomerHistorySchema.index({ motel: 1, checkInDate: -1 });
CustomerHistorySchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 }); // For active customer queries

export default mongoose.model("CustomerHistory", CustomerHistorySchema);
