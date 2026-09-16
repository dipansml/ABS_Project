class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private url = '';

  connect(
    url: string,
    onMessage: (data: any) => void,
    onStatusChange?: (connected: boolean) => void,
  ) {
    this.url = url;

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    console.log('Connecting WebSocket:', url);

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      onStatusChange?.(true);
    };

    this.socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.log('WebSocket invalid JSON:', event.data);
      }
    };

    this.socket.onerror = error => {
      console.log('========== WEBSOCKET ERROR ==========');
      console.log('Error object:', error);
      console.log('Error message:', error?.message);
      console.log('WebSocket URL:', url);
      console.log('WebSocket readyState:', this.socket?.readyState);
      console.log('=====================================');
      onStatusChange?.(false);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');

      this.socket = null;
      onStatusChange?.(false);

      this.reconnect();
    };
  }

  private reconnect() {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;

      if (this.url) {
        console.log('Reconnecting WebSocket...');

        // You can reconnect from your screen/service
      }
    }, 3000);
  }

  send(data: any) {
    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN
    ) {
      this.socket.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.url = '';
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export default new WebSocketService();