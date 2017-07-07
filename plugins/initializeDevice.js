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

const log = require('../utils/logger');

module.exports = (five, io, deviceData) => {
  const { _id, type, pin } = deviceData;
  const properties = {};
  let plugin;
  let device;

  log(
    'yellow', 'LOADING DEVICE',
    'green', deviceData.type,
    'yellow', `"${deviceData.name}"`
  );

  // Dynamically assign properties
  Object.keys(deviceData.props).map((prop) => {
    properties[prop] = deviceData.props[prop]
  });

  // Create new instance of plugin type
  switch (type) {
    /*
     * @param {Number, String} pin
     * @param {String} type
     */
    case 'relay':
      plugin = 'relay';
      properties.pin = pin;
      device = new five.Relay(properties);
      break;


    /*
     * @param {String} controller
     * @param {Number, String} pin
     * @param {Function} toCelsius
     * @param {Number} freq
     */
    case 'thermometer':
      plugin = 'thermometer';
      properties.pin = pin;
      device = new five.Thermometer(properties);
      break;

    /*
     * @param {String} controller
     * @param {Number} freq
     */
    case 'hygrometer':
      plugin = 'hygrometer';
      properties.pin = pin;
      device = new five.Hygrometer(properties);
      break;

    /*
     * @param {Number, String} pin
     * @param {String} controller
     */
    case 'motion':
      plugin = 'motion';
      properties.pin = pin;
      device = new five.Motion(properties);
      break;

    /*
     * @param {String} controller
     */
    case 'multi':
      plugin = 'multi';
      device = new five.Multi(properties);
      break;

    // Custom device type
    default:
      // device = deviceData.prototype(five, deviceData);
      // plugin = deviceData.plugin;
  }

  /*
   * @param {Object} socket From io.socket
   * @param {Object} data Socket event data (if apply)
   * @param {Object} device New created device
   * @param {Object} deviceData Device info/props
   *
   * eslint-disable-next-line global-require import/no-dynamic-require global-require
   */
  const devicePlugin = require(`./${plugin}`);

  io.on('connection', (socket) => {
    // Attach device events
    devicePlugin.events(socket, device, deviceData);

    // Attach device actions to socket.io
    socket.on(_id, (data) => {
      log('cyan', `RECEIVED ${_id}`, 'magenta', data);

      devicePlugin.actions(socket, data, device, deviceData);
    });
  });
};
