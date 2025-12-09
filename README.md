# 🎩 HatTrick: The Agentic Cyber-Arena

**HatTrick** is a real-time cybersecurity visualization platform where autonomous AI agents (Red Team vs. Blue Team) battle in simulated scenarios.

Powered by **Groq** (Llama-3, Phi-3), **LangChain**, and **React**.

![HatTrick Screenshot](https://github.com/JackAmichai/Hatrick/assets/placeholder/homepage.png)

## 🎮 Features
- **3D Orbital Homepage**: Select your mission from a dynamic 3-layer orbit. (Light/Dark Mode supported).
- **Real Virtual Environment Simulation**: Each mission creates a realistic target environment with:
    - Actual IP addresses and open ports
    - Service versions with known vulnerabilities
    - Mission-specific security weaknesses (CVEs, misconfigurations)
- **Live Code Viewer**: Click the `</>` button above each team to see:
    - **Red Team**: Actual malicious attack code (Python scripts for DDoS, buffer overflow, SQL injection, MITM)
    - **Blue Team**: Real defensive security code (rate limiting, ASLR, WAF, certificate pinning)
- **Sequential Adversarial Flow**:
    - **Red Team (Attackers)**: GPT-4, Llama-3, Gemini. They scan, weaponize, and launch attacks.
    - **Blue Team (Defenders)**: Claude-3, Phi-3, Command R+. They analyze, engineer, and patch vulnerabilities.
- **Visualized Scenarios**:
    - **Packet Storm**: Layer 3 Volumetric Attack with UDP flooding.
    - **Buffer Overflow**: Stack corruption with shellcode injection.
    - **SQL Injection**: Database compromise attempts.
    - **Handshake Hijack (MITM)**: ARP spoofing and SSL stripping visualization.
- **Server Tower**: Real-time health integrity monitoring.

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
1. **Network Flood**: Defend against DDoS.
2. **Buffer Overflow**: Prevent stack corruption (Coming Soon).
3. **Data Heist**: Stop SQL Injection.
4. **Handshake Hijack**: Secure the MITM exchange.

## 📜 License
MIT

ENJOY
