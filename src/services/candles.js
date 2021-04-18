

class Candle{
    constructor(start,timeframe,open,token,reference){
        this.start = start //Candle Start Time (UTC)
        this.end = undefined
        this.timeframe = timeframe //Candle Time Span
        this.open = open // Open Candle Price
        this.token = token // Main Token
        this.reference = reference // Reference Token (Ex. BUSD)
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

}