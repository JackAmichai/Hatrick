/**
 * Feature 1: Multi-Agent Voting Panel
 * Displays voting process with confidence scores and weighted scoring
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, TrendingUp, Award, Users, ChevronDown, ChevronUp } from 'lucide-react';
import type { VoteResults, AgentProposal, VoteBreakdown } from '../../types/orchestration';

interface VotingPanelProps {
  voteResults: VoteResults | null;
  isVoting: boolean;
  onRequestVote?: () => void;
}

const personalityColors: Record<string, string> = {
  aggressive: 'text-red-400 bg-red-500/20 border-red-500/30',
  cautious: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  innovative: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  analytical: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
  strategic: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
};

const BreakdownBar = ({ label, value, max = 1 }: { label: string; value: number; max?: number }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 text-neutral-400">{label}</span>
      <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
        />
      </div>
      <span className="w-12 text-right text-neutral-300">{(value * 100).toFixed(0)}%</span>
    </div>
  );
};

const VoteCard = ({ vote, rank, isWinner }: { vote: AgentProposal; rank: number; isWinner: boolean }) => {
  const [expanded, setExpanded] = useState(isWinner);
  const personalityClass = personalityColors[vote.personality] || personalityColors.analytical;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`rounded-lg border ${isWinner ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-neutral-700 bg-neutral-900/50'}`}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${isWinner ? 'text-yellow-400' : 'text-neutral-500'}`}>
              #{rank}
            </span>
            {isWinner && <Award className="w-5 h-5 text-yellow-400" />}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{vote.agent_name}</span>
                <span className={`px-2 py-0.5 rounded text-xs border ${personalityClass}`}>
                  {vote.personality_icon} {vote.personality}
                </span>
              </div>
              <p className="text-sm text-neutral-400 mt-1 line-clamp-1">{vote.proposal_text}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-white">{vote.score?.toFixed(1)}</div>
              <div className="text-xs text-neutral-500">score</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-cyan-400">{(vote.confidence * 100).toFixed(0)}%</div>
              <div className="text-xs text-neutral-500">confidence</div>
            </div>
            {expanded ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && vote.breakdown && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-neutral-800 pt-4">
              <h4 className="text-sm font-semibold text-neutral-300 mb-3">Score Breakdown</h4>
              <div className="space-y-2">
                <BreakdownBar label="Performance" value={vote.breakdown.performance} />
                <BreakdownBar label="Confidence" value={vote.breakdown.confidence} />
                <BreakdownBar label="Calibration" value={vote.breakdown.calibration} />
                <BreakdownBar label="Specialization" value={vote.breakdown.specialization} max={0.3} />
              </div>
              
              <div className="mt-4 p-3 bg-neutral-800/50 rounded-lg">
                <h5 className="text-xs font-semibold text-neutral-400 mb-2">REASONING</h5>
                <p className="text-sm text-neutral-300">{vote.reasoning}</p>
              </div>

              {vote.mitre_technique && (
                <div className="mt-3">
                  <a
                    href={`https://attack.mitre.org/techniques/${vote.mitre_technique}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                  >
                    🎯 MITRE ATT&CK: {vote.mitre_technique}
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const VotingPanel = ({ voteResults, isVoting, onRequestVote }: VotingPanelProps) => {
  if (!voteResults && !isVoting) {
    return (
      <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Agent Voting</h3>
          </div>
          {onRequestVote && (
            <button
              onClick={onRequestVote}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Request Vote
            </button>
          )}
        </div>
        <p className="text-neutral-400 text-center py-8">No active voting session</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Vote className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Agent Voting</h3>
        </div>
        {voteResults && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-400">{voteResults.total_proposals} proposals</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">
                {(voteResults.consensus_strength * 100).toFixed(0)}% consensus
              </span>
            </div>
          </div>
        )}
      </div>

      {isVoting && (
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
          />
          <span className="ml-3 text-cyan-400">Agents voting...</span>
        </div>
      )}

      {voteResults && (
        <>
          {/* Vote Distribution Bar */}
          <div className="mb-6">
            <div className="text-xs text-neutral-500 mb-2">VOTE DISTRIBUTION</div>
            <div className="h-4 rounded-full overflow-hidden flex">
              {Object.entries(voteResults.vote_distribution).map(([agent, pct], i) => (
                <motion.div
                  key={agent}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`h-full ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-cyan-500' : 'bg-neutral-600'}`}
                  title={`${agent}: ${pct}%`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-neutral-500">
              {Object.entries(voteResults.vote_distribution).slice(0, 3).map(([agent, pct]) => (
                <span key={agent}>{agent}: {pct}%</span>
              ))}
            </div>
          </div>

          {/* Vote Cards */}
          <div className="space-y-3">
            {voteResults.all_votes.map((vote, i) => (
              <VoteCard
                key={vote.agent_id}
                vote={vote}
                rank={i + 1}
                isWinner={i === 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VotingPanel;
