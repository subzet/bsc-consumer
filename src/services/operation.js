const moment = require('moment');

class Operation{
    //Represents an operation made against token tracked by RouterTracker.
    constructor(buy,from,to,transaction,token){
        return (async () => {
            this.buy = buy //Boolean indicator if is a token buy
            this.from = from //Token from. i.e Token tracked if is a sell operation.
            this.to = to //Token to. i.e Tocken tracked if is a buy operation.
            this.transaction = transaction //Transaction where operation took place
            this.amountFrom = this.transaction.getTransferedAmount(this.from.address)
            this.amountTo = this.transaction.getTransferedAmount(this.to.address)
            this.tokenFromPrice = this.buy ? await this.from.getPrice() : undefined //Token from price to evaluate buy price for token tracked.
            this.tokenToPrice = this.buy ? undefined : await this.to.getPrice() //Token to price to evaluate sell price for token tracked.
            this.tokenPrice = this._getOperatedTokenPrice() //Price in which token tracked was operated.
            this.timestamp = moment().utc()
            this.token = token //token tracked
            return this
        })();
    }

    _getOperatedTokenPrice(){
        return this.buy ? (Number(this.amountFrom) * this.tokenFromPrice.value) / Number(this.amountTo)  : (Number(this.amountTo) * this.tokenToPrice.value) / Number(this.amountFrom) 
    }

    printOperation(){
        const color = this.buy ? "\x1b[32m" : "\x1b[31m"
        const label = this.buy ?  "BUY" : "SELL"

        console.log(
            color,
            `[${this.timestamp}]`,
            label, 
            this.buy ? this.amountTo : this.amountFrom,
            this.buy ? this.to.symbol : this.from.symbol,
            "=>",
            this.buy ? this.amountFrom : this.amountTo,
            this.buy ? this.from.symbol : this.to.symbol,
            `($${this.buy ? this.tokenFromPrice.value.toFixed(2) : this.tokenToPrice.value.toFixed(2)})`,
            `${this.token} price:  ${this.tokenPrice}`,
            `https://bscscan.com/tx/${this.transaction.transaction.hash}`,
            `function ${this.transaction.callFunction.name}`,
            "\x1b[0m"
        );
    }
}


module.exports = Operation