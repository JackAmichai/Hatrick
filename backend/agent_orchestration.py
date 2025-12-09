"""
Advanced Agent Orchestration System
Implements voting, debate, confidence scoring, and hierarchical coordination
"""
import json
import random
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum

class AgentPersonality(Enum):
    AGGRESSIVE = "aggressive"
    CAUTIOUS = "cautious"
    INNOVATIVE = "innovative"
    ANALYTICAL = "analytical"
    STRATEGIC = "strategic"

@dataclass
class AgentMetrics:
    """Track agent performance over time"""
    agent_id: str
    success_rate: float = 0.0
    total_missions: int = 0
    avg_response_time: float = 0.0
    creativity_score: float = 0.0
    confidence_avg: float = 0.0
    specialization: str = "General"
    
    def to_dict(self):
        return asdict(self)

@dataclass
class AgentProposal:
    """Structured proposal from an agent"""
    agent_id: str
    agent_name: str
    proposal_text: str
    confidence: float  # 0.0 to 1.0
    reasoning: str
    estimated_impact: int  # damage or mitigation
    vote_weight: float = 1.0
    personality: str = "analytical"
    
    def to_dict(self):
        return asdict(self)

class AgentMemory:
    """Persistent memory system for agents"""
    def __init__(self):
        self.mission_history: List[Dict[str, Any]] = []
        self.learned_patterns: Dict[str, List[str]] = {}
        self.successful_strategies: List[Dict[str, Any]] = []
        self.failed_strategies: List[Dict[str, Any]] = []
    
    def add_mission(self, mission_type: str, outcome: str, strategy: str, success: bool):
        """Record mission outcome"""
        entry = {
            "mission_type": mission_type,
            "outcome": outcome,
            "strategy": strategy,
            "success": success,
            "timestamp": "current"  # Would use real timestamp
        }
        self.mission_history.append(entry)
        
        if success:
            self.successful_strategies.append(entry)
        else:
            self.failed_strategies.append(entry)
    
    def get_successful_patterns(self, mission_type: str) -> List[str]:
        """Retrieve successful strategies for a mission type"""
        return [s["strategy"] for s in self.successful_strategies 
                if s["mission_type"] == mission_type]
    
    def get_learned_context(self, mission_type: str) -> str:
        """Generate context from past missions"""
        successful = self.get_successful_patterns(mission_type)
        if not successful:
            return "No prior experience with this mission type."
        
        return f"Past successful strategies: {', '.join(successful[:3])}"

class VotingOrchestrator:
    """Manages multi-agent voting and consensus"""
    def __init__(self):
        self.proposals: List[AgentProposal] = []
        self.memory = AgentMemory()
        self.agent_metrics: Dict[str, AgentMetrics] = {}
    
    def add_proposal(self, proposal: AgentProposal):
        """Add agent proposal to voting pool"""
        self.proposals.append(proposal)
    
    def calculate_weighted_votes(self) -> Dict[str, Any]:
        """Calculate votes with confidence weighting"""
        if not self.proposals:
            return {"error": "No proposals to vote on"}
        
        # Weight votes by confidence and past performance
        weighted_scores = []
        for proposal in self.proposals:
            # Get agent metrics
            metrics = self.agent_metrics.get(
                proposal.agent_id, 
                AgentMetrics(agent_id=proposal.agent_id)
            )
            
            # Calculate total score
            performance_weight = metrics.success_rate if metrics.total_missions > 0 else 0.5
            confidence_weight = proposal.confidence
            
            total_score = (performance_weight * 0.4 + confidence_weight * 0.6) * proposal.estimated_impact
            
            weighted_scores.append({
                "proposal": proposal,
                "score": total_score,
                "votes": {
                    "confidence": confidence_weight,
                    "performance": performance_weight,
                    "total": total_score
                }
            })
        
        # Sort by score
        weighted_scores.sort(key=lambda x: x["score"], reverse=True)
        
        return {
            "winner": weighted_scores[0]["proposal"].to_dict(),
            "all_votes": [
                {
                    "agent": s["proposal"].agent_name,
                    "score": s["score"],
                    "confidence": s["proposal"].confidence,
                    "proposal": s["proposal"].proposal_text
                }
                for s in weighted_scores
            ],
            "consensus_strength": weighted_scores[0]["score"] / sum(s["score"] for s in weighted_scores)
        }
    
    def generate_debate(self) -> List[Dict[str, str]]:
        """Generate debate between agents"""
        if len(self.proposals) < 2:
            return []
        
        debate_rounds = []
        
        # Round 1: Each agent presents their case
        for proposal in self.proposals:
            debate_rounds.append({
                "agent": proposal.agent_name,
                "type": "opening",
                "statement": f"I propose {proposal.proposal_text}. My confidence is {proposal.confidence:.0%} because {proposal.reasoning}"
            })
        
        # Round 2: Agents challenge each other
        for i, proposal in enumerate(self.proposals):
            opponent = self.proposals[(i + 1) % len(self.proposals)]
            
            challenge = self._generate_challenge(proposal, opponent)
            debate_rounds.append({
                "agent": proposal.agent_name,
                "type": "challenge",
                "statement": challenge,
                "target": opponent.agent_name
            })
        
        # Round 3: Final arguments
        top_two = sorted(self.proposals, key=lambda p: p.confidence, reverse=True)[:2]
        for proposal in top_two:
            debate_rounds.append({
                "agent": proposal.agent_name,
                "type": "closing",
                "statement": f"To summarize: {proposal.proposal_text} with {proposal.estimated_impact} impact. This is the optimal choice."
            })
        
        return debate_rounds
    
    def _generate_challenge(self, challenger: AgentProposal, opponent: AgentProposal) -> str:
        """Generate challenge statement between agents"""
        if challenger.estimated_impact > opponent.estimated_impact:
            return f"While {opponent.agent_name}'s approach has merit, my strategy delivers {challenger.estimated_impact - opponent.estimated_impact} more impact."
        elif challenger.confidence > opponent.confidence:
            return f"I have {(challenger.confidence - opponent.confidence)*100:.0f}% higher confidence in my approach compared to {opponent.agent_name}'s proposal."
        else:
            return f"My {challenger.personality} approach offers a different perspective that {opponent.agent_name} may have overlooked."
    
    def update_agent_metrics(self, agent_id: str, success: bool, response_time: float):
        """Update performance metrics after mission"""
        if agent_id not in self.agent_metrics:
            self.agent_metrics[agent_id] = AgentMetrics(agent_id=agent_id)
        
        metrics = self.agent_metrics[agent_id]
        metrics.total_missions += 1
        
        # Update success rate
        old_total = (metrics.total_missions - 1) * metrics.success_rate
        metrics.success_rate = (old_total + (1.0 if success else 0.0)) / metrics.total_missions
        
        # Update response time
        old_time_total = (metrics.total_missions - 1) * metrics.avg_response_time
        metrics.avg_response_time = (old_time_total + response_time) / metrics.total_missions
    
    def clear_proposals(self):
        """Reset proposals for next round"""
        self.proposals = []

