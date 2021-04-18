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

const trackSwaps = async (tokenAddress) => {
    try{
        const contract = await getTokenContract(tokenAddress)
        const token = await new Token(contract,routerContract,config.get('addresses')['BUSD'])
        tokens.push(token)

        contract.events
        .Transfer({})
        .on("connected", function (subscriptionId) {
            console.log(`Connected! subscriptionId: ${subscriptionId}`);
        })
        .on("data", async function (event) {
            const tx = await web3.eth.getTransaction(event.transactionHash);
            const receipt = await web3.eth.getTransactionReceipt(event.transactionHash);
            if(tx.to.toUpperCase() === routerContract._address.toUpperCase()){
                console.log(`Router transaction`)
                const transaction = new Transaction(tx,receipt)
                
                if(!checkSwapTx(transaction.callFunction.name)){
                    //Not a transaction we want
                    return
                }

                const buy = transaction.getAddressTo().toUpperCase() === tokenAddress.toUpperCase() //Indicates if it's a buy swap for token we are tracking.
                
                let token = buy ? getTokenByAddress(transaction.getAddressFrom()) : getTokenByAddress(transaction.getAddressTo())

                if(!token){
                    //Add token if we do not have it in our list.
                    const contract = buy ? await getTokenContract(transaction.getAddressFrom()) : await getTokenContract(transaction.getAddressTo()) 
                    token = await new Token(contract,routerContract,config.get('addresses')['BUSD'])
                    tokens.push(token)
                }

                
                    const color = buy ? "\x1b[32m" : "\x1b[31m"
                    const label = buy ? "BUY" : "SELL"
                
                    const amountFrom = transaction.getTransferedAmount(transaction.getAddressFrom())
                    const amountTo = transaction.getTransferedAmount(transaction.getAddressTo())
                    const tokenFrom = buy ? token : getTokenByAddress(tokenAddress)
                    const tokenTo = buy ? getTokenByAddress(tokenAddress) : token
                
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