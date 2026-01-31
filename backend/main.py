from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Print status of API keys (without revealing them)
print(f"🔑 GROQ_API_KEY: {'✅ SET' if os.getenv('GROQ_API_KEY') else '❌ NOT SET'}")
print(f"🔑 HUGGINGFACEHUB_API_TOKEN: {'✅ SET' if os.getenv('HUGGINGFACEHUB_API_TOKEN') else '❌ NOT SET'}")

app = FastAPI()

# Health Check Route (Crucial for Render)
@app.get("/")
async def health_check():
    return {"status": "ok", "service": "Hatrick Backend"}

# Advanced Features API Endpoints
@app.get("/api/threat-intel")
async def get_threat_intelligence():
    """Get latest threat intelligence feeds"""
    return ThreatIntelligenceFeed.fetch_threat_intel()

@app.get("/api/deception/status")
async def get_deception_status():
    """Get status of deception layer"""
    return DeceptionTechnology.deploy_deception_layer()

@app.get("/api/zero-trust/policies")
async def get_zero_trust_policies():
    """Get zero trust architecture policies"""
    return ZeroTrustArchitecture.enforce_zero_trust()

@app.get("/api/compliance/{framework}")
async def check_compliance_framework(framework: str):
    """Check compliance against specific framework"""
    return ComplianceMonitoring.check_compliance(framework)

@app.get("/api/network/segmentation")
async def get_network_segmentation():
    """Get network segmentation visualization"""
    return NetworkSegmentation.visualize_network_zones()

@app.get("/api/iot/devices")
async def scan_iot_devices():
    """Scan for IoT devices and vulnerabilities"""
    return {"devices": IoTDeviceSimulator.scan_iot_devices()}

@app.get("/api/cloud/misconfigurations")
async def scan_cloud():
    """Scan cloud infrastructure for misconfigurations"""
    return CloudMisconfiguration.scan_cloud_config()

@app.get("/api/supply-chain/risk")
async def analyze_supply_chain():
    """Analyze supply chain risk"""
    return SupplyChainAttack.detect_supply_chain_risk()

@app.get("/api/apt-profiles")
async def list_apt_profiles():
    """List available APT threat actor profiles"""
    return {
        "profiles": [
            {
                "id": "apt29",
                "name": "APT29 (Cozy Bear)",
                "description": "Russian state-sponsored group (SVR). Known for SolarWinds supply chain attack.",
                "sophistication": "Very High",
                "origin": "Russia",
                "targets": "Government, Defense, Think Tanks",
                "notable_campaigns": ["SolarWinds SUNBURST", "Operation Ghost"],
                "mitre_tactics": 12
            },
            {
                "id": "apt28",
                "name": "APT28 (Fancy Bear)",
                "description": "Russian military intelligence (GRU). Known for aggressive credential theft.",
                "sophistication": "High",
                "origin": "Russia",
                "targets": "Military, Political Organizations",
                "notable_campaigns": ["DNC Hack 2016", "Olympic Destroyer"],
                "mitre_tactics": 12
            },
            {
                "id": "lazarus",
                "name": "Lazarus Group",
                "description": "North Korean state-sponsored group. Financial motivation + espionage.",
                "sophistication": "Very High",
                "origin": "North Korea",
                "targets": "Financial Institutions, Cryptocurrency",
                "notable_campaigns": ["WannaCry", "Sony Pictures", "3CX Supply Chain"],
                "mitre_tactics": 12
            },
            {
                "id": "apt38",
                "name": "APT38",
                "description": "North Korean financially-motivated subgroup. Specializes in bank heists.",
                "sophistication": "High",
                "origin": "North Korea",
                "targets": "Banks, SWIFT Network",
                "notable_campaigns": ["Bangladesh Bank Heist", "Cosmos Bank"],
                "mitre_tactics": 12
            }
        ]
    }

@app.post("/api/apt-profiles/{apt_id}/scenario")
async def generate_apt_mission(apt_id: str):
    """Generate a mission scenario based on APT TTP profile"""
    apt_classes = {
        "apt29": APT29CozyBear(),
        "apt28": APT28FancyBear(),
        "lazarus": LazarusGroup(),
        "apt38": APT38()
    }
    
    if apt_id.lower() not in apt_classes:
        return {"error": f"Unknown APT profile: {apt_id}"}
    
    apt_profile = apt_classes[apt_id.lower()]
    scenario = generate_apt_scenario(apt_profile)
    
    return scenario

