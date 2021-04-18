const moment = require('moment')

class Candle{
    constructor(start,timeframe,open,token, amount,reference){
        this.start = start //Candle Start Time (UTC)
        this.end = undefined
        this.timeframe = timeframe //Candle Time Span
        this.open = open // Open Candle Price
        this.token = token // Main Token
        this.reference = reference // Reference Token (Ex. BUSD)
        this.volume = amount //Amount in native tokens
        this.referencevolume = //Amount in reference token
        this.close = undefined
        this.low = open 
        this.high = open 
    }

    setLow(price){
        if(price < this.low){
            this.low = price
        }
    }

    setHigh(price){
        if(price > this.high){
            this.high = price
        }
    }

    setClose(price){
        this.end = moment().format()
        this.close = price
    }
}