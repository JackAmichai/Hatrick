import { motion } from "framer-motion";

// Simple SVG Hat
const HatSVG = ({ color }: { color: string }) => (
    <svg width="60" height="60" viewBox="0 0 100 100" fill={color}>
        <path d="M10 50 Q 50 10 90 50 L 90 70 L 10 70 Z" />
        <rect x="0" y="70" width="100" height="10" fill={color} />
    </svg>
);

interface HatProps {
    role: string;
    color: string;
    status: "IDLE" | "THINKING" | "ACTING";
}

export const Hat = ({ role, color, status }: HatProps) => {
    return (
        <div className="flex flex-col items-center gap-2">
            {/* The Floating Animation */}
            <motion.div
                animate={{
                    y: status === "IDLE" ? [0, -10, 0] : 0, // Float if idle
                    scale: status === "THINKING" ? [1, 1.1, 1] : 1, // Pulse if thinking
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <HatSVG color={color} />
            </motion.div>
            <span className="text-white text-xs font-mono opacity-50">{role}</span>
        </div>
    );
};
