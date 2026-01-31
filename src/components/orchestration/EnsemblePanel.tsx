/**
 * Feature 10: Ensemble Decision Panel
 * Shows multi-model variance analysis
 */
import { motion } from 'framer-motion';
import { Layers, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import type { EnsembleDecision } from '../../types/orchestration';

interface EnsemblePanelProps {
  ensemble: EnsembleDecision | null;
}

export const EnsemblePanel = ({ ensemble }: EnsemblePanelProps) => {
  if (!ensemble) {
    return (
      <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Multi-Model Ensemble</h3>
        </div>
        <p className="text-neutral-400 text-center py-8">No ensemble data available</p>
      </div>
    );
  }
  
  const isHighAgreement = ensemble.agreement_score > 0.7;
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Multi-Model Ensemble</h3>
        </div>
        <span className="text-sm text-neutral-400">
          {ensemble.model_count} models queried
        </span>
      </div>
      
      {/* Agreement Status */}
      <div className={`p-4 rounded-lg mb-4 ${
        isHighAgreement ? 'bg-green-500/10 border border-green-500/30' : 'bg-amber-500/10 border border-amber-500/30'
      }`}>
        <div className="flex items-center gap-2">
          {isHighAgreement ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          )}
          <span className={`font-semibold ${isHighAgreement ? 'text-green-400' : 'text-amber-400'}`}>
            {ensemble.recommendation}
          </span>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-neutral-800/50 rounded-lg">
          <div className="text-xs text-neutral-500 mb-1">Mean Impact</div>
          <div className="text-2xl font-bold text-white">{ensemble.mean_impact}%</div>
        </div>
        <div className="p-3 bg-neutral-800/50 rounded-lg">
          <div className="text-xs text-neutral-500 mb-1">Mean Confidence</div>
          <div className="text-2xl font-bold text-cyan-400">{(ensemble.mean_confidence * 100).toFixed(0)}%</div>
        </div>
        <div className="p-3 bg-neutral-800/50 rounded-lg">
          <div className="text-xs text-neutral-500 mb-1">Impact Variance</div>
          <div className={`text-2xl font-bold ${ensemble.impact_variance < 50 ? 'text-green-400' : 'text-amber-400'}`}>
            ±{ensemble.impact_variance.toFixed(1)}
          </div>
        </div>
        <div className="p-3 bg-neutral-800/50 rounded-lg">
          <div className="text-xs text-neutral-500 mb-1">Agreement Score</div>
          <div className={`text-2xl font-bold ${isHighAgreement ? 'text-green-400' : 'text-amber-400'}`}>
            {(ensemble.agreement_score * 100).toFixed(0)}%
          </div>
        </div>
      </div>
      
      {/* Variance Visualization */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-neutral-400">Model Agreement Visualization</span>
        </div>
        <div className="h-8 bg-neutral-800 rounded-lg overflow-hidden flex items-center px-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${ensemble.agreement_score * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-4 rounded ${isHighAgreement ? 'bg-green-500' : 'bg-amber-500'}`}
          />
          <span className="ml-2 text-xs text-neutral-400">
            {isHighAgreement ? 'Strong consensus' : 'Models disagree'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EnsemblePanel;
