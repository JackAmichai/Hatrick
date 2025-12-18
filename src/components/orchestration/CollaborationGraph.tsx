/**
 * Feature 7: Collaboration Graph
 * Network visualization showing which agents work well together
 */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Users, TrendingUp } from 'lucide-react';
import type { CollaborationGraph, CollaborationNode, CollaborationEdge } from '../../types/orchestration';

interface CollaborationGraphPanelProps {
  graph: CollaborationGraph | null;
}

// Simple canvas-based network visualization
const NetworkCanvas = ({ graph }: { graph: CollaborationGraph }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<CollaborationNode | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graph) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Position nodes in a circle
    const nodePositions: Record<string, { x: number; y: number }> = {};
    const radius = Math.min(width, height) * 0.35;
    
    graph.nodes.forEach((node, i) => {
      const angle = (i / graph.nodes.length) * Math.PI * 2 - Math.PI / 2;
      nodePositions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw edges
    graph.edges.forEach(edge => {
      const source = nodePositions[edge.source];
      const target = nodePositions[edge.target];
      if (!source || !target) return;
      
      const alpha = Math.min(1, edge.weight + 0.2);
      const lineWidth = 1 + edge.weight * 3;
      
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    });
    
    // Draw nodes
    graph.nodes.forEach(node => {
      const pos = nodePositions[node.id];
      if (!pos) return;
      
      // Node circle
      const nodeRadius = 20 + node.success_rate * 15;
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = node.team === 'RED' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)';
      ctx.fill();
      ctx.strokeStyle = node.color || (node.team === 'RED' ? '#ef4444' : '#3b82f6');
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.name.slice(0, 8), pos.x, pos.y);
      
      // Success rate badge
      ctx.fillStyle = node.success_rate > 0.7 ? '#22c55e' : node.success_rate > 0.4 ? '#f59e0b' : '#ef4444';
      ctx.font = '9px sans-serif';
      ctx.fillText(`${(node.success_rate * 100).toFixed(0)}%`, pos.x, pos.y + nodeRadius + 12);
    });
    
  }, [graph]);
  
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={500}
        height={400}
        className="w-full h-auto rounded-lg bg-neutral-950"
      />
      {hoveredNode && (
        <div className="absolute top-2 left-2 p-2 bg-neutral-800 rounded text-xs">
          <div className="font-semibold text-white">{hoveredNode.name}</div>
          <div className="text-neutral-400">{hoveredNode.personality}</div>
        </div>
      )}
    </div>
  );
};

export const CollaborationGraphPanel = ({ graph }: CollaborationGraphPanelProps) => {
  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
        <div className="flex items-center gap-2 mb-4">
          <Network className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Agent Collaboration Network</h3>
        </div>
        <p className="text-neutral-400 text-center py-8">No collaboration data available</p>
      </div>
    );
  }
  
  // Calculate stats
  const totalEdges = graph.edges.length;
  const avgWeight = totalEdges > 0 
    ? graph.edges.reduce((sum, e) => sum + e.weight, 0) / totalEdges 
    : 0;
  const strongConnections = graph.edges.filter(e => e.weight > 0.7).length;
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Agent Collaboration Network</h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-400">{graph.nodes.length} agents</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400">{strongConnections} strong links</span>
          </div>
        </div>
      </div>
      
      {/* Network Visualization */}
      <NetworkCanvas graph={graph} />
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500" />
          <span>Red Team</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500/50 border border-blue-500" />
          <span>Blue Team</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-cyan-400" />
          <span>Collaboration strength</span>
        </div>
      </div>
      
      {/* Top Collaborations */}
      <div className="mt-4 pt-4 border-t border-neutral-800">
        <div className="text-sm text-neutral-400 mb-2">Top Collaborations</div>
        <div className="grid grid-cols-2 gap-2">
          {graph.edges
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 4)
            .map((edge, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-neutral-800/50 rounded">
                <span className="text-xs text-neutral-300">
                  {edge.source.split('_').pop()} ↔ {edge.target.split('_').pop()}
                </span>
                <span className={`text-xs font-semibold ${
                  edge.weight > 0.7 ? 'text-green-400' : 
                  edge.weight > 0.4 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {(edge.weight * 100).toFixed(0)}%
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CollaborationGraphPanel;
