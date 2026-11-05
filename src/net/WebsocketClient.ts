import type { InputState } from '../core/InputManager';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'closed' | 'error';

export interface NetInputFrame {
  tick: number;
  player: 0 | 1;
  input: InputState;
}

export class WebsocketClient {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = 'idle';

  constructor(private readonly url: string) {}

  connect(): void {
    this.status = 'connecting';
    try {
      this.socket = new WebSocket(this.url);
      this.socket.onopen = () => { this.status = 'connected'; };
      this.socket.onclose = () => { this.status = 'closed'; };
      this.socket.onerror = () => { this.status = 'error'; };
    } catch (error: unknown) {
      this.status = 'error';
      console.error('[WebsocketClient] Unable to connect', error);
    }
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
    this.status = 'closed';
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }
}
