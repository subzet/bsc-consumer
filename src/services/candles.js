const moment = require('moment')

class Candle{
    constructor(start,timeframe,open,token){
        this.start = start //Candle Start Time (UTC)
        this.end = undefined
        this.timeframe = timeframe //Candle Time Span
        this.open = open // Open Candle Price
        this.token = token // Main Token
        this.close = open
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
        this.close = price
    }

    printCandle(){
        console.log(
            `TOKEN ${this.token}`,
            `OPEN ${this.open}`,
            `HIGH ${this.high}`,
            `LOW ${this.low}`,
            `CLOSE ${this.close}`
        )
    }
}

module.exports = Candle