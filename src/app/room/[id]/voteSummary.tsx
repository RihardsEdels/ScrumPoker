import type { VoteSummary } from "@/util/calculateVoteSummary";
import type { FC } from "react";

interface VoteSummaryProps {
  summary?: VoteSummary[];
  average: number | null;
}

const VoteSummary: FC<VoteSummaryProps> = ({ summary, average }) => {
  return (
    <div className="mb-8 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Vote Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Distribution
          </h3>
          <div className="space-y-2">
            {summary?.map(({ value, count, percentage }) => (
              <div key={value} className="flex items-center gap-2">
                <div className="w-12 font-medium text-gray-800">{value}</div>
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
          <h3 className="text-sm font-medium text-gray-600 mb-2">Average</h3>
          <div className="text-3xl font-bold text-gray-800">
            {average !== null ? average : "N/A"}
          </div>
          <div className="text-sm text-gray-500">
            {average !== null ? "Points" : "No numeric votes"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteSummary;
