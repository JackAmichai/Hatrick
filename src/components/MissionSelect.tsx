import { motion } from "framer-motion";
import { ShieldAlert, Cpu, Database, Network } from "lucide-react";

interface MissionProps {
    onSelect: (scenario: string) => void;
}

const missions = [
    {
        id: "NETWORK_FLOOD",
        title: "Packet Storm",
        icon: <Network className="w-8 h-8 text-blue-400" />, // Network icon
        desc: "Layer 3 Volumetric Attack. Overwhelm the bandwidth.",
        difficulty: "EASY",
        color: "border-blue-500/50 hover:bg-blue-500/10"
    },
    {
        id: "BUFFER_OVERFLOW",
        title: "Stack Smash",
        icon: <Cpu className="w-8 h-8 text-red-400" />, // CPU icon
        desc: "Layer 7 Memory Corruption. Overwrite the return address.",
        difficulty: "HARD",
        color: "border-red-500/50 hover:bg-red-500/10"
    },
    {
        id: "SQL_INJECTION",
        title: "Data Heist",
        icon: <Database className="w-8 h-8 text-yellow-400" />, // Database icon
        desc: "Layer 7 Logic Attack. Bypass login via malformed inputs.",
        difficulty: "MEDIUM",
        color: "border-yellow-500/50 hover:bg-yellow-500/10"
    },
    {
        id: "MITM_ATTACK",
        title: "Handshake Hijack",
        icon: <ShieldAlert className="w-8 h-8 text-green-400" />,
        desc: "Layer 5 Session Hijack. Intercept the key exchange.",
        difficulty: "EXTREME",
        color: "border-green-500/50 hover:bg-green-500/10"
    }
];

export const MissionSelect = ({ onSelect }: MissionProps) => {
    return (
        <div className="absolute inset-0 bg-slate-900/90 z-40 flex flex-col items-center justify-center">
            <h2 className="text-4xl font-black text-white mb-8 tracking-tighter">SELECT MISSION</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
                {missions.map((m) => (
                    <motion.button
                        key={m.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelect(m.id)}
                        className={`p-6 bg-slate-800 border-2 ${m.color} rounded-xl text-left transition-all group`}
                    >
                        <div className="mb-4 bg-slate-900 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform">
                            {m.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{m.title}</h3>
                        <p className="text-slate-400 text-sm mb-4 h-10">{m.desc}</p>
                        <span className="text-xs font-mono bg-slate-700 px-2 py-1 rounded text-white">
                            {m.difficulty}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
