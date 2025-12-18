/**
 * Feature 31: Phishing Simulation Panel
 * Phishing campaign simulation and awareness tracking
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  MousePointer,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Send,
  ChevronDown,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import type { 
  CampaignStatus,
  PhishingCampaign,
  PhishingMetrics 
} from '../../types/cyber';

interface PhishingSimulationPanelProps {
  campaigns: PhishingCampaign[];
  metrics: PhishingMetrics | null;
  onCampaignClick?: (campaignId: string) => void;
  onStartCampaign?: (campaignId: string) => void;
  onStopCampaign?: (campaignId: string) => void;
}

const statusColors: Record<CampaignStatus, string> = {
  draft: 'text-neutral-400 bg-neutral-500/20 border-neutral-500/30',
  scheduled: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  active: 'text-green-400 bg-green-500/20 border-green-500/30',
  paused: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  running: 'text-green-400 bg-green-500/20 border-green-500/30',
  completed: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
  cancelled: 'text-red-400 bg-red-500/20 border-red-500/30',
};

const MetricBar = ({ 
  value, 
  max, 
  color, 
  label 
}: { 
  value: number; 
  max: number; 
  color: string; 
  label: string;
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-neutral-400">{label}</span>
        <span className="text-white">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
};

const CampaignCard = ({ 
  campaign, 
  onClick: _onClick,
  onStart,
  onStop 
}: { 
  campaign: PhishingCampaign; 
  onClick?: () => void;
  onStart?: () => void;
  onStop?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const clickRate = campaign.emails_sent > 0 
    ? ((campaign.links_clicked / campaign.emails_sent) * 100).toFixed(1) 
    : '0';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border bg-neutral-800/50 border-neutral-700"
    >
      <div 
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-2 rounded-lg bg-cyan-500/20">
          <Mail className="w-5 h-5 text-cyan-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-1.5 py-0.5 rounded text-xs border ${statusColors[campaign.status]}`}>
              {campaign.status}
            </span>
            <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
              {campaign.template_type}
            </span>
          </div>
          
          <h4 className="font-medium text-white">{campaign.name}</h4>
          <p className="text-sm text-neutral-400 truncate">{campaign.description}</p>
          
          {/* Quick stats */}
          <div className="flex gap-4 mt-2 text-xs">
            <span className="text-neutral-500">
              <Users className="w-3 h-3 inline mr-1" />
              {campaign.total_targets} targets
            </span>
            <span className="text-cyan-400">
              <Send className="w-3 h-3 inline mr-1" />
              {campaign.emails_sent} sent
            </span>
            <span className={parseFloat(clickRate) > 20 ? 'text-red-400' : 'text-green-400'}>
              <MousePointer className="w-3 h-3 inline mr-1" />
              {clickRate}% clicked
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {campaign.status === 'active' && onStop && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStop();
              }}
              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded text-xs transition-colors"
            >
              Pause
            </button>
          )}
          {(campaign.status === 'draft' || campaign.status === 'paused') && onStart && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs transition-colors"
            >
              Start
            </button>
          )}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          )}
        </div>
      </div>
      
      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-neutral-700 space-y-4"
          >
            {/* Progress metrics */}
            <div className="space-y-3">
              <MetricBar 
                value={campaign.emails_opened} 
                max={campaign.emails_sent} 
                color="bg-blue-500" 
                label="Opened" 
              />
              <MetricBar 
                value={campaign.links_clicked} 
                max={campaign.emails_sent} 
                color="bg-amber-500" 
                label="Clicked Link" 
              />
              <MetricBar 
                value={campaign.credentials_submitted} 
                max={campaign.emails_sent} 
                color="bg-red-500" 
                label="Submitted Credentials" 
              />
              <MetricBar 
                value={campaign.reported} 
                max={campaign.emails_sent} 
                color="bg-green-500" 
                label="Reported as Phishing" 
              />
            </div>
            
            {/* Timeline */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-neutral-500">Start Date:</span>
                <span className="ml-2 text-white">{new Date(campaign.start_date).toLocaleDateString()}</span>
              </div>
              {campaign.end_date && (
                <div>
                  <span className="text-neutral-500">End Date:</span>
                  <span className="ml-2 text-white">{new Date(campaign.end_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            {/* Department breakdown */}
            {campaign.department_stats && Object.keys(campaign.department_stats).length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-white mb-2">Department Click Rates</h5>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(campaign.department_stats)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 6)
                    .map(([dept, rate]) => (
                      <div key={dept} className="flex items-center justify-between p-2 bg-neutral-900/50 rounded text-xs">
                        <span className="text-neutral-400 truncate">{dept}</span>
                        <span className={rate > 20 ? 'text-red-400' : 'text-green-400'}>{rate}%</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const PhishingSimulationPanel = ({ 
  campaigns, 
  metrics,
  onCampaignClick,
  onStartCampaign,
  onStopCampaign 
}: PhishingSimulationPanelProps) => {
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'ALL'>('ALL');
  
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => 
      statusFilter === 'ALL' || c.status === statusFilter
    );
  }, [campaigns, statusFilter]);
  
  const stats = useMemo(() => ({
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.emails_sent, 0),
    totalClicked: campaigns.reduce((sum, c) => sum + c.links_clicked, 0),
    totalReported: campaigns.reduce((sum, c) => sum + c.reported, 0),
  }), [campaigns]);
  
  const overallClickRate = stats.totalSent > 0 
    ? ((stats.totalClicked / stats.totalSent) * 100).toFixed(1) 
    : '0';
  const overallReportRate = stats.totalSent > 0 
    ? ((stats.totalReported / stats.totalSent) * 100).toFixed(1) 
    : '0';
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Phishing Simulation</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {stats.active > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-sm animate-pulse">
              {stats.active} Active
            </span>
          )}
        </div>
      </div>
      
      {/* Overall metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">{metrics.total_campaigns}</div>
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-xs text-neutral-500">Total Campaigns</div>
          </div>
          
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${parseFloat(String(metrics.avg_click_rate)) > 20 ? 'text-red-400' : 'text-green-400'}`}>
                {metrics.avg_click_rate}%
              </div>
              {metrics.click_rate_trend === 'decreasing' ? (
                <TrendingDown className="w-5 h-5 text-green-400" />
              ) : metrics.click_rate_trend === 'increasing' ? (
                <TrendingUp className="w-5 h-5 text-red-400" />
              ) : null}
            </div>
            <div className="text-xs text-neutral-500">Avg Click Rate</div>
          </div>
          
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{metrics.avg_report_rate}%</div>
            <div className="text-xs text-neutral-500">Avg Report Rate</div>
          </div>
          
          <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
            <div className="text-2xl font-bold text-amber-400">{metrics.users_trained}</div>
            <div className="text-xs text-neutral-500">Users Trained</div>
          </div>
        </div>
      )}
      
      {/* High risk departments */}
      {metrics && metrics.high_risk_departments.length > 0 && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">High Risk Departments</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics.high_risk_departments.map(dept => (
              <span key={dept} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                {dept}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Campaigns</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
        
        <div className="text-sm text-neutral-400">
          Overall: <span className={parseFloat(overallClickRate) > 20 ? 'text-red-400' : 'text-green-400'}>{overallClickRate}% clicked</span>
          {' • '}
          <span className="text-green-400">{overallReportRate}% reported</span>
        </div>
      </div>
      
      {/* Campaigns list */}
      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onClick={() => onCampaignClick?.(campaign.id)}
              onStart={onStartCampaign ? () => onStartCampaign(campaign.id) : undefined}
              onStop={onStopCampaign ? () => onStopCampaign(campaign.id) : undefined}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <Mail className="w-8 h-8 mb-2 opacity-50" />
            <p>No campaigns match filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhishingSimulationPanel;
