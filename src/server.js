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
const VirtualSerialPort = require('udp-serial').SerialPort;
const firmata = require('firmata');
const hap = require('hap-nodejs');
const fs = require('fs');
const storage = require('node-persist');
const AccessoryLoader = require('./accessories/accessoryLoader');
const log = require('./utils/logger');
const localAddress = require('./utils/address');
const routes = require('./routes');
const Path = require('./path');

/* Helpers */
const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const {
  uuid,
  Bridge,
  Accessory
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
    that.createBoards(() => {
      that.boards.on('ready', function() {
        log('yellow', 'BOARDS READY');

        this.each(function(board) {
          that.loadAccessories(board.id, board)
        });
      })
    });

    that.configServer();
    that.startServer();
    that.publishBridge();
  });
}

Server.prototype.publishBridge = function() {
  const { bridge } = this.config;
  const that = this;

  this.bridge.on('listening', function(port) {
    log('cyan', `HAP running on port ${port}.`);

    that.printPin(bridge.pin);
  });

  this.bridge.publish({
    username: bridge.username,
    port: bridge.port,
    pincode: bridge.pin,
    category: Accessory.Categories.BRIDGE
  });
}

Server.prototype.loadConfig = function() {
  let config = {};
  const configFile = Path.configFile();

  if (!fs.existsSync(configFile)) {
    log('cyan', 'Config file not found: config.json');

    // Service
    config.ipaddr = '0.0.0.0';
    config.port = '8080';
    config.mongo = 'mongodb://localhost:27017/homePi';

    // HAP
    config.bridge = {
      name: 'HomePi',
      username: 'CC:22:3D:E3:CE:30',
      pin: '031-45-154',
      port: 51826,
    };

    // Board
    config.board = {};
  } else {
    try {
      config = JSON.parse(fs.readFileSync(configFile));
    } catch (err) {
      log('cyan', 'Error loading config file, please check file format.');
      throw err;
    }
  }

  return config;
}

Server.prototype.createBridge = function() {
  const { bridge } = this.config;

  return new Bridge(bridge.name, uuid.generate("HomePi"));
}

Server.prototype.createBoards = function(callback) {
  log('yellow', 'LOADING BOARDS...');

  this.db.collection('boards')
    .find({})
    .toArray((queryErr, results) => {
      if (queryErr) throw new Error(queryErr);

      const boards = [];

      results.forEach((board) => {
        const { host, type, port } = board;
        // Global Settings
        board.repl = false;

        switch (type) {
          case 'ESP8266':
          case 'WIFI':
            var sp = new VirtualSerialPort({
              host,
              type: 'udp4',
              port: 41234,
            });

            board.io = new firmata.Board(sp);
            board.io.once('ready', function() {
              board.io.isReady = true;
            });

            boards.push(board);
            break;
          default:
            // ...
        }
      });

      this.boards = new five.Boards(boards);

      callback();
    });
}

Server.prototype.loadAccessories = function(boardId, board) {
  this.db.collection('accessories')
    .find({"board": boardId})
    .toArray((queryErr, results) => {
      if (queryErr) throw new Error(queryErr);
      log('yellow', 'LOADING DEVICES');

      const accessories = AccessoryLoader(results, board);
      accessories.forEach((accessory) => {
        this.bridge.addBridgedAccessory(accessory);
      });
    });
}

Server.prototype.connectDB = function(callback) {
  mongo.MongoClient.connect(this.config.mongo, (err, db) => {
    if (err) throw new Error(err);
    log('cyan', 'Database connection established');

    this.db = db;

    return callback();
  })
};

Server.prototype.configServer = function () {
  app.set('json spaces', 4);
  app.set('ipaddr', this.config.ipaddr);
  app.set('port', this.config.port);
  // app.set('sockets', io.sockets);
  app.use(morgan(nodeEnv !== 'development' ? 'common' : 'dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true,
  }));
}

Server.prototype.startServer = function () {
  let { port, ipaddr } = this.config;
  http.listen(port, ipaddr, () => {
    log('cyan', `HTTP running on ${localAddress}:${port}`);
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
