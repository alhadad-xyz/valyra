export const MARKETPLACE_ABI = [
    {
        "type": "function",
        "name": "stakeToSell",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "sellerStakes",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "seller",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "stakeAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "stakedAt",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "isActive",
                "type": "bool",
                "internalType": "bool"
            },
            {
                "name": "slashCount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "MINIMUM_SELLER_STAKE",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "idrxToken",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract IERC20"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "isGenesisSeller",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "createListing",
        "inputs": [
            {
                "name": "title",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "ipfsMetadata",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "askingPrice",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "level",
                "type": "uint8",
                "internalType": "enum Marketplace.VerificationLevel"
            },
            {
                "name": "ipAssignmentHash",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "sellerSignature",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "buildId",
                "type": "string",
                "internalType": "string"
            }
        ],
        "outputs": [
            {
                "name": "listingId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "ListingCreated",
        "inputs": [
            {
                "name": "listingId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "seller",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "askingPrice",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    }
] as const;
