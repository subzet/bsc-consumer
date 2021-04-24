class CandleData{
    constructor(operation){
        //Creates a candle out of a Operation
        this.open = operation.tokenPrice 
        this.close = operation.tokenPrice
        this.low = operation.tokenPrice  
        this.high = operation.tokenPrice
        this.volume = operation.buy ? Number(operation.amountTo) : Number(operation.amountFrom)
        this.volumeUSD = this.volume * operation.tokenPrice
        this.operations = 1
        this.lastPrice = operation.tokenPrice
        this.symbol = operation.token
    }

    _setLow(price){
        if(price < this.low){
            this.low = price
        }
    }

    _setHigh(price){
        if(price > this.high){
            this.high = price
        }
    }

    _addVolume(amount, tokenPrice){
        this.volume += Number(amount)
        this.volumeUSD += Number(amount) * tokenPrice
    }

    addOperation(operation){
        this._setLow(operation.tokenPrice)
        this._setHigh(operation.tokenPrice)
        this._addVolume(operation.buy ? operation.amountTo : operation.amountFrom, operation.tokenPrice)
        this.operations += 1
        this.lastPrice = operation.tokenPrice
    }

    setClose(){
        this.close = this.lastPrice
    }
}

module.exports = CandleData