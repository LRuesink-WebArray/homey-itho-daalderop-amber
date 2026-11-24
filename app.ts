import Homey from 'homey';

export default class IthoAmberApp extends Homey.App {
  async onInit(): Promise<void> {
    this.log('Itho Daalderop Amber app has been initialized');

    // Register condition cards
    this.registerConditionCards();
  }

  private registerConditionCards(): void {
    // Is heating active
    this.homey.flow.getConditionCard('is_heating')
      .registerRunListener(async (args) => {
        const device = args.device;
        return device.getCapabilityValue('itho_amber_heating_in_progress') === true;
      });

    // Is cooling active
    this.homey.flow.getConditionCard('is_cooling')
      .registerRunListener(async (args) => {
        const device = args.device;
        return device.getCapabilityValue('itho_amber_cooling_in_progress') === true;
      });

    // Is defrost active
    this.homey.flow.getConditionCard('is_defrost')
      .registerRunListener(async (args) => {
        const device = args.device;
        return device.getCapabilityValue('itho_amber_defrost') === true;
      });

    // Is DHW active
    this.homey.flow.getConditionCard('is_dhw')
      .registerRunListener(async (args) => {
        const device = args.device;
        return device.getCapabilityValue('itho_amber_dhw_in_progress') === true;
      });

    // Working mode check
    this.homey.flow.getConditionCard('mode_is')
      .registerRunListener(async (args) => {
        const device = args.device;
        const currentMode = device.getCapabilityValue('itho_amber_mode');
        return currentMode === args.mode;
      });

    // Outdoor temperature check
    this.homey.flow.getConditionCard('outdoor_temperature')
      .registerRunListener(async (args) => {
        const device = args.device;
        const temp = device.getCapabilityValue('itho_amber_ambient_temperature');
        return typeof temp === 'number' && temp > args.temperature;
      });

    // Water outlet temperature check
    this.homey.flow.getConditionCard('water_temperature')
      .registerRunListener(async (args) => {
        const device = args.device;
        const temp = device.getCapabilityValue('itho_amber_water_outlet_temperature');
        return typeof temp === 'number' && temp > args.temperature;
      });

    // DHW temperature check
    this.homey.flow.getConditionCard('dhw_temperature')
      .registerRunListener(async (args) => {
        const device = args.device;
        const temp = device.getCapabilityValue('itho_amber_dhw_temperature');
        return typeof temp === 'number' && temp > args.temperature;
      });

    // Compressor speed check
    this.homey.flow.getConditionCard('compressor_speed')
      .registerRunListener(async (args) => {
        const device = args.device;
        const speed = device.getCapabilityValue('itho_amber_compressor_speed');
        return typeof speed === 'number' && speed > args.speed;
      });

    // Power consumption check
    this.homey.flow.getConditionCard('power_consumption')
      .registerRunListener(async (args) => {
        const device = args.device;
        const power = device.getCapabilityValue('itho_amber_power');
        return typeof power === 'number' && power > args.power;
      });

    // SG Ready check
    this.homey.flow.getConditionCard('is_sg_ready')
      .registerRunListener(async (args) => {
        const device = args.device;
        return device.getCapabilityValue('itho_amber_sg_ready') === true;
      });

    // Water flow check
    this.homey.flow.getConditionCard('has_water_flow')
      .registerRunListener(async (args) => {
        const device = args.device;
        return device.getCapabilityValue('itho_amber_water_flow_switch') === true;
      });

    // Dallas temperature check
    this.homey.flow.getConditionCard('dallas_temperature')
      .registerRunListener(async (args) => {
        const device = args.device;
        const capabilityId = `measure_temperature.${args.sensor}`;
        const temp = device.getCapabilityValue(capabilityId);
        return typeof temp === 'number' && temp > args.temperature;
      });

    // Relay state check
    this.homey.flow.getConditionCard('relay_is_on')
      .registerRunListener(async (args) => {
        const device = args.device;
        const capabilityId = `itho_amber_relay_${args.relay}`;
        return device.getCapabilityValue(capabilityId) === true;
      });

    this.log('Condition cards registered');
  }
}

module.exports = IthoAmberApp;
