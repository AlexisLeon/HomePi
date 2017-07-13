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

const mongo = require('mongodb');
const path = require('path');
const initializeDevice = require('../plugins/initializeDevice');
const log = require('../utils/logger');

/* Helpers */
const ObjectID = id => new mongo.ObjectID(id);

module.exports = (app, io, db, five) => {
  app.get('/', (req, res) => {
    res.json({ status: 'running' });
  });

  app.get('/socket', (req, res) => {
    res.sendFile(path.join(__dirname, '../socket.html'));
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
          'cyan', 'CREATED NEW DEVICE',
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
}
