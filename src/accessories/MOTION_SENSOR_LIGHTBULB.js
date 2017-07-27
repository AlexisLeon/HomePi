const {
  Accessory,
  Service,
  Characteristic,
  uuid,
} = require('hap-nodejs');
const five = require('johnny-five');

module.exports = ({ name, accessory, component, board }) => {
  const sensor = { ...component.sensor, board };
  const actuator = { ...component.actuator, board };

  const MotionSensorController = {
    sensor: new five.Motion(sensor),
    actuator: new five.Relay(actuator),
    name: name || 'Motion Sensor',
    username: accessory.username || '1A:2B:3D:4D:2E:AF',
    pincode: accessory.pincode || '031-45-154',
    manufacturer: accessory.manufacturer || null,
    model: accessory.model || null,
    serialNumber: accessory.serialNumber || null,

    motionDetected: false,
    outputLogs: false, // output logs
    status() {
      MotionSensorController.motionDetected = MotionSensorController.sensor.detectedMotion;
      if (this.outputLogs) console.log('MOTION STATUS IS ', MotionSensorController.sensor.detectedMotion);
      return this.motionDetected;
    },
    identify() {
      if (this.outputLogs) console.log('Identify the motion sensor!');
    },
  };

  // Create new Accessory
  const motionSensorUUID = uuid.generate('hap-nodejs:accessories:motionsensor');
  const motionSensor = new Accessory(MotionSensorController.name, motionSensorUUID);

  // Set accessory publishing props
  motionSensor.username = MotionSensorController.username;
  motionSensor.pincode = MotionSensorController.pincode;

  motionSensor
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, MotionSensorController.manufacturer)
    .setCharacteristic(Characteristic.Model, MotionSensorController.model)
    .setCharacteristic(Characteristic.SerialNumber, MotionSensorController.serialNumber);

  motionSensor.on('identify', (paired, callback) => {
    MotionSensorController.identify();
    callback();
  });

  motionSensor
    .addService(Service.MotionSensor, MotionSensorController.name)
    .setCharacteristic(Characteristic.MotionDetected, MotionSensorController.motionDetected)
    .getCharacteristic(Characteristic.MotionDetected)
    .on('get', callback => callback(null, MotionSensorController.status()));

  // Handle motion sensor state
  MotionSensorController.sensor
    .on('motionstart', () => {
      MotionSensorController.actuator.on();

      motionSensor
        .getService(Service.MotionSensor)
        .setCharacteristic(Characteristic.MotionDetected, MotionSensorController.status());
    });

  // Handle motion sensor state
  MotionSensorController.sensor
    .on('motionend', () => {
      MotionSensorController.actuator.off();

      motionSensor
        .getService(Service.MotionSensor)
        .setCharacteristic(Characteristic.MotionDetected, MotionSensorController.status());
    });

  return motionSensor;
};
