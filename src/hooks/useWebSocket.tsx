import { useEffect, useRef, useCallback, useState } from "react";

export const useWebSocket = (url: string) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const timeout = Math.pow(2, reconnectAttemptsRef.current) * 1000;
        console.log(`Attempting to reconnect in ${timeout / 1000} seconds...`);
        setTimeout(connect, timeout);
        reconnectAttemptsRef.current++;
      } else {
        console.error(
          "Max reconnection attempts reached. Please refresh the page."
        );
      }
    };
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }, []);

  return { sendMessage };
};
