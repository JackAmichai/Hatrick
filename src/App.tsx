import { useState } from "react";
import { Hat } from "./components/Hat";
import { SpeechBubble } from "./components/SpeechBubble";
import { Announcer } from "./components/Announcer";
import { ServerTower } from "./components/ServerTower";
import { MITMAnimation } from "./components/MITMAnimation";
import { MemoryStack } from "./components/MemoryStack"; // New Component
import { ApprovalModal } from "./components/ApprovalModal"; // New Import
import HatTrickHomepage from "./components/HatTrickHomepage"; // New Homepage
import { useGameSocket } from "./hooks/useGameSocket";

const attackTeam = [
  { id: "RED_COMMANDER", name: "GPT-4 Turbo", color: "#EF4444" }, // OpenAI
  { id: "RED_WEAPONIZER", name: "Mistral 7B", color: "#D946EF" }, // Hugging Face
  { id: "RED_SCANNER", name: "Gemma 7B", color: "#F97316" }, // Hugging Face (Google)
  { id: "RED_INF", name: "Llama-3 (70B)", color: "#EF4444" }, // Groq
  { id: "RED_DATA", name: "Qwen 1.5", color: "#EF4444" }, // Placeholder
];

const defenseTeam = [
  { id: "BLUE_COMMANDER", name: "Phi-3 Mini", color: "#3B82F6" }, // Hugging Face (Microsoft)
  { id: "BLUE_WEAPONIZER", name: "Zephyr 7B", color: "#14B8A6" }, // Hugging Face
  { id: "BLUE_SCANNER", name: "Llama-3 (8B)", color: "#22C55E" }, // Groq (Fast)
  { id: "BLUE_INF", name: "Falcon 7B", color: "#F8FAFC" }, // Placeholder
  { id: "BLUE_DATA", name: "Command R+", color: "#F8FAFC" }, // Placeholder
];

