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
  log('yellow', `${deviceData.type} ${deviceData.name} loaded`);

  const { _id, pin } = deviceData;
  let plugin;
  let device;

  // Create new instance of plugin type
  switch (deviceData.type) {
    /*
     * @param pin
     * @param type
     */
    case 'relay':
      plugin = 'relay';
      device = new five.Relay({
        pin,
        type: deviceData.props.type,
      });
      break;


    /*
     * @param controller
     * @param pin
     * @param toCelsius
     * @param freq
     */
    case 'temperature':
      plugin = 'temperature';
      device = new five.Thermometer({
        controller: deviceData.props.controller,
        pin,
        toCelsius: deviceData.props.toCelsius,
        freq: deviceData.props.freq,
      });
      break;

    /*
     * @param controller
     * @param freq
     */
    case 'humidity':
      plugin = 'humidity';
      device = new five.Hygrometer({
        controller: deviceData.props.controller,
        freq: deviceData.props.freq,
      });
      break;

    /*
     * @param pin
     * @param controller
     */
    case 'motion':
      plugin = 'motion';
      device = new five.Motion({
        pin,
        controller: deviceData.props.controller,
      });
      break;

    // Custom device type
    default:
      // device = deviceData.prototype(five, deviceData);
      // plugin = deviceData.plugin;
  }

  // Attach event and it's action to socket
  socket.on(_id, (data) => {
    log('magenta', `${deviceData.type} ${deviceData.name} ${data}`);
    require(`./${plugin}`)(socket, device, data);
  });
};
