import { useState, useEffect, useRef } from 'react';

// Define the shape of our updates
type AgentStatus = "IDLE" | "THINKING" | "ACTING";


interface Proposal {
    team: "RED" | "BLUE";
    action: string;
    description: string;
}

interface GameEvent {
    type: "STATE_UPDATE" | "NEW_MESSAGE" | "IMPACT" | "PROPOSAL"; // Added PROPOSAL
    agent: string; // e.g., "RED_SCANNER"
    status?: AgentStatus;
    text?: string;
    damage_taken?: number;
    mitigation_score?: number; // Added for MITM logic
    defense_desc?: string; // Added for Stack logic
    // Proposal fields
    team?: "RED" | "BLUE";
    action?: string;
    description?: string;
}

export const useGameSocket = () => {
    const [messages, setMessages] = useState<Record<string, string>>({});
    const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
    const [health, setHealth] = useState(100);
    const [isHit, setIsHit] = useState(false);
    const [mitigationScore, setMitigationScore] = useState(0); // Added state
    const [defenseDesc, setDefenseDesc] = useState(""); // Added state
    const [proposal, setProposal] = useState<Proposal | null>(null); // Added state
    const socketRef = useRef<WebSocket | null>(null);

    // MOCK DATA GENERATORS
    const mockStepRef = useRef(0);
    const mockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const runMockMode = () => {
        console.warn("Falling back to INTERACTIVE MOCK MODE");
        mockStepRef.current = 1; // RESET TO 1 TO START IMMEDIATELY

        // Clear any existing interval
        if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);

        mockIntervalRef.current = setInterval(() => {
            const step = mockStepRef.current; // Current step

            // --- RED TEAM TURN ---

            // 1. Red Scanner (Thinking)
            if (step === 1) {
                setStatuses(prev => ({ ...prev, RED_SCANNER: "THINKING" }));
                mockStepRef.current++;
            }
            // 2. Red Scanner (Result)
            else if (step === 2) {
                setMessages(prev => ({ ...prev, RED_SCANNER: "Target Acquired: Simulated Vulnerability found on Layer 7." }));
                setStatuses(prev => ({ ...prev, RED_SCANNER: "IDLE", RED_WEAPONIZER: "THINKING" }));
                mockStepRef.current++;
            }
            // 3. Red Weaponizer (Result)
            else if (step === 3) {
                setMessages(prev => ({ ...prev, RED_WEAPONIZER: "Compiling Payload: SQL Injection vs Localhost." }));
                setStatuses(prev => ({ ...prev, RED_WEAPONIZER: "IDLE", RED_COMMANDER: "THINKING" }));
                mockStepRef.current++;
            }
            // 4. RED PROPOSAL (PAUSE HERE)
            else if (step === 4) {
                setProposal({
                    team: "RED",
                    action: "SQL Injection",
                    description: "Inject malicious SQL query to bypass authentication. Est. Damage: 15%"
                });
                // DO NOT INCREMENT STEP automatically. Wait for submitDecision.
            }
            // 5. RED EXECUTE (Resume after approval)
            else if (step === 5) {
                setMessages(prev => ({ ...prev, RED_COMMANDER: "Authorized: DEPLOY PAYLOAD." }));
                setHealth(prev => Math.max(0, prev - 15));
                setIsHit(true);
                setTimeout(() => setIsHit(false), 500);
                setStatuses(prev => ({ ...prev, RED_COMMANDER: "IDLE", BLUE_SCANNER: "THINKING" }));
                mockStepRef.current++;
            }

            // --- BLUE TEAM TURN ---

            // 6. Blue Watchman (Thinking)
            else if (step === 6) {
                setMessages(prev => ({ ...prev, BLUE_SCANNER: "Anomaly Detected: Unauthorized DB Access signature." }));
                setStatuses(prev => ({ ...prev, BLUE_SCANNER: "IDLE", BLUE_WEAPONIZER: "THINKING" }));
                mockStepRef.current++;
            }
            // 7. Blue Engineering (Result)
            else if (step === 7) {
                setMessages(prev => ({ ...prev, BLUE_WEAPONIZER: "Deploying WAF Ruleset: BLOCK_SQLI." }));
                setStatuses(prev => ({ ...prev, BLUE_WEAPONIZER: "IDLE", BLUE_COMMANDER: "THINKING" }));
                mockStepRef.current++;
            }
            // 8. BLUE PROPOSAL (PAUSE HERE)
            else if (step === 8) {
                setProposal({
                    team: "BLUE",
                    action: "WAF Update",
                    description: "Deploy new WAF rules to block SQL Injection patterns. Mitigation: 85%"
                });
                // DO NOT INCREMENT STEP automatically.
            }
            // 9. BLUE EXECUTE (Resume after approval)
            else if (step === 9) {
                setMessages(prev => ({ ...prev, BLUE_COMMANDER: "System Secure. Mitigation Active." }));
                setDefenseDesc("WAF Shield Active 🛡️");
                setMitigationScore(85);
                setStatuses(prev => ({ ...prev, BLUE_COMMANDER: "IDLE" }));

                // End of Loop or Reset
                clearInterval(mockIntervalRef.current!);
            }

        }, 1500); // 1.5s per step

        return () => {
            if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
        };
    };

    useEffect(() => {
        // Connect to Backend
        const ws = new WebSocket("ws://localhost:8000/ws/game");
        socketRef.current = ws;

        ws.onopen = () => console.log("Connected to Game Server");
        ws.onerror = () => {
            console.error("Game Connector Failed. Activating Simulation.");
            // Auto-start mock mode if backend is missing (e.g. Vercel)
            // We only start mock logic if startGame is called later, 
            // but here we just flag it or handle it in startGame.
        };

        ws.onmessage = (event) => {
            const data: GameEvent = JSON.parse(event.data);

            if (data.type === "STATE_UPDATE") setStatuses(prev => ({ ...prev, [data.agent]: data.status! }));
            if (data.type === "NEW_MESSAGE") setMessages(prev => ({ ...prev, [data.agent]: data.text! }));
            if (data.type === "IMPACT") {
                const damage = data.damage_taken!;
                setHealth(prev => Math.max(0, prev - damage));
                if (data.mitigation_score !== undefined) setMitigationScore(data.mitigation_score);
                if (data.defense_desc) setDefenseDesc(data.defense_desc);
                if (damage > 0) {
                    setIsHit(true);
                    setTimeout(() => setIsHit(false), 500);
                }
            }
            // Handle Proposal
            if (data.type === "PROPOSAL") {
                setProposal({
                    team: data.team!,
                    action: data.action!,
                    description: data.description!
                });
            }
        };

        return () => ws.close();
    }, []);

    const startGame = (missionId: string) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "START", mission: missionId }));
        } else {
            console.warn("Socket not ready. Running Simulation.");
            runMockMode();
        }
    };

    const requestSummary = (team: "RED" | "BLUE") => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "SUMMARIZE", team }));
        } else {
            // MOCK SUMMARY (Fallback for Vercel/Offline)
            console.log("Generating Mock Summary...");
            if (team === 'RED') {
                setMessages(prev => ({ ...prev, RED_COMMANDER: "📢 RED REPORT: Scanned Localhost... Found SQLi Vector... Executed Payload." }));
            } else {
                setMessages(prev => ({ ...prev, BLUE_COMMANDER: "🛡️ BLUE REPORT: Detected Signature... WAF Ruleset Updated... Attack Mitigated." }));
            }
        }
    };

    const submitDecision = (approved: boolean) => {
        setProposal(null); // Clear UI immediately
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "DECISION", approved }));
        } else {
            // MOCK MODE HANDLER
            if (approved) {
                // Advance the mock step logic from the "PAUSE" state
                mockStepRef.current++;
                // Force immediate update if you want, but the interval will catch it
            } else {
                // If rejected in mock mode, maybe just loop back or show a "Rethinking" message
                setMessages(prev => ({ ...prev, RED_COMMANDER: "⚠️ Plan Rejected. Rethinking..." }));
                setTimeout(() => {
                    mockStepRef.current++; // Just proceed for the sake of the demo, or loop back complexity
                }, 1000);
            }
        }
    };

    const resetState = () => {
        setHealth(100);
        setMessages({});
        setStatuses({});
        setIsHit(false);
        setMitigationScore(0);
        setDefenseDesc("");
        setProposal(null);
    };

    return { messages, statuses, health, isHit, mitigationScore, defenseDesc, proposal, startGame, requestSummary, resetState, submitDecision };
};
