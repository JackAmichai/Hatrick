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

### 🎨 Enterprise Visualization Features (Features 41-50)
- **3D Network Topology**: Interactive graph with attack path visualization
  - Real-time rotation and zoom controls
  - Color-coded nodes by risk level (critical → low)
  - Attack path rendering (active, potential, blocked)
  - Node clustering by type (firewall, server, database, router, IoT, cloud)
  
- **Heat Map Vulnerability Scanner**: Auto-scanning risk matrix
  - 5-level heat map (critical, high, medium, low, minimal)
  - Asset grouping (server, database, network, application, endpoint)
  - Real-time scan progress with 30-second intervals
  - Risk distribution analytics
  
- **Real-Time Packet Animation**: Network traffic visualization
  - Canvas-based packet flow animation
  - Color-coded by threat level (malicious, suspicious, normal)
  - Live throughput metrics (bps/Kbps/Mbps)
  - Attack detection alerts
  
- **Attack Impact Predictor**: AI-powered damage forecasting
  - Pre-execution impact analysis with confidence scoring
  - Timeline predictions (immediate, short-term, long-term)
  - Risk factor breakdown with severity levels
  - Mitigation recommendations with effectiveness ratings
  
- **Agent Thought Bubbles**: Real-time reasoning streams
  - Typing animation effect (30ms character delay)
  - Role-specific thought templates for 6 agent types
  - Thought categorization (reasoning, observation, decision, question)
  - Confidence level indicators
  
- **Code Diff Viewer**: Security patch visualization
  - Split view (side-by-side vulnerable vs patched code)
  - Unified view (git-style diff format)
  - CVSS scoring and OWASP category mapping
  - Sample diffs for SQL injection, buffer overflow, XSS
  
- **Cost Optimization Dashboard**: LLM API cost tracking
  - Real-time cost accumulation (5-second intervals)
  - Groq pricing integration for all 4 models
  - ROI calculation ($10K value per successful defense)
  - Efficiency metrics (tokens per dollar)
  - Model-by-model breakdown with token usage

### 🎭 APT Threat Profiles (Features 51-54)
- **APT29 (Cozy Bear)**: Russian SVR - SolarWinds SUNBURST supply chain attack
  - Sophisticated phishing with LDAP/Active Directory recon
  - PowerShell Empire for C2 and lateral movement
  - Stealth persistence with WMI event subscriptions
  
- **APT28 (Fancy Bear)**: Russian GRU - Aggressive credential theft
  - Mimikatz LSASS dumping and Pass-the-Hash
  - XAgent keylogger and screenshot capture
  - Privilege escalation via Windows exploits
  
- **Lazarus Group**: North Korean - WannaCry ransomware
  - Cryptocurrency theft from exchanges
  - 3CX supply chain compromise
  - SWIFT network attacks for bank heists
  
- **APT38**: North Korean financial unit - Bank heists
  - Bangladesh Bank $81M SWIFT hack
  - Custom backdoors for payment systems
  - Anti-forensics and log wiping

### 📄 Enterprise Reporting (Features 55-60)
- **Automated Pen Test Report Generation**: OWASP-format professional reports
  - Executive summary with business impact analysis
  - Technical findings with PoC code, CVSS, and CWE references
  - MITRE ATT&CK framework mapping across 12 attack phases
  - OWASP Top 10 2021 analysis with category breakdown
  - Remediation roadmap (3 phases: 30/90/180 days with cost estimates)
  - Compliance mapping (PCI-DSS v4.0, GDPR, HIPAA, SOC 2)
  
- **Technical White Paper Generator**: Academic-style research papers
  - Abstract and methodology sections
  - Attack success rate tables and cost analysis
  - Discussion of advantages and limitations
  - References to NIST, OWASP, MITRE frameworks
  - 99.998% cost reduction vs traditional pen tests

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A [Groq API Key](https://console.groq.com/keys)

### 1. Backend (The Brains)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
export GROQ_API_KEY="your_api_key_here"  # On Windows: set GROQ_API_KEY=your_api_key_here
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
- **Frontend**: Vite + React 18 + TypeScript 5.4 + Framer Motion 11 + Tailwind CSS 3.4
- **Backend**: FastAPI + WebSockets + LangChain + LangGraph
- **AI**: Groq (LPU Inference Engine) for sub-second agent responses
- **Visualization**: HTML5 Canvas API for 3D rendering and real-time animation
- **Security Frameworks**: MITRE ATT&CK, OWASP Top 10 2021, NIST CSF, PCI-DSS v4.0

## 🛡️ Missions
1. **Network Flood**: Defend against DDoS with volumetric analysis
2. **Buffer Overflow**: Prevent stack corruption and shellcode injection
3. **SQL Injection**: Stop database compromise attempts
4. **Handshake Hijack (MITM)**: Secure ARP spoofing and SSL stripping
5. **IoT Takeover**: Compromise smart devices with firmware exploits
6. **Cloud Breach**: Exploit S3 buckets, IAM misconfigurations, RDS
7. **Supply Chain**: Poison npm packages and Docker containers
8. **API Exploit**: GraphQL introspection and BOLA attacks
9. **Ransomware**: File encryption with ransom negotiation
10. **Blockchain**: Smart contract reentrancy and oracle manipulation
11. **Insider Threat**: Privilege escalation and data exfiltration
12. **Social Engineering**: Phishing campaigns and BEC

## 📊 API Endpoints

### APT Profiles
- `GET /api/apt-profiles` - List available APT threat actor profiles
- `POST /api/apt-profiles/{apt_id}/scenario` - Generate mission from APT TTPs
- `POST /api/apt-profiles/{apt_id}/iocs` - Get Indicators of Compromise

### Report Generation
- `POST /api/reports/pentest` - Generate OWASP pen test report (JSON/HTML)
- `POST /api/reports/whitepaper` - Generate technical white paper
- `GET /api/reports/templates` - List available report templates

### Security Tools
- `GET /api/threat-intel` - Latest threat intelligence feeds
- `GET /api/deception/status` - Honeypot and decoy status
- `GET /api/zero-trust/policies` - Zero Trust architecture policies
- `GET /api/compliance/{framework}` - Compliance validation (GDPR, HIPAA, PCI-DSS)
- `GET /api/network/segmentation` - Network zone visualization
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

Built with 💙 by Jack Amichai • AI Engineer 
