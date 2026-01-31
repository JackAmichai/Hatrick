"""
Advanced Attack Scenarios
Features 21-30: IoT, Cloud, Supply Chain, Ransomware, Blockchain, CI/CD, API, Insider Threats
"""
import random
from typing import Dict, List, Any

class IoTDeviceSimulator:
    """Simulate IoT device vulnerabilities (Feature 21)"""
    
    DEVICES = {
        "smart_camera": {
            "vendor": "GenericCam",
            "firmware": "v2.3.1",
            "vulnerabilities": ["CVE-2023-1234 (Default Credentials)", "Unencrypted RTSP Stream"],
            "ports": [554, 8080],
            "protocols": ["RTSP", "HTTP"]
        },
        "smart_thermostat": {
            "vendor": "ThermoCorp",
            "firmware": "v1.5.2",
            "vulnerabilities": ["Weak WiFi Encryption", "API Key Exposure"],
            "ports": [80, 443],
            "protocols": ["HTTP", "HTTPS"]
        },
        "smart_lock": {
            "vendor": "SecureLock",
            "firmware": "v3.0.1",
            "vulnerabilities": ["CVE-2023-5678 (Replay Attack)", "BLE Pairing Weakness"],
            "ports": [],
            "protocols": ["Bluetooth"]
        },
        "industrial_plc": {
            "vendor": "IndustrialCo",
            "firmware": "v4.2.0",
            "vulnerabilities": ["Modbus TCP No Auth", "Ladder Logic Injection"],
            "ports": [502, 102],
            "protocols": ["Modbus", "S7"]
        }
    }
    
    @staticmethod
    def scan_iot_devices() -> List[Dict[str, Any]]:
        """Discover IoT devices on network"""
        num_devices = random.randint(2, 5)
        devices = random.sample(list(IoTDeviceSimulator.DEVICES.keys()), num_devices)
        
        return [
            {
                "device_type": device,
                "ip": f"192.168.1.{random.randint(100, 199)}",
                **IoTDeviceSimulator.DEVICES[device]
            }
            for device in devices
        ]

class CloudMisconfiguration:
    """Cloud infrastructure vulnerabilities (Feature 22)"""
    
    CLOUD_VULNS = {
        "s3_bucket_public": {
            "service": "AWS S3",
            "severity": "CRITICAL",
            "description": "S3 bucket with public read access",
            "bucket_name": f"company-backups-{random.randint(1000, 9999)}",
            "exposed_files": ["database_backup.sql", "credentials.env", "customer_data.csv"],
            "exploitation": "aws s3 ls s3://bucket-name --no-sign-request"
        },
        "rds_public": {
            "service": "AWS RDS",
            "severity": "CRITICAL",
            "description": "RDS instance publicly accessible",
            "endpoint": f"db-prod-{random.randint(100, 999)}.us-east-1.rds.amazonaws.com",
            "port": 5432,
            "exploitation": "PostgreSQL exposed to 0.0.0.0/0"
        },
        "iam_overprivileged": {
            "service": "AWS IAM",
            "severity": "HIGH",
            "description": "IAM role with overly permissive policies",
            "role_name": "app-service-role",
            "permissions": ["s3:*", "dynamodb:*", "ec2:*"],
            "exploitation": "Role can assume admin privileges"
        },
        "security_group_open": {
            "service": "AWS EC2",
            "severity": "HIGH",
            "description": "Security group allows 0.0.0.0/0 on port 22",
            "group_id": f"sg-{random.randint(10000, 99999)}",
            "exploitation": "SSH brute force attack possible"
        },
        "api_key_exposed": {
            "service": "Azure Key Vault",
            "severity": "CRITICAL",
            "description": "API keys in public GitHub repository",
            "keys_found": ["AZURE_STORAGE_KEY", "OPENAI_API_KEY", "STRIPE_SECRET"],
            "exploitation": "Keys can be used to access cloud resources"
        }
    }
    
    @staticmethod
    def scan_cloud_config() -> Dict[str, Any]:
        """Identify cloud misconfigurations"""
        num_vulns = random.randint(2, 4)
        vulns = random.sample(list(CloudMisconfiguration.CLOUD_VULNS.keys()), num_vulns)
        
        return {
            "provider": random.choice(["AWS", "Azure", "GCP"]),
            "misconfigurations": [CloudMisconfiguration.CLOUD_VULNS[v] for v in vulns],
            "total_resources_scanned": random.randint(50, 200),
            "risk_score": sum(1 if CloudMisconfiguration.CLOUD_VULNS[v]["severity"] == "CRITICAL" else 0.5 for v in vulns)
        }

