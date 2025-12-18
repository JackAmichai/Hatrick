/**
 * Feature 5 & 9: Agent Metrics Panel
 * Shows specialization badges, calibration scores, and performance data
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Target, TrendingUp, Users } from 'lucide-react';
import type { AgentMetrics } from '../../types/orchestration';

interface AgentMetricsPanelProps {
  agents: Record<string, AgentMetrics>;
  selectedTeam?: 'RED' | 'BLUE' | 'ALL';
}

const personalityIcons: Record<string, string> = {
  aggressive: '⚔️',
  cautious: '🛡️',
  innovative: '💡',
  analytical: '📊',
  strategic: '♟️',
};

const CalibrationGauge = ({ score }: { score: number }) => {
  const angle = (score * 180) - 90; // -90 to 90 degrees
  const color = score > 0.7 ? '#22c55e' : score > 0.4 ? '#f59e0b' : '#ef4444';
  
  return (
    <div className="relative w-20 h-10 overflow-hidden">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        {/* Background arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#374151"
          strokeWidth="8"
        />
        {/* Colored arc based on score */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${score * 125.6} 125.6`}
        />
        {/* Needle */}
        <line
          x1="50"
          y1="50"
          x2={50 + 30 * Math.cos((angle * Math.PI) / 180)}
          y2={50 - 30 * Math.sin((angle * Math.PI) / 180)}
          stroke="white"
          strokeWidth="2"
        />
        <circle cx="50" cy="50" r="4" fill="white" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-neutral-400">
        {(score * 100).toFixed(0)}%
      </div>
    </div>
  );
};

const SpecializationBadges = ({ scores }: { scores: Record<string, number> }) => {
  const sortedSpecs = Object.entries(scores)
    .filter(([, score]) => score > 0.1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  if (sortedSpecs.length === 0) {
    return <span className="text-xs text-neutral-500">No specializations yet</span>;
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {sortedSpecs.map(([type, score]) => (
        <span
          key={type}
          className={`px-2 py-0.5 rounded text-xs ${
            score > 0.2 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            score > 0.1 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
            'bg-neutral-700 text-neutral-400'
          }`}
        >
          {type.replace('_', ' ')} +{(score * 100).toFixed(0)}%
        </span>
      ))}
    </div>
  );
};

const AgentCard = ({ agent }: { agent: AgentMetrics }) => {
  const [expanded, setExpanded] = useState(false);
  const isRed = agent.team === 'RED';
  
  return (
    <motion.div
      layout
      className={`p-4 rounded-lg border ${
        isRed ? 'bg-red-500/5 border-red-500/30' : 'bg-blue-500/5 border-blue-500/30'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
            isRed ? 'bg-red-500/20' : 'bg-blue-500/20'
          }`}>
            {personalityIcons[agent.personality]}
          </div>
          <div>
            <div className="font-semibold text-white">{agent.agent_name}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className={isRed ? 'text-red-400' : 'text-blue-400'}>{agent.team}</span>
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-400 capitalize">{agent.personality}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-white">{(agent.success_rate * 100).toFixed(0)}%</div>
          <div className="text-xs text-neutral-500">success rate</div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center p-2 bg-neutral-800/50 rounded">
          <div className="text-sm font-semibold text-white">{agent.total_missions}</div>
          <div className="text-xs text-neutral-500">Missions</div>
        </div>
        <div className="text-center p-2 bg-neutral-800/50 rounded">
          <div className="text-sm font-semibold text-white">{agent.avg_response_time_ms.toFixed(0)}ms</div>
          <div className="text-xs text-neutral-500">Avg Time</div>
        </div>
        <div className="text-center p-2 bg-neutral-800/50 rounded">
          <div className="text-sm font-semibold text-white">{agent.total_tokens_used.toLocaleString()}</div>
          <div className="text-xs text-neutral-500">Tokens</div>
        </div>
        <div className="text-center p-2 bg-neutral-800/50 rounded">
          <div className="text-sm font-semibold text-white">${agent.total_cost_usd.toFixed(3)}</div>
          <div className="text-xs text-neutral-500">Cost</div>
        </div>
      </div>
      
      {/* Calibration */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-neutral-400">Calibration</span>
        </div>
        <CalibrationGauge score={agent.calibration_score} />
      </div>
      
      {/* Specializations */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-neutral-400">Specializations</span>
        </div>
        <SpecializationBadges scores={agent.specialization_scores} />
      </div>
      
      {/* Toggle expanded */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-xs text-neutral-500 hover:text-neutral-300 py-1"
      >
        {expanded ? 'Show less' : 'Show collaborations'}
      </button>
      
      {expanded && Object.keys(agent.collaboration_scores).length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-3 pt-3 border-t border-neutral-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-neutral-400">Collaboration Scores</span>
          </div>
          <div className="space-y-1">
            {Object.entries(agent.collaboration_scores)
              .sort((a, b) => b[1] - a[1])
              .map(([otherId, score]) => (
                <div key={otherId} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 w-24 truncate">{otherId}</span>
                  <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        score > 0.7 ? 'bg-green-500' : score > 0.4 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-400 w-8">{(score * 100).toFixed(0)}%</span>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export const AgentMetricsPanel = ({ agents, selectedTeam = 'ALL' }: AgentMetricsPanelProps) => {
  const filteredAgents = Object.values(agents).filter(
    agent => selectedTeam === 'ALL' || agent.team === selectedTeam
  );
  
  const redAgents = filteredAgents.filter(a => a.team === 'RED');
  const blueAgents = filteredAgents.filter(a => a.team === 'BLUE');
  
  // Team stats
  const getTeamStats = (teamAgents: AgentMetrics[]) => {
    if (teamAgents.length === 0) return { avgSuccess: 0, totalMissions: 0, avgCalibration: 0 };
    return {
      avgSuccess: teamAgents.reduce((sum, a) => sum + a.success_rate, 0) / teamAgents.length,
      totalMissions: teamAgents.reduce((sum, a) => sum + a.total_missions, 0),
      avgCalibration: teamAgents.reduce((sum, a) => sum + a.calibration_score, 0) / teamAgents.length,
    };
  };
  
  const redStats = getTeamStats(redAgents);
  const blueStats = getTeamStats(blueAgents);
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-bold text-white">Agent Performance & Specialization</h3>
      </div>
      
      {/* Team Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="text-red-400 font-semibold mb-2">🔴 Red Team</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-white">{(redStats.avgSuccess * 100).toFixed(0)}%</div>
              <div className="text-xs text-neutral-500">Avg Success</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{redStats.totalMissions}</div>
              <div className="text-xs text-neutral-500">Missions</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{(redStats.avgCalibration * 100).toFixed(0)}%</div>
              <div className="text-xs text-neutral-500">Calibration</div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="text-blue-400 font-semibold mb-2">🔵 Blue Team</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-white">{(blueStats.avgSuccess * 100).toFixed(0)}%</div>
              <div className="text-xs text-neutral-500">Avg Success</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{blueStats.totalMissions}</div>
              <div className="text-xs text-neutral-500">Missions</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{(blueStats.avgCalibration * 100).toFixed(0)}%</div>
              <div className="text-xs text-neutral-500">Calibration</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAgents.map(agent => (
          <AgentCard key={agent.agent_id} agent={agent} />
        ))}
      </div>
      
      {filteredAgents.length === 0 && (
        <p className="text-neutral-400 text-center py-8">No agents found</p>
      )}
    </div>
  );
};

export default AgentMetricsPanel;
