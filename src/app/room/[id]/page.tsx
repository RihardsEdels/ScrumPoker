"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

const POKER_CARDS = ["1", "2", "3", "5", "8", "13", "21", "?"];

// Get Socket.IO URL based on environment
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "https://scrum-poker-socket.onrender.com";

type Vote = {
  userName: string;
  vote: string | null;
  isSpectator: boolean;
};

type VoteSummary = {
  value: string;
  count: number;
  percentage: number;
};

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showVotes, setShowVotes] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [hasJoined, setHasJoined] = useState(false);
  const [inputUserName, setInputUserName] = useState("");
  const [isSpectator, setIsSpectator] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    // Check if user already has a name and role for this room
    const savedName = localStorage.getItem(`poker_user_${roomId}`);
    const savedRole = localStorage.getItem(`poker_role_${roomId}`);
    if (savedName) {
      setUserName(savedName);
      setIsSpectator(savedRole === "spectator");
      setHasJoined(true);
    }
  }, [roomId]);

  useEffect(() => {
    if (!hasJoined) return;

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

    newSocket.on("room-update", (updatedVotes: Vote[]) => {
      setVotes(updatedVotes);
      // If this user's vote was reset by someone else, also reset the selected card
      const userVote = updatedVotes.find((v) => v.userName === userName);
      if (userVote && userVote.vote === null) {
        setSelectedCard(null);
      }
    });

    newSocket.on("votes-revealed", () => {
      setShowVotes(true);
    });

    newSocket.on("votes-reset", () => {
      setShowVotes(false);
      setSelectedCard(null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId, userName, hasJoined, isSpectator]);

  const handleJoinRoom = () => {
    if (!inputUserName) return;
    localStorage.setItem(`poker_user_${roomId}`, inputUserName);
    localStorage.setItem(
      `poker_role_${roomId}`,
      isSpectator ? "spectator" : "voter"
    );
    setUserName(inputUserName);
    setHasJoined(true);
  };

  const handleVote = (value: string) => {
    if (!isSpectator && !connectionError) {
      setSelectedCard(value);
      socket?.emit("vote", { roomId, vote: value });
    }
  };

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

  const calculateVoteSummary = (): {
    summary: VoteSummary[];
    average: number | null;
  } => {
    const voteCount = new Map<string, number>();
    const numericVotes: number[] = [];

    // Count votes from non-spectators only
    votes
      .filter((vote) => !vote.isSpectator)
      .forEach((vote) => {
        if (vote.vote) {
          voteCount.set(vote.vote, (voteCount.get(vote.vote) || 0) + 1);
          if (vote.vote !== "?") {
            numericVotes.push(Number(vote.vote));
          }
        }
      });

    // Calculate percentages and create summary
    const totalVotes = votes.filter(
      (v) => !v.isSpectator && v.vote !== null
    ).length;
    const summary: VoteSummary[] = Array.from(voteCount.entries())
      .map(([value, count]) => ({
        value,
        count,
        percentage: Math.round((count / totalVotes) * 100),
      }))
      .sort((a, b) => {
        if (a.value === "?") return 1;
        if (b.value === "?") return -1;
        return Number(a.value) - Number(b.value);
      });

    // Calculate average (excluding "?" votes)
    const average =
      numericVotes.length > 0
        ? Math.round(
            (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length) * 10
          ) / 10
        : null;

    return { summary, average };
  };

  if (!hasJoined) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Join Room</h1>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="userName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Name
              </label>
              <input
                type="text"
                id="userName"
                value={inputUserName}
                onChange={(e) => setInputUserName(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="spectator"
                checked={isSpectator}
                onChange={(e) => setIsSpectator(e.target.checked)}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="spectator" className="text-sm text-gray-700">
                Join as spectator
              </label>
            </div>
            <button
              onClick={handleJoinRoom}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400"
              disabled={!inputUserName}
            >
              Join Room
            </button>
          </div>
        </div>
      </main>
    );
  }

  const participants = votes.filter((v) => !v.isSpectator);
  const spectators = votes.filter((v) => v.isSpectator);
  const allVoted = participants.every((vote) => vote.vote !== null);
  const { summary, average } = showVotes
    ? calculateVoteSummary()
    : { summary: [], average: null };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-6xl mx-auto">
        {connectionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Connection Error! </strong>
            <span className="block sm:inline">
              Unable to connect to the server. Trying to reconnect...
            </span>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Room: {roomId}
              </h1>
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
                disabled={!allVoted || isSpectator || connectionError}
                className={`px-4 py-2 rounded transition-colors ${
                  allVoted && !isSpectator && !connectionError
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                title={
                  isSpectator
                    ? "Spectators cannot reveal votes"
                    : connectionError
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
                disabled={isSpectator || connectionError}
                className={`px-4 py-2 rounded transition-colors ${
                  isSpectator || connectionError
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                title={
                  isSpectator
                    ? "Spectators cannot reset votes"
                    : connectionError
                    ? "Connection error"
                    : "Reset votes"
                }
              >
                Reset
              </button>
            </div>
          </div>

          {showVotes && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Vote Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Distribution
                  </h3>
                  <div className="space-y-2">
                    {summary.map(({ value, count, percentage }) => (
                      <div key={value} className="flex items-center gap-2">
                        <div className="w-12 font-medium text-gray-800">
                          {value}
                        </div>
                        <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-16 text-sm text-gray-600">
                          {count} ({percentage}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Average
                  </h3>
                  <div className="text-3xl font-bold text-gray-800">
                    {average !== null ? average : "N/A"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {average !== null ? "Points" : "No numeric votes"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {participants.map((vote, index) => (
              <div
                key={`${vote.userName}-${index}`}
                className={`p-4 rounded-lg text-center transition-colors ${
                  vote.vote
                    ? "bg-green-50 border-2 border-green-200"
                    : "bg-gray-50 border-2 border-gray-200"
                }`}
              >
                <div className="font-medium text-gray-800 flex items-center justify-center gap-2">
                  {vote.userName}
                  {vote.vote && (
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  )}
                </div>
                <div className="mt-2">
                  {showVotes ? (
                    <span className="text-xl font-bold">
                      {vote.vote || "No vote"}
                    </span>
                  ) : vote.vote ? (
                    <span className="text-green-600">Ready</span>
                  ) : (
                    <span className="text-gray-500">Thinking...</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {spectators.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Spectators ({spectators.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {spectators.map((spectator, index) => (
                  <div
                    key={`${spectator.userName}-${index}`}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                  >
                    {spectator.userName}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {POKER_CARDS.map((card) => (
              <button
                key={card}
                onClick={() => handleVote(card)}
                disabled={isSpectator || connectionError}
                className={`aspect-[2/3] rounded-lg border-2 ${
                  selectedCard === card
                    ? "border-blue-500 bg-blue-50"
                    : isSpectator || connectionError
                    ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-blue-300"
                } flex items-center justify-center text-2xl font-bold transition-colors ${
                  isSpectator || connectionError
                    ? "text-gray-400"
                    : "text-gray-800"
                }`}
              >
                {card}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
