/**
 * mDNS discovery script to find ESPHome devices on the local network.
 * 
 * Usage: npx ts-node scripts/mdns-discover.ts
 * 
 * This script uses mDNS to discover ESPHome devices and displays their
 * information including IP address, port, and TXT records.
 */

import * as dns from 'dns';
import * as dgram from 'dgram';

const MDNS_ADDRESS = '224.0.0.251';
const MDNS_PORT = 5353;

// ESPHome service name
const SERVICE_NAME = '_esphomelib._tcp.local';

interface MDNSAnswer {
  name: string;
  type: number;
  class: number;
  ttl: number;
  data: Buffer;
}

function buildMDNSQuery(serviceName: string): Buffer {
  const parts = serviceName.split('.');
  const buffers: Buffer[] = [];
  
  // Header
  const header = Buffer.alloc(12);
  header.writeUInt16BE(0, 0);      // Transaction ID
  header.writeUInt16BE(0, 2);      // Flags (standard query)
  header.writeUInt16BE(1, 4);      // Questions
  header.writeUInt16BE(0, 6);      // Answer RRs
  header.writeUInt16BE(0, 8);      // Authority RRs
  header.writeUInt16BE(0, 10);     // Additional RRs
  buffers.push(header);
  
  // Question
  for (const part of parts) {
    const len = Buffer.alloc(1);
    len.writeUInt8(part.length, 0);
    buffers.push(len);
    buffers.push(Buffer.from(part));
  }
  buffers.push(Buffer.alloc(1)); // Null terminator
  
  // Type PTR (12) and Class IN (1)
  const typeClass = Buffer.alloc(4);
  typeClass.writeUInt16BE(12, 0);  // PTR
  typeClass.writeUInt16BE(1, 2);   // IN
  buffers.push(typeClass);
  
  return Buffer.concat(buffers);
}

function parseName(buffer: Buffer, offset: number): { name: string; newOffset: number } {
  const parts: string[] = [];
  let currentOffset = offset;
  let jumped = false;
  let jumpOffset = offset;
  
  while (true) {
    const len = buffer.readUInt8(currentOffset);
    
    if (len === 0) {
      currentOffset++;
      break;
    }
    
    // Check for compression pointer
    if ((len & 0xC0) === 0xC0) {
      if (!jumped) {
        jumpOffset = currentOffset + 2;
      }
      const pointer = buffer.readUInt16BE(currentOffset) & 0x3FFF;
      currentOffset = pointer;
      jumped = true;
      continue;
    }
    
    currentOffset++;
    parts.push(buffer.subarray(currentOffset, currentOffset + len).toString());
    currentOffset += len;
  }
  
  return {
    name: parts.join('.'),
    newOffset: jumped ? jumpOffset : currentOffset
  };
}

function parseTXT(data: Buffer): Record<string, string> {
  const result: Record<string, string> = {};
  let offset = 0;
  
  while (offset < data.length) {
    const len = data.readUInt8(offset);
    if (len === 0) break;
    offset++;
    
    const str = data.subarray(offset, offset + len).toString();
    const eqIndex = str.indexOf('=');
    if (eqIndex > 0) {
      result[str.substring(0, eqIndex)] = str.substring(eqIndex + 1);
    }
    offset += len;
  }
  
  return result;
}

