import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://127.0.0.1:5002';

/**
 * useSocket(role)
 * Connects to the Socket.io server, joins the correct feed room,
 * and exposes the socket instance + connection status.
 *
 * Usage:
 *   const { socket, connected } = useSocket('ngo');
 *   useEffect(() => {
 *     socket?.on('donation:new', handler);
 *     return () => socket?.off('donation:new', handler);
 *   }, [socket]);
 */
export const useSocket = (role) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      if (role) socket.emit('join_room', role);
      console.log(`✅ Socket connected (${role || 'no role'}):`, socket.id);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('❌ Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [role]);

  return { socket: socketRef.current, connected };
};