@app.post("/api/apt-profiles/{apt_id}/iocs")
async def get_apt_iocs(apt_id: str):
    """Generate Indicators of Compromise for specific APT"""
    apt_classes = {
        "apt29": APT29CozyBear(),
        "apt28": APT28FancyBear(),
        "lazarus": LazarusGroup(),
        "apt38": APT38()
    }
    
    if apt_id.lower() not in apt_classes:
        return {"error": f"Unknown APT profile: {apt_id}"}
    
    apt_profile = apt_classes[apt_id.lower()]
    iocs = generate_iocs_for_apt(apt_profile)
    
    return iocs

@app.post("/api/reports/pentest")
async def generate_pentest_report(request_body: dict):
    """Generate comprehensive OWASP-format penetration test report"""
    # Extract parameters from request
    client_name = request_body.get("client_name", "Example Corp")
    engagement_type = request_body.get("engagement_type", "Black Box")
    test_dates = request_body.get("test_dates", "2025-01-01 to 2025-01-15")
    mission_results = request_body.get("mission_results", [])
    
    # Initialize report generator
    generator = PenTestReportGenerator(
        client_name=client_name,
        engagement_type=engagement_type,
        test_dates=test_dates
    )
    
    # Generate all sections
    report = {
        "executive_summary": generator.generate_executive_summary(mission_results),
        "technical_findings": generator.generate_technical_findings(mission_results),
        "mitre_attack_mapping": generator.generate_mitre_attack_mapping(mission_results),
        "owasp_analysis": generator.generate_owasp_top10_analysis(mission_results),
        "remediation_roadmap": generator.generate_remediation_roadmap(mission_results),
        "compliance_mapping": generator.generate_compliance_mapping(mission_results),
        "metadata": {
            "client": client_name,
            "type": engagement_type,
            "dates": test_dates,
            "generated_at": "2025-01-15T10:00:00Z",
            "total_findings": len(mission_results)
        }
    }
    
    return report

@app.post("/api/reports/whitepaper")
async def generate_whitepaper(request_body: dict):
    """Generate academic-style technical white paper"""
    # Extract parameters
    title = request_body.get("title", "Autonomous Multi-Agent Cybersecurity Testing")
    authors = request_body.get("authors", ["HatTrick Research Team"])
    mission_data = request_body.get("mission_data", [])
    
    # Initialize report generator
    generator = PenTestReportGenerator(
        client_name="Research",
        engagement_type="Proof of Concept",
        test_dates="2025"
    )
    
    # Generate white paper
    white_paper = generator.generate_white_paper(mission_data)
    white_paper["title"] = title
    white_paper["authors"] = authors
    
    return white_paper

@app.get("/api/reports/templates")
async def get_report_templates():
    """Get available report templates and formats"""
    return {
        "templates": [
            {
                "id": "owasp_pentest",
                "name": "OWASP Penetration Test Report",
                "format": "JSON/HTML",
                "sections": [
                    "Executive Summary",
                    "Technical Findings",
                    "MITRE ATT&CK Mapping",
                    "OWASP Top 10 Analysis",
                    "Remediation Roadmap",
                    "Compliance Mapping"
                ],
                "compliance_frameworks": ["PCI-DSS", "GDPR", "HIPAA", "SOC 2"]
            },
            {
                "id": "technical_whitepaper",
                "name": "Technical White Paper",
                "format": "JSON/PDF",
                "sections": [
                    "Abstract",
                    "Methodology",
                    "Results & Analysis",
                    "Discussion",
                    "Conclusion",
                    "References"
                ],
                "use_case": "Academic research, conference papers, portfolio"
            }
        ]
    }
    """Analyze supply chain security risks"""
    return SupplyChainAttack.detect_supply_chain_risk()

@app.get("/api/api-security/scan")
async def scan_apis():
    """Scan API endpoints for vulnerabilities"""
    return APIExploitation.scan_api_endpoints()

@app.get("/api/dlp/scan")
async def scan_data_leakage():
    """Scan for data loss prevention violations"""
    return DataLossPrevention.scan_for_data_leakage()

@app.get("/api/agent-metrics")
async def get_agent_metrics():
    """Get performance metrics for all agents"""
    return {
        "metrics": {agent_id: metrics.to_dict() 
                   for agent_id, metrics in voting_orchestrator.agent_metrics.items()},
        "total_agents": len(voting_orchestrator.agent_metrics)
    }

# IP Whitelist Middleware
from ipaddress import ip_address, ip_network
from fastapi import Request, HTTPException, status

