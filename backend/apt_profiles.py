"""
Adversary Emulation Profiles - APT Group Tactics, Techniques & Procedures
Implements MITRE ATT&CK framework patterns for real threat actor groups
"""

class APTProfile:
    """Base class for APT threat actor profiles"""
    
    def __init__(self, name: str, country: str, description: str, mitre_groups: list, active_since: str):
        self.name = name
        self.country = country
        self.description = description
        self.mitre_groups = mitre_groups
        self.active_since = active_since
        self.ttps = []
        self.indicators = []
        
    def get_attack_chain(self) -> dict:
        """Returns the complete attack chain for this APT"""
        return {
            "reconnaissance": self.get_reconnaissance_ttps(),
            "initial_access": self.get_initial_access_ttps(),
            "execution": self.get_execution_ttps(),
            "persistence": self.get_persistence_ttps(),
            "privilege_escalation": self.get_privilege_escalation_ttps(),
            "defense_evasion": self.get_defense_evasion_ttps(),
            "credential_access": self.get_credential_access_ttps(),
            "discovery": self.get_discovery_ttps(),
            "lateral_movement": self.get_lateral_movement_ttps(),
            "collection": self.get_collection_ttps(),
            "exfiltration": self.get_exfiltration_ttps(),
            "impact": self.get_impact_ttps()
        }
    
    # Override these in subclasses
    def get_reconnaissance_ttps(self) -> list:
        return []
    
    def get_initial_access_ttps(self) -> list:
        return []
    
    def get_execution_ttps(self) -> list:
        return []
    
    def get_persistence_ttps(self) -> list:
        return []
    
    def get_privilege_escalation_ttps(self) -> list:
        return []
    
    def get_defense_evasion_ttps(self) -> list:
        return []
    
    def get_credential_access_ttps(self) -> list:
        return []
    
    def get_discovery_ttps(self) -> list:
        return []
    
    def get_lateral_movement_ttps(self) -> list:
        return []
    
    def get_collection_ttps(self) -> list:
        return []
    
    def get_exfiltration_ttps(self) -> list:
        return []
    
    def get_impact_ttps(self) -> list:
        return []


class APT29Cozy Bear(APTProfile):
    """
    APT29 (Cozy Bear) - Russian intelligence-affiliated group
    Known for sophisticated phishing campaigns and stealth
    """
    
    def __init__(self):
        super().__init__(
            name="APT29 (Cozy Bear)",
            country="Russia",
            description="Sophisticated cyber espionage group linked to Russian intelligence (SVR). Known for long-term, stealthy operations targeting government and diplomatic entities.",
            mitre_groups=["G0016"],
            active_since="2008"
        )
    
    def get_initial_access_ttps(self) -> list:
        return [
            {
                "technique": "T1566.001",
                "name": "Phishing: Spearphishing Attachment",
                "description": "APT29 uses sophisticated spearphishing emails with malicious attachments",
                "example": "ZIP file containing LNK shortcuts that execute PowerShell"
            },
            {
                "technique": "T1566.002",
                "name": "Phishing: Spearphishing Link",
                "description": "Links to credential harvesting sites mimicking legitimate services",
                "example": "Fake Microsoft Office 365 login pages"
            },
            {
                "technique": "T1195.002",
                "name": "Supply Chain Compromise",
                "description": "Compromise of software supply chain (SolarWinds attack)",
                "example": "SUNBURST backdoor inserted into Orion software updates"
            }
        ]
    
    def get_execution_ttps(self) -> list:
        return [
            {
                "technique": "T1059.001",
                "name": "PowerShell",
                "description": "Heavy use of PowerShell for execution and C2",
                "example": "Cobalt Strike beacons executed via PowerShell"
            },
            {
                "technique": "T1059.003",
                "name": "Windows Command Shell",
                "description": "cmd.exe for basic system commands",
                "example": "Batch scripts for reconnaissance"
            },
            {
                "technique": "T1053.005",
                "name": "Scheduled Task",
                "description": "Scheduled tasks for persistence and execution",
                "example": "Tasks that run at user logon"
            }
        ]
    
    def get_persistence_ttps(self) -> list:
        return [
            {
                "technique": "T1547.001",
                "name": "Registry Run Keys",
                "description": "Modifies registry run keys for persistence",
                "example": "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"
            },
            {
                "technique": "T1543.003",
                "name": "Windows Service",
                "description": "Installs malicious Windows services",
                "example": "Services disguised as legitimate Windows components"
            }
        ]
    
    def get_defense_evasion_ttps(self) -> list:
        return [
            {
                "technique": "T1070.004",
                "name": "File Deletion",
                "description": "Deletes artifacts and logs to evade detection",
                "example": "Removes dropper files after execution"
            },
            {
                "technique": "T1027.002",
                "name": "Obfuscated Files or Information",
                "description": "Uses code obfuscation and encryption",
                "example": "Base64 encoded PowerShell commands"
            },
            {
                "technique": "T1036.005",
                "name": "Masquerading",
                "description": "Names malware to look like legitimate processes",
                "example": "svchоst.exe (Cyrillic 'о' instead of 'o')"
            }
        ]


