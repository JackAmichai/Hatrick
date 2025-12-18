/**
 * Feature 22: Incident Timeline
 * Interactive timeline for security incident tracking and visualization
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  AlertTriangle, 
  Shield, 
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
  Server,
  User,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import type { 
  Incident, 
  TimelineEvent, 
  IncidentSeverity, 
  IncidentStatus 
} from '../../types/cyber';

interface IncidentTimelineProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onIncidentSelect?: (incidentId: string) => void;
  onEventClick?: (eventId: string) => void;
}

const severityConfig: Record<IncidentSeverity, { color: string; bg: string; icon: typeof AlertTriangle }> = {
  critical: { color: 'text-red-400', bg: 'bg-red-500', icon: AlertTriangle },
  high: { color: 'text-orange-400', bg: 'bg-orange-500', icon: AlertCircle },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500', icon: AlertCircle },
  low: { color: 'text-green-400', bg: 'bg-green-500', icon: Shield },
};

const statusConfig: Record<IncidentStatus, { color: string; bg: string; icon: typeof Clock }> = {
  open: { color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertCircle },
  investigating: { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: Search },
  contained: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', icon: Shield },
  resolved: { color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle },
  closed: { color: 'text-neutral-400', bg: 'bg-neutral-500/20', icon: XCircle },
};

const TimelineEventCard = ({ 
  event, 
  isFirst: _isFirst,
  isLast,
  onClick: _onClick 
}: { 
  event: TimelineEvent; 
  isFirst: boolean;
  isLast: boolean;
  onClick?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = severityConfig[event.severity];
  const Icon = config.icon;
  
  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${config.bg} z-10`} />
        {!isLast && (
          <div className="w-px flex-1 bg-neutral-700" />
        )}
      </div>
      
      {/* Event content */}
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}
      >
        <div 
          className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg cursor-pointer hover:border-neutral-600 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${config.color}`} />
              <span className={`px-1.5 py-0.5 rounded text-xs ${config.bg}/20 ${config.color}`}>
                {event.severity.toUpperCase()}
              </span>
              <span className="text-xs text-neutral-500">{event.event_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">
                {new Date(event.timestamp).toLocaleString()}
              </span>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              )}
            </div>
          </div>
          
          <p className="text-sm text-white">{event.description}</p>
          <p className="text-xs text-neutral-500 mt-1">Source: {event.source}</p>
          
          {/* Expanded details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-neutral-700 space-y-2"
              >
                {/* Indicators */}
                {event.indicators.length > 0 && (
                  <div>
                    <span className="text-xs text-neutral-500">Indicators:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.indicators.map((ind, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-neutral-700 text-neutral-300 rounded text-xs font-mono">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* MITRE Techniques */}
                {event.mitre_techniques.length > 0 && (
                  <div>
                    <span className="text-xs text-neutral-500">MITRE Techniques:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.mitre_techniques.map(tech => (
                        <span key={tech} className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Evidence */}
                {event.evidence.length > 0 && (
                  <div>
                    <span className="text-xs text-neutral-500">Evidence:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.evidence.map((ev, i) => (
                        <span key={i} className="flex items-center gap-1 px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                          <FileText className="w-3 h-3" />
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const IncidentCard = ({ 
  incident, 
  isSelected,
  onSelect 
}: { 
  incident: Incident; 
  isSelected: boolean;
  onSelect?: () => void;
}) => {
  const sevConfig = severityConfig[incident.severity];
  const statConfig = statusConfig[incident.status];
  const StatusIcon = statConfig.icon;
  
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected 
          ? 'bg-cyan-500/10 border-cyan-500/50' 
          : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-600'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${sevConfig.bg}/20 ${sevConfig.color}`}>
            {incident.severity.toUpperCase()}
          </span>
          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${statConfig.bg} ${statConfig.color}`}>
            <StatusIcon className="w-3 h-3" />
            {incident.status}
          </span>
        </div>
        <span className="text-xs text-neutral-500">
          {incident.events.length} events
        </span>
      </div>
      
      <h4 className="font-medium text-white text-sm mb-1">{incident.title}</h4>
      <p className="text-xs text-neutral-400 line-clamp-2">{incident.description}</p>
      
      <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
        <Clock className="w-3 h-3" />
        <span>{new Date(incident.created_at).toLocaleDateString()}</span>
        {incident.assigned_to && (
          <>
            <span>•</span>
            <User className="w-3 h-3" />
            <span>{incident.assigned_to}</span>
          </>
        )}
      </div>
    </motion.div>
  );
};

export const IncidentTimeline = ({ 
  incidents, 
  selectedIncident,
  onIncidentSelect,
  onEventClick 
}: IncidentTimelineProps) => {
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'ALL'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'ALL'>('ALL');
  
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
      const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
      return matchesStatus && matchesSeverity;
    });
  }, [incidents, statusFilter, severityFilter]);
  
  const stats = useMemo(() => ({
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open').length,
    investigating: incidents.filter(i => i.status === 'investigating').length,
    critical: incidents.filter(i => i.severity === 'critical').length,
  }), [incidents]);
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Incident Timeline</h3>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          {stats.open > 0 && (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded animate-pulse">
              {stats.open} Open
            </span>
          )}
          {stats.investigating > 0 && (
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">
              {stats.investigating} Investigating
            </span>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | 'ALL')}
          className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="contained">Contained</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as IncidentSeverity | 'ALL')}
          className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
        >
          <option value="ALL">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Incidents list */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map(incident => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                isSelected={selectedIncident?.id === incident.id}
                onSelect={() => onIncidentSelect?.(incident.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
              <Shield className="w-8 h-8 mb-2 opacity-50" />
              <p>No incidents match filters</p>
            </div>
          )}
        </div>
        
        {/* Timeline for selected incident */}
        <div className="bg-neutral-800/30 rounded-lg p-4 max-h-[500px] overflow-y-auto">
          {selectedIncident ? (
            <>
              <div className="mb-4 pb-4 border-b border-neutral-700">
                <h4 className="font-bold text-white mb-1">{selectedIncident.title}</h4>
                <p className="text-sm text-neutral-400">{selectedIncident.description}</p>
                
                {/* Affected assets */}
                {selectedIncident.affected_assets.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedIncident.affected_assets.map((asset, i) => (
                      <span key={i} className="flex items-center gap-1 px-1.5 py-0.5 bg-neutral-700 text-neutral-300 rounded text-xs">
                        <Server className="w-3 h-3" />
                        {asset}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Events timeline */}
              <div className="space-y-0">
                {selectedIncident.events.map((event, index) => (
                  <TimelineEventCard
                    key={event.id}
                    event={event}
                    isFirst={index === 0}
                    isLast={index === selectedIncident.events.length - 1}
                    onClick={() => onEventClick?.(event.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-neutral-500">
              <Activity className="w-8 h-8 mb-2 opacity-50" />
              <p>Select an incident to view timeline</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentTimeline;