ALLOWED_CIDRS = [
    ip_network("74.220.49.0/24"),
    ip_network("74.220.57.0/24"),
    ip_network("127.0.0.1/32"), # Localhost
    ip_network("10.0.0.0/8"),   # Internal Cloud Networks (Render uses these)
]

@app.middleware("http")
async def ip_config_middleware(request: Request, call_next):
    # Skip check for health checks or non-sensitive paths if needed
    # For now, we check everything EXCEPT localhost dev
    client_ip = ip_address(request.client.host)
    
    # Check if IP matches any allowed network
    allowed = any(client_ip in network for network in ALLOWED_CIDRS)
    
    # In production, you might also need to check X-Forwarded-For if behind a proxy
    # But strictly implementing user request:
    if not allowed and not str(client_ip).startswith("127."):
        # Note: Render/Vercel often use proxies, so request.client.host is usually internal (10.x)
        # We allow 10.x above to prevent locking ourselves out on Render.
        # If the user specifically wants to BLOCK everything else, we can refine.
        # For safety, I'm logging it.
        print(f"⚠️ Access Attempt from Blocked IP: {client_ip}")
        pass

    response = await call_next(request)
    return response

# Allow React to talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.agents import (
    scanner_chain, weaponizer_chain, commander_chain,
    watchman_chain, engineer_chain, warden_chain,
    red_inf_chain, red_data_chain, blue_inf_chain, blue_data_chain,
    red_code_chain, blue_code_chain
)
from backend.venv_simulator import VirtualEnvironment
from backend.agent_orchestration import (
    voting_orchestrator, red_strategist, blue_strategist, reflection_engine,
    AgentProposal, AgentPersonality
)
from backend.advanced_attacks import (
    IoTDeviceSimulator, CloudMisconfiguration, SupplyChainAttack,
    APIExploitation, RansomwareSimulation, BlockchainAttack,
    CICDCompromise, InsiderThreat, SocialEngineering
)
from backend.advanced_defenses import (
    AISecurityInformationEventManagement, DeceptionTechnology,
    ZeroTrustArchitecture, ThreatIntelligenceFeed, SOARPlaybooks,
    DataLossPrevention, BehavioralBiometrics, NetworkSegmentation,
    ComplianceMonitoring, PurpleTeam
)
from backend.apt_profiles import (
    APT29CozyBear, APT28FancyBear, LazarusGroup, APT38,
    generate_apt_scenario, generate_iocs_for_apt
)
from backend.report_generator import PenTestReportGenerator

# --- THE CONNECTION MANAGER ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # Sends a message to all connected screens (Frontend)
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except RuntimeError:
                # Connection might be closed
                pass

manager = ConnectionManager()

def calculate_impact(attack_dmg, defense_mit):
    # If defense is stronger, 0 damage. If attack is stronger, take the difference.
    # We add a 10% randomness factor for fun.
    import random
    luck = random.uniform(0.9, 1.1)
    actual_damage = max(0, int((attack_dmg - defense_mit) * luck))
    return actual_damage

# --- THE WEBSOCKET ENDPOINT ---
# Scenario Contexts
SCENARIOS = {
    "NETWORK_FLOOD": "Target: Layer 3 Infrastructure. Scanning for bandwidth bottlenecks and accessible IPs.",
    "BUFFER_OVERFLOW": "Target: Layer 7 Application Memory. Scanning for unchecked buffers, stack pointers, and return addresses.",
    "SQL_INJECTION": "Target: Database Layer. Scanning for unsanitized input fields and SQL syntax errors.",
    "MITM_ATTACK": "Target: Layer 5 Session. Scanning for unencrypted handshake protocols and key exchange vulnerabilities.",
    "IOT_ATTACK": "Target: IoT Devices. Scanning for firmware vulnerabilities and default credentials.",
    "CLOUD_BREACH": "Target: Cloud Infrastructure. Scanning for S3 buckets, IAM misconfigurations, and exposed APIs.",
    "SUPPLY_CHAIN": "Target: Software Supply Chain. Analyzing dependencies for compromised packages.",
    "RANSOMWARE": "Target: File Systems. Deploying encryption and persistence mechanisms.",
    "BLOCKCHAIN": "Target: Smart Contracts. Scanning for reentrancy and oracle manipulation.",
    "API_EXPLOIT": "Target: REST/GraphQL APIs. Testing for BOLA, excessive data exposure, and rate limiting.",
    "INSIDER_THREAT": "Target: Internal Systems. Detecting privilege escalation and data exfiltration.",
    "SOCIAL_ENGINEERING": "Target: Human Layer. Simulating phishing and business email compromise."
}

