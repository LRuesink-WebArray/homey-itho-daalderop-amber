import Homey, { DiscoveryResult, DiscoveryResultMDNSSD } from 'homey';
import EspHomeApi from '../../lib/EspHomeApi';
import { EntityIds, FaultCodes, FaultObjectId } from '../../lib/entities/EntityTypes';

interface TxtData {
  mac: string;
  friendly_name: string;
}

interface EntityMap {
  [objectId: string]: {
    key: number;
    type: string;
    name: string;
    options?: string[];
    minValue?: number;
    maxValue?: number;
    step?: number;
  };
}

interface SettingsInput {
  oldSettings: Record<string, unknown>;
  newSettings: Record<string, unknown>;
  changedKeys: string[];
}

// Mapping from ESP entity object_id to Homey capability
const ENTITY_TO_CAPABILITY: Record<string, string> = {
  // System
  [EntityIds.SYSTEM_ON_OFF]: 'onoff',
  
  // Modes
  [EntityIds.DOMESTIC_HOT_WATER_MODE]: 'itho_amber_dhw_mode',
  [EntityIds.HEATING_MODE]: 'itho_amber_heating_mode',
  [EntityIds.COOLING_MODE]: 'itho_amber_cooling_mode',
  
  // Status (binary sensors)
  [EntityIds.DOMESTIC_HOT_WATER_IN_PROGRESS]: 'itho_amber_dhw_in_progress',
  [EntityIds.HEATING_IN_PROGRESS]: 'itho_amber_heating_in_progress',
  [EntityIds.COOLING_IN_PROGRESS]: 'itho_amber_cooling_in_progress',
  [EntityIds.DEFROST]: 'itho_amber_defrost',
  
  // Temperatures
  [EntityIds.HEAT_EXCHANGER_WATER_OUTLET_TEMPERATURE]: 'measure_temperature',
  [EntityIds.DOMESTIC_HOT_WATER_TEMPERATURE]: 'itho_amber_dhw_temperature',
  [EntityIds.AMBIENT_TEMPERATURE]: 'itho_amber_ambient_temperature',
  [EntityIds.HEAT_EXCHANGER_WATER_INLET_TEMPERATURE]: 'itho_amber_water_inlet_temperature',
  
  // Setpoints
  [EntityIds.HEATING_SETPOINT]: 'target_temperature',
  [EntityIds.DOMESTIC_HOT_WATER_SETPOINT]: 'itho_amber_dhw_setpoint',
  [EntityIds.COOLING_SETPOINT]: 'itho_amber_cooling_setpoint',
  
  // Compressor
  [EntityIds.COMPRESSOR_WORKING_SPEED]: 'itho_amber_compressor_speed',
  [EntityIds.RUNNING_CURRENT]: 'itho_amber_power',
  [EntityIds.FAN_SPEED]: 'itho_amber_fan_speed',
  [EntityIds.EXPANSION_VALVE_SETTING]: 'itho_amber_expansion_valve',
  [EntityIds.SUPPLY_VOLTAGE]: 'itho_amber_supply_voltage',
  
  // Coil temperatures
  [EntityIds.OUTDOOR_COIL_TEMPERATURE]: 'itho_amber_outdoor_coil_temperature',
  [EntityIds.INDOOR_COIL_TEMPERATURE]: 'itho_amber_indoor_coil_temperature',
  [EntityIds.DISCHARGE_TEMPERATURE]: 'itho_amber_discharge_temperature',
  [EntityIds.SUCTION_TEMPERATURE]: 'itho_amber_suction_temperature',
  [EntityIds.INSIDE_TEMPERATURE]: 'itho_amber_inside_temperature',
  [EntityIds.HEATING_COOLING_TEMPERATURE]: 'measure_temperature.heating_cooling',
  
  // Average ambient temperatures
  [EntityIds.AVERAGE_1H_AMBIENT_TEMPERATURE]: 'itho_amber_avg_1h_ambient_temperature',
  [EntityIds.AVERAGE_4H_AMBIENT_TEMPERATURE]: 'itho_amber_avg_4h_ambient_temperature',
  [EntityIds.AVERAGE_24H_AMBIENT_TEMPERATURE]: 'itho_amber_avg_24h_ambient_temperature',
  
  // Pressure
  [EntityIds.HIGH_PRESSURE]: 'itho_amber_high_pressure',
  [EntityIds.LOW_PRESSURE]: 'itho_amber_low_pressure',
  
  // Delta T
  [EntityIds.HEAT_EXCHANGER_DELTA_T]: 'itho_amber_delta_t',
  
  // Status sensors
  [EntityIds.SG_READY]: 'itho_amber_sg_ready',
  [EntityIds.WATER_FLOW_SWITCH]: 'itho_amber_water_flow_switch',
  
  // Flow sensor
  [EntityIds.PULSE_METER]: 'itho_amber_flow_rate',
  [EntityIds.TOTAL_PULSES]: 'itho_amber_total_pulses',
  
  // Diagnostics
  [EntityIds.WIFI_SIGNAL_DB]: 'itho_amber_wifi_signal',
  
  // Relays
  [EntityIds.RELAIS_1]: 'itho_amber_relay_1',
  [EntityIds.RELAIS_2]: 'itho_amber_relay_2',
  [EntityIds.RELAIS_3]: 'itho_amber_relay_3',
  [EntityIds.RELAIS_4]: 'itho_amber_relay_4',
};

