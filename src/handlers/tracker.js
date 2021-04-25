const service = require('../services/tracker')

const startTracking = async(tokenAddress) => {
    try{
        const token = service.trackSwaps(tokenAddress)
        return {code:200, msg:`Started tracking ${token.symbol}`}
    }catch(error){
        return {code:500, msg: error.message}
    }
}

module.exports = {startTracking}