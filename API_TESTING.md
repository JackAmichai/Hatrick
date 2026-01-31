# 🧪 API Testing Guide

Quick reference for testing HatTrick backend endpoints using curl or Postman.

## Prerequisites

```bash
# Start the backend server
cd backend
uvicorn main:app --reload

# Server runs on http://localhost:8000
```

---

## 📊 Health & Status

### Health Check
```bash
curl http://localhost:8000/
```

**Response**:
```json
{
  "status": "ok",
  "service": "Hatrick Backend"
}
```

---

## 🎭 APT Profiles

### List Available APT Profiles
```bash
curl http://localhost:8000/api/apt-profiles
```

**Response**:
```json
{
  "profiles": [
    {
      "id": "apt29",
      "name": "APT29 (Cozy Bear)",
      "description": "Russian state-sponsored group (SVR). Known for SolarWinds supply chain attack.",
      "sophistication": "Very High",
      "origin": "Russia",
      "targets": "Government, Defense, Think Tanks",
      "notable_campaigns": ["SolarWinds SUNBURST", "Operation Ghost"],
      "mitre_tactics": 12
    },
    {
      "id": "apt28",
      "name": "APT28 (Fancy Bear)",
      "description": "Russian military intelligence (GRU). Known for aggressive credential theft.",
      "sophistication": "High",
      "origin": "Russia",
      "targets": "Military, Political Organizations",
      "notable_campaigns": ["DNC Hack 2016", "Olympic Destroyer"],
      "mitre_tactics": 12
    },
    {
      "id": "lazarus",
      "name": "Lazarus Group",
      "description": "North Korean state-sponsored group. Financial motivation + espionage.",
      "sophistication": "Very High",
      "origin": "North Korea",
      "targets": "Financial Institutions, Cryptocurrency",
      "notable_campaigns": ["WannaCry", "Sony Pictures", "3CX Supply Chain"],
      "mitre_tactics": 12
    },
    {
      "id": "apt38",
      "name": "APT38",
      "description": "North Korean financially-motivated subgroup. Specializes in bank heists.",
      "sophistication": "High",
      "origin": "North Korea",
      "targets": "Banks, SWIFT Network",
      "notable_campaigns": ["Bangladesh Bank Heist", "Cosmos Bank"],
      "mitre_tactics": 12
    }
  ]
}
```

---

### Generate APT Scenario

#### APT29 (Cozy Bear)
```bash
curl -X POST http://localhost:8000/api/apt-profiles/apt29/scenario
```

#### APT28 (Fancy Bear)
```bash
curl -X POST http://localhost:8000/api/apt-profiles/apt28/scenario
```

#### Lazarus Group
```bash
curl -X POST http://localhost:8000/api/apt-profiles/lazarus/scenario
```

#### APT38
```bash
curl -X POST http://localhost:8000/api/apt-profiles/apt38/scenario
```

**Sample Response** (APT29):
```json
{
  "apt_profile": "APT29 (Cozy Bear)",
  "mission_id": "APT29_SUPPLY_CHAIN_2025",
  "scenario": "Sophisticated supply chain attack mimicking SolarWinds SUNBURST",
  "initial_access": "Spearphishing with LDAP reconnaissance",
  "execution": "PowerShell Empire for C2",
  "persistence": "WMI event subscriptions",
  "ttps": {
    "reconnaissance": ["T1595 - Active Scanning"],
    "initial_access": ["T1566 - Phishing"],
    "execution": ["T1059.001 - PowerShell"],
    "persistence": ["T1546.003 - WMI Event Subscription"],
    "defense_evasion": ["T1070 - Indicator Removal", "T1070.006 - Timestomp"],
    "credential_access": ["T1003 - OS Credential Dumping"],
    "discovery": ["T1087 - Account Discovery"],
    "lateral_movement": ["T1021.001 - Remote Desktop Protocol"],
    "collection": ["T1113 - Screen Capture"],
    "command_and_control": ["T1071.001 - Web Protocols"],
    "exfiltration": ["T1041 - Exfiltration Over C2"],
    "impact": ["T1485 - Data Destruction", "T1195.002 - Compromise Software Supply Chain"]
  },
  "difficulty": "VERY_HIGH",
  "estimated_duration": "45 minutes"
}
```

