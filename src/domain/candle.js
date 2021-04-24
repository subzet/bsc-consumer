
const CandleData = require('./candleData')
const moment = require('moment')
const Candles = require('../models').candles



class Candle{
    constructor(start,timespan){
        /*
            start: Start Time (Javascript Date)
            timespan: timespan in seconds.
        */
        this.start = start 
        this.end = moment(start).add(timespan,'seconds')
        this.candleData = []
    }

    _findTokenCandle(token){
        const candle = this.candleData.filter(candle => candle.symbol === token)
        if(candle.length > 0){
            return candle[0]
        }

        return undefined
    }


    addCandleData(operation){
        const candleData =  this._findTokenCandle(operation.token)

        if(candleData){
            candleData.addOperation(operation)
            return
        }

        this.candleData.push(new CandleData(operation))
        return
    }

    async closeCandle(){
        //Set's close mark to each token candle Data.
        this.candleData.forEach((candle) => {
            candle.setClose()
        });
        this._save()
    }   

    async _save(){
        console.log("Saving candle..")
        //Saves candle in database.
        const candle = new Candles()
        candle.start = this.start.toDate()
        candle.end = this.end.toDate()
        candle.data = this.candleData

        await candle.save()
    }
}

module.exports = Candle