/**
 * Agent Orchestration Types
 * TypeScript interfaces for Features 1-15
 */

// Feature 3: Agent Personality
export type AgentPersonality = 'aggressive' | 'cautious' | 'innovative' | 'analytical' | 'strategic';

export interface PersonalityInfo {
  risk_tolerance: number;
  confidence_bias: number;
  creativity_boost: number;
  damage_modifier: number;
  defense_modifier: number;
  description: string;
  color: string;
  icon: string;
}

// Feature 6: Chain of Thought
export interface ThoughtStep {
  step_number: number;
  thought_type: 'observation' | 'analysis' | 'hypothesis' | 'decision';
  content: string;
  confidence: number;
  timestamp: string;
}

export interface ChainOfThought {
  agent_id: string;
  mission_context: string;
  steps: ThoughtStep[];
  final_conclusion: string;
  total_time_ms: number;
}

// Feature 5: Agent Metrics
export interface AgentMetrics {
  agent_id: string;
  agent_name: string;
  team: 'RED' | 'BLUE';
  personality: AgentPersonality;
  personality_info: PersonalityInfo;
  success_rate: number;
  total_missions: number;
  avg_response_time_ms: number;
  calibration_score: number;
  specialization_scores: Record<string, number>;
  collaboration_scores: Record<string, number>;
  total_tokens_used: number;
  total_cost_usd: number;
}

// Feature 1: Voting
export interface VoteBreakdown {
  performance: number;
  confidence: number;
  calibration: number;
  specialization: number;
  base_impact: number;
  personality_bias: number;
}

export interface AgentProposal {
  agent_id: string;
  agent_name: string;
  team: string;
  proposal_text: string;
  confidence: number;
  reasoning: string;
  estimated_impact: number;
  personality: AgentPersonality;
  personality_icon: string;
  chain_of_thought?: ChainOfThought;
  specialization_bonus: number;
  mitre_technique?: string;
  score?: number;
  breakdown?: VoteBreakdown;
}

export interface VoteResults {
  winner: AgentProposal;
  winner_score: number;
  all_votes: AgentProposal[];
  consensus_strength: number;
  vote_distribution: Record<string, number>;
  total_proposals: number;
  timestamp: string;
}

// Feature 4: Debate
export interface DebateRound {
  agent_id: string;
  agent_name: string;
  round_type: 'opening' | 'challenge' | 'rebuttal' | 'closing';
  statement: string;
  target_agent?: string;
  confidence: number;
  personality: AgentPersonality;
  personality_icon: string;
  timestamp: string;
}

// Feature 7: Collaboration Graph
export interface CollaborationNode {
  id: string;
  name: string;
  team: 'RED' | 'BLUE';
  success_rate: number;
  personality: AgentPersonality;
  color: string;
}

export interface CollaborationEdge {
  source: string;
  target: string;
  weight: number;
}

export interface CollaborationGraph {
  nodes: CollaborationNode[];
  edges: CollaborationEdge[];
}

// Feature 8: Hierarchy
export interface CoordinationInsight {
  agent_id: string;
  summary: string;
  quality_score: number;
  key_findings: string[];
}

export interface HierarchyCoordination {
  team: string;
  sub_agents_count: number;
  insights: CoordinationInsight[];
  average_quality: number;
  historical_context: string;
  recommendation: string;
  confidence: number;
  timestamp: string;
}

// Feature 10: Ensemble
export interface EnsembleDecision {
  mean_impact: number;
  mean_confidence: number;
  impact_variance: number;
  confidence_variance: number;
  agreement_score: number;
  recommendation: string;
  model_count: number;
}

// Feature 11: Reflection
export interface ReflectionImprovement {
  type: string;
  issue: string;
  suggestion: string;
}

export interface AgentReflection {
  agent_id: string;
  quality_score: number;
  improvements: ReflectionImprovement[];
  self_critique: string;
  confidence_adjustment: number;
  timestamp: string;
}

// Feature 12: Async Execution
export interface ActiveTask {
  task_id: string;
  agent_id: string;
  progress: number;
  elapsed_ms: number;
}

export interface ExecutionStatus {
  active_count: number;
  active_tasks: ActiveTask[];
  completed_count: number;
}

// Feature 13: Messages
export interface AgentMessage {
  from_agent: string;
  to_agent: string | null;
  channel: string;
  content: string;
  timestamp: string;
}

export interface MessageBusLog {
  messages: AgentMessage[];
  total_messages: number;
}

// Feature 14: Agent Pool
export interface PoolAgent {
  agent_id: string;
  personality: AgentPersonality;
  specialization: string;
  status: 'active' | 'busy' | 'idle';
  tasks_completed: number;
  spawned_at: string;
}

export interface AgentPoolStatus {
  total_agents: number;
  active_agents: number;
  agents: PoolAgent[];
}

// Feature 15: Cost Tracking
export interface ModelCost {
  model_name: string;
  input_tokens: number;
  output_tokens: number;
  total_cost: number;
  requests: number;
}

export interface AgentEfficiency {
  agent_id: string;
  avg_response_time_ms: number;
  cost_per_task: number;
  efficiency_score: number;
}

export interface CostMetrics {
  total_cost: number;
  total_tokens: number;
  total_requests: number;
  avg_response_time_ms: number;
  overall_efficiency: number;
  session_start: string;
  by_model: ModelCost[];
  agent_efficiency: AgentEfficiency[];
}

// Feature 2: Memory
export interface MissionEntry {
  id: string;
  mission_type: string;
  strategy: string;
  outcome: string;
  success: boolean;
  timestamp: string;
}

export interface MemoryStatus {
  total_missions: number;
  successful_count: number;
  failed_count: number;
  learned_patterns: Record<string, number>;
  recent_missions: MissionEntry[];
}

// Orchestrator State
export interface OrchestratorState {
  agent_count: number;
  agents: Record<string, AgentMetrics>;
  memory: MemoryStatus;
  voting_history_count: number;
  debate_history_count: number;
}
