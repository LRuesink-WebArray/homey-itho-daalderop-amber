/**
 * Discovery script to enumerate all entities exposed by the Itho Daalderop Amber ESP device.
 * 
 * Usage: npx ts-node scripts/discover-entities.ts <ip-address> [port]
 * 
 * This script connects to the ESPHome device and lists all available entities
 * grouped by type (sensors, switches, buttons, etc.)
 */

import { ESPHomeClient } from '@webarray/esphome-native-api';

interface EntityInfo {
  key: number;
  object_id: string;
  name: string;
  type: string;
  unique_id?: string;
  icon?: string;
  disabled_by_default?: boolean;
  entity_category?: number;
  [key: string]: unknown;
}

async function discoverEntities(host: string, port: number = 6053): Promise<void> {
  console.log(`\nConnecting to ESPHome device at ${host}:${port}...\n`);

  const client = new ESPHomeClient({
    host,
    port,
    reconnect: false,
  });

  try {
    await client.connect();
    
    const deviceInfo = client.getDeviceInfo();
    if (deviceInfo) {
      console.log('=== Device Info ===');
      console.log(`  Name: ${deviceInfo.name}`);
      console.log(`  Friendly Name: ${deviceInfo.friendlyName}`);
      console.log(`  MAC Address: ${deviceInfo.macAddress}`);
      console.log(`  ESPHome Version: ${deviceInfo.esphomeVersion}`);
      console.log(`  Compilation Time: ${deviceInfo.compilationTime}`);
      console.log(`  Model: ${deviceInfo.model}`);
      console.log(`  Manufacturer: ${deviceInfo.manufacturer}`);
      console.log(`  Has Deep Sleep: ${deviceInfo.hasDeepSleep}`);
      console.log(`  Project Name: ${deviceInfo.projectName}`);
      console.log(`  Project Version: ${deviceInfo.projectVersion}`);
      console.log('');
    }

    const entities = await client.listEntities();
    
    // Group entities by type
    const grouped: Record<string, EntityInfo[]> = {};
    
    for (const entity of entities) {
      const e = entity as unknown as EntityInfo;
      const type = e.type || 'unknown';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(e);
    }

    // Sort types for consistent output
    const sortedTypes = Object.keys(grouped).sort();

    console.log(`=== Found ${entities.length} entities ===\n`);

    for (const type of sortedTypes) {
      const typeEntities = grouped[type];
      console.log(`\n### ${type.toUpperCase()} (${typeEntities.length}) ###`);
      console.log('-'.repeat(60));
      
      for (const entity of typeEntities) {
        console.log(`  [${entity.key}] ${entity.object_id}`);
        console.log(`      Name: ${entity.name}`);
        if (entity.icon) console.log(`      Icon: ${entity.icon}`);
        if (entity.disabled_by_default) console.log(`      Disabled by default: true`);
        if (entity.entity_category !== undefined) {
          const categories = ['None', 'Config', 'Diagnostic'];
          console.log(`      Category: ${categories[entity.entity_category] || entity.entity_category}`);
        }
        
        // Print additional type-specific properties
        const skipKeys = ['key', 'object_id', 'name', 'type', 'unique_id', 'icon', 'disabled_by_default', 'entity_category'];
        const extraProps = Object.entries(entity).filter(([k]) => !skipKeys.includes(k));
        if (extraProps.length > 0) {
          for (const [key, value] of extraProps) {
            if (value !== undefined && value !== null && value !== '' && value !== 0 && value !== false) {
              const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
              console.log(`      ${key}: ${displayValue}`);
            }
          }
        }
        console.log('');
      }
    }

    // Generate a summary for easy capability mapping
    console.log('\n=== Summary for Capability Mapping ===\n');
    
    for (const type of sortedTypes) {
      const typeEntities = grouped[type];
      console.log(`${type}:`);
      for (const entity of typeEntities) {
        const category = entity.entity_category !== undefined ? ` [cat:${entity.entity_category}]` : '';
        const disabled = entity.disabled_by_default ? ' [disabled]' : '';
        console.log(`  - ${entity.object_id}${category}${disabled}`);
      }
      console.log('');
    }

    client.destroy();
    console.log('\nDone.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    client.destroy();
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: npx ts-node scripts/discover-entities.ts <ip-address> [port]');
  console.log('');
  console.log('Example: npx ts-node scripts/discover-entities.ts 192.168.1.100');
  console.log('Example: npx ts-node scripts/discover-entities.ts 192.168.1.100 6053');
  process.exit(1);
}

const host = args[0];
const port = args[1] ? parseInt(args[1], 10) : 6053;

discoverEntities(host, port);