class APT28FancyBear(APTProfile):
    """
    APT28 (Fancy Bear) - Russian military intelligence group
    Known for aggressive operations and destructive attacks
    """
    
    def __init__(self):
        super().__init__(
            name="APT28 (Fancy Bear)",
            country="Russia",
            description="Cyber espionage group linked to Russian military intelligence (GRU). Known for aggressive tactics, credential theft, and destructive attacks.",
            mitre_groups=["G0007"],
            active_since="2004"
        )
    
    def get_initial_access_ttps(self) -> list:
        return [
            {
                "technique": "T1566.001",
                "name": "Spearphishing",
                "description": "Targeted phishing with exploit documents",
                "example": "Microsoft Office documents with CVE-2017-0199 exploit"
            },
            {
                "technique": "T1190",
                "name": "Exploit Public-Facing Application",
                "description": "Exploits vulnerabilities in web applications",
                "example": "SQL injection attacks on government portals"
            }
        ]
    
    def get_credential_access_ttps(self) -> list:
        return [
            {
                "technique": "T1003.001",
                "name": "OS Credential Dumping: LSASS Memory",
                "description": "Dumps credentials from LSASS process",
                "example": "Uses Mimikatz for credential extraction"
            },
            {
                "technique": "T1056.001",
                "name": "Input Capture: Keylogging",
                "description": "Deploys keyloggers to capture credentials",
                "example": "Custom keylogger malware (XAgent)"
            }
        ]


class LazarusGroup(APTProfile):
    """
    Lazarus Group - North Korean state-sponsored group
    Known for financially motivated attacks and destructive operations
    """
    
    def __init__(self):
        super().__init__(
            name="Lazarus Group",
            country="North Korea",
            description="North Korean state-sponsored APT group. Known for cryptocurrency theft, ransomware, and destructive attacks (WannaCry, Sony Pictures hack).",
            mitre_groups=["G0032"],
            active_since="2009"
        )
    
    def get_initial_access_ttps(self) -> list:
        return [
            {
                "technique": "T1566.001",
                "name": "Phishing",
                "description": "Cryptocurrency-themed phishing lures",
                "example": "Fake cryptocurrency trading applications"
            },
            {
                "technique": "T1195.002",
                "name": "Supply Chain Compromise",
                "description": "Trojanizes legitimate software",
                "example": "3CX supply chain attack (2023)"
            },
            {
                "technique": "T1078",
                "name": "Valid Accounts",
                "description": "Uses stolen credentials for access",
                "example": "Compromised cryptocurrency exchange accounts"
            }
        ]
    
    def get_impact_ttps(self) -> list:
        return [
            {
                "technique": "T1486",
                "name": "Data Encrypted for Impact",
                "description": "Deploys ransomware (WannaCry, WannaCryptor)",
                "example": "WannaCry ransomware outbreak (2017)"
            },
            {
                "technique": "T1485",
                "name": "Data Destruction",
                "description": "Wiper malware to destroy data",
                "example": "Sony Pictures hack disk wiper"
            },
            {
                "technique": "T1489",
                "name": "Service Stop",
                "description": "Stops critical services before deploying payloads",
                "example": "Stops antivirus and backup services"
            }
        ]
    
    def get_exfiltration_ttps(self) -> list:
        return [
            {
                "technique": "T1020",
                "name": "Automated Exfiltration",
                "description": "Automated cryptocurrency wallet theft",
                "example": "AppleJeus malware stealing crypto wallets"
            },
            {
                "technique": "T1041",
                "name": "Exfiltration Over C2 Channel",
                "description": "Data exfiltration through command and control",
                "example": "Sends stolen data to attacker-controlled servers"
            }
        ]


class APT38(APTProfile):
    """
    APT38 - North Korean financially motivated group
    Specializes in SWIFT network attacks and bank heists
    """
    
    def __init__(self):
        super().__init__(
            name="APT38",
            country="North Korea",
            description="North Korean group focused on financial crime. Known for SWIFT network attacks and multi-million dollar bank heists.",
            mitre_groups=["G0082"],
            active_since="2014"
        )
    
    def get_initial_access_ttps(self) -> list:
        return [
            {
                "technique": "T1566.001",
                "name": "Spearphishing",
                "description": "Targets banking employees with financial lures",
                "example": "PDF documents about SWIFT updates"
            },
            {
                "technique": "T1078.003",
                "name": "Valid Accounts: Local Accounts",
                "description": "Compromises bank employee accounts",
                "example": "Uses stolen credentials to access SWIFT terminals"
            }
        ]