// Settings that map to ESP number entities
const SETTING_TO_ENTITY: Record<string, string> = {
  domestic_hot_water_setpoint: EntityIds.DOMESTIC_HOT_WATER_SETPOINT,
  domestic_hot_water_reheating_point: EntityIds.DOMESTIC_HOT_WATER_REHEATING_POINT,
  heating_setpoint: EntityIds.HEATING_SETPOINT,
  cooling_setpoint: EntityIds.COOLING_SETPOINT,
  circuit_1_maximum_temperature: EntityIds.CIRCUIT_1_MAXIMUM_TEMPERATURE,
  circuit_1_minimum_temperature: EntityIds.CIRCUIT_1_MINIMUM_TEMPERATURE,
  delta_t_to_stop_hp: EntityIds.DELTA_T_TO_STOP_HP,
  delta_t_to_restart_hp: EntityIds.DELTA_T_TO_RESTART_HP,
  delta_t_to_lower_compressor_speed: EntityIds.DELTA_T_TO_LOWER_COMPRESSOR_SPEED,
  minimum_ambient_temperature_to_start_domestic_hot_water_eco_mode: EntityIds.MINIMUM_AMBIENT_TEMPERATURE_TO_START_DOMESTIC_HOT_WATER_ECO_MODE,
  heating_curve_ambient_temperature_1: EntityIds.HEATING_CURVE_AMBIENT_TEMPERATURE_1,
  heating_curve_ambient_temperature_2: EntityIds.HEATING_CURVE_AMBIENT_TEMPERATURE_2,
  heating_curve_ambient_temperature_3: EntityIds.HEATING_CURVE_AMBIENT_TEMPERATURE_3,
  heating_curve_ambient_temperature_4: EntityIds.HEATING_CURVE_AMBIENT_TEMPERATURE_4,
  heating_curve_ambient_temperature_5: EntityIds.HEATING_CURVE_AMBIENT_TEMPERATURE_5,
  heating_curve_water_temperature_1: EntityIds.HEATING_CURVE_WATER_TEMPERATURE_1,
  heating_curve_water_temperature_2: EntityIds.HEATING_CURVE_WATER_TEMPERATURE_2,
  heating_curve_water_temperature_3: EntityIds.HEATING_CURVE_WATER_TEMPERATURE_3,
  heating_curve_water_temperature_4: EntityIds.HEATING_CURVE_WATER_TEMPERATURE_4,
  heating_curve_water_temperature_5: EntityIds.HEATING_CURVE_WATER_TEMPERATURE_5,
};

// Settings that map to ESP switch entities
const SWITCH_SETTING_TO_ENTITY: Record<string, string> = {
  use_heating_curve: EntityIds.USE_HEATING_CURVE,
  use_anti_legionella_mode: EntityIds.USE_ANTI_LEGIONELLA_MODE,
  use_domestic_hot_water_timer: EntityIds.USE_DOMESTIC_HOT_WATER_TIMER,
  reduced_mode_timer: EntityIds.REDUCED_MODE_TIMER,
  domestic_hot_water_eco_mode: EntityIds.DOMESTIC_HOT_WATER_ECO_MODE,
};

