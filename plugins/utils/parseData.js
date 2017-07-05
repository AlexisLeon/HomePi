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
const five = require('johnny-five');

module.exports = (data) => {
  let res = {};

  if (data.accelerometer instanceof five.Accelerometer) {
    const { pitch, roll, x, y, z, acceleration, inclination, orientation } = data.accelerometer;
    res.accelerometer = { pitch, roll, x, y, z, acceleration, inclination, orientation };
  }

  if (data.altimeter instanceof five.Altimeter) {
    const { feet, meters } = data.altimeter;
    res.altimeter = { feet, meters };
  }

  if (data.barometer instanceof five.Barometer) {
    const { pressure } = data.barometer;
    res.barometer = { pressure };
  }

  if (data.gyro instanceof five.Gyro) {
    const { isCalibrated, pitch, roll, yaw, rate, x, y, z } = data.gyro;
    res.gyro = { isCalibrated, pitch, roll, yaw, rate, x, y, z };
  }

  if (data.hygrometer instanceof five.Hygrometer) {
    const { relativeHumidity, RH } = data.hygrometer;
    res.hygrometer = { relativeHumidity, RH };
  }

  if (data instanceof five.Motion) {
    const { value, detectedMotion, isCalibrated } = data;
    res = { value, detectedMotion, isCalibrated };
  }

  if (data instanceof five.Relay) {
    const { isOn, type } = data;
    res = { isOn, type };
  }

  if (data.thermometer instanceof five.Thermometer) {
    const { celsius, fahrenheit, kelvin, C, F, K } = data.thermometer;
    res.thermometer = { celsius, fahrenheit, kelvin, C, F, K };
  }

  return res;
};
