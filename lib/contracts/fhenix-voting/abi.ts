export const encryptedVotingAbi = [
  {
    type: "function",
    name: "createProposal",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "optionsCount", type: "uint8" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "proposalId", type: "uint256" }],
  },
  {
    type: "function",
    name: "vote",
    stateMutability: "nonpayable",
    inputs: [
      { name: "proposalId", type: "uint256" },
      {
        name: "encryptedOption",
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
    name: "finalizeProposal",
    stateMutability: "nonpayable",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "proposalCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "hasVoted",
    stateMutability: "view",
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "voter", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "getProposalSummary",
    stateMutability: "view",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [
      { name: "title", type: "string" },
      { name: "deadline", type: "uint256" },
      { name: "exists", type: "bool" },
      { name: "finalized", type: "bool" },
      { name: "optionsCount", type: "uint8" },
    ],
  },
  {
    type: "function",
    name: "decryptResultForOption",
    stateMutability: "view",
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "optionIndex", type: "uint8" },
    ],
    outputs: [
      { name: "value", type: "uint256" },
      { name: "ready", type: "bool" },
    ],
  },
  {
    type: "event",
    name: "ProposalCreated",
    anonymous: false,
    inputs: [
      { indexed: true, name: "proposalId", type: "uint256" },
      { indexed: false, name: "title", type: "string" },
      { indexed: false, name: "optionsCount", type: "uint8" },
      { indexed: false, name: "deadline", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "VoteCast",
    anonymous: false,
    inputs: [
      { indexed: true, name: "proposalId", type: "uint256" },
      { indexed: true, name: "voter", type: "address" },
    ],
  },
  {
    type: "event",
    name: "VoteFinalizationRequested",
    anonymous: false,
    inputs: [{ indexed: true, name: "proposalId", type: "uint256" }],
  },
] as const;
