/**
 * Feature 8: Hierarchical Architecture Display
 * Shows commander → specialist tree structure
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Crown, User, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import type { HierarchyCoordination, CoordinationInsight } from '../../types/orchestration';

interface HierarchyPanelProps {
  redHierarchy: HierarchyCoordination | null;
  blueHierarchy: HierarchyCoordination | null;
}

const personalityIcons: Record<string, string> = {
  aggressive: '⚔️',
  cautious: '🛡️',
  innovative: '💡',
  analytical: '📊',
  strategic: '♟️',
};

const InsightCard = ({ insight, index }: { insight: CoordinationInsight; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Connector line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-neutral-700" style={{ left: '-12px' }} />
      <div className="absolute w-3 h-px bg-neutral-700" style={{ left: '-12px', top: '20px' }} />
      
      <div
        className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700 cursor-pointer hover:border-neutral-600"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-medium text-white">
              {insight.agent_id.split('_').pop()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded ${
              insight.quality_score > 0.7 ? 'bg-green-500/20 text-green-400' :
              insight.quality_score > 0.4 ? 'bg-amber-500/20 text-amber-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {(insight.quality_score * 100).toFixed(0)}% quality
            </span>
            {expanded ? <ChevronDown className="w-4 h-4 text-neutral-500" /> : <ChevronRight className="w-4 h-4 text-neutral-500" />}
          </div>
        </div>
        
        <p className="text-xs text-neutral-400 mt-2 line-clamp-2">{insight.summary}</p>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t border-neutral-700"
            >
              <div className="text-xs text-neutral-500 mb-2">Key Findings:</div>
              <div className="flex flex-wrap gap-1">
                {insight.key_findings.length > 0 ? (
                  insight.key_findings.map((finding, i) => (
                    <span key={i} className="px-2 py-0.5 bg-neutral-700 text-neutral-300 rounded text-xs">
                      {finding}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-neutral-500">No specific findings</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const TeamHierarchy = ({ coordination, team }: { coordination: HierarchyCoordination; team: 'RED' | 'BLUE' }) => {
  const [expanded, setExpanded] = useState(true);
  const isRed = team === 'RED';
  
  return (
    <div className={`p-4 rounded-lg border ${
      isRed ? 'bg-red-500/5 border-red-500/30' : 'bg-blue-500/5 border-blue-500/30'
    }`}>
      {/* Commander */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isRed ? 'bg-red-500/20' : 'bg-blue-500/20'
          }`}>
            <Crown className={`w-6 h-6 ${isRed ? 'text-red-400' : 'text-blue-400'}`} />
          </div>
          <div>
            <div className={`font-bold ${isRed ? 'text-red-400' : 'text-blue-400'}`}>
              {team} Commander
            </div>
            <div className="text-xs text-neutral-500">
              ♟️ Strategic • Coordinating {coordination.sub_agents_count} agents
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-white">
              {(coordination.confidence * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-neutral-500">confidence</div>
          </div>
          {expanded ? <ChevronDown className="w-5 h-5 text-neutral-500" /> : <ChevronRight className="w-5 h-5 text-neutral-500" />}
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {/* Recommendation */}
            <div className={`mt-4 p-3 rounded-lg ${
              isRed ? 'bg-red-500/10' : 'bg-blue-500/10'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-amber-400 font-semibold">STRATEGIC RECOMMENDATION</span>
              </div>
              <p className="text-sm text-neutral-200">{coordination.recommendation}</p>
            </div>
            
            {/* Historical Context */}
            {coordination.historical_context && coordination.historical_context !== 'No prior experience.' && (
              <div className="mt-3 p-2 bg-neutral-800/50 rounded text-xs text-neutral-400">
                📚 {coordination.historical_context}
              </div>
            )}
            
            {/* Sub-agents */}
            <div className="mt-4 ml-6 space-y-2">
              <div className="text-xs text-neutral-500 mb-2">Sub-Agent Reports:</div>
              {coordination.insights.map((insight, index) => (
                <InsightCard key={insight.agent_id} insight={insight} index={index} />
              ))}
            </div>
            
            {/* Quality Summary */}
            <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
              <span>Average Report Quality</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      coordination.average_quality > 0.7 ? 'bg-green-500' :
                      coordination.average_quality > 0.4 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${coordination.average_quality * 100}%` }}
                  />
                </div>
                <span>{(coordination.average_quality * 100).toFixed(0)}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const HierarchyPanel = ({ redHierarchy, blueHierarchy }: HierarchyPanelProps) => {
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      <div className="flex items-center gap-2 mb-6">
        <GitBranch className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">Hierarchical Command Structure</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Red Team Hierarchy */}
        {redHierarchy ? (
          <TeamHierarchy coordination={redHierarchy} team="RED" />
        ) : (
          <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5">
            <div className="flex items-center gap-2 text-red-400">
              <Crown className="w-5 h-5" />
              <span className="font-semibold">RED Commander</span>
            </div>
            <p className="text-neutral-500 text-sm mt-2">Awaiting coordination data...</p>
          </div>
        )}
        
        {/* Blue Team Hierarchy */}
        {blueHierarchy ? (
          <TeamHierarchy coordination={blueHierarchy} team="BLUE" />
        ) : (
          <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
            <div className="flex items-center gap-2 text-blue-400">
              <Crown className="w-5 h-5" />
              <span className="font-semibold">BLUE Commander</span>
            </div>
            <p className="text-neutral-500 text-sm mt-2">Awaiting coordination data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HierarchyPanel;
