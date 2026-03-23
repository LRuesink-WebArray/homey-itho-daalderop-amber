import { ESPHomeClient } from '@webarray/esphome-native-api';

export interface TimerFactory {
  setTimeout: typeof setTimeout;
  clearTimeout: typeof clearTimeout;
  setInterval: typeof setInterval;
  clearInterval: typeof clearInterval;
}

export interface EspHomeApiOptions {
  host: string;
  port: number;
  encryptionKey?: string;
  timerFactory?: TimerFactory;
}

export default class EspHomeApi {
  private client: ESPHomeClient;

  constructor(options: EspHomeApiOptions) {
    this.client = new ESPHomeClient({
      host: options.host,
      port: options.port,
      encryptionKey: options.encryptionKey,
      reconnect: true,
      timerFactory: options.timerFactory,
    });
  }

  get rawClient(): ESPHomeClient {
    return this.client;
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  isConnected(): boolean {
    return this.client.isConnected();
  }

  destroy(): void {
    this.client.destroy();
  }

  getDeviceInfo() {
    return this.client.getDeviceInfo();
  }

  async listEntities() {
    return this.client.listEntities();
  }

  subscribeStates(): void {
    this.client.subscribeStates();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, callback: (...args: any[]) => void): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.client as any).on(event, callback);
  }

  async switchCommand(key: number, state: boolean): Promise<void> {
    await this.client.switchCommand(key, state);
  }

  async buttonCommand(key: number): Promise<void> {
    await this.client.buttonCommand(key);
  }

  async numberCommand(key: number, state: number): Promise<void> {
    await this.client.numberCommand(key, state);
  }

  async selectCommand(key: number, state: string): Promise<void> {
    await this.client.selectCommand(key, state);
  }
}
