import { useState, useEffect, useRef } from 'react';

// Define the shape of our updates
type AgentStatus = "IDLE" | "THINKING" | "ACTING";


interface Proposal {
    team: "RED" | "BLUE";
    action: string;
    description: string;
}

interface GameEvent {
    type: "STATE_UPDATE" | "NEW_MESSAGE" | "IMPACT" | "PROPOSAL" | "CODE_RESPONSE" | "EDUCATIONAL_RESPONSE"; // Added EDUCATIONAL_RESPONSE
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
    // Educational fields
    edu_text?: string;
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
    const [educationalContent, setEducationalContent] = useState<string | null>(null);
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

        // MISSION-AWARE MOCK SCRIPTS with vulnerability context
        const variants = [
            {
                scan: "🔍 RECON: Target 192.168.1.45 online. Port 3306 (MySQL 5.7.31) detected. Unvalidated input in /login endpoint identified.",
                infra: "🏗️ INFRA: Load balancer misconfigured. No rate limiting on database connections. Direct DB access possible via port 3306.",
                data: "📊 DATA: User credentials table exposed. Password hashing uses weak MD5. Session tokens predictable.",
                weapon: "⚔️ EXPLOIT: SQL Injection payload crafted: ' OR '1'='1' -- targeting login form authentication bypass.",
                proposal: "SQL Injection Attack",
                desc: "Inject malicious SQL query via login form to bypass authentication. Estimated damage: 75%",
                blueScan: "🚨 ALERT: Anomalous database query pattern detected. SQL injection attempt on authentication endpoint.",
                blueInfra: "🛡️ NETWORK: Activating database firewall. Blocking suspicious SQL patterns from external IPs.",
                blueData: "🔐 PROTECT: Enabling query parameterization. Revoking direct database access for web tier.",
                blueWeap: "🔧 DEPLOY: WAF rule set OWASP-CRS activated. Input sanitization layer enabled."
            },
            {
                scan: "🔍 RECON: Target 10.0.0.128 responding. Port 80 (Apache/2.4.29) vulnerable. HTTP header parsing buffer unchecked.",
                infra: "🏗️ INFRA: Web server using outdated Apache version. Stack canaries disabled. ASLR not enforced.",
                data: "📊 DATA: Memory layout predictable. Return address at offset 1024 bytes. Shell code injection possible.",
                weapon: "⚔️ EXPLOIT: Buffer overflow via User-Agent header. Payload size: 1536 bytes with NOP sled and shellcode.",
                proposal: "Buffer Overflow Attack",
                desc: "Send malformed HTTP header to corrupt memory and execute arbitrary code. Estimated damage: 85%",
                blueScan: "🚨 ALERT: Memory segmentation fault predicted. Oversized HTTP header detected in incoming request.",
                blueInfra: "🛡️ NETWORK: Enabling stack protection mechanisms. Updating firewall to filter oversized headers.",
                blueData: "🔐 PROTECT: Implementing input length validation. Enabling DEP for memory protection.",
                blueWeap: "🔧 DEPLOY: ASLR enabled. Stack canaries activated. Max header size enforced at 8KB."
            },
            {
                scan: "🔍 RECON: Target 172.16.0.55 intercepted. TLS 1.0 negotiation vulnerable. OpenSSL 1.0.1e detected (CVE-2014-0160).",
                infra: "🏗️ INFRA: No certificate pinning. HSTS not enforced. ARP tables not protected.",
                data: "📊 DATA: Session tokens transmitted in TLS 1.0. Perfect Forward Secrecy disabled. Heartbleed exploitable.",
                weapon: "⚔️ EXPLOIT: MITM via ARP spoofing + SSL stripping. Intercepting credentials during TLS handshake.",
                proposal: "MITM Attack",
                desc: "Intercept TLS handshake and downgrade encryption to steal credentials. Estimated damage: 70%",
                blueScan: "🚨 ALERT: ARP anomaly detected. Certificate mismatch warning. Potential MITM in progress.",
                blueInfra: "🛡️ NETWORK: Enforcing static ARP entries. Upgrading TLS to 1.3. Enabling HSTS preload.",
                blueData: "🔐 PROTECT: Certificate pinning enabled. Mutual TLS authentication required.",
                blueWeap: "🔧 DEPLOY: HSTS headers configured. Certificate transparency monitoring active."
            }
        ];
        const script = variants[Math.floor(Math.random() * variants.length)];

