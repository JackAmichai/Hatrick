import { useState, useEffect, useRef } from 'react';

// Define the shape of our updates
type AgentStatus = "IDLE" | "THINKING" | "ACTING";


interface Proposal {
    team: "RED" | "BLUE";
    action: string;
    description: string;
}

interface GameEvent {
    type: "STATE_UPDATE" | "NEW_MESSAGE" | "IMPACT" | "PROPOSAL" | "CODE_RESPONSE"; // Added CODE_RESPONSE
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
    // Code fields
    code?: string;
    title?: string;
    environment?: Record<string, unknown>;
}

export const useGameSocket = () => {
    const [messages, setMessages] = useState<Record<string, string>>({});
    const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
    const [health, setHealth] = useState(100);
    const [isHit, setIsHit] = useState(false);
    const [mitigationScore, setMitigationScore] = useState(0); // Added state
    const [defenseDesc, setDefenseDesc] = useState(""); // Added state
    const [proposal, setProposal] = useState<Proposal | null>(null); // Added state
    const [codeData, setCodeData] = useState<{ team: "RED" | "BLUE"; code: string; title: string; description: string } | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const backendActiveRef = useRef(false);
    const backendFallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // MOCK DATA GENERATORS
    const mockStepRef = useRef(0);
    const mockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const runMockMode = () => {
        console.warn("🎭 Falling back to INTERACTIVE MOCK MODE");
        console.log("🔄 Resetting mock state and starting simulation...");
        mockStepRef.current = 1; // RESET TO 1 TO START IMMEDIATELY

        // Clear any existing interval
        if (mockIntervalRef.current) {
            console.log("🧹 Clearing existing mock interval");
            clearInterval(mockIntervalRef.current);
        }

        // RANDOMIZE MOCK SCRIPTS
        const variants = [
            {
                scan: "Target Acquired: Simulated Vulnerability found on Layer 7.",
                weapon: "Compiling Payload: SQL Injection vs Localhost.",
                proposal: "SQL Injection",
                desc: "Inject malicious SQL query to bypass authentication. Est. Damage: 15%",
                blueScan: "Anomaly Detected: Unauthorized DB Access signature.",
                blueWeap: "Deploying WAF Ruleset: BLOCK_SQLI."
            },
            {
                scan: "Target Acquired: Exposed Port 8080 found in subnet.",
                weapon: "Crafting Payload: Buffer Overflow via HTTP Header.",
                proposal: "Buffer Overflow",
                desc: "Send malformed header to crash service. Est. Damage: 25%",
                blueScan: "Alert: Memory Segmentation Fault predicted.",
                blueWeap: "Activating: ASLR & Stack Guardians."
            },
            {
                scan: "Target Acquired: Weak Encryption Key Exchange detected.",
                weapon: "Initializing: MITM Interception Module.",
                proposal: "MITM Attack",
                desc: "Intercept handshake and downgrade TLS. Est. Damage: 20%",
                blueScan: "Warning: Certificate Authority Mismatch.",
                blueWeap: "Enforcing: HSTS & Cert Pinning."
            }
        ];
        const script = variants[Math.floor(Math.random() * variants.length)];

        mockIntervalRef.current = setInterval(() => {
            const step = mockStepRef.current; // Current step
            console.log(`🎬 Mock Mode Step ${step}`);

            // --- RED TEAM TURN ---

            // 1. Red Scanner (Thinking)
            if (step === 1) {
                console.log("🔴 RED_SCANNER: THINKING");
                setStatuses(prev => ({ ...prev, RED_SCANNER: "THINKING" }));
                mockStepRef.current++;
            }
            // 2. Red Scanner (Result)
            else if (step === 2) {
                setMessages({ RED_SCANNER: script.scan });
                setStatuses(prev => ({ ...prev, RED_SCANNER: "IDLE", RED_WEAPONIZER: "THINKING" }));
                mockStepRef.current++;
            }
            // 3. Red Weaponizer (Result)
            else if (step === 3) {
                setMessages({ RED_WEAPONIZER: script.weapon });
                setStatuses(prev => ({ ...prev, RED_WEAPONIZER: "IDLE", RED_COMMANDER: "THINKING" }));
                mockStepRef.current++;
            }
            // 4. RED PROPOSAL (PAUSE HERE)
            else if (step === 4) {
                setProposal({
                    team: "RED",
                    action: script.proposal,
                    description: script.desc
                });
                // DO NOT INCREMENT STEP automatically. Wait for submitDecision.
            }
            // 5. RED EXECUTE (Resume after approval)
            else if (step === 5) {
                setMessages({ RED_COMMANDER: "Authorized: DEPLOY PAYLOAD." });
                setHealth(prev => Math.max(0, prev - 15));
                setIsHit(true);
                setTimeout(() => setIsHit(false), 500);
                setStatuses(prev => ({ ...prev, RED_COMMANDER: "IDLE", BLUE_SCANNER: "THINKING" }));
                mockStepRef.current++;
            }

            // --- BLUE TEAM TURN ---

            // 6. Blue Watchman (Thinking)
            else if (step === 6) {
                setMessages(prev => ({ ...prev, BLUE_SCANNER: "Thinking..." }));
                setStatuses(prev => ({ ...prev, BLUE_SCANNER: "THINKING" }));
                mockStepRef.current++;
            }
            // 7. Blue Watchman result
            else if (step === 7) {
                setMessages({ BLUE_SCANNER: script.blueScan });
                setStatuses(prev => ({ ...prev, BLUE_SCANNER: "IDLE", BLUE_WEAPONIZER: "THINKING" }));
                mockStepRef.current++;
            }
            // 8. Blue Engineering (Result)
            else if (step === 8) {
                setMessages({ BLUE_WEAPONIZER: script.blueWeap });
                setStatuses(prev => ({ ...prev, BLUE_WEAPONIZER: "IDLE", BLUE_COMMANDER: "THINKING" }));
                mockStepRef.current++;
            }
            // 9. BLUE PROPOSAL (PAUSE HERE)
            else if (step === 9) {
                setProposal({
                    team: "BLUE",
                    action: "Defensive Measures",
                    description: "Deploying Countermeasures. Mitigation: 85%"
                });
                // DO NOT INCREMENT STEP automatically.
            }
            // 10. BLUE EXECUTE (Resume after approval)
            else if (step === 10) {
                setMessages({ BLUE_COMMANDER: "System Secure. Mitigation Active." });
                setDefenseDesc("Shield Active 🛡️");
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
        // Helper to clear backend fallback timer
        const clearBackendFallback = () => {
            if (backendFallbackTimer.current) {
                clearTimeout(backendFallbackTimer.current);
                backendFallbackTimer.current = null;
            }
        };

        // Connect to Backend
        const backendUrl = import.meta.env.VITE_BACKEND_URL
            ? import.meta.env.VITE_BACKEND_URL.replace(/^http/, 'ws') + "/ws/game"
            : (import.meta.env.DEV ? "ws://localhost:8000/ws/game" : "wss://hatrick.onrender.com/ws/game");

        const ws = new WebSocket(backendUrl);
        socketRef.current = ws;

        // Add timeout to detect if backend is not responding
        const connectionTimeout = setTimeout(() => {
            if (ws.readyState !== WebSocket.OPEN) {
                console.warn("⚠️ Backend connection timeout. Mock mode will be available.");
                ws.close();
            }
        }, 3000); // 3 second timeout

        ws.onopen = () => {
            console.log("✅ Connected to Game Server");
            clearTimeout(connectionTimeout);
            backendActiveRef.current = false;
        };
        
        ws.onmessage = (event) => {
            try {
                const data: GameEvent = JSON.parse(event.data);
                clearBackendFallback();
                console.log("📨 Game Event", data.type, data);

                if (data.type === "STATE_UPDATE" && data.agent && data.status) {
                    setStatuses(prev => ({ ...prev, [data.agent]: data.status! }));
                }
            clearBackendFallback();

                if (data.type === "NEW_MESSAGE" && data.agent && data.text) {
                    setMessages(prev => ({ ...prev, [data.agent]: data.text! }));
                }

                if (data.type === "IMPACT") {

                if (!backendActiveRef.current) {
                    backendActiveRef.current = true;
                    clearBackendFallback();
                }
                    const damage = data.damage_taken ?? 0;
                    setHealth(prev => Math.max(0, prev - damage));
                    if (data.mitigation_score !== undefined) setMitigationScore(data.mitigation_score);
                    if (data.defense_desc) setDefenseDesc(data.defense_desc);
                }

                if (data.type === "PROPOSAL" && data.team && data.action && data.description) {
                    setProposal({
                        team: data.team,
                        action: data.action,
                        description: data.description
                    });
                }

                if (data.type === "CODE_RESPONSE" && data.team && data.code && data.title) {
                    setCodeData({
                        team: data.team,
                        code: data.code,
                        title: data.title,
                        description: data.description ?? ""
                    });
                }
            } catch (error) {
                console.error("Failed to parse game event", error, event.data);
            }
        };

        return () => {
            clearTimeout(connectionTimeout);
            clearBackendFallback();
            ws.close();
        };
    }, []);

    const startGame = (missionId: string) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            console.log(`🎮 Starting game with mission: ${missionId} (Backend mode)`);
            socketRef.current.send(JSON.stringify({ type: "START", mission: missionId }));
            backendActiveRef.current = false;
            if (backendFallbackTimer.current) {
                clearTimeout(backendFallbackTimer.current);
            }
            backendFallbackTimer.current = setTimeout(() => {
                if (!backendActiveRef.current) {
                    console.warn("⏱️ No backend activity detected after START. Switching to mock mode.");
                    socketRef.current?.close();
                    socketRef.current = null;
                    runMockMode();
                }
            }, 5000);
        } else {
            console.warn(`🎮 Starting game with mission: ${missionId} (Mock mode - backend unavailable)`);
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
                setMessages({ RED_COMMANDER: "📢 RED REPORT: Scanned Localhost... Found SQLi Vector... Executed Payload." });
            } else {
                setMessages({ BLUE_COMMANDER: "🛡️ BLUE REPORT: Detected Signature... WAF Ruleset Updated... Attack Mitigated." });
            }
        }
    };

    const requestCode = (team: "RED" | "BLUE") => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "GET_CODE", team }));
        } else {
            // MOCK CODE (Fallback for offline mode)
            const mockCode = team === "RED" 
                ? `# Mock Attack Code\nimport socket\n\nTARGET = "localhost"\nPORT = 8080\n\nprint("Simulating attack...")`
                : `# Mock Defense Code\nimport firewall\n\nfirewall.enable()\nprint("Defense active")`;
            
            setCodeData({
                team,
                code: mockCode,
                title: `${team} Team Script`,
                description: "Mock code (backend offline)"
            });
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
                setMessages({ RED_COMMANDER: "⚠️ Plan Rejected. Rethinking..." });
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
        setCodeData(null);
    };

    return { messages, statuses, health, isHit, mitigationScore, defenseDesc, proposal, codeData, startGame, requestSummary, requestCode, resetState, submitDecision, setCodeData };
};
