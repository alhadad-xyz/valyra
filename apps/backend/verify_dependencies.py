try:
    import coinbase_agentkit
    import coinbase_agentkit_langchain
    import langchain
    import langchain_openai
    print("Dependencies found.")
except ImportError as e:
    print(f"Missing dependency: {e}")
