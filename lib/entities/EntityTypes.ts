/**
 * Entity information as received from ESPHome
 */
export interface EntityInfo {
  key: number;
  objectId: string;
  name: string;
  type: string;
  uniqueId?: string;
  icon?: string;
  disabledByDefault?: boolean;
  entityCategory?: number;
  unitOfMeasurement?: string;
  deviceClass?: string;
  stateClass?: number;
  accuracyDecimals?: number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  options?: string[];
}

/**
 * Entity categories from ESPHome
 */
export enum EntityCategory {
  None = 0,
  Config = 1,
  Diagnostic = 2,
}

/**
 * Known object IDs for the Itho Daalderop Amber
 */
export const EntityIds = {
  // System
  SYSTEM_ON_OFF: 'system_on_off',
  
  // Modes
  DOMESTIC_HOT_WATER_MODE: 'domestic_hot_water_mode',
  HEATING_MODE: 'heating_mode',
  COOLING_MODE: 'cooling_mode',
  WORKING_MODE: 'working_mode',
  
  // Status
  DOMESTIC_HOT_WATER_IN_PROGRESS: 'domestic_hot_water_in_progress',
  HEATING_IN_PROGRESS: 'heating_in_progress',
  COOLING_IN_PROGRESS: 'cooling_in_progress',
  DEFROST: 'defrost',
  SG_READY: 'sg_ready',
  
  // Flow switches
  WATER_FLOW_SWITCH: 'water_flow_switch',
  COOLING_SWITCH: 'cooling_switch',
  HEATING_SWITCH: 'heating_switch',
  HEATING_SWITCH_CIRCUIT_2: 'heating_switch_circuit_2',
  
  // Temperatures
  HEAT_EXCHANGER_WATER_OUTLET_TEMPERATURE: 'heat_exchanger_water_outlet_temperature',
  HEAT_EXCHANGER_WATER_INLET_TEMPERATURE: 'heat_exchanger_water_inlet_temperature',
  INDOOR_COIL_TEMPERATURE: 'indoor_coil_temperature',
  DOMESTIC_HOT_WATER_TEMPERATURE: 'domestic_hot_water_temperature',
  HEATING_COOLING_TEMPERATURE: 'heating_cooling_temperature',
  HEATING_COOLING_CIRCUIT_1_TEMPERATURE: 'heating_cooling_circuit_1_temperature',
  HEATING_COOLING_CIRCUIT_2_TEMPERATURE: 'heating_cooling_circuit_2_temperature',
  AMBIENT_TEMPERATURE: 'ambient_temperature',
  AVERAGE_1H_AMBIENT_TEMPERATURE: 'average_1h_ambient_temperature',
  AVERAGE_4H_AMBIENT_TEMPERATURE: 'average_4h_ambient_temperature',
  AVERAGE_24H_AMBIENT_TEMPERATURE: 'average_24h_ambient_temperature',
  INSIDE_TEMPERATURE: 'inside_temperature',
  DISCHARGE_TEMPERATURE: 'discharge_temperature',
  SUCTION_TEMPERATURE: 'suction_temperature',
  OUTDOOR_COIL_TEMPERATURE: 'outdoor_coil_temperature',
  
  // Dallas temperature sensors (optional)
  DALLAS_TEMPERATURE_1: 'dallas_temperature_1',
  DALLAS_TEMPERATURE_2: 'dallas_temperature_2',
  DALLAS_TEMPERATURE_3: 'dallas_temperature_3',
  
  // Pressure
  HIGH_PRESSURE: 'high_pressure',
  LOW_PRESSURE: 'low_pressure',
  
  // Compressor
  COMPRESSOR_WORKING_SPEED: 'compressor_working_speed',
  EXPANSION_VALVE_SETTING: 'expansion_valve_setting',
  FAN_SPEED: 'fan_speed',
  RUNNING_CURRENT: 'running_current',
  SUPPLY_VOLTAGE: 'supply_voltage',
  
  // Delta T
  HEAT_EXCHANGER_DELTA_T: 'heat_exchanger_delta_t',
  
  // Setpoints (actual)
  ACTUAL_SETPOINT_HEATING_ZONE_1: 'actual_setpoint_heating_zone_1',
  ACTUAL_SETPOINT_HEATING_ZONE_2: 'actual_setpoint_heating_zone_2',
  ACTUAL_SETPOINT_COOLING_ZONE_1: 'actual_setpoint_cooling_zone_1',
  ACTUAL_SETPOINT_COOLING_ZONE_2: 'actual_setpoint_cooling_zone_2',
  
  // Setpoints (configurable)
  HEATING_SETPOINT: 'heating_setpoint',
  COOLING_SETPOINT: 'cooling_setpoint',
  DOMESTIC_HOT_WATER_SETPOINT: 'domestic_hot_water_setpoint',
  DOMESTIC_HOT_WATER_REHEATING_POINT: 'domestic_hot_water_reheating_point',
  
  // Settings
  USE_HEATING_CURVE: 'use_heating_curve',
  USE_ANTI_LEGIONELLA_MODE: 'use_anti_legionella_mode',
  USE_DOMESTIC_HOT_WATER_TIMER: 'use_domestic_hot_water_timer',
  REDUCED_MODE_TIMER: 'reduced_mode_timer',
  DOMESTIC_HOT_WATER_ECO_MODE: 'domestic_hot_water_eco_mode',
  
  // Delta T settings
  DELTA_T_TO_STOP_HP: 'delta_t_to_stop_hp',
  DELTA_T_TO_RESTART_HP: 'delta_t_to_restart_hp',
  DELTA_T_TO_LOWER_COMPRESSOR_SPEED: 'delta_t_to_lower_compressor_speed',
  
  // Circuit limits
  CIRCUIT_1_MAXIMUM_TEMPERATURE: 'circuit_1_maximum_temperature',
  CIRCUIT_1_MINIMUM_TEMPERATURE: 'circuit_1_minimum_temperature',
  
  // DHW ECO
  MINIMUM_AMBIENT_TEMPERATURE_TO_START_DOMESTIC_HOT_WATER_ECO_MODE: 'minimum_ambient_temperature_to_start_domestic_hot_water_eco_mode',
  
  // Heating curve
  HEATING_CURVE_AMBIENT_TEMPERATURE_1: 'heating_curve_ambient_temperature_1',
  HEATING_CURVE_AMBIENT_TEMPERATURE_2: 'heating_curve_ambient_temperature_2',
  HEATING_CURVE_AMBIENT_TEMPERATURE_3: 'heating_curve_ambient_temperature_3',
  HEATING_CURVE_AMBIENT_TEMPERATURE_4: 'heating_curve_ambient_temperature_4',
  HEATING_CURVE_AMBIENT_TEMPERATURE_5: 'heating_curve_ambient_temperature_5',
  HEATING_CURVE_WATER_TEMPERATURE_1: 'heating_curve_water_temperature_1',
  HEATING_CURVE_WATER_TEMPERATURE_2: 'heating_curve_water_temperature_2',
  HEATING_CURVE_WATER_TEMPERATURE_3: 'heating_curve_water_temperature_3',
  HEATING_CURVE_WATER_TEMPERATURE_4: 'heating_curve_water_temperature_4',
  HEATING_CURVE_WATER_TEMPERATURE_5: 'heating_curve_water_temperature_5',
  
  // Pump speeds
  PUMP_SPEED_HEATING: 'pump_speed_heating',
  PUMP_SPEED_COOLING: 'pump_speed_cooling',
  PUMP_SPEED_DOMESTIC_HOT_WATER: 'pump_speed_domestic_hot_water',
  
  // Relays
  RELAIS_1: 'relais_1',
  RELAIS_2: 'relais_2',
  RELAIS_3: 'relais_3',
  RELAIS_4: 'relais_4',
  
  // SG Ready settings
  SG_INCREASE_SETPOINT_HEATING: 'sg_increase_setpoint_heating',
  SG_INCREASE_SETPOINT_DOMESTIC_HOT_WATER: 'sg_increase_setpoint_domestic_hot_water',
  SG_DECREASE_SETPOINT_COOLING: 'sg_decrease_setpoint_cooling',
  
  // Flow sensor
  PULSE_METER: 'pulse_meter',
  TOTAL_PULSES: 'total_pulses',
  
  // Diagnostic
  UPTIME: 'uptime',
  WIFI_SIGNAL_DB: 'wifi_signal_db',
  SOFTWARE_VERSION: 'software_version',
  DATABASE_VERSION: 'database_version',
  EEPROM_VERSION: 'eeprom_version',
  SOFTWARE_VERSION_OUTDOOR_UNIT: 'software_version_outdoor_unit',
  
  // Buttons
  RESTART_CONTROL_MODULE: 'restart_control_module',
  FACTORY_RESET_CONTROL_MODULE: 'factory_reset_control_module',
} as const;

