"""
HatTrick Backend - LLM Agent Configuration
Uses HuggingFace Inference API and Groq for diverse real LLM agents.
NO MOCK DATA - All responses come from real AI models.
"""
import os

# --- LLM FACTORY ---
def get_llm(provider, model_name, temperature=0.7):
    """
    Create an LLM instance from the specified provider.
    Raises an exception if the API key is missing or model fails to load.
    """
    if provider == "huggingface":
        api_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
        if not api_token:
            raise ValueError("HUGGINGFACEHUB_API_TOKEN environment variable is not set")
        
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
            raise ValueError("GROQ_API_KEY environment variable is not set")
        
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
red_weaponizer_llm = get_llm("groq", "llama3-70b-8192", 0.8)
red_commander_llm = get_llm("groq", "llama-3.1-70b-versatile", 0.6)

# BLUE TEAM - Defense-oriented models
blue_scanner_llm = get_llm("groq", "gemma2-9b-it", 0.5)
blue_weaponizer_llm = get_llm("groq", "mixtral-8x7b-32768", 0.7)
blue_commander_llm = get_llm("groq", "llama-3.1-8b-instant", 0.5)

print("✅ All LLM Agents Initialized Successfully!")

# ========================================
# AGENT CHAINS
# ========================================

scanner_chain = create_chain(
    red_scanner_llm,
    """You are 'Scope', a network reconnaissance specialist on the Red Team.
Your job: Analyze the target system and identify ONE specific vulnerability.
Be technical and concise. Output 1-2 sentences only."""
)

weaponizer_chain = create_chain(
    red_weaponizer_llm,
    """You are 'Zero', an exploit developer on the Red Team.
Based on the scan results provided, propose ONE specific attack vector.
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

watchman_chain = create_chain(
    blue_scanner_llm,
    """You are 'Sentinel', a threat analyst on the Blue Team.
Analyze the incoming attack and identify its signature and threat level.
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

print("✅ All Agent Chains Created Successfully!")
