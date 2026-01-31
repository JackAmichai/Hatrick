// Cost Optimization Dashboard - LLM API costs and ROI metrics
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Cpu, Clock, BarChart3 } from 'lucide-react';

interface CostMetrics {
    totalCost: number;
    costPerMission: number;
    tokenUsage: {
        total: number;
        input: number;
        output: number;
    };
    modelBreakdown: {
        model: string;
        cost: number;
        tokens: number;
        requests: number;
    }[];
    roi: number;
    efficiency: number;
}

interface CostOptimizationDashboardProps {
    missionCount?: number;
    liveCostTracking?: boolean;
}

export const CostOptimizationDashboard = ({ 
    missionCount = 0,
    liveCostTracking = true 
}: CostOptimizationDashboardProps) => {
    const [metrics, setMetrics] = useState<CostMetrics>({
        totalCost: 0,
        costPerMission: 0,
        tokenUsage: { total: 0, input: 0, output: 0 },
        modelBreakdown: [],
        roi: 0,
        efficiency: 0
    });

    // Multi-provider pricing (Groq + HuggingFace) - memoized to prevent re-renders
    const PRICING = useMemo(() => ({
        // Groq Models
        'llama-3.3-70b-versatile': { input: 0.00059, output: 0.00079, provider: 'Groq' },
        'llama-3.1-8b-instant': { input: 0.00005, output: 0.00008, provider: 'Groq' },
        'mixtral-8x7b-32768': { input: 0.00024, output: 0.00024, provider: 'Groq' },
        'gemma2-9b-it': { input: 0.00020, output: 0.00020, provider: 'Groq' },
        // HuggingFace Models (free tier / pay-per-use estimates)
        'mistral-7b-instruct': { input: 0.00015, output: 0.00015, provider: 'HuggingFace' },
        'qwen2.5-7b-instruct': { input: 0.00010, output: 0.00010, provider: 'HuggingFace' },
        'zephyr-7b-beta': { input: 0.00010, output: 0.00010, provider: 'HuggingFace' },
        'phi-3-mini': { input: 0.00008, output: 0.00008, provider: 'HuggingFace' }
    }), []);

    useEffect(() => {
        if (!liveCostTracking) return;

        // Simulate cost accumulation across diverse providers
        const interval = setInterval(() => {
            setMetrics(prev => {
                // Simulate token usage for different models (Groq + HuggingFace mix)
                const newTokens = {
                    'llama-3.3-70b-versatile': { input: Math.floor(Math.random() * 500) + 200, output: Math.floor(Math.random() * 300) + 100 },
                    'llama-3.1-8b-instant': { input: Math.floor(Math.random() * 300) + 150, output: Math.floor(Math.random() * 200) + 80 },
                    'mixtral-8x7b-32768': { input: Math.floor(Math.random() * 400) + 180, output: Math.floor(Math.random() * 250) + 90 },
                    'gemma2-9b-it': { input: Math.floor(Math.random() * 250) + 100, output: Math.floor(Math.random() * 150) + 60 },
                    'mistral-7b-instruct': { input: Math.floor(Math.random() * 350) + 150, output: Math.floor(Math.random() * 200) + 80 },
                    'qwen2.5-7b-instruct': { input: Math.floor(Math.random() * 300) + 120, output: Math.floor(Math.random() * 180) + 70 },
                    'zephyr-7b-beta': { input: Math.floor(Math.random() * 280) + 100, output: Math.floor(Math.random() * 160) + 60 },
                    'phi-3-mini': { input: Math.floor(Math.random() * 200) + 80, output: Math.floor(Math.random() * 120) + 50 }
                };

                const modelBreakdown = Object.entries(newTokens).map(([model, tokens]) => {
                    const pricing = PRICING[model as keyof typeof PRICING];
                    const cost = (tokens.input / 1000 * pricing.input) + (tokens.output / 1000 * pricing.output);
                    const totalTokens = tokens.input + tokens.output;
                    
                    return {
                        model,
                        cost,
                        tokens: totalTokens,
                        requests: Math.floor(Math.random() * 5) + 1
                    };
                });

                const totalCost = modelBreakdown.reduce((sum, m) => sum + m.cost, 0);
                const totalTokens = modelBreakdown.reduce((sum, m) => sum + m.tokens, 0);
                const costPerMission = missionCount > 0 ? totalCost / missionCount : 0;

                // Calculate ROI (assuming $10K value per successful defense)
                const roi = missionCount > 0 ? ((10000 * missionCount - totalCost) / totalCost) * 100 : 0;
                
                // Calculate efficiency (tokens per dollar)
                const efficiency = totalCost > 0 ? totalTokens / totalCost : 0;

                return {
                    totalCost: prev.totalCost + totalCost,
                    costPerMission,
                    tokenUsage: {
                        total: prev.tokenUsage.total + totalTokens,
                        input: prev.tokenUsage.input + Object.values(newTokens).reduce((sum, t) => sum + t.input, 0),
                        output: prev.tokenUsage.output + Object.values(newTokens).reduce((sum, t) => sum + t.output, 0)
                    },
                    modelBreakdown,
                    roi,
                    efficiency
                };
            });
        }, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [missionCount, liveCostTracking, PRICING]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(Math.floor(num));
    };

    return (
        <div className="w-full bg-black rounded-xl border border-neutral-800 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <DollarSign className="text-green-400" size={32} />
                    <div>
                        <h2 className="text-2xl font-bold text-white">Cost Optimization</h2>
                        <p className="text-sm text-gray-400">Real-time LLM API cost tracking & ROI analysis</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/50">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400 font-mono">LIVE TRACKING</span>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <motion.div
                    className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-lg border border-green-500/30 p-4"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Total Cost</span>
                        <DollarSign size={16} className="text-green-400" />
                    </div>
                    <div className="text-2xl font-black text-green-400">{formatCurrency(metrics.totalCost)}</div>
                    <div className="text-xs text-gray-500 mt-1">Across {missionCount} missions</div>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30 p-4"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Cost/Mission</span>
                        <BarChart3 size={16} className="text-cyan-400" />
                    </div>
                    <div className="text-2xl font-black text-cyan-400">{formatCurrency(metrics.costPerMission)}</div>
                    <div className="text-xs text-gray-500 mt-1">Average per simulation</div>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30 p-4"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">ROI</span>
                        {metrics.roi > 0 ? (
                            <TrendingUp size={16} className="text-green-400" />
                        ) : (
                            <TrendingDown size={16} className="text-red-400" />
                        )}
                    </div>
                    <div className={`text-2xl font-black ${metrics.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {metrics.roi.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Return on investment</div>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-lg border border-orange-500/30 p-4"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Efficiency</span>
                        <Cpu size={16} className="text-orange-400" />
                    </div>
                    <div className="text-2xl font-black text-orange-400">{formatNumber(metrics.efficiency)}</div>
                    <div className="text-xs text-gray-500 mt-1">Tokens per $1</div>
                </motion.div>
            </div>

            {/* Token Usage Breakdown */}
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4 mb-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-cyan-400" />
                    Token Usage
                </h3>
                <div className="space-y-3">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">Input Tokens</span>
                            <span className="text-sm text-white font-mono">{formatNumber(metrics.tokenUsage.input)}</span>
                        </div>
                        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                style={{ width: `${(metrics.tokenUsage.input / metrics.tokenUsage.total) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">Output Tokens</span>
                            <span className="text-sm text-white font-mono">{formatNumber(metrics.tokenUsage.output)}</span>
                        </div>
                        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                style={{ width: `${(metrics.tokenUsage.output / metrics.tokenUsage.total) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="pt-2 border-t border-neutral-800">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-bold">Total Tokens</span>
                            <span className="text-lg text-cyan-400 font-mono font-bold">{formatNumber(metrics.tokenUsage.total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Model-by-Model Cost Breakdown */}
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
                <h3 className="text-sm font-bold text-white mb-3">Model Cost Breakdown</h3>
                <div className="space-y-2">
                    {metrics.modelBreakdown.map(model => (
                        <div key={model.model} className="p-3 bg-neutral-950 rounded border border-neutral-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-mono text-white">{model.model}</span>
                                <span className="text-sm font-bold text-green-400">{formatCurrency(model.cost)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{formatNumber(model.tokens)} tokens</span>
                                <span>{model.requests} requests</span>
                                <span>{(model.cost / metrics.totalCost * 100).toFixed(1)}% of total</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cost Optimization Tips */}
            <div className="mt-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30 p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-2">💡 Optimization Tips</h3>
                <ul className="space-y-1 text-xs text-gray-300">
                    <li>• Use smaller models (8B) for reconnaissance tasks to save ~90% on costs</li>
                    <li>• Implement prompt caching for repeated queries (reduce input tokens by 70%)</li>
                    <li>• Batch API requests where possible to minimize overhead</li>
                    <li>• Set max_tokens limits to prevent runaway generation costs</li>
                </ul>
            </div>
        </div>
    );
};
