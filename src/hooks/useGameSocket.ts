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
    const runMockMode = () => {
        console.warn("Falling back to MOCK MODE");
        let step = 0;
        const mockInterval = setInterval(() => {
            step++;

            // 1. Red Scanner
            if (step === 2) {
                setStatuses(prev => ({ ...prev, RED_SCANNER: "THINKING" }));
            }
            if (step === 4) {
                setMessages(prev => ({ ...prev, RED_SCANNER: "Target Acquired: Simulated Vulnerability found on Layer 7." }));
                setStatuses(prev => ({ ...prev, RED_SCANNER: "IDLE", RED_WEAPONIZER: "THINKING" }));
            }

            // 2. Red Weaponizer & Commander
            if (step === 6) {
                setMessages(prev => ({ ...prev, RED_WEAPONIZER: "Compiling Payload: SQL Injection vs Localhost." }));
                setStatuses(prev => ({ ...prev, RED_WEAPONIZER: "IDLE", RED_COMMANDER: "THINKING" }));
            }
            if (step === 8) {
                setMessages(prev => ({ ...prev, RED_COMMANDER: "Authorized: DEPLOY PAYLOAD." }));
                setHealth(prev => Math.max(0, prev - 15));
                setIsHit(true);
                setTimeout(() => setIsHit(false), 500);
                setStatuses(prev => ({ ...prev, RED_COMMANDER: "IDLE", BLUE_SCANNER: "THINKING" }));
            }

            // 3. Blue Team Response
            if (step === 10) {
                setMessages(prev => ({ ...prev, BLUE_SCANNER: "Anomaly Detected: Unauthorized DB Access signature." }));
                setStatuses(prev => ({ ...prev, BLUE_SCANNER: "IDLE", BLUE_WEAPONIZER: "THINKING" }));
            }
            if (step === 12) {
                setMessages(prev => ({ ...prev, BLUE_WEAPONIZER: "Deploying WAF Ruleset: BLOCK_SQLI." }));
                setStatuses(prev => ({ ...prev, BLUE_WEAPONIZER: "IDLE", BLUE_COMMANDER: "THINKING" }));
            }
            if (step === 14) {
                setMessages(prev => ({ ...prev, BLUE_COMMANDER: "System Secure. Mitigation Active." }));
                setDefenseDesc("WAF Shield Active 🛡️");
                setMitigationScore(85);
                setStatuses(prev => ({ ...prev, BLUE_COMMANDER: "IDLE" }));
                clearInterval(mockInterval);
            }

        }, 1500);
        return () => clearInterval(mockInterval);
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
