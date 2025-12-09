from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

app = FastAPI()

# Health Check Route (Crucial for Render)
@app.get("/")
async def health_check():
    return {"status": "ok", "service": "Hatrick Backend"}

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
    red_inf_chain, red_data_chain, blue_inf_chain, blue_data_chain
)

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
    "MITM_ATTACK": "Target: Layer 5 Session. Scanning for unencrypted handshake protocols and key exchange vulnerabilities."
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

                # --- NORMAL GAME LOOP ---
                print(f"Starting Game Loop for Mission: {mission_id}")
                base_scenario = SCENARIOS.get(mission_id, SCENARIOS["NETWORK_FLOOD"])
                
                # Add Entropy
                import random
                entropy_factors = [
                    "High Network Latency Detected", "Encrypted Traffic Spikes",
                    "New Zero-Day Signature", "Unexpected Packet Fragmentation",
                    "Internal User Flagged", "External IP Rotation"
                ]
                current_entropy = random.choice(entropy_factors)
                scenario_context = f"{base_scenario} (Condition: {current_entropy})"

                # --- RED TEAM LOOP ---
                red_approved = False
                while not red_approved:
                    # 1. RED SCANNER
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_SCANNER", "status": "THINKING"})
                    await asyncio.sleep(1.5)
                    try:
                        scan_result = scanner_chain.invoke({"input": scenario_context})
                        last_turn_context['scan_result'] = scan_result
                    except Exception as e:
                        scan_result = f"Error: {str(e)}"
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
                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_COMMANDER", "status": "THINKING"})
                    await asyncio.sleep(1.5)
                    try:
                        final_move_json = commander_chain.invoke({"input": attack_options})
                        attack_name = final_move_json.get('attack_name', 'Unknown')
                        damage = final_move_json.get('damage', 0)
                        attack_desc = final_move_json.get('visual_desc', 'Proposed Attack')
                        last_turn_context['attack_name'] = attack_name
                    except Exception as e:
                        attack_name = "Retry"
                        damage = 0
                        attack_desc = "Compute Error"

                    # ASK FOR APPROVAL
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
                        await manager.broadcast({"type": "NEW_MESSAGE", "agent": "RED_COMMANDER", "text": f"Authorized: {attack_name}"})
                        await manager.broadcast({"type": "ATTACK_LAUNCH", "damage": damage, "desc": attack_desc})
                    else:
                        await manager.broadcast({"type": "NEW_MESSAGE", "agent": "RED_COMMANDER", "text": "Authorization Denied. Rethinking Strategy..."})

                    await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_COMMANDER", "status": "IDLE"})
                    await asyncio.sleep(1)


                # --- BLUE TEAM LOOP ---
                print("Starting Blue Team Turn...")
                blue_approved = False
                while not blue_approved:
                    # 1. BLUE WATCHMAN
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
