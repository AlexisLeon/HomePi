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

module.exports = ({ name, accessory, component }, board) => {
  component.board = board;

  const LightController = {
    component: new five.Relay(component),
    name: name || "Simple Light",
    pincode: accessory.pincode || "031-45-154",
    username: accessory.username || "FA:3C:ED:5A:1A:1A",
    manufacturer: accessory.manufacturer || null,
    model: accessory.model || null,
    serialNumber: accessory.serialNumber || null,

    power: false, //curent power status
    brightness: 100, //current brightness
    hue: 0, //current hue
    saturation: 0, //current saturation
    outputLogs: false, //output logs

    setPower: function(status) { //set power of accessory
      if(this.outputLogs) console.log("Turning the '%s' %s", this.name, status ? "on" : "off");
      status ? LightController.component.on() : LightController.component.off();

      this.power = status;
    },

    getPower: function() { //get power of accessory
      if(this.outputLogs) console.log("'%s' is %s.", this.name, this.power ? "on" : "off");
      LightController.power = LightController.component.isOn;
      return this.power;
    },

    setBrightness: function(brightness) { //set brightness
      if(this.outputLogs) console.log("Setting '%s' brightness to %s", this.name, brightness);
      this.brightness = brightness;
    },

    getBrightness: function() { //get brightness
      if(this.outputLogs) console.log("'%s' brightness is %s", this.name, this.brightness);
      return this.brightness;
    },

    setSaturation: function(saturation) { //set saturation
      if(this.outputLogs) console.log("Setting '%s' saturation to %s", this.name, saturation);
      this.saturation = saturation;
    },

    getSaturation: function() { //get saturation
      if(this.outputLogs) console.log("'%s' saturation is %s", this.name, this.saturation);
      return this.saturation;
    },

    setHue: function(hue) { //set Hue
      if(this.outputLogs) console.log("Setting '%s' hue to %s", this.name, hue);
      this.hue = hue;
    },

    getHue: function() { //get hue
      if(this.outputLogs) console.log("'%s' hue is %s", this.name, this.hue);
      return this.hue;
    },

    identify: function() { //identify the accessory
      if(this.outputLogs) console.log("Identify the '%s'", this.name);
    }
  }

  // Create new Accessory
  var lightUUID = uuid.generate('hap-nodejs:accessories:light' + LightController.name);
  var lightAccessory = new Accessory(LightController.name, lightUUID);

  // Set accessory publishing props
  lightAccessory.username = LightController.username;
  lightAccessory.pincode = LightController.pincode;

  lightAccessory
    .getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, LightController.manufacturer)
      .setCharacteristic(Characteristic.Model, LightController.model)
      .setCharacteristic(Characteristic.SerialNumber, LightController.serialNumber);

  // listen for the "identify" event for this Accessory
  lightAccessory.on('identify', function(paired, callback) {
    LightController.identify();
    callback();
  });

  // Add the actual Lightbulb Service and listen for change events from iOS.
  // We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
  lightAccessory
    .addService(Service.Lightbulb, LightController.name) // services exposed to the user should have "names" like "Light" for this case
    .setCharacteristic(Characteristic.On, LightController.getPower())
    .getCharacteristic(Characteristic.On)
    .on('set', function(value, callback) {
      LightController.setPower(value);

      // Our light is synchronous - this value has been successfully set
      // Invoke the callback when you finished processing the request
      // If it's going to take more than 1s to finish the request, try to invoke the callback
      // after getting the request instead of after finishing it. This avoids blocking other
      // requests from HomeKit.
      callback();
    })
    // We want to intercept requests for our current power state so we can query the hardware itself instead of
    // allowing HAP-NodeJS to return the cached Characteristic.value.
    .on('get', function(callback) {
      callback(null, LightController.getPower());
    });

  // To inform HomeKit about changes occurred outside of HomeKit (like user physically turn on the light)
  // Please use Characteristic.updateValue
  //
  // lightAccessory
  //   .getService(Service.Lightbulb)
  //   .getCharacteristic(Characteristic.On)
  //   .updateValue(true);

  // // also add an "optional" Characteristic for Brightness
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

  // // also add an "optional" Characteristic for Saturation
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

  // // also add an "optional" Characteristic for Hue
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
