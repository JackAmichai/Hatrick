// Code diff sample data - separated for Fast Refresh compatibility

export interface CodeDiff {
    fileName: string;
    language: string;
    vulnerability: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    explanation: string;
    before: string;
    after: string;
}

// Sample diff data for demonstration
export const SAMPLE_DIFFS: Record<string, CodeDiff> = {
    SQL_INJECTION: {
        fileName: 'auth.py',
        language: 'Python',
        vulnerability: 'SQL Injection in Login Endpoint',
        severity: 'critical',
        explanation: 'User input was directly concatenated into SQL query, allowing attackers to inject malicious SQL code and bypass authentication.',
        before: `def login(username, password):
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    result = db.execute(query)
    if result:
        return {"success": True, "token": generate_token()}
    return {"success": False}`,
        after: `def login(username, password):
    # Use parameterized query to prevent SQL injection
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    result = db.execute(query, (username, password))
    if result:
        return {"success": True, "token": generate_token()}
    return {"success": False}`
    },
    BUFFER_OVERFLOW: {
        fileName: 'parser.c',
        language: 'C',
        vulnerability: 'Buffer Overflow in User-Agent Parser',
        severity: 'high',
        explanation: 'strcpy() was used without bounds checking, allowing attackers to overflow the buffer and potentially execute arbitrary code.',
        before: `void parse_user_agent(char *input) {
    char buffer[256];
    strcpy(buffer, input);  // Vulnerable!
    process_string(buffer);
}`,
        after: `void parse_user_agent(char *input) {
    char buffer[256];
    // Use strncpy with bounds checking
    strncpy(buffer, input, sizeof(buffer) - 1);
    buffer[sizeof(buffer) - 1] = '\\0';  // Ensure null termination
    process_string(buffer);
}`
    },
    XSS: {
        fileName: 'render.js',
        language: 'JavaScript',
        vulnerability: 'Cross-Site Scripting (XSS)',
        severity: 'high',
        explanation: 'User input was rendered without sanitization, allowing script injection attacks.',
        before: `function displayComment(comment) {
    document.getElementById('comments').innerHTML += comment;
}`,
        after: `function displayComment(comment) {
    const sanitized = DOMPurify.sanitize(comment);
    document.getElementById('comments').innerHTML += sanitized;
}`
    },
    MITM: {
        fileName: 'tls_config.py',
        language: 'Python',
        vulnerability: 'Man-in-the-Middle (MITM) Vulnerability',
        severity: 'critical',
        explanation: 'TLS certificate verification was disabled, allowing attackers to intercept encrypted traffic.',
        before: `import requests

def fetch_data(url):
    response = requests.get(url, verify=False)  # Vulnerable!
    return response.json()`,
        after: `import requests

def fetch_data(url):
    # Always verify TLS certificates
    response = requests.get(url, verify=True)
    return response.json()`
    },
    DDOS: {
        fileName: 'rate_limit.py',
        language: 'Python',
        vulnerability: 'DDoS Susceptibility - No Rate Limiting',
        severity: 'medium',
        explanation: 'API endpoint had no rate limiting, allowing attackers to overwhelm the service with requests.',
        before: `@app.route('/api/data')
def get_data():
    # No rate limiting
    return fetch_all_data()`,
        after: `from flask_limiter import Limiter

limiter = Limiter(app, key_func=get_remote_address)

@app.route('/api/data')
@limiter.limit("100 per minute")
def get_data():
    return fetch_all_data()`
    }
};
