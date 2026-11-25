const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ['SIMULATED_CARD', 'SIMULATED_UPI', 'SIMULATED_WALLET'],
      default: 'SIMULATED_CARD',
    },
    cardLast4: {
      type: String,
      default: '4242',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      required: true,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
