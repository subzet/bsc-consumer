const BEP20_ABI = require("../config/BEP20_ABI.json");
const Router_ABI = require("../config/Router_ABI.json");

const Transaction = require('./transaction')
const web3 = require('../utils/web3')
const emitter = require('../utils/emitter')


class RouterTracker{
    //Router tracker receives an event from web3 token contract and emit's a transaction object if complies with certain conditions.
    constructor(routerAddress, tokenAddress, functions){
        this.router = new web3.eth.Contract(Router_ABI, routerAddress);
        this.token = new web3.eth.Contract(BEP20_ABI, tokenAddress);
        this.functions = functions //Functions to track.
    }

    _checkRouterTransaction(tx){
        return tx.to && tx.to.toUpperCase() === this.router._address.toUpperCase()
    }

    _checkSwapTx(fn){
        return this.functions.indexOf(fn) >= 0
    }

    async _processEvent(event){
        const tx = await web3.eth.getTransaction(event.transactionHash);
        if(this._checkRouterTransaction(tx)){
            const receipt = await web3.eth.getTransactionReceipt(event.transactionHash);
            const transaction = new Transaction(tx,receipt)

            if(!this._checkSwapTx(transaction.callFunction.name)){
                return
            }

            if(!transaction.addresses.length > 1){
                //If transaction does not involve more than one address discard it.
                return
            }

            this.emit(transaction)
        }
    }

    async track(){
        console.log(`Starting track of ${this.token._address}`)
        this.token.events.Transfer({})
        .on("connected", function (subscriptionId) {
            console.log(`Connected! subscriptionId: ${subscriptionId}`);
        })
        .on("data", async (event) => {
            await this._processEvent(event)
        })

    }

    emit(transaction){
        emitter.emit("transaction", transaction)
    }
}

module.exports = RouterTracker