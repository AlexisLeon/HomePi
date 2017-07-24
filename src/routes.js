/**
 * Copyright (c) 2017-present Alexis Leon
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const mongo = require('mongodb');
const path = require('path');
// const initializeAccessory = require('./plugins/initializeAccessory');
const log = require('./utils/logger');

/* Helpers */
const ObjectID = id => new mongo.ObjectID(id);

module.exports = (app, db, five) => {
  app.get('/', (req, res) => {
    res.json({ status: 'running' });
  });

  app.get('/socket', (req, res) => {
    res.sendFile(path.join(__dirname, '../socket.html'));
  });

  // Get all accessories
  app.get('/accessories', (req, res) => {
    db.collection('accessories')
      .find({})
      .toArray((queryErr, result) => {
        if (queryErr) return res.send(queryErr);

        return res.json(result);
      });
  });

  // Create new Accessory
  app.post('/accessories', async (req, res) => {
    const { board, name, type, category } = req.body;
    const newAccessory = { // Required props
      board,
      name,
      component: { // Johnny-Five
        type,
      },
      accessory: { // HAP
        category,
      }
    };

    // TODO: validate accessory props, eg. missing params
    // TODO: ref accessory._id to board.accessories

    // Create Document Object
    Object.keys(req.body).map((prop) => {
      newAccessory[prop] = req.body[prop]
    });

    // Insert document
    db.collection('accessories')
      .insertOne(newAccessory, (insertErr) => {
        if (insertErr) return res.send(insertErr);

        log(
          'cyan', 'CREATED NEW DEVICE',
          'magenta', req.body.type,
          'cyan', `"${req.body.name}"`
        );

        // initializeAccessory(five, io.sockets, newAccessory);
        return res.json(newAccessory);
      });
  });

  // Get single accessory
  app.get('/accessories/:accessory_id', (req, res) => {
    db.collection('accessories').findOne(ObjectID(req.params.accessory_id),
      (queryErr, result) => {
        if (queryErr) return res.send(queryErr);

        return res.json(result);
      },
    );
  });

  // Delete accessory
  app.delete('/accessories/:accessory_id', (req, res) => {
    db.collection('accessories')
      .remove(ObjectID(req.params.accessory_id), (deleteErr, result) => {
        if (deleteErr) return res.send(deleteErr);

        log(
          'cyan', 'REMOVED DEVICE',
          'magenta', req.body.params.accessory_id
        );
        return res.json(result);
      });
  });

  /*
   * Boards
   */

  // Get all boards
  app.get('/boards', (req, res) => {
    db.collection('boards')
      .find({})
      .toArray((queryErr, result) => {
        if (queryErr) return res.send(queryErr);

        return res.json(result);
      });
  });

  // Create new Board
  app.post('/boards', async (req, res) => {
    const { id, host, type, port } = req.body;
    const newBoard = { // Required props
      id,
      host,
      type,
      port,
      accessories: [],
    };

    // TODO: ref board.accessories to accessory._id

    // Insert document
    db.collection('boards')
      .insertOne(newBoard, (insertErr) => {
        if (insertErr) return res.send(insertErr);

        log(
          'cyan', 'CREATED NEW BOARD',
          'magenta', host || port,
        );

        return res.json(newBoard);
      });
  });

  // Get single board
  app.get('/boards/:board_id', (req, res) => {
    db.collection('boards').findOne(ObjectID(req.params.board_id),
      (queryErr, result) => {
        if (queryErr) return res.send(queryErr);

        return res.json(result);
      },
    );
  });

  // Delete board
  app.delete('/boards/:board_id', (req, res) => {
    db.collection('boards')
      .remove(ObjectID(req.params.board_id), (deleteErr, result) => {
        if (deleteErr) return res.send(deleteErr);

        log(
          'cyan', 'REMOVED BOARD',
          'magenta', req.body.params.board_id
        );

        return res.json(result);
      });
  });
}