/**
 * Fault codes - Protection (P), Failure (F), Error (E), Status (S)
 */
export const FaultCodes = {
  // Protection codes (P01-P13)
  'p01_-_main_line_current_protection': { code: 'P01', type: 'protection' },
  'p02_-_compressor_phase_current_protection': { code: 'P02', type: 'protection' },
  'p03_-_ipm_module_protection': { code: 'P03', type: 'protection' },
  'p04_-_compressor_oil_return_protection': { code: 'P04', type: 'protection' },
  'p05_-_compressor_shut_down_due_to_abnormal_high_low_pressure': { code: 'P05', type: 'protection' },
  'p06_-_compressor_speed_down_due_to_abnormal_high_pressure': { code: 'P06', type: 'protection' },
  'p07_-_compressor_preheating': { code: 'P07', type: 'protection' },
  'p08_-_compressor_discharge_temp__too_high_protection': { code: 'P08', type: 'protection' },
  'p09_-_outdoor_evaporator_coil_temp__protection': { code: 'P09', type: 'protection' },
  'p10_-_ac_over_high_low_voltage_protection': { code: 'P10', type: 'protection' },
  'p11_-_compressor_shut_down_due_to_too_high_low_outdoor_temperature': { code: 'P11', type: 'protection' },
  'p12_-_frequency_limit_compressor': { code: 'P12', type: 'protection' },
  'p13_-_low_pressure_condensor_pressure_switch': { code: 'P13', type: 'protection' },
  
  // Failure codes (F01-F30)
  'f01_-_outdoor_temp__sensor_failure__ta_': { code: 'F01', type: 'failure' },
  'f02_-_outdoor_evaporator_coil_temp__sensor_failure__tp_': { code: 'F02', type: 'failure' },
  'f03_-_outdoor_gas_discharge_temp__sensor_failure__td_': { code: 'F03', type: 'failure' },
  'f04_-_outdoor_gas_return_temp__sensor_failure__ts_': { code: 'F04', type: 'failure' },
  'f05_-_evaporator_pressure_sensor_failure__ps_': { code: 'F05', type: 'failure' },
  'f06_-_condenser_pressure_sensor_failure__pd_': { code: 'F06', type: 'failure' },
  'f07_-_pressure_switch_failure': { code: 'F07', type: 'failure' },
  'f09_-_dc_fan_a_failure': { code: 'F09', type: 'failure' },
  'f10_-_dc_fan_b_failure': { code: 'F10', type: 'failure' },
  'f11_-_evaporating_pressure_failure': { code: 'F11', type: 'failure' },
  'f12_-_high_pressure_failure__pd_': { code: 'F12', type: 'failure' },
  'f13_-_room_temperature_sensor_failure__tr_': { code: 'F13', type: 'failure' },
  'f14_-_sanitary_hot_water_temperature_sensor_failure__tw_': { code: 'F14', type: 'failure' },
  'f15_-_cooling_heating_water_temperature_sensor_failure__tc_': { code: 'F15', type: 'failure' },
  'f16_-_water_outlet_temperature_sensor_failure__tuo_': { code: 'F16', type: 'failure' },
  'f17_-_water_inlet_temperature_sensor_failure__tui_': { code: 'F17', type: 'failure' },
  'f18_-_condenser_coil_temp__sensor_failure__tup_': { code: 'F18', type: 'failure' },
  'f21_-_mixing_valve_1_temperature_sensor_failure__tv1_': { code: 'F21', type: 'failure' },
  'f22_-_mixing_valve_2_temperature_sensor_failure__tv2_': { code: 'F22', type: 'failure' },
  'f25_-_communication_failure_to_indoor_controller': { code: 'F25', type: 'failure' },
  'f27_-_indoor_pcb_eeprom_failure': { code: 'F27', type: 'failure' },
  'f28_-_water_pump_pwm_signal_feedback_failure_p0': { code: 'F28', type: 'failure' },
  'f29_-_mixing_valve_1_failure': { code: 'F29', type: 'failure' },
  'f30_-_mixing_valve_2_failure': { code: 'F30', type: 'failure' },
  
  // Error codes (E01-E08)
  'e01_-_communication_failure': { code: 'E01', type: 'error' },
  'e02_-_communication_failure': { code: 'E02', type: 'error' },
  'e03_-_compressor_power_failure': { code: 'E03', type: 'error' },
  'e04_-_overcurrent_protection_compressor': { code: 'E04', type: 'error' },
  'e05_-_compressor_driver_failure': { code: 'E05', type: 'error' },
  'e06_-_vdc_unit_failure': { code: 'E06', type: 'error' },
  'e07_-_ac_current_failure': { code: 'E07', type: 'error' },
  'e08_-_eeprom_failure_oudoor_unit': { code: 'E08', type: 'error' },
  
  // Status codes (S01-S13)
  's01_-_cooling_anti_freezing_protection': { code: 'S01', type: 'status' },
  's02_-_low_flow_warning': { code: 'S02', type: 'status' },
  's03_-_flow_switch_failure': { code: 'S03', type: 'status' },
  's04_-_communication_failure_indoor_unit': { code: 'S04', type: 'status' },
  's05_-_communication_failure_outdoor_unit': { code: 'S05', type: 'status' },
  's06_-_water_outlet_to_low_in_cooling': { code: 'S06', type: 'status' },
  's07_-_water_outlet_to_high_in_heating': { code: 'S07', type: 'status' },
  's08_-_deforst_failure': { code: 'S08', type: 'status' },
  's09_-_water_outlet_temp_low_during_defrost': { code: 'S09', type: 'status' },
  's10_-_flow_switch_failure__3x_': { code: 'S10', type: 'status' },
  's11_-_cooling_anti_freezing_protection': { code: 'S11', type: 'status' },
  's13_-_4-way_valve_failure': { code: 'S13', type: 'status' },
} as const;

export type FaultObjectId = keyof typeof FaultCodes;
