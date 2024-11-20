import type { FC } from "react";

interface JoinRoomProps {
  inputUserName: string;
  setInputUserName: (value: string) => void;
  isSpectator: boolean;
  setIsSpectator: (value: boolean) => void;
  handleJoinRoom: () => void;
}

const JoinRoom: FC<JoinRoomProps> = ({
  inputUserName,
  setInputUserName,
  isSpectator,
  setIsSpectator,
  handleJoinRoom,
}) => {
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
};

export default JoinRoom;
