const moment = require('moment')
const Candle = require('../domain/candle')
const Candles = require('../models').candles
const emitter = require('../utils/emitter')
const timespan = 60 //60 seconds
const candles = []

const createCandle = () => {
    const candle = new Candle(moment().utc(),timespan)
    candles.unshift(candle) //Add's element to first position in array.
}

const closeCandle = () => {
    candles[0].closeCandle()
}

const updateCandleData = (operation) => {
    const currentCandle = candles[0]
    currentCandle.addCandleData(operation)    
}

const trackOperations = () => {
    console.log("Waiting for operations...")
    emitter.on("operation", async(operation) => {
        operation.printOperation()
        updateCandleData(operation)
    })
}

const getCandles = async (pair) => {
    const candles = await Candles.find().exec()
    return candles.map(candle => {
        return {
            close: candle.data[0].close,
            high: candle.data[0].high,
            low: candle.data[0].low,
            open: candle.data[0].open,
            operations: candle.data[0].operations,
            volume: candle.data[0].volume,
            volumeUSD: candle.data[0].volumeUSD,
            symbol: candle.data[0].symbol,
            start: candle.start,
            end: candle.end
        }
    })
}


module.exports = { trackOperations, createCandle, closeCandle, getCandles }