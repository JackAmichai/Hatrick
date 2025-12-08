import { motion, AnimatePresence } from "framer-motion";

interface ApprovalModalProps {
    isOpen: boolean;
    team: "RED" | "BLUE";
    actionName: string;
    description: string;
    onApprove: () => void;
    onReject: () => void;
}

export const ApprovalModal = ({
    isOpen,
    team,
    actionName,
    description,
    onApprove,
    onReject
}: ApprovalModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className={`relative w-full max-w-lg rounded-2xl border-2 p-8 shadow-2xl ${team === "RED"
                                ? "bg-neutral-900/90 border-red-500 shadow-red-500/20"
                                : "bg-neutral-900/90 border-blue-500 shadow-blue-500/20"
                            }`}
                    >
                        <h2 className={`text-2xl font-bold mb-2 uppercase tracking-widest ${team === "RED" ? "text-red-500" : "text-blue-400"
                            }`}>
                            {team} Team Proposal
                        </h2>

                        <div className="mb-6 space-y-4">
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                <h3 className="text-white font-bold text-lg mb-1">{actionName}</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {description}
                                </p>
                            </div>
                            <div className="text-xs text-gray-500 font-mono text-center">
                                Awaiting authorization to execute...
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={onReject}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-600 text-gray-300 font-bold hover:bg-gray-800 transition-colors uppercase tracking-wider text-sm"
                            >
                                Disagree (Rethink)
                            </button>
                            <button
                                onClick={onApprove}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-black transition-transform hover:scale-105 uppercase tracking-wider text-sm ${team === "RED" ? "bg-red-500 hover:bg-red-400" : "bg-blue-500 hover:bg-blue-400"
                                    }`}
                            >
                                Agree (Execute)
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
