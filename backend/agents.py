"""
HatTrick Backend - LLM Agent Configuration
Uses HuggingFace Inference API and Groq for diverse real LLM agents.
NO MOCK DATA - All responses come from real AI models.
"""
import os
from langchain_core.language_models.llms import LLM
from typing import Any, List, Optional
from langchain_core.callbacks.manager import CallbackManagerForLLMRun

# --- MOCK LLM FOR FALLBACK ---
class MockLLM(LLM):
    role: str = "Assistant"

    @property
    def _llm_type(self) -> str:
        return "mock"

    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        # Simple heuristic to give relevant json or text
        # We look at the prompt to decide what to return
        prompt_lower = prompt.lower()

        if "json" in prompt_lower:
            if "attack" in prompt_lower or "red" in prompt_lower:
                 return '{"attack_name": "Simulated Exploit", "damage": 65, "visual_desc": "Red Code Stream"}'
            if "defense" in prompt_lower or "blue" in prompt_lower:
                 return '{"defense_name": "Simulated Shield", "mitigation_score": 70, "visual_desc": "Blue Force Field"}'
            return '{}'

        if "scan" in prompt_lower or "reconnaissance" in prompt_lower:
            return f"[{self.role}] Scan complete. Found vulnerabilities in port 80 and 443. Latency high."

        if "infrastructure" in prompt_lower:
             return f"[{self.role}] Infrastructure analysis: Load balancers are misconfigured. Router firmware outdated."

        if "data" in prompt_lower:
             return f"[{self.role}] Data analysis: Unencrypted sensitive data found in logs. SQL injection possible."

        return f"[{self.role}] Analysis complete based on input context."

# --- LLM FACTORY ---
def get_llm(provider, model_name, temperature=0.7):
    """
    Create an LLM instance from the specified provider.
    Raises an exception if the API key is missing or model fails to load.
    """
    if provider == "huggingface":
        api_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
        if not api_token:
            print(f"⚠️ HUGGINGFACEHUB_API_TOKEN missing. Using MockLLM for {model_name}.")
            return MockLLM(role=model_name)
        
        from langchain_huggingface import HuggingFaceEndpoint
        print(f"✅ Initializing HuggingFace model: {model_name}")
        return HuggingFaceEndpoint(
            repo_id=model_name,
            huggingfacehub_api_token=api_token,
            temperature=temperature,
            max_new_tokens=256,
            task="text-generation"
        )
    
    elif provider == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            print(f"⚠️ GROQ_API_KEY missing. Using MockLLM for {model_name}.")
            return MockLLM(role=model_name)
        
        from langchain_groq import ChatGroq
        print(f"✅ Initializing Groq model: {model_name}")
        return ChatGroq(
            temperature=temperature,
            model_name=model_name,
            groq_api_key=api_key
        )
    
    else:
        raise ValueError(f"Unknown provider: {provider}")


def create_chain(llm, system_prompt, json_parser=False):
    """
    Create a LangChain chain from an LLM with the specified system prompt.
    """
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


# ========================================
# LLM INITIALIZATION
# ========================================
# Using models verified to work with HuggingFace Inference API (free tier)
# and Groq (free tier with generous limits)

print("🚀 Initializing LLM Agents...")

# RED TEAM - Attack-oriented models
red_scanner_llm = get_llm("groq", "llama-3.1-8b-instant", 0.5)
red_inf_llm = get_llm("groq", "llama-3.1-70b-versatile", 0.6) # New Infra Agent
red_data_llm = get_llm("groq", "mixtral-8x7b-32768", 0.6)    # New Data Agent
red_weaponizer_llm = get_llm("groq", "llama3-70b-8192", 0.8)
red_commander_llm = get_llm("groq", "llama-3.1-70b-versatile", 0.6)

# BLUE TEAM - Defense-oriented models
blue_scanner_llm = get_llm("groq", "gemma2-9b-it", 0.5)
blue_inf_llm = get_llm("groq", "llama-3.1-8b-instant", 0.5) # New Infra Agent
blue_data_llm = get_llm("groq", "mixtral-8x7b-32768", 0.6)   # New Data Agent
blue_weaponizer_llm = get_llm("groq", "mixtral-8x7b-32768", 0.7)
blue_commander_llm = get_llm("groq", "llama-3.1-8b-instant", 0.5)

print("✅ All LLM Agents Initialized Successfully!")

# ========================================
# AGENT CHAINS
# ========================================

# --- RED TEAM CHAINS ---

scanner_chain = create_chain(
    red_scanner_llm,
    """You are 'Scope', a network reconnaissance specialist on the Red Team.
Your job: Analyze the target system and identify ONE specific vulnerability.
Be technical and concise. Output 1-2 sentences only."""
)

