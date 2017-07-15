/**
 * Copyright (c) 2017-present Alexis Leon
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// var debug = require('debug')('AccessoryLoader');

const fs = require('fs');
const path = require('path');
const { AccessoryLoader, Accessory } = require('hap-nodejs');

const debug = (data, params) => console.log(data, params)

module.exports = (accessories) => {
  const loadedAccessories = [];

  accessories.forEach((accessory) => {
    debug('Parsing accessory: %s', accessory.accessory.category);
    const loadedAccessory = require(path.join(__dirname, accessory.accessory.category))(accessory);
    loadedAccessories.push(loadedAccessory);
  });

  return loadedAccessories.map((accessory) => {
    // check if accessory is not empty
    if (accessory === null || accessory === undefined) {
      console.log("Invalid accessory!");
      return false;
    } else {
      return (accessory instanceof Accessory) ? accessory : AccessoryLoader.parseAccessoryJSON(accessory);
    }
  }).filter((accessory) => (accessory ? true : false));
}
