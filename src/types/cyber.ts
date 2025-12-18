/**
 * Cyber Security Types
 * TypeScript interfaces for Features 16-20, 22-25, 27-35
 */

// =============================================================================
// Feature 16: Attack Tree Visualization
// =============================================================================

export type AttackNodeType = 'root' | 'and' | 'or' | 'leaf' | 'mitigation';

export interface AttackTreeNode {
  id: string;
  name: string;
  node_type: AttackNodeType;
  description: string;
  probability: number;
  impact: number;
  cost: number;
  mitre_technique: string | null;
  cve_ids: string[];
  children: string[];
  mitigations: string[];
  status: 'active' | 'mitigated' | 'in_progress';
}

export interface AttackTree {
  id: string;
  name: string;
  target: string;
  root_id: string | null;
  risk_score: number;
  nodes: Record<string, AttackTreeNode>;
  created_at: string;
}

// =============================================================================
// Feature 17: CVE Integration
// =============================================================================

export type CVESeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Exploitability = 'unproven' | 'poc' | 'active';

export interface CVEEntry {
  cve_id: string;
  description: string;
  severity: CVESeverity;
  cvss_score: number;
  cvss_vector: string;
  affected_products: string[];
  published_date: string;
  modified_date: string;
  references: string[];
  exploitability: Exploitability;
  patch_available: boolean;
  mitre_techniques: string[];
}

// =============================================================================
// Feature 18: MITRE ATT&CK
// =============================================================================

export type MITRETactic = 
  | 'Reconnaissance' 
  | 'Resource Development' 
  | 'Initial Access'
  | 'Execution' 
  | 'Persistence' 
  | 'Privilege Escalation'
  | 'Defense Evasion' 
  | 'Credential Access' 
  | 'Discovery'
  | 'Lateral Movement' 
  | 'Collection' 
  | 'Command and Control'
  | 'Exfiltration' 
  | 'Impact';

export interface MITRETechnique {
  technique_id: string;
  name: string;
  tactic: MITRETactic;
  description: string;
  platforms: string[];
  detection: string;
  mitigation: string;
  data_sources: string[];
  sub_techniques: string[];
  url: string;
}

export interface MITREAttackPath {
  techniques: MITRETechnique[];
  by_tactic: Record<MITRETactic, MITRETechnique[]>;
}

// =============================================================================
// Feature 19: Threat Intelligence
// =============================================================================

export type IndicatorType = 'ip' | 'domain' | 'hash' | 'url' | 'email';
export type ThreatType = 'malware' | 'phishing' | 'c2' | 'apt';
export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low';
export type Motivation = 'financial' | 'espionage' | 'disruption' | 'hacktivism';

export interface ThreatIndicator {
  id: string;
  indicator_type: IndicatorType;
  value: string;
  threat_type: ThreatType;
  confidence: number;
  severity: ThreatSeverity;
  source: string;
  first_seen: string;
  last_seen: string;
  tags: string[];
  related_campaigns: string[];
  mitre_techniques: string[];
}

export interface ThreatCampaign {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  motivation: Motivation;
  target_sectors: string[];
  target_regions: string[];
  active: boolean;
  first_seen: string;
  last_activity: string;
  techniques: string[];
  indicators: string[];
}

export interface ThreatIntelSummary {
  total_indicators: number;
  by_type: Record<IndicatorType, number>;
  by_severity: Record<ThreatSeverity, number>;
  active_campaigns: number;
  total_campaigns: number;
}

// =============================================================================
// Feature 20: Vulnerability Scanner
// =============================================================================

export type ScanTargetType = 'host' | 'network' | 'application' | 'container';
export type ScanStatus = 'pending' | 'scanning' | 'completed' | 'error';
export type VulnSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface ScanTarget {
  id: string;
  target_type: ScanTargetType;
  address: string;
  name: string;
  os: string | null;
  services: string[];
  last_scan: string | null;
  status: ScanStatus;
}

export interface Vulnerability {
  id: string;
  target_id: string;
  name: string;
  description: string;
  severity: VulnSeverity;
  cvss_score: number;
  cve_ids: string[];
  affected_component: string;
  port: number | null;
  protocol: string | null;
  solution: string;
  references: string[];
  discovered_at: string;
  verified: boolean;
  false_positive: boolean;
}

export interface ScanResult {
  scan_id: string;
  target_id: string;
  start_time: string;
  end_time: string | null;
  status: 'running' | 'completed' | 'failed';
  vulnerabilities: Vulnerability[];
  summary: Record<VulnSeverity | 'total', number>;
}

export interface VulnerabilityStats {
  total: number;
  by_severity: Record<VulnSeverity, number>;
  with_cve: number;
  verified: number;
  false_positives: number;
  targets_scanned: number;
}

