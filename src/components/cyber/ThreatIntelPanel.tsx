/**
 * Feature 19: Threat Intelligence Feed
 * Display threat indicators, campaigns, and intelligence summary
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, 
  Search, 
  AlertTriangle,
  Globe,
  Hash,
  Link,
  Mail,
  Server,
  Target,
  Users,
  Calendar,
  Activity,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import type { 
  ThreatIndicator, 
  ThreatCampaign, 
  ThreatIntelSummary,
  IndicatorType,
  ThreatSeverity 
} from '../../types/cyber';

interface ThreatIntelPanelProps {
  indicators: ThreatIndicator[];
  campaigns: ThreatCampaign[];
  summary: ThreatIntelSummary | null;
  onIndicatorClick?: (indicatorId: string) => void;
  onCampaignClick?: (campaignId: string) => void;
}

const indicatorIcons: Record<IndicatorType, typeof Server> = {
  ip: Server,
  domain: Globe,
  hash: Hash,
  url: Link,
  email: Mail,
};

const severityColors: Record<ThreatSeverity, { text: string; bg: string }> = {
  critical: { text: 'text-red-400', bg: 'bg-red-500/20' },
  high: { text: 'text-orange-400', bg: 'bg-orange-500/20' },
  medium: { text: 'text-amber-400', bg: 'bg-amber-500/20' },
  low: { text: 'text-green-400', bg: 'bg-green-500/20' },
};

const IndicatorCard = ({ indicator }: { indicator: ThreatIndicator }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = indicatorIcons[indicator.indicator_type];
  const colors = severityColors[indicator.severity];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg hover:border-neutral-600 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${colors.bg} ${colors.text}`}>
              {indicator.severity.toUpperCase()}
            </span>
            <span className="text-xs text-neutral-500 uppercase">
              {indicator.indicator_type}
            </span>
          </div>
          
          <code className="text-sm text-white font-mono break-all">
            {indicator.value}
          </code>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {indicator.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-neutral-700 text-neutral-300 rounded text-xs">
                {tag}
              </span>
            ))}
            {indicator.tags.length > 3 && (
              <span className="text-xs text-neutral-500">+{indicator.tags.length - 3}</span>
            )}
          </div>
        </div>
        
        {/* Confidence */}
        <div className="text-right">
          <div className="text-xs text-neutral-500">Confidence</div>
          <div className={`text-sm font-bold ${
            indicator.confidence >= 0.8 ? 'text-green-400' :
            indicator.confidence >= 0.5 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {(indicator.confidence * 100).toFixed(0)}%
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
            className="mt-3 pt-3 border-t border-neutral-700"
          >
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-neutral-500">Threat Type</span>
                <p className="text-white capitalize">{indicator.threat_type}</p>
              </div>
              <div>
                <span className="text-neutral-500">Source</span>
                <p className="text-white">{indicator.source}</p>
              </div>
              <div>
                <span className="text-neutral-500">First Seen</span>
                <p className="text-white">{indicator.first_seen}</p>
              </div>
              <div>
                <span className="text-neutral-500">Last Seen</span>
                <p className="text-white">{indicator.last_seen}</p>
              </div>
            </div>
            
            {/* MITRE Techniques */}
            {indicator.mitre_techniques.length > 0 && (
              <div className="mt-3">
                <span className="text-xs text-neutral-500">MITRE Techniques:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {indicator.mitre_techniques.map(tech => (
                    <span key={tech} className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">
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

const CampaignCard = ({ campaign }: { campaign: ThreatCampaign }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        campaign.active 
          ? 'bg-red-500/10 border-red-500/30' 
          : 'bg-neutral-800/50 border-neutral-700'
      } cursor-pointer`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className={`w-5 h-5 ${campaign.active ? 'text-red-400' : 'text-neutral-400'}`} />
          <h4 className="font-bold text-white">{campaign.name}</h4>
          {campaign.active && (
            <span className="px-2 py-0.5 bg-red-500/30 text-red-400 rounded text-xs animate-pulse">
              ACTIVE
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        )}
      </div>
      
      <p className="text-sm text-neutral-400 mb-2 line-clamp-2">{campaign.description}</p>
      
      {/* Quick stats */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`px-2 py-0.5 rounded capitalize ${
          campaign.motivation === 'financial' ? 'bg-green-500/20 text-green-400' :
          campaign.motivation === 'espionage' ? 'bg-purple-500/20 text-purple-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {campaign.motivation}
        </span>
        <span className="text-neutral-500">{campaign.techniques.length} techniques</span>
        <span className="text-neutral-500">{campaign.indicators.length} indicators</span>
      </div>
      
      {/* Expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-neutral-700 space-y-3"
          >
            {/* Aliases */}
            {campaign.aliases.length > 0 && (
              <div>
                <span className="text-xs text-neutral-500">Also known as:</span>
                <p className="text-sm text-white">{campaign.aliases.join(', ')}</p>
              </div>
            )}
            
            {/* Targets */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-neutral-500">Target Sectors:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {campaign.target_sectors.map(sector => (
                    <span key={sector} className="px-1.5 py-0.5 bg-neutral-700 text-neutral-300 rounded text-xs">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-neutral-500">Target Regions:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {campaign.target_regions.map(region => (
                    <span key={region} className="px-1.5 py-0.5 bg-neutral-700 text-neutral-300 rounded text-xs">
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Timeline */}
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                First seen: {campaign.first_seen}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Last activity: {campaign.last_activity}
              </span>
            </div>
            
            {/* Techniques */}
            <div>
              <span className="text-xs text-neutral-500">MITRE Techniques:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {campaign.techniques.map(tech => (
                  <span key={tech} className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const ThreatIntelPanel = ({ 
  indicators, 
  campaigns, 
  summary,
  onIndicatorClick,
  onCampaignClick 
}: ThreatIntelPanelProps) => {
  const [activeTab, setActiveTab] = useState<'indicators' | 'campaigns'>('indicators');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<IndicatorType | 'ALL'>('ALL');
  
  const filteredIndicators = useMemo(() => {
    return indicators.filter(ind => {
      const matchesSearch = searchQuery === '' ||
        ind.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ind.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === 'ALL' || ind.indicator_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [indicators, searchQuery, typeFilter]);
  
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(camp => {
      return searchQuery === '' ||
        camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camp.description.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [campaigns, searchQuery]);
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Threat Intelligence</h3>
        </div>
        
        {summary && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-neutral-400">{summary.total_indicators} indicators</span>
            <span className={`px-2 py-0.5 rounded ${
              summary.active_campaigns > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}>
              {summary.active_campaigns} active campaigns
            </span>
          </div>
        )}
      </div>
      
      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Object.entries(summary.by_type).map(([type, count]) => {
            const Icon = indicatorIcons[type as IndicatorType] || Server;
            return (
              <button
                key={type}
                onClick={() => {
                  setActiveTab('indicators');
                  setTypeFilter(typeFilter === type ? 'ALL' : type as IndicatorType);
                }}
                className={`p-2 rounded-lg border text-center transition-all ${
                  typeFilter === type 
                    ? 'bg-cyan-500/20 border-cyan-500/50' 
                    : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-600'
                }`}
              >
                <Icon className="w-4 h-4 mx-auto mb-1 text-neutral-400" />
                <div className="text-lg font-bold text-white">{count}</div>
                <div className="text-xs text-neutral-500 uppercase">{type}s</div>
              </button>
            );
          })}
        </div>
      )}
      
      {/* Tabs and search */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1 p-1 bg-neutral-800 rounded-lg">
          <button
            onClick={() => setActiveTab('indicators')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              activeTab === 'indicators' 
                ? 'bg-cyan-600 text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Indicators ({indicators.length})
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              activeTab === 'campaigns' 
                ? 'bg-cyan-600 text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Campaigns ({campaigns.length})
          </button>
        </div>
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search indicators or campaigns..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        <AnimatePresence mode="wait">
          {activeTab === 'indicators' ? (
            filteredIndicators.length > 0 ? (
              filteredIndicators.map(ind => (
                <IndicatorCard key={ind.id} indicator={ind} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                <p>No indicators match your filters</p>
              </div>
            )
          ) : (
            filteredCampaigns.length > 0 ? (
              filteredCampaigns.map(camp => (
                <CampaignCard key={camp.id} campaign={camp} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                <Users className="w-8 h-8 mb-2 opacity-50" />
                <p>No campaigns match your search</p>
              </div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ThreatIntelPanel;
