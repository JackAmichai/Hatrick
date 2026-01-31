import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Hat } from "./Hat";

interface MITMProps {
    mitigationScore: number;
    onIntercept?: () => void;
}

export const MITMAnimation = ({ mitigationScore, onIntercept }: MITMProps) => {
    // Animation timeline (in seconds)
    const travelDuration = 2;
    const pauseDuration = 1;

    // Determine blocked status based on mitigation score (e.g. > 50 is blocked)
    const isBlocked = mitigationScore > 50;
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowResult(true);
            if (isBlocked && onIntercept) onIntercept();
        }, travelDuration * 1000 + pauseDuration * 1000);
        return () => clearTimeout(timer);
    }, [mitigationScore, isBlocked, onIntercept]);

    return (
        <div className="relative flex items-center justify-between w-full max-w-2xl h-64 bg-slate-900/50 rounded-xl p-8 border border-slate-700 mt-8">

            {/* Client */}
            <div className="flex flex-col items-center z-10">
                <div className="bg-blue-500/20 p-4 rounded-full mb-2">
                    <Hat role="Client" color="#60A5FA" status="IDLE" />
                </div>
                <span className="text-sm font-mono text-blue-300">CLIENT</span>
            </div>

            {/* Connection Line */}
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-700 -z-0 mx-20" />

            {/* Server */}
            <div className="flex flex-col items-center z-10">
                <div className="bg-green-500/20 p-4 rounded-full mb-2">
                    <Hat role="Server" color="#4ADE80" status="IDLE" />
                </div>
                <span className="text-sm font-mono text-green-300">SERVER</span>
            </div>

            {/* Red-Hat Attacker (MITM) */}
            {/* We use specific absolute positioning to move along the line */}
            <motion.div
                className="absolute top-1/2 left-20 -translate-y-1/2 z-20"
                initial={{ left: "15%" }} // Start near client
                animate={{
                    left: ["15%", "50%", "50%", isBlocked ? "50%" : "85%"], // Move -> Pause -> Finish/Block
                }}
                transition={{
                    times: [0, 0.4, 0.6, 1], // Timing logic
                    duration: travelDuration + pauseDuration,
                    ease: "easeInOut",
                }}
            >
                <div className="scale-75">
                    <Hat role="Attacker" color="#EF4444" status="ACTING" />
                </div>
            </motion.div>

            {/* Outcome Overlay */}
            {showResult && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className={`px-6 py-3 rounded-lg font-bold text-xl border-2 shadow-xl backdrop-blur-md ${isBlocked
                            ? "bg-blue-500/20 border-blue-500 text-blue-400"
                            : "bg-red-500/20 border-red-500 text-red-500"
                        }`}>
                        {isBlocked ? "🔒 HANDSHAKE SECURED" : "⚡️ HIJACK SUCCESSFUL"}
                    </div>
                </motion.div>
            )}
        </div>
    );
};
