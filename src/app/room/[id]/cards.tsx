import type { FC } from "react";

interface CardsProps {
  handleVote: (card: string) => void;
  isSpectator: boolean;
  connectionError: boolean;
  selectedCard: string | null;
}
const POKER_CARDS = ["1", "2", "3", "5", "8", "13", "21", "?"];

const Cards: FC<CardsProps> = ({
  handleVote,
  isSpectator,
  connectionError,
  selectedCard,
}) => {
  return (
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
            isSpectator || connectionError ? "text-gray-400" : "text-gray-800"
          }`}
        >
          {card}
        </button>
      ))}
    </div>
  );
};

export default Cards;
