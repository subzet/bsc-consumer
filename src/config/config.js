require('dotenv').config();

const config = new Map()

config.set('chainUrl','https://bsc-dataseed1.binance.org:443')

config.set('routerContractAddress','0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F')

config.set('addresses',{
    BUSD: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    WBNB: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
})

config.set('allowedTrx', ['swapExactTokensForTokens','swapTokensForExactTokens','swapExactETHForTokens','swapTokensForExactETH','swapExactTokensForETH','swapETHForExactTokens'])


module.exports = config;