class SupplyChainAttack:
    """Supply chain compromise scenarios (Feature 23)"""
    
    ATTACK_VECTORS = {
        "npm_package_typosquatting": {
            "type": "Dependency Confusion",
            "target": "Popular npm package",
            "malicious_package": "react-domm (extra 'm')",
            "legitimate_package": "react-dom",
            "payload": "Exfiltrates environment variables to attacker server",
            "detection_difficulty": "HIGH"
        },
        "compromised_docker_image": {
            "type": "Container Poisoning",
            "target": "Docker Hub image",
            "malicious_image": "node:14-alpine-compromised",
            "payload": "Cryptocurrency miner embedded in base image",
            "detection_difficulty": "MEDIUM"
        },
        "update_server_mitm": {
            "type": "Update Mechanism Attack",
            "target": "Software auto-updater",
            "payload": "Unsigned update pushed to all clients",
            "detection_difficulty": "LOW"
        },
        "ci_cd_poisoning": {
            "type": "Build Pipeline Injection",
            "target": "GitHub Actions / Jenkins",
            "payload": "Modified .github/workflows to inject backdoor",
            "detection_difficulty": "HIGH"
        }
    }
    
    @staticmethod
    def detect_supply_chain_risk() -> Dict[str, Any]:
        """Analyze supply chain vulnerabilities"""
        attack = random.choice(list(SupplyChainAttack.ATTACK_VECTORS.values()))
        
        return {
            "attack_vector": attack,
            "dependencies_analyzed": random.randint(50, 300),
            "suspicious_packages": random.randint(1, 5),
            "recommendation": "Enable dependency scanning and SBOM generation"
        }

class APIExploitation:
    """API security vulnerabilities (Feature 26)"""
    
    @staticmethod
    def scan_api_endpoints() -> Dict[str, Any]:
        """Discover API vulnerabilities"""
        vulnerabilities = []
        
        endpoints = [
            {"path": "/api/users/{id}", "method": "GET"},
            {"path": "/api/admin/logs", "method": "GET"},
            {"path": "/api/auth/login", "method": "POST"},
            {"path": "/graphql", "method": "POST"}
        ]
        
        vuln_types = [
            {
                "type": "Broken Object Level Authorization (BOLA)",
                "endpoint": "/api/users/{id}",
                "description": "Can access other users' data by changing ID parameter",
                "exploitation": "GET /api/users/1337 -> 200 OK (unauthorized data)"
            },
            {
                "type": "Excessive Data Exposure",
                "endpoint": "/api/admin/logs",
                "description": "API returns sensitive fields unnecessarily",
                "exploitation": "Response includes passwords, tokens, internal IPs"
            },
            {
                "type": "GraphQL Introspection Enabled",
                "endpoint": "/graphql",
                "description": "Schema fully exposed via introspection query",
                "exploitation": "Query entire schema to find hidden mutations"
            },
            {
                "type": "Rate Limiting Missing",
                "endpoint": "/api/auth/login",
                "description": "No rate limiting on authentication endpoint",
                "exploitation": "Brute force attack possible (1000+ req/min)"
            }
        ]
        
        vulnerabilities = random.sample(vuln_types, random.randint(2, 4))
        
        return {
            "endpoints_discovered": endpoints,
            "vulnerabilities": vulnerabilities,
            "owasp_api_risks": ["API1:2023", "API3:2023", "API5:2023"],
            "severity": "HIGH"
        }

class RansomwareSimulation:
    """Ransomware attack simulation (Feature 27)"""
    
    @staticmethod
    def simulate_ransomware_attack() -> Dict[str, Any]:
        """Simulate ransomware deployment"""
        
        return {
            "ransomware_family": random.choice(["LockBit", "REvil", "Conti", "BlackCat"]),
            "encryption_algorithm": "AES-256 + RSA-4096",
            "files_encrypted": random.randint(10000, 50000),
            "ransom_amount_btc": round(random.uniform(5, 50), 2),
            "ransom_note": "Your files have been encrypted. Pay within 72 hours or data will be published.",
            "persistence_mechanisms": [
                "Registry Run key",
                "Scheduled Task",
                "Service installation"
            ],
            "data_exfiltration": f"{random.randint(50, 500)}GB uploaded to attacker server",
            "negotiation_options": ["Pay ransom", "Restore from backup", "Forensic analysis"]
        }

class BlockchainAttack:
    """Smart contract and blockchain exploits (Feature 28)"""
    
    @staticmethod
    def scan_smart_contract() -> Dict[str, Any]:
        """Identify smart contract vulnerabilities"""
        
        vulnerabilities = [
            {
                "type": "Reentrancy Attack",
                "severity": "CRITICAL",
                "description": "Vulnerable withdraw function allows recursive calls",
                "code_snippet": "function withdraw() { msg.sender.call.value(balance[msg.sender])() }",
                "exploitation": "Drain contract funds via recursive withdrawal"
            },
            {
                "type": "Integer Overflow/Underflow",
                "severity": "HIGH",
                "description": "Arithmetic operations without SafeMath",
                "exploitation": "Manipulate token balances through overflow"
            },
            {
                "type": "Oracle Manipulation",
                "severity": "HIGH",
                "description": "Price oracle relies on single DEX",
                "exploitation": "Flash loan attack to manipulate price feed"
            },
            {
                "type": "Access Control Missing",
                "severity": "CRITICAL",
                "description": "Admin functions lack proper modifiers",
                "exploitation": "Anyone can call privileged functions"
            }
        ]
        
        detected = random.sample(vulnerabilities, random.randint(2, 3))
        
        return {
            "contract_address": f"0x{random.randint(10**39, 10**40-1):040x}",
            "blockchain": "Ethereum",
            "vulnerabilities": detected,
            "total_value_locked": f"${random.randint(100000, 10000000)}",
            "audit_status": "Unaudited"
        }

