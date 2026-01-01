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

# Global instances
_agent_config = None

class AgentConfiguration:
    def __init__(self):
        self.wallet_provider = None
        self.agent_kit = None
        self.agent_executor = None

    def initialize_wallet(self):
        """Initialize the CDP Wallet Provider independently."""
        if self.wallet_provider:
            return

        # 1. Load or Create Wallet Data
        wallet_data = None
        if os.path.exists(WALLET_DATA_FILE):
            with open(WALLET_DATA_FILE, "r") as f:
                wallet_data = f.read()

        # 2. Configure CDP Wallet Provider
        cdp_config = CdpWalletProviderConfig(
            api_key_name=settings.cdp_api_key_name,
            api_key_private_key=settings.cdp_api_key_private_key.replace("\\n", "\n") if settings.cdp_api_key_private_key else None,
            wallet_data=wallet_data
        )
        
        self.wallet_provider = CdpWalletProvider(cdp_config)
        
        # 3. Save Wallet Data (if new)
        if not wallet_data:
            exported_data = self.wallet_provider.export_wallet()
            with open(WALLET_DATA_FILE, "w") as f:
                f.write(json.dumps(exported_data.to_dict()))

    def initialize(self):
        """Initialize the full AgentKit agent and its dependencies."""
        if self.agent_executor:
            return
            
        self.initialize_wallet()

        # 4. Initialize AgentKit
        self.agent_kit = AgentKit(AgentKitConfig(wallet_provider=self.wallet_provider))

        # 5. Create Toolkit
        tools = get_langchain_tools(self.agent_kit)

        # 6. Initialize LLM (OpenAI is standard for AgentKit examples)
        try:
            llm = ChatOpenAI(
                model="gpt-4-turbo-preview", 
                api_key=settings.openai_api_key
            )
            
            # 7. Create Agent
            prompt = hub.pull("hwchase17/openai-functions-agent")
            agent = create_openai_tools_agent(llm, tools, prompt)
            
            self.agent_executor = AgentExecutor(
                agent=agent, 
                tools=tools, 
                verbose=True,
                max_iterations=10
            )
        except Exception as e:
            print(f"Warning: Failed to initialize LLM/Agent: {e}")
            # We don't raise here to allow wallet-only usage

def get_agent_config() -> AgentConfiguration:
    global _agent_config
    if not _agent_config:
        _agent_config = AgentConfiguration()
        # We don't verify full init here, let individual getters decide
    return _agent_config

def initialize_agent():
    """Legacy wrapper for compatibility or direct executor init"""
    config = get_agent_config()
    config.initialize()
    if not config.agent_executor:
         raise ValueError("Agent executor not initialized (check OpenAI API Key)")
    return config.agent_executor

def get_wallet_provider():
    config = get_agent_config()
    config.initialize_wallet()
    return config.wallet_provider
