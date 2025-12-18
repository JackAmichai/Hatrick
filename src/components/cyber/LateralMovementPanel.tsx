/**
 * Feature 32: Lateral Movement Visualization
 * Visualize lateral movement paths and attack progression
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  Server,
  User,
  Key,
  Shield,
  AlertTriangle,
  Clock,
  ArrowRight,
  Circle,
  ChevronDown,
  ChevronRight,
  Eye,
  Zap
} from 'lucide-react';
import type { 
  MovementTechnique,
  NodeType,
  LateralMovementPath,
  MovementNode,
  MovementMetrics 
} from '../../types/cyber';

interface LateralMovementPanelProps {
  paths: LateralMovementPath[];
  metrics: MovementMetrics | null;
  onPathClick?: (pathId: string) => void;
  onNodeClick?: (nodeId: string) => void;
}

const techniqueColors: Record<MovementTechnique, string> = {
  pass_the_hash: 'text-red-400 bg-red-500/20',
  pass_the_ticket: 'text-orange-400 bg-orange-500/20',
  psexec: 'text-amber-400 bg-amber-500/20',
  wmi: 'text-yellow-400 bg-yellow-500/20',
  ssh: 'text-green-400 bg-green-500/20',
  rdp: 'text-blue-400 bg-blue-500/20',
  smb: 'text-purple-400 bg-purple-500/20',
  dcom: 'text-pink-400 bg-pink-500/20',
  winrm: 'text-cyan-400 bg-cyan-500/20',
};

const nodeTypeIcons: Record<NodeType, typeof Server> = {
  workstation: Server,
  server: Server,
  domain_controller: Shield,
  database: Server,
  web_server: Server,
  file_server: Server,
};

const nodeTypeColors: Record<NodeType, string> = {
  workstation: 'text-blue-400 bg-blue-500/20',
  server: 'text-green-400 bg-green-500/20',
  domain_controller: 'text-red-400 bg-red-500/20',
  database: 'text-purple-400 bg-purple-500/20',
  web_server: 'text-cyan-400 bg-cyan-500/20',
  file_server: 'text-amber-400 bg-amber-500/20',
};

const MovementNodeBadge = ({ node }: { node: MovementNode }) => {
  const Icon = nodeTypeIcons[node.node_type];
  
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
      node.is_compromised 
        ? 'bg-red-500/10 border-red-500/30' 
        : 'bg-neutral-800/50 border-neutral-700'
    }`}>
      <div className={`p-1.5 rounded ${nodeTypeColors[node.node_type]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-sm font-medium text-white">{node.hostname}</div>
        <div className="text-xs text-neutral-500">{node.ip_address}</div>
      </div>
      {node.is_compromised && (
        <AlertTriangle className="w-4 h-4 text-red-400 ml-auto" />
      )}
    </div>
  );
};

const PathVisualization = ({ path }: { path: LateralMovementPath }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {path.nodes.map((node, index) => (
        <div key={node.id} className="flex items-center gap-2 flex-shrink-0">
          <MovementNodeBadge node={node} />
          {index < path.nodes.length - 1 && (
            <div className="flex flex-col items-center">
              <span className={`px-2 py-0.5 rounded text-xs ${techniqueColors[path.techniques[index] || 'smb']}`}>
                {path.techniques[index]?.replace(/_/g, ' ') || 'unknown'}
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-500 mt-1" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const PathCard = ({ 
  path, 
  onClick 
}: { 
  path: LateralMovementPath; 
  onClick?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const compromisedCount = path.nodes.filter(n => n.is_compromised).length;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        path.risk_level >= 8 
          ? 'bg-red-500/10 border-red-500/30' 
          : path.risk_level >= 5
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-neutral-800/50 border-neutral-700'
      }`}
    >
      <div 
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              path.risk_level >= 8 ? 'bg-red-500/30 text-red-400' :
              path.risk_level >= 5 ? 'bg-amber-500/30 text-amber-400' :
              'bg-green-500/30 text-green-400'
            }`}>
              Risk: {path.risk_level}/10
            </span>
            {path.is_active && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs animate-pulse">
                <Zap className="w-3 h-3" />
                Active
              </span>
            )}
            {compromisedCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                {compromisedCount} compromised
              </span>
            )}
          </div>
          
          <h4 className="font-medium text-white mb-1">{path.name}</h4>
          <p className="text-sm text-neutral-400">{path.description}</p>
          
          {/* Quick info */}
          <div className="flex gap-4 mt-2 text-xs text-neutral-500">
            <span>{path.nodes.length} nodes</span>
            <span>{path.techniques.length} techniques</span>
            <span>Detected: {new Date(path.detected_at).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          )}
        </div>
      </div>
      
      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-neutral-700 space-y-4"
          >
            {/* Path visualization */}
            <div>
              <h5 className="text-sm font-medium text-white mb-3">Attack Path</h5>
              <PathVisualization path={path} />
            </div>
            
            {/* Credentials used */}
            {path.credentials_used.length > 0 && (
              <div>
                <h5 className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  Credentials Used
                </h5>
                <div className="flex flex-wrap gap-1">
                  {path.credentials_used.map(cred => (
                    <span key={cred} className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">
                      {cred}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Techniques breakdown */}
            <div>
              <h5 className="text-sm font-medium text-white mb-2">Techniques Used</h5>
              <div className="flex flex-wrap gap-1">
                {[...new Set(path.techniques)].map(technique => (
                  <span key={technique} className={`px-2 py-0.5 rounded text-xs ${techniqueColors[technique]}`}>
                    {technique.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
            
            {/* MITRE mapping */}
            {path.mitre_techniques.length > 0 && (
              <div>
                <h5 className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  MITRE ATT&CK
                </h5>
                <div className="flex flex-wrap gap-1">
                  {path.mitre_techniques.map(technique => (
                    <span key={technique} className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-mono">
                      {technique}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const LateralMovementPanel = ({ 
  paths, 
  metrics,
  onPathClick,
  onNodeClick 
}: LateralMovementPanelProps) => {
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'high' | 'medium' | 'low'>('ALL');
  const [activeOnly, setActiveOnly] = useState(false);
  
  const filteredPaths = useMemo(() => {
    return paths.filter(p => {
      const matchesRisk = riskFilter === 'ALL' ||
        (riskFilter === 'high' && p.risk_level >= 8) ||
        (riskFilter === 'medium' && p.risk_level >= 5 && p.risk_level < 8) ||
        (riskFilter === 'low' && p.risk_level < 5);
      const matchesActive = !activeOnly || p.is_active;
      return matchesRisk && matchesActive;
    }).sort((a, b) => b.risk_level - a.risk_level);
  }, [paths, riskFilter, activeOnly]);
  
  const stats = useMemo(() => ({
    total: paths.length,
    active: paths.filter(p => p.is_active).length,
    highRisk: paths.filter(p => p.risk_level >= 8).length,
    totalNodes: paths.reduce((sum, p) => sum + p.nodes.length, 0),
    compromisedNodes: paths.reduce((sum, p) => sum + p.nodes.filter(n => n.is_compromised).length, 0),
  }), [paths]);
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Lateral Movement</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {stats.active > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-sm animate-pulse">
              <Zap className="w-3 h-3" />
              {stats.active} Active
            </span>
          )}
        </div>
      </div>
      
      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-white">{metrics.total_paths}</div>
            <div className="text-xs text-neutral-500">Attack Paths</div>
          </div>
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{metrics.compromised_hosts}</div>
            <div className="text-xs text-neutral-500">Compromised Hosts</div>
          </div>
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-amber-400">{metrics.credentials_captured}</div>
            <div className="text-xs text-neutral-500">Credentials Captured</div>
          </div>
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className={`text-2xl font-bold ${
              metrics.avg_risk_score >= 7 ? 'text-red-400' : 
              metrics.avg_risk_score >= 4 ? 'text-amber-400' : 
              'text-green-400'
            }`}>
              {metrics.avg_risk_score.toFixed(1)}
            </div>
            <div className="text-xs text-neutral-500">Avg Risk Score</div>
          </div>
        </div>
      )}
      
      {/* Top techniques */}
      {metrics && metrics.top_techniques.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-neutral-400 mb-2">Top Techniques</h5>
          <div className="flex flex-wrap gap-2">
            {metrics.top_techniques.map(technique => (
              <span key={technique} className={`px-2 py-1 rounded text-xs ${techniqueColors[technique] || 'bg-neutral-700 text-neutral-300'}`}>
                {technique.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value as any)}
          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Risk Levels</option>
          <option value="high">High Risk (8+)</option>
          <option value="medium">Medium Risk (5-7)</option>
          <option value="low">Low Risk (&lt;5)</option>
        </select>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="rounded bg-neutral-700 border-neutral-600 text-cyan-500 focus:ring-cyan-500"
          />
          <span className="text-sm text-neutral-400">Active paths only</span>
        </label>
      </div>
      
      {/* Paths list */}
      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
        {filteredPaths.length > 0 ? (
          filteredPaths.map(path => (
            <PathCard
              key={path.id}
              path={path}
              onClick={() => onPathClick?.(path.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <GitBranch className="w-8 h-8 mb-2 opacity-50" />
            <p>No lateral movement paths detected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LateralMovementPanel;
