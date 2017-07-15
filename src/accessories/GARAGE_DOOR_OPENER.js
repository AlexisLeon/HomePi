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

module.exports = ({ accessory, component }) => {
  const GARAGE = {
    component: new five.Relay(component),
    opened: false,
    open: function() {
      console.log("Opening the Garage!");
      GARAGE.component.on();
      GARAGE.opened = true;
    },
    close: function() {
      console.log("Closing the Garage!");
      GARAGE.component.off();
      GARAGE.opened = false;
    },
    identify: function() {
      console.log("Identify the Garage");
    },
    status: function(){
      console.log("Sensor queried!");
      GARAGE.opened = GARAGE.component.isOn;
    }
  };

  // Assign properties
  Object.keys(accessory).forEach((prop) => {
    GARAGE[prop] = accessory[prop]
  });


  // Create new Accessory
  var garageUUID = uuid.generate('hap-nodejs:accessories:'+'GarageDoor');
  var garage = new Accessory('Garage Door', garageUUID);

  // Set accessory publishing propst
  garage.username = GARAGE.username || "C1:5D:3F:EE:5E:FA";
  garage.pincode = GARAGE.pincode || "031-45-154";

  garage
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, GARAGE.manufacturer || "Liftmaster")
    .setCharacteristic(Characteristic.Model, GARAGE.model || "Rev-1")
    .setCharacteristic(Characteristic.SerialNumber, GARAGE.serialNumber || "TW000165");

  garage.on('identify', function(paired, callback) {
    GARAGE.identify();
    callback();
  });

  garage
    .addService(Service.GarageDoorOpener, "Garage Door")
    .setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED) // force initial state to CLOSED
    .getCharacteristic(Characteristic.TargetDoorState)
    .on('set', function(value, callback) {

      if (value == Characteristic.TargetDoorState.CLOSED) {
        GARAGE.close();
        callback();
        garage
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
      }
      else if (value == Characteristic.TargetDoorState.OPEN) {
        GARAGE.open();
        callback();
        garage
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
      }
    });

  garage
    .getService(Service.GarageDoorOpener)
    .getCharacteristic(Characteristic.CurrentDoorState)
    .on('get', function(callback) {

      var err = null;
      GARAGE.status();

      if (GARAGE.opened) {
        console.log("Query: Is Garage Open? Yes.");
        callback(err, Characteristic.CurrentDoorState.OPEN);
      }
      else {
        console.log("Query: Is Garage Open? No.");
        callback(err, Characteristic.CurrentDoorState.CLOSED);
      }
    });

  return garage;
};