// =============================================================================
// Feature 22: Incident Timeline
// =============================================================================

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  event_type: string;
  description: string;
  source: string;
  severity: IncidentSeverity;
  indicators: string[];
  mitre_techniques: string[];
  evidence: string[];
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
  events: TimelineEvent[];
  affected_assets: string[];
  indicators: string[];
  mitre_techniques: string[];
}

// =============================================================================
// Feature 23: Compliance Dashboard
// =============================================================================

export type ComplianceFramework = 'NIST' | 'ISO27001' | 'PCI-DSS' | 'HIPAA' | 'SOC2' | 'GDPR';
export type ComplianceStatus = 'compliant' | 'partial' | 'non-compliant' | 'not-assessed';

export interface ComplianceControl {
  id: string;
  framework: ComplianceFramework;
  control_id: string;
  name: string;
  description: string;
  status: ComplianceStatus;
  evidence: string[];
  last_assessed: string;
  findings: string[];
  remediation: string | null;
}

export interface ComplianceScore {
  framework: ComplianceFramework;
  total_controls: number;
  compliant: number;
  partial: number;
  non_compliant: number;
  not_assessed: number;
  score_percentage: number;
}

// =============================================================================
// Feature 24: Forensics Mode
// =============================================================================

export type ArtifactType = 'file' | 'registry' | 'memory' | 'network' | 'log' | 'process';

export interface ForensicArtifact {
  id: string;
  artifact_type: ArtifactType;
  name: string;
  path: string;
  hash_md5: string | null;
  hash_sha256: string | null;
  size_bytes: number;
  created_at: string;
  modified_at: string;
  collected_at: string;
  tags: string[];
  analysis_notes: string;
  is_malicious: boolean | null;
}

export interface ForensicTimeline {
  events: Array<{
    timestamp: string;
    artifact_id: string;
    action: string;
    details: string;
  }>;
  start_time: string;
  end_time: string;
}

// =============================================================================
// Feature 25: Sandbox Integration
// =============================================================================

export type SandboxStatus = 'pending' | 'running' | 'completed' | 'failed' | 'timeout';

export interface SandboxSubmission {
  id: string;
  file_name: string;
  file_hash: string;
  file_type: string;
  submitted_at: string;
  status: SandboxStatus;
  environment: string;
  timeout_seconds: number;
}

export interface SandboxBehavior {
  category: string;
  description: string;
  severity: 'malicious' | 'suspicious' | 'benign';
  indicators: string[];
}

export interface SandboxResult {
  submission_id: string;
  verdict: 'malicious' | 'suspicious' | 'clean' | 'unknown';
  score: number;
  behaviors: SandboxBehavior[];
  network_connections: Array<{
    destination: string;
    port: number;
    protocol: string;
  }>;
  dropped_files: Array<{
    name: string;
    hash: string;
    path: string;
  }>;
  registry_changes: string[];
  process_tree: Array<{
    pid: number;
    name: string;
    parent_pid: number;
    command_line: string;
  }>;
  mitre_techniques: string[];
  completed_at: string;
}

// =============================================================================
// Feature 27: Risk Scoring
// =============================================================================

export interface RiskFactor {
  id: string;
  name: string;
  category: string;
  weight: number;
  current_value: number;
  max_value: number;
  description: string;
  mitigations: string[];
}

export interface RiskScore {
  overall_score: number;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  factors: RiskFactor[];
  trend: 'increasing' | 'stable' | 'decreasing';
  last_updated: string;
}

// =============================================================================
// Feature 28: Attack Surface Visualization
// =============================================================================

export interface AttackSurfaceAsset {
  id: string;
  name: string;
  asset_type: string;
  exposure: 'external' | 'internal' | 'dmz';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  open_ports: number[];
  services: string[];
  vulnerabilities_count: number;
  risk_score: number;
}

export interface AttackSurface {
  total_assets: number;
  external_assets: number;
  internal_assets: number;
  total_open_ports: number;
  total_vulnerabilities: number;
  assets: AttackSurfaceAsset[];
  high_risk_assets: AttackSurfaceAsset[];
}

// =============================================================================
// Feature 29: Credential Vault
// =============================================================================

export interface StoredCredential {
  id: string;
  name: string;
  credential_type: 'password' | 'ssh_key' | 'api_key' | 'certificate';
  username: string | null;
  target_system: string;
  created_at: string;
  last_used: string | null;
  expires_at: string | null;
  rotation_policy_days: number | null;
  is_compromised: boolean;
}

// =============================================================================
// Feature 30: C2 Simulation
// =============================================================================

export interface C2Beacon {
  id: string;
  target_host: string;
  callback_url: string;
  protocol: string;
  interval_seconds: number;
  jitter_percent: number;
  status: 'active' | 'dormant' | 'lost';
  last_callback: string;
  commands_executed: number;
}

export interface C2Command {
  id: string;
  beacon_id: string;
  command_type: string;
  command: string;
  status: 'pending' | 'sent' | 'executed' | 'failed';
  output: string | null;
  sent_at: string;
  completed_at: string | null;
}

