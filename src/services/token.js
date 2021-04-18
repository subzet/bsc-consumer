const moment = require('moment')
const config = require('../config/config')

class Token{
    //Hold's token data
    constructor(contract, routerContract, referenceToken){
        return (async () => {
            this.contract = contract; //Already instanciated contract Address
            this.routerContract = routerContract; //Already instanciated router contract.
            this.referenceToken = referenceToken ||  "0xe9e7cea3dedca5984780bafc599bd69add087d56", //Busd contract //Address from token which we want to getPrice. Example BUSD contract (0xBLABLABLA)
            this.decimals = await contract.methods.decimals().call({})
            this.symbol = (await contract.methods.symbol().call({})).toUpperCase()
            this.name = await contract.methods.name().call({})
            this.address = this.contract._address

            return this
        })();
    }

    async getPrice(){

            const path = this._getPath()

            const  price  = await this.routerContract.methods
            .getAmountsOut(1000000000, path)
            .call({});

            const value = this.address.toUpperCase() === config.get('addresses')['WBNB'].toUpperCase() ? price[1] / Math.pow(10, 9 + 18 - this.decimals) : price[2] / Math.pow(10, 9 + 18 - this.decimals)
            
            return {
                timestamp: moment().format(),
                value
            }
    }

    _getPath(){
        let path;

        if(this.address.toUpperCase() === config.get('addresses')['WBNB'].toUpperCase()){
            path = [this.address, this.referenceToken]
        }else{
            path = [this.address, config.get('addresses')['WBNB'], this.referenceToken]
        }

        return path
    }
}


module.exports = Token