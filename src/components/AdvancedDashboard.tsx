import { useState, useEffect } from 'react';
import { Shield, Activity, Cloud, Lock, AlertTriangle, BarChart3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdvancedDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AdvancedDashboard = ({ isOpen, onClose }: AdvancedDashboardProps) => {
    const [activeTab, setActiveTab] = useState<'defense' | 'intel' | 'compliance'>('defense');
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen, activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 
                (import.meta.env.DEV ? "http://localhost:8000" : "https://hatrick.onrender.com");
            
            if (activeTab === 'defense') {
                const [deception, zeroTrust, network] = await Promise.all([
                    fetch(`${backendUrl}/api/deception/status`).then(r => r.json()),
                    fetch(`${backendUrl}/api/zero-trust/policies`).then(r => r.json()),
                    fetch(`${backendUrl}/api/network/segmentation`).then(r => r.json())
                ]);
                setData({ deception, zeroTrust, network });
            } else if (activeTab === 'intel') {
                const [threatIntel, iot, cloud] = await Promise.all([
                    fetch(`${backendUrl}/api/threat-intel`).then(r => r.json()),
                    fetch(`${backendUrl}/api/iot/devices`).then(r => r.json()),
                    fetch(`${backendUrl}/api/cloud/misconfigurations`).then(r => r.json())
                ]);
                setData({ threatIntel, iot, cloud });
            } else {
                const [compliance, dlp] = await Promise.all([
                    fetch(`${backendUrl}/api/compliance/gdpr`).then(r => r.json()),
                    fetch(`${backendUrl}/api/dlp/scan`).then(r => r.json())
                ]);
                setData({ compliance, dlp });
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-indigo-900/20 to-neutral-900 border-2 border-indigo-500/50 rounded-xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-indigo-500/30 bg-indigo-950/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="text-indigo-400" size={24} />
                                    <h2 className="text-2xl font-bold text-indigo-400">
                                        Advanced Security Dashboard
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setActiveTab('defense')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                        activeTab === 'defense'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    <Shield size={16} className="inline mr-2" />
                                    Defense Systems
                                </button>
                                <button
                                    onClick={() => setActiveTab('intel')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                        activeTab === 'intel'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    <Activity size={16} className="inline mr-2" />
                                    Threat Intelligence
                                </button>
                                <button
                                    onClick={() => setActiveTab('compliance')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                        activeTab === 'compliance'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    <Lock size={16} className="inline mr-2" />
                                    Compliance & DLP
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-auto max-h-[calc(90vh-180px)] p-6">
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'defense' && (
                                        <div className="space-y-6">
                                            {/* Deception Technology */}
                                            {data.deception && (
                                                <div className="bg-white/5 p-5 rounded-lg border border-white/10">
                                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                                        <AlertTriangle className="text-yellow-400" />
                                                        Deception Layer
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <div className="text-sm text-gray-400 mb-1">Active Decoys</div>
                                                            <div className="text-2xl font-bold text-white">{data.deception.total_decoys}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm text-gray-400 mb-1">Alerts Triggered</div>
                                                            <div className="text-2xl font-bold text-red-400">{data.deception.alerts_triggered}</div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 space-y-2">
                                                        {data.deception.deployed_decoys?.map((decoy: any, idx: number) => (
                                                            <div key={idx} className="p-3 bg-white/5 rounded border-l-4 border-yellow-500">
                                                                <div className="font-semibold text-white">{decoy.service}</div>
                                                                <div className="text-xs text-gray-400 mt-1">{decoy.purpose} • {decoy.location}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Zero Trust */}
                                            {data.zeroTrust && (
                                                <div className="bg-white/5 p-5 rounded-lg border border-white/10">
                                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                                        <Lock className="text-green-400" />
                                                        Zero Trust Architecture
                                                    </h3>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-400">Trust Score</span>
                                                            <span className="text-xl font-bold text-green-400">
                                                                {(data.zeroTrust.trust_score * 100).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                                                                style={{ width: `${data.zeroTrust.trust_score * 100}%` }}
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                                            <div className="p-2 bg-green-500/20 rounded text-sm">
                                                                ✓ MFA Enabled
                                                            </div>
                                                            <div className="p-2 bg-green-500/20 rounded text-sm">
                                                                ✓ Device Health Checks
                                                            </div>
                                                            <div className="p-2 bg-green-500/20 rounded text-sm">
                                                                ✓ Microsegmentation
                                                            </div>
                                                            <div className="p-2 bg-green-500/20 rounded text-sm">
                                                                ✓ JIT Access
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Network Segmentation */}
                                            {data.network && (
                                                <div className="bg-white/5 p-5 rounded-lg border border-white/10">
                                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                                        <Cloud className="text-blue-400" />
                                                        Network Segmentation
                                                    </h3>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {Object.entries(data.network.zones || {}).map(([key, zone]: [string, any]) => (
                                                            <div key={key} className="p-3 bg-white/5 rounded border border-white/10">
                                                                <div className="text-xs text-gray-400 mb-1">{zone.name}</div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-3 h-3 rounded-full ${
                                                                        zone.trust_level > 7 ? 'bg-green-500' :
                                                                        zone.trust_level > 4 ? 'bg-yellow-500' :
                                                                        'bg-red-500'
                                                                    }`} />
                                                                    <span className="text-white font-semibold">L{zone.trust_level}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'intel' && (
                                        <div className="space-y-6">
                                            {/* Threat Intel */}
                                            {data.threatIntel && (
                                                <div className="bg-white/5 p-5 rounded-lg border border-white/10">
                                                    <h3 className="text-lg font-bold text-white mb-3">Latest Threat Intelligence</h3>
                                                    <div className="space-y-3">
                                                        {data.threatIntel.indicators_of_compromise?.map((ioc: any, idx: number) => (
                                                            <div key={idx} className={`p-3 rounded border-l-4 ${
                                                                ioc.threat_level === 'CRITICAL' ? 'border-red-500 bg-red-500/10' :
                                                                ioc.threat_level === 'HIGH' ? 'border-orange-500 bg-orange-500/10' :
                                                                'border-yellow-500 bg-yellow-500/10'
                                                            }`}>
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <div className="font-semibold text-white">{ioc.type}</div>
                                                                        <div className="text-sm text-gray-300 mt-1 font-mono">{ioc.value}</div>
                                                                        <div className="text-xs text-gray-400 mt-2">
                                                                            Associated: {ioc.associated_malware || ioc.associated_campaign}
                                                                        </div>
                                                                    </div>
                                                                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                                                                        ioc.threat_level === 'CRITICAL' ? 'bg-red-600' :
                                                                        ioc.threat_level === 'HIGH' ? 'bg-orange-600' :
                                                                        'bg-yellow-600'
                                                                    }`}>
                                                                        {ioc.threat_level}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Latest CVEs */}
                                                    <div className="mt-6">
                                                        <h4 className="font-bold text-white mb-3">Recent CVEs</h4>
                                                        <div className="space-y-2">
                                                            {data.threatIntel.latest_cves?.map((cve: any, idx: number) => (
                                                                <div key={idx} className="p-3 bg-white/5 rounded">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <span className="font-bold text-white">{cve.cve_id}</span>
                                                                            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                                                                cve.cvss_score >= 9 ? 'bg-red-600' :
                                                                                cve.cvss_score >= 7 ? 'bg-orange-600' :
                                                                                'bg-yellow-600'
                                                                            }`}>
                                                                                CVSS {cve.cvss_score}
                                                                            </span>
                                                                            <p className="text-sm text-gray-300 mt-1">{cve.description}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'compliance' && (
                                        <div className="space-y-6">
                                            {/* Compliance Status */}
                                            {data.compliance && (
                                                <div className="bg-white/5 p-5 rounded-lg border border-white/10">
                                                    <h3 className="text-lg font-bold text-white mb-3">{data.compliance.framework} Compliance</h3>
                                                    <div className="mb-4">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-gray-400">Overall Score</span>
                                                            <span className="text-2xl font-bold text-green-400">
                                                                {(data.compliance.overall_score * 100).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full ${
                                                                    data.compliance.overall_score > 0.8 ? 'bg-green-500' :
                                                                    data.compliance.overall_score > 0.6 ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                                }`}
                                                                style={{ width: `${data.compliance.overall_score * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {data.compliance.compliance_status?.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded">
                                                                <span className="text-sm text-gray-300">{item.requirement}</span>
                                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                                    item.status === 'COMPLIANT' ? 'bg-green-600' :
                                                                    item.status === 'PARTIALLY COMPLIANT' ? 'bg-yellow-600' :
                                                                    'bg-red-600'
                                                                }`}>
                                                                    {item.status}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* DLP */}
                                            {data.dlp && (
                                                <div className="bg-white/5 p-5 rounded-lg border border-white/10">
                                                    <h3 className="text-lg font-bold text-white mb-3">Data Loss Prevention</h3>
                                                    <div className="mb-4">
                                                        <div className="text-sm text-gray-400 mb-1">Prevention Rate</div>
                                                        <div className="text-2xl font-bold text-green-400">
                                                            {(data.dlp.prevention_rate * 100).toFixed(0)}%
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {data.dlp.violations?.map((violation: any, idx: number) => (
                                                            <div key={idx} className={`p-3 rounded border-l-4 ${
                                                                violation.blocked ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'
                                                            }`}>
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className="font-semibold text-white">{violation.type}</span>
                                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                                        violation.blocked ? 'bg-green-600' : 'bg-red-600'
                                                                    }`}>
                                                                        {violation.blocked ? 'BLOCKED' : 'ALLOWED'}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm text-gray-300">{violation.action}</div>
                                                                <div className="text-xs text-gray-400 mt-1">
                                                                    User: {violation.user} • Location: {violation.location}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 border-t border-indigo-500/30 bg-indigo-950/20 text-xs text-gray-500">
                            <span className="font-mono">
                                Real-time security monitoring • AI-powered threat detection • Compliance automation
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
