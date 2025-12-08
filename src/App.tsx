import { useState } from "react";
import { Hat } from "./components/Hat";
import { SpeechBubble } from "./components/SpeechBubble";
import { Announcer } from "./components/Announcer";
import { ServerTower } from "./components/ServerTower";
import { MITMAnimation } from "./components/MITMAnimation";
import HatTrickHomepage from "./components/HatTrickHomepage"; // New Homepage
import { useGameSocket } from "./hooks/useGameSocket";

const attackTeam = [
  { id: "RED_COMMANDER", name: "GPT-4", color: "#EF4444" }, // Red
  { id: "RED_WEAPONIZER", name: "Grok", color: "#EF4444" }, // Red
  { id: "RED_SCANNER", name: "Gemini", color: "#EF4444" }, // Red
  { id: "RED_INF", name: "Llama-3 (70B)", color: "#EF4444" }, // Red
  { id: "RED_DATA", name: "Mistral Large", color: "#EF4444" }, // Red
];

const defenseTeam = [
  { id: "BLUE_COMMANDER", name: "Claude-3", color: "#F8FAFC" }, // White
  { id: "BLUE_WEAPONIZER", name: "Llama-3 (8B)", color: "#F8FAFC" }, // White
  { id: "BLUE_SCANNER", name: "Phi-3", color: "#F8FAFC" }, // White
  { id: "BLUE_INF", name: "Gemma", color: "#F8FAFC" }, // White
  { id: "BLUE_DATA", name: "Command R+", color: "#F8FAFC" }, // White
];

function App() {
  const { messages, statuses, health, isHit, mitigationScore, startGame } = useGameSocket();
  const [roundState, setRoundState] = useState<"MENU" | "INTRO" | "FIGHT">("MENU"); // Changed initial state to MENU
  const [mission, setMission] = useState<string | null>(null);

  const startMission = (missionId: string) => {
    setMission(missionId);
    setRoundState("INTRO");
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

      {/* 3D Mission Homepage */}
      {roundState === "MENU" && (
        <div className="absolute inset-0 z-50">
          <HatTrickHomepage onSelect={startMission} />
        </div>
      )}

      {/* Intro Announcer */}
      {roundState === "INTRO" && (
        <Announcer
          round={1}
          layerName={mission || "INFRASTRUCTURE LAYER"}
          onComplete={() => {
            setRoundState("FIGHT");
            startGame(); // Triggers the websocket start
          }}
        />
      )}

      {/* Arena Title */}
      <h1 className="z-10 text-4xl font-bold text-white mb-2 tracking-widest uppercase opacity-80">
        Cyber Arena {mission ? `// ${mission}` : ""}
      </h1>

      {roundState === "FIGHT" && (
        <button
          onClick={startGame}
          className="z-20 mb-10 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold text-white transition-colors"
        >
          Restart Round
        </button>
      )}

      <div className="z-10 flex w-full max-w-6xl justify-between px-12 gap-12 items-end">
        {/* Attack Team (Left) */}
        <div className="flex-1 flex flex-col items-center gap-8 p-8 bg-red-900/10 backdrop-blur-sm rounded-2xl border border-red-500/20">
          <h2 className="text-2xl font-bold text-red-500 uppercase tracking-wider">Attack Team</h2>
          <div className="grid grid-cols-2 gap-x-12 gap-y-12">
            {attackTeam.map((agent) => RenderAgent(agent))}
          </div>
        </div>

        {/* Center Stage: Tower OR MITM */}
        <div className="pb-8 flex flex-col items-center gap-4">
          {/* If not MITM, show Tower. If MITM but fight started, show Animation? */}
          {/* Logic: Show Tower by default. If MITM selected, show MITM animation BELOW or INSTEAD. User asked for "additional step". */}
          {/* Let's show Tower always for health, and MITM animation if active */}

          <ServerTower health={health} isHit={isHit} />

          {mission === "MITM_ATTACK" && roundState === "FIGHT" && (
            <div className="absolute top-20 z-50 animate-in fade-in slide-in-from-top-10 duration-1000">
              <MITMAnimation mitigationScore={mitigationScore} />
            </div>
          )}
        </div>

        {/* Defense Team (Right) */}
        <div className="flex-1 flex flex-col items-center gap-8 p-8 bg-blue-900/10 backdrop-blur-sm rounded-2xl border border-blue-500/20">
          <h2 className="text-2xl font-bold text-blue-300 uppercase tracking-wider">Defense Team</h2>
          <div className="grid grid-cols-2 gap-x-12 gap-y-12">
            {defenseTeam.map((agent) => RenderAgent(agent))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
