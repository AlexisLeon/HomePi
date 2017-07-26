/**
 * Copyright (c) 2017-present Alexis Leon
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const program = require('commander');
const version = require('./utils/version');
const Server = require('./server');

module.exports = () => {
  program
    .version(version)
    .parse(process.argv);

  const server = new Server();

  server.run();
};
