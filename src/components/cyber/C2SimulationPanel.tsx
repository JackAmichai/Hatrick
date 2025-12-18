/**
 * Feature 30: C2 (Command & Control) Simulation Panel
 * Simulate and visualize C2 traffic patterns
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, 
  Activity,
  Server,
  Play,
  Pause,
  Square,
  ChevronDown,
  ChevronRight,
  Send,
  Download
} from 'lucide-react';
import type { 
  C2Protocol,
  C2Status,
  BeaconStatus,
  C2Channel,
  C2Beacon 
} from '../../types/cyber';

interface C2SimulationPanelProps {
  channels: C2Channel[];
  beacons: C2Beacon[];
  onChannelToggle?: (channelId: string) => void;
  onBeaconSelect?: (beaconId: string) => void;
  onStartSimulation?: () => void;
  onStopSimulation?: () => void;
}

const protocolColors: Record<C2Protocol, string> = {
  http: 'text-blue-400 bg-blue-500/20',
  https: 'text-green-400 bg-green-500/20',
  dns: 'text-purple-400 bg-purple-500/20',
  icmp: 'text-cyan-400 bg-cyan-500/20',
  smtp: 'text-amber-400 bg-amber-500/20',
  custom: 'text-pink-400 bg-pink-500/20',
};

const statusColors: Record<C2Status, string> = {
  active: 'text-green-400 bg-green-500/20 border-green-500/30',
  dormant: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  lost: 'text-neutral-500 bg-neutral-600/20 border-neutral-600/30',
  detected: 'text-red-400 bg-red-500/20 border-red-500/30',
  blocked: 'text-neutral-400 bg-neutral-500/20 border-neutral-500/30',
};

const beaconStatusColors: Record<BeaconStatus, string> = {
  active: 'text-green-400',
  dormant: 'text-amber-400',
  lost: 'text-neutral-400',
  alive: 'text-green-400',
  sleeping: 'text-amber-400',
  dead: 'text-neutral-400',
  compromised: 'text-red-400',
};

const formatInterval = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
};

const ChannelCard = ({ 
  channel, 
  onToggle 
}: { 
  channel: C2Channel; 
  onToggle?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        channel.status === 'detected' 
          ? 'bg-red-500/10 border-red-500/30' 
          : channel.status === 'active'
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-neutral-800/50 border-neutral-700'
      }`}
    >
      <div 
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`p-2 rounded-lg ${protocolColors[channel.protocol]}`}>
          <Radio className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-1.5 py-0.5 rounded text-xs uppercase ${protocolColors[channel.protocol]}`}>
              {channel.protocol}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-xs border ${statusColors[channel.status]}`}>
              {channel.status}
            </span>
            {channel.is_encrypted && (
              <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                Encrypted
              </span>
            )}
          </div>
          
          <h4 className="font-medium text-white">{channel.name}</h4>
          <code className="text-xs text-neutral-400">{channel.target_host}:{channel.target_port}</code>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <div className="text-neutral-500">Beacon Interval</div>
            <div className="text-white font-medium">
              {formatInterval(channel.beacon_interval_min)}-{formatInterval(channel.beacon_interval_max)}
            </div>
          </div>
          
          {onToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className={`p-2 rounded-lg transition-colors ${
                channel.status === 'active' 
                  ? 'bg-red-500/20 hover:bg-red-500/30' 
                  : 'bg-green-500/20 hover:bg-green-500/30'
              }`}
            >
              {channel.status === 'active' ? (
                <Pause className="w-4 h-4 text-red-400" />
              ) : (
                <Play className="w-4 h-4 text-green-400" />
              )}
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
            className="mt-4 pt-4 border-t border-neutral-700 space-y-3"
          >
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-2 bg-neutral-900/50 rounded text-center">
                <div className="text-lg font-bold text-white">{channel.total_beacons}</div>
                <div className="text-xs text-neutral-500">Total Beacons</div>
              </div>
              <div className="p-2 bg-neutral-900/50 rounded text-center">
                <div className="text-lg font-bold text-cyan-400">{channel.bytes_sent}</div>
                <div className="text-xs text-neutral-500">Bytes Sent</div>
              </div>
              <div className="p-2 bg-neutral-900/50 rounded text-center">
                <div className="text-lg font-bold text-purple-400">{channel.bytes_received}</div>
                <div className="text-xs text-neutral-500">Bytes Received</div>
              </div>
            </div>
            
            {/* Jitter info */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-neutral-500">Jitter: <span className="text-white">{channel.jitter_percent}%</span></span>
              <span className="text-neutral-500">Last beacon: <span className="text-white">{new Date(channel.last_beacon).toLocaleTimeString()}</span></span>
            </div>
            
            {/* Evasion techniques */}
            {channel.evasion_techniques.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-white mb-2">Evasion Techniques</h5>
                <div className="flex flex-wrap gap-1">
                  {channel.evasion_techniques.map(technique => (
                    <span key={technique} className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">
                      {technique}
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

const BeaconRow = ({ 
  beacon, 
  onSelect 
}: { 
  beacon: C2Beacon; 
  onSelect?: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onSelect}
      className="flex items-center gap-3 p-3 bg-neutral-800/30 hover:bg-neutral-800/50 rounded-lg cursor-pointer transition-colors"
    >
      <div className={`w-2 h-2 rounded-full ${
        beacon.status === 'alive' ? 'bg-green-400 animate-pulse' :
        beacon.status === 'sleeping' ? 'bg-amber-400' :
        beacon.status === 'compromised' ? 'bg-red-400' :
        'bg-neutral-400'
      }`} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <code className="text-sm text-white truncate">{beacon.id.substring(0, 12)}...</code>
          <span className={`text-xs ${beaconStatusColors[beacon.status]}`}>{beacon.status}</span>
        </div>
        <div className="text-xs text-neutral-500">{beacon.hostname} ({beacon.ip_address})</div>
      </div>
      
      <div className="text-right text-xs">
        <div className="text-neutral-400">{beacon.os}</div>
        <div className="text-neutral-500">Last: {new Date(beacon.last_seen).toLocaleTimeString()}</div>
      </div>
    </motion.div>
  );
};

export const C2SimulationPanel = ({ 
  channels, 
  beacons,
  onChannelToggle,
  onBeaconSelect,
  onStartSimulation,
  onStopSimulation 
}: C2SimulationPanelProps) => {
  const [viewMode, setViewMode] = useState<'channels' | 'beacons'>('channels');
  const [statusFilter, setStatusFilter] = useState<C2Status | 'ALL'>('ALL');
  
  const filteredChannels = useMemo(() => {
    return channels.filter(c => 
      statusFilter === 'ALL' || c.status === statusFilter
    );
  }, [channels, statusFilter]);
  
  const stats = useMemo(() => ({
    totalChannels: channels.length,
    activeChannels: channels.filter(c => c.status === 'active').length,
    detectedChannels: channels.filter(c => c.status === 'detected').length,
    totalBeacons: beacons.length,
    aliveBeacons: beacons.filter(b => b.status === 'alive').length,
    totalBytesSent: channels.reduce((sum, c) => sum + c.bytes_sent, 0),
    totalBytesReceived: channels.reduce((sum, c) => sum + c.bytes_received, 0),
  }), [channels, beacons]);
  
  const isSimulationRunning = stats.activeChannels > 0;
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">C2 Simulation</h3>
          {isSimulationRunning && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-sm animate-pulse">
              <Activity className="w-3 h-3" />
              Active
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onStartSimulation && onStopSimulation && (
            <button
              onClick={isSimulationRunning ? onStopSimulation : onStartSimulation}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                isSimulationRunning 
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                  : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
              }`}
            >
              {isSimulationRunning ? (
                <>
                  <Square className="w-4 h-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
          <div className="text-2xl font-bold text-white">{stats.activeChannels}/{stats.totalChannels}</div>
          <div className="text-xs text-neutral-500">Active Channels</div>
        </div>
        <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{stats.aliveBeacons}</div>
          <div className="text-xs text-neutral-500">Live Beacons</div>
        </div>
        <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-cyan-400" />
            <span className="text-lg font-bold text-cyan-400">{stats.totalBytesSent}</span>
          </div>
          <div className="text-xs text-neutral-500">Bytes Sent</div>
        </div>
        <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-purple-400" />
            <span className="text-lg font-bold text-purple-400">{stats.totalBytesReceived}</span>
          </div>
          <div className="text-xs text-neutral-500">Bytes Received</div>
        </div>
      </div>
      
      {/* View toggle */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1 p-1 bg-neutral-800 rounded-lg">
          <button
            onClick={() => setViewMode('channels')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === 'channels' 
                ? 'bg-cyan-600 text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Channels ({stats.totalChannels})
          </button>
          <button
            onClick={() => setViewMode('beacons')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === 'beacons' 
                ? 'bg-cyan-600 text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Beacons ({stats.totalBeacons})
          </button>
        </div>
        
        {viewMode === 'channels' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as C2Status | 'ALL')}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="dormant">Dormant</option>
            <option value="detected">Detected</option>
            <option value="blocked">Blocked</option>
          </select>
        )}
      </div>
      
      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto pr-2">
        {viewMode === 'channels' ? (
          <div className="space-y-3">
            {filteredChannels.length > 0 ? (
              filteredChannels.map(channel => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onToggle={onChannelToggle ? () => onChannelToggle(channel.id) : undefined}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                <Radio className="w-8 h-8 mb-2 opacity-50" />
                <p>No C2 channels configured</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {beacons.length > 0 ? (
              beacons.map(beacon => (
                <BeaconRow
                  key={beacon.id}
                  beacon={beacon}
                  onSelect={onBeaconSelect ? () => onBeaconSelect(beacon.id) : undefined}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                <Server className="w-8 h-8 mb-2 opacity-50" />
                <p>No beacons active</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default C2SimulationPanel;
