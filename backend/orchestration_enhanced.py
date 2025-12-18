"""
Enhanced Agent Orchestration System
Features 1-15: AI Agent Orchestration Enhancements

This module provides sophisticated multi-agent coordination including:
- Multi-Agent Voting with Weighted Consensus
- Agent Memory System (RAG-ready)
- Agent Personality System
- Real-Time Debate Generation
- Agent Specialization Scoring
- Chain-of-Thought Reasoning
- Collaboration Tracking
- Hierarchical Coordination
- Confidence Calibration
- Multi-Model Ensemble
- Self-Reflection
- Async Execution Tracking
- Communication Protocol
- Dynamic Agent Spawning
- Cost/Efficiency Tracking
"""

import json
import random
import time
import hashlib
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict, field
from enum import Enum
from datetime import datetime


# ============================================
# FEATURE 3: AGENT PERSONALITY SYSTEM
# ============================================
class AgentPersonality(Enum):
    """Agent personality types that affect behavior and decision-making"""
    AGGRESSIVE = "aggressive"
    CAUTIOUS = "cautious"
    INNOVATIVE = "innovative"
    ANALYTICAL = "analytical"
    STRATEGIC = "strategic"


PERSONALITY_MODIFIERS: Dict[AgentPersonality, Dict[str, Any]] = {
    AgentPersonality.AGGRESSIVE: {
        "risk_tolerance": 0.9,
        "confidence_bias": 0.15,
        "creativity_boost": 1.2,
        "damage_modifier": 1.3,
        "defense_modifier": 0.8,
        "description": "Favors high-impact, high-risk strategies",
        "color": "#ef4444",  # red
        "icon": "⚔️"
    },
    AgentPersonality.CAUTIOUS: {
        "risk_tolerance": 0.3,
        "confidence_bias": -0.1,
        "creativity_boost": 0.8,
        "damage_modifier": 0.85,
        "defense_modifier": 1.25,
        "description": "Prefers proven, low-risk methods",
        "color": "#3b82f6",  # blue
        "icon": "🛡️"
    },
    AgentPersonality.INNOVATIVE: {
        "risk_tolerance": 0.7,
        "confidence_bias": 0.05,
        "creativity_boost": 1.5,
        "damage_modifier": 1.1,
        "defense_modifier": 1.0,
        "description": "Explores novel zero-day approaches",
        "color": "#8b5cf6",  # purple
        "icon": "💡"
    },
    AgentPersonality.ANALYTICAL: {
        "risk_tolerance": 0.5,
        "confidence_bias": 0.0,
        "creativity_boost": 1.0,
        "damage_modifier": 1.0,
        "defense_modifier": 1.1,
        "description": "Data-driven, evidence-based decisions",
        "color": "#06b6d4",  # cyan
        "icon": "📊"
    },
    AgentPersonality.STRATEGIC: {
        "risk_tolerance": 0.6,
        "confidence_bias": 0.05,
        "creativity_boost": 1.1,
        "damage_modifier": 1.05,
        "defense_modifier": 1.15,
        "description": "Long-term planning with chained attacks",
        "color": "#f59e0b",  # amber
        "icon": "♟️"
    }
}


# ============================================
# FEATURE 6: CHAIN-OF-THOUGHT REASONING
# ============================================
@dataclass
class ThoughtStep:
    """Single step in chain-of-thought reasoning"""
    step_number: int
    thought_type: str  # observation, analysis, hypothesis, decision
    content: str
    confidence: float
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ChainOfThought:
    """Full chain-of-thought reasoning process"""
    agent_id: str
    mission_context: str
    steps: List[ThoughtStep] = field(default_factory=list)
    final_conclusion: str = ""
    total_time_ms: int = 0

    def add_step(self, thought_type: str, content: str, confidence: float) -> ThoughtStep:
        step = ThoughtStep(
            step_number=len(self.steps) + 1,
            thought_type=thought_type,
            content=content,
            confidence=confidence
        )
        self.steps.append(step)
        return step

    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent_id": self.agent_id,
            "mission_context": self.mission_context,
            "steps": [s.to_dict() for s in self.steps],
            "final_conclusion": self.final_conclusion,
            "total_time_ms": self.total_time_ms
        }


