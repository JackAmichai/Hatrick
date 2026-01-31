/**
 * Feature 25: Sandbox Integration
 * Malware sandbox detonation and analysis interface
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Play,
  FileText,
  Globe,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  Shield
} from 'lucide-react';
import type { 
  SandboxResult, 
  SandboxStatus,
  SandboxBehavior 
} from '../../types/cyber';

interface SandboxPanelProps {
  results: SandboxResult[];
  onSubmitSample?: (file: File) => void;
  onViewResult?: (resultId: string) => void;
  onExportReport?: (resultId: string) => void;
}

const statusColors: Record<SandboxStatus, string> = {
  pending: 'text-amber-400 bg-amber-500/20',
  running: 'text-blue-400 bg-blue-500/20',
  completed: 'text-green-400 bg-green-500/20',
  failed: 'text-red-400 bg-red-500/20',
  timeout: 'text-orange-400 bg-orange-500/20',
};

const statusIcons: Record<SandboxStatus, typeof Play> = {
  pending: Clock,
  running: Activity,
  completed: CheckCircle,
  failed: XCircle,
  timeout: Clock,
};

const threatLevelColors: Record<number, string> = {
  0: 'text-green-400',
  1: 'text-green-400',
  2: 'text-lime-400',
  3: 'text-yellow-400',
  4: 'text-amber-400',
  5: 'text-orange-400',
  6: 'text-orange-500',
  7: 'text-red-400',
  8: 'text-red-500',
  9: 'text-red-600',
  10: 'text-red-700',
};

const getThreatLabel = (score: number): string => {
  if (score <= 2) return 'Clean';
  if (score <= 4) return 'Low';
  if (score <= 6) return 'Medium';
  if (score <= 8) return 'High';
  return 'Critical';
};

const ThreatScoreGauge = ({ score }: { score: number }) => {
  const circumference = 2 * Math.PI * 45;
  const progress = (score / 10) * circumference;
  
  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          className="text-neutral-700"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          className={threatLevelColors[Math.round(score)] || 'text-neutral-400'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${threatLevelColors[Math.round(score)]}`}>
          {score.toFixed(1)}
        </span>
        <span className="text-xs text-neutral-400">{getThreatLabel(score)}</span>
      </div>
    </div>
  );
};

const BehaviorTag = ({ behavior }: { behavior: SandboxBehavior }) => {
  const severityColors = {
    low: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  
  return (
    <span 
      className={`px-2 py-1 rounded border text-xs ${severityColors[behavior.severity]}`}
      title={behavior.description}
    >
      {behavior.name}
    </span>
  );
};

const SandboxResultCard = ({ 
  result, 
  onExport 
}: { 
  result: SandboxResult; 
  onExport?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const StatusIcon = statusIcons[result.status];
  
  const highSeverityCount = result.behaviors.filter(b => b.severity === 'high').length;
  const mediumSeverityCount = result.behaviors.filter(b => b.severity === 'medium').length;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        result.threat_score >= 7 
          ? 'bg-red-500/10 border-red-500/30' 
          : result.threat_score >= 4
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-neutral-800/50 border-neutral-700'
      }`}
    >
      <div 
        className="flex items-start gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Threat score gauge */}
        <ThreatScoreGauge score={result.threat_score} />
        
        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${statusColors[result.status]}`}>
              <StatusIcon className="w-3 h-3" />
              {result.status}
            </span>
            {highSeverityCount > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500/30 text-red-400 rounded text-xs">
                {highSeverityCount} High
              </span>
            )}
            {mediumSeverityCount > 0 && (
              <span className="px-1.5 py-0.5 bg-orange-500/30 text-orange-400 rounded text-xs">
                {mediumSeverityCount} Medium
              </span>
            )}
          </div>
          
          <h4 className="font-medium text-white truncate mb-1">{result.file_name}</h4>
          
          <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
            <span>SHA256: <code className="text-cyan-400">{result.file_hash.substring(0, 16)}...</code></span>
            <span>{new Date(result.submitted_at).toLocaleString()}</span>
            {result.duration_seconds && (
              <span>Duration: {result.duration_seconds}s</span>
            )}
          </div>
          
          {/* Tags */}
          {result.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {result.tags.slice(0, 5).map(tag => (
                <span key={tag} className="px-1.5 py-0.5 bg-neutral-700 text-neutral-300 rounded text-xs">
                  {tag}
                </span>
              ))}
              {result.tags.length > 5 && (
                <span className="text-xs text-neutral-500">+{result.tags.length - 5} more</span>
              )}
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {onExport && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExport();
              }}
              className="p-1.5 hover:bg-neutral-700 rounded transition-colors"
              title="Export report"
            >
              <Download className="w-4 h-4 text-neutral-400" />
            </button>
          )}
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
            {/* Behaviors */}
            {result.behaviors.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-white mb-2">Detected Behaviors</h5>
                <div className="flex flex-wrap gap-2">
                  {result.behaviors.map((behavior, idx) => (
                    <BehaviorTag key={idx} behavior={behavior} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Network activity */}
            {result.network_activity.length > 0 && (
              <div>
                <h5 className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Network Activity
                </h5>
                <div className="grid gap-2">
                  {result.network_activity.slice(0, 5).map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-neutral-900/50 rounded text-xs">
                      <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded uppercase">
                        {activity.protocol}
                      </span>
                      <code className="text-white">{activity.destination}</code>
                      {activity.port && <span className="text-neutral-500">:{activity.port}</span>}
                    </div>
                  ))}
                  {result.network_activity.length > 5 && (
                    <span className="text-xs text-neutral-500">
                      +{result.network_activity.length - 5} more connections
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Files dropped */}
            {result.files_dropped.length > 0 && (
              <div>
                <h5 className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Dropped Files ({result.files_dropped.length})
                </h5>
                <div className="grid gap-1">
                  {result.files_dropped.slice(0, 5).map((file, idx) => (
                    <code key={idx} className="text-xs text-neutral-400 truncate">{file}</code>
                  ))}
                </div>
              </div>
            )}
            
            {/* Registry modifications */}
            {result.registry_modifications.length > 0 && (
              <div>
                <h5 className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  Registry Modifications ({result.registry_modifications.length})
                </h5>
                <div className="grid gap-1">
                  {result.registry_modifications.slice(0, 3).map((reg, idx) => (
                    <code key={idx} className="text-xs text-neutral-400 truncate">{reg}</code>
                  ))}
                </div>
              </div>
            )}
            
            {/* MITRE ATT&CK mapping */}
            {result.mitre_techniques.length > 0 && (
              <div>
                <h5 className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  MITRE ATT&CK Techniques
                </h5>
                <div className="flex flex-wrap gap-1">
                  {result.mitre_techniques.map(technique => (
                    <span 
                      key={technique}
                      className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-mono"
                    >
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

export const SandboxPanel = ({ 
  results, 
  onSubmitSample,
  onExportReport 
}: SandboxPanelProps) => {
  const [statusFilter, setStatusFilter] = useState<SandboxStatus | 'ALL'>('ALL');
  const [threatFilter, setThreatFilter] = useState<'ALL' | 'clean' | 'suspicious' | 'malicious'>('ALL');
  const [isDragging, setIsDragging] = useState(false);
  
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesThreat = 
        threatFilter === 'ALL' ||
        (threatFilter === 'clean' && r.threat_score < 3) ||
        (threatFilter === 'suspicious' && r.threat_score >= 3 && r.threat_score < 7) ||
        (threatFilter === 'malicious' && r.threat_score >= 7);
      return matchesStatus && matchesThreat;
    });
  }, [results, statusFilter, threatFilter]);
  
  const stats = useMemo(() => ({
    total: results.length,
    pending: results.filter(r => r.status === 'pending').length,
    running: results.filter(r => r.status === 'running').length,
    completed: results.filter(r => r.status === 'completed').length,
    malicious: results.filter(r => r.threat_score >= 7).length,
    avgThreatScore: results.length > 0 
      ? (results.reduce((sum, r) => sum + r.threat_score, 0) / results.length).toFixed(1) 
      : '0',
  }), [results]);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && onSubmitSample) {
      onSubmitSample(files[0]);
    }
  };
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Sandbox Analysis</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {stats.running > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-sm animate-pulse">
              <Activity className="w-3 h-3" />
              {stats.running} Running
            </span>
          )}
          <span className="text-sm text-neutral-400">{stats.total} samples</span>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-center">
          <div className="text-2xl font-bold text-white">{stats.completed}</div>
          <div className="text-xs text-neutral-500">Completed</div>
        </div>
        <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-center">
          <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
          <div className="text-xs text-neutral-500">Pending</div>
        </div>
        <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.running}</div>
          <div className="text-xs text-neutral-500">Running</div>
        </div>
        <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-400">{stats.malicious}</div>
          <div className="text-xs text-neutral-500">Malicious</div>
        </div>
        <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-center">
          <div className={`text-2xl font-bold ${threatLevelColors[Math.round(parseFloat(stats.avgThreatScore))]}`}>
            {stats.avgThreatScore}
          </div>
          <div className="text-xs text-neutral-500">Avg Score</div>
        </div>
      </div>
      
      {/* Upload zone */}
      {onSubmitSample && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`mb-4 p-6 border-2 border-dashed rounded-lg text-center transition-all ${
            isDragging 
              ? 'border-cyan-500 bg-cyan-500/10' 
              : 'border-neutral-600 hover:border-neutral-500'
          }`}
        >
          <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-cyan-400' : 'text-neutral-500'}`} />
          <p className={`text-sm ${isDragging ? 'text-cyan-400' : 'text-neutral-400'}`}>
            Drag and drop a file to analyze
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Supports executables, documents, archives, and scripts
          </p>
        </div>
      )}
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SandboxStatus | 'ALL')}
          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="timeout">Timeout</option>
        </select>
        
        <select
          value={threatFilter}
          onChange={(e) => setThreatFilter(e.target.value as 'ALL' | 'clean' | 'suspicious' | 'malicious')}
          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Threats</option>
          <option value="clean">Clean (&lt;3)</option>
          <option value="suspicious">Suspicious (3-7)</option>
          <option value="malicious">Malicious (&gt;7)</option>
        </select>
      </div>
      
      {/* Results list */}
      <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3">
        {filteredResults.length > 0 ? (
          filteredResults.map(result => (
            <SandboxResultCard
              key={result.id}
              result={result}
              onExport={onExportReport ? () => onExportReport(result.id) : undefined}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <Box className="w-8 h-8 mb-2 opacity-50" />
            <p>No sandbox results match filters</p>
            {onSubmitSample && (
              <p className="text-sm mt-1">Submit a sample to analyze</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SandboxPanel;
