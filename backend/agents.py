import os
import random
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEndpoint
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser

# --- SAFE FALLBACK (NO DEPENDENCIES) ---
class DummyLLM:
    """A vanilla Python Mock LLM that requires NO external libraries."""
    def __init__(self, responses=None):
        self.responses = responses or ["System OK", "No threats detected"]
    
    def invoke(self, input_data):
        # Simulate LangChain invoke
        return random.choice(self.responses)

    def __or__(self, other):
        # Allow pipe chaining (chain = prompt | llm | parser)
        # We just return self because we want to short-circuit the parser too if possible,
        # OR we simulate the chain behavior.
        # Ideally, we return a DummyChain.
        return DummyChain(self.responses)

class DummyChain:
    def __init__(self, responses):
        self.responses = responses
    
    def invoke(self, input_data):
        val = random.choice(self.responses)
        # If the parser expects JSON, we should try to give mock JSON if needed.
        # But for safety, we return a string or simple dict.
        # If the downstream expects specific keys, we might break.
        # Let's try to be smart.
        if "options" in str(input_data): # Heuristic for Commander
            return {"attack_name": "Mock Attack", "damage": 10, "visual_desc": "Simulated Packet Storm"}
        return val

# --- LLM FACTORY WITH FALLBACK ---
def get_llm(provider, model_name, temperature=0.7):
    """
    Factory to get LLM from various providers.
    """
    try:
        # 1. OPENAI (GPT-4)
        if provider == "openai":
            if not os.getenv("OPENAI_API_KEY"):
                raise ValueError("Missing OpenAI Key")
            from langchain_openai import ChatOpenAI
            print(f"✅ LOADED: OpenAI ({model_name})")
            return ChatOpenAI(temperature=temperature, model_name=model_name)
        
        # 2. HUGGING FACE
        elif provider == "huggingface":
            if not os.getenv("HUGGINGFACEHUB_API_TOKEN"):
                raise ValueError("Missing Hugging Face Token")
            return HuggingFaceEndpoint(repo_id=model_name, temperature=temperature, task="text-generation")
        
        # 3. ANTHROPIC
        elif provider == "anthropic":
            if not os.getenv("ANTHROPIC_API_KEY"):
                raise ValueError("Missing Anthropic Key")
            from langchain_anthropic import ChatAnthropic
            return ChatAnthropic(temperature=temperature, model_name=model_name)

    except Exception as e:
        print(f"⚠️ FALLBACK: {provider} failed ({str(e)}). Checking replacements...")
    
    # FALLBACK SEQUENCE
    
    # 1. Groq
    try:
        if os.getenv("GROQ_API_KEY"):
            fallback_model = "llama-3.3-70b-versatile" if temperature < 0.6 else "llama-3.1-8b-instant"
            return ChatGroq(temperature=temperature, model_name=fallback_model)
    except:
        pass

    # 2. Mock (Safe)
    print("⚠️ CRITICAL: Using Vanilla Mock LLM.")
    return DummyLLM()

# --- MODEL ROSTER ---

red_commander_llm = get_llm("openai", "gpt-4-turbo", temperature=0.6)
red_weaponizer_llm = get_llm("huggingface", "mistralai/Mistral-7B-Instruct-v0.2", temperature=0.8)
red_scanner_llm = get_llm("huggingface", "google/gemma-7b-it", temperature=0.5)

blue_commander_llm = get_llm("huggingface", "microsoft/Phi-3-mini-4k-instruct", temperature=0.5)
blue_weaponizer_llm = get_llm("huggingface", "HuggingFaceH4/zephyr-7b-beta", temperature=0.7)
blue_scanner_llm = get_llm("groq", "llama-3.1-8b-instant", temperature=0.5)

# --- AGENT CHAINS ---

# We need to wrap construction in try/except because | operator might fail if LLM is Dummy
try:
    scanner_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are 'Scope'. Output a 1-sentence observation."),
        ("human", "{layer_info}")
    ])
    scanner_chain = scanner_prompt | red_scanner_llm | StrOutputParser()

    weaponizer_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are 'Zero'. Propose attack."),
        ("human", "{scan_result}")
    ])
    weaponizer_chain = weaponizer_prompt | red_weaponizer_llm | StrOutputParser()

    commander_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are 'Viper'. Return JSON."),
        ("human", "{options}")
    ])
    commander_chain = commander_prompt | red_commander_llm | JsonOutputParser()

    watchman_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are 'Sentinel'. Analyze attack."),
        ("human", "{attack_info}")
    ])
    watchman_chain = watchman_prompt | blue_scanner_llm | StrOutputParser()

    engineer_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are 'Patch'. Propose defense."),
        ("human", "{analysis}")
    ])
    engineer_chain = engineer_prompt | blue_weaponizer_llm | StrOutputParser()

    warden_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are 'Captain'. Return JSON."),
        ("human", "{options}")
    ])
    warden_chain = warden_prompt | blue_commander_llm | JsonOutputParser()

except Exception as e:
    print(f"⚠️ Chain Construction Failed: {e}. Using Dummy Chains.")
    # Total Fallback if LangChain piping dies
    scanner_chain = DummyChain(["Scan Complete"])
    weaponizer_chain = DummyChain(["Attack Vector: SQLi"])
    commander_chain = DummyChain([{"attack_name": "Mock Strike", "damage": 50, "visual_desc": "Red Laser"}])
    watchman_chain = DummyChain(["Analysis: Malicious Packet"])
    engineer_chain = DummyChain(["Defense: Firewall"])
    warden_chain = DummyChain([{"defense_name": "Mock Shield", "mitigation_score": 50, "visual_desc": "Blue Forcefield"}])
