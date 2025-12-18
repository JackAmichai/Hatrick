/**
 * Feature 17: CVE Database Panel
 * Search and display CVE entries with severity indicators
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Shield, 
  AlertTriangle, 
  ExternalLink,
  Calendar,
  Activity,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import type { CVEEntry, CVESeverity, Exploitability } from '../../types/cyber';

interface CVEPanelProps {
  cves: CVEEntry[];
  onCVEClick?: (cveId: string) => void;
}

const severityConfig: Record<CVESeverity, { color: string; bg: string }> = {
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/20' },
  HIGH: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  MEDIUM: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
  LOW: { color: 'text-green-400', bg: 'bg-green-500/20' },
};

const exploitabilityConfig: Record<Exploitability, { color: string; label: string }> = {
  active: { color: 'text-red-400 bg-red-500/20', label: '🔥 Active Exploit' },
  poc: { color: 'text-amber-400 bg-amber-500/20', label: '⚠️ PoC Available' },
  unproven: { color: 'text-neutral-400 bg-neutral-500/20', label: 'No Known Exploit' },
};

const CVECard = ({ cve, onClick: _onClick }: { cve: CVEEntry; onClick?: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const sevConfig = severityConfig[cve.severity];
  const expConfig = exploitabilityConfig[cve.exploitability];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 transition-colors cursor-pointer`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${sevConfig.bg} ${sevConfig.color}`}>
            {cve.severity}
          </span>
          <span className="font-mono font-bold text-white">{cve.cve_id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${sevConfig.color}`}>
            {cve.cvss_score.toFixed(1)}
          </span>
        </div>
      </div>
      
      {/* Description */}
      <p className={`text-sm text-neutral-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
        {cve.description}
      </p>
      
      {/* Quick info */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className={`px-2 py-0.5 rounded text-xs ${expConfig.color}`}>
          {expConfig.label}
        </span>
        {cve.patch_available ? (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
            <CheckCircle className="w-3 h-3" />
            Patch Available
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
            <XCircle className="w-3 h-3" />
            No Patch
          </span>
        )}
      </div>
      
      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-neutral-700"
          >
            {/* CVSS Vector */}
            <div className="mb-3">
              <span className="text-xs text-neutral-500">CVSS Vector:</span>
              <code className="block mt-1 text-xs text-cyan-400 bg-neutral-900 p-2 rounded font-mono">
                {cve.cvss_vector}
              </code>
            </div>
            
            {/* Affected Products */}
            <div className="mb-3">
              <span className="text-xs text-neutral-500">Affected Products:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {cve.affected_products.map((product, i) => (
                  <span key={i} className="px-2 py-0.5 bg-neutral-700 rounded text-xs text-neutral-300">
                    {product}
                  </span>
                ))}
              </div>
            </div>
            
            {/* MITRE Techniques */}
            {cve.mitre_techniques.length > 0 && (
              <div className="mb-3">
                <span className="text-xs text-neutral-500">MITRE ATT&CK:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {cve.mitre_techniques.map((tech) => (
                    <a
                      key={tech}
                      href={`https://attack.mitre.org/techniques/${tech}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs hover:underline"
                    >
                      {tech}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Dates */}
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Published: {cve.published_date}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Modified: {cve.modified_date}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CVEPanel = ({ cves, onCVEClick }: CVEPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<CVESeverity | 'ALL'>('ALL');
  const [exploitFilter, setExploitFilter] = useState<Exploitability | 'ALL'>('ALL');
  
  const filteredCVEs = useMemo(() => {
    return cves.filter(cve => {
      const matchesSearch = searchQuery === '' || 
        cve.cve_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cve.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cve.affected_products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesSeverity = severityFilter === 'ALL' || cve.severity === severityFilter;
      const matchesExploit = exploitFilter === 'ALL' || cve.exploitability === exploitFilter;
      
      return matchesSearch && matchesSeverity && matchesExploit;
    });
  }, [cves, searchQuery, severityFilter, exploitFilter]);
  
  const stats = useMemo(() => ({
    total: cves.length,
    critical: cves.filter(c => c.severity === 'CRITICAL').length,
    high: cves.filter(c => c.severity === 'HIGH').length,
    activeExploits: cves.filter(c => c.exploitability === 'active').length,
  }), [cves]);
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">CVE Database</h3>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-400">{stats.total} CVEs</span>
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
            {stats.critical} Critical
          </span>
          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs">
            {stats.high} High
          </span>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search CVE ID, description, or product..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as CVESeverity | 'ALL')}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          
          <select
            value={exploitFilter}
            onChange={(e) => setExploitFilter(e.target.value as Exploitability | 'ALL')}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
          >
            <option value="ALL">All Exploitability</option>
            <option value="active">Active Exploits</option>
            <option value="poc">PoC Available</option>
            <option value="unproven">Unproven</option>
          </select>
        </div>
      </div>
      
      {/* CVE list */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {filteredCVEs.length > 0 ? (
            filteredCVEs.map(cve => (
              <CVECard 
                key={cve.cve_id} 
                cve={cve} 
                onClick={() => onCVEClick?.(cve.cve_id)}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-neutral-500"
            >
              <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
              <p>No CVEs match your filters</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CVEPanel;
