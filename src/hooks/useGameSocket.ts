import { useState, useEffect, useRef } from 'react';

// Define the shape of our updates
type AgentStatus = "IDLE" | "THINKING" | "ACTING";

interface Proposal {
    team: "RED" | "BLUE";
    action: string;
    description: string;
}

interface GameEvent {
    type: "STATE_UPDATE" | "NEW_MESSAGE" | "IMPACT" | "PROPOSAL" | "CODE_RESPONSE" | "EDUCATIONAL_RESPONSE";
    agent: string;
    status?: AgentStatus;
    text?: string;
    damage_taken?: number;
    mitigation_score?: number;
    defense_desc?: string;
    team?: "RED" | "BLUE";
    action?: string;
    description?: string;
    code?: string;
    title?: string;
    environment?: Record<string, unknown>;
    edu_text?: string;
}

export const useGameSocket = () => {
    const [messages, setMessages] = useState<Record<string, string>>({});
    const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
    const [health, setHealth] = useState(100);
    const [isHit, setIsHit] = useState(false);
    const [mitigationScore, setMitigationScore] = useState(0);
    const [defenseDesc, setDefenseDesc] = useState("");
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [codeData, setCodeData] = useState<{ team: "RED" | "BLUE"; code: string; title: string; description: string } | null>(null);
    const [educationalContent, setEducationalContent] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Connect to Backend
        const backendUrl = import.meta.env.VITE_BACKEND_URL
            ? import.meta.env.VITE_BACKEND_URL.replace(/^http/, 'ws') + "/ws/game"
            : (import.meta.env.DEV ? "ws://localhost:8000/ws/game" : "wss://hatrick.onrender.com/ws/game");

        console.log(`🔌 Connecting to WebSocket: ${backendUrl}`);
        const ws = new WebSocket(backendUrl);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log("✅ Connected to Game Server");
            setIsConnected(true);
            setConnectionError(null);
        };

        ws.onmessage = (event) => {
            try {
                const data: GameEvent = JSON.parse(event.data);
                console.log("📨 Game Event", data.type, data);

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

        ws.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
            setConnectionError("WebSocket connection error");
            setIsConnected(false);
        };

        ws.onclose = (event) => {
            console.log(`🔌 WebSocket closed: ${event.code} ${event.reason}`);
            setIsConnected(false);
            if (event.code !== 1000) {
                setConnectionError(`Connection closed unexpectedly (${event.code})`);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    const startGame = (missionId: string) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            console.log(`🎮 Starting game with mission: ${missionId}`);
            socketRef.current.send(JSON.stringify({ type: "START", mission: missionId }));
        } else {
            console.error("❌ Cannot start game: WebSocket not connected");
            setConnectionError("Not connected to server. Please refresh the page.");
        }
    };

    const requestSummary = (team: "RED" | "BLUE") => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            console.log(`📜 Requesting summary for ${team} team`);
            socketRef.current.send(JSON.stringify({ type: "SUMMARIZE", team }));
        } else {
            console.error("❌ Cannot request summary: WebSocket not connected");
        }
    };

    const requestCode = (team: "RED" | "BLUE") => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            console.log(`💻 Requesting code for ${team} team`);
            socketRef.current.send(JSON.stringify({ type: "GET_CODE", team }));
        } else {
            console.error("❌ Cannot request code: WebSocket not connected");
        }
    };

    const requestExplanation = () => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            console.log("🎓 Requesting educational explanation");
            socketRef.current.send(JSON.stringify({ type: "EXPLAIN" }));
        } else {
            console.error("❌ Cannot request explanation: WebSocket not connected");
        }
    };

    const submitDecision = (approved: boolean) => {
        setProposal(null); // Clear UI immediately
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            console.log(`📤 Submitting decision: ${approved ? "APPROVED" : "REJECTED"}`);
            socketRef.current.send(JSON.stringify({ type: "DECISION", approved }));
        } else {
            console.error("❌ Cannot submit decision: WebSocket not connected");
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

    return {
        messages,
        statuses,
        health,
        isHit,
        mitigationScore,
        defenseDesc,
        proposal,
        codeData,
        educationalContent,
        isConnected,
        connectionError,
        startGame,
        requestSummary,
        requestCode,
        requestExplanation,
        resetState,
        submitDecision,
        setCodeData,
        setEducationalContent
    };
};