async function discoverMDNS(): Promise<void> {
  console.log('Discovering ESPHome devices via mDNS...\n');
  console.log('Waiting for responses (10 seconds)...\n');
  
  const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
  
  const devices: Map<string, {
    name: string;
    address?: string;
    port?: number;
    txt?: Record<string, string>;
  }> = new Map();
  
  socket.on('message', (msg, rinfo) => {
    try {
      // Skip header
      let offset = 12;
      
      // Skip questions
      const qdcount = msg.readUInt16BE(4);
      for (let i = 0; i < qdcount; i++) {
        const { newOffset } = parseName(msg, offset);
        offset = newOffset + 4; // Skip type and class
      }
      
      // Parse answers
      const ancount = msg.readUInt16BE(6);
      const nscount = msg.readUInt16BE(8);
      const arcount = msg.readUInt16BE(10);
      const totalRecords = ancount + nscount + arcount;
      
      for (let i = 0; i < totalRecords; i++) {
        if (offset >= msg.length) break;
        
        const { name, newOffset } = parseName(msg, offset);
        offset = newOffset;
        
        const type = msg.readUInt16BE(offset);
        offset += 2;
        const recordClass = msg.readUInt16BE(offset);
        offset += 2;
        const ttl = msg.readUInt32BE(offset);
        offset += 4;
        const rdlength = msg.readUInt16BE(offset);
        offset += 2;
        
        const rdata = msg.subarray(offset, offset + rdlength);
        offset += rdlength;
        
        // PTR record - service instance
        if (type === 12 && name.includes('_esphomelib')) {
          const { name: instanceName } = parseName(msg, offset - rdlength);
          if (!devices.has(instanceName)) {
            devices.set(instanceName, { name: instanceName });
          }
        }
        
        // SRV record - host and port
        if (type === 33) {
          const port = rdata.readUInt16BE(4);
          const { name: target } = parseName(msg, offset - rdlength + 6);
          
          const deviceName = name.split('._esphomelib')[0];
          const device = devices.get(name) || { name: deviceName };
          device.port = port;
          devices.set(name, device);
        }
        
        // A record - IP address
        if (type === 1 && rdlength === 4) {
          const ip = `${rdata[0]}.${rdata[1]}.${rdata[2]}.${rdata[3]}`;
          
          // Find device with matching hostname
          for (const [key, device] of devices) {
            if (key.includes(name.replace('.local', '')) || name.includes(key.split('.')[0])) {
              device.address = ip;
            }
          }
        }
        
        // TXT record
        if (type === 16) {
          const txt = parseTXT(rdata);
          const device = devices.get(name) || { name: name };
          device.txt = txt;
          if (txt.address) {
            device.address = txt.address;
          }
          devices.set(name, device);
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  });
  
  socket.bind(MDNS_PORT, () => {
    socket.addMembership(MDNS_ADDRESS);
    socket.setMulticastTTL(255);
    
    const query = buildMDNSQuery(SERVICE_NAME);
    socket.send(query, 0, query.length, MDNS_PORT, MDNS_ADDRESS);
    
    // Send query a few times to improve discovery
    setTimeout(() => socket.send(query, 0, query.length, MDNS_PORT, MDNS_ADDRESS), 1000);
    setTimeout(() => socket.send(query, 0, query.length, MDNS_PORT, MDNS_ADDRESS), 3000);
  });
  
  // Wait for responses
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  socket.close();
  
  console.log('=== Discovered ESPHome Devices ===\n');
  
  if (devices.size === 0) {
    console.log('No ESPHome devices found.');
    console.log('\nMake sure:');
    console.log('  - Your device is powered on and connected to the network');
    console.log('  - mDNS is not blocked by your firewall');
    console.log('  - You are on the same network as the device');
  } else {
    for (const [key, device] of devices) {
      console.log(`Device: ${device.name}`);
      if (device.address) console.log(`  Address: ${device.address}`);
      if (device.port) console.log(`  Port: ${device.port}`);
      if (device.txt) {
        console.log('  TXT Records:');
        for (const [k, v] of Object.entries(device.txt)) {
          console.log(`    ${k}: ${v}`);
        }
      }
      console.log('');
    }
    
    // Print discovery command hint
    const ithoDevices = Array.from(devices.values()).filter(d => 
      d.txt?.friendly_name?.toLowerCase().includes('itho') ||
      d.txt?.friendly_name?.toLowerCase().includes('amber') ||
      d.name.toLowerCase().includes('itho') ||
      d.name.toLowerCase().includes('amber')
    );
    
    if (ithoDevices.length > 0) {
      console.log('\n=== Itho Daalderop Amber Device Found ===\n');
      for (const device of ithoDevices) {
        if (device.address) {
          console.log(`To discover entities, run:`);
          console.log(`  npm run discover ${device.address}`);
        }
      }
    }
  }
}

discoverMDNS().catch(console.error);
