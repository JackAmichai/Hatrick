import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useCallback } from "react";

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
    const approveButtonRef = useRef<HTMLButtonElement>(null);
    const rejectButtonRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    
    // Focus trap and keyboard handling
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;
        
        if (e.key === 'Escape') {
            e.preventDefault();
            onReject();
            return;
        }
        
        // Tab trap within modal
        if (e.key === 'Tab') {
            const focusableElements = modalRef.current?.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (!focusableElements || focusableElements.length === 0) return;
            
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }, [isOpen, onReject]);
    
    // Focus first button when modal opens
    useEffect(() => {
        if (isOpen) {
            // Small delay to ensure animation has started
            const timer = setTimeout(() => {
                approveButtonRef.current?.focus();
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
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onReject}
                        aria-hidden="true"
                    />

                    {/* Modal */}
                    <motion.div
                        ref={modalRef}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className={`relative w-full max-w-lg rounded-2xl border-2 p-8 shadow-2xl ${team === "RED"
                                ? "bg-neutral-900/90 border-red-500 shadow-red-500/20"
                                : "bg-neutral-900/90 border-blue-500 shadow-blue-500/20"
                            }`}
                    >
                        <h2 
                            id="modal-title"
                            className={`text-2xl font-bold mb-2 uppercase tracking-widest ${team === "RED" ? "text-red-500" : "text-blue-400"
                            }`}
                        >
                            {team} Team Proposal
                        </h2>

                        <div id="modal-description" className="mb-6 space-y-4">
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                <h3 className="text-white font-bold text-lg mb-1">{actionName}</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {description}
                                </p>
                            </div>
                            <div className="text-xs text-gray-500 font-mono text-center" aria-live="polite">
                                Awaiting authorization to execute...
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                ref={rejectButtonRef}
                                onClick={onReject}
                                type="button"
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-600 text-gray-300 font-bold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-colors uppercase tracking-wider text-sm min-h-[44px]"
                                aria-label={`Reject ${actionName} and request rethink`}
                            >
                                Disagree (Rethink)
                            </button>
                            <button
                                ref={approveButtonRef}
                                onClick={onApprove}
                                type="button"
                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-transform hover:scale-105 uppercase tracking-wider text-sm min-h-[44px] ${team === "RED" 
                                    ? "bg-red-500 hover:bg-red-400 focus:ring-red-400" 
                                    : "bg-blue-500 hover:bg-blue-400 focus:ring-blue-400"
                                    }`}
                                aria-label={`Approve and execute ${actionName}`}
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
