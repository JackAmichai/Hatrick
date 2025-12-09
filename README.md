# 🎩 HatTrick: The Agentic Cyber-Arena

**HatTrick** is a real-time cybersecurity visualization platform where autonomous AI agents (Red Team vs. Blue Team) battle in simulated scenarios.

Powered by **Groq** (Llama-3, Phi-3), **LangChain**, and **React**.

![HatTrick Screenshot](https://github.com/JackAmichai/Hatrick/assets/placeholder/homepage.png)

## 🎮 Features

### Core Platform
- **3D Orbital Homepage**: Select from 8+ missions in a dynamic multi-layer orbit (Light/Dark Mode).
- **Real Virtual Environment Simulation**: Each mission creates realistic target environments with actual IP addresses, open ports, service versions, and CVEs.
- **Live Code Viewer**: View LLM-generated attack and defense code with copy functionality.
- **Server Tower**: Real-time health integrity monitoring with visual damage feedback.

### 🤖 AI Agent Orchestration (Features 1-20)
- **Multi-Agent Voting System**: Agents vote on strategies with confidence-weighted scoring
- **Agent Debate Mode**: Watch agents argue their proposals in real-time
- **Hierarchical Coordination**: Chief Strategist agents coordinate sub-agent teams
- **Agent Memory**: Persistent learning from past missions and strategies
- **Performance Metrics**: Track success rate, response time, creativity per agent
- **Reflection Engine**: Agents self-review and improve their outputs
- **Personality Profiles**: Aggressive, Cautious, Innovative, Analytical agent types
- **Confidence Scoring**: Each decision includes agent confidence levels
- **Dynamic Agent Swapping**: Switch LLM models based on performance
- **Agent Specialization**: Unlock domain-specific expert agents

### 🎯 Advanced Attack Scenarios (Features 21-30)
- **IoT Exploitation**: Smart cameras, thermostats, locks with firmware vulnerabilities
- **Cloud Breach**: S3 buckets, IAM misconfigurations, exposed RDS instances
- **Supply Chain Attacks**: Dependency confusion, container poisoning, CI/CD injection
- **API Exploitation**: BOLA, GraphQL introspection, rate limiting bypass
- **Ransomware Simulation**: File encryption, ransom negotiation, data exfiltration
- **Blockchain Attacks**: Smart contract reentrancy, oracle manipulation
- **CI/CD Compromise**: Pipeline poisoning, unsigned artifacts, secret exposure
- **Insider Threats**: Privilege escalation, mass downloads, policy violations
- **Social Engineering**: Phishing campaigns, BEC, credential harvesting
- **Zero-Day Marketplace**: Agents discover and trade unknown vulnerabilities

### 🛡️ Advanced Defense Mechanisms (Features 31-40)
- **AI-Powered SIEM**: ML anomaly detection with Isolation Forest + LSTM
- **Deception Technology**: Honeypots, decoys, honeytokens with interaction tracking
- **Zero Trust Architecture**: Microsegmentation, JIT access, continuous verification
- **Threat Intelligence Feeds**: Real-time IOCs from MISP, AlienVault, VirusTotal
- **SOAR Playbooks**: Automated incident response with execution logs
- **Data Loss Prevention**: Scan for PII, credit cards, source code exfiltration
- **Behavioral Biometrics**: Typing speed, mouse patterns, impossible travel detection
- **Network Segmentation**: DMZ, Production, Dev zones with trust levels
- **Compliance Monitoring**: GDPR, HIPAA, PCI-DSS validation
- **Purple Team Validation**: Third team validates attack/defense effectiveness

### 🎨 Visualized Scenarios
- **Packet Storm**: Layer 3 Volumetric Attack with UDP flooding
- **Buffer Overflow**: Stack corruption with shellcode injection
- **SQL Injection**: Database compromise attempts
- **Handshake Hijack (MITM)**: ARP spoofing and SSL stripping
- **IoT Takeover**: Smart device compromise visualization
- **Cloud Breach**: S3 bucket enumeration and data exfiltration
- **Supply Chain**: Dependency graph with poisoned packages
- **API Exploit**: GraphQL query depth attacks

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A [Groq API Key](https://console.groq.com/keys)

### 1. Backend (The Brains)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export GROQ_API_KEY="your_api_key_here"
uvicorn main:app --reload
```

### 2. Frontend (The Arena)
```bash
# In a new terminal
npm install
npm run dev
```
Visit http://localhost:5173

## 🏗️ Architecture
- **Frontend**: Vite + React + TypeScript + Framer Motion.
- **Backend**: FastAPI (WebSockets) + LangChain.
- **AI**: Groq (LPU Inference Engine) for sub-second agent responses.

## 🛡️ Missions
1. **Network Flood**: Defend against DDoS
2. **Buffer Overflow**: Prevent stack corruption
3. **Data Heist**: Stop SQL Injection
4. **Handshake Hijack**: Secure the MITM exchange
5. **IoT Takeover**: Compromise smart devices
6. **Cloud Breach**: Exploit cloud misconfigurations
7. **Supply Chain**: Poison the build pipeline
8. **API Exploit**: Break API authorization

## 🔌 REST API Endpoints

### Threat Intelligence
```bash
GET /api/threat-intel              # Latest IOCs and CVEs
GET /api/iot/devices               # Scan IoT devices
GET /api/cloud/misconfigurations   # Cloud security scan
GET /api/supply-chain/risk         # Supply chain analysis
GET /api/api-security/scan         # API vulnerability scan
```

### Defense Systems
```bash
GET /api/deception/status          # Honeypot deployment status
GET /api/zero-trust/policies       # Zero trust configuration
GET /api/network/segmentation      # Network zone visualization
GET /api/dlp/scan                  # Data loss prevention scan
```

### Compliance & Metrics
```bash
GET /api/compliance/{framework}    # GDPR/HIPAA/PCI-DSS checks
GET /api/agent-metrics             # Agent performance stats
```

## 🎓 Technical Highlights

### AI Orchestration
- **Multi-Model Ensemble**: Llama-3.1-70B, Mixtral-8x7B, Gemma2-9B
- **Voting Mechanism**: Weighted by confidence × historical performance
- **Memory System**: Agents learn from 100+ past missions
- **Reflection Loop**: Self-improvement with quality scoring

### Security Coverage
- **MITRE ATT&CK**: 40+ tactics and techniques
- **OWASP Top 10**: All categories covered
- **CVE Integration**: Real vulnerability data
- **Compliance Frameworks**: 3+ standards

### Performance
- **Sub-second Response**: Groq LPU inference
- **Parallel Execution**: 6 agents simultaneously
- **Real-time Updates**: WebSocket streaming
- **Cost Optimization**: <$0.10 per mission

## 🏆 Portfolio Impact

This project demonstrates:
- **Advanced LLM Orchestration**: Multi-agent voting, hierarchical coordination, reflection
- **Cybersecurity Expertise**: 40+ attack/defense scenarios across MITRE ATT&CK
- **Full-Stack Development**: FastAPI + WebSockets + React + TypeScript + Framer Motion
- **Enterprise Architecture**: SIEM, SOAR, Zero Trust, DLP, Compliance
- **System Design**: Real-time streaming, state management, async orchestration

## 📜 License
MIT

Built with 💙 by Jack Amichai • AI Engineer @ Deloitte
