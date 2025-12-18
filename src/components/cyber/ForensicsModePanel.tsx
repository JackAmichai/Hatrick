/**
 * Feature 24: Forensics Mode
 * Display forensic artifacts, analysis, and timeline
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Microscope, 
  FileText, 
  Database,
  HardDrive,
  Network,
  Terminal,
  Hash,
  Calendar,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Eye
} from 'lucide-react';
import type { 
  ForensicArtifact, 
  ForensicTimeline,
  ArtifactType 
} from '../../types/cyber';

interface ForensicsModePanelProps {
  artifacts: ForensicArtifact[];
  timeline: ForensicTimeline | null;
  onArtifactClick?: (artifactId: string) => void;
  onExportArtifact?: (artifactId: string) => void;
}

const artifactIcons: Record<ArtifactType, typeof FileText> = {
  file: FileText,
  registry: Database,
  memory: HardDrive,
  network: Network,
  log: Terminal,
  process: Terminal,
};

const artifactColors: Record<ArtifactType, string> = {
  file: 'text-blue-400 bg-blue-500/20',
  registry: 'text-purple-400 bg-purple-500/20',
  memory: 'text-amber-400 bg-amber-500/20',
  network: 'text-cyan-400 bg-cyan-500/20',
  log: 'text-green-400 bg-green-500/20',
  process: 'text-red-400 bg-red-500/20',
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const ArtifactCard = ({ 
  artifact, 
  onClick,
  onExport 
}: { 
  artifact: ForensicArtifact; 
  onClick?: () => void;
  onExport?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = artifactIcons[artifact.artifact_type];
  const colorClass = artifactColors[artifact.artifact_type];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        artifact.is_malicious === true 
          ? 'bg-red-500/10 border-red-500/30' 
          : artifact.is_malicious === false
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-neutral-800/50 border-neutral-700'
      }`}
    >
      <div 
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-1.5 py-0.5 rounded text-xs uppercase ${colorClass}`}>
                {artifact.artifact_type}
              </span>
              {artifact.is_malicious === true && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/30 text-red-400 rounded text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  Malicious
                </span>
              )}
              {artifact.is_malicious === false && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/30 text-green-400 rounded text-xs">
                  <CheckCircle className="w-3 h-3" />
                  Clean
                </span>
              )}
            </div>
            <h4 className="font-medium text-white">{artifact.name}</h4>
            <code className="text-xs text-neutral-400 block truncate max-w-md">{artifact.path}</code>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onExport && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExport();
              }}
              className="p-1.5 hover:bg-neutral-700 rounded transition-colors"
              title="Export artifact"
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
      
      {/* Quick info */}
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-neutral-500">
        <span>{formatBytes(artifact.size_bytes)}</span>
        <span>Created: {new Date(artifact.created_at).toLocaleString()}</span>
        <span>Collected: {new Date(artifact.collected_at).toLocaleString()}</span>
      </div>
      
      {/* Tags */}
      {artifact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {artifact.tags.map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-neutral-700 text-neutral-300 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-neutral-700 space-y-3"
          >
            {/* Hashes */}
            <div className="space-y-2">
              {artifact.hash_md5 && (
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-neutral-500" />
                  <span className="text-xs text-neutral-500">MD5:</span>
                  <code className="text-xs text-cyan-400 font-mono">{artifact.hash_md5}</code>
                </div>
              )}
              {artifact.hash_sha256 && (
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-neutral-500" />
                  <span className="text-xs text-neutral-500">SHA256:</span>
                  <code className="text-xs text-cyan-400 font-mono break-all">{artifact.hash_sha256}</code>
                </div>
              )}
            </div>
            
            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-neutral-500">Created:</span>
                <p className="text-white">{new Date(artifact.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-neutral-500">Modified:</span>
                <p className="text-white">{new Date(artifact.modified_at).toLocaleString()}</p>
              </div>
            </div>
            
            {/* Analysis notes */}
            {artifact.analysis_notes && (
              <div className="p-3 bg-neutral-900/50 rounded-lg">
                <div className="flex items-center gap-1 mb-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-400">Analysis Notes</span>
                </div>
                <p className="text-sm text-neutral-300 whitespace-pre-wrap">{artifact.analysis_notes}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const TimelineView = ({ timeline }: { timeline: ForensicTimeline }) => (
  <div className="space-y-0">
    {timeline.events.map((event, index) => (
      <div key={`${event.artifact_id}-${event.timestamp}`} className="relative flex gap-4">
        {/* Timeline line */}
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-cyan-500 z-10" />
          {index < timeline.events.length - 1 && (
            <div className="w-px flex-1 bg-neutral-700" />
          )}
        </div>
        
        {/* Event content */}
        <div className={`flex-1 pb-4 ${index === timeline.events.length - 1 ? 'pb-0' : ''}`}>
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-white">{event.action}</span>
              <span className="text-xs text-neutral-500">
                {new Date(event.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-neutral-400">{event.details}</p>
            <code className="text-xs text-cyan-400 mt-1 block">{event.artifact_id}</code>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ForensicsModePanel = ({ 
  artifacts, 
  timeline,
  onArtifactClick,
  onExportArtifact 
}: ForensicsModePanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ArtifactType | 'ALL'>('ALL');
  const [maliciousFilter, setMaliciousFilter] = useState<'ALL' | 'malicious' | 'clean' | 'unknown'>('ALL');
  const [viewMode, setViewMode] = useState<'artifacts' | 'timeline'>('artifacts');
  
  const filteredArtifacts = useMemo(() => {
    return artifacts.filter(art => {
      const matchesSearch = searchQuery === '' ||
        art.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === 'ALL' || art.artifact_type === typeFilter;
      const matchesMalicious = 
        maliciousFilter === 'ALL' ||
        (maliciousFilter === 'malicious' && art.is_malicious === true) ||
        (maliciousFilter === 'clean' && art.is_malicious === false) ||
        (maliciousFilter === 'unknown' && art.is_malicious === null);
      return matchesSearch && matchesType && matchesMalicious;
    });
  }, [artifacts, searchQuery, typeFilter, maliciousFilter]);
  
  const stats = useMemo(() => ({
    total: artifacts.length,
    malicious: artifacts.filter(a => a.is_malicious === true).length,
    clean: artifacts.filter(a => a.is_malicious === false).length,
    byType: Object.keys(artifactIcons).reduce((acc, type) => {
      acc[type] = artifacts.filter(a => a.artifact_type === type).length;
      return acc;
    }, {} as Record<string, number>),
  }), [artifacts]);
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Microscope className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Forensics Mode</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {stats.malicious > 0 && (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-sm">
              {stats.malicious} Malicious
            </span>
          )}
          <span className="text-sm text-neutral-400">{stats.total} artifacts</span>
        </div>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        {Object.entries(artifactIcons).map(([type, Icon]) => (
          <button
            key={type}
            onClick={() => setTypeFilter(typeFilter === type ? 'ALL' : type as ArtifactType)}
            className={`p-2 rounded-lg border text-center transition-all ${
              typeFilter === type 
                ? 'bg-cyan-500/20 border-cyan-500/50' 
                : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-600'
            }`}
          >
            <Icon className={`w-4 h-4 mx-auto mb-1 ${artifactColors[type as ArtifactType].split(' ')[0]}`} />
            <div className="text-sm font-bold text-white">{stats.byType[type] || 0}</div>
            <div className="text-xs text-neutral-500 capitalize">{type}</div>
          </button>
        ))}
      </div>
      
      {/* View toggle and filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1 p-1 bg-neutral-800 rounded-lg">
          <button
            onClick={() => setViewMode('artifacts')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === 'artifacts' 
                ? 'bg-cyan-600 text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Artifacts
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === 'timeline' 
                ? 'bg-cyan-600 text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Timeline
          </button>
        </div>
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artifacts by name, path, or tag..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
          />
        </div>
        
        <select
          value={maliciousFilter}
          onChange={(e) => setMaliciousFilter(e.target.value as any)}
          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Verdicts</option>
          <option value="malicious">Malicious</option>
          <option value="clean">Clean</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>
      
      {/* Content */}
      <div className="max-h-[500px] overflow-y-auto pr-2">
        {viewMode === 'artifacts' ? (
          <div className="space-y-3">
            {filteredArtifacts.length > 0 ? (
              filteredArtifacts.map(artifact => (
                <ArtifactCard
                  key={artifact.id}
                  artifact={artifact}
                  onClick={() => onArtifactClick?.(artifact.id)}
                  onExport={onExportArtifact ? () => onExportArtifact(artifact.id) : undefined}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                <Microscope className="w-8 h-8 mb-2 opacity-50" />
                <p>No artifacts match filters</p>
              </div>
            )}
          </div>
        ) : timeline ? (
          <TimelineView timeline={timeline} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <Clock className="w-8 h-8 mb-2 opacity-50" />
            <p>No timeline data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForensicsModePanel;
