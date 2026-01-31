# ⚡ Quick Start Guide

Get HatTrick running locally in 5 minutes!

---

## 🎯 Prerequisites

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Groq API Key** ([Get free key](https://console.groq.com/keys))

---

## 🚀 Setup (5 Steps)

### 1️⃣ Clone Repository
```bash
git clone https://github.com/yourusername/hatrick.git
cd hatrick
```

### 2️⃣ Backend Setup (2 minutes)
```bash
# Navigate to backend
cd backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Or on Linux/Mac
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set API key (Windows)
set GROQ_API_KEY=your_api_key_here

# Or on Linux/Mac
export GROQ_API_KEY=your_api_key_here

# Start backend server
uvicorn main:app --reload
```

**Backend running on**: http://localhost:8000

### 3️⃣ Frontend Setup (2 minutes)
```bash
# Open NEW terminal
cd hatrick

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Frontend running on**: http://localhost:5173

### 4️⃣ Verify Installation
- Open http://localhost:5173 in browser
- You should see the HatTrick homepage
- Click "Enterprise Portfolio" to see all visualizations

### 5️⃣ Test API (Optional)
```bash
# In new terminal
curl http://localhost:8000/
# Expected: {"status":"ok","service":"Hatrick Backend"}

curl http://localhost:8000/api/apt-profiles
# Expected: List of 4 APT profiles
```

---

## 🎮 Using the Application

### Main Homepage
1. Select mission from orbital rings (Network Flood, SQL Injection, etc.)
2. Watch AI agents battle in real-time
3. View generated attack/defense code
4. Monitor server health

### Enterprise Portfolio
1. Click "🎯 Enterprise Portfolio" button
2. Explore tabs:
   - **3D Network Topology**: Interactive graph with attack paths
   - **Heat Map Scanner**: Vulnerability heat map (auto-scans every 30 seconds)
   - **Packet Animation**: Real-time network traffic visualization
   - **Impact Predictor**: AI-powered damage forecasting
   - **Cost Dashboard**: LLM API cost tracking
   - **Code Diff Viewer**: Security patches comparison

### APT Profiles
1. Click "🎭 APT Profiles" button in Enterprise Portfolio
2. Load scenarios for APT29, APT28, Lazarus Group, or APT38
3. Watch agents emulate real-world threat actors

### Report Generation
1. Click "📄 Generate Report" button
2. Downloads professional OWASP-format pen test report as JSON
3. Includes executive summary, technical findings, MITRE mapping, remediation roadmap

---

## 🧪 Testing API Endpoints

### List APT Profiles
```bash
curl http://localhost:8000/api/apt-profiles
```

### Generate APT29 Scenario
```bash
curl -X POST http://localhost:8000/api/apt-profiles/apt29/scenario
```

### Generate Pen Test Report
```bash
curl -X POST http://localhost:8000/api/reports/pentest \
  -H "Content-Type: application/json" \
  -d "{\"client_name\":\"Demo\",\"engagement_type\":\"Black Box\",\"test_dates\":\"2025-01-01\",\"mission_results\":[]}"
```

---

## 📁 Project Structure

```
hatrick/
├── src/
│   └── components/           # React components
│       ├── NetworkTopology3D.tsx
│       ├── HeatMapScanner.tsx
│       ├── PacketAnimation.tsx
│       ├── AttackImpactPredictor.tsx
│       ├── AgentThoughtBubbles.tsx
│       ├── CodeDiffViewer.tsx
│       ├── CostOptimizationDashboard.tsx
│       └── EnterprisePortfolio.tsx
│
├── backend/
│   ├── main.py              # FastAPI server + API endpoints
│   ├── agents.py            # LLM agent chains
│   ├── agent_orchestration.py  # Multi-agent coordination
│   ├── advanced_attacks.py  # IoT, Cloud, Supply Chain attacks
│   ├── advanced_defenses.py # SIEM, Zero Trust, SOAR
│   ├── apt_profiles.py      # APT29, APT28, Lazarus, APT38
│   ├── report_generator.py  # Pen test reports + white papers
│   └── venv_simulator.py    # Virtual environment simulation
│
├── README.md                # Project overview
├── INTEGRATION_GUIDE.md     # Integration instructions
├── FEATURE_SHOWCASE.md      # Feature documentation
├── API_TESTING.md           # API reference
├── DEPLOYMENT_CHECKLIST.md  # Deployment guide
└── package.json             # Node dependencies
```

---

## 🎯 Feature Highlights

### 60+ Implemented Features

**AI Orchestration (1-20)**:
- Multi-agent voting and debate
- Hierarchical Chief Strategists
- Agent memory and learning
- Performance metrics tracking

**Attack Scenarios (21-30)**:
- IoT exploitation, Cloud breach, Supply chain
- API exploitation, Ransomware, Blockchain
- CI/CD compromise, Insider threat, Social engineering

**Defense Mechanisms (31-40)**:
- AI-powered SIEM, Deception tech, Zero Trust
- SOAR playbooks, DLP, Behavioral biometrics
- Compliance monitoring (GDPR, HIPAA, PCI-DSS)

**Visualizations (41-50)**:
- 3D network topology, Heat map scanner
- Real-time packet animation, Impact predictor
- Agent thought bubbles, Code diff viewer
- Cost optimization dashboard

**APT Profiles (51-54)**:
- APT29 (Cozy Bear) - SolarWinds SUNBURST
- APT28 (Fancy Bear) - DNC hack
- Lazarus Group - WannaCry
- APT38 - Bangladesh Bank heist

**Enterprise Reporting (55-60)**:
- Automated pen test reports (OWASP format)
- Technical white papers
- Compliance mapping (PCI-DSS, GDPR, HIPAA, SOC 2)

---

## 🐛 Troubleshooting

### Backend Issues

**"ModuleNotFoundError: No module named 'fastapi'"**
```bash
pip install -r requirements.txt
```

**"GROQ_API_KEY not set"**
```bash
# Windows
set GROQ_API_KEY=your_key_here

# Linux/Mac
export GROQ_API_KEY=your_key_here
```

**"Port 8000 already in use"**
```bash
uvicorn main:app --reload --port 8001
# Update frontend API_BASE_URL to http://localhost:8001
```

### Frontend Issues

**"Module not found: 'framer-motion'"**
```bash
npm install
```

**"Cannot connect to backend"**
- Verify backend is running on http://localhost:8000
- Check browser console for CORS errors
- Ensure GROQ_API_KEY is set in backend

**Canvas not rendering**
- Clear browser cache
- Try different browser (Chrome recommended)
- Check browser console for errors

---

## 🚀 Next Steps

After getting it running:

1. **Explore visualizations**: Click through all tabs in Enterprise Portfolio
2. **Test APT scenarios**: Load APT29, APT28, Lazarus, APT38 scenarios
3. **Generate reports**: Download pen test report and white paper
4. **Read documentation**: Check INTEGRATION_GUIDE.md for advanced usage
5. **Deploy**: Follow DEPLOYMENT_CHECKLIST.md for production deployment

---

## 📊 Performance Expectations

- **Backend startup**: < 5 seconds
- **Frontend build**: 10-20 seconds
- **Agent response time**: < 2 seconds (with Groq)
- **Visualization rendering**: 60fps
- **Report generation**: 3-5 seconds

---

## 🔧 Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- **Frontend**: Changes auto-refresh in browser
- **Backend**: `--reload` flag enables auto-restart

### Debug Mode
```bash
# Backend with debug logging
uvicorn main:app --reload --log-level debug

# Frontend with source maps (enabled by default)
npm run dev
```

### Code Formatting
```bash
# Frontend (ESLint)
npm run lint

# Backend (Black)
pip install black
black backend/*.py
```

---

## 📚 Additional Resources

- **README.md**: Full feature list and architecture
- **FEATURE_SHOWCASE.md**: Detailed feature documentation
- **INTEGRATION_GUIDE.md**: Step-by-step integration
- **API_TESTING.md**: API endpoint reference
- **DEPLOYMENT_CHECKLIST.md**: Production deployment guide

---

## 🎉 You're Ready!

HatTrick is now running locally. Explore the features, test the API endpoints, and enjoy the AI-powered cybersecurity platform!

**Questions?**
- Check documentation files in project root
- Open GitHub issue
- Review code comments in components

---

## ⏱️ Time to Value

- **Setup time**: 5 minutes
- **First mission**: 2 minutes
- **Full exploration**: 30 minutes
- **Master all features**: 2 hours

**Total time from clone to deployed**: ~1 hour

Happy hacking! 🎩🔴🔵