// Settings that map to ESP select entities
const SELECT_SETTING_TO_ENTITY: Record<string, string> = {
  pump_speed_heating: EntityIds.PUMP_SPEED_HEATING,
  pump_speed_cooling: EntityIds.PUMP_SPEED_COOLING,
  pump_speed_domestic_hot_water: EntityIds.PUMP_SPEED_DOMESTIC_HOT_WATER,
};

// Reverse mappings: Entity ID -> Setting key
const ENTITY_TO_SETTING: Record<string, string> = Object.fromEntries(
  Object.entries(SETTING_TO_ENTITY).map(([k, v]) => [v, k])
);
const ENTITY_TO_SWITCH_SETTING: Record<string, string> = Object.fromEntries(
  Object.entries(SWITCH_SETTING_TO_ENTITY).map(([k, v]) => [v, k])
);
const ENTITY_TO_SELECT_SETTING: Record<string, string> = Object.fromEntries(
  Object.entries(SELECT_SETTING_TO_ENTITY).map(([k, v]) => [v, k])
);

// Working mode mapping
const WORKING_MODE_MAP: Record<string, string> = {
  'Standby': 'standby',
  'Heating': 'heating',
  'Cooling': 'cooling',
  'Auto': 'auto',
};

const WORKING_MODE_REVERSE_MAP: Record<string, string> = {
  'standby': 'Standby',
  'heating': 'Heating',
  'cooling': 'Cooling',
  'auto': 'Auto',
};

class HeatPumpDevice extends Homey.Device {
  private api!: EspHomeApi;
  private entityMap: EntityMap = {};
  private faultStates: Map<string, boolean> = new Map();
  private previousDefrostState: boolean | null = null;
  private isInitialized = false;
  private lastVoltage: number | null = null;
  private lastCurrent: number | null = null;

  async onInit(): Promise<void> {
    this.log('Heat pump device initializing...');
    
    // Register capability listeners
    this.registerCapabilityListeners();
  }

  private registerCapabilityListeners(): void {
    // System on/off
    this.registerCapabilityListener('onoff', async (value: boolean) => {
      await this.setSwitchState(EntityIds.SYSTEM_ON_OFF, value);
    });

    // Target temperature (heating setpoint)
    this.registerCapabilityListener('target_temperature', async (value: number) => {
      await this.setHeatingSetpoint(value);
    });

    // Mode toggles
    this.registerCapabilityListener('itho_amber_dhw_mode', async (value: boolean) => {
      await this.setSwitchState(EntityIds.DOMESTIC_HOT_WATER_MODE, value);
    });

    this.registerCapabilityListener('itho_amber_heating_mode', async (value: boolean) => {
      await this.setSwitchState(EntityIds.HEATING_MODE, value);
    });

    this.registerCapabilityListener('itho_amber_cooling_mode', async (value: boolean) => {
      await this.setSwitchState(EntityIds.COOLING_MODE, value);
    });

    // Working mode
    this.registerCapabilityListener('itho_amber_mode', async (value: string) => {
      await this.setWorkingMode(WORKING_MODE_REVERSE_MAP[value] || value);
    });

    // DHW setpoint
    this.registerCapabilityListener('itho_amber_dhw_setpoint', async (value: number) => {
      await this.setDhwSetpoint(value);
    });

    // Cooling setpoint
    this.registerCapabilityListener('itho_amber_cooling_setpoint', async (value: number) => {
      await this.setCoolingSetpoint(value);
    });

    // Relays
    for (let i = 1; i <= 4; i++) {
      const capabilityId = `itho_amber_relay_${i}`;
      const entityId = `relais_${i}`;
      
      if (this.hasCapability(capabilityId)) {
        this.registerCapabilityListener(capabilityId, async (value: boolean) => {
          await this.setSwitchState(entityId, value);
        });
      }
    }
  }

  onDiscoveryResult(discoveryResult: DiscoveryResult): boolean {
    const result = discoveryResult as DiscoveryResultMDNSSD;
    return result.host === this.getData().id;
  }

  async onDiscoveryAvailable(discoveryResult: DiscoveryResult): Promise<void> {
    const result = discoveryResult as DiscoveryResultMDNSSD;
    const txt = result.txt as unknown as TxtData;
    
    await this.setStoreValue('address', result.address);
    this.log(`Device ${txt.friendly_name} available at ${result.address}`);

    await this.connectApi(result.address);
  }

