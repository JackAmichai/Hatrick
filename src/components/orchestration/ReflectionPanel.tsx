/**
 * Feature 11: Self-Reflection Panel
 * Shows agent self-critique and improvement suggestions
 */
import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle, CheckCircle, Lightbulb, TrendingDown, TrendingUp } from 'lucide-react';
import type { AgentReflection, ReflectionImprovement } from '../../types/orchestration';

interface ReflectionPanelProps {
  reflection: AgentReflection | null;
  isReflecting: boolean;
}

const ImprovementCard = ({ improvement, index }: { improvement: ReflectionImprovement; index: number }) => {
  const typeColors: Record<string, string> = {
    brevity: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    verbosity: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    specificity: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    error_present: 'bg-red-500/20 border-red-500/30 text-red-400',
  };
  
  const colorClass = typeColors[improvement.type] || typeColors.specificity;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-3 rounded-lg border ${colorClass}`}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-sm font-medium">{improvement.issue}</div>
          <div className="text-xs mt-1 opacity-80">
            <Lightbulb className="w-3 h-3 inline mr-1" />
            {improvement.suggestion}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ReflectionPanel = ({ reflection, isReflecting }: ReflectionPanelProps) => {
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className={`w-5 h-5 text-teal-400 ${isReflecting ? 'animate-spin' : ''}`} />
        <h3 className="text-lg font-bold text-white">Agent Self-Reflection</h3>
      </div>
      
      {isReflecting && (
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="w-8 h-8 text-teal-400" />
          </motion.div>
          <span className="ml-3 text-teal-400">Agent analyzing output...</span>
        </div>
      )}
      
      {reflection && !isReflecting && (
        <>
          {/* Quality Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-400">Output Quality</span>
              <span className={`text-sm font-semibold ${
                reflection.quality_score > 0.7 ? 'text-green-400' :
                reflection.quality_score > 0.4 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {(reflection.quality_score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${reflection.quality_score * 100}%` }}
                transition={{ duration: 0.5 }}
                className={`h-full ${
                  reflection.quality_score > 0.7 ? 'bg-green-500' :
                  reflection.quality_score > 0.4 ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
            </div>
          </div>
          
          {/* Self Critique */}
          <div className={`p-4 rounded-lg mb-4 ${
            reflection.quality_score > 0.7 
              ? 'bg-green-500/10 border border-green-500/30' 
              : 'bg-neutral-800/50 border border-neutral-700'
          }`}>
            <div className="flex items-start gap-2">
              {reflection.quality_score > 0.7 ? (
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
              )}
              <div>
                <div className="text-xs text-neutral-500 mb-1">SELF-CRITIQUE</div>
                <p className="text-sm text-neutral-200">{reflection.self_critique}</p>
              </div>
            </div>
          </div>
          
          {/* Confidence Adjustment */}
          {reflection.confidence_adjustment !== 0 && (
            <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
              reflection.confidence_adjustment > 0 
                ? 'bg-green-500/10 text-green-400' 
                : 'bg-red-500/10 text-red-400'
            }`}>
              {reflection.confidence_adjustment > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm">
                Confidence adjustment: {reflection.confidence_adjustment > 0 ? '+' : ''}{(reflection.confidence_adjustment * 100).toFixed(0)}%
              </span>
            </div>
          )}
          
          {/* Improvements */}
          {reflection.improvements.length > 0 ? (
            <div>
              <div className="text-sm text-neutral-400 mb-2">Areas for Improvement:</div>
              <div className="space-y-2">
                {reflection.improvements.map((improvement, i) => (
                  <ImprovementCard key={i} improvement={improvement} index={i} />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>No improvements needed - output meets quality standards</span>
              </div>
            </div>
          )}
        </>
      )}
      
      {!reflection && !isReflecting && (
        <p className="text-neutral-400 text-center py-8">No reflection data available</p>
      )}
    </div>
  );
};

export default ReflectionPanel;