# ============================================
# FEATURE 5: AGENT METRICS & SPECIALIZATION
# ============================================
@dataclass
class AgentMetrics:
    """Track agent performance with specialization scoring"""
    agent_id: str
    agent_name: str
    team: str  # RED or BLUE
    personality: AgentPersonality = AgentPersonality.ANALYTICAL
    
    # Performance metrics
    success_rate: float = 0.5
    total_missions: int = 0
    avg_response_time_ms: float = 0.0
    
    # Feature 9: Calibration tracking
    calibration_score: float = 0.5  # How well confidence matches outcomes
    confidence_history: List[Tuple[float, bool]] = field(default_factory=list)
    
    # Feature 5: Specialization per mission type
    specialization_scores: Dict[str, float] = field(default_factory=dict)
    
    # Feature 7: Collaboration scores with other agents
    collaboration_scores: Dict[str, float] = field(default_factory=dict)
    
    # Feature 15: Cost tracking
    total_tokens_used: int = 0
    total_cost_usd: float = 0.0
    
    def get_specialization_bonus(self, mission_type: str) -> float:
        """Get expertise bonus for a specific mission type"""
        return self.specialization_scores.get(mission_type, 0.0)
    
    def update_specialization(self, mission_type: str, success: bool):
        """Update specialization score based on mission outcome"""
        current = self.specialization_scores.get(mission_type, 0.0)
        delta = 0.05 if success else -0.02
        self.specialization_scores[mission_type] = max(-0.1, min(0.3, current + delta))
    
    def update_calibration(self, confidence: float, success: bool):
        """Update calibration score (confidence vs actual outcome)"""
        self.confidence_history.append((confidence, success))
        if len(self.confidence_history) > 50:
            self.confidence_history = self.confidence_history[-50:]
        
        # Calculate calibration: perfect = confidence matches success rate
        if len(self.confidence_history) >= 5:
            errors = []
            for conf, succ in self.confidence_history[-10:]:
                actual = 1.0 if succ else 0.0
                errors.append(abs(conf - actual))
            self.calibration_score = 1.0 - (sum(errors) / len(errors))
    
    def update_collaboration(self, other_agent_id: str, success: bool):
        """Update collaboration score with another agent"""
        current = self.collaboration_scores.get(other_agent_id, 0.5)
        delta = 0.05 if success else -0.03
        self.collaboration_scores[other_agent_id] = max(0.0, min(1.0, current + delta))
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "team": self.team,
            "personality": self.personality.value,
            "personality_info": PERSONALITY_MODIFIERS[self.personality],
            "success_rate": round(self.success_rate, 3),
            "total_missions": self.total_missions,
            "avg_response_time_ms": round(self.avg_response_time_ms, 1),
            "calibration_score": round(self.calibration_score, 3),
            "specialization_scores": {k: round(v, 3) for k, v in self.specialization_scores.items()},
            "collaboration_scores": {k: round(v, 3) for k, v in self.collaboration_scores.items()},
            "total_tokens_used": self.total_tokens_used,
            "total_cost_usd": round(self.total_cost_usd, 4)
        }


# ============================================
# FEATURE 1: AGENT PROPOSAL & VOTING
# ============================================
@dataclass
class AgentProposal:
    """Structured proposal from an agent for voting"""
    agent_id: str
    agent_name: str
    team: str
    proposal_text: str
    confidence: float
    reasoning: str
    estimated_impact: int  # 0-100
    personality: AgentPersonality = AgentPersonality.ANALYTICAL
    chain_of_thought: Optional[ChainOfThought] = None
    specialization_bonus: float = 0.0
    mitre_technique: Optional[str] = None  # e.g., "T1190"
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "team": self.team,
            "proposal_text": self.proposal_text,
            "confidence": round(self.confidence, 3),
            "reasoning": self.reasoning,
            "estimated_impact": self.estimated_impact,
            "personality": self.personality.value,
            "personality_icon": PERSONALITY_MODIFIERS[self.personality]["icon"],
            "chain_of_thought": self.chain_of_thought.to_dict() if self.chain_of_thought else None,
            "specialization_bonus": round(self.specialization_bonus, 3),
            "mitre_technique": self.mitre_technique
        }


