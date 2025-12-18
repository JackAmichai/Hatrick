/**
 * Feature 14: Dynamic Agent Spawning UI
 * Shows the agent pool with spawn/terminate capabilities
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, RefreshCw, Cpu, Shield, Brain, Target } from 'lucide-react';
import type { AgentPoolStatus, PoolAgent, AgentPersonality } from '../../types/orchestration';

interface AgentPoolManagerProps {
  poolStatus: AgentPoolStatus | null;
  onSpawnAgent?: (agentId: string, personality: AgentPersonality, specialization: string) => void;
  onTerminateAgent?: (agentId: string) => void;
}

const personalityIcons: Record<AgentPersonality, typeof Brain> = {
  aggressive: Target,
  cautious: Shield,
  innovative: Brain,
  analytical: Cpu,
  strategic: RefreshCw
};

const personalityColors: Record<AgentPersonality, string> = {
  aggressive: 'text-red-400 bg-red-500/10 border-red-500/30',
  cautious: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  innovative: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  analytical: 'text-green-400 bg-green-500/10 border-green-500/30',
  strategic: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
};

const AgentCard = ({ 
  agent, 
  onTerminate 
}: { 
  agent: PoolAgent; 
  onTerminate?: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = personalityIcons[agent.personality] || Brain;
  const colorClass = personalityColors[agent.personality] || personalityColors.analytical;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative p-4 rounded-lg border ${colorClass} transition-all`}
    >
      {/* Status indicator */}
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
        agent.status === 'active' ? 'bg-green-400 animate-pulse' : 
        agent.status === 'busy' ? 'bg-amber-400 animate-pulse' : 'bg-neutral-500'
      }`} />
      
      {/* Icon and name */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass.split(' ')[1]}`}>
          <Icon className={`w-5 h-5 ${colorClass.split(' ')[0]}`} />
        </div>
        <div>
          <h4 className="font-medium text-white text-sm">
            {agent.agent_id.replace(/_/g, ' ')}
          </h4>
          <p className="text-xs text-neutral-400 capitalize">{agent.personality}</p>
        </div>
      </div>
      
      {/* Specialization */}
      <p className="text-xs text-neutral-300 mb-2 truncate">
        {agent.specialization}
      </p>
      
      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{agent.tasks_completed} tasks</span>
        <span className="capitalize">{agent.status}</span>
      </div>
      
      {/* Terminate button (shown on hover) */}
      <AnimatePresence>
        {isHovered && onTerminate && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onTerminate}
            className="absolute top-2 left-2 p-1 bg-red-500/20 rounded hover:bg-red-500/40 transition-colors"
            title="Terminate agent"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SpawnAgentModal = ({ 
  onSpawn, 
  onClose 
}: { 
  onSpawn: (id: string, personality: AgentPersonality, spec: string) => void;
  onClose: () => void;
}) => {
  const [agentId, setAgentId] = useState('');
  const [personality, setPersonality] = useState<AgentPersonality>('analytical');
  const [specialization, setSpecialization] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agentId && specialization) {
      onSpawn(agentId.replace(/\s+/g, '_').toLowerCase(), personality, specialization);
      onClose();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.form
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 w-full max-w-md"
      >
        <h3 className="text-lg font-bold text-white mb-4">Spawn New Agent</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Agent ID</label>
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="e.g., recon_specialist"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Personality</label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(personalityIcons) as AgentPersonality[]).map((p) => {
                const Icon = personalityIcons[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPersonality(p)}
                    className={`p-2 rounded-lg border transition-all ${
                      personality === p 
                        ? personalityColors[p] 
                        : 'border-neutral-700 text-neutral-500 hover:border-neutral-600'
                    }`}
                    title={p}
                  >
                    <Icon className="w-4 h-4 mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Specialization</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g., Network reconnaissance"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!agentId || !specialization}
            className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Spawn Agent
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export const AgentPoolManager = ({ 
  poolStatus, 
  onSpawnAgent, 
  onTerminateAgent 
}: AgentPoolManagerProps) => {
  const [showSpawnModal, setShowSpawnModal] = useState(false);
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Agent Pool</h3>
        </div>
        
        <div className="flex items-center gap-3">
          {poolStatus && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-green-400">{poolStatus.active_agents} active</span>
              <span className="text-neutral-500">|</span>
              <span className="text-neutral-400">{poolStatus.total_agents} total</span>
            </div>
          )}
          
          {onSpawnAgent && (
            <button
              onClick={() => setShowSpawnModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Spawn
            </button>
          )}
        </div>
      </div>
      
      {/* Agent grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {poolStatus?.agents.map((agent) => (
            <AgentCard
              key={agent.agent_id}
              agent={agent}
              onTerminate={onTerminateAgent ? () => onTerminateAgent(agent.agent_id) : undefined}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Empty state */}
      {(!poolStatus || poolStatus.agents.length === 0) && (
        <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
          <Users className="w-8 h-8 mb-2 opacity-50" />
          <p>No agents in pool</p>
          {onSpawnAgent && (
            <button
              onClick={() => setShowSpawnModal(true)}
              className="mt-2 text-cyan-400 hover:underline text-sm"
            >
              Spawn your first agent
            </button>
          )}
        </div>
      )}
      
      {/* Spawn modal */}
      <AnimatePresence>
        {showSpawnModal && onSpawnAgent && (
          <SpawnAgentModal
            onSpawn={onSpawnAgent}
            onClose={() => setShowSpawnModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentPoolManager;