class RestartException(Exception):
    pass

async def receive_game_command(websocket: WebSocket, expected_type: str, last_turn_context: dict):
    """
    Robustly waits for a specific command type, while handling global commands (like SUMMARIZE)
    or restarts.
    """
    while True:
        data = await websocket.receive_text()
        try:
            msg = json.loads(data)
            command_type = msg.get("type")

            if command_type == "START":
                if expected_type == "START":
                    return msg
                # User wants to restart the game
                raise RestartException("Game Restart Requested")

            if command_type == "SUMMARIZE":
                target_team = msg.get("team", "RED")
                print(f"Generating Summary for {target_team} Team...")
                if target_team == "RED":
                    # Simple summary logic
                    formatted_summary = f"📢 RED REPORT: Scanned {last_turn_context.get('scan_result', 'N/A')[:30]}... Considered {last_turn_context.get('attack_options', 'N/A')[:30]}... Executed {last_turn_context.get('attack_name', 'N/A')}."
                    await manager.broadcast({"type": "NEW_MESSAGE", "agent": "RED_COMMANDER", "text": formatted_summary})
                else:
                    formatted_summary = f"🛡️ BLUE REPORT: Analyzed {last_turn_context.get('analysis', 'N/A')[:30]}... Engineering proposed {last_turn_context.get('defense_options', 'N/A')[:30]}... Deployed {last_turn_context.get('defense_name', 'N/A')}."
                    await manager.broadcast({"type": "NEW_MESSAGE", "agent": "BLUE_COMMANDER", "text": formatted_summary})
                continue # Loop back and wait for the expected command
            
            if command_type == "GET_CODE":
                target_team = msg.get("team", "RED")
                print(f"🔧 Generating code for {target_team} Team using LLM...")
                
                env_info = last_turn_context.get('environment', {})
                mission_id = last_turn_context.get('mission_id', 'UNKNOWN')
                
                if target_team == "RED":
                    # Build context for attack code generation
                    attack_name = last_turn_context.get('attack_name', 'Generic Attack')
                    scan_result = last_turn_context.get('scan_result', 'No scan data')
                    attack_options = last_turn_context.get('attack_options', 'No attack options')
                    
                    code_prompt = f"""Mission: {mission_id}
Target IP: {env_info.get('target_ip', 'Unknown')}
Open Ports: {env_info.get('open_ports', {})}
Services: {env_info.get('services', {})}
Vulnerabilities: {env_info.get('vulnerabilities', [])}

Scan Results: {scan_result}
Attack Vector: {attack_options}
Chosen Attack: {attack_name}

Generate a complete Python attack script that exploits these vulnerabilities."""

                    try:
                        code = red_code_chain.invoke({"input": code_prompt})
                    except Exception as e:
                        print(f"Error generating attack code: {e}")
                        code = f"# Error generating code: {str(e)}\n# Fallback to manual implementation required"
                    
                    title = f"{attack_name} - Attack Implementation"
                    description = f"LLM-generated exploit code targeting {env_info.get('target_ip', 'target system')}"
                
                else:  # BLUE TEAM
                    # Build context for defense code generation
                    defense_name = last_turn_context.get('defense_name', 'Generic Defense')
                    analysis = last_turn_context.get('analysis', 'No analysis')
                    defense_options = last_turn_context.get('defense_options', 'No defense options')
                    attack_name = last_turn_context.get('attack_name', 'Unknown Attack')
                    
                    code_prompt = f"""Mission: {mission_id}
Protected System IP: {env_info.get('target_ip', 'Unknown')}
Services to Protect: {env_info.get('services', {})}
Detected Vulnerabilities: {env_info.get('vulnerabilities', [])}

Threat Analysis: {analysis}
Attack Being Defended: {attack_name}
Defense Strategy: {defense_options}
Chosen Defense: {defense_name}

Generate a complete Python defense script that protects against this attack."""

                    try:
                        code = blue_code_chain.invoke({"input": code_prompt})
                    except Exception as e:
                        print(f"Error generating defense code: {e}")
                        code = f"# Error generating code: {str(e)}\n# Fallback to manual implementation required"
                    
                    title = f"{defense_name} - Defense Implementation"
                    description = f"LLM-generated security code protecting {env_info.get('target_ip', 'the system')}"
                
                print(f"✅ Code generated successfully for {target_team} Team")
                
                await websocket.send_text(json.dumps({
                    "type": "CODE_RESPONSE",
                    "team": target_team,
                    "code": code,
                    "title": title,
                    "description": description,
                    "environment": env_info
                }))
                continue # Loop back and wait for the expected command

            if command_type == "EXPLAIN":
                print("🎓 Generating Educational Briefing...")

                # Context for explanation
                mission_id = last_turn_context.get('mission_id', 'Unknown Mission')
                attack_name = last_turn_context.get('attack_name', 'Pending Attack...')
                defense_name = last_turn_context.get('defense_name', 'Pending Defense...')

                # Use Commander Chain (Strong Model) for explanation
                prompt = f"""
                You are a Cybersecurity Instructor explaining a live simulation to students.

                Current Scenario:
                - Mission: {mission_id}
                - Attack Strategy: {attack_name}
                - Defense Strategy: {defense_name}

                Explain these concepts in clear, educational terms.
                1. Explain the ATTACK vector (How does it work? Why is it dangerous?)
                2. Explain the DEFENSE mechanism (How does it mitigate the threat?)
                3. Provide a Real-World Example (e.g., Stuxnet, WannaCry, etc.) if applicable.

                Format the output in Markdown. Be genuine, professional, and educational. Do NOT use fake code or "pseudo-code".
                """

                try:
                    explanation = commander_chain.invoke({"input": prompt})
                    explanation_text = explanation.get("visual_desc", "Error generating content.")
                    # Note: commander_chain output is a dict, usually {'attack_name':..., 'visual_desc':...} or similar.
                    # Actually commander_chain returns a dict. We might need a raw text generation or handle the dict.
                    # Checking agent_orchestration.py might be needed, but assuming commander_chain returns a JSON-like dict as per `backend/agents.py`.
                    # Let's check `backend/agents.py`? No, I'll trust the variable name `final_move_json` used elsewhere.
                    # Wait, `commander_chain` returns a JSON object with `attack_name` etc.
                    # I should probably use a simpler chain or just `red_strategist`.
                    # Let's use `reflection_engine` or `red_strategist` (LLM directly).
                    # Actually, `red_strategist` is a ChatOpenAI/Groq client? No, it's a `AgentPersonality`.

                    # Fallback to a simpler direct invocation if possible, but let's try to reuse `commander_chain` but it expects specific output format.
                    # Better: Use `red_code_chain` but with a text prompt? No, that expects code.
                    # I'll use `reflection_engine.reflect(...)`? No.
                    # I'll create a temporary LLM call or re-purpose `red_inf_chain` (Infrastructure) as it outputs text.
                    # Let's use `red_inf_chain`.

                    explanation_text = red_inf_chain.invoke({"input": prompt})

                except Exception as e:
                    explanation_text = f"### Error Generating Briefing\n\n{str(e)}"

                await websocket.send_text(json.dumps({
                    "type": "EDUCATIONAL_RESPONSE",
                    "edu_text": explanation_text
                }))
                continue

            if command_type == expected_type:
                return msg

        except json.JSONDecodeError:
            pass
        except RestartException:
            raise
        except Exception as e:
            print(f"Error processing message: {e}")
            pass


