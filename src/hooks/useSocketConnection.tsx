import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export function useSocketConnection(
  roomId: string,
  userName: string,
  isSpectator: boolean
) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      setConnectionError(false);
      newSocket.emit("join-room", { roomId, userName, isSpectator });
    });

    newSocket.on("connect_error", () => {
      setConnectionError(true);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId, userName, isSpectator]);

  return { socket, connectionError };
}
