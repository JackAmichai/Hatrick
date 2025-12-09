import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, TrendingUp, Award, X } from "lucide-react";

interface AgentDebateProps {
    isOpen: boolean;
    onClose: () => void;
    team: "RED" | "BLUE";
    debate: Array<{
        agent: string;
        type: string;
        statement: string;
        target?: string;
    }>;
    voteResults: {
        winner: any;
        all_votes: Array<{
            agent: string;
            score: number;
            confidence: number;
            proposal: string;
        }>;
        consensus_strength: number;
    } | null;
}

export const AgentDebate = ({ isOpen, onClose, team, debate, voteResults }: AgentDebateProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`relative w-full max-w-4xl max-h-[85vh] bg-gradient-to-br ${
                            team === "RED" ? "from-red-900/20 to-neutral-900" : "from-blue-900/20 to-neutral-900"
                        } border-2 ${
                            team === "RED" ? "border-red-500/50" : "border-blue-500/50"
                        } rounded-xl shadow-2xl overflow-hidden`}
                    >
                        {/* Header */}
                        <div className={`px-6 py-4 border-b ${
                            team === "RED" ? "border-red-500/30 bg-red-950/30" : "border-blue-500/30 bg-blue-950/30"
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className={team === "RED" ? "text-red-400" : "text-blue-400"} />
                                    <h2 className={`text-2xl font-bold ${
                                        team === "RED" ? "text-red-400" : "text-blue-400"
                                    }`}>
                                        {team} Team Strategy Debate
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Debate Content */}
                        <div className="overflow-auto max-h-[calc(85vh-200px)] p-6">
                            {/* Debate Rounds */}
                            {debate && debate.length > 0 && (
                                <div className="space-y-4 mb-6">
                                    <h3 className="text-lg font-bold text-white mb-3">🎤 Agent Deliberation</h3>
                                    {debate.map((round, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`p-4 rounded-lg ${
                                                round.type === "opening" ? "bg-white/5 border-l-4 border-green-500" :
                                                round.type === "challenge" ? "bg-white/5 border-l-4 border-yellow-500" :
                                                "bg-white/5 border-l-4 border-purple-500"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`px-2 py-1 rounded text-xs font-bold ${
                                                    round.type === "opening" ? "bg-green-600" :
                                                    round.type === "challenge" ? "bg-yellow-600" :
                                                    "bg-purple-600"
                                                }`}>
                                                    {round.type.toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-white mb-1">{round.agent}</div>
                                                    <p className="text-gray-300 text-sm">{round.statement}</p>
                                                    {round.target && (
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            → Responding to {round.target}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Vote Results */}
                            {voteResults && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                        <Award className="text-yellow-400" size={20} />
                                        Voting Results
                                    </h3>
                                    
                                    {/* Consensus Strength */}
                                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-400 text-sm">Consensus Strength</span>
                                            <span className="text-white font-bold">
                                                {(voteResults.consensus_strength * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${voteResults.consensus_strength * 100}%` }}
                                                className={`h-full ${
                                                    voteResults.consensus_strength > 0.6 ? "bg-green-500" :
                                                    voteResults.consensus_strength > 0.4 ? "bg-yellow-500" :
                                                    "bg-red-500"
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    {/* All Votes */}
                                    <div className="space-y-2">
                                        {voteResults.all_votes.map((vote, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={`p-3 rounded-lg ${
                                                    idx === 0 ? "bg-green-500/20 border border-green-500/50" : "bg-white/5"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        {idx === 0 && <Award className="text-yellow-400" size={16} />}
                                                        <span className="font-bold text-white">{vote.agent}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-xs text-gray-400">
                                                            Confidence: {(vote.confidence * 100).toFixed(0)}%
                                                        </div>
                                                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                                                            idx === 0 ? "bg-green-600" : "bg-gray-600"
                                                        }`}>
                                                            Score: {vote.score.toFixed(1)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-gray-300 text-sm">{vote.proposal}</p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Winner */}
                                    {voteResults.winner && (
                                        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/20 to-green-500/20 border border-yellow-500/50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="text-green-400" />
                                                <span className="font-bold text-white">Winning Strategy</span>
                                            </div>
                                            <p className="text-gray-200">{voteResults.winner.proposal_text}</p>
                                            <div className="mt-2 text-xs text-gray-400">
                                                Proposed by: {voteResults.winner.agent_name} • 
                                                Confidence: {(voteResults.winner.confidence * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className={`px-6 py-3 border-t ${
                            team === "RED" ? "border-red-500/30 bg-red-950/20" : "border-blue-500/30 bg-blue-950/20"
                        } text-xs text-gray-500`}>
                            <span className="font-mono">
                                Multi-agent consensus mechanism • Weighted voting by performance & confidence
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
