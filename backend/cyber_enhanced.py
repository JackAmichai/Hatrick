"""
Cyber Security Enhanced Module
Features 16-20, 22-25, 27-35 (excluding 21, 26)
Advanced cyber security visualization and analysis capabilities
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from enum import Enum
from datetime import datetime
import json
import random

# =============================================================================
# Feature 16: Attack Tree Visualization
# =============================================================================

class AttackNodeType(str, Enum):
    """Types of nodes in an attack tree"""
    ROOT = "root"           # Main attack goal
    AND = "and"             # All children must succeed
    OR = "or"               # Any child can succeed
    LEAF = "leaf"           # Actual attack step
    MITIGATION = "mitigation"  # Defense measure


@dataclass
class AttackTreeNode:
    """Node in an attack tree"""
    id: str
    name: str
    node_type: AttackNodeType
    description: str
    probability: float = 0.5          # Likelihood of success
    impact: float = 0.5               # Impact if successful
    cost: float = 0.0                 # Cost to execute
    mitre_technique: Optional[str] = None
    cve_ids: List[str] = field(default_factory=list)
    children: List[str] = field(default_factory=list)  # Child node IDs
    mitigations: List[str] = field(default_factory=list)
    status: str = "active"            # active, mitigated, in_progress


@dataclass
class AttackTree:
    """Complete attack tree structure"""
    id: str
    name: str
    target: str
    nodes: Dict[str, AttackTreeNode] = field(default_factory=dict)
    root_id: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def calculate_risk_score(self) -> float:
        """Calculate overall risk score for the attack tree"""
        if not self.root_id or self.root_id not in self.nodes:
            return 0.0
        return self._calculate_node_risk(self.root_id)
    
    def _calculate_node_risk(self, node_id: str) -> float:
        """Recursively calculate risk for a node"""
        node = self.nodes.get(node_id)
        if not node:
            return 0.0
        
        if not node.children:
            return node.probability * node.impact
        
        child_risks = [self._calculate_node_risk(c) for c in node.children]
        
        if node.node_type == AttackNodeType.AND:
            # All must succeed - multiply probabilities
            combined = 1.0
            for r in child_risks:
                combined *= r
            return combined * node.impact
        else:
            # OR - any can succeed - use max
            return max(child_risks) * node.impact
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "name": self.name,
            "target": self.target,
            "root_id": self.root_id,
            "risk_score": self.calculate_risk_score(),
            "nodes": {k: {
                "id": v.id,
                "name": v.name,
                "node_type": v.node_type.value,
                "description": v.description,
                "probability": v.probability,
                "impact": v.impact,
                "cost": v.cost,
                "mitre_technique": v.mitre_technique,
                "cve_ids": v.cve_ids,
                "children": v.children,
                "mitigations": v.mitigations,
                "status": v.status
            } for k, v in self.nodes.items()},
            "created_at": self.created_at
        }


class AttackTreeBuilder:
    """Builder for creating attack trees"""
    
    def __init__(self):
        self.trees: Dict[str, AttackTree] = {}
    
    def create_tree(self, name: str, target: str) -> AttackTree:
        """Create a new attack tree"""
        tree_id = f"tree_{len(self.trees)}_{datetime.now().strftime('%H%M%S')}"
        tree = AttackTree(id=tree_id, name=name, target=target)
        self.trees[tree_id] = tree
        return tree
    
    def add_node(self, tree_id: str, node: AttackTreeNode, parent_id: Optional[str] = None) -> bool:
        """Add a node to an attack tree"""
        tree = self.trees.get(tree_id)
        if not tree:
            return False
        
        tree.nodes[node.id] = node
        
        if parent_id and parent_id in tree.nodes:
            tree.nodes[parent_id].children.append(node.id)
        elif not parent_id and not tree.root_id:
            tree.root_id = node.id
        
        return True
    
    def generate_sample_tree(self, target: str = "Web Application") -> AttackTree:
        """Generate a sample attack tree for demonstration"""
        tree = self.create_tree(f"Attack on {target}", target)
        
        # Root node
        root = AttackTreeNode(
            id="root",
            name="Compromise Target System",
            node_type=AttackNodeType.OR,
            description="Main objective: gain unauthorized access",
            probability=0.7,
            impact=1.0
        )
        self.add_node(tree.id, root)
        
        # Level 1 - Attack vectors
        vectors = [
            ("web_attack", "Web Application Attack", "T1190", 0.6),
            ("social_eng", "Social Engineering", "T1566", 0.4),
            ("supply_chain", "Supply Chain Compromise", "T1195", 0.3),
        ]
        
        for vid, vname, mitre, prob in vectors:
            node = AttackTreeNode(
                id=vid,
                name=vname,
                node_type=AttackNodeType.OR,
                description=f"Attack vector: {vname}",
                probability=prob,
                impact=0.9,
                mitre_technique=mitre
            )
            self.add_node(tree.id, node, "root")
        
        # Level 2 - Specific attacks under web_attack
        web_attacks = [
            ("sqli", "SQL Injection", "T1190", 0.5, ["CVE-2021-44228"]),
            ("xss", "Cross-Site Scripting", "T1059.007", 0.6, []),
            ("auth_bypass", "Authentication Bypass", "T1078", 0.4, ["CVE-2023-22515"]),
        ]
        
        for aid, aname, mitre, prob, cves in web_attacks:
            node = AttackTreeNode(
                id=aid,
                name=aname,
                node_type=AttackNodeType.LEAF,
                description=f"Exploit: {aname}",
                probability=prob,
                impact=0.8,
                mitre_technique=mitre,
                cve_ids=cves
            )
            self.add_node(tree.id, node, "web_attack")
        
        return tree


# =============================================================================
# Feature 17: CVE Integration
# =============================================================================

@dataclass
class CVEEntry:
    """CVE (Common Vulnerabilities and Exposures) entry"""
    cve_id: str
    description: str
    severity: str                     # CRITICAL, HIGH, MEDIUM, LOW
    cvss_score: float                 # 0.0 - 10.0
    cvss_vector: str
    affected_products: List[str]
    published_date: str
    modified_date: str
    references: List[str] = field(default_factory=list)
    exploitability: str = "unproven"  # unproven, poc, active
    patch_available: bool = False
    mitre_techniques: List[str] = field(default_factory=list)


class CVEDatabase:
    """Mock CVE database for demonstration"""
    
    def __init__(self):
        self.cves: Dict[str, CVEEntry] = {}
        self._populate_sample_data()
    
    def _populate_sample_data(self):
        """Populate with sample CVE data"""
        samples = [
            CVEEntry(
                cve_id="CVE-2021-44228",
                description="Apache Log4j2 Remote Code Execution (Log4Shell)",
                severity="CRITICAL",
                cvss_score=10.0,
                cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
                affected_products=["Apache Log4j 2.x < 2.15.0"],
                published_date="2021-12-10",
                modified_date="2023-04-03",
                exploitability="active",
                patch_available=True,
                mitre_techniques=["T1190", "T1059"]
            ),
            CVEEntry(
                cve_id="CVE-2023-22515",
                description="Atlassian Confluence Broken Access Control",
                severity="CRITICAL",
                cvss_score=10.0,
                cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
                affected_products=["Atlassian Confluence < 8.3.3"],
                published_date="2023-10-04",
                modified_date="2023-10-16",
                exploitability="active",
                patch_available=True,
                mitre_techniques=["T1078"]
            ),
            CVEEntry(
                cve_id="CVE-2024-3400",
                description="Palo Alto Networks PAN-OS Command Injection",
                severity="CRITICAL",
                cvss_score=10.0,
                cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
                affected_products=["PAN-OS 10.2, 11.0, 11.1"],
                published_date="2024-04-12",
                modified_date="2024-04-15",
                exploitability="active",
                patch_available=True,
                mitre_techniques=["T1059", "T1190"]
            ),
            CVEEntry(
                cve_id="CVE-2023-4966",
                description="Citrix NetScaler Information Disclosure (Citrix Bleed)",
                severity="HIGH",
                cvss_score=9.4,
                cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:L",
                affected_products=["Citrix NetScaler ADC, Gateway"],
                published_date="2023-10-10",
                modified_date="2023-11-21",
                exploitability="active",
                patch_available=True,
                mitre_techniques=["T1552"]
            ),
            CVEEntry(
                cve_id="CVE-2023-36884",
                description="Microsoft Office Remote Code Execution",
                severity="HIGH",
                cvss_score=8.8,
                cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H",
                affected_products=["Microsoft Office 2019, 2021"],
                published_date="2023-07-11",
                modified_date="2023-08-08",
                exploitability="active",
                patch_available=True,
                mitre_techniques=["T1203", "T1566.001"]
            ),
        ]
        
        for cve in samples:
            self.cves[cve.cve_id] = cve
    
    def search(self, query: str) -> List[CVEEntry]:
        """Search CVEs by ID, description, or product"""
        query = query.lower()
        results = []
        for cve in self.cves.values():
            if (query in cve.cve_id.lower() or 
                query in cve.description.lower() or
                any(query in p.lower() for p in cve.affected_products)):
                results.append(cve)
        return results
    
    def get_by_severity(self, severity: str) -> List[CVEEntry]:
        """Get CVEs by severity level"""
        return [cve for cve in self.cves.values() if cve.severity == severity.upper()]
    
    def get_by_mitre(self, technique_id: str) -> List[CVEEntry]:
        """Get CVEs associated with a MITRE technique"""
        return [cve for cve in self.cves.values() if technique_id in cve.mitre_techniques]
    
    def to_dict_list(self) -> List[Dict]:
        """Convert all CVEs to dictionary list"""
        return [{
            "cve_id": cve.cve_id,
            "description": cve.description,
            "severity": cve.severity,
            "cvss_score": cve.cvss_score,
            "cvss_vector": cve.cvss_vector,
            "affected_products": cve.affected_products,
            "published_date": cve.published_date,
            "modified_date": cve.modified_date,
            "references": cve.references,
            "exploitability": cve.exploitability,
            "patch_available": cve.patch_available,
            "mitre_techniques": cve.mitre_techniques
        } for cve in self.cves.values()]


# =============================================================================
# Feature 18: MITRE ATT&CK Highlighting
# =============================================================================

@dataclass
class MITRETechnique:
    """MITRE ATT&CK Technique"""
    technique_id: str
    name: str
    tactic: str                       # e.g., "Initial Access", "Execution"
    description: str
    platforms: List[str]              # Windows, Linux, macOS, etc.
    detection: str
    mitigation: str
    data_sources: List[str] = field(default_factory=list)
    sub_techniques: List[str] = field(default_factory=list)
    url: str = ""


class MITREDatabase:
    """MITRE ATT&CK Database"""
    
    TACTICS = [
        "Reconnaissance", "Resource Development", "Initial Access",
        "Execution", "Persistence", "Privilege Escalation",
        "Defense Evasion", "Credential Access", "Discovery",
        "Lateral Movement", "Collection", "Command and Control",
        "Exfiltration", "Impact"
    ]
    
    def __init__(self):
        self.techniques: Dict[str, MITRETechnique] = {}
        self._populate_sample_data()
    
    def _populate_sample_data(self):
        """Populate with sample MITRE techniques"""
        samples = [
            MITRETechnique(
                technique_id="T1190",
                name="Exploit Public-Facing Application",
                tactic="Initial Access",
                description="Adversaries may attempt to exploit a weakness in an Internet-facing host or system to initially access a network.",
                platforms=["Windows", "Linux", "macOS", "Containers"],
                detection="Monitor application logs for abnormal behavior",
                mitigation="Application isolation, network segmentation, vulnerability scanning",
                data_sources=["Application Log", "Network Traffic"],
                url="https://attack.mitre.org/techniques/T1190/"
            ),
            MITRETechnique(
                technique_id="T1566",
                name="Phishing",
                tactic="Initial Access",
                description="Adversaries may send phishing messages to gain access to victim systems.",
                platforms=["Windows", "Linux", "macOS"],
                detection="Monitor email gateways and user behavior",
                mitigation="User training, email filtering, sandboxing",
                data_sources=["Email Gateway", "File Creation"],
                sub_techniques=["T1566.001", "T1566.002", "T1566.003"],
                url="https://attack.mitre.org/techniques/T1566/"
            ),
            MITRETechnique(
                technique_id="T1059",
                name="Command and Scripting Interpreter",
                tactic="Execution",
                description="Adversaries may abuse command and script interpreters to execute commands.",
                platforms=["Windows", "Linux", "macOS"],
                detection="Monitor process execution and command-line arguments",
                mitigation="Disable unnecessary scripting, application whitelisting",
                data_sources=["Process", "Command"],
                sub_techniques=["T1059.001", "T1059.003", "T1059.007"],
                url="https://attack.mitre.org/techniques/T1059/"
            ),
            MITRETechnique(
                technique_id="T1078",
                name="Valid Accounts",
                tactic="Defense Evasion",
                description="Adversaries may obtain and abuse credentials of existing accounts.",
                platforms=["Windows", "Linux", "macOS", "Cloud"],
                detection="Monitor authentication logs for anomalies",
                mitigation="MFA, privileged account management",
                data_sources=["Authentication Log", "User Account"],
                sub_techniques=["T1078.001", "T1078.002", "T1078.003", "T1078.004"],
                url="https://attack.mitre.org/techniques/T1078/"
            ),
            MITRETechnique(
                technique_id="T1552",
                name="Unsecured Credentials",
                tactic="Credential Access",
                description="Adversaries may search compromised systems to find and obtain insecurely stored credentials.",
                platforms=["Windows", "Linux", "macOS", "Containers"],
                detection="Monitor file access to credential stores",
                mitigation="Encrypt sensitive information, use credential managers",
                data_sources=["File Access", "Process"],
                sub_techniques=["T1552.001", "T1552.004", "T1552.006"],
                url="https://attack.mitre.org/techniques/T1552/"
            ),
            MITRETechnique(
                technique_id="T1021",
                name="Remote Services",
                tactic="Lateral Movement",
                description="Adversaries may use valid accounts to log into remote services.",
                platforms=["Windows", "Linux", "macOS"],
                detection="Monitor remote login events",
                mitigation="MFA, network segmentation, limit remote access",
                data_sources=["Authentication Log", "Network Connection"],
                sub_techniques=["T1021.001", "T1021.002", "T1021.004"],
                url="https://attack.mitre.org/techniques/T1021/"
            ),
        ]
        
        for tech in samples:
            self.techniques[tech.technique_id] = tech
    
    def get_by_tactic(self, tactic: str) -> List[MITRETechnique]:
        """Get techniques by tactic"""
        return [t for t in self.techniques.values() if t.tactic.lower() == tactic.lower()]
    
    def get_technique(self, technique_id: str) -> Optional[MITRETechnique]:
        """Get a specific technique"""
        return self.techniques.get(technique_id)
    
    def get_attack_path_techniques(self, technique_ids: List[str]) -> Dict[str, List[MITRETechnique]]:
        """Group techniques by tactic for an attack path visualization"""
        result: Dict[str, List[MITRETechnique]] = {tactic: [] for tactic in self.TACTICS}
        for tid in technique_ids:
            tech = self.techniques.get(tid)
            if tech:
                result[tech.tactic].append(tech)
        return {k: v for k, v in result.items() if v}  # Remove empty tactics
    
    def to_dict_list(self) -> List[Dict]:
        """Convert to dictionary list"""
        return [{
            "technique_id": t.technique_id,
            "name": t.name,
            "tactic": t.tactic,
            "description": t.description,
            "platforms": t.platforms,
            "detection": t.detection,
            "mitigation": t.mitigation,
            "data_sources": t.data_sources,
            "sub_techniques": t.sub_techniques,
            "url": t.url
        } for t in self.techniques.values()]


# =============================================================================
# Feature 19: Threat Intelligence Feed
# =============================================================================

@dataclass
class ThreatIndicator:
    """Threat intelligence indicator"""
    id: str
    indicator_type: str               # ip, domain, hash, url, email
    value: str
    threat_type: str                  # malware, phishing, c2, apt
    confidence: float                 # 0.0 - 1.0
    severity: str                     # critical, high, medium, low
    source: str                       # Feed source name
    first_seen: str
    last_seen: str
    tags: List[str] = field(default_factory=list)
    related_campaigns: List[str] = field(default_factory=list)
    mitre_techniques: List[str] = field(default_factory=list)


@dataclass
class ThreatCampaign:
    """Threat campaign/APT group"""
    id: str
    name: str
    aliases: List[str]
    description: str
    motivation: str                   # financial, espionage, disruption
    target_sectors: List[str]
    target_regions: List[str]
    active: bool
    first_seen: str
    last_activity: str
    techniques: List[str] = field(default_factory=list)
    indicators: List[str] = field(default_factory=list)


class ThreatIntelFeed:
    """Threat Intelligence Feed Manager"""
    
    def __init__(self):
        self.indicators: Dict[str, ThreatIndicator] = {}
        self.campaigns: Dict[str, ThreatCampaign] = {}
        self._populate_sample_data()
    
    def _populate_sample_data(self):
        """Populate with sample threat intel data"""
        # Sample indicators
        indicator_samples = [
            ThreatIndicator(
                id="ioc_001",
                indicator_type="ip",
                value="192.168.100.50",
                threat_type="c2",
                confidence=0.95,
                severity="high",
                source="Internal Honeypot",
                first_seen="2024-01-15",
                last_seen="2024-03-20",
                tags=["cobalt-strike", "beacon"],
                mitre_techniques=["T1071", "T1095"]
            ),
            ThreatIndicator(
                id="ioc_002",
                indicator_type="domain",
                value="evil-update.com",
                threat_type="malware",
                confidence=0.88,
                severity="critical",
                source="VirusTotal",
                first_seen="2024-02-01",
                last_seen="2024-03-18",
                tags=["dropper", "trojan"],
                related_campaigns=["camp_001"],
                mitre_techniques=["T1566", "T1204"]
            ),
            ThreatIndicator(
                id="ioc_003",
                indicator_type="hash",
                value="a1b2c3d4e5f6789012345678901234567890abcd",
                threat_type="malware",
                confidence=0.99,
                severity="critical",
                source="Mandiant",
                first_seen="2024-03-01",
                last_seen="2024-03-19",
                tags=["ransomware", "lockbit"],
                related_campaigns=["camp_002"],
                mitre_techniques=["T1486", "T1490"]
            ),
        ]
        
        for ind in indicator_samples:
            self.indicators[ind.id] = ind
        
        # Sample campaigns
        campaign_samples = [
            ThreatCampaign(
                id="camp_001",
                name="Operation ShadowStrike",
                aliases=["DarkNebula", "APT-X99"],
                description="Sophisticated cyber espionage campaign targeting government entities",
                motivation="espionage",
                target_sectors=["Government", "Defense", "Energy"],
                target_regions=["North America", "Europe"],
                active=True,
                first_seen="2023-06-01",
                last_activity="2024-03-15",
                techniques=["T1566", "T1204", "T1059", "T1078"],
                indicators=["ioc_002"]
            ),
            ThreatCampaign(
                id="camp_002",
                name="RansomWave 2024",
                aliases=["LockBit 4.0 Campaign"],
                description="Large-scale ransomware campaign targeting healthcare and financial sectors",
                motivation="financial",
                target_sectors=["Healthcare", "Finance", "Manufacturing"],
                target_regions=["Global"],
                active=True,
                first_seen="2024-01-01",
                last_activity="2024-03-20",
                techniques=["T1486", "T1490", "T1021", "T1552"],
                indicators=["ioc_003"]
            ),
        ]
        
        for camp in campaign_samples:
            self.campaigns[camp.id] = camp
    
    def search_indicators(self, query: str) -> List[ThreatIndicator]:
        """Search indicators by value or tag"""
        query = query.lower()
        results = []
        for ind in self.indicators.values():
            if (query in ind.value.lower() or 
                any(query in tag.lower() for tag in ind.tags)):
                results.append(ind)
        return results
    
    def get_by_type(self, indicator_type: str) -> List[ThreatIndicator]:
        """Get indicators by type"""
        return [i for i in self.indicators.values() if i.indicator_type == indicator_type]
    
    def get_campaign_indicators(self, campaign_id: str) -> List[ThreatIndicator]:
        """Get all indicators for a campaign"""
        campaign = self.campaigns.get(campaign_id)
        if not campaign:
            return []
        return [self.indicators[iid] for iid in campaign.indicators if iid in self.indicators]
    
    def to_summary(self) -> Dict:
        """Get feed summary statistics"""
        return {
            "total_indicators": len(self.indicators),
            "by_type": {
                itype: len([i for i in self.indicators.values() if i.indicator_type == itype])
                for itype in ["ip", "domain", "hash", "url", "email"]
            },
            "by_severity": {
                sev: len([i for i in self.indicators.values() if i.severity == sev])
                for sev in ["critical", "high", "medium", "low"]
            },
            "active_campaigns": len([c for c in self.campaigns.values() if c.active]),
            "total_campaigns": len(self.campaigns)
        }


# =============================================================================
# Feature 20: Vulnerability Scanner Integration
# =============================================================================

@dataclass
class ScanTarget:
    """Target for vulnerability scanning"""
    id: str
    target_type: str                  # host, network, application, container
    address: str                      # IP, hostname, URL
    name: str
    os: Optional[str] = None
    services: List[str] = field(default_factory=list)
    last_scan: Optional[str] = None
    status: str = "pending"           # pending, scanning, completed, error


@dataclass
class Vulnerability:
    """Discovered vulnerability"""
    id: str
    target_id: str
    name: str
    description: str
    severity: str                     # critical, high, medium, low, info
    cvss_score: float
    cve_ids: List[str] = field(default_factory=list)
    affected_component: str = ""
    port: Optional[int] = None
    protocol: Optional[str] = None
    solution: str = ""
    references: List[str] = field(default_factory=list)
    discovered_at: str = field(default_factory=lambda: datetime.now().isoformat())
    verified: bool = False
    false_positive: bool = False


@dataclass 
class ScanResult:
    """Result of a vulnerability scan"""
    scan_id: str
    target_id: str
    start_time: str
    end_time: Optional[str]
    status: str                       # running, completed, failed
    vulnerabilities: List[Vulnerability] = field(default_factory=list)
    summary: Dict[str, int] = field(default_factory=dict)
    
    def calculate_summary(self):
        """Calculate vulnerability summary by severity"""
        self.summary = {
            "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0, "total": 0
        }
        for vuln in self.vulnerabilities:
            if vuln.severity in self.summary:
                self.summary[vuln.severity] += 1
            self.summary["total"] += 1


class VulnerabilityScanner:
    """Vulnerability Scanner Integration"""
    
    def __init__(self):
        self.targets: Dict[str, ScanTarget] = {}
        self.scans: Dict[str, ScanResult] = {}
    
    def add_target(self, target: ScanTarget) -> str:
        """Add a scan target"""
        self.targets[target.id] = target
        return target.id
    
    def simulate_scan(self, target_id: str) -> Optional[ScanResult]:
        """Simulate a vulnerability scan (for demonstration)"""
        target = self.targets.get(target_id)
        if not target:
            return None
        
        scan_id = f"scan_{target_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        result = ScanResult(
            scan_id=scan_id,
            target_id=target_id,
            start_time=datetime.now().isoformat(),
            end_time=None,
            status="running"
        )
        
        # Simulate finding vulnerabilities
        sample_vulns = [
            Vulnerability(
                id=f"vuln_{scan_id}_1",
                target_id=target_id,
                name="Outdated OpenSSL Version",
                description="OpenSSL version is vulnerable to multiple CVEs",
                severity="high",
                cvss_score=7.5,
                cve_ids=["CVE-2023-0286", "CVE-2023-0215"],
                affected_component="openssl",
                port=443,
                protocol="tcp",
                solution="Upgrade OpenSSL to version 3.0.8 or later"
            ),
            Vulnerability(
                id=f"vuln_{scan_id}_2",
                target_id=target_id,
                name="SSH Weak Ciphers",
                description="SSH server supports weak encryption ciphers",
                severity="medium",
                cvss_score=5.3,
                affected_component="openssh",
                port=22,
                protocol="tcp",
                solution="Disable weak ciphers in SSH configuration"
            ),
            Vulnerability(
                id=f"vuln_{scan_id}_3",
                target_id=target_id,
                name="Missing Security Headers",
                description="Web server missing security headers (X-Frame-Options, CSP)",
                severity="low",
                cvss_score=3.1,
                affected_component="nginx",
                port=80,
                protocol="tcp",
                solution="Add security headers to web server configuration"
            ),
        ]
        
        # Randomly select some vulnerabilities
        result.vulnerabilities = random.sample(sample_vulns, k=random.randint(1, len(sample_vulns)))
        result.end_time = datetime.now().isoformat()
        result.status = "completed"
        result.calculate_summary()
        
        self.scans[scan_id] = result
        target.last_scan = result.end_time
        target.status = "completed"
        
        return result
    
    def get_all_vulnerabilities(self) -> List[Vulnerability]:
        """Get all discovered vulnerabilities across all scans"""
        all_vulns = []
        for scan in self.scans.values():
            all_vulns.extend(scan.vulnerabilities)
        return all_vulns
    
    def get_vulnerability_stats(self) -> Dict:
        """Get overall vulnerability statistics"""
        all_vulns = self.get_all_vulnerabilities()
        stats = {
            "total": len(all_vulns),
            "by_severity": {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0},
            "with_cve": 0,
            "verified": 0,
            "false_positives": 0,
            "targets_scanned": len([t for t in self.targets.values() if t.last_scan])
        }
        
        for vuln in all_vulns:
            if vuln.severity in stats["by_severity"]:
                stats["by_severity"][vuln.severity] += 1
            if vuln.cve_ids:
                stats["with_cve"] += 1
            if vuln.verified:
                stats["verified"] += 1
            if vuln.false_positive:
                stats["false_positives"] += 1
        
        return stats


# =============================================================================
# Singleton Instances
# =============================================================================

attack_tree_builder = AttackTreeBuilder()
cve_database = CVEDatabase()
mitre_database = MITREDatabase()
threat_intel_feed = ThreatIntelFeed()
vulnerability_scanner = VulnerabilityScanner()

# Pre-populate with sample data
sample_tree = attack_tree_builder.generate_sample_tree("Enterprise Network")

# Add sample scan targets
sample_targets = [
    ScanTarget(id="target_1", target_type="host", address="192.168.1.10", name="Web Server", os="Ubuntu 22.04", services=["nginx", "ssh"]),
    ScanTarget(id="target_2", target_type="host", address="192.168.1.20", name="Database Server", os="CentOS 8", services=["mysql", "ssh"]),
    ScanTarget(id="target_3", target_type="application", address="https://app.example.com", name="Main Application"),
]
for target in sample_targets:
    vulnerability_scanner.add_target(target)

print("✅ Cyber Enhanced Module loaded - Features 16-20 ready")
