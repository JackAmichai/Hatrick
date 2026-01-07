import { useState } from "react";
import { Hat } from "./components/Hat";
import { SpeechBubble } from "./components/SpeechBubble";
import { Announcer } from "./components/Announcer";
import { ServerTower } from "./components/ServerTower";
import { MITMAnimation } from "./components/MITMAnimation";
import { MemoryStack } from "./components/MemoryStack"; // New Component
import { ApprovalModal } from "./components/ApprovalModal"; // New Import
import { CodeViewer } from "./components/CodeViewer"; // Code Viewer
import { EducationalModal } from "./components/EducationalModal"; // New Import
import HatTrickHomepage from "./components/HatTrickHomepage"; // New Homepage
import { useGameSocket } from "./hooks/useGameSocket";

// RED TEAM - OpenRouter FREE LLM Models (Attack-oriented)
const attackTeam = [
  { id: "RED_COMMANDER", name: "Gemma 2 9B", color: "#EF4444" },         // Decision maker
  { id: "RED_WEAPONIZER", name: "Mistral 7B", color: "#D946EF" },        // Exploit dev
  { id: "RED_SCANNER", name: "Llama 3.2 3B", color: "#F97316" },         // Fast scanning
  { id: "RED_INF", name: "Qwen 2.5 7B", color: "#FB923C" },              // Infrastructure
  { id: "RED_DATA", name: "Llama 3.1 8B", color: "#FBBF24" },            // Data analysis
];

// BLUE TEAM - OpenRouter FREE LLM Models (Defense-oriented)
const defenseTeam = [
  { id: "BLUE_COMMANDER", name: "Llama 3.1 8B", color: "#3B82F6" },      // Fast decisions
  { id: "BLUE_WEAPONIZER", name: "Mistral 7B", color: "#14B8A6" },       // Defense engineering
  { id: "BLUE_SCANNER", name: "Phi-3 Mini", color: "#22C55E" },          // Threat detection
  { id: "BLUE_INF", name: "Qwen 2.5 7B", color: "#06B6D4" },             // Infrastructure
  { id: "BLUE_DATA", name: "Llama 3.2 3B", color: "#8B5CF6" },           // Data protection
];

