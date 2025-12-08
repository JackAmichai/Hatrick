import os
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEndpoint
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser

# --- LLM FACTORY WITH FALLBACK ---
def get_llm(provider, model_name, temperature=0.7):
    """
    Factory to get LLM from various providers (OpenAI, HuggingFace, Groq).
    Falls back to Groq (Llama-3) if keys are missing.
    """
    try:
        # 1. OPENAI (GPT-4)
        if provider == "openai":
            if not os.getenv("OPENAI_API_KEY"):
                raise ValueError("Missing OpenAI Key")
            from langchain_openai import ChatOpenAI
            print(f"✅ LOADED: OpenAI ({model_name})")
            return ChatOpenAI(temperature=temperature, model_name=model_name)
        
        # 2. HUGGING FACE (Mistral, Gemma, Phi-3, etc.)
        elif provider == "huggingface":
            if not os.getenv("HUGGINGFACEHUB_API_TOKEN"):
                raise ValueError("Missing Hugging Face Token")
            
            print(f"✅ LOADED: Hugging Face ({model_name})")
            # Using the Inference API (Free Tier compatible)
            return HuggingFaceEndpoint(
                repo_id=model_name, 
                temperature=temperature,
                task="text-generation",
                # max_new_tokens included by default in endpoint class usually, 
                # but good to be explicit if needed. 
                # Note: Newer langchain_huggingface handles this well.
            )
        
        # 3. ANTHROPIC (Claude) - Kept for reference but priority is HF now
        elif provider == "anthropic":
            if not os.getenv("ANTHROPIC_API_KEY"):
                raise ValueError("Missing Anthropic Key")
            from langchain_anthropic import ChatAnthropic
            print(f"✅ LOADED: Anthropic ({model_name})")
            return ChatAnthropic(temperature=temperature, model_name=model_name)

    except Exception as e:
        print(f"⚠️ FALLBACK: {provider} failed ({str(e)}). Using Groq (Llama-3).")
    
    # FALLBACK TO GROQ
    fallback_model = "llama-3.3-70b-versatile" if temperature < 0.6 else "llama-3.1-8b-instant"
    return ChatGroq(temperature=temperature, model_name=fallback_model)

# --- MODEL ROSTER ---

# 1. RED COMMANDER -> OpenAI GPT-4
red_commander_llm = get_llm("openai", "gpt-4-turbo", temperature=0.6)

# 2. RED WEAPONIZER -> Mistral 7B (Hugging Face)
# Repo: mistralai/Mistral-7B-Instruct-v0.2
red_weaponizer_llm = get_llm("huggingface", "mistralai/Mistral-7B-Instruct-v0.2", temperature=0.8)

# 3. RED SCANNER -> Gemma 7B (Hugging Face / Google)
# Repo: google/gemma-7b-it
red_scanner_llm = get_llm("huggingface", "google/gemma-7b-it", temperature=0.5)


# 4. BLUE COMMANDER -> Phi-3 Mini (Hugging Face / Microsoft)
# Repo: microsoft/Phi-3-mini-4k-instruct
blue_commander_llm = get_llm("huggingface", "microsoft/Phi-3-mini-4k-instruct", temperature=0.5)

# 5. BLUE WEAPONIZER -> Falcon 7B or similar? Let's use Llama-3-8B via Hugging Face or fallback to Groq.
# Let's try to use another HF model for diversity: databricks/dolly-v2-3b (Fast/Free) or similar.
# Actually, let's stick to reliable ones. usage of meta-llama/Meta-Llama-3-8B-Instruct on HF might need gate access.
# Let's use `HuggingFaceH4/zephyr-7b-beta` (Very good open model).
blue_weaponizer_llm = get_llm("huggingface", "HuggingFaceH4/zephyr-7b-beta", temperature=0.7)

# 6. BLUE SCANNER -> Use Groq (Speed) or another HF model. 
# Let's use Groq Llama-3-8b for the high-speed scanner role (Simulated "Watchman").
blue_scanner_llm = get_llm("groq", "llama-3.1-8b-instant", temperature=0.5)


# --- AGENT CHAINS ---

# RED SCANNER (Gemma)
scanner_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are 'Scope', a Red Team Recon Agent. Your style is robotic and precise."),
    ("human", "Current Target: {layer_info}. Scan for vulnerabilities. Output a 1-sentence technical observation.")
])
scanner_chain = scanner_prompt | red_scanner_llm | StrOutputParser()

# RED WEAPONIZER (Mistral)
weaponizer_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are 'Zero', a chaotic Red Team Exploit Dev. Use hacker slang."),
    ("human", "Vulnerability found: {scan_result}. Propose TWO specific attack vectors (e.g. 'DDOS' or 'Injection'). Keep it under 20 words.")
])
weaponizer_chain = weaponizer_prompt | red_weaponizer_llm | StrOutputParser()

# RED COMMANDER (GPT-4)
commander_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are 'Viper', the Red Team Commander. You are decisive."),
    ("human", "Options: {options}. Select the best attack. Return ONLY a JSON object: {{ 'attack_name': '...', 'damage': 80, 'visual_desc': '...' }}")
])
commander_chain = commander_prompt | red_commander_llm | JsonOutputParser()


# BLUE WATCHMAN (Groq Llama-3 - Speed)
watchman_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are 'Sentinel', the Blue Team Analyst. You are calm and observant."),
    ("human", "INCOMING ATTACK: {attack_info}. Analyze the mechanism. Is it Volumetric, Protocol, or Application layer? One sentence.")
])
watchman_chain = watchman_prompt | blue_scanner_llm | StrOutputParser()

# BLUE ENGINEER (Zephyr)
engineer_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are 'Patch', the Blue Team Engineer. You are quick and technical."),
    ("human", "Analysis: {analysis}. Propose TWO technical countermeasures (e.g., 'Rate Limiting', 'Blackhole Routing', 'WAF Rule').")
])
engineer_chain = engineer_prompt | blue_weaponizer_llm | StrOutputParser()

# BLUE WARDEN (Phi-3)
warden_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are 'Captain', the Blue Team Commander. You are decisive."),
    ("human", "Countermeasures: {options}. Select the best one. Return ONLY a JSON object with DOUBLE QUOTES: {{ \"defense_name\": \"...\", \"mitigation_score\": 70, \"visual_desc\": \"Blue hexagonal forcefield\" }}")
])
# Note: Phi-3 is good but sometimes structured output is tricky. If fails, fallback to Groq inside the chain logic 
# (but for now we rely on the implementation).
warden_chain = warden_prompt | blue_commander_llm | JsonOutputParser()
