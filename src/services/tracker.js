const { EventEmitter } = require('events')

const BEP20_ABI = require("../config/BEP20_ABI.json");
const Router_ABI = require("../config/Router_ABI.json");

const Transaction = require('../services/transaction')
const web3 = require('../utils/web3')


class RouterTracker extends EventEmitter{
    //Router tracker receives an event from web3 token contract and emit's a transaction object if complies with certain conditions.
    constructor(routerAddress, tokenAddress, functions, references){
        super()
        this.router = new web3.eth.Contract(Router_ABI, routerAddress);
        this.token = new web3.eth.Contract(BEP20_ABI, tokenAddress);
        this.functions = functions //Functions to track.
        this.references = references.map(referenceToken => {
            return new web3.eth.Contract(BEP20_ABI, referenceToken);
        }) //Addresses involved in tracking.
    }

    _checkRouterTransaction(tx){
        return tx.to && tx.to.toUpperCase() === this.router._address.toUpperCase()
    }

    _checkSwapTx(fn){
        return this.functions.indexOf(fn) >= 0
    }

    _involvesReferencePairs(transaction){
        const tokens = this.references.map(contract => contract._address.toUpperCase())
        const transactionAddresses = transaction.addresses.map(addr => addr.toUpperCase())
        return tokens.some(token => transactionAddresses.indexOf(token) >= 0)
    }

    async _processEvent(event){
        const tx = await web3.eth.getTransaction(event.transactionHash);
        if(this._checkRouterTransaction(tx)){
            const receipt = await web3.eth.getTransactionReceipt(event.transactionHash);
            const transaction = new Transaction(tx,receipt)

            if(!this._checkSwapTx(transaction.callFunction.name)){
                return
            }

            if(!this._involvesReferencePairs(transaction)){
                return
            }

            this.emit('transaction', transaction)
        }
    }

    async track(){
        this.token.events.Transfer({})
        .on("connected", function (subscriptionId) {
            console.log(`Connected! subscriptionId: ${subscriptionId}`);
        })
        .on("data", async (event) => {await this._processEvent(event)})
    }
}

module.exports = RouterTracker