/**
 * Copyright (c) 2017-present Alexis Leon
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const app = require('express')();
const morgan = require('morgan');
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const mongo = require('mongodb');
// const io = require('socket.io')(http);
const five = require('johnny-five');
const hap = require('hap-nodejs');
const path = require('path');
const fs = require('fs');
const storage = require('node-persist');
const config = require('../config.json');
const loadAccessories = require('./accessories/loadAccessories');
const log = require('./utils/logger');
const localAddress = require('./utils/address');
const routes = require('./routes');
const Path = require('./path');

/* Helpers */
const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const {
  uuid,
  Bridge,
  Accessory,
  AccessoryLoader
} = hap;

function Server() {
  storage.initSync({ dir: Path.cachedAccessoryPath() });

  this.boardReady = false;

  this.config = this.loadConfig();
  this.bridge = this.createBridge();
}

Server.prototype.run = function () {
  const that = this;

  this.connectDB(function() {
    that.board = that.createBoard();
    that.board.on('ready', function() {
      that.loadAccessories() // handleBoardReady
    })

    that.configServer();
    that.startServer();
    that.publishBridge();
  });
}

Server.prototype.publishBridge = function() {
  const config = this.config.bridge || {};
  const that = this;

  this.bridge.on('listening', function(port) {
    log('cyan', `HAP running on port ${port}.`);

    that.printPin(config.pin);
  });

  this.bridge.publish({
    username: config.username || "CC:22:3D:E3:CE:30",
    port: config.port || 0,
    pincode: config.pin || "031-45-154",
    category: Accessory.Categories.BRIDGE
  });
}

Server.prototype.loadConfig = () => {
  let config = {};
  const configFile = Path.configFile();

  if (!fs.existsSync(configFile)) {
    config.bridge = {
      name: 'HomePi',
      username: 'CC:22:3D:E3:CE:30',
      pin: '031-45-154'
    };
  } else {
    try {
      config = JSON.parse(fs.readFileSync(configFile));
    } catch (err) {
      // TODO: log err
      throw err;
    }
  }

  return config;
}

Server.prototype.createBridge = function() {
  const config = this.config.bridge || {};

  return new Bridge(config.name || 'HomePi', uuid.generate("HomePi"));
}

Server.prototype.createBoard = function() {
  log('yellow', 'WAITING FOR BOARD...');

  return new five.Board();
}

Server.prototype.handleBoardReady = function() {
  log('yellow', 'BOARD READY');
  this.boardReady = true;
  this.loadAccessories();
}

Server.prototype.loadAccessories = function() {
  this.db.collection('accessories')
    .find({})
    .toArray((queryErr, results) => {
      if (queryErr) throw new Error(queryErr);
      log('yellow', 'LOADING DEVICES');

      const accessories = loadAccessories(results);
      accessories.forEach((accessory) => {
        this.bridge.addBridgedAccessory(accessory);
      });
    });
}

Server.prototype.connectDB = function(callback) {
  mongo.MongoClient.connect(config.mongo, (err, db) => {
    if (err) throw new Error(err);
    log('cyan', 'Database connection stabilised');

    this.db = db;

    return callback();
  })
};

Server.prototype.configServer = () => {
  app.set('json spaces', 4);
  app.set('ipaddr', config.ipaddr);
  app.set('port', config.port);
  // app.set('sockets', io.sockets);
  app.use(morgan(nodeEnv !== 'development' ? 'common' : 'dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true,
  }));
}

Server.prototype.startServer = function () {
  http.listen(config.port, config.ipaddr, () => {
    log('cyan', `HTTP running on ${localAddress}:${config.port}`);
  });

  routes(app, this.db, five);
}

// Server.prototype.startSockets = async function () {
//   io.sockets.on('connection', (socket) => {
//     log('cyan', 'CLIENT CONNECTED');
//     socket.on('disconnect', () => log('cyan', 'CLIENT DISCONNECTED'));
//   });
// }

Server.prototype.printPin = (pincode) => {
  console.log("Scan this code to pair with HomePi:");
  console.log(log.colors.black.bgWhite("                       "));
  console.log(log.colors.black.bgWhite("    ┌────────────┐     "));
  console.log(log.colors.black.bgWhite(`    │ ${pincode} │     `));
  console.log(log.colors.black.bgWhite("    └────────────┘     "));
  console.log(log.colors.black.bgWhite("                       "));
};

module.exports = Server;
