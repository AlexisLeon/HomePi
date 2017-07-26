/**
 * Copyright (c) 2017-present Alexis Leon
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
  Accessory,
  Service,
  Characteristic,
  uuid,
} = require('hap-nodejs');
const five = require('johnny-five');

module.exports = ({ name, accessory, component }) => {
  const LightController = {
    component: new five.Relay(component),
    name: name || 'Simple Light',
    pincode: accessory.pincode || '031-45-154',
    username: accessory.username || 'FA:3C:ED:5A:1A:1A',
    manufacturer: accessory.manufacturer || null,
    model: accessory.model || null,
    serialNumber: accessory.serialNumber || null,

    power: false, // current power status
    brightness: 100, // current brightness
    hue: 0, // current hue
    saturation: 0, // current saturation
    outputLogs: false, // output logs

    setPower(status) { // set power of accessory
      if (this.outputLogs) console.log('Turning the "%s" %s', this.name, status ? 'on' : 'off');

      if (status) {
        LightController.component.on();
      } else {
        LightController.component.off();
      }

      this.power = status;
    },
    status() { // get power of accessory
      if (this.outputLogs) console.log('"%s" is %s.', this.name, this.power ? 'on' : 'off');
      LightController.power = LightController.component.isOn;
      return this.power;
    },
    setBrightness(brightness) { // set brightness
      if (this.outputLogs) console.log('Setting "%s" brightness to %s', this.name, brightness);
      this.brightness = brightness;
    },
    getBrightness() { // get brightness
      if (this.outputLogs) console.log('"%s" brightness is %s', this.name, this.brightness);
      return this.brightness;
    },
    setSaturation(saturation) { // set saturation
      if (this.outputLogs) console.log('Setting "%s" saturation to %s', this.name, saturation);
      this.saturation = saturation;
    },
    getSaturation() { // get saturation
      if (this.outputLogs) console.log('"%s" saturation is %s', this.name, this.saturation);
      return this.saturation;
    },
    setHue(hue) { // set Hue
      if (this.outputLogs) console.log('Setting "%s" hue to %s', this.name, hue);
      this.hue = hue;
    },
    getHue() { // get hue
      if (this.outputLogs) console.log('"%s" hue is %s', this.name, this.hue);
      return this.hue;
    },
    identify() { // identify the accessory
      if (this.outputLogs) console.log('Identify the "%s"', this.name);
    },
  };

  // Create new Accessory
  const lightUUID = uuid.generate(`hap-nodejs:accessories:light${LightController.name}`);
  const lightAccessory = new Accessory(LightController.name, lightUUID);

  // Set accessory publishing props
  lightAccessory.username = LightController.username;
  lightAccessory.pincode = LightController.pincode;

  lightAccessory
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, LightController.manufacturer)
    .setCharacteristic(Characteristic.Model, LightController.model)
    .setCharacteristic(Characteristic.SerialNumber, LightController.serialNumber);

  // listen for the 'identify' event for this Accessory
  lightAccessory.on('identify', (paired, callback) => {
    LightController.identify();
    callback();
  });

  lightAccessory
    .addService(Service.Lightbulb, LightController.name)
    .setCharacteristic(Characteristic.On, LightController.status())
    .getCharacteristic(Characteristic.On)
    .on('set', (value, callback) => {
      LightController.setPower(value);

      callback();
    })
    .on('get', (callback) => {
      callback(null, LightController.status());
    });

  // Inform HomeKit about external changes.
  //
  // lightAccessory
  //   .getService(Service.Lightbulb)
  //   .getCharacteristic(Characteristic.On)
  //   .updateValue(true);

  // Brightness Characteristic
  // lightAccessory
  //   .getService(Service.Lightbulb)
  //   .addCharacteristic(Characteristic.Brightness)
  //   .on('set', function(value, callback) {
  //     LightController.setBrightness(value);
  //     callback();
  //   })
  //   .on('get', function(callback) {
  //     callback(null, LightController.getBrightness());
  //   });

  // Saturation Characteristic
  // lightAccessory
  //   .getService(Service.Lightbulb)
  //   .addCharacteristic(Characteristic.Saturation)
  //   .on('set', function(value, callback) {
  //     LightController.setSaturation(value);
  //     callback();
  //   })
  //   .on('get', function(callback) {
  //     callback(null, LightController.getSaturation());
  //   });

  // Hue Characteristic
  // lightAccessory
  //   .getService(Service.Lightbulb)
  //   .addCharacteristic(Characteristic.Hue)
  //   .on('set', function(value, callback) {
  //     LightController.setHue(value);
  //     callback();
  //   })
  //   .on('get', function(callback) {
  //     callback(null, LightController.getHue());
  //   });

  return lightAccessory;
};