function App() {
  const { messages, statuses, health, isHit, mitigationScore, defenseDesc, proposal, codeData, educationalContent, startGame, requestSummary, requestCode, requestExplanation, resetState, submitDecision, setCodeData, setEducationalContent } = useGameSocket();
  const [roundState, setRoundState] = useState<"MENU" | "INTRO" | "FIGHT">("MENU"); // Changed initial state to MENU
  const [mission, setMission] = useState<string | null>(null);

  // Logical Progression: Network (L3) -> MITM (L5) -> Stack (L7) -> Data (L7) -> Advanced
  const MISSION_ORDER = ["NETWORK_FLOOD", "BUFFER_OVERFLOW", "SQL_INJECTION", "MITM_ATTACK", "IOT_ATTACK", "CLOUD_BREACH", "SUPPLY_CHAIN", "API_EXPLOIT", "INSIDER_THREAT", "SOCIAL_ENGINEERING"];
  
  // Mission to Round mapping with vulnerability context
  const MISSION_ROUND_MAP: Record<string, { round: number; vulnerability: string; layer: string }> = {
    "NETWORK_FLOOD": { round: 1, vulnerability: "DDoS Susceptibility - No rate limiting", layer: "Layer 3 - Network" },
    "BUFFER_OVERFLOW": { round: 2, vulnerability: "Memory Corruption - Unchecked buffer in HTTP parsing", layer: "Layer 7 - Application" },
    "SQL_INJECTION": { round: 3, vulnerability: "SQL Injection - Unvalidated input in login form", layer: "Layer 7 - Database" },
    "MITM_ATTACK": { round: 4, vulnerability: "Weak TLS - Vulnerable OpenSSL allows Heartbleed", layer: "Layer 5 - Session" },
    "IOT_ATTACK": { round: 5, vulnerability: "IoT Default Credentials - admin:admin access", layer: "Layer 6 - IoT" },
    "CLOUD_BREACH": { round: 6, vulnerability: "S3 Misconfiguration - Public read access", layer: "Layer 8 - Cloud" },
    "SUPPLY_CHAIN": { round: 7, vulnerability: "Dependency Confusion - Package name collision", layer: "Layer 9 - Supply Chain" },
    "API_EXPLOIT": { round: 8, vulnerability: "BOLA - Broken Object Level Authorization", layer: "Layer 7 - API" },
    "INSIDER_THREAT": { round: 9, vulnerability: "Privilege Escalation - Malicious Insider detected", layer: "Layer 8 - Human/Insider" },
    "SOCIAL_ENGINEERING": { round: 10, vulnerability: "Phishing Susceptibility - Employee credentials compromised", layer: "Layer 8 - Human" }
  };

  const getCurrentRound = () => mission ? MISSION_ROUND_MAP[mission]?.round || 1 : 1;
  const getCurrentVulnerability = () => mission ? MISSION_ROUND_MAP[mission]?.vulnerability || "Unknown" : "Unknown";
  const getCurrentLayer = () => mission ? MISSION_ROUND_MAP[mission]?.layer || "Unknown" : "Unknown";

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

  const formatMissionName = (name: string) => name.replace(/_/g, " ");

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

      {/* CODE VIEWER MODAL */}
      <CodeViewer
        isOpen={!!codeData}
        onClose={() => setCodeData(null)}
        team={codeData?.team || "RED"}
        code={codeData?.code || ""}
        title={codeData?.title || ""}
        description={codeData?.description || ""}
      />

      {/* EDUCATIONAL MODAL */}
      <EducationalModal
        isOpen={!!educationalContent}
        content={educationalContent || ""}
        onClose={() => setEducationalContent(null)}
        isLoading={educationalContent === "LOADING"}
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
          round={getCurrentRound()}
          layerName={getCurrentLayer()}
          vulnerability={getCurrentVulnerability()}
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
          type="button"
          aria-label="Return to mission selection menu"
          className="absolute top-4 left-4 z-50 px-4 py-2 bg-gray-800/50 hover:bg-gray-700 text-white text-xs font-mono border border-gray-600 rounded pt-2 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-neutral-950 min-h-[44px]"
        >
          ← RETURN TO MENU
        </button>
      )}

      {/* Round & Vulnerability Info Banner */}
      {roundState === "FIGHT" && mission && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center">
          <div className="px-4 py-1 bg-gradient-to-r from-red-900/50 via-gray-900/80 to-blue-900/50 border border-gray-600 rounded-lg backdrop-blur-sm">
            <span className="text-white font-bold text-sm">ROUND {getCurrentRound()}</span>
            <span className="text-gray-400 mx-2">|</span>
            <span className="text-gray-300 text-sm">{getCurrentLayer()}</span>
          </div>
          <div className="mt-1 px-3 py-1 bg-red-900/30 border border-red-500/30 rounded text-xs text-red-300 font-mono">
            ⚠️ {getCurrentVulnerability()}
          </div>
          <button
              onClick={() => {
                setEducationalContent("LOADING");
                requestExplanation();
              }}
              className="mt-2 px-4 py-1 bg-indigo-600/50 hover:bg-indigo-500/50 text-indigo-200 text-xs font-mono border border-indigo-500/30 rounded transition-colors flex items-center gap-1"
          >
              <span>🎓</span> LEARN MORE
          </button>
        </div>
      )}

      {/* Arena Title */}
      <h1 className="z-10 text-4xl font-bold text-white mb-2 tracking-widest uppercase opacity-80">
        Cyber Arena {mission ? `// ${formatMissionName(mission)}` : ""}
      </h1>

      {roundState === "FIGHT" && (
        <button
          onClick={handleStartGame}
          type="button"
          aria-label="Restart current round"
          className="z-20 mb-10 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-950 min-h-[44px]"
        >
          Restart Round
        </button>
      )}

      <div className="z-10 flex w-full max-w-6xl justify-between px-12 gap-12 items-end">
        {/* Attack Team (Left) */}
        <div className="flex-1 flex flex-col items-center gap-8 p-8 bg-red-900/10 backdrop-blur-sm rounded-2xl border border-red-500/20 relative">

          {/* Action Buttons Red */}
          {roundState === "FIGHT" && (
            <div className="absolute -top-4 flex gap-2 z-30" role="group" aria-label="Red team actions">
              <button
                onClick={() => requestSummary("RED")}
                type="button"
                aria-label="Get Red Team commander summary"
                className="w-12 h-12 bg-red-600 hover:bg-red-500 rounded flex items-center justify-center border-2 border-red-400 shadow-lg text-white font-bold text-xs transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
              >
                📜
              </button>
              <button
                onClick={() => requestCode("RED")}
                type="button"
                aria-label="View Red Team attack code"
                className="w-12 h-12 bg-red-700 hover:bg-red-600 rounded flex items-center justify-center border-2 border-red-400 shadow-lg text-white font-bold text-xs transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
              >
                &lt;/&gt;
              </button>
            </div>
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

          {/* Action Buttons Blue */}
          {roundState === "FIGHT" && (
            <div className="absolute -top-4 flex gap-2 z-30" role="group" aria-label="Blue team actions">
              <button
                onClick={() => requestSummary("BLUE")}
                type="button"
                aria-label="Get Blue Team commander summary"
                className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center border-2 border-blue-400 shadow-lg text-white font-bold text-xs transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
              >
                📜
              </button>
              <button
                onClick={() => requestCode("BLUE")}
                type="button"
                aria-label="View Blue Team defense code"
                className="w-12 h-12 bg-blue-700 hover:bg-blue-600 rounded flex items-center justify-center border-2 border-blue-400 shadow-lg text-white font-bold text-xs transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
              >
                &lt;/&gt;
              </button>
            </div>
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
          type="button"
          aria-label="Proceed to next layer mission"
          className="absolute bottom-4 right-4 z-50 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold border border-indigo-400 rounded-lg shadow-lg transition-transform hover:scale-105 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-neutral-950 min-h-[44px]"
        >
          NEXT LAYER ➡️
        </button>
      )}
    </div>
  );
}

export default App;
