/**
 * Copyright (c) 2017-present Alexis Leon
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-console */

const app = require('express')();
const bodyParser = require('body-parser');
const firmata = require('firmata');
const five = require('johnny-five');
const fs = require('fs');
const hap = require('hap-nodejs');
const http = require('http').Server(app);
// const io = require('socket.io')(http);
const mongo = require('mongodb');
const morgan = require('morgan');
const storage = require('node-persist');
const VirtualSerialPort = require('udp-serial').SerialPort;
const AccessoryLoader = require('./accessories/accessoryLoader');
const log = require('./utils/logger');
const localAddress = require('./utils/address');
const Path = require('./path');
const routes = require('./routes');

/* Helpers */
const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const {
  uuid,
  Bridge,
  Accessory,
} = hap;

function Server() {
  storage.initSync({ dir: Path.cachedAccessoryPath() });

  this.boardsReady = false;

  this.config = this.loadConfig();
  this.bridge = this.createBridge();
}

Server.prototype.run = function () {
  const that = this;

  this.connectDB(() => {
    that.createBoards(boards => that.loadBoards(boards));
    that.configServer();
    that.startServer();
    that.publishBridge();
  });
};

Server.prototype.publishBridge = function () {
  const { bridge } = this.config;
  const that = this;

  this.bridge.on('listening', (port) => {
    log('cyan', `HAP running on port ${port}.`);

    that.printPin(bridge.pin);
  });

  this.bridge.publish({
    username: bridge.username,
    port: bridge.port,
    pincode: bridge.pin,
    category: Accessory.Categories.BRIDGE,
  });
};

Server.prototype.loadConfig = function () {
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
};

Server.prototype.createBridge = function () {
  const { bridge } = this.config;

  return new Bridge(bridge.name, uuid.generate('HomePi'));
};

Server.prototype.createBoards = function (callback) {
  log('yellow', 'Looking for boards...');

  this.db.collection('boards')
    .find({})
    .toArray((queryErr, results) => {
      if (queryErr) throw new Error(queryErr);

      const boards = [];
      const boardsFound = results.length;
      let boardsLoaded = 0;

      const handleLoadedBoard = () => {
        boardsLoaded += 1;

        if (boardsFound === boardsLoaded) {
          this.boardsReady = true;
        }
      };

      results.forEach((board) => {
        const { id, host, type, port } = board;
        const repl = false;
        let io;

        log('yellow', `Board found: ${host} '${id}'`);

        switch (type) {
          case 'WIFI': {
            const sp = new VirtualSerialPort({
              host,
              type: 'udp4',
              port: port || 41234,
            });

            io = new firmata.Board(sp);
            io.once('ready', () => {
              io.isReady = true;
              handleLoadedBoard();
            });
            break;
          }
          default:
            // ...
        }

        boards.push({ ...board, repl, io });
      });

      this.boards = new five.Boards(boards);
      callback(this.boards);
    });
};

Server.prototype.loadBoards = function (boards) {
  log('yellow', 'Loading boards...');

  const that = this;
  boards.on('ready', function () {
    // console.log(that.boardsReady);
    log('yellow', 'Boards ready');
    log('yellow', 'Loading accessories...');

    this.each(board => that.loadAccessories(board));
  });
};

Server.prototype.loadAccessories = function (board) {
  const { id } = board;

  this.db.collection('accessories')
    .find({ board: id })
    .toArray((queryErr, results) => {
      if (queryErr) throw new Error(queryErr);
      if (results.length >= 1) {
        const term = `accessor${results.length > 1 ? 'ies' : 'y'}`;
        log('yellow', `${results.length} ${term} found for board ${id}`);

        const accessories = AccessoryLoader(results, board);
        accessories.forEach((accessory) => {
          this.bridge.addBridgedAccessory(accessory);
        });
      } else {
        log('yellow', `No accessories found for board '${id}'`);
      }
    });
};

Server.prototype.connectDB = function (callback) {
  mongo.MongoClient.connect(this.config.mongo, (err, db) => {
    if (err) throw new Error(err);
    log('cyan', 'Database connection established');

    this.db = db;

    return callback();
  });
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
};

Server.prototype.startServer = function () {
  const { port, ipaddr } = this.config;
  http.listen(port, ipaddr, () => {
    log('cyan', `HTTP running on ${localAddress}:${port}`);
  });

  routes(app, this.db);
};

// Server.prototype.startSockets = async function () {
//   io.sockets.on('connection', (socket) => {
//     log('cyan', 'CLIENT CONNECTED');
//     socket.on('disconnect', () => log('cyan', 'CLIENT DISCONNECTED'));
//   });
// }

Server.prototype.printPin = (pincode) => {
  console.log('Scan this code to pair with HomePi:');
  console.log(log.colors.black.bgWhite('                       '));
  console.log(log.colors.black.bgWhite('    ┌────────────┐     '));
  console.log(log.colors.black.bgWhite(`    │ ${pincode} │     `));
  console.log(log.colors.black.bgWhite('    └────────────┘     '));
  console.log(log.colors.black.bgWhite('                       '));
};

module.exports = Server;
