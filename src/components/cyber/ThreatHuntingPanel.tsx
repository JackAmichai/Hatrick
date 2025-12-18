/**
 * Feature 35: Threat Hunting Panel
 * Proactive threat hunting queries and investigations
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Target,
  Play,
  Pause,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
  Code,
  FileText,
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Eye,
  Bookmark,
  Star
} from 'lucide-react';
import type { 
  HuntStatus,
  HuntPriority,
  DataSource,
  ThreatHunt,
  HuntFinding,
  HuntMetrics 
} from '../../types/cyber';

interface ThreatHuntingPanelProps {
  hunts: ThreatHunt[];
  metrics: HuntMetrics | null;
  onHuntClick?: (huntId: string) => void;
  onStartHunt?: (huntId: string) => void;
  onStopHunt?: (huntId: string) => void;
}

const statusColors: Record<HuntStatus, string> = {
  draft: 'text-neutral-400 bg-neutral-500/20 border-neutral-500/30',
  scheduled: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  running: 'text-green-400 bg-green-500/20 border-green-500/30',
  completed: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
  paused: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
};

const priorityColors: Record<HuntPriority, string> = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
};

const dataSourceColors: Record<DataSource, string> = {
  edr: 'text-red-400 bg-red-500/20',
  siem: 'text-blue-400 bg-blue-500/20',
  network: 'text-green-400 bg-green-500/20',
  cloud: 'text-cyan-400 bg-cyan-500/20',
  identity: 'text-purple-400 bg-purple-500/20',
  endpoint: 'text-amber-400 bg-amber-500/20',
};

const FindingCard = ({ finding }: { finding: HuntFinding }) => (
  <div className={`p-3 rounded-lg border ${
    finding.severity === 'high' || finding.severity === 'critical'
      ? 'bg-red-500/10 border-red-500/30'
      : 'bg-neutral-800/50 border-neutral-700'
  }`}>
    <div className="flex items-start justify-between mb-2">
      <h5 className="text-sm font-medium text-white">{finding.title}</h5>
      <span className={`px-1.5 py-0.5 rounded text-xs ${
        finding.severity === 'critical' ? 'bg-red-500/30 text-red-400' :
        finding.severity === 'high' ? 'bg-orange-500/30 text-orange-400' :
        finding.severity === 'medium' ? 'bg-yellow-500/30 text-yellow-400' :
        'bg-green-500/30 text-green-400'
      }`}>
        {finding.severity}
      </span>
    </div>
    <p className="text-xs text-neutral-400 mb-2">{finding.description}</p>
    <div className="flex items-center justify-between text-xs">
      <span className="text-neutral-500">
        {finding.affected_hosts} hosts affected
      </span>
      <span className="text-neutral-500">
        {new Date(finding.found_at).toLocaleString()}
      </span>
    </div>
    {finding.iocs.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-2">
        {finding.iocs.slice(0, 3).map((ioc, idx) => (
          <code key={idx} className="px-1.5 py-0.5 bg-neutral-900 text-cyan-400 rounded text-xs">
            {ioc.substring(0, 20)}...
          </code>
        ))}
      </div>
    )}
  </div>
);

const HuntCard = ({ 
  hunt, 
  onStart,
  onStop,
  onClick 
}: { 
  hunt: ThreatHunt; 
  onStart?: () => void;
  onStop?: () => void;
  onClick?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const highFindings = hunt.findings.filter(f => 
    f.severity === 'high' || f.severity === 'critical'
  ).length;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        highFindings > 0 
          ? 'bg-red-500/10 border-red-500/30' 
          : 'bg-neutral-800/50 border-neutral-700'
      }`}
    >
      <div 
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-2 rounded-lg bg-cyan-500/20">
          <Target className="w-5 h-5 text-cyan-400" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`px-1.5 py-0.5 rounded text-xs border ${statusColors[hunt.status]}`}>
              {hunt.status}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${priorityColors[hunt.priority]}`}>
              {hunt.priority} priority
            </span>
            {hunt.is_favorite && (
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            )}
          </div>
          
          <h4 className="font-medium text-white">{hunt.name}</h4>
          <p className="text-sm text-neutral-400 truncate">{hunt.hypothesis}</p>
          
          {/* Quick stats */}
          <div className="flex gap-4 mt-2 text-xs">
            <span className="text-neutral-500">
              {hunt.findings.length} findings
            </span>
            {highFindings > 0 && (
              <span className="text-red-400">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {highFindings} critical/high
              </span>
            )}
            <span className="text-neutral-500">
              {hunt.events_analyzed.toLocaleString()} events
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hunt.status === 'draft' && onStart && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
              title="Start hunt"
            >
              <Play className="w-4 h-4 text-green-400" />
            </button>
          )}
          {hunt.status === 'running' && onStop && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStop();
              }}
              className="p-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors"
              title="Pause hunt"
            >
              <Pause className="w-4 h-4 text-amber-400" />
            </button>
          )}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          )}
        </div>
      </div>
      
      {/* Data sources */}
      <div className="flex flex-wrap gap-1 mt-2 ml-12">
        {hunt.data_sources.map(source => (
          <span key={source} className={`px-1.5 py-0.5 rounded text-xs ${dataSourceColors[source]}`}>
            {source.toUpperCase()}
          </span>
        ))}
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
            {/* Query */}
            {hunt.query && (
              <div>
                <h5 className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Code className="w-4 h-4 text-cyan-400" />
                  Hunt Query
                </h5>
                <pre className="p-3 bg-neutral-900 rounded-lg text-xs text-cyan-400 overflow-x-auto">
                  {hunt.query}
                </pre>
              </div>
            )}
            
            {/* MITRE mapping */}
            {hunt.mitre_techniques.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-white mb-2">MITRE ATT&CK Coverage</h5>
                <div className="flex flex-wrap gap-1">
                  {hunt.mitre_techniques.map(technique => (
                    <span key={technique} className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-mono">
                      {technique}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Meta info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-neutral-500">Created by:</span>
                <span className="ml-2 text-white">{hunt.created_by}</span>
              </div>
              <div>
                <span className="text-neutral-500">Last run:</span>
                <span className="ml-2 text-white">
                  {hunt.last_run ? new Date(hunt.last_run).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>
            
            {/* Findings */}
            {hunt.findings.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-white mb-3">
                  Findings ({hunt.findings.length})
                </h5>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {hunt.findings.map(finding => (
                    <FindingCard key={finding.id} finding={finding} />
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

export const ThreatHuntingPanel = ({ 
  hunts, 
  metrics,
  onHuntClick,
  onStartHunt,
  onStopHunt 
}: ThreatHuntingPanelProps) => {
  const [statusFilter, setStatusFilter] = useState<HuntStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<HuntPriority | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredHunts = useMemo(() => {
    return hunts.filter(h => {
      const matchesStatus = statusFilter === 'ALL' || h.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || h.priority === priorityFilter;
      const matchesSearch = searchQuery === '' ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.hypothesis.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [hunts, statusFilter, priorityFilter, searchQuery]);
  
  const stats = useMemo(() => ({
    total: hunts.length,
    running: hunts.filter(h => h.status === 'running').length,
    completed: hunts.filter(h => h.status === 'completed').length,
    totalFindings: hunts.reduce((sum, h) => sum + h.findings.length, 0),
    criticalFindings: hunts.reduce((sum, h) => 
      sum + h.findings.filter(f => f.severity === 'critical' || f.severity === 'high').length, 0
    ),
    eventsAnalyzed: hunts.reduce((sum, h) => sum + h.events_analyzed, 0),
  }), [hunts]);
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Threat Hunting</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {stats.running > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-sm animate-pulse">
              <Target className="w-3 h-3" />
              {stats.running} Running
            </span>
          )}
          {stats.criticalFindings > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-sm">
              <AlertTriangle className="w-3 h-3" />
              {stats.criticalFindings} Critical
            </span>
          )}
        </div>
      </div>
      
      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-white">{metrics.total_hunts}</div>
            <div className="text-xs text-neutral-500">Total Hunts</div>
          </div>
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400">{metrics.total_findings}</div>
            <div className="text-xs text-neutral-500">Findings</div>
          </div>
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{metrics.detection_rate}%</div>
            <div className="text-xs text-neutral-500">Detection Rate</div>
          </div>
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">
              {(metrics.events_analyzed / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-neutral-500">Events Analyzed</div>
          </div>
        </div>
      )}
      
      {/* Top techniques hunted */}
      {metrics && metrics.top_techniques_hunted.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-neutral-400 mb-2">Top MITRE Techniques</h5>
          <div className="flex flex-wrap gap-2">
            {metrics.top_techniques_hunted.map(technique => (
              <span key={technique} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-mono">
                {technique}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hunts..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>
        
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as any)}
          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      
      {/* Hunts list */}
      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
        {filteredHunts.length > 0 ? (
          filteredHunts.map(hunt => (
            <HuntCard
              key={hunt.id}
              hunt={hunt}
              onClick={() => onHuntClick?.(hunt.id)}
              onStart={onStartHunt ? () => onStartHunt(hunt.id) : undefined}
              onStop={onStopHunt ? () => onStopHunt(hunt.id) : undefined}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <Search className="w-8 h-8 mb-2 opacity-50" />
            <p>No hunts match filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreatHuntingPanel;