---

### Get APT IOCs (Indicators of Compromise)

```bash
curl -X POST http://localhost:8000/api/apt-profiles/apt29/iocs
```

**Sample Response**:
```json
{
  "apt": "APT29 (Cozy Bear)",
  "iocs": {
    "file_hashes": [
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "5d41402abc4b2a76b9719d911017c592",
      "098f6bcd4621d373cade4e832627b4f6"
    ],
    "domains": [
      "solarwinds-updates.com",
      "avsvmcloud.com",
      "freescanonline.com"
    ],
    "ip_addresses": [
      "13.59.205.66",
      "54.193.127.66",
      "34.203.203.23"
    ],
    "registry_keys": [
      "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\\SolarWinds",
      "HKCU\\Software\\Classes\\CLSID\\{AB8902B4-09CA-4bb6-B78D-A8F59079A8D5}"
    ],
    "mutexes": [
      "Global\\8b36c8e3-7b",
      "Local\\SM0:8756:304:WilStaging"
    ]
  }
}
```

---

## 📄 Report Generation

### Generate Pen Test Report

```bash
curl -X POST http://localhost:8000/api/reports/pentest \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Demo Corp",
    "engagement_type": "Black Box",
    "test_dates": "2025-01-01 to 2025-01-15",
    "mission_results": [
      {
        "mission": "NETWORK_FLOOD",
        "success": true,
        "vulnerabilities_found": 5,
        "cvss_scores": [7.5, 6.8, 9.1, 5.3, 8.2]
      },
      {
        "mission": "SQL_INJECTION",
        "success": true,
        "vulnerabilities_found": 8,
        "cvss_scores": [9.8, 8.9, 7.2, 9.1, 6.5, 8.0, 7.8, 5.5]
      }
    ]
  }'
```

**Response Structure**:
```json
{
  "executive_summary": {
    "overview": "...",
    "risk_score": 8.2,
    "critical_findings": 3,
    "high_findings": 7,
    "medium_findings": 12
  },
  "technical_findings": [
    {
      "finding_id": "VULN-001",
      "title": "SQL Injection in Login Form",
      "severity": "CRITICAL",
      "cvss": 9.8,
      "cwe": "CWE-89",
      "description": "...",
      "proof_of_concept": "...",
      "affected_systems": ["prod-web-01", "prod-db-01"],
      "remediation": "..."
    }
  ],
  "mitre_attack_mapping": {
    "techniques_observed": 28,
    "tactics": [...]
  },
  "owasp_analysis": {
    "A01_2021_broken_access_control": 5,
    "A03_2021_injection": 8
  },
  "remediation_roadmap": {
    "phase_1": {
      "duration": "30 days",
      "cost": "$20,000",
      "actions": [...]
    },
    "phase_2": {...},
    "phase_3": {...}
  },
  "compliance_mapping": {
    "pci_dss": {...},
    "gdpr": {...},
    "hipaa": {...}
  }
}
```

---

### Generate White Paper

```bash
curl -X POST http://localhost:8000/api/reports/whitepaper \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Autonomous Multi-Agent Cybersecurity Testing",
    "authors": ["John Doe", "Jane Smith"],
    "mission_data": [
      {
        "mission": "NETWORK_FLOOD",
        "success_rate": 0.92,
        "cost": 2.47,
        "vulnerabilities": 28
      }
    ]
  }'
```

**Response Structure**:
```json
{
  "title": "Autonomous Multi-Agent Cybersecurity Testing",
  "authors": ["John Doe", "Jane Smith"],
  "abstract": "...",
  "methodology": {
    "agent_architecture": "...",
    "evaluation_metrics": "..."
  },
  "results": {
    "attack_success_rates": {...},
    "cost_analysis": {...},
    "comparison_table": [...]
  },
  "discussion": "...",
  "conclusion": "...",
  "references": [...]
}
```

---

### List Report Templates

```bash
curl http://localhost:8000/api/reports/templates
```

