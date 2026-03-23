import Homey, { DiscoveryResultMDNSSD } from 'homey';
import PairSession from 'homey/lib/PairSession';
import { FaultCodes, FaultObjectId } from '../../lib/entities/EntityTypes';

interface TxtData {
  mac: string;
  friendly_name: string;
  api_encryption?: string;
  version?: string;
  project_name?: string;
  project_version?: string;
}

interface DeviceData {
  name: string;
  data: {
    id: string;
  };
  store: {
    mac: string;
    name: string;
    address: string;
    port: number;
    encryption: string | null;
    encryptionKey?: string;
  };
}

interface FaultAutocompleteResult {
  id: string;
  name: string;
  description: string;
}

class HeatPumpDriver extends Homey.Driver {
  private faultTriggeredCard!: Homey.FlowCardTriggerDevice;
  private faultClearedCard!: Homey.FlowCardTriggerDevice;

  async onInit(): Promise<void> {
    this.registerFlowCards();
    this.log('Itho Daalderop Amber Heat Pump driver initialized');
  }

  private registerFlowCards(): void {
    // Fault triggered
    this.faultTriggeredCard = this.homey.flow.getDeviceTriggerCard('fault_triggered');
    this.faultTriggeredCard.registerRunListener(async (args, state) => {
      return args.fault_code.id === state.fault_code || args.fault_code.id === 'any';
    });
    this.faultTriggeredCard.registerArgumentAutocompleteListener('fault_code', 
      async (query: string) => this.getFaultAutocompleteResults(query));

    // Fault cleared
    this.faultClearedCard = this.homey.flow.getDeviceTriggerCard('fault_cleared');
    this.faultClearedCard.registerRunListener(async (args, state) => {
      return args.fault_code.id === state.fault_code || args.fault_code.id === 'any';
    });
    this.faultClearedCard.registerArgumentAutocompleteListener('fault_code',
      async (query: string) => this.getFaultAutocompleteResults(query));

    // Action cards
    this.homey.flow.getActionCard('set_heating_setpoint')
      .registerRunListener(async (args) => {
        await args.device.setHeatingSetpoint(args.temperature);
      });

    this.homey.flow.getActionCard('set_cooling_setpoint')
      .registerRunListener(async (args) => {
        await args.device.setCoolingSetpoint(args.temperature);
      });

    this.homey.flow.getActionCard('set_dhw_setpoint')
      .registerRunListener(async (args) => {
        await args.device.setDhwSetpoint(args.temperature);
      });

    this.homey.flow.getActionCard('set_working_mode')
      .registerRunListener(async (args) => {
        await args.device.setWorkingMode(args.mode);
      });

    this.homey.flow.getActionCard('set_heating_curve_point')
      .registerRunListener(async (args) => {
        await args.device.setHeatingCurvePoint(parseInt(args.point, 10), args.ambient, args.water);
      });

    this.homey.flow.getActionCard('restart_controller')
      .registerRunListener(async (args) => {
        await args.device.restartController();
      });

    // Pump speed actions
    this.homey.flow.getActionCard('set_pump_speed_heating')
      .registerRunListener(async (args) => {
        await args.device.setPumpSpeedHeating(args.speed);
      });

    this.homey.flow.getActionCard('set_pump_speed_cooling')
      .registerRunListener(async (args) => {
        await args.device.setPumpSpeedCooling(args.speed);
      });

    this.homey.flow.getActionCard('set_pump_speed_dhw')
      .registerRunListener(async (args) => {
        await args.device.setPumpSpeedDhw(args.speed);
      });

    // Mode actions
    this.homey.flow.getActionCard('set_dhw_mode')
      .registerRunListener(async (args) => {
        await args.device.setDhwMode(args.mode === 'on');
      });

    this.homey.flow.getActionCard('set_heating_mode')
      .registerRunListener(async (args) => {
        await args.device.setHeatingMode(args.mode === 'on');
      });

    this.homey.flow.getActionCard('set_cooling_mode')
      .registerRunListener(async (args) => {
        await args.device.setCoolingMode(args.mode === 'on');
      });
  }

  private getFaultAutocompleteResults(query: string): FaultAutocompleteResult[] {
    const results: FaultAutocompleteResult[] = [
      { id: 'any', name: this.homey.__('faults.any'), description: this.homey.__('faults.any_description') }
    ];

    const lowerQuery = query.toLowerCase();

    for (const [objectId, info] of Object.entries(FaultCodes)) {
      const description = this.getFaultDescription(objectId as FaultObjectId);
      const name = `${info.code} - ${description}`;
      
      if (!query || name.toLowerCase().includes(lowerQuery) || info.code.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: objectId,
          name: info.code,
          description: description,
        });
      }
    }

    return results;
  }

  private getFaultDescription(objectId: FaultObjectId): string {
    // Try to get translated description, fall back to object_id cleanup
    const translationKey = `faults.${objectId}`;
    const translated = this.homey.__(translationKey);
    
    if (translated !== translationKey) {
      return translated;
    }

    // Fall back to cleaning up the object_id
    return objectId
      .replace(/^[pfesPFES]\d+_-_/, '')
      .replace(/_/g, ' ')
      .replace(/__/g, ' ')
      .trim();
  }

  async onPair(session: PairSession): Promise<void> {
    let selectedDevice: DeviceData | null = null;

    session.setHandler('list_devices', async () => {
      // When called from add_devices, return the selected device
      if (selectedDevice) {
        return [selectedDevice];
      }
      
      const discoveryStrategy = this.getDiscoveryStrategy();
      const discoveryResults = discoveryStrategy.getDiscoveryResults();

      this.log('Discovery results:', Object.keys(discoveryResults).length);

      return Object.values(discoveryResults)
        .map((discoveryResult) => {
          const result = discoveryResult as DiscoveryResultMDNSSD;
          const txt = result.txt as unknown as TxtData;

          this.log('Found device:', result.name, 'at', result.address);

          return {
            name: txt.friendly_name || result.name,
            data: {
              id: result.host,
            },
            store: {
              host: result.host,
              mac: txt.mac,
              name: result.name,
              address: result.address,
              port: result.port || 6053,
              encryption: txt.api_encryption || null,
            },
          } as DeviceData;
        });
    });

    session.setHandler('list_devices_selection', async (selectedDevices: DeviceData[]) => {
      selectedDevice = selectedDevices[0] || null;
    });

    session.setHandler('showView', async (viewId: string) => {
      if (viewId === 'loading') {
        if (selectedDevice?.store.encryption) {
          await session.showView('enter_encryption_key');
        } else {
          // No encryption needed, go to add_devices
          await session.showView('add_devices');
        }
      }
    });

    session.setHandler('encryption_key_entered', async (data: { key: string }) => {
      if (selectedDevice) {
        selectedDevice.store.encryptionKey = data.key;
      }
      await session.showView('add_devices');
    });
  }

  triggerFault(device: Homey.Device, faultCode: string, faultDescription: string, triggered: boolean): void {
    const card = triggered ? this.faultTriggeredCard : this.faultClearedCard;
    const tokens = { fault_code: faultCode, fault_description: faultDescription };
    const state = { fault_code: faultCode };

    card.trigger(device, tokens, state).catch(this.error);
  }
}

module.exports = HeatPumpDriver;
