"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [userName, setUserName] = useState("");
  const [isSpectator, setIsSpectator] = useState(false);
  const router = useRouter();

  const createRoom = async () => {
    if (!userName) return;

    const roomId = Math.random().toString(36).substring(2, 15);

    localStorage.setItem(`poker_user_${roomId}`, userName);
    localStorage.setItem(
      `poker_role_${roomId}`,
      isSpectator ? "spectator" : "voter"
    );

    router.push(`/room/${roomId}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Scrum Poker
        </h1>

        <div className="space-y-6">
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
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
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
            onClick={createRoom}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400"
            disabled={!userName}
          >
            Create New Room
          </button>

          <p className="text-sm text-center text-gray-600">
            Create a room and share the URL with your team to start planning
          </p>
        </div>
      </div>
    </main>
  );
}
