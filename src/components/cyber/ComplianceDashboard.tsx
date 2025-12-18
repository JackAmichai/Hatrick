/**
 * Feature 23: Compliance Dashboard
 * Display compliance scores, controls, and framework status
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import type { 
  ComplianceScore, 
  ComplianceControl, 
  ComplianceFramework,
  ComplianceStatus 
} from '../../types/cyber';

interface ComplianceDashboardProps {
  scores: ComplianceScore[];
  controls: ComplianceControl[];
  onControlClick?: (controlId: string) => void;
}

const frameworkColors: Record<ComplianceFramework, string> = {
  NIST: 'bg-blue-500',
  ISO27001: 'bg-purple-500',
  'PCI-DSS': 'bg-green-500',
  HIPAA: 'bg-red-500',
  SOC2: 'bg-amber-500',
  GDPR: 'bg-cyan-500',
};

const statusConfig: Record<ComplianceStatus, { color: string; bg: string; icon: typeof CheckCircle }> = {
  compliant: { color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle },
  partial: { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: AlertTriangle },
  'non-compliant': { color: 'text-red-400', bg: 'bg-red-500/20', icon: XCircle },
  'not-assessed': { color: 'text-neutral-400', bg: 'bg-neutral-500/20', icon: HelpCircle },
};

const ScoreGauge = ({ score, framework }: { score: ComplianceScore; framework: ComplianceFramework }) => {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score.score_percentage / 100) * circumference;
  const color = frameworkColors[framework];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center p-4 bg-neutral-800/50 border border-neutral-700 rounded-xl"
    >
      <div className="relative w-24 h-24 mb-3">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-neutral-700"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={color.replace('bg-', 'text-')}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{score.score_percentage}%</span>
        </div>
      </div>
      
      <h4 className="font-bold text-white mb-1">{framework}</h4>
      
      <div className="grid grid-cols-2 gap-2 w-full text-xs">
        <div className="text-center p-1 bg-green-500/10 rounded">
          <div className="font-bold text-green-400">{score.compliant}</div>
          <div className="text-neutral-500">Compliant</div>
        </div>
        <div className="text-center p-1 bg-amber-500/10 rounded">
          <div className="font-bold text-amber-400">{score.partial}</div>
          <div className="text-neutral-500">Partial</div>
        </div>
        <div className="text-center p-1 bg-red-500/10 rounded">
          <div className="font-bold text-red-400">{score.non_compliant}</div>
          <div className="text-neutral-500">Non-Comp</div>
        </div>
        <div className="text-center p-1 bg-neutral-500/10 rounded">
          <div className="font-bold text-neutral-400">{score.not_assessed}</div>
          <div className="text-neutral-500">N/A</div>
        </div>
      </div>
      
      <div className="text-xs text-neutral-500 mt-2">
        {score.total_controls} total controls
      </div>
    </motion.div>
  );
};

const ControlRow = ({ 
  control, 
  onClick 
}: { 
  control: ComplianceControl; 
  onClick?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = statusConfig[control.status];
  const StatusIcon = config.icon;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 bg-neutral-800/30 border border-neutral-700 rounded-lg hover:border-neutral-600 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-1.5 rounded ${config.bg}`}>
            <StatusIcon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-1.5 py-0.5 rounded text-xs ${frameworkColors[control.framework]} text-white`}>
                {control.framework}
              </span>
              <span className="font-mono text-xs text-cyan-400">{control.control_id}</span>
            </div>
            <h4 className="font-medium text-white text-sm">{control.name}</h4>
            <p className="text-xs text-neutral-400 line-clamp-1">{control.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs ${config.bg} ${config.color}`}>
            {control.status.replace('-', ' ')}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-neutral-700 space-y-3"
          >
            {/* Evidence */}
            {control.evidence.length > 0 && (
              <div>
                <span className="text-xs text-neutral-500">Evidence:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {control.evidence.map((ev, i) => (
                    <span key={i} className="flex items-center gap-1 px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                      <FileText className="w-3 h-3" />
                      {ev}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Findings */}
            {control.findings.length > 0 && (
              <div>
                <span className="text-xs text-neutral-500">Findings:</span>
                <ul className="mt-1 space-y-1">
                  {control.findings.map((finding, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                      <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Remediation */}
            {control.remediation && (
              <div className="p-2 bg-green-500/10 border border-green-500/20 rounded">
                <div className="flex items-center gap-1 mb-1">
                  <Shield className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-medium text-green-400">Remediation</span>
                </div>
                <p className="text-xs text-neutral-300">{control.remediation}</p>
              </div>
            )}
            
            {/* Last assessed */}
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <Calendar className="w-3 h-3" />
              Last assessed: {new Date(control.last_assessed).toLocaleDateString()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const ComplianceDashboard = ({ 
  scores, 
  controls,
  onControlClick 
}: ComplianceDashboardProps) => {
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | 'ALL'>('ALL');
  
  const filteredControls = useMemo(() => {
    return controls.filter(ctrl => {
      const matchesFramework = selectedFramework === 'ALL' || ctrl.framework === selectedFramework;
      const matchesStatus = statusFilter === 'ALL' || ctrl.status === statusFilter;
      return matchesFramework && matchesStatus;
    });
  }, [controls, selectedFramework, statusFilter]);
  
  const overallScore = useMemo(() => {
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((acc, s) => acc + s.score_percentage, 0) / scores.length);
  }, [scores]);
  
  const totalStats = useMemo(() => ({
    compliant: controls.filter(c => c.status === 'compliant').length,
    partial: controls.filter(c => c.status === 'partial').length,
    nonCompliant: controls.filter(c => c.status === 'non-compliant').length,
    notAssessed: controls.filter(c => c.status === 'not-assessed').length,
  }), [controls]);
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Compliance Dashboard</h3>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            overallScore >= 80 ? 'bg-green-500/20 text-green-400' :
            overallScore >= 60 ? 'bg-amber-500/20 text-amber-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            Overall: {overallScore}%
          </div>
        </div>
      </div>
      
      {/* Overall stats bar */}
      <div className="mb-4">
        <div className="flex h-4 rounded-full overflow-hidden">
          <div 
            className="bg-green-500 transition-all" 
            style={{ width: `${(totalStats.compliant / controls.length) * 100}%` }}
            title={`Compliant: ${totalStats.compliant}`}
          />
          <div 
            className="bg-amber-500 transition-all" 
            style={{ width: `${(totalStats.partial / controls.length) * 100}%` }}
            title={`Partial: ${totalStats.partial}`}
          />
          <div 
            className="bg-red-500 transition-all" 
            style={{ width: `${(totalStats.nonCompliant / controls.length) * 100}%` }}
            title={`Non-Compliant: ${totalStats.nonCompliant}`}
          />
          <div 
            className="bg-neutral-500 transition-all" 
            style={{ width: `${(totalStats.notAssessed / controls.length) * 100}%` }}
            title={`Not Assessed: ${totalStats.notAssessed}`}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-neutral-500">
          <span className="text-green-400">✓ {totalStats.compliant} Compliant</span>
          <span className="text-amber-400">⚠ {totalStats.partial} Partial</span>
          <span className="text-red-400">✗ {totalStats.nonCompliant} Non-Compliant</span>
          <span className="text-neutral-400">? {totalStats.notAssessed} N/A</span>
        </div>
      </div>
      
      {/* Framework scores */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {scores.map(score => (
          <ScoreGauge 
            key={score.framework} 
            score={score} 
            framework={score.framework}
          />
        ))}
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={selectedFramework}
          onChange={(e) => setSelectedFramework(e.target.value as ComplianceFramework | 'ALL')}
          className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Frameworks</option>
          {scores.map(s => (
            <option key={s.framework} value={s.framework}>{s.framework}</option>
          ))}
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ComplianceStatus | 'ALL')}
          className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="compliant">Compliant</option>
          <option value="partial">Partial</option>
          <option value="non-compliant">Non-Compliant</option>
          <option value="not-assessed">Not Assessed</option>
        </select>
        
        <span className="px-3 py-1.5 text-sm text-neutral-400">
          {filteredControls.length} of {controls.length} controls
        </span>
      </div>
      
      {/* Controls list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {filteredControls.length > 0 ? (
          filteredControls.map(control => (
            <ControlRow
              key={control.id}
              control={control}
              onClick={() => onControlClick?.(control.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <ClipboardCheck className="w-8 h-8 mb-2 opacity-50" />
            <p>No controls match filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceDashboard;
