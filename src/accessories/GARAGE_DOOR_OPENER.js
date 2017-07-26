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
  const GarageController = {
    component: new five.Relay(component),
    name: name || 'Garage Door',
    pincode: accessory.pincode || '031-45-154',
    username: accessory.username || 'C1:5D:3F:EE:5E:FA',
    manufacturer: accessory.manufacturer || null,
    model: accessory.model || null,
    serialNumber: accessory.serialNumber || null,

    opened: false,
    outputLogs: false, // output logs
    open() {
      if (this.outputLogs) console.log('Opening the Garage!');
      GarageController.component.on();
      GarageController.opened = true;
    },
    close() {
      if (this.outputLogs) console.log('Closing the Garage!');
      GarageController.component.off();
      GarageController.opened = false;
    },
    identify() {
      if (this.outputLogs) console.log('Identify the Garage');
    },
    status() {
      if (this.outputLogs) console.log('Sensor queried!');
      GarageController.opened = GarageController.component.isOn;
    },
  };

  // Create new Accessory
  const garageUUID = uuid.generate('hap-nodejs:accessories:GarageDoor');
  const garage = new Accessory(GarageController.name, garageUUID);

  // Set accessory publishing props
  garage.username = GarageController.username;
  garage.pincode = GarageController.pincode;

  garage
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, GarageController.manufacturer)
    .setCharacteristic(Characteristic.Model, GarageController.model)
    .setCharacteristic(Characteristic.SerialNumber, GarageController.serialNumber);

  garage.on('identify', (paired, callback) => {
    GarageController.identify();
    callback();
  });

  garage
    .addService(Service.GarageDoorOpener, GarageController.name)
    .setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED)
    .getCharacteristic(Characteristic.TargetDoorState)
    .on('set', (value, callback) => {
      if (value === Characteristic.TargetDoorState.CLOSED) {
        GarageController.close();
        callback();
        garage
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(
            Characteristic.CurrentDoorState,
            Characteristic.CurrentDoorState.CLOSED,
          );
      } else if (value === Characteristic.TargetDoorState.OPEN) {
        GarageController.open();
        callback();
        garage
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
      }
    });

  garage
    .getService(Service.GarageDoorOpener)
    .getCharacteristic(Characteristic.CurrentDoorState)
    .on('get', (callback) => {
      const err = null;
      GarageController.status();

      if (GarageController.opened) {
        if (this.outputLogs) console.log('Query: Is Garage Open? Yes.');
        callback(err, Characteristic.CurrentDoorState.OPEN);
      } else {
        if (this.outputLogs) console.log('Query: Is Garage Open? No.');
        callback(err, Characteristic.CurrentDoorState.CLOSED);
      }
    });

  return garage;
};
