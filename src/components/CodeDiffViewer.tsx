// Code Diff Viewer - Show how blue team patches red team exploits
import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, Shield, X, Check } from 'lucide-react';

interface CodeDiff {
    fileName: string;
    language: string;
    before: string;
    after: string;
    explanation: string;
    vulnerability: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
}

interface CodeDiffViewerProps {
    diff: CodeDiff;
    isOpen: boolean;
    onClose: () => void;
}

export const CodeDiffViewer = ({ diff, isOpen, onClose }: CodeDiffViewerProps) => {
    const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    // Parse code to identify changes
    const beforeLines = diff.before.split('\n');
    const afterLines = diff.after.split('\n');

    // Simple diff algorithm (for demo purposes)
    const getDiffLines = () => {
        const maxLen = Math.max(beforeLines.length, afterLines.length);
        const diffLines: { before: string; after: string; status: 'unchanged' | 'removed' | 'added' | 'modified' }[] = [];

        for (let i = 0; i < maxLen; i++) {
            const before = beforeLines[i] || '';
            const after = afterLines[i] || '';

            if (before === after) {
                diffLines.push({ before, after, status: 'unchanged' });
            } else if (!before) {
                diffLines.push({ before: '', after, status: 'added' });
            } else if (!after) {
                diffLines.push({ before, after: '', status: 'removed' });
            } else {
                diffLines.push({ before, after, status: 'modified' });
            }
        }

        return diffLines;
    };

    const diffLines = getDiffLines();

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-7xl max-h-[90vh] bg-neutral-900 rounded-xl border-2 border-neutral-700 shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-red-500/10 to-blue-500/10 border-b border-neutral-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <GitCompare className="text-cyan-400" size={24} />
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                Security Patch Diff
                                <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded border ${getSeverityColor(diff.severity)}`}>
                                    {diff.severity}
                                </span>
                            </h2>
                            <p className="text-sm text-gray-400 font-mono">{diff.fileName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-neutral-800 rounded-lg border border-neutral-700">
                            <button
                                onClick={() => setViewMode('split')}
                                className={`px-3 py-1.5 text-xs font-mono rounded-l transition-colors ${
                                    viewMode === 'split' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Split View
                            </button>
                            <button
                                onClick={() => setViewMode('unified')}
                                className={`px-3 py-1.5 text-xs font-mono rounded-r transition-colors ${
                                    viewMode === 'unified' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Unified
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Vulnerability Info Banner */}
                <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/30 flex items-start gap-3">
                    <Shield className="text-red-400 mt-0.5" size={20} />
                    <div>
                        <h3 className="text-sm font-bold text-red-400">Vulnerability: {diff.vulnerability}</h3>
                        <p className="text-xs text-gray-400 mt-1">{diff.explanation}</p>
                    </div>
                </div>

                {/* Code Diff Display */}
                <div className="flex-1 overflow-auto">
                    {viewMode === 'split' ? (
                        <div className="grid grid-cols-2 divide-x divide-neutral-700">
                            {/* Before (Vulnerable Code) */}
                            <div className="bg-red-500/5">
                                <div className="sticky top-0 px-4 py-2 bg-red-900/30 border-b border-red-700/50 flex items-center gap-2">
                                    <X size={16} className="text-red-400" />
                                    <span className="text-sm font-bold text-red-400">Vulnerable Code</span>
                                </div>
                                <div className="font-mono text-xs">
                                    {beforeLines.map((line, i) => (
                                        <div
                                            key={`before-${i}`}
                                            className={`flex ${
                                                diffLines[i]?.status === 'removed' || diffLines[i]?.status === 'modified'
                                                    ? 'bg-red-500/20'
                                                    : ''
                                            }`}
                                        >
                                            <span className="px-4 py-1 text-gray-600 select-none bg-neutral-900/50 border-r border-neutral-700 min-w-[50px] text-center">
                                                {i + 1}
                                            </span>
                                            <pre className="px-4 py-1 flex-1 text-gray-300 overflow-x-auto">
                                                <code>{line || ' '}</code>
                                            </pre>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* After (Patched Code) */}
                            <div className="bg-green-500/5">
                                <div className="sticky top-0 px-4 py-2 bg-green-900/30 border-b border-green-700/50 flex items-center gap-2">
                                    <Check size={16} className="text-green-400" />
                                    <span className="text-sm font-bold text-green-400">Patched Code</span>
                                </div>
                                <div className="font-mono text-xs">
                                    {afterLines.map((line, i) => (
                                        <div
                                            key={`after-${i}`}
                                            className={`flex ${
                                                diffLines[i]?.status === 'added' || diffLines[i]?.status === 'modified'
                                                    ? 'bg-green-500/20'
                                                    : ''
                                            }`}
                                        >
                                            <span className="px-4 py-1 text-gray-600 select-none bg-neutral-900/50 border-r border-neutral-700 min-w-[50px] text-center">
                                                {i + 1}
                                            </span>
                                            <pre className="px-4 py-1 flex-1 text-gray-300 overflow-x-auto">
                                                <code>{line || ' '}</code>
                                            </pre>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Unified View */
                        <div className="bg-neutral-950">
                            <div className="sticky top-0 px-4 py-2 bg-neutral-900 border-b border-neutral-700">
                                <span className="text-sm font-bold text-white">Unified Diff</span>
                            </div>
                            <div className="font-mono text-xs">
                                {diffLines.map((diff, i) => (
                                    <div key={i}>
                                        {diff.status === 'removed' && (
                                            <div className="flex bg-red-500/20">
                                                <span className="px-4 py-1 text-red-400 select-none bg-red-900/30 border-r border-red-700/50 min-w-[50px] text-center">
                                                    -
                                                </span>
                                                <pre className="px-4 py-1 flex-1 text-red-300 overflow-x-auto">
                                                    <code>{diff.before}</code>
                                                </pre>
                                            </div>
                                        )}
                                        {diff.status === 'added' && (
                                            <div className="flex bg-green-500/20">
                                                <span className="px-4 py-1 text-green-400 select-none bg-green-900/30 border-r border-green-700/50 min-w-[50px] text-center">
                                                    +
                                                </span>
                                                <pre className="px-4 py-1 flex-1 text-green-300 overflow-x-auto">
                                                    <code>{diff.after}</code>
                                                </pre>
                                            </div>
                                        )}
                                        {diff.status === 'modified' && (
                                            <>
                                                <div className="flex bg-red-500/20">
                                                    <span className="px-4 py-1 text-red-400 select-none bg-red-900/30 border-r border-red-700/50 min-w-[50px] text-center">
                                                        -
                                                    </span>
                                                    <pre className="px-4 py-1 flex-1 text-red-300 overflow-x-auto">
                                                        <code>{diff.before}</code>
                                                    </pre>
                                                </div>
                                                <div className="flex bg-green-500/20">
                                                    <span className="px-4 py-1 text-green-400 select-none bg-green-900/30 border-r border-green-700/50 min-w-[50px] text-center">
                                                        +
                                                    </span>
                                                    <pre className="px-4 py-1 flex-1 text-green-300 overflow-x-auto">
                                                        <code>{diff.after}</code>
                                                    </pre>
                                                </div>
                                            </>
                                        )}
                                        {diff.status === 'unchanged' && (
                                            <div className="flex">
                                                <span className="px-4 py-1 text-gray-600 select-none bg-neutral-900/50 border-r border-neutral-700 min-w-[50px] text-center">
                                                    {i + 1}
                                                </span>
                                                <pre className="px-4 py-1 flex-1 text-gray-500 overflow-x-auto">
                                                    <code>{diff.before}</code>
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <div className="px-6 py-3 bg-neutral-900 border-t border-neutral-700 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-4 text-gray-400">
                        <span>Language: <span className="text-white">{diff.language}</span></span>
                        <span className="text-red-400">- {beforeLines.length} lines</span>
                        <span className="text-green-400">+ {afterLines.length} lines</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                        <Shield size={14} />
                        <span>Security Patch Applied</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

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
    const div = document.getElementById('comments');
    div.innerHTML += '<p>' + comment + '</p>';  // Dangerous!
}`,
        after: `function displayComment(comment) {
    const div = document.getElementById('comments');
    const p = document.createElement('p');
    p.textContent = comment;  // Safe: Creates text node, not HTML
    div.appendChild(p);
}`
    }
};