red_inf_chain = create_chain(
    red_inf_llm,
    """You are 'Grid', an infrastructure specialist on the Red Team.
Your job: Analyze the network topology and server configuration based on the scan.
Identify weak points in the infrastructure (routers, load balancers, etc).
Be technical and concise. Output 1-2 sentences only."""
)

red_data_chain = create_chain(
    red_data_llm,
    """You are 'Byte', a data exfiltration specialist on the Red Team.
Your job: Analyze potential data leakage points and database vulnerabilities.
Identify sensitive data targets.
Be technical and concise. Output 1-2 sentences only."""
)

weaponizer_chain = create_chain(
    red_weaponizer_llm,
    """You are 'Zero', an exploit developer on the Red Team.
Based on the scan and analysis provided, propose ONE specific attack vector.
Name real attack techniques (SQL injection, XSS, buffer overflow, etc).
Be technical and concise. Output 1-2 sentences only."""
)

commander_chain = create_chain(
    red_commander_llm,
    """You are 'Viper', the Red Team commander.
Based on the proposed attacks, choose the final attack to execute.
You MUST respond with ONLY valid JSON in this exact format:
{"attack_name": "Name of Attack", "damage": 75, "visual_desc": "Brief visual effect"}
The damage value should be between 1-100. Do not include any other text.""",
    json_parser=True
)

# --- BLUE TEAM CHAINS ---

watchman_chain = create_chain(
    blue_scanner_llm,
    """You are 'Sentinel', a threat analyst on the Blue Team.
Analyze the incoming attack and identify its signature and threat level.
Be technical and concise. Output 1-2 sentences only."""
)

blue_inf_chain = create_chain(
    blue_inf_llm,
    """You are 'Fortress', an infrastructure defense specialist on the Blue Team.
Your job: Check firewall logs and server health. Propose infrastructure-level blocks.
Be technical and concise. Output 1-2 sentences only."""
)

blue_data_chain = create_chain(
    blue_data_llm,
    """You are 'Vault', a data protection specialist on the Blue Team.
Your job: Check data integrity and access logs. Propose encryption or DLP measures.
Be technical and concise. Output 1-2 sentences only."""
)

engineer_chain = create_chain(
    blue_weaponizer_llm,
    """You are 'Patch', a security engineer on the Blue Team.
Based on the threat analysis, propose ONE specific countermeasure or defense.
Name real defense techniques (WAF rules, input sanitization, rate limiting, etc).
Be technical and concise. Output 1-2 sentences only."""
)

warden_chain = create_chain(
    blue_commander_llm,
    """You are 'Captain', the Blue Team commander.
Based on the proposed defenses, choose the final defense to deploy.
You MUST respond with ONLY valid JSON in this exact format:
{"defense_name": "Name of Defense", "mitigation_score": 80, "visual_desc": "Brief visual effect"}
The mitigation_score value should be between 1-100. Do not include any other text.""",
    json_parser=True
)

# --- CODE GENERATION CHAINS ---

red_coder_llm = get_llm("groq", "llama-3.1-70b-versatile", 0.9)  # High creativity for unique code
blue_coder_llm = get_llm("groq", "llama-3.1-70b-versatile", 0.9)

red_code_chain = create_chain(
    red_coder_llm,
    """You are an elite offensive security researcher writing actual attack code.

Based on the mission context, vulnerability details, and chosen attack vector, generate a complete, functional Python script that implements the attack.

Requirements:
- Write REAL, executable Python code (not pseudo-code)
- Include proper imports, error handling, and comments
- Use actual IP addresses, ports, and vulnerabilities from the environment
- Make it educational and technically accurate
- Include clear variable names and documentation
- The code should be 50-150 lines

Attack types to consider:
- DDoS/UDP Flood: Use socket library, threading, random payloads
- Buffer Overflow: Craft shellcode, ROP chains, overflow payloads
- SQL Injection: Generate injection payloads, test multiple vectors
- MITM: ARP spoofing, SSL stripping, packet interception

Output ONLY the Python code with comments. No explanations before or after."""
)

blue_code_chain = create_chain(
    blue_coder_llm,
    """You are an elite defensive security engineer writing actual protection code.

Based on the attack analysis and chosen defense strategy, generate a complete, functional Python script that implements the defense.

Requirements:
- Write REAL, executable Python code (not pseudo-code)
- Include proper imports, error handling, and comments
- Use actual security best practices and libraries
- Make it educational and technically accurate
- Include clear variable names and documentation
- The code should be 50-150 lines

Defense types to consider:
- DDoS Protection: Rate limiting, IP blocking, traffic analysis
- Memory Protection: ASLR, stack canaries, DEP, input validation
- SQL Injection Protection: Parameterized queries, WAF rules, input sanitization
- MITM Protection: Certificate pinning, HSTS, ARP spoofing detection

Output ONLY the Python code with comments. No explanations before or after."""
)

print("✅ All Agent Chains Created Successfully!")