# ============================================
# FEATURE 2: AGENT MEMORY SYSTEM (RAG-READY)
# ============================================
class AgentMemory:
    """Persistent memory system for agents - RAG-ready for vector DB"""
    
    def __init__(self, max_history: int = 100):
        self.mission_history: List[Dict[str, Any]] = []
        self.successful_strategies: List[Dict[str, Any]] = []
        self.failed_strategies: List[Dict[str, Any]] = []
        self.learned_patterns: Dict[str, List[str]] = {}
        self.max_history = max_history
    
    def add_mission(self, mission_type: str, strategy: str, outcome: str,
                   success: bool, context: Dict[str, Any] = None) -> str:
        """Record mission outcome with full context"""
        entry_id = hashlib.md5(
            f"{mission_type}{strategy}{datetime.now().isoformat()}".encode()
        ).hexdigest()[:12]
        
        entry = {
            "id": entry_id,
            "mission_type": mission_type,
            "strategy": strategy,
            "outcome": outcome,
            "success": success,
            "context": context or {},
            "timestamp": datetime.now().isoformat()
        }
        
        self.mission_history.append(entry)
        if len(self.mission_history) > self.max_history:
            self.mission_history = self.mission_history[-self.max_history:]
        
        if success:
            self.successful_strategies.append(entry)
            if mission_type not in self.learned_patterns:
                self.learned_patterns[mission_type] = []
            self.learned_patterns[mission_type].append(strategy)
        else:
            self.failed_strategies.append(entry)
        
        return entry_id
    
    def get_relevant_context(self, mission_type: str) -> str:
        """Get learned context for LLM prompt enhancement"""
        successful = [s["strategy"] for s in self.successful_strategies 
                     if s["mission_type"] == mission_type][-3:]
        failed = [s["strategy"] for s in self.failed_strategies 
                 if s["mission_type"] == mission_type][-2:]
        
        context_parts = []
        if successful:
            context_parts.append(f"Previously successful: {', '.join(successful)}")
        if failed:
            context_parts.append(f"Avoid (failed before): {', '.join(failed)}")
        
        return " | ".join(context_parts) if context_parts else "No prior experience."
    
    def similarity_search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Simple keyword search (placeholder for vector DB)"""
        results = []
        query_lower = query.lower()
        
        for entry in self.mission_history:
            score = 0
            if query_lower in entry["strategy"].lower():
                score += 2
            if query_lower in entry.get("outcome", "").lower():
                score += 1
            if entry["success"]:
                score += 0.5
            if score > 0:
                results.append({"entry": entry, "score": score})
        
        results.sort(key=lambda x: x["score"], reverse=True)
        return [r["entry"] for r in results[:top_k]]
    
    def export_for_vector_db(self) -> List[Dict[str, Any]]:
        """Export in format ready for Pinecone/Chroma ingestion"""
        return [
            {
                "id": entry["id"],
                "text": f"Mission: {entry['mission_type']}. Strategy: {entry['strategy']}. Outcome: {entry['outcome']}",
                "metadata": {
                    "mission_type": entry["mission_type"],
                    "success": entry["success"],
                    "timestamp": entry["timestamp"]
                }
            }
            for entry in self.mission_history
        ]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_missions": len(self.mission_history),
            "successful_count": len(self.successful_strategies),
            "failed_count": len(self.failed_strategies),
            "learned_patterns": {k: len(v) for k, v in self.learned_patterns.items()},
            "recent_missions": self.mission_history[-5:]
        }


# ============================================
# FEATURE 4: DEBATE GENERATION
# ============================================
@dataclass
class DebateRound:
    """Single round in agent debate"""
    agent_id: str
    agent_name: str
    round_type: str  # opening, challenge, rebuttal, closing
    statement: str
    target_agent: Optional[str] = None
    confidence: float = 0.5
    personality: AgentPersonality = AgentPersonality.ANALYTICAL
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "round_type": self.round_type,
            "statement": self.statement,
            "target_agent": self.target_agent,
            "confidence": round(self.confidence, 3),
            "personality": self.personality.value,
            "personality_icon": PERSONALITY_MODIFIERS[self.personality]["icon"],
            "timestamp": self.timestamp
        }


# ============================================
# FEATURE 1, 4, 10: VOTING ORCHESTRATOR
# ============================================
class VotingOrchestrator:
    """Manages multi-agent voting, debate, and ensemble decisions"""
    
    def __init__(self):
        self.proposals: List[AgentProposal] = []
        self.agent_metrics: Dict[str, AgentMetrics] = {}
        self.memory = AgentMemory()
        self.voting_history: List[Dict[str, Any]] = []
        self.debate_history: List[List[DebateRound]] = []
    
    def register_agent(self, agent_id: str, agent_name: str, team: str,
                      personality: AgentPersonality = AgentPersonality.ANALYTICAL):
        """Register an agent with the orchestrator"""
        if agent_id not in self.agent_metrics:
            self.agent_metrics[agent_id] = AgentMetrics(
                agent_id=agent_id,
                agent_name=agent_name,
                team=team,
                personality=personality
            )
    
    def add_proposal(self, proposal: AgentProposal):
        """Add agent proposal to voting pool"""
        self.proposals.append(proposal)
    
    def calculate_weighted_votes(self) -> Dict[str, Any]:
        """Feature 1: Calculate votes with confidence weighting"""
        if not self.proposals:
            return {"error": "No proposals to vote on", "all_votes": []}
        
        weighted_scores = []
        
        for proposal in self.proposals:
            metrics = self.agent_metrics.get(proposal.agent_id)
            personality_mod = PERSONALITY_MODIFIERS.get(
                proposal.personality,
                PERSONALITY_MODIFIERS[AgentPersonality.ANALYTICAL]
            )
            
            # Calculate weights
            performance_weight = metrics.success_rate if metrics else 0.5
            confidence_weight = min(1.0, max(0.1, 
                proposal.confidence + personality_mod["confidence_bias"]
            ))
            calibration_weight = metrics.calibration_score if metrics else 0.5
            spec_bonus = proposal.specialization_bonus
            
            # Weighted score formula
            score = (
                performance_weight * 0.25 +
                confidence_weight * 0.35 +
                calibration_weight * 0.20 +
                spec_bonus * 0.20
            ) * proposal.estimated_impact
            
            weighted_scores.append({
                "proposal": proposal,
                "score": score,
                "breakdown": {
                    "performance": round(performance_weight, 3),
                    "confidence": round(confidence_weight, 3),
                    "calibration": round(calibration_weight, 3),
                    "specialization": round(spec_bonus, 3),
                    "base_impact": proposal.estimated_impact,
                    "personality_bias": personality_mod["confidence_bias"]
                }
            })
        
        # Sort by score
        weighted_scores.sort(key=lambda x: x["score"], reverse=True)
        
        # Calculate consensus
        total_score = sum(s["score"] for s in weighted_scores)
        consensus = weighted_scores[0]["score"] / total_score if total_score > 0 else 0
        
        # Vote distribution
        distribution = {}
        for s in weighted_scores:
            pct = (s["score"] / total_score * 100) if total_score > 0 else 0
            distribution[s["proposal"].agent_name] = round(pct, 1)
        
        result = {
            "winner": weighted_scores[0]["proposal"].to_dict(),
            "winner_score": round(weighted_scores[0]["score"], 2),
            "all_votes": [
                {
                    **s["proposal"].to_dict(),
                    "score": round(s["score"], 2),
                    "breakdown": s["breakdown"]
                }
                for s in weighted_scores
            ],
            "consensus_strength": round(consensus, 3),
            "vote_distribution": distribution,
            "total_proposals": len(self.proposals),
            "timestamp": datetime.now().isoformat()
        }
        
        self.voting_history.append(result)
        return result
    
    def generate_debate(self) -> List[Dict[str, Any]]:
        """Feature 4: Generate animated debate between agents"""
        if len(self.proposals) < 2:
            return []
        
        rounds: List[DebateRound] = []
        
        # Round 1: Opening statements
        for p in self.proposals:
            personality_desc = PERSONALITY_MODIFIERS[p.personality]["description"]
            rounds.append(DebateRound(
                agent_id=p.agent_id,
                agent_name=p.agent_name,
                round_type="opening",
                statement=f"I propose: {p.proposal_text}. My confidence is {p.confidence:.0%}. {personality_desc}.",
                confidence=p.confidence,
                personality=p.personality
            ))
        
        # Round 2: Challenges
        for i, p in enumerate(self.proposals):
            opponent = self.proposals[(i + 1) % len(self.proposals)]
            challenge = self._generate_challenge(p, opponent)
            rounds.append(DebateRound(
                agent_id=p.agent_id,
                agent_name=p.agent_name,
                round_type="challenge",
                statement=challenge,
                target_agent=opponent.agent_name,
                confidence=p.confidence,
                personality=p.personality
            ))
        
        # Round 3: Rebuttals
        for p in self.proposals:
            rebuttal = self._generate_rebuttal(p)
            rounds.append(DebateRound(
                agent_id=p.agent_id,
                agent_name=p.agent_name,
                round_type="rebuttal",
                statement=rebuttal,
                confidence=p.confidence,
                personality=p.personality
            ))
        
        # Round 4: Closing (top 2 only)
        sorted_proposals = sorted(self.proposals, key=lambda x: x.confidence, reverse=True)[:2]
        for p in sorted_proposals:
            rounds.append(DebateRound(
                agent_id=p.agent_id,
                agent_name=p.agent_name,
                round_type="closing",
                statement=f"In conclusion: {p.proposal_text} delivers {p.estimated_impact}% impact. The evidence supports my approach.",
                confidence=p.confidence,
                personality=p.personality
            ))
        
        debate_dicts = [r.to_dict() for r in rounds]
        self.debate_history.append(rounds)
        return debate_dicts
    
    def _generate_challenge(self, challenger: AgentProposal, opponent: AgentProposal) -> str:
        """Generate challenge statement"""
        challenges = []
        
        if challenger.estimated_impact > opponent.estimated_impact:
            diff = challenger.estimated_impact - opponent.estimated_impact
            challenges.append(f"My approach delivers {diff}% more impact than {opponent.agent_name}'s strategy.")
        
        if challenger.confidence > opponent.confidence:
            diff = (challenger.confidence - opponent.confidence) * 100
            challenges.append(f"I have {diff:.0f}% higher confidence than {opponent.agent_name}.")
        
        personality_challenges = {
            AgentPersonality.AGGRESSIVE: f"While {opponent.agent_name} hesitates, my bold approach ensures decisive results.",
            AgentPersonality.CAUTIOUS: f"{opponent.agent_name}'s approach carries unnecessary risk that could compromise the mission.",
            AgentPersonality.INNOVATIVE: f"My novel approach exploits vectors that {opponent.agent_name}'s conventional strategy would miss.",
            AgentPersonality.ANALYTICAL: f"The data clearly shows my approach outperforms {opponent.agent_name}'s proposal.",
            AgentPersonality.STRATEGIC: f"My long-term strategy accounts for factors {opponent.agent_name} hasn't considered."
        }
        challenges.append(personality_challenges.get(challenger.personality, ""))
        
        return " ".join([c for c in challenges if c][:2])
    
    def _generate_rebuttal(self, proposal: AgentProposal) -> str:
        """Generate rebuttal statement"""
        rebuttals = {
            AgentPersonality.AGGRESSIVE: "Speed and decisiveness win battles. My approach minimizes time-to-impact.",
            AgentPersonality.CAUTIOUS: "A measured approach ensures mission success without collateral damage.",
            AgentPersonality.INNOVATIVE: "Defenders can't block what they've never seen. Novelty is my advantage.",
            AgentPersonality.ANALYTICAL: "The evidence supports my conclusion. Numbers don't lie.",
            AgentPersonality.STRATEGIC: "This move sets up three follow-on attacks. I'm thinking ahead."
        }
        return rebuttals.get(proposal.personality, "My analysis stands on its merits.")
    
    def ensemble_decision(self) -> Dict[str, Any]:
        """Feature 10: Multi-model ensemble with variance analysis"""
        if not self.proposals:
            return {"error": "No proposals for ensemble"}
        
        impacts = [p.estimated_impact for p in self.proposals]
        confidences = [p.confidence for p in self.proposals]
        
        mean_impact = sum(impacts) / len(impacts)
        mean_confidence = sum(confidences) / len(confidences)
        
        # Variance
        impact_var = sum((x - mean_impact) ** 2 for x in impacts) / len(impacts)
        conf_var = sum((x - mean_confidence) ** 2 for x in confidences) / len(confidences)
        
        # Agreement score (inverse of variance)
        agreement = 1.0 / (1.0 + impact_var / 100 + conf_var)
        
        return {
            "mean_impact": round(mean_impact, 2),
            "mean_confidence": round(mean_confidence, 3),
            "impact_variance": round(impact_var, 2),
            "confidence_variance": round(conf_var, 4),
            "agreement_score": round(agreement, 3),
            "recommendation": "High confidence" if agreement > 0.7 else "Models disagree - review needed",
            "model_count": len(self.proposals)
        }
    
    def update_metrics_after_mission(self, agent_id: str, success: bool,
                                     response_time_ms: float, mission_type: str,
                                     confidence_given: float, tokens_used: int = 0,
                                     collaborators: List[str] = None):
        """Update agent metrics after mission completion"""
        if agent_id not in self.agent_metrics:
            return
        
        metrics = self.agent_metrics[agent_id]
        metrics.total_missions += 1
        
        # Update success rate
        old_total = (metrics.total_missions - 1) * metrics.success_rate
        metrics.success_rate = (old_total + (1.0 if success else 0.0)) / metrics.total_missions
        
        # Update response time
        old_time = (metrics.total_missions - 1) * metrics.avg_response_time_ms
        metrics.avg_response_time_ms = (old_time + response_time_ms) / metrics.total_missions
        
        # Update specialization
        metrics.update_specialization(mission_type, success)
        
        # Update calibration
        metrics.update_calibration(confidence_given, success)
        
        # Update collaboration scores
        if collaborators:
            for other_id in collaborators:
                metrics.update_collaboration(other_id, success)
        
        # Update cost tracking
        metrics.total_tokens_used += tokens_used
        # Assuming ~$0.001 per 1K tokens for free models
        metrics.total_cost_usd += (tokens_used / 1000) * 0.001
    
    def get_collaboration_graph(self) -> Dict[str, Any]:
        """Feature 7: Get collaboration network for visualization"""
        nodes = []
        edges = []
        
        for agent_id, metrics in self.agent_metrics.items():
            nodes.append({
                "id": agent_id,
                "name": metrics.agent_name,
                "team": metrics.team,
                "success_rate": round(metrics.success_rate, 3),
                "personality": metrics.personality.value,
                "color": PERSONALITY_MODIFIERS[metrics.personality]["color"]
            })
            
            for other_id, score in metrics.collaboration_scores.items():
                if score > 0.3:  # Only meaningful collaborations
                    edges.append({
                        "source": agent_id,
                        "target": other_id,
                        "weight": round(score, 3)
                    })
        
        return {"nodes": nodes, "edges": edges}
    
    def clear_proposals(self):
        """Reset proposals for next round"""
        self.proposals = []
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent_count": len(self.agent_metrics),
            "agents": {k: v.to_dict() for k, v in self.agent_metrics.items()},
            "memory": self.memory.to_dict(),
            "voting_history_count": len(self.voting_history),
            "debate_history_count": len(self.debate_history)
        }


# ============================================
# FEATURE 8: HIERARCHICAL COORDINATION
# ============================================
class ChiefStrategist:
    """Hierarchical commander coordinating sub-agents"""
    
    def __init__(self, team: str, orchestrator: VotingOrchestrator):
        self.team = team
        self.orchestrator = orchestrator
        self.sub_agents: List[str] = []
        self.coordination_history: List[Dict[str, Any]] = []
    
    def register_sub_agent(self, agent_id: str):
        """Register a sub-agent under this commander"""
        if agent_id not in self.sub_agents:
            self.sub_agents.append(agent_id)
    
    def coordinate(self, sub_agent_results: Dict[str, str], mission_type: str) -> Dict[str, Any]:
        """Synthesize inputs from all sub-agents"""
        insights = []
        
        for agent_id, result in sub_agent_results.items():
            quality = self._assess_quality(result)
            insights.append({
                "agent_id": agent_id,
                "summary": result[:150] + "..." if len(result) > 150 else result,
                "quality_score": quality,
                "key_findings": self._extract_findings(result)
            })
        
        # Get historical context
        context = self.orchestrator.memory.get_relevant_context(mission_type)
        
        avg_quality = sum(i["quality_score"] for i in insights) / len(insights) if insights else 0
        
        coordination = {
            "team": self.team,
            "sub_agents_count": len(insights),
            "insights": insights,
            "average_quality": round(avg_quality, 3),
            "historical_context": context,
            "recommendation": self._generate_recommendation(insights),
            "confidence": min(0.95, avg_quality + 0.1),
            "timestamp": datetime.now().isoformat()
        }
        
        self.coordination_history.append(coordination)
        return coordination
    
    def _assess_quality(self, result: str) -> float:
        """Assess quality of sub-agent input"""
        score = 0.5
        
        if 50 < len(result) < 500:
            score += 0.15
        
        technical_terms = ["CVE", "vulnerability", "exploit", "firewall", 
                         "injection", "overflow", "bypass", "authentication"]
        score += min(0.2, sum(1 for t in technical_terms if t.lower() in result.lower()) * 0.05)
        
        return min(1.0, score)
    
    def _extract_findings(self, result: str) -> List[str]:
        """Extract key findings from result"""
        findings = []
        indicators = ["CVE-", "SQL injection", "buffer overflow", "XSS", 
                     "RCE", "authentication bypass", "privilege escalation"]
        for ind in indicators:
            if ind.lower() in result.lower():
                findings.append(ind)
        return findings[:5]
    
    def _generate_recommendation(self, insights: List[Dict]) -> str:
        """Generate strategic recommendation"""
        high_quality = [i for i in insights if i["quality_score"] > 0.7]
        
        if len(high_quality) >= 3:
            return "Strong intelligence from multiple sources. Recommend coordinated multi-vector approach."
        elif len(high_quality) >= 2:
            return "Good coverage. Proceed with primary attack, secondary on standby."
        else:
            return "Limited intelligence. Recommend additional reconnaissance."
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "team": self.team,
            "sub_agents": self.sub_agents,
            "coordination_count": len(self.coordination_history),
            "recent_coordination": self.coordination_history[-1] if self.coordination_history else None
        }


# ============================================
# FEATURE 11: SELF-REFLECTION
# ============================================
class AgentReflection:
    """Self-reflection and improvement system"""
    
    def __init__(self):
        self.reflection_history: List[Dict[str, Any]] = []
    
    def reflect(self, agent_id: str, output: str, context: str) -> Dict[str, Any]:
        """Agent reviews its own output"""
        quality = self._assess_quality(output)
        improvements = []
        
        if len(output) < 50:
            improvements.append({
                "type": "brevity",
                "issue": "Output too brief",
                "suggestion": "Add specific technical details"
            })
        
        if len(output) > 500:
            improvements.append({
                "type": "verbosity",
                "issue": "Output too verbose",
                "suggestion": "Condense to key insights"
            })
        
        technical_count = sum(1 for t in ["CVE", "port", "vulnerability", "exploit"]
                             if t.lower() in output.lower())
        if technical_count < 2:
            improvements.append({
                "type": "specificity",
                "issue": "Lacks technical detail",
                "suggestion": "Include CVEs, ports, or specific vulnerabilities"
            })
        
        self_critique = (
            "Analysis insufficient - needs more detail." if quality < 0.5 else
            "Analysis adequate but could improve." if quality < 0.75 else
            "Analysis thorough and actionable."
        )
        
        reflection = {
            "agent_id": agent_id,
            "quality_score": round(quality, 3),
            "improvements": improvements,
            "self_critique": self_critique,
            "confidence_adjustment": -0.1 * len(improvements),
            "timestamp": datetime.now().isoformat()
        }
        
        self.reflection_history.append(reflection)
        return reflection
    
    def _assess_quality(self, output: str) -> float:
        """Assess output quality"""
        score = 0.5
        
        if 100 <= len(output) <= 400:
            score += 0.2
        
        technical = ["vulnerability", "exploit", "CVE", "firewall", "injection"]
        score += min(0.2, sum(1 for t in technical if t.lower() in output.lower()) * 0.05)
        
        actions = ["recommend", "deploy", "execute", "implement"]
        score += min(0.1, sum(1 for a in actions if a.lower() in output.lower()) * 0.03)
        
        return min(1.0, max(0.1, score))


# ============================================
# FEATURE 12: ASYNC EXECUTION TRACKING
# ============================================
class AsyncExecutionTracker:
    """Track parallel agent execution with progress"""
    
    def __init__(self):
        self.active_tasks: Dict[str, Dict[str, Any]] = {}
        self.completed_tasks: List[Dict[str, Any]] = []
    
    def start_task(self, agent_id: str, task_type: str) -> str:
        """Start tracking an agent task"""
        task_id = f"{agent_id}_{int(time.time() * 1000)}"
        self.active_tasks[task_id] = {
            "agent_id": agent_id,
            "task_type": task_type,
            "status": "running",
            "progress": 0,
            "start_time": time.time()
        }
        return task_id
    
    def update_progress(self, task_id: str, progress: int):
        """Update task progress (0-100)"""
        if task_id in self.active_tasks:
            self.active_tasks[task_id]["progress"] = min(100, max(0, progress))
    
    def complete_task(self, task_id: str, result: Any = None):
        """Mark task as complete"""
        if task_id in self.active_tasks:
            task = self.active_tasks.pop(task_id)
            task["status"] = "completed"
            task["progress"] = 100
            task["end_time"] = time.time()
            task["duration_ms"] = int((task["end_time"] - task["start_time"]) * 1000)
            task["result"] = result
            self.completed_tasks.append(task)
    
    def get_status(self) -> Dict[str, Any]:
        """Get current execution status"""
        return {
            "active_count": len(self.active_tasks),
            "active_tasks": [
                {
                    "task_id": tid,
                    "agent_id": t["agent_id"],
                    "progress": t["progress"],
                    "elapsed_ms": int((time.time() - t["start_time"]) * 1000)
                }
                for tid, t in self.active_tasks.items()
            ],
            "completed_count": len(self.completed_tasks)
        }


# ============================================
# FEATURE 13: COMMUNICATION PROTOCOL
# ============================================
@dataclass
class AgentMessage:
    """Structured message for inter-agent communication"""
    sender_id: str
    receiver_id: str
    message_type: str  # request, response, broadcast, alert
    payload: Dict[str, Any]
    priority: int = 1  # 1-5
    correlation_id: str = ""
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class AgentMessageBus:
    """Message bus for inter-agent communication"""
    
    def __init__(self):
        self.message_log: List[AgentMessage] = []
    
    def send(self, message: AgentMessage) -> str:
        """Send a message"""
        if not message.correlation_id:
            message.correlation_id = hashlib.md5(
                f"{message.sender_id}{message.receiver_id}{time.time()}".encode()
            ).hexdigest()[:12]
        self.message_log.append(message)
        return message.correlation_id
    
    def get_messages(self, agent_id: str = None, limit: int = 20) -> List[Dict]:
        """Get messages, optionally filtered by agent"""
        messages = self.message_log
        if agent_id:
            messages = [m for m in messages if m.receiver_id == agent_id or m.sender_id == agent_id]
        return [m.to_dict() for m in messages[-limit:]]
    
    def get_stats(self) -> Dict[str, Any]:
        """Get communication statistics"""
        if not self.message_log:
            return {"total": 0}
        
        by_type = {}
        for m in self.message_log:
            by_type[m.message_type] = by_type.get(m.message_type, 0) + 1
        
        return {
            "total": len(self.message_log),
            "by_type": by_type
        }


# ============================================
# FEATURE 14: DYNAMIC AGENT POOL
# ============================================
class AgentPool:
    """Dynamic agent pool management"""
    
    def __init__(self, max_agents: int = 20):
        self.agents: Dict[str, Dict[str, Any]] = {}
        self.max_agents = max_agents
        self.spawn_history: List[Dict[str, Any]] = []
    
    def spawn(self, agent_type: str, team: str, personality: str = "analytical") -> Optional[str]:
        """Spawn a new agent"""
        if len(self.agents) >= self.max_agents:
            return None
        
        agent_id = f"{team}_{agent_type}_{int(time.time() * 1000)}"
        self.agents[agent_id] = {
            "id": agent_id,
            "type": agent_type,
            "team": team,
            "personality": personality,
            "status": "active",
            "spawned_at": datetime.now().isoformat()
        }
        
        self.spawn_history.append({"action": "spawn", "agent_id": agent_id, "timestamp": datetime.now().isoformat()})
        return agent_id
    
    def despawn(self, agent_id: str) -> bool:
        """Remove an agent"""
        if agent_id in self.agents:
            del self.agents[agent_id]
            self.spawn_history.append({"action": "despawn", "agent_id": agent_id, "timestamp": datetime.now().isoformat()})
            return True
        return False
    
    def get_status(self) -> Dict[str, Any]:
        """Get pool status"""
        by_team = {"RED": 0, "BLUE": 0}
        for a in self.agents.values():
            by_team[a["team"]] = by_team.get(a["team"], 0) + 1
        
        return {
            "total": len(self.agents),
            "max": self.max_agents,
            "by_team": by_team,
            "agents": list(self.agents.values())
        }


# ============================================
# FEATURE 15: COST TRACKER
# ============================================
class CostTracker:
    """Track LLM costs and efficiency"""
    
    MODEL_COSTS = {
        "meta-llama/llama-3.2-3b-instruct:free": 0.0,
        "qwen/qwen-2.5-7b-instruct:free": 0.0,
        "mistralai/mistral-7b-instruct:free": 0.0,
        "google/gemma-2-9b-it:free": 0.0,
        "microsoft/phi-3-mini-128k-instruct:free": 0.0,
    }
    
    def __init__(self):
        self.usage_log: List[Dict[str, Any]] = []
        self.total_tokens = 0
        self.total_cost = 0.0
    
    def log_usage(self, agent_id: str, model: str, input_tokens: int,
                 output_tokens: int, response_time_ms: int) -> Dict[str, Any]:
        """Log token usage"""
        total = input_tokens + output_tokens
        cost = (total / 1000) * self.MODEL_COSTS.get(model, 0.001)
        
        entry = {
            "agent_id": agent_id,
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": total,
            "cost_usd": cost,
            "response_time_ms": response_time_ms,
            "tokens_per_second": (output_tokens / response_time_ms * 1000) if response_time_ms > 0 else 0,
            "timestamp": datetime.now().isoformat()
        }
        
        self.usage_log.append(entry)
        self.total_tokens += total
        self.total_cost += cost
        
        return entry
    
    def get_summary(self) -> Dict[str, Any]:
        """Get cost summary"""
        if not self.usage_log:
            return {"total_tokens": 0, "total_cost_usd": 0}
        
        by_agent = {}
        by_model = {}
        
        for e in self.usage_log:
            aid = e["agent_id"]
            if aid not in by_agent:
                by_agent[aid] = {"tokens": 0, "cost": 0, "calls": 0}
            by_agent[aid]["tokens"] += e["total_tokens"]
            by_agent[aid]["cost"] += e["cost_usd"]
            by_agent[aid]["calls"] += 1
            
            model = e["model"]
            if model not in by_model:
                by_model[model] = {"tokens": 0, "cost": 0, "calls": 0}
            by_model[model]["tokens"] += e["total_tokens"]
            by_model[model]["cost"] += e["cost_usd"]
            by_model[model]["calls"] += 1
        
        return {
            "total_tokens": self.total_tokens,
            "total_cost_usd": round(self.total_cost, 4),
            "total_calls": len(self.usage_log),
            "by_agent": by_agent,
            "by_model": by_model
        }


# ============================================
# SINGLETON INSTANCES
# ============================================
orchestrator = VotingOrchestrator()
red_strategist = ChiefStrategist("RED", orchestrator)
blue_strategist = ChiefStrategist("BLUE", orchestrator)
reflection_engine = AgentReflection()
async_tracker = AsyncExecutionTracker()
message_bus = AgentMessageBus()
agent_pool = AgentPool()
cost_tracker = CostTracker()

# Register default agents with personalities
DEFAULT_AGENTS = [
    ("RED_SCANNER", "Scanner", "RED", AgentPersonality.ANALYTICAL),
    ("RED_WEAPONIZER", "Weaponizer", "RED", AgentPersonality.AGGRESSIVE),
    ("RED_COMMANDER", "Commander", "RED", AgentPersonality.STRATEGIC),
    ("RED_INF", "Infrastructure", "RED", AgentPersonality.INNOVATIVE),
    ("RED_DATA", "Data Analyst", "RED", AgentPersonality.ANALYTICAL),
    ("BLUE_SCANNER", "Scanner", "BLUE", AgentPersonality.CAUTIOUS),
    ("BLUE_ANALYST", "Analyst", "BLUE", AgentPersonality.ANALYTICAL),
    ("BLUE_COMMANDER", "Commander", "BLUE", AgentPersonality.STRATEGIC),
    ("BLUE_RESPONDER", "Responder", "BLUE", AgentPersonality.AGGRESSIVE),
    ("BLUE_ARCHITECT", "Architect", "BLUE", AgentPersonality.INNOVATIVE),
]

for agent_id, name, team, personality in DEFAULT_AGENTS:
    orchestrator.register_agent(agent_id, name, team, personality)
    if team == "RED":
        red_strategist.register_sub_agent(agent_id)
    else:
        blue_strategist.register_sub_agent(agent_id)

print("✅ Enhanced Agent Orchestration System Initialized!")
print(f"   • {len(DEFAULT_AGENTS)} agents registered with personalities")
print(f"   • Voting orchestrator ready")
print(f"   • Memory system (RAG-ready) active")
print(f"   • Cost tracking enabled")
