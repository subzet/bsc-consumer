const config = require("../config/config");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = config.get("MONGO_DB_URI");
db.operations = require("./operation.model.js");
db.candles = require('./candle.model.js');


module.exports = db;