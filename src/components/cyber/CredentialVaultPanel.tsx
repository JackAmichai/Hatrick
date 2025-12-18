/**
 * Feature 29: Credential Vault Dashboard
 * Secure credential and secret management visualization
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  Lock,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  Users,
  Database,
  Server,
  Copy,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import type { 
  CredentialType,
  CredentialHealth,
  Credential,
  VaultMetrics 
} from '../../types/cyber';

interface CredentialVaultPanelProps {
  credentials: Credential[];
  metrics: VaultMetrics | null;
  onCredentialClick?: (credentialId: string) => void;
  onRotate?: (credentialId: string) => void;
  onRevoke?: (credentialId: string) => void;
}

const typeIcons: Record<CredentialType, typeof Key> = {
  password: Lock,
  api_key: Key,
  certificate: Shield,
  ssh_key: Server,
  token: Database,
  service_account: Users,
};

const typeColors: Record<CredentialType, string> = {
  password: 'text-blue-400 bg-blue-500/20',
  api_key: 'text-purple-400 bg-purple-500/20',
  certificate: 'text-green-400 bg-green-500/20',
  ssh_key: 'text-cyan-400 bg-cyan-500/20',
  token: 'text-amber-400 bg-amber-500/20',
  service_account: 'text-pink-400 bg-pink-500/20',
};

const healthColors: Record<CredentialHealth, string> = {
  healthy: 'text-green-400 bg-green-500/20 border-green-500/30',
  expiring: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  expired: 'text-red-400 bg-red-500/20 border-red-500/30',
  compromised: 'text-red-600 bg-red-600/20 border-red-600/50',
  weak: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
};

const healthLabels: Record<CredentialHealth, string> = {
  healthy: 'Healthy',
  expiring: 'Expiring Soon',
  expired: 'Expired',
  compromised: 'Compromised',
  weak: 'Weak',
};

const formatTimeAgo = (date: string): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const formatExpiresIn = (date: string): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = then.getTime() - now.getTime();
  
  if (diffMs < 0) return 'Expired';
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
  return `${Math.floor(diffDays / 30)} months`;
};

const CredentialCard = ({ 
  credential, 
  onRotate,
  onRevoke 
}: { 
  credential: Credential; 
  onRotate?: () => void;
  onRevoke?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const Icon = typeIcons[credential.credential_type];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        credential.health === 'compromised' || credential.health === 'expired'
          ? 'bg-red-500/10 border-red-500/30' 
          : credential.health === 'expiring' || credential.health === 'weak'
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-neutral-800/50 border-neutral-700'
      }`}
    >
      <div 
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`p-2 rounded-lg ${typeColors[credential.credential_type]}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`px-1.5 py-0.5 rounded text-xs uppercase ${typeColors[credential.credential_type]}`}>
              {credential.credential_type.replace('_', ' ')}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-xs border ${healthColors[credential.health]}`}>
              {healthLabels[credential.health]}
            </span>
            {credential.is_shared && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                <Users className="w-3 h-3" />
                Shared
              </span>
            )}
          </div>
          
          <h4 className="font-medium text-white truncate">{credential.name}</h4>
          <p className="text-sm text-neutral-400 truncate">{credential.description}</p>
          
          {/* Quick info */}
          <div className="flex gap-4 mt-2 text-xs text-neutral-500">
            <span>Last used: {credential.last_used ? formatTimeAgo(credential.last_used) : 'Never'}</span>
            {credential.expires_at && (
              <span className={credential.health === 'expiring' ? 'text-amber-400' : ''}>
                Expires: {formatExpiresIn(credential.expires_at)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onRotate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRotate();
              }}
              className="p-1.5 hover:bg-neutral-700 rounded transition-colors"
              title="Rotate credential"
            >
              <RefreshCw className="w-4 h-4 text-neutral-400" />
            </button>
          )}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          )}
        </div>
      </div>
      
      {/* Tags */}
      {credential.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-12">
          {credential.tags.slice(0, 4).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-neutral-700 text-neutral-300 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-neutral-700 space-y-3"
          >
            {/* Owner and environment */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Owner:</span>
                <span className="ml-2 text-white">{credential.owner}</span>
              </div>
              <div>
                <span className="text-neutral-500">Environment:</span>
                <span className="ml-2 text-white capitalize">{credential.environment}</span>
              </div>
            </div>
            
            {/* Rotation info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Last Rotated:</span>
                <span className="ml-2 text-white">{new Date(credential.last_rotated).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-neutral-500">Rotation Policy:</span>
                <span className="ml-2 text-white">{credential.rotation_policy_days} days</span>
              </div>
            </div>
            
            {/* Access count */}
            <div className="flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4 text-neutral-500" />
              <span className="text-neutral-500">Access Count:</span>
              <span className="text-white">{credential.access_count} times</span>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="flex items-center gap-1 px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-sm transition-colors"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showSecret ? 'Hide' : 'View'}
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-sm transition-colors">
                <Copy className="w-4 h-4" />
                Copy
              </button>
              {onRevoke && (
                <button 
                  onClick={onRevoke}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Revoke
                </button>
              )}
            </div>
            
            {/* Secret display */}
            {showSecret && (
              <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-600">
                <code className="text-sm text-cyan-400 break-all">
                  {credential.masked_value}
                </code>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CredentialVaultPanel = ({ 
  credentials, 
  metrics,
  onCredentialClick: _onCredentialClick,
  onRotate,
  onRevoke 
}: CredentialVaultPanelProps) => {
  void _onCredentialClick; // Intentionally unused - kept for API compatibility
  const [typeFilter, setTypeFilter] = useState<CredentialType | 'ALL'>('ALL');
  const [healthFilter, setHealthFilter] = useState<CredentialHealth | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredCredentials = useMemo(() => {
    return credentials.filter(c => {
      const matchesType = typeFilter === 'ALL' || c.credential_type === typeFilter;
      const matchesHealth = healthFilter === 'ALL' || c.health === healthFilter;
      const matchesSearch = searchQuery === '' || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesHealth && matchesSearch;
    });
  }, [credentials, typeFilter, healthFilter, searchQuery]);
  
  const stats = useMemo(() => ({
    total: credentials.length,
    healthy: credentials.filter(c => c.health === 'healthy').length,
    expiring: credentials.filter(c => c.health === 'expiring').length,
    expired: credentials.filter(c => c.health === 'expired').length,
    compromised: credentials.filter(c => c.health === 'compromised').length,
    weak: credentials.filter(c => c.health === 'weak').length,
  }), [credentials]);
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Credential Vault</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {(stats.compromised > 0 || stats.expired > 0) && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-sm">
              <AlertTriangle className="w-3 h-3" />
              {stats.compromised + stats.expired} Critical
            </span>
          )}
          <span className="text-sm text-neutral-400">{stats.total} credentials</span>
        </div>
      </div>
      
      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-white">{metrics.total_credentials}</div>
            <div className="text-xs text-neutral-500">Total Credentials</div>
          </div>
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{metrics.rotation_compliance}%</div>
            <div className="text-xs text-neutral-500">Rotation Compliance</div>
          </div>
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-amber-400">{metrics.expiring_soon}</div>
            <div className="text-xs text-neutral-500">Expiring Soon</div>
          </div>
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400">{metrics.avg_age_days}</div>
            <div className="text-xs text-neutral-500">Avg Age (days)</div>
          </div>
        </div>
      )}
      
      {/* Health breakdown */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {(['healthy', 'expiring', 'weak', 'expired', 'compromised'] as CredentialHealth[]).map(health => (
          <button
            key={health}
            onClick={() => setHealthFilter(healthFilter === health ? 'ALL' : health)}
            className={`p-2 rounded-lg border text-center transition-all ${
              healthFilter === health 
                ? 'bg-cyan-500/20 border-cyan-500/50' 
                : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-600'
            }`}
          >
            <div className={`text-lg font-bold ${healthColors[health].split(' ')[0]}`}>
              {stats[health]}
            </div>
            <div className="text-xs text-neutral-500 capitalize">{healthLabels[health]}</div>
          </button>
        ))}
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search credentials..."
          className="flex-1 min-w-48 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        />
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as CredentialType | 'ALL')}
          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Types</option>
          {Object.keys(typeIcons).map(type => (
            <option key={type} value={type}>{type.replace('_', ' ')}</option>
          ))}
        </select>
      </div>
      
      {/* Credentials list */}
      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
        {filteredCredentials.length > 0 ? (
          filteredCredentials.map(credential => (
            <CredentialCard
              key={credential.id}
              credential={credential}
              onRotate={onRotate ? () => onRotate(credential.id) : undefined}
              onRevoke={onRevoke ? () => onRevoke(credential.id) : undefined}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <Key className="w-8 h-8 mb-2 opacity-50" />
            <p>No credentials match filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CredentialVaultPanel;
