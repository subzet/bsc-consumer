const bscTracker = require('./src/handlers/tracker')
const candleTracker = require('./src/handlers/candles')

candleTracker.trackOperations()
bscTracker.trackSwaps('0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82')
