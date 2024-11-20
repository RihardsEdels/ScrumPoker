import type { Vote } from "@/hooks/useVotes";
import { useState, type FC } from "react";
import type { Socket } from "socket.io-client";

interface ActionsProps {
  connectionError: boolean;
  socket: Socket | null;
  roomId: string;
  participants: Vote[];
  isSpectator: boolean;
  setSelectedCard: (card: string | null) => void;
}

const Actions: FC<ActionsProps> = ({
  connectionError,
  socket,
  roomId,
  participants,
  isSpectator,
  setSelectedCard,
}) => {
  const [copied, setCopied] = useState(false);

  const handleReveal = () => {
    if (!connectionError) {
      socket?.emit("reveal-votes", roomId);
    }
  };

  const handleReset = () => {
    if (!connectionError) {
      setSelectedCard(null);
      socket?.emit("reset-votes", roomId);
    }
  };

  const copyRoomLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allVoted = participants.every((vote) => vote.vote !== null);

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <button
          onClick={copyRoomLink}
          className="mt-2 text-sm text-blue-500 hover:text-blue-600 focus:outline-none"
        >
          {copied ? "Copied!" : "Copy room link"}
        </button>
        {isSpectator && (
          <div className="mt-1 text-sm text-gray-500">Spectator Mode</div>
        )}
      </div>
      <div className="space-x-4">
        <button
          onClick={handleReveal}
          disabled={!allVoted || connectionError}
          className={`px-4 py-2 rounded transition-colors ${
            allVoted && !connectionError
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          title={
            connectionError
              ? "Connection error"
              : allVoted
              ? "Reveal all votes"
              : "Waiting for all votes"
          }
        >
          Reveal Cards{" "}
          {!allVoted &&
            `(${participants.filter((v) => v.vote !== null).length}/${
              participants.length
            })`}
        </button>
        <button
          onClick={handleReset}
          disabled={connectionError}
          className={`px-4 py-2 rounded transition-colors ${
            connectionError
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          title={connectionError ? "Connection error" : "Reset votes"}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Actions;
