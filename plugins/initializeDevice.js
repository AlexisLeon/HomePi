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

module.exports = (five, socket, deviceData) => {
  log('yellow', `LOADING DEVICE: ${deviceData.type.toUpperCase()} "${deviceData.name}"`);

  const { _id, type, pin, props } = deviceData;
  let plugin;
  let device;

  // Create new instance of plugin type
  switch (type) {
    /*
     * @param {Number, String} pin
     * @param {String} type
     */
    case 'relay':
      plugin = 'relay';
      device = new five.Relay({
        pin,
        type: props.type,
      });
      break;


    /*
     * @param {String} controller
     * @param {Number, String} pin
     * @param {Function} toCelsius
     * @param {Number} freq
     */
    case 'thermometer':
      plugin = 'thermometer';
      device = new five.Thermometer({
        controller: deviceData.props.controller,
        pin,
        toCelsius: deviceData.props.toCelsius,
        freq: deviceData.props.freq,
      });
      break;

    /*
     * @param {String} controller
     * @param {Number} freq
     */
    case 'hygrometer':
      plugin = 'hygrometer';
      device = new five.Hygrometer({
        controller: deviceData.props.controller,
        freq: deviceData.props.freq,
      });
      break;

    /*
     * @param {Number, String} pin
     * @param {String} controller
     */
    case 'motion':
      plugin = 'motion';
      device = new five.Motion({
        pin,
        controller: deviceData.props.controller,
      });
      break;

    /*
     * @param {String} controller
     */
    case 'multi':
      plugin = 'multi';
      device = new five.Multi({
        controller: deviceData.props.controller,
      });
      break;

    // Custom device type
    default:
      // device = deviceData.prototype(five, deviceData);
      // plugin = deviceData.plugin;
  }

  /*
   * @param {Object} socket From io.sockets
   * @param {Object} data Socket event data (if apply)
   * @param {Object} device New created device
   * @param {Object} deviceData Device info/props
   *
   * eslint-disable-next-line global-require import/no-dynamic-require
   */
  const devicePlugin = require(`./${plugin}`);

  // Attach device events
  devicePlugin.events(socket, device, deviceData);

  // Attach device actions to socket
  socket.on(_id, (data) => {
    log('cyan', `RECEIVED ${_id}`, 'magenta', data);

    devicePlugin.actions(socket, data, device, deviceData);
  });
};
