import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser

# 1. Initialize the Models
# We use Llama-3-8b for the fast "subordinate" agents
fast_llm = ChatGroq(temperature=0.7, model_name="llama-3.1-8b-instant")
# We use Llama-3-70b for the smart "commander" agents
smart_llm = ChatGroq(temperature=0.5, model_name="llama-3.3-70b-versatile")

# --- RED TEAM PROMPTS ---

# Agent 1: The Scanner (Recon)
scanner_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are 'Scope', a Red Team Recon Agent. Your style is robotic and precise."),
    ("human", "Current Target: {layer_info}. Scan for vulnerabilities. Output a 1-sentence technical observation.")
])
scanner_chain = scanner_prompt | fast_llm | StrOutputParser()

# Agent 2: The Weaponizer (Dev)
weaponizer_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are 'Zero', a chaotic Red Team Exploit Dev. Use hacker slang."),
    ("human", "Vulnerability found: {scan_result}. Propose TWO specific attack vectors (e.g. 'DDOS' or 'Injection'). Keep it under 20 words.")
])
weaponizer_chain = weaponizer_prompt | fast_llm | StrOutputParser()

# Agent 3: The Commander (Leader)
commander_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are 'Viper', the Red Team Commander. You are decisive."),
    ("human", "Options: {options}. Select the best attack. Return ONLY a JSON object: {{ 'attack_name': '...', 'damage': 80, 'visual_desc': '...' }}")
])
commander_chain = commander_prompt | smart_llm | JsonOutputParser()

# --- BLUE TEAM PROMPTS (DEFENDERS) ---

# Agent 1: The Watchman (Analyst)
# Input: The specific attack name and description from Red Team
watchman_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are 'Sentinel', the Blue Team Analyst. You are calm and observant."),
    ("human", "INCOMING ATTACK: {attack_info}. Analyze the mechanism. Is it Volumetric, Protocol, or Application layer? One sentence.")
])
watchman_chain = watchman_prompt | fast_llm | StrOutputParser()

# Agent 2: The Engineer (Fixer)
# Input: The analysis from Watchman
engineer_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are 'Patch', the Blue Team Engineer. You are quick and technical."),
    ("human", "Analysis: {analysis}. Propose TWO technical countermeasures (e.g., 'Rate Limiting', 'Blackhole Routing', 'WAF Rule').")
])
engineer_chain = engineer_prompt | fast_llm | StrOutputParser()

# Agent 3: The Warden (Leader)
# Input: Options from Engineer
warden_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are 'Captain', the Blue Team Commander. You are decisive."),
    ("human", "Countermeasures: {options}. Select the best one. Return ONLY a JSON object with DOUBLE QUOTES: {{ \"defense_name\": \"...\", \"mitigation_score\": 70, \"visual_desc\": \"Blue hexagonal forcefield\" }}")
])
warden_chain = warden_prompt | smart_llm | JsonOutputParser()
