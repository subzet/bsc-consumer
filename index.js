const trackerService = require('./src/services/tracker')
const candleService = require('./src/services/candles')
const candleHandler = require('./src/handlers/candles')
const db = require('./src/models')
const express = require('express')
const app = express();

startApp = async() => {
    console.log("Conecting to DB");
    db.mongoose.connect(db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log("Conected to DB");
    candleService.createCandle() //Creates first candle.
    candleService.trackOperations()
    trackerService.trackSwaps('0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82')

    await setInterval(async () => {
        console.log("Closing and creating new candle")
        candleService.closeCandle()
        candleService.createCandle()
      }, 60000);
}

startApp()

app.use(express.json());

app.get('/ping', (req,res) =>{
    res.status(200).send('pong')
}) 

app.get('/bsc/:pair/candlesticks', async function(req,res){
    const response = await candleHandler.getCandles(req.params.pair, req.query.timeframe)
    res.status(response.code).send(response)
});

const server = app.listen(process.env.PORT || 8080, () => {
    const { port } = server.address();
    console.log('TRADING APP listening at http://localhost:%s', port);
});