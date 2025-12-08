import os
import random
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEndpoint
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser

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
            return HuggingFaceEndpoint(repo_id=model_name, temperature=temperature, task="text-generation")
        
        elif provider == "groq":
             if not os.getenv("GROQ_API_KEY"): raise ValueError("Missing Groq Key")
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
        
    # Real Chain Construction
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}") 
    ])
    
    chain = prompt | llm
    if json_parser:
        return chain | JsonOutputParser()
    return chain | StrOutputParser()

# Initialize LLMs (may return None)
red_scanner_llm = get_llm("huggingface", "google/gemma-7b-it", 0.5)
red_weaponizer_llm = get_llm("huggingface", "mistralai/Mistral-7B-Instruct-v0.2", 0.8)
red_commander_llm = get_llm("openai", "gpt-4-turbo", 0.6)

blue_scanner_llm = get_llm("groq", "llama-3.1-8b-instant", 0.5)
blue_weaponizer_llm = get_llm("huggingface", "HuggingFaceH4/zephyr-7b-beta", 0.7)
blue_commander_llm = get_llm("huggingface", "microsoft/Phi-3-mini-4k-instruct", 0.5)

# Create Chains
scanner_chain = create_chain(red_scanner_llm, "You are 'Scope'. Output a 1-sentence observation.")
weaponizer_chain = create_chain(red_weaponizer_llm, "You are 'Zero'. Propose attack.")
commander_chain = create_chain(red_commander_llm, "You are 'Viper'. Return JSON.", json_parser=True)

watchman_chain = create_chain(blue_scanner_llm, "You are 'Sentinel'. Analyze attack.")
engineer_chain = create_chain(blue_weaponizer_llm, "You are 'Patch'. Propose defense.")
warden_chain = create_chain(blue_commander_llm, "You are 'Captain'. Return JSON.", json_parser=True)
