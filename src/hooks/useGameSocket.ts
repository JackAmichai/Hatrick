import { useState, useEffect, useRef } from 'react';

// Define the shape of our updates
type AgentStatus = "IDLE" | "THINKING" | "ACTING";


interface GameEvent {
    type: "STATE_UPDATE" | "NEW_MESSAGE" | "IMPACT";
    agent: string; // e.g., "RED_SCANNER"
    status?: AgentStatus;
    text?: string;
    damage_taken?: number;
    mitigation_score?: number; // Added for MITM logic
    defense_desc?: string; // Added for Stack logic
}

export const useGameSocket = () => {
    const [messages, setMessages] = useState<Record<string, string>>({});
    const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
    const [health, setHealth] = useState(100);
    const [isHit, setIsHit] = useState(false);
    const [mitigationScore, setMitigationScore] = useState(0); // Added state
    const [defenseDesc, setDefenseDesc] = useState(""); // Added state
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Connect to Backend
        const ws = new WebSocket("ws://localhost:8000/ws/game");
        socketRef.current = ws;

        ws.onmessage = (event) => {
            const data: GameEvent = JSON.parse(event.data);

            if (data.type === "STATE_UPDATE") {
                setStatuses(prev => ({ ...prev, [data.agent]: data.status! }));
            }

            if (data.type === "NEW_MESSAGE") {
                setMessages(prev => ({ ...prev, [data.agent]: data.text! }));
            }

            if (data.type === "IMPACT") {
                const damage = data.damage_taken!;
                setHealth(prev => Math.max(0, prev - damage));
                if (data.mitigation_score !== undefined) {
                    setMitigationScore(data.mitigation_score);
                }
                if (data.defense_desc) {
                    setDefenseDesc(data.defense_desc);
                }
                if (damage > 0) {
                    setIsHit(true);
                    setTimeout(() => setIsHit(false), 500);
                }
            }
        };

        return () => ws.close();
    }, []);

    const startGame = (missionId: string) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "START", mission: missionId }));
        } else {
            console.error("Socket not ready");
        }
    };

    return { messages, statuses, health, isHit, mitigationScore, defenseDesc, startGame };
};
