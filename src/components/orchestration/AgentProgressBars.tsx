/**
 * Feature 12: Async Execution Progress
 * Shows real-time progress bars for parallel agent execution
 */
import { motion } from 'framer-motion';
import { Activity, Clock, CheckCircle, Loader } from 'lucide-react';
import type { ExecutionStatus, ActiveTask } from '../../types/orchestration';

interface AgentProgressBarsProps {
  status: ExecutionStatus | null;
}

const TaskProgressBar = ({ task }: { task: ActiveTask }) => {
  const isComplete = task.progress >= 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg"
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isComplete ? 'bg-green-500/20' : 'bg-cyan-500/20'
      }`}>
        {isComplete ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader className="w-4 h-4 text-cyan-400" />
          </motion.div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-white">
            {task.agent_id.replace('_', ' ')}
          </span>
          <span className="text-xs text-neutral-400">
            {task.elapsed_ms}ms
          </span>
        </div>
        
        <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${task.progress}%` }}
            transition={{ duration: 0.3 }}
            className={`h-full ${isComplete ? 'bg-green-500' : 'bg-cyan-500'}`}
          />
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-neutral-500">{task.progress}%</span>
          {!isComplete && (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xs text-cyan-400"
            >
              Processing...
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const AgentProgressBars = ({ status }: AgentProgressBarsProps) => {
  const hasActiveTasks = status && status.active_count > 0;
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className={`w-5 h-5 text-cyan-400 ${hasActiveTasks ? 'animate-pulse' : ''}`} />
          <h3 className="text-lg font-bold text-white">Parallel Execution</h3>
        </div>
        {status && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Loader className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400">{status.active_count} active</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400">{status.completed_count} completed</span>
            </div>
          </div>
        )}
      </div>
      
      {hasActiveTasks ? (
        <div className="space-y-3">
          {status.active_tasks.map((task) => (
            <TaskProgressBar key={task.task_id} task={task} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
          <Clock className="w-8 h-8 mb-2 opacity-50" />
          <p>No active tasks</p>
          {status && status.completed_count > 0 && (
            <p className="text-xs mt-1">{status.completed_count} tasks completed</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentProgressBars;
