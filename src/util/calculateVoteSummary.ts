import type { Vote } from "@/hooks/useVotes";

export type VoteSummary = {
    value: string;
    count: number;
    percentage: number;
};
export const calculateVoteSummary = (votes: Vote[]): {
    summary: VoteSummary[];
    average: number | null;
} => {
    const voteCount = new Map<string, number>();
    const numericVotes: number[] = [];

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

    const average =
        numericVotes.length > 0
            ? Math.round(
                (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length) * 10
            ) / 10
            : null;

    return { summary, average };
};