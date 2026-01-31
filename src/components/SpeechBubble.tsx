import { motion, AnimatePresence } from "framer-motion";

interface SpeechBubbleProps {
    text: string | null;
    id?: string;
}

export const SpeechBubble = ({ text, id }: SpeechBubbleProps) => {
    return (
        <AnimatePresence>
            {text && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: -20, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    role="tooltip"
                    id={id}
                    aria-live="polite"
                    className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 bg-neutral-900/90 border border-green-500/50 text-green-400 p-3 rounded-lg text-xs font-mono shadow-[0_0_15px_rgba(74,222,128,0.1)] z-20 backdrop-blur-md"
                >
                    {/* Agent message content */}
                    {text}

                    {/* The little triangle at the bottom */}
                    <div 
                        className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-900 border-b border-r border-green-500/50 rotate-45 transform"
                        aria-hidden="true"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