**Response**:
```json
{
  "templates": [
    {
      "id": "owasp_pentest",
      "name": "OWASP Penetration Test Report",
      "format": "JSON/HTML",
      "sections": [
        "Executive Summary",
        "Technical Findings",
        "MITRE ATT&CK Mapping",
        "OWASP Top 10 Analysis",
        "Remediation Roadmap",
        "Compliance Mapping"
      ],
      "compliance_frameworks": ["PCI-DSS", "GDPR", "HIPAA", "SOC 2"]
    },
    {
      "id": "technical_whitepaper",
      "name": "Technical White Paper",
      "format": "JSON/PDF",
      "sections": [
        "Abstract",
        "Methodology",
        "Results & Analysis",
        "Discussion",
        "Conclusion",
        "References"
      ],
      "use_case": "Academic research, conference papers, portfolio"
    }
  ]
}
```

---

## 🛡️ Security Features

### Get Threat Intelligence
```bash
curl http://localhost:8000/api/threat-intel
```

### Get Deception Layer Status
```bash
curl http://localhost:8000/api/deception/status
```

### Get Zero Trust Policies
```bash
curl http://localhost:8000/api/zero-trust/policies
```

### Check Compliance (GDPR)
```bash
curl http://localhost:8000/api/compliance/gdpr
```

### Check Compliance (HIPAA)
```bash
curl http://localhost:8000/api/compliance/hipaa
```

### Check Compliance (PCI-DSS)
```bash
curl http://localhost:8000/api/compliance/pci-dss
```

### Get Network Segmentation
```bash
curl http://localhost:8000/api/network/segmentation
```

---

## 🔍 Advanced Attack Scenarios

### Scan IoT Devices
```bash
curl http://localhost:8000/api/iot/devices
```

### Scan Cloud Misconfigurations
```bash
curl http://localhost:8000/api/cloud/misconfigurations
```

### Analyze Supply Chain Risk
```bash
curl http://localhost:8000/api/supply-chain/risk
```

---

## 📦 Postman Collection

Import this JSON into Postman for easy testing:

```json
{
  "info": {
    "name": "HatTrick API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:8000/"
      }
    },
    {
      "name": "List APT Profiles",
      "request": {
        "method": "GET",
        "url": "http://localhost:8000/api/apt-profiles"
      }
    },
    {
      "name": "Generate APT29 Scenario",
      "request": {
        "method": "POST",
        "url": "http://localhost:8000/api/apt-profiles/apt29/scenario"
      }
    },
    {
      "name": "Generate Pen Test Report",
      "request": {
        "method": "POST",
        "url": "http://localhost:8000/api/reports/pentest",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"client_name\": \"Demo Corp\",\n  \"engagement_type\": \"Black Box\",\n  \"test_dates\": \"2025-01-01 to 2025-01-15\",\n  \"mission_results\": [\n    {\n      \"mission\": \"NETWORK_FLOOD\",\n      \"success\": true,\n      \"vulnerabilities_found\": 5\n    }\n  ]\n}"
        }
      }
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Backend not responding
```bash
# Check if server is running
curl http://localhost:8000/

# Expected: {"status":"ok","service":"Hatrick Backend"}
```

### Import errors
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### GROQ API errors
```bash
# Check API key is set
echo $GROQ_API_KEY  # Linux/Mac
echo %GROQ_API_KEY%  # Windows

# Set if missing
export GROQ_API_KEY="your_key_here"  # Linux/Mac
set GROQ_API_KEY="your_key_here"  # Windows
```

### Port already in use
```bash
# Use different port
uvicorn main:app --reload --port 8001
```

---

## 📊 Response Time Benchmarks

| Endpoint | Expected Time | Max Time |
|----------|---------------|----------|
| Health check | < 10ms | 50ms |
| APT profiles list | < 50ms | 200ms |
| APT scenario generation | 1-2s | 5s |
| Pen test report | 3-5s | 10s |
| White paper | 5-8s | 15s |

---

## 🎯 Next Steps

1. Test all endpoints with curl
2. Import Postman collection for GUI testing
3. Verify response structures match documentation
4. Test error cases (invalid APT ID, malformed JSON)
5. Benchmark response times
6. Integrate endpoints into frontend components
