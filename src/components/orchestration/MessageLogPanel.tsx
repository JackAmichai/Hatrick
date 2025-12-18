/**
 * Feature 13: Agent Communication Protocol Visualization
 * Shows the message bus log with pub/sub channels
 */
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Radio, ArrowRight, Hash, Clock } from 'lucide-react';
import type { MessageBusLog, AgentMessage } from '../../types/orchestration';

interface MessageLogPanelProps {
  log: MessageBusLog | null;
}

const channelColors: Record<string, string> = {
  'strategy': 'bg-purple-500',
  'tactics': 'bg-blue-500',
  'analysis': 'bg-green-500',
  'coordination': 'bg-yellow-500',
  'broadcast': 'bg-red-500',
  'default': 'bg-neutral-500'
};

const MessageRow = ({ message, index }: { message: AgentMessage; index: number }) => {
  const channelColor = channelColors[message.channel] || channelColors.default;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-3 bg-neutral-800/30 rounded-lg hover:bg-neutral-800/50 transition-colors"
    >
      {/* Channel indicator */}
      <div className={`w-2 h-full min-h-[40px] rounded-full ${channelColor}`} />
      
      {/* Message content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-medium text-cyan-400 text-sm">
            {message.from_agent.replace('_', ' ')}
          </span>
          <ArrowRight className="w-3 h-3 text-neutral-500" />
          <span className="font-medium text-amber-400 text-sm">
            {message.to_agent ? message.to_agent.replace('_', ' ') : 'broadcast'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded text-xs ${channelColor} bg-opacity-20`}>
            <Hash className="w-3 h-3 inline mr-1" />
            {message.channel}
          </span>
          <span className="text-xs text-neutral-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        
        <p className="text-sm text-neutral-300 leading-relaxed break-words">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
};

export const MessageLogPanel = ({ log }: MessageLogPanelProps) => {
  const hasMessages = log && log.messages.length > 0;
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Message Bus</h3>
        </div>
        
        {log && (
          <span className="text-sm text-neutral-400">
            {log.total_messages} total messages
          </span>
        )}
      </div>
      
      {/* Channel legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(channelColors).filter(([k]) => k !== 'default').map(([channel, color]) => (
          <div key={channel} className="flex items-center gap-1 px-2 py-1 bg-neutral-800/50 rounded text-xs">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-neutral-400">{channel}</span>
          </div>
        ))}
      </div>
      
      {/* Messages list */}
      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700">
        <AnimatePresence mode="popLayout">
          {hasMessages ? (
            log.messages.map((message, index) => (
              <MessageRow 
                key={`${message.from_agent}-${message.timestamp}-${index}`} 
                message={message} 
                index={index}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-neutral-500"
            >
              <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
              <p>No messages yet</p>
              <p className="text-xs mt-1">Messages will appear as agents communicate</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MessageLogPanel;
