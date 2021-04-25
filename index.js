const candleService = require('./src/services/candles')
const candleHandler = require('./src/handlers/candles')
const trackerHandler = require('./src/handlers/tracker')
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
    candleService.createCandle() //Starts creating candles.
    candleService.trackOperations() //Starts listening for operations from router tracker.
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
    /* Get candles for a given pair */
    const response = await candleHandler.getCandles(req.params.pair, req.query.timeframe)
    res.status(response.code).send(response)
});

app.post('/bsc/:token/track', async function(req,res){
    /* Post a token to start tracking*/
    const response = await trackerHandler.startTracking(req.params.token)
    res.status(response.code).send(response)
});

const server = app.listen(process.env.PORT || 8080, () => {
    const { port } = server.address();
    console.log('TRADING APP listening at http://localhost:%s', port);
});