export const encryptedVotingAbi = [
  {
    type: "function",
    name: "submitProduct",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "url", type: "string" },
      { name: "tagline", type: "string" },
    ],
    outputs: [{ name: "productId", type: "uint256" }],
  },
  {
    type: "function",
    name: "setEncryptedVoteState",
    stateMutability: "nonpayable",
    inputs: [
      { name: "productId", type: "uint256" },
      {
        name: "encryptedVoteState",
        type: "tuple",
        components: [
          { name: "ctHash", type: "uint256" },
          { name: "securityZone", type: "uint8" },
          { name: "utype", type: "uint8" },
          { name: "signature", type: "bytes" },
        ],
      },
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
      { name: "name", type: "string" },
      { name: "url", type: "string" },
      { name: "tagline", type: "string" },
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
      { indexed: false, name: "name", type: "string" },
      { indexed: false, name: "url", type: "string" },
      { indexed: false, name: "tagline", type: "string" },
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
