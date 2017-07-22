/**
 * Copyright (c) 2017-present Alexis Leon
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const path = require('path');

let config;
let customStoragePath;

const Path = {
  config,

  storagePath() {
    if (customStoragePath) return customStoragePath;
    const home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    return path.join(home, '.homepi');
  },

  configFile: () => path.join(__dirname, '..', 'config.json'),

  persistPath: () => path.join(Path.storagePath(), 'persist'),

  cachedAccessoryPath: () => path.join(Path.storagePath(), 'accessories'),

  setStoragePath(storagePath) {
    customStoragePath = storagePath;
  },
};

module.exports = Path;
