const mongoose = require('mongoose')

const OperationSchema = mongoose.Schema({ 
      token: String,
      buy: Boolean,
      from: String,
      to: String,
      transaction: String,
      amountFrom: Number,
      amountTo: Number,
      timestamp: String,
      price: Number
   },
   { timestamps: true, strict: "throw" }
)

module.exports = mongoose.model(
      "operations",
      OperationSchema
    );
