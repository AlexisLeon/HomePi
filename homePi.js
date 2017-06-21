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
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const mongo = require('mongodb');
const io = require('socket.io').listen(http);
const config = require('config');
const five = require('johnny-five');
const initializeDevice = require('./plugins/initializeDevice');
const log = require('./utils/logger');
const localAddress = require('./utils/address');

/* Helpers */
const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const ObjectID = id => new mongo.ObjectID(id);

/* Server config */
app.set('ipaddr', config.get('ipaddr'));
app.set('port', config.get('port'));
app.set('json spaces', 4);
app.use(morgan(nodeEnv !== 'development' ? 'common' : 'dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


/* Connect to Database */
mongo.MongoClient.connect(config.get('mongo'), (err, db) => {
  if (err) throw new Error(err);
  log('cyan', 'Database connection stabilised');

  /* Start Server */
  http.listen(config.get('port'), config.get('ipaddr'), () => {
    log('inverse', '                                ');
    log('inverse', `  Running at ${localAddress}:${config.get('port')}  `);
    log('inverse', '                                ');
  });

  /* Initialize Board */
  const board = new five.Board();
  log('yellow', 'Waiting for board...');

  board.on('ready', () => {
    log('yellow', 'Board ready');

    /* Socket.io */
    io.on('connection', (socket) => {
      log('cyan', 'CLIENT CONNECTED');
      socket.on('disconnect', () => log('cyan', 'CLIENT DISCONNECTED'));

      /* Initialize Devices */
      db.collection('devices').find({}).toArray((queryErr, result) => {
        if (queryErr) throw new Error(queryErr);

        result.map(device => initializeDevice(five, socket, device));
      });
    });
  });

  /* Server routing */
  app.get('/', (req, res) => {
    res.json({ status: 'running' });
  });

  // Get all devices
  app.get('/devices', (req, res) => {
    db.collection('devices').find({}).toArray((queryErr, result) => {
      if (queryErr) return res.send(queryErr);

      return res.json(result);
    });
  });

  // Create new Device
  app.post('/devices', (req, res) => {
    const { name, description, type, pin, plugin, props } = req.body;

    db.collection('devices')
      .insertOne({
        name,
        description,
        type,
        pin,
        plugin,
        props: props || {},
      }, (insertErr, result) => {
        if (insertErr) return res.send(insertErr);

        log('cyan', `New device created: ${req.body.name}`);
        return res.json(req.body);
      });
  });

  // Get single device
  app.get('/devices/:device_id', (req, res) => {
    db.collection('devices').findOne(ObjectID(req.params.device_id),
      ((queryErr, result) => {
        if (queryErr) return res.send(queryErr);

        return res.json(result);
      }),
    );
  });

  // Delete device
  app.delete('/devices/:device_id', (req, res) => {
    db.collection('devices')
      .remove(ObjectID(req.params.device_id), (deleteErr, result) => {
        if (deleteErr) return res.send(deleteErr);

        log('cyan', `Device removed: ${req.body.params.device_id}`);
        return res.json(result);
      });
  });
});