class ChiefStrategist:
    """Hierarchical coordinator agent"""
    def __init__(self, team: str, orchestrator: VotingOrchestrator):
        self.team = team
        self.orchestrator = orchestrator
        self.memory = AgentMemory()
    
    def coordinate_subagents(self, scan_result: str, weaponizer_result: str, 
                           inf_result: str, data_result: str) -> Dict[str, Any]:
        """Synthesize insights from all sub-agents"""
        
        # Retrieve historical context
        historical_context = self.memory.get_learned_context("current_mission")
        
        synthesis = {
            "coordination_summary": f"Analyzed inputs from 4 specialized agents.",
            "key_insights": [
                f"Scan: {scan_result[:50]}...",
                f"Infrastructure: {inf_result[:50]}...",
                f"Data: {data_result[:50]}...",
                f"Weaponization: {weaponizer_result[:50]}..."
            ],
            "strategic_recommendation": "Combining reconnaissance with infrastructure analysis reveals optimal attack vector.",
            "confidence": self._calculate_coordination_confidence([scan_result, weaponizer_result, inf_result, data_result]),
            "historical_context": historical_context
        }
        
        return synthesis
    
    def _calculate_coordination_confidence(self, results: List[str]) -> float:
        """Calculate confidence based on sub-agent agreement"""
        # Simple heuristic: longer responses = more confident
        avg_length = sum(len(r) for r in results) / len(results)
        confidence = min(0.95, 0.5 + (avg_length / 500))
        return confidence
    
    def make_final_decision(self, vote_results: Dict[str, Any]) -> Dict[str, Any]:
        """Chief makes final call after reviewing votes"""
        winner = vote_results.get("winner", {})
        consensus = vote_results.get("consensus_strength", 0.5)
        
        decision = {
            "approved": consensus > 0.4,  # Require 40% consensus
            "reasoning": f"Consensus strength: {consensus:.0%}. " + 
                        ("Strong agreement across agents." if consensus > 0.6 else "Moderate agreement, proceeding with caution."),
            "selected_strategy": winner.get("proposal_text", "Default strategy"),
            "override": consensus < 0.3  # Chief can override weak consensus
        }
        
        return decision

class AgentReflection:
    """Self-reflection and improvement system"""
    def __init__(self):
        self.reflection_history: List[Dict[str, Any]] = []
    
    def reflect_on_output(self, agent_id: str, original_output: str, 
                         context: str) -> Dict[str, Any]:
        """Agent reviews its own output"""
        
        # Analyze output quality
        quality_score = self._assess_quality(original_output)
        
        reflection = {
            "agent_id": agent_id,
            "original_output": original_output,
            "quality_score": quality_score,
            "improvements": [],
            "revised_output": original_output
        }
        
        # Identify improvements
        if len(original_output) < 50:
            reflection["improvements"].append("Output too brief, needs more detail")
            reflection["revised_output"] += " [Enhanced with additional technical details]"
        
        if "error" in original_output.lower():
            reflection["improvements"].append("Contains error indicators, needs revision")
        
        if quality_score < 0.6:
            reflection["improvements"].append("Low quality score, recommending reprocessing")
        
        self.reflection_history.append(reflection)
        
        return reflection
    
    def _assess_quality(self, output: str) -> float:
        """Simple quality assessment"""
        score = 0.5
        
        # Length check
        if 50 < len(output) < 500:
            score += 0.2
        
        # Technical term check
        technical_terms = ["vulnerability", "exploit", "CVE", "firewall", "encryption"]
        if any(term in output.lower() for term in technical_terms):
            score += 0.2
        
        # No error indicators
        if "error" not in output.lower():
            score += 0.1
        
        return min(1.0, score)

# Singleton instances
voting_orchestrator = VotingOrchestrator()
red_strategist = ChiefStrategist("RED", voting_orchestrator)
blue_strategist = ChiefStrategist("BLUE", voting_orchestrator)
reflection_engine = AgentReflection()
