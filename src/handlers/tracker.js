const Web3 = require('web3')
const BEP20_ABI = require("../config/BEP20_ABI.json");
const Router_ABI = require("../config/Router_ABI.json");
const Token = require('../services/token')
const Transaction = require('../services/transaction')

const config = require('../config/config')

const web3 = new Web3(
    new Web3.providers.WebsocketProvider("wss://bsc-ws-node.nariox.org:443", {
      clientConfig: {
        keepalive: true,
        keepaliveInterval: 30000,
      },
      reconnect: {
        auto: true,
        delay: 1000,
        maxAttempts: 2,
      },
    })
  );

const routerContract = new web3.eth.Contract(Router_ABI, config.get('routerContractAddress'));

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

const checkSwapTx = (fn) => {
    return config.get('allowedTrx').indexOf(fn) >= 0
  } 

const getPairInvolved = (tokenAddressIndex,bnbAddressIndex,busdAddressIndex) => {               
    if(tokenAddressIndex - bnbAddressIndex === 1 || bnbAddressIndex - tokenAddressIndex === 1)
        return 'WBNB'
    if(tokenAddressIndex - busdAddressIndex === 1 || busdAddressIndex - tokenAddressIndex === 1)
        return 'BUSD'

    return undefined
}

const trackSwaps = async (tokenAddress) => {
    try{
        const contract = await getTokenContract(tokenAddress)
        const token = await new Token(contract,routerContract,config.get('addresses')['BUSD'])
        tokens.push(token)

        const busdContract = await getTokenContract(config.get('addresses')['BUSD'])
        const busdToken = await new Token(busdContract,routerContract,config.get('addresses')['BUSD'])
        tokens.push(busdToken)

        const wbnbContract = await getTokenContract(config.get('addresses')['WBNB'])
        const wbnbToken = await new Token(wbnbContract,routerContract,config.get('addresses')['BUSD'])
        tokens.push(wbnbToken)

        contract.events
        .Transfer({})
        .on("connected", function (subscriptionId) {
            console.log(`Connected! subscriptionId: ${subscriptionId}`);
        })
        .on("data", async function (event) {
            const tx = await web3.eth.getTransaction(event.transactionHash);
            
            if(tx.to && tx.to.toUpperCase() === routerContract._address.toUpperCase()){
                console.log(`Router transaction`)
                const receipt = await web3.eth.getTransactionReceipt(event.transactionHash);
                
                const transaction = new Transaction(tx,receipt)
            
                if(!checkSwapTx(transaction.callFunction.name)){
                    //Not a transaction we want
                    return
                }
                
                //Search index in path for addresses we want 
                const tokenAddressIndex = transaction.getAddressIndexInPath(tokenAddress)
                const bnbAddressIndex = transaction.getAddressIndexInPath(config.get('addresses')['WBNB'])
                const busdAddressIndex = transaction.getAddressIndexInPath(config.get('addresses')['BUSD'])
                
                //Resolve which pair is involved in the trasaction // BUY: BUSDCAKE, BNBCAKE SELL: CAKEBUSD, CAKEBNB
                const pair = getPairInvolved(tokenAddressIndex,bnbAddressIndex,busdAddressIndex)
                if(!pair){
                    //Not a transaction involving these pairs BUY: BUSDCAKE, BNBCAKE SELL: CAKEBUSD, CAKEBNB
                    return
                }


                //Consider a buy if our token desired is positioned after addresses we use as reference
                const buy = bnbAddressIndex < tokenAddressIndex || busdAddressIndex < tokenAddressIndex

                

                //Print Transaction
                const color = buy ? "\x1b[32m" : "\x1b[31m"
                const label = buy ? "BUY" : "SELL"
                
                //Get amounts involved in transaction.
                const amountFrom = buy ? transaction.getTransferedAmount(config.get('addresses')[pair]) : transaction.getTransferedAmount(tokenAddress)
                const amountTo = buy ? transaction.getTransferedAmount(tokenAddress) : transaction.getTransferedAmount(config.get('addresses')[pair])
                
                //Get tokens involved 
                const tokenFrom = buy ? getTokenByAddress(config.get('addresses')[pair]) : getTokenByAddress(tokenAddress)
                const tokenTo = buy ? getTokenByAddress(tokenAddress) : getTokenByAddress(config.get('addresses')[pair])
                
                    try{
                        const tokenFromPrice = buy ? await tokenFrom.getPrice() : undefined
                        const tokenToPrice = buy ? undefined : await tokenTo.getPrice()
                        
                        console.log(
                            color,
                            label, 
                            buy ? amountTo : amountFrom,
                            buy ? tokenTo.symbol : tokenFrom.symbol,
                            "=>",
                            buy ? amountFrom : amountTo,
                            buy ? tokenFrom.symbol : tokenTo.symbol,
                            `${buy ? tokenTo.symbol : tokenFrom.symbol} price:  ${buy ? (Number(amountFrom) * tokenFromPrice.value) / Number(amountTo)  : (Number(amountTo) * tokenToPrice.value) / Number(amountFrom) }`,
                            `https://bscscan.com/tx/${transaction.transaction.hash}`,
                            `function ${transaction.callFunction.name}`,
                            "\x1b[0m"
                        );

                        
                    }catch(error){
                        console.log(error.message)
                    }
            }
        })
    }catch(error){
        console.log(error.message)
    }
}

trackSwaps("0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82")