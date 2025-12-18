/**
 * Feature 16: Attack Tree Visualization
 * Interactive tree showing attack paths, probabilities, and mitigations
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  Target, 
  Shield, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Percent
} from 'lucide-react';
import type { AttackTree, AttackTreeNode, AttackNodeType } from '../../types/cyber';

interface AttackTreeVisualizerProps {
  tree: AttackTree | null;
  onNodeClick?: (nodeId: string) => void;
}

const nodeTypeConfig: Record<AttackNodeType, { color: string; icon: typeof Target; label: string }> = {
  root: { color: 'bg-red-500/20 border-red-500/50 text-red-400', icon: Target, label: 'Goal' },
  and: { color: 'bg-amber-500/20 border-amber-500/50 text-amber-400', icon: GitBranch, label: 'AND' },
  or: { color: 'bg-purple-500/20 border-purple-500/50 text-purple-400', icon: GitBranch, label: 'OR' },
  leaf: { color: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400', icon: AlertTriangle, label: 'Attack' },
  mitigation: { color: 'bg-green-500/20 border-green-500/50 text-green-400', icon: Shield, label: 'Defense' },
};

const TreeNode = ({ 
  node, 
  nodes, 
  depth = 0,
  onNodeClick 
}: { 
  node: AttackTreeNode; 
  nodes: Record<string, AttackTreeNode>;
  depth?: number;
  onNodeClick?: (nodeId: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const config = nodeTypeConfig[node.node_type];
  const Icon = config.icon;
  const hasChildren = node.children.length > 0;
  const riskScore = (node.probability * node.impact * 100).toFixed(0);
  
  return (
    <div className="relative">
      {/* Connection line */}
      {depth > 0 && (
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-neutral-700" />
      )}
      
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.05 }}
        className={`relative p-3 rounded-lg border ${config.color} mb-2 cursor-pointer hover:scale-[1.02] transition-transform`}
        onClick={() => onNodeClick?.(node.id)}
      >
        {/* Expand/collapse button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="absolute -left-6 top-3 p-0.5 bg-neutral-800 rounded border border-neutral-700 hover:bg-neutral-700"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-neutral-400" />
            )}
          </button>
        )}
        
        {/* Node header */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded ${config.color.split(' ')[0]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white text-sm truncate">{node.name}</h4>
            <span className="text-xs opacity-70">{config.label}</span>
          </div>
          
          {/* Risk score badge */}
          <div className={`px-2 py-0.5 rounded text-xs font-bold ${
            parseInt(riskScore) >= 70 ? 'bg-red-500/30 text-red-400' :
            parseInt(riskScore) >= 40 ? 'bg-amber-500/30 text-amber-400' :
            'bg-green-500/30 text-green-400'
          }`}>
            {riskScore}%
          </div>
        </div>
        
        {/* Description */}
        <p className="text-xs text-neutral-400 mb-2 line-clamp-2">{node.description}</p>
        
        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-neutral-500">
            <Percent className="w-3 h-3" />
            <span>P: {(node.probability * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1 text-neutral-500">
            <AlertTriangle className="w-3 h-3" />
            <span>I: {(node.impact * 100).toFixed(0)}%</span>
          </div>
          {node.mitre_technique && (
            <a
              href={`https://attack.mitre.org/techniques/${node.mitre_technique}/`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-cyan-400 hover:underline"
            >
              {node.mitre_technique}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        
        {/* CVE badges */}
        {node.cve_ids.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {node.cve_ids.map(cve => (
              <span key={cve} className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                {cve}
              </span>
            ))}
          </div>
        )}
        
        {/* Status indicator */}
        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
          node.status === 'mitigated' ? 'bg-green-400' :
          node.status === 'in_progress' ? 'bg-amber-400 animate-pulse' :
          'bg-red-400'
        }`} />
      </motion.div>
      
      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-8 pl-4 border-l border-neutral-700"
          >
            {node.children.map(childId => {
              const childNode = nodes[childId];
              if (!childNode) return null;
              return (
                <TreeNode
                  key={childId}
                  node={childNode}
                  nodes={nodes}
                  depth={depth + 1}
                  onNodeClick={onNodeClick}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AttackTreeVisualizer = ({ tree, onNodeClick }: AttackTreeVisualizerProps) => {
  if (!tree || !tree.root_id) {
    return (
      <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Attack Tree</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
          <Target className="w-12 h-12 mb-3 opacity-30" />
          <p>No attack tree loaded</p>
          <p className="text-xs mt-1">Generate or load an attack tree to visualize</p>
        </div>
      </div>
    );
  }
  
  const rootNode = tree.nodes[tree.root_id];
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Attack Tree: {tree.name}</h3>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-400">Target: {tree.target}</span>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            tree.risk_score >= 0.7 ? 'bg-red-500/20 text-red-400' :
            tree.risk_score >= 0.4 ? 'bg-amber-500/20 text-amber-400' :
            'bg-green-500/20 text-green-400'
          }`}>
            Risk: {(tree.risk_score * 100).toFixed(0)}%
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-neutral-800">
        {Object.entries(nodeTypeConfig).map(([type, config]) => {
          const Icon = config.icon;
          return (
            <div key={type} className="flex items-center gap-1.5 text-xs">
              <div className={`p-1 rounded ${config.color.split(' ')[0]}`}>
                <Icon className={`w-3 h-3 ${config.color.split(' ')[2]}`} />
              </div>
              <span className="text-neutral-400">{config.label}</span>
            </div>
          );
        })}
      </div>
      
      {/* Tree visualization */}
      <div className="max-h-[600px] overflow-y-auto pr-2">
        {rootNode && (
          <TreeNode 
            node={rootNode} 
            nodes={tree.nodes} 
            onNodeClick={onNodeClick}
          />
        )}
      </div>
      
      {/* Stats footer */}
      <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center gap-4 text-xs text-neutral-500">
        <span>{Object.keys(tree.nodes).length} nodes</span>
        <span>Created: {new Date(tree.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default AttackTreeVisualizer;