// =============================================================================
// Feature 31: Phishing Simulation
// =============================================================================

export interface PhishingCampaign {
  id: string;
  name: string;
  template_name: string;
  sender_email: string;
  target_count: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  submitted_count: number;
  reported_count: number;
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  created_at: string;
  launched_at: string | null;
  completed_at: string | null;
}

export interface PhishingStats {
  total_campaigns: number;
  total_targets: number;
  overall_click_rate: number;
  overall_report_rate: number;
  high_risk_users: number;
}

// =============================================================================
// Feature 32: Lateral Movement Tracker
// =============================================================================

export interface LateralMovement {
  id: string;
  source_host: string;
  destination_host: string;
  technique: string;
  mitre_technique: string;
  timestamp: string;
  success: boolean;
  credentials_used: string | null;
  detected: boolean;
}

export interface LateralMovementPath {
  steps: LateralMovement[];
  total_hops: number;
  start_host: string;
  end_host: string;
  techniques_used: string[];
}

// =============================================================================
// Feature 33: Network Segmentation
// =============================================================================

export interface NetworkSegment {
  id: string;
  name: string;
  vlan_id: number | null;
  cidr: string;
  zone: 'trust' | 'untrust' | 'dmz' | 'internal';
  assets_count: number;
  allowed_inbound: string[];
  allowed_outbound: string[];
  isolation_score: number;
}

export interface SegmentationMatrix {
  segments: NetworkSegment[];
  connections: Array<{
    source: string;
    destination: string;
    allowed: boolean;
    ports: number[];
  }>;
}

// =============================================================================
// Feature 34: Defense Playbooks
// =============================================================================

export interface PlaybookStep {
  step_number: number;
  action: string;
  description: string;
  automated: boolean;
  tool: string | null;
  expected_outcome: string;
}

export interface DefensePlaybook {
  id: string;
  name: string;
  description: string;
  trigger_conditions: string[];
  mitre_techniques: string[];
  severity: IncidentSeverity;
  steps: PlaybookStep[];
  estimated_time_minutes: number;
  last_executed: string | null;
  success_rate: number;
}

// =============================================================================
// Feature 35: Threat Hunting
// =============================================================================

export interface HuntingHypothesis {
  id: string;
  name: string;
  description: string;
  mitre_techniques: string[];
  data_sources: string[];
  queries: Array<{
    platform: string;
    query: string;
  }>;
  status: 'active' | 'validated' | 'disproved';
  findings: string[];
  created_at: string;
}

export interface HuntingResult {
  hypothesis_id: string;
  timestamp: string;
  matches_found: number;
  sample_results: Array<{
    source: string;
    data: Record<string, unknown>;
  }>;
  risk_indicators: string[];
}

// =============================================================================
// Combined Cyber Dashboard State
// =============================================================================

export interface CyberDashboardState {
  // Feature 16
  attackTrees: AttackTree[];
  selectedTree: AttackTree | null;
  
  // Feature 17
  cveDatabase: CVEEntry[];
  cveSearch: string;
  
  // Feature 18
  mitreTechniques: MITRETechnique[];
  activeAttackPath: MITREAttackPath | null;
  
  // Feature 19
  threatIndicators: ThreatIndicator[];
  threatCampaigns: ThreatCampaign[];
  threatIntelSummary: ThreatIntelSummary | null;
  
  // Feature 20
  scanTargets: ScanTarget[];
  scanResults: ScanResult[];
  vulnerabilityStats: VulnerabilityStats | null;
  
  // Feature 22
  incidents: Incident[];
  selectedIncident: Incident | null;
  
  // Feature 23
  complianceScores: ComplianceScore[];
  complianceControls: ComplianceControl[];
  
  // Feature 24
  forensicArtifacts: ForensicArtifact[];
  forensicTimeline: ForensicTimeline | null;
  
  // Feature 25
  sandboxSubmissions: SandboxSubmission[];
  sandboxResults: Record<string, SandboxResult>;
  
  // Feature 27
  riskScore: RiskScore | null;
  
  // Feature 28
  attackSurface: AttackSurface | null;
  
  // Feature 29
  credentials: StoredCredential[];
  
  // Feature 30
  c2Beacons: C2Beacon[];
  c2Commands: C2Command[];
  
  // Feature 31
  phishingCampaigns: PhishingCampaign[];
  phishingStats: PhishingStats | null;
  
  // Feature 32
  lateralMovements: LateralMovement[];
  movementPaths: LateralMovementPath[];
  
  // Feature 33
  networkSegments: NetworkSegment[];
  segmentationMatrix: SegmentationMatrix | null;
  
  // Feature 34
  playbooks: DefensePlaybook[];
  
  // Feature 35
  huntingHypotheses: HuntingHypothesis[];
  huntingResults: HuntingResult[];
}
