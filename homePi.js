/**
 * Copyright (c) 2017 Alexis Leon
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const app = require('express')();
const morgan = require('morgan');
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const mongo = require('mongodb');
const io = require('socket.io')(http);
const five = require('johnny-five');
const config = require('./config.json');
const initializeDevice = require('./plugins/initializeDevice');
const log = require('./utils/logger');
const localAddress = require('./utils/address');
const routes = require('./api/routes');

/* Helpers */
const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

/* Connect to Database */
mongo.MongoClient.connect(config.mongo, (err, db) => {
  if (err) throw new Error(err);
  log('cyan', 'Database connection stabilised');

  /* Server config */
  app.set('json spaces', 4);
  app.set('ipaddr', config.ipaddr);
  app.set('port', config.port);
  app.set('sockets', io.sockets);
  app.use(morgan(nodeEnv !== 'development' ? 'common' : 'dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  /* Start Server */
  http.listen(config.port, config.ipaddr, () => {
    log('inverse', '                                ');
    log('inverse', `  Running at ${localAddress}:${config.port}  `);
    log('inverse', '                                ');
  });

  /* Socket.io */
  io.sockets.on('connection', (socket) => {
    log('cyan', 'CLIENT CONNECTED');
    socket.on('disconnect', () => log('cyan', 'CLIENT DISCONNECTED'));
  });

  /* Initialize Board */
  const board = new five.Board();
  log('yellow', 'WAITING FOR BOARD...');

  board.on('ready', () => {
    log('yellow', 'BOARD READY');

    /* Initialize Devices */
    db.collection('devices')
      .find({})
      .toArray((queryErr, result) => {
        if (queryErr) throw new Error(queryErr);

        log('yellow', 'LOADING DEVICES');

        result.map(device => initializeDevice(five, io.sockets, device));
      });
  });

  /* Server routing */
  routes(app, io, db, five);
});
