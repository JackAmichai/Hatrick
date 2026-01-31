// Attack Impact Prediction - AI-powered damage forecasting
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Shield, Target } from 'lucide-react';

interface ImpactPrediction {
    attackName: string;
    predictedDamage: number;
    confidence: number;
    timeline: {
        immediate: string;
        shortTerm: string;
        longTerm: string;
    };
    affectedSystems: string[];
    mitigationOptions: {
        name: string;
        effectiveness: number;
        cost: string;
    }[];
    riskFactors: {
        factor: string;
        severity: 'critical' | 'high' | 'medium' | 'low';
        impact: number;
    }[];
}

interface AttackImpactPredictorProps {
    attackType: string;
    targetSystem: string;
    onPredictionComplete?: (prediction: ImpactPrediction) => void;
}

export const AttackImpactPredictor = ({ 
    attackType, 
    targetSystem,
    onPredictionComplete 
}: AttackImpactPredictorProps) => {
    const [analyzing, setAnalyzing] = useState(true);
    const [progress, setProgress] = useState(0);
    const [prediction, setPrediction] = useState<ImpactPrediction | null>(null);

    useEffect(() => {
        // Simulate AI analysis
        setAnalyzing(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    
                    // Generate prediction based on attack type
                    const newPrediction = generatePrediction(attackType, targetSystem);
                    setPrediction(newPrediction);
                    setAnalyzing(false);
                    
                    if (onPredictionComplete) {
                        onPredictionComplete(newPrediction);
                    }
                    
                    return 100;
                }
                return prev + 5;
            });
        }, 100);

        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attackType, targetSystem]);

    const generatePrediction = (attack: string, system: string): ImpactPrediction => {
        const predictions: Record<string, Partial<ImpactPrediction>> = {
            'DDoS': {
                predictedDamage: 75,
                confidence: 92,
                timeline: {
                    immediate: 'Service degradation within 30 seconds',
                    shortTerm: 'Complete service outage in 2-5 minutes',
                    longTerm: 'Potential revenue loss: $50K-$200K/hour'
                },
                affectedSystems: ['Web Server', 'API Gateway', 'Load Balancer'],
                mitigationOptions: [
                    { name: 'Rate Limiting', effectiveness: 65, cost: 'Low' },
                    { name: 'CDN Protection', effectiveness: 85, cost: 'Medium' },
                    { name: 'Cloud-based WAF', effectiveness: 95, cost: 'High' }
                ],
                riskFactors: [
                    { factor: 'No rate limiting configured', severity: 'critical', impact: 35 },
                    { factor: 'Single point of failure', severity: 'high', impact: 25 },
                    { factor: 'Limited bandwidth capacity', severity: 'medium', impact: 15 }
                ]
            },
            'SQL Injection': {
                predictedDamage: 95,
                confidence: 88,
                timeline: {
                    immediate: 'Database access gained in 10-30 seconds',
                    shortTerm: 'Full data exfiltration possible within 5 minutes',
                    longTerm: 'Regulatory fines: $500K-$5M, reputation damage'
                },
                affectedSystems: ['PostgreSQL Database', 'User Data', 'Payment Records'],
                mitigationOptions: [
                    { name: 'Parameterized Queries', effectiveness: 98, cost: 'Low' },
                    { name: 'Input Validation', effectiveness: 85, cost: 'Low' },
                    { name: 'WAF SQL Rules', effectiveness: 90, cost: 'Medium' }
                ],
                riskFactors: [
                    { factor: 'Unvalidated user inputs', severity: 'critical', impact: 40 },
                    { factor: 'Sensitive data unencrypted', severity: 'critical', impact: 35 },
                    { factor: 'Admin privileges on DB user', severity: 'high', impact: 20 }
                ]
            },
            'Buffer Overflow': {
                predictedDamage: 88,
                confidence: 85,
                timeline: {
                    immediate: 'Memory corruption within seconds',
                    shortTerm: 'Arbitrary code execution possible in 1-2 minutes',
                    longTerm: 'Full system compromise, persistent backdoor installation'
                },
                affectedSystems: ['Application Server', 'System Memory', 'Process Stack'],
                mitigationOptions: [
                    { name: 'ASLR + DEP', effectiveness: 80, cost: 'Low' },
                    { name: 'Stack Canaries', effectiveness: 75, cost: 'Low' },
                    { name: 'Code Rewrite', effectiveness: 100, cost: 'High' }
                ],
                riskFactors: [
                    { factor: 'No memory protection', severity: 'critical', impact: 45 },
                    { factor: 'Legacy C/C++ code', severity: 'high', impact: 25 },
                    { factor: 'User-supplied input unchecked', severity: 'high', impact: 18 }
                ]
            }
        };

        const base = predictions[attack] || predictions['DDoS'];
        
        return {
            attackName: attack,
            predictedDamage: base.predictedDamage || 70,
            confidence: base.confidence || 85,
            timeline: base.timeline || {
                immediate: 'Impact expected within minutes',
                shortTerm: 'System degradation likely',
                longTerm: 'Recovery may take hours'
            },
            affectedSystems: base.affectedSystems || [system],
            mitigationOptions: base.mitigationOptions || [],
            riskFactors: base.riskFactors || []
        };
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/50';
            case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
            case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/50';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
        }
    };

    return (
        <div className="w-full bg-black rounded-xl border border-neutral-800 p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Brain className="text-purple-400" size={32} />
                <div>
                    <h2 className="text-2xl font-bold text-white">AI Impact Prediction</h2>
                    <p className="text-sm text-gray-400">Neural network-based attack forecasting</p>
                </div>
            </div>

            {/* Analysis Progress */}
            {analyzing && (
                <motion.div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400 font-mono">Analyzing attack vectors...</span>
                        <span className="text-sm text-cyan-400 font-mono">{progress}%</span>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <div className="mt-2 space-y-1">
                        {[
                            'Scanning vulnerability database...',
                            'Analyzing historical attack patterns...',
                            'Calculating system resilience...',
                            'Predicting cascading failures...',
                            'Generating mitigation recommendations...'
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                className="text-xs text-gray-500 font-mono"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: progress > i * 20 ? 1 : 0.3 }}
                            >
                                {progress > i * 20 ? '✓' : '○'} {step}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Prediction Results */}
            {prediction && !analyzing && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Damage Prediction */}
                    <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/30 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Target className="text-red-400" />
                                <h3 className="text-lg font-bold text-white">Predicted Impact</h3>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-red-400">{prediction.predictedDamage}%</div>
                                <div className="text-xs text-gray-400">Damage Potential</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">AI Confidence:</span>
                            <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                                    style={{ width: `${prediction.confidence}%` }}
                                />
                            </div>
                            <span className="text-cyan-400 font-mono">{prediction.confidence}%</span>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <TrendingUp size={16} className="text-yellow-400" />
                            Impact Timeline
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(prediction.timeline).map(([phase, desc]) => (
                                <div key={phase} className="flex gap-3">
                                    <div className="text-xs font-bold text-cyan-400 uppercase w-24">{phase}:</div>
                                    <div className="text-xs text-gray-300 flex-1">{desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Affected Systems */}
                    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
                        <h3 className="text-sm font-bold text-white mb-3">Affected Systems</h3>
                        <div className="flex flex-wrap gap-2">
                            {prediction.affectedSystems.map(system => (
                                <span key={system} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-mono border border-red-500/30">
                                    {system}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Risk Factors */}
                    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <AlertTriangle size={16} className="text-orange-400" />
                            Risk Factors
                        </h3>
                        <div className="space-y-2">
                            {prediction.riskFactors.map((risk, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-neutral-950 rounded border border-neutral-800">
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getSeverityColor(risk.severity)}`}>
                                            {risk.severity}
                                        </span>
                                        <span className="text-sm text-gray-300">{risk.factor}</span>
                                    </div>
                                    <span className="text-sm text-red-400 font-mono">+{risk.impact}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mitigation Options */}
                    <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-lg border border-green-500/30 p-4">
                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <Shield size={16} className="text-green-400" />
                            Recommended Mitigations
                        </h3>
                        <div className="space-y-3">
                            {prediction.mitigationOptions.map((option, i) => (
                                <div key={i} className="p-3 bg-neutral-900 rounded border border-neutral-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-white">{option.name}</span>
                                        <span className="text-xs text-gray-400 px-2 py-1 bg-neutral-800 rounded">{option.cost} Cost</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
                                                style={{ width: `${option.effectiveness}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-green-400 font-mono">{option.effectiveness}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
