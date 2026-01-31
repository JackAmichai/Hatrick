// Real-Time Packet Animation - Visualize Network Traffic
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';

interface Packet {
    id: string;
    source: string;
    destination: string;
    protocol: string;
    size: number;
    type: 'normal' | 'suspicious' | 'malicious';
    timestamp: Date;
}

interface PacketAnimationProps {
    isAttacking?: boolean;
    attackType?: string;
}

export const PacketAnimation = ({ isAttacking = false, attackType = 'DDoS' }: PacketAnimationProps) => {
    const [packets, setPackets] = useState<Packet[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        normal: 0,
        suspicious: 0,
        malicious: 0,
        bps: 0
    });
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generatePacket = useCallback((): Packet => {
        const types: ('normal' | 'suspicious' | 'malicious')[] = isAttacking 
            ? ['malicious', 'malicious', 'suspicious', 'normal']
            : ['normal', 'normal', 'normal', 'suspicious'];
        
        const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'SSH', 'DNS'];
        
        return {
            id: `pkt_${Date.now()}_${Math.random()}`,
            source: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            destination: isAttacking ? '10.0.1.10' : `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            protocol: isAttacking && attackType === 'DDoS' ? 'UDP' : protocols[Math.floor(Math.random() * protocols.length)],
            size: Math.floor(Math.random() * 1500) + 64,
            type: types[Math.floor(Math.random() * types.length)],
            timestamp: new Date()
        };
    }, [isAttacking, attackType]);

    useEffect(() => {
        const interval = setInterval(() => {
            const packetCount = isAttacking ? Math.floor(Math.random() * 10) + 5 : Math.floor(Math.random() * 3) + 1;
            const newPackets = Array.from({ length: packetCount }, generatePacket);
            
            setPackets(prev => {
                const updated = [...prev, ...newPackets].slice(-50); // Keep last 50 packets
                
                // Update stats
                const totalSize = updated.reduce((sum, p) => sum + p.size, 0);
                setStats({
                    total: updated.length,
                    normal: updated.filter(p => p.type === 'normal').length,
                    suspicious: updated.filter(p => p.type === 'suspicious').length,
                    malicious: updated.filter(p => p.type === 'malicious').length,
                    bps: totalSize * 8 // Convert to bits per second (approximate)
                });
                
                return updated;
            });
        }, isAttacking ? 100 : 500); // Faster during attacks

        return () => clearInterval(interval);
    }, [isAttacking, generatePacket]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        const drawPackets = () => {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width / 2, height / 2);

            packets.slice(-20).forEach((packet, index) => {
                const age = Date.now() - packet.timestamp.getTime();
                const progress = Math.min(age / 2000, 1); // 2 second animation
                
                if (progress >= 1) return;

                const startX = 50;
                const endX = (width / 2) - 50;
                const y = 50 + (index * 15);
                const x = startX + (endX - startX) * progress;

                // Draw packet path
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
                ctx.stroke();

                // Draw packet
                const color = packet.type === 'malicious' ? '#ef4444' 
                            : packet.type === 'suspicious' ? '#f97316' 
                            : '#22c55e';
                
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Draw source/dest labels
                if (index < 5) {
                    ctx.fillStyle = '#666';
                    ctx.font = '8px monospace';
                    ctx.fillText(packet.source, startX - 40, y + 3);
                    ctx.fillText(packet.destination, endX + 10, y + 3);
                }
            });
        };

        const animate = () => {
            drawPackets();
            requestAnimationFrame(animate);
        };

        animate();
    }, [packets]);

    const formatBytes = (bytes: number) => {
        if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(2)} Mbps`;
        if (bytes >= 1000) return `${(bytes / 1000).toFixed(2)} Kbps`;
        return `${bytes} bps`;
    };

    return (
        <div className="w-full h-full bg-black rounded-xl border border-neutral-800 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="text-cyan-400" />
                    Network Traffic Monitor
                </h2>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    isAttacking ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                    <div className={`w-2 h-2 rounded-full ${isAttacking ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                    <span className="text-xs font-mono">{isAttacking ? 'UNDER ATTACK' : 'NORMAL'}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-5 gap-3 mb-4">
                <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800">
                    <div className="text-xs text-gray-400 mb-1">Total Packets</div>
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                </div>
                <div className="bg-neutral-900 rounded-lg p-3 border border-green-500/30">
                    <div className="text-xs text-green-400 mb-1">Normal</div>
                    <div className="text-2xl font-bold text-green-400">{stats.normal}</div>
                </div>
                <div className="bg-neutral-900 rounded-lg p-3 border border-orange-500/30">
                    <div className="text-xs text-orange-400 mb-1">Suspicious</div>
                    <div className="text-2xl font-bold text-orange-400">{stats.suspicious}</div>
                </div>
                <div className="bg-neutral-900 rounded-lg p-3 border border-red-500/30">
                    <div className="text-xs text-red-400 mb-1">Malicious</div>
                    <div className="text-2xl font-bold text-red-400">{stats.malicious}</div>
                </div>
                <div className="bg-neutral-900 rounded-lg p-3 border border-cyan-500/30">
                    <div className="text-xs text-cyan-400 mb-1 flex items-center gap-1">
                        <TrendingUp size={12} />
                        Throughput
                    </div>
                    <div className="text-lg font-bold text-cyan-400">{formatBytes(stats.bps)}</div>
                </div>
            </div>

            {/* Packet Animation Canvas */}
            <div className="bg-neutral-950 rounded-lg border border-neutral-800 mb-4 overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-64" />
            </div>

            {/* Recent Packets List */}
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-yellow-400" />
                    Recent Packets (Last 10)
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {packets.slice(-10).reverse().map(packet => (
                        <motion.div
                            key={packet.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-center justify-between text-xs font-mono p-2 rounded border ${
                                packet.type === 'malicious' ? 'bg-red-500/10 border-red-500/30' :
                                packet.type === 'suspicious' ? 'bg-orange-500/10 border-orange-500/30' :
                                'bg-green-500/5 border-neutral-700'
                            }`}
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <span className={`w-2 h-2 rounded-full ${
                                    packet.type === 'malicious' ? 'bg-red-500' :
                                    packet.type === 'suspicious' ? 'bg-orange-500' :
                                    'bg-green-500'
                                }`} />
                                <span className="text-gray-400">{packet.source}</span>
                                <span className="text-gray-600">→</span>
                                <span className="text-gray-300">{packet.destination}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-cyan-400">{packet.protocol}</span>
                                <span className="text-gray-500">{packet.size}B</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Attack Alert */}
            <AnimatePresence>
                {isAttacking && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-4 bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-center gap-3"
                    >
                        <AlertCircle className="text-red-400" size={24} />
                        <div>
                            <h4 className="text-sm font-bold text-red-400">ATTACK DETECTED</h4>
                            <p className="text-xs text-red-300">
                                {attackType} attack in progress • Anomalous traffic patterns detected • 
                                Packets/sec: {isAttacking ? '1000+' : '< 50'}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
