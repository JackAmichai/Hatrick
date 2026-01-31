# 🎯 Enterprise Features Integration Guide

## Overview
This guide explains how to integrate the new visualization and enterprise features into your HatTrick application.

## ✅ Completed Components

### Frontend Visualizations (src/components/)
1. **NetworkTopology3D.tsx** - Interactive 3D network graph
2. **HeatMapScanner.tsx** - Vulnerability heat map with auto-scanning
3. **PacketAnimation.tsx** - Real-time network traffic visualization
4. **AttackImpactPredictor.tsx** - AI-powered damage forecasting
5. **AgentThoughtBubbles.tsx** - Real-time agent reasoning streams
6. **CodeDiffViewer.tsx** - Security patch comparison (split/unified views)
7. **CostOptimizationDashboard.tsx** - LLM API cost tracking
8. **EnterprisePortfolio.tsx** - Unified dashboard with tabbed interface

### Backend Modules (backend/)
1. **apt_profiles.py** - APT threat actor profiles (APT29, APT28, Lazarus, APT38)
2. **report_generator.py** - Professional pen test report generation
3. **main.py** - Updated with 8 new API endpoints

## 🔧 Integration Steps

### Step 1: Import Components into Main App

Update your main `App.tsx` to include the Enterprise Portfolio:

```typescript
import EnterprisePortfolio from './components/EnterprisePortfolio';
import { useState } from 'react';

function App() {
  const [showEnterpriseView, setShowEnterpriseView] = useState(false);
  const [missionCount, setMissionCount] = useState(0);
  const [currentMission, setCurrentMission] = useState('NETWORK_FLOOD');
  const [attackInProgress, setAttackInProgress] = useState(false);

  if (showEnterpriseView) {
    return (
      <EnterprisePortfolio
        missionCount={missionCount}
        currentMission={currentMission}
        attackInProgress={attackInProgress}
      />
    );
  }

  // ... rest of your existing app
}
```

### Step 2: Add Toggle Button

Add a button to switch to Enterprise view:

```typescript
<button
  onClick={() => setShowEnterpriseView(true)}
  className="fixed top-4 right-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:scale-105 transition-transform z-50"
>
  🎯 Enterprise Portfolio
</button>
```

### Step 3: Wire Up Agent Thought Bubbles

Wrap each Hat component with `AgentThoughtBubbles`:

```typescript
import AgentThoughtBubbles from './components/AgentThoughtBubbles';

// For Red Scanner
<AgentThoughtBubbles agentRole="RED_SCANNER">
  <Hat 
    role="RED_SCANNER" 
    status={redScannerStatus}
    // ... other props
  />
</AgentThoughtBubbles>

// For Blue Commander
<AgentThoughtBubbles agentRole="BLUE_COMMANDER">
  <Hat 
    role="BLUE_COMMANDER" 
    status={blueCommanderStatus}
    // ... other props
  />
</AgentThoughtBubbles>
```

### Step 4: Trigger Code Diff Viewer

When a defense completes, show the code diff:

```typescript
import { CodeDiffViewer, SAMPLE_DIFFS } from './components/CodeDiffViewer';

// When defense completes
const handleDefenseComplete = (defenseType: string) => {
  let diffKey: keyof typeof SAMPLE_DIFFS = 'SQL_INJECTION';
  
  if (defenseType.includes('SQL')) diffKey = 'SQL_INJECTION';
  else if (defenseType.includes('Buffer')) diffKey = 'BUFFER_OVERFLOW';
  else if (defenseType.includes('XSS')) diffKey = 'XSS';
  
  setCurrentDiff(SAMPLE_DIFFS[diffKey]);
  setShowDiffViewer(true);
};

// Render diff viewer
{showDiffViewer && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 bg-black/80 z-50 p-8"
  >
    <CodeDiffViewer diff={currentDiff} />
    <button onClick={() => setShowDiffViewer(false)}>Close</button>
  </motion.div>
)}
```

### Step 5: Enable Attack Impact Prediction

Before executing an attack, show the predictor:

