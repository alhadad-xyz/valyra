import os
import json
from typing import Optional
from app.core.config import settings

# Placeholder imports - these would need to match the actual installed library version
# Assuming standard AgentKit structure
from coinbase_agentkit import AgentKit, AgentKitConfig, CdpWalletProvider, CdpWalletProviderConfig
from coinbase_agentkit_langchain import get_langchain_tools
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain import hub

WALLET_DATA_FILE = "wallet_data.txt"

def initialize_agent():
    """Initialize the AgentKit agent."""
    
    # 1. Configure CDP Wallet Provider
    cdp_config = CdpWalletProviderConfig(
        api_key_name=settings.cdp_api_key_name,
        api_key_private_key=settings.cdp_api_key_private_key.replace("\\n", "\n") if settings.cdp_api_key_private_key else None
    )

    # 2. Load or Create Wallet
    wallet_data = None
    if os.path.exists(WALLET_DATA_FILE):
        with open(WALLET_DATA_FILE, "r") as f:
            wallet_data = f.read()
    
    wallet_provider = CdpWalletProvider(cdp_config, wallet_data)
    
    # 3. Save Wallet Data (if new)
    if not wallet_data:
        exported_data = wallet_provider.export_wallet()
        with open(WALLET_DATA_FILE, "w") as f:
            f.write(exported_data.to_json())

    # 4. Initialize AgentKit
    agent_kit = AgentKit(AgentKitConfig(wallet_provider=wallet_provider))

    # 5. Create Toolkit
    tools = get_langchain_tools(agent_kit)

    # 6. Initialize LLM (OpenAI is standard for AgentKit examples)
    # Using Google GenAI is possible but Tool calling needs to be supported.
    # We will use ChatOpenAI for now as per dependencies, but check config.
    llm = ChatOpenAI(
        model="gpt-4-turbo-preview", 
        api_key=settings.openai_api_key
    )

    # 7. Create Agent
    prompt = hub.pull("hwchase17/openai-functions-agent")
    agent = create_openai_tools_agent(llm, tools, prompt)
    
    agent_executor = AgentExecutor(
        agent=agent, 
        tools=tools, 
        verbose=True,
        max_iterations=10
    )
    
    return agent_executor
