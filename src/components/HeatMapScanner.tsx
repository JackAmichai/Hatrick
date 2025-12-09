// Heat Map Vulnerability Scanner - Color-coded Risk Levels
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Server, Database } from 'lucide-react';

interface Asset {
    id: string;
    name: string;
    type: 'server' | 'database' | 'network' | 'application' | 'endpoint';
    ip: string;
    riskScore: number; // 0-100
    vulnerabilities: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    lastScanned: Date;
}

interface HeatMapScannerProps {
    assets?: Asset[];
    autoScan?: boolean;
}

export const HeatMapScanner = ({ assets = [], autoScan = true }: HeatMapScannerProps) => {
    const [scanning, setScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [hoveredAsset, setHoveredAsset] = useState<Asset | null>(null);

    // Generate sample assets if none provided
    const defaultAssets: Asset[] = assets.length > 0 ? assets : [
        { id: 'srv1', name: 'Web Server 1', type: 'server', ip: '10.0.1.10', riskScore: 85, vulnerabilities: { critical: 2, high: 5, medium: 8, low: 12 }, lastScanned: new Date() },
        { id: 'srv2', name: 'Web Server 2', type: 'server', ip: '10.0.1.11', riskScore: 45, vulnerabilities: { critical: 0, high: 2, medium: 4, low: 8 }, lastScanned: new Date() },
        { id: 'db1', name: 'PostgreSQL DB', type: 'database', ip: '10.0.2.20', riskScore: 92, vulnerabilities: { critical: 3, high: 7, medium: 10, low: 15 }, lastScanned: new Date() },
        { id: 'db2', name: 'Redis Cache', type: 'database', ip: '10.0.2.21', riskScore: 38, vulnerabilities: { critical: 0, high: 1, medium: 3, low: 5 }, lastScanned: new Date() },
        { id: 'net1', name: 'Core Router', type: 'network', ip: '10.0.0.1', riskScore: 55, vulnerabilities: { critical: 1, high: 2, medium: 5, low: 7 }, lastScanned: new Date() },
        { id: 'net2', name: 'Load Balancer', type: 'network', ip: '10.0.0.2', riskScore: 28, vulnerabilities: { critical: 0, high: 0, medium: 2, low: 4 }, lastScanned: new Date() },
        { id: 'app1', name: 'API Gateway', type: 'application', ip: '10.0.3.30', riskScore: 72, vulnerabilities: { critical: 1, high: 4, medium: 7, low: 10 }, lastScanned: new Date() },
        { id: 'app2', name: 'Auth Service', type: 'application', ip: '10.0.3.31', riskScore: 95, vulnerabilities: { critical: 4, high: 6, medium: 9, low: 14 }, lastScanned: new Date() },
        { id: 'ep1', name: 'Admin Workstation', type: 'endpoint', ip: '192.168.1.100', riskScore: 68, vulnerabilities: { critical: 1, high: 3, medium: 6, low: 9 }, lastScanned: new Date() },
        { id: 'ep2', name: 'Dev Laptop', type: 'endpoint', ip: '192.168.1.101', riskScore: 42, vulnerabilities: { critical: 0, high: 1, medium: 4, low: 7 }, lastScanned: new Date() },
    ];

    const getRiskColor = (score: number): string => {
        if (score >= 80) return 'bg-red-600';
        if (score >= 60) return 'bg-orange-500';
        if (score >= 40) return 'bg-yellow-500';
        if (score >= 20) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getRiskLabel = (score: number): string => {
        if (score >= 80) return 'CRITICAL';
        if (score >= 60) return 'HIGH';
        if (score >= 40) return 'MEDIUM';
        if (score >= 20) return 'LOW';
        return 'MINIMAL';
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'server': return <Server size={16} />;
            case 'database': return <Database size={16} />;
            case 'network': return <Shield size={16} />;
            case 'application': return <AlertTriangle size={16} />;
            default: return <Server size={16} />;
        }
    };

    useEffect(() => {
        if (autoScan && !scanning) {
            const scanInterval = setInterval(() => {
                setScanning(true);
                setScanProgress(0);

                const progressInterval = setInterval(() => {
                    setScanProgress(prev => {
                        if (prev >= 100) {
                            clearInterval(progressInterval);
                            setTimeout(() => setScanning(false), 500);
                            return 100;
                        }
                        return prev + 2;
                    });
                }, 50);

            }, 30000); // Rescan every 30 seconds

            return () => {
                clearInterval(scanInterval);
            };
        }
    }, [autoScan, scanning]);

    const startManualScan = () => {
        setScanning(true);
        setScanProgress(0);

        const progressInterval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(() => setScanning(false), 500);
                    return 100;
                }
                return prev + 3;
            });
        }, 50);
    };

    // Group assets by type
    const groupedAssets = defaultAssets.reduce((acc, asset) => {
        if (!acc[asset.type]) acc[asset.type] = [];
        acc[asset.type].push(asset);
        return acc;
    }, {} as Record<string, Asset[]>);

    return (
        <div className="w-full h-full bg-black rounded-xl border border-neutral-800 p-6 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Infrastructure Heat Map</h2>
                    <p className="text-sm text-gray-400">Color-coded vulnerability risk assessment</p>
                </div>
                <button
                    onClick={startManualScan}
                    disabled={scanning}
                    className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                        scanning 
                            ? 'bg-neutral-800 text-gray-500 cursor-not-allowed' 
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    }`}
                >
                    {scanning ? `Scanning... ${scanProgress}%` : 'Run Scan'}
                </button>
            </div>

            {/* Scanning Progress Bar */}
            {scanning && (
                <motion.div
                    className="mb-6 h-2 bg-neutral-800 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${scanProgress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </motion.div>
            )}

            {/* Heat Map Grid */}
            <div className="space-y-6">
                {Object.entries(groupedAssets).map(([type, typeAssets]) => (
                    <div key={type}>
                        <h3 className="text-lg font-bold text-white mb-3 capitalize flex items-center gap-2">
                            {getTypeIcon(type)}
                            {type}s ({typeAssets.length})
                        </h3>
                        <div className="grid grid-cols-5 gap-3">
                            {typeAssets.map(asset => (
                                <motion.div
                                    key={asset.id}
                                    className={`relative ${getRiskColor(asset.riskScore)} rounded-lg p-4 cursor-pointer transition-all hover:scale-105 hover:shadow-lg`}
                                    onMouseEnter={() => setHoveredAsset(asset)}
                                    onMouseLeave={() => setHoveredAsset(null)}
                                    whileHover={{ y: -4 }}
                                >
                                    <div className="text-white font-mono">
                                        <div className="text-xs opacity-80 mb-1">{asset.ip}</div>
                                        <div className="text-sm font-bold mb-2 truncate">{asset.name}</div>
                                        <div className="text-2xl font-black">{asset.riskScore}</div>
                                        <div className="text-xs mt-1">{getRiskLabel(asset.riskScore)}</div>
                                    </div>

                                    {/* Pulse effect for critical assets */}
                                    {asset.riskScore >= 80 && (
                                        <motion.div
                                            className="absolute inset-0 rounded-lg border-2 border-white"
                                            animate={{ opacity: [0.5, 0, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Tooltip */}
            {hoveredAsset && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed z-50 bg-neutral-900 border-2 border-neutral-700 rounded-lg p-4 shadow-2xl pointer-events-none"
                    style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        minWidth: '300px'
                    }}
                >
                    <h3 className="text-lg font-bold text-white mb-2">{hoveredAsset.name}</h3>
                    <div className="space-y-2 text-sm font-mono">
                        <div className="flex justify-between">
                            <span className="text-gray-400">IP Address:</span>
                            <span className="text-white">{hoveredAsset.ip}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Type:</span>
                            <span className="text-white capitalize">{hoveredAsset.type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Risk Score:</span>
                            <span className={`font-bold ${
                                hoveredAsset.riskScore >= 80 ? 'text-red-400' :
                                hoveredAsset.riskScore >= 60 ? 'text-orange-400' :
                                hoveredAsset.riskScore >= 40 ? 'text-yellow-400' :
                                'text-green-400'
                            }`}>
                                {hoveredAsset.riskScore}/100
                            </span>
                        </div>
                        <hr className="border-neutral-700" />
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-red-400">● Critical:</span>
                                <span className="text-white">{hoveredAsset.vulnerabilities.critical}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-orange-400">● High:</span>
                                <span className="text-white">{hoveredAsset.vulnerabilities.high}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-yellow-400">● Medium:</span>
                                <span className="text-white">{hoveredAsset.vulnerabilities.medium}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-400">● Low:</span>
                                <span className="text-white">{hoveredAsset.vulnerabilities.low}</span>
                            </div>
                        </div>
                        <hr className="border-neutral-700" />
                        <div className="text-xs text-gray-500">
                            Last scanned: {hoveredAsset.lastScanned.toLocaleTimeString()}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Risk Distribution Chart */}
            <div className="mt-8 bg-neutral-900 rounded-lg border border-neutral-800 p-4">
                <h3 className="text-lg font-bold text-white mb-4">Risk Distribution</h3>
                <div className="flex items-end justify-between h-32 gap-2">
                    {[
                        { label: 'Critical', color: 'bg-red-600', count: defaultAssets.filter(a => a.riskScore >= 80).length },
                        { label: 'High', color: 'bg-orange-500', count: defaultAssets.filter(a => a.riskScore >= 60 && a.riskScore < 80).length },
                        { label: 'Medium', color: 'bg-yellow-500', count: defaultAssets.filter(a => a.riskScore >= 40 && a.riskScore < 60).length },
                        { label: 'Low', color: 'bg-blue-500', count: defaultAssets.filter(a => a.riskScore >= 20 && a.riskScore < 40).length },
                        { label: 'Minimal', color: 'bg-green-500', count: defaultAssets.filter(a => a.riskScore < 20).length },
                    ].map(item => (
                        <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                            <motion.div
                                className={`w-full ${item.color} rounded-t`}
                                initial={{ height: 0 }}
                                animate={{ height: `${(item.count / defaultAssets.length) * 100}%` }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{item.count}</div>
                                <div className="text-xs text-gray-400">{item.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
