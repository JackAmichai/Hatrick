from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

app = FastAPI()

# Allow React to talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify "http://localhost:5173"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.agents import scanner_chain, weaponizer_chain, commander_chain, watchman_chain, engineer_chain, warden_chain

# --- THE CONNECTION MANAGER ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # Sends a message to all connected screens (Frontend)
        for connection in self.active_connections:
            await connection.send_text(json.dumps(message))

manager = ConnectionManager()

def calculate_impact(attack_dmg, defense_mit):
    # If defense is stronger, 0 damage. If attack is stronger, take the difference.
    # We add a 10% randomness factor for fun.
    import random
    luck = random.uniform(0.9, 1.1)
    actual_damage = max(0, int((attack_dmg - defense_mit) * luck))
    return actual_damage

# --- THE WEBSOCKET ENDPOINT ---
@app.websocket("/ws/game")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Wait for a "Start Round" signal from Frontend
            data = await websocket.receive_text()
            
            # --- START RED TEAM ---
            
            # 1. RED SCANNER
            await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_SCANNER", "status": "THINKING"})
            
            # CALL REAL AI
            try:
                scan_result = scanner_chain.invoke({"layer_info": "OSI Layer 3 (Network) - Legacy Router IP 192.168.0.1"})
            except Exception as e:
                scan_result = f"Error: {str(e)} (Check GROQ_API_KEY)"

            await manager.broadcast({
                "type": "NEW_MESSAGE", 
                "agent": "RED_SCANNER", 
                "text": scan_result
            })
            await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_SCANNER", "status": "IDLE"})
            
            # 2. RED WEAPONIZER
            await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_WEAPONIZER", "status": "THINKING"})
            
            # CALL REAL AI (Pass the scan result to the next agent)
            try:
                attack_options = weaponizer_chain.invoke({"scan_result": scan_result})
            except Exception as e:
                attack_options = "Error: System Offline"

            await manager.broadcast({
                "type": "NEW_MESSAGE", 
                "agent": "RED_WEAPONIZER", 
                "text": attack_options
            })
            await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_WEAPONIZER", "status": "IDLE"})

            # 3. RED COMMANDER
            await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_COMMANDER", "status": "THINKING"})
            
            # CALL REAL AI (Pass the options to the leader)
            try:
                final_move_json = commander_chain.invoke({"options": attack_options})
                attack_name = final_move_json.get('attack_name', 'Unknown')
                damage = final_move_json.get('damage', 0)
                attack_desc = final_move_json.get('visual_desc', 'Attack failed')
            except Exception as e:
                attack_name = "Abort"
                damage = 0
                attack_desc = "Connection Error"
            
            # Broadcast the text decision
            await manager.broadcast({
                "type": "NEW_MESSAGE", 
                "agent": "RED_COMMANDER", 
                "text": f"Authorized: {attack_name}"
            })
            
            # Broadcast the DAMAGE EVENT (Visuals - Attack Launch)
            await manager.broadcast({
                "type": "ATTACK_LAUNCH",
                "damage": damage,
                "desc": attack_desc
            })
            
            await manager.broadcast({"type": "STATE_UPDATE", "agent": "RED_COMMANDER", "status": "IDLE"})

            # --- START BLUE TEAM ---
            print("Starting Blue Team Turn...")

            # 1. BLUE WATCHMAN
            await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_SCANNER", "status": "THINKING"})
            
            try:
                # Watchman analyzes Red's final move
                print(f"Blue Watchman invoking with: {attack_name}")
                analysis = watchman_chain.invoke({"attack_info": attack_name})
                print(f"Blue Watchman Result: {analysis}")
            except Exception as e:
                print(f"Blue Watchman Error: {e}")
                analysis = "Error: System Offline"

            await manager.broadcast({
                "type": "NEW_MESSAGE", 
                "agent": "BLUE_SCANNER", 
                "text": analysis
            })
            await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_SCANNER", "status": "IDLE"})

            # 2. BLUE ENGINEER
            await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_WEAPONIZER", "status": "THINKING"})
            
            try:
                print("Blue Engineer invoking...")
                defense_options = engineer_chain.invoke({"analysis": analysis})
                print(f"Blue Engineer Result: {defense_options}")
            except Exception as e:
                print(f"Blue Engineer Error: {e}")
                defense_options = "Default Firewall"

            await manager.broadcast({
                "type": "NEW_MESSAGE", 
                "agent": "BLUE_WEAPONIZER", 
                "text": defense_options
            })
            await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_WEAPONIZER", "status": "IDLE"})

            # 3. BLUE WARDEN (DECISION)
            await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_COMMANDER", "status": "THINKING"})
            
            try:
                print("Blue Warden invoking...")
                defense_json = warden_chain.invoke({"options": defense_options})
                print(f"Blue Warden Result: {defense_json}")
                defense_name = defense_json.get('defense_name', 'Shield')
                mitigation = defense_json.get('mitigation_score', 0)
                defense_desc = defense_json.get('visual_desc', 'Shield Active')
            except Exception as e:
                print(f"Blue Warden Error: {e}")
                defense_name = "Emergency Protocol"
                mitigation = 10
                defense_desc = "Basic Shield"

            await manager.broadcast({
                "type": "NEW_MESSAGE", 
                "agent": "BLUE_COMMANDER", 
                "text": f"Deploying: {defense_name}"
            })
            
            # --- RESOLUTION PHASE ---
            
            final_damage = calculate_impact(damage, mitigation)
            
            # Broadcast the IMPACT EVENT
            await manager.broadcast({
                "type": "IMPACT",
                "damage_taken": final_damage,
                "server_health_reduction": final_damage,
                "defense_desc": defense_desc,
                "mitigation_score": mitigation  # Added for MITM animation logic
            })
            
            await manager.broadcast({"type": "STATE_UPDATE", "agent": "BLUE_COMMANDER", "status": "IDLE"})

    except WebSocketDisconnect:
        manager.disconnect(websocket)
