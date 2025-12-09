// 3D Network Topology Visualization with Attack Paths
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';

interface NetworkNode {
    id: string;
    label: string;
    type: 'server' | 'router' | 'firewall' | 'database' | 'client' | 'iot' | 'cloud';
    ip: string;
    risk: 'critical' | 'high' | 'medium' | 'low';
    vulnerabilities: number;
    x: number;
    y: number;
    z: number;
}

interface AttackPath {
    from: string;
    to: string;
    type: 'active' | 'potential' | 'blocked';
    protocol: string;
}

interface NetworkTopology3DProps {
    nodes?: NetworkNode[];
    attackPaths?: AttackPath[];
    currentAttack?: string;
}

export const NetworkTopology3D = ({ nodes = [], attackPaths = [], currentAttack }: NetworkTopology3DProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
    const lastMousePos = useRef({ x: 0, y: 0 });

    // Generate sample network topology if none provided
    const defaultNodes: NetworkNode[] = nodes.length > 0 ? nodes : [
        { id: 'fw1', label: 'Perimeter Firewall', type: 'firewall', ip: '10.0.0.1', risk: 'low', vulnerabilities: 0, x: 0, y: 0, z: 0 },
        { id: 'web1', label: 'Web Server', type: 'server', ip: '10.0.1.10', risk: 'high', vulnerabilities: 3, x: -200, y: 100, z: 0 },
        { id: 'db1', label: 'Database', type: 'database', ip: '10.0.2.20', risk: 'critical', vulnerabilities: 5, x: 200, y: 100, z: -100 },
        { id: 'router1', label: 'Core Router', type: 'router', ip: '10.0.0.254', risk: 'medium', vulnerabilities: 1, x: 0, y: -100, z: 50 },
        { id: 'iot1', label: 'IoT Camera', type: 'iot', ip: '192.168.1.50', risk: 'critical', vulnerabilities: 8, x: -150, y: -50, z: 100 },
        { id: 'cloud1', label: 'S3 Bucket', type: 'cloud', ip: 'cloud-storage', risk: 'high', vulnerabilities: 2, x: 150, y: -100, z: -50 },
    ];

    const defaultPaths: AttackPath[] = attackPaths.length > 0 ? attackPaths : [
        { from: 'fw1', to: 'web1', type: 'active', protocol: 'HTTPS' },
        { from: 'web1', to: 'db1', type: 'active', protocol: 'SQL' },
        { from: 'fw1', to: 'router1', type: 'potential', protocol: 'SSH' },
        { from: 'iot1', to: 'router1', type: 'blocked', protocol: 'Telnet' },
        { from: 'cloud1', to: 'db1', type: 'potential', protocol: 'S3' },
    ];

    const getRiskColor = (risk: string): string => {
        switch (risk) {
            case 'critical': return '#ef4444';
            case 'high': return '#f97316';
            case 'medium': return '#eab308';
            case 'low': return '#22c55e';
            default: return '#6b7280';
        }
    };

    const getNodeColor = (type: string): string => {
        switch (type) {
            case 'firewall': return '#3b82f6';
            case 'server': return '#8b5cf6';
            case 'database': return '#ec4899';
            case 'router': return '#14b8a6';
            case 'iot': return '#f97316';
            case 'cloud': return '#06b6d4';
            default: return '#6b7280';
        }
    };

    const getPathColor = (type: string): string => {
        switch (type) {
            case 'active': return '#ef4444';
            case 'potential': return '#eab308';
            case 'blocked': return '#22c55e';
            default: return '#6b7280';
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        const centerX = width / 4;
        const centerY = height / 4;

        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width / 2, height / 2);

        // Draw grid
        ctx.strokeStyle = '#1f1f1f';
        ctx.lineWidth = 0.5;
        for (let i = -5; i <= 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, centerY + i * 40);
            ctx.lineTo(width / 2, centerY + i * 40);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(centerX + i * 40, 0);
            ctx.lineTo(centerX + i * 40, height / 2);
            ctx.stroke();
        }

        // Transform coordinates based on rotation and zoom
        const transform = (node: NetworkNode) => {
            const cosX = Math.cos(rotation.x);
            const sinX = Math.sin(rotation.x);
            const cosY = Math.cos(rotation.y);
            const sinY = Math.sin(rotation.y);

            let x = node.x * zoom;
            let y = node.y * zoom;
            let z = node.z * zoom;

            // Rotate around Y axis
            const x1 = x * cosY - z * sinY;
            const z1 = x * sinY + z * cosY;

            // Rotate around X axis
            const y2 = y * cosX - z1 * sinX;
            const z2 = y * sinX + z1 * cosX;

            // Perspective projection
            const perspective = 1000;
            const scale = perspective / (perspective + z2);

            return {
                x: centerX + x1 * scale,
                y: centerY + y2 * scale,
                scale,
                z: z2
            };
        };

        // Sort nodes by Z-depth for proper rendering
        const sortedNodes = [...defaultNodes].sort((a, b) => {
            const aPos = transform(a);
            const bPos = transform(b);
            return bPos.z - aPos.z;
        });

        // Draw attack paths first (behind nodes)
        defaultPaths.forEach(path => {
            const fromNode = defaultNodes.find(n => n.id === path.from);
            const toNode = defaultNodes.find(n => n.id === path.to);
            if (!fromNode || !toNode) return;

            const from = transform(fromNode);
            const to = transform(toNode);

            ctx.strokeStyle = getPathColor(path.type);
            ctx.lineWidth = path.type === 'active' ? 3 : 1.5;
            ctx.setLineDash(path.type === 'potential' ? [5, 5] : []);

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();

            // Draw arrow
            const angle = Math.atan2(to.y - from.y, to.x - from.x);
            const arrowSize = 10;
            ctx.fillStyle = getPathColor(path.type);
            ctx.beginPath();
            ctx.moveTo(to.x, to.y);
            ctx.lineTo(to.x - arrowSize * Math.cos(angle - Math.PI / 6), to.y - arrowSize * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(to.x - arrowSize * Math.cos(angle + Math.PI / 6), to.y - arrowSize * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();

            ctx.setLineDash([]);
        });

        // Draw nodes
        sortedNodes.forEach(node => {
            const pos = transform(node);
            const size = 30 * pos.scale;

            // Outer glow for risk level
            const gradient = ctx.createRadialGradient(pos.x, pos.y, size * 0.5, pos.x, pos.y, size * 1.5);
            gradient.addColorStop(0, getRiskColor(node.risk) + '40');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(pos.x - size * 1.5, pos.y - size * 1.5, size * 3, size * 3);

            // Node circle
            ctx.fillStyle = getNodeColor(node.type);
            ctx.strokeStyle = getRiskColor(node.risk);
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Vulnerability count badge
            if (node.vulnerabilities > 0) {
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(pos.x + size * 0.6, pos.y - size * 0.6, size * 0.4, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#fff';
                ctx.font = `bold ${size * 0.5}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(node.vulnerabilities.toString(), pos.x + size * 0.6, pos.y - size * 0.6);
            }

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = `${12 * pos.scale}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(node.label, pos.x, pos.y + size + 15);
            ctx.fillStyle = '#888';
            ctx.font = `${10 * pos.scale}px monospace`;
            ctx.fillText(node.ip, pos.x, pos.y + size + 28);
        });

        // Animate rotation slightly
        const animate = () => {
            if (!isDragging) {
                setRotation(prev => ({
                    x: prev.x,
                    y: prev.y + 0.002
                }));
            }
        };

        const animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);

    }, [rotation, zoom, isDragging, defaultNodes, defaultPaths]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;

        setRotation(prev => ({
            x: prev.x + deltaY * 0.01,
            y: prev.y + deltaX * 0.01
        }));

        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div className="relative w-full h-full bg-black rounded-xl border border-neutral-800 overflow-hidden">
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {/* Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                    onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
                    className="p-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-lg border border-neutral-700 text-white transition-colors"
                    title="Zoom In"
                >
                    <ZoomIn size={20} />
                </button>
                <button
                    onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
                    className="p-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-lg border border-neutral-700 text-white transition-colors"
                    title="Zoom Out"
                >
                    <ZoomOut size={20} />
                </button>
                <button
                    onClick={() => setRotation({ x: 0, y: 0 })}
                    className="p-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-lg border border-neutral-700 text-white transition-colors"
                    title="Reset View"
                >
                    <RotateCw size={20} />
                </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-neutral-900/90 rounded-lg border border-neutral-700 p-4 text-xs font-mono text-white">
                <h3 className="font-bold mb-2 text-cyan-400">Network Legend</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>Firewall</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span>Server</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-pink-500" />
                        <span>Database</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-teal-500" />
                        <span>Router</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span>IoT Device</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-500" />
                        <span>Cloud</span>
                    </div>
                </div>
                <hr className="my-2 border-neutral-700" />
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-red-500" />
                        <span>Active Attack</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-yellow-500 border-dashed" style={{ backgroundImage: 'linear-gradient(to right, #eab308 50%, transparent 50%)', backgroundSize: '10px 2px' }} />
                        <span>Potential Path</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-green-500" />
                        <span>Blocked</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="absolute top-4 left-4 bg-neutral-900/90 rounded-lg border border-neutral-700 p-3 text-xs font-mono text-white">
                <div className="space-y-1">
                    <div>Nodes: <span className="text-cyan-400">{defaultNodes.length}</span></div>
                    <div>Paths: <span className="text-yellow-400">{defaultPaths.length}</span></div>
                    <div>Critical: <span className="text-red-400">{defaultNodes.filter(n => n.risk === 'critical').length}</span></div>
                    <div>Total Vulns: <span className="text-orange-400">{defaultNodes.reduce((sum, n) => sum + n.vulnerabilities, 0)}</span></div>
                </div>
            </div>
        </div>
    );
};