  async onDiscoveryAddressChanged(discoveryResult: DiscoveryResult): Promise<void> {
    const result = discoveryResult as DiscoveryResultMDNSSD;
    const oldAddress = this.getStoreValue('address');
    
    this.log(`Address changed from ${oldAddress} to ${result.address}`);
    await this.setStoreValue('address', result.address);
    await this.reconnectApi(result.address);
  }

  async onDiscoveryLastSeenChanged(discoveryResult: DiscoveryResult): Promise<void> {
    const result = discoveryResult as DiscoveryResultMDNSSD;
    
    if (this.api && !this.api.isConnected()) {
      this.log('Device seen again, reconnecting...');
      await this.reconnectApi(result.address);
    }
  }

  private async connectApi(address: string): Promise<void> {
    const store = this.getStore();
    const port = store.port || 6053;

    this.api = new EspHomeApi({
      host: address,
      port,
      encryptionKey: store.encryptionKey,
      timerFactory: {
        setTimeout: this.homey.setTimeout.bind(this.homey) as unknown as typeof setTimeout,
        clearTimeout: this.homey.clearTimeout.bind(this.homey) as unknown as typeof clearTimeout,
        setInterval: this.homey.setInterval.bind(this.homey) as unknown as typeof setInterval,
        clearInterval: this.homey.clearInterval.bind(this.homey) as unknown as typeof clearInterval,
      },
    });

    try {
      await this.api.connect();
      
      const deviceInfo = this.api.getDeviceInfo();
      if (deviceInfo) {
        this.log(`Connected to ${deviceInfo.friendlyName} (ESPHome ${deviceInfo.esphomeVersion})`);
      }

      await this.setupEntities();
      this.setupEventHandlers();
      this.api.subscribeStates();
      
      this.isInitialized = true;
      await this.setAvailable();
      
    } catch (error) {
      this.error('Failed to connect:', error);
      await this.setUnavailable(this.homey.__('errors.connection_failed'));
    }
  }

  private async reconnectApi(address: string): Promise<void> {
    if (this.api) {
      try {
        this.api.destroy();
      } catch {
        // Ignore destroy errors
      }
    }

    await this.connectApi(address);
  }

  private async setupEntities(): Promise<void> {
    const entities = await this.api.listEntities();
    this.log(`Received ${entities.length} entities`);

    for (const entity of entities) {
      const e = entity as unknown as {
        key: number;
        objectId: string;
        object_id?: string;
        name: string;
        type: string;
        options?: string[];
        minValue?: number;
        maxValue?: number;
        step?: number;
      };

      const objectId = e.objectId || e.object_id;
      if (!objectId || e.key === undefined) continue;

      this.entityMap[objectId] = {
        key: e.key,
        type: e.type,
        name: e.name,
        options: e.options,
        minValue: e.minValue,
        maxValue: e.maxValue,
        step: e.step,
      };
    }

    // Add relay capabilities dynamically based on what's available
    await this.setupDynamicCapabilities();
  }

  private async setupDynamicCapabilities(): Promise<void> {
    // Check for relays and add capabilities if they exist
    for (let i = 1; i <= 4; i++) {
      const entityId = `relais_${i}`;
      const capabilityId = `itho_amber_relay_${i}`;
      
      if (this.entityMap[entityId]) {
        if (!this.hasCapability(capabilityId)) {
          await this.addCapability(capabilityId);
          this.log(`Added capability ${capabilityId}`);
        }
      } else if (this.hasCapability(capabilityId)) {
        await this.removeCapability(capabilityId);
        this.log(`Removed capability ${capabilityId}`);
      }
    }

    // Check for Dallas temperature sensors
    for (let i = 1; i <= 3; i++) {
      const entityId = `dallas_temperature_${i}`;
      const capabilityId = `measure_temperature.dallas_${i}`;
      
      if (this.entityMap[entityId]) {
        if (!this.hasCapability(capabilityId)) {
          await this.addCapability(capabilityId);
          this.log(`Added Dallas temperature capability ${capabilityId}`);
        }
      }
    }
  }

