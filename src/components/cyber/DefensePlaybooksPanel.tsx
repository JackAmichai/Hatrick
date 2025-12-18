/**
 * Feature 34: Defense Playbooks Panel
 * Security playbook management and execution tracking
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ListChecks,
  Users,
  Shield,
  Zap,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import type { 
  PlaybookType,
  PlaybookStatus,
  StepStatus,
  DefensePlaybook,
  PlaybookStep,
  PlaybookExecution 
} from '../../types/cyber';

interface DefensePlaybooksPanelProps {
  playbooks: DefensePlaybook[];
  executions: PlaybookExecution[];
  onPlaybookClick?: (playbookId: string) => void;
  onExecutePlaybook?: (playbookId: string) => void;
  onStopExecution?: (executionId: string) => void;
}

const typeColors: Record<PlaybookType, string> = {
  incident_response: 'text-red-400 bg-red-500/20',
  threat_hunting: 'text-purple-400 bg-purple-500/20',
  remediation: 'text-green-400 bg-green-500/20',
  containment: 'text-amber-400 bg-amber-500/20',
  recovery: 'text-blue-400 bg-blue-500/20',
  investigation: 'text-cyan-400 bg-cyan-500/20',
};

const statusColors: Record<PlaybookStatus, string> = {
  draft: 'text-neutral-400 bg-neutral-500/20 border-neutral-500/30',
  active: 'text-green-400 bg-green-500/20 border-green-500/30',
  archived: 'text-neutral-400 bg-neutral-500/20 border-neutral-500/30',
  running: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
};

const stepStatusColors: Record<StepStatus, string> = {
  pending: 'text-neutral-400 bg-neutral-500/20',
  running: 'text-blue-400 bg-blue-500/20',
  completed: 'text-green-400 bg-green-500/20',
  failed: 'text-red-400 bg-red-500/20',
  skipped: 'text-amber-400 bg-amber-500/20',
};

const stepStatusIcons: Record<StepStatus, typeof Clock> = {
  pending: Clock,
  running: Play,
  completed: CheckCircle,
  failed: XCircle,
  skipped: ArrowRight,
};

const PlaybookStepRow = ({ step, index }: { step: PlaybookStep; index: number }) => {
  const Icon = stepStatusIcons[step.status];
  
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stepStatusColors[step.status]}`}>
          {step.status === 'running' ? (
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </div>
        {index < 999 && <div className="w-px h-4 bg-neutral-700" />}
      </div>
      
      <div className="flex-1 pb-2">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-medium text-white">{step.name}</h5>
          {step.duration_seconds && (
            <span className="text-xs text-neutral-500">{step.duration_seconds}s</span>
          )}
        </div>
        <p className="text-xs text-neutral-400">{step.description}</p>
        {step.assigned_to && (
          <span className="flex items-center gap-1 mt-1 text-xs text-cyan-400">
            <Users className="w-3 h-3" />
            {step.assigned_to}
          </span>
        )}
      </div>
    </div>
  );
};

const PlaybookCard = ({ 
  playbook, 
  onExecute,
  onClick 
}: { 
  playbook: DefensePlaybook; 
  onExecute?: () => void;
  onClick?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const completedSteps = playbook.steps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / playbook.steps.length) * 100;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border bg-neutral-800/50 border-neutral-700"
    >
      <div 
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`p-2 rounded-lg ${typeColors[playbook.playbook_type]}`}>
          <BookOpen className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`px-1.5 py-0.5 rounded text-xs ${typeColors[playbook.playbook_type]}`}>
              {playbook.playbook_type.replace(/_/g, ' ')}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-xs border ${statusColors[playbook.status]}`}>
              {playbook.status}
            </span>
            {playbook.is_automated && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                <Zap className="w-3 h-3" />
                Automated
              </span>
            )}
          </div>
          
          <h4 className="font-medium text-white">{playbook.name}</h4>
          <p className="text-sm text-neutral-400 truncate">{playbook.description}</p>
          
          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-500">{completedSteps}/{playbook.steps.length} steps</span>
              <span className="text-neutral-400">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-cyan-500 rounded-full"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {playbook.status === 'active' && onExecute && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExecute();
              }}
              className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
              title="Execute playbook"
            >
              <Play className="w-4 h-4 text-green-400" />
            </button>
          )}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          )}
        </div>
      </div>
      
      {/* Tags */}
      {playbook.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-12">
          {playbook.tags.slice(0, 4).map(tag => (
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
            className="mt-4 pt-4 border-t border-neutral-700 space-y-4"
          >
            {/* Meta info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-neutral-500">Created by:</span>
                <span className="ml-2 text-white">{playbook.created_by}</span>
              </div>
              <div>
                <span className="text-neutral-500">Version:</span>
                <span className="ml-2 text-white">{playbook.version}</span>
              </div>
              <div>
                <span className="text-neutral-500">Est. Duration:</span>
                <span className="ml-2 text-white">{playbook.estimated_duration_minutes}m</span>
              </div>
              <div>
                <span className="text-neutral-500">Executions:</span>
                <span className="ml-2 text-white">{playbook.execution_count}</span>
              </div>
            </div>
            
            {/* MITRE mapping */}
            {playbook.mitre_techniques.length > 0 && (
              <div>
                <h5 className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  MITRE ATT&CK Coverage
                </h5>
                <div className="flex flex-wrap gap-1">
                  {playbook.mitre_techniques.map(technique => (
                    <span key={technique} className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-mono">
                      {technique}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Steps */}
            <div>
              <h5 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                <ListChecks className="w-4 h-4 text-cyan-400" />
                Playbook Steps
              </h5>
              <div className="space-y-0">
                {playbook.steps.map((step, index) => (
                  <PlaybookStepRow key={step.id} step={step} index={index} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const DefensePlaybooksPanel = ({ 
  playbooks, 
  executions,
  onPlaybookClick,
  onExecutePlaybook,
  onStopExecution 
}: DefensePlaybooksPanelProps) => {
  const [typeFilter, setTypeFilter] = useState<PlaybookType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<PlaybookStatus | 'ALL'>('ALL');
  
  const filteredPlaybooks = useMemo(() => {
    return playbooks.filter(p => {
      const matchesType = typeFilter === 'ALL' || p.playbook_type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesType && matchesStatus;
    });
  }, [playbooks, typeFilter, statusFilter]);
  
  const stats = useMemo(() => ({
    total: playbooks.length,
    active: playbooks.filter(p => p.status === 'active').length,
    running: playbooks.filter(p => p.status === 'running').length,
    automated: playbooks.filter(p => p.is_automated).length,
    totalExecutions: executions.length,
    runningExecutions: executions.filter(e => e.status === 'running').length,
  }), [playbooks, executions]);
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Defense Playbooks</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {stats.runningExecutions > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-sm animate-pulse">
              <Play className="w-3 h-3" />
              {stats.runningExecutions} Running
            </span>
          )}
        </div>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-neutral-500">Total Playbooks</div>
        </div>
        <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{stats.active}</div>
          <div className="text-xs text-neutral-500">Active</div>
        </div>
        <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
          <div className="text-2xl font-bold text-cyan-400">{stats.automated}</div>
          <div className="text-xs text-neutral-500">Automated</div>
        </div>
        <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
          <div className="text-2xl font-bold text-purple-400">{stats.totalExecutions}</div>
          <div className="text-xs text-neutral-500">Executions</div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Types</option>
          {Object.keys(typeColors).map(type => (
            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
          ))}
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="active">Active</option>
          <option value="running">Running</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      
      {/* Playbooks list */}
      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
        {filteredPlaybooks.length > 0 ? (
          filteredPlaybooks.map(playbook => (
            <PlaybookCard
              key={playbook.id}
              playbook={playbook}
              onClick={() => onPlaybookClick?.(playbook.id)}
              onExecute={onExecutePlaybook ? () => onExecutePlaybook(playbook.id) : undefined}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <BookOpen className="w-8 h-8 mb-2 opacity-50" />
            <p>No playbooks match filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefensePlaybooksPanel;
