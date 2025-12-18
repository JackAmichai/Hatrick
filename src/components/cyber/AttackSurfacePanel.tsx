/**
 * Feature 28: Attack Surface Visualization
 * Display and monitor organizational attack surface
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Server,
  Cloud,
  Smartphone,
  Users,
  Database,
  Wifi,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import type { 
  AssetType,
  ExposureLevel,
  AttackSurfaceAsset,
  AttackSurfaceMetrics 
} from '../../types/cyber';

interface AttackSurfacePanelProps {
  assets: AttackSurfaceAsset[];
  metrics: AttackSurfaceMetrics | null;
  onAssetClick?: (assetId: string) => void;
}

const assetIcons: Record<AssetType, typeof Server> = {
  server: Server,
  endpoint: Smartphone,
  cloud: Cloud,
  network: Wifi,
  application: Globe,
  database: Database,
  identity: Users,
};

const assetColors: Record<AssetType, string> = {
  server: 'text-blue-400 bg-blue-500/20',
  endpoint: 'text-purple-400 bg-purple-500/20',
  cloud: 'text-cyan-400 bg-cyan-500/20',
  network: 'text-green-400 bg-green-500/20',
  application: 'text-amber-400 bg-amber-500/20',
  database: 'text-red-400 bg-red-500/20',
  identity: 'text-pink-400 bg-pink-500/20',
};

const exposureColors: Record<ExposureLevel, string> = {
  critical: 'text-red-400 bg-red-500/20 border-red-500/30',
  high: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  low: 'text-green-400 bg-green-500/20 border-green-500/30',
};

const AssetCard = ({ 
  asset
}: { 
  asset: AttackSurfaceAsset; 
  onClick?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = assetIcons[asset.asset_type];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        asset.exposure === 'critical' 
          ? 'bg-red-500/10 border-red-500/30' 
          : asset.exposure === 'high'
            ? 'bg-orange-500/10 border-orange-500/30'
            : 'bg-neutral-800/50 border-neutral-700'
      }`}
    >
      <div 
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`p-2 rounded-lg ${assetColors[asset.asset_type]}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-1.5 py-0.5 rounded text-xs uppercase ${assetColors[asset.asset_type]}`}>
              {asset.asset_type}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-xs border ${exposureColors[asset.exposure]}`}>
              {asset.exposure} exposure
            </span>
            {asset.is_external && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">
                <ExternalLink className="w-3 h-3" />
                External
              </span>
            )}
          </div>
          
          <h4 className="font-medium text-white truncate">{asset.name}</h4>
          <p className="text-sm text-neutral-400 truncate">{asset.description}</p>
          
          {/* Quick stats */}
          <div className="flex gap-4 mt-2 text-xs text-neutral-500">
            <span>{asset.vulnerabilities} vulnerabilities</span>
            <span>{asset.open_ports.length} open ports</span>
            <span>{asset.services.length} services</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{asset.risk_score}</div>
            <div className="text-xs text-neutral-500">Risk</div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          )}
        </div>
      </div>
      
      {/* Tags */}
      {asset.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-12">
          {asset.tags.slice(0, 4).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-neutral-700 text-neutral-300 rounded text-xs">
              {tag}
            </span>
          ))}
          {asset.tags.length > 4 && (
            <span className="text-xs text-neutral-500">+{asset.tags.length - 4}</span>
          )}
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
            {/* IP and last scan */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {asset.ip_address && (
                <div>
                  <span className="text-neutral-500">IP Address:</span>
                  <code className="ml-2 text-cyan-400">{asset.ip_address}</code>
                </div>
              )}
              <div>
                <span className="text-neutral-500">Last Scan:</span>
                <span className="ml-2 text-white">{new Date(asset.last_scanned).toLocaleString()}</span>
              </div>
            </div>
            
            {/* Open ports */}
            {asset.open_ports.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-white mb-2">Open Ports</h5>
                <div className="flex flex-wrap gap-1">
                  {asset.open_ports.map(port => (
                    <span key={port} className="px-2 py-0.5 bg-neutral-700 text-neutral-300 rounded text-xs font-mono">
                      {port}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Services */}
            {asset.services.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-white mb-2">Services</h5>
                <div className="flex flex-wrap gap-1">
                  {asset.services.map(svc => (
                    <span key={svc} className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Technologies */}
            {asset.technologies.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-white mb-2">Technologies</h5>
                <div className="flex flex-wrap gap-1">
                  {asset.technologies.map(tech => (
                    <span key={tech} className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const AttackSurfacePanel = ({ 
  assets, 
  metrics,
  onAssetClick 
}: AttackSurfacePanelProps) => {
  const [typeFilter, setTypeFilter] = useState<AssetType | 'ALL'>('ALL');
  const [exposureFilter, setExposureFilter] = useState<ExposureLevel | 'ALL'>('ALL');
  const [showExternal, setShowExternal] = useState(false);
  
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesType = typeFilter === 'ALL' || a.asset_type === typeFilter;
      const matchesExposure = exposureFilter === 'ALL' || a.exposure === exposureFilter;
      const matchesExternal = !showExternal || a.is_external;
      return matchesType && matchesExposure && matchesExternal;
    }).sort((a, b) => b.risk_score - a.risk_score);
  }, [assets, typeFilter, exposureFilter, showExternal]);
  
  const stats = useMemo(() => ({
    total: assets.length,
    external: assets.filter(a => a.is_external).length,
    critical: assets.filter(a => a.exposure === 'critical').length,
    high: assets.filter(a => a.exposure === 'high').length,
    totalVulns: assets.reduce((sum, a) => sum + a.vulnerabilities, 0),
    byType: Object.keys(assetIcons).reduce((acc, type) => {
      acc[type] = assets.filter(a => a.asset_type === type).length;
      return acc;
    }, {} as Record<string, number>),
  }), [assets]);
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Attack Surface</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {stats.critical > 0 && (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-sm">
              {stats.critical} Critical
            </span>
          )}
          <span className="text-sm text-neutral-400">{stats.total} assets</span>
        </div>
      </div>
      
      {/* Metrics overview */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">{metrics.total_assets}</div>
              {metrics.change_30d.assets !== 0 && (
                <span className={`flex items-center gap-1 text-xs ${metrics.change_30d.assets > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                  {metrics.change_30d.assets > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(metrics.change_30d.assets)}
                </span>
              )}
            </div>
            <div className="text-xs text-neutral-500">Total Assets</div>
          </div>
          
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-amber-400">{metrics.external_assets}</div>
              <ExternalLink className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xs text-neutral-500">External Facing</div>
          </div>
          
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-red-400">{metrics.total_vulnerabilities}</div>
              {metrics.change_30d.vulnerabilities !== 0 && (
                <span className={`flex items-center gap-1 text-xs ${metrics.change_30d.vulnerabilities > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {metrics.change_30d.vulnerabilities > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(metrics.change_30d.vulnerabilities)}
                </span>
              )}
            </div>
            <div className="text-xs text-neutral-500">Vulnerabilities</div>
          </div>
          
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className={`text-2xl font-bold ${
              metrics.risk_score >= 70 ? 'text-red-400' 
              : metrics.risk_score >= 40 ? 'text-amber-400' 
              : 'text-green-400'
            }`}>
              {metrics.risk_score}
            </div>
            <div className="text-xs text-neutral-500">Overall Risk</div>
          </div>
        </div>
      )}
      
      {/* Asset type breakdown */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-4">
        {Object.entries(assetIcons).map(([type, Icon]) => (
          <button
            key={type}
            onClick={() => setTypeFilter(typeFilter === type ? 'ALL' : type as AssetType)}
            className={`p-2 rounded-lg border text-center transition-all ${
              typeFilter === type 
                ? 'bg-cyan-500/20 border-cyan-500/50' 
                : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-600'
            }`}
          >
            <Icon className={`w-4 h-4 mx-auto mb-1 ${assetColors[type as AssetType].split(' ')[0]}`} />
            <div className="text-sm font-bold text-white">{stats.byType[type] || 0}</div>
            <div className="text-xs text-neutral-500 capitalize truncate">{type}</div>
          </button>
        ))}
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={exposureFilter}
          onChange={(e) => setExposureFilter(e.target.value as any)}
          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Exposure Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showExternal}
            onChange={(e) => setShowExternal(e.target.checked)}
            className="rounded bg-neutral-700 border-neutral-600 text-cyan-500 focus:ring-cyan-500"
          />
          <span className="text-sm text-neutral-400">External only</span>
        </label>
      </div>
      
      {/* Asset list */}
      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
        {filteredAssets.length > 0 ? (
          filteredAssets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onClick={() => onAssetClick?.(asset.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <Globe className="w-8 h-8 mb-2 opacity-50" />
            <p>No assets match filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttackSurfacePanel;
