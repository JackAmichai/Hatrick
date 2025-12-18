/**
 * Feature 15: Cost/Efficiency Dashboard
 * Shows token usage, API costs, and efficiency metrics
 */
import { motion } from 'framer-motion';
import { DollarSign, Zap, TrendingUp, BarChart3, Clock, Coins } from 'lucide-react';
import type { CostMetrics, ModelCost, AgentEfficiency } from '../../types/orchestration';

interface CostDashboardProps {
  metrics: CostMetrics | null;
}

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  color 
}: { 
  icon: typeof DollarSign;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700"
  >
    <div className="flex items-center gap-2 mb-2">
      <div className={`p-1.5 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm text-neutral-400">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    {subValue && (
      <div className="text-xs text-neutral-500 mt-1">{subValue}</div>
    )}
  </motion.div>
);

const ModelCostBar = ({ model }: { model: ModelCost }) => {
  const maxTokens = 100000; // Scale for visualization
  const inputPercent = Math.min((model.input_tokens / maxTokens) * 100, 100);
  const outputPercent = Math.min((model.output_tokens / maxTokens) * 100, 100);
  
  return (
    <div className="p-3 bg-neutral-800/30 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">{model.model_name}</span>
        <span className="text-sm text-green-400">${model.total_cost.toFixed(4)}</span>
      </div>
      
      {/* Token bars */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 w-12">Input</span>
          <div className="flex-1 h-2 bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${inputPercent}%` }}
              className="h-full bg-cyan-500"
            />
          </div>
          <span className="text-xs text-neutral-400 w-16 text-right">
            {model.input_tokens.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 w-12">Output</span>
          <div className="flex-1 h-2 bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${outputPercent}%` }}
              className="h-full bg-amber-500"
            />
          </div>
          <span className="text-xs text-neutral-400 w-16 text-right">
            {model.output_tokens.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="text-xs text-neutral-500 mt-2">
        {model.requests} requests
      </div>
    </div>
  );
};

const EfficiencyRow = ({ efficiency }: { efficiency: AgentEfficiency }) => {
  const efficiencyColor = 
    efficiency.efficiency_score >= 80 ? 'text-green-400' :
    efficiency.efficiency_score >= 60 ? 'text-amber-400' : 'text-red-400';
  
  return (
    <div className="flex items-center justify-between p-2 bg-neutral-800/30 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm text-white">{efficiency.agent_id.replace(/_/g, ' ')}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-xs text-neutral-500">Avg response</div>
          <div className="text-sm text-cyan-400">{efficiency.avg_response_time_ms}ms</div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-neutral-500">Cost/task</div>
          <div className="text-sm text-green-400">${efficiency.cost_per_task.toFixed(4)}</div>
        </div>
        
        <div className="w-16 text-right">
          <div className="text-xs text-neutral-500">Score</div>
          <div className={`text-sm font-bold ${efficiencyColor}`}>
            {efficiency.efficiency_score}%
          </div>
        </div>
      </div>
    </div>
  );
};

export const CostDashboard = ({ metrics }: CostDashboardProps) => {
  if (!metrics) {
    return (
      <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Cost & Efficiency</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
          <BarChart3 className="w-8 h-8 mb-2 opacity-50" />
          <p>No cost data available</p>
          <p className="text-xs mt-1">Metrics will appear after agent operations</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Cost & Efficiency Dashboard</h3>
        </div>
        <span className="text-sm text-neutral-500">
          Session: {new Date(metrics.session_start).toLocaleTimeString()}
        </span>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={DollarSign}
          label="Total Cost"
          value={`$${metrics.total_cost.toFixed(4)}`}
          subValue={`${metrics.total_requests} requests`}
          color="bg-green-500/20 text-green-400"
        />
        <StatCard
          icon={Coins}
          label="Tokens Used"
          value={metrics.total_tokens.toLocaleString()}
          subValue="Input + Output"
          color="bg-cyan-500/20 text-cyan-400"
        />
        <StatCard
          icon={Zap}
          label="Avg Response"
          value={`${metrics.avg_response_time_ms}ms`}
          subValue="Mean latency"
          color="bg-amber-500/20 text-amber-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Efficiency"
          value={`${Math.round(metrics.overall_efficiency)}%`}
          subValue="Cost efficiency"
          color="bg-purple-500/20 text-purple-400"
        />
      </div>
      
      {/* Model breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Cost by Model
        </h4>
        <div className="space-y-2">
          {metrics.by_model.map((model) => (
            <ModelCostBar key={model.model_name} model={model} />
          ))}
        </div>
      </div>
      
      {/* Agent efficiency */}
      <div>
        <h4 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Agent Efficiency Rankings
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {metrics.agent_efficiency
            .sort((a, b) => b.efficiency_score - a.efficiency_score)
            .map((efficiency) => (
              <EfficiencyRow key={efficiency.agent_id} efficiency={efficiency} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default CostDashboard;