# Registry of available APT profiles
APT_PROFILES = {
    "APT29": APT29CozyBear(),
    "APT28": APT28FancyBear(),
    "LAZARUS": LazarusGroup(),
    "APT38": APT38()
}


def get_apt_profile(name: str) -> APTProfile:
    """Get an APT profile by name"""
    return APT_PROFILES.get(name.upper())


def list_apt_profiles() -> list:
    """List all available APT profiles"""
    return [
        {
            "id": key,
            "name": profile.name,
            "country": profile.country,
            "description": profile.description,
            "active_since": profile.active_since,
            "mitre_groups": profile.mitre_groups
        }
        for key, profile in APT_PROFILES.items()
    ]


def generate_apt_scenario(apt_name: str, target_industry: str = "Financial") -> dict:
    """
    Generate a mission scenario based on APT TTP profile
    """
    profile = get_apt_profile(apt_name)
    if not profile:
        return {"error": "APT profile not found"}
    
    attack_chain = profile.get_attack_chain()
    
    return {
        "apt_name": profile.name,
        "country": profile.country,
        "target_industry": target_industry,
        "mission_objective": f"Simulate {profile.name} attack chain against {target_industry} sector",
        "attack_phases": attack_chain,
        "recommended_defenses": generate_defenses_for_apt(profile),
        "iocs": generate_iocs_for_apt(profile)
    }


def generate_defenses_for_apt(profile: APTProfile) -> list:
    """Generate recommended defenses based on APT TTPs"""
    defenses = []
    
    if profile.name.startswith("APT29"):
        defenses = [
            {"defense": "Email Security Gateway", "effectiveness": "High", "reason": "Blocks spearphishing attempts"},
            {"defense": "Application Whitelisting", "effectiveness": "High", "reason": "Prevents unauthorized PowerShell execution"},
            {"defense": "EDR with Memory Protection", "effectiveness": "Medium", "reason": "Detects in-memory malware"},
            {"defense": "Network Segmentation", "effectiveness": "Medium", "reason": "Limits lateral movement"}
        ]
    elif profile.name.startswith("APT28"):
        defenses = [
            {"defense": "Patch Management", "effectiveness": "Critical", "reason": "Prevents exploitation of known vulnerabilities"},
            {"defense": "MFA on All Accounts", "effectiveness": "High", "reason": "Prevents credential reuse"},
            {"defense": "Privileged Access Management", "effectiveness": "High", "reason": "Limits LSASS credential dumping"},
            {"defense": "Network Intrusion Detection", "effectiveness": "Medium", "reason": "Detects C2 traffic"}
        ]
    elif "LAZARUS" in profile.name or profile.name.startswith("APT38"):
        defenses = [
            {"defense": "Software Supply Chain Security", "effectiveness": "Critical", "reason": "Detects trojanized software"},
            {"defense": "Cryptocurrency Wallet Protection", "effectiveness": "High", "reason": "Prevents wallet theft"},
            {"defense": "Endpoint Detection & Response", "effectiveness": "High", "reason": "Detects ransomware and wipers"},
            {"defense": "SWIFT CSP Controls", "effectiveness": "Critical", "reason": "Protects banking infrastructure"},
            {"defense": "Air-Gapped Backups", "effectiveness": "High", "reason": "Ensures data recovery"}
        ]
    
    return defenses


def generate_iocs_for_apt(profile: APTProfile) -> dict:
    """Generate Indicators of Compromise for APT"""
    iocs = {
        "file_hashes": [],
        "domains": [],
        "ips": [],
        "registry_keys": [],
        "mutexes": []
    }
    
    if profile.name.startswith("APT29"):
        iocs = {
            "file_hashes": [
                "ce77d116a074dab7a22a0fd4f2c1ab475f16eec42e1ded3c0b0aa8211fe858d6",
                "ac1b2b89e60707a20e9eb1ca480bc3410ead40643b386d624c5d21b47c02917c"
            ],
            "domains": [
                "avsvmcloud[.]com",
                "freescanonline[.]com",
                "deftsecurity[.]com"
            ],
            "ips": [
                "13.59.205.66",
                "54.193.127.66"
            ],
            "registry_keys": [
                "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\\ServiceData"
            ],
            "mutexes": [
                "Global\\{12498A34-36BA-4A57-9D71-1544C0A2F60E}"
            ]
        }
    
    return iocs