class CICDCompromise:
    """CI/CD pipeline attacks (Feature 29)"""
    
    @staticmethod
    def scan_cicd_security() -> Dict[str, Any]:
        """Identify CI/CD vulnerabilities"""
        
        findings = [
            {
                "issue": "Secrets in Environment Variables",
                "severity": "CRITICAL",
                "location": "GitHub Actions workflow",
                "description": "API keys stored as plaintext in workflow YAML",
                "remediation": "Use GitHub Secrets or external secret manager"
            },
            {
                "issue": "Unrestricted Pipeline Triggers",
                "severity": "HIGH",
                "location": "Jenkins job configuration",
                "description": "Pipeline can be triggered by any user",
                "remediation": "Implement branch protection and approval gates"
            },
            {
                "issue": "Unsigned Artifacts",
                "severity": "MEDIUM",
                "location": "Build process",
                "description": "Build artifacts not cryptographically signed",
                "remediation": "Implement artifact signing with Sigstore"
            },
            {
                "issue": "Dependency Confusion Risk",
                "severity": "HIGH",
                "location": "Package installation step",
                "description": "No scoping for internal packages",
                "remediation": "Configure npm scope for internal packages"
            }
        ]
        
        return {
            "platform": random.choice(["GitHub Actions", "Jenkins", "GitLab CI", "CircleCI"]),
            "findings": random.sample(findings, random.randint(2, 4)),
            "risk_score": random.randint(60, 95),
            "recommendation": "Implement supply chain security best practices (SLSA Level 3)"
        }

class InsiderThreat:
    """Insider threat detection (Feature 30)"""
    
    @staticmethod
    def detect_insider_activity() -> Dict[str, Any]:
        """Identify suspicious insider behavior"""
        
        indicators = [
            {
                "type": "Unusual Data Access",
                "description": "Employee accessed 10,000+ customer records outside normal hours",
                "risk_level": "HIGH",
                "user": "john.doe@company.com",
                "timestamp": "2024-12-09 02:30 AM"
            },
            {
                "type": "Mass Download",
                "description": "Downloaded 50GB of proprietary source code",
                "risk_level": "CRITICAL",
                "user": "jane.smith@company.com",
                "timestamp": "2024-12-09 11:45 PM"
            },
            {
                "type": "Privilege Escalation Attempt",
                "description": "Attempted to access admin panel 15 times",
                "risk_level": "HIGH",
                "user": "contractor@external.com",
                "timestamp": "2024-12-09 03:15 PM"
            },
            {
                "type": "Policy Violation",
                "description": "Uploaded code to personal GitHub repository",
                "risk_level": "MEDIUM",
                "user": "dev.user@company.com",
                "timestamp": "2024-12-09 04:20 PM"
            }
        ]
        
        detected = random.sample(indicators, random.randint(1, 3))
        
        return {
            "indicators": detected,
            "behavioral_anomaly_score": random.randint(70, 95),
            "recommendation": "Immediate investigation required",
            "automated_response": ["Suspend account", "Alert security team", "Preserve audit logs"]
        }

class SocialEngineering:
    """Social engineering simulation (Feature 25)"""
    
    @staticmethod
    def simulate_phishing_campaign() -> Dict[str, Any]:
        """Simulate phishing attack"""
        
        campaigns = [
            {
                "type": "Spear Phishing",
                "target": "C-level executives",
                "lure": "Fake board meeting invitation",
                "success_rate": 0.35,
                "payloads": ["Credential harvesting", "Malware download"]
            },
            {
                "type": "Business Email Compromise",
                "target": "Finance department",
                "lure": "CEO requests wire transfer",
                "success_rate": 0.42,
                "payloads": ["Fraudulent payment"]
            },
            {
                "type": "Watering Hole",
                "target": "Industry forum users",
                "lure": "Compromised industry website",
                "success_rate": 0.28,
                "payloads": ["Drive-by download"]
            }
        ]
        
        campaign = random.choice(campaigns)
        
        return {
            "campaign": campaign,
            "emails_sent": random.randint(100, 500),
            "emails_opened": int(campaign["success_rate"] * random.randint(100, 500)),
            "credentials_captured": random.randint(5, 30),
            "awareness_training_needed": True
        }