  private setupEventHandlers(): void {
    this.api.on('error', (error: Error) => {
      this.error('API error:', error);
    });

    this.api.on('disconnected', () => {
      this.log('API disconnected - library will auto-reconnect');
      this.setUnavailable(this.homey.__('errors.disconnected')).catch(this.error);
    });

    this.api.on('connected', () => {
      this.log('API reconnected');
      this.setAvailable().catch(this.error);
    });

    // Listen for state updates from ESPHome
    this.api.on('state', (update: { key: number; state?: unknown; value?: unknown; missingState?: boolean }) => {
      if (!update || update.key === undefined) return;
      
      // Skip updates where state is missing/unavailable
      if (update.missingState === true) {
        return;
      }
      
      const value = update.state ?? update.value;
      
      // Skip null/undefined values
      if (value === null || value === undefined) {
        return;
      }
      
      this.handleStateChange(update.key, value);
    });
  }

  private handleStateChange(entityKey: number, value: unknown): void {
    // Find entity by key
    const objectId = Object.keys(this.entityMap).find(
      (id) => this.entityMap[id].key === entityKey
    );

    if (!objectId) return;

    // Handle fault states
    if (objectId in FaultCodes) {
      this.handleFaultStateChange(objectId as FaultObjectId, value as boolean);
      return;
    }

    // Handle working mode (select entity)
    if (objectId === EntityIds.WORKING_MODE) {
      const mode = WORKING_MODE_MAP[value as string] || 'standby';
      this.setCapabilityValue('itho_amber_mode', mode).catch(this.error);
      return;
    }

    // Handle uptime (format as human-readable string)
    if (objectId === EntityIds.UPTIME && typeof value === 'number') {
      // ESPHome reports uptime in milliseconds for this device
      const seconds = Math.floor(value / 1000);
      const formatted = this.formatUptime(seconds);
      this.setCapabilityValue('itho_amber_uptime', formatted).catch(this.error);
      return;
    }

    // Handle regular capability mapping
    const capabilityId = ENTITY_TO_CAPABILITY[objectId];
    if (capabilityId && this.hasCapability(capabilityId)) {
      const roundedValue = this.roundValue(value);
      this.setCapabilityValue(capabilityId, roundedValue).catch(this.error);

      // Trigger defrost flow cards
      if (objectId === EntityIds.DEFROST && typeof value === 'boolean') {
        this.handleDefrostStateChange(value);
      }

      // Track voltage and current for power calculation
      if (objectId === EntityIds.SUPPLY_VOLTAGE && typeof value === 'number') {
        this.lastVoltage = value;
        this.updatePowerConsumption();
      }
      if (objectId === EntityIds.RUNNING_CURRENT && typeof value === 'number') {
        this.lastCurrent = value;
        this.updatePowerConsumption();
      }
    }

    // Handle Dallas temperature sensors
    if (objectId.startsWith('dallas_temperature_')) {
      const index = objectId.replace('dallas_temperature_', '');
      const dallasCap = `measure_temperature.dallas_${index}`;
      if (this.hasCapability(dallasCap)) {
        const roundedValue = this.roundValue(value);
        this.setCapabilityValue(dallasCap, roundedValue).catch(this.error);
      }
    }

    // Sync settings from ESP to Homey
    this.syncSettingFromESP(objectId, value);
  }

  private syncSettingFromESP(objectId: string, value: unknown): void {
    // Number settings
    if (ENTITY_TO_SETTING[objectId] && typeof value === 'number') {
      const settingKey = ENTITY_TO_SETTING[objectId];
      const roundedValue = this.roundValue(value) as number;
      const currentValue = this.getSetting(settingKey);
      if (currentValue !== roundedValue) {
        this.setSettings({ [settingKey]: roundedValue }).catch(() => {
          // Ignore out of bounds errors
        });
      }
    }

    // Switch settings
    if (ENTITY_TO_SWITCH_SETTING[objectId] && typeof value === 'boolean') {
      const settingKey = ENTITY_TO_SWITCH_SETTING[objectId];
      const currentValue = this.getSetting(settingKey);
      if (currentValue !== value) {
        this.setSettings({ [settingKey]: value }).catch(() => {
          // Ignore errors
        });
      }
    }

    // Select settings
    if (ENTITY_TO_SELECT_SETTING[objectId] && typeof value === 'string') {
      const settingKey = ENTITY_TO_SELECT_SETTING[objectId];
      const currentValue = this.getSetting(settingKey);
      if (currentValue !== value) {
        this.setSettings({ [settingKey]: value }).catch(() => {
          // Ignore errors
        });
      }
    }
  }

