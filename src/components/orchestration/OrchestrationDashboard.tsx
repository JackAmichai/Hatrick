/**
 * OrchestrationDashboard
 * Main dashboard component combining all AI Agent Orchestration features (1-15)
 * Showcases advanced multi-agent coordination and visualization
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Vote, 
  MessageSquare, 
  Brain, 
  Network, 
  GitBranch,
  Layers,
  Sparkles,
  Activity,
  Radio,
  Users,
  DollarSign,
  ChevronRight,
  X
} from 'lucide-react';

// Import all orchestration components
import { VotingPanel } from './VotingPanel';
import { AgentDebatePanel } from './AgentDebatePanel';
import { ChainOfThoughtPanel } from './ChainOfThoughtPanel';
import { AgentMetricsPanel } from './AgentMetricsPanel';
import { CollaborationGraph } from './CollaborationGraph';
import { HierarchyPanel } from './HierarchyPanel';
import { EnsemblePanel } from './EnsemblePanel';
import { ReflectionPanel } from './ReflectionPanel';
import { AgentProgressBars } from './AgentProgressBars';
import { MessageLogPanel } from './MessageLogPanel';
import { AgentPoolManager } from './AgentPoolManager';
import { CostDashboard } from './CostDashboard';

// Import types
import type {
  VoteResults,
  DebateRound,
  ChainOfThought,
  AgentMetrics,
  CollaborationGraph as CollaborationGraphType,
  HierarchyCoordination,
  EnsembleDecision,
  AgentReflection,
  ExecutionStatus,
  MessageBusLog,
  AgentPoolStatus,
  CostMetrics,
  AgentPersonality
} from '../../types/orchestration';

// Feature tabs configuration
const tabs = [
  { id: 'voting', label: 'Voting', icon: Vote, feature: 1 },
  { id: 'debate', label: 'Debate', icon: MessageSquare, feature: 4 },
  { id: 'reasoning', label: 'Reasoning', icon: Brain, feature: 6 },
  { id: 'metrics', label: 'Metrics', icon: Activity, feature: '5 & 9' },
  { id: 'collaboration', label: 'Collaboration', icon: Network, feature: 7 },
  { id: 'hierarchy', label: 'Hierarchy', icon: GitBranch, feature: 8 },
  { id: 'ensemble', label: 'Ensemble', icon: Layers, feature: 10 },
  { id: 'reflection', label: 'Reflection', icon: Sparkles, feature: 11 },
  { id: 'execution', label: 'Execution', icon: Activity, feature: 12 },
  { id: 'messages', label: 'Messages', icon: Radio, feature: 13 },
  { id: 'pool', label: 'Agent Pool', icon: Users, feature: 14 },
  { id: 'costs', label: 'Costs', icon: DollarSign, feature: 15 },
] as const;

type TabId = typeof tabs[number]['id'];

interface OrchestrationDashboardProps {
  // Feature 1: Voting
  voteResults?: VoteResults | null;
  
  // Feature 4: Debate
  debateRounds?: DebateRound[];
  
  // Feature 6: Chain of Thought
  chainOfThought?: ChainOfThought | null;
  
  // Feature 5 & 9: Agent Metrics
  agentMetrics?: AgentMetrics[];
  
  // Feature 7: Collaboration Graph
  collaborationGraph?: CollaborationGraphType | null;
  
  // Feature 8: Hierarchy
  hierarchyCoordination?: HierarchyCoordination | null;
  
  // Feature 10: Ensemble
  ensembleDecision?: EnsembleDecision | null;
  proposals?: Array<{ agent_id: string; confidence: number; estimated_impact: number }>;
  
  // Feature 11: Reflection
  agentReflection?: AgentReflection | null;
  
  // Feature 12: Execution Status
  executionStatus?: ExecutionStatus | null;
  
  // Feature 13: Message Bus
  messageBusLog?: MessageBusLog | null;
  
  // Feature 14: Agent Pool
  agentPoolStatus?: AgentPoolStatus | null;
  onSpawnAgent?: (agentId: string, personality: AgentPersonality, specialization: string) => void;
  onTerminateAgent?: (agentId: string) => void;
  
  // Feature 15: Cost Metrics
  costMetrics?: CostMetrics | null;
  
  // General
  isOpen?: boolean;
  onClose?: () => void;
  defaultTab?: TabId;
}

export const OrchestrationDashboard = ({
  voteResults = null,
  debateRounds = [],
  chainOfThought = null,
  agentMetrics = [],
  collaborationGraph = null,
  hierarchyCoordination = null,
  ensembleDecision = null,
  proposals = [],
  agentReflection = null,
  executionStatus = null,
  messageBusLog = null,
  agentPoolStatus = null,
  onSpawnAgent,
  onTerminateAgent,
  costMetrics = null,
  isOpen = true,
  onClose,
  defaultTab = 'voting'
}: OrchestrationDashboardProps) => {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Agent Orchestration Dashboard</h2>
              <p className="text-sm text-neutral-400">AI Agent Coordination & Visualization</p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          )}
        </div>
        
        {/* Tab navigation */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-neutral-800 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-600/30'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-cyan-600/30' : 'bg-neutral-700'
                }`}>
                  F{tab.feature}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'voting' && (
                <VotingPanel voteResults={voteResults} />
              )}
              
              {activeTab === 'debate' && (
                <AgentDebatePanel rounds={debateRounds} />
              )}
              
              {activeTab === 'reasoning' && (
                <ChainOfThoughtPanel chainOfThought={chainOfThought} />
              )}
              
              {activeTab === 'metrics' && (
                <AgentMetricsPanel agents={agentMetrics} />
              )}
              
              {activeTab === 'collaboration' && (
                <CollaborationGraph graph={collaborationGraph} />
              )}
              
              {activeTab === 'hierarchy' && (
                <HierarchyPanel coordination={hierarchyCoordination} />
              )}
              
              {activeTab === 'ensemble' && (
                <EnsemblePanel 
                  decision={ensembleDecision} 
                  proposals={proposals}
                />
              )}
              
              {activeTab === 'reflection' && (
                <ReflectionPanel reflection={agentReflection} />
              )}
              
              {activeTab === 'execution' && (
                <AgentProgressBars status={executionStatus} />
              )}
              
              {activeTab === 'messages' && (
                <MessageLogPanel log={messageBusLog} />
              )}
              
              {activeTab === 'pool' && (
                <AgentPoolManager
                  poolStatus={agentPoolStatus}
                  onSpawnAgent={onSpawnAgent}
                  onTerminateAgent={onTerminateAgent}
                />
              )}
              
              {activeTab === 'costs' && (
                <CostDashboard metrics={costMetrics} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Footer with feature info */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>AI Agent Orchestration</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-cyan-400">
                {tabs.find(t => t.id === activeTab)?.label} (Feature {tabs.find(t => t.id === activeTab)?.feature})
              </span>
            </div>
            <div className="text-xs text-neutral-500">
              12 orchestration modules loaded
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrchestrationDashboard;
