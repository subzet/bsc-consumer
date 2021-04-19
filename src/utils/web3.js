const Web3 = require('web3')

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

module.exports = web3;