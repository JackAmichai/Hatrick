/**
 * Feature 6: Chain-of-Thought Panel
 * Displays agent reasoning steps with types and confidence
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Eye, BarChart2, Lightbulb, CheckCircle, ChevronRight } from 'lucide-react';
import type { ChainOfThought, ThoughtStep } from '../../types/orchestration';

interface ChainOfThoughtPanelProps {
  chainOfThought: ChainOfThought | null;
  isThinking: boolean;
}

const thoughtTypeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  observation: {
    icon: <Eye className="w-4 h-4" />,
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    label: 'Observation',
  },
  analysis: {
    icon: <BarChart2 className="w-4 h-4" />,
    color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
    label: 'Analysis',
  },
  hypothesis: {
    icon: <Lightbulb className="w-4 h-4" />,
    color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    label: 'Hypothesis',
  },
  decision: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-green-400 bg-green-500/20 border-green-500/30',
    label: 'Decision',
  },
};

const ThoughtStepCard = ({ step, index, total }: { step: ThoughtStep; index: number; total: number }) => {
  const config = thoughtTypeConfig[step.thought_type] || thoughtTypeConfig.analysis;
  const isLast = index === total - 1;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15 }}
      className="relative"
    >
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-neutral-600 to-neutral-800" />
      )}
      
      <div className="flex gap-4">
        {/* Step Number & Icon */}
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${config.color}`}>
            {config.icon}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-neutral-500">Step {step.step_number}</span>
            <span className={`px-2 py-0.5 rounded text-xs border ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs text-neutral-500">
              {(step.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>
          
          <div className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
            <p className="text-sm text-neutral-200 leading-relaxed">{step.content}</p>
          </div>
          
          {/* Confidence Bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${step.confidence * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.15 + 0.2 }}
                className={`h-full ${
                  step.confidence > 0.7 ? 'bg-green-500' :
                  step.confidence > 0.4 ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ChainOfThoughtPanel = ({ chainOfThought, isThinking }: ChainOfThoughtPanelProps) => {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      <div 
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Chain of Thought</h3>
        </div>
        <div className="flex items-center gap-3">
          {chainOfThought && (
            <>
              <span className="text-xs text-neutral-500">
                {chainOfThought.steps.length} steps
              </span>
              <span className="text-xs text-neutral-500">
                {chainOfThought.total_time_ms}ms
              </span>
            </>
          )}
          <ChevronRight 
            className={`w-5 h-5 text-neutral-500 transition-transform ${expanded ? 'rotate-90' : ''}`} 
          />
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {isThinking && (
              <div className="flex items-center gap-3 py-8 justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Brain className="w-8 h-8 text-purple-400" />
                </motion.div>
                <span className="text-purple-400">Agent reasoning...</span>
              </div>
            )}
            
            {chainOfThought && (
              <>
                {/* Context */}
                <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="text-xs text-purple-400 mb-1">MISSION CONTEXT</div>
                  <p className="text-sm text-neutral-300">{chainOfThought.mission_context}</p>
                </div>
                
                {/* Thought Steps */}
                <div className="space-y-2">
                  {chainOfThought.steps.map((step, index) => (
                    <ThoughtStepCard
                      key={`${step.step_number}-${step.thought_type}`}
                      step={step}
                      index={index}
                      total={chainOfThought.steps.length}
                    />
                  ))}
                </div>
                
                {/* Final Conclusion */}
                {chainOfThought.final_conclusion && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: chainOfThought.steps.length * 0.15 }}
                    className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400 font-semibold">FINAL CONCLUSION</span>
                    </div>
                    <p className="text-sm text-neutral-200">{chainOfThought.final_conclusion}</p>
                  </motion.div>
                )}
              </>
            )}
            
            {!chainOfThought && !isThinking && (
              <p className="text-neutral-400 text-center py-8">No reasoning data available</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChainOfThoughtPanel;
