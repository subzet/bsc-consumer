const RouterTracker = require('../domain/tracker')
const Token = require('../domain/token')
const Operation = require('../domain/operation')
const config = require('../config/config');
const BEP20_ABI = require("../config/BEP20_ABI.json");
const web3 = require('../utils/web3')
const emitter = require('../utils/emitter')
const tokens = []


const getTokenContract = async (contractAddress) => {
    const contract = new web3.eth.Contract(BEP20_ABI, contractAddress);

    if (!contract) throw new Error("Error contract not found");

    return contract;
}

const getTokenByAddress = (addr) => {
    const token = tokens.filter(token => token.address.toUpperCase() === addr.toUpperCase())
    
    if (token.length > 0) return token[0]

    return undefined
}

const addToken = async (addr,router) =>  {
    //Adds a token to token list if it's not in it already
    let token = getTokenByAddress(addr)
    if(!token){
        const contract = await getTokenContract(addr)
        token = await new Token(contract,router,config.get('addresses')['BUSD'])
        tokens.push(token)
    }

    return token
}

const trackSwaps = async (tokenAddress) => {
    const routerAddress = config.get('routerContractAddress')
    const functions = config.get('allowedTrx')
    const tracker = new RouterTracker(routerAddress,tokenAddress,functions)

    const token = await addToken(tokenAddress,tracker.router)
    
    tracker.track()

    emitter.on('transaction', async function (transaction){
        try{
            //Timestamp
            const timestamp = await transaction.getTimestamp()
            //Operations list
            const operations = []
            //Index of token track in transaction path
            const tokenIndex = transaction.getAddressIndexInPath(tokenAddress)
            //Address of the token sold for token tracked
            const soldAddress = tokenIndex > 0 ? transaction.getAddressInIndex(tokenIndex - 1) : undefined
            //Address of the token bought with tocken tracked  
            const boughtAddress = tokenIndex < transaction.addresses.length - 1 ? transaction.getAddressInIndex(tokenIndex + 1) : undefined 

            const tokenTracked = getTokenByAddress(tokenAddress)

            if(soldAddress){
                //With x sold adrress someone bougth x token tracked
                await addToken(soldAddress,tracker.router)
                const operation = await new Operation(true,getTokenByAddress(soldAddress),tokenTracked,transaction,tokenTracked.symbol, timestamp.toUTCString())
                operations.push(operation)
            }

            if(boughtAddress){
                //With x token tracked someone bougth boughtAddress
                await addToken(boughtAddress,tracker.router)
                const operation = await new Operation(false,tokenTracked,getTokenByAddress(boughtAddress),transaction,tokenTracked.symbol, timestamp.toUTCString())
                operations.push(operation)
            }

            await operations.forEach(async (operation) => {
                await operation.save()
                emitter.emit("operation", operation) // Emit the operation for candle creator to track it.
            });
        }catch(error){
            console.log(`Error processing transaction ${error.message}`)
        }
    });

    return token
}



module.exports = {trackSwaps}