import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface AnnouncerProps {
    round: number;
    layerName: string; // e.g., "Network Infrastructure"
    onComplete: () => void; // Tell the game to start when audio finishes
}

export const Announcer = ({ round, layerName, onComplete }: AnnouncerProps) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        // 1. The Script (UFC Style)
        const text = `ROUND ${round}. ${layerName}. FIGHT!`;

        // 2. The Voice Logic
        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a "stronger" voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha")) || null;
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 1.1; // Faster, more hype
        utterance.pitch = 1.2; // Higher pitch for energy (or lower for grunt, but typically announcers shout)
        utterance.volume = 1;

        // 3. Play it (with fallback)
        utterance.onend = () => {
            setTimeout(() => {
                setShow(false);
                onComplete();
            }, 500);
        };

        // Fallback: If TTS fails or doesn't start, force completion after 4s
        const timer = setTimeout(() => {
            if (show) {
                setShow(false);
                onComplete();
            }
        }, 4000);

        window.speechSynthesis.speak(utterance);

        return () => {
            window.speechSynthesis.cancel();
            clearTimeout(timer);
        };
    }, [round]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-black/80 backdrop-blur-sm"
                >
                    <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-blue-500 uppercase italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                        Round {round}
                    </h1>
                    <h2 className="text-4xl text-white font-mono mt-4 typing-effect">
                        {layerName}
                    </h2>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
