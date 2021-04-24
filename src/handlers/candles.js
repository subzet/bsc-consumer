const service = require('../services/candles')

const getCandles = async(pair) => {
    try{
        const candles = await service.getCandles(pair)
        return { code:200, candles}
    }catch(error){
        return {code:500, msg:error.message}
    }
}

module.exports = { getCandles }