import { Hat } from "./components/Hat";

const hats = [
  { role: "CPO", color: "#3B82F6" }, // Blue
  { role: "CTO", color: "#10B981" }, // Green
  { role: "Architect", color: "#8B5CF6" }, // Purple
  { role: "UI/UX", color: "#EC4899" }, // Pink
  { role: "QA", color: "#F59E0B" }, // Amber
  { role: "DevOps", color: "#EF4444" }, // Red
];

function App() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/20 via-neutral-950 to-neutral-950 pointer-events-none" />

      <div className="z-10 grid grid-cols-3 gap-12 p-12 bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-white/5 shadow-2xl">
        {hats.map((hat) => (
          <Hat
            key={hat.role}
            role={hat.role}
            color={hat.color}
            status="IDLE"
          />
        ))}
      </div>
    </div>
  );
}

export default App;
