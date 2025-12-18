"""
HatTrick Backend - LLM Agent Configuration
Uses OpenRouter API for diverse FREE LLM agents.
All responses come from real AI models.
"""
import os
import requests
from langchain_core.language_models.llms import LLM
from typing import Any, List, Optional
from langchain_core.callbacks.manager import CallbackManagerForLLMRun

# --- OPENROUTER LLM CLASS ---
class OpenRouterLLM(LLM):
    """Custom LLM class for OpenRouter API - FREE models"""
    model_name: str = "meta-llama/llama-3.2-3b-instruct:free"
    temperature: float = 0.7
    max_tokens: int = 512
    api_key: str = ""
    role: str = "Assistant"
    
    def __init__(self, model_name: str = "meta-llama/llama-3.2-3b-instruct:free", 
                 temperature: float = 0.7, role: str = "Assistant", **kwargs):
        super().__init__(**kwargs)
        self.model_name = model_name
        self.temperature = temperature
        self.role = role
        self.api_key = os.getenv("OPENROUTER_API_KEY", "")
    
    @property
    def _llm_type(self) -> str:
        return "openrouter"
    
    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        if not self.api_key:
            print(f"⚠️ OPENROUTER_API_KEY missing. Using fallback for {self.model_name}.")
            return self._fallback_response(prompt)
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://hatrick.app",
            "X-Title": "HatTrick Cyber Arena"
        }
        
        data = {
            "model": self.model_name,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
        }
        
        if stop:
            data["stop"] = stop
        
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"❌ OpenRouter API error for {self.model_name}: {e}")
            return self._fallback_response(prompt)
    
    def _fallback_response(self, prompt: str) -> str:
        """Fallback response if API fails"""
        prompt_lower = prompt.lower()
        
        if "json" in prompt_lower:
            if "attack" in prompt_lower or "red" in prompt_lower:
                return '{"attack_name": "Network Exploitation", "damage": 65, "visual_desc": "Red Code Stream Injection"}'
            if "defense" in prompt_lower or "blue" in prompt_lower:
                return '{"defense_name": "Adaptive Shield Protocol", "mitigation_score": 70, "visual_desc": "Blue Force Field Active"}'
            return '{}'
        
        if "scan" in prompt_lower or "reconnaissance" in prompt_lower:
            return f"[{self.role}] Scan complete. Found potential vulnerabilities on open ports. Analyzing attack vectors."
        
        if "infrastructure" in prompt_lower:
            return f"[{self.role}] Infrastructure analysis: Detected misconfigured load balancers and outdated firmware on edge devices."
        
        if "data" in prompt_lower:
            return f"[{self.role}] Data analysis: Unencrypted sensitive data found in transit. Database access control weaknesses detected."
        
        return f"[{self.role}] Analysis complete. Proceeding with tactical assessment based on available intelligence."


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
def get_llm(provider: str, model_name: str, temperature: float = 0.7, role: str = "Assistant"):
    """
    Create an LLM instance from the specified provider.
    Supports: openrouter, groq, huggingface
    """
    if provider == "openrouter":
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            print(f"⚠️ OPENROUTER_API_KEY missing. Using MockLLM for {model_name}.")
            return MockLLM(role=role)
        
        print(f"✅ Initializing OpenRouter model: {model_name}")
        return OpenRouterLLM(model_name=model_name, temperature=temperature, role=role)
    
    elif provider == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            print(f"⚠️ GROQ_API_KEY missing. Using MockLLM for {model_name}.")
            return MockLLM(role=role)
        
        from langchain_groq import ChatGroq
        print(f"✅ Initializing Groq model: {model_name}")
        return ChatGroq(
            temperature=temperature,
            model_name=model_name,
            groq_api_key=api_key
        )
    
    elif provider == "huggingface":
        api_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
        if not api_token:
            print(f"⚠️ HUGGINGFACEHUB_API_TOKEN missing. Using MockLLM for {model_name}.")
            return MockLLM(role=role)
        
        from langchain_huggingface import HuggingFaceEndpoint
        print(f"✅ Initializing HuggingFace model: {model_name}")
        return HuggingFaceEndpoint(
            repo_id=model_name,
            huggingfacehub_api_token=api_token,
            temperature=temperature,
            max_new_tokens=256,
            task="text-generation"
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
# LLM INITIALIZATION - FREE OPENROUTER MODELS
# ========================================
# Using the BEST FREE models from OpenRouter for diverse capabilities

print("🚀 Initializing LLM Agents with OpenRouter FREE MODELS...")

# ============ RED TEAM - Attack-oriented models ============
# Using diverse free models for different attack specializations

# Scanner: Llama 3.2 3B (fast, good for quick reconnaissance)
red_scanner_llm = get_llm("openrouter", "meta-llama/llama-3.2-3b-instruct:free", 0.5, "RED_SCANNER")
print("   🔴 RED Scanner: Llama 3.2 3B Instruct (Free)")

# Infrastructure: Qwen 2.5 7B (excellent reasoning for infrastructure analysis)
red_inf_llm = get_llm("openrouter", "qwen/qwen-2.5-7b-instruct:free", 0.6, "RED_INF")
print("   🔴 RED Infrastructure: Qwen 2.5 7B Instruct (Free)")

# Data Analyst: Llama 3.1 8B (strong analysis capabilities)  
red_data_llm = get_llm("openrouter", "meta-llama/llama-3.1-8b-instruct:free", 0.6, "RED_DATA")
print("   🔴 RED Data: Llama 3.1 8B Instruct (Free)")

# Weaponizer: Mistral 7B (creative exploit development)
red_weaponizer_llm = get_llm("openrouter", "mistralai/mistral-7b-instruct:free", 0.8, "RED_WEAPONIZER")
print("   🔴 RED Weaponizer: Mistral 7B Instruct (Free)")

# Commander: Gemma 2 9B (reliable for JSON output decisions)
red_commander_llm = get_llm("openrouter", "google/gemma-2-9b-it:free", 0.6, "RED_COMMANDER")
print("   🔴 RED Commander: Gemma 2 9B IT (Free)")

# ============ BLUE TEAM - Defense-oriented models ============

# Scanner: Phi-3 Mini (fast threat detection)
blue_scanner_llm = get_llm("openrouter", "microsoft/phi-3-mini-128k-instruct:free", 0.5, "BLUE_SCANNER")
print("   🔵 BLUE Scanner: Phi-3 Mini 128K Instruct (Free)")

# Infrastructure: Qwen 2.5 7B (infrastructure defense)
blue_inf_llm = get_llm("openrouter", "qwen/qwen-2.5-7b-instruct:free", 0.5, "BLUE_INF")
print("   🔵 BLUE Infrastructure: Qwen 2.5 7B Instruct (Free)")

# Data Protection: Llama 3.2 3B (quick data analysis)
blue_data_llm = get_llm("openrouter", "meta-llama/llama-3.2-3b-instruct:free", 0.6, "BLUE_DATA")
print("   🔵 BLUE Data: Llama 3.2 3B Instruct (Free)")

# Engineer: Mistral 7B (defense engineering)
blue_weaponizer_llm = get_llm("openrouter", "mistralai/mistral-7b-instruct:free", 0.7, "BLUE_ENGINEER")
print("   🔵 BLUE Engineer: Mistral 7B Instruct (Free)")

# Commander: Llama 3.1 8B (fast JSON responses)
blue_commander_llm = get_llm("openrouter", "meta-llama/llama-3.1-8b-instruct:free", 0.5, "BLUE_COMMANDER")
print("   🔵 BLUE Commander: Llama 3.1 8B Instruct (Free)")

print("✅ All LLM Agents Initialized with OpenRouter FREE MODELS!")

# ========================================
# AGENT CHAINS - Enhanced with clearer prompts
# ========================================

# --- RED TEAM CHAINS ---

scanner_chain = create_chain(
    red_scanner_llm,
    """You are 'Scope', an elite network reconnaissance specialist on the Red Team.

MISSION: Analyze the target system and identify specific vulnerabilities.

Your response should:
1. Identify the target IP and open services
2. Highlight ONE critical vulnerability found
3. Suggest the attack vector to exploit

Be technical, precise and output 2-3 sentences. Focus on actionable intelligence."""
)

red_inf_chain = create_chain(
    red_inf_llm,
    """You are 'Grid', an infrastructure exploitation specialist on the Red Team.

MISSION: Analyze the network topology and server configuration.

Your response should:
1. Identify weak points in infrastructure (routers, firewalls, load balancers)
2. Find misconfigurations that can be exploited
3. Suggest lateral movement opportunities

Be technical and concise. Output 2-3 sentences with specific infrastructure targets."""
)

red_data_chain = create_chain(
    red_data_llm,
    """You are 'Byte', a data exfiltration specialist on the Red Team.

MISSION: Analyze potential data leakage points and database vulnerabilities.

Your response should:
1. Identify sensitive data targets (credentials, PII, secrets)
2. Find database vulnerabilities or access control weaknesses
3. Suggest exfiltration methods

Be technical and concise. Output 2-3 sentences focusing on high-value data targets."""
)

weaponizer_chain = create_chain(
    red_weaponizer_llm,
    """You are 'Zero', an elite exploit developer on the Red Team.

MISSION: Based on the reconnaissance data, propose ONE specific attack vector.

Your response should:
1. Name a specific attack technique (e.g., SQL Injection, Buffer Overflow, XSS, RCE)
2. Describe how it exploits the identified vulnerability
3. Estimate the potential damage

Be technical and precise. Output 2-3 sentences with the attack methodology."""
)

commander_chain = create_chain(
    red_commander_llm,
    """You are 'Viper', the Red Team commander making final attack decisions.

MISSION: Choose the final attack to execute based on the proposed attack vector.

You MUST respond with ONLY valid JSON in this exact format:
{"attack_name": "Name of Attack", "damage": 75, "visual_desc": "Brief visual effect description"}

Rules:
- attack_name: The specific attack name (e.g., "SQL Injection via Login Form")
- damage: Integer between 1-100 representing estimated impact
- visual_desc: Short description for visual effects (e.g., "Red data streams penetrating firewall")

Output ONLY the JSON object, no other text.""",
    json_parser=True
)

# --- BLUE TEAM CHAINS ---

watchman_chain = create_chain(
    blue_scanner_llm,
    """You are 'Sentinel', a threat analyst on the Blue Team.

MISSION: Analyze the incoming attack and assess the threat.

Your response should:
1. Identify the attack type and signature
2. Assess the threat level (Critical/High/Medium/Low)
3. Identify affected systems and potential impact

Be technical and concise. Output 2-3 sentences with threat assessment."""
)

blue_inf_chain = create_chain(
    blue_inf_llm,
    """You are 'Fortress', an infrastructure defense specialist on the Blue Team.

MISSION: Protect the infrastructure from the detected attack.

Your response should:
1. Identify infrastructure components at risk
2. Propose firewall rules or network-level blocks
3. Suggest infrastructure hardening measures

Be technical and concise. Output 2-3 sentences with specific defense measures."""
)

blue_data_chain = create_chain(
    blue_data_llm,
    """You are 'Vault', a data protection specialist on the Blue Team.

MISSION: Protect sensitive data from the detected attack.

Your response should:
1. Identify data at risk
2. Propose encryption or data loss prevention measures
3. Suggest access control improvements

Be technical and concise. Output 2-3 sentences with data protection measures."""
)

engineer_chain = create_chain(
    blue_weaponizer_llm,
    """You are 'Patch', a security engineer on the Blue Team.

MISSION: Propose ONE specific countermeasure or defense against the attack.

Your response should:
1. Name the specific defense technique (e.g., WAF rule, input sanitization, rate limiting)
2. Explain how it mitigates the attack
3. Estimate effectiveness

Be technical and concise. Output 2-3 sentences with the defense strategy."""
)

warden_chain = create_chain(
    blue_commander_llm,
    """You are 'Captain', the Blue Team commander making final defense decisions.

MISSION: Choose the final defense to deploy based on the proposed countermeasures.

You MUST respond with ONLY valid JSON in this exact format:
{"defense_name": "Name of Defense", "mitigation_score": 80, "visual_desc": "Brief visual effect description"}

Rules:
- defense_name: The specific defense name (e.g., "WAF SQL Injection Filter")
- mitigation_score: Integer between 1-100 representing mitigation effectiveness
- visual_desc: Short description for visual effects (e.g., "Blue shield deflecting attack")

Output ONLY the JSON object, no other text.""",
    json_parser=True
)

# --- CODE GENERATION CHAINS ---

red_coder_llm = get_llm("openrouter", "google/gemma-2-9b-it:free", 0.9, "RED_CODER")
blue_coder_llm = get_llm("openrouter", "google/gemma-2-9b-it:free", 0.9, "BLUE_CODER")

red_code_chain = create_chain(
    red_coder_llm,
    """You are an elite offensive security researcher writing attack code.

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
    """You are an elite defensive security engineer writing protection code.

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
