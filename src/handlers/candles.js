const moment = require('moment')
const Candle = require('../services/candles')

const candles = {}


const addCandle = (price,timeframe,token,reference) => {
    const start = moment.utc().format()
    const candle = new Candle(start,timeframe,price,token,reference)
    
    if(candles[token]){
        candles[token].push(candle)
    }else{
        candles[token] = [candle]
    }
}

const getLastCandle = (token) => {
    return candles[token][candles.token.length - 1]
}


const updateCandle = (candle, price, timeframe) => {
    
}