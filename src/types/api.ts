// Type Definitions for HatTrick Platform
// This file contains all shared type definitions to replace 'any' types

// ==================== API Response Types ====================

export interface DeceptionStatus {
  honeypots_deployed: number;
  decoys_active: number;
  interactions_detected: number;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  total_decoys?: number;
  alerts_triggered?: number;
  deployed_decoys?: Array<{
    name: string;
    type: string;
    status: string;
    service?: string;
    purpose?: string;
    location?: string;
  }>;
  recent_interactions: Array<{
    timestamp: string;
    source_ip: string;
    honeypot_type: string;
    action: string;
  }>;
}

export interface ZeroTrustPolicies {
  total_policies: number;
  active_policies: number;
  microsegments: number;
  trust_score?: number;
  policies: Array<{
    name: string;
    type: string;
    status: 'active' | 'inactive';
    devices_covered: number;
  }>;
}

export interface NetworkSegmentation {
  zones: Array<{
    name: string;
    trust_level: 'dmz' | 'public' | 'production' | 'development' | 'restricted';
    assets: number;
    firewall_rules: number;
  }>;
  total_zones: number;
  segmentation_score: number;
}

export interface ThreatIntelligence {
  feeds_active: number;
  iocs_detected: number;
  threat_score: number;
  indicators_of_compromise?: Array<{
    type: string;
    value: string;
    severity: string;
    threat_level?: string;
    associated_malware?: string;
    associated_campaign?: string;
  }>;
  latest_cves?: Array<{
    id: string;
    cve_id?: string;
    severity: string;
    description: string;
    cvss_score?: number;
  }>;
  latest_threats: Array<{
    name: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    source: string;
    indicators: string[];
  }>;
}

export interface ComplianceStatus {
  framework: 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'SOC2';
  compliance_score: number;
  overall_score?: number;
  passed_controls: number;
  failed_controls: number;
  pending_controls: number;
  last_audit: string;
  compliance_status?: Array<{
    control: string;
    status: string;
    description: string;
    requirement?: string;
  }>;
  findings: Array<{
    control_id: string;
    status: 'pass' | 'fail' | 'pending';
    description: string;
  }>;
}

// ==================== Dashboard Data Types ====================

export interface DLPStatus {
  prevention_rate: number;
  violations?: Array<{
    type: string;
    severity: string;
    user: string;
    timestamp: string;
    blocked?: boolean;
    action?: string;
    location?: string;
  }>;
}

export interface IOTDevices {
  total_devices: number;
  vulnerable_devices: number;
  devices?: Array<{
    name: string;
    type: string;
    risk_score: number;
  }>;
}

export interface CloudMisconfigurations {
  total_resources: number;
  misconfigurations: number;
  issues?: Array<{
    service: string;
    severity: string;
    description: string;
  }>;
}

export interface DashboardData {
  deception?: DeceptionStatus;
  zeroTrust?: ZeroTrustPolicies;
  network?: NetworkSegmentation;
  threatIntel?: ThreatIntelligence;
  compliance?: ComplianceStatus;
  dlp?: DLPStatus;
  iot?: IOTDevices;
  cloud?: CloudMisconfigurations;
}

// ==================== Agent Types ====================

export interface AgentProposal {
  agent_id: string;
  agent_name: string;
  proposal: string;
  confidence: number;
  reasoning: string[];
  vote: 'approve' | 'reject' | 'abstain';
}

export interface DebateRound {
  round: number;
  proposals: AgentProposal[];
  winner?: string;
  consensus_reached: boolean;
}

export interface VoteResults {
  total_votes: number;
  approve: number;
  reject: number;
  abstain: number;
  winner: {
    agent_name: string;
    proposal_text: string;
    confidence: number;
  } | null;
  proposals: Array<{
    agent: string;
    proposal: string;
  }>;
  consensus_strength: number;
}

// ==================== WebSocket Message Types ====================

export interface WebSocketMessage {
  type: string;
  agent?: string;
  text?: string;
  status?: string;
  team?: 'RED' | 'BLUE';
  data?: Record<string, unknown>;
}

export interface GameState {
  mission: string;
  phase: 'scanning' | 'attacking' | 'defending' | 'complete';
  redScore: number;
  blueScore: number;
  serverHealth: number;
}

// ==================== Component Props Types ====================

export interface APTProfile {
  id: string;
  name: string;
  description: string;
  sophistication: string;
  origin: string;
  targets: string;
  notable_campaigns: string[];
  mitre_tactics: number;
}

export interface PenTestReport {
  executive_summary: {
    overview: string;
    risk_score: number;
    critical_findings: number;
    high_findings: number;
    medium_findings: number;
  };
  technical_findings: Array<{
    finding_id: string;
    title: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    cvss: number;
    cwe: string;
    description: string;
    proof_of_concept: string;
    affected_systems: string[];
    remediation: string;
  }>;
  mitre_attack_mapping: {
    techniques_observed: number;
    tactics: string[];
  };
  owasp_analysis: Record<string, number>;
  remediation_roadmap: {
    phase_1: {
      duration: string;
      cost: string;
      actions: string[];
    };
    phase_2: {
      duration: string;
      cost: string;
      actions: string[];
    };
    phase_3: {
      duration: string;
      cost: string;
      actions: string[];
    };
  };
  compliance_mapping: Record<string, unknown>;
}

// ==================== Mission Types ====================

export interface MissionResult {
  mission: string;
  success: boolean;
  vulnerabilities_found: number;
  cvss_scores?: number[];
  duration?: number;
  attack_success_rate?: number;
  defense_effectiveness?: number;
}

// ==================== Utility Types ====================

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AttackPhase = 'reconnaissance' | 'initial_access' | 'execution' | 'persistence' | 
                          'privilege_escalation' | 'defense_evasion' | 'credential_access' | 
                          'discovery' | 'lateral_movement' | 'collection' | 'command_and_control' | 
                          'exfiltration' | 'impact';

export interface Vulnerability {
  id: string;
  name: string;
  severity: Severity;
  cvss: number;
  cwe: string;
  description: string;
  affected_systems: string[];
}

export interface DefensePatch {
  id: string;
  vulnerability_id: string;
  patch_type: 'code_fix' | 'configuration' | 'policy_update';
  before: string;
  after: string;
  effectiveness: number;
  deployed: boolean;
}
