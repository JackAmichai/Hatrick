/**
 * Orchestration Components Index
 * Export all AI Agent Orchestration visualization components
 * Features 1-15: AI Agent Orchestration Enhancements
 */

// Feature 1: Multi-Agent Voting
export { VotingPanel } from './VotingPanel';

// Feature 4: Agent Debate
export { AgentDebatePanel } from './AgentDebatePanel';

// Feature 5 & 9: Agent Metrics (Specialization & Calibration)
export { AgentMetricsPanel } from './AgentMetricsPanel';

// Feature 6: Chain of Thought
export { ChainOfThoughtPanel } from './ChainOfThoughtPanel';

// Feature 7: Collaboration Graph
export { CollaborationGraphPanel as CollaborationGraph } from './CollaborationGraph';

// Feature 8: Hierarchical Coordination
export { HierarchyPanel } from './HierarchyPanel';

// Feature 10: Multi-Model Ensemble
export { EnsemblePanel } from './EnsemblePanel';

// Feature 11: Self-Reflection Loop
export { ReflectionPanel } from './ReflectionPanel';

// Feature 12: Async Execution Progress
export { AgentProgressBars } from './AgentProgressBars';

// Feature 13: Communication Protocol
export { MessageLogPanel } from './MessageLogPanel';

// Feature 14: Dynamic Agent Spawning
export { AgentPoolManager } from './AgentPoolManager';

// Feature 15: Cost/Efficiency Dashboard
export { CostDashboard } from './CostDashboard';

// Main Dashboard (combines all features)
export { OrchestrationDashboard } from './OrchestrationDashboard';

// Re-export types for convenience
export type {
  AgentPersonality,
  PersonalityInfo,
  ThoughtStep,
  ChainOfThought,
  AgentMetrics,
  VoteBreakdown,
  AgentProposal,
  VoteResults,
  DebateRound,
  CollaborationNode,
  CollaborationEdge,
  CollaborationGraph as CollaborationGraphType,
  CoordinationInsight,
  HierarchyCoordination,
  EnsembleDecision,
  ReflectionImprovement,
  AgentReflection,
  ActiveTask,
  ExecutionStatus,
  AgentMessage,
  MessageBusLog,
  PoolAgent,
  AgentPoolStatus,
  ModelCost,
  AgentEfficiency,
  CostMetrics,
  MissionEntry,
  MemoryStatus,
  OrchestratorState,
} from '../../types/orchestration';
