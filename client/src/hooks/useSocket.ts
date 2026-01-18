import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { socketService } from '../services/socketService';

export const useSocket = (sessionId: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const newSocket = socketService.connect(sessionId);
    setSocket(newSocket);

    const handleConnect = () => {
      console.log('Socket connected, joining session:', sessionId);
      setIsConnected(true);
      socketService.joinSession(sessionId);
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    };

    const handleConnectError = (error: any) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    };

    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('connect_error', handleConnectError);

    if (newSocket.connected) {
      handleConnect();
    }

    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('connect_error', handleConnectError);
    };
  }, [sessionId]);

  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  const emit = (event: string, data: any) => {
    socket?.emit(event, data);
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    socket?.on(event, callback);
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    socket?.off(event, callback);
  };

  return {
    socket,
    isConnected,
    emit,
    on,
    off,
  };
};

