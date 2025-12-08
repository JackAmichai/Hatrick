import os
import random

# NOTE: langchain imports are done lazily inside get_llm() to avoid crashing
# the module if a package is missing. This allows DummyChain fallback to work.

# --- ROBUST MOCK DATA ---
MOCK_FILE = {
    "red_scanner": [
        "Scanning target dependencies... found outdated OpenSSL version.",
        "Probing port 443... detected weak cipher suites in handshake.",
        "Analyzing HTTP headers... missing X-Frame-Options and CSP.",
        "Traceroute complete. Identified latency spikes in sub-net 10.0.x.",
        "Enumerating public API endpoints... discovered undocumented /admin route."
    ],
    "red_weaponizer": [
        "Compiling Heartbleed exploit package for injected payload.",
        "Drafting SQL injection query with UNION SELECT sleep(5).",
        "Preparing Cross-Site Scripting (XSS) vector via base64 encoding.",
        "Configuring packet flood with randomized source IPs.",
        "Generating brute-force dictionary for default credentials."
    ],
    "red_commander": [
        {"attack_name": "Heartbleed Exfiltration", "damage": 85, "visual_desc": "Memory Leak Stream"},
        {"attack_name": "Blind SQL Injection", "damage": 70, "visual_desc": "Database Query Drop"},
        {"attack_name": "ICMP Flood", "damage": 40, "visual_desc": "Traffic Spike"},
        {"attack_name": "Admin Bypass", "damage": 90, "visual_desc": "Privilege Escalation"},
        {"attack_name": "DOM-Based XSS", "damage": 55, "visual_desc": "Script Execution"}
    ],
    "blue_scanner": [
        "IDS alert! Signature match for CVE-2014-0160.",
        "Traffic anomally detected. Request volume exceeds baseline by 400%.",
        "Log analysis reveals repeated syntax errors in database queries.",
        "Unauthorized session token usage detected on admin port.",
        "Heuristic scanner flagged obfuscated JavaScript payload."
    ],
    "blue_weaponizer": [
        "Recommending immediate patch application and service restart.",
        "Proposing IP ban for offending subnet and rate limiting.",
        "Suggesting WAF rule update to block SQL control characters.",
        "Advising session invalidation and forced password reset.",
        "Input sanitization fliter deployment recommended."
    ],
    "blue_commander": [
        {"defense_name": "Hotfix Deployment", "mitigation_score": 90, "visual_desc": "Patching Binary"},
        {"defense_name": "IP Blacklist", "mitigation_score": 60, "visual_desc": "Firewall Block"},
        {"defense_name": "WAF Rule ID-104", "mitigation_score": 80, "visual_desc": "Filter Active"},
        {"defense_name": "Session Killswitch", "mitigation_score": 95, "visual_desc": "Access Revoked"},
        {"defense_name": "Input Scrubber", "mitigation_score": 75, "visual_desc": "Sanitization Layer"}
    ]
}

class DummyChain:
    def __init__(self, role, json_mode=False):
        self.role = role
        self.json_mode = json_mode
    
    def invoke(self, input_data):
        # Add slight randomness to pick a distinct response each time
        options = MOCK_FILE.get(self.role, ["System Processing..."])
        selected = random.choice(options)
        
        # If we need to return JSON, ensure it's a dict
        if self.json_mode:
            if isinstance(selected, dict):
                return selected
            # Fallback if list has strings but we need dict (shouldnt happen with correct MOCK_FILE)
            return {"action": "Standard Operation", "value": 50, "visual_desc": "Processing"}
            
        # If we need text but got dict (rare)
        if isinstance(selected, dict):
            return str(selected)
            
        return selected

class DummyLLM:
    """Pass-through for when we simply must have an object"""
    def invoke(self, *args, **kwargs):
        return "Mock LLM Response"

# --- LLM FACTORY WITH FALLBACK ---
def get_llm(provider, model_name, temperature=0.7):
    try:
        if provider == "openai":
            if not os.getenv("OPENAI_API_KEY"): raise ValueError("Missing OpenAI Key")
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(temperature=temperature, model_name=model_name)
        
        elif provider == "huggingface":
            if not os.getenv("HUGGINGFACEHUB_API_TOKEN"): raise ValueError("Missing HF Token")
            from langchain_huggingface import HuggingFaceEndpoint
            return HuggingFaceEndpoint(repo_id=model_name, temperature=temperature, task="text-generation")
        
        elif provider == "groq":
            if not os.getenv("GROQ_API_KEY"): raise ValueError("Missing Groq Key")
            from langchain_groq import ChatGroq
            return ChatGroq(temperature=temperature, model_name=model_name)

    except Exception as e:
        print(f"⚠️ {provider} Init Failed: {e}")
    
    # Return None to signal we should use DummyChain directly later
    return None 

