import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useCallback } from "react";
import ReactMarkdown from 'react-markdown';

interface EducationalModalProps {
    isOpen: boolean;
    content: string;
    onClose: () => void;
    isLoading?: boolean;
}

export const EducationalModal = ({
    isOpen,
    content,
    onClose,
    isLoading = false
}: EducationalModalProps) => {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Focus trap and keyboard handling
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
            return;
        }
    }, [isOpen, onClose]);

    // Focus close button when modal opens
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                closeButtonRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Add keyboard listener
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="edu-modal-title"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Modal */}
                    <motion.div
                        ref={modalRef}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border-2 border-indigo-500 bg-neutral-900 shadow-2xl shadow-indigo-500/20"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-indigo-500/30">
                            <h2
                                id="edu-modal-title"
                                className="text-2xl font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2"
                            >
                                <span>🎓</span> Mission Debrief
                            </h2>
                            <button
                                ref={closeButtonRef}
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors"
                                aria-label="Close educational modal"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-indigo-300 font-mono animate-pulse">Consulting Cyber Warfare Experts...</p>
                                </div>
                            ) : (
                                <div className="prose prose-invert prose-indigo max-w-none">
                                    <ReactMarkdown>{content || "No content available."}</ReactMarkdown>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-indigo-500/30 bg-black/20 rounded-b-xl flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors"
                            >
                                Close Briefing
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
