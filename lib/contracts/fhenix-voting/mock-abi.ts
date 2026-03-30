export const encryptedVotingMockAbi = [
  {
    type: "function",
    name: "submitProduct",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [{ name: "productId", type: "uint256" }],
  },
  {
    type: "function",
    name: "setVoteState",
    stateMutability: "nonpayable",
    inputs: [
      { name: "productId", type: "uint256" },
      { name: "voted", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "productCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "hasVotedForProduct",
    stateMutability: "view",
    inputs: [
      { name: "productId", type: "uint256" },
      { name: "voter", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "getProductSummary",
    stateMutability: "view",
    inputs: [{ name: "productId", type: "uint256" }],
    outputs: [
      { name: "exists", type: "bool" },
      { name: "productOwner", type: "address" },
    ],
  },
  {
    type: "function",
    name: "getPublicVoteCount",
    stateMutability: "view",
    inputs: [{ name: "productId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "ProductSubmitted",
    anonymous: false,
    inputs: [
      { indexed: true, name: "productId", type: "uint256" },
      { indexed: true, name: "productOwner", type: "address" },
    ],
  },
  {
    type: "event",
    name: "ProductVoteUpdated",
    anonymous: false,
    inputs: [
      { indexed: true, name: "productId", type: "uint256" },
      { indexed: true, name: "voter", type: "address" },
      { indexed: false, name: "hasVoted", type: "bool" },
    ],
  },
] as const;
