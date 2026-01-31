import { motion } from "framer-motion";

export const MemoryStack = ({ fillLevel, hasCanary }: { fillLevel: number, hasCanary: boolean }) => {
    return (
        <div className="flex flex-col items-center gap-2 font-mono text-xs text-white">
            <div className="text-center mb-2">
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-600">STACK MEMORY</span>
            </div>
            <div className="w-48 border-4 border-slate-700 bg-slate-800/50 rounded-lg p-2 shadow-2xl">
                {/* RETURN ADDRESS (The Target) */}
                <div className={`h-12 mb-2 flex items-center justify-center border-2 rounded transition-colors duration-500 ${fillLevel >= 100 ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-slate-700 border-slate-500'}`}>
                    <span className="font-bold tracking-widest">
                        {fillLevel >= 100 ? "⚠️ SEGFAULT" : "0x7FFF...RET"}
                    </span>
                </div>

                {/* CANARY DEFENSE */}
                {hasCanary && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`h-8 mb-2 border-2 border-dashed border-yellow-500/50 rounded flex items-center justify-center ${fillLevel > 85 ? 'bg-yellow-500 text-black font-bold' : 'text-yellow-500'}`}
                    >
                        {fillLevel > 85 ? "🚨 CANARY DEAD" : "🐥 CANARY ALIVE"}
                    </motion.div>
                )}

                {/* THE BUFFER (The Container) */}
                <div className="relative h-48 border-x-2 border-b-2 border-blue-500/30 bg-slate-900 rounded-b overflow-hidden flex items-end justify-center">

                    {/* The "Liquid" filling up */}
                    <motion.div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-cyan-400 opacity-80"
                        initial={{ height: "0%" }}
                        animate={{ height: `${Math.min(fillLevel, 120)}%` }} // Allow it to go over 100%
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </div>
            </div>
        </div>
    );
};
