/**
 * Copyright (c) 2017-present Alexis Leon
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const os = require('os');

const interfaces = os.networkInterfaces();
let addresses = [];
for(var k in interfaces) {
  for(var k2 in interfaces[k]) {
    var address = interfaces[k][k2];
    if (address.family === 'IPv4' && !address.internal) {
      addresses.push(address.address);
    }
  }
}

module.exports = addresses[0] || '127.0.0.1';
