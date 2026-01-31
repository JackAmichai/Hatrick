import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeViewerProps {
    isOpen: boolean;
    onClose: () => void;
    team: "RED" | "BLUE";
    code: string;
    title: string;
    description: string;
}

export const CodeViewer = ({ isOpen, onClose, team, code, title, description }: CodeViewerProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const bgGradient = team === "RED" 
        ? "from-red-900/20 to-neutral-900" 
        : "from-blue-900/20 to-neutral-900";

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
                        className={`relative w-full max-w-4xl max-h-[85vh] bg-gradient-to-br ${bgGradient} border-2 ${
                            team === "RED" ? "border-red-500/50" : "border-blue-500/50"
                        } rounded-xl shadow-2xl overflow-hidden`}
                    >
                        {/* Header */}
                        <div className={`px-6 py-4 border-b ${
                            team === "RED" ? "border-red-500/30 bg-red-950/30" : "border-blue-500/30 bg-blue-950/30"
                        }`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className={`text-2xl font-bold ${
                                        team === "RED" ? "text-red-400" : "text-blue-400"
                                    }`}>
                                        {team === "RED" ? "🔴" : "🔵"} {title}
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">{description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className={`p-2 rounded-lg transition-all ${
                                            team === "RED" 
                                                ? "hover:bg-red-500/20 text-red-400" 
                                                : "hover:bg-blue-500/20 text-blue-400"
                                        }`}
                                        title="Copy code"
                                    >
                                        {copied ? <Check size={20} /> : <Copy size={20} />}
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Code Display */}
                        <div className="overflow-auto max-h-[calc(85vh-120px)] p-6">
                            <pre className="font-mono text-sm leading-relaxed">
                                <code className="text-gray-200 whitespace-pre-wrap break-words">
                                    {code}
                                </code>
                            </pre>
                        </div>

                        {/* Footer */}
                        <div className={`px-6 py-3 border-t ${
                            team === "RED" ? "border-red-500/30 bg-red-950/20" : "border-blue-500/30 bg-blue-950/20"
                        } text-xs text-gray-500`}>
                            <span className="font-mono">
                                {team === "RED" ? "⚠️ Malicious Code - For Educational Purposes Only" : "✅ Defensive Code - Security Implementation"}
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