```typescript
import AttackImpactPredictor from './components/AttackImpactPredictor';

const handleAttackRequest = async (attackType: string, target: string) => {
  // Show predictor first
  setShowPredictor(true);
  
  // Wait for analysis
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Then execute attack
  executeAttack(attackType, target);
};

// Render predictor
{showPredictor && (
  <AttackImpactPredictor
    attackType={currentMission}
    targetSystem="Production Server"
    onAnalysisComplete={(prediction) => {
      console.log('Predicted impact:', prediction);
      setShowPredictor(false);
    }}
  />
)}
```

## 🌐 Backend API Integration

### Generate APT Scenario

```typescript
// Load APT29 scenario
const loadAPTScenario = async () => {
  const response = await fetch('http://localhost:8000/api/apt-profiles/apt29/scenario', {
    method: 'POST'
  });
  const scenario = await response.json();
  console.log('APT29 scenario:', scenario);
  // Apply scenario to game state
};
```

### Generate Pen Test Report

```typescript
const generateReport = async () => {
  const response = await fetch('http://localhost:8000/api/reports/pentest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_name: 'Demo Corp',
      engagement_type: 'Black Box',
      test_dates: '2025-01-01 to 2025-01-15',
      mission_results: [
        { 
          mission: 'NETWORK_FLOOD', 
          success: true, 
          vulnerabilities_found: 5,
          cvss_scores: [7.5, 6.8, 9.1, 5.3, 8.2]
        }
      ]
    })
  });
  
  const report = await response.json();
  
  // Download as JSON
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pentest-report-${Date.now()}.json`;
  a.click();
};
```

## 🎨 Styling Integration

All components use Tailwind CSS classes. Ensure your `tailwind.config.js` includes:

```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
```

## 📊 State Management

Track these states in your main app:

```typescript
interface AppState {
  missionCount: number;          // Total missions completed
  currentMission: string;         // Current mission ID
  attackInProgress: boolean;      // Is attack executing?
  costAccumulated: number;        // Total LLM API costs
  agentThoughts: Map<string, string[]>;  // Agent reasoning history
  vulnerabilities: Vulnerability[];      // Discovered vulnerabilities
  defensePatches: DefensePatch[];        // Applied security patches
}
```

## 🔒 Security Considerations

1. **API Key Protection**: Never expose Groq API key in frontend
2. **Rate Limiting**: Implement rate limits on APT scenario generation
3. **Report Sanitization**: Sanitize mission data before generating reports
4. **Canvas Security**: Validate all canvas operations to prevent XSS

## 🚀 Performance Optimization

1. **Canvas Rendering**: Use `requestAnimationFrame` for 60fps animations
2. **Lazy Loading**: Load visualizations only when tab is active
3. **Debouncing**: Debounce cost calculations (5-second intervals)
4. **Memoization**: Use `React.memo` for expensive components

## 📈 Analytics Integration

Track key metrics:

```typescript
// Mission completion
analytics.track('mission_completed', {
  mission: currentMission,
  duration: missionDuration,
  success: attackSucceeded,
  cost: apiCostForMission
});

// APT scenario loaded
analytics.track('apt_scenario_loaded', {
  apt_profile: 'apt29',
  ttps_count: 12
});

// Report generated
analytics.track('report_generated', {
  type: 'pentest',
  findings_count: vulnerabilities.length,
  format: 'json'
});
```

## 🧪 Testing Checklist

- [ ] 3D topology renders without errors
- [ ] Heat map auto-scan updates every 30 seconds
- [ ] Packet animation shows 60fps smooth flow
- [ ] Impact predictor completes in 3-5 seconds
- [ ] Thought bubbles display typing animation
- [ ] Code diff viewer switches between split/unified
- [ ] Cost dashboard accumulates realistic costs
- [ ] APT profiles load from backend
- [ ] Reports download as valid JSON
- [ ] All tabs in Enterprise Portfolio functional

## 📞 Support

For issues or questions:
- Check component props and TypeScript errors
- Verify backend is running on `http://localhost:8000`
- Check browser console for fetch errors
- Ensure Groq API key is set in backend environment

## 🎯 Next Steps

1. Integrate `EnterprisePortfolio` into main app
2. Wire up agent thought bubbles to all Hat components
3. Add code diff viewer to defense completion flow
4. Enable impact predictor before attack execution
5. Test all API endpoints with Postman
6. Deploy backend to production
7. Add authentication for report generation
8. Implement WebXR for AR/VR mode (future feature)
