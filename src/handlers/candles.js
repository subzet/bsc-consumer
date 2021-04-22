const moment = require('moment')
const Candle = require('../services/candles')
const emitter = require('../utils/emitter')
const timespan = 60 //60 seconds

const candles = {}

const createCandle = (operation) => {
    const start = operation.timestamp
    const timeframe = '1m'
    const open = operation.tokenPrice
    const token = operation.token
    const candle = new Candle(start,timeframe,open,token)
    
    if(!candles[token]){
        candles[token] = []
        candles[token].push(candle)
        return
    }

    candles[token].push(candle)
}

const closeCandle = (candle) => {
    candle.end = moment(candle.start).add(timespan,'seconds')
}

const updateCandle = (candle, operation) => {
    candle.setLow(operation.tokenPrice)
    candle.setHigh(operation.tokenPrice)
    candle.setClose(operation.tokenPrice)
}

const isEnded = (start, actual) => {
    
    const seconds = moment.duration(actual.diff(start)).asSeconds()
    
    if(seconds > timespan){
        return true
    }

    return false
}

const trackOperations = () => {
    console.log("Waiting for operations...")
    emitter.on("operation", async(operation) => {
        operation.printOperation()

        if(!candles[operation.token]){
            createCandle(operation)
            return
        }

        const lastCandle = candles[operation.token][candles[operation.token].length - 1]

        if(isEnded(lastCandle.start, operation.timestamp)){
            closeCandle(lastCandle)
            lastCandle.printCandle()
            createCandle(operation)
            return
        }

        updateCandle(lastCandle,operation)
        return
    })
}


module.exports = { trackOperations }