/**
 * Feature 18: MITRE ATT&CK Highlighting
 * Interactive MITRE matrix and technique browser
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid3X3, 
  ExternalLink, 
  Search,
  ChevronDown,
  ChevronRight,
  Shield,
  Eye,
  AlertTriangle
} from 'lucide-react';
import type { MITRETechnique, MITRETactic } from '../../types/cyber';

interface MITREMatrixProps {
  techniques: MITRETechnique[];
  highlightedTechniques?: string[];
  onTechniqueClick?: (techniqueId: string) => void;
}

const TACTICS_ORDER: MITRETactic[] = [
  'Reconnaissance',
  'Resource Development',
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Lateral Movement',
  'Collection',
  'Command and Control',
  'Exfiltration',
  'Impact'
];

const tacticColors: Record<string, string> = {
  'Reconnaissance': 'bg-slate-600/30',
  'Resource Development': 'bg-gray-600/30',
  'Initial Access': 'bg-red-600/30',
  'Execution': 'bg-orange-600/30',
  'Persistence': 'bg-amber-600/30',
  'Privilege Escalation': 'bg-yellow-600/30',
  'Defense Evasion': 'bg-lime-600/30',
  'Credential Access': 'bg-green-600/30',
  'Discovery': 'bg-emerald-600/30',
  'Lateral Movement': 'bg-teal-600/30',
  'Collection': 'bg-cyan-600/30',
  'Command and Control': 'bg-blue-600/30',
  'Exfiltration': 'bg-indigo-600/30',
  'Impact': 'bg-purple-600/30',
};

const TechniqueCard = ({ 
  technique, 
  isHighlighted
}: { 
  technique: MITRETechnique;
  isHighlighted: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        isHighlighted 
          ? 'bg-red-500/20 border-red-500/50 shadow-lg shadow-red-500/20' 
          : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-600'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`font-mono text-xs ${isHighlighted ? 'text-red-400' : 'text-cyan-400'}`}>
            {technique.technique_id}
          </span>
          {isHighlighted && (
            <span className="px-1.5 py-0.5 bg-red-500/30 text-red-400 rounded text-xs animate-pulse">
              Active
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        )}
      </div>
      
      <h4 className="font-medium text-white text-sm mb-1">{technique.name}</h4>
      
      {/* Platforms */}
      <div className="flex flex-wrap gap-1 mb-2">
        {technique.platforms.slice(0, 3).map(platform => (
          <span key={platform} className="px-1.5 py-0.5 bg-neutral-700/50 text-neutral-400 rounded text-xs">
            {platform}
          </span>
        ))}
        {technique.platforms.length > 3 && (
          <span className="px-1.5 py-0.5 text-neutral-500 text-xs">
            +{technique.platforms.length - 3}
          </span>
        )}
      </div>
      
      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-neutral-700 space-y-3"
          >
            {/* Description */}
            <p className="text-xs text-neutral-400">{technique.description}</p>
            
            {/* Detection */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Eye className="w-3 h-3 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400">Detection</span>
              </div>
              <p className="text-xs text-neutral-400">{technique.detection}</p>
            </div>
            
            {/* Mitigation */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Shield className="w-3 h-3 text-green-400" />
                <span className="text-xs font-medium text-green-400">Mitigation</span>
              </div>
              <p className="text-xs text-neutral-400">{technique.mitigation}</p>
            </div>
            
            {/* Data Sources */}
            {technique.data_sources.length > 0 && (
              <div>
                <span className="text-xs text-neutral-500">Data Sources:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {technique.data_sources.map(ds => (
                    <span key={ds} className="px-1.5 py-0.5 bg-neutral-700/50 text-neutral-400 rounded text-xs">
                      {ds}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Sub-techniques */}
            {technique.sub_techniques.length > 0 && (
              <div>
                <span className="text-xs text-neutral-500">Sub-techniques:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {technique.sub_techniques.map(st => (
                    <span key={st} className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Link */}
            <a
              href={technique.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
            >
              View on MITRE ATT&CK
              <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const MITREMatrix = ({ 
  techniques, 
  highlightedTechniques = []
}: MITREMatrixProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTactic, setSelectedTactic] = useState<MITRETactic | 'ALL'>('ALL');
  
  // Group techniques by tactic
  const techniquesByTactic = TACTICS_ORDER.reduce((acc, tactic) => {
    acc[tactic] = techniques.filter(t => t.tactic === tactic);
    return acc;
  }, {} as Record<MITRETactic, MITRETechnique[]>);
  
  // Filter techniques
  const filteredTechniques = techniques.filter(t => {
    const matchesSearch = searchQuery === '' ||
      t.technique_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTactic = selectedTactic === 'ALL' || t.tactic === selectedTactic;
    return matchesSearch && matchesTactic;
  });
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">MITRE ATT&CK Matrix</h3>
        </div>
        
        {highlightedTechniques.length > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">
              {highlightedTechniques.length} active techniques
            </span>
          </div>
        )}
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search technique ID or name..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
          />
        </div>
        
        <select
          value={selectedTactic}
          onChange={(e) => setSelectedTactic(e.target.value as MITRETactic | 'ALL')}
          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Tactics ({techniques.length})</option>
          {TACTICS_ORDER.map(tactic => (
            <option key={tactic} value={tactic}>
              {tactic} ({techniquesByTactic[tactic]?.length || 0})
            </option>
          ))}
        </select>
      </div>
      
      {/* Tactics overview (mini matrix) */}
      <div className="flex flex-wrap gap-1 mb-4 pb-4 border-b border-neutral-800">
        {TACTICS_ORDER.map(tactic => {
          const count = techniquesByTactic[tactic]?.length || 0;
          const hasHighlighted = techniquesByTactic[tactic]?.some(t => 
            highlightedTechniques.includes(t.technique_id)
          );
          
          return (
            <button
              key={tactic}
              onClick={() => setSelectedTactic(selectedTactic === tactic ? 'ALL' : tactic)}
              className={`px-2 py-1 rounded text-xs transition-all ${
                selectedTactic === tactic 
                  ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500/50' 
                  : hasHighlighted
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : `${tacticColors[tactic]} text-neutral-300 border border-transparent hover:border-neutral-600`
              }`}
            >
              {tactic.split(' ')[0]} ({count})
            </button>
          );
        })}
      </div>
      
      {/* Techniques grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {filteredTechniques.map(technique => (
            <TechniqueCard
              key={technique.technique_id}
              technique={technique}
              isHighlighted={highlightedTechniques.includes(technique.technique_id)}
            />
          ))}
        </AnimatePresence>
        
        {filteredTechniques.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-neutral-500">
            <Grid3X3 className="w-8 h-8 mb-2 opacity-50" />
            <p>No techniques match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MITREMatrix;
