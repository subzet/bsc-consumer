const mongoose = require('mongoose')

const candleDataSchema = mongoose.Schema({
   open: Number,
   close: Number,
   low: Number,
   high: Number,
   volume: Number,
   volumeUSD: Number,
   operations: Number,
   symbol:String
})

const candleSchema = mongoose.Schema({ 
       start: Date,
       end: Date,
       data: [candleDataSchema]
   },
   { timestamps: true, strict: "throw" 
})



module.exports = mongoose.model("candles",candleSchema)


