import type { Vote } from "@/hooks/useVotes";
import type { FC } from "react";

interface UsersProps {
  participants: { userName: string; vote: string | null }[];
  showVotes: boolean;
  spectators: Vote[];
}

const Users: FC<UsersProps> = ({ participants, showVotes, spectators }) => {
  return (
    <>
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
    </>
  );
};

export default Users;