  private roundValue(value: unknown): unknown {
    if (typeof value === 'number') {
      return Math.round(value * 100) / 100;
    }
    return value;
  }

  private updatePowerConsumption(): void {
    if (this.lastVoltage !== null && this.lastCurrent !== null) {
      // P = V × I (Watts)
      const power = Math.round(this.lastVoltage * this.lastCurrent);
      this.setCapabilityValue('itho_amber_estimated_power', power).catch(this.error);
    }
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

    return parts.join(' ');
  }

  private handleDefrostStateChange(active: boolean): void {
    // Only trigger if state actually changed (and we have a previous state)
    if (this.previousDefrostState !== null && active !== this.previousDefrostState) {
      const triggerCard = active
        ? this.homey.flow.getDeviceTriggerCard('defrost_started')
        : this.homey.flow.getDeviceTriggerCard('defrost_ended');
      
      triggerCard.trigger(this, {}).catch(this.error);
      this.log(`Defrost ${active ? 'started' : 'ended'}`);
    }
    this.previousDefrostState = active;
  }

  private handleFaultStateChange(objectId: FaultObjectId, active: boolean): void {
    const previousState = this.faultStates.get(objectId) || false;
    this.faultStates.set(objectId, active);

    // Update alarm state
    this.updateAlarmState();

    // Trigger flow if state changed
    if (active !== previousState) {
      const faultInfo = FaultCodes[objectId];
      const description = this.getFaultDescription(objectId);
      
      const driver = this.driver as unknown as { 
        triggerFault: (device: Homey.Device, code: string, desc: string, triggered: boolean) => void 
      };
      driver.triggerFault(this, faultInfo.code, description, active);
    }
  }

  private updateAlarmState(): void {
    const activeFaults: string[] = [];
    
    for (const [objectId, active] of this.faultStates) {
      if (active) {
        const faultInfo = FaultCodes[objectId as FaultObjectId];
        if (faultInfo) {
          activeFaults.push(faultInfo.code);
        }
      }
    }

    const hasAlarm = activeFaults.length > 0;
    this.setCapabilityValue('alarm_generic', hasAlarm).catch(this.error);
    
    const faultText = hasAlarm ? activeFaults.join(', ') : this.homey.__('status.no_faults');
    this.setCapabilityValue('itho_amber_active_fault', faultText).catch(this.error);
  }

  private getFaultDescription(objectId: FaultObjectId): string {
    const translationKey = `faults.${objectId}`;
    const translated = this.homey.__(translationKey);
    
    if (translated !== translationKey) {
      return translated;
    }

    return objectId
      .replace(/^[pfesPFES]\d+_-_/, '')
      .replace(/_/g, ' ')
      .replace(/__/g, ' ')
      .trim();
  }

  async onSettings(input: SettingsInput): Promise<void> {
    const { newSettings, changedKeys } = input;

    for (const key of changedKeys) {
      // Number settings
      if (SETTING_TO_ENTITY[key]) {
        const entityId = SETTING_TO_ENTITY[key];
        if (this.entityMap[entityId]) {
          await this.api.numberCommand(this.entityMap[entityId].key, newSettings[key] as number);
          this.log(`Updated ${key} to ${newSettings[key]}`);
        }
      }

      // Switch settings
      if (SWITCH_SETTING_TO_ENTITY[key]) {
        const entityId = SWITCH_SETTING_TO_ENTITY[key];
        if (this.entityMap[entityId]) {
          await this.api.switchCommand(this.entityMap[entityId].key, newSettings[key] as boolean);
          this.log(`Updated ${key} to ${newSettings[key]}`);
        }
      }

      // Select settings
      if (SELECT_SETTING_TO_ENTITY[key]) {
        const entityId = SELECT_SETTING_TO_ENTITY[key];
        if (this.entityMap[entityId]) {
          await this.api.selectCommand(this.entityMap[entityId].key, newSettings[key] as string);
          this.log(`Updated ${key} to ${newSettings[key]}`);
        }
      }
    }
  }

