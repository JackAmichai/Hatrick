import { motion } from "framer-motion";

interface TowerProps {
    health: number; // 0 to 100
    isHit: boolean; // Trigger shake animation
}

export const ServerTower = ({ health, isHit }: TowerProps) => {
    return (
        <div className="relative w-48 h-96 flex flex-col items-center justify-end">
            {/* The Health Bar (Floating above) */}
            <div className="absolute -top-12 w-full">
                <div className="flex justify-between text-xs text-blue-400 font-mono mb-1">
                    <span>SERVER INTEGRITY</span>
                    <span>{health}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-400"
                        initial={{ width: "100%" }}
                        animate={{ width: `${health}%` }}
                        transition={{ type: "spring", stiffness: 50 }}
                    />
                </div>
            </div>

            {/* The Tower Stack */}
            <motion.div
                className="w-32 h-64 bg-slate-800 border-2 border-slate-600 rounded-lg flex flex-col items-center justify-center gap-2 shadow-[0_0_50px_rgba(59,130,246,0.2)]"
                animate={isHit ? { x: [-5, 5, -5, 5, 0], color: "#ef4444" } : {}}
                transition={{ duration: 0.4 }}
            >
                {/* Layer 7 */}
                <div className="w-24 h-8 bg-slate-700 rounded border border-slate-600" />
                {/* Layer 4 */}
                <div className="w-24 h-8 bg-slate-700 rounded border border-slate-600" />
                {/* Layer 3 (Active) */}
                <div className="w-24 h-8 bg-blue-900/50 rounded border border-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            </motion.div>
        </div>
    );
};
