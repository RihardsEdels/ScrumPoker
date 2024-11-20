"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSocketConnection } from "@/hooks/useSocketConnection";
import { useVotes } from "@/hooks/useVotes";
import JoinRoom from "./joinRoom";
import Cards from "./cards";
import Users from "./users";
import ConnectionError from "./connectionError";
import Actions from "./actions";
import { calculateVoteSummary } from "@/util/calculateVoteSummary";
import VoteSummary from "./voteSummary";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const [userName, setUserName] = useState<string>("");
  const [hasJoined, setHasJoined] = useState(false);
  const [inputUserName, setInputUserName] = useState("");
  const [isSpectator, setIsSpectator] = useState(false);

  const { socket, connectionError } = useSocketConnection(
    roomId,
    userName,
    isSpectator
  );

  const { votes, showVotes, selectedCard, setSelectedCard } = useVotes(
    socket,
    userName
  );

  useEffect(() => {
    const savedName = localStorage.getItem(`poker_user_${roomId}`);
    const savedRole = localStorage.getItem(`poker_role_${roomId}`);
    if (savedName) {
      setUserName(savedName);
      setIsSpectator(savedRole === "spectator");
      setHasJoined(true);
    }
  }, [roomId]);

  const handleJoinRoom = useCallback(() => {
    if (!inputUserName) return;
    localStorage.setItem(`poker_user_${roomId}`, inputUserName);
    localStorage.setItem(
      `poker_role_${roomId}`,
      isSpectator ? "spectator" : "voter"
    );
    setUserName(inputUserName);
    setHasJoined(true);
  }, [inputUserName, isSpectator, roomId]);

  const handleVote = (value: string) => {
    if (!isSpectator && !connectionError) {
      setSelectedCard(value);
      socket?.emit("vote", { roomId, vote: value });
    }
  };

  if (!hasJoined) {
    return (
      <JoinRoom
        inputUserName={inputUserName}
        setInputUserName={setInputUserName}
        isSpectator={isSpectator}
        setIsSpectator={setIsSpectator}
        handleJoinRoom={handleJoinRoom}
      />
    );
  }

  const participants = votes.filter((v) => !v.isSpectator);
  const spectators = votes.filter((v) => v.isSpectator);
  const { summary, average } = showVotes
    ? calculateVoteSummary(votes)
    : { summary: [], average: null };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-6xl mx-auto">
        {connectionError && <ConnectionError />}
        <div className="bg-white rounded-lg shadow-xl grid gap-5 p-6 mb-8">
          <Actions
            connectionError={connectionError}
            socket={socket}
            roomId={roomId}
            participants={participants}
            isSpectator={isSpectator}
            setSelectedCard={setSelectedCard}
          />
          <Users
            showVotes={showVotes}
            participants={participants}
            spectators={spectators}
          />
          <Cards
            selectedCard={selectedCard}
            handleVote={handleVote}
            isSpectator={isSpectator}
            connectionError={connectionError}
          />
          {showVotes && <VoteSummary summary={summary} average={average} />}
        </div>
      </div>
    </main>
  );
}
