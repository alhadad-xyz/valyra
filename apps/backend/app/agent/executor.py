from app.agent.config import initialize_agent
import logging

logger = logging.getLogger(__name__)

# Global instance
_agent_executor = None

def get_agent_executor():
    global _agent_executor
    if not _agent_executor:
        try:
            logger.info("Initializing AgentKit...")
            _agent_executor = initialize_agent()
            logger.info("AgentKit initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize AgentKit: {e}")
            raise e
    return _agent_executor

async def execute_agent_action(prompt: str) -> str:
    """Execute a natural language command using the agent."""
    agent = get_agent_executor()
    
    # Run the agent
    # LangChain ainvoke returns a dict, 'output' key has the response
    try:
        result = await agent.ainvoke({"input": prompt})
        return result["output"]
    except Exception as e:
        logger.error(f"Agent execution failed: {e}")
        return f"Error executing command: {str(e)}"
