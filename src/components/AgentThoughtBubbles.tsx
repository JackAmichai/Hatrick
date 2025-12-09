// Agent Thought Bubbles - Real-time streaming of agent reasoning
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, MessageCircle } from 'lucide-react';

interface Thought {
    id: string;
    text: string;
    type: 'reasoning' | 'observation' | 'decision' | 'question';
    timestamp: Date;
    confidence?: number;
}

interface AgentThoughtBubblesProps {
    agentId: string;
    agentName: string;
    agentColor: string;
    isActive?: boolean;
    streamThoughts?: boolean;
}

export const AgentThoughtBubbles = ({
    agentId,
    agentName,
    agentColor,
    isActive = false,
    streamThoughts = true
}: AgentThoughtBubblesProps) => {
    const [thoughts, setThoughts] = useState<Thought[]>([]);
    const [currentThought, setCurrentThought] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Sample thought templates based on agent role
    const thoughtTemplates: Record<string, string[]> = {
        RED_SCANNER: [
            "Scanning ports 80, 443, 22... detecting open services",
            "HTTP server responds with Apache 2.4.29, checking CVE database",
            "TLS handshake reveals OpenSSL 1.0.1e - Heartbleed vulnerability?",
            "Interesting... authentication endpoint has no rate limiting",
            "Cross-referencing discovered services with exploit database"
        ],
        RED_WEAPONIZER: [
            "Analyzing scan results... SQL injection vector looks promising",
            "Crafting payload: ' OR '1'='1' with encoding variations",
            "Buffer size calculation: 1024 bytes + RET address overflow",
            "Considering shellcode injection vs privilege escalation",
            "UDP flood would overwhelm firewall in 30 seconds based on bandwidth"
        ],
        RED_COMMANDER: [
            "Evaluating risk vs reward... database access = 85% success",
            "Defense team likely monitoring for volumetric attacks",
            "Should I approve SQL injection or pivot to API exploitation?",
            "Calculating collateral damage to adjacent systems",
            "Final decision: Execute SQL injection with prepared statements bypass"
        ],
        BLUE_SCANNER: [
            "Alert: Anomalous port scan detected from 10.0.1.15",
            "HTTP header length exceeds normal by 800 bytes - investigating",
            "SSL certificate validation mismatch on database connection",
            "Pattern recognition: Similar to APT29 lateral movement",
            "Correlating with threat intelligence feeds..."
        ],
        BLUE_WEAPONIZER: [
            "Deploying parameterized queries to block SQL injection",
            "Enabling ASLR and stack canaries on application server",
            "Configuring WAF rule: Block User-Agent > 512 chars",
            "Rate limiting: 100 req/min per IP with exponential backoff",
            "Activating honeypot credentials in authentication system"
        ],
        BLUE_COMMANDER: [
            "Attack surface reduced by 40% with current mitigations",
            "Cost-benefit: Cloud WAF ($500/mo) vs in-house IPS rebuild ($50K)",
            "Prioritizing: Database hardening > Network segmentation",
            "Approving automated incident response playbook",
            "Mitigation confidence: 82% based on historical data"
        ]
    };

    useEffect(() => {
        if (!isActive || !streamThoughts) return;

        const templates = thoughtTemplates[agentId] || [
            "Processing input data...",
            "Analyzing patterns and correlations",
            "Evaluating multiple solution paths",
            "Confidence scoring in progress"
        ];

        let thoughtIndex = 0;

        const generateThought = () => {
            const template = templates[thoughtIndex % templates.length];
            thoughtIndex++;

            const newThought: Thought = {
                id: `thought_${Date.now()}_${Math.random()}`,
                text: template,
                type: Math.random() > 0.7 ? 'decision' : Math.random() > 0.5 ? 'observation' : 'reasoning',
                timestamp: new Date(),
                confidence: Math.floor(Math.random() * 30) + 70
            };

            // Simulate typing effect
            setIsTyping(true);
            let charIndex = 0;
            setCurrentThought('');

            const typingInterval = setInterval(() => {
                if (charIndex < template.length) {
                    setCurrentThought(template.substring(0, charIndex + 1));
                    charIndex++;
                } else {
                    clearInterval(typingInterval);
                    setIsTyping(false);
                    setThoughts(prev => [...prev, newThought].slice(-5)); // Keep last 5 thoughts
                    setCurrentThought('');
                }
            }, 30);

            return () => clearInterval(typingInterval);
        };

        // Generate thoughts periodically
        const interval = setInterval(generateThought, 4000);
        generateThought(); // Initial thought

        return () => clearInterval(interval);
    }, [isActive, streamThoughts, agentId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [thoughts, currentThought]);

    const getThoughtIcon = (type: string) => {
        switch (type) {
            case 'decision': return <Zap size={12} className="text-yellow-400" />;
            case 'observation': return <MessageCircle size={12} className="text-cyan-400" />;
            case 'question': return <Brain size={12} className="text-purple-400" />;
            default: return <Brain size={12} className="text-gray-400" />;
        }
    };

    const getThoughtBorderColor = (type: string) => {
        switch (type) {
            case 'decision': return 'border-yellow-500/50';
            case 'observation': return 'border-cyan-500/50';
            case 'question': return 'border-purple-500/50';
            default: return 'border-gray-700';
        }
    };

    if (!isActive && thoughts.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute z-20 w-80 max-h-96 bg-neutral-900/95 backdrop-blur-md rounded-lg border-2 shadow-2xl overflow-hidden"
            style={{ 
                borderColor: agentColor + '80',
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: '110%',
                marginBottom: '10px'
            }}
        >
            {/* Header */}
            <div 
                className="px-4 py-2 border-b flex items-center justify-between"
                style={{ 
                    backgroundColor: agentColor + '20',
                    borderColor: agentColor + '40'
                }}
            >
                <div className="flex items-center gap-2">
                    <Brain size={16} style={{ color: agentColor }} />
                    <span className="text-sm font-bold text-white">{agentName}</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-gray-400 font-mono">THINKING</span>
                </div>
            </div>

            {/* Thought Stream */}
            <div ref={scrollRef} className="p-3 space-y-2 max-h-80 overflow-y-auto">
                <AnimatePresence>
                    {thoughts.map(thought => (
                        <motion.div
                            key={thought.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`p-2 bg-neutral-950/50 rounded border ${getThoughtBorderColor(thought.type)} text-xs`}
                        >
                            <div className="flex items-start gap-2">
                                <div className="mt-0.5">{getThoughtIcon(thought.type)}</div>
                                <div className="flex-1">
                                    <p className="text-gray-300 leading-relaxed">{thought.text}</p>
                                    {thought.confidence && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                                                    style={{ width: `${thought.confidence}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-mono">{thought.confidence}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Current Typing Thought */}
                {isTyping && currentThought && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-2 bg-neutral-950/50 rounded border border-gray-700 text-xs"
                    >
                        <div className="flex items-start gap-2">
                            <Brain size={12} className="text-gray-400 mt-0.5 animate-pulse" />
                            <p className="text-gray-300 leading-relaxed">
                                {currentThought}
                                <span className="inline-block w-1 h-3 bg-cyan-400 ml-0.5 animate-pulse" />
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Footer Stats */}
            <div 
                className="px-4 py-2 border-t flex items-center justify-between text-xs"
                style={{ borderColor: agentColor + '40' }}
            >
                <span className="text-gray-500 font-mono">Thoughts: {thoughts.length}</span>
                <span className="text-gray-500 font-mono">
                    {new Date().toLocaleTimeString()}
                </span>
            </div>

            {/* Tail/Arrow pointing down */}
            <div 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-r-2 border-b-2"
                style={{ 
                    backgroundColor: '#171717',
                    borderColor: agentColor + '80'
                }}
            />
        </motion.div>
    );
};
