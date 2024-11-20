// useVotes.ts
import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
export type Vote = {
  userName: string;
  vote: string | null;
  isSpectator: boolean;
};

export function useVotes(socket: Socket | null, userName: string) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [showVotes, setShowVotes] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("room-update", (updatedVotes: Vote[]) => {
      setVotes(updatedVotes);
      const userVote = updatedVotes.find((v) => v.userName === userName);
      if (userVote && userVote.vote === null) {
        setSelectedCard(null);
      }
    });

    socket.on("votes-revealed", () => {
      setShowVotes(true);
    });

    socket.on("votes-reset", () => {
      setShowVotes(false);
      setSelectedCard(null);
    });

    return () => {
      socket.off("room-update");
      socket.off("votes-revealed");
      socket.off("votes-reset");
    };
  }, [socket, userName]);

  return { votes, showVotes, selectedCard, setSelectedCard };
}
