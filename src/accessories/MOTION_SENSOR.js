const {
  Accessory,
  Service,
  Characteristic,
  uuid,
} = require('hap-nodejs');
const five = require('johnny-five');

module.exports = ({ name, accessory, component }) => {
  const MotionSensorController = {
    component: new five.Motion(component),
    name: name || 'Motion Sensor',
    username: accessory.username || '1A:2B:3D:4D:2E:AF',
    pincode: accessory.pincode || '031-45-154',
    manufacturer: accessory.manufacturer || null,
    model: accessory.model || null,
    serialNumber: accessory.serialNumber || null,

    motionDetected: false,
    status: function() {
      MotionSensorController.motionDetected = MotionSensorController.component.detectedMotion;
      console.log('MOTION STATUS IS ', MotionSensorController.component.detectedMotion);
      return this.motionDetected;
    },
    identify: function() {
      console.log('Identify the motion sensor!');
    }
  }

  // Create new Accessory
  var motionSensorUUID = uuid.generate('hap-nodejs:accessories:motionsensor');
  var motionSensor = new Accessory(MotionSensorController.name, motionSensorUUID);

  // Set accessory publishing props
  motionSensor.username = MotionSensorController.username;
  motionSensor.pincode = MotionSensorController.pincode;

  motionSensor
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, MotionSensorController.manufacturer)
    .setCharacteristic(Characteristic.Model, MotionSensorController.model)
    .setCharacteristic(Characteristic.SerialNumber, MotionSensorController.serialNumber);

  motionSensor.on('identify', function(paired, callback) {
    MotionSensorController.identify();
    callback();
  });

  motionSensor
    .addService(Service.MotionSensor, MotionSensorController.name)
    .setCharacteristic(Characteristic.MotionDetected, MotionSensorController.motionDetected)
    .getCharacteristic(Characteristic.MotionDetected)
    .on('get', function(callback) {
       callback(null, MotionSensorController.status());
  });

  // Handle motion sensor state
  MotionSensorController.component
    .on('motionstart', function() {
      motionSensor
        .getService(Service.MotionSensor)
        .setCharacteristic(Characteristic.MotionDetected, MotionSensorController.status());
    });

  // Handle motion sensor state
  MotionSensorController.component
    .on('motionend', function() {
      motionSensor
        .getService(Service.MotionSensor)
        .setCharacteristic(Characteristic.MotionDetected, MotionSensorController.status());
    });

  return motionSensor;
};
