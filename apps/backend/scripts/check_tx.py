"""Check transaction receipt for events."""
from web3 import Web3
import json

# Connect to Base Sepolia
w3 = Web3(Web3.HTTPProvider("https://sepolia.base.org"))

tx_hash = "0xa965c48ec838de226ab98ac36f56733b7e02a168aae2c9da5eab520fca81ebb4"

print(f"Checking transaction: {tx_hash}")
print("=" * 80)

try:
    receipt = w3.eth.get_transaction_receipt(tx_hash)
    
    print(f"Status: {'Success' if receipt['status'] == 1 else 'Failed'}")
    print(f"Block Number: {receipt['blockNumber']}")
    print(f"Contract Address: {receipt['to']}")
    print(f"Gas Used: {receipt['gasUsed']}")
    print(f"\nNumber of Logs/Events: {len(receipt['logs'])}")
    print("=" * 80)
    
    for i, log in enumerate(receipt['logs']):
        print(f"\nEvent #{i + 1}:")
        print(f"  Address: {log['address']}")
        print(f"  Topics: {[t.hex() for t in log['topics']]}")
        print(f"  Data: {log['data'].hex()}")
        
except Exception as e:
    print(f"Error: {e}")