function App() {
  const { messages, statuses, health, isHit, mitigationScore, defenseDesc, proposal, startGame, requestSummary, resetState, submitDecision } = useGameSocket();
  const [roundState, setRoundState] = useState<"MENU" | "INTRO" | "FIGHT">("MENU"); // Changed initial state to MENU
  const [mission, setMission] = useState<string | null>(null);

  // Logical Progression: Network (L3) -> MITM (L5) -> Stack (L7) -> Data (L7)
  const MISSION_ORDER = ["NETWORK_FLOOD", "HANDSHAKE_HIJACK", "MITM_ATTACK", "BUFFER_OVERFLOW", "DATA_HEIST"];

  const startMission = (missionId: string) => {
    setMission(missionId);
    setRoundState("INTRO");
  };

  const handleStartGame = () => {
    if (mission) startGame(mission);
  };

  const handleReturnToMenu = () => {
    resetState();
    setRoundState("MENU");
    setMission(null);
  };

  const handleNextLevel = () => {
    resetState();
    const currentIndex = MISSION_ORDER.indexOf(mission || "");
    const nextIndex = (currentIndex + 1) % MISSION_ORDER.length; // Loop back or stop
    const nextMission = MISSION_ORDER[nextIndex];
    startMission(nextMission);
  };

  // Helper to render a Hat with its Bubble
  const RenderAgent = (agent: { id: string; name: string; color: string }) => (
    <div key={agent.id} className="relative group">
      <SpeechBubble text={messages[agent.id]} />
      <Hat
        role={agent.name}
        color={agent.color}
        status={statuses[agent.id] || "IDLE"}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/20 via-neutral-950 to-neutral-950 pointer-events-none" />

      {/* APPROVAL MODAL */}
      <ApprovalModal
        isOpen={!!proposal}
        team={proposal?.team || "RED"}
        actionName={proposal?.action || "Unknown Action"}
        description={proposal?.description || "Awaiting description..."}
        onApprove={() => submitDecision(true)}
        onReject={() => submitDecision(false)}
      />

      {/* 3D Mission Homepage */}
      {roundState === "MENU" && (
        <div className="absolute inset-0 z-50">
          <HatTrickHomepage onSelect={startMission} />
        </div>
      )}

      {/* Intro Announcer */}
      {roundState === "INTRO" && (
        <Announcer
          round={mission ? MISSION_ORDER.indexOf(mission) + 1 : 1}
          layerName={mission || "INFRASTRUCTURE LAYER"}
          onComplete={() => {
            setRoundState("FIGHT");
            handleStartGame(); // Start with specific mission
          }}
        />
      )}

      {/* Return Button */}
      {roundState === "FIGHT" && (
        <button
          onClick={handleReturnToMenu}
          className="absolute top-4 left-4 z-50 px-4 py-2 bg-gray-800/50 hover:bg-gray-700 text-white text-xs font-mono border border-gray-600 rounded pt-2 transition-all"
        >
          ← RETURN TO MENU
        </button>
      )}

      {/* Arena Title */}
      <h1 className="z-10 text-4xl font-bold text-white mb-2 tracking-widest uppercase opacity-80">
        Cyber Arena {mission ? `// ${mission}` : ""}
      </h1>

      {roundState === "FIGHT" && (
        <button
          onClick={handleStartGame}
          className="z-20 mb-10 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold text-white transition-colors"
        >
          Restart Round
        </button>
      )}

      <div className="z-10 flex w-full max-w-6xl justify-between px-12 gap-12 items-end">
        {/* Attack Team (Left) */}
        <div className="flex-1 flex flex-col items-center gap-8 p-8 bg-red-900/10 backdrop-blur-sm rounded-2xl border border-red-500/20 relative">

          {/* Summary Button Red */}
          {roundState === "FIGHT" && (
            <button
              onClick={() => requestSummary("RED")}
              className="absolute -top-4 w-12 h-12 bg-red-600 hover:bg-red-500 rounded flex items-center justify-center border-2 border-red-400 shadow-lg text-white font-bold text-xs z-30 transition-transform hover:scale-110"
              title="Commander Summary"
            >
              📜
            </button>
          )}

          <h2 className="text-2xl font-bold text-red-500 uppercase tracking-wider">Attack Team</h2>
          <div className="grid grid-cols-2 gap-x-12 gap-y-12">
            {attackTeam.map((agent) => RenderAgent(agent))}
          </div>
        </div>

        {/* Center Stage: Tower OR MITM OR Stack */}
        <div className="pb-8 flex flex-col items-center gap-4">

          {/* Logic:
                - BUFFER_OVERFLOW -> MemoryStack
                - MITM_ATTACK -> ServerTower + Animation
                - DEFAULT -> ServerTower
            */}

          {mission === "BUFFER_OVERFLOW" ? (
            <MemoryStack
              fillLevel={Math.max(0, (100 - health) * 2)}
              hasCanary={defenseDesc.toLowerCase().includes("canary")}
            />
          ) : (
            <ServerTower health={health} isHit={isHit} />
          )}

          {mission === "MITM_ATTACK" && roundState === "FIGHT" && (
            <div className="absolute top-20 z-50 animate-in fade-in slide-in-from-top-10 duration-1000">
              <MITMAnimation mitigationScore={mitigationScore} />
            </div>
          )}
        </div>

        {/* Defense Team (Right) */}
        <div className="flex-1 flex flex-col items-center gap-8 p-8 bg-blue-900/10 backdrop-blur-sm rounded-2xl border border-blue-500/20 relative">

          {/* Summary Button Blue */}
          {roundState === "FIGHT" && (
            <button
              onClick={() => requestSummary("BLUE")}
              className="absolute -top-4 w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center border-2 border-blue-400 shadow-lg text-white font-bold text-xs z-30 transition-transform hover:scale-110"
              title="Commander Summary"
            >
              📜
            </button>
          )}

          <h2 className="text-2xl font-bold text-blue-300 uppercase tracking-wider">Defense Team</h2>
          <div className="grid grid-cols-2 gap-x-12 gap-y-12">
            {defenseTeam.map((agent) => RenderAgent(agent))}
          </div>
        </div>
      </div>

      {/* NEXT LAYER BUTTON (Bottom Right) */}
      {roundState === "FIGHT" && (
        <button
          onClick={handleNextLevel}
          className="absolute bottom-4 right-4 z-50 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold border border-indigo-400 rounded-lg shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
        >
          NEXT LAYER ➡️
        </button>
      )}
    </div>
  );
}

export default App;
