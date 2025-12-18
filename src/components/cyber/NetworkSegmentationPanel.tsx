/**
 * Feature 33: Network Segmentation Visualization
 * Display network zones and segmentation policies
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  Shield,
  Server,
  Wifi,
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  Eye
} from 'lucide-react';
import type { 
  ZoneType,
  TrustLevel,
  PolicyAction,
  NetworkZone,
  SegmentationPolicy,
  NetworkSegmentationData 
} from '../../types/cyber';

interface NetworkSegmentationPanelProps {
  data: NetworkSegmentationData | null;
  onZoneClick?: (zoneId: string) => void;
  onPolicyClick?: (policyId: string) => void;
}

const zoneTypeColors: Record<ZoneType, string> = {
  dmz: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  internal: 'text-green-400 bg-green-500/20 border-green-500/30',
  external: 'text-red-400 bg-red-500/20 border-red-500/30',
  restricted: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  management: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
  guest: 'text-neutral-400 bg-neutral-500/20 border-neutral-500/30',
};

const trustLevelColors: Record<TrustLevel, string> = {
  untrusted: 'text-red-400',
  low: 'text-orange-400',
  medium: 'text-yellow-400',
  high: 'text-green-400',
  trusted: 'text-cyan-400',
};

const actionColors: Record<PolicyAction, string> = {
  allow: 'text-green-400 bg-green-500/20',
  deny: 'text-red-400 bg-red-500/20',
  log: 'text-blue-400 bg-blue-500/20',
  alert: 'text-amber-400 bg-amber-500/20',
};

const ZoneCard = ({ 
  zone, 
  onClick 
}: { 
  zone: NetworkZone; 
  onClick?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${zoneTypeColors[zone.zone_type]}`}
    >
      <div 
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`p-2 rounded-lg ${zoneTypeColors[zone.zone_type].split(' ').slice(0, 2).join(' ')}`}>
          <Network className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-1.5 py-0.5 rounded text-xs uppercase ${zoneTypeColors[zone.zone_type].split(' ').slice(0, 2).join(' ')}`}>
              {zone.zone_type}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${trustLevelColors[zone.trust_level]}`}>
              {zone.trust_level} trust
            </span>
          </div>
          
          <h4 className="font-medium text-white">{zone.name}</h4>
          <p className="text-sm text-neutral-400">{zone.description}</p>
          
          {/* Quick stats */}
          <div className="flex gap-4 mt-2 text-xs text-neutral-500">
            <span>{zone.subnets.length} subnets</span>
            <span>{zone.hosts} hosts</span>
            <span>{zone.services.length} services</span>
          </div>
        </div>
        
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        )}
      </div>
      
      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-neutral-700 space-y-3"
          >
            {/* Subnets */}
            <div>
              <h5 className="text-sm font-medium text-white mb-2">Subnets</h5>
              <div className="flex flex-wrap gap-1">
                {zone.subnets.map(subnet => (
                  <code key={subnet} className="px-2 py-0.5 bg-neutral-700 text-neutral-300 rounded text-xs">
                    {subnet}
                  </code>
                ))}
              </div>
            </div>
            
            {/* Services */}
            {zone.services.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-white mb-2">Services</h5>
                <div className="flex flex-wrap gap-1">
                  {zone.services.map(service => (
                    <span key={service} className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Compliance */}
            <div className="flex items-center gap-2">
              {zone.compliance_status ? (
                <span className="flex items-center gap-1 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Compliant
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-400 text-sm">
                  <XCircle className="w-4 h-4" />
                  Non-compliant
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const PolicyRow = ({ 
  policy, 
  zones,
  onClick 
}: { 
  policy: SegmentationPolicy; 
  zones: NetworkZone[];
  onClick?: () => void;
}) => {
  const sourceZone = zones.find(z => z.id === policy.source_zone);
  const destZone = zones.find(z => z.id === policy.destination_zone);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
        !policy.is_enabled 
          ? 'bg-neutral-800/30 border-neutral-700 opacity-60' 
          : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-600'
      }`}
    >
      {/* Source zone */}
      <div className={`px-2 py-1 rounded text-xs ${sourceZone ? zoneTypeColors[sourceZone.zone_type].split(' ').slice(0, 2).join(' ') : 'bg-neutral-700 text-neutral-300'}`}>
        {sourceZone?.name || 'Unknown'}
      </div>
      
      {/* Arrow with action */}
      <div className="flex flex-col items-center">
        <span className={`px-1.5 py-0.5 rounded text-xs uppercase ${actionColors[policy.action]}`}>
          {policy.action}
        </span>
        <ArrowRight className="w-4 h-4 text-neutral-500 mt-0.5" />
      </div>
      
      {/* Destination zone */}
      <div className={`px-2 py-1 rounded text-xs ${destZone ? zoneTypeColors[destZone.zone_type].split(' ').slice(0, 2).join(' ') : 'bg-neutral-700 text-neutral-300'}`}>
        {destZone?.name || 'Unknown'}
      </div>
      
      {/* Services/Ports */}
      <div className="flex-1 flex gap-1 justify-center">
        {policy.services.slice(0, 3).map(svc => (
          <span key={svc} className="px-1.5 py-0.5 bg-neutral-700 text-neutral-300 rounded text-xs">
            {svc}
          </span>
        ))}
        {policy.services.length > 3 && (
          <span className="text-xs text-neutral-500">+{policy.services.length - 3}</span>
        )}
      </div>
      
      {/* Status indicators */}
      <div className="flex items-center gap-2">
        {policy.is_logged && (
          <Eye className="w-4 h-4 text-blue-400" title="Logged" />
        )}
        {!policy.is_enabled && (
          <Lock className="w-4 h-4 text-neutral-500" title="Disabled" />
        )}
      </div>
    </motion.div>
  );
};

export const NetworkSegmentationPanel = ({ 
  data, 
  onZoneClick,
  onPolicyClick 
}: NetworkSegmentationPanelProps) => {
  const [viewMode, setViewMode] = useState<'zones' | 'policies'>('zones');
  const [zoneFilter, setZoneFilter] = useState<ZoneType | 'ALL'>('ALL');
  const [actionFilter, setActionFilter] = useState<PolicyAction | 'ALL'>('ALL');
  
  const filteredZones = useMemo(() => {
    if (!data) return [];
    return data.zones.filter(z => 
      zoneFilter === 'ALL' || z.zone_type === zoneFilter
    );
  }, [data, zoneFilter]);
  
  const filteredPolicies = useMemo(() => {
    if (!data) return [];
    return data.policies.filter(p => 
      actionFilter === 'ALL' || p.action === actionFilter
    );
  }, [data, actionFilter]);
  
  const stats = useMemo(() => {
    if (!data) return null;
    return {
      totalZones: data.zones.length,
      totalPolicies: data.policies.length,
      allowPolicies: data.policies.filter(p => p.action === 'allow').length,
      denyPolicies: data.policies.filter(p => p.action === 'deny').length,
      compliantZones: data.zones.filter(z => z.compliance_status).length,
      totalHosts: data.zones.reduce((sum, z) => sum + z.hosts, 0),
    };
  }, [data]);
  
  if (!data) {
    return (
      <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
        <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
          <Network className="w-8 h-8 mb-2 opacity-50" />
          <p>No network segmentation data available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Network Segmentation</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {stats && stats.compliantZones < stats.totalZones && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-sm">
              <AlertTriangle className="w-3 h-3" />
              {stats.totalZones - stats.compliantZones} Non-compliant
            </span>
          )}
        </div>
      </div>
      
      {/* Stats overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-white">{stats.totalZones}</div>
            <div className="text-xs text-neutral-500">Network Zones</div>
          </div>
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400">{stats.totalHosts}</div>
            <div className="text-xs text-neutral-500">Total Hosts</div>
          </div>
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{stats.allowPolicies}</div>
            <div className="text-xs text-neutral-500">Allow Policies</div>
          </div>
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{stats.denyPolicies}</div>
            <div className="text-xs text-neutral-500">Deny Policies</div>
          </div>
        </div>
      )}
      
      {/* View toggle */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1 p-1 bg-neutral-800 rounded-lg">
          <button
            onClick={() => setViewMode('zones')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === 'zones' 
                ? 'bg-cyan-600 text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Zones ({data.zones.length})
          </button>
          <button
            onClick={() => setViewMode('policies')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === 'policies' 
                ? 'bg-cyan-600 text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Policies ({data.policies.length})
          </button>
        </div>
        
        {viewMode === 'zones' ? (
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value as any)}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
          >
            <option value="ALL">All Zone Types</option>
            {Object.keys(zoneTypeColors).map(type => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>
        ) : (
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as any)}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
          >
            <option value="ALL">All Actions</option>
            <option value="allow">Allow</option>
            <option value="deny">Deny</option>
            <option value="log">Log</option>
            <option value="alert">Alert</option>
          </select>
        )}
      </div>
      
      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto pr-2">
        {viewMode === 'zones' ? (
          <div className="space-y-3">
            {filteredZones.length > 0 ? (
              filteredZones.map(zone => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  onClick={() => onZoneClick?.(zone.id)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                <Network className="w-8 h-8 mb-2 opacity-50" />
                <p>No zones match filters</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPolicies.length > 0 ? (
              filteredPolicies.map(policy => (
                <PolicyRow
                  key={policy.id}
                  policy={policy}
                  zones={data.zones}
                  onClick={() => onPolicyClick?.(policy.id)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                <Shield className="w-8 h-8 mb-2 opacity-50" />
                <p>No policies match filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkSegmentationPanel;
