import json
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from langgraph.graph import StateGraph, END

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class GrammarCorrection(BaseModel):
    original: str
    corrected: str
    error_type: str
    explanation: str

class AgentTurnOutput(BaseModel):
    response: str
    grammar_suggestions: List[GrammarCorrection] = []
    guardrail_triggered: bool = False

# LangGraph session state definition
class AgentState(BaseModel):
    topic: str = "daily-life"
    user_id: str = ""
    recent_turns: List[Dict[str, str]] = []
    current_transcript: str = ""
    output: Optional[AgentTurnOutput] = None

class BaseAgentService(ABC):
    @abstractmethod
    async def process_turn(
        self,
        user_id: str,
        topic: str,
        transcript: str,
        history: List[Dict[str, str]]
    ) -> AgentTurnOutput:
        pass

class MockBedrockAgentService(BaseAgentService):
    def __init__(
        self,
        response_text: str = "That sounds wonderful! Can you tell me more about it?",
        suggestions: Optional[List[Dict[str, Any]]] = None,
        guardrail_triggered: bool = False
    ):
        self.response_text = response_text
        self.suggestions = [GrammarCorrection(**s) for s in (suggestions or [])]
        self.guardrail_triggered = guardrail_triggered

    async def process_turn(
        self,
        user_id: str,
        topic: str,
        transcript: str,
        history: List[Dict[str, str]]
    ) -> AgentTurnOutput:
        if self.guardrail_triggered:
            return AgentTurnOutput(
                response="Let's keep our conversation focused on our practice topic. What would you like to talk about?",
                grammar_suggestions=[],
                guardrail_triggered=True
            )
        return AgentTurnOutput(
            response=self.response_text,
            grammar_suggestions=self.suggestions,
            guardrail_triggered=False
        )

class AmazonBedrockNovaAgentService(BaseAgentService):
    """
    Amazon Bedrock service using Amazon Nova Pro.
    Executes a single invocation with structured output containing:
    1. Conversational agent dialogue response
    2. Real-time grammar corrections list
    Protected by Amazon Bedrock Guardrails.
    """
    def __init__(self):
        self.model_id = settings.bedrock_model_id
        self.region = settings.aws_region
        self.guardrail_id = settings.bedrock_guardrail_id
        self.guardrail_version = settings.bedrock_guardrail_version

    async def process_turn(
        self,
        user_id: str,
        topic: str,
        transcript: str,
        history: List[Dict[str, str]]
    ) -> AgentTurnOutput:
        # Build prompt
        system_instruction = (
            "You are Kastu, a warm and encouraging spoken English practice partner.\n"
            f"Current conversation topic: {topic}.\n"
            "Rules:\n"
            "1. Speak naturally and keep responses concise (1 to 3 sentences maximum).\n"
            "2. Never verbally mention or interrupt with grammar mistakes in your conversational response.\n"
            "3. Analyze the user's latest utterance for grammar or vocabulary issues and output them strictly in the grammar_suggestions field.\n"
            "4. If there are no mistakes, grammar_suggestions must be an empty list.\n"
        )

        try:
            # LangChain AWS Bedrock client
            from langchain_aws import ChatBedrockConverse
            import boto3

            kwargs: Dict[str, Any] = {
                "model": self.model_id,
                "region_name": self.region,
                "temperature": 0.7
            }
            if self.guardrail_id:
                kwargs["guardrails"] = {
                    "guardrailIdentifier": self.guardrail_id,
                    "guardrailVersion": self.guardrail_version or "DRAFT"
                }
            if settings.aws_access_key_id and settings.aws_secret_access_key:
                client = boto3.client(
                    "bedrock-runtime",
                    region_name=self.region,
                    aws_access_key_id=settings.aws_access_key_id,
                    aws_secret_access_key=settings.aws_secret_access_key
                )
                kwargs["client"] = client

            llm = ChatBedrockConverse(**kwargs)
            structured_llm = llm.with_structured_output(AgentTurnOutput)

            messages = [{"role": "system", "content": system_instruction}]
            for turn in history[-6:]:
                messages.append({"role": turn["role"], "content": turn["content"]})
            messages.append({"role": "user", "content": transcript})

            res = await structured_llm.ainvoke(messages)
            if isinstance(res, AgentTurnOutput):
                return res
            return AgentTurnOutput(response=str(res), grammar_suggestions=[])

        except Exception as e:
            err_str = str(e).lower()
            if "guardrail" in err_str or "intervened" in err_str:
                return AgentTurnOutput(
                    response="Let's keep our conversation focused on our practice topic. What would you like to talk about?",
                    grammar_suggestions=[],
                    guardrail_triggered=True
                )
            logger.error(f"Bedrock invocation failed: {e}")
            # Graceful fallback
            return AgentTurnOutput(
                response="I heard you! That's very interesting, could you share a bit more?",
                grammar_suggestions=[]
            )

def build_agent_graph():
    """Lightweight LangGraph state graph for turn tracking"""
    graph = StateGraph(AgentState)

    async def invoke_agent_node(state: AgentState):
        service = get_agent_service()
        output = await service.process_turn(
            user_id=state.user_id,
            topic=state.topic,
            transcript=state.current_transcript,
            history=state.recent_turns
        )
        new_turns = list(state.recent_turns)
        new_turns.append({"role": "user", "content": state.current_transcript})
        new_turns.append({"role": "assistant", "content": output.response})
        return {
            "output": output,
            "recent_turns": new_turns[-6:]
        }

    graph.add_node("agent_node", invoke_agent_node)
    graph.set_entry_point("agent_node")
    graph.add_edge("agent_node", END)
    return graph.compile()

def get_agent_service() -> BaseAgentService:
    if settings.environment == "test" or not settings.aws_access_key_id:
        return MockBedrockAgentService()
    return AmazonBedrockNovaAgentService()
