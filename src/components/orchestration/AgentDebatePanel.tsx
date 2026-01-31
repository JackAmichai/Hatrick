/**
 * Feature 4: Agent Debate Panel
 * Real-time animated debate visualization between agents
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Swords, Shield, Target } from 'lucide-react';
import type { DebateRound } from '../../types/orchestration';

interface AgentDebatePanelProps {
  debateRounds: DebateRound[];
  isDebating: boolean;
  autoPlay?: boolean;
}

const roundTypeIcons: Record<string, React.ReactNode> = {
  opening: <MessageSquare className="w-4 h-4" />,
  challenge: <Swords className="w-4 h-4" />,
  rebuttal: <Shield className="w-4 h-4" />,
  closing: <Target className="w-4 h-4" />,
};

const roundTypeColors: Record<string, string> = {
  opening: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  challenge: 'bg-red-500/20 border-red-500/30 text-red-400',
  rebuttal: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  closing: 'bg-green-500/20 border-green-500/30 text-green-400',
};

const personalityColors: Record<string, string> = {
  aggressive: 'from-red-500 to-orange-500',
  cautious: 'from-blue-500 to-cyan-500',
  innovative: 'from-purple-500 to-pink-500',
  analytical: 'from-cyan-500 to-teal-500',
  strategic: 'from-amber-500 to-yellow-500',
};

const TypewriterText = ({ text, speed = 20 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed]);
  
  return <span>{displayedText}</span>;
};

const DebateBubble = ({ round, isNew }: { round: DebateRound; isNew: boolean }) => {
  const isRed = round.agent_id.includes('RED');
  const gradientClass = personalityColors[round.personality] || personalityColors.analytical;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: isRed ? -50 : 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`flex ${isRed ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className={`max-w-[80%] ${isRed ? 'order-1' : 'order-2'}`}>
        {/* Agent Avatar */}
        <div className={`flex items-center gap-2 mb-1 ${isRed ? '' : 'flex-row-reverse'}`}>
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white text-sm font-bold`}>
            {round.personality_icon}
          </div>
          <div className={`${isRed ? 'text-left' : 'text-right'}`}>
            <span className={`text-sm font-semibold ${isRed ? 'text-red-400' : 'text-blue-400'}`}>
              {round.agent_name}
            </span>
            <span className={`ml-2 px-2 py-0.5 rounded text-xs border ${roundTypeColors[round.round_type]}`}>
              {roundTypeIcons[round.round_type]} {round.round_type}
            </span>
          </div>
        </div>
        
        {/* Speech Bubble */}
        <div
          className={`relative p-4 rounded-2xl ${
            isRed 
              ? 'bg-red-500/10 border border-red-500/30 rounded-tl-sm' 
              : 'bg-blue-500/10 border border-blue-500/30 rounded-tr-sm'
          }`}
        >
          <p className="text-neutral-200 text-sm leading-relaxed">
            {isNew ? <TypewriterText text={round.statement} speed={15} /> : round.statement}
          </p>
          
          {round.target_agent && (
            <div className="mt-2 text-xs text-neutral-500">
              ↳ Challenging: <span className="text-amber-400">{round.target_agent}</span>
            </div>
          )}
          
          <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
            <span>Confidence: {(round.confidence * 100).toFixed(0)}%</span>
            <span>{new Date(round.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const AgentDebatePanel = ({ debateRounds, isDebating, autoPlay = true }: AgentDebatePanelProps) => {
  const [visibleRounds, setVisibleRounds] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (autoPlay && debateRounds.length > 0) {
      const interval = setInterval(() => {
        setVisibleRounds(prev => {
          if (prev < debateRounds.length) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 2000);
      
      return () => clearInterval(interval);
    } else {
      setVisibleRounds(debateRounds.length);
    }
  }, [debateRounds, autoPlay]);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleRounds]);
  
  // Group rounds by type
  const roundsByType = debateRounds.reduce((acc, round) => {
    acc[round.round_type] = (acc[round.round_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="p-6 bg-neutral-900/80 rounded-xl border border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Agent Debate</h3>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(roundsByType).map(([type, count]) => (
            <span key={type} className={`px-2 py-1 rounded text-xs border ${roundTypeColors[type]}`}>
              {count} {type}
            </span>
          ))}
        </div>
      </div>
      
      {isDebating && visibleRounds < debateRounds.length && (
        <div className="flex items-center gap-2 mb-4 text-sm text-amber-400">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 bg-amber-400 rounded-full"
          />
          Debate in progress...
        </div>
      )}
      
      <div 
        ref={scrollRef}
        className="max-h-[500px] overflow-y-auto pr-2 space-y-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence>
          {debateRounds.slice(0, visibleRounds).map((round, index) => (
            <DebateBubble
              key={`${round.agent_id}-${round.round_type}-${index}`}
              round={round}
              isNew={index === visibleRounds - 1}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {debateRounds.length === 0 && !isDebating && (
        <p className="text-neutral-400 text-center py-8">No debate session active</p>
      )}
      
      {/* Progress indicator */}
      {debateRounds.length > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Round Progress</span>
            <span>{visibleRounds} / {debateRounds.length}</span>
          </div>
          <div className="mt-2 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${(visibleRounds / debateRounds.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDebatePanel;
