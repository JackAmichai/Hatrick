/**
 * Cyber Security Dashboard
 * Main dashboard integrating all cyber security components
 * Features 16-20, 22-25, 27-35
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle,
  Activity,
  Target,
  Network,
  Search,
  BookOpen,
  Key,
  Mail,
  Radio,
  GitBranch,
  Globe,
  Box,
  Microscope,
  CheckSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

// Import types
import type {
  AttackTree,
  CVEEntry,
  MITRETechnique,
  ThreatIndicator,
  ThreatCampaign,
  ThreatIntelSummary,
  ScanResult,
  Incident,
  ComplianceScore,
  ComplianceControl,
  ForensicArtifact,
  SandboxResult,
  RiskScore,
  AttackSurfaceAsset,
  Credential,
  C2Channel,
  C2Beacon,
  PhishingCampaign,
  LateralMovementPath,
  NetworkSegmentationData,
  DefensePlaybook,
  ThreatHunt,
} from '../../types/cyber';

// Import all cyber components
import { AttackTreeVisualizer } from './AttackTreeVisualizer';
import { CVEPanel } from './CVEPanel';
import { MITREMatrix } from './MITREMatrix';
import { ThreatIntelPanel } from './ThreatIntelPanel';
import { VulnerabilityScanner } from './VulnerabilityScanner';
import { IncidentTimeline } from './IncidentTimeline';
import { ComplianceDashboard } from './ComplianceDashboard';
import { ForensicsModePanel } from './ForensicsModePanel';
import { SandboxPanel } from './SandboxPanel';
import { RiskScoringPanel } from './RiskScoringPanel';
import { AttackSurfacePanel } from './AttackSurfacePanel';
import { CredentialVaultPanel } from './CredentialVaultPanel';
import { C2SimulationPanel } from './C2SimulationPanel';
import { PhishingSimulationPanel } from './PhishingSimulationPanel';
import { LateralMovementPanel } from './LateralMovementPanel';
import { NetworkSegmentationPanel } from './NetworkSegmentationPanel';
import { DefensePlaybooksPanel } from './DefensePlaybooksPanel';
import { ThreatHuntingPanel } from './ThreatHuntingPanel';

// Tab configuration
const tabs = [
  { id: 'overview', name: 'Overview', icon: Shield, category: 'main' },
  { id: 'attack-tree', name: 'Attack Trees', icon: Target, category: 'analysis' },
  { id: 'cve', name: 'CVE Database', icon: AlertTriangle, category: 'analysis' },
  { id: 'mitre', name: 'MITRE ATT&CK', icon: Activity, category: 'analysis' },
  { id: 'threat-intel', name: 'Threat Intel', icon: Globe, category: 'analysis' },
  { id: 'vuln-scanner', name: 'Vuln Scanner', icon: Search, category: 'analysis' },
  { id: 'incident-timeline', name: 'Incidents', icon: Clock, category: 'response' },
  { id: 'compliance', name: 'Compliance', icon: CheckSquare, category: 'governance' },
  { id: 'forensics', name: 'Forensics', icon: Microscope, category: 'investigation' },
  { id: 'sandbox', name: 'Sandbox', icon: Box, category: 'investigation' },
  { id: 'risk-scoring', name: 'Risk Scoring', icon: Target, category: 'governance' },
  { id: 'attack-surface', name: 'Attack Surface', icon: Globe, category: 'analysis' },
  { id: 'credentials', name: 'Credentials', icon: Key, category: 'operations' },
  { id: 'c2-simulation', name: 'C2 Simulation', icon: Radio, category: 'simulation' },
  { id: 'phishing', name: 'Phishing Sim', icon: Mail, category: 'simulation' },
  { id: 'lateral-movement', name: 'Lateral Movement', icon: GitBranch, category: 'analysis' },
  { id: 'network-seg', name: 'Network Seg', icon: Network, category: 'operations' },
  { id: 'playbooks', name: 'Playbooks', icon: BookOpen, category: 'response' },
  { id: 'threat-hunting', name: 'Threat Hunting', icon: Search, category: 'investigation' },
];

const categories = [
  { id: 'main', name: 'Main' },
  { id: 'analysis', name: 'Analysis' },
  { id: 'response', name: 'Response' },
  { id: 'investigation', name: 'Investigation' },
  { id: 'simulation', name: 'Simulation' },
  { id: 'governance', name: 'Governance' },
  { id: 'operations', name: 'Operations' },
];

// Demo data generators (in real app, would come from backend)
const generateDemoData = () => ({
  attackTrees: [] as AttackTree[],
  cves: [] as CVEEntry[],
  mitreTechniques: [] as MITRETechnique[],
  threatIntel: { indicators: [] as ThreatIndicator[], campaigns: [] as ThreatCampaign[], summary: null as ThreatIntelSummary | null },
  vulnScanResults: [] as ScanResult[],
  incidents: [] as Incident[],
  compliance: { scores: [] as ComplianceScore[], controls: [] as ComplianceControl[] },
  forensicArtifacts: [] as ForensicArtifact[],
  sandboxResults: [] as SandboxResult[],
  riskScores: [] as RiskScore[],
  attackSurfaceAssets: [] as AttackSurfaceAsset[],
  credentials: [] as Credential[],
  c2Channels: [] as C2Channel[],
  c2Beacons: [] as C2Beacon[],
  phishingCampaigns: [] as PhishingCampaign[],
  lateralMovementPaths: [] as LateralMovementPath[],
  networkSegmentation: null as NetworkSegmentationData | null,
  playbooks: [] as DefensePlaybook[],
  threatHunts: [] as ThreatHunt[],
});

interface CyberDashboardProps {
  className?: string;
}

export const CyberDashboard = ({ className = '' }: CyberDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Demo data - in real app would come from API/props
  const data = generateDemoData();
  
  const renderActivePanel = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Quick stats cards */}
              <div className="p-4 bg-neutral-800/50 border border-neutral-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-sm text-neutral-400">Active Threats</div>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <div className="p-4 bg-neutral-800/50 border border-neutral-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-sm text-neutral-400">Open CVEs</div>
                  </div>
                  <Activity className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              <div className="p-4 bg-neutral-800/50 border border-neutral-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-sm text-neutral-400">Active Hunts</div>
                  </div>
                  <Search className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <div className="p-4 bg-neutral-800/50 border border-neutral-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-400">100%</div>
                    <div className="text-sm text-neutral-400">Compliance</div>
                  </div>
                  <CheckSquare className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-neutral-800/30 border border-neutral-700 rounded-lg text-center">
              <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">Cyber Security Command Center</h3>
              <p className="text-neutral-400 max-w-md mx-auto">
                Select a module from the sidebar to begin analyzing threats, 
                managing compliance, or running security simulations.
              </p>
            </div>
          </div>
        );
        
      case 'attack-tree':
        return <AttackTreeVisualizer tree={data.attackTrees?.[0] || null} />;
        
      case 'cve':
        return <CVEPanel cves={data.cves} />;
        
      case 'mitre':
        return <MITREMatrix techniques={data.mitreTechniques} />;
        
      case 'threat-intel':
        return (
          <ThreatIntelPanel 
            indicators={data.threatIntel.indicators}
            campaigns={data.threatIntel.campaigns}
            summary={data.threatIntel.summary}
          />
        );
        
      case 'vuln-scanner':
        return <VulnerabilityScanner targets={[]} results={data.vulnScanResults} stats={null} />;
        
      case 'incident-timeline':
        return <IncidentTimeline incidents={data.incidents} selectedIncident={null} />;
        
      case 'compliance':
        return <ComplianceDashboard scores={data.compliance?.scores || []} controls={[]} />;
        
      case 'forensics':
        return (
          <ForensicsModePanel 
            artifacts={data.forensicArtifacts}
            timeline={null}
          />
        );
        
      case 'sandbox':
        return <SandboxPanel results={data.sandboxResults} />;
        
      case 'risk-scoring':
        return (
          <RiskScoringPanel 
            scores={data.riskScores}
            matrixData={null}
          />
        );
        
      case 'attack-surface':
        return (
          <AttackSurfacePanel 
            assets={data.attackSurfaceAssets}
            metrics={null}
          />
        );
        
      case 'credentials':
        return (
          <CredentialVaultPanel 
            credentials={data.credentials}
            metrics={null}
          />
        );
        
      case 'c2-simulation':
        return (
          <C2SimulationPanel 
            channels={data.c2Channels}
            beacons={data.c2Beacons}
          />
        );
        
      case 'phishing':
        return (
          <PhishingSimulationPanel 
            campaigns={data.phishingCampaigns}
            metrics={null}
          />
        );
        
      case 'lateral-movement':
        return (
          <LateralMovementPanel 
            paths={data.lateralMovementPaths}
            metrics={null}
          />
        );
        
      case 'network-seg':
        return (
          <NetworkSegmentationPanel 
            data={data.networkSegmentation}
          />
        );
        
      case 'playbooks':
        return (
          <DefensePlaybooksPanel 
            playbooks={data.playbooks}
            executions={[]}
          />
        );
        
      case 'threat-hunting':
        return (
          <ThreatHuntingPanel 
            hunts={data.threatHunts}
            metrics={null}
          />
        );
        
      default:
        return (
          <div className="p-8 text-center text-neutral-400">
            Select a module from the sidebar
          </div>
        );
    }
  };
  
  return (
    <div className={`flex h-full bg-neutral-900 ${className}`}>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-neutral-800 rounded-lg"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>
      
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 60 : 240 }}
        className={`
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:relative z-40
          h-full bg-neutral-800/80 border-r border-neutral-700
          transition-transform md:transition-none
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyan-400" />
              <span className="font-bold text-white">Cyber Ops</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-neutral-700 rounded hidden md:block"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-neutral-400" />
            )}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="p-2 overflow-y-auto h-[calc(100%-60px)]">
          {categories.map(category => (
            <div key={category.id} className="mb-4">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-xs font-medium text-neutral-500 uppercase">
                  {category.name}
                </div>
              )}
              {tabs
                .filter(tab => tab.category === category.id)
                .map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1
                      transition-colors
                      ${activeTab === tab.id 
                        ? 'bg-cyan-500/20 text-cyan-400' 
                        : 'text-neutral-400 hover:bg-neutral-700/50 hover:text-white'
                      }
                    `}
                    title={sidebarCollapsed ? tab.name : undefined}
                  >
                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="text-sm truncate">{tab.name}</span>
                    )}
                  </button>
                ))
              }
            </div>
          ))}
        </nav>
      </motion.aside>
      
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderActivePanel()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CyberDashboard;