  onDeleted(): void {
    if (this.api) {
      this.api.destroy();
    }
  }

  // Public methods for flow actions
  async setHeatingSetpoint(temperature: number): Promise<void> {
    if (!this.entityMap[EntityIds.HEATING_SETPOINT]) {
      throw new Error('Heating setpoint entity not available');
    }
    await this.api.numberCommand(this.entityMap[EntityIds.HEATING_SETPOINT].key, temperature);
  }

  async setCoolingSetpoint(temperature: number): Promise<void> {
    if (!this.entityMap[EntityIds.COOLING_SETPOINT]) {
      throw new Error('Cooling setpoint entity not available');
    }
    await this.api.numberCommand(this.entityMap[EntityIds.COOLING_SETPOINT].key, temperature);
  }

  async setDhwSetpoint(temperature: number): Promise<void> {
    if (!this.entityMap[EntityIds.DOMESTIC_HOT_WATER_SETPOINT]) {
      throw new Error('DHW setpoint entity not available');
    }
    await this.api.numberCommand(this.entityMap[EntityIds.DOMESTIC_HOT_WATER_SETPOINT].key, temperature);
  }

  async setWorkingMode(mode: string): Promise<void> {
    if (!this.entityMap[EntityIds.WORKING_MODE]) {
      throw new Error('Working mode entity not available');
    }
    await this.api.selectCommand(this.entityMap[EntityIds.WORKING_MODE].key, mode);
  }

  async setHeatingCurvePoint(point: number, ambient: number, water: number): Promise<void> {
    const ambientEntityId = `heating_curve_ambient_temperature_${point}`;
    const waterEntityId = `heating_curve_water_temperature_${point}`;

    if (!this.entityMap[ambientEntityId] || !this.entityMap[waterEntityId]) {
      throw new Error(`Heating curve point ${point} entities not available`);
    }

    await this.api.numberCommand(this.entityMap[ambientEntityId].key, ambient);
    await this.api.numberCommand(this.entityMap[waterEntityId].key, water);
  }

  async restartController(): Promise<void> {
    if (!this.entityMap[EntityIds.RESTART_CONTROL_MODULE]) {
      throw new Error('Restart button entity not available');
    }
    await this.api.buttonCommand(this.entityMap[EntityIds.RESTART_CONTROL_MODULE].key);
  }

  private async setSwitchState(entityId: string, state: boolean): Promise<void> {
    if (!this.entityMap[entityId]) {
      throw new Error(`Entity ${entityId} not available`);
    }
    await this.api.switchCommand(this.entityMap[entityId].key, state);
  }

  // Pump speed methods
  async setPumpSpeedHeating(speed: string): Promise<void> {
    if (!this.entityMap[EntityIds.PUMP_SPEED_HEATING]) {
      throw new Error('Pump speed heating entity not available');
    }
    await this.api.selectCommand(this.entityMap[EntityIds.PUMP_SPEED_HEATING].key, speed);
  }

  async setPumpSpeedCooling(speed: string): Promise<void> {
    if (!this.entityMap[EntityIds.PUMP_SPEED_COOLING]) {
      throw new Error('Pump speed cooling entity not available');
    }
    await this.api.selectCommand(this.entityMap[EntityIds.PUMP_SPEED_COOLING].key, speed);
  }

  async setPumpSpeedDhw(speed: string): Promise<void> {
    if (!this.entityMap[EntityIds.PUMP_SPEED_DOMESTIC_HOT_WATER]) {
      throw new Error('Pump speed DHW entity not available');
    }
    await this.api.selectCommand(this.entityMap[EntityIds.PUMP_SPEED_DOMESTIC_HOT_WATER].key, speed);
  }

  // Mode methods
  async setDhwMode(enabled: boolean): Promise<void> {
    await this.setSwitchState(EntityIds.DOMESTIC_HOT_WATER_MODE, enabled);
  }

  async setHeatingMode(enabled: boolean): Promise<void> {
    await this.setSwitchState(EntityIds.HEATING_MODE, enabled);
  }

  async setCoolingMode(enabled: boolean): Promise<void> {
    await this.setSwitchState(EntityIds.COOLING_MODE, enabled);
  }
}

module.exports = HeatPumpDevice;
