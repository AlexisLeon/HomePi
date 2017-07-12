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

/* Helpers */
const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const ObjectID = id => new mongo.ObjectID(id);

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
  app.get('/', (req, res) => {
    res.json({ status: 'running' });
  });

  app.get('/socket', (req, res) => {
    res.sendFile(__dirname + '/socket.html');
  });

  // Get all devices
  app.get('/devices', (req, res) => {
    db.collection('devices')
      .find({})
      .toArray((queryErr, result) => {
        if (queryErr) return res.send(queryErr);

        return res.json(result);
      });
  });

  // Create new Device
  app.post('/devices', async (req, res) => {
    const { name, type } = req.body;
    const newDevice = { // Required props
      name,
      type,
      props: {}
    };

    // TODO: validate device props, eg. missing params

    // Create Document Object
    Object.keys(req.body).map((prop) => {
      newDevice[prop] = req.body[prop]
    });

    // Insert document
    db.collection('devices')
      .insertOne(newDevice, (insertErr) => {
        if (insertErr) return res.send(insertErr);

        log(
          'cyan', `CREATED NEW DEVICE`,
          'magenta', req.body.type,
          'cyan', `"${req.body.name}"`
        );

        initializeDevice(five, io.sockets, newDevice);
        return res.json(newDevice);
      });
  });

  // Get single device
  app.get('/devices/:device_id', (req, res) => {
    db.collection('devices').findOne(ObjectID(req.params.device_id),
      (queryErr, result) => {
        if (queryErr) return res.send(queryErr);

        return res.json(result);
      },
    );
  });

  // Delete device
  app.delete('/devices/:device_id', (req, res) => {
    db.collection('devices')
      .remove(ObjectID(req.params.device_id), (deleteErr, result) => {
        if (deleteErr) return res.send(deleteErr);

        log(
          'cyan', 'REMOVED DEVICE',
          'magenta', req.body.params.device_id
        );
        return res.json(result);
      });
  });
});
