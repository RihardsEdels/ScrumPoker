import type { FC } from "react";

const ConnectionError: FC = () => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      <strong className="font-bold">Connection Error! </strong>
      <span className="block sm:inline">
        Unable to connect to the server. Trying to reconnect...
      </span>
    </div>
  );
};

export default ConnectionError;