        mockIntervalRef.current = setInterval(() => {
            const step = mockStepRef.current;
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
                setStatuses(prev => ({ ...prev, RED_SCANNER: "IDLE", RED_INF: "THINKING" }));
                mockStepRef.current++;
            }
            // 2b. Red Infrastructure (Result)
            else if (step === 3) {
                setMessages(prev => ({ ...prev, RED_INF: script.infra }));
                setStatuses(prev => ({ ...prev, RED_INF: "IDLE", RED_DATA: "THINKING" }));
                mockStepRef.current++;
            }
            // 2c. Red Data (Result)
            else if (step === 4) {
                setMessages(prev => ({ ...prev, RED_DATA: script.data }));
                setStatuses(prev => ({ ...prev, RED_DATA: "IDLE", RED_WEAPONIZER: "THINKING" }));
                mockStepRef.current++;
            }
            // 3. Red Weaponizer (Result)
            else if (step === 5) {
                setMessages(prev => ({ ...prev, RED_WEAPONIZER: script.weapon }));
                setStatuses(prev => ({ ...prev, RED_WEAPONIZER: "IDLE", RED_COMMANDER: "THINKING" }));
                mockStepRef.current++;
            }
            // 4. RED PROPOSAL (PAUSE HERE)
            else if (step === 6) {
                setProposal({
                    team: "RED",
                    action: script.proposal,
                    description: script.desc
                });
                // DO NOT INCREMENT STEP automatically. Wait for submitDecision.
            }
            // 5. RED EXECUTE (Resume after approval)
            else if (step === 7) {
                setMessages(prev => ({ ...prev, RED_COMMANDER: "✅ AUTHORIZED: Attack sequence initiated. Deploying payload to target." }));
                setHealth(prev => Math.max(0, prev - 25));
                setIsHit(true);
                setTimeout(() => setIsHit(false), 500);
                setStatuses(prev => ({ ...prev, RED_COMMANDER: "IDLE", BLUE_SCANNER: "THINKING" }));
                mockStepRef.current++;
            }

            // --- BLUE TEAM TURN ---

            // 6. Blue Scanner (Thinking)
            else if (step === 8) {
                setStatuses(prev => ({ ...prev, BLUE_SCANNER: "THINKING" }));
                mockStepRef.current++;
            }
            // 7. Blue Scanner result
            else if (step === 9) {
                setMessages(prev => ({ ...prev, BLUE_SCANNER: script.blueScan }));
                setStatuses(prev => ({ ...prev, BLUE_SCANNER: "IDLE", BLUE_INF: "THINKING" }));
                mockStepRef.current++;
            }
            // 7b. Blue Infrastructure result
            else if (step === 10) {
                setMessages(prev => ({ ...prev, BLUE_INF: script.blueInfra }));
                setStatuses(prev => ({ ...prev, BLUE_INF: "IDLE", BLUE_DATA: "THINKING" }));
                mockStepRef.current++;
            }
            // 7c. Blue Data result
            else if (step === 11) {
                setMessages(prev => ({ ...prev, BLUE_DATA: script.blueData }));
                setStatuses(prev => ({ ...prev, BLUE_DATA: "IDLE", BLUE_WEAPONIZER: "THINKING" }));
                mockStepRef.current++;
            }
            // 8. Blue Engineer (Result)
            else if (step === 12) {
                setMessages(prev => ({ ...prev, BLUE_WEAPONIZER: script.blueWeap }));
                setStatuses(prev => ({ ...prev, BLUE_WEAPONIZER: "IDLE", BLUE_COMMANDER: "THINKING" }));
                mockStepRef.current++;
            }
            // 9. BLUE PROPOSAL (PAUSE HERE)
            else if (step === 13) {
                setProposal({
                    team: "BLUE",
                    action: "Deploy Countermeasures",
                    description: "Activating defense protocols. Estimated mitigation: 85%"
                });
                // DO NOT INCREMENT STEP automatically.
            }
            // 10. BLUE EXECUTE (Resume after approval)
            else if (step === 14) {
                setMessages(prev => ({ ...prev, BLUE_COMMANDER: "✅ DEPLOYED: Defense systems active. Attack successfully mitigated." }));
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

                // Mark backend as active on first meaningful message
                if (!backendActiveRef.current && (data.type === "STATE_UPDATE" || data.type === "NEW_MESSAGE" || data.type === "IMPACT")) {
                    backendActiveRef.current = true;
                    clearBackendFallback();
                    console.log("✅ Backend is active - LLM responses confirmed");
                }

                if (data.type === "STATE_UPDATE" && data.agent && data.status) {
                    setStatuses(prev => ({ ...prev, [data.agent]: data.status! }));
                }

                if (data.type === "NEW_MESSAGE" && data.agent && data.text) {
                    setMessages(prev => ({ ...prev, [data.agent]: data.text! }));
                }

                if (data.type === "IMPACT") {
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

                if (data.type === "EDUCATIONAL_RESPONSE" && data.edu_text) {
                    setEducationalContent(data.edu_text);
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
            // MOCK SUMMARY (Fallback for Vercel/Offline) - Merge with existing messages
            console.log("Generating Mock Summary...");
            if (team === 'RED') {
                setMessages(prev => ({ ...prev, RED_COMMANDER: "📢 RED REPORT: Scanned target system... Identified vulnerabilities... Attack deployed. Defense response pending." }));
            } else {
                setMessages(prev => ({ ...prev, BLUE_COMMANDER: "🛡️ BLUE REPORT: Threat detected and analyzed... Defense countermeasures proposed... System protected." }));
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

    const requestExplanation = () => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "EXPLAIN" }));
        } else {
            setEducationalContent("## Mock Explanation\n\n**Attack:** SQL Injection\n**Defense:** WAF\n\nThis is a fallback message because the backend is not connected.");
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
                // Rejection triggers rethinking: go back to scanning phase with visual feedback
                const currentStep = mockStepRef.current;
                
                // Determine which team is being rejected based on current step
                if (currentStep === 6) {
                    // RED team rejection - go back to step 1 to rethink attack
                    setMessages(prev => ({ ...prev, RED_COMMANDER: "⚠️ Authorization Denied. Rethinking attack strategy..." }));
                    setStatuses(prev => ({ ...prev, RED_COMMANDER: "THINKING" }));
                    setTimeout(() => {
                        // Reset RED team to scanner phase
                        mockStepRef.current = 1;
                        setStatuses(prev => ({ 
                            ...prev, 
                            RED_COMMANDER: "IDLE",
                            RED_SCANNER: "THINKING"
                        }));
                    }, 1500);
                } else if (currentStep === 13) {
                    // BLUE team rejection - go back to step 8 to rethink defense
                    setMessages(prev => ({ ...prev, BLUE_COMMANDER: "⚠️ Plan Rejected. Recalculating defense..." }));
                    setStatuses(prev => ({ ...prev, BLUE_COMMANDER: "THINKING" }));
                    setTimeout(() => {
                        // Reset BLUE team to scanner phase
                        mockStepRef.current = 8;
                        setStatuses(prev => ({ 
                            ...prev, 
                            BLUE_COMMANDER: "IDLE",
                            BLUE_SCANNER: "THINKING"
                        }));
                    }, 1500);
                }
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
        setEducationalContent(null);
    };

    return { messages, statuses, health, isHit, mitigationScore, defenseDesc, proposal, codeData, educationalContent, startGame, requestSummary, requestCode, requestExplanation, resetState, submitDecision, setCodeData, setEducationalContent };
};