# --- AGENT CHAINS ---

# We define them loosely. If LLM is None, we assign a DummyChain.
# If LLM is valid, we build the real chain.

def create_chain(llm, system_prompt, json_parser=False):
    if llm is None:
        # Determine likely role from prompt content for mock fallback
        role = "red_scanner" # Default
        if "Scope" in system_prompt: role = "red_scanner"
        elif "Zero" in system_prompt: role = "red_weaponizer"
        elif "Viper" in system_prompt: role = "red_commander"
        elif "Sentinel" in system_prompt: role = "blue_scanner"
        elif "Patch" in system_prompt: role = "blue_weaponizer"
        elif "Captain" in system_prompt: role = "blue_commander"
        
        return DummyChain(role, json_mode=json_parser)
        
    # Real Chain Construction - import here to avoid top-level dependency issues
    try:
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}") 
        ])
        
        chain = prompt | llm
        if json_parser:
            return chain | JsonOutputParser()
        return chain | StrOutputParser()
    except Exception as e:
        print(f"⚠️ Chain construction failed: {e}. Using DummyChain.")
        role = "red_scanner"
        if "Viper" in system_prompt or "Captain" in system_prompt:
            role = "red_commander" if "Viper" in system_prompt else "blue_commander"
        return DummyChain(role, json_mode=json_parser)

# Initialize LLMs with diverse models via HuggingFace Inference API
# HuggingFace models - these use the free Inference API (300 req/hour)
# Groq is used as a reliable backup for faster responses

# RED TEAM - Attack-oriented models
red_scanner_llm = get_llm("huggingface", "mistralai/Mistral-7B-Instruct-v0.3", 0.5)  # Scanner: Precise, analytical
red_weaponizer_llm = get_llm("huggingface", "google/gemma-1.1-7b-it", 0.8)  # Weaponizer: Creative attacks
red_commander_llm = get_llm("groq", "llama-3.1-70b-versatile", 0.6)  # Commander: Strategic decisions

# BLUE TEAM - Defense-oriented models  
blue_scanner_llm = get_llm("huggingface", "meta-llama/Llama-3.2-3B-Instruct", 0.5)  # Watchman: Quick threat detection
blue_weaponizer_llm = get_llm("huggingface", "HuggingFaceH4/zephyr-7b-beta", 0.7)  # Engineer: Defense proposals
blue_commander_llm = get_llm("groq", "llama-3.1-8b-instant", 0.5)  # Warden: Fast tactical decisions

# Create Chains with detailed prompts for realistic simulation
scanner_chain = create_chain(red_scanner_llm, 
    "You are 'Scope', a network reconnaissance agent. Analyze the target and report vulnerabilities in 1-2 sentences. Be technical and specific.")

weaponizer_chain = create_chain(red_weaponizer_llm, 
    "You are 'Zero', an exploit developer. Based on the scan results, propose a specific attack vector in 1-2 sentences. Name real attack techniques.")

commander_chain = create_chain(red_commander_llm, 
    "You are 'Viper', the Red Team commander. Choose the final attack. Return ONLY valid JSON: {\"attack_name\": \"string\", \"damage\": number 1-100, \"visual_desc\": \"short effect description\"}", 
    json_parser=True)

watchman_chain = create_chain(blue_scanner_llm, 
    "You are 'Sentinel', a threat analyst. Analyze the incoming attack and identify its signature in 1-2 sentences. Be specific about the threat type.")

engineer_chain = create_chain(blue_weaponizer_llm, 
    "You are 'Patch', a security engineer. Propose a specific countermeasure or defense in 1-2 sentences. Name real defense techniques.")

warden_chain = create_chain(blue_commander_llm, 
    "You are 'Captain', the Blue Team commander. Choose the final defense. Return ONLY valid JSON: {\"defense_name\": \"string\", \"mitigation_score\": number 1-100, \"visual_desc\": \"short effect description\"}", 
    json_parser=True)
