import { useState, useEffect } from 'react';
import { Network, Cpu, Database, Shield, ChevronRight, Terminal, Zap, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const missions = [
    {
        id: 1,
        title: 'Packet Storm',
        missionId: 'NETWORK_FLOOD',
        layer: 3,
        type: 'Volumetric Attack',
        description: 'Overwhelm the bandwidth.',
        difficulty: 'EASY',
        icon: Network,
        relatedIds: [2],
        status: 'completed' as const,
        energy: 100,
        angle: 0
    },
    {
        id: 2,
        title: 'Stack Smash',
        missionId: 'BUFFER_OVERFLOW',
        layer: 7,
        type: 'Memory Corruption',
        description: 'Overwrite the return address.',
        difficulty: 'HARD',
        icon: Cpu,
        relatedIds: [1, 3],
        status: 'in-progress' as const,
        energy: 75,
        angle: 90
    },
    {
        id: 3,
        title: 'Data Heist',
        missionId: 'SQL_INJECTION',
        layer: 7,
        type: 'Logic Attack',
        description: 'Bypass login via malformed inputs.',
        difficulty: 'MEDIUM',
        icon: Database,
        relatedIds: [2, 4],
        status: 'in-progress' as const,
        energy: 60,
        angle: 180
    },
    {
        id: 4,
        title: 'Handshake Hijack',
        missionId: 'MITM_ATTACK',
        layer: 5,
        type: 'Session Hijack',
        description: 'Intercept the key exchange.',
        difficulty: 'EXTREME',
        icon: Shield,
        relatedIds: [3],
        status: 'pending' as const,
        energy: 30,
        angle: 270
    }
];

// SVG Hats Components (Updated for Theme compatibility via Props)
const RedHat = ({ className = "", size = 60 }: { className?: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <defs>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
        </defs>
        <path d="M10 50 Q 50 10 90 50 L 90 70 L 10 70 Z" fill="url(#redGradient)" />
        <rect x="0" y="70" width="100" height="10" fill="url(#redGradient)" />
        <ellipse cx="50" cy="75" rx="50" ry="8" fill="#991b1b" opacity="0.5" />
    </svg>
);

const WhiteHat = ({ className = "", size = 60 }: { className?: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <defs>
            <linearGradient id="whiteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f3f4f6" />
                <stop offset="100%" stopColor="#d1d5db" />
            </linearGradient>
        </defs>
        <path d="M10 50 Q 50 10 90 50 L 90 70 L 10 70 Z" fill="url(#whiteGradient)" />
        <rect x="0" y="70" width="100" height="10" fill="url(#whiteGradient)" />
        <ellipse cx="50" cy="75" rx="50" ry="8" fill="#9ca3af" opacity="0.5" />
    </svg>
);

interface HomepageProps {
    onSelect: (missionId: string) => void;
}

export default function HatTrickHomepage({ onSelect }: HomepageProps) {
    const [isDarkMode, setIsDarkMode] = useState(false); // Default to Light Mode
    const [rotationAngle, setRotationAngle] = useState(0);
    const [autoRotate, setAutoRotate] = useState(true);
    const [expandedNode, setExpandedNode] = useState<number | null>(null);
    const [showIntro, setShowIntro] = useState(true);
    const [pulseNodes, setPulseNodes] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const timer = setTimeout(() => setShowIntro(false), 3500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (autoRotate) {
            interval = setInterval(() => {
                setRotationAngle(prev => (prev + 0.3) % 360);
            }, 50);
        }
        return () => clearInterval(interval);
    }, [autoRotate]);

    const calculatePosition = (index: number, total: number) => {
        const angle = ((index / total) * 360 + rotationAngle) % 360;
        const radius = 250;
        const radian = (angle * Math.PI) / 180;

        const x = radius * Math.cos(radian);
        const y = radius * Math.sin(radian);
        const zIndex = Math.round(100 + 50 * Math.cos(radian));
        const opacity = Math.max(0.4, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2));

        return { x, y, zIndex, opacity };
    };

    const handleNodeClick = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (expandedNode === id) {
            setExpandedNode(null);
            setAutoRotate(true);
            setPulseNodes({});
        } else {
            setExpandedNode(id);
            setAutoRotate(false);

            const mission = missions.find(m => m.id === id);
            const pulses: Record<number, boolean> = {};
            mission?.relatedIds.forEach(relId => {
                pulses[relId] = true;
            });
            setPulseNodes(pulses);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500 border-green-400';
            case 'in-progress': return 'bg-blue-500 border-blue-400';
            case 'pending': return 'bg-gray-500 border-gray-400';
            default: return 'bg-gray-500 border-gray-400';
        }
    };

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    // Dynamic Styles
    const bgClass = isDarkMode ? 'bg-black' : 'bg-gray-100';
    const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const introBg = isDarkMode ? 'bg-black' : 'bg-white';
    const nodeBg = (isExpanded: boolean) => isExpanded
        ? (isDarkMode ? 'bg-white text-black' : 'bg-black text-white')
        : (isDarkMode ? 'bg-black text-white border-white/40' : 'bg-white text-black border-black/20');

    const cardBg = isDarkMode ? 'bg-black/95 border-white/30 text-white' : 'bg-white/95 border-black/20 text-black';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';

    return (
        <div className={`w-full h-screen ${bgClass} ${textClass} overflow-hidden relative transition-colors duration-500`}>

            {/* Theme Toggle */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={toggleTheme}
                    className={`p-3 rounded-full ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'} transition-all`}
                >
                    {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-700" />}
                </button>
            </div>

            {/* Lock & Hats Intro Animation */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        className={`fixed inset-0 z-50 flex items-center justify-center ${introBg}`}
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="relative flex items-center gap-8">
                            {/* Red Hat (Left) */}
                            <motion.div
                                initial={{ x: -100, opacity: 0, rotate: -45 }}
                                animate={{ x: 0, opacity: 1, rotate: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <RedHat size={80} />
                            </motion.div>

                            {/* Lock Icon (Center) */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                            >
                                <Terminal className="w-20 h-20 text-cyan-500" strokeWidth={1.5} />
                            </motion.div>

                            {/* White Hat (Right) */}
                            <motion.div
                                initial={{ x: 100, opacity: 0, rotate: 45 }}
                                animate={{ x: 0, opacity: 1, rotate: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <WhiteHat size={80} />
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Hex Grid */}
                <div className="absolute inset-0 opacity-5">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                                <polygon points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2"
                                    fill="none" stroke="currentColor" strokeWidth="0.5" className={isDarkMode ? "text-cyan-500" : "text-gray-900"} />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#hexagons)" />
                    </svg>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <motion.div
                    className="pt-12 pb-8 text-center"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Terminal className="w-10 h-10 text-cyan-500" />
                        <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                            HatTrick
                        </h1>
                        <Zap className="w-10 h-10 text-purple-500" fill="currentColor" />
                    </div>
                    <p className={`text-xl font-light ${subText}`}>The Agentic Cyber-Arena</p>
                    <p className="text-sm text-gray-500 font-mono mt-2">Six autonomous AI agents • Real-time strategic warfare</p>
                </motion.div>

                {/* Orbital Timeline Container */}
                <div
                    className="flex-1 flex items-center justify-center perspective-[1000px]"
                    onClick={() => {
                        setExpandedNode(null);
                        setAutoRotate(true);
                        setPulseNodes({});
                    }}
                >
                    <div className="relative w-full max-w-4xl h-[600px] flex items-center justify-center">
                        {/* Center Core */}
                        <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 animate-pulse flex items-center justify-center z-10 shadow-xl">
                            <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg"></div>
                        </div>

                        {/* Orbital Ring */}
                        <div className={`absolute w-[500px] h-[500px] rounded-full border ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}></div>

                        {/* Mission Nodes */}
                        {missions.map((mission, index) => {
                            const position = calculatePosition(index, missions.length);
                            const isExpanded = expandedNode === mission.id;
                            const isPulsing = pulseNodes[mission.id];
                            const Icon = mission.icon;

                            return (
                                <div
                                    key={mission.id}
                                    className="absolute transition-all duration-700 cursor-pointer"
                                    style={{
                                        transform: `translate(${position.x}px, ${position.y}px)`,
                                        zIndex: isExpanded ? 200 : position.zIndex,
                                        opacity: isExpanded ? 1 : position.opacity,
                                    }}
                                    onClick={(e) => handleNodeClick(mission.id, e)}
                                >
                                    {/* Pulse Glow */}
                                    {isPulsing && (
                                        <div
                                            className="absolute rounded-full animate-pulse"
                                            style={{
                                                background: isDarkMode
                                                    ? 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)'
                                                    : 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 70%)',
                                                width: `${mission.energy * 0.6 + 50}px`,
                                                height: `${mission.energy * 0.6 + 50}px`,
                                                left: `-${(mission.energy * 0.6 + 50 - 50) / 2}px`,
                                                top: `-${(mission.energy * 0.6 + 50 - 50) / 2}px`,
                                            }}
                                        />
                                    )}

                                    {/* Node Circle */}
                                    <div
                                        className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      border-2 transition-all duration-300 transform shadow-md
                      ${nodeBg(isExpanded)}
                      ${isPulsing ? 'scale-110' : ''}
                    `}
                                    >
                                        <Icon size={20} />
                                    </div>

                                    {/* Node Label */}
                                    <div
                                        className={`
                      absolute top-14 whitespace-nowrap text-xs font-semibold tracking-wider
                      transition-all duration-300 left-1/2 -translate-x-1/2
                      ${isExpanded ? 'scale-125 font-bold' : 'opacity-70'}
                      ${isDarkMode ? 'text-white' : 'text-gray-800'}
                    `}
                                    >
                                        {mission.title}
                                    </div>

                                    {/* Expanded Card */}
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`absolute top-20 left-1/2 -translate-x-1/2 w-72 rounded-xl border-2 shadow-2xl p-5 ${cardBg}`}
                                        >
                                            {/* Connector Line */}
                                            <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-px h-5 ${isDarkMode ? 'bg-white/50' : 'bg-black/20'}`}></div>

                                            {/* Status Badge */}
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(mission.status)} text-white`}>
                                                    {mission.status === 'completed' ? 'COMPLETE' :
                                                        mission.status === 'in-progress' ? 'IN PROGRESS' : 'PENDING'}
                                                </span>
                                                <span className={`text-xs font-mono opacity-60`}>LAYER {mission.layer}</span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-bold mb-1">{mission.title}</h3>
                                            <p className="text-xs font-mono text-cyan-500 mb-2">{mission.type}</p>
                                            <p className="text-sm opacity-80 mb-4">{mission.description}</p>

                                            {/* Energy Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center text-xs mb-1">
                                                    <span className="flex items-center opacity-70">
                                                        <Zap size={12} className="mr-1" />
                                                        Energy Level
                                                    </span>
                                                    <span className="font-mono">{mission.energy}%</span>
                                                </div>
                                                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                                        style={{ width: `${mission.energy}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Launch Button */}
                                            <button
                                                onClick={() => onSelect(mission.missionId!)}
                                                className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-cyan-500/25"
                                            >
                                                LAUNCH MISSION
                                                <ChevronRight size={16} />
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <motion.div
                    className="pb-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    <div className="flex items-center justify-center gap-6 text-xs font-mono text-gray-400 mb-2">
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            RED TEAM vs BLUE TEAM
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                            AI STRATEGY
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">
                        Powered by LangGraph × Groq × Anthropic
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