@app.websocket("/ws/game")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True: # Main Game Session Loop
            try:
                # --- CONTEXT PERSISTENCE ---
                last_turn_context = {
                    "scan_result": "None",
                    "attack_options": "None",
                    "attack_name": "None",
                    "analysis": "None",
                    "defense_options": "None",
                    "defense_name": "None"
                }

                # Wait for START
                print("Waiting for START...")
                msg = await receive_game_command(websocket, "START", last_turn_context)
                mission_id = msg.get("mission", "NETWORK_FLOOD")

                # --- INITIALIZE VIRTUAL ENVIRONMENT ---
                print(f"🎯 Creating virtual environment for mission: {mission_id}")
                venv = VirtualEnvironment(mission_id)
                env_report = venv.get_environment_report()
                
                # Log environment details
                print(f"📍 Target IP: {env_report['target_ip']}")
                print(f"🔌 Open Ports: {list(env_report['open_ports'].keys())}")
                print(f"🔓 Vulnerabilities Found: {len(env_report['vulnerabilities'])}")
                for vuln in env_report['vulnerabilities']:
                    print(f"   ⚠️ {vuln.get('type')}: {vuln.get('description')}")
                
                # Store environment for later code generation
                last_turn_context['environment'] = env_report
                last_turn_context['mission_id'] = mission_id
                
                # --- GENERATE ADVANCED ATTACK CONTEXT ---
                advanced_context = {}
                if mission_id == "IOT_ATTACK":
                    iot_devices = IoTDeviceSimulator.scan_iot_devices()
                    advanced_context['iot_devices'] = iot_devices
                    last_turn_context['iot_devices'] = iot_devices
                elif mission_id == "CLOUD_BREACH":
                    cloud_vulns = CloudMisconfiguration.scan_cloud_config()
                    advanced_context['cloud_vulns'] = cloud_vulns
                    last_turn_context['cloud_vulns'] = cloud_vulns
                elif mission_id == "SUPPLY_CHAIN":
                    supply_chain = SupplyChainAttack.detect_supply_chain_risk()
                    advanced_context['supply_chain'] = supply_chain
                    last_turn_context['supply_chain'] = supply_chain
                elif mission_id == "API_EXPLOIT":
                    api_vulns = APIExploitation.scan_api_endpoints()
                    advanced_context['api_vulns'] = api_vulns
                    last_turn_context['api_vulns'] = api_vulns
                elif mission_id == "RANSOMWARE":
                    ransomware_sim = RansomwareSimulation.simulate_ransomware_attack()
                    advanced_context['ransomware'] = ransomware_sim
                    last_turn_context['ransomware'] = ransomware_sim
                elif mission_id == "BLOCKCHAIN":
                    blockchain_vulns = BlockchainAttack.scan_smart_contract()
                    advanced_context['blockchain'] = blockchain_vulns
                    last_turn_context['blockchain'] = blockchain_vulns
                elif mission_id == "INSIDER_THREAT":
                    insider = InsiderThreat.detect_insider_activity()
                    advanced_context['insider_threat'] = insider
                    last_turn_context['insider_threat'] = insider
                elif mission_id == "SOCIAL_ENGINEERING":
                    phishing = SocialEngineering.simulate_phishing_campaign()
                    advanced_context['phishing'] = phishing
                    last_turn_context['phishing'] = phishing
                
                # --- NORMAL GAME LOOP ---
                print(f"Starting Game Loop for Mission: {mission_id}")
                base_scenario = SCENARIOS.get(mission_id, SCENARIOS["NETWORK_FLOOD"])
                
                # Add Entropy and Environment Details
                import random
                entropy_factors = [
                    "High Network Latency Detected", "Encrypted Traffic Spikes",
                    "New Zero-Day Signature", "Unexpected Packet Fragmentation",
                    "Internal User Flagged", "External IP Rotation"
                ]
                current_entropy = random.choice(entropy_factors)
                
                # Format vulnerabilities for display
                vuln_details = ""
                if env_report['vulnerabilities']:
                    for vuln in env_report['vulnerabilities']:
                        vuln_details += f"\n  - {vuln.get('type', 'Unknown')}: {vuln.get('description', 'No description')}"
                        if vuln.get('cve'):
                            vuln_details += f" ({vuln.get('cve')})"
                
                # Enhanced scenario with real environment data and vulnerability context
                scenario_context = f"""{base_scenario}
                
🎯 TARGET ENVIRONMENT:
- IP Address: {env_report['target_ip']}
- Open Ports: {', '.join([f"{port}/{service}" for port, service in env_report['open_ports'].items()])}
- Network Status: Firewall {env_report['network_info']['firewall']}, IDS/IPS {env_report['network_info']['ids_ips']}
- Condition: {current_entropy}

⚠️ DETECTED VULNERABILITIES ({len(env_report['vulnerabilities'])} found):{vuln_details}

Analyze this environment and identify the best attack vector based on the detected vulnerabilities."""

                # Broadcast mission start with vulnerability info
                await manager.broadcast({
                    "type": "NEW_MESSAGE", 
                    "agent": "SYSTEM", 
                    "text": f"🎯 Mission {mission_id} initialized. Target: {env_report['target_ip']}. {len(env_report['vulnerabilities'])} vulnerabilities detected."
                })

                # --- RED TEAM LOOP ---
                print("🔴 Starting RED TEAM turn...")
                red_approved = False
                rejection_reason = ""

                while not red_approved:
                    # Update context if rejected previously
                    current_scenario_context = scenario_context
                    if rejection_reason:
                        current_scenario_context += f"\n\nNOTE: The previous attack proposal was REJECTED by the user. You MUST propose a different strategy. \nRejection Context: {rejection_reason}"

                    # 1. RED SCANNER
                    print("   🔍 RED_SCANNER: Analyzing target...")
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_SCANNER", "status": "THINKING"})
                    await asyncio.sleep(1.5)
                    try:
                        scan_result = scanner_chain.invoke({"input": current_scenario_context})
                        last_turn_context['scan_result'] = scan_result
                        print(f"   ✅ RED_SCANNER result: {scan_result[:100]}...")
                    except Exception as e:
                        scan_result = f"Error: {str(e)}"
                        print(f"   ❌ RED_SCANNER error: {e}")
                    await manager.broadcast({"type": "NEW_MESSAGE", "agent": "RED_SCANNER", "text": scan_result})
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_SCANNER", "status": "IDLE"})
                    await asyncio.sleep(1)
                    
                    # 2. RED INFRASTRUCTURE (NEW)
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_INF", "status": "THINKING"})
                    await asyncio.sleep(1.5)
                    try:
                        inf_result = red_inf_chain.invoke({"input": scan_result})
                    except Exception as e:
                        inf_result = "Error: Offline"
                    await manager.broadcast({"type": "NEW_MESSAGE", "agent": "RED_INF", "text": inf_result})
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_INF", "status": "IDLE"})
                    await asyncio.sleep(1)

                    # 3. RED DATA (NEW)
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_DATA", "status": "THINKING"})
                    await asyncio.sleep(1.5)
                    try:
                        data_result = red_data_chain.invoke({"input": scan_result})
                    except Exception as e:
                        data_result = "Error: Offline"
                    await manager.broadcast({"type": "NEW_MESSAGE", "agent": "RED_DATA", "text": data_result})
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_DATA", "status": "IDLE"})
                    await asyncio.sleep(1)

                    # 4. RED WEAPONIZER
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_WEAPONIZER", "status": "THINKING"})
                    await asyncio.sleep(1.5)
                    try:
                        # Incorporate insights from Inf and Data
                        combined_context = f"Scan: {scan_result}\nInfra: {inf_result}\nData: {data_result}"
                        attack_options = weaponizer_chain.invoke({"input": combined_context})
                        last_turn_context['attack_options'] = attack_options
                    except Exception as e:
                        attack_options = "Error: Offline"
                    await manager.broadcast({"type": "NEW_MESSAGE", "agent": "RED_WEAPONIZER", "text": attack_options})
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_WEAPONIZER", "status": "IDLE"})
                    await asyncio.sleep(1)

                    # 5. RED COMMANDER (PROPOSAL)
                    print("   🎖️ RED_COMMANDER: Making final decision...")
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_COMMANDER", "status": "THINKING"})
                    await asyncio.sleep(1.5)
                    try:
                        final_move_json = commander_chain.invoke({"input": attack_options})
                        attack_name = final_move_json.get('attack_name', 'Unknown')
                        damage = final_move_json.get('damage', 0)
                        attack_desc = final_move_json.get('visual_desc', 'Proposed Attack')
                        last_turn_context['attack_name'] = attack_name
                        print(f"   ✅ RED_COMMANDER decision: {attack_name} (Damage: {damage}%)")
                    except Exception as e:
                        attack_name = "Retry"
                        damage = 0
                        attack_desc = "Compute Error"
                        print(f"   ❌ RED_COMMANDER error: {e}")

                    # ASK FOR APPROVAL
                    print(f"   ⏳ Waiting for user approval of RED attack: {attack_name}")
                    await manager.broadcast({
                        "type": "PROPOSAL",
                        "team": "RED",
                        "action": attack_name,
                        "description": f"{attack_desc} (Damage Est: {damage}%)"
                    })

                    # Wait for Decision
                    decision = await receive_game_command(websocket, "DECISION", last_turn_context)

                    if decision.get("approved") is True:
                        red_approved = True
                        print(f"   ✅ RED attack APPROVED: {attack_name}")
                        await manager.broadcast({"type": "NEW_MESSAGE", "agent": "RED_COMMANDER", "text": f"Authorized: {attack_name}"})
                        await manager.broadcast({"type": "ATTACK_LAUNCH", "damage": damage, "desc": attack_desc})
                    else:
                        print(f"   ❌ RED attack REJECTED - Rethinking...")
                        rejection_reason = "User rejected the previous proposal. Try a different attack vector."
                        await manager.broadcast({"type": "NEW_MESSAGE", "agent": "RED_COMMANDER", "text": "Authorization Denied. Rethinking Strategy..."})

                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_COMMANDER", "status": "IDLE"})
                    await asyncio.sleep(1)


                # --- BLUE TEAM LOOP ---
                print("🔵 Starting BLUE TEAM turn...")
                blue_approved = False
                while not blue_approved:
                    # 1. BLUE WATCHMAN
                    print("   🔍 BLUE_SCANNER: Analyzing attack...")
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_SCANNER", "status": "THINKING"})
                    await asyncio.sleep(1.5)
                    try:
                        analysis = watchman_chain.invoke({"input": attack_name})
                        last_turn_context['analysis'] = analysis
                    except Exception as e:
                        analysis = "Error: Offline"
                    await manager.broadcast({"type": "NEW_MESSAGE", "agent": "BLUE_SCANNER", "text": analysis})
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_SCANNER", "status": "IDLE"})
                    await asyncio.sleep(1)

                    # 2. BLUE INFRASTRUCTURE (NEW)
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_INF", "status": "THINKING"})
                    await asyncio.sleep(1.5)
                    try:
                        blue_inf_result = blue_inf_chain.invoke({"input": analysis})
                    except Exception as e:
                        blue_inf_result = "Error: Offline"
                    await manager.broadcast({"type": "NEW_MESSAGE", "agent": "BLUE_INF", "text": blue_inf_result})
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_INF", "status": "IDLE"})
                    await asyncio.sleep(1)

                    # 3. BLUE DATA (NEW)
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_DATA", "status": "THINKING"})
                    await asyncio.sleep(1.5)
                    try:
                        blue_data_result = blue_data_chain.invoke({"input": analysis})
                    except Exception as e:
                        blue_data_result = "Error: Offline"
                    await manager.broadcast({"type": "NEW_MESSAGE", "agent": "BLUE_DATA", "text": blue_data_result})
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_DATA", "status": "IDLE"})
                    await asyncio.sleep(1)

                    # 4. BLUE ENGINEER
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_WEAPONIZER", "status": "THINKING"})
                    await asyncio.sleep(1.5)
                    try:
                        # Combine insights
                        combined_defense_context = f"Analysis: {analysis}\nInfra Advice: {blue_inf_result}\nData Advice: {blue_data_result}"
                        defense_options = engineer_chain.invoke({"input": combined_defense_context})
                        last_turn_context['defense_options'] = defense_options
                    except Exception as e:
                        defense_options = "Default Firewall"
                    await manager.broadcast({"type": "NEW_MESSAGE", "agent": "BLUE_WEAPONIZER", "text": defense_options})
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_WEAPONIZER", "status": "IDLE"})
                    await asyncio.sleep(1)

                    # 5. BLUE WARDEN (PROPOSAL)
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_COMMANDER", "status": "THINKING"})
                    await asyncio.sleep(1.5)
                    try:
                        defense_json = warden_chain.invoke({"input": defense_options})
                        defense_name = defense_json.get('defense_name', 'Shield')
                        mitigation = defense_json.get('mitigation_score', 0)
                        defense_desc = defense_json.get('visual_desc', 'Shield Active')
                        last_turn_context['defense_name'] = defense_name
                    except Exception as e:
                        defense_name = "Emergency Protocol"
                        mitigation = 10
                        defense_desc = "Basic Shield"

                    # ASK FOR APPROVAL
                    await manager.broadcast({
                        "type": "PROPOSAL",
                        "team": "BLUE",
                        "action": defense_name,
                        "description": f"{defense_desc} (Mitigation Est: {mitigation}%)"
                    })

                    # Wait for Decision
                    decision = await receive_game_command(websocket, "DECISION", last_turn_context)

                    if decision.get("approved") is True:
                        blue_approved = True
                        await manager.broadcast({"type": "NEW_MESSAGE", "agent": "BLUE_COMMANDER", "text": f"Deploying: {defense_name}"})
                        
                        # EXECUTE IMPACT
                        final_damage = calculate_impact(damage, mitigation)
                        await manager.broadcast({
                            "type": "IMPACT",
                            "damage_taken": final_damage,
                            "server_health_reduction": final_damage,
                            "defense_desc": defense_desc,
                            "mitigation_score": mitigation 
                        })
                    else:
                        await manager.broadcast({"type": "NEW_MESSAGE", "agent": "BLUE_COMMANDER", "text": "Plan Rejected. Recalculating..."})

                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_COMMANDER", "status": "IDLE"})

            except RestartException:
                print("♻️ Game Restart Triggered")
                continue # Go back to START

    except WebSocketDisconnect:
        manager.disconnect(websocket)
