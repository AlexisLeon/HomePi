/**
 * Copyright (c) 2017-present Alexis Leon
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// HomeKit Types UUID's
const st = id => `000000${id}-0000-1000-8000-0026BB765291`

// HomeKitTransportCategoryTypes
export const OTHER_TCTYPE = 1;
export const FAN_TCTYPE = 3;
export const GARAGE_DOOR_OPENER_TCTYPE = 4;
export const LIGHTBULB_TCTYPE = 5;
export const DOOR_LOCK_TCTYPE = 6;
export const OUTLET_TCTYPE = 7;
export const SWITCH_TCTYPE = 8;
export const THERMOSTAT_TCTYPE = 9;
export const SENSOR_TCTYPE = 10;
export const ALARM_SYSTEM_TCTYPE = 11;
export const DOOR_TCTYPE = 12;
export const WINDOW_TCTYPE = 13;
export const WINDOW_COVERING_TCTYPE = 14;
export const PROGRAMMABLE_SWITCH_TCTYPE = 15;

// HomeKitServiceTypes
export const LIGHTBULB_STYPE = st('43');
export const SWITCH_STYPE = st('49');
export const THERMOSTAT_STYPE = st('4A');
export const GARAGE_DOOR_OPENER_STYPE = st('41');
export const ACCESSORY_INFORMATION_STYPE = st('3E');
export const FAN_STYPE = st('40');
export const OUTLET_STYPE = st('47');
export const LOCK_MECHANISM_STYPE = st('45');
export const LOCK_MANAGEMENT_STYPE = st('44');
export const ALARM_STYPE = st('7E');
export const WINDOW_COVERING_STYPE = st('8C');
export const OCCUPANCY_SENSOR_STYPE = st('86');
export const CONTACT_SENSOR_STYPE = st('80');
export const MOTION_SENSOR_STYPE = st('85');
export const HUMIDITY_SENSOR_STYPE = st('82');
export const TEMPERATURE_SENSOR_STYPE = st('8A');

// HomeKitCharacteristicsTypes
export const ALARM_CURRENT_STATE_CTYPE = st('66');
export const ALARM_TARGET_STATE_CTYPE = st('67');
export const ADMIN_ONLY_ACCESS_CTYPE = st('01');
export const AUDIO_FEEDBACK_CTYPE = st('05');
export const BRIGHTNESS_CTYPE = st('08');
export const BATTERY_LEVEL_CTYPE = st('68');
export const COOLING_THRESHOLD_CTYPE = st('0D');
export const CONTACT_SENSOR_STATE_CTYPE = st('6A');
export const CURRENT_DOOR_STATE_CTYPE = st('0E');
export const CURRENT_LOCK_MECHANISM_STATE_CTYPE = st('1D');
export const CURRENT_RELATIVE_HUMIDITY_CTYPE = st('10');
export const CURRENT_TEMPERATURE_CTYPE = st('11');
export const HEATING_THRESHOLD_CTYPE = st('12');
export const HUE_CTYPE = st('13');
export const IDENTIFY_CTYPE = st('14');
export const LOCK_MANAGEMENT_AUTO_SECURE_TIMEOUT_CTYPE = st('1A');
export const LOCK_MANAGEMENT_CONTROL_POINT_CTYPE = st('19');
export const LOCK_MECHANISM_LAST_KNOWN_ACTION_CTYPE = st('1C');
export const LOGS_CTYPE = st('1F');
export const MANUFACTURER_CTYPE = st('20');
export const MODEL_CTYPE = st('21');
export const MOTION_DETECTED_CTYPE = st('22');
export const NAME_CTYPE = st('23');
export const OBSTRUCTION_DETECTED_CTYPE = st('24');
export const OUTLET_IN_USE_CTYPE = st('26');
export const OCCUPANCY_DETECTED_CTYPE = st('71');
export const POWER_STATE_CTYPE = st('25');
export const PROGRAMMABLE_SWITCH_SWITCH_EVENT_CTYPE = st('73');
export const PROGRAMMABLE_SWITCH_OUTPUT_STATE_CTYPE = st('74');
export const ROTATION_DIRECTION_CTYPE = st('28');
export const ROTATION_SPEED_CTYPE = st('29');
export const SATURATION_CTYPE = st('2F');
export const SERIAL_NUMBER_CTYPE = st('30');
export const STATUS_LOW_BATTERY_CTYPE = st('79');
export const STATUS_FAULT_CTYPE = st('77');
export const TARGET_DOORSTATE_CTYPE = st('32');
export const TARGET_LOCK_MECHANISM_STATE_CTYPE = st('1E');
export const TARGET_RELATIVE_HUMIDITY_CTYPE = st('34');
export const TARGET_TEMPERATURE_CTYPE = st('35');
export const TEMPERATURE_UNITS_CTYPE = st('36');
export const VERSION_CTYPE = st('37');
export const WINDOW_COVERING_TARGET_POSITION_CTYPE = st('7C');
export const WINDOW_COVERING_CURRENT_POSITION_CTYPE = st('6D');
export const WINDOW_COVERING_OPERATION_STATE_CTYPE = st('72');
export const CURRENTHEATINGCOOLING_CTYPE = st('0F');
export const TARGETHEATINGCOOLING_CTYPE = st('33');
