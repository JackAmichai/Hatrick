/**
 * Feature 27: Risk Scoring Visualization
 * Risk matrix and scoring display
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Zap,
  Activity
} from 'lucide-react';
import type { 
  RiskCategory,
  RiskScore,
  RiskMatrixData 
} from '../../types/cyber';

interface RiskScoringPanelProps {
  scores: RiskScore[];
  matrixData: RiskMatrixData | null;
  onRiskClick?: (riskId: string) => void;
}

const categoryColors: Record<RiskCategory, string> = {
  critical: 'bg-red-600',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
  minimal: 'bg-blue-500',
};

const categoryTextColors: Record<RiskCategory, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-green-400',
  minimal: 'text-blue-400',
};

const trendIcons = {
  increasing: TrendingUp,
  decreasing: TrendingDown,
  stable: Minus,
};

const trendColors = {
  increasing: 'text-red-400',
  decreasing: 'text-green-400',
  stable: 'text-neutral-400',
};

const RiskMatrix = ({ data }: { data: RiskMatrixData }) => {
  // 5x5 risk matrix
  const likelihoodLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Certain'];
  const impactLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Severe'];
  
  const getCellColor = (likelihood: number, impact: number): string => {
    const score = likelihood * impact;
    if (score >= 20) return 'bg-red-600';
    if (score >= 12) return 'bg-orange-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 3) return 'bg-green-500';
    return 'bg-blue-500';
  };
  
  const getRisksInCell = (likelihood: number, impact: number) => {
    return data.risks.filter(r => 
      r.likelihood === likelihood && r.impact === impact
    );
  };
  
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[400px]">
        {/* Y-axis label */}
        <div className="flex">
          <div className="w-24 flex items-center justify-center">
            <span className="text-xs text-neutral-500 -rotate-90 whitespace-nowrap">Likelihood →</span>
          </div>
          <div className="flex-1">
            {/* Matrix grid */}
            <div className="grid gap-1">
              {[5, 4, 3, 2, 1].map(likelihood => (
                <div key={likelihood} className="flex gap-1">
                  <div className="w-16 flex items-center justify-end pr-2">
                    <span className="text-xs text-neutral-400">{likelihoodLabels[likelihood - 1]}</span>
                  </div>
                  {[1, 2, 3, 4, 5].map(impact => {
                    const cellRisks = getRisksInCell(likelihood, impact);
                    return (
                      <motion.div
                        key={`${likelihood}-${impact}`}
                        whileHover={{ scale: 1.05 }}
                        className={`w-16 h-16 rounded flex items-center justify-center cursor-pointer ${getCellColor(likelihood, impact)} bg-opacity-60 hover:bg-opacity-80 transition-opacity`}
                        title={`${likelihoodLabels[likelihood - 1]} × ${impactLabels[impact - 1]}: ${cellRisks.length} risks`}
                      >
                        {cellRisks.length > 0 && (
                          <span className="text-white font-bold text-lg">{cellRisks.length}</span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ))}
              {/* X-axis labels */}
              <div className="flex gap-1 mt-1">
                <div className="w-16" />
                {impactLabels.map(label => (
                  <div key={label} className="w-16 text-center">
                    <span className="text-xs text-neutral-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-neutral-500">Impact →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RiskCard = ({ risk, onClick }: { risk: RiskScore; onClick?: () => void }) => {
  const TrendIcon = trendIcons[risk.trend];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
        risk.category === 'critical' 
          ? 'bg-red-500/10 border-red-500/30' 
          : risk.category === 'high'
            ? 'bg-orange-500/10 border-orange-500/30'
            : 'bg-neutral-800/50 border-neutral-700'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${categoryColors[risk.category]}`} />
          <span className={`text-sm font-medium uppercase ${categoryTextColors[risk.category]}`}>
            {risk.category}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <TrendIcon className={`w-4 h-4 ${trendColors[risk.trend]}`} />
          <span className={`text-xs ${trendColors[risk.trend]}`}>{risk.trend}</span>
        </div>
      </div>
      
      <h4 className="font-medium text-white mb-1">{risk.name}</h4>
      <p className="text-sm text-neutral-400 mb-3">{risk.description}</p>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex gap-3">
          <span className="text-neutral-500">
            Likelihood: <span className="text-white">{risk.likelihood}/5</span>
          </span>
          <span className="text-neutral-500">
            Impact: <span className="text-white">{risk.impact}/5</span>
          </span>
        </div>
        <span className={`text-lg font-bold ${categoryTextColors[risk.category]}`}>
          {risk.score}
        </span>
      </div>
      
      {/* Mitigations */}
      {risk.mitigations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-700">
          <div className="flex items-center gap-1 mb-1">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span className="text-xs text-cyan-400">Mitigations</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {risk.mitigations.slice(0, 3).map(m => (
              <span key={m} className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const RiskScoringPanel = ({ 
  scores, 
  matrixData,
  onRiskClick 
}: RiskScoringPanelProps) => {
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');
  const [categoryFilter, setCategoryFilter] = useState<RiskCategory | 'ALL'>('ALL');
  
  const filteredScores = useMemo(() => {
    return scores.filter(s => 
      categoryFilter === 'ALL' || s.category === categoryFilter
    ).sort((a, b) => b.score - a.score);
  }, [scores, categoryFilter]);
  
  const stats = useMemo(() => ({
    total: scores.length,
    critical: scores.filter(s => s.category === 'critical').length,
    high: scores.filter(s => s.category === 'high').length,
    medium: scores.filter(s => s.category === 'medium').length,
    avgScore: scores.length > 0 
      ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1)
      : '0',
    increasing: scores.filter(s => s.trend === 'increasing').length,
  }), [scores]);
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Risk Scoring</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {stats.critical > 0 && (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-sm">
              {stats.critical} Critical
            </span>
          )}
          {stats.increasing > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-sm">
              <TrendingUp className="w-3 h-3" />
              {stats.increasing} Rising
            </span>
          )}
        </div>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {(['critical', 'high', 'medium', 'low', 'minimal'] as RiskCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(categoryFilter === cat ? 'ALL' : cat)}
            className={`p-2 rounded-lg border text-center transition-all ${
              categoryFilter === cat 
                ? 'bg-cyan-500/20 border-cyan-500/50' 
                : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-600'
            }`}
          >
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${categoryColors[cat]}`} />
            <div className={`text-lg font-bold ${categoryTextColors[cat]}`}>
              {scores.filter(s => s.category === cat).length}
            </div>
            <div className="text-xs text-neutral-500 capitalize">{cat}</div>
          </button>
        ))}
      </div>
      
      {/* View toggle */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1 p-1 bg-neutral-800 rounded-lg">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === 'matrix' 
                ? 'bg-cyan-600 text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Risk Matrix
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === 'list' 
                ? 'bg-cyan-600 text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Risk List
          </button>
        </div>
        
        <div className="text-sm text-neutral-400">
          Average Score: <span className="text-white font-medium">{stats.avgScore}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-h-[500px] overflow-y-auto pr-2">
        {viewMode === 'matrix' && matrixData ? (
          <RiskMatrix data={matrixData} />
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredScores.length > 0 ? (
              filteredScores.map(risk => (
                <RiskCard 
                  key={risk.id} 
                  risk={risk} 
                  onClick={() => onRiskClick?.(risk.id)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                <Target className="w-8 h-8 mb-2 opacity-50" />
                <p>No risks match filters</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <Activity className="w-8 h-8 mb-2 opacity-50" />
            <p>No risk matrix data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskScoringPanel;
