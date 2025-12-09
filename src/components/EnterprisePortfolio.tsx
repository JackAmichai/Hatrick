/**
 * Enterprise Portfolio Dashboard - Showcases all advanced features
 * Provides tabbed interface for different visualization modes
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NetworkTopology3D } from './NetworkTopology3D';
import { HeatMapScanner } from './HeatMapScanner';
import { PacketAnimation } from './PacketAnimation';
import { AttackImpactPredictor } from './AttackImpactPredictor';
import { CostOptimizationDashboard } from './CostOptimizationDashboard';
import { CodeDiffViewer, SAMPLE_DIFFS } from './CodeDiffViewer';

interface EnterprisePortfolioProps {
  missionCount: number;
  currentMission: string;
  attackInProgress: boolean;
}

type TabId = '3d-topology' | 'heat-map' | 'packet-flow' | 'impact-predictor' | 'cost-optimization' | 'code-diff';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  description: string;
}

const TABS: Tab[] = [
  {
    id: '3d-topology',
    label: '3D Network Topology',
    icon: '🌐',
    description: 'Interactive 3D visualization of network infrastructure and attack paths'
  },
  {
    id: 'heat-map',
    label: 'Heat Map Scanner',
    icon: '🔥',
    description: 'Real-time vulnerability heat map with auto-scanning'
  },
  {
    id: 'packet-flow',
    label: 'Packet Animation',
    icon: '📡',
    description: 'Live network traffic visualization with threat detection'
  },
  {
    id: 'impact-predictor',
    label: 'Impact Predictor',
    icon: '🎯',
    description: 'AI-powered attack damage forecasting and mitigation planning'
  },
  {
    id: 'cost-optimization',
    label: 'Cost Dashboard',
    icon: '💰',
    description: 'LLM API cost tracking and ROI analysis'
  },
  {
    id: 'code-diff',
    label: 'Code Diff Viewer',
    icon: '🔧',
    description: 'Security patches and vulnerability fixes'
  }
];

const EnterprisePortfolio: React.FC<EnterprisePortfolioProps> = ({
  missionCount,
  currentMission,
  attackInProgress
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('3d-topology');
  const [showAPTProfiles, setShowAPTProfiles] = useState(false);
  const [aptProfiles, setAptProfiles] = useState<any[]>([]);
  const [selectedDiff, setSelectedDiff] = useState<keyof typeof SAMPLE_DIFFS>('SQL_INJECTION');

  // Fetch APT profiles from backend
  useEffect(() => {
    fetch('http://localhost:8000/api/apt-profiles')
      .then(res => res.json())
      .then(data => setAptProfiles(data.profiles || []))
      .catch(err => console.error('Failed to load APT profiles:', err));
  }, []);

  const handleGenerateAPTScenario = async (aptId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/apt-profiles/${aptId}/scenario`, {
        method: 'POST'
      });
      const scenario = await response.json();
      console.log('Generated APT scenario:', scenario);
      alert(`APT scenario generated! Check console for details.`);
    } catch (error) {
      console.error('Failed to generate APT scenario:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/reports/pentest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: 'Demo Client',
          engagement_type: 'Black Box',
          test_dates: '2025-01-01 to 2025-01-15',
          mission_results: [
            { mission: currentMission, success: true, vulnerabilities_found: 5 }
          ]
        })
      });
      const report = await response.json();
      console.log('Generated pen test report:', report);
      
      // Download as JSON
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pentest-report-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      alert('Penetration test report downloaded!');
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case '3d-topology':
        return <NetworkTopology3D />;
      case 'heat-map':
        return <HeatMapScanner />;
      case 'packet-flow':
        return <PacketAnimation isAttacking={attackInProgress} attackType={currentMission} />;
      case 'impact-predictor':
        return (
          <AttackImpactPredictor
            attackType={currentMission}
            targetSystem="Production Server"
            onPredictionComplete={(prediction) => console.log('Impact prediction:', prediction)}
          />
        );
      case 'cost-optimization':
        return <CostOptimizationDashboard missionCount={missionCount} />;
      case 'code-diff':
        return (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              {Object.keys(SAMPLE_DIFFS).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedDiff(key as keyof typeof SAMPLE_DIFFS)}
                  className={`px-4 py-2 rounded transition-colors ${
                    selectedDiff === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {key.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <CodeDiffViewer 
              diff={SAMPLE_DIFFS[selectedDiff]} 
              isOpen={true} 
              onClose={() => {}} 
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white p-6 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500">
              HatTrick Enterprise Portfolio
            </span>
          </h1>
          <p className="text-gray-400">
            Advanced AI-Powered Cybersecurity Testing Platform
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowAPTProfiles(!showAPTProfiles)}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
          >
            🎭 APT Profiles ({aptProfiles.length})
          </button>
          
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
          >
            📄 Generate Report
          </button>
        </div>
      </div>

      {/* APT Profiles Panel */}
      <AnimatePresence>
        {showAPTProfiles && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-gradient-to-br from-red-900/30 to-purple-900/30 rounded-lg border border-red-500/30"
          >
            <h3 className="text-xl font-bold mb-3 text-red-400">🎭 Advanced Persistent Threat Profiles</h3>
            <div className="grid grid-cols-2 gap-3">
              {aptProfiles.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 bg-black/40 rounded-lg border border-red-500/20 hover:border-red-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-red-300">{apt.name}</h4>
                      <p className="text-xs text-gray-400">{apt.origin} • {apt.sophistication}</p>
                    </div>
                    <button
                      onClick={() => handleGenerateAPTScenario(apt.id)}
                      className="px-2 py-1 text-xs bg-red-600 rounded hover:bg-red-700 transition-colors"
                    >
                      Load Scenario
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{apt.description}</p>
                  <div className="text-xs text-gray-500">
                    <strong>Targets:</strong> {apt.targets}
                  </div>
                  <div className="text-xs text-gray-500">
                    <strong>Notable:</strong> {apt.notable_campaigns.slice(0, 2).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative px-6 py-3 rounded-lg transition-all whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{tab.icon}</span>
              <div className="text-left">
                <div className="font-semibold">{tab.label}</div>
                {activeTab === tab.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs text-gray-300 mt-1"
                  >
                    {tab.description}
                  </motion.div>
                )}
              </div>
            </div>
            
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 border-t border-gray-800 pt-4">
        <div className="flex gap-6">
          <div>
            <strong className="text-gray-400">Current Mission:</strong> {currentMission}
          </div>
          <div>
            <strong className="text-gray-400">Total Missions:</strong> {missionCount}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${attackInProgress ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-gray-400">
              {attackInProgress ? 'Attack In Progress' : 'System Idle'}
            </span>
          </div>
        </div>
        
        <div className="text-gray-600">
          HatTrick v2.0 • Enterprise Grade • AI-Powered
        </div>
      </div>
    </div>
  );
};

export default EnterprisePortfolio;
